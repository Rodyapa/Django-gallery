from .models import Section

"""
Utilities for album app.
"""


def get_all_child_sections_and_their_albums(section: Section) -> dict:
    daughter_sections = section.daughter_sections.all().filter(
        is_published=True)
    section_albums = section.albums.all().filter(is_published=True)
    return {'section_albums': [
        album for album in section_albums
    ],
        'daughter_sections': {
            daughter_section.title:
            get_all_child_sections_and_their_albums
            (daughter_section)
            for daughter_section in daughter_sections}
    }
