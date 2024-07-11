from django.db import models
from django.utils.translation import gettext as _
from django_gallery.constants import SHORT_CHAR


class ContactLink(models.Model):
    '''Model for links that will be displayed on contact page.'''
    link = models.URLField(
        verbose_name=_('Link'),
    )
    description = models.CharField(
        verbose_name=_('Title of a link'),
        max_length=SHORT_CHAR,
    )
    is_active = models.BooleanField(
        verbose_name=_('Is active'),
        default=True
    )