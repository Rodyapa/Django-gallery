from django.db import models
from django.utils.translation import gettext as _
from django_gallery.constants import MAX_CHAR_FIELD
from slugify import slugify
from django.core.exceptions import ValidationError
from random import randint


class Section(models.Model):
    '''Model describing Section object.'''
    title = models.CharField(
        max_length=MAX_CHAR_FIELD,
        verbose_name=_("Section's title"),
        )
    parent_section = models.ForeignKey(
        to='self',
        on_delete=models.SET_NULL,
        verbose_name=_('Parent_Section'),
        null=True,
        blank=True,
        related_name=_('daughter_sections')
    )
    is_the_highest_section = models.BooleanField(
        verbose_name=_('Is the highest section'),
        help_text=_('Determine if this section is the highest. '
                   'The highest section cannot have parent_section.'),
        default=False
    )
    is_published = models.BooleanField(
        default=True,
        verbose_name=_('Is published'),
        help_text=_('If selected, section will be seen on the site.'))

    class Meta:
        verbose_name = _("Section")
        verbose_name_plural = _("Sections")

    def __str__(self):
        return _(self.title)

    def clean(self):
        if self.is_the_highest_section and self.parent_section:
            raise ValidationError(_(
                            _("Highest section cannot have parent section.")
                    ))
        return super().clean()


class Album(models.Model):
    '''Model describing album object.'''
    title = models.CharField(
        max_length=MAX_CHAR_FIELD,
        verbose_name="Album's title",
        )
    slug = models.SlugField(
        max_length=MAX_CHAR_FIELD,
        unique=True,
        blank=True,
        verbose_name='Unique title of an album')
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Description",
    )
    is_published = models.BooleanField(
        default=True,
        verbose_name='Is published',
        help_text='If selected, album will be seen on the site.')
    section = models.ForeignKey(
        verbose_name='Section',
        to=Section,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='albums'
    )

    class Meta:
        verbose_name = _("Album")
        verbose_name_plural = _("Albums")
        ordering = ["title",]

    def clean(self):
        if self.section:  # if section provided it will written in slug
            slug_text = slugify(f'{self.section}_{self.title}')
            if Album.objects.filter(slug=slug_text):
                raise ValidationError(
                    {"title": _(
                        "Section cannot have albums with the same titles."
                    )}
                )
        else:  # else slug will be a title of album and random integer
            slug_text = slugify(self.slug)
            count_redefine_slug = 0
            while Album.objects.filter(slug=slug_text):
                if count_redefine_slug == 5:  # To stop endless while.
                    break
                slug_text = slugify(f'{self.slug}{randint(0,9999)}')
                count_redefine_slug += 1
        self.slug = slug_text
        super().clean()

    def __str__(self):
        return self.title
