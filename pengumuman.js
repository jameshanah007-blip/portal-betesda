// =====================================================
// DATA GLOBAL
// =====================================================

let daftarDataPengumuman = [];


// =====================================================
// AMBIL DATA DARI SUPABASE
// =====================================================

async function ambilPengumuman() {

    const container =
        document.getElementById("daftarPengumuman");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="state-message">
            <div class="state-icon">📄</div>

            <h3>
                Memuat dokumen...
            </h3>

            <p>
                Mohon tunggu sebentar.
            </p>
        </div>
    `;


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("pengumuman")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {
            throw error;
        }


        daftarDataPengumuman =
            Array.isArray(data)
                ? data
                : [];


        tampilkanPengumuman();

    } catch (error) {

        console.error(
            "Gagal mengambil pengumuman:",
            error
        );


        container.innerHTML = `
            <div class="state-message">

                <div class="state-icon">
                    ⚠️
                </div>

                <h3>
                    Dokumen belum dapat dimuat
                </h3>

                <p>
                    Silakan coba lagi beberapa saat.
                </p>

            </div>
        `;
    }
}


// =====================================================
// TAMPILKAN DATA
// =====================================================

function tampilkanPengumuman() {

    const container =
        document.getElementById("daftarPengumuman");


    if (!container) {
        return;
    }


    if (
        !daftarDataPengumuman ||
        daftarDataPengumuman.length === 0
    ) {

        container.innerHTML = `
            <div class="state-message">

                <div class="state-icon">
                    📂
                </div>

                <h3>
                    Belum ada dokumen
                </h3>

                <p>
                    Dokumen jemaat akan ditampilkan di sini.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        daftarDataPengumuman
            .map(
                (item) =>
                    buatCardDokumen(item)
            )
            .join("");
}


// =====================================================
// BUAT CARD DOKUMEN
// =====================================================

function buatCardDokumen(item) {

    const id =
        item?.id ?? "";


    const nama =
        item?.nama_asli ||
        item?.nama_file ||
        "Dokumen";


    const jenis =
        getJenisFile(nama);


    const format =
        getLabelFormat(jenis);


    const icon =
        getIconFile(jenis);


    const ukuran =
        formatUkuran(
            item?.ukuran_file
        );


    const tanggal =
        formatTanggal(
            item?.created_at
        );


    const meta = [
        format,
        tanggal,
        ukuran
    ]
        .filter(Boolean)
        .join(" • ");


    return `
        <article
            class="dokumen-card"
            data-id="${escapeAttribute(id)}"
            tabindex="0"
            role="button"
            aria-label="Buka ${escapeHtml(nama)}"
        >

            <div
                class="file-icon ${jenis}"
                aria-hidden="true"
            >
                ${icon}
            </div>


            <div class="dokumen-info">

                <h2 class="dokumen-title">
                    ${escapeHtml(nama)}
                </h2>


                <div class="dokumen-meta">

                    <span
                        class="format-badge ${jenis}"
                    >
                        ${escapeHtml(format)}
                    </span>

                    ${
                        tanggal
                            ? `<span>${escapeHtml(tanggal)}</span>`
                            : ""
                    }

                    ${
                        ukuran
                            ? `<span>${escapeHtml(ukuran)}</span>`
                            : ""
                    }

                </div>

            </div>


            <div
                class="open-arrow"
                aria-hidden="true"
            >
                ›
            </div>

        </article>
    `;
}


// =====================================================
// EVENT DELEGATION
// Lebih aman daripada onclick inline
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        const card =
            event.target.closest(
                ".dokumen-card"
            );


        if (!card) {
            return;
        }


        const id =
            card.dataset.id;


        if (!id) {
            return;
        }


        const item =
            daftarDataPengumuman.find(
                (data) =>
                    String(data.id) ===
                    String(id)
            );


        if (item) {
            bukaDokumen(item);
        }
    }
);


// =====================================================
// SUPPORT KEYBOARD
// =====================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Enter" &&
            event.key !== " "
        ) {
            return;
        }


        const card =
            event.target.closest(
                ".dokumen-card"
            );


        if (!card) {
            return;
        }


        event.preventDefault();


        const id =
            card.dataset.id;


        const item =
            daftarDataPengumuman.find(
                (data) =>
                    String(data.id) ===
                    String(id)
            );


        if (item) {
            bukaDokumen(item);
        }
    }
);


// =====================================================
// BUKA DOKUMEN BERDASARKAN ID
// Bisa dipanggil dari tempat lain jika diperlukan
// =====================================================

function bukaDokumenById(id) {

    const item =
        daftarDataPengumuman.find(
            (data) =>
                String(data.id) ===
                String(id)
        );


    if (!item) {
        console.warn(
            "Dokumen tidak ditemukan:",
            id
        );

        return;
    }


    bukaDokumen(item);
}


