#  BrusselsExplorer - Brussels Stripmuren Dynamic Web Application

##  Projectbeschrijving

BrusselsExplorer is een interactieve webapplicatie ontwikkeld voor het herexamen Project Dynamic Web. De applicatie stelt gebruikers in staat om de beroemde stripmuren van Brussel te verkennen via een moderne, responsive interface met geavanceerde filter- en kaartfunctionaliteiten.

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

### 1. **JavaScript Fundamentals**
- **Locatie**: Alle `.js` bestanden
- **Implementatie**: 
  - `parcours.js` (lijnen 1-900+): ES6+ syntax, arrow functions, async/await
  - `favorieten.js` (lijnen 1-500+): Classes, localStorage, modern JS patterns
  - `taal.js` (lijnen 1-400+): Object destructuring, template literals

### 2. **DOM Manipulatie**
- **Locatie**: `parcours.js` (lijnen 200-350)
- **Implementatie**: 
  ```javascript
  // Dynamic HTML creation and injection
  function toonStripmuren(data, taal = "nl") {
    const container = document.getElementById("parcours-lijst");
    container.innerHTML = "";
    // ... dynamic content generation
  }
  ```

### 3. **Event Handling**
- **Locatie**: `parcours.js` (lijnen 800-900)
- **Implementatie**:
  ```javascript
  function setupEventListeners() {
    zoekInput.addEventListener("input", filterEnZoek);
    sortSelect.addEventListener("change", filterEnZoek);
    // ... multiple event listeners
  }
  ```

### 4. **Asynchrone Programmering**
- **Locatie**: `parcours.js` (lijnen 40-80)
- **Implementatie**:
  ```javascript
  async function haalStripmurenOp() {
    try {
      const response = await fetch("https://opendata.brussels.be/api/...");
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('API fetch error:', error);
    }
  }
  ```

### 5. **LocalStorage Gebruik**
- **Locatie**: `favorieten.js` (lijnen 80-120)
- **Implementatie**:
  ```javascript
  saveFavorieten() {
    const favorietenKey = `favorieten_${userEmail}`;
    localStorage.setItem(favorietenKey, JSON.stringify(this.favorieten));
  }
  ```

### 6. **API Integratie**
- **Locatie**: `parcours.js` (lijnen 40-80)
- **API**: Brussels Open Data API
- **Implementatie**: RESTful API calls met error handling

### 7. **Responsive Design**
- **Locatie**: `css/style.css` (lijnen 500-800)
- **Implementatie**: 
  - CSS Grid en Flexbox layouts
  - Media queries voor verschillende schermformaten
  - Mobile-first design approach

### 8. **CSS Preprocessor Features**
- **Locatie**: `css/style.css` (lijnen 1-50)
- **Implementatie**:
  ```css
  :root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    /* CSS Custom Properties voor theming */
  }
  ```

### 9. **JavaScript Modules/Classes**
- **Locatie**: `favorieten.js` (lijnen 1-50)
- **Implementatie**:
  ```javascript
  class FavorietenManager {
    constructor() {
      this.favorieten = this.getFavorieten();
      this.initEventListeners();
    }
    // ... class methods
  }
  ```

### 10. **External Libraries**
- **Locatie**: `parcours.html` (lijn 107)
- **Implementatie**: Leaflet.js CDN integratie
  ```html
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
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
![Desktop Homepage]()
*Homepage met hoofdnavigatie en intro sectie*

![Desktop Parcours]()
*Parcours pagina met filter opties en stripmuren lijst*

![Desktop Map View]()
*Interactieve kaart weergave met Brussels stripmuren markers*

### Mobile Interface
![Mobile Menu]()
*Responsive hamburger menu voor mobiele apparaten*

![Mobile Filters]()
*Mobiele filter interface*

### Favorieten Systeem
![Favorites System]()
*Tijdelijke en permanente favorieten management*

### Dark Mode
![Dark Theme]()
*Donkere modus interface*

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


