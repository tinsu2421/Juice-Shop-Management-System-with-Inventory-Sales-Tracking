from rest_framework.routers import DefaultRouter
from .views import StockAdjustmentViewSet

router = DefaultRouter()
router.register('adjustments', StockAdjustmentViewSet)

urlpatterns = router.urls
