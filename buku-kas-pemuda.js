// ============================================
// KELOLA JADWAL
// ============================================

// ID database yang sedang diedit
let idEdit = null;

// Semua data jadwal
let jadwalData = [];

// Mencegah tombol diklik berkali-kali
let sedangMenyimpan = false;


// ============================================
// SAAT HALAMAN SELESAI DIMUAT
// ============================================

document.addEventListener("DOMContentLoaded", async () => {

    // Format otomatis tanggal DD/MM/YYYY
    const inputTanggal = document.getElementById("tanggal");

    if (inputTanggal) {
        inputTanggal.addEventListener(
            "input",
            formatInputTanggal
        );
    }

    // Saat kelompok berubah
    const kelompok = document.getElementById("kelompok");

    if (kelompok) {
        kelompok.addEventListener("change", () => {
            isiDropdownTempat();
        });
    }

    // Ambil data dari Supabase
    await ambilData();

    // Isi dropdown
    isiDropdownTempat();
    isiDropdownPelayanFirman();

    // Tampilkan data
    tampilkanJadwal();
});


// ============================================
// FORMAT INPUT TANGGAL
// DD/MM/YYYY
// ============================================

function formatInputTanggal(event) {

    let value = event.target.value;

    // Hanya angka
    value = value.replace(/\D/g, "");

    // Maksimal 8 angka
    value = value.substring(0, 8);

    // Tambahkan /
    if (value.length > 4) {

        value =
            value.substring(0, 2) +
            "/" +
            value.substring(2, 4) +
            "/" +
            value.substring(4);

    } else if (value.length > 2) {

        value =
            value.substring(0, 2) +
            "/" +
            value.substring(2);
    }

    event.target.value = value;
}


// ============================================
// AMBIL DATA DARI SUPABASE
// ============================================

async function ambilData() {

    const { data, error } = await supabaseClient
        .from("jadwal_kumpulan")
        .select("*")
        .order("tanggal", {
            ascending: true
        });

    if (error) {

        console.error(
            "Gagal mengambil data jadwal:",
            error
        );

        alert(
            "Gagal mengambil data jadwal:\n" +
            error.message
        );

        jadwalData = [];

        return;
    }

    jadwalData = (data || []).map(item => ({
        ...item,

        // Samakan nama dengan yang digunakan di HTML/JS
        pelayanFirman: item.pelayan_firman
    }));
}


// ============================================
// DROPDOWN TEMPAT
// ============================================

function isiDropdownTempat() {

    const kelompok =
        document.getElementById("kelompok").value;

    const selectTempat =
        document.getElementById("tempat");

    if (!selectTempat) return;

    const nilaiLama = selectTempat.value;

    selectTempat.innerHTML = `
        <option value="">-- Pilih Tempat --</option>
    `;

    let daftar = [];

    // Pastikan daftarTempat tersedia
    if (typeof daftarTempat !== "undefined") {

        if (kelompok === "Rumah Tangga") {

            daftar =
                daftarTempat.rumahTangga || [];

        } else if (kelompok === "PKB") {

            daftar =
                daftarTempat.pkb || [];

        } else if (kelompok === "PW") {

            daftar =
                daftarTempat.pw || [];
        }
    }

    daftar.forEach(tempat => {

        const option =
            document.createElement("option");

        option.value = tempat;
        option.textContent = tempat;

        selectTempat.appendChild(option);
    });

    // Kembalikan pilihan sebelumnya
    if (
        nilaiLama &&
        daftar.includes(nilaiLama)
    ) {
        selectTempat.value = nilaiLama;
    }
}


// ============================================
// DROPDOWN PELAYAN FIRMAN
// ============================================

function isiDropdownPelayanFirman() {

    const select =
        document.getElementById("pelayanFirman");

    if (!select) return;

    select.innerHTML = `
        <option value="">-- Pilih Pelayan Firman --</option>
    `;

    if (
        typeof daftarPelayanFirman === "undefined"
    ) {
        return;
    }

    daftarPelayanFirman.forEach(nama => {

        const option =
            document.createElement("option");

        option.value = nama;
        option.textContent = nama;

        select.appendChild(option);
    });
}


// ============================================
// KONVERSI DD/MM/YYYY
// KE YYYY-MM-DD
// ============================================

