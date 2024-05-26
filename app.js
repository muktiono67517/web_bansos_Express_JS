// Import dependencies
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session'); // Menambahkan session

// Inisialisasi aplikasi Express
const app = express();
const multer = require('multer');
// Gunakan middleware cors
app.use(cors());


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


// Konfigurasi session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // Waktu kadaluarsa sesi dalam milidetik (misalnya 24 jam)
  }
}));


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
          req.session.loggedin = true;
          req.session.username = username;
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
  if (req.session.loggedin) {
      //  menggunakan modul SQL untuk mengambil data dari database
      db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=1', (err, rows) => {
          if (err) throw err;
          res.render('hargorejo', { data_penerima_bantuan_sosial: rows });
      });
  } 
  else {
      // Jika tidak ada sesi login, arahkan kembali ke halaman login
      res.redirect('/');
  }
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






// ***********************PDF OLAh Hargorejo************************


const allowedFilenames = {
  beritaAcara: 'berita_acara_hargorejo.pdf',
  wakilPeserta: 'wakil_peserta_hargorejo.pdf',
  daftarHadir: 'daftar_hadir_hargorejo.pdf'
};

// Konfigurasi penyimpanan file menggunakan multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/file_data_pendukung_bantuan_sosial');
  },
  filename: function (req, file, cb) {
    cb(null, allowedFilenames[file.fieldname]);
  }
});

// Inisialisasi middleware multer
const upload = multer({ storage: storage });

// Middleware untuk memeriksa keberadaan file dan nama file
function checkFileExistsAndName(req, res, next) {
  for (const field in req.files) {
    const file = req.files[field][0];
    if (file.originalname !== allowedFilenames[field]) {
      return res.status(400).json({ message: `Nama file untuk ${field} harus ${allowedFilenames[field]}.` });
    }
    const filePath = path.join('public/file_data_pendukung_bantuan_sosial', allowedFilenames[field]);
    if (fs.existsSync(filePath)) {
      // return res.status(400).json({ message: `File untuk ${field} sudah ada. Harap hapus file terlebih dahulu.` });
    }
  }
  next();
}

// Endpoint untuk menangani permintaan unggah file
// Endpoint untuk menangani permintaan unggah file
app.post('/hargorejo/hargorejouploaddatapendukungbantuansosial', upload.fields([
  { name: 'beritaAcara', maxCount: 1 },
  { name: 'wakilPeserta', maxCount: 1 },
  { name: 'daftarHadir', maxCount: 1 }
]), checkFileExistsAndName, (req, res) => {
  // Dapatkan data dari formulir atau dari file yang diunggah
  const data = {
    beritaAcara: req.files['beritaAcara'][0].filename,
    wakilPeserta: req.files['wakilPeserta'][0].filename,
    daftarHadir: req.files['daftarHadir'][0].filename
    // tambahkan data lainnya yang diperlukan dari formulir jika ada
  };

  // Simpan path file ke dalam database (menggunakan path relatif)
  const beritaAcaraPath = `/public/file_data_pendukung_bantuan_sosial/${data.beritaAcara}`;
  const wakilPesertaPath = `/public/file_data_pendukung_bantuan_sosial/${data.wakilPeserta}`;
  const daftarHadirPath = `/public/file_data_pendukung_bantuan_sosial/${data.daftarHadir}`;

  // Kueri SQL untuk menyisipkan data ke dalam tabel
  const sqlQuery = 'INSERT INTO data_pendukung_bantuan_sosial (berita_acara_musyawarah_kalurahan, daftar_mengetahui_wakil_peserta_musyawarah_kalurahan, daftar_hadir_musyawarah_kalurahan, id_wilayah_kalurahan) VALUES (?, ?, ?, 1)';

  // Eksekusi kueri SQL
  db.query(sqlQuery, [beritaAcaraPath, wakilPesertaPath, daftarHadirPath], (err, result) => {
    if (err) {
      return res.status(500).send('Gagal menyisipkan data ke dalam database');
    }
    res.status(200).send('File berhasil diunggah dan data berhasil disimpan ke dalam database');
  });
});





// Endpoint untuk mengambil data dari database atau menyajikan file PDF
app.get('/hargorejo/hargorejogetfiledatapendukungbantuansosial', (req, res) => {
  const fileName = req.query.filename;

  if (fileName) {
    // Jika ada parameter filename, sajikan file PDF
    const filePath = path.join(__dirname, 'public/file_data_pendukung_bantuan_sosial', fileName);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File tidak ditemukan:', err);
        res.status(404).send('File tidak ditemukan');
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    });
  } else {
    // Jika tidak ada parameter filename, ambil data dari database
    const sqlQuery = 'SELECT berita_acara_musyawarah_kalurahan AS beritaAcara, daftar_mengetahui_wakil_peserta_musyawarah_kalurahan AS wakilPeserta, daftar_hadir_musyawarah_kalurahan AS daftarHadir FROM data_pendukung_bantuan_sosial WHERE id_wilayah_kalurahan=1';

    db.query(sqlQuery, (err, result) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).send('Gagal mengambil data dari database');
        return;
      }
      res.status(200).json(result);
    });
  }
});



