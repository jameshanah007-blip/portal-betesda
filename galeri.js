const galeriContainer = document.getElementById("galeri");
const loading = document.getElementById("loading");

async function tampilkanGaleri() {

    loading.style.display = "block";

    const { data, error } = await supabaseClient
        .from("galeri_jemaat")
        .select("*")
        .order("created_at", { ascending: false });

    loading.style.display = "none";

    if (error) {
        console.error(error);

        galeriContainer.innerHTML = `
            <div class="kosong">
                <p>Gagal memuat galeri.</p>
                <small>${error.message}</small>
            </div>
        `;

        return;
    }

    if (!data || data.length === 0) {

        galeriContainer.innerHTML = `
            <div class="kosong">
                <p>📸 Belum ada foto kegiatan.</p>
            </div>
        `;

        return;
    }

    galeriContainer.innerHTML = "";

    data.forEach(item => {

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
                src="${item.url_foto}"
                alt="${escapeHTML(item.judul || "Foto kegiatan jemaat")}"
                onclick="bukaFoto('${item.url_foto}')"
            >

            <div class="foto-info">

                <h3>
                    ${escapeHTML(item.judul || "Kegiatan Jemaat")}
                </h3>

                <small>
                    ${tanggal}
                </small>

            </div>
        `;

        galeriContainer.appendChild(card);
    });
}


function bukaFoto(url) {

    const modal = document.getElementById("modal");
    const fotoBesar = document.getElementById("fotoBesar");

    fotoBesar.src = url;

    modal.style.display = "flex";
}


function tutupFoto() {

    document.getElementById("modal").style.display = "none";

    document.getElementById("fotoBesar").src = "";
}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text || "";

    return div.innerHTML;
}


tampilkanGaleri();
