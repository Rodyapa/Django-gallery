from django.core.validators import RegexValidator


class CharFieldValidator(RegexValidator):
    regex = r'^[A-Za-zА-Яа-я\s-_]+$'
    message = ('You can use russian and english letters, '
               'hyphen, space, underscore')
