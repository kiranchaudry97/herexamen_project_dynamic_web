const taalSelect = document.getElementById("language");
const huidigeTaal = localStorage.getItem("language") || "nl";

let cachedData = [];
let map;
let markersLayer;

async function haalStripmurenOp() {
  const response = await fetch("https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=28");
  const data = await response.json();
  return data.results;
}

function toonStripmuren(data, taal = "nl") {
  const container = document.getElementById("parcours-lijst");
  container.innerHTML = "";

  data.forEach((muur) => {
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

    const kaart = document.createElement("div");
    kaart.classList.add("muur-kaart");

    kaart.innerHTML = `
      <img src="${afbeelding}" alt="${naam}" />
      <h3>${naam}</h3>
      <p><strong>${taal === "fr" ? "Artiste" : "Kunstenaar"}:</strong> ${kunstenaar}</p>
      <p><strong>${taal === "fr" ? "Adresse" : "Adres"}:</strong> ${adres}</p>
      <p><strong>${taal === "fr" ? "Année" : "Jaar"}:</strong> ${jaar}</p>
      <p><strong>${taal === "fr" ? "Description" : "Beschrijving"}:</strong> ${beschrijving}</p>
      <div class="kaart-acties">
        <a href="${mapLink}" target="_blank">${taal === "fr" ? "Ouvrir dans Google Maps" : "Open in Google Maps"}</a>
        <button class="add-favorite">${taal === "fr" ? "Ajouter" : "Voeg toe"}</button>
      </div>
    `;

    container.appendChild(kaart);
  });
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
        <span><b>${taal === 'fr' ? "Artiste" : "Kunstenaar"}:</b> ${tekenaar}</span><br>
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

// ========== Initialisatie ==========
document.addEventListener("DOMContentLoaded", async () => {
  cachedData = await haalStripmurenOp();
  toonStripmuren(cachedData, huidigeTaal);

  const toggle = document.getElementById("viewToggle");
  const titelLijst = document.getElementById("titel-lijst");
  const titelKaart = document.getElementById("titel-kaart");

  toggle.addEventListener("change", () => {
    const isKaart = toggle.checked;

    document.getElementById("parcours-lijst").style.display = isKaart ? "none" : "flex";
    document.getElementById("map-container").style.display = isKaart ? "block" : "none";

    titelLijst.style.display = isKaart ? "none" : "block";
    titelKaart.style.display = isKaart ? "block" : "none";

    if (isKaart) {
      toonKaart(cachedData, taalSelect.value);
    }
  });

  if (toggle.checked) {
    toonKaart(cachedData, huidigeTaal);
    titelLijst.style.display = "none";
    titelKaart.style.display = "block";
  } else {
    titelLijst.style.display = "block";
    titelKaart.style.display = "none";
  }

  // ✅ Toon gebruiker locatie
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
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
      },
      function () {
        console.warn("Geolocatie geweigerd of niet beschikbaar.");
      }
    );
  }
});

// ========== Taal wissel ==========
taalSelect.value = huidigeTaal;
taalSelect.addEventListener("change", () => {
  const nieuweTaal = taalSelect.value;
  localStorage.setItem("language", nieuweTaal);

  const isKaart = document.getElementById("viewToggle").checked;
  if (isKaart) {
    toonKaart(cachedData, nieuweTaal);
  } else {
    toonStripmuren(cachedData, nieuweTaal);
  }
});
