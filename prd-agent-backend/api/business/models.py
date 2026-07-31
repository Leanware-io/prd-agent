# pylint: disable=R0903
from django.db import models

from prd_agent.base_model import BaseModel


class Position(BaseModel):
    """
    A position is a role that a Leanware employee has for the project.
    """

    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return str(self.name)


class BusinessModel(BaseModel):
    """
    A business model is one of the business models that a Leanware has when consulting a client.
    """

    name = models.CharField(max_length=255)
    description = models.TextField()
    rates = models.ManyToManyField(Position, through="Rate")

    def __str__(self):
        return str(self.name)


class Rate(BaseModel):
    """
    A rate is the rate that a Leanware charges for a specific role within a business model.
    """

    position = models.ForeignKey(Position, on_delete=models.CASCADE)
    business_model = models.ForeignKey(BusinessModel, on_delete=models.CASCADE)
    rate_per_hour = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.position} - {self.business_model}: ${self.rate_per_hour}/hour"
