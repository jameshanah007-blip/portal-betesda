const galeriContainer = document.getElementById("galeri");
const loading = document.getElementById("loading");


// =====================================
// DATA FOTO
// =====================================

let daftarFoto = [];

let fotoSekarang = 0;


// =====================================
// DATA ZOOM
// =====================================

let skalaZoom = 1;

let posisiX = 0;

let posisiY = 0;

let posisiSentuhAwalX = 0;

let posisiSentuhAwalY = 0;

let posisiSentuhAkhirX = 0;

let posisiSentuhAkhirY = 0;

let jarakAwal = 0;

let skalaAwal = 1;

let posisiAwalX = 0;

let posisiAwalY = 0;

let sedangZoom = false;

let waktuTapTerakhir = 0;


// =====================================
// ELEMEN FOTO
// =====================================

const modal =
    document.getElementById("modal");

const fotoBesar =
    document.getElementById("fotoBesar");


// =====================================
// TAMPILKAN GALERI
// =====================================

async function tampilkanGaleri() {

    loading.style.display = "block";


    const { data, error } = await supabaseClient
        .from("galeri_jemaat")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    loading.style.display = "none";


    // =================================
    // ERROR
    // =================================

    if (error) {

        console.error(error);


        galeriContainer.innerHTML = `
            <div class="kosong">

                <p>
                    Gagal memuat galeri.
                </p>

                <small>
                    ${escapeHTML(error.message)}
                </small>

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

                <p>
                    Belum ada foto kegiatan.
                </p>

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

        const tanggal =
            new Date(item.created_at)
                .toLocaleDateString(
                    "id-ID",
                    {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                    }
                );


        const card =
            document.createElement("div");


        card.className =
            "foto-card";


        card.innerHTML = `
            <img
                src="${escapeAttribute(
                    item.url_foto
                )}"
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


        const gambar =
            card.querySelector("img");


        gambar.addEventListener(
            "click",
            function() {

                bukaFoto(index);

            }
        );


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


    resetZoom();


    fotoBesar.src =
        daftarFoto[
            fotoSekarang
        ].url_foto;


    fotoBesar.alt =
        daftarFoto[
            fotoSekarang
        ].judul ||
        "Foto kegiatan jemaat";


    modal.style.display =
        "flex";


    perbaruiNavigasi();


    document.body.style.overflow =
        "hidden";

}


// =====================================
// TUTUP FOTO
// =====================================

function tutupFoto() {

    modal.style.display =
        "none";


    fotoBesar.src = "";


    resetZoom();


    document.body.style.overflow =
        "";

}


// =====================================
// FOTO SEBELUMNYA
// =====================================

function fotoSebelumnya() {

    if (
        fotoSekarang <= 0
    ) {
        return;
    }


    fotoSekarang--;


    resetZoom();


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


    resetZoom();


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


    fotoBesar.src =
        daftarFoto[
            fotoSekarang
        ].url_foto;


    fotoBesar.alt =
        daftarFoto[
            fotoSekarang
        ].judul ||
        "Foto kegiatan jemaat";


    perbaruiNavigasi();

}


// =====================================
// PERBARUI NAVIGASI
// =====================================

