// zie commit bericht voor admin_dashboard.js

// Admin Dashboard functionaliteit voor contact berichten
document.addEventListener('DOMContentLoaded', function() {
    // Check of gebruiker admin is
    const userType = localStorage.getItem('userType');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn || userType !== 'admin') {
        // Redirect naar login als niet admin
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Admin dashboard geladen');
    
    // Initialiseer dashboard
    initAdminDashboard();
    
    // Setup event listeners
    setupEventListeners();
    
    // Laad berichten
    laadContactBerichten();
    
    // Laad gebruikers favorieten
    laadGebruikersFavorieten();
    
    // Update statistieken
    updateStatistieken();
    updateFavorietenStatistieken();
});

function initAdminDashboard() {
    const adminEmail = localStorage.getItem('userEmail');
    const emailSpan = document.getElementById('adminEmail');
    if (emailSpan && adminEmail) {
        emailSpan.textContent = adminEmail;
    }
    
    console.log('Admin dashboard geïnitialiseerd voor:', adminEmail);
}

function setupEventListeners() {
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterBerichten);
    }
    
    // Refresh knop
    const refreshBtn = document.getElementById('refreshBerichten');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            laadContactBerichten();
            updateStatistieken();
            toonMelding('Berichten vernieuwd!', 'success');
        });
    }
    
    // Clear all knop
    const clearBtn = document.getElementById('clearAllBerichten');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Weet je zeker dat je ALLE contact berichten wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
                clearAlleBerichten();
            }
        });
    }
    
    // Favorieten event listeners
    const gebruikerFilter = document.getElementById('gebruikerFilter');
    if (gebruikerFilter) {
        gebruikerFilter.addEventListener('change', filterFavorieten);
    }
    
    const refreshFavorietenBtn = document.getElementById('refreshFavorieten');
    if (refreshFavorietenBtn) {
        refreshFavorietenBtn.addEventListener('click', () => {
            laadGebruikersFavorieten();
            updateFavorietenStatistieken();
            toonMelding('Favorieten vernieuwd!', 'success');
        });
    }
    
    const exportBtn = document.getElementById('exportFavorieten');
    if (exportBtn) {
        exportBtn.addEventListener('click', exporteerFavorieten);
    }
}

function getContactBerichten() {
    const saved = localStorage.getItem('contactBerichten');
    return saved ? JSON.parse(saved) : [];
}

function saveContactBerichten(berichten) {
    localStorage.setItem('contactBerichten', JSON.stringify(berichten));
}

function laadContactBerichten() {
    const berichten = getContactBerichten();
    const container = document.getElementById('berichtenContainer');
    
    if (!container) return;
    
    if (berichten.length === 0) {
        container.innerHTML = `
            <div class="geen-berichten">
                <h3>📭 Geen berichten</h3>
                <p>Er zijn nog geen contact berichten ontvangen.</p>
            </div>
        `;
        return;
    }
    
    // Sorteer berichten op datum (nieuwste eerst)
    berichten.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    let html = '';
    berichten.forEach((bericht, index) => {
        html += createBerichtCard(bericht, index);
    });
    
    container.innerHTML = html;
    
    console.log(`${berichten.length} berichten geladen`);
}

function createBerichtCard(bericht, index) {
    const datum = new Date(bericht.timestamp).toLocaleString('nl-NL');
    const statusClass = `status-${bericht.status}`;
    const statusIcon = getStatusIcon(bericht.status);
    const statusText = getStatusText(bericht.status);
    
    return `
        <div class="bericht-kaart ${statusClass}" data-index="${index}">
            <div class="bericht-header">
                <div class="bericht-info">
                    <h3>${bericht.voornaam} ${bericht.achternaam}</h3>
                    <p class="bericht-contact">
                        📧 <a href="mailto:${bericht.email}">${bericht.email}</a>
                    </p>
                    <p class="bericht-datum">📅 ${datum}</p>
                </div>
                <div class="bericht-status">
                    <span class="status-badge ${statusClass}">
                        ${statusIcon} ${statusText}
                    </span>
                </div>
            </div>
            
            <div class="bericht-content">
                <h4>💬 Bericht:</h4>
                <p class="opmerking">${bericht.opmerking}</p>
            </div>
            
            <div class="bericht-acties">
                <button onclick="stuurEmailAntwoord(${index})" class="button primary">
                    📧 E-mail antwoord
                </button>
                <button onclick="markeerAlsGelezen(${index})" class="button ${bericht.status === 'nieuw' ? '' : 'disabled'}">
                    👁️ Markeer als gelezen
                </button>
                <button onclick="markeerAlsBeantwoord(${index})" class="button ${bericht.status === 'beantwoord' ? 'disabled' : ''}">
                    ✅ Markeer als beantwoord
                </button>
                <button onclick="verwijderBericht(${index})" class="button danger">
                    🗑️ Verwijderen
                </button>
            </div>
        </div>
    `;
}

