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
    // Homepage info sectie
    infoTitle: "Wat zijn de stripmuren van Brussel?",
    infoText: "In Brussel vind je meer dan 60 prachtige muurschilderingen die een eerbetoon zijn aan Belgische stripfiguren zoals Kuifje, Lucky Luke, Nero en de Smurfen. Deze kleurrijke muren vormen samen het beroemde stripparcours dat je uitnodigt om de stad op een unieke manier te ontdekken.",
    goalTitle: "Doel van BrusselsExplorer",
    goalText: "Met deze webapplicatie kun je deze stripmuren verkennen, favorieten opslaan, filteren op locatie en meer – allemaal met echte data uit de open databronnen van Brussel.",
    // Favorieten pagina vertalingen
    nav_favorites: "Mijn Favorieten",
    favorites_title: "Favorieten",
    no_favorites: "Je hebt nog geen favorieten opgeslagen.",
    back_to_murals: "← Terug naar stripmuren",
    // Login pagina vertalingen
    login_title: "🔐 Login",
    choose_role: "Kies rol:",
    select_role: "-- Selecteer rol --",
    role_user: "Gebruiker",
    role_admin: "Administrator",
    email_address: "E-mailadres",
    password: "Wachtwoord",
    login_button: "Inloggen",
    test_credentials: "🔑 Gebruk/admin gegevens:",
    user_account: "Gebruiker account:",
    admin_account: "Admin account:",
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
    // About pagina vertalingen
    about_header: "À propos de BrusselsExplorer",
    mission_title: "Mission",
    mission_text: "BrusselsExplorer est un guide numérique conçu par l'étudiant Kiran Chaud-ry pour les visiteurs curieux et les locaux qui souhaitent découvrir les perles cachées de l'art de la bande dessinée à Bruxelles.",
    whatwedo_title: "Que faisons-nous ?",
    whatwedo_text: "Nous collectons et visualisons des données sur les peintures murales, les artistes et les lieux à partir de la plateforme open data de Bruxelles. Grâce à notre site web interactif, nous donnons vie à ces circuits BD.",
    projectinfo_title: "Info projet",
    projectinfo_text: "Ce projet fait partie du curriculum Dynamic Web. Il montre comment combiner des données API réelles, des fonctionnalités JavaScript, le choix de thème et l'interaction utilisateur dans une application web moderne.",
    team_title: "Développeur",
    team_text: "Créé par Kiran Jamil Chaud-ry — étudiant Graduaat Programmeren - Project Dynamic Web.",
    // Homepage info sectie
    infoTitle: "Que sont les murs BD de Bruxelles ?",
    infoText: "À Bruxelles, vous trouverez plus de 60 magnifiques peintures murales qui rendent hommage aux personnages de bande dessinée belges comme Tintin, Lucky Luke, Nero et les Schtroumpfs. Ces murs colorés forment ensemble le célèbre parcours BD qui vous invite à découvrir la ville d'une manière unique.",
    goalTitle: "Objectif de BrusselsExplorer",
    goalText: "Avec cette application web, vous pouvez explorer ces murs BD, sauvegarder vos favoris, filtrer par lieu et plus encore – le tout avec de vraies données des sources de données ouvertes de Bruxelles.",
    // Favorieten pagina vertalingen
    nav_favorites: "Mes Favoris",
    favorites_title: "Favoris",
    no_favorites: "Vous n'avez pas encore sauvegardé de favoris.",
    back_to_murals: "← Retour aux fresques BD",
    // Login pagina vertalingen
    login_title: "🔐 Connexion",
    choose_role: "Choisir le rôle :",
    select_role: "-- Sélectionner un rôle --",
    role_user: "Utilisateur",
    role_admin: "Administrateur",
    email_address: "Adresse e-mail",
    password: "Mot de passe",
    login_button: "Se connecter",
    test_credentials: "🔑 Identifiants utilisateur/admin :",
    user_account: "Compte utilisateur :",
    admin_account: "Compte admin :",
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
