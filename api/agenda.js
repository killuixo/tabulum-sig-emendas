// api/agenda.js — Vercel Serverless Function
//
// Lê as agendas políticas da planilha "Dados_Agenda" (via Google Apps Script)
// e devolve JSON compacto para o TABULUM - Emendas.
// NADA sensível fica neste código: URL e token vêm das variáveis de ambiente da Vercel:
//   AGENDA_SCRIPT_URL    URL da implantação (Web app) do script da planilha de agenda
//   AGENDA_SCRIPT_TOKEN  mesmo valor de SHARED_SECRET configurado no script da agenda

const RE_CLASSE_PRIVADA = /pessoal|feriado|agenda bloqueada/i;

const chaveMun = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

async function lerAgendaViaScript(scriptUrl, scriptToken) {
  const resp = await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'agenda', token: scriptToken }),
    redirect: 'follow',
  });

  if (!resp.ok) throw new Error(`script_http_${resp.status}`);

  const texto = await resp.text();
  let json;
  try {
    json = JSON.parse(texto);
  } catch (e) {
    throw new Error('script_resposta_invalida');
  }

  if (json.status !== 'sucesso') {
    throw new Error(/negado/i.test(String(json.mensagem || '')) ? 'script_negado' : 'script_erro');
  }

  if (!Array.isArray(json.linhas)) {
    throw new Error('script_resposta_invalida');
  }

  return json;
}

function montarPayload(json) {
  const eventos = [];
  const munisUnicos = new Set();
  const anosSet = new Set();
  let comMunicipio = 0;

  for (const r of json.linhas) {
    if (!Array.isArray(r) || r.length < 2) continue;

    const data = String(r[0] || '').trim().slice(0, 10);
    const titulo = String(r[1] || '').trim().slice(0, 140);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !titulo) continue;

    const classe = String(r[3] || 'OUTROS EVENTOS').trim().toUpperCase();
    if (RE_CLASSE_PRIVADA.test(classe)) continue;

    const municipio = String(r[2] || '').replace(/\(online\)/ig, '').trim();
    const articulador = String(r[4] || '').trim();
    const duracao = Math.max(0, Math.round(Number(r[5]) || 0));
    const status = String(r[6] || 'Pendente').trim();
    const online = Number(r[7]) === 1 ? 1 : 0;

    if (municipio) {
      comMunicipio++;
      const k = chaveMun(municipio);
      if (k) munisUnicos.add(k);
    }
    anosSet.add(data.slice(0, 4));

    eventos.push([data, titulo, municipio, classe, articulador, duracao, status, online]);
  }

  // Mais recentes primeiro
  eventos.sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0));

  return {
    atualizadoEm: json.atualizadoEm || new Date().toISOString(),
    total: eventos.length,
    comMunicipio,
    municipiosUnicos: munisUnicos.size,
    anos: [...anosSet].sort(),
    campos: ['data', 'titulo', 'municipio', 'classe', 'articulador', 'duracao', 'status', 'online'],
    eventos,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');

  const scriptUrl = process.env.AGENDA_SCRIPT_URL;
  const scriptToken = process.env.AGENDA_SCRIPT_TOKEN;

  if (!scriptUrl || !scriptToken) {
    return res.status(503).json({
      erro: 'Fonte de agendas não configurada no servidor (AGENDA_SCRIPT_URL / AGENDA_SCRIPT_TOKEN ausentes).',
    });
  }

  try {
    const bruto = await lerAgendaViaScript(scriptUrl, scriptToken);
    const payload = montarPayload(bruto);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json(payload);
  } catch (e) {
    console.error('[agenda] falha:', e && e.message);
    const codigo = String((e && e.message) || 'erro');
    const dica = /script_negado/.test(codigo)
      ? 'O script recusou o token (AGENDA_SCRIPT_TOKEN precisa ser igual ao SHARED_SECRET do script da agenda).'
      : /script_resposta_invalida|script_http_/.test(codigo)
      ? 'Resposta inesperada do script da agenda (confira a URL da implantação, se publicou Nova versão e se o acesso é "Qualquer pessoa").'
      : /script_erro/.test(codigo)
      ? 'O script não conseguiu ler a aba Dados_Agenda.'
      : 'Falha ao ler a planilha de agendas.';
    return res.status(502).json({ erro: dica, codigo });
  }
}
