/**
 * BRQ-01: Options Logic
 */

const saveButton = document.getElementById('save');
const scrollInput = document.getElementById('scrollLimit');
const statusDisplay = document.getElementById('status');

// Restore settings
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['scrollLimit'], (result) => {
        if (result.scrollLimit) {
            scrollInput.value = result.scrollLimit;
        }
    });
});

// Save settings
saveButton.addEventListener('click', () => {
    const limit = scrollInput.value;
    
    chrome.storage.local.set({ scrollLimit: limit }, () => {
        statusDisplay.innerText = 'CONFIGURAÇÃO SALVA';
        
        // Clear status after 2 seconds
        setTimeout(() => {
            statusDisplay.innerText = '';
        }, 2000);
    });
});
