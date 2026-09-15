const galeriContainer = document.getElementById("galeri");
const loading = document.getElementById("loading");


// =====================================
// DATA FOTO
// =====================================

let daftarFoto = [];

let fotoSekarang = 0;


// =====================================
// TAMPILKAN GALERI
// =====================================

async function tampilkanGaleri() {

    loading.style.display = "block";

    const { data, error } = await supabaseClient
        .from("galeri_jemaat")
        .select("*")
        .order("created_at", { ascending: false });

    loading.style.display = "none";


    // =================================
    // ERROR
    // =================================

    if (error) {

        console.error(error);

        galeriContainer.innerHTML = `
            <div class="kosong">
                <p>Gagal memuat galeri.</p>
                <small>${escapeHTML(error.message)}</small>
            </div>
        `;

        return;
    }


    // =================================
    // GALERI KOSONG
    // =================================

    if (!data || data.length === 0) {

        galeriContainer.innerHTML = `
            <div class="kosong">
                <p>Belum ada foto kegiatan.</p>
            </div>
        `;

        return;
    }


    // =================================
    // SIMPAN DATA FOTO
    // =================================

    daftarFoto = data;


    galeriContainer.innerHTML = "";


    // =================================
    // BUAT KARTU FOTO
    // =================================

    data.forEach((item, index) => {

        const tanggal = new Date(item.created_at)
            .toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });


        const card = document.createElement("div");

        card.className = "foto-card";


        card.innerHTML = `
            <img
                src="${escapeAttribute(item.url_foto)}"
                alt="${escapeHTML(
                    item.judul ||
                    "Foto kegiatan jemaat"
                )}"
            >

            <div class="foto-info">

                <h3>
                    ${escapeHTML(
                        item.judul ||
                        "Kegiatan Jemaat"
                    )}
                </h3>

                <small>
                    ${tanggal}
                </small>

            </div>
        `;


        // =================================
        // KLIK FOTO
        // =================================

        const gambar = card.querySelector("img");

        gambar.addEventListener("click", function() {

            bukaFoto(index);

        });


        galeriContainer.appendChild(card);

    });

}


// =====================================
// BUKA FOTO
// =====================================

function bukaFoto(index) {

    if (
        !daftarFoto ||
        daftarFoto.length === 0
    ) {
        return;
    }


    if (
        index < 0 ||
        index >= daftarFoto.length
    ) {
        return;
    }


    fotoSekarang = index;


    const modal =
        document.getElementById("modal");

    const fotoBesar =
        document.getElementById("fotoBesar");


    fotoBesar.src =
        daftarFoto[fotoSekarang].url_foto;


    fotoBesar.alt =
        daftarFoto[fotoSekarang].judul ||
        "Foto kegiatan jemaat";


    modal.style.display = "flex";


    perbaruiNavigasi();


    // Mencegah halaman di belakang ikut bergeser
    document.body.style.overflow = "hidden";

}


// =====================================
// TUTUP FOTO
// =====================================

function tutupFoto() {

    const modal =
        document.getElementById("modal");


    const fotoBesar =
        document.getElementById("fotoBesar");


    modal.style.display = "none";


    fotoBesar.src = "";


    document.body.style.overflow = "";

}


// =====================================
// FOTO SEBELUMNYA
// =====================================

function fotoSebelumnya() {

    if (fotoSekarang <= 0) {
        return;
    }


    fotoSekarang--;


    tampilkanFotoSekarang();

}


// =====================================
// FOTO BERIKUTNYA
// =====================================

function fotoBerikutnya() {

    if (
        fotoSekarang >=
        daftarFoto.length - 1
    ) {
        return;
    }


    fotoSekarang++;


    tampilkanFotoSekarang();

}


// =====================================
// TAMPILKAN FOTO SEKARANG
// =====================================

