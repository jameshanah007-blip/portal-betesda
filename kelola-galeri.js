const inputFoto = document.getElementById("foto");
const preview = document.getElementById("preview");
const previewImage = document.getElementById("previewImage");


// ===============================
// PREVIEW FOTO
// ===============================

inputFoto.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        preview.style.display = "none";
        return;
    }

    if (!file.type.startsWith("image/")) {

        alert("File yang dipilih harus berupa gambar.");

        this.value = "";

        preview.style.display = "none";

        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        previewImage.src = e.target.result;

        preview.style.display = "block";

    };

    reader.readAsDataURL(file);

});


// ===============================
// UPLOAD FOTO
// ===============================

async function uploadFoto() {

    const judul =
        document.getElementById("judul").value.trim();

    const file =
        document.getElementById("foto").files[0];

    const status =
        document.getElementById("status");

    const button =
        document.getElementById("btnUpload");


    // ===============================
    // CEK FILE
    // ===============================

    if (!file) {

        alert("Silakan pilih foto terlebih dahulu.");

        return;
    }


    if (!file.type.startsWith("image/")) {

        alert("File harus berupa gambar.");

        return;
    }


    // Maksimal 5 MB
    if (file.size > 5 * 1024 * 1024) {

        alert("Ukuran foto maksimal 5 MB.");

        return;
    }


    // ===============================
    // NONAKTIFKAN TOMBOL
    // ===============================

    button.disabled = true;

    status.textContent =
        "Mengupload foto...";


    try {

        // ===============================
        // MEMBUAT NAMA FILE UNIK
        // ===============================

        const namaUnik =
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8) +
            "-" +
            file.name
                .replace(/\s+/g, "-");


        const path = namaUnik;


        // ===============================
        // UPLOAD KE STORAGE
        // ===============================

        status.textContent =
            "Mengupload foto ke Storage...";


        const { error: uploadError } =
            await supabaseClient.storage
                .from("galeri-jemaat")
                .upload(path, file);


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


        // ===============================
        // AMBIL URL FOTO
        // ===============================

        const { data: urlData } =
            supabaseClient.storage
                .from("galeri-jemaat")
                .getPublicUrl(path);


        const urlFoto =
            urlData.publicUrl;


        // ===============================
        // SIMPAN KE DATABASE
        // ===============================

        status.textContent =
            "Menyimpan informasi foto...";


        const { error: databaseError } =
            await supabaseClient
                .from("galeri_jemaat")
                .insert([{

                    judul:
                        judul || "Kegiatan Jemaat",

                    nama_file:
                        path,

                    url_foto:
                        urlFoto

                }]);


        if (databaseError) {

            console.error(
                "ERROR DATABASE:",
                databaseError
            );


            // Hapus foto dari Storage
            // jika database gagal

            await supabaseClient.storage
                .from("galeri-jemaat")
                .remove([path]);


            throw new Error(
                "Database: " +
                databaseError.message
            );

        }


        // ===============================
        // BERHASIL
        // ===============================

        status.textContent =
            "✅ Foto berhasil diupload.";


        document.getElementById("judul").value = "";

        document.getElementById("foto").value = "";

        preview.style.display = "none";


    } catch (error) {

        console.error(
            "UPLOAD ERROR:",
            error
        );


        status.textContent =
            "❌ Gagal: " +
            error.message;

    }


    // ===============================
    // AKTIFKAN KEMBALI TOMBOL
    // ===============================

    button.disabled = false;

}
