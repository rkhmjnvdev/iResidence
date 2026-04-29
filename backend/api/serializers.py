from rest_framework import serializers
from .models import Client, Apartment, Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        # Добавляем 'note' и 'currency', чтобы они сохранялись и отображались
        fields = ['id', 'apartment', 'amount', 'currency', 'note', 'date']

class ApartmentSerializer(serializers.ModelSerializer):
    payments = PaymentSerializer(many=True, read_only=True)
    total_paid = serializers.SerializerMethodField()
    remaining_balance = serializers.SerializerMethodField()
    # Добавляем поле для вывода последней заметки в карточку
    last_payment_note = serializers.SerializerMethodField()

    class Meta:
        model = Apartment
        fields = [
            'id', 
            'client', 
            'block', 
            'floor', 
            'number', 
            'area', 
            'total_price', 
            'contract_price',
            'currency', # Добавили валюту квартиры
            'payments', 
            'total_paid', 
            'remaining_balance',
            'last_payment_note'
        ]

    def get_total_paid(self, obj):
        # Суммируем все платежи
        return sum(p.amount for p in obj.payments.all())

    def get_remaining_balance(self, obj):
        return obj.total_price - self.get_total_paid(obj)

    def get_last_payment_note(self, obj):
        # Берем заметку из самого последнего платежа
        last_payment = obj.payments.all().order_by('-id').first()
        return last_payment.note if last_payment else ""

class ClientSerializer(serializers.ModelSerializer):
    apartments = ApartmentSerializer(many=True, read_only=True)

    class Meta:
        model = Client
        # Добавили 'passport', чтобы он уходил на фронтенд в модалку деталей
        fields = ['id', 'name', 'phone', 'passport', 'apartments']