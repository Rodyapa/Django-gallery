from datetime import date

from admin_site.form_fields import JSModulePath
from albums.models import (Album, AlbumSubcategory, AlbumTemplate, Section,
                           SimpleAlbum, SubcategoryDividedAlbum,
                           YearDividedAlbum, YearDividedAlbumExtraData)
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
    """Main admin site instance."""
    site_header = f"{settings.SITE_TITLE} administration"
    index_title = f"{settings.SITE_TITLE} administration"


admin_staff_site = StaffSite(name='staffadmin')


class AlbumInline(admin.StackedInline):
    """Album Inline used for Sections Admin page."""
    model = Album
    extra = 0
    fields = ['title']
    show_change_link = True


@admin.register(Section, site=admin_staff_site)
class SectionAdmin(admin.ModelAdmin):
    """Section admin page class."""
    model = Section
    list_display = ['title', 'view_parent_section']
    inlines = [AlbumInline, ]

    @admin.display(empty_value=_("ROOT SECTION"))
    def view_parent_section(self, obj):
        """Custom column for list page. Adds column of parent sections."""
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
    """Main admin class of photos admin pages."""
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
        """Adds image preview on list page and change page."""
        return format_html(
            '<img src="{}" class="image-preview"/>'.format(obj.image.url)
        )
    image_preview.short_description = 'image preview'

    class Media:
        css = {
            "all": ["admin/styles/sorting_zone.css",
                    "admin/styles/admin_photos.css"],
        }


class PhotoAlbumInlineBase(admin.options.InlineModelAdmin):
    """Main class of photo inline instances on Album change pages."""
    model = Photo
    template = 'admin/albums/edit_inlines/photo_mosaic.html'
    extra = 0
    fields = [
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


class AlbumAdminBase(admin.ModelAdmin):
    """Main album admin page class.
       Not used directly.
       Used for other album display classes on the admin page."""
    model = Album
    readonly_fields = ['slug', ]
    form = AlbumForm

    class Media:
        css = {
            "all": ["admin/styles/admin_albums.css", ],
        }

    class Meta:
        abstract = True

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

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'template':
            kwargs['empty_label'] = 'regular'
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def upload_photo_to_album_view(self, request,
                                   object_id=None, extra_context=None):
        '''View that procede photo uploading.
        This view procede single photo uploading per request.
        '''
        if object_id != 'None':
            album = Album.objects.get(id=object_id)
            if request.method == "POST":
                form = AlbumForm(request.POST, request.FILES, instance=album)
                form_validated = form.is_valid()
                if form_validated:
                    uploaded_file = form.cleaned_data.get('upload_photos')[0]
                    selected_category_id = request.POST.get(
                        'selected_category')
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
                        photo_date = date(
                            year=selected_year,
                            month=todays_month,
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


class PhotoSimpleAlbumInline(PhotoAlbumInlineBase):
    """Photo inline class for Simple Album instances."""
    class Media:
        js = [JSModulePath('/admin/photo_sortzone/js/dynamic_sortzone.js'),
              ]


@admin.register(SimpleAlbum, site=admin_staff_site)
class SimpleAlbumAdmin(AlbumAdminBase):
    """Class of Simple Album Admin page."""
    model = SimpleAlbum
    inlines = [PhotoSimpleAlbumInline, ]

    def get_queryset(self, request):
        # Filter albums that has no template.
        qs = super(AlbumAdminBase, self).get_queryset(request)
        return qs.filter(template=None)


#  Subcategory Divided Album Page related Classes


class PhotoSubcategoryDividedAlbumInline(PhotoAlbumInlineBase):
    """Photo inline class for Subcategory Divided Album instances."""
    fields = [
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


class SubcategoryInline(admin.StackedInline):
    """Subcategory inline class for Subcategory Divided Album instances."""
    model = AlbumSubcategory
    fields = ['title', 'order']
    extra = 0
    template = 'admin/albums/edit_inlines/subcategory_inline.html'

    class Media:
        css = {
            "all": ["admin/photo_sortzone/styles/subcategories.css", ],
        }
    # TODO The order field is now implemented using a simple standard approach.
    # In the future it would be nice to make it more user friendly.
    '''
    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        form = formset.form
        form.base_fields['order'].widget = forms.HiddenInput()
        return formset
    '''
    def has_add_permission(self, request, obj):
        return False


@admin.register(SubcategoryDividedAlbum, site=admin_staff_site)
class SubcategoryDividedAlbumAdmin(AlbumAdminBase):
    """Class of subcategory divided Album Admin page."""
    model = SubcategoryDividedAlbum
    inlines = [PhotoSubcategoryDividedAlbumInline,
               SubcategoryInline]

    def get_queryset(self, request):
        qs = super(AlbumAdminBase, self).get_queryset(request)
        # Get the ID of the subdivided template to filter.
        subdivided_template_id = AlbumTemplate.objects.get(
            title='subdivided').id
        return qs.filter(template=subdivided_template_id)


@admin.register(AlbumSubcategory, site=admin_staff_site)
class AlbumSubcategoryAdmin(admin.ModelAdmin):
    """Class of Album Subcategory Admin page."""
    # TODO now adding an album subcategory
    # is done through a special album subcategory.
    # it would be nice to be able to add subcategories on the album page
    model = AlbumSubcategory
    exclude = ('order', )
    list_display = ('title', 'album')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        # On subcategory addition page user can choose only albums that
        # divided by subcategories.
        if db_field.name == "album":
            subdivided_template_id = AlbumTemplate.objects.get(
                title='subdivided').id
            kwargs["queryset"] = Album.objects.filter(
                template=subdivided_template_id)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

#  Year Divided Album Page related Classes


class YearAlbumExtraDataInline(admin.StackedInline):
    """Extra Data for Year Divided Album Inline."""
    model = YearDividedAlbumExtraData
    fields = ['year_order', ]
    extra = 1
    min_num = 1
    max_num = 1
    template = 'admin/albums/edit_inlines/year_album_extradata_inline.html'
    can_delete = False
    verbose_name = _("EXTRA SETTINGS")


class PhotoYearDividedAlbumInline(PhotoAlbumInlineBase):
    """Photo inline class for Year Divided Album instances."""
    fields = [
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
        # Set the 'date' field widget to HiddenInput
        form.base_fields['date'].widget = forms.HiddenInput()

        return formset


@admin.register(YearDividedAlbum, site=admin_staff_site)
class YearDividedAlbumAdmin(AlbumAdminBase):
    """Class of Year divided Album Admin page."""
    model = YearDividedAlbum
    inlines = [YearAlbumExtraDataInline, PhotoYearDividedAlbumInline, ]

    def get_queryset(self, request):
        qs = super(AlbumAdminBase, self).get_queryset(request)
        year_sorted_template_id = AlbumTemplate.objects.get(
            title='year_sorted').id
        return qs.filter(template=year_sorted_template_id)
