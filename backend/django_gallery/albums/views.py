from django.shortcuts import get_object_or_404, render
from albums.models import Album
from images.models import Photo
from django.views import View
from datetime import date


class AlbumView(View):
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
        templates_folder_relative_path = 'albums'
        if template_name is not None:
            return (templates_folder_relative_path +
                    '/' + template_name + '.html')
        return 'albums/base_album.html'

    def get_photos(self, album, template_name):
        photos = Photo.objects.filter(album=album, is_published=True)

        if template_name == 'year_sorted':
            photos_by_year = {}
            for photo in photos:
                if photo.date:
                    year_of_photo = photo.date.year
                    if year_of_photo not in photos_by_year:
                        photos_by_year[year_of_photo] = [photo, ]
                    else:
                        photos_by_year[year_of_photo].append(photo)
                else:
                    today_year = date.today().year
                    if photos_by_year.get(str(today_year)):
                        photos_by_year[str(today_year)].append(photo)
                    else:
                        photos_by_year[str(today_year)] = [photo, ]
            return dict(sorted(photos_by_year.items(), reverse=True))
        elif template_name == 'subdivided':
            photos_by_subcategories = {}
            for photo in photos:
                photo_subcategory = photo.subcategory
                if photo.subcategory:
                    if photo_subcategory in photos_by_subcategories:
                        photos_by_subcategories[photo_subcategory].append(
                            photo
                        )
                    else:
                        photos_by_subcategories[photo_subcategory] = [photo, ]
            return photos_by_subcategories
        return photos
