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
    async function sendCommand(command) {
        if (!espIP) {
            status.textContent = 'IP non configurato!';
            return;
        }
        
        status.textContent = 'Invio comando...';
        
        try {
            // Prima prova con fetch API
            const response = await fetch(`http://${espIP}/${command}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                status.textContent = 'Comando inviato!';
                updateLED(command);
            } else {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error('Errore fetch:', error);
            
            // Fallback: prova con JSONP per bypassare CORS
            status.textContent = 'Tentativo alternativo...';
            jsonpRequest(espIP, command);
        }
    }
    
    // Funzione JSONP per bypassare CORS
    function jsonpRequest(ip, command) {
        return new Promise((resolve, reject) => {
            const callbackName = `jsonp_callback_${Date.now()}`;
            const script = document.createElement('script');
            
            // Rimuovi eventuali callback precedenti
            window[callbackName] = function(data) {
                delete window[callbackName];
                document.body.removeChild(script);
                
                if (data.status === 'success') {
                    status.textContent = 'Comando inviato!';
                    updateLED(command);
                    resolve(data);
                } else {
                    status.textContent = 'Errore di risposta';
                    reject(new Error('Risposta non valida'));
                }
            };
            
            // Imposta timeout
            const timeout = setTimeout(() => {
                delete window[callbackName];
                document.body.removeChild(script);
                status.textContent = 'Timeout di connessione';
                reject(new Error('Timeout'));
            }, 5000);
            
            // Crea URL con callback
            const url = `http://${ip}/${command}?callback=${callbackName}`;
            script.src = url;
            script.onerror = () => {
                clearTimeout(timeout);
                delete window[callbackName];
                document.body.removeChild(script);
                status.textContent = 'Errore di connessione';
                reject(new Error('Errore di rete'));
            };
            
            document.body.appendChild(script);
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