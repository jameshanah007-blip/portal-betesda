/* =========================================================
   KELOLA PENGUMUMAN
   TAMBAH + EDIT + HAPUS
   SUPABASE DATABASE + STORAGE
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

const buttonBatalEdit =
    document.getElementById("btnBatalEdit");

const formTitle =
    document.getElementById("formTitle");

const daftarPengumuman =
    document.getElementById("daftarPengumuman");

const confirmOverlay =
    document.getElementById("confirmOverlay");

const confirmText =
    document.getElementById("confirmText");


/* =========================================================
   KONFIGURASI
   ========================================================= */

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


/* =========================================================
   MODE EDIT
   ========================================================= */

let modeEdit = false;

let dataEdit = null;

let idAkanDihapus = null;


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

    tampilkanStatus(
        "Koneksi Supabase belum tersedia.",
        true
    );

}


/* =========================================================
   SAAT HALAMAN SELESAI
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        ambilDaftarPengumuman();

    }
);


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


            const namaFile =
                file.name ||
                "file";


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
                    "Format file belum didukung."
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
                file.size >
                MAX_SIZE
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

            infoFile.innerHTML =
                `
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


            infoFile.style.display =
                "block";

        }
    );

}


/* =========================================================
   SIMPAN PENGUMUMAN
   ========================================================= */

