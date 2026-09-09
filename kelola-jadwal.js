const STORAGE_KEY = "jadwal_kumpulan";

let jadwalData = [];

let indexEdit = -1;


/* =========================================
   SAAT HALAMAN DIBUKA
========================================= */

document.addEventListener("DOMContentLoaded", async function () {

    await ambilData();

    isiDropdownPelayanFirman();

    isiDropdownTempat();

    document
        .getElementById("kelompok")
        .addEventListener("change", function () {

            isiDropdownTempat();

        });

    tampilkanJadwal();

});


/* =========================================
   AMBIL DATA DARI LOCAL STORAGE
========================================= */

async function ambilData() {

    const { data, error } =
        await supabaseClient
            .from("jadwal_kumpulan")
            .select("*")
            .order("tanggal", {
                ascending: true
            });

    if (error) {

        console.error(
            "Gagal mengambil jadwal:",
            error
        );

        alert(
            "Jadwal tidak dapat diambil dari database."
        );

        jadwalData = [];

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

}

/* =========================================
   DROPDOWN TEMPAT
========================================= */

function isiDropdownTempat() {

    const kelompok =
        document.getElementById("kelompok").value;


    const tempatSelect =
        document.getElementById("tempat");


    tempatSelect.innerHTML = `
        <option value="">
            Pilih tempat
        </option>
    `;


    let daftar = [];


    if (kelompok === "Rumah Tangga") {

        daftar = daftarTempat.rumahTangga;

    }

    else if (kelompok === "PW") {

        daftar = daftarTempat.pw;

    }

    else if (kelompok === "PKB") {

        daftar = daftarTempat.pkb;

    }


    daftar
        .slice()
        .sort(function (a, b) {

            return a.localeCompare(b, "id");

        })
        .forEach(function (tempat) {

            const option =
                document.createElement("option");


            option.value = tempat;

            option.textContent = tempat;


            tempatSelect.appendChild(option);

        });

}


/* =========================================
   DROPDOWN PELAYAN FIRMAN
========================================= */

function isiDropdownPelayanFirman() {

    const select =
        document.getElementById("pelayanFirman");


    select.innerHTML = `
        <option value="">
            Pilih pelayan firman
        </option>
    `;


    daftarPelayanFirman.forEach(function (nama) {

        const option =
            document.createElement("option");


        option.value = nama;

        option.textContent = nama;


        select.appendChild(option);

    });

}


/* =========================================
   SIMPAN JADWAL
========================================= */

async function simpanJadwal() {

    const kelompok =
        document.getElementById("kelompok").value;

    const tanggal =
        document.getElementById("tanggal").value;

    const tempat =
        document.getElementById("tempat").value;

    const pelayanFirman =
        document.getElementById("pelayanFirman").value;


    if (!kelompok) {

        alert("Silakan pilih kelompok.");

        return;

    }


    if (!tanggal) {

        alert("Silakan pilih tanggal.");

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


    const dataJadwal = {

        kelompok: kelompok,

        tanggal: tanggal,

        tempat: tempat,

        pelayan_firman: pelayanFirman

    };


    if (indexEdit === -1) {

        const { error } =
            await supabaseClient
                .from("jadwal_kumpulan")
                .insert([dataJadwal]);


        if (error) {

            console.error(
                "Gagal menyimpan jadwal:",
                error
            );

            alert(
                "Jadwal gagal disimpan ke database."
            );

            return;

        }


        alert("Jadwal berhasil disimpan.");

    }

    else {

        const id =
            jadwalData[indexEdit].id;


        const { error } =
            await supabaseClient
                .from("jadwal_kumpulan")
                .update(dataJadwal)
                .eq("id", id);


        if (error) {

            console.error(
                "Gagal memperbarui jadwal:",
                error
            );

            alert(
                "Jadwal gagal diperbarui."
            );

            return;

        }


        alert("Jadwal berhasil diperbarui.");

    }


    await ambilData();

    kosongkanForm();

    tampilkanJadwal();

}

/* =========================================
   SIMPAN KE LOCAL STORAGE
========================================= */

function simpanKeLocalStorage() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(jadwalData)

    );

}


/* =========================================
   TAMPILKAN JADWAL
========================================= */

