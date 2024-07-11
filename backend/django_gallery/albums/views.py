from django.shortcuts import get_object_or_404, render
from adminsortable2.admin import SortableAdminMixin
from albums.models import Album
from images.models import Photo


def AlbumView(request, album_slug):
    album = get_object_or_404(
        Album,
        slug=album_slug
        )
    photos = Photo.objects.filter(album=album, is_published=True)
    template = 'albums/album.html'

    context = {'album': album,
               'photos': photos}
    return render(request, template, context=context)
