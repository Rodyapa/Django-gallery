# Generated by Django 5.0.6 on 2024-09-08 11:40

import datetime

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('images', '0015_alter_photo_date_alter_photo_order'),
    ]

    operations = [
        migrations.AlterField(
            model_name='photo',
            name='date',
            field=models.DateField(blank=True, default=datetime.datetime(2024, 9, 8, 11, 39, 56, 315116, tzinfo=datetime.timezone.utc), help_text='The image date can be user defined or extracted from the image if it has appropriate meta data.', null=True, verbose_name='Date of image'),
        ),
    ]
