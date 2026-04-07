from rest_framework.routers import DefaultRouter
from .views import LogEventViewSet, ErrorCountViewSet

router = DefaultRouter()
router.register(r"logs", LogEventViewSet, basename="logs")
router.register(r"error-counts", ErrorCountViewSet, basename="error-counts")

urlpatterns = router.urls