/* =========================================================
   KELOLA PENGUMUMAN
   Upload file untuk HP & komputer
   Supabase Storage + Database
   ========================================================= */


/* =========================================================
   ELEMENT HTML
========================================================= */

const inputFile = document.getElementById("file");
const infoFile = document.getElementById("infoFile");
const judulInput = document.getElementById("judul");
const status = document.getElementById("status");
const button = document.getElementById("btnUpload");


/* =========================================================
   KONFIGURASI
========================================================= */

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

const EXTENSI_DIIJINKAN = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "txt",
    "csv",
    "rtf",
    "odt",
    "ods",
    "odp",
    "zip",
    "rar",
    "7z"
];


/* =========================================================
   CEK SUPABASE
========================================================= */

if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient
) {
    console.error(
        "supabaseClient tidak ditemukan."
    );

    if (status) {
        status.innerHTML =
            "Koneksi Supabase belum tersedia.";
    }
}


/* =========================================================
   PILIH FILE
========================================================= */

inputFile.addEventListener(
    "change",
    function () {

        const file = this.files?.[0];

        if (!file) {

            infoFile.style.display = "none";
            infoFile.innerHTML = "";

            return;
        }


        console.log("File dipilih:", file);


        /* =========================
           NAMA FILE
        ========================= */

        const namaFile =
            file.name || "file";


        /* =========================
           EKSTENSI
        ========================= */

        const ekstensi =
            ambilEkstensi(namaFile);


        /* =========================
           CEK FORMAT
        ========================= */

        if (
            !EXTENSI_DIIJINKAN.includes(
                ekstensi
            )
        ) {

            alert(
                "Format file belum didukung.\n\n" +
                "Format yang diperbolehkan:\n" +
                EXTENSI_DIIJINKAN.join(", ")
            );

            this.value = "";

            infoFile.style.display = "none";
            infoFile.innerHTML = "";

            return;
        }


        /* =========================
           CEK UKURAN
        ========================= */

        if (file.size > MAX_SIZE) {

            alert(
                "Ukuran file maksimal 20 MB.\n\n" +
                "Ukuran file Anda: " +
                formatUkuran(file.size)
            );

            this.value = "";

            infoFile.style.display = "none";
            infoFile.innerHTML = "";

            return;
        }


        /* =========================
           TAMPILKAN INFO
        ========================= */

        infoFile.innerHTML = `
            <strong>
                ${escapeHTML(namaFile)}
            </strong>
            <br>
            Ukuran:
            ${formatUkuran(file.size)}
            <br>
            Tipe:
            ${escapeHTML(
                file.type ||
                "Tipe tidak terdeteksi"
            )}
        `;

        infoFile.style.display = "block";
    }
);


/* =========================================================
   FUNGSI UPLOAD
========================================================= */

