import { norm, tituloMunicipio, chavesPadrao, RESULTADOS } from './eleitoral.jsx';

/* ==========================================================================
   TABULUM — Motor Unificado (Emendas × Agendas × Leads × Votos)
   Sem dados sensíveis. Toda a lógica de cruzamento, matriz 3×3, regiões,
   articuladores, leads anonimizados e tradução em linguagem natural fica aqui.
   ========================================================================== */

/* ------------------------------ formatadores ------------------------------ */
const nf0 = new Intl.NumberFormat('pt-BR');
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const fmtInt = (n) =>
  n === null || n === undefined || Number.isNaN(n) ? '—' : nf0.format(Math.round(n));

export const fmtBRL = (n) => brl.format(n || 0);

export function fmtBRLCompact(n) {
  const v = n || 0;
  const a = Math.abs(v);
  if (a >= 1e6) return `R$ ${(v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  if (a >= 1e3) return `R$ ${Math.round(v / 1e3).toLocaleString('pt-BR')} mil`;
  return fmtBRL(v);
}

export const fmtHoras = (h) =>
  h === null || h === undefined || !Number.isFinite(h)
    ? '—'
    : `${h.toLocaleString('pt-BR', { minimumFractionDigits: h > 0 && h < 10 ? 1 : 0, maximumFractionDigits: 1 })}h`;

export const fmtPct = (n, d = 1) =>
  n === null || n === undefined || !Number.isFinite(n)
    ? '—'
    : `${n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })}%`;

export const fmtSigned = (n) =>
  n === null || n === undefined || Number.isNaN(n) ? '—' : `${n > 0 ? '+' : ''}${nf0.format(Math.round(n))}`;

export const fmtSignedPct = (n) =>
  n === null || n === undefined || !Number.isFinite(n)
    ? '—'
    : `${n > 0 ? '+' : ''}${n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

export const fmtDataBr = (iso) => {
  if (!iso || typeof iso !== 'string') return '—';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
};

export const dinheiroCsv = (n) => (n || 0).toFixed(2).replace('.', ',');

export function parseCurrency(v) {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return v;
  const c = String(v).replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(c) || 0;
}

/* --------------------- constantes de filtros e modos ---------------------- */
export const FILTROS_PADRAO = {
  // Território
  regioes: [],
  associacoes: [],
  municipios: [],
  excluirFloripa: false,
  // Presença & Equipe
  articuladores: [],
  periodoAgenda: '2023_2026', // '2023_2026' | '2025_2026' | '2019_2022' | 'todos' | 'custom'
  anosAgenda: [],
  classesAgenda: [],
  apenasPresenciais: true,
  // Emendas
  anosEmenda: [],
  situacoes: [],
  modalidades: [],
  entidades: [],
  temas: [],
  uos: [],
  incluirExecDireta: false,
  // Leads (anonimizados)
  temasLeads: [],
  origensLeads: [],
  // Eleições
  baseKey: '',
  compKey: '',
  criterio: 'media', // 'media' | 'qualquer'
  // Busca e atalhos rápidos
  busca: '',
  resEmenda: [],
  resAgenda: [],
  resLeads: [],
  quadrante4: '',
};

export const PERIODOS_AGENDA = [
  { key: '2023_2026', label: 'Mandato atual (2023–2026)', anos: ['2023', '2024', '2025', '2026'] },
  { key: '2025_2026', label: 'Pré-eleição (2025–2026)', anos: ['2025', '2026'] },
  { key: '2019_2022', label: 'Ciclo anterior (2019–2022)', anos: ['2019', '2020', '2021', '2022'] },
  { key: 'todos', label: 'Histórico completo', anos: null },
];

export const MODOS_MAPA = [
  { key: 'matriz_agendas', label: 'Agendas × Votos', tipo: 'matriz', campoY: 'agendas', labelY: 'agendas', tituloY: 'Visitas / Agendas', fmtY: fmtInt },
  { key: 'matriz_emendas', label: 'Emendas × Votos', tipo: 'matriz', campoY: 'emendas', labelY: 'emendas', tituloY: 'Valor em Emendas', fmtY: fmtBRLCompact },
  { key: 'matriz_leads', label: 'Leads × Votos', tipo: 'matriz', campoY: 'leads', labelY: 'leads', tituloY: 'Leads Cadastrados', fmtY: fmtInt },
  { key: 'matriz_combinado', label: 'Atuação Total × Votos', tipo: 'matriz', campoY: 'indice', labelY: 'atuação', tituloY: 'Atuação Total (Agenda + Emenda + Leads)', fmtY: (v) => `${Math.round(v)} pts` },
  { key: 'conv_emendas', label: 'Conversão das Emendas', tipo: 'emendas' },
  { key: 'conv_agendas', label: 'Conversão das Agendas', tipo: 'agendas' },
  { key: 'conv_leads', label: 'Conversão dos Leads', tipo: 'leads' },
  { key: 'quad_presenca', label: 'Presença × Emendas', tipo: 'quadrantes' },
];

export const METRICAS_ELEITORAIS = [
  { key: 'vComp', label: 'Total de votos', curto: 'votos', tipo: 'positivo', fmt: fmtInt },
  { key: 'delta', label: 'Ganho de votos (nº)', curto: 'ganho', tipo: 'variacao', fmt: fmtSigned },
  { key: 'deltaPct', label: 'Crescimento (%)', curto: 'crescimento', tipo: 'variacao', fmt: fmtSignedPct },
];

/* ----------------- resultados de conversão (emendas, agendas, leads) ------ */
export const RESULTADOS_EMENDAS = RESULTADOS;

export const RESULTADOS_AGENDAS = {
  visitado_cresceu: {
    label: 'Visitado e cresceu',
    cor: '#db2777',
    texto: '#ffffff',
    badge: 'bg-pink-600 text-white',
    desc: 'Teve visita do mandato e os votos cresceram acima da média do estado',
  },
  visitado_pouco: {
    label: 'Visitado, cresceu pouco',
    cor: '#f59e0b',
    texto: '#0f172a',
    badge: 'bg-amber-300 text-slate-900',
    desc: 'Teve visita do mandato; os votos cresceram, mas abaixo da média do estado',
  },
  visitado_caiu: {
    label: 'Visitado e não cresceu',
    cor: '#be123c',
    texto: '#ffffff',
    badge: 'bg-rose-700 text-white',
    desc: 'Teve visita do mandato e os votos caíram ou ficaram estáveis',
  },
  cresceu_sem_visita: {
    label: 'Cresceu sem visita',
    cor: '#0284c7',
    texto: '#ffffff',
    badge: 'bg-sky-600 text-white',
    desc: 'Não teve visita no período, mas os votos cresceram (base espontânea)',
  },
  sem_visita_sem_cresc: {
    label: 'Sem visita e sem crescimento',
    cor: '#cbd5e1',
    texto: '#334155',
    badge: 'bg-slate-200 text-slate-700',
    desc: 'Não teve visita no período e os votos não cresceram',
  },
};

export const RESULTADOS_LEADS = {
  lead_cresceu: {
    label: 'Com leads e cresceu',
    cor: '#db2777',
    texto: '#ffffff',
    badge: 'bg-pink-600 text-white',
    desc: 'Tem leads cadastrados e os votos cresceram acima da média do estado',
  },
  lead_pouco: {
    label: 'Com leads, cresceu pouco',
    cor: '#f59e0b',
    texto: '#0f172a',
    badge: 'bg-amber-300 text-slate-900',
    desc: 'Tem leads cadastrados; cresceu em votos, mas abaixo da média do estado',
  },
  lead_nao_cresceu: {
    label: 'Com leads e não cresceu',
    cor: '#be123c',
    texto: '#ffffff',
    badge: 'bg-rose-700 text-white',
    desc: 'Tem leads cadastrados, mas os votos ficaram estáveis ou caíram',
  },
  cresceu_sem_lead: {
    label: 'Cresceu sem leads',
    cor: '#0284c7',
    texto: '#ffffff',
    badge: 'bg-sky-600 text-white',
    desc: 'Não tem leads cadastrados, mas cresceu nas urnas (oportunidade de captação)',
  },
  sem_lead_sem_cresc: {
    label: 'Sem leads e sem crescimento',
    cor: '#cbd5e1',
    texto: '#334155',
    badge: 'bg-slate-200 text-slate-700',
    desc: 'Não tem leads cadastrados e os votos não cresceram',
  },
};

export const QUADRANTES_4 = {
  Q1: {
    id: 'Q1',
    label: 'Visita + Emenda',
    cor: '#db2777',
    texto: '#ffffff',
    badge: 'bg-pink-600 text-white',
    desc: 'Cidades que receberam visitas e emendas no período',
  },
  Q2: {
    id: 'Q2',
    label: 'Emenda sem visita',
    cor: '#facc15',
    texto: '#422006',
    badge: 'bg-amber-300 text-slate-900',
    desc: 'Receberam emendas, mas ainda não tiveram visita no período',
  },
  Q3: {
    id: 'Q3',
    label: 'Visita sem emenda',
    cor: '#0284c7',
    texto: '#ffffff',
    badge: 'bg-sky-600 text-white',
    desc: 'Tiveram visitas do mandato, mas nenhuma emenda no período',
  },
  Q4: {
    id: 'Q4',
    label: 'Sem visita e sem emenda',
    cor: '#e2e8f0',
    texto: '#475569',
    badge: 'bg-slate-200 text-slate-700',
    desc: 'Sem visita e sem emenda registrada no recorte atual',
  },
};

/* ----------------- matriz bivariada 3x3 (cores primárias) ----------------- */
export const MATRIZ_3X3 = {
  '2_0': {
    id: '2_0', y: 2, x: 0, cor: '#f9a8d4', texto: '#831843',
    titulo: 'Muita atuação, poucos votos',
    curto: 'Esforço a converter',
    desc: 'Recebeu bastante atenção/contatos do mandato, mas a votação ainda é baixa ou caiu. Vale conversar com as lideranças locais.',
  },
  '2_1': {
    id: '2_1', y: 2, x: 1, cor: '#f43f5e', texto: '#ffffff',
    titulo: 'Muita atuação, voto intermediário',
    curto: 'Em crescimento',
    desc: 'Base forte com votação intermediária. Bom terreno para consolidar e chegar ao topo.',
  },
  '2_2': {
    id: '2_2', y: 2, x: 2, cor: '#db2777', texto: '#ffffff',
    titulo: 'Muita atuação e muitos votos',
    curto: 'Polo forte',
    desc: 'Cidades onde há forte trabalho/mobilização do mandato e grande resposta nas urnas. Núcleo principal da base.',
  },
  '1_0': {
    id: '1_0', y: 1, x: 0, cor: '#fef08a', texto: '#713f12',
    titulo: 'Atuação média, poucos votos',
    curto: 'Início de trabalho',
    desc: 'Atuação ou base moderada com votação ainda inicial.',
  },
  '1_1': {
    id: '1_1', y: 1, x: 1, cor: '#facc15', texto: '#422006',
    titulo: 'Atuação média e voto médio',
    curto: 'Faixa intermediária',
    desc: 'Municípios no meio da tabela tanto em atuação quanto em votos.',
  },
  '1_2': {
    id: '1_2', y: 1, x: 2, cor: '#f59e0b', texto: '#ffffff',
    titulo: 'Atuação média, muitos votos',
    curto: 'Ótimo retorno',
    desc: 'Responde muito bem em votos mesmo com atuação moderada. Vale reforçar a presença.',
  },
  '0_0': {
    id: '0_0', y: 0, x: 0, cor: '#bae6fd', texto: '#0c4a6e',
    titulo: 'Pouca atuação e poucos votos',
    curto: 'Baixa presença',
    desc: 'Território com pouca ou nenhuma atuação registrada e votação baixa.',
  },
  '0_1': {
    id: '0_1', y: 0, x: 1, cor: '#38bdf8', texto: '#082f49',
    titulo: 'Pouca atuação, voto intermediário',
    curto: 'Voto espontâneo',
    desc: 'Já tem votos sem grande atuação registrada. Boa oportunidade para visita e captação.',
  },
  '0_2': {
    id: '0_2', y: 0, x: 2, cor: '#0284c7', texto: '#ffffff',
    titulo: 'Pouca atuação, muitos votos',
    curto: 'Base orgânica (prioridade!)',
    desc: 'Votação alta mesmo sem visita, emenda ou base de leads proporcional. Prioridade para fortalecer vínculo.',
  },
};

/* ------------------------- matemática interna ----------------------------- */
const SEM_MUNICIPIO = new Set(['ESTADUAL', 'ESTADO']);

function percentile(vals, p) {
  if (!vals.length) return 0;
  const a = [...vals].sort((x, y) => x - y);
  const idx = (p / 100) * (a.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return a[lo] + (a[hi] - a[lo]) * (idx - lo);
}

function median(vals) {
  return vals.length ? percentile(vals, 50) : null;
}

function rankAvg(arr) {
  const idx = arr.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const r = new Array(arr.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}

function spearman(x, y) {
  if (x.length < 8) return null;
  const rx = rankAvg(x);
  const ry = rankAvg(y);
  const n = rx.length;
  const mx = rx.reduce((a, b) => a + b, 0) / n;
  const my = ry.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = rx[i] - mx, dy = ry[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
}

function scoreAtivos(valores) {
  const idxAtivos = [];
  const valAtivos = [];
  valores.forEach((v, i) => {
    if (v > 0) { idxAtivos.push(i); valAtivos.push(v); }
  });
  const out = new Array(valores.length).fill(0);
  if (!valAtivos.length) return out;
  if (valAtivos.length === 1) {
    out[idxAtivos[0]] = 100;
    return out;
  }
  const ranks = rankAvg(valAtivos);
  const n = valAtivos.length;
  idxAtivos.forEach((origIdx, k) => {
    out[origIdx] = 10 + ((ranks[k] - 1) / (n - 1)) * 90;
  });
  return out;
}

function calcularFaixas3(valores, tipo, fmt) {
  const validos = valores.filter((v) => v !== null && v !== undefined && Number.isFinite(v));
  if (!validos.length) {
    return { c1: 0, c2: 0, faixa: () => 0, labels: ['Baixo', 'Médio', 'Alto'] };
  }

  if (tipo === 'variacao') {
    const pos = validos.filter((v) => v > 0);
    const c2 = pos.length ? percentile(pos, 50) : 1;
    return {
      c1: 0,
      c2,
      faixa: (v) => {
        if (v === null || v === undefined || !Number.isFinite(v) || v <= 0) return 0;
        return v <= c2 ? 1 : 2;
      },
      labels: ['Queda ou estável', `Crescimento até ${fmt(c2)}`, `Acima de ${fmt(c2)}`],
    };
  }

  const ativos = validos.filter((v) => v > 0);
  if (!ativos.length) {
    return { c1: 0, c2: 0, faixa: () => 0, labels: ['Nenhum', '—', '—'] };
  }

  const zeros = validos.length - ativos.length;
  if (zeros / validos.length >= 0.25) {
    const corteAlto = percentile(ativos, 50) || Math.min(...ativos);
    return {
      c1: 0,
      c2: corteAlto,
      faixa: (v) => {
        if (!v || v <= 0) return 0;
        return v <= corteAlto ? 1 : 2;
      },
      labels: ['Nenhum registro', `Até ${fmt(corteAlto)}`, `Acima de ${fmt(corteAlto)}`],
    };
  }

  let c1 = percentile(validos, 33.33);
  let c2 = percentile(validos, 66.67);
  if (c2 <= c1) {
    c1 = 0;
    c2 = percentile(ativos, 50);
  }
  return {
    c1,
    c2,
    faixa: (v) => {
      if (v === null || v === undefined || !Number.isFinite(v) || v <= c1) return 0;
      return v <= c2 ? 1 : 2;
    },
    labels: [`Até ${fmt(c1)}`, `${fmt(c1)} a ${fmt(c2)}`, `Acima de ${fmt(c2)}`],
  };
}

function descreverRelacao(rho, assunto) {
  if (rho === null) {
    return { nivel: 'Dados insuficientes', tom: 'slate', rho: null, frase: `Poucas cidades neste recorte para avaliar a relação entre ${assunto}.` };
  }
  const a = Math.abs(rho);
  if (rho < 0.15) {
    return { nivel: 'Sem relação clara', tom: 'slate', rho, frase: `Neste recorte, ${assunto} ainda não mostram ligação direta.` };
  }
  if (a < 0.35) {
    return { nivel: 'Relação leve', tom: 'amber', rho, frase: `Há um sinal leve de que mais ${assunto} acompanham mais votos.` };
  }
  if (a < 0.55) {
    return { nivel: 'Relação moderada', tom: 'sky', rho, frase: `Onde há mais ${assunto}, os votos costumam andar junto em boa parte das cidades.` };
  }
  return { nivel: 'Relação forte', tom: 'pink', rho, frase: `Cidades com mais ${assunto} concentram claramente os melhores resultados nas urnas.` };
}

function nomeMaisBonito(atual, novo) {
  if (!atual) return novo;
  if (!novo) return atual;
  const atualEhCaps = atual === atual.toUpperCase();
  const novoEhCaps = novo === novo.toUpperCase();
  if (atualEhCaps && !novoEhCaps) return novo;
  return atual;
}

/* --------------------- motor principal de cruzamento ---------------------- */
export function calcularPainelUnificado({
  emendasTodas = [],
  eleitoral = null,
  agenda = null,
  leads = null,
  filtros = FILTROS_PADRAO,
  modoMapa = 'matriz_agendas',
  metricaX = 'vComp',
}) {
  const f = { ...FILTROS_PADRAO, ...filtros };
  const pad = eleitoral && eleitoral.eleicoes.length ? chavesPadrao(eleitoral) : { baseKey: '', compKey: '' };
  const baseKey = f.baseKey || pad.baseKey;
  const compKey = f.compKey || pad.compKey;
  const elBase = eleitoral ? eleitoral.eleicoes.find((e) => e.key === baseKey) || null : null;
  const elComp = eleitoral ? eleitoral.eleicoes.find((e) => e.key === compKey) || null : null;

  // Mapas auxiliares de região/associação (prioridade para a planilha de votos que cobre os 295 municípios)
  const regiaoMap = new Map();
  const assocMap = new Map();
  const contRegEmenda = new Map();

  (emendasTodas || []).forEach((e) => {
    const k = norm(e['MUNICÍPIO']);
    const rg = String(e.REGIÃO || '').trim();
    if (!k || !rg || SEM_MUNICIPIO.has(norm(rg))) return;
    if (!contRegEmenda.has(k)) contRegEmenda.set(k, new Map());
    const c = contRegEmenda.get(k);
    c.set(rg, (c.get(rg) || 0) + 1);
  });
  contRegEmenda.forEach((c, k) => {
    let best = '', n = 0;
    c.forEach((v, rg) => { if (v > n) { n = v; best = rg; } });
    if (best) regiaoMap.set(k, best);
  });
  if (eleitoral) {
    eleitoral.munis.forEach((m) => {
      if (m.regiao) regiaoMap.set(m.norm, m.regiao);
      if (m.associacao) assocMap.set(m.norm, m.associacao);
    });
  }

  const mSet = new Set((f.municipios || []).map(norm));
  const rSet = new Set((f.regioes || []).map(norm));
  const aSet = new Set((f.associacoes || []).map(norm));
  const artSet = new Set((f.articuladores || []).map(norm));
  const clsSet = new Set(f.classesAgenda || []);
  const temasLeadSet = new Set(f.temasLeads || []);
  const origensLeadSet = new Set(f.origensLeads || []);
  const buscaNorm = norm(f.busca);
  const buscaLower = String(f.busca || '').trim().toLowerCase();

  const passaTerritorio = (k, regFallback = '') => {
    if (f.excluirFloripa && k === 'FLORIANOPOLIS') return false;
    if (mSet.size && !mSet.has(k)) return false;
    const reg = regiaoMap.get(k) || regFallback || '';
    if (rSet.size && !rSet.has(norm(reg))) return false;
    const assoc = assocMap.get(k) || '';
    if (aSet.size && !aSet.has(norm(assoc))) return false;
    return true;
  };

  // 1) Filtragem das EMENDAS
  const emendasBase = (emendasTodas || []).filter((e) => {
    const k = norm(e['MUNICÍPIO']);
    if (k && !SEM_MUNICIPIO.has(k) && !passaTerritorio(k, e.REGIÃO)) return false;
    if (f.excluirFloripa && k === 'FLORIANOPOLIS') return false;
    if (mSet.size && !mSet.has(k)) return false;
    if (rSet.size && !rSet.has(norm(regiaoMap.get(k) || e.REGIÃO || ''))) return false;
    if (aSet.size && !aSet.has(norm(assocMap.get(k) || ''))) return false;

    if (artSet.size && !artSet.has(norm(e.ARTICULADOR))) return false;
    if (f.anosEmenda.length && !f.anosEmenda.includes(String(e.ANO || '').trim())) return false;
    if (f.situacoes.length && !f.situacoes.includes(e.SITUAÇÃO)) return false;
    if (f.modalidades.length && !f.modalidades.includes(e.MODALIDADE)) return false;
    if (f.entidades.length && !f.entidades.includes(e['RAZÃO SOCIAL'])) return false;
    if (f.temas.length && !f.temas.includes(e.TEMA)) return false;
    if (f.uos.length && !f.uos.includes(e['UNIDADE ORÇAMENTÁRIA'])) return false;
    if (buscaLower && !JSON.stringify(e).toLowerCase().includes(buscaLower)) return false;
    return true;
  });

  const isExecDireta = (e) => /execu[cç][aã]o direta/i.test(String(e.MODALIDADE || ''));
  const emendasCruzamento = f.incluirExecDireta ? emendasBase : emendasBase.filter((e) => !isExecDireta(e));

  // 2) Filtragem das AGENDAS
  const periodoInfo = PERIODOS_AGENDA.find((p) => p.key === f.periodoAgenda);
  const anosAgendaAtivos = new Set(
    f.periodoAgenda === 'custom'
      ? (f.anosAgenda.length ? f.anosAgenda : (agenda ? agenda.anos : []))
      : periodoInfo && periodoInfo.anos
      ? periodoInfo.anos
      : agenda
      ? agenda.anos
      : []
  );

  const agendasBase = (agenda ? agenda.eventos : []).filter((ev) => {
    if (anosAgendaAtivos.size && !anosAgendaAtivos.has(ev.ano)) return false;
    if (f.apenasPresenciais && ev.online) return false;
    if (clsSet.size && !clsSet.has(ev.classe)) return false;
    if (artSet.size && !artSet.has(norm(ev.articulador))) return false;

    if (ev.norm) {
      if (!passaTerritorio(ev.norm)) return false;
    } else if (mSet.size || rSet.size || aSet.size) {
      return false;
    }

    if (buscaNorm) {
      const bate =
        norm(ev.titulo).includes(buscaNorm) ||
        ev.norm.includes(buscaNorm) ||
        norm(ev.classe).includes(buscaNorm) ||
        norm(ev.articulador).includes(buscaNorm);
      if (!bate) return false;
    }
    return true;
  });

  // 3) Filtragem dos LEADS (agregados anonimizados)
  const leadsBase = (leads ? leads.grupos : []).filter((g) => {
    if (temasLeadSet.size && !temasLeadSet.has(g.tema)) return false;
    if (origensLeadSet.size && !origensLeadSet.has(g.origem)) return false;
    if (g.norm) {
      if (!passaTerritorio(g.norm)) return false;
    } else if (mSet.size || rSet.size || aSet.size) {
      return false;
    }
    if (buscaNorm) {
      const bate =
        g.norm.includes(buscaNorm) ||
        norm(g.tema).includes(buscaNorm) ||
        norm(g.origem).includes(buscaNorm) ||
        norm(g.bairro).includes(buscaNorm);
      if (!bate) return false;
    }
    return true;
  });

  // 4) Agregação por Município
  const emMap = new Map();
  const semMunEmendas = { qtd: 0, total: 0, pago: 0 };
  emendasCruzamento.forEach((e) => {
    const k = norm(e['MUNICÍPIO']);
    const total = parseCurrency(e.TOTAL);
    const pago = parseCurrency(e.PAGO);
    if (!k || SEM_MUNICIPIO.has(k)) {
      semMunEmendas.qtd++;
      semMunEmendas.total += total;
      semMunEmendas.pago += pago;
      return;
    }
    let g = emMap.get(k);
    if (!g) {
      g = { nome: String(e['MUNICÍPIO']).trim(), qtd: 0, total: 0, pago: 0, arts: new Map(), porAno: {} };
      emMap.set(k, g);
    }
    g.qtd += 1;
    g.total += total;
    g.pago += pago;
    const ano = String(e.ANO || '').trim();
    if (ano) {
      const pa = g.porAno[ano] || (g.porAno[ano] = { qtd: 0, total: 0, pago: 0 });
      pa.qtd += 1;
      pa.total += total;
      pa.pago += pago;
    }
    if (e.ARTICULADOR) {
      const ak = norm(e.ARTICULADOR);
      if (ak) g.arts.set(ak, nomeMaisBonito(g.arts.get(ak), String(e.ARTICULADOR).trim()));
    }
  });

  const agMap = new Map();
  const hojeIso = new Date().toISOString().slice(0, 10);
  agendasBase.forEach((ev) => {
    if (!ev.norm) return;
    let g = agMap.get(ev.norm);
    if (!g) {
      g = { nome: ev.municipio, qtd: 0, presenciais: 0, horas: 0, ultimaVisita: '', arts: new Map(), porAno: {} };
      agMap.set(ev.norm, g);
    }
    g.qtd += 1;
    if (!ev.online) g.presenciais += 1;
    g.horas += ev.horas;
    if (ev.data <= hojeIso && (!g.ultimaVisita || ev.data > g.ultimaVisita)) g.ultimaVisita = ev.data;
    if (ev.ano) g.porAno[ev.ano] = (g.porAno[ev.ano] || 0) + 1;
    if (ev.articulador) {
      const ak = norm(ev.articulador);
      if (ak) g.arts.set(ak, nomeMaisBonito(g.arts.get(ak), ev.articulador));
    }
  });

  const scSet = eleitoral ? new Set(eleitoral.porNorm.keys()) : new Set();
  const ldMap = new Map();
  let leadsForaSC = 0;
  let leadsSemCidade = 0;

  leadsBase.forEach((g) => {
    if (!g.norm) {
      leadsSemCidade += g.qtd;
      return;
    }
    if (scSet.size && !scSet.has(g.norm) && g.uf !== 'SC') {
      leadsForaSC += g.qtd;
      return;
    }
    let m = ldMap.get(g.norm);
    if (!m) {
      m = { nome: g.municipio, qtd: 0, temas: new Map(), origens: new Set() };
      ldMap.set(g.norm, m);
    }
    m.qtd += g.qtd;
    if (g.tema) m.temas.set(g.tema, (m.temas.get(g.tema) || 0) + g.qtd);
    if (g.origem) m.origens.add(g.origem);
  });

  // União dos municípios de SC (Votação + Emendas + Agendas)
  const todasChaves = new Set([
    ...(eleitoral ? eleitoral.porNorm.keys() : []),
    ...emMap.keys(),
    ...agMap.keys(),
  ]);

  const tB = eleitoral && baseKey ? (eleitoral.totais[baseKey] || {}).votos || 0 : 0;
  const tC = eleitoral && compKey ? (eleitoral.totais[compKey] || {}).votos || 0 : 0;
  const crescEstado = tB > 0 ? ((tC - tB) / tB) * 100 : null;

  const filtroEmendaEspecifico =
    f.anosEmenda.length > 0 || f.situacoes.length > 0 || f.modalidades.length > 0 ||
    f.entidades.length > 0 || f.temas.length > 0 || f.uos.length > 0;
  const filtroAgendaEspecifico = clsSet.size > 0;
  const filtroLeadsEspecifico = temasLeadSet.size > 0 || origensLeadSet.size > 0;
  const filtroEquipe = artSet.size > 0;

  const cidadesBase = [];
  todasChaves.forEach((k) => {
    if (!k || SEM_MUNICIPIO.has(k)) return;
    if (!passaTerritorio(k)) return;

    const m = eleitoral ? eleitoral.porNorm.get(k) : null;
    const em = emMap.get(k);
    const ag = agMap.get(k);
    const ld = ldMap.get(k);

    if (filtroEquipe && !em && !ag) return;
    if (filtroEmendaEspecifico && !em) return;
    if (filtroAgendaEspecifico && !ag) return;
    if (filtroLeadsEspecifico && !ld) return;
    if (buscaNorm && !em && !ag && !ld && !k.includes(buscaNorm) && !norm(regiaoMap.get(k) || '').includes(buscaNorm)) return;

    const xb = m && baseKey ? m.v[baseKey] : null;
    const xc = m && compKey ? m.v[compKey] : null;
    const vBase = xb ? xb.votos || 0 : 0;
    const vComp = xc ? xc.votos || 0 : 0;
    const cComp = xc ? xc.comp || 0 : 0;
    const delta = vComp - vBase;
    const deltaPct = vBase > 0 ? ((vComp - vBase) / vBase) * 100 : null;
    const deltaPctCalc = vBase > 0 ? deltaPct : vComp > 0 ? 100 : 0;

    const agendas = ag ? ag.qtd : 0;
    const horas = ag ? ag.horas : 0;
    const emendasQtd = em ? em.qtd : 0;
    const emendas = em ? em.total : 0;
    const pago = em ? em.pago : 0;
    const leadsQtd = ld ? ld.qtd : 0;

    let leadsTopTema = '';
    let topTemaQtd = 0;
    if (ld && ld.temas.size) {
      ld.temas.forEach((q, t) => {
        if (q > topTemaQtd) { topTemaQtd = q; leadsTopTema = t; }
      });
    }

    const cresceu = delta > 0;
    const acimaMedia = vBase === 0 || crescEstado === null || f.criterio === 'qualquer' || (deltaPct !== null && deltaPct > crescEstado);

    const resEmenda = emendas > 0
      ? (cresceu ? (acimaMedia ? 'converteu' : 'cresceu_pouco') : 'nao_converteu')
      : (cresceu ? 'organico' : 'sem_nada');

    const resAgenda = agendas > 0
      ? (cresceu ? (acimaMedia ? 'visitado_cresceu' : 'visitado_pouco') : 'visitado_caiu')
      : (cresceu ? 'cresceu_sem_visita' : 'sem_visita_sem_cresc');

    const resLeads = leadsQtd > 0
      ? (cresceu ? (acimaMedia ? 'lead_cresceu' : 'lead_pouco') : 'lead_nao_cresceu')
      : (cresceu ? 'cresceu_sem_lead' : 'sem_lead_sem_cresc');

    const quad4 =
      agendas > 0 && emendas > 0
        ? 'Q1'
        : agendas === 0 && emendas > 0
        ? 'Q2'
        : agendas > 0 && emendas === 0
        ? 'Q3'
        : 'Q4';

    const artsUniao = new Map();
    if (em) em.arts.forEach((v, ak) => artsUniao.set(ak, v));
    if (ag) ag.arts.forEach((v, ak) => artsUniao.set(ak, nomeMaisBonito(artsUniao.get(ak), v)));

    cidadesBase.push({
      norm: k,
      nome: (em && em.nome) || (m && tituloMunicipio(m.nome)) || (ag && ag.nome) || (ld && ld.nome) || tituloMunicipio(k),
      regiao: regiaoMap.get(k) || '',
      associacao: assocMap.get(k) || '',
      v: m ? m.v : {},
      vBase,
      vComp,
      cComp,
      delta,
      deltaPct,
      deltaPctCalc,
      pctComp: cComp > 0 ? (vComp / cComp) * 100 : null,
      shareEstado: tC > 0 ? (vComp / tC) * 100 : null,
      agendas,
      presenciais: ag ? ag.presenciais : 0,
      horas,
      ultimaVisita: ag ? ag.ultimaVisita : '',
      emendasQtd,
      emendas,
      pago,
      rsPorVoto: vComp > 0 && emendas > 0 ? emendas / vComp : null,
      leads: leadsQtd,
      leadsTopTema,
      votosPorLead: leadsQtd > 0 ? vComp / leadsQtd : null,
      articuladores: [...artsUniao.values()].sort((a, b) => a.localeCompare(b, 'pt-BR')).join(', '),
      resEmenda,
      resAgenda,
      resLeads,
      quad4,
      indice: 0,
    });
  });

  // Índice de Atuação Total (0 a 100) combinando Agendas + Emendas + Leads
  const temBaseLeads = Boolean(leads && leads.grupos && leads.grupos.length > 0);
  const sAg = scoreAtivos(cidadesBase.map((r) => r.agendas));
  const sEm = scoreAtivos(cidadesBase.map((r) => r.emendas));
  const sLd = scoreAtivos(cidadesBase.map((r) => r.leads));
  cidadesBase.forEach((r, i) => {
    r.indice = temBaseLeads ? (sAg[i] + sEm[i] + sLd[i]) / 3 : (sAg[i] + sEm[i]) / 2;
  });

  // Contagens dos botões rápidos (antes de aplicar o próprio filtro de atalho)
  const contagemEmendas = {};
  Object.keys(RESULTADOS_EMENDAS).forEach((k) => { contagemEmendas[k] = 0; });
  const contagemAgendas = {};
  Object.keys(RESULTADOS_AGENDAS).forEach((k) => { contagemAgendas[k] = 0; });
  const contagemLeads = {};
  Object.keys(RESULTADOS_LEADS).forEach((k) => { contagemLeads[k] = 0; });
  const contagemQuadrantes = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

  cidadesBase.forEach((r) => {
    contagemEmendas[r.resEmenda] += 1;
    contagemAgendas[r.resAgenda] += 1;
    contagemLeads[r.resLeads] += 1;
    contagemQuadrantes[r.quad4] += 1;
  });

  // 5) Aplica os atalhos rápidos de conversão
  const temAtalho =
    f.resEmenda.length > 0 || f.resAgenda.length > 0 || f.resLeads.length > 0 || Boolean(f.quadrante4);
  const cidadesFiltradas = cidadesBase.filter((r) => {
    if (f.resEmenda.length && !f.resEmenda.includes(r.resEmenda)) return false;
    if (f.resAgenda.length && !f.resAgenda.includes(r.resAgenda)) return false;
    if (f.resLeads.length && !f.resLeads.includes(r.resLeads)) return false;
    if (f.quadrante4 && r.quad4 !== f.quadrante4) return false;
    return true;
  });

  const chavesVisiveis = new Set(cidadesFiltradas.map((r) => r.norm));
  const emendasFiltradas = temAtalho
    ? emendasBase.filter((e) => chavesVisiveis.has(norm(e['MUNICÍPIO'])))
    : emendasBase;
  const agendasFiltradas = temAtalho
    ? agendasBase.filter((ev) => ev.norm && chavesVisiveis.has(ev.norm))
    : agendasBase;
  const leadsFiltrados = temAtalho
    ? leadsBase.filter((g) => g.norm && chavesVisiveis.has(g.norm))
    : leadsBase;

  // 6) Calcula a Matriz Bivariada 3×3 sobre as cidades visíveis
  const modoInfo = MODOS_MAPA.find((m) => m.key === modoMapa) || MODOS_MAPA[0];
  const campoY = modoInfo.campoY || 'agendas';
  const fmtY = modoInfo.fmtY || fmtInt;
  const metaX = METRICAS_ELEITORAIS.find((m) => m.key === metricaX) || METRICAS_ELEITORAIS[0];

  const getValY = (r) => r[campoY] || 0;
  const getValX = (r) => (metaX.key === 'deltaPct' ? r.deltaPctCalc : r[metaX.key]);

  const faixasY = calcularFaixas3(cidadesFiltradas.map(getValY), 'positivo', fmtY);
  const faixasX = calcularFaixas3(cidadesFiltradas.map(getValX), metaX.tipo, metaX.fmt);

  const contagemCelulas = {};
  Object.keys(MATRIZ_3X3).forEach((k) => { contagemCelulas[k] = 0; });

  cidadesFiltradas.forEach((r) => {
    r.valY = getValY(r);
    r.valX = getValX(r);
    r.fy = faixasY.faixa(r.valY);
    r.fx = faixasX.faixa(r.valX);
    r.celId = `${r.fy}_${r.fx}`;
    contagemCelulas[r.celId] += 1;
  });

  // 7) Resumo geral e Insights em linguagem natural
  const totalVotosComp = cidadesFiltradas.reduce((s, r) => s + r.vComp, 0);
  const totalVotosBase = cidadesFiltradas.reduce((s, r) => s + r.vBase, 0);
  const totalDeltaVotos = totalVotosComp - totalVotosBase;
  const totalDeltaPct = totalVotosBase > 0 ? (totalDeltaVotos / totalVotosBase) * 100 : null;
  const totalEmendasVal = cidadesFiltradas.reduce((s, r) => s + r.emendas, 0);
  const totalEmendasPago = cidadesFiltradas.reduce((s, r) => s + r.pago, 0);
  const totalEmendasQtd = cidadesFiltradas.reduce((s, r) => s + r.emendasQtd, 0);
  const totalAgendasQtd = cidadesFiltradas.reduce((s, r) => s + r.agendas, 0);
  const totalHoras = cidadesFiltradas.reduce((s, r) => s + r.horas, 0);
  const totalLeadsSC = cidadesFiltradas.reduce((s, r) => s + r.leads, 0);

  const visitados = cidadesFiltradas.filter((r) => r.agendas > 0);
  const naoVisitados = cidadesFiltradas.filter((r) => r.agendas === 0);
  const comEmenda = cidadesFiltradas.filter((r) => r.emendas > 0);
  const semEmenda = cidadesFiltradas.filter((r) => r.emendas === 0);
  const comLeads = cidadesFiltradas.filter((r) => r.leads > 0);
  const semLeads = cidadesFiltradas.filter((r) => r.leads === 0);
  const comAmbos = cidadesFiltradas.filter((r) => r.quad4 === 'Q1');
  const semNenhum = cidadesFiltradas.filter((r) => r.quad4 === 'Q4');

  const crescTipicoVisitados = median(visitados.filter((r) => r.deltaPct !== null).map((r) => r.deltaPct));
  const crescTipicoNaoVisitados = median(naoVisitados.filter((r) => r.deltaPct !== null).map((r) => r.deltaPct));
  const crescTipicoComEmenda = median(comEmenda.filter((r) => r.deltaPct !== null).map((r) => r.deltaPct));
  const crescTipicoSemEmenda = median(semEmenda.filter((r) => r.deltaPct !== null).map((r) => r.deltaPct));
  const crescTipicoComLeads = median(comLeads.filter((r) => r.deltaPct !== null).map((r) => r.deltaPct));
  const crescTipicoSemLeads = median(semLeads.filter((r) => r.deltaPct !== null).map((r) => r.deltaPct));
  const crescTipicoAmbos = median(comAmbos.filter((r) => r.deltaPct !== null).map((r) => r.deltaPct));
  const crescTipicoNenhum = median(semNenhum.filter((r) => r.deltaPct !== null).map((r) => r.deltaPct));

  const taxaCresceramVisitados = visitados.length
    ? (visitados.filter((r) => r.delta > 0).length / visitados.length) * 100
    : null;
  const taxaCresceramEmendas = comEmenda.length
    ? (comEmenda.filter((r) => r.delta > 0).length / comEmenda.length) * 100
    : null;
  const taxaCresceramLeads = comLeads.length
    ? (comLeads.filter((r) => r.delta > 0).length / comLeads.length) * 100
    : null;

  const rhoAgVotos = spearman(cidadesFiltradas.map((r) => r.agendas), cidadesFiltradas.map((r) => r.vComp));
  const rhoAgDelta = spearman(cidadesFiltradas.map((r) => r.agendas), cidadesFiltradas.map((r) => r.delta));
  const rhoEmVotos = spearman(cidadesFiltradas.map((r) => r.emendas), cidadesFiltradas.map((r) => r.vComp));
  const rhoEmDelta = spearman(cidadesFiltradas.map((r) => r.emendas), cidadesFiltradas.map((r) => r.delta));
  const rhoLdVotos = spearman(cidadesFiltradas.map((r) => r.leads), cidadesFiltradas.map((r) => r.vComp));
  const rhoLdDelta = spearman(cidadesFiltradas.map((r) => r.leads), cidadesFiltradas.map((r) => r.delta));
  const rhoCombDelta = spearman(cidadesFiltradas.map((r) => r.indice), cidadesFiltradas.map((r) => r.delta));

  const insights = {
    presenca: descreverRelacao(rhoAgDelta, 'visitas do mandato'),
    emendas: descreverRelacao(rhoEmDelta, 'recursos de emendas'),
    leads: descreverRelacao(rhoLdDelta, 'leads cadastrados'),
    combinado: descreverRelacao(rhoCombDelta, 'visitas, emendas e leads juntos'),
    crescTipicoVisitados,
    crescTipicoNaoVisitados,
    crescTipicoComEmenda,
    crescTipicoSemEmenda,
    crescTipicoComLeads,
    crescTipicoSemLeads,
    crescTipicoAmbos,
    crescTipicoNenhum,
    taxaCresceramVisitados,
    taxaCresceramEmendas,
    taxaCresceramLeads,
    notaTecnica: {
      n: cidadesFiltradas.length,
      rhoAgVotos,
      rhoAgDelta,
      rhoEmVotos,
      rhoEmDelta,
      rhoLdVotos,
      rhoLdDelta,
      rhoCombDelta,
    },
  };

  // 8) Resumo por Região de SC
  const regAggMap = new Map();
  cidadesFiltradas.forEach((r) => {
    const k = r.regiao || 'Sem região definida';
    let g = regAggMap.get(k);
    if (!g) {
      g = {
        norm: norm(k),
        nome: k,
        definida: Boolean(r.regiao),
        munis: 0,
        visitados: 0,
        comEmenda: 0,
        comLeads: 0,
        agendas: 0,
        horas: 0,
        emendasQtd: 0,
        emendas: 0,
        pago: 0,
        leads: 0,
        vBase: 0,
        vComp: 0,
        top: null,
      };
      regAggMap.set(k, g);
    }
    g.munis += 1;
    if (r.agendas > 0) g.visitados += 1;
    if (r.emendas > 0) g.comEmenda += 1;
    if (r.leads > 0) g.comLeads += 1;
    g.agendas += r.agendas;
    g.horas += r.horas;
    g.emendasQtd += r.emendasQtd;
    g.emendas += r.emendas;
    g.pago += r.pago;
    g.leads += r.leads;
    g.vBase += r.vBase;
    g.vComp += r.vComp;
    if (!g.top || r.vComp > g.top.vComp) g.top = r;
  });
  const resumoRegioes = [...regAggMap.values()].map((g) => ({
    ...g,
    delta: g.vComp - g.vBase,
    deltaPct: g.vBase > 0 ? ((g.vComp - g.vBase) / g.vBase) * 100 : null,
    share: tC > 0 ? (g.vComp / tC) * 100 : null,
  }));

  // 9) Resumo por Articulador
  const artAggMap = new Map();
  const cityByNorm = new Map(cidadesBase.map((r) => [r.norm, r]));

  const getOrCreateArt = (rawName) => {
    const clean = String(rawName || '').trim();
    const k = norm(clean);
    if (!k) return null;
    let a = artAggMap.get(k);
    if (!a) {
      a = {
        norm: k,
        nome: clean,
        agendas: 0,
        horas: 0,
        emendasQtd: 0,
        emendas: 0,
        pago: 0,
        munisSet: new Set(),
      };
      artAggMap.set(k, a);
    } else {
      a.nome = nomeMaisBonito(a.nome, clean);
    }
    return a;
  };

  agendasFiltradas.forEach((ev) => {
    const a = getOrCreateArt(ev.articulador);
    if (!a) return;
    a.agendas += 1;
    a.horas += ev.horas;
    if (ev.norm) a.munisSet.add(ev.norm);
  });

  emendasFiltradas.forEach((e) => {
    const a = getOrCreateArt(e.ARTICULADOR);
    if (!a) return;
    a.emendasQtd += 1;
    a.emendas += parseCurrency(e.TOTAL);
    a.pago += parseCurrency(e.PAGO);
    const mk = norm(e['MUNICÍPIO']);
    if (mk && !SEM_MUNICIPIO.has(mk)) a.munisSet.add(mk);
  });

  const resumoArticuladores = [...artAggMap.values()]
    .map((a) => {
      let vBase = 0, vComp = 0, cresceram = 0, comVotos = 0, leadsNasCidades = 0;
      a.munisSet.forEach((mk) => {
        const c = cityByNorm.get(mk);
        if (!c) return;
        vBase += c.vBase;
        vComp += c.vComp;
        leadsNasCidades += c.leads;
        if (c.vComp > 0) comVotos += 1;
        if (c.delta > 0) cresceram += 1;
      });
      const delta = vComp - vBase;
      return {
        norm: a.norm,
        nome: a.nome,
        municipios: a.munisSet.size,
        comVotos,
        cresceram,
        agendas: a.agendas,
        horas: a.horas,
        emendasQtd: a.emendasQtd,
        emendas: a.emendas,
        pago: a.pago,
        leads: leadsNasCidades,
        vBase,
        vComp,
        delta,
        deltaPct: vBase > 0 ? (delta / vBase) * 100 : null,
      };
    })
    .sort((a, b) => (b.agendas + b.emendasQtd) - (a.agendas + a.emendasQtd));

  // 10) Listas de ação imediata
  const destaques = {
    emendaSemVisita: cidadesFiltradas
      .filter((r) => r.quad4 === 'Q2')
      .sort((a, b) => b.emendas - a.emendas)
      .slice(0, 8),
    baseOrganica: cidadesFiltradas
      .filter((r) => r.agendas === 0 && r.vComp > 0)
      .sort((a, b) => b.vComp - a.vComp)
      .slice(0, 8),
    votosSemLeads: cidadesFiltradas
      .filter((r) => r.leads === 0 && r.vComp > 0)
      .sort((a, b) => b.vComp - a.vComp)
      .slice(0, 8),
    leadsSemCrescimento: cidadesFiltradas
      .filter((r) => r.leads > 0 && r.delta <= 0)
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 8),
    maioresGanhos: cidadesFiltradas
      .filter((r) => (r.agendas > 0 || r.emendas > 0 || r.leads > 0) && r.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 8),
    atencaoQueda: cidadesFiltradas
      .filter((r) => (r.agendas > 0 || r.emendas > 0) && r.delta <= 0)
      .sort((a, b) => (b.emendas - a.emendas) || (a.delta - b.delta))
      .slice(0, 8),
  };

  // 11) Evolução anual das agendas
  const agPorAno = {};
  agendasFiltradas.forEach((ev) => {
    if (!ev.ano) return;
    agPorAno[ev.ano] = (agPorAno[ev.ano] || 0) + 1;
  });
  const evolucaoAgendas = Object.keys(agPorAno)
    .sort()
    .map((ano) => ({ label: ano, valor: agPorAno[ano] }));

  return {
    baseKey,
    compKey,
    elBase,
    elComp,
    crescEstado,
    temBaseLeads,
    cidadesBase,
    cidadesFiltradas,
    emendasFiltradas,
    agendasFiltradas,
    leadsFiltrados,
    semMunEmendas,
    leadsForaSC,
    leadsSemCidade,
    contagemEmendas,
    contagemAgendas,
    contagemLeads,
    contagemQuadrantes,
    contagemCelulas,
    faixasY,
    faixasX,
    modoInfo,
    metaX,
    resumoGeral: {
      cidades: cidadesFiltradas.length,
      visitados: visitados.length,
      comEmenda: comEmenda.length,
      comLeads: comLeads.length,
      comAmbos: comAmbos.length,
      emendaSemVisita: contagemQuadrantes.Q2,
      votosBase: totalVotosBase,
      votosComp: totalVotosComp,
      deltaVotos: totalDeltaVotos,
      deltaPct: totalDeltaPct,
      emendasQtd: totalEmendasQtd,
      emendasVal: totalEmendasVal,
      emendasPago: totalEmendasPago,
      agendasQtd: totalAgendasQtd,
      horas: totalHoras,
      leadsTotal: totalLeadsSC,
      coberturaVotosVisita: totalVotosComp > 0 ? (visitados.reduce((s, r) => s + r.vComp, 0) / totalVotosComp) * 100 : null,
      coberturaVotosEmenda: totalVotosComp > 0 ? (comEmenda.reduce((s, r) => s + r.vComp, 0) / totalVotosComp) * 100 : null,
      coberturaVotosLeads: totalVotosComp > 0 ? (comLeads.reduce((s, r) => s + r.vComp, 0) / totalVotosComp) * 100 : null,
    },
    insights,
    resumoRegioes,
    resumoArticuladores,
    destaques,
    evolucaoAgendas,
  };
}
