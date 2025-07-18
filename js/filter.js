// DOM-elementen ophalen
const zoekInput = document.getElementById("zoekInput");
const sortSelect = document.getElementById("sorteerSelect");
const jaarSelect = document.getElementById("filterJaar");
const kunstenaarSelect = document.getElementById("filterKunstenaar");
const resetButton = document.getElementById("resetFilters");

// Globale variabelen
let alleStripmuren = [];
let gefilterdeMuren = [];
let huidigeTaal = "nl";

// Data ophalen en initialiseren
async function haalStripmurenOp() {
  try {
    const response = await fetch("https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/bruxelles_parcours_bd/records?limit=28");
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Fout bij het ophalen van data:", error);
    return [];
  }
}

// Filteropties vullen
function vulFilterOpties(data) {
  // Controleer of vertalingen beschikbaar zijn
  const vertalingen = window.translations || {
    nl: { allYears: "Alle jaren", allArtists: "Alle kunstenaars" },
    fr: { allYears: "Toutes les années", allArtists: "Tous les artistes" }
  };

  // Jaren verzamelen
  const jaren = [...new Set(data.map(muur => muur.date).filter(jaar => jaar))].sort();
  jaarSelect.innerHTML = `<option value="">${vertalingen[huidigeTaal]?.allYears || "Alle jaren"}</option>`;
  jaren.forEach(jaar => {
    const option = document.createElement("option");
    option.value = jaar;
    option.textContent = jaar;
    jaarSelect.appendChild(option);
  });

  // Kunstenaars verzamelen
  const kunstenaars = [...new Set(data.map(muur => muur.dessinateur).filter(kunstenaar => kunstenaar))].sort();
  kunstenaarSelect.innerHTML = `<option value="">${vertalingen[huidigeTaal]?.allArtists || "Alle kunstenaars"}</option>`;
  kunstenaars.forEach(kunstenaar => {
    const option = document.createElement("option");
    option.value = kunstenaar;
    option.textContent = kunstenaar;
    kunstenaarSelect.appendChild(option);
  });
}

// Filteren en zoeken
function filterEnZoek() {
  const zoekterm = zoekInput.value.toLowerCase();
  const geselecteerdJaar = jaarSelect.value;
  const geselecteerdeKunstenaar = kunstenaarSelect.value;

  gefilterdeMuren = alleStripmuren.filter(muur => {
    const naam = (muur[`naam_fresco_${huidigeTaal}`] || muur.nom_de_la_fresque || "").toLowerCase();
    const kunstenaar = (muur.dessinateur || "").toLowerCase();
    const jaar = muur.date || "";
    const beschrijving = (
      muur[`description_${huidigeTaal}`] ||
      muur[`info_${huidigeTaal}`] ||
      muur.description_nl ||
      muur.description_fr ||
      muur.info_nl ||
      muur.info_fr ||
      ""
    ).toLowerCase();

    // Zoekfilter
    const voldoetAanZoek = !zoekterm || 
      naam.includes(zoekterm) || 
      kunstenaar.includes(zoekterm) || 
      jaar.includes(zoekterm) ||
      beschrijving.includes(zoekterm);

    // Jaarfilter
    const voldoetAanJaar = !geselecteerdJaar || jaar === geselecteerdJaar;

    // Kunstenaarfilter
    const voldoetAanKunstenaar = !geselecteerdeKunstenaar || muur.dessinateur === geselecteerdeKunstenaar;

    return voldoetAanZoek && voldoetAanJaar && voldoetAanKunstenaar;
  });

  sorteerMuren();
  toonStripmuren(gefilterdeMuren, huidigeTaal);
  updateKaart();
}

// Sorteren
function sorteerMuren() {
  const sorteerWaarde = sortSelect.value;

  gefilterdeMuren.sort((a, b) => {
    const naamA = a[`naam_fresco_${huidigeTaal}`] || a.nom_de_la_fresque || "Naam onbekend";
    const naamB = b[`naam_fresco_${huidigeTaal}`] || b.nom_de_la_fresque || "Naam onbekend";
    const jaarA = parseInt(a.date) || 0;
    const jaarB = parseInt(b.date) || 0;

    switch (sorteerWaarde) {
      case "za":
        return naamB.localeCompare(naamA);
      case "jaar_op":
        return jaarA - jaarB;
      case "jaar_af":
        return jaarB - jaarA;
      case "az":
      default:
        return naamA.localeCompare(naamB);
    }
  });
}

// Kaart updaten met gefilterde resultaten
function updateKaart() {
  // Controleer of kaart functionaliteit beschikbaar is (uit parcours.js)
  if (typeof toonKaart === 'function') {
    const isKaartZichtbaar = document.getElementById("viewToggle")?.checked;
    if (isKaartZichtbaar) {
      toonKaart(gefilterdeMuren, huidigeTaal);
    }
  }
}

// Filters resetten
function resetFilters() {
  zoekInput.value = "";
  sortSelect.value = "az";
  jaarSelect.value = "";
  kunstenaarSelect.value = "";
  
  gefilterdeMuren = [...alleStripmuren];
  sorteerMuren();
  toonStripmuren(gefilterdeMuren, huidigeTaal);
  updateKaart();
}

// Taal wijzigen
function wijzigTaal(nieuweTaal) {
  huidigeTaal = nieuweTaal;
  
  // Update filteropties met nieuwe taal
  vulFilterOpties(alleStripmuren);
  
  // Herfilter met nieuwe taal
  filterEnZoek(); 
}

function toonStripmuren(data, taal = "nl") {
  const container = document.getElementById("parcours-lijst");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: #666; margin: 2rem 0;">
      ${taal === "fr" ? "Aucun résultat trouvé." : "Geen resultaten gevonden."}
    </p>`;
    return;
  }

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

// Event listeners toevoegen
document.addEventListener("DOMContentLoaded", async () => {
  // Data ophalen
  alleStripmuren = await haalStripmurenOp();
  gefilterdeMuren = [...alleStripmuren];
  
  // Taal uit localStorage halen
  huidigeTaal = localStorage.getItem("language") || "nl";
  
  // Filteropties vullen
  vulFilterOpties(alleStripmuren);
  
  // Initiële weergave
  toonStripmuren(gefilterdeMuren, huidigeTaal);
  
  // Event listeners
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
  
  if (resetButton) {
    resetButton.addEventListener("click", resetFilters);
  }
});

// Exporteer functies voor gebruik door andere scripts
window.filterFuncties = {
  wijzigTaal,
  filterEnZoek,
  toonStripmuren,
  gefilterdeMuren: () => gefilterdeMuren
};
