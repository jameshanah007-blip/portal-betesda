/* =========================================
   REFERENSI ELEMENT
========================================= */

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

const inputPencarian =
    document.getElementById("inputPencarian");

const btnHapusPencarian =
    document.getElementById("btnHapusPencarian");

const infoHasil =
    document.getElementById("infoHasil");


/* =========================================
   DATA PENGUMUMAN
========================================= */

let semuaPengumuman = [];


/* =========================================
   AMBIL DATA DARI SUPABASE
========================================= */

async function ambilPengumuman() {

    daftarPengumuman.innerHTML = `
        <div class="loading">
            Memuat informasi...
        </div>
    `;

    try {

        const hasil =
            await supabaseClient
                .from("pengumuman")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (hasil.error) {

            throw hasil.error;

        }


        semuaPengumuman =
            hasil.data || [];


        tampilkanPengumuman(
            semuaPengumuman
        );

    }

    catch (error) {

        console.error(
            "Gagal mengambil pengumuman:",
            error
        );

        daftarPengumuman.innerHTML = `
            <div class="kosong">

                <strong>
                    Gagal memuat informasi
                </strong>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Terjadi kesalahan."
                    )}
                </p>

            </div>
        `;

        infoHasil.textContent = "";

    }

}


/* =========================================
   TAMPILKAN PENGUMUMAN
========================================= */

function tampilkanPengumuman(
    data
) {

    daftarPengumuman.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        daftarPengumuman.innerHTML = `
            <div class="kosong">

                <strong>
                    Tidak ditemukan
                </strong>

                <p>
                    Tidak ada pengumuman
                    yang sesuai dengan pencarian.
                </p>

            </div>
        `;

        infoHasil.textContent = "";

        return;

    }


    infoHasil.textContent =
        "Menampilkan " +
        data.length +
        " pengumuman";


    data.forEach(
        function(item) {

            daftarPengumuman.appendChild(
                buatCardDokumen(item)
            );

        }
    );

}


/* =========================================
   BUAT KARTU
========================================= */

function buatCardDokumen(
    item
) {

    const card =
        document.createElement("div");


    card.className =
        "dokumen-card";


    const judul =
        item.judul ||
        "Pengumuman Jemaat";


    const keterangan =
        rapikanKeterangan(
            item.keterangan
        );


    const tanggal =
        formatTanggal(
            item.created_at
        );


    const namaFile =
        item.nama_asli ||
        item.nama_file ||
        "";


    const ekstensi =
        ambilEkstensi(
            namaFile
        );


    let format =
        "INFORMASI";


    if (ekstensi) {

        format =
            ekstensi.toUpperCase();

    }


    let deskripsi =
        keterangan;


    if (!deskripsi) {

        if (namaFile) {

            deskripsi =
                "Dokumen tersedia untuk dibuka.";

        } else {

            deskripsi =
                "Klik untuk membaca informasi.";

        }

    }


    card.innerHTML = `

        <div class="file-icon">

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >

                <path
                    d="M14 2H6a2 2 0 0 0-2 2v16
                    a2 2 0 0 0 2 2h12
                    a2 2 0 0 0 2-2V8z"
                ></path>

                <polyline
                    points="14 2 14 8 20 8"
                ></polyline>

                <line
                    x1="8"
                    y1="13"
                    x2="16"
                    y2="13"
                ></line>

                <line
                    x1="8"
                    y1="17"
                    x2="14"
                    y2="17"
                ></line>

            </svg>

        </div>


        <div class="dokumen-info">

            <div class="dokumen-title">

                ${escapeHTML(judul)}

            </div>


            <div class="dokumen-meta">

                ${escapeHTML(tanggal)}

                <span class="format-badge">
                    ${escapeHTML(format)}
                </span>

            </div>


            <div class="dokumen-deskripsi">

                ${escapeHTML(deskripsi)}

            </div>

        </div>


        <div class="open-arrow">
            →
        </div>

    `;


    card.addEventListener(
        "click",
        function() {

            bukaDokumen(item);

        }
    );


    card.setAttribute(
        "tabindex",
        "0"
    );


    card.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                bukaDokumen(item);

            }

        }
    );


    return card;

}


/* =========================================
   PENCARIAN
========================================= */

function lakukanPencarian() {

    const kata =
        String(
            inputPencarian.value || ""
        )
            .trim()
            .toLowerCase();


    btnHapusPencarian.style.display =
        kata
            ? "flex"
            : "none";


    if (!kata) {

        tampilkanPengumuman(
            semuaPengumuman
        );

        return;

    }


    const hasil =
        semuaPengumuman.filter(
            function(item) {

                const judul =
                    String(
                        item.judul || ""
                    )
                        .toLowerCase();


                const keterangan =
                    String(
                        item.keterangan || ""
                    )
                        .toLowerCase();


                const namaFile =
                    String(
                        item.nama_asli ||
                        item.nama_file ||
                        ""
                    )
                        .toLowerCase();


                return (
                    judul.includes(kata) ||
                    keterangan.includes(kata) ||
                    namaFile.includes(kata)
                );

            }
        );


    if (hasil.length === 0) {

        daftarPengumuman.innerHTML = `

            <div class="kosong">

                <strong>
                    Tidak ditemukan
                </strong>

                <p>
                    Tidak ada pengumuman
                    yang sesuai dengan
                    "<b>${escapeHTML(
                        inputPencarian.value
                    )}</b>".
                </p>

            </div>

        `;

        infoHasil.textContent =
            "Tidak ada hasil pencarian.";

        return;

    }


    tampilkanPengumuman(
        hasil
    );

}


