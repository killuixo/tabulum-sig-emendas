// ============================================================================
// Proxy seguro da Central de LEADS (somente agregados anonimizados / LGPD)
// Variáveis de ambiente exigidas na Vercel:
//   - LEADS_SCRIPT_URL   (URL /exec do Web App da planilha Central de LEADS)
//   - LEADS_SCRIPT_TOKEN (mesmo valor de SHARED_SECRET nas Propriedades do Script)
// ============================================================================

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const url = process.env.LEADS_SCRIPT_URL;
  const token = process.env.LEADS_SCRIPT_TOKEN;

  if (!url || !token) {
    return res.status(500).json({
      erro: 'Variáveis LEADS_SCRIPT_URL ou LEADS_SCRIPT_TOKEN não configuradas na Vercel.',
    });
  }

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
      return res.status(502).json({
        erro: 'Resposta inválida do Apps Script de leads (verifique se publicou Nova Versão como "Qualquer pessoa").',
      });
    }

    if (dados && (dados.erro || dados.error)) {
      const msg = dados.erro || dados.error;
      const status = msg === 'Não autorizado' ? 401 : 502;
      return res.status(status).json({ erro: msg });
    }

    // Trava extra de privacidade (defense in depth): garante formato agregado e zero PII
    if (!dados || !Array.isArray(dados.grupos) || Array.isArray(dados)) {
      return res.status(502).json({ erro: 'Formato inesperado retornado pelo servidor de leads.' });
    }

    const semCache = req.query && req.query.teste === '1';
    res.setHeader(
      'Cache-Control',
      semCache ? 'no-store' : 's-maxage=300, stale-while-revalidate=3600'
    );

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
