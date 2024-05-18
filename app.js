// Import dependencies
const express = require('express');
const path = require('path');
const mysql = require('mysql');

// Inisialisasi aplikasi Express
const app = express();
const multer = require('multer');



var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


// Set views directory
app.set('views', path.join(__dirname, 'views'));

// Set view engine
app.set('view engine', 'ejs');


// Konek ke semua file statis di direktori 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Atau jika Anda ingin secara eksplisit menyebutkan setiap direktori:
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));





// Konek ke partials
app.use(express.static(path.join(__dirname, 'views', 'partials')));





// Konfigurasi koneksi ke database MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'data_bantuan_sosial_kapanewon_kokap'
});


//*************************************************************************KODE INI ADALAH UNTUK CONTROLLER WEBSITE**************************************************************


// Route untuk halaman login (GET)
app.get('/', (req, res) => {
  // Render halaman login
  res.render('login');
});


app.post('/login', (req, res) => {
  // Render halaman login
  const username = req.body.username;
  const password = req.body.password;
  const sql_login_check = "SELECT * FROM admin WHERE username = ? AND password = ?";
  db.query(sql_login_check, [username, password], (error, results, fields) => {
      if (error) {
          console.error('Error saat melakukan login:', error);
          res.status(500).send('Terjadi kesalahan saat melakukan login');
          return;
      }

      if (results.length > 0) {
          // Jika username dan password cocok, redirect ke halaman lain atau kirimkan respon berhasil
          res.redirect('/halamandashboard')
      } else {
          // Jika username atau password tidak cocok, kirimkan respon gagal
          res.send('<script>alert("Username atau Password salah !!!"); window.location.href = "/"; </script>');
      }
  });
});


// Route untuk halaman utama
app.get('/halamandashboard', (req, res) => {
  res.render('halaman_dashboard')
});



// ******************************************************** HARGOREJO**************************************************************
// Penanganan rute untuk halaman Hargorejo

app.get('/hargorejo', (req, res) => {
  //  menggunakan modul SQL untuk mengambil data dari database
  db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=1', (err, rows) => {
    if (err) throw err;
    res.render('hargorejo', { data_penerima_bantuan_sosial: rows });
  });
});

// Menangani permintaan POST dari formulir tambah data
app.post('/hargorejo/tambahdatapenerimabantuansosialhargorejo', (req, res) => {
  console.log(req.body); // Tambahkan ini untuk memeriksa data yang diterima

  const { nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data  } = req.body;

  const query_tambah_data = 'INSERT INTO data_penerima_bantuan_sosial (nik_kepala_keluarga, nama, jumlah_anggota_keluarga, alamat, rt, rw, kategori, id_wilayah_kalurahan) VALUES (?, ?, ?, ?, ?, ?, ?, 1)';
  const values_tambah_data = [nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data ];

  console.log(values_tambah_data); // Cek apakah values_tambah_data berisi data yang diharapkan

  db.query(query_tambah_data, values_tambah_data, (err, result) => {
    if (err) {
      console.error('Error saat menyimpan data:', err);
      res.status(500).send('Terjadi kesalahan saat menyimpan data');
      return;
    }
    console.log('Data berhasil disimpan');
    res.redirect('/hargorejo')
  });
});


// Menangani permintaan Update dari formulir tambah data
app.post('/hargorejo/updatedatapenerimabantuansosialhargorejo', (req, res) => {
  console.log(req.body); // Tambahkan ini untuk memeriksa data yang diterima

  const { nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data  } = req.body;

  const query_update_data = 'UPDATE data_penerima_bantuan_sosial SET  nama = ?, jumlah_anggota_keluarga = ?, alamat = ?, rt = ?, rw = ?, kategori = ? WHERE  nik_kepala_keluarga = ?';
  const values_update_data = [ nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data, nik_modal];

  console.log(values_update_data); // Cek apakah values_update_data berisi data yang diharapkan

  db.query(query_update_data, values_update_data, (err, result) => {
    if (err) {
      console.error('Error saat memperbarui data:', err);
      res.status(500).send('Terjadi kesalahan saat memperbarui data');
      return;
    }
    console.log('Data berhasil diperbarui');
    res.send('Data berhasil diperbarui');
  });
});






app.delete('/hargorejo/hapusdatapenerimabantuansosialhargorejo/:nik_modal', (req, res) => {
  const nik_modal = req.params.nik_modal;
  const query = 'DELETE FROM data_penerima_bantuan_sosial WHERE nik_kepala_keluarga = ?';
  const values = [nik_modal];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error saat menghapus data:', err);
      res.status(500).send('Terjadi kesalahan saat menghapus data');
      return;
    }
    console.log('Data berhasil dihapus');
    res.send('Data berhasil dihapus');
  });
});





