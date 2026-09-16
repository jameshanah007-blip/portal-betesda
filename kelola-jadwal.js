// ======================================================
// KELOLA JADWAL
// ======================================================

let jadwalData = [];
let idEdit = null;


// ======================================================
// SAAT HALAMAN SELESAI DIMUAT
// ======================================================

document.addEventListener("DOMContentLoaded", async function () {
    await ambilData();

    isiDropdownPelayanFirman();
    isiDropdownTempat();

    // Jika kelompok berubah, tempat ikut berubah
    document.getElementById("kelompok").addEventListener("change", function () {
        isiDropdownTempat();
    });

    // Format tanggal otomatis DD/MM/YYYY
    const inputTanggal = document.getElementById("tanggal");

    inputTanggal.addEventListener("input", function (e) {
        let value = e.target.value.replace(/\D/g, "");

        // Maksimal 8 angka: DDMMYYYY
        if (value.length > 8) {
            value = value.substring(0, 8);
        }

        if (value.length >= 5) {
            value =
                value.substring(0, 2) +
                "/" +
                value.substring(2, 4) +
                "/" +
                value.substring(4);
        } else if (value.length >= 3) {
            value =
                value.substring(0, 2) +
                "/" +
                value.substring(2);
        }

        e.target.value = value;
    });

    tampilkanJadwal();
});


// ======================================================
// AMBIL DATA DARI SUPABASE
// ======================================================

async function ambilData() {
    const { data, error } = await supabaseClient
        .from("jadwal_kumpulan")
        .select("*")
        .order("tanggal", { ascending: true });

    if (error) {
        console.error("Gagal mengambil data:", error);
        alert("Gagal mengambil data jadwal dari database.");
        return;
    }

    jadwalData = data.map(function (jadwal) {
        return {
            id: jadwal.id,
            kelompok: jadwal.kelompok,
            tanggal: jadwal.tanggal,
            tempat: jadwal.tempat,
            pelayanFirman: jadwal.pelayan_firman
        };
    });

    console.log("DATA JADWAL:", jadwalData);
}


// ======================================================
// DROPDOWN PELAYAN FIRMAN
// ======================================================

function isiDropdownPelayanFirman() {
    const select = document.getElementById("pelayanFirman");

    select.innerHTML = '<option value="">-- Pilih Pelayan Firman --</option>';

    if (
        typeof daftarPelayanFirman === "undefined" ||
        !Array.isArray(daftarPelayanFirman)
    ) {
        console.warn("daftarPelayanFirman tidak ditemukan.");
        return;
    }

    daftarPelayanFirman.forEach(function (nama) {
        const option = document.createElement("option");

        option.value = nama;
        option.textContent = nama;

        select.appendChild(option);
    });
}


// ======================================================
// DROPDOWN TEMPAT
// ======================================================

function isiDropdownTempat() {
    const kelompok = document.getElementById("kelompok").value;
    const select = document.getElementById("tempat");

    select.innerHTML = '<option value="">-- Pilih Tempat --</option>';

    if (typeof daftarTempat === "undefined") {
        console.warn("daftarTempat tidak ditemukan.");
        return;
    }

    let daftar = [];

    if (kelompok === "Rumah Tangga") {
        daftar = daftarTempat.rumahTangga || [];
    } else if (kelompok === "PKB") {
        daftar = daftarTempat.pkb || [];
    } else if (kelompok === "PW") {
        daftar = daftarTempat.pw || [];
    }

    daftar
        .slice()
        .sort(function (a, b) {
            return a.localeCompare(b, "id");
        })
        .forEach(function (tempat) {
            const option = document.createElement("option");

            option.value = tempat;
            option.textContent = tempat;

            select.appendChild(option);
        });
}


// ======================================================
// KONVERSI TANGGAL
// DD/MM/YYYY -> YYYY-MM-DD
// ======================================================

