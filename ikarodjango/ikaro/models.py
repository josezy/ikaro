from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager

from ikaro.model_utils import BaseModel


class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """
    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser, BaseModel):
    objects = CustomUserManager()

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
