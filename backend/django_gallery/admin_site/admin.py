from datetime import date

from admin_site.form_fields import JSModulePath
from albums.models import (Album, AlbumSubcategory, AlbumTemplate, Section,
                           SimpleAlbum, SubcategoryDividedAlbum,
                           YearDividedAlbum)
from django import forms
from django.conf import settings
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, reverse
from django.urls.resolvers import URLPattern
from django.utils.html import format_html
from django.utils.translation import gettext as _
from images.models import Photo

from .admin_forms import AlbumForm


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
            url = reverse('admin:albums_section_change',
                          args=[obj.parent_section.id]
                          )
            return format_html("<a href='{}'>{}</a>", url, obj.parent_section)
        else:
            url = reverse('admin:albums_section_change',
                          args=[obj.id]
                          )
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
        "subcategory"
    ]
    readonly_fields = ['image_preview']
    list_display = ['image_preview', "title", 'album']

    def image_preview(self, obj):
        return format_html(
            '<img src="{}" class="image-preview"/>'.format(obj.image.url)
        )
    image_preview.short_description = 'image preview'

    class Media:
        css = {
            "all": ["admin/styles/sorting_zone.css", ],
        }


class PhotoAlbumInlineBase(admin.options.InlineModelAdmin):
    model = Photo
    template = 'admin/albums/edit_inlines/photo_mosaic.html'
    extra = 0
    fields = [
        "title",
        "image_preview",
        "is_published",
        "order",
    ]
    readonly_fields = ['image_preview', ]

    class Media:
        css = {
            "all": ["admin/photo_sortzone/styles/sorting_zone.css", ],
        }

    def image_preview(self, obj):
        '''Add field of image preview to the html page.'''
        return format_html(
            '<img src="{}" class="image-preview"/>'.format(obj.image.url)
        )
    image_preview.short_description = 'image preview'

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        form = formset.form

        # Set the 'order' field widget to HiddenInput
        form.base_fields['order'].widget = forms.HiddenInput()

        return formset


class PhotoSimpleAlbumInline(PhotoAlbumInlineBase):
    class Media:
        js = [JSModulePath('/admin/photo_sortzone/js/dynamic_sortzone.js'),
              ]


class PhotoYearDividedAlbumInline(PhotoAlbumInlineBase):
    fields = [
        "title",
        "image_preview",
        "is_published",
        "date",
        "order",
    ]

    class Media:
        js = [JSModulePath('/admin/photo_sortzone/js/load_year_template.js'), ]

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        form = formset.form

        form.base_fields['date'].widget = forms.HiddenInput()

        return formset


class AlbumAdminBase(admin.ModelAdmin):
    model = Album
    readonly_fields = ['slug', ]
    form = AlbumForm

    class Meta:
        abstract = True

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
                name='upload_photos'),
        ]
        return my_urls + urls

    def upload_photo_to_album_view(self, request,
                                   object_id=None, extra_context=None):
        '''View that procede photo uploading.
        This view procede single photo uploading
        '''
        if object_id != 'None':
            album = Album.objects.get(id=object_id)
            if request.method == "POST":
                form = AlbumForm(request.POST, request.FILES, instance=album)
                form_validated = form.is_valid()
                if form_validated:
                    uploaded_file = form.cleaned_data.get('upload_photos')[0]
                    selected_category_id = request.POST.get('selected_category')
                    selected_year = request.POST.get('specific_year')
                    try:
                        selected_category_id = int(selected_category_id)
                        selected_category = AlbumSubcategory.objects.get(
                            id=selected_category_id
                        )
                    except (AlbumSubcategory.DoesNotExist, ValueError):
                        selected_category = None
                    try:
                        selected_year = int(selected_year)
                        todays_date = date.today()
                        todays_month = todays_date.month
                        todays_day = todays_date.day
                        photo_date = date(year=selected_year, month=todays_month,
                                        day=todays_day)
                    except ValueError:
                        photo_date = date.today()
                    try:
                        Photo.objects.create(
                            image=uploaded_file,
                            subcategory=selected_category,
                            album=album,
                            date=photo_date
                        )
                        response = {'success': True,
                                    'error': None}
                        response_status = 200
                    except Exception as e:
                        error = e if settings.DEBUG else 'Error making a photo'
                        response = {'success': False,
                                    'error': f'{error}'
                                    }
                        response_status = 500
                else:
                    response = {'success': False,
                                'error': 'Incorrect form'}
                    response_status = 400
            else:
                response = {'success': False,
                            'error': f'{request.method} Method not allowed'}
                response_status = 405
            return JsonResponse(response, status=response_status)
        else: 
            response = {'success': False,
                        'error': 'Need To create Album before uploading photo'}
            response_status = 400
            return JsonResponse(response, status=response_status)


@admin.register(SimpleAlbum, site=admin_staff_site)
class SimpleAlbumAdmin(AlbumAdminBase):
    model = SimpleAlbum
    inlines = [PhotoSimpleAlbumInline, ]

    def get_queryset(self, request):
        qs = super(AlbumAdminBase, self).get_queryset(request)
        return qs.filter(template=None)

#  Subcategory Divided Album Page related Classes


class PhotoSubcategoryDividedAlbumInline(PhotoAlbumInlineBase):
    fields = [
        "title",
        "image_preview",
        "is_published",
        "subcategory",
        "order",
    ]
    template = 'admin/albums/edit_inlines/bare_photo_mosaic.html'

    class Media:
        js = [JSModulePath(
            '/admin/photo_sortzone/js/load_subcategory_template.js'
        ),
        ]

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        form = formset.form
        form.base_fields['subcategory'].widget = forms.HiddenInput()
        return formset

    def has_add_permission(self, request, obj):
        return False


@admin.register(YearDividedAlbum, site=admin_staff_site)
class YearDividedAlbumAdmin(AlbumAdminBase):
    model = YearDividedAlbum
    inlines = [PhotoYearDividedAlbumInline, ]

    def get_queryset(self, request):
        qs = super(AlbumAdminBase, self).get_queryset(request)
        year_sorted_template_id = AlbumTemplate.objects.get(
            title='year_sorted').id
        return qs.filter(template=year_sorted_template_id)


class SubcategoryInline(admin.StackedInline):
    model = AlbumSubcategory
    fields = ['title', 'order']
    extra = 0
    template = 'admin/albums/edit_inlines/subcategory_inline.html'

    class Media:
        css = {
            "all": ["admin/photo_sortzone/styles/subcategories.css", ],
        }

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        form = formset.form
        form.base_fields['order'].widget = forms.HiddenInput()
        return formset

    def has_add_permission(self, request, obj):
        return False


@admin.register(SubcategoryDividedAlbum, site=admin_staff_site)
class SubcategoryDividedAlbumAdmin(AlbumAdminBase):
    model = SubcategoryDividedAlbum
    inlines = [PhotoSubcategoryDividedAlbumInline,
               SubcategoryInline]

    def get_queryset(self, request):
        qs = super(AlbumAdminBase, self).get_queryset(request)
        subdivided_template_id = AlbumTemplate.objects.get(
            title='subdivided').id
        return qs.filter(template=subdivided_template_id)


@admin.register(AlbumSubcategory, site=admin_staff_site)
class AlbumSubcategoryAdmin(admin.ModelAdmin):
    model = AlbumSubcategory
    exclude = ('order', )
    list_display = ('title', 'album')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "album":
            subdivided_template_id = AlbumTemplate.objects.get(
                title='subdivided').id
            kwargs["queryset"] = Album.objects.filter(
                template=subdivided_template_id)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