// =====================================================
// BUKA DOKUMEN
// =====================================================

function bukaDokumen(item) {

    const modal =
        document.getElementById("modal");

    const modalJudul =
        document.getElementById("modalJudul");

    const modalNamaFile =
        document.getElementById("modalNamaFile");

    const modalContent =
        document.getElementById("modalContent");

    const btnDownload =
        document.getElementById("btnDownload");


    if (
        !modal ||
        !modalJudul ||
        !modalNamaFile ||
        !modalContent ||
        !btnDownload
    ) {
        return;
    }


    const nama =
        item?.nama_asli ||
        item?.nama_file ||
        "Dokumen";


    const url =
        item?.url_file ||
        "";


    if (!url) {

        modalJudul.textContent =
            "Dokumen tidak tersedia";

        modalNamaFile.textContent =
            nama;

        modalContent.innerHTML = `
            <div class="file-open-box">

                <div class="file-open-icon">
                    ⚠️
                </div>

                <h3>
                    File tidak tersedia
                </h3>

                <p>
                    Tautan dokumen belum tersedia
                    atau file sudah tidak dapat diakses.
                </p>

            </div>
        `;


        btnDownload.style.display =
            "none";


        bukaModal();

        return;
    }


    const jenis =
        getJenisFile(nama);


    modalJudul.textContent =
        nama;

    modalNamaFile.textContent =
        getLabelFormat(jenis);


    btnDownload.style.display =
        "inline-flex";


    btnDownload.href =
        buatUrlDownload(
            url,
            nama
        );


    // =================================================
    // PDF
    // =================================================

    if (jenis === "pdf") {

        modalContent.innerHTML = `

            <iframe
                src="${escapeAttribute(url)}"
                title="${escapeAttribute(nama)}"
                loading="lazy"
            ></iframe>

            <div
                style="
                    display:flex;
                    justify-content:center;
                    padding:12px;
                    background:#ffffff;
                    border-top:1px solid #e2e8f0;
                "
            >

                <a
                    href="${escapeAttribute(url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-open-file"
                    style="width:100%;max-width:420px;"
                >
                    📄 Buka PDF
                </a>

            </div>
        `;

    }

    // =================================================
    // GAMBAR
    // =================================================

    else if (jenis === "image") {

        modalContent.innerHTML = `

            <img
                src="${escapeAttribute(url)}"
                alt="${escapeAttribute(nama)}"
                loading="lazy"
            />

        `;
    }

    // =================================================
    // FILE WORD
    // =================================================

    else if (jenis === "word") {

        modalContent.innerHTML =
            buatFileOpenBox(
                "📝",
                nama,
                "Dokumen Word siap dibuka.",
                url,
                "Buka Dokumen"
            );
    }

    // =================================================
    // FILE EXCEL
    // =================================================

    else if (jenis === "excel") {

        modalContent.innerHTML =
            buatFileOpenBox(
                "📊",
                nama,
                "Dokumen Excel siap dibuka.",
                url,
                "Buka Dokumen"
            );
    }

    // =================================================
    // FILE POWERPOINT
    // =================================================

    else if (jenis === "powerpoint") {

        modalContent.innerHTML =
            buatFileOpenBox(
                "📽️",
                nama,
                "Presentasi siap dibuka.",
                url,
                "Buka Presentasi"
            );
    }

    // =================================================
    // ZIP / RAR
    // =================================================

    else if (jenis === "zip") {

        modalContent.innerHTML =
            buatFileOpenBox(
                "🗜️",
                nama,
                "File arsip siap dibuka atau disimpan.",
                url,
                "Buka File"
            );
    }

    // =================================================
    // FILE LAIN
    // =================================================

    else {

        modalContent.innerHTML =
            buatFileOpenBox(
                "📄",
                nama,
                "Dokumen siap dibuka.",
                url,
                "Buka File"
            );
    }


    bukaModal();
}


// =====================================================
// KOTAK BUKA FILE
// =====================================================

function buatFileOpenBox(
    icon,
    nama,
    deskripsi,
    url,
    teksTombol
) {

    return `

        <div class="file-open-box">

            <div class="file-open-icon">
                ${icon}
            </div>


            <h3>
                ${escapeHtml(nama)}
            </h3>


            <p>
                ${escapeHtml(deskripsi)}
            </p>


            <a
                href="${escapeAttribute(url)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-open-file"
            >
                ${escapeHtml(teksTombol)}
            </a>

        </div>

    `;
}


// =====================================================
// MODAL OPEN
// =====================================================