// ***********************PDF UPLOAD Hargorejo************************


// Konfigurasi penyimpanan file menggunakan multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan lokasi penyimpanan file
    cb(null, 'public/file_data_pendukung_bantuan_sosial');
  },
  filename: function (req, file, cb) {
    // Tetapkan nama file yang akan disimpan
    cb(null, file.originalname);
  }
});

// Inisialisasi middleware multer
const upload = multer({ storage: storage });

// Endpoint untuk menangani permintaan unggah file
app.post('/hargorejo/hargorejouploaddatapendukungbantuansosial', upload.fields([
  { name: 'beritaAcara', maxCount: 1 }, // Untuk file berita acara
  { name: 'wakilPeserta', maxCount: 1 }, // Untuk file daftar wakil/peserta
  { name: 'daftarHadir', maxCount: 1 } // Untuk file daftar hadir
]), (req, res) => {
  // File berhasil diunggah, lakukan tindakan selanjutnya
  res.send('File berhasil diunggah.');
});



// ******************************************************** HARGOREJO CLOSE **************************************************************






// ******************************************************** HARGOMULYO**************************************************************
// Penanganan rute untuk halaman Hargomulyo


app.get('/hargomulyo', (req, res) => {
  //  menggunakan modul SQL untuk mengambil data dari database
  db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=2', (err, rows) => {
    if (err) throw err;
    res.render('hargomulyo', { data_penerima_bantuan_sosial: rows });
  });
});



// Menangani permintaan POST dari formulir tambah data
app.post('/hargomulyo/tambahdatapenerimabantuansosialhargomulyo', (req, res) => {
  console.log(req.body); // Tambahkan ini untuk memeriksa data yang diterima

  const { nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data  } = req.body;

  // Pertama, periksa apakah nik yang sama sudah ada dalam database
  const query_check_nik = 'SELECT COUNT(*) AS count FROM data_penerima_bantuan_sosial WHERE nik_kepala_keluarga = ?';
  const values_check_nik = [nik_modal];

  db.query(query_check_nik, values_check_nik, (err, result) => {
    if (err) {
      console.error('Error saat memeriksa data:', err);
      res.status(500).send('Terjadi kesalahan saat memeriksa data');
      return;
    }

    const count = result[0].count;
    if (count > 0) {
      // Jika nik sudah ada, kirim pesan kesalahan
      res.send('<script> alert("NIK sudah ada di database") </script>');
      return;
    }
    // Jika nik belum ada, tambahkan data baru
    const query_tambah_data = 'INSERT INTO data_penerima_bantuan_sosial (nik_kepala_keluarga, nama, jumlah_anggota_keluarga, alamat, rt, rw, kategori, id_wilayah_kalurahan) VALUES (?, ?, ?, ?, ?, ?, ?, 2)';
    const values_tambah_data = [nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data ];

    console.log(values_tambah_data); // Cek apakah values_tambah_data berisi data yang diharapkan

    db.query(query_tambah_data, values_tambah_data, (err, result) => {
      if (err) {
        console.error('Error saat menyimpan data:', err);
        res.status(500).send('Terjadi kesalahan saat menyimpan data');
        return;
      }
      console.log('Data berhasil disimpan');
      res.redirect('/hargomulyo')
    });
  });
});


// Menangani permintaan Update dari formulir tambah data
app.post('/hargomulyo/updatedatapenerimabantuansosialhargomulyo', (req, res) => {
  console.log(req.body); // Tambahkan ini untuk memeriksa data yang diterima

  const { nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data  } = req.body;

  const query_update_data = 'UPDATE data_penerima_bantuan_sosial SET  nama = ?, jumlah_anggota_keluarga = ?, alamat = ?, rt = ?, rw = ?, kategori = ? WHERE  nik_kepala_keluarga = ?';
  const values_update_data = [ nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data, nik_modal];

  console.log(values_update_data); // Cek apakah values_update_data berisi data yang diharapkan

  db.query(query_update_data, values_update_data, (err, result) => {
    if (err) {
      console.error('Error saat memperbarui data:', err);
      res.status(500).send('Terjadi kesalahan saat memperbarui data');
      return;
    }
    console.log('Data berhasil diperbarui');
    res.send('Data berhasil diperbarui');
  });
});







app.delete('/hargomulyo/hapusdatapenerimabantuansosialhargomulyo/:nik_modal', (req, res) => {
  const nik_modal = req.params.nik_modal;
  const query = 'DELETE FROM data_penerima_bantuan_sosial WHERE nik_kepala_keluarga = ?';
  const values = [nik_modal];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error saat menghapus data:', err);
      res.status(500).send('Terjadi kesalahan saat menghapus data');
      return;
    }
    console.log('Data berhasil dihapus');
    res.send('Data berhasil dihapus');
  });
});

