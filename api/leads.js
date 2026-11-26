// ============================================================================
// Proxy seguro da Central de LEADS
// - GET  : retorna apenas agregados anonimizados (público para o painel)
// - POST : retorna lista nominal filtrada por município(s)/tema (exige senha)
//
// Variáveis de ambiente exigidas na Vercel:
//   - LEADS_SCRIPT_URL    (URL /exec do Web App da Central de LEADS)
//   - LEADS_SCRIPT_TOKEN  (mesmo valor de SHARED_SECRET nas Propriedades do Script)
//   - LEADS_ADMIN_PASSWORD (senha para destravar lista nominal nas Fichas)
// ============================================================================
import crypto from 'crypto';

function senhaIgual(a, b) {
  const ba = Buffer.from(String(a || ''), 'utf8');
  const bb = Buffer.from(String(b || ''), 'utf8');
  if (ba.length === 0 || ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const url = process.env.LEADS_SCRIPT_URL;
  const token = process.env.LEADS_SCRIPT_TOKEN;

  if (!url || !token) {
    return res.status(500).json({
      erro: 'Variáveis LEADS_SCRIPT_URL ou LEADS_SCRIPT_TOKEN não configuradas na Vercel.',
    });
  }

  // --------------------------------------------------------------------------
  // GET: Agregados anonimizados (sem PII)
  // --------------------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tabulum_leads_agregado', token }),
        redirect: 'follow',
      });

      if (!resp.ok) {
        return res.status(502).json({ erro: `Servidor de leads respondeu HTTP ${resp.status}` });
      }

      const texto = await resp.text();
      let dados;
      try {
        dados = JSON.parse(texto);
      } catch (e) {
        return res.status(502).json({ erro: 'Resposta inválida do Apps Script de leads.' });
      }

      if (dados && (dados.erro || dados.error)) {
        const msg = dados.erro || dados.error;
        return res.status(msg === 'Não autorizado' ? 401 : 502).json({ erro: msg });
      }

      if (!dados || !Array.isArray(dados.grupos) || Array.isArray(dados)) {
        return res.status(502).json({ erro: 'Formato inesperado retornado pelo servidor de leads.' });
      }

      const semCache = req.query && req.query.teste === '1';
      res.setHeader('Cache-Control', semCache ? 'no-store' : 's-maxage=300, stale-while-revalidate=3600');

      return res.status(200).json({
        atualizadoEm: dados.atualizadoEm || new Date().toISOString(),
        totalBruto: Number(dados.totalBruto) || 0,
        ignoradosRepetidos: Number(dados.ignoradosRepetidos) || 0,
        totalValidos: Number(dados.totalValidos) || 0,
        comMunicipio: Number(dados.comMunicipio) || 0,
        municipiosUnicos: Number(dados.municipiosUnicos) || 0,
        campos: ['municipio', 'uf', 'bairro', 'tema', 'origem', 'qtd'],
        grupos: dados.grupos.map((g) => [
          String(g[0] || ''),
          String(g[1] || ''),
          String(g[2] || ''),
          String(g[3] || ''),
          String(g[4] || ''),
          Number(g[5]) || 0,
        ]),
      });
    } catch (err) {
      return res.status(502).json({ erro: `Falha ao consultar servidor de leads: ${err.message}` });
    }
  }

  // --------------------------------------------------------------------------
  // POST: Lista nominal restrita por senha (LGPD — sem cache, sem CPF)
  // --------------------------------------------------------------------------
  if (req.method === 'POST') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    const adminPass = process.env.LEADS_ADMIN_PASSWORD;
    if (!adminPass) {
      return res.status(500).json({
        erro: 'Variável LEADS_ADMIN_PASSWORD não configurada na Vercel.',
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (!senhaIgual(body.password, adminPass)) {
      return res.status(401).json({ erro: 'Senha incorreta para acesso aos contatos nominais.' });
    }

    const municipios = Array.isArray(body.municipios) ? body.municipios.slice(0, 300) : [];
    const tema = String(body.tema || '').trim();
    if (!municipios.length && !tema) {
      return res.status(400).json({ erro: 'Informe município(s) ou tema para consulta.' });
    }

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tabulum_leads_nominal',
          token,
          municipios,
          tema,
        }),
        redirect: 'follow',
      });

      if (!resp.ok) {
        return res.status(502).json({ erro: `Servidor de leads respondeu HTTP ${resp.status}` });
      }

      const texto = await resp.text();
      let dados;
      try {
        dados = JSON.parse(texto);
      } catch (e) {
        return res.status(502).json({ erro: 'Resposta inválida do Apps Script (publique Nova Versão).' });
      }

      if (dados && (dados.erro || dados.error)) {
        const msg = dados.erro || dados.error;
        return res.status(msg === 'Não autorizado' ? 401 : 502).json({ erro: msg });
      }

      if (!dados || !Array.isArray(dados.contatos)) {
        return res.status(502).json({ erro: 'Formato inesperado na resposta nominal.' });
      }

      // Sanitiza campos permitidos (garante ausência de CPF)
      const contatos = dados.contatos.map((c) => ({
        id: Number(c.id) || 0,
        nome: String(c.nome || ''),
        municipio: String(c.municipio || ''),
        bairro: String(c.bairro || ''),
        uf: String(c.uf || ''),
        whatsapp: String(c.whatsapp || ''),
        email: String(c.email || ''),
        tema: String(c.tema || ''),
        origem: String(c.origem || ''),
        status: String(c.status || ''),
        observacoes: String(c.observacoes || ''),
      }));

      return res.status(200).json({
        atualizadoEm: dados.atualizadoEm || new Date().toISOString(),
        total: contatos.length,
        contatos,
      });
    } catch (err) {
      return res.status(502).json({ erro: `Falha ao buscar contatos nominais: ${err.message}` });
    }
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
