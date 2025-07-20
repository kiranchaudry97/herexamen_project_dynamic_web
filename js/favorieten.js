// zie commit bericht voor favorieten.js

// Favorieten functionaliteit
class FavorietenManager {
    constructor() {
        this.migreerOudeFavorieten(); // Migreer oude favorieten structuur
        this.favorieten = this.getFavorieten();
        this.initEventListeners();
        this.watchLoginStatus(); // Watch voor login status veranderingen
    }

    // Migreer oude favorieten structuur naar nieuwe gebruiker-specifieke structuur
    migreerOudeFavorieten() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userEmail = localStorage.getItem('userEmail');
        
        if (!isLoggedIn || !userEmail) {
            return; // Geen migratie nodig als niet ingelogd
        }
        
        const oudeFavorieten = localStorage.getItem('favorieten');
        const nieuweKey = `favorieten_${userEmail}`;
        const nieuweFavorieten = localStorage.getItem(nieuweKey);
        
        // Als er oude favorieten zijn maar geen nieuwe voor deze gebruiker
        if (oudeFavorieten && !nieuweFavorieten) {
            console.log(`Migreren oude favorieten naar ${userEmail}`);
            localStorage.setItem(nieuweKey, oudeFavorieten);
            // Verwijder de oude globale favorieten niet - andere gebruikers kunnen ze nog nodig hebben
        }
    }

    // Watch login status changes
    watchLoginStatus() {
        let lastLoginState = localStorage.getItem('isLoggedIn') === 'true';
        let lastUserEmail = localStorage.getItem('userEmail');
        
        // Check login status elke seconde (voor real-time updates bij login/logout)
        setInterval(() => {
            const currentLoginState = localStorage.getItem('isLoggedIn') === 'true';
            const currentUserEmail = localStorage.getItem('userEmail');
            
            // Als login status is veranderd OF gebruiker is veranderd
            if (lastLoginState !== currentLoginState || lastUserEmail !== currentUserEmail) {
                console.log('Login status veranderd:', {
                    wasLoggedIn: lastLoginState,
                    nowLoggedIn: currentLoginState,
                    wasUser: lastUserEmail,
                    nowUser: currentUserEmail
                });
                
                // Update lokale state
                lastLoginState = currentLoginState;
                lastUserEmail = currentUserEmail;
                
                // Herlaad favorieten voor de (nieuwe) gebruiker
                this.favorieten = this.getFavorieten();
                
                // Update display als we op favorieten pagina zijn
                if (document.getElementById('favorietenContainer')) {
                    this.toonFavorieten();
                }
                this.updateFavorietenDisplay();
            }
        }, 1000);
    }

    // Haal favorieten op uit localStorage (alleen voor ingelogde gebruikers)
    getFavorieten() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userEmail = localStorage.getItem('userEmail');
        
        if (!isLoggedIn || !userEmail) {
            // Niet ingelogd = geen toegang tot permanente favorieten
            return [];
        }
        
        // Gebruik gebruiker-specifieke sleutel voor favorieten
        const favorietenKey = `favorieten_${userEmail}`;
        const saved = localStorage.getItem(favorietenKey);
        const result = saved ? JSON.parse(saved) : [];
        
        console.log(`Favorieten geladen voor ${userEmail}:`, result.length, 'items'); // Debug
        return result;
    }

    // Sla favorieten op in localStorage (alleen voor ingelogde gebruikers)
    saveFavorieten() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userEmail = localStorage.getItem('userEmail');
        
        if (!isLoggedIn || !userEmail) {
            console.warn('Kan permanente favorieten niet opslaan - gebruiker niet ingelogd');
            return;
        }
        
        // Gebruik gebruiker-specifieke sleutel voor favorieten
        const favorietenKey = `favorieten_${userEmail}`;
        localStorage.setItem(favorietenKey, JSON.stringify(this.favorieten));
        
        console.log(`Favorieten opgeslagen voor ${userEmail}:`, this.favorieten.length, 'items'); // Debug
    }

    // Haal tijdelijke favorieten op
    getTijdelijkeFavorieten() {
        const saved = localStorage.getItem('tijdelijkeFavorieten');
        return saved ? JSON.parse(saved) : [];
    }

    // Sla tijdelijke favorieten op
    saveTijdelijkeFavorieten(tijdelijke) {
        localStorage.setItem('tijdelijkeFavorieten', JSON.stringify(tijdelijke));
    }

    // Voeg favoriet toe (werkt voor iedereen)
    voegFavorietToe(stripmuur) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const tijdelijke = this.getTijdelijkeFavorieten();
        
        // Check eerst of het al bestaat in permanente favorieten
        const existsInPermanent = this.favorieten.find(fav => fav.id === stripmuur.id);
        if (existsInPermanent) {
            // Retourneer specifieke fout voor duplicaat
            return { success: false, type: 'duplicate-permanent', title: stripmuur.title };
        }
        
        // Check of het al bestaat in tijdelijke favorieten
        const existsInTijdelijk = tijdelijke.find(fav => fav.id === stripmuur.id);
        if (existsInTijdelijk) {
            // Retourneer specifieke fout voor duplicaat
            return { success: false, type: 'duplicate-temporary', title: stripmuur.title };
        }
        
        if (!isLoggedIn) {
            // Voor niet-ingelogde gebruikers: voeg toe aan tijdelijke favorieten
            tijdelijke.push(stripmuur);
            this.saveTijdelijkeFavorieten(tijdelijke);
            this.updateFavorietenDisplay();
            return { success: true, type: 'temporary', title: stripmuur.title };
        }

        // Voor ingelogde gebruikers: voeg toe aan permanente favorieten
        this.favorieten.push(stripmuur);
        this.saveFavorieten();
        this.updateFavorietenDisplay();
        return { success: true, type: 'permanent', title: stripmuur.title };
    }

    // Verwijder favoriet
    verwijderFavoriet(id) {
        this.favorieten = this.favorieten.filter(fav => fav.id !== id);
        this.saveFavorieten();
        this.updateFavorietenDisplay();
    }

    // Verwijder tijdelijke favoriet
    verwijderTijdelijkeFavoriet(id) {
        let tijdelijke = this.getTijdelijkeFavorieten();
        tijdelijke = tijdelijke.filter(fav => fav.id !== id);
        this.saveTijdelijkeFavorieten(tijdelijke);
        this.toonFavorieten();
    }

    // Check of een stripmuur een favoriet is (permanent of tijdelijk)
    isFavoriet(id) {
        const isPermanent = this.favorieten.some(fav => fav.id === id);
        const isTijdelijk = this.getTijdelijkeFavorieten().some(fav => fav.id === id);
        return isPermanent || isTijdelijk;
    }

        // Bewaar alle tijdelijke favorieten als permanente (voor ingelogde gebruikers)
    bewaarAlleTijdelijkeFavorieten() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userEmail = localStorage.getItem('userEmail');
        
        if (!isLoggedIn || !userEmail) {
            const currentLang = localStorage.getItem('language') || 'nl';
            alert(translations[currentLang].must_login_to_save);
            return;
        }

        const tijdelijke = this.getTijdelijkeFavorieten();
        if (tijdelijke.length === 0) {
            const currentLang = localStorage.getItem('language') || 'nl';
            alert(translations[currentLang].no_temp_favorites_to_save);
            return;
        }

        console.log(`Bewaren van ${tijdelijke.length} tijdelijke favorieten voor ${userEmail}`); // Debug

        // Herlaad huidige permanente favorieten (voor het geval er iets is veranderd)
        this.favorieten = this.getFavorieten();

        // Voeg alle tijdelijke favorieten toe aan permanente favorieten
        let nieuweItems = 0;
        tijdelijke.forEach(favoriet => {
            // Check voor duplicaten
            const exists = this.favorieten.find(fav => fav.id === favoriet.id);
            if (!exists) {
                this.favorieten.push(favoriet);
                nieuweItems++;
            }
        });

        // Sla permanente favorieten op
        this.saveFavorieten();
        
        // Verwijder tijdelijke favorieten
        localStorage.removeItem('tijdelijkeFavorieten');
        
        // Update display
        this.toonFavorieten();
        this.updateFavorietenDisplay();
        
        // Toon success melding
        const currentLang = localStorage.getItem('language') || 'nl';
        alert(translations[currentLang].temp_favorites_saved_success
            .replace('{count}', nieuweItems)
            .replace('{total}', tijdelijke.length)
            .replace('{user}', userEmail));
    }

    // Verwijder alle tijdelijke favorieten
    verwijderAlleTijdelijkeFavorieten() {
        const tijdelijke = this.getTijdelijkeFavorieten();
        const currentLang = localStorage.getItem('language') || 'nl';
        
        if (tijdelijke.length === 0) {
            alert(translations[currentLang].no_temp_favorites_to_remove);
            return;
        }

        if (confirm(`Weet je zeker dat je alle ${tijdelijke.length} tijdelijke favorieten wilt verwijderen?`)) {
            localStorage.removeItem('tijdelijkeFavorieten');
            this.toonFavorieten();
            this.updateFavorietenDisplay();
            alert(translations[currentLang].all_temp_favorites_removed);
        }
    }

    // Bewaard tijdelijke favorieten (oude functie - behouden voor compatibiliteit) als permanente (na login)
    bewijdTijdelijkeFavorieten() {
        const tijdelijke = this.getTijdelijkeFavorieten();
        tijdelijke.forEach(fav => {
            const exists = this.favorieten.find(existing => existing.id === fav.id);
            if (!exists) {
                this.favorieten.push(fav);
            }
        });
        this.saveFavorieten();
        
        // Verwijder tijdelijke favorieten
        localStorage.removeItem('tijdelijkeFavorieten');
        this.toonFavorieten();
    }

    // Toon favorieten op de favorieten pagina
    toonFavorieten() {
        console.log('🔍 toonFavorieten() aangeroepen'); // Debug
        const container = document.getElementById('favorietenContainer');
        if (!container) {
            console.error('❌ favorietenContainer element niet gevonden!'); // Debug
            return;
        }
        
        console.log('✅ favorietenContainer gevonden'); // Debug

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const tijdelijke = this.getTijdelijkeFavorieten();
        const permanenteFavorieten = this.favorieten;
        
        console.log('Toon favorieten - Ingelogd:', isLoggedIn); // Debug
        console.log('Tijdelijke favorieten:', tijdelijke.length); // Debug
        console.log('Permanente favorieten:', permanenteFavorieten.length); // Debug

        // Als er helemaal geen favorieten zijn
        if (permanenteFavorieten.length === 0 && tijdelijke.length === 0) {
            container.innerHTML = `
                <div class="geen-favorieten">
                    <h3>🤷‍♂️ Geen favorieten</h3>
                    <p data-i18n="no_favorites">Je hebt nog geen favorieten opgeslagen.</p>
                    <a href="parcours.html" class="button terug-button" data-i18n="back_to_murals">
                        ← Terug naar stripmuren
                    </a>
                </div>
            `;
            return;
        }

        let html = '';

        // Sectie voor tijdelijke favorieten (ALTIJD tonen als er zijn, ongeacht login status)
        if (tijdelijke.length > 0) {
            const currentLang = localStorage.getItem('language') || 'nl';
            html += `
                <div class="tijdelijke-favorieten-sectie">
                    <div class="bewaar-sectie" style="background: linear-gradient(135deg, #fff3e0, #ffe0b2); padding: 1.5rem; margin-bottom: 2rem; border-radius: 12px; border-left: 5px solid #ff9800; box-shadow: 0 4px 12px rgba(255,152,0,0.1);">
                        <h3 style="color: #f57c00; margin-bottom: 1rem;">⏳ ${translations[currentLang].temp_favorites_title} (${tijdelijke.length})</h3>
                        <p style="margin-bottom: 1rem; color: #555;">
                            ${isLoggedIn ? 
                                translations[currentLang].temp_saved_logged_in.replace('{count}', tijdelijke.length) :
                                translations[currentLang].temp_favorites_message.replace('{count}', tijdelijke.length)
                            }
                        </p>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; align-items: center;">
                            ${isLoggedIn ? 
                                `<button onclick="favorietenManager.bewaarAlleTijdelijkeFavorieten()" class="button" style="background: linear-gradient(135deg, #4caf50, #45a049); border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; box-shadow: 0 2px 8px rgba(76,175,80,0.3);">
                                    💾 ${translations[currentLang].save_all_favorites.replace('{count}', tijdelijke.length)}
                                </button>` :
                                `<a href="login.html" class="button" style="background: linear-gradient(135deg, #2196f3, #1976d2); border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; text-decoration: none; font-weight: bold; box-shadow: 0 2px 8px rgba(33,150,243,0.3); display: inline-block; text-align: center;">
                                    🔐 ${translations[currentLang].login_to_save}
                                </a>`
                            }
                            <button onclick="favorietenManager.verwijderAlleTijdelijkeFavorieten()" class="button" style="background: linear-gradient(135deg, #f44336, #d32f2f); border: none; padding: 0.75rem 1.5rem; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; box-shadow: 0 2px 8px rgba(244,67,54,0.3);">
                                🗑️ ${translations[currentLang].remove_all_temp}
                            </button>
                        </div>
                    </div>
                    
                    <h3 style="color: #ff9800; margin-bottom: 1rem;">⏳ ${translations[currentLang].temp_favorites_title}</h3>
                    <div class="parcours-container">
            `;
            
            tijdelijke.forEach(stripmuur => {
                html += this.createStripmuurCard(stripmuur, true, true); // tijdelijk = true
            });
            
            html += '</div></div>';
        }

        // Sectie voor permanente favorieten (alleen tonen als ingelogd EN er zijn permanente favorieten)
        if (isLoggedIn && permanenteFavorieten.length > 0) {
            html += `
                <div class="permanente-favorieten-sectie">
                    <h3 style="color: #4caf50; margin-bottom: 1rem;">✅ Opgeslagen Favorieten (${permanenteFavorieten.length})</h3>
                    <div class="parcours-container">
            `;
            
            permanenteFavorieten.forEach(stripmuur => {
                html += this.createStripmuurCard(stripmuur, true, false); // permanent = true
            });
            
            html += '</div></div>';
        }

        // Als er geen content is, toon een lege state
        if (html === '') {
            html = `
                <div class="geen-favorieten">
                    <h3>🤷‍♂️ Geen favorieten om te tonen</h3>
                    <p>Er zijn momenteel geen favorieten beschikbaar om te tonen.</p>
                    <a href="parcours.html" class="button terug-button">
                        ← Terug naar stripmuren
                    </a>
                </div>
            `;
        }

        console.log('📝 Generated HTML length:', html.length); // Debug
        console.log('📝 HTML preview:', html.substring(0, 200) + '...'); // Debug
        container.innerHTML = html;
        console.log('✅ HTML toegevoegd aan container'); // Debug
    }

    // Maak een stripmuur kaart (met verwijder optie voor favorieten)
    createStripmuurCard(stripmuur, showRemove = false, isTijdelijk = false) {
        console.log('🎨 createStripmuurCard aangeroepen voor:', stripmuur.id); // Debug
        const currentLang = localStorage.getItem('language') || 'nl';
        let removeButton = '';
        let tijdelijkLabel = '';
        
        // Check of translations object beschikbaar is
        if (typeof translations === 'undefined') {
            console.error('❌ Translations object niet beschikbaar in createStripmuurCard'); // Debug
            return '<div class="error">Translations not available</div>';
        }
        
        // Gebruik correcte data properties
        const titel = stripmuur.title || stripmuur.naam_fresco_nl || stripmuur.nom_de_la_fresque || 'Naam onbekend';
        const kunstenaar = stripmuur.dessinateur || stripmuur.artist || 'Onbekend';
        const locatie = stripmuur.adres || stripmuur.adresse || stripmuur.location || 'Locatie onbekend';
        const jaar = stripmuur.date || stripmuur.year || 'Onbekend';
        const beschrijving = stripmuur.description_nl || stripmuur.description_fr || stripmuur.description || translations[currentLang].noDescription;
        const afbeelding = stripmuur.image || 'img/placeholder.jpg';
        
        // Maak Google Maps link
        const mapLink = `https://www.google.com/maps?q=${encodeURIComponent(locatie)}`;
        
        if (showRemove) {
            if (isTijdelijk) {
                removeButton = `<button onclick="favorietenManager.verwijderTijdelijkeFavoriet(${stripmuur.id})" class="button" style="background-color: #ff9800;">
                    🗑️ ${translations[currentLang].remove_temp}
                </button>`;
                tijdelijkLabel = `<span class="tijdelijk-label" style="background: #ff9800; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-left: 8px;">${translations[currentLang].temporary_button}</span>`;
            } else {
                removeButton = `<button onclick="favorietenManager.verwijderFavoriet(${stripmuur.id})" class="button" style="background-color: #e53935;">
                    ❌ ${translations[currentLang].remove_permanent}
                </button>`;
                tijdelijkLabel = `<span class="permanent-label" style="background: #4caf50; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-left: 8px;">${translations[currentLang].saved_button}</span>`;
            }
        }
        
        return `
            <div class="muur-kaart">
                <img src="${afbeelding}" alt="${titel}" />
                <h3>${titel} ${tijdelijkLabel}</h3>
                <p><strong>${translations[currentLang].artist}:</strong> ${kunstenaar}</p>
                <p><strong>${translations[currentLang].locationLabel}:</strong> ${locatie}</p>
                <p><strong>${translations[currentLang].year}:</strong> ${jaar}</p>
                <p><strong>${translations[currentLang].description}:</strong> ${beschrijving}</p>
                <div class="kaart-acties">
                    <a href="${mapLink}" target="_blank" class="button">🗺️ ${translations[currentLang].openMap}</a>
                    ${removeButton}
                </div>
            </div>
        `;
    }

    // Update favoriet buttons op parcours pagina
    updateFavorietenDisplay() {
        // Update alle add/remove buttons
        const buttons = document.querySelectorAll('.favoriet-button');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const tijdelijke = this.getTijdelijkeFavorieten();
        
        buttons.forEach(button => {
            const id = parseInt(button.dataset.id);
            const isPermanent = this.favorieten.some(fav => fav.id === id);
            const isTijdelijk = tijdelijke.some(fav => fav.id === id);
            
            if (isPermanent) {
                const currentLang = localStorage.getItem('language') || 'nl';
                button.textContent = `⭐ ${translations[currentLang].saved_button}`;
                button.style.backgroundColor = '#4caf50';
                button.disabled = true;
            } else if (isTijdelijk) {
                const currentLang = localStorage.getItem('language') || 'nl';
                button.textContent = `🟡 ${translations[currentLang].temporary_button}`;
                button.style.backgroundColor = '#ff9800';
                button.disabled = true;
            } else {
                const currentLang = localStorage.getItem('language') || 'nl';
                button.textContent = `🌟 ${translations[currentLang].add}`;
                button.style.backgroundColor = '#e53935';
                button.disabled = false;
            }
        });
    }

    // Event listeners
    initEventListeners() {
        // Event listener wordt nu door parcours.js afgehandeld voor parcours pagina
        // Deze functie blijft voor andere pagina's waar het nodig zou zijn
    }

    // Haal stripmuur data op (gebruikt parcours.js data indien beschikbaar)
    getStripmuurData(id) {
        // Probeer eerst echte data uit parcours.js
        if (typeof getStripmuurById === 'function') {
            const realData = getStripmuurById(id);
            if (realData) return realData;
        }
        
        // Fallback naar placeholder data
        return {
            id: id,
            title: `Stripmuur ${id}`,
            artist: 'Voorbeeld Kunstenaar',
            location: 'Brussel',
            year: '2020',
            description: 'Voorbeeld beschrijving',
            image: 'img/placeholder.jpg',
            mapLink: 'https://maps.google.com'
        };
    }
}

