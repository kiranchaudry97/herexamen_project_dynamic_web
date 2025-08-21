// Brussels Stripmuren Explorer - Unified Version with Filters
// Combines parcours.js and filter.js functionality

// ========== GLOBALE VARIABELEN ==========
let cachedData = [];
let map;
let markersLayer;

// Brussels Leaflet kaart variabelen
let brusselsMap = null;
let brusselsMarkersLayer = null;

// Filter variabelen
let alleStripmuren = [];
let gefilterdeMuren = [];
let huidigeTaal = "nl";

// Geolocatie variabelen
let gebruikerLocatie = null;
let geolocatieToegekend = false;

// DOM elementen
const taalSelect = document.getElementById("language");
const zoekInput = document.getElementById("zoekInput");
const sortSelect = document.getElementById("sorteerSelect");
const jaarSelect = document.getElementById("filterJaar");
const kunstenaarSelect = document.getElementById("filterKunstenaar");
const afstandSelect = document.getElementById("filterAfstand");
const resetButton = document.getElementById("resetFilters");

// ========== DATA LOADING ==========
async function haalStripmurenOp() {
  try {
    console.log('📡 === BRUSSELS STRIPMUREN API DEBUG ===');
    console.log('🌐 Fetching from: https://bruxellesdata.opendatasoft.com/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=28');
    
    const response = await fetch("https://bruxellesdata.opendatasoft.com/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=28");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 === RAW API RESPONSE ===');
    console.log('Full response object:', data);
    console.log('Response keys:', Object.keys(data));
    console.log('Results array exists:', !!data.results);
    console.log('Results is array:', Array.isArray(data.results));
    console.log('Results length:', data.results?.length);
    
    if (data.results && Array.isArray(data.results)) {
      console.log(`✅ ${data.results.length} stripmuren opgehaald`);
      
      // Process en log de EERSTE 3 items voor debugging
      data.results.slice(0, 3).forEach((item, index) => {
        console.log(`\n=== ITEM ${index + 1} DETAILED ANALYSIS ===`);
        console.log('Complete item:', item);
        console.log('Item keys:', Object.keys(item));
        console.log('Has fields?', !!item.fields);
        console.log('Fields keys:', item.fields ? Object.keys(item.fields) : 'No fields');
        
        const coords = item.fields?.coordonnees_geographiques || item.geometry?.coordinates;
        const title = item.fields?.naam_fresco_nl || item.fields?.nom_de_la_fresque || `Item ${index + 1}`;
        
        console.log('Coordinates found:', coords);
        console.log('Title found:', title);
        
        if (item.fields) {
          console.log('Fields analysis:', {
            naam_fresco_nl: item.fields.naam_fresco_nl,
            nom_de_la_fresque: item.fields.nom_de_la_fresque,
            coordonnees_geographiques: item.fields.coordonnees_geographiques,
            dessinateur: item.fields.dessinateur,
            adres: item.fields.adres,
            adresse: item.fields.adresse
          });
        }
      });
      
      return data.results;
    } else {
      console.error('❌ Onverwacht data formaat:', data);
      return [];
    }
  } catch (error) {
    console.error('❌ === API FETCH ERROR ===');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return [];
  }
}

// ========== GEOLOCATIE FUNCTIONALITEIT ==========
function vraagGeolocatieToegang() {
  console.log('📍 Vraag geolocatie toegang...');
  
  if (!navigator.geolocation) {
    console.warn('⚠️ Geolocatie wordt niet ondersteund door deze browser');
    updateAfstandFilterZichtbaarheid();
    return;
  }

  const opties = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000 // 5 minuten cache
  };

  navigator.geolocation.getCurrentPosition(
    (positie) => {
      gebruikerLocatie = {
        lat: positie.coords.latitude,
        lng: positie.coords.longitude,
        accuracy: positie.coords.accuracy
      };
      
      geolocatieToegekend = true;
      
      console.log('✅ Geolocatie verkregen:', {
        lat: gebruikerLocatie.lat.toFixed(6),
        lng: gebruikerLocatie.lng.toFixed(6),
        accuracy: `${Math.round(gebruikerLocatie.accuracy)}m`
      });
      
      // Controleer of de gebruiker in de buurt van Brussel is
      const afstandTotBrussel = berekenAfstand(
        gebruikerLocatie.lat, 
        gebruikerLocatie.lng, 
        50.8505, 
        4.3488
      );
      
      if (afstandTotBrussel > 50) {
        console.warn(`⚠️ Gebruiker is ${afstandTotBrussel.toFixed(1)}km van Brussel, afstand filter mogelijk minder nuttig`);
      }
      
      updateAfstandFilterZichtbaarheid();
      
      // Herbereken afstanden en update weergave
      if (gefilterdeMuren && gefilterdeMuren.length > 0) {
        filterEnZoek(); // Herfilter om afstanden bij te werken
      }
    },
    (fout) => {
      console.warn('⚠️ Geolocatie fout:', fout.message);
      
      switch(fout.code) {
        case fout.PERMISSION_DENIED:
          console.log('❌ Gebruiker heeft geolocatie geweigerd');
          break;
        case fout.POSITION_UNAVAILABLE:
          console.log('❌ Locatie informatie niet beschikbaar');
          break;
        case fout.TIMEOUT:
          console.log('❌ Geolocatie verzoek timeout');
          break;
        default:
          console.log('❌ Onbekende geolocatie fout');
          break;
      }
      
      geolocatieToegekend = false;
      updateAfstandFilterZichtbaarheid();
    },
    opties
  );
}

function berekenAfstand(lat1, lng1, lat2, lng2) {
  // Haversine formule voor afstand berekening in kilometers
  const R = 6371; // Aardradius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const afstand = R * c;
  
  return afstand;
}

function getAfstandVoorStripmuur(muur) {
  if (!gebruikerLocatie || !geolocatieToegekend) {
    return null;
  }
  
  const fields = muur.fields || muur;
  
  // Zoek coördinaten in verschillende formaten
  let lat = null, lng = null;
  
  // First try geo_point (new API format)
  if (fields.geo_point) {
    if (fields.geo_point.lat && fields.geo_point.lon) {
      lat = parseFloat(fields.geo_point.lat);
      lng = parseFloat(fields.geo_point.lon);
    }
  }
  // Fallback to coordonnees_geographiques (old format)
  else if (fields.coordonnees_geographiques) {
    const coords = fields.coordonnees_geographiques;
    if (coords.lat && coords.lon) {
      lat = parseFloat(coords.lat);
      lng = parseFloat(coords.lon);
    }
  }
  
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return null;
  }
  
  const userLat = gebruikerLocatie.latitude !== undefined ? gebruikerLocatie.latitude : gebruikerLocatie.lat;
  const userLng = gebruikerLocatie.longitude !== undefined ? gebruikerLocatie.longitude : gebruikerLocatie.lng;
  
  return berekenAfstand(userLat, userLng, lat, lng);
}