// ******************************************************** HARGOMULYO CLOSE **************************************************************







// ******************************************************** HARGOTIRTO**************************************************************
// Penanganan rute untuk halaman Hargotirto

app.get('/hargotirto', (req, res) => {
  //  menggunakan modul SQL untuk mengambil data dari database
  db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=3', (err, rows) => {
    if (err) throw err;
    res.render('hargotirto', { data_penerima_bantuan_sosial: rows });
  });
});

// Menangani permintaan POST dari formulir tambah data
app.post('/hargotirto/tambahdatapenerimabantuansosialhargotirto', (req, res) => {
  console.log(req.body); // Tambahkan ini untuk memeriksa data yang diterima

  const { nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data  } = req.body;

  const query_tambah_data = 'INSERT INTO data_penerima_bantuan_sosial (nik_kepala_keluarga, nama, jumlah_anggota_keluarga, alamat, rt, rw, kategori, id_wilayah_kalurahan) VALUES (?, ?, ?, ?, ?, ?, ?, 3)';
  const values_tambah_data = [nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data ];

  console.log(values_tambah_data); // Cek apakah values_tambah_data berisi data yang diharapkan

  db.query(query_tambah_data, values_tambah_data, (err, result) => {
    if (err) {
      console.error('Error saat menyimpan data:', err);
      res.status(500).send('Terjadi kesalahan saat menyimpan data');
      return;
    }
    console.log('Data berhasil disimpan');
    res.redirect('/hargotirto')
  });
});



// Menangani permintaan Update dari formulir tambah data
app.post('/hargotirto/updatedatapenerimabantuansosialhargotirto', (req, res) => {
  console.log(req.body); // Tambahkan ini untuk memeriksa data yang diterima

  const { nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data  } = req.body;

  const query_update_data = 'UPDATE data_penerima_bantuan_sosial SET  nama = ?, jumlah_anggota_keluarga = ?, alamat = ?, rt = ?, rw = ?, kategori = ? WHERE  nik_kepala_keluarga = ?';
  const values_update_data = [ nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data, nik_modal];

  console.log(values_update_data); // Cek apakah values_update_data berisi data yang diharapkan

  db.query(query_update_data, values_update_data, (err, result) => {
    if (err) {
      console.error('Error saat memperbarui data:', err);
      res.status(500).send('Terjadi kesalahan saat memperbarui data');
      return;
    }
    console.log('Data berhasil diperbarui');
    res.send('Data berhasil diperbarui');
  });
});




app.delete('/hargotirto/hapusdatapenerimabantuansosialhargotirto/:nik_modal', (req, res) => {
  const nik_modal = req.params.nik_modal;
  const query = 'DELETE FROM data_penerima_bantuan_sosial WHERE nik_kepala_keluarga = ?';
  const values = [nik_modal];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error saat menghapus data:', err);
      res.status(500).send('Terjadi kesalahan saat menghapus data');
      return;
    }
    console.log('Data berhasil dihapus');
    res.send('Data berhasil dihapus');
  });
});
// ******************************************************** HARGOTIRTO CLOSE **************************************************************









// ******************************************************** HARGOWILIS**************************************************************
// Penanganan rute untuk halaman Hargowilis
app.get('/hargowilis', (req, res) => {
  //  menggunakan modul SQL untuk mengambil data dari database
  db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=4', (err, rows) => {
    if (err) throw err;
    res.render('hargowilis', { data_penerima_bantuan_sosial: rows });
  });
});



// Menangani permintaan POST dari formulir tambah data
app.post('/hargowilis/tambahdatapenerimabantuansosialhargowilis', (req, res) => {
  console.log(req.body); // Tambahkan ini untuk memeriksa data yang diterima

  const { nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data } = req.body;

  const query_tambah_data = 'INSERT INTO data_penerima_bantuan_sosial (nik_kepala_keluarga, nama, jumlah_anggota_keluarga, alamat, rt, rw, kategori, id_wilayah_kalurahan) VALUES (?, ?, ?, ?, ?, ?, ?, 4)';
  const values_tambah_data = [nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data];

  console.log(values_tambah_data); // Cek apakah values_tambah_data berisi data yang diharapkan

  db.query(query_tambah_data, values_tambah_data, (err, result) => {
    if (err) {
      console.error('Error saat menyimpan data:', err);
      res.status(500).send('Terjadi kesalahan saat menyimpan data');
      return;
    }
    console.log('Data berhasil disimpan');
    res.redirect('/hargowilis');
  });
});


