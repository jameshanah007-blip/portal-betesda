// ==================================================
// LAPORAN KEUANGAN PEMUDA
// ==================================================

const STORAGE_KEY = "transaksi_pemuda";

let laporanData = [];


// ==================================================
// SAAT HALAMAN DIBUKA
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        isiPeriodeDefault();

        tampilkanLaporan();


        const btnTampilkan =
            document.getElementById(
                "btnTampilkan"
            );

        btnTampilkan.addEventListener(
            "click",
            tampilkanLaporan
        );


        const btnExcel =
            document.getElementById(
                "btnExcel"
            );

        btnExcel.addEventListener(
            "click",
            exportExcel
        );


        const btnPdf =
            document.getElementById(
                "btnPdf"
            );

        btnPdf.addEventListener(
            "click",
            exportPDF
        );

    }
);


// ==================================================
// AMBIL TRANSAKSI
// ==================================================

function ambilTransaksi() {

    const data =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!data) {
        return [];
    }


    try {

        const transaksi =
            JSON.parse(data);


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
// PERIODE DEFAULT
// ==================================================

function isiPeriodeDefault() {

    const bulanMulai =
        document.getElementById(
            "bulanMulai"
        );


    const bulanSampai =
        document.getElementById(
            "bulanSampai"
        );


    const sekarang =
        new Date();


    const tahun =
        sekarang.getFullYear();


    const bulan =
        String(
            sekarang.getMonth() + 1
        ).padStart(2, "0");


    const periode =
        tahun + "-" + bulan;


    bulanMulai.value =
        periode;


    bulanSampai.value =
        periode;
}


// ==================================================
// TAMPILKAN LAPORAN
// ==================================================

function tampilkanLaporan() {

    const bulanMulai =
        document.getElementById(
            "bulanMulai"
        ).value;


    const bulanSampai =
        document.getElementById(
            "bulanSampai"
        ).value;


    if (!bulanMulai || !bulanSampai) {

        alert(
            "Silakan pilih periode laporan."
        );

        return;
    }


    if (bulanMulai > bulanSampai) {

        alert(
            "Bulan mulai tidak boleh lebih besar dari bulan sampai."
        );

        return;
    }


    const semuaTransaksi =
        ambilTransaksi();


    semuaTransaksi.sort(
        function (a, b) {

            if (a.tanggal === b.tanggal) {

                return (
                    Number(a.id) -
                    Number(b.id)
                );
            }


            return a.tanggal.localeCompare(
                b.tanggal
            );
        }
    );


    // ==============================================
    // HITUNG SALDO AWAL
    // ==============================================

    let saldoAwal = 0;


    semuaTransaksi.forEach(
        function (item) {

            if (
                item.tanggal <
                bulanMulai + "-01"
            ) {

                const jumlah =
                    Number(item.jumlah) || 0;


                if (
                    item.jenis ===
                    "Pemasukan"
                ) {

                    saldoAwal += jumlah;
                }


                if (
                    item.jenis ===
                    "Pengeluaran"
                ) {

                    saldoAwal -= jumlah;
                }
            }

        }
    );


    // ==============================================
    // FILTER PERIODE
    // ==============================================

    laporanData =
        semuaTransaksi.filter(
            function (item) {

                const bulanTransaksi =
                    item.tanggal.substring(
                        0,
                        7
                    );


                return (
                    bulanTransaksi >=
                        bulanMulai &&
                    bulanTransaksi <=
                        bulanSampai
                );
            }
        );


    renderLaporan(
        laporanData,
        saldoAwal,
        bulanMulai,
        bulanSampai
    );
}


// ==================================================
// RENDER LAPORAN
// ==================================================

function renderLaporan(
    transaksi,
    saldoAwal,
    bulanMulai,
    bulanSampai
) {

    const tbody =
        document.getElementById(
            "laporanBody"
        );


    const periodeLaporan =
        document.getElementById(
            "periodeLaporan"
        );


    const saldoAwalElement =
        document.getElementById(
            "saldoAwal"
        );


    const totalPemasukan =
        document.getElementById(
            "totalPemasukan"
        );


    const totalPengeluaran =
        document.getElementById(
            "totalPengeluaran"
        );


    const saldoAkhir =
        document.getElementById(
            "saldoAkhir"
        );


    periodeLaporan.textContent =
        formatPeriode(
            bulanMulai,
            bulanSampai
        );


    saldoAwalElement.textContent =
        formatRupiah(saldoAwal);


    tbody.innerHTML = "";


    // ==============================================
    // TIDAK ADA TRANSAKSI
    // ==============================================

    if (transaksi.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="kosong"
                >
                    Tidak ada transaksi pada periode ini
                </td>

            </tr>

        `;


        totalPemasukan.textContent =
            formatRupiah(0);


        totalPengeluaran.textContent =
            formatRupiah(0);


        saldoAkhir.textContent =
            formatRupiah(saldoAwal);


        return;
    }


    // ==============================================
    // HITUNG
    // ==============================================

    let saldoBerjalan =
        saldoAwal;


    let jumlahPemasukan =
        0;


    let jumlahPengeluaran =
        0;


    transaksi.forEach(
        function (item, index) {

            const jumlah =
                Number(item.jumlah) || 0;


            let pemasukan = 0;

            let pengeluaran = 0;


            if (
                item.jenis ===
                "Pemasukan"
            ) {

                pemasukan =
                    jumlah;

                jumlahPemasukan +=
                    jumlah;

                saldoBerjalan +=
                    jumlah;
            }


            if (
                item.jenis ===
                "Pengeluaran"
            ) {

                pengeluaran =
                    jumlah;

                jumlahPengeluaran +=
                    jumlah;

                saldoBerjalan -=
                    jumlah;
            }


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

                <td class="keterangan">
                    ${escapeHTML(
                        item.keterangan
                    )}
                </td>

                <td>
                    ${
                        pemasukan > 0
                            ? formatRupiah(
                                pemasukan
                            )
                            : "-"
                    }
                </td>

                <td>
                    ${
                        pengeluaran > 0
                            ? formatRupiah(
                                pengeluaran
                            )
                            : "-"
                    }
                </td>

                <td>
                    ${formatRupiah(
                        saldoBerjalan
                    )}
                </td>

            `;


            tbody.appendChild(row);

        }
    );


    totalPemasukan.textContent =
        formatRupiah(
            jumlahPemasukan
        );


    totalPengeluaran.textContent =
        formatRupiah(
            jumlahPengeluaran
        );


    saldoAkhir.textContent =
        formatRupiah(
            saldoBerjalan
        );
}