/* =========================================
   HAPUS PENCARIAN
========================================= */

function hapusPencarian() {

    inputPencarian.value = "";

    lakukanPencarian();

    inputPencarian.focus();

}


/* =========================================
   BUKA DOKUMEN
========================================= */

function bukaDokumen(
    item
) {

    const url =
        item.url_file || "";


    const namaFile =
        item.nama_asli ||
        item.nama_file ||
        "";


    const ekstensi =
        ambilEkstensi(
            namaFile
        );


    const keterangan =
        rapikanKeterangan(
            item.keterangan
        );


    if (!url) {

        bukaModalPengumuman(
            item.judul,
            keterangan
        );

        return;

    }


    if (
        ekstensi === "pdf"
    ) {

        bukaModalDenganKeterangan(
            item.judul,
            namaFile,
            url,
            keterangan
        );

        return;

    }


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
            namaFile,
            url,
            keterangan
        );

        return;

    }


    bukaModalFile(
        item.judul,
        namaFile,
        url,
        keterangan
    );

}


/* =========================================
   MODAL PENGUMUMAN TEKS
========================================= */

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


    modalContent.innerHTML =
        `
        <div class="modal-keterangan active">
            ${escapeHTML(
                keteranganRapi
            )}
        </div>
        `;


    btnDownload.style.display =
        "none";


    bukaModal();

}


/* =========================================
   MODAL PDF
========================================= */

function bukaModalDenganKeterangan(
    judul,
    namaFile,
    url,
    keterangan
) {

    modalJudul.textContent =
        judul || "Dokumen";


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
                    ${escapeHTML(
                        keteranganRapi
                    )}
                </div>
                `
                : ""
        }

        <iframe
            src="${escapeAttribute(url)}"
            style="
                width:100%;
                height:65vh;
                border:none;
                display:block;
            "
            title="Dokumen PDF"
        ></iframe>

    `;


    btnDownload.href =
        url;


    btnDownload.textContent =
        "Download PDF";


    btnDownload.style.display =
        "inline-flex";


    bukaModal();

}


/* =========================================
   MODAL GAMBAR
========================================= */

function bukaModalGambar(
    judul,
    namaFile,
    url,
    keterangan
) {

    modalJudul.textContent =
        judul || "Foto";


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
                    ${escapeHTML(
                        keteranganRapi
                    )}
                </div>
                `
                : ""
        }

        <img
            class="modal-image"
            src="${escapeAttribute(url)}"
            alt="${escapeAttribute(
                judul || "Gambar"
            )}"
        >

    `;


    btnDownload.href =
        url;


    btnDownload.textContent =
        "Download";


    btnDownload.style.display =
        "inline-flex";


    bukaModal();

}


/* =========================================
   MODAL FILE
========================================= */

function bukaModalFile(
    judul,
    namaFile,
    url,
    keterangan
) {

    modalJudul.textContent =
        judul || "Dokumen";


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
                    ${escapeHTML(
                        keteranganRapi
                    )}
                </div>
                `
                : ""
        }

        <div class="modal-file">

            <p>
                File tersedia untuk diunduh.
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


/* =========================================
   BUKA MODAL
========================================= */

function bukaModal() {

    modal.style.display =
        "flex";

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   TUTUP MODAL
========================================= */

function tutupModal() {

    modal.style.display =
        "none";

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    modalContent.innerHTML =
        "";


    modalNamaFile.textContent =
        "";


    btnDownload.href =
        "#";


    document.body.style.overflow =
        "";

}


/* =========================================
   RAPikan KETERANGAN
========================================= */

function rapikanKeterangan(teks) {

    if (
        teks === null ||
        teks === undefined
    ) {
        return "";
    }

    return String(teks)

        /* Samakan format enter */
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")

        /* Hilangkan spasi kosong di awal teks */
        .replace(
            /^[\s\u00A0\u200B\u200C\u200D\uFEFF]+/,
            ""
        )

        /* Rapikan setiap baris */
        .split("\n")
        .map(function(baris) {

            return baris
                .replace(
                    /^[\s\u00A0\u200B\u200C\u200D\uFEFF]+/,
                    ""
                )
                .replace(
                    /[\s\u00A0\u200B\u200C\u200D\uFEFF]+$/,
                    ""
                );

        })

        .join("\n")

        /* Hilangkan spasi di akhir teks */
        .trim();
}

/* =========================================
   FORMAT TANGGAL
========================================= */

function formatTanggal(
    tanggal
) {

    if (!tanggal) {

        return "";

    }


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
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================================
   AMBIL EKSTENSI
========================================= */

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
        nama.split(".");


    if (
        bagian.length < 2
    ) {

        return "";

    }


    return bagian
        .pop()
        .toLowerCase();

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
    text
) {

    const div =
        document.createElement("div");


    div.textContent =
        text ?? "";


    return div.innerHTML;

}


/* =========================================
   ESCAPE ATTRIBUTE
========================================= */

function escapeAttribute(
    text
) {

    return String(
        text ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


/* =========================================
   EVENT PENCARIAN
========================================= */

inputPencarian.addEventListener(
    "input",
    lakukanPencarian
);


btnHapusPencarian.addEventListener(
    "click",
    hapusPencarian
);


/* =========================================
   EVENT MODAL
========================================= */

btnTutup.addEventListener(
    "click",
    tutupModal
);


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


document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            modal.style.display === "flex"
        ) {

            tutupModal();

        }

    }
);


/* =========================================
   LOAD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        ambilPengumuman();

    }
);
