# Generated by Django 5.0.6 on 2024-07-11 10:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('albums', '0003_section_is_published_alter_section_parent_section'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='album',
            options={'ordering': ['title'], 'verbose_name': 'Album', 'verbose_name_plural': 'Albums'},
        ),
        migrations.AddField(
            model_name='album',
            name='is_in_main_menu',
            field=models.BooleanField(default=False, help_text='If selected, album will be in the main toolbar.', verbose_name='Is on main menu'),
        ),
    ]
