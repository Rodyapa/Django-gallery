from admin_site.admin import admin_staff_site
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

urlpatterns = [
    path('staff/', admin_staff_site.urls, name='staff'),
    path("", include("static_site.urls")),
    path("album/", include("albums.urls"))
] + static(
    settings.STATIC_URL,
    document_root=settings.STATIC_ROOT
)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
