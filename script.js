function sembunyikanSemua() {
    document.getElementById("home").style.display = "none";
    document.getElementById("jadwal").style.display = "none";
    document.getElementById("laporan").style.display = "none";
}


/* =========================
   MENU HOME
========================= */

function bukaHome() {
    sembunyikanSemua();

    document.getElementById("home").style.display = "block";
}


/* =========================
   MENU JADWAL
========================= */

function bukaJadwal() {
    sembunyikanSemua();

    document.getElementById("jadwal").style.display = "block";
}


/* =========================
   MENU LAPORAN
========================= */

function bukaLaporan() {
    sembunyikanSemua();

    document.getElementById("laporan").style.display = "block";
}


/* =========================
   LAPORAN KEUANGAN JEMAAT
========================= */

function bukaLaporanJemaat() {
    window.location.href = "laporan-jemaat.html";
}


/* =========================
   LAPORAN KEUANGAN PW
========================= */

function bukaLaporanPW() {
    window.location.href = "laporan-pw.html";
}


/* =========================
   LAPORAN KEUANGAN PKB
========================= */

function bukaLaporanPKB() {
    window.location.href = "laporan-pkb.html";
}


/* =========================
   LAPORAN KEUANGAN PEMUDA
========================= */

function bukaLaporanPemuda() {
    window.location.href = "laporan keuangan pemuda.html";
}


/* =========================
   LAPORAN KEUANGAN SEKOLAH MINGGU
========================= */

function bukaLaporanSekolahMinggu() {
    window.location.href = "laporan-sekolah-minggu.html";
}
