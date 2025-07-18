const languageSelect = document.getElementById("language");
const savedLanguage = localStorage.getItem("language") || "nl";

const translations = {
  nl: {
    title: "🎨 BrusselsExplorer",
    intro: "Ontdek street art en verborgen parels in Brussel",
    start: "🧭 Ontdek Brussel",
    favorites: "Favorieten",
    contact: "Contact",
    login: "Login",
    location: "Locatie",
    parcours: "Parcours",
    theme: "Donkere modus",
    language: "Taal:",
    home: "Home",
    about: "Over ons",
    shortIntro:
      "Ontdek hier een selectie van de kleurrijke stripmuren in Brussel: muurschilderingen geïnspireerd op bekende striphelden zoals Kuifje, Lucky Luke en de Smurfen.",
    viewLabel: "Stripmuren / Kaart",
    add: "Voeg toe",
    openMap: "Open in Google Maps",
    artist: "Kunst",
    locationLabel: "Locatie",
    year: "Jaar",
    description: "Beschrijving",
    noDescription: "Geen beschrijving beschikbaar.",
  },
  fr: {
    title: "🎨 BrusselsExplorer",
    intro: "Découvrez le street art et les trésors cachés de Bruxelles",
    start: "🧭 Explorer Bruxelles",
    favorites: "Favoris",
    contact: "Contact",
    login: "Connexion",
    location: "Lieu",
    parcours: "Parcours",
    theme: "Mode sombre",
    language: "Langue :",
    home: "Accueil",
    about: "À propos",
    shortIntro:
      "Découvrez ici une sélection de fresques BD colorées à Bruxelles, inspirées de héros de bande dessinée comme Tintin, Lucky Luke et les Schtroumpfs.",
    viewLabel: "Fresques / Carte",
    add: "Ajouter",
    openMap: "Ouvrir dans Google Maps",
    artist: "Artiste",
    locationLabel: "Lieu",
    year: "Année",
    description: "Description",
    noDescription: "Pas de description disponible.",
  },
};

function applyLanguage(lang) {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.innerText = translations[lang][key];
    }
  });
}

languageSelect.value = savedLanguage;
applyLanguage(savedLanguage);

// 🔄 EventListener bij wijziging
languageSelect.addEventListener("change", () => {
  const selectedLang = languageSelect.value;
  localStorage.setItem("language", selectedLang);
  applyLanguage(selectedLang);

  // Herladen stripmuren als script aanwezig is
  if (typeof toonStripmuren === "function" && window.cachedData) {
    toonStripmuren(window.cachedData, selectedLang);
  }
});
