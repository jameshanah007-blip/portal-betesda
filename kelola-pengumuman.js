/* =========================================================
   KELOLA PENGUMUMAN
   Tambah • Edit • Hapus • Upload File
   ========================================================= */

"use strict";

/* =========================================================
   DOM
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

const daftarPengumuman =
    document.getElementById("daftarPengumuman");

const confirmOverlay =
    document.getElementById("confirmOverlay");

const confirmText =
    document.getElementById("confirmText");


/* =========================================================
   KONFIGURASI
   ========================================================= */

const NAMA_BUCKET =
    "pengumuman";

const MAX_SIZE =
    20 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
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
   STATE
   ========================================================= */

let modeEdit = false;

let dataEdit = null;

let idAkanDihapus = null;


/* =========================================================
   CEK SUPABASE
   ========================================================= */

function cekSupabase() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {
        throw new Error(
            "supabaseClient belum tersedia."
        );
    }

    if (!supabaseClient) {
        throw new Error(
            "Koneksi Supabase belum tersedia."
        );
    }

}


/* =========================================================
   STATUS
   ========================================================= */

function tampilkanStatus(
    pesan,
    tipe = "info"
) {

    if (!status) return;

    status.className =
        "status " + tipe;

    status.textContent =
        pesan;

}


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        if (inputFile) {

            inputFile.addEventListener(
                "change",
                function() {

                    const file =
                        inputFile.files &&
                        inputFile.files[0];

                    if (!file) {

                        if (infoFile) {
                            infoFile.textContent =
                                "File bersifat opsional.";
                        }

                        return;
                    }

                    const hasil =
                        validasiFile(file);

                    if (!hasil.valid) {

                        tampilkanStatus(
                            hasil.pesan,
                            "error"
                        );

                        inputFile.value = "";

                        if (infoFile) {
                            infoFile.textContent =
                                "File bersifat opsional.";
                        }

                        return;
                    }

                    if (infoFile) {

                        infoFile.textContent =
                            file.name +
                            " • " +
                            formatUkuran(file.size);

                    }

                    tampilkanStatus(
                        "",
                        ""
                    );

                }
            );

        }


        if (buttonBatalEdit) {

            buttonBatalEdit.addEventListener(
                "click",
                function() {

                    batalEdit();

                }
            );

        }


        if (confirmOverlay) {

            confirmOverlay.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        confirmOverlay
                    ) {

                        tutupKonfirmasiHapus();

                    }

                }
            );

        }


        ambilDaftarPengumuman();

    }
);


/* =========================================================
   AMBIL DAFTAR PENGUMUMAN
   ========================================================= */

