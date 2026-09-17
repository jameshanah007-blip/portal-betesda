let jadwalRumahTangga = [];

document.addEventListener("DOMContentLoaded", async function () {
    await ambilJadwalRumahTangga();
    tampilkanJadwal();
});

async function ambilJadwalRumahTangga() {
    const hariIni = new Date().toISOString().split("T")[0];

    const { data, error } = await supabaseClient
        .from("jadwal_kumpulan")
        .select("*")
        .eq("kelompok", "Rumah Tangga")
        .gte("tanggal", hariIni)
        .order("tanggal", { ascending: true });

    if (error) {
        console.error("Gagal mengambil jadwal Rumah Tangga:", error);

        jadwalRumahTangga = [];
        return;
    }

    console.log("Data Rumah Tangga:", data);

    jadwalRumahTangga = data || [];
}

function tampilkanJadwal() {
    const container = document.getElementById("jadwalList");

    if (!container) {
        console.error("Elemen #jadwalList tidak ditemukan.");
        return;
    }

    container.innerHTML = "";

    if (jadwalRumahTangga.length === 0) {
        container.innerHTML = `
            <div class="kosong">
                Belum ada jadwal yang tersedia.
            </div>
        `;
        return;
    }

    jadwalRumahTangga.forEach(function (jadwal) {
        const kartu = document.createElement("div");

        kartu.className = "jadwal-card";

        kartu.innerHTML = `
            <div class="tanggal">
                📅 ${formatTanggal(jadwal.tanggal)}
            </div>

            <div class="info">
                📍 <span class="label">Tempat:</span>
                ${escapeHTML(jadwal.tempat || "-")}
            </div>

            <div class="pelayan">
                🙏 <span class="label">Pelayan Firman:</span>
                ${escapeHTML(jadwal.pelayan_firman || "-")}
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
