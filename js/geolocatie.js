// Geolocatie functionaliteit voor Brussels Stripmuren Explorer
class GeolocatieManager {
    constructor() {
        this.gebruikerLocatie = null;
        this.geolocatieToegestaan = this.getGeolocatieVoorkeur();
        this.initGeolocatie();
    }

    // Haal geolocatie voorkeur op uit localStorage
    getGeolocatieVoorkeur() {
        const saved = localStorage.getItem('geolocatieToegestal');
        return saved === 'true';
    }

    // Sla geolocatie voorkeur op
    saveGeolocatieVoorkeur(toegestaan) {
        localStorage.setItem('geolocatieToegestal', toegestaan.toString());
        localStorage.setItem('geolocatieGewijzigd', new Date().toISOString());
        console.log('💾 Geolocatie voorkeur opgeslagen:', toegestaan);
    }

    // Haal opgeslagen locatie op
    getOpgeslagenLocatie() {
        const saved = localStorage.getItem('gebruikerLocatie');
        if (saved) {
            try {
                const locatie = JSON.parse(saved);
                const opgeslagenTijd = new Date(locatie.timestamp);
                const nu = new Date();
                const verschilUren = (nu - opgeslagenTijd) / (1000 * 60 * 60);
                
                // Locatie is geldig voor 24 uur
                if (verschilUren < 24) {
                    console.log('📍 Opgeslagen locatie gevonden (geldig voor', (24 - verschilUren).toFixed(1), 'uur)');
                    return locatie;
                }
            } catch (error) {
                console.error('❌ Fout bij lezen opgeslagen locatie:', error);
            }
        }
        return null;
    }

    // Sla locatie op
    saveLocatie(lat, lon) {
        const locatieData = {
            lat: lat,
            lon: lon,
            timestamp: new Date().toISOString(),
            adres: null // Wordt later ingevuld via reverse geocoding
        };
        
        localStorage.setItem('gebruikerLocatie', JSON.stringify(locatieData));
        console.log('💾 Locatie opgeslagen:', lat, lon);
        
        // Probeer adres op te halen voor betere UX
        this.getAdresVanCoordinaten(lat, lon).then(adres => {
            if (adres) {
                locatieData.adres = adres;
                localStorage.setItem('gebruikerLocatie', JSON.stringify(locatieData));
                console.log('📍 Adres toegevoegd aan opgeslagen locatie:', adres);
            }
        });
    }

    // Initialiseer geolocatie
    async initGeolocatie() {
        console.log('🗺️ Initialiseer geolocatie systeem...');
        
        // Controleer browser ondersteuning
        if (!navigator.geolocation) {
            console.warn('⚠️ Geolocatie wordt niet ondersteund door deze browser');
            this.toonGeolocatieUi(false);
            return;
        }

        // Toon geolocatie UI
        this.toonGeolocatieUi(true);

        // Probeer opgeslagen locatie eerst
        const opgeslagenLocatie = this.getOpgeslagenLocatie();
        if (opgeslagenLocatie && this.geolocatieToegestal) {
            console.log('📍 Gebruik opgeslagen locatie');
            this.gebruikerLocatie = {
                lat: opgeslagenLocatie.lat,
                lon: opgeslagenLocatie.lon
            };
            this.updateAfstandenDisplay();
            return;
        }

        // Als gebruiker eerder toestemming heeft gegeven, vraag nieuwe locatie
        if (this.geolocatieToegestal) {
            this.vraagHuidigeLocatie();
        }
    }

    // Vraag huidige locatie op
    vraagHuidigeLocatie() {
        console.log('📍 Vraag huidige locatie op...');
        
        const opties = {
            enableHighAccuracy: false, // Sneller, minder batterij
            timeout: 10000, // 10 seconden timeout
            maximumAge: 300000 // 5 minuten cache
        };

        navigator.geolocation.getCurrentPosition(
            (positie) => this.geolocatieSucces(positie),
            (error) => this.geolocatieFout(error),
            opties
        );
    }