async function ambilDaftarPengumuman() {

    if (!daftarPengumuman) {
        return;
    }

    daftarPengumuman.innerHTML = `
        <div class="daftar-loading">
            Memuat pengumuman...
        </div>
    `;

    try {

        cekSupabase();


        /*
         * Timeout 15 detik.
         * Supaya halaman tidak terus-terusan
         * menampilkan "Memuat pengumuman..."
         */

        const queryPromise =
            supabaseClient
                .from("pengumuman")
                .select(
                    [
                        "id",
                        "judul",
                        "keterangan",
                        "nama_file",
                        "nama_asli",
                        "url_file",
                        "tipe_file",
                        "ukuran_file",
                        "created_at"
                    ].join(", ")
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        const timeoutPromise =
            new Promise(
                function(_, reject) {

                    setTimeout(
                        function() {

                            reject(
                                new Error(
                                    "Permintaan ke Supabase terlalu lama. Periksa koneksi internet atau pengaturan RLS tabel pengumuman."
                                )
                            );

                        },
                        15000
                    );

                }
            );


        const hasil =
            await Promise.race([
                queryPromise,
                timeoutPromise
            ]);


        const data =
            hasil.data;

        const error =
            hasil.error;


        if (error) {

            console.error(
                "Error mengambil pengumuman:",
                error
            );

            throw new Error(
                jelaskanErrorDatabase(
                    error
                )
            );

        }


        tampilkanDaftarPengumuman(
            data || []
        );

    }

    catch (error) {

        console.error(
            "Gagal memuat pengumuman:",
            error
        );

        daftarPengumuman.innerHTML = `
            <div class="daftar-kosong">
                <strong>
                    Pengumuman gagal dimuat.
                </strong>

                <br><br>

                ${escapeHTML(
                    error?.message ||
                    "Terjadi kesalahan saat mengambil data."
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

    if (!daftarPengumuman) {
        return;
    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        daftarPengumuman.innerHTML = `
            <div class="daftar-kosong">
                Belum ada pengumuman.
            </div>
        `;

        return;

    }


    daftarPengumuman.innerHTML =
        data
            .map(function(item) {

                return buatItemPengumuman(
                    item
                );

            })
            .join("");

}


/* =========================================================
   BUAT ITEM PENGUMUMAN
   ========================================================= */

function buatItemPengumuman(
    item
) {

    const id =
        item.id;

    const judul =
        item.judul ||
        "Tanpa Judul";

    const keterangan =
        item.keterangan ||
        "";

    const namaFile =
        item.nama_asli ||
        item.nama_file ||
        "";

    const tanggal =
        formatTanggal(
            item.created_at
        );

    const fileInfo =
        namaFile
            ? `
                <div class="pengumuman-file">
                    ${escapeHTML(namaFile)}
                    ${
                        item.ukuran_file
                            ? " • " +
                              formatUkuran(
                                  item.ukuran_file
                              )
                            : ""
                    }
                </div>
            `
            : `
                <div class="pengumuman-file">
                    Informasi teks
                </div>
            `;


    return `
        <div
            class="pengumuman-item"
            data-id="${escapeAttribute(id)}"
        >

            <div class="pengumuman-info">

                <div class="pengumuman-judul">
                    ${escapeHTML(judul)}
                </div>

                <div class="pengumuman-tanggal">
                    ${escapeHTML(tanggal)}
                </div>

                <div class="pengumuman-keterangan">
                    ${escapeHTML(
                        rapikanKeterangan(
                            keterangan
                        )
                    )}
                </div>

                ${fileInfo}

            </div>


            <div class="pengumuman-actions">

                <button
                    type="button"
                    class="btn-edit"
                    onclick="mulaiEdit(${escapeAttribute(id)})"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="btn-hapus"
                    onclick="konfirmasiHapus(${escapeAttribute(id)})"
                >
                    Hapus
                </button>

            </div>

        </div>
    `;

}


/* =========================================================
   SIMPAN
   ========================================================= */

async function simpanPengumuman() {

    if (modeEdit) {

        await prosesEdit();

    } else {

        await prosesTambah();

    }

}


/* =========================================================
   TAMBAH PENGUMUMAN
   ========================================================= */

async function prosesTambah() {

    const judul =
        judulInput?.value.trim() ||
        "";

    const keterangan =
        keteranganInput?.value ||
        "";

    const keteranganRapi =
        rapikanKeterangan(
            keterangan
        );


    if (!judul) {

        tampilkanStatus(
            "Judul pengumuman wajib diisi.",
            "error"
        );

        judulInput?.focus();

        return;

    }


    if (!keteranganRapi) {

        tampilkanStatus(
            "Isi pengumuman wajib diisi.",
            "error"
        );

        keteranganInput?.focus();

        return;

    }


    const file =
        inputFile?.files &&
        inputFile.files[0]
            ? inputFile.files[0]
            : null;


    if (file) {

        const hasil =
            validasiFile(file);

        if (!hasil.valid) {

            tampilkanStatus(
                hasil.pesan,
                "error"
            );

            return;

        }

    }


    try {

        cekSupabase();

        kunciForm(true);

        tampilkanStatus(
            file
                ? "Mengunggah file..."
                : "Menyimpan pengumuman...",
            "info"
        );


        let path = null;

        let urlFile = null;

        let namaFile = null;

        let namaAsli = null;

        let tipeFile = null;

        let ukuranFile = null;


        /*
         * Upload file hanya jika admin
         * memilih file.
         */

        if (file) {

            const hasilUpload =
                await uploadFile(
                    file
                );

            path =
                hasilUpload.path;

            urlFile =
                hasilUpload.url;

            namaFile =
                hasilUpload.namaFile;

            namaAsli =
                hasilUpload.namaAsli;

            tipeFile =
                hasilUpload.tipeFile;

            ukuranFile =
                hasilUpload.ukuranFile;

        }


        tampilkanStatus(
            "Menyimpan pengumuman...",
            "info"
        );


        const hasil =
            await supabaseClient
                .from("pengumuman")
                .insert([
                    {
                        judul:
                            judul,

                        keterangan:
                            keteranganRapi,

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


        if (hasil.error) {

            console.error(
                "Error insert pengumuman:",
                hasil.error
            );


            /*
             * Jika database gagal,
             * hapus file yang tadi berhasil
             * diupload.
             */

            if (path) {

                await hapusFileStorage(
                    path
                );

            }


            throw new Error(
                jelaskanErrorDatabase(
                    hasil.error
                )
            );

        }


        tampilkanStatus(
            "Pengumuman berhasil dipublikasikan.",
            "success"
        );


        resetForm();

        await ambilDaftarPengumuman();

    }

    catch (error) {

        console.error(
            "Gagal menyimpan pengumuman:",
            error
        );

        tampilkanStatus(
            "Gagal menyimpan pengumuman: " +
            (
                error?.message ||
                "Terjadi kesalahan."
            ),
            "error"
        );

    }

    finally {

        kunciForm(false);

    }

}


/* =========================================================
   EDIT PENGUMUMAN
   ========================================================= */

async function prosesEdit() {

    if (!dataEdit) {

        tampilkanStatus(
            "Data pengumuman yang diedit tidak ditemukan.",
            "error"
        );

        return;
    }


    const idPengumuman =
        dataEdit.id;


    const judul =
        judulInput?.value.trim() || "";


    const keterangan =
        keteranganInput?.value || "";


    const keteranganRapi =
        rapikanKeterangan(
            keterangan
        );


    if (!judul) {

        tampilkanStatus(
            "Judul pengumuman wajib diisi.",
            "error"
        );

        judulInput?.focus();

        return;
    }


    if (!keteranganRapi) {

        tampilkanStatus(
            "Isi pengumuman wajib diisi.",
            "error"
        );

        keteranganInput?.focus();

        return;
    }


    const file =
        inputFile?.files &&
        inputFile.files[0]
            ? inputFile.files[0]
            : null;


    if (file) {

        const hasilValidasi =
            validasiFile(file);

        if (!hasilValidasi.valid) {

            tampilkanStatus(
                hasilValidasi.pesan,
                "error"
            );

            return;
        }
    }


    try {

        cekSupabase();

        kunciForm(true);


        console.log(
            "ID yang akan diedit:",
            idPengumuman
        );

        console.log(
            "Judul baru:",
            judul
        );

        console.log(
            "Keterangan baru:",
            keteranganRapi
        );


        /*
         * =====================================================
         * EDIT TANPA FILE BARU
         * =====================================================
         */

        if (!file) {

            tampilkanStatus(
                "Menyimpan perubahan...",
                "info"
            );


            const hasil =
                await supabaseClient
                    .from("pengumuman")
                    .update({
                        judul:
                            judul,

                        keterangan:
                            keteranganRapi
                    })
                    .eq(
                        "id",
                        idPengumuman
                    )
                    .select();


            console.log(
                "HASIL UPDATE:",
                hasil
            );


            if (hasil.error) {

                console.error(
                    "Error UPDATE:",
                    hasil.error
                );

                throw new Error(
                    jelaskanErrorDatabase(
                        hasil.error
                    )
                );
            }


            /*
             * Sangat penting:
             * Jika array kosong, berarti UPDATE
             * tidak menemukan baris dengan ID tersebut.
             */

            if (
                !hasil.data ||
                hasil.data.length === 0
            ) {

                throw new Error(
                    "Data tidak berubah. Supabase tidak menemukan data dengan ID: " +
                    idPengumuman +
                    ". Kemungkinan ada masalah pada ID atau RLS Policy."
                );

            }


            console.log(
                "Data berhasil diubah:",
                hasil.data[0]
            );


            tampilkanStatus(
                "Perubahan berhasil disimpan.",
                "success"
            );


            /*
             * Keluar dari mode edit
             */

            modeEdit = false;

            dataEdit = null;


            resetForm();


            if (button) {

                button.textContent =
                    "Publikasikan Pengumuman";

            }


            if (buttonBatalEdit) {

                buttonBatalEdit.style.display =
                    "none";

            }


            /*
             * Ambil ulang data dari database
             */

            await ambilDaftarPengumuman();


            return;
        }


        /*
         * =====================================================
         * EDIT SEKALIGUS GANTI FILE
         * =====================================================
         */

        tampilkanStatus(
            "Mengunggah file baru...",
            "info"
        );


        const hasilUpload =
            await uploadFile(
                file
            );


        const pathFileBaru =
            hasilUpload.path;


        tampilkanStatus(
            "Menyimpan perubahan...",
            "info"
        );


        const hasilUpdate =
            await supabaseClient
                .from("pengumuman")
                .update({

                    judul:
                        judul,

                    keterangan:
                        keteranganRapi,

                    nama_file:
                        hasilUpload.namaFile,

                    nama_asli:
                        hasilUpload.namaAsli,

                    url_file:
                        hasilUpload.url,

                    tipe_file:
                        hasilUpload.tipeFile,

                    ukuran_file:
                        hasilUpload.ukuranFile

                })
                .eq(
                    "id",
                    idPengumuman
                )
                .select();


        console.log(
            "HASIL UPDATE DENGAN FILE:",
            hasilUpdate
        );


        if (hasilUpdate.error) {

            await hapusFileStorage(
                pathFileBaru
            );


            throw new Error(
                jelaskanErrorDatabase(
                    hasilUpdate.error
                )
            );

        }


        /*
         * Pastikan benar-benar ada baris
         * yang diperbarui.
         */

        if (
            !hasilUpdate.data ||
            hasilUpdate.data.length === 0
        ) {

            await hapusFileStorage(
                pathFileBaru
            );


            throw new Error(
                "File berhasil diunggah, tetapi data pengumuman tidak berubah. Supabase tidak menemukan ID: " +
                idPengumuman +
                ". Periksa RLS Policy tabel pengumuman."
            );

        }


        /*
         * Hapus file lama setelah database
         * berhasil diperbarui.
         */

        const pathFileLama =
            ambilPathStorage(
                dataEdit
            );


        if (
            pathFileLama &&
            pathFileLama !==
                pathFileBaru
        ) {

            await hapusFileStorage(
                pathFileLama
            );

        }


        tampilkanStatus(
            "Perubahan berhasil disimpan.",
            "success"
        );


        modeEdit = false;

        dataEdit = null;


        resetForm();


        if (button) {

            button.textContent =
                "Publikasikan Pengumuman";

        }


        if (buttonBatalEdit) {

            buttonBatalEdit.style.display =
                "none";

        }


        await ambilDaftarPengumuman();

    }

    catch (error) {

        console.error(
            "Gagal menyimpan perubahan:",
            error
        );


        tampilkanStatus(
            "Gagal menyimpan perubahan: " +
            (
                error?.message ||
                "Terjadi kesalahan."
            ),
            "error"
        );

    }

    finally {

        kunciForm(false);

    }

}
/* =========================================================
   MULAI EDIT
   ========================================================= */

function mulaiEdit(id) {

    const item =
        window.daftarDataPengumuman
            ?.find(function(data) {

                return String(data.id) ===
                    String(id);

            });


    if (!item) {

        /*
         * Jika data belum tersimpan di window,
         * ambil ulang dari Supabase.
         */

        ambilDataUntukEdit(id);

        return;

    }


    mulaiEditDenganData(
        item
    );

}


/* =========================================================
   AMBIL DATA UNTUK EDIT
   ========================================================= */

async function ambilDataUntukEdit(
    id
) {

    try {

        cekSupabase();

        tampilkanStatus(
            "Mengambil data pengumuman...",
            "info"
        );


        const hasil =
            await supabaseClient
                .from("pengumuman")
                .select(
                    [
                        "id",
                        "judul",
                        "keterangan",
                        "nama_file",
                        "nama_asli",
                        "url_file",
                        "tipe_file",
                        "ukuran_file",
                        "created_at"
                    ].join(", ")
                )
                .eq(
                    "id",
                    id
                )
                .maybeSingle();


        if (hasil.error) {

            throw new Error(
                jelaskanErrorDatabase(
                    hasil.error
                )
            );

        }


        if (!hasil.data) {

            throw new Error(
                "Data pengumuman tidak ditemukan."
            );

        }


        mulaiEditDenganData(
            hasil.data
        );

    }

    catch (error) {

        console.error(
            "Gagal mengambil data edit:",
            error
        );

        tampilkanStatus(
            error?.message ||
            "Gagal mengambil data pengumuman.",
            "error"
        );

    }

}


/* =========================================================
   ISI FORM EDIT
   ========================================================= */

function mulaiEditDenganData(
    item
) {

    modeEdit = true;

    dataEdit = item;


    if (judulInput) {

        judulInput.value =
            item.judul || "";

    }


    if (keteranganInput) {

        keteranganInput.value =
            rapikanKeterangan(
                item.keterangan || ""
            );

    }


    if (inputFile) {

        inputFile.value = "";

    }


    if (infoFile) {

        if (
            item.nama_asli ||
            item.nama_file
        ) {

            infoFile.textContent =
                "File saat ini: " +
                (
                    item.nama_asli ||
                    item.nama_file
                ) +
                (
                    item.ukuran_file
                        ? " • " +
                          formatUkuran(
                              item.ukuran_file
                          )
                        : ""
                ) +
                ". Pilih file baru jika ingin mengganti.";

        }

        else {

            infoFile.textContent =
                "Belum ada file. Pilih file jika diperlukan.";

        }

    }


    if (button) {

        button.textContent =
            "Simpan Perubahan";

    }


    if (buttonBatalEdit) {

        buttonBatalEdit.style.display =
            "inline-flex";

    }


    tampilkanStatus(
        "Mode edit aktif.",
        "info"
    );


    if (judulInput) {

        judulInput.focus();

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   BATAL EDIT
   ========================================================= */

function batalEdit() {

    modeEdit = false;

    dataEdit = null;


    resetForm();


    if (button) {

        button.textContent =
            "Publikasikan Pengumuman";

    }


    if (buttonBatalEdit) {

        buttonBatalEdit.style.display =
            "none";

    }


    tampilkanStatus(
        "",
        ""
    );

}


/* =========================================================
   RESET FORM
   ========================================================= */

function resetForm() {

    if (judulInput) {

        judulInput.value = "";

    }


    if (keteranganInput) {

        keteranganInput.value = "";

    }


    if (inputFile) {

        inputFile.value = "";

    }


    if (infoFile) {

        infoFile.textContent =
            "File bersifat opsional.";

    }

}


/* =========================================================
   KONFIRMASI HAPUS
   ========================================================= */

function konfirmasiHapus(
    id
) {

    idAkanDihapus =
        id;


    const item =
        window.daftarDataPengumuman
            ?.find(function(data) {

                return String(data.id) ===
                    String(id);

            });


    const judul =
        item?.judul ||
        "pengumuman ini";


    if (confirmText) {

        confirmText.textContent =
            "Apakah Anda yakin ingin menghapus \"" +
            judul +
            "\"?";

    }


    if (confirmOverlay) {

        confirmOverlay.classList.add(
            "active"
        );

        confirmOverlay.setAttribute(
            "aria-hidden",
            "false"
        );

    }

}


/* =========================================================
   TUTUP KONFIRMASI
   ========================================================= */

function tutupKonfirmasiHapus() {

    idAkanDihapus =
        null;


    if (confirmOverlay) {

        confirmOverlay.classList.remove(
            "active"
        );

        confirmOverlay.setAttribute(
            "aria-hidden",
            "true"
        );

    }

}


/* =========================================================
   LANJUTKAN HAPUS
   ========================================================= */

async function lanjutkanHapus() {

    if (
        idAkanDihapus ===
        null ||
        idAkanDihapus ===
        undefined
    ) {

        return;

    }


    const id =
        idAkanDihapus;


    const item =
        window.daftarDataPengumuman
            ?.find(function(data) {

                return String(data.id) ===
                    String(id);

            });


    try {

        cekSupabase();

        tutupKonfirmasiHapus();


        tampilkanStatus(
            "Menghapus pengumuman...",
            "info"
        );


        const hasil =
            await supabaseClient
                .from("pengumuman")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (hasil.error) {

            console.error(
                "Error hapus pengumuman:",
                hasil.error
            );

            throw new Error(
                jelaskanErrorDatabase(
                    hasil.error
                )
            );

        }


        /*
         * Hapus file Storage setelah
         * database berhasil dihapus.
         */

        const pathFile =
            ambilPathStorage(
                item
            );


        if (pathFile) {

            await hapusFileStorage(
                pathFile
            );

        }


        tampilkanStatus(
            "Pengumuman berhasil dihapus.",
            "success"
        );


        await ambilDaftarPengumuman();

    }

    catch (error) {

        console.error(
            "Gagal menghapus pengumuman:",
            error
        );

        tampilkanStatus(
            "Gagal menghapus pengumuman: " +
            (
                error?.message ||
                "Terjadi kesalahan."
            ),
            "error"
        );

    }

}


/* =========================================================
   UPLOAD FILE
   ========================================================= */

async function uploadFile(
    file
) {

    cekSupabase();


    const ekstensi =
        ambilEkstensi(
            file.name
        );


    const namaAman =
        bersihkanNamaFile(
            file.name
        );


    const namaUnik =
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 10) +
        "_" +
        namaAman;


    const path =
        namaUnik;


    const contentType =
        tentukanContentType(
            file,
            ekstensi
        );


    const hasil =
        await supabaseClient
            .storage
            .from(
                NAMA_BUCKET
            )
            .upload(
                path,
                file,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        contentType
                }
            );


    if (hasil.error) {

        console.error(
            "Error upload Storage:",
            hasil.error
        );

        throw new Error(
            jelaskanErrorStorage(
                hasil.error
            )
        );

    }


    const publicUrl =
        supabaseClient
            .storage
            .from(
                NAMA_BUCKET
            )
            .getPublicUrl(
                path
            );


    const url =
        publicUrl?.data?.publicUrl ||
        null;


    return {

        path:
            path,

        url:
            url,

        namaFile:
            path,

        namaAsli:
            file.name,

        tipeFile:
            contentType,

        ukuranFile:
            file.size

    };

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

        cekSupabase();


        const hasil =
            await supabaseClient
                .storage
                .from(
                    NAMA_BUCKET
                )
                .remove([
                    path
                ]);


        if (hasil.error) {

            console.error(
                "Gagal menghapus file Storage:",
                hasil.error
            );

        }

    }

    catch (error) {

        console.error(
            "Error hapus Storage:",
            error
        );

    }

}


/* =========================================================
   AMBIL PATH STORAGE
   ========================================================= */

function ambilPathStorage(
    item
) {

    if (!item) {
        return null;
    }


    /*
     * Jika nama_file menyimpan path,
     * gunakan langsung.
     */

    if (item.nama_file) {

        return item.nama_file;

    }


    /*
     * Jika tidak ada nama_file tetapi
     * ada URL Supabase Storage,
     * coba ambil bagian path-nya.
     */

    if (item.url_file) {

        try {

            const marker =
                "/storage/v1/object/public/" +
                NAMA_BUCKET +
                "/";


            const posisi =
                item.url_file.indexOf(
                    marker
                );


            if (posisi !== -1) {

                return decodeURIComponent(
                    item.url_file.substring(
                        posisi +
                        marker.length
                    )
                );

            }

        }

        catch (error) {

            console.error(
                "Gagal membaca path Storage:",
                error
            );

        }

    }


    return null;

}


/* =========================================================
   VALIDASI FILE
   ========================================================= */

function validasiFile(
    file
) {

    if (!file) {

        return {
            valid: true
        };

    }


    if (file.size > MAX_SIZE) {

        return {

            valid: false,

            pesan:
                "Ukuran file terlalu besar. Maksimal 20 MB."

        };

    }


    const ekstensi =
        ambilEkstensi(
            file.name
        );


    if (
        !ALLOWED_EXTENSIONS.includes(
            ekstensi
        )
    ) {

        return {

            valid: false,

            pesan:
                "Format file tidak didukung: ." +
                ekstensi

        };

    }


    return {
        valid: true
    };

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
        String(
            namaFile
        ).toLowerCase();


    const bagian =
        nama.split(".");


    if (
        bagian.length <
        2
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

    return String(
        namaFile ||
        "file"
    )
        .trim()
        .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        )
        .replace(
            /_+/g,
            "_"
        );

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


    const tipe = {

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
            "application/x-7z-compressed"

    };


    return (
        tipe[ekstensi] ||
        "application/octet-stream"
    );

}


/* =========================================================
   RAPKAN KETERANGAN
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

        .replace(
            /\r\n/g,
            "\n"
        )

        .replace(
            /\r/g,
            "\n"
        )

        .replace(
            /^[\s\u00A0\u200B\u200C\u200D\uFEFF]+/,
            ""
        )

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

        .replace(
            /[\s\u00A0\u200B\u200C\u200D\uFEFF]+$/,
            ""
        );

}


/* =========================================================
   FORMAT UKURAN
   ========================================================= */

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


    if (!Number.isFinite(ukuran)) {

        return "";

    }


    if (
        ukuran <
        1024
    ) {

        return ukuran +
            " B";

    }


    if (
        ukuran <
        1024 * 1024
    ) {

        return (
            ukuran /
            1024
        ).toFixed(1) +
        " KB";

    }


    if (
        ukuran <
        1024 * 1024 * 1024
    ) {

        return (
            ukuran /
            (1024 * 1024)
        ).toFixed(1) +
        " MB";

    }


    return (
        ukuran /
        (1024 * 1024 * 1024)
    ).toFixed(1) +
    " GB";

}


/* =========================================================
   FORMAT TANGGAL
   ========================================================= */

function formatTanggal(
    tanggal
) {

    if (!tanggal) {

        return "-";

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

        return String(
            tanggal
        );

    }


    return date.toLocaleDateString(
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
    );

}


/* =========================================================
   KUNCI FORM
   ========================================================= */

function kunciForm(
    terkunci
) {

    if (judulInput) {

        judulInput.disabled =
            terkunci;

    }


    if (keteranganInput) {

        keteranganInput.disabled =
            terkunci;

    }


    if (inputFile) {

        inputFile.disabled =
            terkunci;

    }


    if (button) {

        button.disabled =
            terkunci;

    }


    if (buttonBatalEdit) {

        buttonBatalEdit.disabled =
            terkunci;

    }

}


/* =========================================================
   ERROR STORAGE
   ========================================================= */

function jelaskanErrorStorage(
    error
) {

    console.error(
        "Detail error Storage:",
        error
    );


    const message =
        error?.message ||
        "";


    const statusCode =
        error?.statusCode ||
        "";


    if (
        statusCode ===
        "413"
    ) {

        return (
            "File terlalu besar."
        );

    }


    if (
        message
            .toLowerCase()
            .includes(
                "bucket"
            )
    ) {

        return (
            "Bucket Storage \"pengumuman\" belum tersedia atau tidak dapat diakses."
        );

    }


    if (
        message
            .toLowerCase()
            .includes(
                "row-level"
            )
    ) {

        return (
            "Akses Storage ditolak oleh RLS Policy."
        );

    }


    return (
        "Storage: " +
        (
            message ||
            "Gagal mengunggah file."
        )
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
        "Database: " +
        (
            message ||
            "Terjadi kesalahan database."
        ) +
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
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ??
        ""
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


/* =========================================================
   ESCAPE ATTRIBUTE
   ========================================================= */

function escapeAttribute(
    value
) {

    return String(
        value ??
        ""
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
            /'/g,
            "&#039;"
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


/* =========================================================
   SIMPAN DATA DAFTAR
   ========================================================= */

/*
 * Fungsi ini dipanggil ulang setelah data
 * berhasil diambil agar tombol Edit dan Hapus
 * dapat menemukan data berdasarkan ID.
 */

const tampilkanDaftarPengumumanLama =
    tampilkanDaftarPengumuman;


/*
 * Bungkus fungsi asli agar data juga
 * disimpan ke window.
 */

tampilkanDaftarPengumuman =
    function(data) {

        window.daftarDataPengumuman =
            Array.isArray(data)
                ? data
                : [];

        tampilkanDaftarPengumumanLama(
            window.daftarDataPengumuman
        );

    };


/* =========================================================
   EKSPOR FUNGSI KE WINDOW
   ========================================================= */

window.simpanPengumuman =
    simpanPengumuman;

window.mulaiEdit =
    mulaiEdit;

window.batalEdit =
    batalEdit;

window.konfirmasiHapus =
    konfirmasiHapus;

window.tutupKonfirmasiHapus =
    tutupKonfirmasiHapus;

window.lanjutkanHapus =
    lanjutkanHapus;
