from typing import Any
from django.contrib import admin
from django.conf import settings
from django.db.models.query import QuerySet
from django.http import HttpRequest
from albums.models import Section, Album


class StaffSite(admin.AdminSite):
    site_header = f"{settings.SITE_TITLE} administration"
    index_title = f"{settings.SITE_TITLE} administration"

admin_staff_site = StaffSite(name='stafadmin')


@admin.register(Section, site=admin_staff_site)
class SectionAdmin(admin.ModelAdmin):
    model = Section


@admin.register(Album, site=admin_staff_site)
class AlbumAdmin(admin.ModelAdmin):
    model = Album

