// ==================================================
// BUKU KAS PEMUDA - SUPABASE
// ==================================================

let transaksiSedangDiedit = null;
let daftarTransaksi = [];

// Pengunci agar transaksi tidak tersimpan dua kali
let sedangMenyimpan = false;


// ==================================================
// SAAT HALAMAN DIBUKA
// ==================================================

document.addEventListener("DOMContentLoaded", async function () {

    isiTanggalHariIni();

    const form =
        document.getElementById("transactionForm");

    const inputJumlah =
        document.getElementById("jumlah");

    const tombolBatal =
        document.getElementById("cancelButton");


    // ----------------------------------------------
    // FORM SUBMIT
    // ----------------------------------------------

    if (form) {

        form.addEventListener(
            "submit",
            simpanTransaksi
        );
    }


    // ----------------------------------------------
    // FORMAT JUMLAH
    // ----------------------------------------------

    if (inputJumlah) {

        inputJumlah.addEventListener(
            "input",
            function () {

                let angka =
                    this.value.replace(/\D/g, "");


                if (!angka) {

                    this.value = "";

                    return;
                }


                this.value =
                    Number(angka).toLocaleString(
                        "id-ID"
                    );
            }
        );
    }


    // ----------------------------------------------
    // TOMBOL BATAL
    // ----------------------------------------------

    if (tombolBatal) {

        tombolBatal.addEventListener(
            "click",
            batalEdit
        );
    }


    // ----------------------------------------------
    // MUAT DATA
    // ----------------------------------------------

    await muatData();
});


// ==================================================
// TANGGAL HARI INI
// ==================================================

function isiTanggalHariIni() {

    const inputTanggal =
        document.getElementById("tanggal");


    if (!inputTanggal) {
        return;
    }


    if (!inputTanggal.value) {

        const sekarang =
            new Date();


        const tahun =
            sekarang.getFullYear();


        const bulan =
            String(
                sekarang.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const tanggal =
            String(
                sekarang.getDate()
            ).padStart(
                2,
                "0"
            );


        inputTanggal.value =
            tahun +
            "-" +
            bulan +
            "-" +
            tanggal;
    }
}


// ==================================================
// AMBIL DATA DARI SUPABASE
// ==================================================

async function ambilTransaksi() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        alert(
            "Supabase belum terhubung."
        );

        console.error(
            "supabaseClient tidak ditemukan."
        );

        return [];
    }


    const {
        data,
        error
    } = await supabaseClient

        .from("transaksi_pemuda")

        .select("*")

        .order(
            "tanggal",
            {
                ascending: true
            }
        )

        .order(
            "id",
            {
                ascending: true
            }
        );


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

    daftarTransaksi =
        await ambilTransaksi();


    tampilkanTransaksi();

    tampilkanSaldo();
}


// ==================================================
// SIMPAN TRANSAKSI
// ==================================================

