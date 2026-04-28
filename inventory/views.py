from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from .models import StockAdjustment
from .serializers import StockAdjustmentSerializer
from products.models import Product


class StockAdjustmentViewSet(viewsets.ModelViewSet):
    queryset = StockAdjustment.objects.select_related('product', 'adjusted_by').order_by('-created_at')
    serializer_class = StockAdjustmentSerializer

    def perform_create(self, serializer):
        adj = serializer.save(
            adjusted_by=self.request.user if self.request.user.is_authenticated else None
        )
        with transaction.atomic():
            product = Product.objects.select_for_update().get(id=adj.product.id)
            if adj.adjustment_type == 'add':
                product.stock_quantity += adj.quantity
            else:
                product.stock_quantity = max(0, product.stock_quantity - adj.quantity)
            product.save()