function getStatusIcon(status) {
    switch(status) {
        case 'nieuw': return '🆕';
        case 'gelezen': return '👁️';
        case 'beantwoord': return '✅';
        default: return '❓';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'nieuw': return 'Nieuw';
        case 'gelezen': return 'Gelezen';
        case 'beantwoord': return 'Beantwoord';
        default: return 'Onbekend';
    }
}

function markeerAlsGelezen(index) {
    const berichten = getContactBerichten();
    if (berichten[index] && berichten[index].status === 'nieuw') {
        berichten[index].status = 'gelezen';
        saveContactBerichten(berichten);
        laadContactBerichten();
        updateStatistieken();
        toonMelding('Bericht gemarkeerd als gelezen!', 'success');
    }
}

function markeerAlsBeantwoord(index) {
    const berichten = getContactBerichten();
    if (berichten[index] && berichten[index].status !== 'beantwoord') {
        berichten[index].status = 'beantwoord';
        saveContactBerichten(berichten);
        laadContactBerichten();
        updateStatistieken();
        toonMelding('Bericht gemarkeerd als beantwoord!', 'success');
    }
}

function verwijderBericht(index) {
    const berichten = getContactBerichten();
    const bericht = berichten[index];
    
    if (confirm(`Weet je zeker dat je het bericht van ${bericht.voornaam} ${bericht.achternaam} wilt verwijderen?`)) {
        berichten.splice(index, 1);
        saveContactBerichten(berichten);
        laadContactBerichten();
        updateStatistieken();
        toonMelding('Bericht verwijderd!', 'success');
    }
}

function stuurEmailAntwoord(index) {
    const berichten = getContactBerichten();
    const bericht = berichten[index];
    
    if (!bericht) {
        toonMelding('Bericht niet gevonden!', 'error');
        return;
    }
    
    // Maak een professionele e-mail template
    const onderwerp = `Re: Uw bericht via BrusselsExplorer website`;
    
    const emailBody = `Beste ${bericht.voornaam} ${bericht.achternaam},

Bedankt voor uw bericht via onze website. 

Uw oorspronkelijke bericht:
"${bericht.opmerking}"

[HIER UW ANTWOORD TYPEN]

Met vriendelijke groeten,
BrusselsExplorer Team

---
Brussels Explorer
info@brusselsexplorer.be
+32 2 123 45 67
Rue des Comics 1, 1000 Brussel, België`;

    // Maak mailto URL
    const mailtoUrl = `mailto:${bericht.email}?subject=${encodeURIComponent(onderwerp)}&body=${encodeURIComponent(emailBody)}`;
    
    try {
        // Open standaard e-mail client
        window.location.href = mailtoUrl;
        
        // Markeer automatisch als beantwoord na korte delay
        setTimeout(() => {
            if (confirm('Wilt u dit bericht markeren als beantwoord?')) {
                markeerAlsBeantwoord(index);
            }
        }, 1000);
        
        toonMelding('E-mail client geopend!', 'success');
    } catch (error) {
        console.error('Fout bij openen e-mail client:', error);
        toonMelding('Kon e-mail client niet openen. Kopieer handmatig: ' + bericht.email, 'error');
    }
}

function clearAlleBerichten() {
    localStorage.removeItem('contactBerichten');
    laadContactBerichten();
    updateStatistieken();
    toonMelding('Alle berichten verwijderd!', 'warning');
}

