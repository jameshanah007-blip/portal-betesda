// ==================================================
// LAPORAN KEUANGAN PEMUDA
// ==================================================

const STORAGE_KEY = "transaksi_pemuda";

let laporanData = [];


// ==================================================
// SAAT HALAMAN DIBUKA
// ==================================================

document.addEventListener("DOMContentLoaded", function () {

    isiPeriodeDefault();

    tampilkanLaporan();

    const btnTampilkan =
        document.getElementById("btnTampilkan");

    if (btnTampilkan) {
        btnTampilkan.addEventListener(
            "click",
            tampilkanLaporan
        );
    }

    const btnExcel =
        document.getElementById("btnExcel");

    if (btnExcel) {
        btnExcel.addEventListener(
            "click",
            exportExcel
        );
    }

    const btnPdf =
        document.getElementById("btnPdf");

    if (btnPdf) {
        btnPdf.addEventListener(
            "click",
            exportPDF
        );
    }

});


// ==================================================
// AMBIL TRANSAKSI
// ==================================================

function ambilTransaksi() {

    const data =
        localStorage.getItem(STORAGE_KEY);

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
        document.getElementById("bulanMulai");

    const bulanSampai =
        document.getElementById("bulanSampai");

    if (!bulanMulai || !bulanSampai) {
        return;
    }

    const sekarang = new Date();

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
                    Number(a.id || 0) -
                    Number(b.id || 0)
                );
            }

            return String(
                a.tanggal || ""
            ).localeCompare(
                String(
                    b.tanggal || ""
                )
            );
        }
    );


    // ==============================================
    // HITUNG SALDO BULAN LALU
    // ==============================================

    let saldoAwal = 0;

    semuaTransaksi.forEach(
        function (item) {

            if (
                item.tanggal &&
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
    // FILTER TRANSAKSI
    // ==============================================

    laporanData =
        semuaTransaksi.filter(
            function (item) {

                if (!item.tanggal) {
                    return false;
                }

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

    const footer =
        document.getElementById(
            "laporanFooter"
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


    // ==============================================
    // PERIODE
    // ==============================================

    if (periodeLaporan) {

        periodeLaporan.textContent =
            formatPeriode(
                bulanMulai,
                bulanSampai
            );
    }


    // ==============================================
    // SALDO BULAN LALU
    // ==============================================

    if (saldoAwalElement) {

        saldoAwalElement.textContent =
            formatRupiah(
                saldoAwal
            );
    }


    // ==============================================
    // KOSONGKAN TABEL
    // ==============================================

    if (tbody) {
        tbody.innerHTML = "";
    }

    if (footer) {
        footer.innerHTML = "";
    }


    // ==============================================
    // VARIABEL TOTAL
    // ==============================================

    let saldoBerjalan =
        saldoAwal;

    let jumlahPemasukan =
        0;

    let jumlahPengeluaran =
        0;


    // ==============================================
    // TIDAK ADA TRANSAKSI
    // ==============================================

    if (transaksi.length === 0) {

        if (tbody) {

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
        }

        if (totalPemasukan) {

            totalPemasukan.textContent =
                formatRupiah(0);
        }

        if (totalPengeluaran) {

            totalPengeluaran.textContent =
                formatRupiah(0);
        }

        if (saldoAkhir) {

            saldoAkhir.textContent =
                formatRupiah(
                    saldoAwal
                );
        }

        if (footer) {

            footer.innerHTML = `
                <tr>

                    <td colspan="3">
                        <strong>TOTAL</strong>
                    </td>

                    <td>
                        <strong>
                            ${formatRupiah(0)}
                        </strong>
                    </td>

                    <td>
                        <strong>
                            ${formatRupiah(0)}
                        </strong>
                    </td>

                    <td>
                        <strong>
                            ${formatRupiah(
                                saldoAwal
                            )}
                        </strong>
                    </td>

                </tr>
            `;
        }

        return;
    }


    // ==============================================
    // TAMPILKAN TRANSAKSI
    // ==============================================

    transaksi.forEach(
        function (item, index) {

            const jumlah =
                Number(item.jumlah) || 0;

            let pemasukan = 0;

            let pengeluaran = 0;


            // ==========================================
            // PEMASUKAN
            // ==========================================

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


            // ==========================================
            // PENGELUARAN
            // ==========================================

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


            // ==========================================
            // BUAT BARIS
            // ==========================================

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


            if (tbody) {

                tbody.appendChild(
                    row
                );
            }

        }
    );


    // ==============================================
    // TOTAL DI BAWAH TABEL
    // ==============================================

    if (footer) {

        footer.innerHTML = `

            <tr>

                <td colspan="3">
                    <strong>TOTAL</strong>
                </td>

                <td>
                    <strong>
                        ${formatRupiah(
                            jumlahPemasukan
                        )}
                    </strong>
                </td>

                <td>
                    <strong>
                        ${formatRupiah(
                            jumlahPengeluaran
                        )}
                    </strong>
                </td>

                <td>
                    <strong>
                        ${formatRupiah(
                            saldoBerjalan
                        )}
                    </strong>
                </td>

            </tr>

        `;
    }


    // ==============================================
    // RINGKASAN
    // ==============================================

    if (totalPemasukan) {

        totalPemasukan.textContent =
            formatRupiah(
                jumlahPemasukan
            );
    }


    if (totalPengeluaran) {

        totalPengeluaran.textContent =
            formatRupiah(
                jumlahPengeluaran
            );
    }


    if (saldoAkhir) {

        saldoAkhir.textContent =
            formatRupiah(
                saldoBerjalan
            );
    }
}


// ==================================================
// FORMAT PERIODE
// ==================================================

function formatPeriode(
    bulanMulai,
    bulanSampai
) {

    const mulai =
        formatBulan(
            bulanMulai
        );

    const sampai =
        formatBulan(
            bulanSampai
        );

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
        Number(
            bagian[1]
        );

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
// FORMAT ANGKA
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


    // ==============================================
    // AMBIL INFORMASI LAPORAN
    // ==============================================

    const periode =
        document.getElementById(
            "periodeLaporan"
        ).textContent;

    const saldoAwal =
        document.getElementById(
            "saldoAwal"
        ).textContent;

    const totalPemasukan =
        document.getElementById(
            "totalPemasukan"
        ).textContent;

    const totalPengeluaran =
        document.getElementById(
            "totalPengeluaran"
        ).textContent;

    const saldoAkhir =
        document.getElementById(
            "saldoAkhir"
        ).textContent;


    // ==============================================
    // DATA EXCEL
    // ==============================================

    const dataExcel = [];


    dataExcel.push([
        "LAPORAN KEUANGAN"
    ]);


    dataExcel.push([
        "Persekutuan Pemuda GPIL Jemaat Betesda Purwosari"
    ]);


    dataExcel.push([
        periode
    ]);


    dataExcel.push([]);


    dataExcel.push([
        "Saldo Bulan Lalu:",
        saldoAwal
    ]);


    dataExcel.push([]);


    // ==============================================
    // HEADER TABEL
    // ==============================================

    dataExcel.push([
        "No",
        "Tanggal",
        "Keterangan",
        "Pemasukan",
        "Pengeluaran",
        "Saldo"
    ]);


    // ==============================================
    // ISI TRANSAKSI
    // ==============================================

    laporanData.forEach(
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
            }


            if (
                item.jenis ===
                "Pengeluaran"
            ) {

                pengeluaran =
                    jumlah;
            }


            // Cari saldo berjalan dari tabel HTML
            const rows =
                document.querySelectorAll(
                    "#laporanBody tr"
                );

            let saldo =
                "";

            if (rows[index]) {

                const cells =
                    rows[index]
                        .querySelectorAll("td");

                if (cells.length >= 6) {

                    saldo =
                        cells[5].textContent
                            .trim();
                }
            }


            dataExcel.push([

                index + 1,

                formatTanggal(
                    item.tanggal
                ),

                item.keterangan || "",

                pemasukan,

                pengeluaran,

                saldo

            ]);

        }
    );


    // ==============================================
    // TOTAL
    // ==============================================

    dataExcel.push([]);

    dataExcel.push([

        "",
        "",
        "TOTAL",

        totalPemasukan,

        totalPengeluaran,

        saldoAkhir

    ]);


    dataExcel.push([]);


    // ==============================================
    // RINGKASAN
    // ==============================================

    dataExcel.push([
        "Total Pemasukan",
        totalPemasukan
    ]);

    dataExcel.push([
        "Total Pengeluaran",
        totalPengeluaran
    ]);

    dataExcel.push([
        "Saldo Akhir",
        saldoAkhir
    ]);


    dataExcel.push([]);


    // ==============================================
    // MENGETAHUI
    // ==============================================

    dataExcel.push([
        "Mengetahui,"
    ]);


    dataExcel.push([
        "Ketua Persekutuan Pemuda"
    ]);


    dataExcel.push([
        "GPIL Jemaat Betesda Purwosari"
    ]);


    // ==============================================
    // BUAT WORKBOOK
    // ==============================================

    const worksheet =
        XLSX.utils.aoa_to_sheet(
            dataExcel
        );


    // Lebar kolom

    worksheet["!cols"] = [

        { wch: 8 },
        { wch: 15 },
        { wch: 35 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 }

    ];


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Laporan Pemuda"
    );


    // ==============================================
    // SIMPAN EXCEL
    // ==============================================

    XLSX.writeFile(
        workbook,
        "Laporan_Keuangan_Pemuda.xlsx"
    );
}


// ==================================================
// EXPORT PDF
// ==================================================

function exportPDF() {

    // ==============================================
    // CEK ADA DATA LAPORAN
    // ==============================================

    if (!laporanData || laporanData.length === 0) {

        alert(
            "Tidak ada isi laporan pada periode yang dipilih. PDF tidak dibuat."
        );

        return;
    }


    // ==============================================
    // CEK LIBRARY PDF
    // ==============================================

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


    // ==============================================
    // JUDUL — HANYA HALAMAN PERTAMA
    // ==============================================

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


    // ==============================================
    // PERIODE
    // ==============================================

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


    // ==============================================
    // SALDO BULAN LALU
    // ==============================================

    const saldoAwal =
        document.getElementById(
            "saldoAwal"
        ).textContent;


    doc.text(
        "Saldo Bulan Lalu: " +
        saldoAwal,
        14,
        38
    );


    // ==============================================
    // CEK PLUGIN TABLE
    // ==============================================

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


    // ==============================================
    // TABEL LAPORAN
    // ==============================================

    doc.autoTable({

        html: table,

        startY: 43,

        // Tabel otomatis lanjut ke halaman berikutnya
        pageBreak: "auto",

        // Header tabel diulang setiap halaman
        showHead: "everyPage",

        styles: {

            fontSize: 8,

            lineWidth: 0.2,

            lineColor: [
                120,
                120,
                120
            ]

        },

        headStyles: {

            fillColor: [
                31,
                78,
                121
            ],

            textColor: 255,

            halign: "center"

        },

        footStyles: {

            fillColor: [
                255,
                255,
                255
            ],

            textColor: 0,

            fontStyle: "bold",

            halign: "center"

        },

        columnStyles: {

            0: {
                halign: "center"
            },

            1: {
                halign: "center"
            },

            2: {
                halign: "left"
            },

            3: {
                halign: "center"
            },

            4: {
                halign: "center"
            },

            5: {
                halign: "center"
            }

        }

    });


    // ==============================================
    // MENGETAHUI
    // HANYA DI HALAMAN TERAKHIR
    // ==============================================

    let posisiAkhir = 0;


    if (doc.lastAutoTable) {

        posisiAkhir =
            doc.lastAutoTable.finalY + 12;

    } else {

        posisiAkhir = 100;

    }


    // ==============================================
    // CEK RUANG UNTUK MENGETAHUI
    // ==============================================

    // Tinggi halaman A4 landscape = 210 mm
    // Batas bawah kita beri ruang agar tidak terlalu mepet

    if (posisiAkhir > 175) {

        doc.addPage();

        posisiAkhir = 25;
    }


    // ==============================================
    // TULIS MENGETAHUI
    // ==============================================

    doc.setFontSize(10);


    doc.text(
        "Mengetahui,",
        220,
        posisiAkhir
    );


    doc.text(
        "Ketua Persekutuan Pemuda GPIL",
        220,
        posisiAkhir + 6
    );


    doc.text(
        "Jemaat Betesda Purwosari",
        220,
        posisiAkhir + 12
    );


    // ==============================================
    // SIMPAN PDF
    // ==============================================

    doc.save(
        "Laporan_Keuangan_Pemuda.pdf"
    );
}