function tampilkanJadwal() {

    const container =
        document.getElementById("jadwalList");


    container.innerHTML = "";


    /* =====================================
       JIKA BELUM ADA DATA
    ===================================== */

    if (jadwalData.length === 0) {

        container.innerHTML = `
            <div class="kosong">
                Belum ada jadwal yang tersimpan.
            </div>
        `;

        return;

    }


    /* =====================================
       URUTAN KELOMPOK
       
       1. Rumah Tangga
       2. PKB
       3. PW
    ===================================== */

    const urutanKelompok = {

        "Rumah Tangga": 1,

        "PKB": 2,

        "PW": 3

    };


    /* =====================================
       KELOMPOKKAN DATA
    ===================================== */

    const kelompokData = {

        "Rumah Tangga": [],

        "PKB": [],

        "PW": []

    };


    jadwalData.forEach(function (jadwal, index) {

        if (kelompokData[jadwal.kelompok]) {

            kelompokData[jadwal.kelompok].push({

                data: jadwal,

                indexAsli: index

            });

        }

    });


    /* =====================================
       TAMPILKAN PER KELOMPOK
    ===================================== */

    Object.keys(urutanKelompok)
        .sort(function (a, b) {

            return urutanKelompok[a] -
                   urutanKelompok[b];

        })
        .forEach(function (namaKelompok) {

            const dataKelompok =
                kelompokData[namaKelompok];


            /* JIKA KELOMPOK BELUM ADA DATA */

            if (dataKelompok.length === 0) {

                return;

            }


            /* =================================
               URUTKAN TANGGAL
               TERLAMA → TERBARU
            ================================= */

            dataKelompok.sort(function (a, b) {

                return new Date(a.data.tanggal) -
                       new Date(b.data.tanggal);

            });


            /* =================================
               JUDUL KELOMPOK
            ================================= */

            const judul =
                document.createElement("div");


            judul.className =
                "judul-kelompok";


            judul.textContent =
                namaKelompok.toUpperCase();


            container.appendChild(judul);


            /* =================================
               TABEL
            ================================= */

            const table =
                document.createElement("table");


            table.className =
                "tabel-jadwal";


            table.innerHTML = `

                <thead>

                    <tr>

                        <th>Tempat</th>

                        <th>Tanggal</th>

                        <th>Pelayan</th>

                        <th>Aksi</th>

                    </tr>

                </thead>


                <tbody></tbody>

            `;


            const tbody =
                table.querySelector("tbody");


            /* =================================
               ISI BARIS
            ================================= */

            dataKelompok.forEach(function (item) {

                const jadwal =
                    item.data;


                const indexAsli =
                    item.indexAsli;


                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${escapeHTML(jadwal.tempat)}
                    </td>


                    <td>
                        ${formatTanggalSingkat(
                            jadwal.tanggal
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            jadwal.pelayanFirman
                        )}
                    </td>


                    <td class="kolom-aksi">

                        <button
                            type="button"
                            class="btn-edit"
                            onclick="editJadwal(${indexAsli})"
                            title="Edit">

                            ✏️

                        </button>


                        <button
                            type="button"
                            class="btn-hapus"
                            onclick="hapusJadwal(${indexAsli})"
                            title="Hapus">

                            🗑️

                        </button>

                    </td>

                `;


                tbody.appendChild(row);

            });


            container.appendChild(table);

        });

}


/* =========================================
   EDIT JADWAL
========================================= */

function editJadwal(index) {

    const jadwal =
        jadwalData[index];


    if (!jadwal) {

        alert("Data jadwal tidak ditemukan.");

        return;

    }


    /* JUDUL FORM */

    document
        .getElementById("judulForm")
        .textContent = "Edit Jadwal";


    /* TOMBOL SIMPAN */

    document
        .querySelector(".btn-simpan")
        .textContent = "🔄 Perbarui Jadwal";


    /* KELOMPOK */

    document
        .getElementById("kelompok")
        .value = jadwal.kelompok;


    /* PERBARUI DROPDOWN TEMPAT */

    isiDropdownTempat();


    /* TEMPAT */

    document
        .getElementById("tempat")
        .value = jadwal.tempat;


    /* PELAYAN FIRMAN */

    document
        .getElementById("pelayanFirman")
        .value = jadwal.pelayanFirman;


    /* TANGGAL */

    document
        .getElementById("tanggal")
        .value = jadwal.tanggal;


    /* SIMPAN INDEX EDIT */

    indexEdit = index;


    /* SCROLL KE FORM */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================
   HAPUS JADWAL
========================================= */

function hapusJadwal(index) {

    const jadwal =
        jadwalData[index];


    if (!jadwal) {

        alert("Data jadwal tidak ditemukan.");

        return;

    }


    const yakin = confirm(

        "Hapus jadwal " +
        formatTanggal(jadwal.tanggal) +
        "?"

    );


    if (!yakin) {

        return;

    }


    /* HAPUS DATA */

    jadwalData.splice(index, 1);


    /* SIMPAN */

    simpanKeLocalStorage();


    /* RESET JIKA SEDANG EDIT */

    if (indexEdit === index) {

        kosongkanForm();

    }


    /* TAMPILKAN ULANG */

    tampilkanJadwal();


    alert("Jadwal berhasil dihapus.");

}


/* =========================================
   KOSONGKAN FORM
========================================= */

function kosongkanForm() {

    document
        .getElementById("tanggal")
        .value = "";


    document
        .getElementById("tempat")
        .value = "";


    document
        .getElementById("pelayanFirman")
        .value = "";


    /* RESET INDEX EDIT */

    indexEdit = -1;


    /* RESET JUDUL */

    document
        .getElementById("judulForm")
        .textContent = "Tambah Jadwal";


    /* RESET TOMBOL */

    document
        .querySelector(".btn-simpan")
        .textContent = "💾 Simpan Jadwal";

}


/* =========================================
   FORMAT TANGGAL
========================================= */

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


/* =========================================
   FORMAT TANGGAL SINGKAT
========================================= */

function formatTanggalSingkat(tanggal) {

    const date =
        new Date(tanggal + "T00:00:00");


    return date.toLocaleDateString(

        "id-ID",

        {

            day: "2-digit",

            month: "2-digit",

            year: "numeric"

        }

    );

}


/* =========================================
   AMANKAN HTML
========================================= */

function escapeHTML(teks) {

    return String(teks)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}