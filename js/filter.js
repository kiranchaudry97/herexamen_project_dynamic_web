const taalSelect = document.getElementById("language");
const huidigeTaal = localStorage.getItem("language") || "nl";

let cachedData = [];
let map;
let markersLayer;

// Filterelementen
const zoekInput = document.getElementById("zoekveld");
const sortSelect = document.getElementById("sortering");
const jaarSelect = document.getElementById("filter-jaar");
const kunstenaarSelect = document.getElementById("filter-kunstenaar");
const resetButton = document.getElementById("reset-filters");

async function haalStripmurenOp() {
  const response = await fetch("https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=100");
  const data = await response.json();
  return data.results;
}

function vulFilterOpties(data) {
  const jaren = new Set();
  const kunstenaars = new Set();

  data.forEach(muur => {
    if (muur.date) jaren.add(muur.date);
    if (muur.dessinateur) kunstenaars.add(muur.dessinateur.trim());
  });

  [...jaren].sort().forEach(j => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = j;
    jaarSelect.appendChild(opt);
  });

  [...kunstenaars].sort().forEach(k => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = k;
    kunstenaarSelect.appendChild(opt);
  });
}

function pasFiltersToe() {
  const zoekterm = zoekInput.value.toLowerCase();
  const gekozenJaar = jaarSelect.value;
  const gekozenKunstenaar = kunstenaarSelect.value;
  const sorteer = sortSelect.value;

  let gefilterd = [...cachedData].filter(muur => {
    const naam = muur[`naam_fresco_${huidigeTaal}`]?.toLowerCase() || "";
    const auteur = muur.dessinateur?.toLowerCase() || "";
    const jaar = muur.date || "";

    const matchZoek = !zoekterm || naam.includes(zoekterm) || auteur.includes(zoekterm) || jaar.includes(zoekterm);
    const matchJaar = !gekozenJaar || jaar === gekozenJaar;
    const matchKunstenaar = !gekozenKunstenaar || muur.dessinateur === gekozenKunstenaar;

    return matchZoek && matchJaar && matchKunstenaar;
  });

  // Sorteren
  gefilterd.sort((a, b) => {
    const naamA = a[`naam_fresco_${huidigeTaal}`] || "";
    const naamB = b[`naam_fresco_${huidigeTaal}`] || "";
    return sorteer === "az" ? naamA.localeCompare(naamB) : naamB.localeCompare(naamA);
  });

  toonStripmuren(gefilterd, huidigeTaal);
}

function resetFilters() {
  zoekInput.value = "";
  jaarSelect.value = "";
  kunstenaarSelect.value = "";
  sortSelect.value = "az";
  pasFiltersToe();
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
      <p><strong>Kunstenaar:</strong> ${kunstenaar}</p>
      <p><strong>Adres:</strong> ${adres}</p>
      <p><strong>Jaar:</strong> ${jaar}</p>
      <p><strong>Beschrijving:</strong> ${beschrijving}</p>
      <div class="kaart-acties">
        <a href="${mapLink}" target="_blank">Open in Google Maps</a>
        <button class="add-favorite">Voeg toe</button>
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
    const titel = muur[`naam_fresco_${taal}`] || muur.nom_de_la_fresque || '';
    const beschrijving = muur[`description_${taal}`] || muur[`info_${taal}`] || '';
    const tekenaar = muur.dessinateur || "Onbekend";
    const adres = muur.adres || muur.adresse || "Adres niet beschikbaar";
    const gemeente = muur.commune_gemeente || "Onbekend";
    const link = muur.link_site_striproute || muur.lien_site_parcours_bd || "#";
    const afbeelding = muur.image || null;

    const lat = muur.coordonnees_geographiques?.lat;
    const lon = muur.coordonnees_geographiques?.lon;

    if (lat && lon) {
      const popupHtml = `
        <strong>${titel}</strong><br>
        <span><b>Kunstenaar:</b> ${tekenaar}</span><br>
        <span><b>Adres:</b> ${adres}</span><br>
        <span><b>Gemeente:</b> ${gemeente}</span><br>
        ${beschrijving ? `<p>${beschrijving}</p>` : ""}
        ${link !== "#" ? `<p><a href="${link}" target="_blank" style="color:#007bff;">Meer info</a></p>` : ""}
        ${afbeelding ? `<img src="${afbeelding}" alt="${titel}" style="max-width:180px; border-radius:8px; margin-top:6px;">` : ""}
      `;
      const marker = L.marker([lat, lon]).bindPopup(popupHtml);
      markersLayer.addLayer(marker);
    }
  });

  setTimeout(() => map.invalidateSize(), 200);
}

// ========== Initialisatie ==========
document.addEventListener("DOMContentLoaded", async () => {
  cachedData = await haalStripmurenOp();
  vulFilterOpties(cachedData);
  toonStripmuren(cachedData, huidigeTaal);

  // Toggle kaart ↔ lijst
  const toggle = document.getElementById("viewToggle");
  const titelLijst = document.getElementById("titel-lijst");
  const titelKaart = document.getElementById("titel-kaart");

  toggle.addEventListener("change", () => {
    const isKaart = toggle.checked;
    document.getElementById("parcours-lijst").style.display = isKaart ? "none" : "flex";
    document.getElementById("map-container").style.display = isKaart ? "block" : "none";
    titelLijst.style.display = isKaart ? "none" : "block";
    titelKaart.style.display = isKaart ? "block" : "none";
    if (isKaart) toonKaart(cachedData, taalSelect.value);
  });

  // Filters
  zoekInput.addEventListener("input", pasFiltersToe);
  sortSelect.addEventListener("change", pasFiltersToe);
  jaarSelect.addEventListener("change", pasFiltersToe);
  kunstenaarSelect.addEventListener("change", pasFiltersToe);
  resetButton.addEventListener("click", resetFilters);

  // Kaart tonen bij opstart (indien geselecteerd)
  if (toggle.checked) {
    toonKaart(cachedData, huidigeTaal);
    titelLijst.style.display = "none";
    titelKaart.style.display = "block";
  }

  // Locatie
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      L.marker([latitude, longitude], {
        icon: L.icon({
          iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
          shadowSize: [41, 41]
        })
      }).addTo(map).bindPopup("Uw locatie");
    });
  }
});

// Taal wissel
taalSelect.value = huidigeTaal;
taalSelect.addEventListener("change", () => {
  const nieuweTaal = taalSelect.value;
  localStorage.setItem("language", nieuweTaal);
  const isKaart = document.getElementById("viewToggle").checked;
  isKaart ? toonKaart(cachedData, nieuweTaal) : toonStripmuren(cachedData, nieuweTaal);
});