// ==================================================
// FORMAT PERIODE
// ==================================================

function formatPeriode(
    bulanMulai,
    bulanSampai
) {

    const mulai =
        formatBulan(bulanMulai);


    const sampai =
        formatBulan(bulanSampai);


    if (
        bulanMulai ===
        bulanSampai
    ) {

        return mulai;
    }


    return (
        mulai +
        " - " +
        sampai
    );
}


// ==================================================
// FORMAT BULAN
// ==================================================

function formatBulan(value) {

    if (!value) {
        return "-";
    }


    const bagian =
        value.split("-");


    if (bagian.length !== 2) {
        return value;
    }


    const namaBulan = [

        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"

    ];


    const tahun =
        bagian[0];


    const nomorBulan =
        Number(bagian[1]);


    return (
        namaBulan[
            nomorBulan - 1
        ] +
        " " +
        tahun
    );
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


// ==================================================
// EXPORT EXCEL
// ==================================================

function exportExcel() {

    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "Library Excel belum tersedia."
        );

        return;
    }


    const table =
        document.getElementById(
            "laporanTable"
        );


    const workbook =
        XLSX.utils.table_to_book(
            table,
            {
                sheet:
                    "Laporan Pemuda"
            }
        );


    XLSX.writeFile(
        workbook,
        "Laporan_Keuangan_Pemuda.xlsx"
    );
}


// ==================================================
// EXPORT PDF
// ==================================================

function exportPDF() {

    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        alert(
            "Library PDF belum tersedia."
        );

        return;
    }


    const jsPDF =
        window.jspdf.jsPDF;


    const doc =
        new jsPDF(
            "landscape",
            "mm",
            "a4"
        );


    doc.setFontSize(14);


    doc.text(
        "LAPORAN KEUANGAN",
        148,
        15,
        {
            align: "center"
        }
    );


    doc.setFontSize(10);


    doc.text(
        "Persekutuan Pemuda GPIL Jemaat Betesda Purwosari",
        148,
        22,
        {
            align: "center"
        }
    );


    const periode =
        document.getElementById(
            "periodeLaporan"
        ).textContent;


    doc.text(
        periode,
        148,
        29,
        {
            align: "center"
        }
    );


    const saldoAwal =
        document.getElementById(
            "saldoAwal"
        ).textContent;


    doc.text(
        "Saldo Awal: " + saldoAwal,
        14,
        38
    );


    const table =
        document.getElementById(
            "laporanTable"
        );


    if (
        typeof doc.autoTable !==
        "function"
    ) {

        alert(
            "Plugin PDF Table belum tersedia."
        );

        return;
    }


    doc.autoTable({

        html: table,

        startY: 43,

        styles: {
            fontSize: 8
        },

        headStyles: {
            fillColor: [
                31,
                78,
                121
            ]
        }

    });


    doc.save(
        "Laporan_Keuangan_Pemuda.pdf"
    );
}