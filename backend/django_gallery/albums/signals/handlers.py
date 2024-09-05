from albums.models import AlbumTemplate
from django.db.models.signals import post_migrate
from django.dispatch import receiver


@receiver(post_migrate)
def create_default_templates(sender, **kwargs):
    """Creates database entries for standard templates for albums.
       After every migration."""
    for template_name in AlbumTemplate.TEMPLATE_NAMES.keys():
        AlbumTemplate.objects.get_or_create(title=template_name)
