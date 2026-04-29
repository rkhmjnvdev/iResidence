from django.db import models

class Client(models.Model):
    name = models.CharField(max_length=255, verbose_name="ФИО покупателя")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Телефон")
    # ДОБАВИЛИ ПАСПОРТ
    passport = models.CharField(max_length=50, blank=True, null=True, verbose_name="Паспортные данные")

    def __str__(self):
        return self.name

class Apartment(models.Model):
    BLOCK_CHOICES = [('A', 'Блок A'), ('B', 'Блок B'), ('C', 'Блок C')]
    CURRENCY_CHOICES = [('USD', 'USD'), ('UZS', 'UZS')]
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='apartments')
    block = models.CharField(max_length=1, choices=BLOCK_CHOICES, verbose_name="Блок")
    floor = models.IntegerField(verbose_name="Этаж")
    number = models.CharField(max_length=10, verbose_name="№ Квартиры")
    area = models.DecimalField(max_digits=7, decimal_places=2, verbose_name="Площадь м2")
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD')
    total_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Общая цена")
    contract_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Цена по договору")
    last_payment_note = models.TextField(blank=True, null=True, verbose_name="Заметка к последнему платежу")

    def __str__(self):
        return f"Блок {self.block} - Кв {self.number} ({self.client.name})"

class Payment(models.Model):
    CURRENCY_CHOICES = [('USD', 'USD'), ('UZS', 'UZS')]
    
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Сумма оплаты")
    # ДОБАВИЛИ ВАЛЮТУ И ЗАМЕТКУ
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD', verbose_name="Валюта")
    note = models.TextField(blank=True, null=True, verbose_name="Заметка") 
    date = models.DateTimeField(auto_now_add=True) # Заменил на DateTimeField для точности

    def __str__(self):
        return f"{self.amount} {self.currency} - Кв {self.apartment.number}"