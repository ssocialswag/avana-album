const TRANSLATIONS = {
  ru: {
    lang_label:"RU", home:"На главную", albums_nav:"Альбомы",
    eyebrow:"НАШИ МОМЕНТЫ ✦", hero_1:"Люди.", hero_2:"Жизнь.", hero_3:"Настоящие моменты.",
    hero_text:"Фотографии встреч, общения и всего того, что делает AVANA нашей семьёй.",
    view_albums:"Смотреть альбомы", back_site:"Вернуться на сайт",
    strip_1:"Встречаемся", strip_2:"Общаемся", strip_3:"Создаём воспоминания",
    albums_eyebrow:"ФОТОАЛЬБОМЫ", choose_1:"Выбери", choose_2:"воспоминание.",
    albums_text:"Каждая встреча — это отдельная история. Нажми на альбом, чтобы открыть фотографии.",
    date_1:"12 СЕНТЯБРЯ 2026", date_2:"ОСЕНЬ 2026", date_3:"ЗИМА 2026",
    album_1:"Вечер AVANA", album_2:"Осенняя встреча", album_3:"Зимняя встреча",
    open_photos:"Смотреть фотографии", coming_soon:"Скоро",
    cta_eyebrow:"ХОЧЕШЬ СТАТЬ ЧАСТЬЮ?", cta_1:"Следующие", cta_2:"моменты — ", cta_3:"вместе.",
    cta_button:"Перейти на AVANA", footer:"Фотоальбом AVANA ♡"
  },
  ua: {
    lang_label:"UA", home:"На головну", albums_nav:"Альбоми",
    eyebrow:"НАШІ МОМЕНТИ ✦", hero_1:"Люди.", hero_2:"Життя.", hero_3:"Справжні моменти.",
    hero_text:"Фотографії зустрічей, спілкування і всього того, що робить AVANA нашою сім’єю.",
    view_albums:"Дивитися альбоми", back_site:"Повернутися на сайт",
    strip_1:"Зустрічаємося", strip_2:"Спілкуємося", strip_3:"Створюємо спогади",
    albums_eyebrow:"ФОТОАЛЬБОМИ", choose_1:"Обери", choose_2:"спогад.",
    albums_text:"Кожна зустріч — це окрема історія. Натисни на альбом, щоб відкрити фотографії.",
    date_1:"12 ВЕРЕСНЯ 2026", date_2:"ОСІНЬ 2026", date_3:"ЗИМА 2026",
    album_1:"Вечір AVANA", album_2:"Осіння зустріч", album_3:"Зимова зустріч",
    open_photos:"Дивитися фотографії", coming_soon:"Незабаром",
    cta_eyebrow:"ХОЧЕШ СТАТИ ЧАСТИНОЮ?", cta_1:"Наступні", cta_2:"моменти — ", cta_3:"разом.",
    cta_button:"Перейти на AVANA", footer:"Фотоальбом AVANA ♡"
  },
  fr: {
    lang_label:"FR", home:"Accueil", albums_nav:"Albums",
    eyebrow:"NOS MOMENTS ✦", hero_1:"Les gens.", hero_2:"La vie.", hero_3:"Des moments vrais.",
    hero_text:"Les photos de nos rencontres, de nos échanges et de tout ce qui fait d’AVANA une famille.",
    view_albums:"Voir les albums", back_site:"Retour au site",
    strip_1:"On se retrouve", strip_2:"On partage", strip_3:"On crée des souvenirs",
    albums_eyebrow:"ALBUMS PHOTO", choose_1:"Choisis", choose_2:"un souvenir.",
    albums_text:"Chaque rencontre raconte une histoire. Clique sur un album pour ouvrir les photos.",
    date_1:"12 SEPTEMBRE 2026", date_2:"AUTOMNE 2026", date_3:"HIVER 2026",
    album_1:"Soirée AVANA", album_2:"Rencontre d’automne", album_3:"Rencontre d’hiver",
    open_photos:"Voir les photos", coming_soon:"Bientôt",
    cta_eyebrow:"ENVIE D’EN FAIRE PARTIE ?", cta_1:"Les prochains", cta_2:"moments — ", cta_3:"ensemble.",
    cta_button:"Aller sur AVANA", footer:"Album photo AVANA ♡"
  }
};

let currentLang = "ru";
try {
  const saved = localStorage.getItem("avanna-lang");
  if (saved && TRANSLATIONS[saved]) currentLang = saved;
} catch(e) {}

function render(){
  const t = TRANSLATIONS[currentLang];
  document.documentElement.lang = currentLang === "ua" ? "uk" : currentLang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  const langSwitch = document.getElementById("langSwitch");
  langSwitch.innerHTML = Object.keys(TRANSLATIONS).map(code =>
    `<button type="button" data-lang="${code}" class="${code === currentLang ? "active" : ""}">${TRANSLATIONS[code].lang_label}</button>`
  ).join("");

  langSwitch.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      try { localStorage.setItem("avanna-lang", currentLang); } catch(e) {}
      render();
    });
  });
}

render();
