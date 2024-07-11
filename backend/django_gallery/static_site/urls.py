from django.urls import path, include
from . import views

app_name = 'static_site'

urlpatterns = [
    path("", views.IndexView, name="index"),
    path("contacts", views.ContactView, name="contacts")
]   
