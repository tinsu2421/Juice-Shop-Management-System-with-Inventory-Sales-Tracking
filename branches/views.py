from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Branch, CashierProfile
from .serializers import BranchSerializer, CashierProfileSerializer
from sales.models import Sale
from sales.serializers import SaleSerializer


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.filter(is_active=True)
    serializer_class = BranchSerializer

    @action(detail=True, methods=['get'])
    def sales(self, request, pk=None):
        branch = self.get_object()
        sales = Sale.objects.filter(branch=branch).prefetch_related('items').select_related('cashier').order_by('-created_at')
        return Response(SaleSerializer(sales, many=True).data)

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        from django.db.models import Sum, Count
        from django.utils import timezone
        branch = self.get_object()
        today = timezone.now().date()
        month_start = today.replace(day=1)
        sales = Sale.objects.filter(branch=branch)
        return Response({
            'branch': branch.name,
            'today_revenue': sales.filter(created_at__date=today).aggregate(t=Sum('total_amount'))['t'] or 0,
            'today_sales': sales.filter(created_at__date=today).count(),
            'month_revenue': sales.filter(created_at__date__gte=month_start).aggregate(t=Sum('total_amount'))['t'] or 0,
            'month_sales': sales.filter(created_at__date__gte=month_start).count(),
            'total_revenue': sales.aggregate(t=Sum('total_amount'))['t'] or 0,
            'total_sales': sales.count(),
        })


class CashierProfileViewSet(viewsets.ModelViewSet):
    queryset = CashierProfile.objects.select_related('user', 'branch')
    serializer_class = CashierProfileSerializer
    permission_classes = [IsAuthenticated]
