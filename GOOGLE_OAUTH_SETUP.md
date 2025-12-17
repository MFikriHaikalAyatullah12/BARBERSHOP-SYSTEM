# Setup Google OAuth untuk Email & Calendar Integration

## Langkah-langkah Setup:

### 1. Google Cloud Console Setup
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Enable Google Calendar API dan Gmail API:
   - Pergi ke "APIs & Services" > "Library"
   - Cari "Google Calendar API" dan enable
   - Cari "Gmail API" dan enable

### 2. Buat OAuth 2.0 Credentials
1. Pergi ke "APIs & Services" > "Credentials"
2. Klik "Create Credentials" > "OAuth 2.0 Client IDs"
3. Pilih Application type: "Web application"
4. Tambahkan Authorized redirect URIs:
   ```
   http://localhost:3000/admin/email-settings
   https://yourdomain.com/admin/email-settings (untuk production)
   ```
5. Simpan Client ID dan Client Secret

### 3. Update Environment Variables
Update file `.env` dengan credentials yang didapat:
```env
GOOGLE_CLIENT_ID="your-actual-client-id"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/admin/email-settings"
```

### 4. Test Setup
1. Restart aplikasi: `npm run dev`
2. Login sebagai admin
3. Pergi ke "Email Settings" di admin dashboard
4. Masukkan Gmail address dan klik "Connect Google Account"
5. Authorize aplikasi untuk mengakses Gmail dan Calendar
6. Setelah berhasil, test dengan membuat booking baru

## Features yang Available:

### ✅ Email Notifications
- Admin menerima notifikasi email instant saat ada booking baru
- Customer menerima konfirmasi booking via email
- Email berisi detail lengkap booking (nama, service, barber, waktu, harga)

### ✅ Google Calendar Integration  
- Booking otomatis ditambahkan ke Google Calendar admin
- Calendar event berisi detail customer dan booking
- Reminder otomatis 1 hari dan 30 menit sebelum appointment
- Customer email ditambahkan sebagai attendee

### ✅ Admin Dashboard
- Interface untuk connect/disconnect Google account
- Status connection dan email configuration
- Easy setup process dengan step-by-step guide

## Troubleshooting:

### Error: "Access blocked: This app's request is invalid"
- Pastikan redirect URI sudah ditambahkan di Google Console
- Check bahwa Gmail API dan Calendar API sudah di-enable

### Error: "Failed to get valid tokens"
- Verify Client ID dan Client Secret sudah benar
- Pastikan project sudah publish (keluar dari testing mode)

### Emails tidak terkirim
- Check bahwa admin email sudah di-configure
- Verify Google account sudah ter-authorize dengan scope yang benar
- Check console logs untuk error details

## Production Setup:
1. Ganti redirect URI ke domain production
2. Verify domain di Google Console
3. Publish OAuth app (keluar dari testing mode)
4. Update environment variables di hosting platform