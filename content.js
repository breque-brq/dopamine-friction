/**
 * BRQ-01: Dopamine Friction
 * Logic for scroll tracking and lockout interruption.
 */

let totalScroll = 0;
let lastY = window.scrollY;
let isBraking = false;
let scrollLimit = 3000; // Default

// Load current settings from storage
chrome.storage.local.get(['scrollLimit', 'strikes'], (result) => {
    if (result.scrollLimit) {
        scrollLimit = parseInt(result.scrollLimit);
    }
});

// ==========================================
// 1. OVERLAY DOM GENERATION
// ==========================================
// Pre-building the DOM element ensures there's zero rendering delay 
// when the brake triggers. Kept invisible until needed.
const overlay = document.createElement('div');
overlay.id = 'brq-brake-overlay';
document.body.appendChild(overlay);

// ==========================================
// 2. FRICTION ENGINE LOGIC
// ==========================================
/**
 * Triggers the brutalist overlay and locks the viewport.
 * Escalates the punishment (10s -> 5m) based on strike history to break the dopamine loop.
 */
function activateBrake() {
    if (isBraking) return; // Prevent double-triggering
    isBraking = true;
    totalScroll = 0; // Reset metrics for the next cycle

    
    // Check strikes from storage
    chrome.storage.local.get(['strikes'], (result) => {
        let strikes = result.strikes || 0;
        let duration = strikes === 0 ? 10 : 300; // 10s or 5min
        let message = '';
        let warning = '';

        if (strikes === 0) {
            message = "O scroll infinito vicia seu cérebro em dopamina barata. Você está em modo automático.";
            warning = "PRÓXIMA INTERRUPÇÃO: 5 MINUTOS.";
        } else {
            message = "FRICÇÃO TOTAL ATIVADA. Você ignorou os avisos. Sua consciência precisa de restauração.";
            warning = "BLOQUEIO DE SEGURANÇA ATIVO.";
        }

        overlay.innerHTML = `
            <div class="brq-message">${message}</div>
            <div class="brq-countdown" id="brq-timer">${duration}</div>
            <div class="brq-warning">${warning}</div>
            <div class="brq-sub">BRQ-01 // ORGANIZAÇÃO BRQ // ANTI QUO</div>
        `;

        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Lock scrolling
        
        let timeLeft = duration;
        const timerElement = document.getElementById('brq-timer');
        
        const interval = setInterval(() => {
            timeLeft--;
            timerElement.innerText = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(interval);
                deactivateBrake(strikes);
            }
        }, 1000);
    });
}

function deactivateBrake(currentStrikes) {
    isBraking = false;
    overlay.style.display = 'none';
    document.body.style.overflow = ''; // Unlock scrolling
    
    // Increment strikes
    chrome.storage.local.set({ strikes: currentStrikes + 1 });
    
    // Reset strikes after 1 hour of "good behavior" (no blocks)
    // Could be implemented here or in background, but for now simple increment.
}

// ==========================================
// 3. EVENT LISTENERS
// ==========================================
/**
 * Monitors Y-axis displacement.
 * Math.abs() guarantees capturing scroll distance even if the user scrolls upwards.
 * Option { passive: true } used to prevent performance hits natively.
 */
window.addEventListener('scroll', () => {
    if (isBraking) return;
    
    const currentY = window.scrollY;
    const delta = Math.abs(currentY - lastY);
    
    totalScroll += delta;
    lastY = currentY;
    
    if (totalScroll >= scrollLimit) {
        activateBrake();
    }
}, { passive: true });

// Listen for updates to the limit from options
chrome.storage.onChanged.addListener((changes) => {
    if (changes.scrollLimit) {
        scrollLimit = parseInt(changes.scrollLimit.newValue);
    }
});