function tanggalIndonesiaKeDatabase(tanggal) {

    if (!tanggal) {
        return null;
    }

    const bagian = tanggal.split("/");

    if (bagian.length !== 3) {
        return null;
    }

    const hari = parseInt(bagian[0], 10);
    const bulan = parseInt(bagian[1], 10);
    const tahun = parseInt(bagian[2], 10);

    if (
        isNaN(hari) ||
        isNaN(bulan) ||
        isNaN(tahun)
    ) {
        return null;
    }

    // Tahun harus 4 digit
    if (bagian[2].length !== 4) {
        return null;
    }

    // Validasi tanggal sebenarnya
    const tanggalValid =
        new Date(
            tahun,
            bulan - 1,
            hari
        );

    if (
        tanggalValid.getFullYear() !== tahun ||
        tanggalValid.getMonth() !== bulan - 1 ||
        tanggalValid.getDate() !== hari
    ) {
        return null;
    }

    const hariString =
        String(hari).padStart(2, "0");

    const bulanString =
        String(bulan).padStart(2, "0");

    return `${tahun}-${bulanString}-${hariString}`;
}


// ============================================
// KONVERSI YYYY-MM-DD
// KE DD/MM/YYYY
// ============================================

function tanggalDatabaseKeIndonesia(tanggal) {

    if (!tanggal) {
        return "";
    }

    const bagian = tanggal.split("-");

    if (bagian.length !== 3) {
        return tanggal;
    }

    return (
        bagian[2] +
        "/" +
        bagian[1] +
        "/" +
        bagian[0]
    );
}


// ============================================
// SIMPAN / UPDATE JADWAL
// ============================================

async function simpanJadwal() {

    // Jangan izinkan klik berkali-kali
    if (sedangMenyimpan) {
        return;
    }

    sedangMenyimpan = true;

    const saveButton =
        document.getElementById("saveButton");

    const cancelButton =
        document.getElementById("cancelButton");

    const kelompok =
        document.getElementById("kelompok").value.trim();

    const tanggalInput =
        document.getElementById("tanggal").value.trim();

    const tempat =
        document.getElementById("tempat").value.trim();

    const pelayanFirman =
        document
            .getElementById("pelayanFirman")
            .value
            .trim();


    // ========================================
    // VALIDASI
    // ========================================

    if (!kelompok) {

        alert("Silakan pilih kelompok.");

        sedangMenyimpan = false;
        return;
    }

    if (!tanggalInput) {

        alert("Silakan masukkan tanggal.");

        sedangMenyimpan = false;
        return;
    }

    const tanggal =
        tanggalIndonesiaKeDatabase(
            tanggalInput
        );

    if (!tanggal) {

        alert(
            "Format tanggal tidak valid.\n\n" +
            "Gunakan format DD/MM/YYYY.\n" +
            "Contoh: 09/01/2026"
        );

        sedangMenyimpan = false;
        return;
    }

    if (!tempat) {

        alert("Silakan pilih tempat.");

        sedangMenyimpan = false;
        return;
    }

    if (!pelayanFirman) {

        alert(
            "Silakan pilih pelayan firman."
        );

        sedangMenyimpan = false;
        return;
    }


    // ========================================
    // DATA UNTUK DATABASE
    // ========================================

    const dataJadwal = {
        kelompok: kelompok,
        tanggal: tanggal,
        tempat: tempat,
        pelayan_firman: pelayanFirman
    };


    // ========================================
    // UBAH TOMBOL MENJADI LOADING
    // ========================================

    const sedangEdit =
        idEdit !== null;

    if (saveButton) {

        saveButton.disabled = true;

        saveButton.textContent =
            sedangEdit
                ? "🔄 Menyimpan Perubahan..."
                : "💾 Menyimpan...";
    }

    if (cancelButton) {
        cancelButton.disabled = true;
    }


    try {

        // ====================================
        // MODE EDIT
        // ====================================

        if (idEdit !== null) {

            const idYangDiedit = idEdit;

            const {
                data,
                error
            } = await supabaseClient
                .from("jadwal_kumpulan")
                .update(dataJadwal)
                .eq("id", idYangDiedit)
                .select();

            if (error) {

                console.error(
                    "Error update jadwal:",
                    error
                );

                alert(
                    "Gagal memperbarui jadwal:\n" +
                    error.message
                );

                return;
            }

            // Jika update tidak mengembalikan data,
            // kemungkinan masalah RLS / policy UPDATE
            if (!data || data.length === 0) {

                alert(
                    "Data tidak berubah.\n\n" +
                    "Kemungkinan Supabase RLS belum " +
                    "mengizinkan UPDATE pada tabel " +
                    "jadwal_kumpulan."
                );

                return;
            }

            alert(
                "Jadwal berhasil diperbarui."
            );

            // Keluar dari mode edit
            idEdit = null;

            sembunyikanTombolBatal();

        }

        // ====================================
        // MODE TAMBAH
        // ====================================

        else {

            const {
                data,
                error
            } = await supabaseClient
                .from("jadwal_kumpulan")
                .insert([dataJadwal])
                .select();

            if (error) {

                console.error(
                    "Error tambah jadwal:",
                    error
                );

                alert(
                    "Gagal menyimpan jadwal:\n" +
                    error.message
                );

                return;
            }

            if (!data || data.length === 0) {

                alert(
                    "Jadwal tidak berhasil disimpan."
                );

                return;
            }

            alert(
                "Jadwal berhasil disimpan."
            );
        }


        // ====================================
        // RESET FORM
        // ====================================

        kosongkanForm();

        // Ambil data terbaru
        await ambilData();

        // Tampilkan ulang tabel
        tampilkanJadwal();


    } catch (error) {

        console.error(
            "Terjadi kesalahan:",
            error
        );

        alert(
            "Terjadi kesalahan:\n" +
            error.message
        );

    } finally {

        sedangMenyimpan = false;

        if (saveButton) {

            saveButton.disabled = false;

            if (idEdit !== null) {

                saveButton.textContent =
                    "🔄 Simpan Perubahan";

            } else {

                saveButton.textContent =
                    "💾 Simpan Jadwal";
            }
        }

        if (cancelButton) {
            cancelButton.disabled = false;
        }
    }
}


