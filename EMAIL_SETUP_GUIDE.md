# 📧 Panduan Setup Email Notifications

Untuk menerima notifikasi booking di Gmail **nyonyangpripe@gmail.com**, ikuti langkah-langkah berikut:

## 1. Aktifkan 2-Factor Authentication di Google Account

1. Buka [Google Account](https://myaccount.google.com)
2. Pilih **Security** di sidebar kiri
3. Di bagian **Signing in to Google**, aktifkan **2-Step Verification**
4. Ikuti petunjuk untuk setup (biasanya dengan nomor HP)

## 2. Buat Gmail App Password

1. Setelah 2FA aktif, kembali ke halaman **Security**
2. Di bagian **Signing in to Google**, klik **App passwords**
3. Pilih **Select app** → **Other (Custom name)**
4. Ketik nama: **Barbershop Booking Notifications**
5. Klik **Generate**
6. **COPY** 16-karakter password yang muncul (contoh: `abcd efgh ijkl mnop`)

## 3. Update File .env.production

Buka file `.env.production` dan update bagian ini:

```env
# Email Configuration (Gmail SMTP)
GMAIL_USER="nyonyangpripe@gmail.com"
GMAIL_PASSWORD="abcd efgh ijkl mnop"  # Paste App Password di sini
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
EMAIL_FROM="nyonyangpripe@gmail.com"
```

## 4. Test Email Notifications

1. Deploy aplikasi atau restart server development
2. Buat booking test dari halaman booking
3. Cek inbox Gmail **nyonyangpripe@gmail.com**
4. Notifikasi booking akan masuk dalam 1-2 menit

## 5. Troubleshooting

### Jika email tidak masuk:
- Cek folder **Spam/Junk** di Gmail
- Pastikan App Password benar (16 karakter tanpa spasi)
- Pastikan 2FA sudah aktif di Google Account

### Jika ada error SMTP:
- Cek console log aplikasi untuk detail error
- Pastikan Gmail account tidak ter-suspend
- Coba generate ulang App Password

## 6. Email yang Akan Diterima

Anda akan menerima email untuk:
- ✅ **Booking Baru** - Setiap ada customer booking
- ✅ **Konfirmasi Pembayaran** - Saat customer bayar
- ✅ **Perubahan Status** - Saat booking diupdate

## Status Saat Ini

- ✅ Konfigurasi email service sudah setup
- ✅ Admin email sudah set ke **nyonyangpripe@gmail.com**
- ⏳ **Menunggu setup App Password** untuk aktivasi email nyata
- ✅ Mode development: Email notifications tampil di console log

## Catatan Penting

- **JANGAN SHARE** App Password ke siapa pun
- App Password hanya berlaku untuk aplikasi ini
- Jika lupa password, bisa generate ulang kapan saja
- Email notifications otomatis aktif setelah setup App Password

---

**Need Help?** Hubungi developer jika ada masalah setup email.