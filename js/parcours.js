 // zie commit bericht voor uitleg
(function() {
  console.log('Directe event listener setup gestart');
  
  // Wacht tot het DOM geladen is
  function setupDirectEventListener() {
    console.log('Setup directe event listener');
    
    
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('favoriet-button')) {
        console.log('FAVORIET KNOP GEKLIKT! 🎉');
        e.preventDefault();
        e.stopImmediatePropagation();
        
        const muralId = parseInt(e.target.dataset.id);
        console.log('Mural ID:', muralId);
        
       
        if (typeof favorietenManager === 'undefined') {
          console.error('FavorietenManager niet geladen!');
          showNotification('Favorieten systeem wordt geladen... Probeer het opnieuw.', 'error');
          return false;
        }
        
        // Haal mural data op
        const muralData = getStripmuurById(muralId);
        console.log('Mural data gevonden:', muralData);
        
        if (muralData) {
          // Zorg ervoor dat de mural data de juiste eigenschappen heeft voor favorieten
          const favorietData = {
            id: muralData.id || muralId,
            title: muralData.naam_fresco_nl || muralData.nom_de_la_fresque || "Naam onbekend",
            naam_fresco_nl: muralData.naam_fresco_nl,
            nom_de_la_fresque: muralData.nom_de_la_fresque,
            dessinateur: muralData.dessinateur || "Onbekend",
            adres: muralData.adres || muralData.adresse || "Adres niet beschikbaar",
            date: muralData.date || "Onbekend",
            description_nl: muralData.description_nl || muralData.info_nl || "",
            description_fr: muralData.description_fr || muralData.info_fr || "",
            image: muralData.image || "img/placeholder.jpg",
            coordonnees_geographiques: muralData.coordonnees_geographiques
          };
          
          console.log('Favoriet data voorbereid:', favorietData);
          
          const result = favorietenManager.voegFavorietToe(favorietData);
          console.log('Favoriet toevoeg resultaat:', result);
          
          if (result.success) {
            // Toon success melding op basis van type
            const titel = result.title;
            
            if (result.type === 'permanent') {
              const currentLang = localStorage.getItem('language') || 'nl';
              showNotification(`✅ "${titel}" ${translations[currentLang].added_permanent}`, 'success');
            } else if (result.type === 'temporary') {
              const currentLang = localStorage.getItem('language') || 'nl';
              showNotification(`✅ "${titel}" ${translations[currentLang].temporary_added}`, 'warning');
            }
            
            // Update de knop display via favorietenManager
            favorietenManager.updateFavorietenDisplay();
            
            // Redirect na een korte delay
            setTimeout(() => {
              const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
              if (isLoggedIn) {
                window.location.href = 'favorieten.html';
              } else {
                const currentLang = localStorage.getItem('language') || 'nl';
                if (confirm(translations[currentLang].temp_favorites_question)) {
                  window.location.href = 'favorieten.html';
                }
              }
            }, 2000);
          } else {
            // Toon error melding op basis van type
            const titel = result.title;
            
            if (result.type === 'duplicate-permanent') {
              const currentLang = localStorage.getItem('language') || 'nl';
              showNotification(`⚠️ "${titel}" ${translations[currentLang].already_permanent}`, 'warning');
            } else if (result.type === 'duplicate-temporary') {
              const currentLang = localStorage.getItem('language') || 'nl';
              showNotification(`⚠️ "${titel}" ${translations[currentLang].already_in_temp_favorites}`, 'warning');
            }
          }
        } else {
          console.error('Geen mural data gevonden voor ID:', muralId);
          showNotification('Fout: Kan stripmuur niet vinden. Probeer de pagina te verversen.', 'error');
        }
        
        return false;
      }
    }, true); 
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDirectEventListener);
  } else {
    setupDirectEventListener();
  }
})();

const taalSelect = document.getElementById("language");
const huidigeTaal = localStorage.getItem("language") || "nl";

let cachedData = [];
let map;
let markersLayer;

