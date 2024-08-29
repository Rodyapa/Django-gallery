# Generated by Django 5.0.6 on 2024-08-26 07:16

import datetime

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('images', '0011_alter_photo_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='photo',
            name='date',
            field=models.DateField(blank=True, default=datetime.datetime(2024, 8, 26, 7, 16, 32, 713752, tzinfo=datetime.timezone.utc), help_text='The image date can be user defined or extracted from the image if it has appropriate meta data.', null=True, verbose_name='Date of image'),
        ),
    ]
