from django import forms
from django.utils.html import html_safe


@html_safe
class JSModulePath:
    '''Implement html path to script with type="module".
       This made for Media classes of ModelAdmin classes.'''
    def __init__(self, path):
        self.path = path

    def __str__(self):
        return f'<script type ="module" src="/static/{self.path}"></script>'


class MultipleImageInput(forms.ClearableFileInput):
    """Field for dropzone on album admin change pages."""
    allow_multiple_selected = True
    template_name = 'django/forms/widgets/photo_dropzone.html'

    class Media:
        css = {
            "all": ["admin/photo_dropzone/styles/widget.css", ],
        }
        js = [JSModulePath('admin/photo_dropzone/js/widget_events.js'),
              ]


class MultipleImageField(forms.FileField):
    """Field for multiple file uplaod on album admin change pages."""
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
