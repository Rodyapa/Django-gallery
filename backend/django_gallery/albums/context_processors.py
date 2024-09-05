from albums.models import Album, Section
from albums.utils import get_all_child_sections_and_their_albums

"""
Get instances of sections and best albums
to be rendered in the main nav menu on every page.
"""


def sections(request):
    highest_sections = Section.objects.all().filter(
        is_the_highest_section=True
    )
    sections = dict()
    for highest_section in highest_sections:
        sections[highest_section] = get_all_child_sections_and_their_albums(
            highest_section)
    return {'sections': sections}


def best_albums(request):
    best_albums = [album for album in Album.objects.all().filter(
        is_in_main_menu=True
    )]
    return {'best_albums': best_albums}
