#  BrusselsExplorer - Brussels Stripmuren Dynamic Web Application

##  Projectbeschrijving

BrusselsExplorer is een interactieve webapplicatie ontwikkeld voor het herexamen Project Dynamic Web. De applicatie stelt gebruikers in staat om de beroemde stripmuren van Brussel te verkennen via een moderne, responsive interface met geavanceerde filter- en kaartfunctionaliteiten.

##  Screenshots van parcours de laatse update van 20 augustus 

### update parcous js 
![api](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/8ca8ce9160aa9c795bef1828d3ec16b511bfa973/screenshots/update_van_parcours_url.png)
*ik heb deze aangemaakt op 27 juli alles werkte perfect, wou ik laatse momenten even checken of alles in orde is maar zag dat er geen afbeeldigen, locatie , strip informatie niet meer weegeven , door de update waren er sommige zaken niet meer werkte door deze wijziging van de api en moeste aanpassen *


###  Hoofdfunctionaliteiten

- **Interactieve Stripmuren Verkenning**: Bekijk 28+ authentieke Brussels stripmuren met echte data
- **Dual View System**: Schakel naadloos tussen lijst- en kaartweergave
- **Geavanceerde Filtering**: Filter op jaar, kunstenaar, afstand en zoektermen
- **Geolocatie Integratie**: Automatische afstandsberekening naar gebruikerslocatie
- **Favorieten Systeem**: Tijdelijke en permanente opslag van favoriete stripmuren
- **Meertalige Ondersteuning**: Volledige Nederlands/Frans vertaling
- **Responsive Design**: Optimaal voor desktop, tablet en mobiele apparaten
- **Donkere/Lichte Modus**: Aanpasbare thema's voor gebruikersvoorkeur
- **User Dashboard**: Persoonlijke gebruikersomgeving met login functionaliteit

##  Gebruikte Technologieën

### Frontend
- **HTML5**: Semantische markup en toegankelijkheid
- **CSS3**: Responsive design, CSS Grid, Flexbox, CSS Custom Properties
- **Vanilla JavaScript (ES6+)**: Moderne JavaScript zonder frameworks
- **Leaflet.js v1.9.4**: Interactieve kaarten functionaliteit

