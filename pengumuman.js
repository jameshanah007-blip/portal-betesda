const daftarPengumuman =
    document.getElementById("daftarPengumuman");

const inputPencarian =
    document.getElementById("inputPencarian");

const btnHapusPencarian =
    document.getElementById("btnHapusPencarian");

const infoHasil =
    document.getElementById("infoHasil");

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


let semuaPengumuman = [];



/* =========================================================
   AMBIL DATA DARI SUPABASE
========================================================= */

async function ambilPengumuman() {

    daftarPengumuman.innerHTML = `
        <div class="kosong">
            <p>Memuat informasi...</p>
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

    } catch (error) {

        console.error(
            "Gagal mengambil pengumuman:",
            error
        );

        daftarPengumuman.innerHTML = `
            <div class="kosong">
                <p>Gagal memuat informasi.</p>
            </div>
        `;

        infoHasil.textContent = "";

    }

}



/* =========================================================
   TAMPILKAN PENGUMUMAN
========================================================= */

function tampilkanPengumuman(data) {

    daftarPengumuman.innerHTML = "";


    if (!data || data.length === 0) {

        daftarPengumuman.innerHTML = `
            <div class="kosong">
                <p>
                    Tidak ada informasi yang ditemukan.
                </p>
            </div>
        `;

        infoHasil.textContent = "";

        return;

    }


    infoHasil.textContent =
        data.length +
        " informasi tersedia";


    data.forEach(function(item) {

        const card =
            buatCardDokumen(item);

        daftarPengumuman.appendChild(card);

    });

}



/* =========================================================
   BUAT CARD
========================================================= */

function buatCardDokumen(item) {

    const card =
        document.createElement("div");

    card.className =
        "dokumen-card";

    card.setAttribute(
        "role",
        "button"
    );

    card.setAttribute(
        "tabindex",
        "0"
    );


    const judul =
        item.judul ||
        "Pengumuman Jemaat";


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


    card.innerHTML = `

        <div class="file-icon">

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round">

                <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z">
                </path>

                <polyline
                    points="14 2 14 8 20 8">
                </polyline>

                <line
                    x1="8"
                    y1="13"
                    x2="16"
                    y2="13">
                </line>

                <line
                    x1="8"
                    y1="17"
                    x2="14"
                    y2="17">
                </line>

            </svg>

        </div>


        <div class="dokumen-info">

            <h3 class="dokumen-title">
                ${escapeHTML(judul)}
            </h3>

            <div class="dokumen-meta">

                <span class="format-badge">
                    ${escapeHTML(format)}
                </span>

                <span>
                    ${formatTanggal(item.created_at)}
                </span>

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



/* =========================================================
   BUKA DOKUMEN
========================================================= */

function bukaDokumen(item) {

    const url =
        item.url_file || "";


    const keterangan =
        item.keterangan || "";


    const ekstensi =
        ambilEkstensi(
            item.nama_asli ||
            item.nama_file ||
            ""
        );


    /*
        Tidak ada file.
        Berarti ini pengumuman teks.
    */

    if (!url) {

        bukaModalPengumuman(
            item
        );

        return;

    }


    /*
        PDF
    */

    if (ekstensi === "pdf") {

        bukaModalDenganKeterangan(
            item,
            url
        );

        return;

    }


    /*
        Gambar
    */

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
            item,
            url
        );

        return;

    }


    /*
        File lainnya
    */

    bukaModalFile(
        item,
        url
    );

}



/* =========================================================
   MODAL PENGUMUMAN TEKS
========================================================= */

function bukaModalPengumuman(item) {

    const judul =
        item.judul ||
        "Pengumuman";


    const keterangan =
        item.keterangan ||
        "";


    const keteranganRapi =
        rapikanKeterangan(
            keterangan
        );


    modalJudul.textContent =
        judul;


    modalNamaFile.textContent =
        "";


    btnDownload.style.display =
        "none";


    /*
        Bersihkan isi modal.
    */

    modalContent.innerHTML =
        "";


    /*
        Gunakan textContent,
        bukan template literal.

        Dengan cara ini tidak ada
        spasi/baris dari indentasi
        JavaScript yang ikut tampil.
    */

    const isi =
        document.createElement(
            "div"
        );


    isi.className =
        "modal-keterangan";


    isi.textContent =
        keteranganRapi;


    modalContent.appendChild(
        isi
    );


    bukaModal();

}



/* =========================================================
   MODAL PDF
========================================================= */

function bukaModalDenganKeterangan(
    item,
    url
) {

    const judul =
        item.judul ||
        "Dokumen";


    const keterangan =
        rapikanKeterangan(
            item.keterangan || ""
        );


    modalJudul.textContent =
        judul;


    modalNamaFile.textContent =
        item.nama_asli ||
        item.nama_file ||
        "Dokumen PDF";


    btnDownload.href =
        url;


    btnDownload.textContent =
        "Buka PDF";


    btnDownload.style.display =
        "inline-flex";


    modalContent.innerHTML =
        "";


    /*
        Jika ada keterangan,
        tampilkan di bagian atas.
    */

    if (keterangan) {

        const isi =
            document.createElement(
                "div"
            );

        isi.className =
            "modal-keterangan";

        isi.textContent =
            keterangan;

        modalContent.appendChild(
            isi
        );

    }


    bukaModal();

}



/* =========================================================
   MODAL GAMBAR
========================================================= */

