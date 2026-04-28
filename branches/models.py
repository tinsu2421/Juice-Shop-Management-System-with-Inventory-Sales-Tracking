from django.db import models


class Branch(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=300, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'branches'


class CashierProfile(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='cashier_profile')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, related_name='cashiers')

    def __str__(self):
        return f"{self.user.username} @ {self.branch}"
