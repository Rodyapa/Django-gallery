from albums.models import (AlbumTemplate, YearDividedAlbum,
                           YearDividedAlbumExtraData)
from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver


@receiver(post_migrate)
def create_default_templates(sender, **kwargs):
    """Creates database entries for standard templates for albums.
       After every migration."""
    for template_name in AlbumTemplate.TEMPLATE_NAMES.keys():
        AlbumTemplate.objects.get_or_create(title=template_name)


@receiver(post_save, sender=YearDividedAlbum)
def create_initial_related_extra_data_record(sender,
                                             instance, created, **kwargs):
    """Create related YearDividedAlbumExtraData instance.
       When instance of YearDividedAlbum is created,
       related YearDividedAlbumExtraData should be created too."""
    if created:
        try:
            YearDividedAlbumExtraData.objects.get_or_create(album=instance)
            print(f"Successfully created YearDividedAlbumExtraData "
                  f"for album: {instance.id}")
        except Exception as e:
            print(f"Error creating YearDividedAlbumExtraData "
                  f"for album: {instance.id}. Error: {str(e)}")


@receiver(post_save, sender=YearDividedAlbum)
def delete_related_extra_data_record(sender, instance, created, **kwargs):
    """
    Delete related YearDividedAlbumExtraData instance.

    when template field of YearDividedAlbum changed to
    another template (not year_sorted), than extra_data_should be deleted.
    """
    if not created:
        if instance.template != 'year_sorted':
            related_extra_data = YearDividedAlbumExtraData.objects.filter(
                album=instance
            )
            if related_extra_data.exists():
                related_extra_data.delete()


@receiver(post_save, sender=YearDividedAlbum)
def create_related_extra_data_record(sender, instance, created, **kwargs):
    """
    Create related YearDividedAlbumExtraData instance.

    when template field of YearDividedAlbum changed to
    year_sorted, than extra_data_should be created again.
    """
    if not created:
        if instance.template == 'year_sorted':
            YearDividedAlbumExtraData.objects.get_or_create(
                album=instance
            )
