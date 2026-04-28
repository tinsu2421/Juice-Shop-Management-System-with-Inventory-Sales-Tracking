from django.contrib import admin
from .models import Branch, CashierProfile

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'phone', 'is_active']

@admin.register(CashierProfile)
class CashierProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'branch']
