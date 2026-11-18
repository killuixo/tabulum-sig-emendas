// api/eleitoral.js  —  Vercel Serverless Function
//
// Lê a aba "Municípios" da planilha de votação (Google Sheets) e devolve JSON
// enxuto para o app. NADA sensível fica no código: o ID da planilha e as
// credenciais vêm de variáveis de ambiente (Vercel > Settings > Environment Variables).
//
// Variáveis (veja LEIA-ME_ELEITORAL.md). A fonte é escolhida nesta ordem:
//
//   1) Apps Script (mesmo padrão do api/emendas.js; a planilha não precisa ser publicada)
//   ELEITORAL_SCRIPT_URL             URL da implantação (Web app) do script da planilha de votação
//   ELEITORAL_SCRIPT_TOKEN           mesmo valor de SHARED_SECRET configurado no script
//
//   2) Conta de serviço do Google (planilha PRIVADA, compartilhada só com a conta)
//   ELEITORAL_SHEET_ID               ID da planilha de votos (trecho entre /d/ e /edit na URL)
//   ELEITORAL_SHEET_TAB              (opcional) nome da aba. Padrão: "Municípios"
//   GOOGLE_SERVICE_ACCOUNT_EMAIL     e-mail da conta de serviço
//   GOOGLE_PRIVATE_KEY               chave privada da conta de serviço (com \n)
//
//   3) Link CSV publicado da aba (alternativa simples; quem tiver o link lê a aba)
//   ELEITORAL_CSV_URL
//
// Se o seu api/emendas.js usa `module.exports`, troque a última linha e o
// `import` abaixo para o mesmo estilo (require / module.exports).

import crypto from 'node:crypto';

const SCRIPT_URL = process.env.ELEITORAL_SCRIPT_URL;
const SCRIPT_TOKEN = process.env.ELEITORAL_SCRIPT_TOKEN;
const SHEET_ID = process.env.ELEITORAL_SHEET_ID;
const TAB = process.env.ELEITORAL_SHEET_TAB || 'Municípios';
const SA_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SA_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const CSV_URL = process.env.ELEITORAL_CSV_URL;

/* ---------- autenticação (conta de serviço, sem dependências) ---------- */
let tokenCache = { value: null, exp: 0 };

const b64url = (input) =>
  Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

async function getAccessToken() {
  const agora = Math.floor(Date.now() / 1000);
  if (tokenCache.value && tokenCache.exp - 60 > agora) return tokenCache.value;

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: SA_EMAIL,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: agora,
      exp: agora + 3600,
    })
  );
  const assinatura = crypto
    .createSign('RSA-SHA256')
    .update(`${header}.${claim}`)
    .sign(SA_KEY, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${assinatura}`,
    }),
  });
  if (!resp.ok) throw new Error(`auth_${resp.status}`);
  const json = await resp.json();
  tokenCache = { value: json.access_token, exp: agora + (json.expires_in || 3600) };
  return tokenCache.value;
}

/* ---------- leitura da planilha ---------- */
// Chama o Apps Script da planilha de votação (POST + token, como o api/emendas.js).
// O token fica só aqui no servidor; o navegador nunca o vê.
async function lerViaScript() {
  const resp = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'eleicoes', token: SCRIPT_TOKEN }),
    redirect: 'follow',
  });
  if (!resp.ok) throw new Error(`script_http_${resp.status}`);
  const texto = await resp.text();
  let json;
  try { json = JSON.parse(texto); } catch (e) { throw new Error('script_resposta_invalida'); }
  if (json.status !== 'sucesso') {
    throw new Error(/negado/i.test(String(json.mensagem || '')) ? 'script_negado' : 'script_erro');
  }
  if (!Array.isArray(json.cabecalho) || !Array.isArray(json.linhas)) throw new Error('script_resposta_invalida');
  return [json.cabecalho, ...json.linhas];
}

async function lerViaApiSheets() {
  const token = await getAccessToken();
  const range = encodeURIComponent(TAB);
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}` +
    `?valueRenderOption=UNFORMATTED_VALUE&majorDimension=ROWS`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!resp.ok) throw new Error(`sheets_${resp.status}`);
  const json = await resp.json();
  return json.values || [];
}

function parseCSV(texto) {
  const t = texto.replace(/^\uFEFF/, '');
  const linhas = [];
  let linha = [];
  let cel = '';
  let aspas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (aspas) {
      if (c === '"') {
        if (t[i + 1] === '"') { cel += '"'; i++; } else aspas = false;
      } else cel += c;
    } else if (c === '"') aspas = true;
    else if (c === ',') { linha.push(cel); cel = ''; }
    else if (c === '\n' || c === '\r') {
      linha.push(cel); linhas.push(linha); linha = []; cel = '';
      if (c === '\r' && t[i + 1] === '\n') i++;
    } else cel += c;
  }
  if (cel || linha.length) { linha.push(cel); linhas.push(linha); }
  return linhas;
}

