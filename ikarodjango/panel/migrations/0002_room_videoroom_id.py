# Generated by Django 3.1.4 on 2022-07-05 02:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('panel', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='videoroom_id',
            field=models.CharField(default=1234, max_length=8),
            preserve_default=False,
        ),
    ]
