// ============================================
// KELOLA JADWAL
// ============================================

let idEdit = null;
let jadwalData = [];
let sedangMenyimpan = false;


// ============================================
// SAAT HALAMAN SELESAI DIMUAT
// ============================================

document.addEventListener("DOMContentLoaded", async () => {

    const kelompok = document.getElementById("kelompok");

    if (kelompok) {
        kelompok.addEventListener("change", () => {
            isiDropdownTempat();
        });
    }

    isiDropdownTempat();
    isiDropdownPelayanFirman();

    await muatData();
});


// ============================================
// AMBIL DATA JADWAL DARI SUPABASE
// ============================================

async function ambilJadwal() {

    const { data, error } = await supabaseClient
        .from("jadwal_kumpulan")
        .select("*")
        .order("tanggal", { ascending: true })
        .order("id", { ascending: true });

    if (error) {

        console.error(
            "Gagal mengambil data jadwal:",
            error
        );

        alert(
            "Gagal mengambil data jadwal:\n\n" +
            error.message
        );

        jadwalData = [];

        return;
    }

    jadwalData = (data || []).map(item => ({
        ...item,

        // Sesuaikan nama kolom database
        pelayanFirman: item.pelayan_firman
    }));

    console.log(
        "Data jadwal berhasil dimuat:",
        jadwalData
    );
}


// ============================================
// MUAT ULANG DATA
// ============================================

async function muatData() {

    await ambilJadwal();

    tampilkanJadwal();
}


// ============================================
// ISI DROPDOWN TEMPAT
// ============================================

