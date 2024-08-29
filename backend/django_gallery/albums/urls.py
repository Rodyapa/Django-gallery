from albums import views
from django.urls import re_path

app_name = 'albums'

urlpatterns = [
    re_path(
        r"(?P<album_slug>[A-Za-z_1-9-]+)/?",
        views.AlbumView.as_view(), name="album"
    ),
]
