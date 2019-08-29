from django.db import models
from django.contrib.postgres.fields import JSONField

from ikaro.model_utils import BaseModel
from ikaro.utils import ExtendedEncoder


class MavlinkMessage(BaseModel):
    # id = models.UUIDField
    # created = models.DateTimeField
    # modified = models.DateTimeField

    mavtype = models.CharField(max_length=64, db_index=True)
    params = JSONField(encoder=ExtendedEncoder, default=dict)