//Helper functie om stripmuur data op te halen per ID
function getStripmuurById(id) {
  console.log('getStripmuurById aangeroepen met ID:', id); // Debug
  
  // Probeer eerst uit filter systeem als beschikbaar
  let dataSource = cachedData;
  if (typeof window.filterFuncties !== 'undefined' && window.filterFuncties.gefilterdeMuren) {
    const filteredData = window.filterFuncties.gefilterdeMuren();
    if (filteredData && filteredData.length > 0) {
      dataSource = filteredData;
      console.log('Gebruik gefilterde data:', filteredData.length, 'items');
    }
  }
  
  // Als we geen data hebben, probeer uit de originele alleStripmuren van filter.js
  if ((!dataSource || dataSource.length === 0) && window.alleStripmuren) {
    dataSource = window.alleStripmuren;
    console.log('Gebruik alleStripmuren uit filter.js:', dataSource.length, 'items');
  }
  
  console.log('Zoeken naar ID:', id, 'in data:', dataSource.length, 'items'); // Debug
  
  if (!dataSource || dataSource.length === 0) {
    console.error('Geen data beschikbaar!');
    return null;
  }
  
  // Zoek op basis van verschillende mogelijkheden
  let result = null;
  
  // 1. Zoek op werkelijke id property
  result = dataSource.find(muur => muur.id === id);
  if (result) {
    console.log('Gevonden via id property:', result);
    return result;
  }
  
  // 2. Zoek op index (id - 1)
  if (id > 0 && id <= dataSource.length) {
    result = dataSource[id - 1];
    if (result) {
      console.log('Gevonden via index:', result);
      // Voeg ID toe als het ontbreekt
      if (!result.id) {
        result.id = id;
      }
      return result;
    }
  }
  
  // 3. Als laatste redmiddel, zoek op basis van DOM-element data
  const buttonElement = document.querySelector(`[data-id="${id}"]`);
  if (buttonElement) {
    const kaartElement = buttonElement.closest('.muur-kaart');
    if (kaartElement) {
      const muralId = parseInt(kaartElement.dataset.muralId);
      if (muralId && muralId !== id) {
        console.log('Probeer met muralId uit DOM:', muralId);
        return getStripmuurById(muralId);
      }
    }
  }
  
  console.error('Geen mural gevonden voor ID:', id);
  return null;
}

async function haalStripmurenOp() {
  const response = await fetch("https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=28");
  const data = await response.json();
  return data.results;
}

function toonStripmuren(data, taal = "nl") {
  const container = document.getElementById("parcours-lijst");
  container.innerHTML = "";

  data.forEach((muur, index) => {
    const naam = muur[`naam_fresco_${taal}`] || muur.nom_de_la_fresque || "Naam onbekend";
    const kunstenaar = muur.dessinateur || "Onbekend";
    const adres = muur.adres || muur.adresse || "Adres niet beschikbaar";
    const jaar = muur.date || "Onbekend";
    const beschrijving =
      muur[`description_${taal}`] ||
      muur[`info_${taal}`] ||
      muur.description_nl ||
      muur.description_fr ||
      muur.info_nl ||
      muur.info_fr ||
      (taal === "fr" ? "Pas de description disponible." : "Geen beschrijving beschikbaar.");
    const afbeelding = muur.image || "img/placeholder.jpg";
    const mapLink = `https://www.google.com/maps?q=${encodeURIComponent(adres)}`;
    
    // Genereer unieke ID voor deze stripmuur
    const muralId = muur.id || index + 1;

    const kaart = document.createElement("div");
    kaart.classList.add("muur-kaart");
    kaart.dataset.muralId = muralId;

    kaart.innerHTML = `
      <img data-src="${afbeelding}" src="img/placeholder.jpg" alt="${naam}" class="lazy-load" />
      <h3>${naam}</h3>
      <p><strong>${translations[taal].artist}:</strong> ${kunstenaar}</p>
      <p><strong>${taal === "fr" ? "Adresse" : "Adres"}:</strong> ${adres}</p>
      <p><strong>${taal === "fr" ? "Année" : "Jaar"}:</strong> ${jaar}</p>
      <p><strong>${taal === "fr" ? "Description" : "Beschrijving"}:</strong> ${beschrijving}</p>
      <div class="kaart-acties">
        <a href="${mapLink}" target="_blank" class="button">${taal === "fr" ? "🗺️ Ouvrir dans Google Maps" : "🗺️ Open in Google Maps"}</a>
        <button class="favoriet-button button" data-id="${muralId}" style="background-color: #e53935;">🌟 ${translations[taal].add}</button>
      </div>
    `;

    container.appendChild(kaart);
  });
  
  // 🔍 INTERSECTION OBSERVER - Start lazy loading na het laden van stripmuren
  observeImages();
  
  // Update favoriet knoppen na het laden van de stripmuren
  if (typeof favorietenManager !== 'undefined') {
    favorietenManager.updateFavorietenDisplay();
  }
}

