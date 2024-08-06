from django.db import models
from django import VERSION
from django.contrib.contenttypes.models import ContentType
from django.db import models


class SortableMixin(models.Model):
    """
    `is_sortable` determines whether or not the Model is sortable by
    determining if the last value of the field used to determine the order
    of objects is greater than the default of 1, which should be present if
    there is only one object.

    `model_type_id` returns the ContentType.id for the Model that
    inherits Sortable

    `save` the override of save increments the last/highest value of
    `Meta.ordering` by 1
    """

    is_sortable = False
    sorting_filters = ()

    class Meta:
        abstract = True

    @classmethod
    def model_type_id(cls):
        return ContentType.objects.get_for_model(cls).id

    def __init__(self, *args, **kwargs):
        super(SortableMixin, self).__init__(*args, **kwargs)

        # Check that Meta.ordering contains one value
        try:
            self.order_field_name = self._meta.ordering[0].replace('-', '')
        except IndexError:
            raise ValueError(u'You must define the Meta.ordering '
                             u'property on your model.')

        # get the model field defined by `Meta.ordering`
        self.order_field = self._meta.get_field(self.order_field_name)

        integer_fields = (models.PositiveIntegerField, models.IntegerField,
            models.PositiveSmallIntegerField, models.SmallIntegerField,
            models.BigIntegerField,)

        # check that the order field is an integer type
        if not self.order_field or not isinstance(self.order_field,
                integer_fields):
            raise NotImplementedError(u'You must define the field '
                '`Meta.ordering` refers to, and it must be of type: '
                'PositiveIntegerField, IntegerField, '
                'PositiveSmallIntegerField, SmallIntegerField, '
                'BigIntegerField')

    def _get_order_field_value(self):
        try:
            return int(self.order_field.value_to_string(self))
        except ValueError:
            raise u'The value from the specified order field could not be '
            'typecast to an integer.'

    def save(self, *args, **kwargs):
        needs_default = self._state.adding
        if not getattr(self, self.order_field_name) and needs_default:
            try:
                current_max = self.__class__.objects.filter(album=self.album).aggregate(
                    models.Max(self.order_field_name))[self.order_field_name + '__max'] or 0

                setattr(self, self.order_field_name, current_max + 1)
            except (TypeError, IndexError):
                pass
        super(SortableMixin, self).save(*args, **kwargs)
