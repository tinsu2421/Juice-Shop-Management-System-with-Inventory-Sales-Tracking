from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('category')
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'category__type']
    search_fields = ['name']
    ordering_fields = ['name', 'price', 'stock_quantity', 'created_at']

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        products = [p for p in self.get_queryset() if p.is_low_stock]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def fruits(self, request):
        qs = self.get_queryset().filter(category__type='fruit')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def juices(self, request):
        qs = self.get_queryset().filter(category__type='juice')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
