export default async function handler(req, res) {
  // A URL real fica escondida no servidor (Vercel Dashboard)
  const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!SCRIPT_URL) {
    return res.status(500).json({ error: 'Configuração de backend ausente' });
  }

  try {
    const options = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'POST' ? JSON.stringify(req.body) : null
    };

    const response = await fetch(SCRIPT_URL, options);
    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro de comunicação com a planilha' });
  }
}
