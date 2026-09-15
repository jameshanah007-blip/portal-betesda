/* =========================================================
   KELOLA PENGUMUMAN
   Pengumuman teks + file opsional
   Supabase Storage + Database
   ========================================================= */


/* =========================================================
   ELEMENT HTML
========================================================= */

const inputFile =
    document.getElementById("file");

const infoFile =
    document.getElementById("infoFile");

const judulInput =
    document.getElementById("judul");

const keteranganInput =
    document.getElementById("keterangan");

const status =
    document.getElementById("status");

const button =
    document.getElementById("btnUpload");


/* =========================================================
   KONFIGURASI
========================================================= */

const MAX_SIZE =
    20 * 1024 * 1024; // 20 MB


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

if (inputFile) {

    inputFile.addEventListener(
        "change",
        function () {

            const file =
                this.files?.[0];


            if (!file) {

                infoFile.style.display =
                    "none";

                infoFile.innerHTML =
                    "";

                return;

            }


            console.log(
                "File dipilih:",
                file
            );


            /* =========================
               NAMA FILE
            ========================= */

            const namaFile =
                file.name ||
                "file";


            /* =========================
               EKSTENSI
            ========================= */

            const ekstensi =
                ambilEkstensi(
                    namaFile
                );


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
                    EXTENSI_DIIJINKAN.join(
                        ", "
                    )
                );


                this.value =
                    "";


                infoFile.style.display =
                    "none";

                infoFile.innerHTML =
                    "";


                return;

            }


            /* =========================
               CEK UKURAN
            ========================= */

            if (
                file.size > MAX_SIZE
            ) {

                alert(
                    "Ukuran file maksimal 20 MB.\n\n" +
                    "Ukuran file Anda: " +
                    formatUkuran(
                        file.size
                    )
                );


                this.value =
                    "";


                infoFile.style.display =
                    "none";

                infoFile.innerHTML =
                    "";


                return;

            }


            /* =========================
               TAMPILKAN INFO
            ========================= */

            infoFile.innerHTML = `

                <strong>
                    ${escapeHTML(
                        namaFile
                    )}
                </strong>

                <br>

                Ukuran:
                ${formatUkuran(
                    file.size
                )}

                <br>

                Tipe:
                ${escapeHTML(
                    file.type ||
                    "Tipe tidak terdeteksi"
                )}

            `;


            infoFile.style.display =
                "block";

        }
    );

}


/* =========================================================
   FUNGSI PUBLIKASI PENGUMUMAN
========================================================= */

