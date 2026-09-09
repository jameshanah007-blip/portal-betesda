// ==================================================
// BUKU KAS PEMUDA
// ==================================================

const STORAGE_KEY = "transaksi_pemuda";

let transaksiSedangDiedit = null;


// ==================================================
// SAAT HALAMAN DIBUKA
// ==================================================

document.addEventListener("DOMContentLoaded", function () {

    isiTanggalHariIni();

    tampilkanTransaksi();

    tampilkanSaldo();

    const form = document.getElementById("transactionForm");

    form.addEventListener("submit", simpanTransaksi);


    const tombolBatal = document.getElementById("cancelButton");

    tombolBatal.addEventListener("click", batalEdit);

});


// ==================================================
// TANGGAL HARI INI
// ==================================================

function isiTanggalHariIni() {

    const inputTanggal = document.getElementById("tanggal");

    if (!inputTanggal.value) {

        const sekarang = new Date();

        const tahun = sekarang.getFullYear();

        const bulan = String(
            sekarang.getMonth() + 1
        ).padStart(2, "0");

        const tanggal = String(
            sekarang.getDate()
        ).padStart(2, "0");

        inputTanggal.value =
            tahun + "-" + bulan + "-" + tanggal;
    }
}


// ==================================================
// AMBIL DATA
// ==================================================

function ambilTransaksi() {

    const data =
        localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return [];
    }

    try {

        const transaksi = JSON.parse(data);

        if (!Array.isArray(transaksi)) {
            return [];
        }

        return transaksi;

    } catch (error) {

        console.error(
            "Gagal membaca transaksi:",
            error
        );

        return [];
    }
}


// ==================================================
// SIMPAN DATA
// ==================================================

function simpanData(transaksi) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transaksi)
    );
}


// ==================================================
// SIMPAN TRANSAKSI
// ==================================================

function simpanTransaksi(event) {

    event.preventDefault();


    const tanggal =
        document.getElementById("tanggal").value;

    const keterangan =
        document.getElementById("keterangan").value.trim();

    const jenis =
        document.getElementById("jenis").value;

    const jumlah =
        Number(
            document.getElementById("jumlah").value
        );


    if (!tanggal) {

        alert("Tanggal harus diisi.");

        return;
    }


    if (!keterangan) {

        alert("Keterangan harus diisi.");

        return;
    }


    if (!jenis) {

        alert("Silakan pilih jenis transaksi.");

        return;
    }


    if (!jumlah || jumlah <= 0) {

        alert("Jumlah harus lebih dari 0.");

        return;
    }


    const transaksi =
        ambilTransaksi();


    // ==============================================
    // EDIT TRANSAKSI
    // ==============================================

    if (transaksiSedangDiedit !== null) {

        const index =
            transaksi.findIndex(function (item) {

                return item.id === transaksiSedangDiedit;
            });


        if (index !== -1) {

            transaksi[index].tanggal = tanggal;

            transaksi[index].keterangan =
                keterangan;

            transaksi[index].jenis =
                jenis;

            transaksi[index].jumlah =
                jumlah;
        }


        transaksiSedangDiedit = null;


        document.getElementById(
            "saveButton"
        ).textContent =
            "Simpan Transaksi";


        document.getElementById(
            "cancelButton"
        ).style.display =
            "none";


        simpanData(transaksi);

        tampilkanTransaksi();

        tampilkanSaldo();

        kosongkanForm();

        alert("Transaksi berhasil diperbarui.");

        return;
    }


    // ==============================================
    // TRANSAKSI BARU
    // ==============================================

    const transaksiBaru = {

        id: Date.now(),

        tanggal: tanggal,

        keterangan: keterangan,

        jenis: jenis,

        jumlah: jumlah
    };


    transaksi.push(transaksiBaru);

    simpanData(transaksi);


    tampilkanTransaksi();

    tampilkanSaldo();

    kosongkanForm();


    alert("Transaksi berhasil disimpan.");
}


// ==================================================
// TAMPILKAN TRANSAKSI
// ==================================================

