async function tampilkanPengumuman() {

    const container =
        document.getElementById("daftarPengumuman");

    container.innerHTML = `
        <div class="loading">
            ⏳ Memuat pengumuman...
        </div>
    `;

    const { data, error } =
        await supabaseClient
            .from("pengumuman")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(
            "ERROR PENGUMUMAN:",
            error
        );

        container.innerHTML = `
            <div class="error">
                ❌ Gagal memuat pengumuman.<br>
                ${escapeHTML(error.message)}
            </div>
        `;

        return;
    }

    if (!data || data.length === 0) {

        container.innerHTML = `
            <div class="kosong">
                📢<br><br>
                Belum ada pengumuman atau dokumen.
            </div>
        `;

        return;
    }

    container.innerHTML = data
        .map(item => buatKartu(item))
        .join("");
}


function buatKartu(item) {

    const namaFile =
        item.nama_asli ||
        item.nama_file ||
        "Dokumen";

    const ikon =
        ikonFile(namaFile);

    const ukuran =
        formatUkuran(item.ukuran_file);

    const tanggal =
        formatTanggal(item.created_at);

    let urlDownload =
        item.url_file;

    if (urlDownload) {

        urlDownload +=
            "?download=" +
            encodeURIComponent(namaFile);
    }

    return `
        <div class="kartu">

            <div class="kartu-header">

                <div class="ikon-file">
                    ${ikon}
                </div>

                <div class="kartu-info">

                    <h3>
                        ${escapeHTML(
                            item.judul ||
                            "Pengumuman Jemaat"
                        )}
                    </h3>

                    <div class="tanggal">
                        📅 ${tanggal}
                    </div>

                </div>

            </div>

            ${
                item.keterangan
                ?
                `
                <div class="keterangan">
                    ${escapeHTML(
                        item.keterangan
                    )}
                </div>
                `
                :
                ""
            }

            <div class="file-info">
                📎 ${escapeHTML(namaFile)}
                ${ukuran ? " • " + ukuran : ""}
            </div>

            <a
                class="tombol-download"
                href="${escapeAttribute(urlDownload)}"
                target="_blank"
                rel="noopener"
            >
                📥 Download Dokumen
            </a>

        </div>
    `;
}


function ikonFile(namaFile) {

    const nama =
        namaFile.toLowerCase();

    if (nama.endsWith(".pdf")) {
        return "📕";
    }

    if (
        nama.endsWith(".doc") ||
        nama.endsWith(".docx") ||
        nama.endsWith(".odt") ||
        nama.endsWith(".rtf")
    ) {
        return "📝";
    }

    if (
        nama.endsWith(".xls") ||
        nama.endsWith(".xlsx") ||
        nama.endsWith(".ods") ||
        nama.endsWith(".csv")
    ) {
        return "📊";
    }

    if (
        nama.endsWith(".ppt") ||
        nama.endsWith(".pptx") ||
        nama.endsWith(".odp")
    ) {
        return "📽️";
    }

    if (
        nama.endsWith(".jpg") ||
        nama.endsWith(".jpeg") ||
        nama.endsWith(".png") ||
        nama.endsWith(".gif") ||
        nama.endsWith(".webp")
    ) {
        return "🖼️";
    }

    if (
        nama.endsWith(".zip") ||
        nama.endsWith(".rar") ||
        nama.endsWith(".7z")
    ) {
        return "📦";
    }

    if (nama.endsWith(".txt")) {
        return "📄";
    }

    return "📁";
}


function formatUkuran(bytes) {

    if (!bytes || bytes <= 0) {
        return "";
    }

    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (
            (bytes / 1024).toFixed(1) +
            " KB"
        );
    }

    return (
        (bytes / (1024 * 1024)).toFixed(1) +
        " MB"
    );
}


function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }

    const d =
        new Date(tanggal);

    return d.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


function escapeHTML(value) {

    if (value === null ||
        value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHTML(value);
}


tampilkanPengumuman();
