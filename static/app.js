const form = document.getElementById('makanForm');
const popup = document.getElementById('popup');
const popupMsg = document.getElementById('popup-msg');
const popupImg = document.getElementById('popup-img');
const closePopupBtn = document.getElementById('closePopup');

const ALLOWED_NAMES = new Set([
  "azril","ariq","surya","rouf","budi",
  "heru","dion","ruhiyat","rangga","kelvin","zasda"
]);

// Tutup popup
closePopupBtn.addEventListener('click', () => {
  popup.classList.add('hidden');
});

// Helper untuk menampilkan popup (success | error | info)
function showPopup(message, type = "info") {
  popupMsg.textContent = message;

  if (type === "success") {
    popupImg.src = "/static/info.png";
    popupImg.alt = "Sukses";
  } else if (type === "error") {
    popupImg.src = "/static/error.png";
    popupImg.alt = "Error";
  } else {
    popupImg.src = "/static/info.png";
    popupImg.alt = "Info";
  }

  popup.classList.remove('hidden');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const nama = (data.get('nama') || '').trim();
  const resto = data.get('resto');
  const body = { nama, resto };

  // Validasi nama di client (server tetap sumber kebenaran)
  if (!ALLOWED_NAMES.has(nama.toLowerCase())) {
    showPopup(`Nama "${nama}" ga diajak`, "error");
    return;
  }

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();

    // Prank (pilih selain Srasi) → tetap popup
    if (json && json.prank === true) {
      showPopup(json.msg || "Maaf, silahkan pilih tempat makan yang lainnya", "error");
      return;
    }

    // Duplikat nama → popup
    if (json && json.duplicate === true) {
      showPopup(json.msg || "Nama sudah terdaftar", "error");
      return;
    }

    // Error dari server → popup
    if (!res.ok || !json.ok) {
      showPopup(json?.error || "Terjadi kesalahan saat menyimpan", "error");
      return;
    }

    // Sukses → popup + reset form
    showPopup("Berhasil tersimpan! 🎉", "success");
    form.reset();

  } catch (err) {
    showPopup("Gagal submit: " + err.message, "error");
  }
});