function updateAfstandFilterZichtbaarheid() {
  if (!afstandSelect) {
    console.warn('⚠️ Afstand select element niet gevonden');
    return;
  }
  
  // Update afstand filter dropdown
  if (geolocatieToegekend && gebruikerLocatie) {
    afstandSelect.style.display = 'inline-block';
    afstandSelect.disabled = false;
    console.log('✅ Afstand filter zichtbaar gemaakt');
  } else {
    afstandSelect.style.display = 'none';
    afstandSelect.disabled = true;
    afstandSelect.value = ""; // Reset waarde
    console.log('❌ Afstand filter verborgen');
  }
  
  // Update sorteer afstand optie
  if (sortSelect) {
    const afstandOptie = sortSelect.querySelector('option[value="afstand"]');
    if (afstandOptie) {
      if (geolocatieToegekend && gebruikerLocatie) {
        afstandOptie.style.display = 'block';
        afstandOptie.disabled = false;
      } else {
        afstandOptie.style.display = 'none';
        afstandOptie.disabled = true;
        // Reset naar alfabetisch als afstand was geselecteerd
        if (sortSelect.value === 'afstand') {
          sortSelect.value = 'az';
          filterEnZoek(); // Herfilter
        }
      }
    }
  }
}

// Maak geolocatie manager globaal beschikbaar
window.geolocatieManager = {
  gebruikerLocatie: () => gebruikerLocatie,
  geolocatieToegekend: () => geolocatieToegekend,
  getAfstandVoorStripmuur: getAfstandVoorStripmuur,
  vraagGeolocatieToegang: vraagGeolocatieToegang,
  updateAfstandFilterZichtbaarheid: updateAfstandFilterZichtbaarheid
};

