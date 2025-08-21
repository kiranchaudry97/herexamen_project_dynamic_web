// js/navigatie.js
// Start button functionaliteit (alleen op homepage)
const startBtn = document.getElementById("startBtn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    window.location.href = "parcours.html";
  });
}

// Navigatie logica voor alle pagina's
document.addEventListener('DOMContentLoaded', function() {
    updateNavigationLinks();
    initHamburgerMenu();
});

// Hamburger menu functionaliteit
function initHamburgerMenu() {
    // Controleer of hamburger button bestaat, zo niet, maak hem aan
    let hamburger = document.querySelector('.hamburger');
    if (!hamburger) {
        createHamburgerButton();
        hamburger = document.querySelector('.hamburger');
    }
    
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Sluit menu bij klik op link
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
        
        // Sluit menu bij klik buiten menu
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
}

// Maak hamburger button aan als deze niet bestaat
function createHamburgerButton() {
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        const hamburger = document.createElement('button');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = '<span></span><span></span><span></span>';
        navContainer.appendChild(hamburger);
    }
}

// Functie om dialoog te tonen met opties voor niet-ingelogde gebruikers
function showFavorietenOptionsDialog() {
    const currentLang = localStorage.getItem('language') || 'nl';
    const translations = window.languageData || (typeof getTranslations === 'function' ? getTranslations() : null);
    
    if (!translations) {
        console.error('Translations not available');
        window.location.href = 'favorieten.html'; // Fallback naar standaard gedrag
        return;
    }
    
    // Maak dialog overlay
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    
    // Maak dialog box
    const dialog = document.createElement('div');
    dialog.className = 'dialog-box';
    dialog.style.background = 'white';
    dialog.style.borderRadius = '8px';
    dialog.style.padding = '20px';
    dialog.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    dialog.style.maxWidth = '90%';
    dialog.style.width = '400px';
    dialog.style.textAlign = 'center';
    
    // Dark mode ondersteuning
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    if (isDarkMode) {
        dialog.style.backgroundColor = '#333';
        dialog.style.color = '#fff';
    }
    
    // Inhoud dialog
    const title = document.createElement('h3');
    title.textContent = translations[currentLang].favorites_choice_title;
    title.style.marginTop = '0';
    
    const message = document.createElement('p');
    message.textContent = translations[currentLang].favorites_choice_message;
    
    // Knoppen container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'center';
    buttonsContainer.style.gap = '10px';
    buttonsContainer.style.marginTop = '15px';
    
    // Knop stijl functie
    function styleButton(btn, isPrimary) {
        btn.style.padding = '10px 15px';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        
        if (isPrimary) {
            btn.style.backgroundColor = '#3498db';
            btn.style.color = 'white';
        } else {
            if (isDarkMode) {
                btn.style.backgroundColor = '#555';
                btn.style.color = '#fff';
            } else {
                btn.style.backgroundColor = '#eee';
                btn.style.color = '#333';
            }
        }
    }
    
    // Maak knoppen
    const continueBtn = document.createElement('button');
    continueBtn.textContent = translations[currentLang].favorites_choice_continue;
    styleButton(continueBtn, true);
    continueBtn.onclick = function() {
        document.body.removeChild(overlay);
        window.location.href = 'favorieten.html';
    };
    
    const loginBtn = document.createElement('button');
    loginBtn.textContent = translations[currentLang].favorites_choice_login;
    styleButton(loginBtn, false);
    loginBtn.onclick = function() {
        document.body.removeChild(overlay);
        window.location.href = 'login.html';
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = translations[currentLang].favorites_choice_cancel;
    styleButton(cancelBtn, false);
    cancelBtn.onclick = function() {
        document.body.removeChild(overlay);
    };
    
    // Voeg knoppen toe aan container
    buttonsContainer.appendChild(continueBtn);
    buttonsContainer.appendChild(loginBtn);
    buttonsContainer.appendChild(cancelBtn);
    
    // Voeg alles toe aan dialog
    dialog.appendChild(title);
    dialog.appendChild(message);
    dialog.appendChild(buttonsContainer);
    
    // Voeg dialog toe aan overlay
    overlay.appendChild(dialog);
    
    // Voeg overlay toe aan body
    document.body.appendChild(overlay);
}

function updateNavigationLinks() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    
    // Favorieten links
    const favorietenLinks = document.querySelectorAll('a[href="favorieten.html"], a[data-i18n="favorites"]');
    favorietenLinks.forEach(link => {
        // Standaard gaat het naar favorieten.html
        link.href = 'favorieten.html';
        
        // Voeg een click event handler toe om niet-ingelogde gebruikers een keuze te geven
        if (!isLoggedIn) {
            link.addEventListener('click', function(e) {
                e.preventDefault(); // Voorkom standaard navigatie
                showFavorietenOptionsDialog();
            });
        }
    });
    
    // Update login link naar dashboard als ingelogd
    const loginLinks = document.querySelectorAll('a[href="login.html"], a[data-i18n="login"]');
    loginLinks.forEach(link => {
        if (isLoggedIn && userType === 'user') {
            link.href = 'user_dashboard.html';
            link.setAttribute('data-i18n', 'dashboard');
        } else if (isLoggedIn && userType === 'admin') {
            link.href = 'admin_dashboard.html';  
            link.setAttribute('data-i18n', 'admin_dashboard');
        } else {
            link.href = 'login.html';
            link.setAttribute('data-i18n', 'login');
        }
    });
    
    // Update tekst als taal systeem actief is
    setTimeout(() => {
        if (typeof applyLanguage === 'function') {
            const currentLang = localStorage.getItem('language') || 'nl';
            applyLanguage(currentLang);
        }
    }, 100);
}
