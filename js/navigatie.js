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
});

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
