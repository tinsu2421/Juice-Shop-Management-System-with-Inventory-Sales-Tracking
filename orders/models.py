from django.db import models
from django.contrib.auth.models import User
from products.models import Product


class Order(models.Model):
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    READY = 'ready'
    DELIVERED = 'delivered'
    CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (PENDING, 'Pending'), (CONFIRMED, 'Confirmed'),
        (READY, 'Ready'), (DELIVERED, 'Delivered'), (CANCELLED, 'Cancelled'),
    ]

    PICKUP = 'pickup'
    DELIVERY = 'delivery'
    FULFILLMENT_CHOICES = [(PICKUP, 'Pickup'), (DELIVERY, 'Delivery')]

    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20)
    customer_email = models.EmailField(blank=True)
    fulfillment_type = models.CharField(max_length=10, choices=FULFILLMENT_CHOICES, default=PICKUP)
    delivery_address = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        self.subtotal = self.quantity * self.unit_price
        if not self.product_name and self.product:
            self.product_name = self.product.name
        super().save(*args, **kwargs)