async function simpanPengumuman() {

    const judul =
        judulInput.value.trim();


    const keterangan =
        keteranganInput.value.trim();


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
       CEK ISI
    ===================================================== */

    if (!keterangan) {

        alert(
            "Silakan isi pengumuman."
        );

        keteranganInput.focus();

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
       MODE EDIT
    ===================================================== */

    if (modeEdit) {

        await prosesEdit(
            judul,
            keterangan,
            file
        );

        return;

    }


    /* =====================================================
       MODE TAMBAH
    ===================================================== */

    await prosesTambah(
        judul,
        keterangan,
        file
    );

}


/* =========================================================
   TAMBAH PENGUMUMAN
   ========================================================= */

async function prosesTambah(
    judul,
    keterangan,
    file
) {

    button.disabled =
        true;

    button.innerHTML =
        "Menyimpan...";


    tampilkanStatus(
        "Menyimpan pengumuman..."
    );


    let path = null;

    let urlFile = null;

    let namaFile = null;

    let namaAsli = null;

    let tipeFile = null;

    let ukuranFile = null;


    try {

        /* =================================================
           UPLOAD FILE JIKA ADA
        ================================================= */

        if (file) {

            validasiFile(
                file
            );


            tampilkanStatus(
                "Mengupload file..."
            );


            const hasil =
                await uploadFile(
                    file
                );


            path =
                hasil.path;

            urlFile =
                hasil.urlFile;

            namaFile =
                hasil.namaFile;

            namaAsli =
                hasil.namaAsli;

            tipeFile =
                hasil.tipeFile;

            ukuranFile =
                hasil.ukuranFile;

        }


        /* =================================================
           SIMPAN DATABASE
        ================================================= */

        tampilkanStatus(
            "Menyimpan data pengumuman..."
        );


        const {
            data,
            error
        } =
            await supabaseClient
                .from("pengumuman")
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


        if (error) {

            console.error(
                "Database error:",
                error
            );


            /* =========================
               HAPUS FILE JIKA GAGAL
            ========================= */

            if (path) {

                await hapusFileStorage(
                    path
                );

            }


            throw new Error(
                jelaskanErrorDatabase(
                    error
                )
            );

        }


        console.log(
            "Data tersimpan:",
            data
        );


        tampilkanStatus(
            "✓ Pengumuman berhasil dipublikasikan.",
            false
        );


        resetForm();


        await ambilDaftarPengumuman();


    } catch (error) {

        console.error(
            "Tambah pengumuman error:",
            error
        );


        tampilkanStatus(
            "Gagal menyimpan: " +
            error.message,
            true
        );


    } finally {

        button.disabled =
            false;

        button.innerHTML =
            "Publikasikan Pengumuman";

    }

}


/* =========================================================
   EDIT PENGUMUMAN
   ========================================================= */

async function prosesEdit(
    judul,
    keterangan,
    fileBaru
) {

    if (!dataEdit) {

        batalEdit();

        return;

    }


    button.disabled =
        true;

    button.innerHTML =
        "Menyimpan Perubahan...";


    tampilkanStatus(
        "Menyimpan perubahan..."
    );


    let pathBaru = null;


    try {

        let updateData = {

            judul:
                judul,

            keterangan:
                keterangan

        };


        /* =================================================
           JIKA MEMILIH FILE BARU
        ================================================= */

        if (fileBaru) {

            validasiFile(
                fileBaru
            );


            tampilkanStatus(
                "Mengupload file baru..."
            );


            const hasil =
                await uploadFile(
                    fileBaru
                );


            pathBaru =
                hasil.path;


            updateData.nama_file =
                hasil.namaFile;

            updateData.nama_asli =
                hasil.namaAsli;

            updateData.url_file =
                hasil.urlFile;

            updateData.tipe_file =
                hasil.tipeFile;

            updateData.ukuran_file =
                hasil.ukuranFile;

        }


        /* =================================================
           UPDATE DATABASE
        ================================================= */

        tampilkanStatus(
            "Memperbarui data..."
        );


        const {
            error
        } =
            await supabaseClient
                .from("pengumuman")
                .update(
                    updateData
                )
                .eq(
                    "id",
                    dataEdit.id
                );


        if (error) {

            /* =========================
               HAPUS FILE BARU
               JIKA DATABASE GAGAL
            ========================= */

            if (pathBaru) {

                await hapusFileStorage(
                    pathBaru
                );

            }


            throw new Error(
                jelaskanErrorDatabase(
                    error
                )
            );

        }


        /* =================================================
           HAPUS FILE LAMA
           JIKA ADA FILE BARU
        ================================================= */

        if (
            fileBaru &&
            dataEdit.nama_file
        ) {

            await hapusFileStorage(
                dataEdit.nama_file
            );

        }


        tampilkanStatus(
            "✓ Pengumuman berhasil diperbarui.",
            false
        );


        resetForm();


        await ambilDaftarPengumuman();


    } catch (error) {

        console.error(
            "Edit error:",
            error
        );


        tampilkanStatus(
            "Gagal mengedit: " +
            error.message,
            true
        );


    } finally {

        button.disabled =
            false;

        if (modeEdit) {

            button.innerHTML =
                "Simpan Perubahan";

        } else {

            button.innerHTML =
                "Publikasikan Pengumuman";

        }

    }

}


/* =========================================================
   MULAI EDIT
   ========================================================= */

function mulaiEdit(item) {

    if (!item) {
        return;
    }


    modeEdit =
        true;


    dataEdit =
        item;


    formTitle.textContent =
        "Edit Pengumuman";


    button.innerHTML =
        "Simpan Perubahan";


    buttonBatalEdit.style.display =
        "block";


    judulInput.value =
        item.judul || "";


    keteranganInput.value =
        item.keterangan || "";


    inputFile.value =
        "";


    if (item.nama_asli) {

        infoFile.innerHTML =
            `
            File saat ini:
            <strong>
                ${escapeHTML(
                    item.nama_asli
                )}
            </strong>
            <br>
            Pilih file baru jika ingin menggantinya.
            `;

        infoFile.style.display =
            "block";

    } else {

        infoFile.innerHTML =
            "Tidak ada file yang dilampirkan.";

        infoFile.style.display =
            "block";

    }


    tampilkanStatus(
        "Mode edit aktif. Silakan ubah data lalu simpan.",
        false
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   BATAL EDIT
   ========================================================= */

function batalEdit() {

    modeEdit =
        false;


    dataEdit =
        null;


    formTitle.textContent =
        "Tambah Pengumuman";


    button.innerHTML =
        "Publikasikan Pengumuman";


    buttonBatalEdit.style.display =
        "none";


    judulInput.value =
        "";

    keteranganInput.value =
        "";

    inputFile.value =
        "";


    infoFile.innerHTML =
        "";

    infoFile.style.display =
        "none";


    status.innerHTML =
        "";

    status.style.background =
        "transparent";

    status.style.border =
        "none";

}


/* =========================================================
   RESET FORM
   ========================================================= */

function resetForm() {

    modeEdit =
        false;


    dataEdit =
        null;


    formTitle.textContent =
        "Tambah Pengumuman";


    judulInput.value =
        "";

    keteranganInput.value =
        "";

    inputFile.value =
        "";


    infoFile.innerHTML =
        "";

    infoFile.style.display =
        "none";


    buttonBatalEdit.style.display =
        "none";


    button.innerHTML =
        "Publikasikan Pengumuman";

}


/* =========================================================
   AMBIL DAFTAR PENGUMUMAN
   ========================================================= */

async function ambilDaftarPengumuman() {

    if (!daftarPengumuman) {
        return;
    }


    daftarPengumuman.innerHTML =
        `
        <div class="daftar-loading">
            Memuat pengumuman...
        </div>
        `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
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


        tampilkanDaftarPengumuman(
            data || []
        );


    } catch (error) {

        console.error(
            "Gagal mengambil pengumuman:",
            error
        );


        daftarPengumuman.innerHTML =
            `
            <div class="daftar-kosong">
                Gagal memuat pengumuman.
                <br>
                ${escapeHTML(
                    error.message ||
                    ""
                )}
            </div>
            `;

    }

}


/* =========================================================
   TAMPILKAN DAFTAR
   ========================================================= */

function tampilkanDaftarPengumuman(
    data
) {

    if (!data.length) {

        daftarPengumuman.innerHTML =
            `
            <div class="daftar-kosong">
                Belum ada pengumuman.
            </div>
            `;

        return;

    }


    daftarPengumuman.innerHTML =
        data
            .map(
                function (item) {

                    return buatItemPengumuman(
                        item
                    );

                }
            )
            .join("");

}


/* =========================================================
   BUAT ITEM PENGUMUMAN
   ========================================================= */

function buatItemPengumuman(
    item
) {

    const judul =
        item.judul ||
        "Tanpa judul";


    const tanggal =
        formatTanggal(
            item.created_at
        );


    const file =
        item.nama_asli ||
        item.nama_file ||
        "";


    return `
        <div class="pengumuman-item">

            <div class="pengumuman-icon">
                ${file ? "▣" : "●"}
            </div>


            <div class="pengumuman-info">

                <div class="pengumuman-judul">
                    ${escapeHTML(judul)}
                </div>


                <div class="pengumuman-tanggal">
                    ${escapeHTML(tanggal)}
                </div>


                ${
                    file
                        ? `
                        <div class="pengumuman-file">
                            File:
                            ${escapeHTML(file)}
                        </div>
                        `
                        : `
                        <div class="pengumuman-file">
                            Pengumuman teks
                        </div>
                        `
                }

            </div>


            <div class="pengumuman-actions">

                <button
                    type="button"
                    class="btn-edit"
                    onclick='mulaiEdit(${JSON.stringify(item).replace(/'/g, "&#39;")})'
                >
                    Edit
                </button>


                <button
                    type="button"
                    class="btn-hapus"
                    onclick="konfirmasiHapus('${escapeAttribute(item.id)}', '${escapeAttribute(judul)}')"
                >
                    Hapus
                </button>

            </div>

        </div>
    `;

}


/* =========================================================
   KONFIRMASI HAPUS
   ========================================================= */

function konfirmasiHapus(
    id,
    judul
) {

    idAkanDihapus =
        id;


    confirmText.innerHTML =
        `
        Pengumuman
        <strong>
            "${escapeHTML(judul)}"
        </strong>
        akan dihapus secara permanen.
        `;


    confirmOverlay.classList.add(
        "active"
    );

}


/* =========================================================
   TUTUP KONFIRMASI
   ========================================================= */

function tutupKonfirmasiHapus() {

    idAkanDihapus =
        null;


    confirmOverlay.classList.remove(
        "active"
    );

}


/* =========================================================
   LANJUTKAN HAPUS
   ========================================================= */

async function lanjutkanHapus() {

    if (!idAkanDihapus) {
        return;
    }


    const id =
        idAkanDihapus;


    tutupKonfirmasiHapus();


    tampilkanStatus(
        "Menghapus pengumuman..."
    );


    try {

        /* =================================================
           AMBIL DATA TERLEBIH DAHULU
        ================================================= */

        const {
            data: item,
            error: ambilError
        } =
            await supabaseClient
                .from("pengumuman")
                .select("*")
                .eq(
                    "id",
                    id
                )
                .single();


        if (ambilError) {

            throw ambilError;

        }


        /* =================================================
           HAPUS DATABASE
        ================================================= */

        const {
            error: deleteError
        } =
            await supabaseClient
                .from("pengumuman")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (deleteError) {

            throw deleteError;

        }


        /* =================================================
           HAPUS FILE STORAGE
        ================================================= */

        if (
            item &&
            item.nama_file
        ) {

            await hapusFileStorage(
                item.nama_file
            );

        }


        /* =================================================
           JIKA SEDANG EDIT DATA INI
        ================================================= */

        if (
            dataEdit &&
            String(dataEdit.id) ===
            String(id)
        ) {

            batalEdit();

        }


        tampilkanStatus(
            "✓ Pengumuman berhasil dihapus.",
            false
        );


        await ambilDaftarPengumuman();


    } catch (error) {

        console.error(
            "Hapus error:",
            error
        );


        tampilkanStatus(
            "Gagal menghapus: " +
            error.message,
            true
        );

    }

}


/* =========================================================
   UPLOAD FILE
   ========================================================= */

async function uploadFile(
    file
) {

    const ekstensi =
        ambilEkstensi(
            file.name
        );


    let namaBersih =
        bersihkanNamaFile(
            file.name
        );


    if (!namaBersih) {

        namaBersih =
            "dokumen." +
            ekstensi;

    }


    const waktu =
        Date.now();


    const random =
        Math.random()
            .toString(36)
            .substring(
                2,
                10
            );


    const path =
        waktu +
        "-" +
        random +
        "-" +
        namaBersih;


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


    if (uploadError) {

        throw new Error(
            jelaskanErrorStorage(
                uploadError
            )
        );

    }


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

        await hapusFileStorage(
            path
        );

        throw new Error(
            "Alamat file tidak berhasil dibuat."
        );

    }


    return {

        path:
            path,

        urlFile:
            urlData.publicUrl,

        namaFile:
            path,

        namaAsli:
            file.name,

        tipeFile:
            file.type ||
            tentukanContentType(
                file,
                ekstensi
            ),

        ukuranFile:
            file.size

    };

}


/* =========================================================
   VALIDASI FILE
   ========================================================= */

function validasiFile(
    file
) {

    if (
        !Number.isFinite(
            file.size
        ) ||
        file.size <= 0
    ) {

        throw new Error(
            "File tidak dapat dibaca."
        );

    }


    if (
        file.size >
        MAX_SIZE
    ) {

        throw new Error(
            "Ukuran file maksimal 20 MB."
        );

    }


    const ekstensi =
        ambilEkstensi(
            file.name
        );


    if (
        !EXTENSI_DIIJINKAN.includes(
            ekstensi
        )
    ) {

        throw new Error(
            "Format file tidak didukung."
        );

    }

}


/* =========================================================
   HAPUS FILE STORAGE
   ========================================================= */

async function hapusFileStorage(
    path
) {

    if (!path) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .storage
                .from("pengumuman")
                .remove([
                    path
                ]);


        if (error) {

            console.error(
                "Gagal menghapus file Storage:",
                error
            );

        }

    } catch (error) {

        console.error(
            "Error hapus Storage:",
            error
        );

    }

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

    if (
        file &&
        file.type
    ) {

        return file.type;

    }


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
   FORMAT TANGGAL
   ========================================================= */

function formatTanggal(
    tanggal
) {

    if (!tanggal) {
        return "";
    }


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


    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day:
                "2-digit",

            month:
                "long",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    ).format(
        date
    );

}