function initMap() {
  map = L.map('map-container').setView([50.8503, 4.3517], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap-bijdragers'
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

function toonKaart(data, taal = "nl") {
  if (!map) initMap();
  markersLayer.clearLayers();

  data.forEach(muur => {
    const titel_nl = muur.naam_fresco_nl || '';
    const titel_fr = muur.nom_de_la_fresque || '';
    const beschrijving_nl = muur.description_nl || muur.info_nl || '';
    const beschrijving_fr = muur.description_fr || muur.info_fr || '';
    const tekenaar = muur.dessinateur || "Onbekend";
    const adres = muur.adres || muur.adresse || "Adres niet beschikbaar";
    const gemeente = muur.commune_gemeente || "Onbekend";
    const link = muur.link_site_striproute || muur.lien_site_parcours_bd || "#";
    const afbeelding = muur.image || null;

    const lat = muur.coordonnees_geographiques?.lat;
    const lon = muur.coordonnees_geographiques?.lon;

    if (lat && lon) {
      const popupHtml = `
        <strong>
          ${titel_nl ? `<div><b>NL:</b> ${titel_nl}</div>` : ''}
          ${titel_fr ? `<div><b>FR:</b> ${titel_fr}</div>` : ''}
        </strong><br>
        <span><b>${translations[taal].artist}:</b> ${tekenaar}</span><br>
        <span><b>${taal === 'fr' ? "Adresse" : "Adres"}:</b> ${adres}</span><br>
        <span><b>Gemeente:</b> ${gemeente}</span><br><br>
        ${beschrijving_nl ? `<div><b>NL:</b> ${beschrijving_nl}</div>` : ''}
        ${beschrijving_fr ? `<div><b>FR:</b> ${beschrijving_fr}</div>` : ''}
        ${link !== "#" ? `<p><a href="${link}" target="_blank" style="color:#007bff;">${taal === 'fr' ? 'Plus d\'info' : 'Meer info'}</a></p>` : ''}
        ${afbeelding ? `<img src="${afbeelding}" alt="${titel_nl || titel_fr}" style="max-width:180px; border-radius:8px; margin-top:6px;">` : '<i>Geen afbeelding</i>'}
      `;
      const marker = L.marker([lat, lon]).bindPopup(popupHtml);
      markersLayer.addLayer(marker);
    }
  });

  setTimeout(() => {
    map.invalidateSize();
  }, 200);
}

//  Initialisatie 
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log('Parcours.js initialisatie gestart'); // Debug
    console.log('FavorietenManager bij start:', typeof favorietenManager); // Debug
    
    // observer Setup lazy loading eerst
    setupLazyLoading();
    
    // Wacht een moment om ervoor te zorgen dat filter.js eerst laadt
    setTimeout(async () => {
      // Controleer of filter.js al data heeft geladen
      if (typeof window.filterFuncties !== 'undefined') {
        // Filter.js is geladen, gebruik de gefilterde data
        console.log("Filter systeem gedetecteerd - gebruik gefilterde data");
        
        // Haal data op uit filter systeem
        if (window.filterFuncties.gefilterdeMuren) {
          cachedData = window.filterFuncties.gefilterdeMuren();
          console.log('Data uit filter systeem:', cachedData.length, 'items');
        }
        
        setupViewToggle(); // Setup alleen de view toggle
        setupFavorietenEventListeners(); // Setup favoriet event listeners
        
        // Update favoriet knoppen na een korte delay
        setTimeout(() => {
          console.log('FavorietenManager na timeout:', typeof favorietenManager); // Debug
          if (typeof favorietenManager !== 'undefined') {
            favorietenManager.updateFavorietenDisplay();
          } else {
            console.warn('FavorietenManager nog steeds niet beschikbaar na timeout');
          }
        }, 1000); // Langere timeout voor betere betrouwbaarheid
        return; // Filter.js handelt data loading af
      }
      
      // Fallback: laad data zoals voorheen als filter.js niet beschikbaar is
      console.log('Laden van stripmuren data...'); // Debug
      cachedData = await haalStripmurenOp();
      console.log('Data geladen:', cachedData.length, 'items'); // Debug
      const huidigeTaal = localStorage.getItem("language") || "nl";
      
      // Toon stripmuren
      toonStripmuren(cachedData, huidigeTaal);
      setupViewToggle();
      setupFavorietenEventListeners(); // Setup favoriet event listeners
      
      // Update favoriet knoppen als favorietenManager beschikbaar is
      setTimeout(() => {
        console.log('FavorietenManager na fallback timeout:', typeof favorietenManager); // Debug
        if (typeof favorietenManager !== 'undefined') {
          favorietenManager.updateFavorietenDisplay();
        } else {
          console.warn('FavorietenManager niet beschikbaar na fallback timeout');
        }
      }, 500);
    }, 100); // Wacht 100ms voor filter.js
    
  } catch (error) {
    console.error('Error loading stripmuren:', error);
  }
});

