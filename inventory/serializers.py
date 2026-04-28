from rest_framework import serializers
from .models import StockAdjustment


class StockAdjustmentSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    adjusted_by_name = serializers.CharField(source='adjusted_by.username', read_only=True)

    class Meta:
        model = StockAdjustment
        fields = '__all__'
        read_only_fields = ['adjusted_by']
