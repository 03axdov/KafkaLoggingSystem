from rest_framework.routers import DefaultRouter
from .views import ErrorLogEventViewSet

router = DefaultRouter()
router.register(r"error-logs", ErrorLogEventViewSet, basename="error-logs")

urlpatterns = router.urls