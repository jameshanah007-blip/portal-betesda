const inputFile =
    document.getElementById("file");

const infoFile =
    document.getElementById("infoFile");

const MAX_SIZE =
    20 * 1024 * 1024;

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


/* =========================
   PILIH FILE
========================= */

inputFile.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) {

            infoFile.style.display =
                "none";

            infoFile.innerHTML =
                "";

            return;
        }


        const namaFile =
            file.name;


        const ekstensi =
            namaFile
                .split(".")
                .pop()
                .toLowerCase();


        if (
            !EXTENSI_DIIJINKAN.includes(
                ekstensi
            )
        ) {

            alert(
                "Format file belum didukung."
            );

            this.value = "";

            infoFile.style.display =
                "none";

            return;
        }


        if (
            file.size > MAX_SIZE
        ) {

            alert(
                "Ukuran file maksimal 20 MB."
            );

            this.value = "";

            infoFile.style.display =
                "none";

            return;
        }


        infoFile.innerHTML = `
            <strong>${escapeHTML(
                file.name
            )}</strong><br>
            Ukuran: ${formatUkuran(
                file.size
            )}<br>
            Tipe: ${escapeHTML(
                file.type ||
                ekstensi.toUpperCase()
            )}
        `;


        infoFile.style.display =
            "block";
    }
);


/* =========================
   UPLOAD PENGUMUMAN
========================= */

async function uploadPengumuman() {

    const judul =
        document
            .getElementById("judul")
            .value
            .trim();


    const file =
        document
            .getElementById("file")
            .files[0];


    const status =
        document.getElementById(
            "status"
        );


    const button =
        document.getElementById(
            "btnUpload"
        );


    /* =========================
       VALIDASI JUDUL
    ========================= */

    if (!judul) {

        alert(
            "Silakan isi judul pengumuman."
        );

        return;
    }


    /* =========================
       VALIDASI FILE
    ========================= */

    if (!file) {

        alert(
            "Silakan pilih file terlebih dahulu."
        );

        return;
    }


    if (
        file.size > MAX_SIZE
    ) {

        alert(
            "Ukuran file maksimal 20 MB."
        );

        return;
    }


    const ekstensi =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    if (
        !EXTENSI_DIIJINKAN.includes(
            ekstensi
        )
    ) {

        alert(
            "Format file belum didukung."
        );

        return;
    }


    /* =========================
       MULAI UPLOAD
    ========================= */

    button.disabled =
        true;


    status.innerHTML =
        "Mempersiapkan upload...";


    try {

        /* =========================
           NAMA FILE UNIK
        ========================= */

        const namaBersih =
            file.name
                .normalize("NFKD")
                .replace(
                    /[^\w.\- ]/g,
                    ""
                )
                .replace(
                    /\s+/g,
                    "-"
                );


        const namaUnik =
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 9) +
            "-" +
            namaBersih;


        const path =
            namaUnik;


        /* =========================
           UPLOAD STORAGE
        ========================= */

        status.innerHTML =
            "Mengupload file...";


        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from("pengumuman")
                .upload(
                    path,
                    file,
                    {
                        contentType:
                            file.type ||
                            "application/octet-stream",

                        upsert: false
                    }
                );


        if (uploadError) {

            console.error(
                "ERROR STORAGE:",
                uploadError
            );

            throw new Error(
                "Storage: " +
                uploadError.message
            );
        }


        /* =========================
           PUBLIC URL
        ========================= */

        const {
            data: urlData
        } =
            supabaseClient
                .storage
                .from("pengumuman")
                .getPublicUrl(
                    path
                );


        const urlFile =
            urlData.publicUrl;


        /* =========================
           SIMPAN DATABASE
        ========================= */

        status.innerHTML =
            "Menyimpan informasi dokumen...";


        const {
            error: databaseError
        } =
            await supabaseClient
                .from("pengumuman")
                .insert([
                    {
                        judul:
                            judul,

                        nama_file:
                            path,

                        nama_asli:
                            file.name,

                        url_file:
                            urlFile,

                        tipe_file:
                            file.type ||
                            ekstensi,

                        ukuran_file:
                            file.size
                    }
                ]);


        if (databaseError) {

            console.error(
                "ERROR DATABASE:",
                databaseError
            );


            /* =========================
               HAPUS FILE JIKA DATABASE GAGAL
            ========================= */

            await supabaseClient
                .storage
                .from("pengumuman")
                .remove([
                    path
                ]);


            throw new Error(
                "Database: " +
                databaseError.message
            );
        }


        /* =========================
           BERHASIL
        ========================= */

        status.innerHTML =
            "Dokumen berhasil diupload.";


        document
            .getElementById("judul")
            .value =
            "";


        document
            .getElementById("file")
            .value =
            "";


        infoFile.style.display =
            "none";


        infoFile.innerHTML =
            "";


    } catch (error) {

        console.error(
            "UPLOAD ERROR:",
            error
        );


        status.innerHTML =
            "Gagal upload: " +
            escapeHTML(
                error.message
            );

    }


    button.disabled =
        false;
}


/* =========================
   FORMAT UKURAN
========================= */

function formatUkuran(bytes) {

    if (!bytes) {
        return "0 B";
    }


    if (bytes < 1024) {

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
        )
            .toFixed(1) +
        " MB"
    );
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {

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