async function lerViaCsv() {
  const resp = await fetch(CSV_URL);
  if (!resp.ok) throw new Error(`csv_${resp.status}`);
  return parseCSV(await resp.text());
}

/* ---------- conversão de números (aceita número puro ou texto pt-BR) ---------- */
function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  let s = String(v).replace(/[R$\s%]/g, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

const semAcento = (s) =>
  String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/* ---------- monta o payload que o app consome ---------- */
// Reconhece colunas no formato:  "2026 – Deputado Estadual - Votos" / "... - Comparecimento"
// (novas eleições adicionadas à planilha aparecem sozinhas, sem mexer no código).
// Colunas de emendas da planilha são ignoradas: o app já tem sua própria fonte.
function montarPayload(rows) {
  if (!rows.length) throw new Error('aba_vazia');
  const cab = rows[0].map((h) => String(h ?? '').trim());

  const iMun = cab.findIndex((h) => semAcento(h) === 'municipio');
  if (iMun < 0) throw new Error('coluna_municipio_ausente');
  const iReg = cab.findIndex((h) => semAcento(h) === 'regiao'); // opcional

  const re = /^(\d{4})\s*[–—-]\s*(.+?)\s*-\s*(Comparecimento|Votos)\s*$/i;
  const mapa = new Map();
  cab.forEach((h, i) => {
    const m = h.match(re);
    if (!m) return;
    const key = `${m[1]}|${m[2].trim()}`;
    if (!mapa.has(key)) mapa.set(key, { key, ano: Number(m[1]), cargo: m[2].trim() });
    mapa.get(key)[/^comp/i.test(m[3]) ? 'iComp' : 'iVotos'] = i;
  });
  const eleicoes = [...mapa.values()]
    .filter((e) => e.iVotos !== undefined)
    .sort((a, b) => a.ano - b.ano || a.cargo.localeCompare(b.cargo));
  if (!eleicoes.length) throw new Error('colunas_eleitorais_ausentes');

  const municipios = [];
  for (const row of rows.slice(1)) {
    const nome = String(row[iMun] ?? '').trim();
    if (!nome) continue;
    const v = {};
    for (const e of eleicoes) {
      const votos = toNum(row[e.iVotos]);
      const comp = e.iComp !== undefined ? toNum(row[e.iComp]) : null;
      if (votos === null && comp === null) continue;
      v[e.key] = { comp: comp === null ? null : Math.round(comp), votos: votos === null ? 0 : Math.round(votos) };
    }
    const item = { nome, v };
    if (iReg >= 0 && row[iReg]) item.regiao = String(row[iReg]).trim();
    municipios.push(item);
  }

  return {
    atualizadoEm: new Date().toISOString(),
    eleicoes: eleicoes.map(({ key, ano, cargo }) => ({ key, ano, cargo })),
    municipios,
  };
}

/* ---------- handler ---------- */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ erro: 'Método não permitido' });
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const modoScript = Boolean(SCRIPT_URL && SCRIPT_TOKEN);
  const modoApi = Boolean(SHEET_ID && SA_EMAIL && SA_KEY);
  const modoCsv = Boolean(CSV_URL);
  if (!modoScript && !modoApi && !modoCsv) {
    return res.status(503).json({
      erro: 'Fonte eleitoral não configurada no servidor (variáveis de ambiente ausentes).',
    });
  }

  try {
    const rows = modoScript ? await lerViaScript() : modoApi ? await lerViaApiSheets() : await lerViaCsv();
    const payload = montarPayload(rows);
    // Cache de borda: a planilha só muda quando a equipe atualiza.
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json(payload);
  } catch (e) {
    // Detalhe só no log do servidor; o cliente recebe uma mensagem genérica.
    console.error('[eleitoral] falha:', e && e.message);
    const codigo = String((e && e.message) || 'erro');
    const dica = /script_negado/.test(codigo)
      ? 'O script recusou o token (ELEITORAL_SCRIPT_TOKEN precisa ser igual ao SHARED_SECRET do script).'
      : /script_resposta_invalida|script_http_/.test(codigo)
      ? 'Resposta inesperada do script (confira a URL da implantação e se o acesso é "Qualquer pessoa").'
      : /script_erro/.test(codigo)
      ? 'O script não conseguiu ler a aba Municípios.'
      : /sheets_403|sheets_404/.test(codigo)
      ? 'Sem acesso à planilha (confira se ela foi compartilhada com a conta de serviço).'
      : /auth_/.test(codigo)
      ? 'Falha de autenticação da conta de serviço.'
      : 'Falha ao ler a planilha eleitoral.';
    return res.status(502).json({ erro: dica, codigo });
  }
}
