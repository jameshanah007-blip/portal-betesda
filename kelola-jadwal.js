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

    const kelompok =
        document.getElementById("kelompok");


    if (kelompok) {

        kelompok.addEventListener(
            "change",
            () => {
                isiDropdownTempat();
            }
        );
    }


    // Isi dropdown
    isiDropdownTempat();

    isiDropdownPelayanFirman();


    // Ambil data
    await muatData();
});


// ============================================
// AMBIL DATA JADWAL
// ============================================

async function ambilJadwal() {

    const {
        data,
        error
    } = await supabaseClient

        .from("jadwal_kumpulan")

        .select("*")

        .order("tanggal", {
            ascending: true
        })

        .order("id", {
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


    jadwalData =
        (data || []).map(item => ({

            ...item,

            pelayanFirman:
                item.pelayan_firman

        }));
}


// ============================================
// MUAT DATA
// ============================================

async function muatData() {

    await ambilJadwal();

    tampilkanJadwal();
}


// ============================================
// DROPDOWN TEMPAT
// ============================================

function isiDropdownTempat() {

    const kelompok =
        document.getElementById("kelompok");


    const selectTempat =
        document.getElementById("tempat");


    if (
        !kelompok ||
        !selectTempat
    ) {
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


    if (
        typeof daftarTempat !== "undefined"
    ) {

        if (
            kelompok.value ===
            "Rumah Tangga"
        ) {

            daftar =
                daftarTempat.rumahTangga ||
                [];

        }

        else if (
            kelompok.value === "PKB"
        ) {

            daftar =
                daftarTempat.pkb ||
                [];

        }

        else if (
            kelompok.value === "PW"
        ) {

            daftar =
                daftarTempat.pw ||
                [];
        }
    }


    daftar.forEach(tempat => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            tempat;


        option.textContent =
            tempat;


        selectTempat.appendChild(
            option
        );
    });


    // Kembalikan pilihan sebelumnya
    if (
        nilaiLama &&
        daftar.includes(nilaiLama)
    ) {

        selectTempat.value =
            nilaiLama;
    }
}


// ============================================
// DROPDOWN PELAYAN FIRMAN
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
        return;
    }


    daftarPelayanFirman.forEach(nama => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            nama;


        option.textContent =
            nama;


        select.appendChild(
            option
        );
    });
}


// ============================================
// SIMPAN / UPDATE JADWAL
// ============================================

