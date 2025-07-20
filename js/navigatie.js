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

function updateNavigationLinks() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    
    // Favorieten link gaat ALTIJD naar favorieten.html
    // Gebruikers kunnen altijd hun favorieten bekijken
    const favorietenLinks = document.querySelectorAll('a[href="favorieten.html"], a[data-i18n="favorites"]');
    favorietenLinks.forEach(link => {
        link.href = 'favorieten.html';
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