//  Aparte functie voor favoriet event listeners 
function setupFavorietenEventListeners() {
  // Gebruik event delegation op document level voor betere betrouwbaarheid
  document.removeEventListener('click', handleFavorietClick); // Verwijder oude listener eerst
  document.addEventListener('click', handleFavorietClick);
}

function handleFavorietClick(e) {
  if (e.target.classList.contains('favoriet-button')) {
    e.preventDefault();
    e.stopPropagation();
    
    const muralId = parseInt(e.target.dataset.id);
    
    console.log('Favoriet knop geklikt, ID:', muralId); // Debug
    console.log('FavorietenManager aanwezig:', typeof favorietenManager !== 'undefined'); // Debug
    console.log('cachedData length:', cachedData.length); // Debug
    
    // Check of favorietenManager beschikbaar is
    if (typeof favorietenManager === 'undefined') {
      console.error('FavorietenManager niet geladen!');
      showNotification('Favorieten systeem wordt geladen... Probeer het opnieuw.', 'error');
      return;
    }
    
    const muralData = getStripmuurById(muralId);
    console.log('Mural data:', muralData); // Debug
    
    if (muralData) {
      // Zorg ervoor dat de mural data de juiste eigenschappen heeft voor favorieten
      const favorietData = {
        id: muralData.id || muralId,
        title: muralData.naam_fresco_nl || muralData.nom_de_la_fresque || "Naam onbekend",
        naam_fresco_nl: muralData.naam_fresco_nl,
        nom_de_la_fresque: muralData.nom_de_la_fresque,
        dessinateur: muralData.dessinateur || "Onbekend",
        adres: muralData.adres || muralData.adresse || "Adres niet beschikbaar",
        date: muralData.date || "Onbekend",
        description_nl: muralData.description_nl || muralData.info_nl || "",
        description_fr: muralData.description_fr || muralData.info_fr || "",
        image: muralData.image || "img/placeholder.jpg",
        coordonnees_geographiques: muralData.coordonnees_geographiques
      };
      
      console.log('Favoriet data voorbereid:', favorietData); // Debug
      
      const result = favorietenManager.voegFavorietToe(favorietData);
      console.log('Favoriet toevoeg resultaat:', result); // Debug
      
      if (result.success) {
        // Toon success melding op basis van type
        const titel = result.title;
        
        if (result.type === 'permanent') {
          const currentLang = localStorage.getItem('language') || 'nl';
          showNotification(`✅ "${titel}" ${translations[currentLang].added_permanent}`, 'success');
        } else if (result.type === 'temporary') {
          const currentLang = localStorage.getItem('language') || 'nl';
          showNotification(`✅ "${titel}" ${translations[currentLang].temporary_added}`, 'warning');
        }
        
        // Update de knop display via favorietenManager
        favorietenManager.updateFavorietenDisplay();
        
        // Redirect na een korte delay
        setTimeout(() => {
          const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
          if (isLoggedIn) {
            window.location.href = 'favorieten.html';
          } else {
            const currentLang = localStorage.getItem('language') || 'nl';
            if (confirm(translations[currentLang].temp_favorites_question)) {
              window.location.href = 'favorieten.html';
            }
          }
        }, 2000);
      } else {
        // Toon error melding op basis van type
        const titel = result.title;
        
        if (result.type === 'duplicate-permanent') {
          const currentLang = localStorage.getItem('language') || 'nl';
          showNotification(`⚠️ "${titel}" ${translations[currentLang].already_permanent}`, 'warning');
        } else if (result.type === 'duplicate-temporary') {
          const currentLang = localStorage.getItem('language') || 'nl';
          showNotification(`⚠️ "${titel}" ${translations[currentLang].already_in_temp_favorites}`, 'warning');
        }
      }
    } else {
      console.error('Geen mural data gevonden voor ID:', muralId);
      console.error('Beschikbare data:', cachedData);
      showNotification('Fout: Kan stripmuur niet vinden. Probeer de pagina te verversen.', 'error');
    }
  }
}

//  Notification systeem 
function showNotification(message, type = 'info') {
  // Verwijder bestaande notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Maak nieuwe notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Styling
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Type-specifieke kleuren
  switch(type) {
    case 'success':
      notification.style.backgroundColor = '#4CAF50';
      break;
    case 'error':
      notification.style.backgroundColor = '#f44336';
      break;
    case 'warning':
      notification.style.backgroundColor = '#FF9800';
      break;
    default:
      notification.style.backgroundColor = '#2196F3';
  }
  
  document.body.appendChild(notification);
  
  // Auto-verwijderen na 4 seconden
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }
  }, 4000);
}