// Functie om dashboard knop te tonen/verbergen
function updateDashboardButton() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const dashboardButton = document.querySelector('.navigation-buttons');
    
    if (dashboardButton) {
        if (isLoggedIn) {
            dashboardButton.style.display = 'block';
        } else {
            dashboardButton.style.display = 'none';
        }
    }
}

// Initialiseer favorieten manager
const favorietenManager = new FavorietenManager();

// Update display wanneer pagina laadt
document.addEventListener('DOMContentLoaded', () => {
    favorietenManager.toonFavorieten();
    favorietenManager.updateFavorietenDisplay();
    updateDashboardButton(); // Toon/verberg dashboard knop
    
    // Check bij page load of er tijdelijke favorieten zijn en de gebruiker nu ingelogd is
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        const tijdelijke = favorietenManager.getTijdelijkeFavorieten();
        if (tijdelijke.length > 0) {
            const confirmBewaar = confirm(`Je hebt ${tijdelijke.length} tijdelijke favoriet(en). Wil je deze nu permanent opslaan?`);
            if (confirmBewaar) {
                favorietenManager.bewijdTijdelijkeFavorieten();
                const currentLang = localStorage.getItem('language') || 'nl';
                alert(translations[currentLang].temp_favorites_saved_permanently);
            }
        }
    }
});