function filterBerichten() {
    const filter = document.getElementById('statusFilter').value;
    const berichtKaarten = document.querySelectorAll('.bericht-kaart');
    
    berichtKaarten.forEach(kaart => {
        if (filter === 'alle') {
            kaart.style.display = 'block';
        } else {
            const hasClass = kaart.classList.contains(`status-${filter}`);
            kaart.style.display = hasClass ? 'block' : 'none';
        }
    });
    
    console.log(`Filter toegepast: ${filter}`);
}

function updateStatistieken() {
    const berichten = getContactBerichten();
    
    const totaal = berichten.length;
    const nieuw = berichten.filter(b => b.status === 'nieuw').length;
    const gelezen = berichten.filter(b => b.status === 'gelezen').length;
    const beantwoord = berichten.filter(b => b.status === 'beantwoord').length;
    
    // Update DOM elementen
    updateStatElement('totaalBerichten', totaal);
    updateStatElement('nieuweBerichten', nieuw);
    updateStatElement('gelezenBerichten', gelezen);
    updateStatElement('beantwoordeBerichten', beantwoord);
    
    console.log('Statistieken bijgewerkt:', { totaal, nieuw, gelezen, beantwoord });
}

function updateStatElement(id, waarde) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = waarde;
        
        // Animatie toevoegen
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
}

function toonMelding(bericht, type = 'info') {
    // Verwijder bestaande meldingen
    const bestaandeMelding = document.querySelector('.admin-melding');
    if (bestaandeMelding) {
        bestaandeMelding.remove();
    }
    
    // Maak nieuwe melding
    const melding = document.createElement('div');
    melding.className = `admin-melding melding-${type}`;
    melding.textContent = bericht;
    
    // Styling
    melding.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
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
            melding.style.backgroundColor = '#4CAF50';
            break;
        case 'warning':
            melding.style.backgroundColor = '#FF9800';
            break;
        case 'error':
            melding.style.backgroundColor = '#f44336';
            break;
        default:
            melding.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(melding);
    
    // Auto-verwijderen na 3 seconden
    setTimeout(() => {
        if (melding.parentNode) {
            melding.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => melding.remove(), 300);
        }
    }, 3000);
}

// Auto-refresh berichten elke 30 seconden
setInterval(() => {
    updateStatistieken();
}, 30000);

// ========== GEBRUIKERS FAVORIETEN FUNCTIES ========== 

function getAlleGebruikersFavorieten() {
    const alleFavorieten = [];
    
    // Doorloop alle localStorage keys om favorieten te vinden
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('favorieten_')) {
            const email = key.replace('favorieten_', '');
            const favorieten = JSON.parse(localStorage.getItem(key) || '[]');
            
            if (favorieten.length > 0) {
                alleFavorieten.push({
                    gebruiker: email,
                    favorieten: favorieten,
                    aantal: favorieten.length,
                    laatsteUpdate: getLaatsteUpdateTijd(key)
                });
            }
        }
    }
    
    return alleFavorieten;
}

function getLaatsteUpdateTijd(key) {
    // Probeer laatste wijziging tijd te krijgen (als opgeslagen)
    const updateKey = key + '_lastUpdate';
    const saved = localStorage.getItem(updateKey);
    if (saved) {
        return new Date(saved);
    }
    
    // Fallback naar huidige tijd
    return new Date();
}

function laadGebruikersFavorieten() {
    const alleFavorieten = getAlleGebruikersFavorieten();
    const container = document.getElementById('favorietenContainer');
    const gebruikerFilter = document.getElementById('gebruikerFilter');
    
    if (!container) return;
    
    // Update gebruiker filter
    if (gebruikerFilter) {
        const currentValue = gebruikerFilter.value;
        gebruikerFilter.innerHTML = '<option value="alle">Alle gebruikers</option>';
        
        alleFavorieten.forEach(userData => {
            const option = document.createElement('option');
            option.value = userData.gebruiker;
            option.textContent = `${userData.gebruiker} (${userData.aantal})`;
            gebruikerFilter.appendChild(option);
        });
        
        gebruikerFilter.value = currentValue;
    }
    
    if (alleFavorieten.length === 0) {
        container.innerHTML = `
            <div class="geen-favorieten">
                <h3>⭐ Geen favorieten</h3>
                <p>Er zijn nog geen favorieten toegevoegd door gebruikers.</p>
            </div>
        `;
        return;
    }
    
    // Sorteer op aantal favorieten (meeste eerst)
    alleFavorieten.sort((a, b) => b.aantal - a.aantal);
    
    let html = '';
    alleFavorieten.forEach((userData, index) => {
        html += createGebruikerFavorietenCard(userData, index);
    });
    
    container.innerHTML = html;
    
    console.log(`${alleFavorieten.length} gebruikers met favorieten geladen`);
}

