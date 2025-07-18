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
    // Nieuwe filter vertalingen
    searchPlaceholder: "Zoek op titel, kunstenaar of jaar...",
    sortAZ: "Sorteer A → Z",
    sortZA: "Sorteer Z → A",
    sortYearUp: "Jaar ↑",
    sortYearDown: "Jaar ↓",
    allYears: "Alle jaren",
    allArtists: "Alle kunstenaars",
    resetFilters: "Reset",
    pageTitle: "🖼️ Stripmuren in Brussel",
    mapTitle: "🗺️ Striproute",
    pageDescription: "Ontdek hier een selectie van de kleurrijke stripmuren in Brussel: muurschilderingen geïnspireerd op bekende striphelden zoals Kuifje, Lucky Luke en de Smurfen.",
    // About pagina vertalingen
    about_header: "Over BrusselsExplorer",
    mission_title: "Missie",
    mission_text: "BrusselsExplorer is een digitale gids ontworpen door student Kiran Chaud-ry voor nieuwsgierige bezoekers en locals die de verborgen parels van de stripkunst in Brussel willen ontdekken.",
    whatwedo_title: "Wat doen we?",
    whatwedo_text: "We verzamelen en visualiseren data over muurschilderingen, kunstenaars en locaties uit het open data platform van Brussel. Via onze interactieve website brengen we deze striproutes tot leven.",
    projectinfo_title: "Projectinfo",
    projectinfo_text: "Dit project is onderdeel van het Dynamic Web curriculum. Het laat zien hoe je echte API-data, JavaScript-functionaliteit, themakeuze en gebruikersinteractie combineert in een moderne webtoepassing.",
    team_title: "Ontwikkelaar",
    team_text: "Gemaakt door Kiran Jamil Chaud-ry — student Graduaat Programmeren - Project Dynamic Web.",
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
    // Nieuwe filter vertalingen
    searchPlaceholder: "Rechercher par titre, artiste ou année...",
    sortAZ: "Trier A → Z",
    sortZA: "Trier Z → A",
    sortYearUp: "Année ↑",
    sortYearDown: "Année ↓",
    allYears: "Toutes les années",
    allArtists: "Tous les artistes",
    resetFilters: "Réinitialiser",
    pageTitle: "🖼️ Fresques BD à Bruxelles",
    mapTitle: "🗺️ Circuit BD",
    pageDescription: "Découvrez ici une sélection de fresques BD colorées à Bruxelles, inspirées de héros de bande dessinée comme Tintin, Lucky Luke et les Schtroumpfs.",
  },
};

function applyLanguage(lang) {
  // Normale tekst elementen
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.innerText = translations[lang][key];
    }
  });

  // Placeholder attributen
  const placeholderElements = document.querySelectorAll("[data-i18n-placeholder]");
  placeholderElements.forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });
}

languageSelect.value = savedLanguage;
applyLanguage(savedLanguage);

// Maak vertalingen globaal beschikbaar
window.translations = translations;

// 🔄 EventListener bij wijziging
languageSelect.addEventListener("change", () => {
  const selectedLang = languageSelect.value;
  localStorage.setItem("language", selectedLang);
  applyLanguage(selectedLang);

  // Update filter functies als beschikbaar
  if (typeof window.filterFuncties !== 'undefined' && window.filterFuncties.wijzigTaal) {
    window.filterFuncties.wijzigTaal(selectedLang);
  }

  // Fallback: Herladen stripmuren als script aanwezig is
  if (typeof toonStripmuren === "function" && window.cachedData) {
    toonStripmuren(window.cachedData, selectedLang);
  }
});
