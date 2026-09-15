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
        <div class="state-message">
            <div class="state-icon">📄</div>

            <h3>
                Memuat informasi...
            </h3>

            <p>
                Mohon tunggu sebentar.
            </p>
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

    tampilkanPengumuman(
        data || []
    );
}


// ======================================================
// TAMPILKAN DAFTAR PENGUMUMAN
// ======================================================

function tampilkanPengumuman(data) {

    if (
        !data ||
        data.length === 0
    ) {

        daftarPengumuman.innerHTML = `
            <div class="state-message">

                <div class="state-icon">
                    📄
                </div>

                <h3>
                    Belum ada informasi
                </h3>

                <p>
                    Informasi jemaat akan ditampilkan di sini.
                </p>

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
                        data.find(
                            function(dataItem) {

                                return (
                                    String(dataItem.id) ===
                                    String(id)
                                );

                            }
                        );

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
                            data.find(
                                function(dataItem) {

                                    return (
                                        String(dataItem.id) ===
                                        String(id)
                                    );

                                }
                            );

                        if (item) {
                            bukaDokumen(item);
                        }

                    }

                }
            );

        });
}


// ======================================================
// BUAT CARD DOKUMEN
// ======================================================

function buatCardDokumen(item) {

    const judul =
        escapeHtml(
            item.judul ||
            "Tanpa Judul"
        );


    const namaFile =
        item.nama_asli ||
        item.nama_file ||
        "";


    const namaFileRapi =
        escapeHtml(
            namaFile
        );


    const ekstensi =
        ambilEkstensi(
            namaFile
        );


    let format =
        "INFORMASI";

    let icon =
        "📢";


    if (item.url_file) {

        if (
            ekstensi === "pdf"
        ) {

            format =
                "PDF";

            icon =
                "📄";

        } else if (
            [
                "jpg",
                "jpeg",
                "png",
                "gif",
                "webp"
            ].includes(ekstensi)
        ) {

            format =
                "GAMBAR";

            icon =
                "🖼️";

        } else {

            format =
                ekstensi
                    ? ekstensi.toUpperCase()
                    : "DOKUMEN";

            icon =
                "📎";
        }
    }


    return `
        <article
            class="dokumen-card"
            data-id="${item.id}"
            tabindex="0"
            role="button"
        >

            <div class="file-icon">
                ${icon}
            </div>


            <div class="dokumen-info">

                <h3 class="dokumen-title">
                    ${judul}
                </h3>


                <div class="dokumen-meta">

                    <span class="format-badge">
                        ${format}
                    </span>

                    ${
                        namaFileRapi
                            ? `
                                <span>
                                    ${namaFileRapi}
                                </span>
                            `
                            : ""
                    }

                </div>

            </div>


            <div class="open-arrow">
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
        item.url_file ||
        "";


    const keterangan =
        item.keterangan ||
        "";


    // --------------------------------------------------
    // PENGUMUMAN TANPA FILE
    // --------------------------------------------------

    if (!url) {

        bukaModalPengumuman(
            item.judul,
            keterangan
        );

        return;
    }


    // --------------------------------------------------
    // TENTUKAN EKSTENSI
    // --------------------------------------------------

    const ekstensi =
        ambilEkstensi(
            item.nama_asli ||
            item.nama_file ||
            url
        );


    // --------------------------------------------------
    // PDF
    // --------------------------------------------------

    if (
        ekstensi === "pdf"
    ) {

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
        judul ||
        "Informasi Jemaat";


    // Sengaja dikosongkan
    // agar tidak muncul nama file
    modalNamaFile.textContent =
        "";


    const keteranganRapi =
        rapikanKeterangan(
            keterangan
        );


    modalContent.innerHTML =
        `
        <div class="modal-keterangan active">${escapeHtml(keteranganRapi)}</div>
        `;


    btnDownload.style.display =
        "none";


    btnDownload.href =
        "#";


    bukaModal();
}


// ======================================================
// MODAL PDF + KETERANGAN
// ======================================================

function bukaModalDenganKeterangan(
    judul,
    keterangan,
    url,
    namaFile
) {

    modalJudul.textContent =
        judul ||
        "Informasi Jemaat";


    modalNamaFile.textContent =
        namaFile ||
        "";


    const keteranganRapi =
        rapikanKeterangan(
            keterangan
        );


    modalContent.innerHTML =
        `
        ${
            keteranganRapi
                ? `
                    <div class="modal-keterangan active">${escapeHtml(keteranganRapi)}</div>
                `
                : ""
        }

        <div class="file-open-box">

            <div class="file-open-icon">
                📄
            </div>

            <h3>
                Dokumen PDF
            </h3>

            <p>
                Dokumen tersedia dan dapat dibuka di tab baru.
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
        judul ||
        "Informasi Jemaat";


    modalNamaFile.textContent =
        namaFile ||
        "";


    const keteranganRapi =
        rapikanKeterangan(
            keterangan
        );


    modalContent.innerHTML =
        `
        ${
            keteranganRapi
                ? `
                    <div class="modal-keterangan active">${escapeHtml(keteranganRapi)}</div>
                `
                : ""
        }

        <div class="modal-image">
            <img
                src="${escapeAttribute(url)}"
                alt="${escapeAttribute(
                    judul ||
                    "Gambar pengumuman"
                )}"
            >
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
// MODAL FILE LAINNYA
// ======================================================

function bukaModalFile(
    judul,
    keterangan,
    url,
    namaFile
) {

    modalJudul.textContent =
        judul ||
        "Informasi Jemaat";


    modalNamaFile.textContent =
        namaFile ||
        "";


    const keteranganRapi =
        rapikanKeterangan(
            keterangan
        );


    modalContent.innerHTML =
        `
        ${
            keteranganRapi
                ? `
                    <div class="modal-keterangan active">${escapeHtml(keteranganRapi)}</div>
                `
                : ""
        }

        <div class="file-open-box">

            <div class="file-open-icon">
                📎
            </div>

            <h3>
                Dokumen tersedia
            </h3>

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

    modal.classList.add(
        "active"
    );


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


    modalContent.innerHTML =
        "";


    modalNamaFile.textContent =
        "";


    btnDownload.href =
        "#";


    btnDownload.textContent =
        "Download";


    btnDownload.style.display =
        "none";
}


// ======================================================
// TOMBOL TUTUP
// ======================================================

if (btnTutup) {

    btnTutup.addEventListener(
        "click",
        tutupModal
    );
}


// ======================================================
// KLIK AREA LUAR MODAL
// ======================================================

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


// ======================================================
// TOMBOL ESCAPE
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            modal &&
            modal.classList.contains(
                "active"
            )
        ) {

            tutupModal();
        }

    }
);


// ======================================================
// RAPIIKAN KETERANGAN
// ======================================================

function rapikanKeterangan(
    teks
) {

    if (
        teks === null ||
        teks === undefined
    ) {
        return "";
    }


    return String(teks)

        // Samakan jenis enter
        .replace(
            /\r\n/g,
            "\n"
        )

        .replace(
            /\r/g,
            "\n"
        )

        // Hilangkan whitespace
        // tersembunyi di awal teks
        .replace(
            /^[\s\u00A0\u200B\u200C\u200D\uFEFF]+/,
            ""
        )

        // Bersihkan setiap baris
        .split("\n")

        .map(
            function(baris) {

                return baris

                    // Hilangkan whitespace
                    // di awal baris
                    .replace(
                        /^[\s\u00A0\u200B\u200C\u200D\uFEFF]+/,
                        ""
                    )

                    // Hilangkan whitespace
                    // di akhir baris
                    .replace(
                        /[\s\u00A0\u200B\u200C\u200D\uFEFF]+$/,
                        ""
                    );

            }
        )

        // Kembalikan enter
        .join("\n")

        // Bersihkan whitespace
        // di bagian paling akhir
        .replace(
            /[\s\u00A0\u200B\u200C\u200D\uFEFF]+$/,
            ""
        );
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

function escapeHtml(
    teks
) {

    return String(
        teks ?? ""
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


// ======================================================
// ESCAPE ATTRIBUTE
// ======================================================

function escapeAttribute(
    teks
) {

    return escapeHtml(
        teks
    );
}


// ======================================================
// TAMPILKAN ERROR
// ======================================================

function tampilkanError(
    pesan
) {

    daftarPengumuman.innerHTML =
        `
        <div class="state-message">

            <div class="state-icon">
                ⚠️
            </div>

            <h3>
                Terjadi Kesalahan
            </h3>

            <p>
                ${escapeHtml(pesan)}
            </p>

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
