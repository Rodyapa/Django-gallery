# Generated by Django 5.0.6 on 2024-08-26 10:41

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('images', '0012_alter_photo_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='photo',
            name='date',
            field=models.DateField(blank=True, default=datetime.datetime(2024, 8, 26, 10, 41, 1, 761032, tzinfo=datetime.timezone.utc), help_text='The image date can be user defined or extracted from the image if it has appropriate meta data.', null=True, verbose_name='Date of image'),
        ),
    ]