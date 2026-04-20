from django.db import models

# Create your models here.
from django.db import models

class Client(models.Model):
    name = models.CharField(max_length=255, verbose_name="ФИО покупателя")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Телефон")

    def __str__(self):
        return self.name

class Apartment(models.Model):
    BLOCK_CHOICES = [('A', 'Блок A'), ('B', 'Блок B'), ('C', 'Блок C')]
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='apartments')
    block = models.CharField(max_length=1, choices=BLOCK_CHOICES, verbose_name="Блок")
    floor = models.IntegerField(verbose_name="Этаж")
    number = models.CharField(max_length=10, verbose_name="№ Квартиры")
    area = models.DecimalField(max_digits=7, decimal_places=2, verbose_name="Площадь м2")
    total_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Общая цена ($)")

    def __str__(self):
        return f"Блок {self.block} - Кв {self.number} ({self.client.name})"

class Payment(models.Model):
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Сумма оплаты ($)")
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount}$ - Кв {self.apartment.number}"