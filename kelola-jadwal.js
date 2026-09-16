let idEdit = null;
let jadwalData = [];
let sedangMenyimpan = false;


// ========================================
// SAAT HALAMAN DIBUKA
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    isiDropdownTempat();
    isiDropdownPelayanFirman();

    muatData();

});


// ========================================
// AMBIL DATA DARI SUPABASE
// ========================================

async function ambilJadwal() {

    const { data, error } = await supabaseClient
        .from("jadwal_kumpulan")
        .select("*")
        .order("tanggal", {
            ascending: true
        });

    if (error) {
        console.error("ERROR AMBIL DATA:", error);
        throw error;
    }

    return data || [];
}


// ========================================
// MUAT DATA
// ========================================

async function muatData() {

    try {

        jadwalData = await ambilJadwal();

        console.log(
            "DATA JADWAL:",
            jadwalData
        );

        tampilkanJadwal();

    } catch (error) {

        console.error(error);

        const list =
            document.getElementById("jadwalList");

        if (list) {

            list.innerHTML = `
                <tr>
                    <td colspan="4"
                        style="text-align:center;">
                        Gagal memuat data jadwal.
                    </td>
                </tr>
            `;

        }

    }

}


// ========================================
// DROPDOWN TEMPAT
// ========================================

function isiDropdownTempat() {

    const select =
        document.getElementById("tempat");

    if (!select) return;

    select.innerHTML =
        `<option value="">Pilih tempat</option>`;

    if (
        typeof daftarTempat === "undefined"
    ) {

        console.warn(
            "daftarTempat tidak ditemukan."
        );

        return;
    }


    const kelompok =
        document.getElementById("kelompok")
            ?.value;


    let daftar = [];


    if (
        kelompok === "Rumah Tangga" &&
        Array.isArray(
            daftarTempat.rumahTangga
        )
    ) {

        daftar =
            daftarTempat.rumahTangga;

    }

    else if (
        kelompok === "PKB" &&
        Array.isArray(
            daftarTempat.pkb
        )
    ) {

        daftar =
            daftarTempat.pkb;

    }

    else if (
        kelompok === "PW" &&
        Array.isArray(
            daftarTempat.pw
        )
    ) {

        daftar =
            daftarTempat.pw;

    }


    daftar.forEach(function (tempat) {

        const option =
            document.createElement("option");

        option.value = tempat;
        option.textContent = tempat;

        select.appendChild(option);

    });

}


// ========================================
// DROPDOWN PELAYAN FIRMAN
// ========================================

function isiDropdownPelayanFirman() {

    const select =
        document.getElementById(
            "pelayanFirman"
        );

    if (!select) return;

    select.innerHTML =
        `<option value="">Pilih pelayan firman</option>`;


    if (
        typeof daftarPelayanFirman ===
        "undefined"
    ) {

        console.warn(
            "daftarPelayanFirman tidak ditemukan."
        );

        return;
    }


    daftarPelayanFirman.forEach(
        function (pelayan) {

            const option =
                document.createElement(
                    "option"
                );

            option.value = pelayan;
            option.textContent = pelayan;

            select.appendChild(option);

        }
    );

}


// ========================================
// PERUBAHAN KELOMPOK
// ========================================

document.addEventListener(
    "change",
    function (event) {

        if (
            event.target.id ===
            "kelompok"
        ) {

            isiDropdownTempat();

        }

    }
);


// ========================================
// SIMPAN / UPDATE JADWAL
// ========================================

async function simpanJadwal(event) {

    if (event) {
        event.preventDefault();
    }


    if (sedangMenyimpan) {
        return;
    }


    const kelompok =
        document.getElementById(
            "kelompok"
        ).value.trim();

    const tanggal =
        document.getElementById(
            "tanggal"
        ).value;

    const tempat =
        document.getElementById(
            "tempat"
        ).value.trim();

    const pelayanFirman =
        document.getElementById(
            "pelayanFirman"
        ).value.trim();


    if (
        !kelompok ||
        !tanggal ||
        !tempat ||
        !pelayanFirman
    ) {

        alert(
            "Semua data jadwal harus diisi."
        );

        return;
    }


    const dataJadwal = {

        kelompok: kelompok,

        tanggal: tanggal,

        tempat: tempat,

        pelayan_firman:
            pelayanFirman

    };


    sedangMenyimpan = true;


    const button =
        document.getElementById(
            "saveButton"
        );


    if (button) {
        button.disabled = true;
    }


    try {

        // ==================================
        // MODE TAMBAH
        // ==================================

        if (idEdit === null) {

            console.log(
                "MENAMBAH DATA:",
                dataJadwal
            );


            const { error } =
                await supabaseClient
                    .from(
                        "jadwal_kumpulan"
                    )
                    .insert([
                        dataJadwal
                    ]);


            if (error) {

                console.error(
                    "ERROR INSERT:",
                    error
                );

                alert(
                    "Jadwal gagal disimpan.\n\n" +
                    error.message
                );

                return;
            }


            alert(
                "Jadwal berhasil disimpan."
            );

        }


        // ==================================
        // MODE EDIT
        // ==================================

        else {

            console.log(
                "ID YANG DIUPDATE:",
                idEdit
            );

            console.log(
                "DATA BARU:",
                dataJadwal
            );


            const { error } =
                await supabaseClient
                    .from(
                        "jadwal_kumpulan"
                    )
                    .update(
                        dataJadwal
                    )
                    .eq(
                        "id",
                        idEdit
                    );


            if (error) {

                console.error(
                    "ERROR UPDATE:",
                    error
                );

                alert(
                    "Perubahan jadwal gagal disimpan.\n\n" +
                    error.message
                );

                return;
            }


            console.log(
                "UPDATE BERHASIL"
            );


            alert(
                "Jadwal berhasil diperbaharui."
            );

        }


        // ==================================
        // RESET
        // ==================================

        idEdit = null;

        kosongkanForm();

        sembunyikanTombolBatal();


        if (button) {

            button.textContent =
                "Simpan Jadwal";

        }


        // ==================================
        // AMBIL ULANG DATA DARI DATABASE
        // ==================================

        await muatData();


    } catch (error) {

        console.error(
            "ERROR SIMPAN:",
            error
        );

        alert(
            "Terjadi kesalahan saat menyimpan data."
        );

    } finally {

        sedangMenyimpan = false;

        if (button) {
            button.disabled = false;
        }

    }

}