function createGebruikerFavorietenCard(userData, index) {
    const laatsteUpdate = userData.laatsteUpdate.toLocaleString('nl-NL');
    
    let favorietenHtml = '';
    userData.favorieten.forEach((favoriet, fIndex) => {
        const naam = favoriet.title || favoriet.naam_fresco_nl || favoriet.nom_de_la_fresque || 'Naamloos';
        const kunstenaar = favoriet.dessinateur || 'Onbekende kunstenaar';
        const locatie = favoriet.adres || favoriet.adresse || 'Locatie onbekend';
        
        favorietenHtml += `
            <div class="favoriet-item">
                <div class="favoriet-info">
                    <span class="favoriet-naam">${naam}</span>
                    <span class="favoriet-details">${kunstenaar} - ${locatie}</span>
                </div>
                <button onclick="verwijderFavorietVanGebruiker('${userData.gebruiker}', ${fIndex})" 
                        class="button danger kleine-btn" title="Verwijder favoriet">
                    🗑️
                </button>
            </div>
        `;
    });
    
    return `
        <div class="gebruiker-favorieten-kaart" data-gebruiker="${userData.gebruiker}">
            <div class="gebruiker-header">
                <div class="gebruiker-info">
                    <h3>👤 ${userData.gebruiker}</h3>
                    <p class="gebruiker-stats">
                        ⭐ ${userData.aantal} favorieten | 📅 Laatste update: ${laatsteUpdate}
                    </p>
                </div>
                <div class="gebruiker-acties">
                    <button onclick="exporteerGebruikerFavorieten('${userData.gebruiker}')" 
                            class="button">📊 Export</button>
                    <button onclick="verwijderAlleGebruikerFavorieten('${userData.gebruiker}')" 
                            class="button danger">🗑️ Wis alles</button>
                </div>
            </div>
            
            <div class="favorieten-lijst">
                <h4>⭐ Favorieten:</h4>
                <div class="favorieten-items">
                    ${favorietenHtml}
                </div>
            </div>
        </div>
    `;
}

function filterFavorieten() {
    const filter = document.getElementById('gebruikerFilter').value;
    const gebruikerKaarten = document.querySelectorAll('.gebruiker-favorieten-kaart');
    
    gebruikerKaarten.forEach(kaart => {
        if (filter === 'alle') {
            kaart.style.display = 'block';
        } else {
            const gebruiker = kaart.dataset.gebruiker;
            kaart.style.display = gebruiker === filter ? 'block' : 'none';
        }
    });
    
    console.log(`Favorieten filter toegepast: ${filter}`);
}

function verwijderFavorietVanGebruiker(gebruikerEmail, favorietIndex) {
    const key = `favorieten_${gebruikerEmail}`;
    const favorieten = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (favorietIndex >= 0 && favorietIndex < favorieten.length) {
        const favoriet = favorieten[favorietIndex];
        
        if (confirm(`Weet je zeker dat je "${favoriet.naam}" wilt verwijderen van ${gebruikerEmail}?`)) {
            favorieten.splice(favorietIndex, 1);
            localStorage.setItem(key, JSON.stringify(favorieten));
            
            // Update laatste wijziging tijd
            localStorage.setItem(key + '_lastUpdate', new Date().toISOString());
            
            laadGebruikersFavorieten();
            updateFavorietenStatistieken();
            toonMelding('Favoriet verwijderd!', 'success');
        }
    }
}

