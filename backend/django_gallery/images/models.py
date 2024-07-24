from django.db import models
from albums.models import Album
from django_gallery.constants import MAX_CHAR_FIELD
from django.utils.translation import gettext as _
from django.core.files.uploadedfile import (
    InMemoryUploadedFile,
    TemporaryUploadedFile,
)
from .utils import resize_uploaded_image, add_watermark


class Photo(models.Model):

    title = models.CharField(
        verbose_name=_("Title of Photo"),
        max_length=MAX_CHAR_FIELD,
        blank=True,
        null=True
    )
    image = models.ImageField(
        verbose_name=_('Image file'),
        blank=False,
        upload_to="photos/%Y/%m/%d"
    )
    date = models.DateField(
        verbose_name=_("Date of image"),
        help_text=_('The image date can be user defined '
                    'or extracted from the image if '
                    'it has appropriate meta data.'),
        blank=True,
        null=True,
    )
    is_published = models.BooleanField(
        default=True,
        verbose_name=_('Is published'),
        help_text=_('If selected, photo will be seen on the site.'))
    album = models.ForeignKey(
        to=Album,
        verbose_name=_("Album"),
        related_name="photos",
        on_delete=models.CASCADE,
        blank=True,
        null=True)
    '''
    drag_order = models.PositiveIntegerField(
        default=0, blank=False, null=False, db_index=True
    )
    '''

    class Meta:
        verbose_name = _("Photo")
        verbose_name_plural = _("Photos")
        # ordering = ['drag_order',]

    def __str__(self):
        return str(self.title) if self.title else str(self.id)
    '''
    def save(self, *args, **kwargs):
        """Resizing given image before saving"""
        if (
            isinstance(self.image.file, InMemoryUploadedFile) or
            isinstance(self.image.file, TemporaryUploadedFile)
        ):
            self.image = resize_uploaded_image(self.image.file)
            self.image = add_watermark(self.image.file)
        super(Photo, self).save(*args, **kwargs)
    '''