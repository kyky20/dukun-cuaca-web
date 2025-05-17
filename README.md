# dukun-cuaca-web
# Dokumentasi

## Deskripsi
Aplikasi Prediksi Cuaca Sederhana adalah aplikasi web yang menampilkan data cuaca real-time menggunakan API gratis. Aplikasi ini menampilkan informasi cuaca saat ini dan prediksi 5 hari ke depan untuk lokasi yang dipilih pengguna.

## Fitur
- Menampilkan data cuaca saat ini (suhu, kelembaban, kecepatan angin, tekanan)
- Menampilkan prediksi cuaca 5 hari ke depan
- Pencarian berdasarkan kota
- Toggle tema gelap/terang
- Responsif untuk desktop dan mobile
- Lokasi default saat aplikasi pertama kali dibuka

## Perbedaan dengan Versi Sebelumnya
- Menggunakan WeatherAPI.com (dengan API key gratis) sebagai sumber data utama
- Memiliki fallback ke MET Norway API (tanpa API key) jika sumber utama gagal
- Tidak memerlukan API key OpenWeather yang harus diaktifkan
- Lebih sederhana dan langsung berfungsi tanpa konfigurasi tambahan

## Cara Penggunaan
1. Buka file `index.html` di browser web Anda
2. Aplikasi akan menampilkan data cuaca untuk lokasi default (Jakarta)
3. Untuk mencari kota lain, masukkan nama kota di kotak pencarian dan tekan Enter atau klik ikon pencarian
4. Untuk beralih antara tema terang dan gelap, klik tombol "Mode Gelap/Terang" di pojok kanan atas

## Cara Menjalankan dengan Server Lokal
Untuk menghindari masalah CORS saat mengakses API, sebaiknya jalankan aplikasi menggunakan server lokal:

1. Buka terminal/command prompt
2. Arahkan ke direktori aplikasi
3. Jalankan salah satu perintah berikut:
   - Dengan Python: `python -m http.server`
   - Dengan Node.js: `npx serve`
4. Buka browser dan akses `http://localhost:8000` atau alamat yang ditampilkan di terminal

## Struktur File
- `index.html` - Struktur HTML aplikasi
- `style.css` - Styling CSS untuk aplikasi
- `script.js` - Kode JavaScript untuk fungsionalitas aplikasi

## API yang Digunakan
Aplikasi ini menggunakan dua sumber data cuaca:
1. WeatherAPI.com - sebagai sumber data utama (dengan API key gratis yang sudah disediakan)
2. MET Norway API - sebagai fallback jika sumber utama gagal (tanpa API key)

## Troubleshooting
Jika aplikasi menampilkan pesan error:

1. Periksa koneksi internet Anda
2. Pastikan aplikasi dijalankan melalui server lokal untuk menghindari masalah CORS
3. Coba gunakan VPN jika jaringan Anda memblokir akses ke API
4. Periksa konsol browser (F12 -> tab Console) untuk melihat pesan error spesifik