    // Geolocatie succesvol
    geolocatieSucces(positie) {
        const lat = positie.coords.latitude;
        const lon = positie.coords.longitude;
        const nauwkeurigheid = positie.coords.accuracy;
        
        console.log('✅ Locatie verkregen:', lat, lon, 'Nauwkeurigheid:', nauwkeurigheid, 'm');
        
        this.gebruikerLocatie = { lat, lon };
        this.saveLocatie(lat, lon);
        this.saveGeolocatieVoorkeur(true);
        
        // Update UI
        this.updateAfstandenDisplay();
        this.toonLocatieStatus(`📍 Locatie gevonden (±${Math.round(nauwkeurigheid)}m nauwkeurig)`);
        
        // Als we op de kaart zijn, toon gebruiker locatie
        if (typeof window.toonGebruikerOpKaart === 'function') {
            window.toonGebruikerOpKaart(lat, lon);
        }
    }

    // Geolocatie fout
    geolocatieFout(error) {
        let bericht = 'Locatie kon niet worden bepaald';
        
        switch(error.code) {
            case error.PERMISSION_DENIED:
                bericht = 'Locatietoegang geweigerd door gebruiker';
                this.saveGeolocatieVoorkeur(false);
                break;
            case error.POSITION_UNAVAILABLE:
                bericht = 'Locatie informatie niet beschikbaar';
                break;
            case error.TIMEOUT:
                bericht = 'Locatie verzoek verlopen';
                break;
        }
        
        console.warn('⚠️ Geolocatie fout:', bericht);
        this.toonLocatieStatus(`⚠️ ${bericht}`);
    }

    // Bereken afstand tussen twee punten (Haversine formule)
    berekenAfstand(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius van de aarde in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const afstand = R * c;
        
        return afstand; // km
    }

    toRadians(graden) {
        return graden * (Math.PI/180);
    }

    // Format afstand voor weergave
    formatAfstand(km) {
        if (km < 1) {
            return `${Math.round(km * 1000)}m`;
        } else {
            return `${km.toFixed(1)}km`;
        }
    }

    // Update afstanden display op alle stripmuren
    updateAfstandenDisplay() {
        if (!this.gebruikerLocatie) return;
        
        console.log('📏 Update afstanden display...');
        
        // Update afstanden in lijst weergave
        const muurKaarten = document.querySelectorAll('.muur-kaart');
        muurKaarten.forEach(kaart => {
            this.voegAfstandToeAanKaart(kaart);
        });
    }

    // Voeg afstand toe aan een stripmuur kaart
    voegAfstandToeAanKaart(kaartElement) {
        if (!this.gebruikerLocatie) return;
        
        // Probeer coordinaten te vinden (dit hangt af van je data structuur)
        const muurId = kaartElement.querySelector('.favoriet-button')?.dataset.id;
        if (!muurId) return;
        
        // Gebruik globale data om coordinaten te vinden
        let stripmuurData = null;
        if (typeof window.filterFuncties !== 'undefined' && window.filterFuncties.gefilterdeMuren) {
            const alleMuren = window.filterFuncties.gefilterdeMuren();
            stripmuurData = alleMuren.find(muur => 
                (muur.id && muur.id.toString() === muurId) ||
                (alleMuren.indexOf(muur) + 1).toString() === muurId
            );
        }
        
        if (stripmuurData && stripmuurData.coordonnees_geographiques) {
            const lat = stripmuurData.coordonnees_geographiques.lat;
            const lon = stripmuurData.coordonnees_geographiques.lon;
            
            if (lat && lon) {
                const afstand = this.berekenAfstand(
                    this.gebruikerLocatie.lat, 
                    this.gebruikerLocatie.lon,
                    lat, 
                    lon
                );
                
                // Voeg afstand toe aan kaart
                let afstandElement = kaartElement.querySelector('.afstand-info');
                if (!afstandElement) {
                    afstandElement = document.createElement('div');
                    afstandElement.className = 'afstand-info';
                    afstandElement.style.cssText = `
                        background: #3498db;
                        color: white;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                        margin-top: 8px;
                        text-align: center;
                    `;
                    kaartElement.appendChild(afstandElement);
                }
                
                afstandElement.innerHTML = `📍 ${this.formatAfstand(afstand)} van je locatie`;
            }
        }
    }

