const inputFoto = document.getElementById("foto");
const preview = document.getElementById("preview");
const previewImage = document.getElementById("previewImage");

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


async function uploadFoto() {

    const judul =
        document.getElementById("judul").value.trim();

    const file =
        document.getElementById("foto").files[0];

    const status =
        document.getElementById("status");

    const button =
        document.getElementById("btnUpload");


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


    button.disabled = true;

    status.textContent = "Mengupload foto...";


    try {

        // Membuat nama file unik
        const namaUnik =
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8) +
            "-" +
            file.name
                .replace(/\s+/g, "-");


        const path =
            namaUnik;


        // Upload ke Storage
        const { error: uploadError } =
            await supabaseClient.storage
                .from("galeri-jemaat")
                .upload(path, file);


        if (uploadError) {

            throw uploadError;

        }


        // Ambil URL foto
        const { data: urlData } =
            supabaseClient.storage
                .from("galeri-jemaat")
                .getPublicUrl(path);


        const urlFoto =
            urlData.publicUrl;


        // Simpan informasi ke database
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

            // Jika database gagal,
            // hapus foto yang sudah terupload
            await supabaseClient.storage
                .from("galeri-jemaat")
                .remove([path]);

            throw databaseError;
        }


        status.textContent =
            "✅ Foto berhasil diupload.";


        document.getElementById("judul").value = "";

        document.getElementById("foto").value = "";

        preview.style.display = "none";


    } catch (error) {

        console.error(error);

        status.textContent =
            "❌ Gagal upload: " +
            error.message;

    }


    button.disabled = false;
}
