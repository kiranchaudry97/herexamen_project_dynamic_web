// commit bericht voor login.js

// Login functionaliteit
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Test credentials
    const credentials = {
        user: {
            email: 'gebruiker@brussel.be',
            password: 'user123',
            role: 'user'
        },
        admin: {
            email: 'admin@brussel.be',
            password: 'admin123',
            role: 'admin'
        }
    };
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');
        const role = formData.get('role');
        
        // Validatie
        let isValid = false;
        let userType = null;
        
        if (role === 'user' && email === credentials.user.email && password === credentials.user.password) {
            isValid = true;
            userType = 'user';
        } else if (role === 'admin' && email === credentials.admin.email && password === credentials.admin.password) {
            isValid = true;
            userType = 'admin';
        }
        
        if (isValid) {
            // Sla login status op
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userType', userType);
            localStorage.setItem('userEmail', email);
            
            // Redirect naar juiste dashboard
            if (userType === 'admin') {
                window.location.href = 'admin_dashboard.html';
            } else {
                window.location.href = 'user_dashboard.html';
            }
        } else {
            alert('Ongeldige inloggegevens. Probeer opnieuw.');
        }
    });
    
    // Auto-fill voor test
    const roleSelect = document.getElementById('role');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    roleSelect.addEventListener('change', function() {
        if (this.value === 'user') {
            emailInput.value = credentials.user.email;
            passwordInput.value = credentials.user.password;
        } else if (this.value === 'admin') {
            emailInput.value = credentials.admin.email;
            passwordInput.value = credentials.admin.password;
        } else {
            emailInput.value = '';
            passwordInput.value = '';
        }
    });
});
