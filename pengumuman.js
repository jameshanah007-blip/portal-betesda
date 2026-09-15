const daftarPengumuman =
    document.getElementById("daftarPengumuman");

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

const btnTutup =
    document.getElementById("btnTutup");


// ======================================================
// AMBIL DATA PENGUMUMAN
// ======================================================

async function ambilPengumuman() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {
        tampilkanError(
            "Koneksi database belum tersedia."
        );

        return;
    }

    daftarPengumuman.innerHTML = `
        <div class="empty-state">
            Memuat informasi...
        </div>
    `;

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

        console.error(
            "Gagal mengambil pengumuman:",
            error
        );

        tampilkanError(
            "Gagal memuat informasi jemaat."
        );

        return;
    }

    tampilkanPengumuman(data || []);
}


// ======================================================
// TAMPILKAN DAFTAR PENGUMUMAN
// ======================================================

function tampilkanPengumuman(data) {

    if (!data || data.length === 0) {

        daftarPengumuman.innerHTML = `
            <div class="empty-state">
                Informasi jemaat akan ditampilkan di sini.
            </div>
        `;

        return;
    }

    daftarPengumuman.innerHTML =
        data
            .map(function(item) {
                return buatCardDokumen(item);
            })
            .join("");

    daftarPengumuman
        .querySelectorAll(".dokumen-card")
        .forEach(function(card) {

            card.addEventListener(
                "click",
                function() {

                    const id =
                        card.dataset.id;

                    const item =
                        data.find(function(dataItem) {
                            return String(dataItem.id) === String(id);
                        });

                    if (item) {
                        bukaDokumen(item);
                    }
                }
            );

            card.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        const id =
                            card.dataset.id;

                        const item =
                            data.find(function(dataItem) {
                                return String(dataItem.id) === String(id);
                            });

                        if (item) {
                            bukaDokumen(item);
                        }
                    }
                }
            );

        });
}


// ======================================================
// BUAT CARD PENGUMUMAN
// ======================================================

function buatCardDokumen(item) {

    const judul =
        escapeHtml(
            item.judul || "Tanpa Judul"
        );

    const namaFile =
        item.nama_asli ||
        item.nama_file ||
        "";

    const namaFileRapi =
        escapeHtml(namaFile);

    const ekstensi =
        ambilEkstensi(
            namaFile
        );

    let format = "INFORMASI";
    let icon = "📢";

    if (item.url_file) {

        if (ekstensi === "pdf") {

            format = "PDF";
            icon = "📄";

        } else if (
            [
                "jpg",
                "jpeg",
                "png",
                "gif",
                "webp"
            ].includes(ekstensi)
        ) {

            format = "GAMBAR";
            icon = "🖼️";

        } else {

            format =
                ekstensi
                    ? ekstensi.toUpperCase()
                    : "DOKUMEN";

            icon = "📎";
        }
    }

    return `
        <article
            class="dokumen-card"
            data-id="${item.id}"
            tabindex="0"
            role="button">

            <div class="dokumen-icon">
                ${icon}
            </div>

            <div class="dokumen-info">

                <div class="dokumen-format">
                    ${format}
                </div>

                <h3>
                    ${judul}
                </h3>

                ${
                    namaFileRapi
                        ? `
                            <p>
                                ${namaFileRapi}
                            </p>
                        `
                        : ""
                }

            </div>

            <div class="dokumen-arrow">
                →
            </div>

        </article>
    `;
}


// ======================================================
// BUKA DOKUMEN
// ======================================================

function bukaDokumen(item) {

    const url =
        item.url_file || "";

    const keterangan =
        item.keterangan || "";

    // --------------------------------------------------
    // TANPA FILE
    // --------------------------------------------------

    if (!url) {

        bukaModalPengumuman(
            item.judul,
            keterangan
        );

        return;
    }

    // --------------------------------------------------
    // PDF
    // --------------------------------------------------

    const ekstensi =
        ambilEkstensi(
            item.nama_asli ||
            item.nama_file ||
            url
        );

    if (ekstensi === "pdf") {

        bukaModalDenganKeterangan(
            item.judul,
            keterangan,
            url,
            item.nama_asli ||
            item.nama_file ||
            "Dokumen PDF"
        );

        return;
    }

    // --------------------------------------------------
    // GAMBAR
    // --------------------------------------------------

    if (
        [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "webp"
        ].includes(ekstensi)
    ) {

        bukaModalGambar(
            item.judul,
            keterangan,
            url,
            item.nama_asli ||
            item.nama_file ||
            "Gambar"
        );

        return;
    }

    // --------------------------------------------------
    // FILE LAINNYA
    // --------------------------------------------------

    bukaModalFile(
        item.judul,
        keterangan,
        url,
        item.nama_asli ||
        item.nama_file ||
        "Dokumen"
    );
}


// ======================================================
// MODAL PENGUMUMAN TANPA FILE
// ======================================================

