// DOM-elementen ophalen
const zoekInput = document.getElementById("zoekInput");
const sortSelect = document.getElementById("sorteerSelect");
const jaarSelect = document.getElementById("filterJaar");
const kunstenaarSelect = document.getElementById("filterKunstenaar");
const afstandSelect = document.getElementById("filterAfstand");
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
  // Jaren verzamelen
  const jaren = [...new Set(data.map(muur => muur.date).filter(jaar => jaar))].sort();
  jaarSelect.innerHTML = '<option value="">Alle jaren</option>';
  jaren.forEach(jaar => {
    const option = document.createElement("option");
    option.value = jaar;
    option.textContent = jaar;
    jaarSelect.appendChild(option);
  });

  // Kunstenaars verzamelen
  const kunstenaars = [...new Set(data.map(muur => muur.dessinateur).filter(kunstenaar => kunstenaar))].sort();
  kunstenaarSelect.innerHTML = '<option value="">Alle kunstenaars</option>';
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
  const geselecteerdeAfstand = afstandSelect ? afstandSelect.value : "";

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

    // Afstandfilter (alleen als geolocatie beschikbaar is)
    let voldoetAanAfstand = true;
    if (geselecteerdeAfstand && typeof window.geolocatieManager !== 'undefined' && window.geolocatieManager.gebruikerLocatie) {
      const afstand = window.geolocatieManager.getAfstandVoorStripmuur(muur);
      
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
        // Als geen coördinaten beschikbaar, toon niet bij afstand filtering
        voldoetAanAfstand = false;
      }
    }

    return voldoetAanZoek && voldoetAanJaar && voldoetAanKunstenaar && voldoetAanAfstand;
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
      case "afstand":
        // Sorteer op afstand als geolocatie beschikbaar is
        if (typeof window.geolocatieManager !== 'undefined' && window.geolocatieManager.gebruikerLocatie) {
          const afstandA = window.geolocatieManager.getAfstandVoorStripmuur(a);
          const afstandB = window.geolocatieManager.getAfstandVoorStripmuur(b);
          
          // Zet items zonder coordinaten achteraan
          if (afstandA === null && afstandB === null) return 0;
          if (afstandA === null) return 1;
          if (afstandB === null) return -1;
          
          return afstandA - afstandB;
        }
        return naamA.localeCompare(naamB); // Fallback naar alfabetisch
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
  if (afstandSelect) afstandSelect.value = "";
  
  gefilterdeMuren = [...alleStripmuren];
  sorteerMuren();
  toonStripmuren(gefilterdeMuren, huidigeTaal);
  updateKaart();
}

// Taal wijzigen
function wijzigTaal(nieuweTaal) {
  huidigeTaal = nieuweTaal;
  filterEnZoek(); // Herfilter met nieuwe taal
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

    const kaart = document.createElement("div");
    kaart.classList.add("muur-kaart");

    kaart.innerHTML = `
      <img src="${afbeelding}" alt="${naam}" loading="lazy" />
      <h3>${naam}</h3>
      <p><strong>${taal === "fr" ? "Artiste" : "Kunstenaar"}:</strong> ${kunstenaar}</p>
      <p><strong>${taal === "fr" ? "Adresse" : "Adres"}:</strong> ${adres}</p>
      <p><strong>${taal === "fr" ? "Année" : "Jaar"}:</strong> ${jaar}</p>
      <p class="description"><strong>${taal === "fr" ? "Description" : "Beschrijving"}:</strong> ${beschrijving}</p>
      <div class="kaart-acties">
        <a href="${mapLink}" target="_blank">${taal === "fr" ? "Ouvrir dans Google Maps" : "Open in Google Maps"}</a>
        <button class="favoriet-button" data-id="${muur.id || index + 1}">
          ⭐ ${taal === "fr" ? "Favoris" : "Favoriet"}
        </button>
      </div>
    `;

    container.appendChild(kaart);
  });

  // Update afstanden als geolocatie beschikbaar is
  if (typeof window.geolocatieManager !== 'undefined') {
    setTimeout(() => {
      window.geolocatieManager.updateAfstandenDisplay();
    }, 200);
  }

  // Update favorieten display
  if (typeof window.favorietenManager !== 'undefined') {
    setTimeout(() => {
      window.favorietenManager.updateFavorietenDisplay();
    }, 300);
  }
}

// Afstand filter zichtbaarheid beheren
function updateAfstandFilterZichtbaarheid() {
  if (!afstandSelect) return;
  
  const heeftGeolocatie = typeof window.geolocatieManager !== 'undefined' && 
                         window.geolocatieManager.gebruikerLocatie;
  
  if (heeftGeolocatie) {
    afstandSelect.style.display = 'inline-block';
    afstandSelect.disabled = false;
  } else {
    afstandSelect.style.display = 'none';
    afstandSelect.disabled = true;
    afstandSelect.value = ""; // Reset waarde als niet beschikbaar
  }
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
  
  // Update afstand filter zichtbaarheid
  updateAfstandFilterZichtbaarheid();
  
  // Check periodiek voor geolocatie updates
  setInterval(updateAfstandFilterZichtbaarheid, 2000);
  
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
  
  if (afstandSelect) {
    afstandSelect.addEventListener("change", filterEnZoek);
  }
  
  if (resetButton) {
    resetButton.addEventListener("click", resetFilters);
  }
  
  // Luister naar taalwijzigingen
  const taalSelect = document.getElementById("language");
  if (taalSelect) {
    taalSelect.addEventListener("change", (e) => {
      wijzigTaal(e.target.value);
    });
  }
});

// Exporteer functies voor gebruik door andere scripts
window.filterFuncties = {
  wijzigTaal,
  filterEnZoek,
  toonStripmuren,
  gefilterdeMuren: () => gefilterdeMuren
};
