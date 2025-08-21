// zie commit bericht voor dashboard.js

// Dashboard en navigatie logica
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    
    // Check of gebruiker ingelogd is
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Toon user email op dashboard
    const emailSpan = document.getElementById('userEmail');
    if (emailSpan && userEmail) {
        emailSpan.textContent = userEmail;
    }
    
    // Logout functionaliteit
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Verwijder login data
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userType');
            localStorage.removeItem('userEmail');
            
            // Redirect naar home
            window.location.href = 'index.html';
        });
    }
});

// Globale functie voor navigatie update
function updateNavigation() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    
    // Update favorieten link gebaseerd op login status
    const favorietenLinks = document.querySelectorAll('a[href="favorieten.html"]');
    
    favorietenLinks.forEach(link => {
        // Als de link de class "action-button" heeft (dashboard knop), laat dan favorieten.html staan
        if (link.classList.contains('action-button')) {
            link.href = 'favorieten.html'; // Dashboard knop gaat naar favorieten pagina
            return;
        }
        
        // Voor navigatie links: ga naar dashboard of login
        if (isLoggedIn && userType === 'user') {
            // Voor ingelogde gebruikers: ga naar user dashboard
            link.href = 'user_dashboard.html';
        } else if (isLoggedIn && userType === 'admin') {
            // Voor admins: ga naar admin dashboard  
            link.href = 'admin_dashboard.html';
        } else {
            // Voor niet-ingelogde gebruikers: ga naar login
            link.href = 'login.html';
        }
    });
    
    // Update login/logout link
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    loginLinks.forEach(link => {
        if (isLoggedIn) {
            if (userType === 'user') {
                link.href = 'user_dashboard.html';
                link.setAttribute('data-i18n', 'dashboard');
            } else if (userType === 'admin') {
                link.href = 'admin_dashboard.html';
                link.setAttribute('data-i18n', 'admin_dashboard');
            }
        }
    });
}

// Update navigatie wanneer pagina laadt wordt nu door navigatie.js gedaan
// document.addEventListener('DOMContentLoaded', updateNavigation);