/* =========================================================
   FORMAT UKURAN
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
            ).toFixed(1) +
            " KB"
        );

    }


    return (
        (
            bytes /
            (
                1024 *
                1024
            )
        ).toFixed(1) +
        " MB"
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
            "Upload ditolak oleh keamanan Supabase Storage. " +
            "Periksa policy bucket pengumuman."
        );

    }


    if (
        lower.includes(
            "not found"
        )
    ) {

        return (
            "Bucket Storage 'pengumuman' tidak ditemukan."
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

    console.error(
        "Detail error database:",
        error
    );


    const message =
        error?.message ||
        "";


    const details =
        error?.details ||
        "";


    const hint =
        error?.hint ||
        "";


    const code =
        error?.code ||
        "";


    return (
        message +
        (
            details
                ? " | Detail: " +
                  details
                : ""
        ) +
        (
            hint
                ? " | Hint: " +
                  hint
                : ""
        ) +
        (
            code
                ? " | Kode: " +
                  code
                : ""
        )
    );

}


/* =========================================================
   TAMPILKAN STATUS
   ========================================================= */

function tampilkanStatus(
    pesan,
    error = false
) {

    if (!status) {
        return;
    }


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


/* =========================================================
   ESCAPE ATTRIBUTE
   ========================================================= */

function escapeAttribute(
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
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            "&quot;"
        );

}


/* =========================================================
   TUTUP MODAL DENGAN KLIK LUAR
   ========================================================= */

if (confirmOverlay) {

    confirmOverlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                confirmOverlay
            ) {

                tutupKonfirmasiHapus();

            }

        }
    );

}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            tutupKonfirmasiHapus();

        }

    }
);