function tampilkanTransaksi() {

    const tbody =
        document.getElementById(
            "transactionTable"
        );


    const transaksi =
        ambilTransaksi();


    transaksi.sort(function (a, b) {

        if (a.tanggal === b.tanggal) {

            return Number(a.id) - Number(b.id);
        }

        return a.tanggal.localeCompare(
            b.tanggal
        );
    });


    tbody.innerHTML = "";


    if (transaksi.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="kosong"
                >
                    Belum ada transaksi
                </td>
            </tr>
        `;

        return;
    }


    transaksi.forEach(function (item, index) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${formatTanggal(item.tanggal)}
            </td>

            <td>
                ${escapeHTML(item.keterangan)}
            </td>

            <td>
                ${item.jenis}
            </td>

            <td>
                ${formatRupiah(item.jumlah)}
            </td>

            <td>

                <button
                    type="button"
                    class="btn-edit"
                    onclick="editTransaksi(${item.id})"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="btn-hapus"
                    onclick="hapusTransaksi(${item.id})"
                >
                    Hapus
                </button>

            </td>
        `;


        tbody.appendChild(row);

    });
}


// ==================================================
// TAMPILKAN SALDO
// ==================================================

function tampilkanSaldo() {

    const transaksi =
        ambilTransaksi();


    let pemasukan = 0;

    let pengeluaran = 0;


    transaksi.forEach(function (item) {

        const jumlah =
            Number(item.jumlah) || 0;


        if (item.jenis === "Pemasukan") {

            pemasukan += jumlah;
        }


        if (item.jenis === "Pengeluaran") {

            pengeluaran += jumlah;
        }

    });


    const saldo =
        pemasukan - pengeluaran;


    document.getElementById(
        "totalIncome"
    ).textContent =
        formatRupiah(pemasukan);


    document.getElementById(
        "totalExpense"
    ).textContent =
        formatRupiah(pengeluaran);


    document.getElementById(
        "balance"
    ).textContent =
        formatRupiah(saldo);
}


// ==================================================
// EDIT TRANSAKSI
// ==================================================

function editTransaksi(id) {

    const transaksi =
        ambilTransaksi();


    const item =
        transaksi.find(function (data) {

            return data.id === id;
        });


    if (!item) {
        return;
    }


    document.getElementById(
        "tanggal"
    ).value =
        item.tanggal;


    document.getElementById(
        "keterangan"
    ).value =
        item.keterangan;


    document.getElementById(
        "jenis"
    ).value =
        item.jenis;


    document.getElementById(
        "jumlah"
    ).value =
        item.jumlah;


    transaksiSedangDiedit =
        id;


    document.getElementById(
        "saveButton"
    ).textContent =
        "Simpan Perubahan";


    document.getElementById(
        "cancelButton"
    ).style.display =
        "block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==================================================
// BATAL EDIT
// ==================================================

function batalEdit() {

    transaksiSedangDiedit = null;


    document.getElementById(
        "saveButton"
    ).textContent =
        "Simpan Transaksi";


    document.getElementById(
        "cancelButton"
    ).style.display =
        "none";


    kosongkanForm();

}


// ==================================================
// HAPUS TRANSAKSI
// ==================================================

function hapusTransaksi(id) {

    const yakin =
        confirm(
            "Apakah transaksi ini ingin dihapus?"
        );


    if (!yakin) {
        return;
    }


    let transaksi =
        ambilTransaksi();


    transaksi =
        transaksi.filter(function (item) {

            return item.id !== id;
        });


    simpanData(transaksi);


    tampilkanTransaksi();

    tampilkanSaldo();


    alert("Transaksi berhasil dihapus.");
}


// ==================================================
// KOSONGKAN FORM
// ==================================================

function kosongkanForm() {

    document.getElementById(
        "keterangan"
    ).value = "";


    document.getElementById(
        "jenis"
    ).value = "";


    document.getElementById(
        "jumlah"
    ).value = "";


    isiTanggalHariIni();
}


// ==================================================
// FORMAT TANGGAL
// ==================================================

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }


    const bagian =
        tanggal.split("-");


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


// ==================================================
// FORMAT RUPIAH
// ==================================================

function formatRupiah(angka) {

    return (
        "Rp " +
        Number(angka || 0)
            .toLocaleString("id-ID")
    );
}


// ==================================================
// AMANKAN TEKS
// ==================================================

function escapeHTML(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}