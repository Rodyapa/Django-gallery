from .models import Section


def find_all_child_sections_and_their_albums(section: Section) -> dict:
    daughter_sections = section.daughter_sections.all().filter(
        is_published=True)
    if not daughter_sections:
        return [album for album in section.albums.all().filter(
            is_published=True
        )]
    else:
        return {
            daughter_section.title: find_all_child_sections_and_their_albums(
                daughter_section)
            for daughter_section in daughter_sections
        }