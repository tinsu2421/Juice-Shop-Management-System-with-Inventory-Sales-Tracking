from rest_framework.routers import DefaultRouter
from .views import BranchViewSet, CashierProfileViewSet

router = DefaultRouter()
router.register('cashier-profiles', CashierProfileViewSet)
router.register('', BranchViewSet)

urlpatterns = router.urls
