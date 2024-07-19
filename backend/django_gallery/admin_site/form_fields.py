from django import forms
from django.utils.safestring import mark_safe
from django.forms.renderers import TemplatesSetting
from django.template import Context, Template
from django.template.loader import get_template


class MultipleImageInput(forms.ClearableFileInput):
    allow_multiple_selected = True
    template_name = 'django/forms/widgets/photo_dropzone.html'

    class Media:
        css = {
            "all": ["admin/photo_dropzone/styles/widget.css", ],
        }
        js = ['admin/photo_dropzone/js/widget_events.js', ]


class MultipleImageField(forms.FileField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleImageInput(
        ))
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        single_file_clean = super().clean
        if isinstance(data, (list, tuple)):
            result = [single_file_clean(d, initial) for d in data]
        else:
            result = [single_file_clean(data, initial)]
        return result
