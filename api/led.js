export default async function handler(req, res) {
  const { command } = req.query;
  const espIP = req.headers['x-esp-ip'] || '192.168.1.100'; // IP di default
  
  try {
    const response = await fetch(`http://${espIP}/${command}`);
    const data = await response.text();
    
    res.status(200).send(data);
  } catch (error) {
    res.status(500).json({ error: 'Errore di connessione all\'ESP' });
  }
}