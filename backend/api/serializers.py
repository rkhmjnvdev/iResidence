from rest_framework import serializers
from .models import Client, Apartment, Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'apartment', 'amount', 'date']

class ApartmentSerializer(serializers.ModelSerializer):
    payments = PaymentSerializer(many=True, read_only=True)
    total_paid = serializers.SerializerMethodField()
    remaining_balance = serializers.SerializerMethodField()

    class Meta:
        model = Apartment
        fields = [
            'id', 
            'client', # ВАЖНО: добавь это поле здесь!
            'block', 
            'floor', 
            'number', 
            'area', 
            'total_price', 
            'payments', 
            'total_paid', 
            'remaining_balance'
        ]

    def get_total_paid(self, obj):
        return sum(p.amount for p in obj.payments.all())

    def get_remaining_balance(self, obj):
        return obj.total_price - self.get_total_paid(obj)

class ClientSerializer(serializers.ModelSerializer):
    apartments = ApartmentSerializer(many=True, read_only=True)

    class Meta:
        model = Client
        fields = ['id', 'name', 'phone', 'apartments']