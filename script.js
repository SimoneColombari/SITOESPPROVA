document.addEventListener('DOMContentLoaded', () => {
    const ipInput = document.getElementById('ip');
    const connectBtn = document.getElementById('connect');
    const onBtn = document.getElementById('onBtn');
    const offBtn = document.getElementById('offBtn');
    const blinkBtn = document.getElementById('blinkBtn');
    const ledVisual = document.getElementById('ledVisual');
    const status = document.getElementById('status');
    
    let espIP = '';
    
    // Aggiorna stato visuale LED
    function updateLED(state) {
        ledVisual.className = 'led';
        if (state === 'on') ledVisual.classList.add('on');
        if (state === 'blink') ledVisual.classList.add('blink');
    }
    
    // Invia comando all'ESP
    function sendCommand(command) {
        if (!espIP) {
            status.textContent = 'IP non configurato!';
            return;
        }
        
        status.textContent = 'Invio comando...';
        fetch(`http://${espIP}/${command}`)
            .then(response => {
                if (response.ok) {
                    status.textContent = 'Comando inviato!';
                    updateLED(command);
                } else {
                    status.textContent = 'Errore di connessione';
                }
            })
            .catch(error => {
                status.textContent = 'Errore di rete';
                console.error('Errore:', error);
            });
    }
    
    // Event listeners
    connectBtn.addEventListener('click', () => {
        espIP = ipInput.value.trim();
        if (espIP) {
            status.textContent = 'Connesso a ' + espIP;
            status.classList.add('connected');
        } else {
            status.textContent = 'Inserisci un IP valido!';
        }
    });
    
    onBtn.addEventListener('click', () => sendCommand('on'));
    offBtn.addEventListener('click', () => sendCommand('off'));
    blinkBtn.addEventListener('click', () => sendCommand('blink'));
});