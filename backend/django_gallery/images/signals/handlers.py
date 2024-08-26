from django.db.models.signals import post_delete
from django.dispatch import receiver
from albums.models import AlbumSubcategory
from images.models import Photo



@receiver(post_delete, sender=AlbumSubcategory)
def update_photos_on_category_delete(sender, instance, **kwargs):
    '''When album subcategory deleted - all photos in this category
       became unpublished'''
    Photo.objects.filter(subcategory=instance).update(
        is_published=False,
        subcategory=None)