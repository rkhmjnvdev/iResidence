from django.contrib import admin
from .models import Client, Apartment, Payment

admin.site.register(Client)
admin.site.register(Apartment)
admin.site.register(Payment)