function isiDropdownTempat() {

    const kelompok =
        document.getElementById("kelompok");

    const selectTempat =
        document.getElementById("tempat");

    if (!kelompok || !selectTempat) {
        return;
    }

    const nilaiLama =
        selectTempat.value;

    selectTempat.innerHTML = `
        <option value="">
            -- Pilih Tempat --
        </option>
    `;

    let daftar = [];

    if (typeof daftarTempat !== "undefined") {

        if (kelompok.value === "Rumah Tangga") {

            daftar =
                daftarTempat.rumahTangga || [];

        } else if (kelompok.value === "PKB") {

            daftar =
                daftarTempat.pkb || [];

        } else if (kelompok.value === "PW") {

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

    // Kembalikan nilai sebelumnya
    if (
        nilaiLama &&
        daftar.includes(nilaiLama)
    ) {
        selectTempat.value = nilaiLama;
    }
}


// ============================================
// ISI DROPDOWN PELAYAN FIRMAN
// ============================================

function isiDropdownPelayanFirman() {

    const select =
        document.getElementById(
            "pelayanFirman"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            -- Pilih Pelayan Firman --
        </option>
    `;

    if (
        typeof daftarPelayanFirman ===
        "undefined"
    ) {

        console.warn(
            "daftarPelayanFirman tidak ditemukan."
        );

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
// SIMPAN / UPDATE JADWAL
// ============================================

async function simpanJadwal(event) {

    if (event) {
        event.preventDefault();
    }

    // Mencegah klik dua kali
    if (sedangMenyimpan) {
        return;
    }

    sedangMenyimpan = true;

    const saveButton =
        document.getElementById("saveButton");

    const cancelButton =
        document.getElementById("cancelButton");

    const kelompokElement =
        document.getElementById("kelompok");

    const tanggalElement =
        document.getElementById("tanggal");

    const tempatElement =
        document.getElementById("tempat");

    const pelayanElement =
        document.getElementById(
            "pelayanFirman"
        );


    // ========================================
    // CEK FORM
    // ========================================

    if (
        !kelompokElement ||
        !tanggalElement ||
        !tempatElement ||
        !pelayanElement
    ) {

        alert(
            "Form jadwal tidak ditemukan."
        );

        sedangMenyimpan = false;

        return;
    }


    // ========================================
    // AMBIL NILAI FORM
    // ========================================

    const kelompok =
        kelompokElement.value.trim();

    const tanggal =
        tanggalElement.value;

    const tempat =
        tempatElement.value.trim();

    const pelayanFirman =
        pelayanElement.value.trim();


    // ========================================
    // VALIDASI
    // ========================================

    if (!kelompok) {

        alert(
            "Silakan pilih kelompok."
        );

        sedangMenyimpan = false;

        return;
    }

    if (!tanggal) {

        alert(
            "Silakan pilih tanggal."
        );

        sedangMenyimpan = false;

        return;
    }

    if (!tempat) {

        alert(
            "Silakan pilih tempat."
        );

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
    // DATA YANG AKAN DISIMPAN
    // ========================================

    const dataJadwal = {

        kelompok: kelompok,

        tanggal: tanggal,

        tempat: tempat,

        pelayan_firman: pelayanFirman
    };


    // ========================================
    // CEK MODE
    // ========================================

    const sedangEdit =
        idEdit !== null;


    // ========================================
    // NONAKTIFKAN TOMBOL
    // ========================================

    if (saveButton) {

        saveButton.disabled = true;

        saveButton.textContent =
            sedangEdit
                ? "Menyimpan Perubahan..."
                : "Menyimpan...";
    }

    if (cancelButton) {

        cancelButton.disabled = true;
    }


    // ========================================
    // PROSES DATABASE
    // ========================================

    try {

        // ====================================
        // MODE EDIT
        // ====================================

        if (sedangEdit) {

            const idYangDiedit =
                idEdit;


            console.log(
                "================================"
            );

            console.log(
                "MULAI UPDATE JADWAL"
            );

            console.log(
                "ID:",
                idYangDiedit
            );

            console.log(
                "DATA BARU:",
                dataJadwal
            );


            // --------------------------------
            // UPDATE DATABASE
            // --------------------------------

            const {
                error: updateError
            } = await supabaseClient

                .from("jadwal_kumpulan")

                .update(dataJadwal)

                .eq(
                    "id",
                    idYangDiedit
                );


            console.log(
                "UPDATE ERROR:",
                updateError
            );


            // --------------------------------
            // JIKA UPDATE GAGAL
            // --------------------------------

            if (updateError) {

                console.error(
                    "UPDATE GAGAL:",
                    updateError
                );

                alert(
                    "Gagal menyimpan perubahan:\n\n" +
                    updateError.message
                );

                return;
            }


            // --------------------------------
            // UPDATE BERHASIL
            // --------------------------------

            console.log(
                "UPDATE BERHASIL DIKIRIM KE DATABASE."
            );


            // --------------------------------
            // KELUAR DARI MODE EDIT
            // --------------------------------

            idEdit = null;

            sembunyikanTombolBatal();

            kosongkanForm();


            // --------------------------------
            // AMBIL DATA TERBARU
            // --------------------------------

            await muatData();


            console.log(
                "DATA BERHASIL DIMUAT ULANG."
            );


            // --------------------------------
            // PESAN BERHASIL
            // --------------------------------

            alert(
                "Jadwal berhasil diperbarui."
            );


            return;
        }


        // ====================================
        // MODE TAMBAH DATA BARU
        // ====================================

        console.log(
            "================================"
        );

        console.log(
            "MENAMBAHKAN JADWAL BARU"
        );

        console.log(
            "DATA:",
            dataJadwal
        );


        // --------------------------------
        // INSERT DATABASE
        // --------------------------------

        const {
            error: insertError
        } = await supabaseClient

            .from("jadwal_kumpulan")

            .insert(dataJadwal);


        console.log(
            "INSERT ERROR:",
            insertError
        );


        // --------------------------------
        // JIKA INSERT GAGAL
        // --------------------------------

        if (insertError) {

            console.error(
                "INSERT GAGAL:",
                insertError
            );

            alert(
                "Gagal menyimpan jadwal:\n\n" +
                insertError.message
            );

            return;
        }


        // --------------------------------
        // INSERT BERHASIL
        // --------------------------------

        console.log(
            "JADWAL BERHASIL DISIMPAN."
        );


        // --------------------------------
        // BERSIHKAN FORM
        // --------------------------------

        kosongkanForm();


        // --------------------------------
        // MUAT DATA TERBARU
        // --------------------------------

        await muatData();


        // --------------------------------
        // PESAN BERHASIL
        // --------------------------------

        alert(
            "Jadwal berhasil disimpan."
        );


    } catch (error) {

        console.error(
            "TERJADI KESALAHAN:",
            error
        );

        alert(
            "Terjadi kesalahan:\n\n" +
            error.message
        );


    } finally {

        sedangMenyimpan = false;


        // --------------------------------
        // AKTIFKAN KEMBALI TOMBOL SIMPAN
        // --------------------------------

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                idEdit !== null
                    ? "Simpan Perubahan"
                    : "Simpan Jadwal";
        }


        // --------------------------------
        // AKTIFKAN KEMBALI BATAL
        // --------------------------------

        if (cancelButton) {

            cancelButton.disabled = false;
        }
    }
}


// ============================================
// EDIT JADWAL
// ============================================

function editJadwal(id) {

    if (sedangMenyimpan) {
        return;
    }


    console.log(
        "Memulai edit ID:",
        id
    );


    const jadwal =
        jadwalData.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!jadwal) {

        console.error(
            "Jadwal tidak ditemukan untuk ID:",
            id
        );

        alert(
            "Data jadwal tidak ditemukan."
        );

        return;
    }


    // ========================================
    // SIMPAN ID YANG SEDANG DIEDIT
    // ========================================

    idEdit =
        Number(jadwal.id);


    console.log(
        "ID EDIT DISIMPAN:",
        idEdit
    );


    // ========================================
    // ISI KELOMPOK
    // ========================================

    const kelompok =
        document.getElementById(
            "kelompok"
        );

    if (kelompok) {

        kelompok.value =
            jadwal.kelompok || "";
    }


    // ========================================
    // UPDATE DROPDOWN TEMPAT
    // ========================================

    isiDropdownTempat();


    // ========================================
    // ISI TEMPAT
    // ========================================

    const tempat =
        document.getElementById(
            "tempat"
        );

    if (tempat) {

        tempat.value =
            jadwal.tempat || "";
    }


    // ========================================
    // ISI PELAYAN FIRMAN
    // ========================================

    const pelayanFirman =
        document.getElementById(
            "pelayanFirman"
        );

    if (pelayanFirman) {

        pelayanFirman.value =
            jadwal.pelayanFirman || "";
    }


    // ========================================
    // ISI TANGGAL
    // ========================================

    const tanggal =
        document.getElementById(
            "tanggal"
        );

    if (tanggal) {

        tanggal.value =
            jadwal.tanggal || "";
    }


    // ========================================
    // UBAH TOMBOL
    // ========================================

    const saveButton =
        document.getElementById(
            "saveButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelButton"
        );

    const editMode =
        document.getElementById(
            "editMode"
        );


    if (saveButton) {

        saveButton.textContent =
            "Simpan Perubahan";
    }


    if (cancelButton) {

        cancelButton.style.display =
            "inline-block";
    }


    if (editMode) {

        editMode.classList.add(
            "active"
        );
    }


    // ========================================
    // SCROLL KE FORM
    // ========================================

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


    console.log(
        "Edit dibatalkan."
    );


    idEdit = null;

    kosongkanForm();

    sembunyikanTombolBatal();
}


// ============================================
// SEMBUNYIKAN TOMBOL BATAL
// ============================================

function sembunyikanTombolBatal() {

    const saveButton =
        document.getElementById(
            "saveButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelButton"
        );

    const editMode =
        document.getElementById(
            "editMode"
        );


    if (saveButton) {

        saveButton.textContent =
            "Simpan Jadwal";
    }


    if (cancelButton) {

        cancelButton.style.display =
            "none";
    }


    if (editMode) {

        editMode.classList.remove(
            "active"
        );
    }
}


// ============================================
// HAPUS JADWAL
// ============================================

async function hapusJadwal(id) {

    if (sedangMenyimpan) {
        return;
    }


    const jadwal =
        jadwalData.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!jadwal) {

        alert(
            "Data jadwal tidak ditemukan."
        );

        return;
    }


    const tanggalTampil =
        formatTanggalIndonesia(
            jadwal.tanggal
        );


    const konfirmasi =
        confirm(

            "Apakah Anda yakin ingin menghapus jadwal ini?\n\n" +

            "Kelompok: " +
            `${jadwal.kelompok || "-"}` +
            "\n" +

            "Tempat: " +
            `${jadwal.tempat || "-"}` +
            "\n" +

            "Tanggal: " +
            `${tanggalTampil}`
        );


    if (!konfirmasi) {
        return;
    }


    console.log(
        "Menghapus jadwal ID:",
        id
    );


    try {

        const {
            error
        } = await supabaseClient

            .from("jadwal_kumpulan")

            .delete()

            .eq(
                "id",
                id
            );


        console.log(
            "ERROR DELETE:",
            error
        );


        if (error) {

            console.error(
                "DELETE GAGAL:",
                error
            );

            alert(
                "Gagal menghapus jadwal:\n\n" +
                error.message
            );

            return;
        }


        // ====================================
        // JIKA YANG DIHAPUS SEDANG DIEDIT
        // ====================================

        if (
            idEdit !== null &&
            Number(idEdit) ===
            Number(id)
        ) {

            idEdit = null;

            kosongkanForm();

            sembunyikanTombolBatal();
        }


        // ====================================
        // MUAT DATA TERBARU
        // ====================================

        await muatData();


        alert(
            "Jadwal berhasil dihapus."
        );


    } catch (error) {

        console.error(
            "KESALAHAN SAAT MENGHAPUS:",
            error
        );

        alert(
            "Terjadi kesalahan:\n\n" +
            error.message
        );
    }
}


// ============================================
// TAMPILKAN JADWAL
// ============================================

function tampilkanJadwal() {

    const container =
        document.getElementById(
            "jadwalList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const kelompokList = [

        "Rumah Tangga",

        "PKB",

        "PW"
    ];


    kelompokList.forEach(
        kelompok => {

            const dataKelompok =
                jadwalData.filter(
                    jadwal =>
                        jadwal.kelompok ===
                        kelompok
                );


            // Tidak menampilkan kelompok
            // jika belum memiliki jadwal

            if (
                dataKelompok.length === 0
            ) {

                return;
            }


            // =================================
            // JUDUL KELOMPOK
            // =================================

            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "jadwal-group-title";


            title.textContent =
                kelompok;


            container.appendChild(
                title
            );


            // =================================
            // WRAPPER TABLE
            // =================================

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "table-wrapper";


            // =================================
            // TABLE
            // =================================

            const table =
                document.createElement(
                    "table"
                );


            table.className =
                "jadwal-table";


            table.innerHTML = `

                <thead>

                    <tr>

                        <th>
                            Tempat
                        </th>

                        <th>
                            Tanggal
                        </th>

                        <th>
                            Pelayan Firman
                        </th>

                        <th>
                            Aksi
                        </th>

                    </tr>

                </thead>

                <tbody></tbody>

            `;


            const tbody =
                table.querySelector(
                    "tbody"
                );


            // =================================
            // ISI BARIS
            // =================================

            dataKelompok.forEach(
                jadwal => {

                    const tr =
                        document.createElement(
                            "tr"
                        );


                    tr.innerHTML = `

                        <td>
                            ${escapeHTML(
                                jadwal.tempat ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                formatTanggalIndonesia(
                                    jadwal.tanggal
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                jadwal.pelayanFirman ||
                                "-"
                            )}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn-edit-jadwal"
                                onclick="editJadwal(${jadwal.id})"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="btn-hapus-jadwal"
                                onclick="hapusJadwal(${jadwal.id})"
                            >
                                Hapus
                            </button>

                        </td>

                    `;


                    tbody.appendChild(
                        tr
                    );
                }
            );


            wrapper.appendChild(
                table
            );


            container.appendChild(
                wrapper
            );
        }
    );


    // ========================================
    // JIKA TIDAK ADA DATA
    // ========================================

    if (
        jadwalData.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-data">

                Belum ada data jadwal.

            </div>

        `;
    }
}


// ============================================
// FORMAT TANGGAL INDONESIA
// ============================================

function formatTanggalIndonesia(
    tanggal
) {

    if (!tanggal) {
        return "-";
    }


    const bagian =
        String(tanggal).split("-");


    if (
        bagian.length !== 3
    ) {

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
// KOSONGKAN FORM
// ============================================

function kosongkanForm() {

    const kelompok =
        document.getElementById(
            "kelompok"
        );

    const tanggal =
        document.getElementById(
            "tanggal"
        );

    const tempat =
        document.getElementById(
            "tempat"
        );

    const pelayanFirman =
        document.getElementById(
            "pelayanFirman"
        );


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
// ESCAPE HTML
// ============================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


// ============================================
// KEMBALI KE HALAMAN ADMIN
// ============================================

function kembaliKeAdmin() {

    window.location.href =
        "kelola-admin.html";
}
