from django.db import models
from django.contrib.auth.models import User
from products.models import Product


class StockAdjustment(models.Model):
    ADD = 'add'
    REMOVE = 'remove'
    TYPE_CHOICES = [(ADD, 'Add Stock'), (REMOVE, 'Remove Stock')]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='adjustments')
    adjustment_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=200, blank=True)
    adjusted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.adjustment_type} {self.quantity} {self.product.name}"