function perbaruiNavigasi() {

    const nomorFoto =
        document.getElementById(
            "nomorFoto"
        );


    const tombolKiri =
        document.getElementById(
            "fotoPrev"
        );


    const tombolKanan =
        document.getElementById(
            "fotoNext"
        );


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
// RESET ZOOM
// =====================================

function resetZoom() {

    skalaZoom = 1;

    posisiX = 0;

    posisiY = 0;

    sedangZoom = false;


    terapkanTransformasi();

}


// =====================================
// TERAPKAN ZOOM
// =====================================

function terapkanTransformasi() {

    fotoBesar.style.transform =
        `translate3d(${posisiX}px, ${posisiY}px, 0) scale(${skalaZoom})`;

}


// =====================================
// BATASI POSISI FOTO
// =====================================

function batasiPosisi() {

    if (skalaZoom <= 1) {

        posisiX = 0;

        posisiY = 0;

        return;
    }


    const batasX =
        fotoBesar.clientWidth *
        (skalaZoom - 1) /
        2;


    const batasY =
        fotoBesar.clientHeight *
        (skalaZoom - 1) /
        2;


    posisiX =
        Math.max(
            -batasX,
            Math.min(
                batasX,
                posisiX
            )
        );


    posisiY =
        Math.max(
            -batasY,
            Math.min(
                batasY,
                posisiY
            )
        );

}


// =====================================
// HITUNG JARAK 2 JARI
// =====================================

function hitungJarak(touch1, touch2) {

    const dx =
        touch1.clientX -
        touch2.clientX;


    const dy =
        touch1.clientY -
        touch2.clientY;


    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


// =====================================
// MULAI SENTUH
// =====================================

function mulaiSentuh(event) {

    if (
        !event.touches ||
        event.touches.length === 0
    ) {
        return;
    }


    // =================================
    // 2 JARI = ZOOM
    // =================================

    if (
        event.touches.length === 2
    ) {

        sedangZoom = true;


        jarakAwal =
            hitungJarak(
                event.touches[0],
                event.touches[1]
            );


        skalaAwal =
            skalaZoom;


        posisiAwalX =
            posisiX;


        posisiAwalY =
            posisiY;


        event.preventDefault();


        return;
    }


    // =================================
    // 1 JARI
    // =================================

    if (
        event.touches.length === 1
    ) {

        posisiSentuhAwalX =
            event.touches[0].clientX;


        posisiSentuhAwalY =
            event.touches[0].clientY;


        posisiSentuhAkhirX =
            posisiSentuhAwalX;


        posisiSentuhAkhirY =
            posisiSentuhAwalY;

    }

}


// =====================================
// GERAK SENTUH
// =====================================

function saatDisentuh(event) {

    if (
        !event.touches ||
        event.touches.length === 0
    ) {
        return;
    }


    // =================================
    // 2 JARI = PINCH ZOOM
    // =================================

    if (
        event.touches.length === 2
    ) {

        sedangZoom = true;


        const jarakSekarang =
            hitungJarak(
                event.touches[0],
                event.touches[1]
            );


        if (jarakAwal <= 0) {
            return;
        }


        const perubahan =
            jarakSekarang /
            jarakAwal;


        skalaZoom =
            skalaAwal *
            perubahan;


        // Minimum zoom
        if (skalaZoom < 1) {

            skalaZoom = 1;

        }


        // Maximum zoom
        if (skalaZoom > 4) {

            skalaZoom = 4;

        }


        posisiX =
            posisiAwalX;


        posisiY =
            posisiAwalY;


        batasiPosisi();


        terapkanTransformasi();


        event.preventDefault();


        return;
    }


    // =================================
    // 1 JARI SAAT ZOOM
    // =================================

    if (
        event.touches.length === 1 &&
        skalaZoom > 1
    ) {

        const sekarangX =
            event.touches[0].clientX;


        const sekarangY =
            event.touches[0].clientY;


        const gerakX =
            sekarangX -
            posisiSentuhAwalX;


        const gerakY =
            sekarangY -
            posisiSentuhAwalY;


        posisiX =
            posisiX +
            gerakX;


        posisiY =
            posisiY +
            gerakY;


        posisiSentuhAwalX =
            sekarangX;


        posisiSentuhAwalY =
            sekarangY;


        batasiPosisi();


        terapkanTransformasi();


        event.preventDefault();

    }

}


// =====================================
// SELESAI SENTUH
// =====================================

function selesaiSentuh(event) {

    if (
        !event.changedTouches ||
        event.changedTouches.length === 0
    ) {
        return;
    }


    // =================================
    // SELESAI ZOOM
    // =================================

    if (sedangZoom) {

        sedangZoom = false;


        // Jika terlalu kecil
        if (skalaZoom < 1.05) {

            resetZoom();

        }


        return;
    }


    // =================================
    // JIKA SEDANG ZOOM
    // =================================

    if (skalaZoom > 1) {

        return;
    }


    // =================================
    // SWIPE 1 JARI
    // =================================

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


    // Gerakan vertikal diabaikan
    if (
        Math.abs(jarakY) >
        Math.abs(jarakX)
    ) {
        return;
    }


    const batasSwipe = 50;


    if (
        Math.abs(jarakX) <
        batasSwipe
    ) {
        return;
    }


    // =================================
    // SWIPE KIRI
    // =================================

    if (jarakX < 0) {

        fotoBerikutnya();

    }


    // =================================
    // SWIPE KANAN
    // =================================

    else {

        fotoSebelumnya();

    }

}


// =====================================
// DOUBLE TAP
// =====================================

function doubleTap(event) {

    const sekarang =
        Date.now();


    const selisih =
        sekarang -
        waktuTapTerakhir;


    if (
        selisih > 0 &&
        selisih < 300
    ) {

        event.preventDefault();


        if (skalaZoom === 1) {

            skalaZoom = 2;


        } else {

            resetZoom();

        }


        terapkanTransformasi();

    }


    waktuTapTerakhir =
        sekarang;

}


// =====================================
// KEYBOARD DESKTOP
// =====================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            !modal ||
            modal.style.display !== "flex"
        ) {
            return;
        }


        if (
            event.key === "ArrowLeft" &&
            skalaZoom === 1
        ) {

            fotoSebelumnya();

        }


        if (
            event.key === "ArrowRight" &&
            skalaZoom === 1
        ) {

            fotoBerikutnya();

        }


        if (
            event.key === "Escape"
        ) {

            tutupFoto();

        }

    }
);


// =====================================
// EVENT MODAL
// =====================================

if (modal) {

    modal.addEventListener(
        "touchstart",
        mulaiSentuh,
        {
            passive: false
        }
    );


    modal.addEventListener(
        "touchmove",
        saatDisentuh,
        {
            passive: false
        }
    );


    modal.addEventListener(
        "touchend",
        selesaiSentuh,
        {
            passive: false
        }
    );


    modal.addEventListener(
        "touchcancel",
        function() {

            sedangZoom = false;

        },
        {
            passive: true
        }
    );


    fotoBesar.addEventListener(
        "dblclick",
        doubleTap
    );


    // =================================
    // KLIK AREA GELAP
    // =================================

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

}


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


// =====================================
// JALANKAN GALERI
// =====================================

tampilkanGaleri();