async function uploadPengumuman() {

    console.log(
        "Memulai proses upload..."
    );


    /* =====================================================
       AMBIL DATA
    ===================================================== */

    const judul =
        judulInput.value.trim();


    const file =
        inputFile.files?.[0];


    /* =====================================================
       CEK JUDUL
    ===================================================== */

    if (!judul) {

        alert(
            "Silakan isi judul pengumuman."
        );

        judulInput.focus();

        return;
    }


    /* =====================================================
       CEK FILE
    ===================================================== */

    if (!file) {

        alert(
            "Silakan pilih file terlebih dahulu."
        );

        return;
    }


    console.log(
        "Nama file:",
        file.name
    );

    console.log(
        "Ukuran file:",
        file.size
    );

    console.log(
        "Tipe file:",
        file.type
    );


    /* =====================================================
       CEK FILE VALID
    ===================================================== */

    if (
        !Number.isFinite(file.size) ||
        file.size <= 0
    ) {

        alert(
            "File tidak dapat dibaca oleh perangkat.\n\n" +
            "Silakan pilih file lain."
        );

        return;
    }


    /* =====================================================
       CEK UKURAN
    ===================================================== */

    if (file.size > MAX_SIZE) {

        alert(
            "Ukuran file maksimal 20 MB.\n\n" +
            "Ukuran file Anda: " +
            formatUkuran(file.size)
        );

        return;
    }


    /* =====================================================
       CEK EKSTENSI
    ===================================================== */

    const ekstensi =
        ambilEkstensi(
            file.name
        );


    if (
        !EXTENSI_DIIJINKAN.includes(
            ekstensi
        )
    ) {

        alert(
            "Format file tidak didukung."
        );

        return;
    }


    /* =====================================================
       CEK SUPABASE
    ===================================================== */

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        tampilkanStatus(
            "Supabase belum terhubung.",
            true
        );

        return;
    }


    /* =====================================================
       MATIKAN TOMBOL
    ===================================================== */

    button.disabled = true;

    button.innerHTML =
        "Mengupload...";


    tampilkanStatus(
        "Mempersiapkan upload..."
    );


    try {


        /* =================================================
           BERSIHKAN NAMA FILE
        ================================================= */

        let namaBersih =
            bersihkanNamaFile(
                file.name
            );


        if (!namaBersih) {

            namaBersih =
                "dokumen." +
                ekstensi;
        }


        /* =================================================
           BUAT NAMA FILE UNIK
        ================================================= */

        const waktu =
            Date.now();


        const random =
            Math.random()
                .toString(36)
                .substring(
                    2,
                    10
                );


        const namaUnik =
            waktu +
            "-" +
            random +
            "-" +
            namaBersih;


        const path =
            namaUnik;


        console.log(
            "Path file:",
            path
        );


        /* =================================================
           UPLOAD KE SUPABASE STORAGE
        ================================================= */

        tampilkanStatus(
            "Mengupload file ke Storage..."
        );


        const {
            data: uploadData,
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from("pengumuman")
                .upload(
                    path,
                    file,
                    {
                        cacheControl:
                            "3600",

                        contentType:
                            tentukanContentType(
                                file,
                                ekstensi
                            ),

                        upsert:
                            false
                    }
                );


        console.log(
            "Upload Storage:",
            uploadData
        );


        /* =================================================
           CEK ERROR STORAGE
        ================================================= */

        if (uploadError) {

            console.error(
                "ERROR STORAGE:",
                uploadError
            );

            throw new Error(
                jelaskanErrorStorage(
                    uploadError
                )
            );
        }


        /* =================================================
           BUAT PUBLIC URL
        ================================================= */

        tampilkanStatus(
            "Membuat alamat file..."
        );


        const {
            data: urlData
        } =
            supabaseClient
                .storage
                .from("pengumuman")
                .getPublicUrl(
                    path
                );


        if (
            !urlData ||
            !urlData.publicUrl
        ) {

            throw new Error(
                "Alamat file tidak berhasil dibuat."
            );
        }


        const urlFile =
            urlData.publicUrl;


        console.log(
            "URL file:",
            urlFile
        );


        /* =================================================
           SIMPAN KE DATABASE
        ================================================= */

        tampilkanStatus(
            "Menyimpan data pengumuman..."
        );


        const {
            data: databaseData,
            error: databaseError
        } =
            await supabaseClient
                .from("pengumuman")
                .insert([
                    {

                        judul:
                            judul,

                        keterangan:
                            null,

                        nama_file:
                            path,

                        nama_asli:
                            file.name,

                        url_file:
                            urlFile,

                        tipe_file:
                            file.type ||
                            tentukanContentType(
                                file,
                                ekstensi
                            ),

                        ukuran_file:
                            file.size
                    }
                ])
                .select();


        console.log(
            "Database:",
            databaseData
        );


        /* =================================================
           CEK ERROR DATABASE
        ================================================= */

        if (databaseError) {

            console.error(
                "ERROR DATABASE:",
                databaseError
            );


            /* =========================
               HAPUS FILE STORAGE
            ========================= */

            try {

                await supabaseClient
                    .storage
                    .from("pengumuman")
                    .remove([
                        path
                    ]);

            } catch (hapusError) {

                console.error(
                    "Gagal menghapus file:",
                    hapusError
                );
            }


            throw new Error(
                jelaskanErrorDatabase(
                    databaseError
                )
            );
        }


        /* =================================================
           BERHASIL
        ================================================= */

        tampilkanStatus(
            "✓ Dokumen berhasil diupload.",
            false
        );


        /* =================================================
           RESET FORM
        ================================================= */

        judulInput.value = "";

        inputFile.value = "";

        infoFile.style.display =
            "none";

        infoFile.innerHTML = "";


    } catch (error) {

        console.error(
            "UPLOAD ERROR:",
            error
        );


        tampilkanStatus(
            "Gagal upload: " +
            error.message,
            true
        );

    } finally {

        /* =================================================
           AKTIFKAN KEMBALI TOMBOL
        ================================================= */

        button.disabled = false;

        button.innerHTML =
            "Upload Dokumen";
    }
}


/* =========================================================
   AMBIL EKSTENSI FILE
========================================================= */

function ambilEkstensi(
    namaFile
) {

    if (!namaFile) {
        return "";
    }


    const bagian =
        namaFile
            .toLowerCase()
            .split(".");


    if (
        bagian.length < 2
    ) {
        return "";
    }


    return bagian
        .pop()
        .trim();
}


