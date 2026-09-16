/* =========================================
   KELOLA JADWAL
   GPIL Jemaat Betesda Purwosari
========================================= */


let idEdit = null;

let jadwalData = [];

let sedangMenyimpan = false;


/* =========================================
   SAAT HALAMAN DIBUKA
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        isiDropdownTempat();

        isiDropdownPelayanFirman();

        muatData();

    }
);


/* =========================================
   AMBIL DATA DARI SUPABASE
========================================= */

async function ambilJadwal() {

    const {
        data,
        error
    } = await supabaseClient
        .from("jadwal_kumpulan")
        .select("*")
        .order(
            "tanggal",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "ERROR AMBIL DATA:",
            error
        );

        throw error;

    }


    return data || [];

}


/* =========================================
   MUAT DATA
========================================= */

async function muatData() {

    try {

        jadwalData =
            await ambilJadwal();


        console.log(
            "DATA JADWAL:",
            jadwalData
        );


        tampilkanJadwal();


    } catch (error) {

        console.error(
            "GAGAL MEMUAT DATA:",
            error
        );


        tampilkanPesanGagal();

    }

}


/* =========================================
   PESAN GAGAL MEMUAT DATA
========================================= */

function tampilkanPesanGagal() {

    const daftarTabel = [

        "jadwalListRumahTangga",

        "jadwalListPKB",

        "jadwalListPW"

    ];


    daftarTabel.forEach(
        function (id) {

            const tbody =
                document.getElementById(id);


            if (!tbody) return;


            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        class="empty-row"
                    >
                        Gagal memuat data jadwal.
                    </td>
                </tr>
            `;

        }
    );

}


/* =========================================
   DROPDOWN TEMPAT
========================================= */

function isiDropdownTempat() {

    const select =
        document.getElementById(
            "tempat"
        );


    if (!select) return;


    const kelompok =
        document.getElementById(
            "kelompok"
        )?.value || "";


    select.innerHTML =
        `<option value="">Pilih tempat</option>`;


    if (
        typeof daftarTempat ===
        "undefined"
    ) {

        console.warn(
            "daftarTempat tidak ditemukan."
        );

        return;

    }


    let daftar = [];


    if (
        kelompok === "Rumah Tangga"
    ) {

        if (
            Array.isArray(
                daftarTempat.rumahTangga
            )
        ) {

            daftar =
                daftarTempat.rumahTangga;

        }

    }


    else if (
        kelompok === "PKB"
    ) {

        if (
            Array.isArray(
                daftarTempat.pkb
            )
        ) {

            daftar =
                daftarTempat.pkb;

        }

    }


    else if (
        kelompok === "PW"
    ) {

        if (
            Array.isArray(
                daftarTempat.pw
            )
        ) {

            daftar =
                daftarTempat.pw;

        }

    }


    daftar.forEach(
        function (tempat) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                tempat;


            option.textContent =
                tempat;


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================
   DROPDOWN PELAYAN FIRMAN
========================================= */

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


    if (
        !Array.isArray(
            daftarPelayanFirman
        )
    ) {

        return;

    }


    daftarPelayanFirman.forEach(
        function (pelayan) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                pelayan;


            option.textContent =
                pelayan;


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================
   PERUBAHAN KELOMPOK
========================================= */

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


/* =========================================
   SIMPAN JADWAL
========================================= */

async function simpanJadwal(event) {

    if (event) {

        event.preventDefault();

    }


    if (sedangMenyimpan) {

        return;

    }


    const kelompokElement =
        document.getElementById(
            "kelompok"
        );


    const tanggalElement =
        document.getElementById(
            "tanggal"
        );


    const tempatElement =
        document.getElementById(
            "tempat"
        );


    const pelayanElement =
        document.getElementById(
            "pelayanFirman"
        );


    if (
        !kelompokElement ||
        !tanggalElement ||
        !tempatElement ||
        !pelayanElement
    ) {

        alert(
            "Form jadwal tidak ditemukan."
        );

        return;

    }


    const kelompok =
        kelompokElement.value.trim();


    const tanggal =
        tanggalElement.value;


    const tempat =
        tempatElement.value.trim();


    const pelayanFirman =
        pelayanElement.value.trim();


    /* =====================================
       VALIDASI
    ===================================== */

    if (!kelompok) {

        alert(
            "Silakan pilih kelompok kumpulan."
        );

        kelompokElement.focus();

        return;

    }


    if (!tanggal) {

        alert(
            "Silakan pilih tanggal."
        );

        tanggalElement.focus();

        return;

    }


    if (!tempat) {

        alert(
            "Silakan pilih tempat kumpulan."
        );

        tempatElement.focus();

        return;

    }


    if (!pelayanFirman) {

        alert(
            "Silakan pilih pelayan firman."
        );

        pelayanElement.focus();

        return;

    }


    /* =====================================
       DATA YANG AKAN DISIMPAN
    ===================================== */

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


    console.log(
        "DATA JADWAL:",
        dataJadwal
    );


    sedangMenyimpan = true;


    const saveButton =
        document.getElementById(
            "saveButton"
        );


    if (saveButton) {

        saveButton.disabled = true;

    }


    try {


        /* =================================
           MODE TAMBAH
        ================================= */

        if (idEdit === null) {


            console.log(
                "MODE: TAMBAH"
            );


            const {
                error
            } = await supabaseClient
                .from(
                    "jadwal_kumpulan"
                )
                .insert(
                    [dataJadwal]
                );


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


        /* =================================
           MODE EDIT
        ================================= */

        else {


            console.log(
                "MODE: EDIT"
            );


            console.log(
                "ID:",
                idEdit
            );


            console.log(
                "DATA BARU:",
                dataJadwal
            );


            const {
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
                    idEdit
                );


            console.log(
                "UPDATE ERROR:",
                error
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


            alert(
                "Jadwal berhasil diperbaharui."
            );

        }


        /* =================================
           RESET FORM
        ================================= */

        idEdit = null;


        kosongkanForm();


        sembunyikanTombolBatal();


        if (saveButton) {

            saveButton.textContent =
                "Simpan Jadwal";

        }


        /* =================================
           MUAT ULANG DATA
        ================================= */

        await muatData();


    } catch (error) {


        console.error(
            "ERROR SIMPAN:",
            error
        );


        alert(
            "Terjadi kesalahan saat menyimpan data.\n\n" +
            error.message
        );


    } finally {


        sedangMenyimpan = false;


        if (saveButton) {

            saveButton.disabled =
                false;

        }

    }

}


/* =========================================
   EDIT JADWAL
========================================= */

function editJadwal(id) {

    console.log(
        "EDIT ID:",
        id
    );


    const jadwal =
        jadwalData.find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );

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


    const kelompokElement =
        document.getElementById(
            "kelompok"
        );


    const tanggalElement =
        document.getElementById(
            "tanggal"
        );


    const tempatElement =
        document.getElementById(
            "tempat"
        );


    const pelayanElement =
        document.getElementById(
            "pelayanFirman"
        );


    /* =====================================
       ISI FORM
    ===================================== */

    if (kelompokElement) {

        kelompokElement.value =
            jadwal.kelompok || "";

    }


    /*
       Isi ulang dropdown tempat
       berdasarkan kelompok.
    */

    isiDropdownTempat();


    if (tanggalElement) {

        tanggalElement.value =
            jadwal.tanggal || "";

    }


    if (tempatElement) {

        /*
           Jika tempat lama tidak ada
           di daftar dropdown, tetap
           masukkan sebagai option.
        */

        const tempatLama =
            jadwal.tempat || "";


        if (
            tempatLama &&
            !Array.from(
                tempatElement.options
            ).some(
                function (option) {

                    return (
                        option.value ===
                        tempatLama
                    );

                }
            )
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                tempatLama;


            option.textContent =
                tempatLama;


            tempatElement.appendChild(
                option
            );

        }


        tempatElement.value =
            tempatLama;

    }


    if (pelayanElement) {

        const pelayanLama =
            jadwal.pelayan_firman || "";


        /*
           Jika pelayan lama tidak ada
           di daftar dropdown, tetap
           masukkan sebagai option.
        */

        if (
            pelayanLama &&
            !Array.from(
                pelayanElement.options
            ).some(
                function (option) {

                    return (
                        option.value ===
                        pelayanLama
                    );

                }
            )
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                pelayanLama;


            option.textContent =
                pelayanLama;


            pelayanElement.appendChild(
                option
            );

        }


        pelayanElement.value =
            pelayanLama;

    }


    /* =====================================
       UBAH TOMBOL
    ===================================== */

    const saveButton =
        document.getElementById(
            "saveButton"
        );


    if (saveButton) {

        saveButton.textContent =
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


    /* =====================================
       SCROLL KE FORM
    ===================================== */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================
   BATAL EDIT
========================================= */

function batalEdit() {

    console.log(
        "BATAL EDIT"
    );


    idEdit = null;


    kosongkanForm();


    sembunyikanTombolBatal();


    const saveButton =
        document.getElementById(
            "saveButton"
        );


    if (saveButton) {

        saveButton.textContent =
            "Simpan Jadwal";

    }

}


/* =========================================
   SEMBUNYIKAN TOMBOL BATAL
========================================= */

function sembunyikanTombolBatal() {

    const cancelButton =
        document.getElementById(
            "cancelButton"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "none";

    }

}


/* =========================================
   HAPUS JADWAL
========================================= */

async function hapusJadwal(id) {

    const yakin =
        confirm(
            "Apakah Anda yakin ingin menghapus jadwal ini?"
        );


    if (!yakin) {

        return;

    }


    try {


        console.log(
            "HAPUS ID:",
            id
        );


        const {
            error
        } = await supabaseClient
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
            "ERROR HAPUS:",
            error
        );


        alert(
            "Terjadi kesalahan saat menghapus jadwal.\n\n" +
            error.message
        );

    }

}


/* =========================================
   TAMPILKAN JADWAL
========================================= */

function tampilkanJadwal() {


    const daftarTabel = {

        "Rumah Tangga":
            document.getElementById(
                "jadwalListRumahTangga"
            ),

        "PKB":
            document.getElementById(
                "jadwalListPKB"
            ),

        "PW":
            document.getElementById(
                "jadwalListPW"
            )

    };


    /* =====================================
       BERSIHKAN SEMUA TABEL
    ===================================== */

    Object.values(
        daftarTabel
    ).forEach(
        function (tbody) {

            if (tbody) {

                tbody.innerHTML = "";

            }

        }
    );


    /* =====================================
       URUTAN KELOMPOK
    ===================================== */

    const kelompokList = [

        "Rumah Tangga",

        "PKB",

        "PW"

    ];


    /* =====================================
       TAMPILKAN PER KELOMPOK
    ===================================== */

    kelompokList.forEach(
        function (kelompok) {


            const tbody =
                daftarTabel[
                    kelompok
                ];


            if (!tbody) {

                return;

            }


            let dataKelompok =
                jadwalData.filter(
                    function (item) {

                        return (
                            item.kelompok ===
                            kelompok
                        );

                    }
                );


            /* =================================
               URUTKAN BERDASARKAN TANGGAL
            ================================= */

            dataKelompok.sort(
                function (a, b) {

                    return (
                        new Date(
                            a.tanggal
                        ) -
                        new Date(
                            b.tanggal
                        )
                    );

                }
            );


            /* =================================
               JIKA KOSONG
            ================================= */

            if (
                dataKelompok.length === 0
            ) {

                tbody.innerHTML = `

                    <tr>

                        <td
                            colspan="4"
                            class="empty-row"
                        >

                            Belum ada jadwal
                            ${escapeHTML(
                                kelompok
                            )}.

                        </td>

                    </tr>

                `;


                return;

            }


            /* =================================
               TAMPILKAN DATA
            ================================= */

            dataKelompok.forEach(
                function (jadwal) {


                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>

                            ${escapeHTML(
                                jadwal.tempat ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${formatTanggalIndonesia(
                                jadwal.tanggal
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                jadwal.pelayan_firman ||
                                "-"
                            )}

                        </td>


                        <td>

                            <div
                                class="aksi-wrapper"
                            >

                                <button
                                    type="button"
                                    class="btn-edit"
                                    onclick="editJadwal(${Number(jadwal.id)})"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="btn-hapus"
                                    onclick="hapusJadwal(${Number(jadwal.id)})"
                                >
                                    Hapus
                                </button>

                            </div>

                        </td>

                    `;


                    tbody.appendChild(
                        row
                    );

                }
            );

        }
    );

}


/* =========================================
   FORMAT TANGGAL INDONESIA
   YYYY-MM-DD
   menjadi
   DD-MM-YYYY
========================================= */

function formatTanggalIndonesia(
    tanggal
) {

    if (!tanggal) {

        return "-";

    }


    const parts =
        String(tanggal).split("-");


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


/* =========================================
   KOSONGKAN FORM
========================================= */

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


    /*
       Reset dropdown tempat.
    */

    if (tempat) {

        tempat.innerHTML =
            `<option value="">
                Pilih tempat
            </option>`;

    }


    if (pelayan) {

        pelayan.value = "";

    }

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )

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


/* =========================================
   KEMBALI KE HALAMAN ADMIN
========================================= */

function kembaliKeAdmin() {

    window.location.href =
        "kelola-admin.html";

}