function tampilkanFotoSekarang() {

    if (
        !daftarFoto ||
        daftarFoto.length === 0
    ) {
        return;
    }


    const fotoBesar =
        document.getElementById("fotoBesar");


    fotoBesar.src =
        daftarFoto[fotoSekarang].url_foto;


    fotoBesar.alt =
        daftarFoto[fotoSekarang].judul ||
        "Foto kegiatan jemaat";


    perbaruiNavigasi();

}


// =====================================
// PERBARUI NAVIGASI
// =====================================

function perbaruiNavigasi() {

    const nomorFoto =
        document.getElementById("nomorFoto");

    const tombolKiri =
        document.getElementById("fotoPrev");

    const tombolKanan =
        document.getElementById("fotoNext");


    if (nomorFoto) {

        nomorFoto.textContent =
            `${fotoSekarang + 1} / ${daftarFoto.length}`;

    }


    if (tombolKiri) {

        tombolKiri.style.visibility =
            fotoSekarang > 0
                ? "visible"
                : "hidden";

    }


    if (tombolKanan) {

        tombolKanan.style.visibility =
            fotoSekarang <
            daftarFoto.length - 1
                ? "visible"
                : "hidden";

    }

}


// =====================================
// SWIPE HP
// =====================================

let posisiSentuhAwalX = 0;

let posisiSentuhAkhirX = 0;

let posisiSentuhAwalY = 0;

let posisiSentuhAkhirY = 0;


function mulaiSwipe(event) {

    if (!event.touches || !event.touches[0]) {
        return;
    }


    posisiSentuhAwalX =
        event.touches[0].clientX;

    posisiSentuhAwalY =
        event.touches[0].clientY;

}


function selesaiSwipe(event) {

    if (!event.changedTouches || !event.changedTouches[0]) {
        return;
    }


    posisiSentuhAkhirX =
        event.changedTouches[0].clientX;

    posisiSentuhAkhirY =
        event.changedTouches[0].clientY;


    const jarakX =
        posisiSentuhAkhirX -
        posisiSentuhAwalX;


    const jarakY =
        posisiSentuhAkhirY -
        posisiSentuhAwalY;


    // Abaikan jika gerakan lebih banyak vertikal
    if (
        Math.abs(jarakY) >
        Math.abs(jarakX)
    ) {
        return;
    }


    // Minimal jarak swipe
    const batasSwipe = 50;


    if (Math.abs(jarakX) < batasSwipe) {
        return;
    }


    // Swipe kiri = foto berikutnya
    if (jarakX < 0) {

        fotoBerikutnya();

    }


    // Swipe kanan = foto sebelumnya
    else {

        fotoSebelumnya();

    }

}


// =====================================
// KEYBOARD DESKTOP
// =====================================

document.addEventListener(
    "keydown",
    function(event) {

        const modal =
            document.getElementById("modal");


        if (
            !modal ||
            modal.style.display !== "flex"
        ) {
            return;
        }


        if (event.key === "ArrowLeft") {

            fotoSebelumnya();

        }


        if (event.key === "ArrowRight") {

            fotoBerikutnya();

        }


        if (event.key === "Escape") {

            tutupFoto();

        }

    }
);


// =====================================
// KLIK AREA MODAL
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const modal =
            document.getElementById("modal");

        const fotoBesar =
            document.getElementById("fotoBesar");


        if (!modal || !fotoBesar) {
            return;
        }


        // Swipe pada area foto/modal
        modal.addEventListener(
            "touchstart",
            mulaiSwipe,
            { passive: true }
        );


        modal.addEventListener(
            "touchend",
            selesaiSwipe,
            { passive: true }
        );


        // Klik area gelap untuk menutup
        modal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target === modal
                ) {

                    tutupFoto();

                }

            }
        );


        // Mencegah klik foto menutup modal
        fotoBesar.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

            }
        );

    }
);


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


// =====================================
// ESCAPE ATTRIBUTE
// =====================================

function escapeAttribute(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


// =====================================
// JALANKAN GALERI
// =====================================

tampilkanGaleri();
