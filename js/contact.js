// Contact formulier functionaliteit
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Verzamel formulier data
            const formData = {
                id: Date.now(), // Unieke ID gebaseerd op timestamp
                timestamp: new Date().toISOString(),
                voornaam: document.getElementById('voornaam').value,
                achternaam: document.getElementById('achternaam').value,
                email: document.getElementById('email').value,
                telefoon: document.getElementById('telefoon').value,
                opmerking: document.getElementById('opmerking').value,
                status: 'nieuw' // Status: nieuw, gelezen, beantwoord
            };
            
            console.log('Contact formulier ingediend:', formData);
            
            // Sla bericht op in localStorage
            slaContactBerichtOp(formData);
            
            // Toon success melding
            toonSuccesMelding();
            
            // Reset formulier
            contactForm.reset();
        });
    }
});

function slaContactBerichtOp(bericht) {
    // Haal bestaande berichten op
    let berichten = getContactBerichten();
    
    // Voeg nieuw bericht toe
    berichten.unshift(bericht); // Voeg toe aan het begin (nieuwste eerst)
    
    // Sla op in localStorage
    localStorage.setItem('contactBerichten', JSON.stringify(berichten));
    
    console.log(`Contact bericht opgeslagen. Totaal berichten: ${berichten.length}`);
}

function getContactBerichten() {
    const saved = localStorage.getItem('contactBerichten');
    return saved ? JSON.parse(saved) : [];
}

function toonSuccesMelding() {
    // Verwijder bestaande melding
    const bestaandeMelding = document.querySelector('.contact-success');
    if (bestaandeMelding) {
        bestaandeMelding.remove();
    }
    
    // Maak nieuwe success melding
    const melding = document.createElement('div');
    melding.className = 'contact-success';
    melding.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            margin: 1rem 0;
            text-align: center;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            animation: slideInFromTop 0.5s ease-out;
        ">
            ✅ Bedankt! Je bericht is succesvol verzonden. We nemen zo spoedig mogelijk contact met je op.
        </div>
    `;
    
    // Voeg toe na het formulier
    const contactForm = document.getElementById('contactForm');
    contactForm.parentNode.insertBefore(melding, contactForm.nextSibling);
    
    // Verwijder melding na 5 seconden
    setTimeout(() => {
        if (melding.parentNode) {
            melding.style.animation = 'slideOutToTop 0.5s ease-in';
            setTimeout(() => melding.remove(), 500);
        }
    }, 5000);
}

// CSS animaties toevoegen
if (!document.querySelector('#contact-animations')) {
    const style = document.createElement('style');
    style.id = 'contact-animations';
    style.textContent = `
        @keyframes slideInFromTop {
            from { 
                transform: translateY(-100%); 
                opacity: 0; 
            }
            to { 
                transform: translateY(0); 
                opacity: 1; 
            }
        }
        @keyframes slideOutToTop {
            from { 
                transform: translateY(0); 
                opacity: 1; 
            }
            to { 
                transform: translateY(-100%); 
                opacity: 0; 
            }
        }
    `;
    document.head.appendChild(style);
}

// Exporteer functies voor admin gebruik
window.contactFuncties = {
    getContactBerichten,
    slaContactBerichtOp
};