function verwijderAlleGebruikerFavorieten(gebruikerEmail) {
    const key = `favorieten_${gebruikerEmail}`;
    
    if (confirm(`Weet je zeker dat je ALLE favorieten van ${gebruikerEmail} wilt verwijderen?`)) {
        localStorage.removeItem(key);
        localStorage.removeItem(key + '_lastUpdate');
        
        laadGebruikersFavorieten();
        updateFavorietenStatistieken();
        toonMelding(`Alle favorieten van ${gebruikerEmail} verwijderd!`, 'warning');
    }
}

function exporteerGebruikerFavorieten(gebruikerEmail) {
    const key = `favorieten_${gebruikerEmail}`;
    const favorieten = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (favorieten.length === 0) {
        toonMelding('Geen favorieten om te exporteren!', 'warning');
        return;
    }
    
    // Uitgebreide CSV headers met alle stripmuur informatie
    let csvContent = "ID,Naam_NL,Naam_FR,Kunstenaar,Adres,Jaar,Beschrijving_NL,Beschrijving_FR,Coordinaten\n";
    
    favorieten.forEach(favoriet => {
        const row = [
            favoriet.id || '',
            favoriet.title || favoriet.naam_fresco_nl || '',
            favoriet.nom_de_la_fresque || '',
            favoriet.dessinateur || 'Onbekend',
            favoriet.adres || favoriet.adresse || '',
            favoriet.date || '',
            (favoriet.description_nl || favoriet.info_nl || '').replace(/\n/g, ' ').replace(/\r/g, ''),
            (favoriet.description_fr || favoriet.info_fr || '').replace(/\n/g, ' ').replace(/\r/g, ''),
            favoriet.coordonnees_geographiques || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        csvContent += row + "\n";
    });
    
    // Download bestand
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `favorieten_${gebruikerEmail}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toonMelding(`Uitgebreide favorieten van ${gebruikerEmail} geëxporteerd!`, 'success');
}

function exporteerFavorieten() {
    const alleFavorieten = getAlleGebruikersFavorieten();
    
    if (alleFavorieten.length === 0) {
        toonMelding('Geen favorieten om te exporteren!', 'warning');
        return;
    }
    
    // Uitgebreide CSV headers voor alle gebruikers met complete stripmuur data
    let csvContent = "Gebruiker,ID,Naam_NL,Naam_FR,Kunstenaar,Adres,Jaar,Beschrijving_NL,Beschrijving_FR,Coordinaten,Toegevoegd_Op\n";
    
    alleFavorieten.forEach(userData => {
        userData.favorieten.forEach(favoriet => {
            const row = [
                userData.gebruiker,
                favoriet.id || '',
                favoriet.title || favoriet.naam_fresco_nl || '',
                favoriet.nom_de_la_fresque || '',
                favoriet.dessinateur || 'Onbekend',
                favoriet.adres || favoriet.adresse || '',
                favoriet.date || '',
                (favoriet.description_nl || favoriet.info_nl || '').replace(/\n/g, ' ').replace(/\r/g, ''),
                (favoriet.description_fr || favoriet.info_fr || '').replace(/\n/g, ' ').replace(/\r/g, ''),
                favoriet.coordonnees_geographiques || '',
                userData.laatsteUpdate.toISOString()
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
            csvContent += row + "\n";
        });
    });
    
    // Download bestand
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alle_favorieten_compleet_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toonMelding('Alle favorieten met volledige informatie geëxporteerd!', 'success');
}

function updateFavorietenStatistieken() {
    const alleFavorieten = getAlleGebruikersFavorieten();
    
    const totaalGebruikers = alleFavorieten.length;
    const totaalFavorieten = alleFavorieten.reduce((sum, user) => sum + user.aantal, 0);
    const gemiddeldFavorieten = totaalGebruikers > 0 ? Math.round(totaalFavorieten / totaalGebruikers) : 0;
    
    // Update existing statistieken of voeg nieuwe toe
    updateStatElement('totaalGebruikers', totaalGebruikers);
    updateStatElement('totaalFavorieten', totaalFavorieten);
    updateStatElement('gemiddeldFavorieten', gemiddeldFavorieten);
    
    console.log('Favorieten statistieken bijgewerkt:', { 
        totaalGebruikers, 
        totaalFavorieten, 
        gemiddeldFavorieten 
    });
}