// ========== DISPLAY FUNCTIONS ==========
function toonStripmuren(data, taal = "nl") {
  console.log('🎨 Toon stripmuren:', data.length, 'items');
  const container = document.getElementById("parcours-lijst");
  if (!container) {
    console.error('❌ Container niet gevonden!');
    return;
  }

  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <h3>${taal === 'fr' ? 'Aucun résultat trouvé' : 'Geen resultaten gevonden'}</h3>
        <p>${taal === 'fr' ? 'Essayez de modifier vos filtres' : 'Probeer je filters aan te passen'}</p>
      </div>
    `;
    return;
  }

  data.forEach((muur, index) => {
    // Support voor Brussels Open Data format
    const fields = muur.fields || muur;
    
    const titel_nl = fields.naam_fresco_nl || muur.naam_fresco_nl || '';
    const titel_fr = fields.nom_de_la_fresque || muur.nom_de_la_fresque || '';
    const beschrijving_nl = fields.description_nl || fields.info_nl || fields.omschrijving || fields.beschrijving || muur.description_nl || muur.info_nl || '';
    const beschrijving_fr = fields.description_fr || fields.info_fr || fields.description || muur.description_fr || muur.info_fr || '';
    const tekenaar = fields.dessinateur || muur.dessinateur || "Onbekend";
    
    // Get the correct address based on language
    const adresNL = fields.adres_nl || fields.adres || muur.adres || "Adres niet beschikbaar";
    const adresFR = fields.adresse_fr || fields.adresse || muur.adresse || "Adresse non disponible";
    const adres = taal === 'nl' ? adresNL : adresFR;
    
    const jaar = fields.date || muur.date || "Onbekend";
    
    // Get the proper site link
    const linkNL = fields.link_site_striproute || "#";
    const linkFR = fields.lien_site_parcours_bd || "#";
    const link = taal === 'nl' ? linkNL : linkFR;
    
    // Get extra details
    const uitgever = fields.maison_d_edition || '';
    const realisator = fields.realisateur || '';
    const oppervlakte = fields.surface_m2 ? `${fields.surface_m2} m²` : '';
    
    // Probeer verschillende afbeelding velden uit de Brussels Open Data API
    // Use the extractImageUrl utility function
    const afbeelding = window.extractImageUrl ? window.extractImageUrl(fields) : "img/placeholder.jpg";

    // Bepaal coördinaten voor Google Maps button
    let lat = null, lng = null;
    
    // First try geo_point (new API format)
    if (fields.geo_point) {
      if (fields.geo_point.lat && fields.geo_point.lon) {
        lat = parseFloat(fields.geo_point.lat);
        lng = parseFloat(fields.geo_point.lon);
      }
    }
    // Fallback to coordonnees_geographiques (old format)
    else if (fields.coordonnees_geographiques) {
      const coords = fields.coordonnees_geographiques;
      if (coords.lat && coords.lon) {
        lat = parseFloat(coords.lat);
        lng = parseFloat(coords.lon);
      }
    }

    // Use Google Maps link from API if available, otherwise generate it
    const googleMapsLink = fields.google_maps || (lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null);
    const googleStreetViewLink = fields.google_street_view || null;

    // Bereken afstand als geolocatie beschikbaar is
    let afstandText = '';
    if (geolocatieToegekend && gebruikerLocatie && lat && lng) {
      const afstand = getAfstandVoorStripmuur(muur);
      if (afstand !== null) {
        if (afstand < 1) {
          afstandText = `<p class="afstand-info"><strong>📍 ${taal === 'fr' ? 'Distance' : 'Afstand'}:</strong> ${Math.round(afstand * 1000)}m ${taal === 'fr' ? 'de vous' : 'van jou'}</p>`;
        } else {
          afstandText = `<p class="afstand-info"><strong>📍 ${taal === 'fr' ? 'Distance' : 'Afstand'}:</strong> ${afstand.toFixed(1)}km ${taal === 'fr' ? 'de vous' : 'van jou'}</p>`;
        }
      }
    }

    // Bepaal favoriet button status
    const muralId = muur.id || index + 1;
    let favorietButtonHtml = '';
    
    if (typeof favorietenManager !== 'undefined') {
      const isPermanent = favorietenManager.favorieten?.some(fav => fav.id === muralId) || false;
      const tijdelijke = favorietenManager.getTijdelijkeFavorieten?.() || [];
      const isTijdelijk = tijdelijke.some(fav => fav.id === muralId);
      
      if (isPermanent) {
        favorietButtonHtml = `
          <button class="favoriet-button" data-id="${muralId}" style="background-color: #4caf50;" disabled>
            ⭐ ${taal === 'fr' ? 'Sauvegardé' : 'Opgeslagen'}
          </button>
        `;
      } else if (isTijdelijk) {
        favorietButtonHtml = `
          <button class="favoriet-button" data-id="${muralId}" style="background-color: #ff9800;" disabled>
            🟡 ${taal === 'fr' ? 'Temporaire' : 'Tijdelijk'}
          </button>
        `;
      } else {
        favorietButtonHtml = `
          <button class="favoriet-button" data-id="${muralId}">
            🌟 ${taal === 'fr' ? 'Ajouter aux favoris' : 'Voeg toe aan favorieten'}
          </button>
        `;
      }
    } else {
      // Fallback als favorietenManager niet beschikbaar is
      favorietButtonHtml = `
        <button class="favoriet-button" data-id="${muralId}">
          ⭐ ${taal === 'fr' ? 'Ajouter aux favoris' : 'Voeg toe aan favorieten'}
        </button>
      `;
    }

    const muurElement = document.createElement("div");
    muurElement.className = "muur-kaart";
    muurElement.innerHTML = `
      <img src="${afbeelding}" 
           alt="${titel_nl || titel_fr}" 
           loading="lazy" 
           onload="this.classList.add('loaded')" 
           style="opacity: 0; transition: opacity 0.5s ease;"
           onerror="this.src='img/placeholder.jpg'; this.onerror=null; setTimeout(() => { this.style.opacity = '1'; }, 100);" />
      <h3>${taal === 'nl' ? titel_nl : titel_fr}</h3>
      ${titel_nl && titel_fr && titel_nl !== titel_fr ? `<p class="sub-title">${taal === 'nl' ? titel_fr : titel_nl}</p>` : ''}
      <p><strong>${taal === 'fr' ? 'Artiste' : 'Kunstenaar'}:</strong> ${tekenaar}</p>
      ${uitgever ? `<p><strong>${taal === 'fr' ? 'Éditeur' : 'Uitgeverij'}:</strong> ${uitgever}</p>` : ''}
      <p><strong>${taal === 'fr' ? 'Adresse' : 'Adres'}:</strong> ${adres}</p>
      <p><strong>${taal === 'fr' ? 'Année' : 'Jaar'}:</strong> ${jaar}</p>
      ${oppervlakte ? `<p><strong>${taal === 'fr' ? 'Surface' : 'Oppervlakte'}:</strong> ${oppervlakte}</p>` : ''}
      ${realisator ? `<p><strong>${taal === 'fr' ? 'Réalisation' : 'Realisatie'}:</strong> ${realisator}</p>` : ''}
      ${afstandText}
      ${beschrijving_nl || beschrijving_fr ? 
        `<div class="description">
          <p class="description-title"><strong>${taal === 'fr' ? translations.fr.aboutArtwork : translations.nl.aboutArtwork}</strong></p>
          ${beschrijving_nl ? `<div class="description-text nl"><strong>NL:</strong> ${beschrijving_nl}</div>` : ''}
          ${beschrijving_fr ? `<div class="description-text fr"><strong>FR:</strong> ${beschrijving_fr}</div>` : ''}
          ${!beschrijving_nl && !beschrijving_fr ? `<p class="no-description">${taal === 'fr' ? translations.fr.noDescription : translations.nl.noDescription}</p>` : ''}
         </div>` : ''}
      
      <div class="kaart-acties">
        ${link !== "#" ? `<a href="${link}" target="_blank" class="meer-info-btn">ℹ️ ${taal === 'fr' ? 'Plus d\'info' : 'Meer info'}</a>` : ''}
        ${googleMapsLink ? `<a href="${googleMapsLink}" target="_blank" class="google-maps-btn">🗺️ ${taal === 'fr' ? 'Google Maps' : 'Google Maps'}</a>` : ''}
        ${favorietButtonHtml}
      </div>
    `;

    container.appendChild(muurElement);
  });

  console.log('✅ Stripmuren weergegeven');
  
  // Start lazy loading voor afbeeldingen
  setTimeout(() => {
    observeImages();
  }, 200);
}

// ========== FILTER FUNCTIONS ==========
function vulFilterOpties(data) {
  console.log('🔧 Vul filter opties met data:', data.length, 'items');
  
  if (!jaarSelect || !kunstenaarSelect) {
    console.error('❌ Filter selecties niet gevonden!');
    return;
  }
  
  // Jaren verzamelen - Brussels Open Data format
  const jaren = [...new Set(data.map(muur => {
    const fields = muur.fields || muur;
    return fields.date;
  }).filter(jaar => jaar))].sort();
  
  console.log('📅 Gevonden jaren:', jaren);
  
  jaarSelect.innerHTML = huidigeTaal === 'fr' ? '<option value="">Toutes les années</option>' : '<option value="">Alle jaren</option>';
  jaren.forEach(jaar => {
    const option = document.createElement("option");
    option.value = jaar;
    option.textContent = jaar;
    jaarSelect.appendChild(option);
  });

  // Kunstenaars verzamelen - Brussels Open Data format
  const kunstenaars = [...new Set(data.map(muur => {
    const fields = muur.fields || muur;
    return fields.dessinateur;
  }).filter(kunstenaar => kunstenaar))].sort();
  
  console.log('👨‍🎨 Gevonden kunstenaars:', kunstenaars);
  
  kunstenaarSelect.innerHTML = huidigeTaal === 'fr' ? '<option value="">Tous les artistes</option>' : '<option value="">Alle kunstenaars</option>';
  kunstenaars.forEach(kunstenaar => {
    const option = document.createElement("option");
    option.value = kunstenaar;
    option.textContent = kunstenaar;
    kunstenaarSelect.appendChild(option);
  });
}

function filterEnZoek() {
  const zoekterm = zoekInput ? zoekInput.value.toLowerCase() : "";
  const geselecteerdJaar = jaarSelect ? jaarSelect.value : "";
  const geselecteerdeKunstenaar = kunstenaarSelect ? kunstenaarSelect.value : "";
  const geselecteerdeAfstand = afstandSelect ? afstandSelect.value : "";

  gefilterdeMuren = alleStripmuren.filter(muur => {
    // Brussels Open Data format support
    const fields = muur.fields || muur;
    
    const naam_nl = (fields.naam_fresco_nl || "").toLowerCase();
    const naam_fr = (fields.nom_de_la_fresque || "").toLowerCase();
    const kunstenaar = (fields.dessinateur || "").toLowerCase();
    const jaar = fields.date || "";
    const beschrijving_nl = (fields.description_nl || fields.info_nl || "").toLowerCase();
    const beschrijving_fr = (fields.description_fr || fields.info_fr || "").toLowerCase();

    // Zoekfilter - zoek in beide talen
    const voldoetAanZoek = !zoekterm || 
      naam_nl.includes(zoekterm) || 
      naam_fr.includes(zoekterm) ||
      kunstenaar.includes(zoekterm) || 
      jaar.includes(zoekterm) ||
      beschrijving_nl.includes(zoekterm) ||
      beschrijving_fr.includes(zoekterm);

    // Jaarfilter
    const voldoetAanJaar = !geselecteerdJaar || jaar === geselecteerdJaar;

    // Kunstenaarfilter
    const voldoetAanKunstenaar = !geselecteerdeKunstenaar || fields.dessinateur === geselecteerdeKunstenaar;

    // Afstandfilter (alleen als geolocatie beschikbaar is)
    let voldoetAanAfstand = true;
    if (geselecteerdeAfstand && geolocatieToegekend && gebruikerLocatie) {
      const afstand = getAfstandVoorStripmuur(muur);
      
      if (afstand !== null) {
        switch(geselecteerdeAfstand) {
          case "0-0.5":
            voldoetAanAfstand = afstand <= 0.5;
            break;
          case "0.5-1":
            voldoetAanAfstand = afstand > 0.5 && afstand <= 1;
            break;
          case "1-2":
            voldoetAanAfstand = afstand > 1 && afstand <= 2;
            break;
          case "2-5":
            voldoetAanAfstand = afstand > 2 && afstand <= 5;
            break;
          case "5+":
            voldoetAanAfstand = afstand > 5;
            break;
          default:
            voldoetAanAfstand = true;
        }
      } else {
        voldoetAanAfstand = false;
      }
    }

    return voldoetAanZoek && voldoetAanJaar && voldoetAanKunstenaar && voldoetAanAfstand;
  });

  sorteerMuren();
  toonStripmuren(gefilterdeMuren, huidigeTaal);
  
  // Update kaart met gefilterde resultaten
  console.log('🗺️ Filter toegepast, update kaart met', gefilterdeMuren.length, 'resultaten');
  updateKaart();
}

function sorteerMuren() {
  if (!sortSelect) return;
  
  const sorteerWaarde = sortSelect.value;

  gefilterdeMuren.sort((a, b) => {
    // Brussels Open Data format support
    const fieldsA = a.fields || a;
    const fieldsB = b.fields || b;
    
    const naamA = fieldsA.naam_fresco_nl || fieldsA.nom_de_la_fresque || "Naam onbekend";
    const naamB = fieldsB.naam_fresco_nl || fieldsB.nom_de_la_fresque || "Naam onbekend";
    const jaarA = parseInt(fieldsA.date) || 0;
    const jaarB = parseInt(fieldsB.date) || 0;

    switch (sorteerWaarde) {
      case "za":
        return naamB.localeCompare(naamA);
      case "jaar_op":
        return jaarA - jaarB;
      case "jaar_af":
        return jaarB - jaarA;
      case "afstand":
        if (geolocatieToegekend && gebruikerLocatie) {
          const afstandA = getAfstandVoorStripmuur(a);
          const afstandB = getAfstandVoorStripmuur(b);
          
          if (afstandA === null && afstandB === null) return 0;
          if (afstandA === null) return 1;
          if (afstandB === null) return -1;
          
          return afstandA - afstandB;
        }
        return naamA.localeCompare(naamB);
      case "az":
      default:
        return naamA.localeCompare(naamB);
    }
  });
}

function resetFilters() {
  if (zoekInput) zoekInput.value = "";
  if (sortSelect) sortSelect.value = "az";
  if (jaarSelect) jaarSelect.value = "";
  if (kunstenaarSelect) kunstenaarSelect.value = "";
  if (afstandSelect) afstandSelect.value = "";
  
  gefilterdeMuren = [...alleStripmuren];
  sorteerMuren();
  toonStripmuren(gefilterdeMuren, huidigeTaal);
  updateKaart();
}

function wijzigTaal(nieuweTaal) {
  huidigeTaal = nieuweTaal;
  filterEnZoek(); // Herfilter met nieuwe taal
}

// ========== BRUSSELS LEAFLET MAP ==========
function initBrusselsLeafletMap() {
  console.log('🗺️ Initialiseer Brussels Leaflet kaart...');
  
  const mapDiv = document.getElementById('map');
  if (!mapDiv) {
    console.error('❌ Map div niet gevonden');
    return null;
  }
  
  // Clear bestaande map
  if (brusselsMap) {
    brusselsMap.remove();
    brusselsMap = null;
  }
  
  try {
    // Maak Brussels Leaflet kaart
    brusselsMap = L.map('map').setView([50.8505, 4.3488], 12);
    
    // Voeg OpenStreetMap tile layer toe
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | Brussels Explorer',
      maxZoom: 18,
      minZoom: 10
    }).addTo(brusselsMap);
    
    // Maak markers layer
    brusselsMarkersLayer = L.layerGroup().addTo(brusselsMap);
    
    // Force map size herberekening
    setTimeout(() => {
      if (brusselsMap) {
        brusselsMap.invalidateSize();
        
        // Extra invalidateSize na timeout voor responsive sizing
        setTimeout(() => {
          if (brusselsMap) {
            brusselsMap.invalidateSize();
            console.log('✅ Map size opnieuw gevalideerd');
          }
        }, 500);
        
        console.log('✅ Brussels Leaflet kaart geïnitialiseerd - klaar voor markers');
      }
    }, 300);
    
    return brusselsMap;
    
  } catch (error) {
    console.error('❌ Fout bij initialiseren kaart:', error);
    return null;
  }
}

function toonBrusselsStripmurenOpLeaflet(data) {
  console.log('🗺️ === BRUSSELS STRIPMUREN OP LEAFLET DEBUG ===');
  console.log('📊 Input data:', data);
  console.log('📊 Data length:', data?.length);
  console.log('🗺️ Brussels map object:', brusselsMap);
  console.log('📍 Brussels markers layer:', brusselsMarkersLayer);
  
  if (!brusselsMap || !brusselsMarkersLayer) {
    console.error('❌ Brussels Leaflet kaart niet geïnitialiseerd!');
    return;
  }
  
  // Clear existing markers
  brusselsMarkersLayer.clearLayers();
  console.log('🧹 Bestaande markers gecleared');
  
  let validMarkers = 0;
  
  console.log('🔄 Starting marker creation loop...');
  
  data.forEach((muur, index) => {
    console.log(`\n--- Processing item ${index + 1}/${data.length} ---`);
    console.log('Raw muur data:', muur);
    
    const fields = muur.fields || muur;
    console.log('Fields object:', fields);
    
    const titel_nl = fields.naam_fresco_nl || muur.naam_fresco_nl || '';
    const titel_fr = fields.nom_de_la_fresque || muur.nom_de_la_fresque || '';
    const kunstenaar = fields.dessinateur || muur.dessinateur || "Onbekend";
    const adres = fields.adres || fields.adresse || muur.adres || muur.adresse || '';
    const jaar = fields.date || muur.date || '';
    const beschrijving_nl = fields.description_nl || fields.info_nl || fields.omschrijving || fields.beschrijving || '';
    const beschrijving_fr = fields.description_fr || fields.info_fr || fields.description || '';
    const link = fields.link_site_striproute || fields.lien_site_parcours_bd || muur.link_site_striproute || muur.lien_site_parcours_bd || '#';
    
    // Extract image URL from API data
    // Use the extractImageUrl utility function
    const afbeelding = window.extractImageUrl ? window.extractImageUrl(fields) : "img/placeholder.jpg";
    
    console.log('Extracted data:', {
      titel_nl, titel_fr, kunstenaar, adres, jaar
    });
    
    // Coordinates handling
    let lat = null, lng = null;
    
    console.log('Checking for geo coordinates...');
    
    // First try geo_point (new API format)
    if (fields.geo_point) {
      console.log('Geo_point found:', fields.geo_point);
      if (fields.geo_point.lat && fields.geo_point.lon) {
        lat = parseFloat(fields.geo_point.lat);
        lng = parseFloat(fields.geo_point.lon);
        console.log(`✅ Coordinates found in geo_point: [${lat}, ${lng}]`);
      }
    } 
    // Fallback to coordonnees_geographiques (old format)
    else if (fields.coordonnees_geographiques) {
      const coords = fields.coordonnees_geographiques;
      console.log('Coordinates object (fallback):', coords);
      if (coords.lat && coords.lon) {
        lat = parseFloat(coords.lat);
        lng = parseFloat(coords.lon);
        console.log(`✅ Coordinates found in coordonnees_geographiques: [${lat}, ${lng}]`);
      } else {
        console.warn('❌ No lat/lon in coordinates object');
      }
    } else {
      console.warn('❌ No geo coordinates fields found');
    }
    
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      // Valideer Brussels coördinaten (ruimer bereik voor meer stripmuren)
      if (lat >= 50.6 && lat <= 51.0 && lng >= 4.0 && lng <= 4.8) {
        
        // Maak unieke ID voor favoriet functionaliteit
        const muralId = muur.id || index + 1;
        
        // Bepaal favoriet button status
        let favorietButtonHtml = '';
        if (typeof favorietenManager !== 'undefined') {
          const isPermanent = favorietenManager.favorieten?.some(fav => fav.id === muralId) || false;
          const tijdelijke = favorietenManager.getTijdelijkeFavorieten?.() || [];
          const isTijdelijk = tijdelijke.some(fav => fav.id === muralId);
          
          if (isPermanent) {
            favorietButtonHtml = `
              <button class="favoriet-button popup-favoriet" data-id="${muralId}" style="background-color: #4caf50; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; margin-top: 8px; width: 100%;" disabled>
                ⭐ ${huidigeTaal === 'fr' ? 'Sauvegardé' : 'Opgeslagen'}
              </button>
            `;
          } else if (isTijdelijk) {
            favorietButtonHtml = `
              <button class="favoriet-button popup-favoriet" data-id="${muralId}" style="background-color: #ff9800; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; margin-top: 8px; width: 100%;" disabled>
                🟡 ${huidigeTaal === 'fr' ? 'Temporaire' : 'Tijdelijk'}
              </button>
            `;
          } else {
            favorietButtonHtml = `
              <button class="favoriet-button popup-favoriet" data-id="${muralId}" style="background-color: #3498db; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; margin-top: 8px; width: 100%;">
                🌟 ${huidigeTaal === 'fr' ? 'Ajouter aux favoris' : 'Voeg toe aan favorieten'}
              </button>
            `;
          }
        } else {
          favorietButtonHtml = `
            <button class="favoriet-button popup-favoriet" data-id="${muralId}" style="background-color: #3498db; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; margin-top: 8px; width: 100%;">
              🌟 ${huidigeTaal === 'fr' ? 'Ajouter aux favoris' : 'Voeg toe aan favorieten'}
            </button>
          `;
        }
        
        // Bereken afstand tussen gebruiker en de stripmuur
        let afstandHTML = '';
        if (geolocatieToegekend && gebruikerLocatie) {
          const afstand = berekenAfstand(
            gebruikerLocatie.latitude, 
            gebruikerLocatie.longitude, 
            lat, 
            lng
          );
          
          if (afstand !== null) {
            const afstandFormatted = afstand < 1 
              ? `${Math.round(afstand * 1000)} m` 
              : `${afstand.toFixed(1)} km`;
            afstandHTML = `<span>🚶 Afstand: <b>${afstandFormatted}</b></span><br>`;
          }
        }
        
        // Use Google Maps link from API if available, otherwise generate it
        const googleMapsLink = fields.google_maps || `https://www.google.com/maps?q=${lat},${lng}`;
        const googleStreetViewLink = fields.google_street_view || null;
        
        // Get the correct address based on language
        const displayAdres = huidigeTaal === 'fr' 
            ? (fields.adresse_fr || adres)
            : (fields.adres_nl || adres);
            
        // Get the proper site link
        const siteLink = huidigeTaal === 'fr' 
            ? (fields.lien_site_parcours_bd || link)
            : (fields.link_site_striproute || link);
            
        // Get extra details
        const uitgever = fields.maison_d_edition || '';
        const realisator = fields.realisateur || '';
        const oppervlakte = fields.surface_m2 ? `${fields.surface_m2} m²` : '';
        
        // Popup content met afbeelding, afstand en favoriet knop - Updated
        let popupHtml = `
          <div style="text-align: center; margin-bottom: 10px;">
            <img src="${afbeelding}" 
                 alt="${titel_nl || titel_fr}" 
                 style="max-width: 200px; max-height: 150px; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"
                 onerror="this.onerror=null; this.src='img/placeholder.jpg';" />
          </div>
          <div style="margin-bottom: 8px;">
            <strong>${titel_nl ? `<div><b>NL:</b> ${titel_nl}</div>` : ''}
            ${titel_fr ? `<div><b>FR:</b> ${titel_fr}</div>` : ''}</strong>
          </div>
          <span>👨‍🎨 ${translations[huidigeTaal].popup_artist}: ${kunstenaar}</span><br>
          ${uitgever ? `<span>📚 ${translations[huidigeTaal].popup_publisher}: ${uitgever}</span><br>` : ''}
          <span>📍 ${translations[huidigeTaal].popup_address}: ${displayAdres}</span><br>
          <span>📅 ${translations[huidigeTaal].popup_year}: ${jaar}</span><br>
          ${oppervlakte ? `<span>📏 ${translations[huidigeTaal].popup_area}: ${oppervlakte}</span><br>` : ''}
          ${realisator ? `<span>🔨 ${translations[huidigeTaal].popup_realization}: ${realisator}</span><br>` : ''}
          ${afstandHTML}
          ${beschrijving_nl || beschrijving_fr ? `<div style="margin-top: 5px; border-top: 1px solid #eee; padding-top: 5px;"><b>${huidigeTaal === 'fr' ? 'Description de cette œuvre d\'art' : 'Informatie over dit kunstwerk'}</b></div>` : ''}
          ${beschrijving_nl ? `<div style="margin-top: 5px;"><b>NL:</b> ${beschrijving_nl}</div>` : ''}
          ${beschrijving_fr ? `<div style="margin-top: 5px;"><b>FR:</b> ${beschrijving_fr}</div>` : ''}
          <div style="margin-top: 8px;">
            <a href="${googleMapsLink}" target="_blank" style="margin-right: 10px;">🗺️ Google Maps</a>
          </div>
          ${siteLink && siteLink !== "#" ? `<div style="margin-top: 5px;"><a href="${siteLink}" target="_blank">➕ ${translations[huidigeTaal].popup_more_info}</a></div>` : ''}
          ${favorietButtonHtml}
        `;
        
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'brussels-strip-marker',
            html: `<div style="
              background: linear-gradient(135deg, #3498db, #2980b9); 
              border: 3px solid white; 
              border-radius: 50%; 
              width: 28px; 
              height: 28px; 
              box-shadow: 0 3px 8px rgba(52,152,219,0.6); 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-size: 16px;
              cursor: pointer;
              transition: all 0.2s ease;
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">🎨</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          })
        });
        
        // Voeg marker toe aan layer in plaats van direct aan map
        marker.bindPopup(popupHtml, {
          className: 'brussels-leaflet-popup',
          maxWidth: 300
        });
        brusselsMarkersLayer.addLayer(marker);
        validMarkers++;
        
        console.log(`📍 Marker ${validMarkers}: ${titel_nl || titel_fr} toegevoegd op [${lat}, ${lng}]`);
      } else {
        console.warn(`⚠️ Coördinaten buiten Brussels bereik: [${lat}, ${lng}] voor ${titel_nl || titel_fr}`);
      }
    } else {
      console.warn(`⚠️ Geen geldige coördinaten voor: ${titel_nl || titel_fr}`, { coords: fields.coordonnees_geographiques });
    }
  });
  
  console.log(`✅ ${validMarkers} van ${data.length} stripmuren markers toegevoegd aan Brussels Leaflet kaart`);
  
  // Debug: Controleer of er markers in de layer zitten
  console.log('🔍 Markers in layer:', brusselsMarkersLayer.getLayers().length);
  console.log('🔍 Layer contents:', brusselsMarkersLayer.getLayers());
  
  // Test: Voeg een eenvoudige test marker toe als debugging
  if (validMarkers === 0) {
    console.log('⚠️ Geen markers gevonden, voeg test marker toe');
    const testMarker = L.marker([50.8505, 4.3488]).bindPopup('🧪 Test - Geen echte data gevonden');
    brusselsMarkersLayer.addLayer(testMarker);
  }
  
  // Pas kaart zoom aan om alle markers te tonen als er markers zijn
  if (validMarkers > 0 && brusselsMarkersLayer.getLayers().length > 0) {
    try {
      setTimeout(() => {
        const group = new L.featureGroup(brusselsMarkersLayer.getLayers());
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          brusselsMap.fitBounds(bounds.pad(0.1));
          console.log('🔍 Kaart ingezoomd op alle markers');
        }
      }, 300);
    } catch (error) {
      console.warn('⚠️ Kon niet automatisch inzoomen op markers:', error);
    }
  } else {
    // Als geen markers, zoom naar Brussels centrum
    brusselsMap.setView([50.8505, 4.3488], 12);
    console.log('🗺️ Geen markers gevonden, zoom naar Brussels centrum');
  }
}

function updateKaart() {
  // Controleer of kaart functionaliteit beschikbaar is
  const isKaartZichtbaar = document.getElementById("viewToggle")?.checked;
  if (isKaartZichtbaar && brusselsMap && brusselsMarkersLayer) {
    console.log('🗺️ Update kaart met gefilterde stripmuren:', gefilterdeMuren.length, 'items');
    
    // Toon gefilterde stripmuren op de kaart
    if (gefilterdeMuren && gefilterdeMuren.length > 0) {
      toonBrusselsStripmurenOpLeaflet(gefilterdeMuren);
    } else {
      // Als geen gefilterde resultaten, toon alle stripmuren
      console.log('🗺️ Geen gefilterde resultaten, toon alle stripmuren');
      toonBrusselsStripmurenOpLeaflet(alleStripmuren);
    }
  }
}

// ========== VIEW TOGGLE ==========
function setupViewToggle() {
  console.log('🔧 Setup view toggle...');
  
  const toggle = document.getElementById("viewToggle");
  const titelLijst = document.getElementById("titel-lijst");
  const titelKaart = document.getElementById("titel-kaart");
  const parcoursLijst = document.getElementById("parcours-lijst");
  const mapContainer = document.getElementById("map-container");
  const viewLabel = document.getElementById("viewLabel");

  if (!toggle || !parcoursLijst || !mapContainer) {
    console.error('❌ Toggle elementen niet gevonden!');
    return;
  }

  // Functie om label bij te werken
  const updateViewLabel = (isKaart) => {
    if (viewLabel) {
      if (isKaart) {
        viewLabel.textContent = huidigeTaal === 'fr' ? "🗺️ Vue carte" : "🗺️ Kaart weergave";
      } else {
        viewLabel.textContent = huidigeTaal === 'fr' ? "📋 Vue liste" : "📋 Lijst weergave";
      }
    }
  };
  
  // Zet initiële staat op lijst weergave
  parcoursLijst.style.display = "grid";
  mapContainer.style.display = "none";
  if (titelLijst) titelLijst.style.display = "block";
  if (titelKaart) titelKaart.style.display = "none";
  updateViewLabel(false);
  
  // Voeg event listener toe
  toggle.addEventListener("change", function(event) {
    const isKaart = toggle.checked;
    console.log('🔄 View toggle gewijzigd naar:', isKaart ? 'KAART' : 'LIJST');
    
    updateViewLabel(isKaart);

    if (isKaart) {
      // Verberg lijst
      parcoursLijst.style.display = "none";
      
      // Toon kaart
      mapContainer.style.display = "block";
      
      // Update titels
      if (titelLijst) titelLijst.style.display = "none";
      if (titelKaart) titelKaart.style.display = "block";
      
      // Forceer Brussels Leaflet kaart weergave - DIRECT zonder loading message
      setTimeout(async () => {
        console.log('🗺️ Start kaart initialisatie...');
        
        try {
          const brusselsMapResult = initBrusselsLeafletMap();
          
          if (brusselsMapResult) {
            console.log('✅ Brussels Leaflet kaart geïnitialiseerd');
            
            // Voeg window resize event listener toe voor responsive kaart
            window.addEventListener('resize', () => {
              if (brusselsMap) {
                setTimeout(() => {
                  brusselsMap.invalidateSize();
                }, 100);
              }
            });
            
            // Toon altijd alle stripmuren op de kaart, ook zonder filter
            console.log('🔍 Debug info voor kaart markers:');
            console.log('- gefilterdeMuren length:', gefilterdeMuren?.length || 0);
            console.log('- alleStripmuren length:', alleStripmuren?.length || 0);
            console.log('- gefilterdeMuren eerste item:', gefilterdeMuren?.[0]);
            console.log('- alleStripmuren eerste item:', alleStripmuren?.[0]);
            
            if (gefilterdeMuren && gefilterdeMuren.length > 0) {
              console.log('✅ Gebruiker gefilterdeMuren voor kaart');
              toonBrusselsStripmurenOpLeaflet(gefilterdeMuren);
              console.log('✅ Brussels stripmuren markers toegevoegd:', gefilterdeMuren.length, 'items');
            } else if (alleStripmuren && alleStripmuren.length > 0) {
              // Fallback: toon alle stripmuren als gefilterde lijst leeg is
              console.log('✅ Gebruiker alleStripmuren voor kaart (fallback)');
              toonBrusselsStripmurenOpLeaflet(alleStripmuren);
              console.log('✅ Alle Brussels stripmuren markers toegevoegd:', alleStripmuren.length, 'items');
            } else {
              console.warn('⚠️ Geen stripmuren data beschikbaar voor kaart');
              // Emergency fallback - probeer data opnieuw op te halen
              console.log('🔄 Probeer data opnieuw op te halen...');
              try {
                const noodData = await haalStripmurenOp();
                if (noodData && noodData.length > 0) {
                  console.log('✅ Nood data opgehaald:', noodData.length);
                  toonBrusselsStripmurenOpLeaflet(noodData);
                } else {
                  console.error('❌ Ook nood data ophalen mislukt');
                }
              } catch (e) {
                console.error('❌ Fout bij nood data ophalen:', e);
              }
            }
          } else {
            console.error('❌ Kaart kon niet worden geïnitialiseerd');
          }
        } catch (error) {
          console.error('❌ Fout bij laden Brussels kaart:', error);
        }
      }, 100);
      
    } else {
      // Toon lijst
      console.log('📋 === SCHAKEL NAAR LIJST MODUS ===');
      parcoursLijst.style.display = "grid";
      mapContainer.style.display = "none";
      
      // Update titels
      if (titelLijst) titelLijst.style.display = "block";
      if (titelKaart) titelKaart.style.display = "none";
    }
  });
  
  console.log("✅ View toggle setup voltooid");
}

// ========== FAVORIET FUNCTIONALITY ==========
function setupFavorietenEventListeners() {
  console.log('🎯 Setup favorieten event listeners...');
  
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('favoriet-button')) {
      console.log('🌟 FAVORIET KNOP GEKLIKT!');
      e.preventDefault();
      e.stopImmediatePropagation();
      
      const muralId = parseInt(e.target.dataset.id);
      console.log('🔍 Favoriet ID:', muralId);
      
      // Zoek de stripmuur data
      const stripmuurData = getStripmuurById(muralId);
      if (!stripmuurData) {
        console.error('❌ Stripmuur data niet gevonden voor ID:', muralId);
        return;
      }
      
      // Gebruik de favorietenManager als die beschikbaar is
      if (typeof favorietenManager !== 'undefined') {
        const result = favorietenManager.voegFavorietToe(stripmuurData);
        
        if (result.success) {
          if (result.type === 'temporary') {
            e.target.innerHTML = `🟡 ${huidigeTaal === 'fr' ? 'Temporaire' : 'Tijdelijk'}`;
            e.target.style.backgroundColor = '#ff9800';
            e.target.disabled = true;
            
            // Toon bericht over tijdelijke opslag
            setTimeout(() => {
              const bevestiging = confirm(
                huidigeTaal === 'fr' ? 
                `"${result.title}" est temporairement ajouté aux favoris.\n\nVoulez-vous vous connecter pour sauvegarder définitivement?` :
                `"${result.title}" is tijdelijk toegevoegd aan favorieten.\n\nWil je inloggen om permanent op te slaan?`
              );
              
              if (bevestiging) {
                window.location.href = 'login.html';
              }
            }, 500);
            
          } else if (result.type === 'permanent') {
            e.target.innerHTML = `⭐ ${huidigeTaal === 'fr' ? 'Sauvegardé' : 'Opgeslagen'}`;
            e.target.style.backgroundColor = '#4caf50';
            e.target.disabled = true;
            
            // Toon success bericht
            setTimeout(() => {
              alert(
                huidigeTaal === 'fr' ? 
                `✅ "${result.title}" est définitivement sauvegardé dans vos favoris!` :
                `✅ "${result.title}" is permanent opgeslagen in je favorieten!`
              );
            }, 500);
          }
          
          console.log('✅ Favoriet toegevoegd:', result);
          
        } else {
          // Handle errors
          if (result.type === 'duplicate-permanent') {
            alert(
              huidigeTaal === 'fr' ? 
              `"${result.title}" est déjà dans vos favoris permanents!` :
              `"${result.title}" staat al in je permanente favorieten!`
            );
          } else if (result.type === 'duplicate-temporary') {
            alert(
              huidigeTaal === 'fr' ? 
              `"${result.title}" est déjà dans vos favoris temporaires!` :
              `"${result.title}" staat al in je tijdelijke favorieten!`
            );
          }
          console.warn('⚠️ Favoriet niet toegevoegd:', result);
        }
        
      } else {
        // Fallback als favorietenManager niet beschikbaar is
        console.warn('⚠️ FavorietenManager niet beschikbaar, gebruik eenvoudige toggle');
        e.target.innerHTML = `💝 ${huidigeTaal === 'fr' ? 'Ajouté' : 'Toegevoegd'}`;
        e.target.style.backgroundColor = '#4caf50';
        e.target.disabled = true;
      }
      
      return false;
    }
  });
}

// Helper functie om stripmuur data op te halen voor favorieten
function getStripmuurById(id) {
  // Zoek in gefilterde muren
  let stripmuur = gefilterdeMuren.find(muur => {
    const muralId = muur.id || alleStripmuren.indexOf(muur) + 1;
    return muralId === id;
  });
  
  // Zoek in alle muren als niet gevonden
  if (!stripmuur) {
    stripmuur = alleStripmuren.find(muur => {
      const muralId = muur.id || alleStripmuren.indexOf(muur) + 1;
      return muralId === id;
    });
  }
  
  if (!stripmuur) {
    console.warn('Stripmuur niet gevonden voor ID:', id);
    return null;
  }
  
  // Converteer naar juiste format voor favorieten
  const fields = stripmuur.fields || stripmuur;
  
  return {
    id: id,
    title: fields.naam_fresco_nl || fields.nom_de_la_fresque || `Stripmuur ${id}`,
    dessinateur: fields.dessinateur || 'Onbekend',
    adres: fields.adres || fields.adresse || 'Adres onbekend',
    date: fields.date || 'Onbekend',
    description_nl: fields.description_nl || '',
    description_fr: fields.description_fr || '',
    image: fields.photo || fields.image || 'img/placeholder.jpg',
    coordonnees_geographiques: fields.coordonnees_geographiques || null,
    link_site_striproute: fields.link_site_striproute || fields.lien_site_parcours_bd || '#'
  };
}

// Maak helper functie globaal beschikbaar
window.getStripmuurById = getStripmuurById;

// Update favoriet buttons status
function updateFavorietButtonsStatus() {
  if (typeof favorietenManager === 'undefined') return;
  
  const buttons = document.querySelectorAll('.favoriet-button');
  const tijdelijke = favorietenManager.getTijdelijkeFavorieten?.() || [];
  
  buttons.forEach(button => {
    const muralId = parseInt(button.dataset.id);
    const isPermanent = favorietenManager.favorieten?.some(fav => fav.id === muralId) || false;
    const isTijdelijk = tijdelijke.some(fav => fav.id === muralId);
    
    if (isPermanent) {
      button.innerHTML = `⭐ ${huidigeTaal === 'fr' ? 'Sauvegardé' : 'Opgeslagen'}`;
      button.style.backgroundColor = '#4caf50';
      button.disabled = true;
    } else if (isTijdelijk) {
      button.innerHTML = `🟡 ${huidigeTaal === 'fr' ? 'Temporaire' : 'Tijdelijk'}`;
      button.style.backgroundColor = '#ff9800';
      button.disabled = true;
    } else {
      button.innerHTML = `🌟 ${huidigeTaal === 'fr' ? 'Ajouter aux favoris' : 'Voeg toe aan favorieten'}`;
      button.style.backgroundColor = '';
      button.disabled = false;
    }
  });
}

// ========== LAZY LOADING ==========
let imageObserver;

function setupLazyLoading() {
  if (!('IntersectionObserver' in window)) {
    console.warn('⚠️ IntersectionObserver niet ondersteund, lazy loading uitgeschakeld');
    return;
  }
  
  imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src || img.getAttribute('data-src');
        
        if (src) {
          img.style.opacity = '0';
          img.style.transition = 'opacity 0.3s ease-in-out';
          
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy-load');
          
          img.onload = () => {
            img.style.opacity = '1';
          };
          
          img.onerror = () => {
            img.src = 'img/placeholder.jpg';
            img.style.opacity = '1';
          };
          
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  });
}

function observeImages() {
  if (!imageObserver) {
    setupLazyLoading();
  }
  
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => {
    img.classList.add('lazy-load');
    imageObserver.observe(img);
  });
}

// ========== EVENT LISTENERS SETUP ==========
function setupEventListeners() {
  console.log('🔧 Setup event listeners...');
  
  // Filter event listeners
  if (zoekInput) {
    zoekInput.addEventListener("input", filterEnZoek);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", filterEnZoek);
  }

  if (jaarSelect) {
    jaarSelect.addEventListener("change", filterEnZoek);
  }

  if (kunstenaarSelect) {
    kunstenaarSelect.addEventListener("change", filterEnZoek);
  }

  if (afstandSelect) {
    afstandSelect.addEventListener("change", filterEnZoek);
  }
  
  if (resetButton) {
    resetButton.addEventListener("click", resetFilters);
  }
  
  // Taal event listener
  if (taalSelect) {
    taalSelect.addEventListener("change", (e) => {
      wijzigTaal(e.target.value);
    });
  }
}

// ========== INITIALISATIE ==========
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log('🚀 Brussels Stripmuren Explorer initialisatie gestart...');
    
    // Laad data
    console.log('📡 Laden van Brussels stripmuren data...'); 
    cachedData = await haalStripmurenOp();
    alleStripmuren = [...cachedData];
    gefilterdeMuren = [...cachedData];
    
    console.log('📊 Data geladen:', cachedData.length, 'items');
    
    // Stel taal in
    huidigeTaal = localStorage.getItem("language") || "nl";
    
    // Verberg afstand gerelateerde opties initieel
    updateAfstandFilterZichtbaarheid();
    
    // Vul filter opties
    vulFilterOpties(alleStripmuren);
    
    // Toon stripmuren in lijst weergave
    toonStripmuren(gefilterdeMuren, huidigeTaal);
    
    // Setup functionaliteit
    setupEventListeners();
    setupViewToggle();
    setupFavorietenEventListeners();
    
    // Start geolocatie (na een korte delay om gebruiker niet te overweldigen)
    setTimeout(() => {
      vraagGeolocatieToegang();
    }, 1000);
    
    // Check periodiek of afstand filter zichtbaar moet zijn
    setInterval(updateAfstandFilterZichtbaarheid, 3000);
    
    // Update favoriet buttons status periodiek (als favorietenManager beschikbaar is)
    if (typeof favorietenManager !== 'undefined') {
      setInterval(() => {
        updateFavorietButtonsStatus();
      }, 2000);
    }
    
    console.log('✅ Brussels Stripmuren Explorer volledig geladen');
    
  } catch (error) {
    console.error("❌ Fout bij initialisatie:", error);
    const container = document.getElementById("parcours-lijst");
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <h3>⚠️ ${huidigeTaal === 'fr' ? 'Erreur de chargement' : 'Fout bij laden'}</h3>
          <p>${huidigeTaal === 'fr' ? 'Une erreur s\'est produite lors du chargement des fresques murales. Essayez de rafraîchir la page.' : 'Er is een fout opgetreden bij het laden van de stripmuren. Probeer de pagina te verversen.'}</p>
          <p><small>Error: ${error.message}</small></p>
        </div>
      `;
    }
  }
});

// Maak functies globaal beschikbaar
window.toonStripmuren = toonStripmuren;
window.cachedData = cachedData;
window.filterFuncties = {
  wijzigTaal,
  filterEnZoek,
  gefilterdeMuren: () => gefilterdeMuren
};

console.log('✅ Brussels Stripmuren Explorer - Unified module geladen');