### API's en Data
- **Brussels Open Data API**: Officiële Brussels stripmuren dataset
  - URL: `https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records`
  - Documentatie: [Brussels Open Data Portal](https://opendata.brussels.be/)
- **Geolocation API**: Browser-native locatie services
- **Google Maps Integration**: Externe navigatie links

### Development Tools
- **Git & GitHub**: Versiebeheer en repository hosting
- **VS Code**: Primary development environment
- **GitHub Copilot**: AI-assisted development

##  Project Structuur

```
herexamen_project_dynamic_web/
├── index.html                 # Homepage
├── parcours.html             # Hoofdfunctionaliteit pagina
├── favorieten.html           # Favorieten overzicht
├── login.html                # Authenticatie pagina
├── about.html                # Over ons pagina
├── contact.html              # Contact formulier
├── admin_dashboard.html      # Admin dashboard
├── user_dashboard.html       # User dashboard
├── css/
│   └── style.css             # Hoofdstylesheet
├── js/
│   ├── parcours.js           # Hoofd stripmuren functionaliteit
│   ├── favorieten.js         # Favorieten management systeem
│   ├── taal.js               # Meertalig systeem
│   ├── thematoggle.js        # Donkere/lichte modus
│   ├── navigatie.js          # Mobile hamburger menu
│   ├── admin_dashboard.js    # Admin dashboard functionaliteit
│   ├── dashboard.js          # Dashboard helper functies
│   ├── login.js              # Login/logout functionaliteit
│   ├── contact.js            # Contact formulier handling
│   └── geolocatie.js         # Geolocatie services
├── img/
│   └── logo brussel parcours.png
└── README.md                 # Deze documentatie
```

##  Implementatie van Technische Vereisten

### **DOM Manipulatie**

#### Elementen selecteren
- **Locatie**: `parcours.js` (lijnen 1-30, 1170-1200)
- **Implementatie**: 
  ```javascript
  const zoekInput = document.getElementById("zoekInput");
  const sortSelect = document.getElementById("sorteerSelect");
  const container = document.getElementById("parcours-lijst");
  const buttons = document.querySelectorAll('.favoriet-button');
  ```

#### Elementen manipuleren
- **Locatie**: `parcours.js` (lijnen 259-390), `favorieten.js` (lijnen 244-370)
- **Implementatie**:
  ```javascript
  function toonStripmuren(data, taal = "nl") {
    const container = document.getElementById("parcours-lijst");
    container.innerHTML = ""; // Clear existing content
    // Dynamic HTML creation and injection
    data.forEach((muur, index) => {
      const kaart = document.createElement("div");
      kaart.classList.add("muur-kaart");
      kaart.innerHTML = `<h3>${titel}</h3>...`;
      container.appendChild(kaart);
    });
  }
  ```

#### Events aan elementen koppelen
- **Locatie**: `parcours.js` (lijnen 957-1040, 1170-1200)
- **Implementatie**:
  ```javascript
  function setupEventListeners() {
    zoekInput.addEventListener("input", filterEnZoek);
    sortSelect.addEventListener("change", filterEnZoek);
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('favoriet-button')) {
        // Handle favoriet button clicks
      }
    });
  }
  ```

### **Modern JavaScript**

#### Gebruik van constanten
- **Locatie**: Alle `.js` bestanden
- **Implementatie**:
  ```javascript
  const taalSelect = document.getElementById("language");
  const API_URL = "https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records";
  const kunstenaars = [...new Set(data.map(muur => muur.fields.dessinateur))];
  ```

#### Template literals
- **Locatie**: `parcours.js` (lijnen 259-390), `favorieten.js` (lijnen 375-420), `taal.js` (lijnen 123-270)
- **Implementatie**:
  ```javascript
  const favorietenKey = `favorieten_${userEmail}`;
  kaart.innerHTML = `
    <h3>${titel}</h3>
    <p><strong>${taal === 'fr' ? 'Artiste' : 'Kunstenaar'}:</strong> ${kunstenaar}</p>
    <button onclick="favorietenManager.voegFavorietToe(${stripmuur.id})">
      ⭐ ${taal === 'fr' ? 'Ajouter aux favoris' : 'Voeg toe favorieten'}
    </button>
  `;
  ```

#### Iteratie over arrays
- **Locatie**: `parcours.js` (lijnen 259-390, 414-450), `favorieten.js` (lijnen 185-210)
- **Implementatie**:
  ```javascript
  data.forEach((muur, index) => {
    // Process each stripmuur
  });
  
  tijdelijke.forEach(favoriet => {
    const exists = this.favorieten.find(fav => fav.id === favoriet.id);
    if (!exists) {
      this.favorieten.push(favoriet);
    }
  });
  ```

#### Array methodes
- **Locatie**: `parcours.js` (lijnen 414-450, 619-800), `admin_dashboard.js` (lijnen 524-550)
- **Implementatie**:
  ```javascript
  // map, filter, find, sort
  const jaren = [...new Set(data.map(muur => muur.fields.date).filter(jaar => jaar))].sort();
  const gefilterde = alleStripmuren.filter(muur => {
    return naam.includes(zoekterm) && voldoetAanJaar && voldoetAanKunstenaar;
  });
  const existing = this.favorieten.find(fav => fav.id === stripmuur.id);
  ```

#### Arrow functions
- **Locatie**: `parcours.js` (lijnen 1119-1160), `taal.js` (lijnen 285-320)
- **Implementatie**:
  ```javascript
  const updateViewLabel = (isKaart) => {
    if (viewLabel) viewLabel.textContent = isKaart ? "🗺️ Kaart" : "📋 Lijst";
  };
  
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.innerText = translations[lang][key];
    }
  });
  ```

#### Conditional (ternary) operator
- **Locatie**: `parcours.js` (lijnen 259-390), `favorieten.js` (lijnen 310-420)
- **Implementatie**:
  ```javascript
  const naam = taal === 'nl' ? naam_nl : naam_fr;
  const label = currentLang === 'fr' ? 'Artiste' : 'Kunstenaar';
  const buttonText = isPermanent ? '⭐ Opgeslagen' : (isTijdelijk ? '🟡 Tijdelijk' : '⭐ Favoriet');
  ```

#### Callback functions
- **Locatie**: `parcours.js` (lijnen 957-1040), `favorieten.js` (lijnen 29-55)
- **Implementatie**:
  ```javascript
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('favoriet-button')) {
      // Callback function voor event handling
    }
  });
  
  setInterval(() => {
    const currentLoginState = localStorage.getItem('isLoggedIn') === 'true';
    // Callback function voor periodic checks
  }, 1000);
  ```

#### Promises
- **Locatie**: `parcours.js` (lijnen 33-90)
- **Implementatie**:
  ```javascript
  async function haalStripmurenOp() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('API fetch error:', error);
      return [];
    }
  }
  ```

#### Async & Await
- **Locatie**: `parcours.js` (lijnen 33-90, 1201-1250)
- **Implementatie**:
  ```javascript
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      cachedData = await haalStripmurenOp();
      alleStripmuren = [...cachedData];
      // Process loaded data
    } catch (error) {
      console.error('Initialization error:', error);
    }
  });
  ```

#### Observer API (IntersectionObserver)
- **Locatie**: `parcours.js` (lijnen 1119-1170)
- **Implementatie**:
  ```javascript
  function setupLazyLoading() {
    imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          img.src = src;
          imageObserver.unobserve(img);
        }
      });
    }, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    });
  }
  ```

### **Data & API**

#### Fetch om data op te halen
- **Locatie**: `parcours.js` (lijnen 31-91)
- **Implementatie**:
  ```javascript
  async function haalStripmurenOp() {
    try {
      const response = await fetch("https://bruxellesdata.opendatasoft.com/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=28");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('❌ === API FETCH ERROR ===');
      return [];
    }
  }
  ```

#### JSON manipuleren en weergeven
- **Locatie**: `parcours.js` (lijnen 280-345)
- **Implementatie**:
  ```javascript
  // Support voor Brussels Open Data format
  const fields = muur.fields || muur;
  
  const titel_nl = fields.naam_fresco_nl || muur.naam_fresco_nl || '';
  const titel_fr = fields.nom_de_la_fresque || muur.nom_de_la_fresque || '';
  const tekenaar = fields.dessinateur || muur.dessinateur || "Onbekend";
  const jaar = fields.date || muur.date || "Onbekend";
  
  // Display JSON data in HTML
  muurElement.innerHTML = `
    <img src="${afbeelding}" alt="${titel_nl || titel_fr}">
    <h3>${titel}</h3>
    <p><strong>Kunstenaar:</strong> ${tekenaar}</p>
    <p><strong>Jaar:</strong> ${jaar}</p>
  `;
  ```

### **Opslag & Validatie**

#### Formulier validatie
- **Locatie**: `contact.js`, `login.js`
- **Implementatie**: Form validation voor contact formulier en login systeem

#### Gebruik van LocalStorage
- **Locatie**: `favorieten.js` (lijnen 61-105), `taal.js` (lijnen 5-15)
- **Implementatie**:
  ```javascript
  // User-specific favorieten opslag
  saveFavorieten() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    const favorietenKey = `favorieten_${userEmail}`;
    localStorage.setItem(favorietenKey, JSON.stringify(this.favorieten));
  }
  
  // Taal voorkeur opslag
  const savedLanguage = localStorage.getItem("language") || "nl";
  localStorage.setItem("language", selectedLang);
  
  // Tijdelijke favorieten opslag
  localStorage.setItem('tijdelijkeFavorieten', JSON.stringify(tijdelijke));
  ```

##  Installatiehandleiding

### Vereisten
- Moderne webbrowser (Chrome 90+, Firefox 88+, Safari 14+)
- Internetverbinding (voor API calls en externe resources)
- Lokale webserver (optioneel, maar aanbevolen)

### Installatie Stappen

1. **Repository Clonen**
   ```bash
   git clone https://github.com/kiranchaudry97/herexamen_project_dynamic_web.git
   cd herexamen_project_dynamic_web
   ```

2. **Lokale Server Starten** (Aanbevolen)
  

   **VS Code Live Server Extension**
   - Installeer Live Server extension
   - Right-click op `index.html` → "Open with Live Server"

3. **Applicatie Openen**
   - Navigeer naar `http://localhost:5500` (of gekozen poort)
   - Of open `index.html` direct in browser (mogelijk CORS beperkingen)

### Test Accounts
- **Gebruiker**: `gebruiker@brussel.be` / `user123`
- **Admin**: `admin@brussel.be` / `admin123`

##  Screenshots

### Desktop Interface
![Desktop Homepage](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/Homepage.jpg)
*Homepage met hoofdnavigatie en intro sectie*

![Desktop Parcours](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/parcours_pagine_filter.jpg)
*Parcours pagina met filter opties en stripmuren lijst*

![Desktop Map View](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/interactieve_kaart.jpg)
*Interactieve kaart weergave met Brussels stripmuren markers*

![Desktop Map View op afstand](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/filteren_op_afstand.jpg)
*geolocatie of basis van jou afstand en de stripmuren*



### Mobile Interface
![Mobile Menu](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/Responsive_hamburger.jpg)
*Responsive hamburger menu voor mobiele apparaten*

![Mobile Filters](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/Mobiele_filter.jpg)
*Mobiele filter interface*

### Favorieten Systeem
![Favorites System](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/favorieten_opslaan.jpg)

![Favorites System](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/Tijdelijke_en_permanente_favorieten.jpg)

![Favorites System](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/favorieten_pagina.jpg)
*Tijdelijke en permanente favorieten management en favorieten pagina overzicht*

### Dark Mode
![Dark Theme](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/donkere_modus.jpg)
*Donkere modus interface*

### Taal keuze
![Taal](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/vertaling.jpg)
*Taal veranderen *

### Over ons pagina 

![about](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/about_pagina.jpg)
*Over ons pagina *

### Contact pagina 

![contact](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/contact_pagina.jpg)
*Contact pagina *

![contact bericht](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/contact_bericht.jpg)
*Contact pagina bericht kunnen versturen *


### Login pagina 

![Login](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/log_page.jpg)
*login pagina voor gebruikers en admin*

### Gebruiker Dashboard 

![gebruiker dashboard](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/gebruiker_dashboard.jpg)
*Gebruikers dashbaord *

![gebruiker dashboard favorieten](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/favorieten_opslaan.jpg)
*Gebruikers dashbaord & mijn favortien*


### Admin Dashboard & bericht versturen

![Admin  dashboard](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/admin_dashboard.jpg)
*Admin dashbaord en overzichtelijke berichten van de gebruikers & toegevoegde favorieten*

![Adin  dashboard & bericht](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/mail_bericht_naar_gebruiker.jpg)
*Admin dashbaord en overzichtelijke berichten van de gebruikers, kunnen beantwoorden , updaten*

### Toggle 
![toggle](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/toggle.jpg)
*Toggle *

### Filteren 
![filteren](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/parcours_pagine_filter.jpg)
*Filteren *


### Geolocatie & op afstand  
![afstand filteren](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/geolocatie_afstand.jpg)

![afstand filteren](https://github.com/kiranchaudry97/herexamen_project_dynamic_web/blob/5e23aeb89bbe6ce9d96d2ae79ce9254c7ed04a15/screenshots/filteren_op_afstand.jpg)
* afstand kunnen filteren *


## Live Demo

De applicatie is live beschikbaar op: [https://kiranchaudry97.github.io/herexamen_project_dynamic_web/](https://kiranchaudry97.github.io/herexamen_project_dynamic_web/)

##  Gebruikte Bronnen



### AI Assistance
- **GitHub Copilot**: Code completion en suggesties
- **ChatGPT**: Debugging hulp en code optimalisatie



##  Development Process

### Git Commit Strategy
- **Daily commits**: Dagelijkse voortgang commits
- **Feature commits**: Per functionaliteit implementatie
- **Bug fix commits**: Specifieke bug oplossingen
- **Documentation commits**: README en code documentatie updates

### Code Quality Standards
- **ES6+ JavaScript**: Moderne syntax en patterns
- **Semantic HTML**: Toegankelijke markup
- **BEM CSS Methodology**: Gestructureerde CSS naming
- **Error Handling**: Comprehensive try-catch en fallbacks
- **Performance**: Lazy loading, optimized API calls



##  Problemen die voorkomen 

### Known Issues
- Afbeeldingen kunnen soms niet weergeven worden en bij de kaartweergave vooral de informaties.
- Geolocatie werkt mogelijk niet over HTTP (alleen HTTPS)
- Map markers kunnen overlappen bij hoge zoom levels
- Favorieten data verloren bij browser cache clear



##  Ontwikkelaar

**Kiran Jamil Chaud-ry**
- Student: Graduaat Programmeren
- Project: Dynamic Web - Herexamen
- Academiejaar: 2024-2025

### Contact
- GitHub: [@kiranchaudry97](https://github.com/kiranchaudry97)
- Email: kiran.chaudry@student.ehb.be

##  Licentie

Dit project is ontwikkeld voor educatieve doeleinden als onderdeel van het Dynamic Web curriculum. Alle rechten voorbehouden.

---


