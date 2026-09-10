// ==================================================
// BUKU KAS PEMUDA - SUPABASE
// ==================================================

let transaksiSedangDiedit = null;
let daftarTransaksi = [];


// ==================================================
// SAAT HALAMAN DIBUKA
// ==================================================

document.addEventListener("DOMContentLoaded", async function () {
    isiTanggalHariIni();

    const form = document.getElementById("transactionForm");
    const inputJumlah = document.getElementById("jumlah");
    const tombolBatal = document.getElementById("cancelButton");

    if (form) {
        form.addEventListener("submit", simpanTransaksi);
    }

    if (inputJumlah) {
        inputJumlah.addEventListener("input", function () {
            let angka = this.value.replace(/\D/g, "");

            if (!angka) {
                this.value = "";
                return;
            }

            this.value = Number(angka).toLocaleString("id-ID");
        });
    }

    if (tombolBatal) {
        tombolBatal.addEventListener("click", batalEdit);
    }

    await muatData();
});


// ==================================================
// TANGGAL HARI INI
// ==================================================

function isiTanggalHariIni() {
    const inputTanggal = document.getElementById("tanggal");

    if (!inputTanggal) {
        return;
    }

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
// AMBIL DATA DARI SUPABASE
// ==================================================

async function ambilTransaksi() {
    const { data, error } = await supabaseClient
        .from("transaksi_pemuda")
        .select("*")
        .order("tanggal", { ascending: true })
        .order("id", { ascending: true });

    if (error) {
        console.error(
            "Gagal mengambil transaksi:",
            error
        );

        alert(
            "Gagal mengambil data dari Supabase.\n\n" +
            error.message
        );

        return [];
    }

    return data || [];
}


// ==================================================
// MUAT DATA
// ==================================================

async function muatData() {
    daftarTransaksi = await ambilTransaksi();

    tampilkanTransaksi();
    tampilkanSaldo();
}


// ==================================================
// SIMPAN TRANSAKSI
// ==================================================

async function simpanTransaksi(event) {
    event.preventDefault();

    const tanggal =
        document.getElementById("tanggal").value;

    const keterangan =
        document
            .getElementById("keterangan")
            .value
            .trim();

    const jenis =
        document.getElementById("jenis").value;

    const jumlahText =
        document.getElementById("jumlah").value;

    const jumlah =
        Number(
            jumlahText.replace(/\./g, "")
        );


    // ----------------------------------------------
    // VALIDASI
    // ----------------------------------------------

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


    // ----------------------------------------------
    // EDIT TRANSAKSI
    // ----------------------------------------------

    if (transaksiSedangDiedit !== null) {

        const { error } = await supabaseClient
            .from("transaksi_pemuda")
            .update({
                tanggal: tanggal,
                keterangan: keterangan,
                jenis: jenis,
                jumlah: jumlah
            })
            .eq("id", transaksiSedangDiedit);


        if (error) {
            console.error(
                "Gagal memperbarui transaksi:",
                error
            );

            alert(
                "Gagal memperbarui transaksi.\n\n" +
                error.message
            );

            return;
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

        kosongkanForm();

        await muatData();

        alert(
            "Transaksi berhasil diperbarui."
        );

        return;
    }


    // ----------------------------------------------
    // TRANSAKSI BARU
    // ----------------------------------------------

    const { error } = await supabaseClient
        .from("transaksi_pemuda")
        .insert({
            tanggal: tanggal,
            keterangan: keterangan,
            jenis: jenis,
            jumlah: jumlah
        });


    if (error) {
        console.error(
            "Gagal menyimpan transaksi:",
            error
        );

        alert(
            "Gagal menyimpan transaksi.\n\n" +
            error.message
        );

        return;
    }


    kosongkanForm();

    await muatData();

    alert(
        "Transaksi berhasil disimpan."
    );
}


// ==================================================
// TAMPILKAN TRANSAKSI
// ==================================================

function tampilkanTransaksi() {
    const tbody =
        document.getElementById(
            "transactionTable"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";


    if (daftarTransaksi.length === 0) {

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


    daftarTransaksi.forEach(
        function (item, index) {

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
                    ${escapeHTML(item.jenis)}
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
        }
    );
}


// ==================================================
// TAMPILKAN SALDO
// ==================================================

function tampilkanSaldo() {

    let pemasukan = 0;
    let pengeluaran = 0;


    daftarTransaksi.forEach(
        function (item) {

            const jumlah =
                Number(item.jumlah) || 0;

            const jenis =
                String(item.jenis)
                    .toLowerCase()
                    .trim();


            if (jenis === "pemasukan") {
                pemasukan += jumlah;
            }


            if (jenis === "pengeluaran") {
                pengeluaran += jumlah;
            }
        }
    );


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

    const item =
        daftarTransaksi.find(
            function (data) {
                return Number(data.id) === Number(id);
            }
        );


    if (!item) {
        alert("Data transaksi tidak ditemukan.");
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
        Number(item.jumlah).toLocaleString("id-ID");


    transaksiSedangDiedit =
        Number(id);


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

async function hapusTransaksi(id) {

    const yakin =
        confirm(
            "Apakah transaksi ini ingin dihapus?"
        );


    if (!yakin) {
        return;
    }


    const { error } = await supabaseClient
        .from("transaksi_pemuda")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(
            "Gagal menghapus transaksi:",
            error
        );

        alert(
            "Gagal menghapus transaksi.\n\n" +
            error.message
        );

        return;
    }


    await muatData();

    alert(
        "Transaksi berhasil dihapus."
    );
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