// CSS animaties toevoegen als ze nog niet bestaan
if (!document.querySelector('#notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

function setupViewToggle() {
  const toggle = document.getElementById("viewToggle");
  const titelLijst = document.getElementById("titel-lijst");
  const titelKaart = document.getElementById("titel-kaart");

  if (toggle) {
    toggle.addEventListener("change", () => {
      const isKaart = toggle.checked;

      document.getElementById("parcours-lijst").style.display = isKaart ? "none" : "flex";
      document.getElementById("map-container").style.display = isKaart ? "block" : "none";

      if (titelLijst) titelLijst.style.display = isKaart ? "none" : "block";
      if (titelKaart) titelKaart.style.display = isKaart ? "block" : "none";

      if (isKaart) {
        // Gebruik gefilterde data als beschikbaar, anders cached data
        const dataVoorKaart = (typeof window.filterFuncties !== 'undefined') 
          ? window.filterFuncties.gefilterdeMuren() 
          : cachedData;
        toonKaart(dataVoorKaart, taalSelect.value);
      }
    });

    // Initiële staat instellen
    if (toggle.checked) {
      const dataVoorKaart = (typeof window.filterFuncties !== 'undefined') 
        ? window.filterFuncties.gefilterdeMuren() 
        : cachedData;
      toonKaart(dataVoorKaart, huidigeTaal);
      if (titelLijst) titelLijst.style.display = "none";
      if (titelKaart) titelKaart.style.display = "block";
    } else {
      if (titelLijst) titelLijst.style.display = "block";
      if (titelKaart) titelKaart.style.display = "none";
    }
  }

  // ✅ Toon gebruiker locatie
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        if (map) {
          const gebruikerLat = position.coords.latitude;
          const gebruikerLon = position.coords.longitude;
          L.marker([gebruikerLat, gebruikerLon], {
            icon: L.icon({
              iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
              shadowSize: [41, 41]
            })
          }).addTo(map).bindPopup("Uw locatie");
        }
      },
      function () {
        console.warn("Geolocatie geweigerd of niet beschikbaar.");
      }
    );
  }
}

//  INTERSECTION OBSERVER API - LAZY LOADING 
// IntersectionObserver voor lazy loading van stripmuur afbeeldingen
let imageObserver;

function setupLazyLoading() {
  console.log('🔍 Intersection Observer setup gestart...');
  
  // Maak IntersectionObserver aan
  imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        
        if (src) {
          console.log('📸 Lazy loading afbeelding:', src);
          
          // Voeg fade-in animatie toe
          img.style.opacity = '0';
          img.style.transition = 'opacity 0.3s ease-in-out';
          
          // Laad de afbeelding
          img.src = src;
          img.removeAttribute('data-src');
          
          // Verwijder lazy class en voeg fade-in toe
          img.classList.remove('lazy-load');
          
          img.onload = () => {
            img.style.opacity = '1';
            console.log('✅ Afbeelding geladen en zichtbaar gemaakt');
          };
          
          img.onerror = () => {
            console.error('❌ Fout bij laden afbeelding:', src);
            img.src = 'img/placeholder.jpg'; // Fallback afbeelding
            img.style.opacity = '1';
          };
          
          // Stop observeren van deze afbeelding
          observer.unobserve(img);
        }
      }
    });
  }, {
    // Observer opties
    root: null, // viewport als root
    rootMargin: '50px', // Begin laden 50px voordat het zichtbaar wordt
    threshold: 0.1 // Trigger als 10% van de afbeelding zichtbaar is
  });
  
  console.log('✅ IntersectionObserver succesvol aangemaakt');
}

function observeImages() {
  if (!imageObserver) {
    setupLazyLoading();
  }
  
  // Zoek alle lazy-load afbeeldingen
  const lazyImages = document.querySelectorAll('img[data-src]');
  console.log(`🔍 Gevonden ${lazyImages.length} afbeeldingen voor lazy loading`);
  
  lazyImages.forEach((img, index) => {
    // Voeg lazy-load klasse toe voor styling
    img.classList.add('lazy-load');
    
    // Start observeren
    imageObserver.observe(img);
    console.log(`👁️ Observeren gestart voor afbeelding ${index + 1}:`, img.dataset.src);
  });
}
