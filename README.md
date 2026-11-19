# Online Assessment — Firhan

Aplikasi Next.js untuk assessment pilihan ganda dan esai, admin panel, database Supabase, serta notifikasi email melalui Resend. Penilaian disiapkan untuk pemeriksaan manual (tidak ada skor otomatis).

## Fitur
- Admin login berbasis password dan sesi cookie httpOnly.
- CRUD bank soal pilihan ganda/esai.
- Peserta mengisi nama saja dan mengerjakan melalui link publik.
- Validasi jawaban wajib dan pilihan yang dikirim.
- Jawaban tersimpan di Supabase dan tampil di halaman hasil admin.
- Email notifikasi berisi nama dan seluruh jawaban dikirim ke `firhanstudent24@gmail.com`.
- Pengaturan judul dan deskripsi assessment.

## Menjalankan secara lokal
1. Install Node.js 20 atau lebih baru.
2. Buat project Supabase, buka SQL Editor, lalu jalankan seluruh isi `supabase/schema.sql`.
3. Salin `.env.example` menjadi `.env.local`, lalu isi kredensial Supabase.
4. Atur `ADMIN_PASSWORD` dan `ADMIN_SESSION_SECRET` (minimal 32 karakter).
5. Buat API key di Resend, isi `RESEND_API_KEY`.
6. Atur `EMAIL_FROM`. Untuk pengiriman produksi, verifikasi domain pengirim di Resend dan gunakan alamat dari domain terverifikasi. `onboarding@resend.dev` hanya untuk uji coba terbatas ke alamat yang diizinkan Resend.
7. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
8. Buka `http://localhost:3000/admin/login`, login dengan `ADMIN_PASSWORD`.
9. Tambahkan soal melalui Kelola Soal. Bagikan URL publik `http://localhost:3000` kepada peserta.

## Deploy ke Vercel
1. Push folder project ke repository GitHub.
2. Import repository di Vercel.
3. Tambahkan semua variabel dari `.env.example` ke Project Settings → Environment Variables.
4. Set `NEXT_PUBLIC_SITE_URL` ke domain produksi.
5. Deploy.

## Catatan konfigurasi email
Alamat penerima sudah diisi sesuai permintaan. Email baru benar-benar terkirim setelah `RESEND_API_KEY` valid dan `EMAIL_FROM` menggunakan sender yang diizinkan/terverifikasi di Resend. Jika email gagal, jawaban peserta tetap tersimpan di database dan dapat dibuka di Admin → Hasil Peserta. Pantau log deployment untuk error email.

## Keamanan sebelum dipakai
- Gunakan password admin panjang dan unik.
- Jangan commit `.env.local`.
- Jangan pernah mengekspos service role key.
- Untuk penggunaan publik skala besar, tambahkan CAPTCHA/rate limiting, backup database, kebijakan retensi data, dan audit keamanan.
- Aplikasi ini tidak menyediakan registrasi akun peserta; identitas yang dikumpulkan hanya nama sesuai permintaan.
