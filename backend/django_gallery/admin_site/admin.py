from typing import Any
from django.contrib import admin
from django.conf import settings
from django.db.models.query import QuerySet
from django.http import HttpRequest, HttpResponse
from django.urls.resolvers import URLPattern
from albums.models import Section, Album
from images.models import Photo
from django.utils.translation import gettext as _
from django.utils.html import format_html
from django.urls import reverse, path
from django.template.response import TemplateResponse
from .admin_forms import AlbumForm
from django.shortcuts import get_object_or_404, render

class StaffSite(admin.AdminSite):
    site_header = f"{settings.SITE_TITLE} administration"
    index_title = f"{settings.SITE_TITLE} administration"


admin_staff_site = StaffSite(name='staffadmin')


class AlbumInline(admin.StackedInline):
    model=Album
    extra = 0
    fields = ['title']
    show_change_link = True

@admin.register(Section, site=admin_staff_site)
class SectionAdmin(admin.ModelAdmin):
    model = Section
    list_display = ['title', 'view_parent_section']
    inlines = [AlbumInline, ]

    @admin.display(empty_value=_("ROOT SECTION"))
    def view_parent_section(self, obj):
        if obj.parent_section:
            url = reverse('admin:albums_section_change', args = [obj.parent_section.id])
            return format_html("<a href='{}'>{}</a>", url, obj.parent_section)
        else:
            url = reverse('admin:albums_section_change', args = [obj.id])
            return format_html("<a href='{}'>{}</a>", url, _('ROOT SECTION'))


@admin.register(Photo, site=admin_staff_site)
class PhotoAdmin(admin.ModelAdmin):
    model = Photo


@admin.register(Album, site=admin_staff_site)
class AlbumAdmin(admin.ModelAdmin):
    model = Album
    readonly_fields = ['slug',]
    form = AlbumForm

    def get_urls(self) -> list[URLPattern]:
        '''Add endpoint that procede photo uploading.'''
        urls = super().get_urls()
        my_urls = [
            path("<path:object_id>/upload_photos/", self.admin_site.admin_view(
                self.upload_photo_to_album_view,
            ),
                name='upload_photos')
        ]
        return my_urls + urls

    def upload_photo_to_album_view(self, request,
                                   object_id=None, extra_context=None):
        '''View that procede photo uploading.'''
        context = dict(
            self.admin_site.each_context(request),
        )
        if object_id != 'None':
            album_object = Album.objects.get(id=object_id)
        if request.method == "POST":
            form = AlbumForm(request.POST, request.FILES, instance=album_object)
            form_validated = form.is_valid()
            if form_validated:
                name_of_files = ', '.join([file.name for file in form.cleaned_data.get('upload_photos')])
                return HttpResponse(name_of_files)
        return HttpResponse('endpoint work inccorectly')