async function uploadPengumuman() {

    console.log(
        "Memulai proses publikasi pengumuman..."
    );


    /* =====================================================
       AMBIL DATA
    ===================================================== */

    const judul =
        judulInput.value.trim();


    const keterangan =
        keteranganInput
            ? keteranganInput.value.trim()
            : "";


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
       CEK ISI PENGUMUMAN
    ===================================================== */

    if (!keterangan) {

        alert(
            "Silakan isi pengumuman terlebih dahulu."
        );


        if (keteranganInput) {

            keteranganInput.focus();

        }


        return;

    }


    /* =====================================================
       FILE OPSIONAL
    ===================================================== */

    if (file) {

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


        /* =============================================
           CEK FILE VALID
        ============================================= */

        if (

            !Number.isFinite(
                file.size
            ) ||

            file.size <= 0

        ) {

            alert(
                "File tidak dapat dibaca oleh perangkat.\n\n" +
                "Silakan pilih file lain."
            );


            return;

        }


        /* =============================================
           CEK UKURAN
        ============================================= */

        if (
            file.size > MAX_SIZE
        ) {

            alert(
                "Ukuran file maksimal 20 MB.\n\n" +
                "Ukuran file Anda: " +
                formatUkuran(
                    file.size
                )
            );


            return;

        }


        /* =============================================
           CEK EKSTENSI
        ============================================= */

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

    button.disabled =
        true;


    button.innerHTML =
        "Mempublikasikan...";


    tampilkanStatus(
        "Mempersiapkan pengumuman..."
    );


    try {

        /* =================================================
           VARIABEL FILE
        ================================================= */

        let path =
            null;

        let urlFile =
            null;

        let namaFile =
            null;

        let namaAsli =
            null;

        let tipeFile =
            null;

        let ukuranFile =
            null;


        /* =================================================
           JIKA ADA FILE
        ================================================= */

        if (file) {

            /* =============================================
               BERSIHKAN NAMA FILE
            ============================================= */

            let namaBersih =
                bersihkanNamaFile(
                    file.name
                );


            if (!namaBersih) {

                namaBersih =
                    "dokumen." +
                    ambilEkstensi(
                        file.name
                    );

            }


            /* =============================================
               BUAT NAMA FILE UNIK
            ============================================= */

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


            path =
                namaUnik;


            console.log(
                "Path file:",
                path
            );


            /* =============================================
               UPLOAD KE STORAGE
            ============================================= */

            tampilkanStatus(
                "Mengupload file ke Storage..."
            );


            const {

                data: uploadData,

                error: uploadError

            } =

                await supabaseClient

                    .storage

                    .from(
                        "pengumuman"
                    )

                    .upload(

                        path,

                        file,

                        {

                            cacheControl:
                                "3600",

                            contentType:
                                tentukanContentType(
                                    file,
                                    ambilEkstensi(
                                        file.name
                                    )
                                ),

                            upsert:
                                false

                        }

                    );


            console.log(
                "Upload Storage:",
                uploadData
            );


            /* =============================================
               CEK ERROR STORAGE
            ============================================= */

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


            /* =============================================
               BUAT PUBLIC URL
            ============================================= */

            tampilkanStatus(
                "Membuat alamat file..."
            );


            const {

                data: urlData

            } =

                supabaseClient

                    .storage

                    .from(
                        "pengumuman"
                    )

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


            urlFile =
                urlData.publicUrl;


            namaFile =
                path;


            namaAsli =
                file.name;


            tipeFile =
                file.type ||
                tentukanContentType(
                    file,
                    ambilEkstensi(
                        file.name
                    )
                );


            ukuranFile =
                file.size;


            console.log(
                "URL file:",
                urlFile
            );

        }


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

                .from(
                    "pengumuman"
                )

                .insert([

                    {

                        judul:
                            judul,

                        keterangan:
                            keterangan,

                        nama_file:
                            namaFile,

                        nama_asli:
                            namaAsli,

                        url_file:
                            urlFile,

                        tipe_file:
                            tipeFile,

                        ukuran_file:
                            ukuranFile

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


            /* =============================================
               JIKA FILE SUDAH TERUPLOAD,
               HAPUS KEMBALI FILE TERSEBUT
            ============================================= */

            if (path) {

                try {

                    await supabaseClient

                        .storage

                        .from(
                            "pengumuman"
                        )

                        .remove([
                            path
                        ]);


                } catch (
                    hapusError
                ) {

                    console.error(
                        "Gagal menghapus file:",
                        hapusError
                    );

                }

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
            "✓ Pengumuman berhasil dipublikasikan.",
            false
        );


        /* =================================================
           RESET FORM
        ================================================= */

        judulInput.value =
            "";


        if (keteranganInput) {

            keteranganInput.value =
                "";

        }


        inputFile.value =
            "";


        infoFile.style.display =
            "none";


        infoFile.innerHTML =
            "";


    } catch (error) {

        console.error(
            "PENGUMUMAN ERROR:",
            error
        );


        tampilkanStatus(
            "Gagal menyimpan pengumuman: " +
            error.message,
            true
        );


    } finally {

        /* =================================================
           AKTIFKAN KEMBALI TOMBOL
        ================================================= */

        button.disabled =
            false;


        button.innerHTML =
            "Publikasikan Pengumuman";

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

            "Pengumuman ditolak oleh keamanan " +
            "database Supabase."

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
        escapeHTML(
            pesan
        );


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

            (

                bytes /
                1024

            )
                .toFixed(1) +

            " KB"

        );

    }


    return (

        (

            bytes /
            (1024 * 1024)

        )
            .toFixed(1) +

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
