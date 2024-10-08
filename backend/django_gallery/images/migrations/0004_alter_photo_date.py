# Generated by Django 5.0.6 on 2024-08-07 13:48

import datetime

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('images', '0003_alter_photo_options_photo_order'),
    ]

    operations = [
        migrations.AlterField(
            model_name='photo',
            name='date',
            field=models.DateField(blank=True, default=datetime.date(2024, 8, 7), help_text='The image date can be user defined or extracted from the image if it has appropriate meta data.', null=True, verbose_name='Date of image'),
        ),
    ]