function tanggalIndonesiaKeDatabase(tanggal) {
    if (!tanggal) {
        return "";
    }

    const bagian = tanggal.split("/");

    if (bagian.length !== 3) {
        return null;
    }

    const dd = bagian[0];
    const mm = bagian[1];
    const yyyy = bagian[2];

    // Pastikan format tepat
    if (
        !/^\d{2}$/.test(dd) ||
        !/^\d{2}$/.test(mm) ||
        !/^\d{4}$/.test(yyyy)
    ) {
        return null;
    }

    const tanggalObj = new Date(
        Number(yyyy),
        Number(mm) - 1,
        Number(dd)
    );

    // Pastikan tanggal benar
    // Contoh: 31/02/2026 akan ditolak
    if (
        tanggalObj.getFullYear() !== Number(yyyy) ||
        tanggalObj.getMonth() !== Number(mm) - 1 ||
        tanggalObj.getDate() !== Number(dd)
    ) {
        return null;
    }

    return `${yyyy}-${mm}-${dd}`;
}


// ======================================================
// KONVERSI TANGGAL
// YYYY-MM-DD -> DD/MM/YYYY
// ======================================================

function tanggalDatabaseKeIndonesia(tanggal) {
    if (!tanggal) {
        return "";
    }

    const bagian = tanggal.split("-");

    if (bagian.length !== 3) {
        return tanggal;
    }

    const yyyy = bagian[0];
    const mm = bagian[1];
    const dd = bagian[2];

    return `${dd}/${mm}/${yyyy}`;
}


// ======================================================
// SIMPAN / UPDATE JADWAL
// ======================================================

async function simpanJadwal() {
    const kelompok =
        document.getElementById("kelompok").value;

    const tanggalInput =
        document.getElementById("tanggal").value.trim();

    const tempat =
        document.getElementById("tempat").value;

    const pelayanFirman =
        document.getElementById("pelayanFirman").value;


    // --------------------------------------------------
    // VALIDASI
    // --------------------------------------------------

    if (!kelompok) {
        alert("Silakan pilih kelompok.");
        return;
    }

    if (!tanggalInput) {
        alert("Silakan isi tanggal.");
        return;
    }

    if (!tempat) {
        alert("Silakan pilih tempat.");
        return;
    }

    if (!pelayanFirman) {
        alert("Silakan pilih pelayan firman.");
        return;
    }


    // --------------------------------------------------
    // KONVERSI TANGGAL
    // --------------------------------------------------

    const tanggal = tanggalIndonesiaKeDatabase(tanggalInput);

    if (!tanggal) {
        alert(
            "Tanggal tidak valid.\n\n" +
            "Gunakan format DD/MM/YYYY.\n" +
            "Contoh: 25/12/2026"
        );
        return;
    }


    // --------------------------------------------------
    // DATA YANG DIKIRIM KE SUPABASE
    // --------------------------------------------------

    const dataJadwal = {
        kelompok: kelompok,
        tanggal: tanggal,
        tempat: tempat,
        pelayan_firman: pelayanFirman
    };


    console.log("DATA YANG AKAN DISIMPAN:", dataJadwal);
    console.log("ID EDIT:", idEdit);


    // ==================================================
    // TAMBAH DATA BARU
    // ==================================================

    if (idEdit === null) {
        const { data, error } = await supabaseClient
            .from("jadwal_kumpulan")
            .insert([dataJadwal])
            .select();

        if (error) {
            console.error("Gagal menambah jadwal:", error);

            alert(
                "Gagal menyimpan jadwal.\n\n" +
                error.message
            );

            return;
        }

        console.log("HASIL INSERT:", data);

        alert("Jadwal berhasil disimpan.");
    }


    // ==================================================
    // UPDATE DATA
    // ==================================================

    else {
        console.log("ID YANG DIUPDATE:", idEdit);
        console.log("DATA BARU:", dataJadwal);

        const { data, error } = await supabaseClient
            .from("jadwal_kumpulan")
            .update(dataJadwal)
            .eq("id", idEdit)
            .select();

        if (error) {
            console.error("Gagal memperbarui jadwal:", error);

            alert(
                "Gagal memperbarui jadwal.\n\n" +
                error.message
            );

            return;
        }

        console.log("HASIL UPDATE:", data);


        // Jika tidak ada data yang dikembalikan,
        // kemungkinan terkena RLS / Policy UPDATE
        if (!data || data.length === 0) {
            alert(
                "Data tidak berhasil diperbarui.\n\n" +
                "Periksa RLS / Policy UPDATE " +
                "pada tabel jadwal_kumpulan di Supabase."
            );

            return;
        }

        alert("Jadwal berhasil diperbarui.");
    }


    // ==================================================
    // REFRESH DATA
    // ==================================================

    await ambilData();

    kosongkanForm();

    tampilkanJadwal();
}