// Endpoint untuk menghapus file
app.delete('/hargorejo/hargorejodeletefiledatapendukungbantuansosial/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'public/file_data_pendukung_bantuan_sosial', filename);
  
  // Menghapus file dari penyimpanan
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Gagal menghapus file');
    }
    res.send('File berhasil dihapus');
  });
});


// Menyediakan tautan unduh untuk file PDF yang telah diunggah
app.get('/hargorejo/hargorejodownloadfiledatapendukungbantuansosial/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public/file_data_pendukung_bantuan_sosial', req.params.filename);
  res.download(filePath);
});

// ***********************PDF OLAh Hargorejo Close************************



// ******************************************************** HARGOREJO CLOSE **************************************************************







// ******************************************************** HARGOMULYO**************************************************************
// Penanganan rute untuk halaman Hargomulyo


app.get('/hargomulyo', (req, res) => {
  if (req.session.loggedin) {
      //  menggunakan modul SQL untuk mengambil data dari database
      db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=2', (err, rows) => {
          if (err) throw err;
          res.render('hargorejo', { data_penerima_bantuan_sosial: rows });
      });
  } 
  else {
      // Jika tidak ada sesi login, arahkan kembali ke halaman login
      res.redirect('/');
  }
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
  if (req.session.loggedin) {
      //  menggunakan modul SQL untuk mengambil data dari database
      db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=3', (err, rows) => {
          if (err) throw err;
          res.render('hargotirto', { data_penerima_bantuan_sosial: rows });
      });
  } 
  else {
      // Jika tidak ada sesi login, arahkan kembali ke halaman login
      res.redirect('/');
  }
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
  if (req.session.loggedin) {
      //  menggunakan modul SQL untuk mengambil data dari database
      db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=4', (err, rows) => {
          if (err) throw err;
          res.render('hargowilis', { data_penerima_bantuan_sosial: rows });
      });
  } 
  else {
      // Jika tidak ada sesi login, arahkan kembali ke halaman login
      res.redirect('/');
  }
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
  if (req.session.loggedin) {
      //  menggunakan modul SQL untuk mengambil data dari database
      db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=5', (err, rows) => {
          if (err) throw err;
          res.render('kalirejo', { data_penerima_bantuan_sosial: rows });
      });
  } 
  else {
      // Jika tidak ada sesi login, arahkan kembali ke halaman login
      res.redirect('/');
  }
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

//*************************************************************************KODE DI ATAS  ADALAH UNTUK CONTROLLER WEBSITE**************************************************************












// ********************************************************** Kode di bawah Ini Fungsinya adalah UNTUK service MOBILE********************************************


// ******************************************************** Hargorejo**************************************************************


app.get('/hargorejodatauntukmobile/hargorejodatapenerimabantuansosial', (req, res) => {
  // Menggunakan modul SQL untuk mengambil data dari database
  db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=1', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil data dari database' });
    } else {
      res.json({ data_penerima_bantuan_sosial: rows });
    }
  });
});



app.delete('//hargorejountukmobile//hargorejohapusdatapenerimabantuansosial/:nik_kepala_keluarga', (req, res) => {
  const nik_kepala_keluarga = req.params.nik_kepala_keluarga; // Ambil ID data yang akan dihapus dari parameter URL
  // Gunakan modul SQL untuk menghapus data dari database berdasarkan ID
  db.query('DELETE FROM data_penerima_bantuan_sosial WHERE nik_kepala_keluarga = ?', nik_kepala_keluarga, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal menghapus data dari database' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Data berhasil dihapus' });
      } else {
        res.status(404).json({ error: 'Data tidak ditemukan' });
      }
    }
  });
});


// ******************************************************** Hargorejo Close **************************************************************


// ******************************************************** Hargomulyo **************************************************************

app.get('/hargomulyodatauntukmobile/hargomulyodatapenerimabantuansosial', (req, res) => {
  // Menggunakan modul SQL untuk mengambil data dari database
  db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=2', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil data dari database' });
    } else {
      res.json({ data_penerima_bantuan_sosial: rows });
    }
  });
});


