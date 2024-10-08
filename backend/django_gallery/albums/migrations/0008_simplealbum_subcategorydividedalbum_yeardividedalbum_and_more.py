# Generated by Django 5.0.6 on 2024-08-20 12:54

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('albums', '0007_alter_albumsubcategory_order_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='SimpleAlbum',
            fields=[
            ],
            options={
                'verbose_name': 'Album',
                'verbose_name_plural': 'Albums Simple',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('albums.album',),
        ),
        migrations.CreateModel(
            name='SubcategoryDividedAlbum',
            fields=[
            ],
            options={
                'verbose_name': 'Album',
                'verbose_name_plural': 'Albums (Subcategory divided)',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('albums.album',),
        ),
        migrations.CreateModel(
            name='YearDividedAlbum',
            fields=[
            ],
            options={
                'verbose_name': 'Album',
                'verbose_name_plural': 'Albums (Year divided)',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('albums.album',),
        ),
        migrations.AlterField(
            model_name='album',
            name='section',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='albums', to='albums.section', verbose_name='Section'),
        ),
    ]