// ======================================================
// EDIT JADWAL
// ======================================================

function editJadwal(index) {
    const jadwal = jadwalData[index];

    if (!jadwal) {
        console.error("Data jadwal tidak ditemukan:", index);
        return;
    }


    console.log("EDIT JADWAL:", jadwal);


    // --------------------------------------------------
    // SIMPAN ID DATABASE
    // --------------------------------------------------

    idEdit = jadwal.id;

    console.log("ID EDIT DISIMPAN:", idEdit);


    // --------------------------------------------------
    // Ubah judul form
    // --------------------------------------------------

    const judulForm =
        document.querySelector(".form-container h2");

    if (judulForm) {
        judulForm.textContent = "Edit Jadwal";
    }


    // --------------------------------------------------
    // Ubah tulisan tombol
    // --------------------------------------------------

    const tombolSimpan =
        document.querySelector(".btn-simpan");

    if (tombolSimpan) {
        tombolSimpan.textContent = "🔄 Perbarui Jadwal";
    }


    // --------------------------------------------------
    // Isi kelompok
    // --------------------------------------------------

    document.getElementById("kelompok").value =
        jadwal.kelompok;


    // --------------------------------------------------
    // Refresh dropdown tempat
    // --------------------------------------------------

    isiDropdownTempat();


    // --------------------------------------------------
    // Isi data form
    // --------------------------------------------------

    document.getElementById("tempat").value =
        jadwal.tempat;

    document.getElementById("pelayanFirman").value =
        jadwal.pelayanFirman;


    // --------------------------------------------------
    // Database YYYY-MM-DD
    // menjadi DD/MM/YYYY
    // --------------------------------------------------

    document.getElementById("tanggal").value =
        tanggalDatabaseKeIndonesia(jadwal.tanggal);


    // --------------------------------------------------
    // Scroll ke bagian atas form
    // --------------------------------------------------

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ======================================================
// HAPUS JADWAL
// ======================================================

async function hapusJadwal(index) {
    const jadwal = jadwalData[index];

    if (!jadwal) {
        console.error("Data jadwal tidak ditemukan:", index);
        return;
    }


    const konfirmasi = confirm(
        "Apakah Anda yakin ingin menghapus jadwal ini?\n\n" +
        "Kelompok: " + jadwal.kelompok + "\n" +
        "Tanggal: " + tanggalDatabaseKeIndonesia(jadwal.tanggal) + "\n" +
        "Tempat: " + jadwal.tempat
    );


    if (!konfirmasi) {
        return;
    }


    console.log("ID YANG AKAN DIHAPUS:", jadwal.id);


    const { data, error } = await supabaseClient
        .from("jadwal_kumpulan")
        .delete()
        .eq("id", jadwal.id)
        .select();


    if (error) {
        console.error("Gagal menghapus jadwal:", error);

        alert(
            "Gagal menghapus jadwal.\n\n" +
            error.message
        );

        return;
    }


    console.log("HASIL DELETE:", data);


    if (!data || data.length === 0) {
        alert(
            "Data tidak berhasil dihapus.\n\n" +
            "Periksa RLS / Policy DELETE " +
            "pada tabel jadwal_kumpulan di Supabase."
        );

        return;
    }


    alert("Jadwal berhasil dihapus.");


    // Jika sedang mengedit data yang dihapus
    if (idEdit === jadwal.id) {
        kosongkanForm();
    }


    await ambilData();

    tampilkanJadwal();
}


// ======================================================
// TAMPILKAN JADWAL
// ======================================================

function tampilkanJadwal() {
    const container =
        document.getElementById("jadwalList");

    container.innerHTML = "";


    if (!jadwalData || jadwalData.length === 0) {
        container.innerHTML =
            '<p class="tidak-ada-data">Belum ada jadwal.</p>';

        return;
    }


    // --------------------------------------------------
    // Kelompokkan berdasarkan kelompok
    // --------------------------------------------------

    const kelompokList = [
        "Rumah Tangga",
        "PKB",
        "PW"
    ];


    kelompokList.forEach(function (namaKelompok) {
        const dataKelompok = jadwalData
            .map(function (jadwal, index) {
                return {
                    ...jadwal,
                    indexAsli: index
                };
            })
            .filter(function (jadwal) {
                return jadwal.kelompok === namaKelompok;
            })
            .sort(function (a, b) {
                return a.tanggal.localeCompare(b.tanggal);
            });


        if (dataKelompok.length === 0) {
            return;
        }


        // ------------------------------------------------
        // Judul kelompok
        // ------------------------------------------------

        const judul =
            document.createElement("h3");

        judul.textContent = namaKelompok;

        container.appendChild(judul);


        // ------------------------------------------------
        // Tabel
        // ------------------------------------------------

        const table =
            document.createElement("table");

        table.className = "tabel-jadwal";


        table.innerHTML = `
            <thead>
                <tr>
                    <th>Tempat</th>
                    <th>Tanggal</th>
                    <th>Pelayan Firman</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;


        const tbody =
            table.querySelector("tbody");


        dataKelompok.forEach(function (jadwal) {
            const tr =
                document.createElement("tr");


            tr.innerHTML = `
                <td>${escapeHTML(jadwal.tempat)}</td>

                <td>
                    ${escapeHTML(
                        tanggalDatabaseKeIndonesia(jadwal.tanggal)
                    )}
                </td>

                <td>
                    ${escapeHTML(jadwal.pelayanFirman)}
                </td>

                <td>
                    <button
                        type="button"
                        class="btn-edit"
                        onclick="editJadwal(${jadwal.indexAsli})"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        type="button"
                        class="btn-hapus"
                        onclick="hapusJadwal(${jadwal.indexAsli})"
                    >
                        🗑️ Hapus
                    </button>
                </td>
            `;


            tbody.appendChild(tr);
        });


        container.appendChild(table);
    });
}


// ======================================================
// KOSONGKAN FORM
// ======================================================

function kosongkanForm() {
    document.getElementById("kelompok").value = "";

    document.getElementById("tanggal").value = "";

    document.getElementById("tempat").innerHTML =
        '<option value="">-- Pilih Tempat --</option>';

    document.getElementById("pelayanFirman").value = "";


    // --------------------------------------------------
    // Reset ID EDIT
    // --------------------------------------------------

    idEdit = null;


    // --------------------------------------------------
    // Kembalikan judul
    // --------------------------------------------------

    const judulForm =
        document.querySelector(".form-container h2");

    if (judulForm) {
        judulForm.textContent = "Tambah Jadwal";
    }


    // --------------------------------------------------
    // Kembalikan tombol
    // --------------------------------------------------

    const tombolSimpan =
        document.querySelector(".btn-simpan");

    if (tombolSimpan) {
        tombolSimpan.textContent = "💾 Simpan Jadwal";
    }
}


// ======================================================
// ESCAPE HTML
// Mencegah HTML/Script masuk ke tabel
// ======================================================

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