function bukaModalPengumuman(
    judul,
    keterangan
) {

    modalJudul.textContent =
        judul || "Informasi Jemaat";

    modalNamaFile.textContent =
        "";

    const keteranganRapi =
        rapikanKeterangan(
            keterangan
        );

    modalContent.innerHTML = `
        <div class="modal-keterangan active">
            ${escapeHtml(keteranganRapi)}
        </div>
    `;

    btnDownload.style.display =
        "none";

    bukaModal();
}


// ======================================================
// MODAL DENGAN KETERANGAN + PDF
// ======================================================

function bukaModalDenganKeterangan(
    judul,
    keterangan,
    url,
    namaFile
) {

    modalJudul.textContent =
        judul || "Informasi Jemaat";

    modalNamaFile.textContent =
        namaFile || "";

    const keteranganRapi =
        rapikanKeterangan(
            keterangan
        );

    modalContent.innerHTML = `
        <div class="modal-keterangan active">
            ${escapeHtml(keteranganRapi)}
        </div>

        <div class="modal-file-preview">
            <p>
                Dokumen PDF tersedia untuk dibuka.
            </p>
        </div>
    `;

    btnDownload.href =
        url;

    btnDownload.textContent =
        "Buka PDF";

    btnDownload.style.display =
        "inline-flex";

    bukaModal();
}


// ======================================================
// MODAL GAMBAR
// ======================================================

function bukaModalGambar(
    judul,
    keterangan,
    url,
    namaFile
) {

    modalJudul.textContent =
        judul || "Informasi Jemaat";

    modalNamaFile.textContent =
        namaFile || "";

    const keteranganRapi =
        rapikanKeterangan(
            keterangan
        );

    modalContent.innerHTML = `
        ${
            keteranganRapi
                ? `
                    <div class="modal-keterangan active">
                        ${escapeHtml(keteranganRapi)}
                    </div>
                `
                : ""
        }

        <div class="modal-image">
            <img
                src="${escapeAttribute(url)}"
                alt="${escapeAttribute(
                    judul || "Gambar pengumuman"
                )}">
        </div>
    `;

    btnDownload.href =
        url;

    btnDownload.textContent =
        "Download";

    btnDownload.style.display =
        "inline-flex";

    bukaModal();
}


// ======================================================
// MODAL FILE LAIN
// ======================================================

function bukaModalFile(
    judul,
    keterangan,
    url,
    namaFile
) {

    modalJudul.textContent =
        judul || "Informasi Jemaat";

    modalNamaFile.textContent =
        namaFile || "";

    const keteranganRapi =
        rapikanKeterangan(
            keterangan
        );

    modalContent.innerHTML = `
        ${
            keteranganRapi
                ? `
                    <div class="modal-keterangan active">
                        ${escapeHtml(keteranganRapi)}
                    </div>
                `
                : ""
        }

        <div class="modal-file-preview">

            <div class="modal-file-icon">
                📎
            </div>

            <p>
                File tersedia untuk dibuka atau diunduh.
            </p>

        </div>
    `;

    btnDownload.href =
        url;

    btnDownload.textContent =
        "Download";

    btnDownload.style.display =
        "inline-flex";

    bukaModal();
}


// ======================================================
// BUKA MODAL
// ======================================================

function bukaModal() {

    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );
}


// ======================================================
// TUTUP MODAL
// ======================================================

function tutupModal() {

    modal.classList.remove(
        "active"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    modalContent.innerHTML = "";

    modalNamaFile.textContent =
        "";

    btnDownload.href =
        "#";

    btnDownload.style.display =
        "none";
}


// ======================================================
// EVENT TUTUP MODAL
// ======================================================

if (btnTutup) {

    btnTutup.addEventListener(
        "click",
        tutupModal
    );
}


if (modal) {

    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {
                tutupModal();
            }

        }
    );
}


document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            modal &&
            modal.classList.contains("active")
        ) {
            tutupModal();
        }

    }
);


// ======================================================
// RAPIIKAN KETERANGAN
// ======================================================

function rapikanKeterangan(teks) {

    return String(teks ?? "")
        .split("\n")
        .map(function(baris) {

            return baris.trim();

        })
        .join("\n")
        .trim();
}


// ======================================================
// AMBIL EKSTENSI FILE
// ======================================================

function ambilEkstensi(
    namaFile
) {

    if (!namaFile) {
        return "";
    }

    const nama =
        String(namaFile)
            .split("?")[0]
            .split("#")[0];

    const bagian =
        nama
            .split(".")
            .pop();

    if (
        !bagian ||
        bagian === nama
    ) {
        return "";
    }

    return bagian
        .toLowerCase()
        .trim();
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(teks) {

    return String(teks ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// ESCAPE ATTRIBUTE
// ======================================================

function escapeAttribute(
    teks
) {

    return escapeHtml(teks);
}


// ======================================================
// TAMPILKAN ERROR
// ======================================================

function tampilkanError(
    pesan
) {

    daftarPengumuman.innerHTML = `
        <div class="empty-state">
            ${escapeHtml(pesan)}
        </div>
    `;
}


// ======================================================
// JALANKAN SAAT HALAMAN DIBUKA
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        ambilPengumuman();

    }
);
