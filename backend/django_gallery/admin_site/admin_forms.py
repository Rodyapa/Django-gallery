from admin_site.form_fields import MultipleImageField
from albums.models import Album
from django import forms


class AlbumForm(forms.ModelForm):
    upload_photos = MultipleImageField()

    class Meta:
        model = Album
        fields = '__all__'

    upload_photos.widget.attrs.update({"class": "photo_dropzone"})