// Menangani permintaan Update dari formulir tambah data
app.post('/hargowilis/updatedatapenerimabantuansosialhargowilis', (req, res) => {
  console.log(req.body); // Tambahkan ini untuk memeriksa data yang diterima

  const { nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data  } = req.body;

  const query_update_data = 'UPDATE data_penerima_bantuan_sosial SET  nama = ?, jumlah_anggota_keluarga = ?, alamat = ?, rt = ?, rw = ?, kategori = ? WHERE  nik_kepala_keluarga = ?';
  const values_update_data = [ nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data, nik_modal];

  console.log(values_update_data); // Cek apakah values_update_data berisi data yang diharapkan

  db.query(query_update_data, values_update_data, (err, result) => {
    if (err) {
      console.error('Error saat memperbarui data:', err);
      res.status(500).send('Terjadi kesalahan saat memperbarui data');
      return;
    }
    console.log('Data berhasil diperbarui');
    res.send('Data berhasil diperbarui');
  });
});






app.delete('/hargowilis/hapusdatapenerimabantuansosialhargowilis/:nik_modal', (req, res) => {
  const nik_modal = req.params.nik_modal;
  const query = 'DELETE FROM data_penerima_bantuan_sosial WHERE nik_kepala_keluarga = ?';
  const values = [nik_modal];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error saat menghapus data:', err);
      res.status(500).send('Terjadi kesalahan saat menghapus data');
      return;
    }
    console.log('Data berhasil dihapus');
    res.send('Data berhasil dihapus');
  });
});

// ******************************************************** HARGOWILIS CLOSE **************************************************************













// ******************************************************** KALIREJO**************************************************************

// Penanganan rute untuk halaman Kalirejo
app.get('/kalirejo', (req, res) => {
  //  menggunakan modul SQL untuk mengambil data dari database
  db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=5', (err, rows) => {
    if (err) throw err;
    res.render('kalirejo', { data_penerima_bantuan_sosial: rows });
  });
});

// Menangani permintaan POST dari formulir tambah data
app.post('/kalirejo/tambahdatapenerimabantuansosialkalirejo', (req, res) => {
  console.log(req.body); // Tambahkan ini untuk memeriksa data yang diterima

  const { nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data  } = req.body;

  const query_tambah_data = 'INSERT INTO data_penerima_bantuan_sosial (nik_kepala_keluarga, nama, jumlah_anggota_keluarga, alamat, rt, rw, kategori, id_wilayah_kalurahan) VALUES (?, ?, ?, ?, ?, ?, ?, 5)';
  const values_tambah_data = [nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data ];

  console.log(values_tambah_data); // Cek apakah values_tambah_data berisi data yang diharapkan

  db.query(query_tambah_data, values_tambah_data, (err, result) => {
    if (err) {
      console.error('Error saat menyimpan data:', err);
      res.status(500).send('Terjadi kesalahan saat menyimpan data');
      return;
    }
    console.log('Data berhasil disimpan');
    res.redirect('/kalirejo')
  });
});


// Menangani permintaan Update dari formulir tambah data
app.post('/kalirejo/updatedatapenerimabantuansosialkalirejo', (req, res) => {
  console.log(req.body); // Tambahkan ini untuk memeriksa data yang diterima

  const { nik_modal, nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data  } = req.body;

  const query_update_data = 'UPDATE data_penerima_bantuan_sosial SET  nama = ?, jumlah_anggota_keluarga = ?, alamat = ?, rt = ?, rw = ?, kategori = ? WHERE  nik_kepala_keluarga = ?';
  const values_update_data = [ nama_modal, jumlah_anggota_keluarga_modal, alamat_modal, rt_modal, rw_modal, kategori_modal_tambah_data, nik_modal];

  console.log(values_update_data); // Cek apakah values_update_data berisi data yang diharapkan

  db.query(query_update_data, values_update_data, (err, result) => {
    if (err) {
      console.error('Error saat memperbarui data:', err);
      res.status(500).send('Terjadi kesalahan saat memperbarui data');
      return;
    }
    console.log('Data berhasil diperbarui');
    res.send('Data berhasil diperbarui');
  });
});





app.delete('/kalirejo/hapusdatapenerimabantuansosialkalirejo/:nik_modal', (req, res) => {
  const nik_modal = req.params.nik_modal;
  const query = 'DELETE FROM data_penerima_bantuan_sosial WHERE nik_kepala_keluarga = ?';
  const values = [nik_modal];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error saat menghapus data:', err);
      res.status(500).send('Terjadi kesalahan saat menghapus data');
      return;
    }
    console.log('Data berhasil dihapus');
    res.send('Data berhasil dihapus');
  });
});

// ******************************************************** KALIREJO CLOSE**************************************************************

//*************************************************************************KODE INI ADALAH UNTUK CONTROLLER WEBSITE**************************************************************







// Port yang akan digunakan
const port = 5000;

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
