// Favorieten functionaliteit
class FavorietenManager {
    constructor() {
        this.favorieten = this.getFavorieten();
        this.initEventListeners();
    }

    // Haal favorieten op uit localStorage
    getFavorieten() {
        const saved = localStorage.getItem('favorieten');
        return saved ? JSON.parse(saved) : [];
    }

    // Sla favorieten op in localStorage
    saveFavorieten() {
        localStorage.setItem('favorieten', JSON.stringify(this.favorieten));
    }

    // Voeg favoriet toe (alleen als ingelogd)
    voegFavorietToe(stripmuur) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (!isLoggedIn) {
            alert('Je moet ingelogd zijn om favorieten toe te voegen. Ga naar Login om je aan te melden.');
            return false;
        }

        // Check of het al een favoriet is
        const exists = this.favorieten.find(fav => fav.id === stripmuur.id);
        if (exists) {
            alert('Deze stripmuur staat al in je favorieten!');
            return false;
        }

        // Voeg toe aan favorieten
        this.favorieten.push(stripmuur);
        this.saveFavorieten();
        alert('Stripmuur toegevoegd aan favorieten!');
        this.updateFavorietenDisplay();
        return true;
    }

    // Verwijder favoriet
    verwijderFavoriet(id) {
        this.favorieten = this.favorieten.filter(fav => fav.id !== id);
        this.saveFavorieten();
        this.updateFavorietenDisplay();
    }

    // Check of een stripmuur een favoriet is
    isFavoriet(id) {
        return this.favorieten.some(fav => fav.id === id);
    }

    // Toon favorieten op de favorieten pagina
    toonFavorieten() {
        const container = document.getElementById('favorietenContainer');
        if (!container) return;

        if (this.favorieten.length === 0) {
            container.innerHTML = `
                <div class="geen-favorieten">
                    <p data-i18n="no_favorites">Je hebt nog geen favorieten opgeslagen.</p>
                    <a href="parcours.html" class="terug-button" data-i18n="back_to_murals">
                        ← Terug naar stripmuren
                    </a>
                </div>
            `;
            return;
        }

        // Toon favorieten lijst
        let html = '<div class="parcours-container">';
        this.favorieten.forEach(stripmuur => {
            html += this.createStripmuurCard(stripmuur, true);
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    // Maak een stripmuur kaart (met verwijder optie voor favorieten)
    createStripmuurCard(stripmuur, showRemove = false) {
        const removeButton = showRemove ? 
            `<button onclick="favorietenManager.verwijderFavoriet(${stripmuur.id})" class="kaart-acties button" style="background-color: #e53935;">
                ❌ Verwijderen
            </button>` : '';

        return `
            <div class="muur-kaart">
                <img src="${stripmuur.image || 'img/placeholder.jpg'}" alt="${stripmuur.title}" />
                <h3>${stripmuur.title}</h3>
                <p><strong>Kunstenaar:</strong> ${stripmuur.artist || 'Onbekend'}</p>
                <p><strong>Locatie:</strong> ${stripmuur.location}</p>
                <p><strong>Jaar:</strong> ${stripmuur.year || 'Onbekend'}</p>
                <p><strong>Info:</strong> ${stripmuur.description || 'Geen beschrijving beschikbaar.'}</p>
                <div class="kaart-acties">
                    <a href="${stripmuur.mapLink}" target="_blank">🗺️ Open in Google Maps</a>
                    ${removeButton}
                </div>
            </div>
        `;
    }

    // Update favoriet buttons op parcours pagina
    updateFavorietenDisplay() {
        // Update alle add/remove buttons
        const buttons = document.querySelectorAll('.favoriet-button');
        buttons.forEach(button => {
            const id = parseInt(button.dataset.id);
            if (this.isFavoriet(id)) {
                button.textContent = '⭐ Favoriet';
                button.style.backgroundColor = '#ffa54d';
                button.disabled = true;
            } else {
                button.textContent = '🌟 Voeg toe';
                button.style.backgroundColor = '#e53935';
                button.disabled = false;
            }
        });
    }

    // Event listeners
    initEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('favoriet-button')) {
                const id = parseInt(e.target.dataset.id);
                const stripmuurData = this.getStripmuurData(id);
                if (stripmuurData) {
                    this.voegFavorietToe(stripmuurData);
                }
            }
        });
    }

    // Haal stripmuur data op (dit zou normaal uit de API komen)
    getStripmuurData(id) {
        // Placeholder - in werkelijkheid zou je dit uit je API of cached data halen
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

// Initialiseer favorieten manager
const favorietenManager = new FavorietenManager();

// Update display wanneer pagina laadt
document.addEventListener('DOMContentLoaded', () => {
    favorietenManager.toonFavorieten();
    favorietenManager.updateFavorietenDisplay();
});