async function simpanTransaksi(event) {

    // ----------------------------------------------
    // CEGAH SUBMIT BAWAAN BROWSER
    // ----------------------------------------------

    if (event) {

        event.preventDefault();
    }


    // ----------------------------------------------
    // CEGAH KLIK BERULANG
    // ----------------------------------------------

    if (sedangMenyimpan) {

        console.log(
            "Penyimpanan masih berlangsung. Klik diabaikan."
        );

        return;
    }


    // ----------------------------------------------
    // KUNCI PROSES
    // ----------------------------------------------

    sedangMenyimpan = true;


    const tombolSimpan =
        document.getElementById(
            "saveButton"
        );


    // Nonaktifkan tombol sementara
    if (tombolSimpan) {

        tombolSimpan.disabled = true;

        tombolSimpan.textContent =
            transaksiSedangDiedit !== null
                ? "Menyimpan Perubahan..."
                : "Menyimpan...";
    }


    try {

        // ------------------------------------------
        // AMBIL FORM
        // ------------------------------------------

        const tanggalElement =
            document.getElementById(
                "tanggal"
            );


        const keteranganElement =
            document.getElementById(
                "keterangan"
            );


        const jenisElement =
            document.getElementById(
                "jenis"
            );


        const jumlahElement =
            document.getElementById(
                "jumlah"
            );


        if (
            !tanggalElement ||
            !keteranganElement ||
            !jenisElement ||
            !jumlahElement
        ) {

            alert(
                "Form transaksi tidak lengkap."
            );

            return;
        }


        // ------------------------------------------
        // AMBIL NILAI
        // ------------------------------------------

        const tanggal =
            tanggalElement.value;


        const keterangan =
            keteranganElement.value.trim();


        const jenis =
            jenisElement.value;


        const jumlahText =
            jumlahElement.value;


        // ------------------------------------------
        // KONVERSI JUMLAH
        // ------------------------------------------

        const jumlah =
            Number(
                jumlahText.replace(
                    /\D/g,
                    ""
                )
            );


        // ------------------------------------------
        // VALIDASI
        // ------------------------------------------

        if (!tanggal) {

            alert(
                "Tanggal harus diisi."
            );

            return;
        }


        if (!keterangan) {

            alert(
                "Keterangan harus diisi."
            );

            return;
        }


        if (!jenis) {

            alert(
                "Silakan pilih jenis transaksi."
            );

            return;
        }


        if (
            !jumlah ||
            jumlah <= 0
        ) {

            alert(
                "Jumlah harus lebih dari 0."
            );

            return;
        }


        // ------------------------------------------
        // CEK SUPABASE
        // ------------------------------------------

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            alert(
                "Supabase belum terhubung."
            );

            return;
        }


        // ==========================================
        // EDIT TRANSAKSI
        // ==========================================

        if (
            transaksiSedangDiedit !==
            null
        ) {

            const {
                error
            } = await supabaseClient

                .from(
                    "transaksi_pemuda"
                )

                .update({

                    tanggal:
                        tanggal,

                    keterangan:
                        keterangan,

                    jenis:
                        jenis,

                    jumlah:
                        jumlah

                })

                .eq(
                    "id",
                    transaksiSedangDiedit
                );


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


            transaksiSedangDiedit =
                null;


            const tombolBatal =
                document.getElementById(
                    "cancelButton"
                );


            if (tombolBatal) {

                tombolBatal.style.display =
                    "none";
            }


            kosongkanForm();

            await muatData();


            alert(
                "Transaksi berhasil diperbarui."
            );


            return;
        }


        // ==========================================
        // TRANSAKSI BARU
        // ==========================================

        const {
            error
        } = await supabaseClient

            .from(
                "transaksi_pemuda"
            )

            .insert({

                tanggal:
                    tanggal,

                keterangan:
                    keterangan,

                jenis:
                    jenis,

                jumlah:
                    jumlah

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


        // ------------------------------------------
        // BERHASIL
        // ------------------------------------------

        kosongkanForm();

        await muatData();


        alert(
            "Transaksi berhasil disimpan."
        );

    }

    catch (error) {

        console.error(
            "Terjadi kesalahan:",
            error
        );


        alert(
            "Terjadi kesalahan saat menyimpan transaksi.\n\n" +
            error.message
        );

    }

    finally {

        // ------------------------------------------
        // BUKA KEMBALI KUNCI
        // ------------------------------------------

        sedangMenyimpan = false;


        if (tombolSimpan) {

            tombolSimpan.disabled =
                false;


            if (
                transaksiSedangDiedit !==
                null
            ) {

                tombolSimpan.textContent =
                    "Simpan Perubahan";

            } else {

                tombolSimpan.textContent =
                    "Simpan Transaksi";
            }
        }
    }
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


    if (
        daftarTransaksi.length ===
        0
    ) {

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
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${formatTanggal(
                        item.tanggal
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        item.keterangan
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        item.jenis
                    )}
                </td>

                <td>
                    ${formatRupiah(
                        item.jumlah
                    )}
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


            tbody.appendChild(
                row
            );
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
                Number(
                    item.jumlah
                ) || 0;


            const jenis =
                String(
                    item.jenis
                )
                    .toLowerCase()
                    .trim();


            if (
                jenis ===
                "pemasukan"
            ) {

                pemasukan +=
                    jumlah;
            }


            if (
                jenis ===
                "pengeluaran"
            ) {

                pengeluaran +=
                    jumlah;
            }
        }
    );


    const saldo =
        pemasukan -
        pengeluaran;


    const totalIncome =
        document.getElementById(
            "totalIncome"
        );


    const totalExpense =
        document.getElementById(
            "totalExpense"
        );


    const balance =
        document.getElementById(
            "balance"
        );


    if (totalIncome) {

        totalIncome.textContent =
            formatRupiah(
                pemasukan
            );
    }


    if (totalExpense) {

        totalExpense.textContent =
            formatRupiah(
                pengeluaran
            );
    }


    if (balance) {

        balance.textContent =
            formatRupiah(
                saldo
            );
    }
}


// ==================================================
// EDIT TRANSAKSI
// ==================================================

function editTransaksi(id) {

    const item =
        daftarTransaksi.find(
            function (data) {

                return (
                    Number(data.id) ===
                    Number(id)
                );
            }
        );


    if (!item) {

        alert(
            "Data transaksi tidak ditemukan."
        );

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
        Number(
            item.jumlah
        ).toLocaleString(
            "id-ID"
        );


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

    // Jangan lakukan pembatalan
    // ketika sedang menyimpan
    if (sedangMenyimpan) {
        return;
    }


    transaksiSedangDiedit =
        null;


    const tombolSimpan =
        document.getElementById(
            "saveButton"
        );


    if (tombolSimpan) {

        tombolSimpan.textContent =
            "Simpan Transaksi";
    }


    const tombolBatal =
        document.getElementById(
            "cancelButton"
        );


    if (tombolBatal) {

        tombolBatal.style.display =
            "none";
    }


    kosongkanForm();
}


// ==================================================
// HAPUS TRANSAKSI
// ==================================================

async function hapusTransaksi(id) {

    if (sedangMenyimpan) {
        return;
    }


    const yakin =
        confirm(
            "Apakah transaksi ini ingin dihapus?"
        );


    if (!yakin) {
        return;
    }


    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        alert(
            "Supabase belum terhubung."
        );

        return;
    }


    const {
        error
    } = await supabaseClient

        .from(
            "transaksi_pemuda"
        )

        .delete()

        .eq(
            "id",
            id
        );


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

    const keterangan =
        document.getElementById(
            "keterangan"
        );


    const jenis =
        document.getElementById(
            "jenis"
        );


    const jumlah =
        document.getElementById(
            "jumlah"
        );


    if (keterangan) {

        keterangan.value =
            "";
    }


    // Dropdown kembali kosong
    if (jenis) {

        jenis.value =
            "";
    }


    if (jumlah) {

        jumlah.value =
            "";
    }


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
        String(tanggal)
            .substring(0, 10)
            .split("-");


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


// ==================================================
// FORMAT RUPIAH
// ==================================================

function formatRupiah(angka) {
    return Number(
        angka || 0
    ).toLocaleString(
        "id-ID"
    );
}


// ==================================================
// AMANKAN TEKS
// ==================================================

function escapeHTML(text) {

    return String(
        text || ""
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
