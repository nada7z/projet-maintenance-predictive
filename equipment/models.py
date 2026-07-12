from django.db import models
from django.conf import settings
import qrcode
from io import BytesIO
from django.core.files import File

class Equipment(models.Model):
    STATUS_CHOICES = (
        ('active', 'Actif'),
        ('maintenance', 'En maintenance'),
        ('out_of_service', 'Hors service'),
    )
    CRITICALITY_CHOICES = (
        ('low', 'Basse'),
        ('medium', 'Moyenne'),
        ('high', 'Élevée'),
    )

    name = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=50, unique=True)
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    criticality = models.CharField(max_length=10, choices=CRITICALITY_CHOICES, default='medium')
    qr_code = models.ImageField(upload_to='qrcodes/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.qr_code and self.id:  # le QR a besoin de l'id pour l'URL
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(f"http://localhost:5173/equipment/{self.id}/")  # à adapter plus tard
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            self.qr_code.save(f'qr_{self.serial_number}.png', File(buffer), save=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.serial_number})"