async function simpanJadwal(event) {

    if (event) {
        event.preventDefault();
    }


    // Cegah klik berkali-kali
    if (sedangMenyimpan) {
        return;
    }


    sedangMenyimpan = true;


    const saveButton =
        document.getElementById(
            "saveButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelButton"
        );


    // ========================================
    // AMBIL DATA FORM
    // ========================================

    const kelompok =
        document
            .getElementById("kelompok")
            .value
            .trim();


    const tanggal =
        document
            .getElementById("tanggal")
            .value;


    const tempat =
        document
            .getElementById("tempat")
            .value
            .trim();


    const pelayanFirman =
        document
            .getElementById(
                "pelayanFirman"
            )
            .value
            .trim();


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
    // DATA DATABASE
    // ========================================

    const dataJadwal = {

        kelompok:
            kelompok,

        tanggal:
            tanggal,

        tempat:
            tempat,

        pelayan_firman:
            pelayanFirman
    };


    const sedangEdit =
        idEdit !== null;


    // ========================================
    // LOADING
    // ========================================

    if (saveButton) {

        saveButton.disabled =
            true;


        saveButton.textContent =
            sedangEdit

                ? "Menyimpan Perubahan..."

                : "Menyimpan...";
    }


    if (cancelButton) {

        cancelButton.disabled =
            true;
    }


    try {

        // ====================================
        // MODE EDIT
        // ====================================

        if (sedangEdit) {

            const idYangDiedit =
                idEdit;


            console.log(
                "Update jadwal ID:",
                idYangDiedit
            );


            const {
                data,
                error
            } = await supabaseClient

                .from(
                    "jadwal_kumpulan"
                )

                .update(
                    dataJadwal
                )

                .eq(
                    "id",
                    idYangDiedit
                )

                .select();


            if (error) {

                console.error(
                    "Error update jadwal:",
                    error
                );


                alert(
                    "Gagal menyimpan perubahan:\n\n" +
                    error.message
                );


                return;
            }


            // Tidak ada data yang dikembalikan
            if (
                !data ||
                data.length === 0
            ) {

                console.error(
                    "UPDATE tidak mengembalikan data."
                );


                alert(
                    "Perubahan tidak tersimpan.\n\n" +
                    "Kemungkinan policy RLS " +
                    "UPDATE pada Supabase belum " +
                    "mengizinkan perubahan data."
                );


                return;
            }


            alert(
                "Jadwal berhasil diperbarui."
            );


            // Keluar mode edit
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

                .from(
                    "jadwal_kumpulan"
                )

                .insert(
                    dataJadwal
                )

                .select();


            if (error) {

                console.error(
                    "Error tambah jadwal:",
                    error
                );


                alert(
                    "Gagal menyimpan jadwal:\n\n" +
                    error.message
                );


                return;
            }


            if (
                !data ||
                data.length === 0
            ) {

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
        await muatData();


    }

    catch (error) {

        console.error(
            "Terjadi kesalahan:",
            error
        );


        alert(
            "Terjadi kesalahan:\n\n" +
            error.message
        );

    }

    finally {

        sedangMenyimpan =
            false;


        if (saveButton) {

            saveButton.disabled =
                false;


            if (
                idEdit !== null
            ) {

                saveButton.textContent =
                    "Simpan Perubahan";

            }

            else {

                saveButton.textContent =
                    "Simpan Jadwal";
            }
        }


        if (cancelButton) {

            cancelButton.disabled =
                false;
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


    // Cari berdasarkan ID database
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


    // ========================================
    // SIMPAN ID DATABASE
    // ========================================

    idEdit =
        Number(jadwal.id);


    console.log(
        "Sedang edit jadwal ID:",
        idEdit
    );


    // ========================================
    // KELOMPOK
    // ========================================

    const kelompok =
        document.getElementById(
            "kelompok"
        );


    kelompok.value =
        jadwal.kelompok || "";


    // ========================================
    // TEMPAT
    // ========================================

    isiDropdownTempat();


    document.getElementById(
        "tempat"
    ).value =
        jadwal.tempat || "";


    // ========================================
    // PELAYAN FIRMAN
    // ========================================

    document.getElementById(
        "pelayanFirman"
    ).value =
        jadwal.pelayanFirman || "";


    // ========================================
    // TANGGAL
    // ========================================

    // Input type="date"
    // membutuhkan YYYY-MM-DD
    // sama dengan nilai database

    document.getElementById(
        "tanggal"
    ).value =
        jadwal.tanggal || "";


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


    // Scroll ke form
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

            "Apakah Anda yakin ingin " +
            "menghapus jadwal ini?\n\n" +

            `${jadwal.tempat || "-"}\n` +

            `${tanggalTampil}`

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

        .eq("id", id)

        .select();


    if (error) {

        console.error(
            "Error hapus jadwal:",
            error
        );


        alert(
            "Gagal menghapus jadwal:\n\n" +
            error.message
        );


        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        alert(
            "Data tidak berhasil dihapus.\n\n" +
            "Kemungkinan policy RLS " +
            "DELETE pada Supabase belum " +
            "mengizinkan penghapusan data."
        );


        return;
    }


    // Jika data yang sedang diedit dihapus
    if (
        idEdit !== null &&
        Number(idEdit) === Number(id)
    ) {

        batalEdit();
    }


    alert(
        "Jadwal berhasil dihapus."
    );


    await muatData();
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
            // TABLE WRAPPER
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
            // BARIS DATA
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
    // TIDAK ADA DATA
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
// FORMAT TANGGAL
// DATABASE
// YYYY-MM-DD
//
// MENJADI
// DD/MM/YYYY
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

        kelompok.value =
            "";
    }


    if (tanggal) {

        tanggal.value =
            "";
    }


    if (tempat) {

        tempat.innerHTML = `

            <option value="">
                -- Pilih Tempat --
            </option>

        `;
    }


    if (pelayanFirman) {

        pelayanFirman.value =
            "";
    }
}


// ============================================
// CEGAH HTML INJECTION
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