function bukaModal() {

    const modal =
        document.getElementById("modal");


    if (!modal) {
        return;
    }


    modal.classList.add(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";
}


// =====================================================
// MODAL CLOSE
// =====================================================

function tutupModal() {

    const modal =
        document.getElementById("modal");

    const modalContent =
        document.getElementById("modalContent");


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";


    if (modalContent) {

        setTimeout(
            function () {

                modalContent.innerHTML =
                    "";

            },
            200
        );
    }
}


// =====================================================
// TOMBOL TUTUP
// =====================================================

const btnTutup =
    document.getElementById(
        "btnTutup"
    );


if (btnTutup) {

    btnTutup.addEventListener(
        "click",
        tutupModal
    );
}


// =====================================================
// KLIK DI LUAR MODAL
// =====================================================

const modal =
    document.getElementById(
        "modal"
    );


if (modal) {

    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {
                tutupModal();
            }
        }
    );
}


// =====================================================
// TOMBOL ESCAPE
// =====================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            const modal =
                document.getElementById(
                    "modal"
                );


            if (
                modal &&
                modal.classList.contains(
                    "active"
                )
            ) {

                tutupModal();
            }
        }
    }
);


// =====================================================
// BUAT URL DOWNLOAD
// =====================================================

function buatUrlDownload(
    url,
    nama
) {

    if (!url) {
        return "#";
    }


    try {

        const encodedName =
            encodeURIComponent(
                nama || "dokumen"
            );


        const separator =
            url.includes("?")
                ? "&"
                : "?";


        return (
            url +
            separator +
            "download=" +
            encodedName
        );

    } catch (error) {

        console.warn(
            "Gagal membuat URL download:",
            error
        );


        return url;
    }
}


// =====================================================
// DETEKSI JENIS FILE
// =====================================================

function getJenisFile(
    namaFile
) {

    if (!namaFile) {
        return "file";
    }


    const nama =
        String(
            namaFile
        )
            .toLowerCase()
            .split("?")[0]
            .split("#")[0];


    const ekstensi =
        nama.includes(".")
            ? nama
                .split(".")
                .pop()
            : "";


    // PDF
    if (
        ekstensi === "pdf"
    ) {
        return "pdf";
    }


    // Gambar
    if (
        [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "webp",
            "bmp",
            "svg"
        ].includes(ekstensi)
    ) {
        return "image";
    }


    // Word
    if (
        [
            "doc",
            "docx"
        ].includes(ekstensi)
    ) {
        return "word";
    }


    // Excel
    if (
        [
            "xls",
            "xlsx",
            "csv"
        ].includes(ekstensi)
    ) {
        return "excel";
    }


    // PowerPoint
    if (
        [
            "ppt",
            "pptx"
        ].includes(ekstensi)
    ) {
        return "powerpoint";
    }


    // ZIP / RAR
    if (
        [
            "zip",
            "rar",
            "7z"
        ].includes(ekstensi)
    ) {
        return "zip";
    }


    return "file";
}


// =====================================================
// LABEL FORMAT
// =====================================================

function getLabelFormat(
    jenis
) {

    switch (jenis) {

        case "pdf":
            return "PDF";

        case "image":
            return "GAMBAR";

        case "word":
            return "WORD";

        case "excel":
            return "EXCEL";

        case "powerpoint":
            return "PRESENTASI";

        case "zip":
            return "ARSIP";

        default:
            return "DOKUMEN";
    }
}


// =====================================================
// ICON FILE
// =====================================================

function getIconFile(
    jenis
) {

    switch (jenis) {

        case "pdf":
            return "📕";

        case "image":
            return "🖼️";

        case "word":
            return "📝";

        case "excel":
            return "📊";

        case "powerpoint":
            return "📽️";

        case "zip":
            return "🗜️";

        default:
            return "📄";
    }
}


// =====================================================
// FORMAT UKURAN FILE
// =====================================================

function formatUkuran(
    bytes
) {

    if (
        bytes === null ||
        bytes === undefined ||
        bytes === ""
    ) {
        return "";
    }


    const ukuran =
        Number(bytes);


    if (
        !Number.isFinite(
            ukuran
        ) ||
        ukuran <= 0
    ) {
        return "";
    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.min(
            Math.floor(
                Math.log(ukuran) /
                Math.log(1024)
            ),
            units.length - 1
        );


    const nilai =
        ukuran /
        Math.pow(
            1024,
            index
        );


    return (
        nilai.toFixed(
            index === 0
                ? 0
                : 1
        ) +
        " " +
        units[index]
    );
}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatTanggal(
    tanggal
) {

    if (!tanggal) {
        return "";
    }


    try {

        const date =
            new Date(
                tanggal
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }


        return date.toLocaleDateString(
            "id-ID",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    } catch (error) {

        return "";
    }
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(
    value
) {

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


// =====================================================
// ESCAPE ATTRIBUTE
// =====================================================

function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );
}


// =====================================================
// JALANKAN
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        ambilPengumuman();

    }
);