/* =========================================================
   BERSIHKAN NAMA FILE
========================================================= */

function bersihkanNamaFile(
    namaFile
) {

    if (!namaFile) {
        return "";
    }


    let nama =
        namaFile
            .normalize("NFKD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );


    nama =
        nama.replace(
            /[^a-zA-Z0-9._-]/g,
            "-"
        );


    nama =
        nama.replace(
            /-+/g,
            "-"
        );


    nama =
        nama.replace(
            /^[-.]+|[-.]+$/g,
            ""
        );


    return nama;
}


/* =========================================================
   CONTENT TYPE
========================================================= */

function tentukanContentType(
    file,
    ekstensi
) {

    /* Jika perangkat memberikan MIME type,
       gunakan MIME type tersebut. */

    if (
        file &&
        file.type
    ) {

        return file.type;
    }


    /* =========================
       MIME FALLBACK
    ========================= */

    const mime = {

        pdf:
            "application/pdf",

        doc:
            "application/msword",

        docx:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        xls:
            "application/vnd.ms-excel",

        xlsx:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        ppt:
            "application/vnd.ms-powerpoint",

        pptx:
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",

        jpg:
            "image/jpeg",

        jpeg:
            "image/jpeg",

        png:
            "image/png",

        gif:
            "image/gif",

        webp:
            "image/webp",

        txt:
            "text/plain",

        csv:
            "text/csv",

        rtf:
            "application/rtf",

        zip:
            "application/zip",

        rar:
            "application/vnd.rar",

        "7z":
            "application/x-7z-compressed",

        odt:
            "application/vnd.oasis.opendocument.text",

        ods:
            "application/vnd.oasis.opendocument.spreadsheet",

        odp:
            "application/vnd.oasis.opendocument.presentation"
    };


    return (
        mime[ekstensi] ||
        "application/octet-stream"
    );
}


/* =========================================================
   ERROR STORAGE
========================================================= */

function jelaskanErrorStorage(
    error
) {

    const message =
        error?.message ||
        "";


    const lower =
        message.toLowerCase();


    if (
        lower.includes(
            "row-level security"
        )
    ) {

        return (
            "Upload ditolak oleh keamanan " +
            "Supabase Storage. Periksa policy " +
            "bucket pengumuman."
        );
    }


    if (
        lower.includes(
            "not found"
        )
    ) {

        return (
            "Bucket Storage 'pengumuman' " +
            "tidak ditemukan."
        );
    }


    if (
        lower.includes(
            "duplicate"
        )
    ) {

        return (
            "Nama file sudah digunakan. " +
            "Silakan coba lagi."
        );
    }


    if (
        lower.includes(
            "payload"
        )
    ) {

        return (
            "File terlalu besar untuk proses upload."
        );
    }


    if (
        lower.includes(
            "network"
        )
    ) {

        return (
            "Koneksi internet bermasalah. " +
            "Periksa koneksi HP Anda."
        );
    }


    return (
        message ||
        "Upload file ke Storage gagal."
    );
}


/* =========================================================
   ERROR DATABASE
========================================================= */

function jelaskanErrorDatabase(
    error
) {

    const message =
        error?.message ||
        "";


    const lower =
        message.toLowerCase();


    if (
        lower.includes(
            "row-level security"
        )
    ) {

        return (
            "File berhasil diupload, tetapi " +
            "data pengumuman ditolak oleh " +
            "keamanan database Supabase."
        );
    }


    if (
        lower.includes(
            "column"
        )
    ) {

        return (
            "Struktur tabel pengumuman " +
            "tidak sesuai dengan program."
        );
    }


    return (
        message ||
        "Data pengumuman gagal disimpan."
    );
}


/* =========================================================
   TAMPILKAN STATUS
========================================================= */

function tampilkanStatus(
    pesan,
    error = false
) {

    status.innerHTML =
        escapeHTML(pesan);


    status.style.background =
        error
            ? "#fef2f2"
            : "#f8fafc";


    status.style.color =
        error
            ? "#b91c1c"
            : "#475569";


    status.style.border =
        error
            ? "1px solid #fecaca"
            : "1px solid #e5eaf0";
}


/* =========================================================
   FORMAT UKURAN FILE
========================================================= */

function formatUkuran(
    bytes
) {

    if (!bytes) {
        return "0 B";
    }


    if (
        bytes <
        1024
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
        (
            bytes /
            (1024 * 1024)
        ).toFixed(1) +
        " MB"
    );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

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
