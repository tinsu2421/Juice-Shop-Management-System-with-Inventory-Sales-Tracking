from django.db import models
from django.contrib.auth.models import User
from .models import Branch


class CashierProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cashier_profile')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, related_name='cashiers')

    def __str__(self):
        return f"{self.user.username} @ {self.branch}"
