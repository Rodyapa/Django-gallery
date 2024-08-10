from django.urls import path, include, re_path
from albums import views

app_name = 'albums'

urlpatterns = [
    re_path(
        r"(?P<album_slug>[A-Za-z_1-9-]+)/?",
        views.AlbumView.as_view(), name="album"
        ),
        
]   
