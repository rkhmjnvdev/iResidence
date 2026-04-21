import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings') # проверь, что тут core
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
# Замени 'admin', 'admin@example.com' и 'your_password' на свои данные
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'nerkoztdm@gmail.com', '1122')
    print("Суперпользователь успешно создан!")
else:
    print("Пользователь уже существует.")