// ============================================
// MASUK MODE EDIT
// ============================================

function editJadwal(index) {

    if (sedangMenyimpan) {
        return;
    }

    const jadwal =
        jadwalData[index];

    if (!jadwal) {

        alert(
            "Data jadwal tidak ditemukan."
        );

        return;
    }

    // Simpan ID database
    idEdit = jadwal.id;


    // ========================================
    // KELOMPOK
    // ========================================

    const selectKelompok =
        document.getElementById("kelompok");

    selectKelompok.value =
        jadwal.kelompok;


    // ========================================
    // UPDATE DROPDOWN TEMPAT
    // ========================================

    isiDropdownTempat();


    // ========================================
    // TEMPAT
    // ========================================

    document.getElementById("tempat").value =
        jadwal.tempat || "";


    // ========================================
    // PELAYAN FIRMAN
    // ========================================

    document
        .getElementById("pelayanFirman")
        .value =
        jadwal.pelayanFirman || "";


    // ========================================
    // TANGGAL
    // ========================================

    document.getElementById("tanggal").value =
        tanggalDatabaseKeIndonesia(
            jadwal.tanggal
        );


    // ========================================
    // UBAH TOMBOL
    // ========================================

    const saveButton =
        document.getElementById("saveButton");

    const cancelButton =
        document.getElementById("cancelButton");

    if (saveButton) {

        saveButton.textContent =
            "🔄 Simpan Perubahan";
    }

    if (cancelButton) {

        cancelButton.style.display =
            "inline-block";
    }


    // Scroll ke bagian form
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ============================================
// BATAL EDIT
// ============================================

function batalEdit() {

    if (sedangMenyimpan) {
        return;
    }

    idEdit = null;

    kosongkanForm();

    sembunyikanTombolBatal();
}


// ============================================
// SEMBUNYIKAN TOMBOL BATAL
// ============================================

function sembunyikanTombolBatal() {

    const saveButton =
        document.getElementById("saveButton");

    const cancelButton =
        document.getElementById("cancelButton");

    if (saveButton) {

        saveButton.textContent =
            "💾 Simpan Jadwal";
    }

    if (cancelButton) {

        cancelButton.style.display =
            "none";
    }
}


// ============================================
// HAPUS JADWAL
// ============================================

async function hapusJadwal(index) {

    if (sedangMenyimpan) {
        return;
    }

    const jadwal =
        jadwalData[index];

    if (!jadwal) {

        alert(
            "Data jadwal tidak ditemukan."
        );

        return;
    }


    const konfirmasi =
        confirm(
            "Apakah Anda yakin ingin menghapus jadwal ini?\n\n" +
            `${jadwal.tempat}\n` +
            `${tanggalDatabaseKeIndonesia(jadwal.tanggal)}`
        );

    if (!konfirmasi) {
        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("jadwal_kumpulan")
        .delete()
        .eq("id", jadwal.id)
        .select();


    if (error) {

        console.error(
            "Error hapus jadwal:",
            error
        );

        alert(
            "Gagal menghapus jadwal:\n" +
            error.message
        );

        return;
    }


    if (!data || data.length === 0) {

        alert(
            "Data tidak berhasil dihapus.\n\n" +
            "Kemungkinan Supabase RLS belum " +
            "mengizinkan DELETE."
        );

        return;
    }


    // Kalau data yang sedang diedit dihapus,
    // keluar dari mode edit
    if (idEdit === jadwal.id) {

        batalEdit();
    }


    alert(
        "Jadwal berhasil dihapus."
    );


    // Ambil data terbaru
    await ambilData();

    // Tampilkan kembali
    tampilkanJadwal();
}


// ============================================
// TAMPILKAN JADWAL
// ============================================

function tampilkanJadwal() {

    const container =
        document.getElementById("jadwalList");

    if (!container) {
        return;
    }

    container.innerHTML = "";


    const kelompokList = [
        "Rumah Tangga",
        "PKB",
        "PW"
    ];


    kelompokList.forEach(kelompok => {

        const dataKelompok =
            jadwalData.filter(
                jadwal =>
                    jadwal.kelompok === kelompok
            );


        if (dataKelompok.length === 0) {
            return;
        }


        // ====================================
        // JUDUL KELOMPOK
        // ====================================

        const title =
            document.createElement("div");

        title.className =
            "jadwal-group-title";

        title.textContent =
            kelompok;

        container.appendChild(title);


        // ====================================
        // WRAPPER TABEL
        // ====================================

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "table-wrapper";


        // ====================================
        // TABEL
        // ====================================

        const table =
            document.createElement("table");

        table.className =
            "jadwal-table";


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


        // ====================================
        // BARIS DATA
        // ====================================

        dataKelompok.forEach(jadwal => {

            const index =
                jadwalData.indexOf(jadwal);


            const tr =
                document.createElement("tr");


            tr.innerHTML = `
                <td>
                    ${escapeHTML(
                        jadwal.tempat || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        tanggalDatabaseKeIndonesia(
                            jadwal.tanggal
                        )
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        jadwal.pelayanFirman || "-"
                    )}
                </td>

                <td>
                    <button
                        type="button"
                        class="btn-edit-jadwal"
                        onclick="editJadwal(${index})"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        type="button"
                        class="btn-hapus-jadwal"
                        onclick="hapusJadwal(${index})"
                    >
                        🗑️ Hapus
                    </button>
                </td>
            `;


            tbody.appendChild(tr);
        });


        wrapper.appendChild(table);

        container.appendChild(wrapper);
    });


    // ========================================
    // TIDAK ADA DATA
    // ========================================

    if (jadwalData.length === 0) {

        container.innerHTML = `
            <div class="empty-data">
                Belum ada data jadwal.
            </div>
        `;
    }
}


// ============================================
// KOSONGKAN FORM
// ============================================

function kosongkanForm() {

    const kelompok =
        document.getElementById("kelompok");

    const tanggal =
        document.getElementById("tanggal");

    const tempat =
        document.getElementById("tempat");

    const pelayanFirman =
        document.getElementById("pelayanFirman");


    if (kelompok) {
        kelompok.value = "";
    }

    if (tanggal) {
        tanggal.value = "";
    }

    if (tempat) {

        tempat.innerHTML = `
            <option value="">
                -- Pilih Tempat --
            </option>
        `;
    }

    if (pelayanFirman) {

        pelayanFirman.value = "";
    }
}


// ============================================
// CEGAH HTML INJECTION
// ============================================

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
