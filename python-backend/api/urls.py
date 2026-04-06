from rest_framework.routers import DefaultRouter
from .views import LogEventViewSet

router = DefaultRouter()
router.register(r"log-events", LogEventViewSet, basename="log-events")

urlpatterns = router.urls