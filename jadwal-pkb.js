let jadwalPKB = [];

document.addEventListener("DOMContentLoaded", async function () {

    await ambilJadwalPKB();

    tampilkanJadwal();

});


async function ambilJadwalPKB() {

    const { data, error } =
        await supabaseClient
            .from("jadwal_kumpulan")
            .select("*")
            .eq("kelompok", "PKB")
.gte("tanggal", new Date().toISOString().split("T")[0])
.order("tanggal", {
    ascending: true
});

    if (error) {

        console.error(
            "Gagal mengambil jadwal PKB:",
            error
        );

        jadwalPKB = [];

        return;

    }

    jadwalPKB = data.map(function (jadwal) {

        return {
            id: jadwal.id,
            kelompok: jadwal.kelompok,
            tanggal: jadwal.tanggal,
            tempat: jadwal.tempat,
            pelayanFirman: jadwal.pelayan_firman
        };

    });

}

document.addEventListener("DOMContentLoaded", function () {
    tampilkanJadwal();
});

function tampilkanJadwal() {

    const container = document.getElementById("jadwalList");

    container.innerHTML = "";

    if (jadwalPKB.length === 0) {

        container.innerHTML = `
            <div class="kosong">
                Belum ada jadwal yang tersedia.
            </div>
        `;

        return;
    }

    jadwalPKB
    .filter(function (jadwal) {
        return jadwal.tanggal >= new Date().toISOString().split("T")[0];
    })
    .sort(function (a, b) {
        return new Date(a.tanggal) - new Date(b.tanggal);
    })
    .forEach(function (jadwal) {

        const kartu = document.createElement("div");

        kartu.className = "jadwal-card";

        kartu.innerHTML = `
            <div class="tanggal">
                📅 ${formatTanggal(jadwal.tanggal)}
            </div>

            <div class="info">
                📍 <span class="label">Tempat:</span>
                ${escapeHTML(jadwal.tempat)}
            </div>

            <div class="pelayan">
                🙏 <span class="label">Pelayan Firman:</span>
                ${escapeHTML(jadwal.pelayanFirman)}
            </div>
        `;

        container.appendChild(kartu);
    });
}

function formatTanggal(tanggal) {

    const date = new Date(tanggal + "T00:00:00");

    return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function escapeHTML(teks) {

    return String(teks)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}