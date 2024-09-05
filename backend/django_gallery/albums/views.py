from collections import defaultdict
from datetime import date

from albums.models import Album
from django.shortcuts import get_object_or_404, render
from django.views import View
from images.models import Photo


class AlbumView(View):
    """View for User side album instances."""

    def get(self, request, album_slug):
        album = get_object_or_404(Album, slug=album_slug)
        if album.template:
            template_name = album.template.title
        else:
            template_name = None
        template = self.get_template(template_name)
        photos = self.get_photos(album, template_name)
        context = {'album': album,
                   'photos': photos}
        return render(request, template, context=context)

    def get_template(self, template_name=None):
        """Get template for the album."""

        templates_folder_relative_path = 'albums'
        if template_name is not None:
            return (templates_folder_relative_path +
                    '/' + template_name + '.html')
        return 'albums/album.html'

    def get_photos(self, album, template_name):
        """Get photos related to the album"""

        photos = (Photo.objects
                  .filter(album=album, is_published=True)
                  .order_by('order'))

        if template_name == 'year_sorted':
            photos_by_year = defaultdict(list)
            frontend_dataset_counter = 0  # Counter for frontend dataset

            for photo in photos:
                photo.order_dataset = frontend_dataset_counter
                frontend_dataset_counter += 1

                year_of_photo = (
                    photo.date.year if photo.date else date.today().year
                )

                photos_by_year[year_of_photo].append(photo)

            return dict(sorted(photos_by_year.items(), reverse=True))
        elif template_name == 'subdivided':
            unique_subcategories = {
                photo.subcategory for photo in photos if (
                    photo.subcategory is not None)
            }

            sorted_subcategories = sorted(
                unique_subcategories, key=lambda x: x.order
            )

            photos_by_subcategory = {}
            frontend_dataset_counter = 0  # For Frontend Dataset

            for subcategory in sorted_subcategories:
                photos_in_subcategory = subcategory.photos.all().order_by(
                    'order')

                for photo in photos_in_subcategory:
                    frontend_dataset_counter += 1
                    photo.order_dataset = frontend_dataset_counter

                photos_by_subcategory[subcategory] = photos_in_subcategory

            return photos_by_subcategory
        return photos
