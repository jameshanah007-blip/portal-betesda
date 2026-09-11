async function tampilkanPengumuman() {

    const container =
        document.getElementById("daftarPengumuman");

    container.innerHTML = `
        <div class="loading">
            Memuat dokumen...
        </div>
    `;

    const { data, error } =
        await supabaseClient
            .from("pengumuman")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(
            "ERROR PENGUMUMAN:",
            error
        );

        container.innerHTML = `
            <div class="error">
                Gagal memuat dokumen.<br><br>
                ${escapeHTML(error.message)}
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        container.innerHTML = `
            <div class="kosong">
                Belum ada dokumen atau informasi.
            </div>
        `;

        return;
    }


    container.innerHTML = data
        .map(item => buatKartu(item))
        .join("");
}


/* ==================================================
   BUAT KARTU
================================================== */

function buatKartu(item) {

    const namaFile =
        item.nama_asli ||
        item.nama_file ||
        "Dokumen";


    const jenisFile =
        getJenisFile(namaFile);


    const ukuran =
        formatUkuran(item.ukuran_file);


    const tanggal =
        formatTanggal(item.created_at);


    const url =
        item.url_file || "";


    return `

        <article
            class="kartu"
            onclick="bukaDokumen(
                ${escapeJS(JSON.stringify(item))}
            )"
        >

            <div class="kartu-header">


                <div
                    class="ikon-file ${jenisFile.className}"
                >
                    ${jenisFile.label}
                </div>


                <div class="kartu-info">

                    <h3>
                        ${escapeHTML(
                            item.judul ||
                            "Dokumen Jemaat"
                        )}
                    </h3>


                    <div class="tanggal">
                        ${tanggal}
                    </div>

                </div>

            </div>


            ${
                item.keterangan
                ?
                `
                <div class="keterangan">
                    ${escapeHTML(
                        item.keterangan
                    )}
                </div>
                `
                :
                ""
            }


            <div class="file-info">

                <span>
                    📎
                </span>

                <span class="file-name">
                    ${escapeHTML(namaFile)}
                </span>

                ${
                    ukuran
                    ?
                    `<span>• ${ukuran}</span>`
                    :
                    ""
                }

            </div>


            <div class="lihat-label">

                <span>
                    Buka dokumen
                </span>

                <span>
                    ›
                </span>

            </div>

        </article>
    `;
}


/* ==================================================
   BUKA DOKUMEN
================================================== */

function bukaDokumen(item) {

    const modal =
        document.getElementById("modal");

    const modalContent =
        document.getElementById(
            "modalContent"
        );

    const modalJudul =
        document.getElementById(
            "modalJudul"
        );

    const modalNamaFile =
        document.getElementById(
            "modalNamaFile"
        );

    const btnDownload =
        document.getElementById(
            "btnDownload"
        );


    const namaFile =
        item.nama_asli ||
        item.nama_file ||
        "Dokumen";


    const url =
        item.url_file || "";


    const jenis =
        getJenisFile(namaFile);


    modalJudul.textContent =
        item.judul ||
        "Dokumen Jemaat";


    modalNamaFile.textContent =
        namaFile;


    btnDownload.href =
        buatUrlDownload(
            url,
            namaFile
        );


    /*
       PDF
    */

    if (
        jenis.type === "pdf"
    ) {

        modalContent.innerHTML = `

            <iframe
                src="${escapeAttribute(url)}"
                title="${escapeAttribute(
                    namaFile
                )}"
            ></iframe>

        `;

    }


    /*
       GAMBAR
    */

    else if (
        jenis.type === "image"
    ) {

        modalContent.innerHTML = `

            <img
                src="${escapeAttribute(url)}"
                alt="${escapeAttribute(
                    namaFile
                )}"
            >

        `;

    }


    /*
       FILE LAIN
    */

    else {

        modalContent.innerHTML = `

            <div class="file-preview-info">

                <div class="preview-icon">
                    ${jenis.label}
                </div>

                <h3>
                    ${escapeHTML(namaFile)}
                </h3>

                <p>
                    Format file ini tidak dapat
                    ditampilkan langsung di browser.
                </p>

                <a
                    class="btn-buka-file"
                    href="${escapeAttribute(
                        buatUrlDownload(
                            url,
                            namaFile
                        )
                    )}"
                    target="_blank"
                    rel="noopener"
                >
                    Buka File
                </a>

            </div>

        `;
    }


    modal.classList.add("aktif");


    /*
       Mencegah halaman belakang
       ikut scroll di HP
    */

    document.body.style.overflow =
        "hidden";
}


/* ==================================================
   TUTUP MODAL
================================================== */

function tutupModal() {

    const modal =
        document.getElementById("modal");


    modal.classList.remove(
        "aktif"
    );


    document.body.style.overflow =
        "";


    document.getElementById(
        "modalContent"
    ).innerHTML = "";
}


/* ==================================================
   KLIK AREA LUAR
================================================== */

function tutupModalJikaKlikLuar(
    event
) {

    if (
        event.target.id === "modal"
    ) {

        tutupModal();

    }
}


/* ==================================================
   URL DOWNLOAD
================================================== */

function buatUrlDownload(
    url,
    namaFile
) {

    if (!url) {
        return "#";
    }


    const separator =
        url.includes("?")
        ? "&"
        : "?";


    return (
        url +
        separator +
        "download=" +
        encodeURIComponent(
            namaFile
        )
    );
}


/* ==================================================
   JENIS FILE
================================================== */

function getJenisFile(
    namaFile
) {

    const nama =
        namaFile.toLowerCase();


    /*
       PDF
    */

    if (
        nama.endsWith(".pdf")
    ) {

        return {
            type: "pdf",
            label: "PDF",
            className: "file-pdf"
        };

    }


    /*
       WORD
    */

    if (
        nama.endsWith(".doc") ||
        nama.endsWith(".docx") ||
        nama.endsWith(".odt") ||
        nama.endsWith(".rtf")
    ) {

        return {
            type: "word",
            label: "WORD",
            className: "file-word"
        };

    }


    /*
       EXCEL
    */

    if (
        nama.endsWith(".xls") ||
        nama.endsWith(".xlsx") ||
        nama.endsWith(".ods") ||
        nama.endsWith(".csv")
    ) {

        return {
            type: "excel",
            label: "EXCEL",
            className: "file-excel"
        };

    }


    /*
       POWERPOINT
    */

    if (
        nama.endsWith(".ppt") ||
        nama.endsWith(".pptx") ||
        nama.endsWith(".odp")
    ) {

        return {
            type: "ppt",
            label: "PPT",
            className: "file-ppt"
        };

    }


    /*
       GAMBAR
    */

    if (
        nama.endsWith(".jpg") ||
        nama.endsWith(".jpeg") ||
        nama.endsWith(".png") ||
        nama.endsWith(".gif") ||
        nama.endsWith(".webp") ||
        nama.endsWith(".svg")
    ) {

        return {
            type: "image",
            label: "IMAGE",
            className: "file-image"
        };

    }


    /*
       ZIP
    */

    if (
        nama.endsWith(".zip") ||
        nama.endsWith(".rar") ||
        nama.endsWith(".7z")
    ) {

        return {
            type: "archive",
            label: "ZIP",
            className: "file-zip"
        };

    }


    /*
       FILE LAIN
    */

    return {
        type: "other",
        label: "FILE",
        className: "file-other"
    };
}


/* ==================================================
   FORMAT UKURAN
================================================== */

function formatUkuran(
    bytes
) {

    if (
        !bytes ||
        bytes <= 0
    ) {

        return "";

    }


    if (
        bytes < 1024
    ) {

        return (
            bytes +
            " B"
        );

    }


    if (
        bytes <
        1024 * 1024
    ) {

        return (
            (bytes / 1024)
                .toFixed(1) +
            " KB"
        );

    }


    return (
        (bytes /
            (1024 * 1024)
        ).toFixed(1) +
        " MB"
    );
}


/* ==================================================
   FORMAT TANGGAL
================================================== */

function formatTanggal(
    tanggal
) {

    if (!tanggal) {
        return "-";
    }


    const d =
        new Date(tanggal);


    return d.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


/* ==================================================
   ESCAPE HTML
================================================== */

function escapeHTML(
    value
) {

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


/* ==================================================
   ESCAPE ATTRIBUTE
================================================== */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );
}


/* ==================================================
   ESCAPE JAVASCRIPT
================================================== */

function escapeJS(
    value
) {

    return String(value)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /\r/g,
            "\\r"
        )
        .replace(
            /\n/g,
            "\\n"
        );
}


/* ==================================================
   JALANKAN
================================================== */

tampilkanPengumuman();
