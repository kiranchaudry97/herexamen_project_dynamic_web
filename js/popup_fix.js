// Function to generate popup HTML with fixed icons and formatting
function generatePopupHtml(data, muur) {
  const fields = muur.fields || muur;
  
  // Extract required fields
  const titel_nl = fields.naam_fresco_nl || '';
  const titel_fr = fields.nom_de_la_fresque || '';
  const kunstenaar = fields.dessinateur || "Onbekend";
  const adres = fields.adres || fields.adresse || "Adres niet beschikbaar";
  const jaar = fields.date || "Onbekend";
  const beschrijving_nl = fields.description_nl || '';
  const beschrijving_fr = fields.description_fr || '';
  const uitgever = fields.maison_d_edition || '';
  const realisator = fields.realisateur || '';
  const oppervlakte = fields.surface_m2 ? `${fields.surface_m2} m²` : '';
  
  // Determine the correct address based on language
  const displayAdres = huidigeTaal === 'fr' 
    ? (fields.adresse_fr || adres)
    : (fields.adres_nl || adres);
  
  // Get the proper site link
  const siteLink = huidigeTaal === 'fr' 
    ? (fields.lien_site_parcours_bd || '#')
    : (fields.link_site_striproute || '#');
  
  // Get image URL using the utility function
  const afbeelding = window.extractImageUrl ? window.extractImageUrl(fields) : "img/placeholder.jpg";
  
  // Get Google Maps link
  let googleMapsLink = '#';
  if (fields.geo_point) {
    if (fields.geo_point.lat && fields.geo_point.lon) {
      googleMapsLink = fields.google_maps || `https://www.google.com/maps?q=${fields.geo_point.lat},${fields.geo_point.lon}`;
    }
  } else if (fields.coordonnees_geographiques) {
    const coords = fields.coordonnees_geographiques;
    if (coords.lat && coords.lon) {
      googleMapsLink = fields.google_maps || `https://www.google.com/maps?q=${coords.lat},${coords.lon}`;
    }
  }
  
  // Calculate distance HTML
  let afstandHTML = '';
  if (geolocatieToegekend && gebruikerLocatie) {
    const afstand = getAfstandVoorStripmuur(muur);
    if (afstand !== null) {
      const afstandFormatted = afstand < 1 
        ? `${Math.round(afstand * 1000)} m` 
        : `${afstand.toFixed(1)} km`;
      afstandHTML = `<span>🚶 ${translations[huidigeTaal].popup_distance}: <b>${afstandFormatted}</b></span><br>`;
    }
  }
  
  // Favoriet button handling
  const muralId = muur.id || Math.random().toString(36).substring(2, 10);
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
  }
  
  // Create the HTML
  return `
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
    ${beschrijving_nl || beschrijving_fr ? `<div style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 8px;"><b>${huidigeTaal === 'fr' ? 'Description de cette œuvre d\'art' : 'Informatie over dit kunstwerk'}</b></div>` : ''}
    ${beschrijving_nl ? `<div style="margin-top: 5px; background-color: #f9f9f9; padding: 8px; border-radius: 4px;"><b>NL:</b> ${beschrijving_nl}</div>` : ''}
    ${beschrijving_fr ? `<div style="margin-top: 5px; background-color: #f9f9f9; padding: 8px; border-radius: 4px;"><b>FR:</b> ${beschrijving_fr}</div>` : ''}
    ${!beschrijving_nl && !beschrijving_fr ? `<div style="margin-top: 5px; font-style: italic; color: #777;">${huidigeTaal === 'fr' ? 'Pas de description disponible.' : 'Geen beschrijving beschikbaar.'}</div>` : ''}
    <div style="margin-top: 8px;">
      <a href="${googleMapsLink}" target="_blank" style="margin-right: 10px;">🗺️ Google Maps</a>
    </div>
    ${siteLink && siteLink !== "#" ? `<div style="margin-top: 5px;"><a href="${siteLink}" target="_blank">➕ ${translations[huidigeTaal].popup_more_info}</a></div>` : ''}
    ${favorietButtonHtml}
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof toonBrusselsStripmurenOpLeaflet === 'function') {
    console.log('📱 Enhancing popup display with fixed icons...');
    
    const originalToonBrusselsStripmurenOpLeaflet = toonBrusselsStripmurenOpLeaflet;
    
    window.toonBrusselsStripmurenOpLeaflet = function(data) {
      if (!brusselsMap || !brusselsMarkersLayer) {
        console.error('❌ Brussels Leaflet kaart niet geïnitialiseerd!');
        return;
      }
      
      brusselsMarkersLayer.clearLayers();
      console.log('🧹 Bestaande markers gecleared');
      
      let validMarkers = 0;
      
      data.forEach((muur, index) => {
        const fields = muur.fields || muur;
        
        let lat = null, lng = null;
        
        if (fields.geo_point) {
          if (fields.geo_point.lat && fields.geo_point.lon) {
            lat = parseFloat(fields.geo_point.lat);
            lng = parseFloat(fields.geo_point.lon);
          }
        }
        // Fallback 
        else if (fields.coordonnees_geographiques) {
          const coords = fields.coordonnees_geographiques;
          if (coords.lat && coords.lon) {
            lat = parseFloat(coords.lat);
            lng = parseFloat(coords.lon);
          }
        }
        
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          if (lat >= 50.6 && lat <= 51.0 && lng >= 4.0 && lng <= 4.8) {
            const popupHtml = generatePopupHtml(data, muur);
            
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
            
            marker.bindPopup(popupHtml, {
              className: 'brussels-leaflet-popup',
              maxWidth: 300
            });
            brusselsMarkersLayer.addLayer(marker);
            validMarkers++;
          }
        }
      });
      
      if (validMarkers === 0) {
        console.log('⚠️ Geen markers gevonden, voeg test marker toe');
        const testMarker = L.marker([50.8505, 4.3488]).bindPopup('🧪 Test - Geen echte data gevonden');
        brusselsMarkersLayer.addLayer(testMarker);
      }
      
      if (validMarkers > 0 && brusselsMarkersLayer.getLayers().length > 0) {
        try {
          setTimeout(() => {
            const bounds = brusselsMarkersLayer.getBounds();
            brusselsMap.fitBounds(bounds, { padding: [50, 50] });
          }, 200);
        } catch (error) {
          console.error('❌ Fout bij aanpassen kaart zoom:', error);
        }
      }
      
      console.log(`✅ ${validMarkers} van ${data.length} stripmuren markers toegevoegd aan Brussels Leaflet kaart`);
    };
    
    console.log('✅ Popup display enhancement complete!');
  }
});
