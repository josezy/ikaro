from django.db import models
from django.core.exceptions import ValidationError

from ikaro.models import User
from ikaro.model_utils import BaseModel
from ikaro.utils import ExtendedEncoder


class MavlinkMessage(BaseModel):
    mavtype = models.CharField(max_length=64, db_index=True)
    params = models.JSONField(encoder=ExtendedEncoder, default=dict)


class Drone(BaseModel):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    plate = models.CharField(max_length=8, unique=True)
    alias = models.CharField(max_length=16, null=True)

    def save(self, *args, **kwargs):
        if len(self.plate) != 8:
            raise ValidationError('Plate must be 8 chars long')
        try:
            int(self.plate, 16)
        except ValueError:
            raise ValidationError('Plate is not hexadecimal')
        self.plate = self.plate.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.__class__.__name__}:{self.plate}'

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.plate}>'


class Room(BaseModel):
    host = models.ForeignKey(User, on_delete=models.CASCADE)
    drone = models.OneToOneField(
        Drone,
        null=True,
        on_delete=models.SET_NULL
    )

    name = models.CharField(max_length=128)
    private = models.BooleanField(default=False)
    capacity = models.PositiveIntegerField(default=5)
