from typing import Any
from django.contrib import admin
from django.conf import settings
from django.db.models.query import QuerySet
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.urls.resolvers import URLPattern
from albums.models import Section, Album
from images.models import Photo
from django.utils.translation import gettext as _
from django.utils.html import format_html
from django.urls import reverse, path
from django.template.response import TemplateResponse
from .admin_forms import AlbumForm
from django.shortcuts import get_object_or_404, render
from django import forms
from admin_site.form_fields import JSModulePath


class StaffSite(admin.AdminSite):
    site_header = f"{settings.SITE_TITLE} administration"
    index_title = f"{settings.SITE_TITLE} administration"


admin_staff_site = StaffSite(name='staffadmin')


class AlbumInline(admin.StackedInline):
    model = Album
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
    fields = [
        "title",
        "image_preview",
        "image",
        "date",
        "is_published",
        "album",
    ]
    readonly_fields = ['image_preview']
    list_display = ['image_preview', "title", 'album']

    def image_preview(self, obj):
        return format_html('<img src="{}" class="image-preview"/>'.format(obj.image.url))
    image_preview.short_description = 'image preview'

    class Media:
        css = {
            "all": ["admin/styles/sorting_zone.css", ],
        }


class PhotoInAlbumInline(admin.options.InlineModelAdmin):
    model = Photo
    template = 'admin/albums/edit_inlines/photo_mosaic.html'
    extra = 0
    fields = [
        "title",
        "image_preview",
        "is_published",
        "date",
        "order",
        "subcategory"
    ]
    readonly_fields = ['image_preview',]

    class Media:
        css = {
            "all": ["admin//styles/sorting_zone.css", ],
        }
        js = [JSModulePath('admin/js/dynamic_sortzone.js'),
              ]

    def image_preview(self, obj):
        '''Add field of image preview to the html page.'''
        return format_html('<img src="{}" class="image-preview"/>'.format(obj.image.url))
    image_preview.short_description = 'image preview'

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        form = formset.form

        # Set the 'order' field widget to HiddenInput
        form.base_fields['order'].widget = forms.HiddenInput()
        form.base_fields['date'].widget = forms.HiddenInput()
        form.base_fields['subcategory'].widget = forms.HiddenInput()

        return formset


@admin.register(Album, site=admin_staff_site)
class AlbumAdmin(admin.ModelAdmin):
    model = Album
    readonly_fields = ['slug',]
    form = AlbumForm
    inlines = [PhotoInAlbumInline,]

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'template':
            kwargs['empty_label'] = 'regular'
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

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
        '''View that procede photo uploading.
        This view procede single photo uploading
        '''

        context = dict(
            self.admin_site.each_context(request),
        )
        if object_id != 'None':
            album = Album.objects.get(id=object_id)
        if request.method == "POST":
            form = AlbumForm(request.POST, request.FILES, instance=album)
            form_validated = form.is_valid()
            if form_validated:
                '''import time
                time.sleep(5)'''
                uploaded_file = form.cleaned_data.get('upload_photos')[0]
                try:
                    new_photo = Photo.objects.create(image=uploaded_file,
                                                     album=album)
                    response = {'success': True,
                                'error': None}
                    response_status = 200
                except:
                    response = {'success': False,
                                'error': 'Error when uploading photo on server'}
                    response_status = 500
        else:
            response = {'success': False,
                        'error': f'{request.method} Method not allowed'}
            response_status = 405
        return JsonResponse(response, status=response_status)
