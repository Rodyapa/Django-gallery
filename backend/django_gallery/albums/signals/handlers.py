from django.db.models.signals import post_delete, post_migrate, post_save
from django.dispatch import receiver
from albums.models import AlbumTemplate


@receiver(post_migrate)
def create_default_templates(sender, **kwargs):
    for template_name in AlbumTemplate.TEMPLATE_NAMES.keys():
        AlbumTemplate.objects.get_or_create(title=template_name)
