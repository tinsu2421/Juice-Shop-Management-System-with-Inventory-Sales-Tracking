from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import transaction
from decimal import Decimal
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer
from products.models import Product


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.prefetch_related('items__product').order_by('-created_at')
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.action in ['place_order', 'list_public']:
            return [AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['post'], url_path='place', permission_classes=[AllowAny])
    def place_order(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            order = Order.objects.create(
                customer_name=data['customer_name'],
                customer_phone=data['customer_phone'],
                customer_email=data.get('customer_email', ''),
                fulfillment_type=data['fulfillment_type'],
                delivery_address=data.get('delivery_address', ''),
                notes=data.get('notes', ''),
            )

            total = Decimal('0')
            for item_data in data['items']:
                product = Product.objects.get(id=item_data['product_id'])
                qty = item_data['quantity']
                item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    quantity=qty,
                    unit_price=product.price,
                )
                total += item.subtotal

            order.total_amount = total
            order.save()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=400)
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)
