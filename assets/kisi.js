/* Kisi-kisi TKA SMA/MA 2026 — rangkuman untuk portal TKA ICG.
   Acuan resmi: Peraturan Kepala BSKAP Nomor 045/H/AN/2025 tentang Kerangka Asesmen TKA SMA/MA/SMK/MAK
   dan laman TKA Pusmendik. Rangkuman ini disusun dari pemberitaan yang mengutip dokumen tersebut;
   jika ada perbedaan, dokumen resmi yang berlaku.
   Format elemen: [nama, lingkup materi, batasan (boleh kosong), [id aplikasi, indeks bab, ...]] */
window.KISI = {
  updated: 'Oktober 2026',
  sources: [
    ['Peraturan Kepala BSKAP Nomor 045/H/AN/2025 tentang Kerangka Asesmen TKA SMA/MA/SMK/MAK (laman TKA Pusmendik)', 'https://pusmendik.kemendikdasmen.go.id/tka/'],
    ['Brain Academy — Kisi-kisi TKA SMA sederajat per mata pelajaran', 'https://www.brainacademy.id/blog/kisi-kisi-tka-sma'],
    ['detikEdu — Kisi-kisi TKA Bahasa Inggris SMA 2026', 'https://www.detik.com/edu/detikpedia/d-8696082/kisi-kisi-tka-bahasa-inggris-sma-2026-beserta-contoh-soal/amp'],
    ['Bisnis.com — Kisi-kisi TKA mata pelajaran pilihan', 'https://kabar24.bisnis.com/read/20251104/79/1925987/kisi-kisi-soal-tka-2025-mata-pelajaran-pilihan-wajib-ipaips-untuk-smasmksederajat']
  ],
  subjects: [
    { id: 'bindo', name: 'Bahasa Indonesia', type: 'wajib', meta: 'Hari 1 · 30 soal · 75 menit',
      teks: 'Teks informasi tunggal dan jamak (termasuk tabel dan infografis) serta teks fiksi (prosa, puisi, drama). Panjang teks ±250–300 kata, kecuali puisi; rata-rata 8–12 kata per kalimat.',
      groups: [
        ['Pemahaman kontekstual', ['Mengidentifikasi penggunaan kata serapan dari bahasa daerah atau asing dalam berbagai bidang', 'Mengidentifikasi latar, karakter, dan/atau fenomena berdasarkan kosakata dalam teks fiksi atau nonfiksi', 'Menyusun kerangka atau bagan berdasarkan bagian-bagian penting teks'], ['bindo', 1]],
        ['Pemahaman inferensial', ['Menyimpulkan ide pokok, gagasan pendukung, tokoh, peristiwa, latar, konflik, atau nilai dalam teks', 'Menjelaskan hubungan makna antarkalimat dan/atau antarparagraf', 'Memprediksi lanjutan atau akhir uraian/cerita berdasarkan bagian tertentu teks'], ['bindo', 2]],
        ['Evaluasi dan apresiasi', ['Menilai relevansi peristiwa dalam teks dengan kehidupan sehari-hari', 'Menilai keakuratan, kesesuaian, kecukupan, atau ketepatan informasi', 'Menilai ketepatan dan kesesuaian penggunaan bahasa', 'Menilai ketepatan bagian teks untuk menggambarkan karakter, peristiwa, atau latar dalam teks fiksi', 'Menyimpulkan respons emosional terhadap unsur puisi, prosa, dan drama'], ['bindo', 3]]
      ] },
    { id: 'bing', name: 'Bahasa Inggris', type: 'wajib', meta: 'Hari 2 · 30 soal · 75 menit',
      teks: 'Hanya keterampilan membaca. Jenis teks: descriptive, recount, narrative, procedure, dan analytical exposition, ditambah teks fungsional pendek dan infografis. Tingkat CEFR B1 (±250–350 kata, hingga 3.000 kosakata berfrekuensi tinggi) dan A2 (±200–300 kata, hingga 2.000 kosakata).',
      groups: [
        ['Pemahaman kontekstual', ['Menemukan dan mengidentifikasi informasi', 'Mengklasifikasi orang, benda, tempat, atau peristiwa berdasarkan kategori tertentu', 'Membuat kerangka atau daftar', 'Meringkas teks', 'Mensintesis informasi dari beberapa sumber'], ['bing', 1]],
        ['Pemahaman inferensial', ['Menyimpulkan detail pendukung', 'Menyimpulkan topik, ide pokok, makna, target pembaca, tujuan penulisan, atau pesan moral', 'Menyimpulkan urutan kejadian, perbandingan, dan hubungan sebab-akibat', 'Menyimpulkan karakter tokoh', 'Memprediksi hasil cerita'], ['bing', 2]],
        ['Evaluasi dan apresiasi', ['Menilai realitas atau fantasi', 'Menilai fakta atau opini', 'Menilai kecukupan dan validitas informasi', 'Menilai kesesuaian', 'Menanggapi isi teks'], ['bing', 3]]
      ] },
    { id: 'matwajib', name: 'Matematika', type: 'wajib', meta: 'Hari 3 · 25 soal · 75 menit',
      kompetensi: 'Pengetahuan matematika, representasi matematis, penalaran dan pembuktian matematis, pemecahan masalah matematis, dan koneksi matematis.',
      elemen: [
        ['Bilangan', 'Bilangan real: jenis dan sifat bilangan, operasi, perpangkatan, bilangan bulat, dan pecahan', '', ['matwajib', 0]],
        ['Aljabar', 'Persamaan dan pertidaksamaan linear (sistem multivariabel dan program linear); fungsi linear, kuadrat, rasional, invers, dan komposisi; barisan dan deret aritmetika dan geometri, pertumbuhan dan peluruhan, bunga tunggal dan majemuk', 'Sistem persamaan/program linear maksimal tiga variabel', ['matwajib', 1]],
        ['Geometri dan Pengukuran', 'Hubungan sudut, garis, dan bidang; kesebangunan dan kekongruenan; teorema Pythagoras; transformasi geometri; keliling, luas, volume, luas permukaan, dan jarak', '', ['matwajib', 2]],
        ['Trigonometri', 'Perbandingan trigonometri: sinus, kosinus, tangen, kotangen, sekan, dan kosekan', '', ['matwajib', 3]],
        ['Data dan Peluang', 'Penyajian dan ringkasan data, kaidah pencacahan, peluang kejadian tunggal dan majemuk', '', ['matwajib', 4]]
      ] },
    { id: 'matlanjut', name: 'Matematika Tingkat Lanjut', type: 'pilihan', meta: 'Hari 4 · 25 soal · 60 menit',
      kompetensi: 'Sama dengan Matematika: pengetahuan, representasi, penalaran dan pembuktian, pemecahan masalah, dan koneksi matematis.',
      elemen: [
        ['Aljabar — Matriks', 'Determinan, invers, dan operasi matriks dengan elemen bilangan real', 'Determinan dan invers matriks berukuran 2×2 atau 3×3', ['matlanjut', 0]],
        ['Aljabar — Polinomial', 'Operasi, faktorisasi, dan teorema sisa', 'Orde polinomial maksimal 4', ['matlanjut', 1]],
        ['Aljabar — Fungsi', 'Domain, kodomain, range, dan grafik fungsi polinomial, rasional, akar, eksponen, logaritma, nilai mutlak, dan trigonometri', 'Polinomial berorde maksimal 4; basis fungsi eksponen bilangan asli', ['matlanjut', 2]],
        ['Geometri — Vektor', 'Vektor di bidang dan ruang, panjang vektor, dan operasi vektor', 'Komponen vektor maksimal tiga', ['matlanjut', 3]],
        ['Geometri — Lingkaran', 'Persamaan lingkaran, garis singgung, luas, dan keliling', '', ['matlanjut', 4]],
        ['Geometri — Transformasi', 'Translasi, refleksi, rotasi, dilatasi, dan komposisinya pada titik, garis, dan bangun datar menggunakan matriks transformasi', '', ['matlanjut', 4]],
        ['Kalkulus — Limit', 'Limit fungsi aljabar dan trigonometri', 'Diselesaikan tanpa teorema L’Hôpital', ['matlanjut', 5]]
      ] },
    { id: 'fisika', name: 'Fisika', type: 'pilihan', meta: 'Hari 4 · 25 soal · 60 menit',
      kompetensi: 'Pemahaman konsep, berpikir kritis, penerapan prinsip fisika pada masalah nyata, dan keterampilan proses sains.',
      elemen: [
        ['Kinematika', 'Posisi, kecepatan, percepatan, dan hubungan antarvariabel pada gerak lurus, gerak parabola, dan gerak melingkar beraturan', '', ['fisika', 0]],
        ['Dinamika', 'Gaya dan hukum Newton, momentum, dan impuls', '', ['fisika', 1]],
        ['Fluida', 'Tekanan, hukum Pascal, hukum Archimedes, kontinuitas, dan prinsip Bernoulli', '', ['fisika', 2]],
        ['Gelombang', 'Karakteristik gelombang mekanik dan elektromagnetik, bunyi, cahaya, dan penerapannya', '', ['fisika', 3]],
        ['Kalor dan Termodinamika', 'Pengaruh kalor terhadap suhu dan wujud zat, perpindahan kalor, gas ideal, dan hukum termodinamika', '', ['fisika', 4]],
        ['Kelistrikan', 'Listrik statis, medan dan potensial listrik, arus searah, dan rangkaian sederhana', '', ['fisika', 5]]
      ] },
    { id: 'kimia', name: 'Kimia', type: 'pilihan', meta: 'Hari 4 · 25 soal · 60 menit',
      elemen: [
        ['Kimia Dasar', 'Struktur dan model atom, sistem periodik dan sifat keperiodikan, ikatan kimia, geometri molekul, gaya antarmolekul, hukum dasar kimia, stoikiometri, dan persamaan reaksi', '', ['kimia', 0]],
        ['Kimia Analitik', 'Larutan, kesetimbangan larutan, asam-basa, pH, dan koloid', '', ['kimia', 1]],
        ['Kimia Fisik', 'Energetika dan dinamika reaksi', '', ['kimia', 2, 4]],
        ['Kimia Organik', 'Struktur dan kereaktifan senyawa karbon', '', ['kimia', 3]]
      ] },
    { id: 'biologi', name: 'Biologi', type: 'pilihan', meta: 'Hari 4 · 25 soal · 60 menit',
      elemen: [
        ['Keanekaragaman hayati', 'Klasifikasi makhluk hidup, bakteri, dan ekosistem', '', ['biologi', 0, 1, 2]],
        ['Sel', 'Metabolisme sel', '', ['biologi', 3]],
        ['Proses pada makhluk hidup', 'Sistem sirkulasi, respirasi, ekskresi, imunitas, koordinasi, dan reproduksi', '', ['biologi', 4, 5, 6, 7, 8, 9]],
        ['Keterampilan proses', 'Memprediksi, menyelidiki, serta mengolah dan menganalisis data', '', null]
      ] },
    { id: 'ekonomi', name: 'Ekonomi', type: 'pilihan', meta: 'Hari 4 · 25 soal · 60 menit',
      elemen: [
        ['Konsep dasar ilmu ekonomi', 'Kelangkaan, biaya peluang, dan kegiatan ekonomi', '', ['ekonomi', 0]],
        ['Ekonomi mikro dan makro', 'Permintaan dan penawaran, keseimbangan pasar, pendapatan nasional, pertumbuhan dan pembangunan, ketenagakerjaan, indeks harga dan inflasi, bank sentral, kebijakan moneter dan fiskal, perpajakan, BUMN, BUMD, BUMS, dan koperasi', '', ['ekonomi', 1, 2, 3, 4]],
        ['Ekonomi internasional', 'Kerja sama dan perdagangan internasional', '', ['ekonomi', 4]],
        ['Akuntansi keuangan dasar', 'Persamaan dasar akuntansi dan laporan keuangan', '', ['ekonomi', 5]]
      ] }
  ],
  others: [
    ['Sosiologi', 'Sosiologi sebagai ilmu; hubungan dan gejala sosial; penelitian sosial; kelompok sosial, kesetaraan, dan konflik sosial; perubahan sosial dan globalisasi.'],
    ['Geografi', 'Wilayah dan lingkungan; proses lingkungan fisik-sosial; interaksi fisik-manusia (posisi strategis dan potensi sumber daya Indonesia); mitigasi dan adaptasi bencana; peta, penginderaan jauh, dan SIG.'],
    ['Sejarah', 'Pengantar ilmu sejarah; kerajaan Hindu-Buddha dan Islam; perlawanan terhadap bangsa Eropa; pergerakan nasional sampai Proklamasi; revolusi sampai Demokrasi Terpimpin; Orde Baru sampai Reformasi.'],
    ['PPKn', 'Pancasila; UUD NRI Tahun 1945; Bhinneka Tunggal Ika; komitmen terhadap NKRI.'],
    ['Antropologi', 'Pengantar dan ruang lingkup; etnografi; masyarakat multikultural; perubahan sosial budaya; antropologi sosial dan budaya; kearifan lokal dan tradisi lisan.'],
    ['Bahasa Indonesia Tingkat Lanjut', 'Membaca teks 300–350 kata dengan kosakata lanjutan: pemahaman tekstual, inferensial (termasuk sastra Melayu klasik, alih wahana tabel/grafik ↔ teks, kohesi dan koherensi), serta evaluasi dan apresiasi.'],
    ['Bahasa Inggris Tingkat Lanjut', 'Membaca setara CEFR B2: teks eksposisi dan diskusi 300–400 kata (hingga 4.000 kosakata); pemahaman tekstual, inferensial, serta evaluasi kekuatan argumen.'],
    ['Bahasa asing lain', 'Bahasa Arab, Prancis, Jerman, Jepang, Korea, dan Mandarin: kemampuan membaca tingkat dasar (A1–A2) sesuai kerangka tiap bahasa.'],
    ['Produk/Projek Kreatif dan Kewirausahaan (SMK)', 'Produksi (perencanaan, pembuatan, kendali mutu, kemasan, distribusi) dan kewirausahaan (peluang usaha, manajemen, proposal, pemasaran, HAKI, laporan keuangan).']
  ]
};
