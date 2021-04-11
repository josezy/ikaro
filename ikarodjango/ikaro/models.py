from django.db import models
from django.contrib.auth.models import AbstractUser

from ikaro.model_utils import BaseModel


class User(AbstractUser, BaseModel):
    # id = models.UUIDField
    # username
    # password
    # first_name
    # last_name
    # is_active
    # is_staff
    # is_superuser
    # last_login
    # date_joined
    email = models.EmailField('email address', unique=True)
    debug_toolbar = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        self.username = self.email
        super().save(*args, **kwargs)

    def __json__(self, *attrs):
        return {
            **self.attrs(
                'id',
                'email',
                'username',
                'first_name',
                'last_name',
                'date_joined',
                'is_active',
                'is_staff',
                'is_superuser',
                'is_authenticated',
            ),
            'str': str(self),
            **(self.attrs(*attrs) if attrs else {}),
        }
