const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sinav_merkezi.db');

const TC = '15754252988';

db.all(
  `SELECT id, ogrenci_adi_soyadi, tc_kimlik_no, typeof(tc_kimlik_no) AS tip
   FROM ogrenci_kayitlari
   WHERE REPLACE(CAST(tc_kimlik_no AS TEXT), '.0', '') = ?`,
  [TC],
  (err, rows) => {
    if (err) {
      console.error('Hata:', err);
    } else {
      console.log(rows);
    }
    db.close();
  }
);