function bukaModalGambar(
    item,
    url
) {

    modalJudul.textContent =
        item.judul ||
        "Foto";


    modalNamaFile.textContent =
        item.nama_asli ||
        item.nama_file ||
        "";


    btnDownload.href =
        url;


    btnDownload.textContent =
        "Download";


    btnDownload.style.display =
        "inline-flex";


    modalContent.innerHTML =
        "";


    /*
        Jika ada keterangan,
        tampilkan dahulu.
    */

    const keterangan =
        rapikanKeterangan(
            item.keterangan || ""
        );


    if (keterangan) {

        const isi =
            document.createElement(
                "div"
            );

        isi.className =
            "modal-keterangan";

        isi.textContent =
            keterangan;

        modalContent.appendChild(
            isi
        );

    }


    const gambar =
        document.createElement(
            "img"
        );


    gambar.className =
        "modal-gambar";


    gambar.src =
        url;


    gambar.alt =
        item.judul ||
        "Foto informasi jemaat";


    modalContent.appendChild(
        gambar
    );


    bukaModal();

}



/* =========================================================
   MODAL FILE LAIN
========================================================= */

function bukaModalFile(
    item,
    url
) {

    modalJudul.textContent =
        item.judul ||
        "Dokumen";


    modalNamaFile.textContent =
        item.nama_asli ||
        item.nama_file ||
        "";


    btnDownload.href =
        url;


    btnDownload.textContent =
        "Download";


    btnDownload.style.display =
        "inline-flex";


    modalContent.innerHTML =
        "";


    const keterangan =
        rapikanKeterangan(
            item.keterangan || ""
        );


    if (keterangan) {

        const isi =
            document.createElement(
                "div"
            );

        isi.className =
            "modal-keterangan";

        isi.textContent =
            keterangan;

        modalContent.appendChild(
            isi
        );

    }


    const fileBox =
        document.createElement(
            "div"
        );


    fileBox.className =
        "modal-file";


    fileBox.innerHTML = `

        <div class="modal-file-icon">

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round">

                <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z">
                </path>

                <polyline
                    points="14 2 14 8 20 8">
                </polyline>

                <line
                    x1="8"
                    y1="13"
                    x2="16"
                    y2="13">
                </line>

                <line
                    x1="8"
                    y1="17"
                    x2="14"
                    y2="17">
                </line>

            </svg>

        </div>

        <p>
            Dokumen tersedia untuk
            diunduh.
        </p>

    `;


    modalContent.appendChild(
        fileBox
    );


    bukaModal();

}



/* =========================================================
   BUKA MODAL
========================================================= */

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



/* =========================================================
   TUTUP MODAL
========================================================= */

function tutupModal() {

    modal.style.display =
        "none";


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    modalContent.innerHTML =
        "";


    document.body.style.overflow =
        "";

}



/* =========================================================
   EVENT TOMBOL TUTUP
========================================================= */

if (btnTutup) {

    btnTutup.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            tutupModal();

        }
    );

}



/* =========================================================
   KLIK AREA GELAP
========================================================= */

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



/* =========================================================
   ESCAPE
========================================================= */

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



/* =========================================================
   PENCARIAN
========================================================= */

if (inputPencarian) {

    inputPencarian.addEventListener(
        "input",
        function() {

            const kata =
                inputPencarian.value
                    .trim()
                    .toLowerCase();


            if (kata) {

                btnHapusPencarian.style.display =
                    "flex";

            } else {

                btnHapusPencarian.style.display =
                    "none";

            }


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
                            ).toLowerCase();


                        const keterangan =
                            String(
                                item.keterangan || ""
                            ).toLowerCase();


                        const namaFile =
                            String(
                                item.nama_asli ||
                                item.nama_file ||
                                ""
                            ).toLowerCase();


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
                        <p>
                            Tidak ada informasi yang sesuai
                            dengan pencarian.
                        </p>
                    </div>
                `;

                infoHasil.textContent =
                    "Tidak ditemukan";

                return;

            }


            tampilkanPengumuman(
                hasil
            );

        }
    );

}



/* =========================================================
   HAPUS PENCARIAN
========================================================= */

if (btnHapusPencarian) {

    btnHapusPencarian.addEventListener(
        "click",
        function() {

            inputPencarian.value =
                "";

            btnHapusPencarian.style.display =
                "none";


            tampilkanPengumuman(
                semuaPengumuman
            );


            inputPencarian.focus();

        }
    );

}



/* =========================================================
   RAPIIKAN KETERANGAN
========================================================= */

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

        /*
            Samakan jenis line break.
        */

        .replace(
            /\r\n/g,
            "\n"
        )

        .replace(
            /\r/g,
            "\n"
        )

        /*
            Hapus whitespace tersembunyi
            di awal keseluruhan teks.
        */

        .replace(
            /^[\s\u00A0\u200B\u200C\u200D\uFEFF]+/,
            ""
        )

        /*
            Bersihkan setiap baris.
            Baris baru tetap dipertahankan.
        */

        .split("\n")

        .map(
            function(baris) {

                return baris

                    .replace(
                        /^[\s\u00A0\u200B\u200C\u200D\uFEFF]+/,
                        ""
                    )

                    .replace(
                        /[\s\u00A0\u200B\u200C\u200D\uFEFF]+$/,
                        ""
                    );

            }
        )

        .join("\n")

        /*
            Bersihkan whitespace di akhir.
        */

        .replace(
            /[\s\u00A0\u200B\u200C\u200D\uFEFF]+$/,
            ""
        );

}



/* =========================================================
   FORMAT TANGGAL
========================================================= */

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



/* =========================================================
   AMBIL EKSTENSI
========================================================= */

function ambilEkstensi(
    namaFile
) {

    if (!namaFile) {

        return "";

    }


    const nama =
        String(namaFile)
            .toLowerCase()
            .trim();


    const posisi =
        nama.lastIndexOf(".");


    if (
        posisi === -1
    ) {

        return "";

    }


    return nama
        .substring(
            posisi + 1
        );

}



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text || "";


    return div.innerHTML;

}



/* =========================================================
   JALANKAN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        ambilPengumuman();

    }
);
