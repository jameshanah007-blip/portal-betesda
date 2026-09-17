let jadwalPKB = [];


// ==========================================
// JALANKAN SETELAH HALAMAN SELESAI DIMUAT
// ==========================================
document.addEventListener("DOMContentLoaded", async function () {

    await ambilJadwalPKB();

    tampilkanJadwal();

});


// ==========================================
// MENGAMBIL DATA JADWAL PKB DARI SUPABASE
// ==========================================
async function ambilJadwalPKB() {

    // Mengambil tanggal hari ini berdasarkan
    // waktu lokal perangkat pengguna
    const sekarang = new Date();

    const hariIni =
        sekarang.getFullYear() +
        "-" +
        String(sekarang.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(sekarang.getDate()).padStart(2, "0");


    console.log("Tanggal hari ini:", hariIni);


    const { data, error } = await supabaseClient
        .from("jadwal_kumpulan")
        .select("*")
        .eq("kelompok", "PKB")
        .gte("tanggal", hariIni)
        .order("tanggal", {
            ascending: true
        });


    // Jika terjadi error
    if (error) {

        console.error(
            "Gagal mengambil jadwal PKB:",
            error
        );

        jadwalPKB = [];

        return;
    }


    // Simpan data yang diterima
    jadwalPKB = data || [];


    console.log(
        "Data PKB:",
        jadwalPKB
    );
}


// ==========================================
// MENAMPILKAN JADWAL PKB
// ==========================================
function tampilkanJadwal() {

    const container =
        document.getElementById("jadwalList");


    // Pastikan elemen tersedia
    if (!container) {

        console.error(
            "Elemen #jadwalList tidak ditemukan."
        );

        return;
    }


    // Kosongkan isi sebelumnya
    container.innerHTML = "";


    // Jika tidak ada jadwal
    if (jadwalPKB.length === 0) {

        container.innerHTML = `
            <div class="kosong">
                Belum ada jadwal yang tersedia.
            </div>
        `;

        return;
    }


    // Tampilkan setiap jadwal
    jadwalPKB.forEach(function (jadwal) {

        const kartu =
            document.createElement("div");


        kartu.className =
            "jadwal-card";


        kartu.innerHTML = `
            <div class="tanggal">
                📅 ${formatTanggal(jadwal.tanggal)}
            </div>

            <div class="info">
                📍
                <span class="label">
                    Tempat:
                </span>

                ${escapeHTML(
                    jadwal.tempat || "-"
                )}
            </div>

            <div class="pelayan">

                🙏
                <span class="label">
                    Pelayan Firman:
                </span>

                ${escapeHTML(
                    jadwal.pelayan_firman || "-"
                )}

            </div>
        `;


        container.appendChild(kartu);

    });
}


// ==========================================
// FORMAT TANGGAL INDONESIA
// ==========================================
function formatTanggal(tanggal) {

    const date =
        new Date(tanggal + "T00:00:00");


    return date.toLocaleDateString(
        "id-ID",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


// ==========================================
// MENCEGAH HTML INJECTION
// ==========================================
function escapeHTML(teks) {

    return String(teks)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