app.delete('/hargomulyodatauntukmobile/hargomulyohapusdatapenerimabantuansosial/:nik_kepala_keluarga', (req, res) => {
  const nik_kepala_keluarga = req.params.nik_kepala_keluarga; // Ambil ID data yang akan dihapus dari parameter URL
  // Gunakan modul SQL untuk menghapus data dari database berdasarkan ID
  db.query('DELETE FROM data_penerima_bantuan_sosial WHERE nik_kepala_keluarga = ?', nik_kepala_keluarga, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal menghapus data dari database' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Data berhasil dihapus' });
      } else {
        res.status(404).json({ error: 'Data tidak ditemukan' });
      }
    }
  });
});

// ******************************************************** Hargomulyo Close **************************************************************





// ******************************************************** Hargotirto **************************************************************

app.get('/hargotirtodatauntukmobile/hargotirtodatapenerimabantuansosial', (req, res) => {
  // Menggunakan modul SQL untuk mengambil data dari database
  db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=2', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil data dari database' });
    } else {
      res.json({ data_penerima_bantuan_sosial: rows });
    }
  });
});


app.delete('/hargotirtodatauntukmobile/hargotirtohapusdatapenerimabantuansosial/:nik_kepala_keluarga', (req, res) => {
  const nik_kepala_keluarga = req.params.nik_kepala_keluarga; // Ambil ID data yang akan dihapus dari parameter URL
  // Gunakan modul SQL untuk menghapus data dari database berdasarkan ID
  db.query('DELETE FROM data_penerima_bantuan_sosial WHERE nik_kepala_keluarga = ?', nik_kepala_keluarga, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal menghapus data dari database' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Data berhasil dihapus' });
      } else {
        res.status(404).json({ error: 'Data tidak ditemukan' });
      }
    }
  });
});


// ******************************************************** Hargotirto Close**************************************************************





// ******************************************************** Hargowilis **************************************************************

app.get('/hargowilisdatauntukmobile/hargowilisdatapenerimabantuansosial', (req, res) => {
  // Menggunakan modul SQL untuk mengambil data dari database
  db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=2', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil data dari database' });
    } else {
      res.json({ data_penerima_bantuan_sosial: rows });
    }
  });
});


app.delete('/hargowilisdatauntukmobile/hargowilishapusdatapenerimabantuansosial/:nik_kepala_keluarga', (req, res) => {
  const nik_kepala_keluarga = req.params.nik_kepala_keluarga; // Ambil ID data yang akan dihapus dari parameter URL
  // Gunakan modul SQL untuk menghapus data dari database berdasarkan ID
  db.query('DELETE FROM data_penerima_bantuan_sosial WHERE nik_kepala_keluarga = ?', nik_kepala_keluarga, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal menghapus data dari database' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Data berhasil dihapus' });
      } else {
        res.status(404).json({ error: 'Data tidak ditemukan' });
      }
    }
  });
});

// ******************************************************** Hargowilis Close **************************************************************





// ******************************************************** Kalirejo **************************************************************

app.get('/kalirejodatauntukmobile/kalirejodatapenerimabantuansosial', (req, res) => {
  // Menggunakan modul SQL untuk mengambil data dari database
  db.query('SELECT * FROM data_penerima_bantuan_sosial WHERE id_wilayah_kalurahan=2', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal mengambil data dari database' });
    } else {
      res.json({ data_penerima_bantuan_sosial: rows });
    }
  });
});


app.delete('/kalirejodatauntukmobile/kalirejohapusdatapenerimabantuansosial/:nik_kepala_keluarga', (req, res) => {
  const nik_kepala_keluarga = req.params.nik_kepala_keluarga; // Ambil ID data yang akan dihapus dari parameter URL
  // Gunakan modul SQL untuk menghapus data dari database berdasarkan ID
  db.query('DELETE FROM data_penerima_bantuan_sosial WHERE nik_kepala_keluarga = ?', nik_kepala_keluarga, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal menghapus data dari database' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: 'Data berhasil dihapus' });
      } else {
        res.status(404).json({ error: 'Data tidak ditemukan' });
      }
    }
  });
});

// ******************************************************** Kalirejo Close **************************************************************

// ******************************************************** UNTUK MOBILE SERVICE **************************************************************







// Route untuk keluar dan menghapus sesi
app.get('/logout', (req, res) => {
  // Hapus data dari sesi
  req.session.destroy(err => {
      if (err) {
          console.log(err);
      } else {
          // Redirect ke halaman login atau halaman lain setelah keluar
          res.redirect('/');
      }
  });
});





// Port yang akan digunakan
const port = 5000;

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://192.168.45.101:${port}`);
});
