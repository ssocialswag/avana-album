const ALBUM = window.AVANA_ALBUM || "12-09";

// На Cloudflare Pages страница и /api/* живут на одном домене,
// поэтому просто используем относительный путь.
const API_BASE = "";

const TRANSLATIONS = {
  ru: {
    lang_label:"RU", back:"← Все альбомы",
    protected_title:"Приватный альбом",
    protected_text:"Введите пароль, чтобы получить доступ к фотографиям.",
    password_label:"Пароль", password_placeholder:"Пароль",
    open_button:"Открыть", loading:"Проверяем пароль…",
    wrong_password:"Неверный пароль.", server_error:"Не удалось открыть альбом. Попробуйте ещё раз.",
    no_photos:"В этом альбоме пока нет фотографий."
  },
  ua: {
    lang_label:"UA", back:"← Усі альбоми",
    protected_title:"Приватний альбом",
    protected_text:"Введіть пароль, щоб отримати доступ до фотографій.",
    password_label:"Пароль", password_placeholder:"Пароль",
    open_button:"Відкрити", loading:"Перевіряємо пароль…",
    wrong_password:"Невірний пароль.", server_error:"Не вдалося відкрити альбом. Спробуйте ще раз.",
    no_photos:"У цьому альбомі поки немає фотографій."
  },
  fr: {
    lang_label:"FR", back:"← Tous les albums",
    protected_title:"Album privé",
    protected_text:"Entrez le mot de passe pour accéder aux photos.",
    password_label:"Mot de passe", password_placeholder:"Mot de passe",
    open_button:"Ouvrir", loading:"Vérification du mot de passe…",
    wrong_password:"Mot de passe incorrect.", server_error:"Impossible d’ouvrir l’album. Réessayez.",
    no_photos:"Cet album ne contient pas encore de photos."
  }
};

let currentLang = "ru";
let photos = [];
let currentIndex = 0;

try {
  const saved = localStorage.getItem("avanna-lang");
  if (saved && TRANSLATIONS[saved]) currentLang = saved;
} catch(e) {}

const grid = document.getElementById("photoGrid");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeButton = document.getElementById("closeLightbox");
const prevButton = document.getElementById("prevPhoto");
const nextButton = document.getElementById("nextPhoto");
const form = document.getElementById("passwordForm");
const input = document.getElementById("albumPassword");
const errorBox = document.getElementById("passwordError");
const passwordButton = document.querySelector(".password-button");
const panel = document.getElementById("passwordPanel");
const langSwitch = document.getElementById("langSwitch");

function renderLanguage() {
  const t = TRANSLATIONS[currentLang];
  document.documentElement.lang = currentLang === "ua" ? "uk" : currentLang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  input.placeholder = t.password_placeholder;

  langSwitch.innerHTML = Object.keys(TRANSLATIONS).map(code =>
    `<button type="button" data-lang="${code}" class="${code === currentLang ? "active" : ""}">${TRANSLATIONS[code].lang_label}</button>`
  ).join("");

  langSwitch.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      currentLang = button.dataset.lang;
      try { localStorage.setItem("avanna-lang", currentLang); } catch(e) {}
      renderLanguage();
    });
  });
}

function renderPhotos() {
  grid.hidden = false;
  grid.innerHTML = "";

  if (!photos.length) {
    grid.innerHTML = `<p class="empty-gallery">${TRANSLATIONS[currentLang].no_photos}</p>`;
    return;
  }

  photos.forEach((photo, index) => {
    const item = document.createElement("button");
    item.className = "photo-card";
    item.type = "button";
    item.setAttribute("aria-label", `Открыть фото ${index + 1}`);
    item.innerHTML = `<img src="${photo.url}" alt="${photo.name || "AVANA"}" loading="lazy">`;
    item.addEventListener("click", () => openLightbox(index));
    grid.appendChild(item);
  });
}

function openLightbox(index) {
  currentIndex = (index + photos.length) % photos.length;
  lightboxImage.src = photos[currentIndex].url;
  lightboxImage.alt = photos[currentIndex].name || "AVANA";
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  updateNavigation();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  lightboxImage.src = "";
}

function movePhoto(direction) {
  if (photos.length < 2) return;
  currentIndex = (currentIndex + direction + photos.length) % photos.length;
  lightboxImage.src = photos[currentIndex].url;
  lightboxImage.alt = photos[currentIndex].name || "AVANA";
}

function updateNavigation() {
  const many = photos.length > 1;
  prevButton.hidden = !many;
  nextButton.hidden = !many;
}

async function unlockAlbum(password) {
  const t = TRANSLATIONS[currentLang];
  errorBox.textContent = "";
  passwordButton.disabled = true;
  passwordButton.textContent = t.loading;

  try {
    const response = await fetch(`${API_BASE}/api/albums/${encodeURIComponent(ALBUM)}/access`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      credentials: "same-origin",
      body: JSON.stringify({ password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      errorBox.textContent = response.status === 401 ? t.wrong_password : (data.error || t.server_error);
      return;
    }

    photos = Array.isArray(data.photos) ? data.photos : [];
    panel.hidden = true;
    document.getElementById("albumText").textContent = "";
    renderPhotos();
  } catch (error) {
    errorBox.textContent = t.server_error;
  } finally {
    passwordButton.disabled = false;
    passwordButton.textContent = t.open_button;
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  unlockAlbum(input.value);
});

closeButton.addEventListener("click", closeLightbox);
prevButton.addEventListener("click", () => movePhoto(-1));
nextButton.addEventListener("click", () => movePhoto(1));
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("is-open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") movePhoto(-1);
  if (event.key === "ArrowRight") movePhoto(1);
});

document.getElementById("albumDate").textContent = window.AVANA_ALBUM_DATE || "AVANA";
document.getElementById("albumTitle").textContent = window.AVANA_ALBUM_TITLE || "AVANA";
renderLanguage();
