from albums.models import Section
from albums.utils import find_all_child_sections_and_their_albums


def sections(request=None):
    highest_sections = Section.objects.all().filter(
        is_the_highest_section=True
        )
    sections = dict()
    for highest_section in highest_sections:
        sections[highest_section] = find_all_child_sections_and_their_albums(
            highest_section)
    return {'sections': sections}
