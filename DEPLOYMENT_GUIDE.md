# 🚀 Panduan Deployment Production

## ❗ PENTING: Environment Variables untuk Production

Untuk mengatasi masalah "Booking tidak ditemukan" di production, pastikan environment variables berikut sudah di-set dengan benar di platform deployment Anda (Vercel/Netlify/dll):

### 1. DATABASE_URL
```
DATABASE_URL="postgresql://neondb_owner:npg_6uFzkwdK5YVE@ep-rough-wildflower-a1l6jch2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 2. NEXTAUTH_SECRET
```
NEXTAUTH_SECRET="barbershop-production-secret-key-2025-change-this"
```

### 3. NEXTAUTH_URL (GANTI DENGAN DOMAIN ANDA)
```
NEXTAUTH_URL="https://your-domain.vercel.app"
```

## 📱 Untuk Android/Mobile Testing

1. **Pastikan URL Production Benar**: 
   - Ganti `NEXTAUTH_URL` dengan URL domain production Anda
   - Contoh: `https://barbershop-app.vercel.app`

2. **Test di Browser Mobile**:
   - Buka URL production di browser Android
   - Jangan gunakan localhost

3. **Clear Browser Cache**:
   - Hapus cache browser sebelum test
   - Gunakan mode incognito/private browsing

## 🔧 Steps Deployment

### Vercel
1. Connect GitHub repository
2. Set environment variables di Vercel dashboard
3. Deploy

### Manual Check
1. Buka URL production
2. Test booking flow
3. Verify payment page works

## 🐛 Troubleshooting

### Error "Booking tidak ditemukan"
- ✅ Check DATABASE_URL di production
- ✅ Check NEXTAUTH_URL matches domain
- ✅ Check NEXTAUTH_SECRET is set

### Error Connection Issues
- ✅ Verify Neon database allows connections
- ✅ Check firewall/network restrictions

### Mobile-specific Issues  
- ✅ Use production URL, not localhost
- ✅ Clear browser cache
- ✅ Check mobile browser compatibility