    // Reverse geocoding - krijg adres van coordinaten
    async getAdresVanCoordinaten(lat, lon) {
        try {
            // Gebruik Nominatim (OpenStreetMap) reverse geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'BrusselsStripmuren/1.0'
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.display_name) {
                    // Verkort het adres tot straat en stad
                    const adresDelen = data.display_name.split(',');
                    const verkorteAdres = adresDelen.slice(0, 2).join(', ');
                    return verkorteAdres;
                }
            }
        } catch (error) {
            console.warn('⚠️ Kon adres niet ophalen:', error);
        }
        return null;
    }

    // Toon geolocatie UI
    toonGeolocatieUi(ondersteuning) {
        // Voeg geolocatie sectie toe aan settings als het nog niet bestaat
        const settingsSection = document.querySelector('.settings');
        if (!settingsSection) return;
        
        let geoSection = document.getElementById('geolocatie-sectie');
        if (!geoSection) {
            geoSection = document.createElement('div');
            geoSection.id = 'geolocatie-sectie';
            geoSection.className = 'geolocatie-toggle';
            
            if (ondersteuning) {
                geoSection.innerHTML = `
                    <label class="switch">
                        <input type="checkbox" id="geolocatieToggle" ${this.geolocatieToegestal ? 'checked' : ''} />
                        <span class="slider round"></span>
                    </label>
                    <span class="geo-label" data-i18n="geolocatie">Locatie delen</span>
                    <div id="locatie-status" class="locatie-status"></div>
                `;
                
                // Event listener voor toggle
                const toggle = geoSection.querySelector('#geolocatieToggle');
                toggle.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.vraagHuidigeLocatie();
                    } else {
                        this.gebruikerLocatie = null;
                        this.saveGeolocatieVoorkeur(false);
                        localStorage.removeItem('gebruikerLocatie');
                        this.updateAfstandenDisplay();
                        this.toonLocatieStatus('📍 Locatie delen uitgeschakeld');
                    }
                });
            } else {
                geoSection.innerHTML = `
                    <span class="geo-label disabled">⚠️ Geolocatie niet ondersteund</span>
                `;
            }
            
            settingsSection.appendChild(geoSection);
        }
    }

    // Toon locatie status
    toonLocatieStatus(bericht) {
        const statusElement = document.getElementById('locatie-status');
        if (statusElement) {
            statusElement.textContent = bericht;
            statusElement.style.cssText = `
                font-size: 12px;
                color: #666;
                margin-top: 4px;
                min-height: 16px;
            `;
        }
    }

    // Sorteer stripmuren op afstand
    sorteerOpAfstand(data) {
        if (!this.gebruikerLocatie || !data) return data;
        
        return [...data].sort((a, b) => {
            const afstandA = this.getAfstandVoorStripmuur(a);
            const afstandB = this.getAfstandVoorStripmuur(b);
            
            // Zet items zonder coordinaten achteraan
            if (afstandA === null && afstandB === null) return 0;
            if (afstandA === null) return 1;
            if (afstandB === null) return -1;
            
            return afstandA - afstandB;
        });
    }

    // Krijg afstand voor een specifieke stripmuur
    getAfstandVoorStripmuur(stripmuur) {
        if (!this.gebruikerLocatie || !stripmuur.coordonnees_geographiques) return null;
        
        const lat = stripmuur.coordonnees_geographiques.lat;
        const lon = stripmuur.coordonnees_geographiques.lon;
        
        if (!lat || !lon) return null;
        
        return this.berekenAfstand(
            this.gebruikerLocatie.lat,
            this.gebruikerLocatie.lon,
            lat,
            lon
        );
    }
}

// Maak globale instance beschikbaar
window.geolocatieManager = new GeolocatieManager();

// Voeg geolocatie sorteer optie toe aan filter als deze bestaat
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const sorteerSelect = document.getElementById('sorteerSelect');
        if (sorteerSelect && window.geolocatieManager.gebruikerLocatie) {
            // Voeg afstand sorteer optie toe
            const afstandOptie = document.createElement('option');
            afstandOptie.value = 'afstand';
            afstandOptie.textContent = '📍 Dichtstbij';
            afstandOptie.setAttribute('data-i18n', 'sortDistance');
            sorteerSelect.appendChild(afstandOptie);
        }
    }, 1000);
});

console.log('✅ Geolocatie Manager geladen');
