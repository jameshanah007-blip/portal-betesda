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

    if (!container) return;

    container.innerHTML = `
        <div class="state-message">
            <div class="state-icon">📄</div>
            <h3>Memuat pengumuman...</h3>
            <p>Mohon tunggu sebentar.</p>
        </div>
    `;

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("pengumuman")
            .select("*")
            .order("created_at", {
                ascending: false
            });

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
                <div class="state-icon">⚠️</div>
                <h3>Pengumuman belum dapat dimuat</h3>
                <p>Silakan coba lagi beberapa saat.</p>
            </div>
        `;
    }
}


// =====================================================
// TAMPILKAN PENGUMUMAN
// =====================================================

function tampilkanPengumuman() {

    const container =
        document.getElementById("daftarPengumuman");

    if (!container) return;

    if (
        !daftarDataPengumuman ||
        daftarDataPengumuman.length === 0
    ) {

        container.innerHTML = `
            <div class="state-message">
                <div class="state-icon">📂</div>
                <h3>Belum ada pengumuman</h3>
                <p>Informasi jemaat akan ditampilkan di sini.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        daftarDataPengumuman
            .map(buatCardDokumen)
            .join("");
}


// =====================================================
// BUAT CARD
// =====================================================

function buatCardDokumen(item) {

    const id =
        item?.id ?? "";

    const judul =
        item?.judul ||
        "Pengumuman";

    const namaFile =
        item?.nama_asli ||
        item?.nama_file ||
        "";

    const jenis =
        namaFile
            ? getJenisFile(namaFile)
            : "file";

    const format =
        namaFile
            ? getLabelFormat(jenis)
            : "INFORMASI";

    const icon =
        namaFile
            ? getIconFile(jenis)
            : "📢";

    const tanggal =
        formatTanggal(item?.created_at);

    return `
        <article
            class="dokumen-card"
            data-id="${escapeAttribute(id)}"
            tabindex="0"
            role="button"
            aria-label="Buka ${escapeAttribute(judul)}"
        >

            <div
                class="file-icon ${jenis}"
                aria-hidden="true"
            >
                ${icon}
            </div>

            <div class="dokumen-info">

                <h2 class="dokumen-title">
                    ${escapeHtml(judul)}
                </h2>

                <div class="dokumen-meta">

                    <span class="format-badge ${jenis}">
                        ${escapeHtml(format)}
                    </span>

                    ${
                        tanggal
                            ? `<span>${escapeHtml(tanggal)}</span>`
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
// KLIK PENGUMUMAN
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        const card =
            event.target.closest(
                ".dokumen-card"
            );

        if (!card) return;

        const id =
            card.dataset.id;

        const item =
            daftarDataPengumuman.find(
                data =>
                    String(data.id) ===
                    String(id)
            );

        if (!item) return;

        bukaDokumen(item);
    }
);


// =====================================================
// KEYBOARD
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

        if (!card) return;

        event.preventDefault();

        const id =
            card.dataset.id;

        const item =
            daftarDataPengumuman.find(
                data =>
                    String(data.id) ===
                    String(id)
            );

        if (item) {
            bukaDokumen(item);
        }
    }
);


// =====================================================
// BUKA PENGUMUMAN
// =====================================================

function bukaDokumen(item) {

    const judul =
        item?.judul ||
        "Pengumuman";

    const keterangan =
        item?.keterangan ||
        "";

    const nama =
        item?.nama_asli ||
        item?.nama_file ||
        "";

    const url =
        item?.url_file ||
        "";


    // =================================================
    // JIKA TIDAK ADA FILE
    //
    // Tetap buka modal untuk membaca isi pengumuman.
    // =================================================

    if (!url) {

        bukaModalPengumuman(
            judul,
            keterangan
        );

        return;
    }


    const jenis =
        getJenisFile(nama);


    // =================================================
    // KHUSUS PDF
    //
    // Tetap buka PDF langsung di browser HP.
    // =================================================

    if (jenis === "pdf") {

        bukaModalDenganKeterangan(
            item,
            judul,
            keterangan,
            nama,
            url,
            jenis
        );

        return;
    }


    // =================================================
    // GAMBAR
    // =================================================

    if (jenis === "image") {

        bukaModalGambar(
            item,
            judul,
            keterangan,
            nama,
            url
        );

        return;
    }


    // =================================================
    // FILE LAIN
    // =================================================

    bukaModalFile(
        item,
        judul,
        keterangan,
        nama,
        url,
        jenis
    );
}


// =====================================================
// MODAL PENGUMUMAN TANPA FILE
// =====================================================

function bukaModalPengumuman(
    judul,
    keterangan
) {

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

    modalJudul.textContent =
        judul;

    modalNamaFile.textContent =
    "";

    modalContent.innerHTML = `
        <div class="modal-keterangan active">
            ${escapeHtml(keterangan)}
        </div>
    `;

    btnDownload.style.display =
        "none";

    bukaModal();
}


// =====================================================
// MODAL DENGAN KETERANGAN
// =====================================================

function bukaModalDenganKeterangan(
    item,
    judul,
    keterangan,
    nama,
    url,
    jenis
) {

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

    modalJudul.textContent =
        judul;

    modalNamaFile.textContent =
        getLabelFormat(jenis);

    modalContent.innerHTML = `
        ${
            keterangan
                ? `
                    <div class="modal-keterangan active">
                        ${escapeHtml(keterangan)}
                    </div>
                `
                : ""
        }

        <div class="file-open-box">

            <div class="file-open-icon">
                ${getIconFile(jenis)}
            </div>

            <h3>
                ${escapeHtml(nama)}
            </h3>

            <p>
                File PDF siap dibuka.
            </p>

            <a
                href="${escapeAttribute(url)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-open-file"
            >
                Buka PDF
            </a>

        </div>
    `;

    btnDownload.href =
        buatUrlDownload(
            url,
            nama
        );

    btnDownload.style.display =
        "inline-flex";

    bukaModal();
}


// =====================================================
// MODAL GAMBAR
// =====================================================

function bukaModalGambar(
    item,
    judul,
    keterangan,
    nama,
    url
) {

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

    modalJudul.textContent =
        judul;

    modalNamaFile.textContent =
        "GAMBAR";

    modalContent.innerHTML = `
        ${
            keterangan
                ? `
                    <div class="modal-keterangan active">
                        ${escapeHtml(keterangan)}
                    </div>
                `
                : ""
        }

        <img
            src="${escapeAttribute(url)}"
            alt="${escapeAttribute(nama)}"
        >
    `;

    btnDownload.href =
        buatUrlDownload(
            url,
            nama
        );

    btnDownload.style.display =
        "inline-flex";

    bukaModal();
}


// =====================================================
// MODAL FILE LAIN
// =====================================================

function bukaModalFile(
    item,
    judul,
    keterangan,
    nama,
    url,
    jenis
) {

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

    modalJudul.textContent =
        judul;

    modalNamaFile.textContent =
        getLabelFormat(jenis);

    modalContent.innerHTML = `
        ${
            keterangan
                ? `
                    <div class="modal-keterangan active">
                        ${escapeHtml(keterangan)}
                    </div>
                `
                : ""
        }

        <div class="file-open-box">

            <div class="file-open-icon">
                ${getIconFile(jenis)}
            </div>

            <h3>
                ${escapeHtml(nama)}
            </h3>

            <p>
                File siap dibuka.
            </p>

            <a
                href="${escapeAttribute(url)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-open-file"
            >
                Buka File
            </a>

        </div>
    `;

    btnDownload.href =
        buatUrlDownload(
            url,
            nama
        );

    btnDownload.style.display =
        "inline-flex";

    bukaModal();
}


// =====================================================
// MODAL OPEN
// =====================================================

function bukaModal() {

    const modal =
        document.getElementById("modal");

    if (!modal) return;

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
        document.getElementById(
            "modalContent"
        );

    const btnDownload =
        document.getElementById(
            "btnDownload"
        );

    if (!modal) return;

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
        modalContent.innerHTML = "";
    }

    if (btnDownload) {
        btnDownload.href = "#";
        btnDownload.style.display =
            "inline-flex";
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
// ESC
// =====================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Escape"
        ) {
            return;
        }

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
);


// =====================================================
// DOWNLOAD URL
// =====================================================

function buatUrlDownload(
    url,
    nama
) {

    if (!url) {
        return "#";
    }

    try {

        const namaEncoded =
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
            namaEncoded
        );

    } catch (error) {

        return url;
    }
}


// =====================================================
// JENIS FILE
// =====================================================

function getJenisFile(
    namaFile
) {

    if (!namaFile) {
        return "file";
    }

    const nama =
        String(namaFile)
            .toLowerCase()
            .split("?")[0]
            .split("#")[0];

    const ekstensi =
        nama.includes(".")
            ? nama.split(".").pop()
            : "";


    if (
        ekstensi === "pdf"
    ) {
        return "pdf";
    }


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


    if (
        [
            "doc",
            "docx"
        ].includes(ekstensi)
    ) {
        return "word";
    }


    if (
        [
            "xls",
            "xlsx",
            "csv"
        ].includes(ekstensi)
    ) {
        return "excel";
    }


    if (
        [
            "ppt",
            "pptx"
        ].includes(ekstensi)
    ) {
        return "powerpoint";
    }


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
// LABEL
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
// ICON
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
// UKURAN FILE
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
        !Number.isFinite(ukuran) ||
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
// TANGGAL
// =====================================================

function formatTanggal(
    tanggal
) {

    if (!tanggal) {
        return "";
    }

    try {

        const date =
            new Date(tanggal);

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
