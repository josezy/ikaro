import uuid

from django.db import models

from .utils import get_short_uuid


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    @property
    def short_id(self):
        return get_short_uuid(self.id)

    def attrs(self, *attrs):
        """
        get a dictionary of attr:val for a list of attrs, defaults all fields
        """
        if attrs is None:
            attrs = (f.name for f in self._meta.fields)
        return {attr: getattr(self, attr) for attr in attrs}

    def __json__(self, *attrs):
        return {
            'id': self.id,
            'str': str(self),
            **self.attrs(*attrs),
        }

    def __str__(self):
        return f'{self.__class__.__name__}:{self.short_id}'

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.short_id}>'

    class Meta:
        abstract = True
