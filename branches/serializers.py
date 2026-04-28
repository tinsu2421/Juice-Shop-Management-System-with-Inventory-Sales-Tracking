from rest_framework import serializers
from .models import Branch, CashierProfile


class BranchSerializer(serializers.ModelSerializer):
    cashier_count = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = '__all__'

    def get_cashier_count(self, obj):
        return obj.cashiers.count()


class CashierProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)

    class Meta:
        model = CashierProfile
        fields = '__all__'
