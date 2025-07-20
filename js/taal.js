// zie commit berict voor taal.js 

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
    back_to_dashboard: "← Terug naar Dashboard",
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
    // Contact pagina vertalingen
    nav_contact: "Contact",
    section_send_message: "📩 Stuur ons een bericht",
    label_firstname: "Voornaam:",
    label_lastname: "Achternaam:",
    label_email: "E-mail:",
    label_comment: "Opmerking:",
    button_send: "Verzenden",
    email_title: "📧 E-mail",
    phone_title: "📞 Telefoon",
    address_title: "📍 Adres",
    contact_map_title: "Onze locatie",
    // Dashboard vertalingen
    user_dashboard_title: "👤 Gebruiker Dashboard",
    welcome_message: "Welkom terug!",
    user_info: "Ingelogd als:",
    my_favorites: "🌟 Mijn Favorieten",
    favorites_description: "Bekijk en beheer je opgeslagen stripmuren.",
    view_favorites: "Favorieten bekijken",
    explore_murals: "🎨 Stripmuren Ontdekken",
    explore_description: "Ontdek alle stripmuren in Brussel.",
    explore_now: "Nu ontdekken",
    profile_settings: "⚙️ Instellingen",
    settings_description: "Pas je voorkeuren en instellingen aan.",
    manage_settings: "Instellingen beheren",
    logout: "Uitloggen",
    dashboard: "Dashboard",
    admin_dashboard: "Admin Dashboard",
    // Tijdelijke favorieten berichten
    temp_favorites_question: "Wil je je tijdelijke favorieten bekijken?",
    already_in_temp_favorites: "staat al in je tijdelijke favorieten! Log in om permanent op te slaan.",
    temp_favorites_title: "Tijdelijke Favorieten",
    temp_favorites_message: "Je hebt {count} stripmuur(en) tijdelijk toegevoegd. Deze blijven bewaard tot je ze permanent opslaat of verwijdert. Log in om deze permanent op te slaan!",
    login_to_save: "Inloggen om te bewaren",
    remove_all_temp: "Verwijder Alle Tijdelijke",
    temporary_added: "tijdelijk toegevoegd! Login om permanent op te slaan.",
    temporary_button: "Tijdelijk",
    already_permanent: "staat al permanent in je favorieten!",
    added_permanent: "toegevoegd aan je permanente favorieten!",
    saved_button: "Opgeslagen",
    temp_saved_logged_in: "Je hebt {count} stripmuur(en) tijdelijk opgeslagen. Klik hieronder om deze permanent op te slaan!",
    save_all_favorites: "Bewaar Alle {count} Favorieten",
    must_login_to_save: "Je moet ingelogd zijn om favorieten permanent op te slaan!",
    no_temp_favorites_to_save: "Geen tijdelijke favorieten om op te slaan.",
    no_temp_favorites_to_remove: "Geen tijdelijke favorieten om te verwijderen.",
    all_temp_favorites_removed: "Alle tijdelijke favorieten zijn verwijderd.",
    temp_favorites_saved_permanently: "✅ Tijdelijke favorieten zijn nu permanent opgeslagen!",
    temp_favorites_saved_success: "✅ {count} van de {total} tijdelijke favorieten zijn permanent opgeslagen voor {user}!",
    confirm_remove_all_temp: "Weet je zeker dat je alle {count} tijdelijke favorieten wilt verwijderen?",
    confirm_save_temp_login: "Je hebt {count} tijdelijke favoriet(en). Wil je deze nu permanent opslaan?",
    remove_temp: "Verwijder tijdelijk",
    remove_permanent: "Verwijderen",
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
    back_to_dashboard: "← Retour au Tableau de Bord",
    // Contact pagina vertalingen
    nav_contact: "Contact",
    section_send_message: "📩 Envoyez-nous un message",
    label_firstname: "Prénom:",
    label_lastname: "Nom:",
    label_email: "E-mail:",
    label_comment: "Commentaire:",
    button_send: "Envoyer",
    email_title: "📧 E-mail",
    phone_title: "📞 Téléphone",
    address_title: "📍 Adresse",
    contact_map_title: "Notre emplacement",
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
    // Dashboard vertalingen
    user_dashboard_title: "👤 Tableau de Bord Utilisateur",
    welcome_message: "Bon retour !",
    user_info: "Connecté en tant que :",
    my_favorites: "🌟 Mes Favoris",
    favorites_description: "Consultez et gérez vos fresques BD sauvegardées.",
    view_favorites: "Voir les favoris",
    explore_murals: "🎨 Découvrir les Fresques BD",
    explore_description: "Découvrez toutes les fresques BD à Bruxelles.",
    explore_now: "Découvrir maintenant",
    profile_settings: "⚙️ Paramètres",
    settings_description: "Ajustez vos préférences et paramètres.",
    manage_settings: "Gérer les paramètres",
    logout: "Se déconnecter",
    dashboard: "Tableau de Bord",
    admin_dashboard: "Dashboard Admin",
    // Tijdelijke favorieten berichten
    temp_favorites_question: "Voulez-vous voir vos favoris temporaires ?",
    already_in_temp_favorites: "est déjà dans vos favoris temporaires ! Connectez-vous pour sauvegarder de façon permanente.",
    temp_favorites_title: "Favoris Temporaires",
    temp_favorites_message: "Vous avez ajouté {count} fresque(s) BD temporairement. Elles restent sauvegardées jusqu'à ce que vous les enregistriez de façon permanente ou les supprimiez. Connectez-vous pour les sauvegarder de façon permanente !",
    login_to_save: "Se connecter pour sauvegarder",
    remove_all_temp: "Supprimer Tous les Temporaires",
    temporary_added: "ajouté temporairement ! Connectez-vous pour sauvegarder de façon permanente.",
    temporary_button: "Temporaire",
    already_permanent: "est déjà dans vos favoris permanents !",
    added_permanent: "ajouté à vos favoris permanents !",
    saved_button: "Sauvegardé",
    temp_saved_logged_in: "Vous avez {count} fresque(s) BD sauvegardées temporairement. Cliquez ci-dessous pour les sauvegarder de façon permanente !",
    save_all_favorites: "Sauvegarder Tous les {count} Favoris",
    must_login_to_save: "Vous devez être connecté pour sauvegarder les favoris de façon permanente !",
    no_temp_favorites_to_save: "Aucun favori temporaire à sauvegarder.",
    no_temp_favorites_to_remove: "Aucun favori temporaire à supprimer.",
    all_temp_favorites_removed: "Tous les favoris temporaires ont été supprimés.",
    temp_favorites_saved_permanently: "✅ Les favoris temporaires sont maintenant sauvegardés de façon permanente !",
    temp_favorites_saved_success: "✅ {count} des {total} favoris temporaires ont été sauvegardés de façon permanente pour {user} !",
    confirm_remove_all_temp: "Êtes-vous sûr de vouloir supprimer tous les {count} favoris temporaires ?",
    confirm_save_temp_login: "Vous avez {count} favori(s) temporaire(s). Voulez-vous les sauvegarder de façon permanente maintenant ?",
    remove_temp: "Supprimer temporaire",
    remove_permanent: "Supprimer",
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

  // Update favorieten knoppen als beschikbaar
  if (typeof favorietenManager !== 'undefined' && favorietenManager.updateFavorietenDisplay) {
    favorietenManager.updateFavorietenDisplay();
  }

  // Update favorieten pagina als deze geladen is
  if (typeof favorietenManager !== 'undefined' && favorietenManager.toonFavorieten) {
    favorietenManager.toonFavorieten();
  }

  // Fallback: Herladen stripmuren als script aanwezig is
  if (typeof toonStripmuren === "function" && window.cachedData) {
    toonStripmuren(window.cachedData, selectedLang);
  }
});
