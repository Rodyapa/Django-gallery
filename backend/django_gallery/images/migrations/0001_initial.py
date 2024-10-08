# Generated by Django 5.0.6 on 2024-07-09 04:28

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('albums', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Photo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=128, null=True, verbose_name='Title of Photo')),
                ('image', models.ImageField(upload_to='photos/%Y/%m/%d', verbose_name='Image file')),
                ('date', models.DateField(blank=True, help_text='The image date can be user defined or extracted from the image if it has appropriate meta data.', null=True, verbose_name='Date of image')),
                ('is_published', models.BooleanField(default=True, help_text='If selected, photo will be seen on the site.', verbose_name='Is published')),
                ('album', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='photos', to='albums.album', verbose_name='Album')),
            ],
            options={
                'verbose_name': 'Photo',
                'verbose_name_plural': 'Photos',
            },
        ),
    ]