// ========================================
// EDIT JADWAL
// ========================================

function editJadwal(id) {

    const jadwal =
        jadwalData.find(
            function (item) {

                return Number(item.id) ===
                    Number(id);

            }
        );


    if (!jadwal) {

        alert(
            "Data jadwal tidak ditemukan."
        );

        return;
    }


    idEdit =
        Number(jadwal.id);


    document.getElementById(
        "kelompok"
    ).value =
        jadwal.kelompok || "";


    // Isi ulang tempat sesuai kelompok
    isiDropdownTempat();


    document.getElementById(
        "tanggal"
    ).value =
        jadwal.tanggal || "";


    document.getElementById(
        "tempat"
    ).value =
        jadwal.tempat || "";


    document.getElementById(
        "pelayanFirman"
    ).value =
        jadwal.pelayan_firman || "";


    const button =
        document.getElementById(
            "saveButton"
        );


    if (button) {

        button.textContent =
            "Simpan Perubahan";

    }


    const cancelButton =
        document.getElementById(
            "cancelButton"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "block";

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ========================================
// BATAL EDIT
// ========================================

function batalEdit() {

    idEdit = null;

    kosongkanForm();

    sembunyikanTombolBatal();


    const button =
        document.getElementById(
            "saveButton"
        );


    if (button) {

        button.textContent =
            "Simpan Jadwal";

    }

}


// ========================================
// SEMBUNYIKAN TOMBOL BATAL
// ========================================

function sembunyikanTombolBatal() {

    const button =
        document.getElementById(
            "cancelButton"
        );


    if (button) {

        button.style.display =
            "none";

    }

}


// ========================================
// HAPUS JADWAL
// ========================================

async function hapusJadwal(id) {

    const yakin =
        confirm(
            "Apakah Anda yakin ingin menghapus jadwal ini?"
        );


    if (!yakin) {
        return;
    }


    try {

        const { error } =
            await supabaseClient
                .from(
                    "jadwal_kumpulan"
                )
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {

            console.error(
                "ERROR DELETE:",
                error
            );

            alert(
                "Jadwal gagal dihapus.\n\n" +
                error.message
            );

            return;
        }


        alert(
            "Jadwal berhasil dihapus."
        );


        await muatData();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "Terjadi kesalahan saat menghapus jadwal."
        );

    }

}


// ========================================
// TAMPILKAN JADWAL
// ========================================

function tampilkanJadwal() {

    const list =
        document.getElementById(
            "jadwalList"
        );


    if (!list) return;


    list.innerHTML = "";


    const kelompokList = [
        "Rumah Tangga",
        "PKB",
        "PW"
    ];


    kelompokList.forEach(
        function (kelompok) {

            const dataKelompok =
                jadwalData.filter(
                    function (item) {

                        return item.kelompok ===
                            kelompok;

                    }
                );


            if (
                dataKelompok.length === 0
            ) {
                return;
            }


            // ==============================
            // JUDUL KELOMPOK
            // ==============================

            const headingRow =
                document.createElement(
                    "tr"
                );


            headingRow.innerHTML = `
                <td colspan="4"
                    style="
                        font-weight:700;
                        background:#eef4f9;
                        color:#1f4e79;
                    ">
                    ${escapeHTML(kelompok)}
                </td>
            `;


            list.appendChild(
                headingRow
            );


            // ==============================
            // DATA
            // ==============================

            dataKelompok.forEach(
                function (jadwal) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `
                        <td>
                            ${escapeHTML(
                                jadwal.tempat || "-"
                            )}
                        </td>

                        <td>
                            ${formatTanggalIndonesia(
                                jadwal.tanggal
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                jadwal.pelayan_firman || "-"
                            )}
                        </td>

                        <td>
                            <button
                                type="button"
                                onclick="editJadwal(${Number(jadwal.id)})"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onclick="hapusJadwal(${Number(jadwal.id)})"
                            >
                                Hapus
                            </button>
                        </td>
                    `;


                    list.appendChild(
                        row
                    );

                }
            );

        }
    );


    if (
        list.children.length === 0
    ) {

        list.innerHTML = `
            <tr>
                <td colspan="4"
                    style="text-align:center;">
                    Belum ada jadwal.
                </td>
            </tr>
        `;

    }

}


// ========================================
// FORMAT TANGGAL INDONESIA
// ========================================

function formatTanggalIndonesia(
    tanggal
) {

    if (!tanggal) {
        return "-";
    }


    const parts =
        tanggal.split("-");


    if (
        parts.length !== 3
    ) {
        return tanggal;
    }


    return (
        parts[2] +
        "-" +
        parts[1] +
        "-" +
        parts[0]
    );

}


// ========================================
// KOSONGKAN FORM
// ========================================

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


    const pelayan =
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

        isiDropdownTempat();

    }


    if (pelayan) {

        pelayan.value = "";

    }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    return String(value ?? "")
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


// ========================================
// KEMBALI KE HALAMAN ADMIN
// ========================================

function kembaliKeAdmin() {

    window.location.href =
        "kelola-admin.html";

}
