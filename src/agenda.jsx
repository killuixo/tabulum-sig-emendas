import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { norm, tituloMunicipio, chavesPadrao, RESULTADOS, BadgeRes } from './eleitoral.jsx';

/* ==========================================================================
   TABULUM — Módulo de Agendas × Emendas × Votos
   Dados vêm de /api/agenda (servidor). Nenhuma URL/ID/chave fica neste arquivo.
   ========================================================================== */

const CACHE_KEY = 'tabulum_agenda_cache_v1';

/* ------------------------------ formatadores ------------------------------ */
const nf0 = new Intl.NumberFormat('pt-BR');
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtInt = (n) => (n === null || n === undefined || Number.isNaN(n) ? '—' : nf0.format(Math.round(n)));
const fmtBRL = (n) => brl.format(n || 0);
function fmtBRLCompact(n) {
  const v = n || 0;
  const a = Math.abs(v);
  if (a >= 1e6) return `R$ ${(v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  if (a >= 1e3) return `R$ ${Math.round(v / 1e3).toLocaleString('pt-BR')} mil`;
  return fmtBRL(v);
}
const fmtHoras = (h) =>
  h === null || h === undefined || !Number.isFinite(h)
    ? '—'
    : `${h.toLocaleString('pt-BR', { minimumFractionDigits: h > 0 && h < 10 ? 1 : 0, maximumFractionDigits: 1 })}h`;
const fmtPct = (n, d = 1) =>
  n === null || n === undefined || !Number.isFinite(n)
    ? '—'
    : `${n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })}%`;
const fmtSigned = (n) => (n === null || n === undefined ? '—' : `${n > 0 ? '+' : ''}${nf0.format(Math.round(n))}`);
const fmtSignedPct = (n) =>
  n === null || n === undefined || !Number.isFinite(n)
    ? '—'
    : `${n > 0 ? '+' : ''}${n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const fmtDataBr = (iso) => {
  if (!iso || typeof iso !== 'string') return '—';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
};
const dinheiroCsv = (n) => (n || 0).toFixed(2).replace('.', ',');

function parseCurrency(v) {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return v;
  const c = String(v).replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(c) || 0;
}

/* ------------------------------ estatística ------------------------------- */
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

function pearson(x, y) {
  const n = x.length;
  if (n < 3) return null;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx, dy = y[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
}

function spearman(x, y) {
  if (x.length < 8) return null;
  return pearson(rankAvg(x), rankAvg(y));
}

// Converte uma série com zeros em score percentil 0..100 (0 permanece 0; ativos vão de 10 a 100)
function scorePercentilAtivos(valores) {
  const ativosIdx = [];
  const ativosVal = [];
  valores.forEach((v, i) => {
    if (v > 0) { ativosIdx.push(i); ativosVal.push(v); }
  });
  const out = new Array(valores.length).fill(0);
  if (!ativosVal.length) return out;
  if (ativosVal.length === 1) {
    out[ativosIdx[0]] = 100;
    return out;
  }
  const ranks = rankAvg(ativosVal);
  const n = ativosVal.length;
  ativosIdx.forEach((origIdx, k) => {
    out[origIdx] = 10 + ((ranks[k] - 1) / (n - 1)) * 90;
  });
  return out;
}

/* --------------------- matriz bivariada 3x3 (primárias) ------------------- */
// Eixo Y (linhas): 0 = Baixo volume de dados, 1 = Médio, 2 = Alto
// Eixo X (colunas): 0 = Baixo desempenho eleitoral, 1 = Médio, 2 = Alto
// Cores primárias: Azul claro (0,0) -> Amarelo nos meios (1,*) -> Rosa choque (2,2)
export const MATRIZ_3X3 = {
  '2_0': {
    id: '2_0', y: 2, x: 0, cor: '#f9a8d4', texto: '#831843',
    titulo: 'Alto esforço, baixo voto',
    curto: 'Esforço a converter',
    desc: 'Município com alto volume de atuação, mas votação baixa ou queda. Pede diagnóstico político local.'
  },
  '2_1': {
    id: '2_1', y: 2, x: 1, cor: '#f43f5e', texto: '#ffffff',
    titulo: 'Alto esforço, voto mediano',
    curto: 'Em consolidação',
    desc: 'Forte presença/investimento com votação intermediária. Potencial para romper para o topo.'
  },
  '2_2': {
    id: '2_2', y: 2, x: 2, cor: '#db2777', texto: '#ffffff',
    titulo: 'Alta sinergia (topo)',
    curto: 'Polo consolidado',
    desc: 'Maior volume de atuação combinado com alta votação. Núcleo estratégico do mandato.'
  },
  '1_0': {
    id: '1_0', y: 1, x: 0, cor: '#fef08a', texto: '#713f12',
    titulo: 'Esforço médio, baixo voto',
    curto: 'Presença inicial',
    desc: 'Atuação intermediária ainda sem retorno proporcional em votos.'
  },
  '1_1': {
    id: '1_1', y: 1, x: 1, cor: '#facc15', texto: '#422006',
    titulo: 'Equilíbrio mediano',
    curto: 'Faixa mediana',
    desc: 'Município no centro da distribuição: volume intermediário e votação intermediária.'
  },
  '1_2': {
    id: '1_2', y: 1, x: 2, cor: '#f59e0b', texto: '#ffffff',
    titulo: 'Esforço médio, alto voto',
    curto: 'Alta eficiência',
    desc: 'Boa resposta eleitoral mesmo com atuação intermediária. Vale ampliar presença.'
  },
  '0_0': {
    id: '0_0', y: 0, x: 0, cor: '#bae6fd', texto: '#0c4a6e',
    titulo: 'Baixo esforço, baixo voto',
    curto: 'Baixa presença',
    desc: 'Território com pouca ou nenhuma atuação registrada e baixa votação.'
  },
  '0_1': {
    id: '0_1', y: 0, x: 1, cor: '#38bdf8', texto: '#082f49',
    titulo: 'Baixo esforço, voto mediano',
    curto: 'Voto espontâneo',
    desc: 'Votação intermediária com pouca ou nenhuma atuação registrada. Boa margem de crescimento.'
  },
  '0_2': {
    id: '0_2', y: 0, x: 2, cor: '#0284c7', texto: '#ffffff',
    titulo: 'Baixo esforço, alto voto',
    curto: 'Base orgânica (visitar!)',
    desc: 'Alta votação mesmo sem presença ou emenda proporcional. Prioridade para visitas e atenção.'
  },
};

const QUAD_4 = {
  Q1: { id: 'Q1', label: 'Agenda + Emenda', cor: '#db2777', badge: 'bg-pink-600 text-white', desc: 'Municípios com presença de agenda e emendas destinadas' },
  Q2: { id: 'Q2', label: 'Só Emenda (visitar)', cor: '#f59e0b', badge: 'bg-amber-400 text-slate-900', desc: 'Receberam emendas, mas sem agenda no recorte' },
  Q3: { id: 'Q3', label: 'Só Agenda (sem emenda)', cor: '#0284c7', badge: 'bg-sky-600 text-white', desc: 'Tiveram agendas, mas sem emendas no recorte' },
  Q4: { id: 'Q4', label: 'Sem Agenda e Sem Emenda', cor: '#cbd5e1', badge: 'bg-slate-200 text-slate-700', desc: 'Sem agenda nem emenda no recorte atual' },
};

const METRICAS_Y = [
  { key: 'agendas', label: 'Nº de agendas', tipo: 'positivo', fmt: (v) => fmtInt(v), unidade: 'agendas' },
  { key: 'horas', label: 'Horas dedicadas', tipo: 'positivo', fmt: (v) => fmtHoras(v), unidade: 'horas' },
  { key: 'emendas', label: 'Emendas (R$)', tipo: 'positivo', fmt: (v) => fmtBRLCompact(v), unidade: 'emendas' },
  { key: 'indice', label: 'Índice Combinado (Agenda + Emenda)', tipo: 'positivo', fmt: (v) => `${Math.round(v)} pts`, unidade: 'pontos' },
];

const METRICAS_X = [
  { key: 'vComp', label: 'Votos (eleição de chegada)', tipo: 'positivo', fmt: (v) => fmtInt(v) },
  { key: 'delta', label: 'Variação de votos (nº)', tipo: 'variacao', fmt: (v) => fmtSigned(v) },
  { key: 'deltaPct', label: 'Crescimento de votos (%)', tipo: 'variacao', fmt: (v) => fmtSignedPct(v) },
  { key: 'pctComp', label: '% sobre comparecimento', tipo: 'positivo', fmt: (v) => fmtPct(v, 2) },
];

function calcularFaixas3(valores, tipo, modoCorte, fmt) {
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
      labels: [`≤ 0 (queda/estável)`, `> 0 até ${fmt(c2)}`, `> ${fmt(c2)}`],
    };
  }

  const zeros = validos.filter((v) => v <= 0).length;
  const ativos = validos.filter((v) => v > 0);
  if (!ativos.length) {
    return { c1: 0, c2: 0, faixa: () => 0, labels: ['0', '—', '—'] };
  }

  // Quando há >= 25% de zeros (ex.: agendas ou emendas), separar 0 na faixa Baixo e usar a mediana dos ativos evita cortes colapsados em zero
  if (modoCorte === 'adaptativo' && zeros / validos.length >= 0.25) {
    const med = percentile(ativos, 50);
    const c2 = med > 0 ? med : Math.min(...ativos);
    return {
      c1: 0,
      c2,
      faixa: (v) => {
        if (!v || v <= 0) return 0;
        return v <= c2 ? 1 : 2;
      },
      labels: ['0 (sem registro)', `> 0 até ${fmt(c2)}`, `> ${fmt(c2)}`],
    };
  }

  const base = modoCorte === 'tercis' ? ativos : validos;
  let c1 = percentile(base, 33.33);
  let c2 = percentile(base, 66.67);
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
    labels: [`≤ ${fmt(c1)}`, `${fmt(c1)} a ${fmt(c2)}`, `> ${fmt(c2)}`],
  };
}

/* ---------------------------- carga dos dados ----------------------------- */
export function prepararAgenda(payload) {
  if (!payload || !Array.isArray(payload.eventos)) return null;

  const eventos = [];
  const anosSet = new Set();
  const classesSet = new Set();
  const artSet = new Set();

  for (let i = 0; i < payload.eventos.length; i++) {
    const r = payload.eventos[i];
    if (!Array.isArray(r) || r.length < 2) continue;
    const data = String(r[0] || '');
    const titulo = String(r[1] || '');
    const municipio = String(r[2] || '').trim();
    const classe = String(r[3] || 'OUTROS EVENTOS').trim().toUpperCase();
    const articulador = String(r[4] || '').trim();
    const duracao = Number(r[5]) || 0;
    const status = String(r[6] || 'Pendente').trim();
    const online = Number(r[7]) === 1;
    const ano = data.slice(0, 4);

    if (/^\d{4}$/.test(ano)) anosSet.add(ano);
    if (classe) classesSet.add(classe);
    if (articulador) artSet.add(articulador);

    eventos.push({
      id: i,
      data,
      ano,
      titulo,
      municipio,
      norm: norm(municipio),
      classe,
      articulador,
      duracao,
      horas: duracao / 60,
      status,
      online,
    });
  }

  return {
    atualizadoEm: payload.atualizadoEm || null,
    total: eventos.length,
    comMunicipio: payload.comMunicipio || eventos.filter((e) => e.norm).length,
    municipiosUnicos: payload.municipiosUnicos || new Set(eventos.map((e) => e.norm).filter(Boolean)).size,
    anos: [...anosSet].sort(),
    classes: [...classesSet].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    articuladores: [...artSet].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    eventos,
  };
}

export function useAgendaData() {
  const [state, setState] = useState({ status: 'loading', payload: null, erro: '' });

  const carregar = useCallback(async () => {
    setState((s) => ({ ...s, status: s.payload ? 'atualizando' : 'loading', erro: '' }));
    try {
      const r = await fetch('/api/agenda');
      if (!r.ok) {
        let msg = '';
        try { msg = (await r.json()).erro || ''; } catch (e) { /* sem JSON */ }
        throw new Error(msg || `HTTP ${r.status}`);
      }
      const payload = await r.json();
      if (!payload || !Array.isArray(payload.eventos)) throw new Error('Resposta inesperada do servidor de agendas');
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); } catch (e) { /* cache opcional */ }
      setState({ status: 'ok', payload, erro: '' });
    } catch (e) {
      setState((s) => ({ status: s.payload ? 'ok-cache' : 'erro', payload: s.payload, erro: String((e && e.message) || e) }));
    }
  }, []);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CACHE_KEY);
      if (c) setState({ status: 'atualizando', payload: JSON.parse(c), erro: '' });
    } catch (e) { /* ignora cache inválido */ }
    carregar();
  }, [carregar]);

  const agenda = useMemo(() => prepararAgenda(state.payload), [state.payload]);
  return { agenda, status: state.status, erro: state.erro, recarregar: carregar };
}

/* ----------------------------- exportar PNG ------------------------------- */
function baixarSvgPng(container, nome) {
  const svg = container && container.querySelector('svg');
  if (!svg) return;
  const vb = svg.viewBox && svg.viewBox.baseVal;
  const w = (vb && vb.width) || 820;
  const h = (vb && vb.height) || 580;
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', w);
  clone.setAttribute('height', h);
  const fundo = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  fundo.setAttribute('width', '100%');
  fundo.setAttribute('height', '100%');
  fundo.setAttribute('fill', '#ffffff');
  clone.insertBefore(fundo, clone.firstChild);
  const xml = new XMLSerializer().serializeToString(clone);
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    const esc = 2;
    c.width = w * esc;
    c.height = h * esc;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    c.toBlob((b) => {
      if (!b) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = nome;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    });
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
}

/* ---------------------------- componentes base ---------------------------- */
const Kpi = ({ label, value, sub, tone = 'slate' }) => {
  const tones = {
    slate: 'text-slate-900',
    pink: 'text-pink-600',
    sky: 'text-sky-700',
    amber: 'text-amber-600',
    rose: 'text-rose-700',
  };
  return (
    <div className="bg-white border border-slate-200 p-3.5">
      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{label}</p>
      <p className={`text-lg sm:text-xl font-bold ${tones[tone] || tones.slate}`}>{value}</p>
      {sub && <p className="text-[11px] font-medium text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
};

const Card = ({ title, right, children, className = '' }) => (
  <div className={`border border-slate-300 bg-white flex flex-col ${className}`}>
    <div className="bg-amber-100/90 border-b border-slate-300 px-3 py-1.5 flex flex-wrap justify-between items-center gap-2">
      <span className="font-bold text-xs uppercase text-slate-800">{title}</span>
      {right}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

const Delta = ({ v, pct }) => {
  if (v === null || v === undefined) return <span className="text-slate-400">—</span>;
  const cor = v > 0 ? 'text-sky-700' : v < 0 ? 'text-rose-700' : 'text-slate-500';
  return (
    <span className={`font-semibold ${cor}`}>
      {fmtSigned(v)}
      {pct !== undefined && pct !== null && Number.isFinite(pct) ? (
        <span className="font-normal text-[10px]"> ({fmtSignedPct(pct)})</span>
      ) : null}
    </span>
  );
};

function TabelaOrdenavel({ columns, rows, initialSort, onRowClick, pageSize = 80, empty = 'Sem dados.' }) {
  const [sort, setSort] = useState(initialSort || { key: columns[0].key, dir: 'desc' });
  const [limit, setLimit] = useState(pageSize);
  useEffect(() => { setLimit(pageSize); }, [rows, pageSize]);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort.key) || columns[0];
    const get = col.sortValue || ((r) => r[col.key]);
    const arr = [...rows];
    arr.sort((a, b) => {
      const va = get(a), vb = get(b);
      const na = va === null || va === undefined || Number.isNaN(va);
      const nb = vb === null || vb === undefined || Number.isNaN(vb);
      if (na && nb) return 0;
      if (na) return 1;
      if (nb) return -1;
      const cmp = typeof va === 'string' ? va.localeCompare(vb, 'pt-BR') : va - vb;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort]);

  const toggle = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }));
  const al = (a) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');

  if (!rows.length) return <p className="p-4 text-xs text-slate-400 uppercase">{empty}</p>;
  const visiveis = sorted.slice(0, limit);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggle(c.key)}
                  title={c.title || ''}
                  className={`py-1.5 px-2 text-[10px] font-bold uppercase text-slate-700 cursor-pointer hover:bg-amber-200/60 select-none border-b border-slate-300 whitespace-nowrap ${al(c.align)}`}
                >
                  {c.label}
                  {sort.key === c.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visiveis.map((r, i) => (
              <tr
                key={r.norm || r.id || r.key || i}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={onRowClick ? 'hover:bg-pink-50/50 cursor-pointer' : ''}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`py-1.5 px-2 text-[11px] text-slate-800 ${al(c.align)} ${c.nowrap === false ? '' : 'whitespace-nowrap'}`}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > limit && (
        <div className="p-2 text-center border-t border-slate-200 print:hidden">
          <button
            onClick={() => setLimit((l) => l + pageSize)}
            className="px-3 py-1 text-xs font-semibold border border-slate-300 bg-white hover:bg-amber-100"
          >
            Mostrar mais ({sorted.length - limit} restantes)
          </button>
        </div>
      )}
    </div>
  );
}

/* --------------------- legenda interativa 3x3 (como no print) ------------- */
function LegendaBivariada3x3({
  labelY, labelX, faixasY, faixasX, contagemCelulas, celulaAtiva, onSelectCelula,
}) {
  const [mostrarGuia, setMostrarGuia] = useState(false);

  return (
    <div className="bg-white border border-slate-300 p-3 shadow-xs">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500">Matriz Bivariada 3 × 3</p>
          <p className="text-[11px] text-slate-700">Clique em uma cor para filtrar o mapa e a tabela</p>
        </div>
        <button
          onClick={() => setMostrarGuia((v) => !v)}
          className="text-[11px] font-semibold text-sky-700 underline hover:text-pink-600 whitespace-nowrap"
        >
          {mostrarGuia ? 'fechar guia' : 'o que cada cor diz?'}
        </button>
      </div>

      {/* Grade 3x3 fiel ao print: eixo Y à esquerda (+ acima, - abaixo) e eixo X embaixo (- -> +) */}
      <div className="flex items-center gap-3 my-2">
        <div className="flex flex-col items-center justify-between h-[132px] text-[10px] font-bold text-slate-600 select-none w-16 text-right">
          <span>+ {labelY}</span>
          <span className="h-6 w-px bg-slate-400" />
          <span>− {labelY}</span>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-1 w-[138px]">
            {[2, 1, 0].map((y) =>
              [0, 1, 2].map((x) => {
                const id = `${y}_${x}`;
                const c = MATRIZ_3X3[id];
                const qtd = contagemCelulas[id] || 0;
                const ativo = celulaAtiva === id;
                const apagado = celulaAtiva && !ativo;
                return (
                  <button
                    key={id}
                    onClick={() => onSelectCelula(ativo ? '' : id)}
                    title={`${c.titulo} (${qtd} municípios)\n${c.desc}`}
                    className={`w-[43px] h-[41px] border flex flex-col items-center justify-center transition-all ${
                      ativo ? 'border-slate-950 ring-2 ring-slate-900 scale-105 z-10' : 'border-slate-400/70 hover:scale-105'
                    }`}
                    style={{ background: c.cor, color: c.texto, opacity: apagado ? 0.35 : 1 }}
                  >
                    <span className="text-xs font-extrabold leading-none">{qtd}</span>
                  </button>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mt-1.5 select-none">
            <span>− {labelX}</span>
            <span>→</span>
            <span>+ {labelX}</span>
          </div>
        </div>
      </div>

      {celulaAtiva && (
        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-800">
            Filtro ativo: <span style={{ color: MATRIZ_3X3[celulaAtiva].cor === '#facc15' || MATRIZ_3X3[celulaAtiva].cor === '#fef08a' ? '#92400e' : MATRIZ_3X3[celulaAtiva].cor }}>{MATRIZ_3X3[celulaAtiva].titulo}</span>
          </span>
          <button onClick={() => onSelectCelula('')} className="text-[11px] font-bold text-rose-700 hover:underline">
            Limpar
          </button>
        </div>
      )}

      {/* Faixas numéricas exatas usadas nos cortes */}
      <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] text-slate-600 space-y-1">
        <p><strong>Cortes {labelY}:</strong> Baixo ({faixasY.labels[0]}) • Médio ({faixasY.labels[1]}) • Alto ({faixasY.labels[2]})</p>
        <p><strong>Cortes {labelX}:</strong> Baixo ({faixasX.labels[0]}) • Médio ({faixasX.labels[1]}) • Alto ({faixasX.labels[2]})</p>
      </div>

      {mostrarGuia && (
        <div className="mt-3 pt-2.5 border-t border-slate-300 space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {['2_2', '2_1', '2_0', '1_2', '1_1', '1_0', '0_2', '0_1', '0_0'].map((id) => {
            const c = MATRIZ_3X3[id];
            return (
              <div
                key={id}
                onClick={() => onSelectCelula(celulaAtiva === id ? '' : id)}
                className={`flex items-start gap-2 p-1.5 border cursor-pointer text-[11px] ${
                  celulaAtiva === id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <span className="w-4 h-4 border border-slate-400 flex-shrink-0 mt-0.5" style={{ background: c.cor }} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">
                    {c.titulo} <span className="font-normal text-slate-500">({contagemCelulas[id] || 0})</span>
                  </p>
                  <p className="text-[10px] text-slate-600 leading-snug">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* --------------------- mapa coroplético bivariado SC ---------------------- */
function MapaBivariadoSC({
  rows, mapGeoJson, celulaAtiva, onOpen, metricYMeta, metricXMeta, modoCor = 'bivariado',
}) {
  const [hover, setHover] = useState(null);

  const geo = useMemo(() => {
    if (!mapGeoJson || !mapGeoJson.features) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const eachRing = (g, fn) => {
      if (g.type === 'Polygon') g.coordinates.forEach(fn);
      else if (g.type === 'MultiPolygon') g.coordinates.forEach((p) => p.forEach(fn));
    };
    mapGeoJson.features.forEach((f) => eachRing(f.geometry, (ring) => ring.forEach((c) => {
      if (c[0] < minX) minX = c[0];
      if (c[0] > maxX) maxX = c[0];
      if (c[1] < minY) minY = c[1];
      if (c[1] > maxY) maxY = c[1];
    })));
    const w = 820, h = 580;
    const scale = Math.min(w / (maxX - minX), h / (maxY - minY)) * 0.95;
    const ox = (w - (maxX - minX) * scale) / 2;
    const oy = (h - (maxY - minY) * scale) / 2;
    const pt = (c) => `${(c[0] - minX) * scale + ox},${h - (c[1] - minY) * scale - oy}`;
    const ring = (rg) => 'M' + rg.map(pt).join('L') + 'Z';
    const path = (g) =>
      g.type === 'Polygon'
        ? g.coordinates.map(ring).join(' ')
        : g.type === 'MultiPolygon'
        ? g.coordinates.map((p) => p.map(ring).join(' ')).join(' ')
        : '';
    return {
      w,
      h,
      feats: mapGeoJson.features.map((f) => ({
        nome: f.properties.name,
        n: norm(f.properties.name),
        d: path(f.geometry),
      })),
    };
  }, [mapGeoJson]);

  const porNorm = useMemo(() => new Map(rows.map((r) => [r.norm, r])), [rows]);

  if (!geo) return <div className="p-8 text-center text-xs text-slate-500">Carregando mapa de Santa Catarina...</div>;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${geo.w} ${geo.h}`} className="w-full h-auto select-none" onClick={() => setHover(null)}>
        {geo.feats.map((f, i) => {
          const r = porNorm.get(f.n);
          let fill = '#f8fafc';
          let opacity = 1;
          let stroke = '#334155';
          let sw = 0.65;

          if (!r) {
            fill = '#e2e8f0';
            opacity = 0.5;
            stroke = '#94a3b8';
          } else if (modoCor === 'quadrantes') {
            fill = QUAD_4[r.quad4].cor;
            if (celulaAtiva && r.quad4 !== celulaAtiva) {
              fill = '#f1f5f9';
              opacity = 0.45;
            }
          } else {
            const cel = MATRIZ_3X3[r.celId];
            fill = cel ? cel.cor : '#ffffff';
            if (celulaAtiva && r.celId !== celulaAtiva) {
              fill = '#f1f5f9';
              opacity = 0.4;
              stroke = '#cbd5e1';
            } else if (celulaAtiva && r.celId === celulaAtiva) {
              sw = 1.2;
              stroke = '#0f172a';
            }
          }

          return (
            <path
              key={i}
              d={f.d}
              fill={fill}
              fillOpacity={opacity}
              stroke={stroke}
              strokeWidth={sw}
              className="hover:stroke-[2px] hover:stroke-slate-950 cursor-pointer transition-colors"
              onMouseEnter={(e) => setHover({ r, nomeGeo: f.nome, x: e.clientX, y: e.clientY })}
              onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
              onMouseLeave={() => setHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                onOpen(r ? r.nome : tituloMunicipio(f.nome));
              }}
            />
          );
        })}
      </svg>

      {hover && (
        <div
          className="fixed z-50 bg-white border-2 border-slate-900 shadow-lg p-2.5 text-[11px] pointer-events-none"
          style={{
            left: Math.min(hover.x + 14, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 270),
            top: Math.max(10, hover.y - 10),
            width: 255,
          }}
        >
          <p className="font-bold text-slate-900 uppercase text-xs">
            {hover.r ? hover.r.nome : tituloMunicipio(hover.nomeGeo)}
          </p>
          {hover.r ? (
            <>
              {hover.r.regiao && <p className="text-[10px] text-slate-500 mb-1">{hover.r.regiao}</p>}
              <div className="space-y-0.5 text-slate-700 border-t border-slate-200 pt-1">
                <p>Agendas: <strong>{fmtInt(hover.r.agendas)}</strong> ({fmtHoras(hover.r.horas)})</p>
                <p>Emendas: <strong>{fmtInt(hover.r.qtdEmendas)}</strong> • {fmtBRLCompact(hover.r.emendas)}</p>
                <p>Votos: <strong>{fmtInt(hover.r.vComp)}</strong> <span className="text-slate-500">(antes: {fmtInt(hover.r.vBase)})</span></p>
                <p>Variação: <Delta v={hover.r.delta} pct={hover.r.deltaPct} /></p>
                <p className="text-[10px] text-slate-500 pt-0.5">
                  {metricYMeta.label}: <strong>{metricYMeta.fmt(hover.r.valY)}</strong> • {metricXMeta.label}: <strong>{metricXMeta.fmt(hover.r.valX)}</strong>
                </p>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className="inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase border border-slate-400"
                  style={{
                    background: MATRIZ_3X3[hover.r.celId].cor,
                    color: MATRIZ_3X3[hover.r.celId].texto,
                  }}
                >
                  {MATRIZ_3X3[hover.r.celId].curto}
                </span>
              </div>
            </>
          ) : (
            <p className="text-slate-500 mt-1">Fora do filtro atual (ex.: Florianópolis excluída).</p>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------- gráfico de barras simples -------------------------- */
function BarrasSimples({ itens, cor = 'bg-pink-600', altura = 130, formatar = fmtInt }) {
  const max = Math.max(1, ...itens.map((i) => i.valor || 0));
  return (
    <div className="flex items-end justify-around gap-2 px-3 pt-6 pb-2 overflow-x-auto" style={{ height: altura + 48 }}>
      {itens.map((i) => (
        <div key={i.label} className="flex flex-col items-center flex-1 min-w-[36px]">
          <div className="flex flex-col justify-end items-center w-full max-w-[42px]" style={{ height: altura }}>
            <span className="text-[10px] font-bold text-slate-700 mb-0.5 whitespace-nowrap">{formatar(i.valor || 0)}</span>
            <div
              className={`w-full ${cor}`}
              style={{ height: `${Math.max(((i.valor || 0) / max) * 100, i.valor ? 3 : 0)}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-slate-700 mt-1 whitespace-nowrap">{i.label}</span>
          {i.sub && <span className="text-[9px] text-slate-400 whitespace-nowrap">{i.sub}</span>}
        </div>
      ))}
    </div>
  );
}

/* --------------------- status na tela de Configurações -------------------- */
export function AgendaStatus({ agenda, status, erro, recarregar }) {
  const ok = Boolean(agenda);
  return (
    <div className="border border-slate-200 p-5 bg-white">
      <h3 className="text-sm font-bold uppercase text-pink-700 border-b border-slate-200 pb-2 mb-3">
        Dados de Agendas (Google Calendar → Sheets)
      </h3>
      <p className="text-xs text-slate-700 mb-1">
        Situação:{' '}
        <strong className={ok ? 'text-sky-700' : 'text-rose-700'}>
          {status === 'loading'
            ? 'carregando...'
            : ok
            ? status === 'ok-cache'
              ? 'usando cópia local (servidor indisponível)'
              : 'conectado'
            : 'indisponível'}
        </strong>
      </p>
      {ok && (
        <p className="text-xs text-slate-500 mb-1">
          {fmtInt(agenda.total)} agendas políticas • {fmtInt(agenda.comMunicipio)} com município ({agenda.municipiosUnicos} municípios) • lido em{' '}
          {agenda.atualizadoEm ? new Date(agenda.atualizadoEm).toLocaleString('pt-BR') : '—'}
        </p>
      )}
      {erro && <p className="text-xs text-rose-700 mb-1">{erro}</p>}
      <button onClick={recarregar} className="mt-2 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-amber-100">
        Recarregar Agendas
      </button>
    </div>
  );
}

/* ---------------- perfil de agendas dentro das Fichas --------------------- */
export function AgendaPerfil({ type, value, agenda, eleitoral, openEntityFicha }) {
  const [apenasPresenciais, setApenasPresenciais] = useState(true);
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const eventosFicha = useMemo(() => {
    if (!agenda || !value) return [];
    const k = norm(value);
    const list = agenda.eventos.filter((ev) => {
      if (apenasPresenciais && ev.online) return false;
      if (type === 'municipio') return ev.norm === k;
      if (type === 'regiao') {
        if (!eleitoral || !ev.norm) return false;
        const reg = eleitoral.regiaoPorChave.get(ev.norm) || '';
        return norm(reg) === k;
      }
      if (type === 'articulador') return norm(ev.articulador) === k;
      if (type === 'ano') return ev.ano === String(value).trim();
      return false;
    });
    return list;
  }, [agenda, eleitoral, type, value, apenasPresenciais]);

  if (!agenda || !['municipio', 'regiao', 'articulador', 'ano'].includes(type)) return null;

  const totalHoras = eventosFicha.reduce((s, e) => s + e.horas, 0);
  const hojeIso = new Date().toISOString().slice(0, 10);
  const passadas = eventosFicha.filter((e) => e.data <= hojeIso);
  const futuras = eventosFicha.filter((e) => e.data > hojeIso);
  const ultima = passadas.length ? passadas[0].data : '';
  const primeira = eventosFicha.length ? eventosFicha[eventosFicha.length - 1].data : '';

  const porAnoMap = {};
  eventosFicha.forEach((e) => {
    if (!e.ano) return;
    porAnoMap[e.ano] = (porAnoMap[e.ano] || 0) + 1;
  });
  const anosOrdenados = Object.keys(porAnoMap).sort();

  const limite = mostrarTodas ? eventosFicha.length : 12;

  return (
    <div className="p-4 border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-xs sm:text-sm font-bold uppercase text-slate-800 tracking-wider flex items-center">
          <span className="w-2 h-4 bg-pink-600 mr-2" />
          Presença de Agenda do Mandato
          <span className="ml-2 normal-case font-medium text-[11px] text-slate-500">
            ({fmtInt(eventosFicha.length)} agendas {apenasPresenciais ? 'presenciais' : 'totais'})
          </span>
        </h2>
        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer print:hidden">
          <input
            type="checkbox"
            checked={apenasPresenciais}
            onChange={(e) => setApenasPresenciais(e.target.checked)}
          />
          Apenas presenciais
        </label>
      </div>

      {eventosFicha.length === 0 ? (
        <p className="text-xs text-slate-500">
          Nenhuma agenda {apenasPresenciais ? 'presencial ' : ''}registrada para este recorte na planilha de agenda.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Kpi
              label="Total de Agendas"
              value={fmtInt(eventosFicha.length)}
              tone="pink"
              sub={`${fmtInt(passadas.length)} realizadas • ${fmtInt(futuras.length)} futuras`}
            />
            <Kpi
              label="Tempo Dedicado"
              value={fmtHoras(totalHoras)}
              tone="sky"
              sub="soma das durações"
            />
            <Kpi
              label="Última Visita"
              value={fmtDataBr(ultima)}
              tone="amber"
              sub={primeira ? `primeira em ${fmtDataBr(primeira)}` : ''}
            />
            <Kpi
              label="Anos com Presença"
              value={fmtInt(anosOrdenados.length)}
              sub={anosOrdenados.length ? `${anosOrdenados[0]} → ${anosOrdenados[anosOrdenados.length - 1]}` : '—'}
            />
          </div>

          {anosOrdenados.length > 1 && (
            <div className="mb-4 border border-slate-200 bg-slate-50/40">
              <div className="px-3 py-1 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-600">
                Agendas por ano
              </div>
              <BarrasSimples
                cor="bg-pink-600"
                altura={85}
                itens={anosOrdenados.map((a) => ({ label: a, valor: porAnoMap[a] }))}
              />
            </div>
          )}

          <div className="border border-slate-300 bg-white overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold uppercase text-slate-700 border-b border-slate-300">Data</th>
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold uppercase text-slate-700 border-b border-slate-300">Classe</th>
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold uppercase text-slate-700 border-b border-slate-300">Compromisso</th>
                  {type !== 'municipio' && (
                    <th className="py-1.5 px-2 text-left text-[10px] font-bold uppercase text-slate-700 border-b border-slate-300">Município</th>
                  )}
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold uppercase text-slate-700 border-b border-slate-300">Articulador</th>
                  <th className="py-1.5 px-2 text-right text-[10px] font-bold uppercase text-slate-700 border-b border-slate-300">Duração</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eventosFicha.slice(0, limite).map((ev) => (
                  <tr key={ev.id} className="hover:bg-pink-50/40">
                    <td className="py-1.5 px-2 whitespace-nowrap font-semibold text-slate-700">{fmtDataBr(ev.data)}</td>
                    <td className="py-1.5 px-2 whitespace-nowrap text-[10px] font-semibold uppercase text-slate-600">{ev.classe}</td>
                    <td className="py-1.5 px-2 text-slate-900">
                      {ev.titulo}
                      {ev.online && (
                        <span className="ml-1.5 px-1 py-0.2 bg-amber-100 border border-amber-300 text-[9px] font-bold uppercase text-amber-900">
                          Online
                        </span>
                      )}
                    </td>
                    {type !== 'municipio' && (
                      <td
                        onClick={() => ev.municipio && openEntityFicha && openEntityFicha('municipio', ev.municipio)}
                        className="py-1.5 px-2 whitespace-nowrap font-semibold text-sky-800 hover:underline cursor-pointer"
                      >
                        {ev.municipio || '—'}
                      </td>
                    )}
                    <td className="py-1.5 px-2 whitespace-nowrap text-rose-700 font-medium">{ev.articulador || '—'}</td>
                    <td className="py-1.5 px-2 whitespace-nowrap text-right text-slate-600">{ev.duracao ? `${ev.duracao}m` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {eventosFicha.length > 12 && (
              <div className="p-2 text-center border-t border-slate-200 print:hidden">
                <button
                  onClick={() => setMostrarTodas((v) => !v)}
                  className="px-3 py-1 text-xs font-semibold border border-slate-300 bg-white hover:bg-amber-100"
                >
                  {mostrarTodas ? 'Recolher lista' : `Mostrar todas as ${eventosFicha.length} agendas`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------- módulo principal: Agendas × Votos ------------------ */
export function AgendaModule({
  agenda, status, erro, recarregar,
  eleitoral, emendas, emendasTodas, cruz,
  mapGeoJson, openEntityFicha, exportRows, filtrosGlobais = {},
}) {
  const [aba, setAba] = useState('bivariado');
  const [metricaY, setMetricaY] = useState('agendas');
  const [metricaX, setMetricaX] = useState('vComp');
  const [modoCorte, setModoCorte] = useState('adaptativo'); // 'adaptativo' | 'tercis'
  const [periodo, setPeriodo] = useState('2023_2026'); // 'todos' | '2023_2026' | '2025_2026' | '2019_2022' | 'custom'
  const [anosCustom, setAnosCustom] = useState([]);
  const [apenasPresenciais, setApenasPresenciais] = useState(true);
  const [excluirFloripa, setExcluirFloripa] = useState(false);
  const [classeSel, setClasseSel] = useState('');
  const [celulaAtiva, setCelulaAtiva] = useState('');
  const [quadAtivo, setQuadAtivo] = useState('');
  const [buscaLista, setBuscaLista] = useState('');
  const mapaRef = useRef(null);
  const mapaQuadRef = useRef(null);

  const chaves = useMemo(() => {
    if (cruz && cruz.baseKey && cruz.compKey) return { baseKey: cruz.baseKey, compKey: cruz.compKey };
    return eleitoral ? chavesPadrao(eleitoral) : { baseKey: '', compKey: '' };
  }, [cruz, eleitoral]);

  const elBase = useMemo(
    () => (eleitoral ? eleitoral.eleicoes.find((e) => e.key === chaves.baseKey) : null),
    [eleitoral, chaves.baseKey]
  );
  const elComp = useMemo(
    () => (eleitoral ? eleitoral.eleicoes.find((e) => e.key === chaves.compKey) : null),
    [eleitoral, chaves.compKey]
  );

  // Conjunto de anos ativos para filtrar a planilha de agenda
  const anosAtivos = useMemo(() => {
    if (!agenda) return new Set();
    if (periodo === 'todos') return new Set(agenda.anos);
    if (periodo === '2023_2026') return new Set(['2023', '2024', '2025', '2026']);
    if (periodo === '2025_2026') return new Set(['2025', '2026']);
    if (periodo === '2019_2022') return new Set(['2019', '2020', '2021', '2022']);
    return new Set(anosCustom.length ? anosCustom : agenda.anos);
  }, [agenda, periodo, anosCustom]);

  // 1) Agendas filtradas por período, presencial/online, classe e filtros globais da barra superior
  const eventosFiltrados = useMemo(() => {
    if (!agenda) return [];
    const mSet = new Set((filtrosGlobais.municipios || []).map(norm));
    const rSet = new Set((filtrosGlobais.regioes || []).map(norm));
    const aSet = new Set((filtrosGlobais.associacoes || []).map(norm));
    const artSet = new Set((filtrosGlobais.articuladores || []).map(norm));

    return agenda.eventos.filter((ev) => {
      if (!anosAtivos.has(ev.ano)) return false;
      if (apenasPresenciais && ev.online) return false;
      if (classeSel && ev.classe !== classeSel) return false;
      if (excluirFloripa && ev.norm === 'FLORIANOPOLIS') return false;
      if (mSet.size && (!ev.norm || !mSet.has(ev.norm))) return false;
      if (artSet.size && (!ev.articulador || !artSet.has(norm(ev.articulador)))) return false;
      if (rSet.size && eleitoral) {
        const reg = eleitoral.regiaoPorChave.get(ev.norm) || '';
        if (!rSet.has(norm(reg))) return false;
      }
      if (aSet.size && eleitoral) {
        const assoc = eleitoral.associacaoPorChave.get(ev.norm) || '';
        if (!aSet.has(norm(assoc))) return false;
      }
      return true;
    });
  }, [agenda, anosAtivos, apenasPresenciais, classeSel, excluirFloripa, filtrosGlobais, eleitoral]);

  // 2) Cruzamento Triplo por Município: Agendas × Emendas × Votos
  const analiseTripla = useMemo(() => {
    if (!agenda || !eleitoral) return null;

    // Agrupa agendas por município
    const agMap = new Map();
    const hojeIso = new Date().toISOString().slice(0, 10);
    eventosFiltrados.forEach((ev) => {
      if (!ev.norm) return;
      let g = agMap.get(ev.norm);
      if (!g) {
        g = { nome: ev.municipio, total: 0, presenciais: 0, horas: 0, ultima: '', classes: new Set(), arts: new Set() };
        agMap.set(ev.norm, g);
      }
      g.total += 1;
      if (!ev.online) g.presenciais += 1;
      g.horas += ev.horas;
      if (ev.data <= hojeIso && (!g.ultima || ev.data > g.ultima)) g.ultima = ev.data;
      if (ev.classe) g.classes.add(ev.classe);
      if (ev.articulador) g.arts.add(ev.articulador);
    });

    // Agrupa emendas (usando as emendas já filtradas pelo painel superior)
    const emMap = new Map();
    const regEmendaMap = new Map();
    (emendasTodas || []).forEach((e) => {
      const k = norm(e['MUNICÍPIO']);
      const r = String(e.REGIÃO || '').trim();
      if (k && r && norm(r) !== 'ESTADUAL' && !regEmendaMap.has(k)) regEmendaMap.set(k, r);
    });
    (emendas || []).forEach((e) => {
      const k = norm(e['MUNICÍPIO']);
      if (!k || k === 'ESTADUAL' || k === 'ESTADO') return;
      let g = emMap.get(k);
      if (!g) { g = { qtd: 0, total: 0, pago: 0 }; emMap.set(k, g); }
      g.qtd += 1;
      g.total += parseCurrency(e.TOTAL);
      g.pago += parseCurrency(e.PAGO);
    });

    const mSet = new Set((filtrosGlobais.municipios || []).map(norm));
    const rSet = new Set((filtrosGlobais.regioes || []).map(norm));
    const aSet = new Set((filtrosGlobais.associacoes || []).map(norm));

    const keys = new Set([...eleitoral.porNorm.keys(), ...agMap.keys(), ...emMap.keys()]);
    const tB = (eleitoral.totais[chaves.baseKey] || {}).votos || 0;
    const tC = (eleitoral.totais[chaves.compKey] || {}).votos || 0;
    const crescEstado = tB > 0 ? ((tC - tB) / tB) * 100 : null;

    const baseRows = [];
    keys.forEach((k) => {
      if (excluirFloripa && k === 'FLORIANOPOLIS') return;
      const m = eleitoral.porNorm.get(k);
      const ag = agMap.get(k);
      const em = emMap.get(k);

      const regiao = (m && m.regiao) || regEmendaMap.get(k) || '';
      const associacao = (m && m.associacao) || '';
      if (mSet.size && !mSet.has(k)) return;
      if (rSet.size && !rSet.has(norm(regiao))) return;
      if (aSet.size && !aSet.has(norm(associacao))) return;

      const xb = m && m.v[chaves.baseKey];
      const xc = m && m.v[chaves.compKey];
      const vBase = xb ? xb.votos || 0 : 0;
      const vComp = xc ? xc.votos || 0 : 0;
      const cComp = xc ? xc.comp || 0 : 0;
      const delta = vComp - vBase;
      const deltaPct = vBase > 0 ? ((vComp - vBase) / vBase) * 100 : vComp > 0 ? 100 : 0;
      const pctComp = cComp > 0 ? (vComp / cComp) * 100 : 0;

      const agendasQtd = ag ? ag.total : 0;
      const emendasVal = em ? em.total : 0;
      const quad4 =
        agendasQtd > 0 && emendasVal > 0
          ? 'Q1'
          : agendasQtd === 0 && emendasVal > 0
          ? 'Q2'
          : agendasQtd > 0 && emendasVal === 0
          ? 'Q3'
          : 'Q4';

      const resEleitoral = cruz && cruz.resultadoPorChave.get(k)
        ? cruz.resultadoPorChave.get(k)
        : emendasVal > 0
        ? delta > 0
          ? vBase === 0 || crescEstado === null || deltaPct > crescEstado
            ? 'converteu'
            : 'cresceu_pouco'
          : 'nao_converteu'
        : delta > 0
        ? 'organico'
        : 'sem_nada';

      baseRows.push({
        norm: k,
        nome: (m && tituloMunicipio(m.nome)) || (ag && ag.nome) || tituloMunicipio(k),
        regiao,
        associacao,
        agendas: agendasQtd,
        presenciais: ag ? ag.presenciais : 0,
        horas: ag ? ag.horas : 0,
        ultimaVisita: ag ? ag.ultima : '',
        articuladores: ag ? [...ag.arts].join(', ') : '',
        qtdEmendas: em ? em.qtd : 0,
        emendas: emendasVal,
        pago: em ? em.pago : 0,
        vBase,
        vComp,
        delta,
        deltaPct: vBase > 0 ? ((vComp - vBase) / vBase) * 100 : null,
        deltaPctCalc: deltaPct,
        pctComp,
        quad4,
        resultado: resEleitoral,
      });
    });

    // Índice Combinado (Agenda + Emenda) em escala 0..100 por percentis dos ativos
    const sAg = scorePercentilAtivos(baseRows.map((r) => r.agendas));
    const sEm = scorePercentilAtivos(baseRows.map((r) => r.emendas));
    baseRows.forEach((r, i) => {
      r.indice = (sAg[i] + sEm[i]) / 2;
    });

    const metaY = METRICAS_Y.find((m) => m.key === metricaY) || METRICAS_Y[0];
    const metaX = METRICAS_X.find((m) => m.key === metricaX) || METRICAS_X[0];

    const getValY = (r) => r[metaY.key] || 0;
    const getValX = (r) => (metaX.key === 'deltaPct' ? r.deltaPctCalc : r[metaX.key]);

    const faixasY = calcularFaixas3(baseRows.map(getValY), metaY.tipo, modoCorte, metaY.fmt);
    const faixasX = calcularFaixas3(baseRows.map(getValX), metaX.tipo, modoCorte, metaX.fmt);

    const contagemCelulas = {};
    Object.keys(MATRIZ_3X3).forEach((k) => { contagemCelulas[k] = 0; });

    baseRows.forEach((r) => {
      r.valY = getValY(r);
      r.valX = getValX(r);
      r.fy = faixasY.faixa(r.valY);
      r.fx = faixasX.faixa(r.valX);
      r.celId = `${r.fy}_${r.fx}`;
      contagemCelulas[r.celId] = (contagemCelulas[r.celId] || 0) + 1;
    });

    // Estatísticas comparativas (Com presença vs Sem presença) e correlações de Spearman
    const comAg = baseRows.filter((r) => r.agendas > 0);
    const semAg = baseRows.filter((r) => r.agendas === 0);
    const medDeltaCom = median(comAg.map((r) => r.delta));
    const medDeltaSem = median(semAg.map((r) => r.delta));
    const medPctCom = median(comAg.filter((r) => r.deltaPct !== null).map((r) => r.deltaPct));
    const medPctSem = median(semAg.filter((r) => r.deltaPct !== null).map((r) => r.deltaPct));

    const corr = {
      agVotos: spearman(baseRows.map((r) => r.agendas), baseRows.map((r) => r.vComp)),
      agDelta: spearman(baseRows.map((r) => r.agendas), baseRows.map((r) => r.delta)),
      hrDelta: spearman(baseRows.map((r) => r.horas), baseRows.map((r) => r.delta)),
      emDelta: spearman(baseRows.map((r) => r.emendas), baseRows.map((r) => r.delta)),
      idxVotos: spearman(baseRows.map((r) => r.indice), baseRows.map((r) => r.vComp)),
      idxDelta: spearman(baseRows.map((r) => r.indice), baseRows.map((r) => r.delta)),
      n: baseRows.length,
    };

    // Resumo dos 4 Quadrantes (Agenda × Emenda + Votos)
    const resumoQuad4 = ['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
      const grp = baseRows.filter((r) => r.quad4 === q);
      const pcts = grp.filter((r) => r.deltaPct !== null).map((r) => r.deltaPct);
      const vB = grp.reduce((s, r) => s + r.vBase, 0);
      const vC = grp.reduce((s, r) => s + r.vComp, 0);
      return {
        q,
        meta: QUAD_4[q],
        munis: grp.length,
        agendas: grp.reduce((s, r) => s + r.agendas, 0),
        horas: grp.reduce((s, r) => s + r.horas, 0),
        emendas: grp.reduce((s, r) => s + r.emendas, 0),
        vBase: vB,
        vComp: vC,
        delta: vC - vB,
        deltaPctTotal: vB > 0 ? ((vC - vB) / vB) * 100 : null,
        medDeltaPct: median(pcts),
      };
    });

    return {
      rows: baseRows,
      metaY,
      metaX,
      faixasY,
      faixasX,
      contagemCelulas,
      corr,
      comAg,
      semAg,
      medDeltaCom,
      medDeltaSem,
      medPctCom,
      medPctSem,
      resumoQuad4,
    };
  }, [agenda, eleitoral, eventosFiltrados, emendas, emendasTodas, chaves, cruz, filtrosGlobais, excluirFloripa, metricaY, metricaX, modoCorte]);

  // Agregação por Região e Evolução Anual (sempre antes de qualquer return condicional)
  const regioesAgg = useMemo(() => {
    if (!analiseTripla) return [];
    const m = new Map();
    analiseTripla.rows.forEach((r) => {
      const k = r.regiao || 'Sem região definida';
      let g = m.get(k);
      if (!g) {
        g = { norm: norm(k), nome: k, definida: Boolean(r.regiao), munis: 0, visitados: 0, agendas: 0, horas: 0, emendas: 0, vBase: 0, vComp: 0 };
        m.set(k, g);
      }
      g.munis += 1;
      if (r.agendas > 0) g.visitados += 1;
      g.agendas += r.agendas;
      g.horas += r.horas;
      g.emendas += r.emendas;
      g.vBase += r.vBase;
      g.vComp += r.vComp;
    });
    return [...m.values()].map((g) => ({
      ...g,
      delta: g.vComp - g.vBase,
      deltaPct: g.vBase > 0 ? ((g.vComp - g.vBase) / g.vBase) * 100 : null,
    }));
  }, [analiseTripla]);

  const evolucaoAnual = useMemo(() => {
    const m = {};
    eventosFiltrados.forEach((e) => {
      if (!e.ano) return;
      if (!m[e.ano]) m[e.ano] = { ano: e.ano, total: 0, horas: 0, munis: new Set() };
      m[e.ano].total += 1;
      m[e.ano].horas += e.horas;
      if (e.norm) m[e.ano].munis.add(e.norm);
    });
    return Object.values(m)
      .sort((a, b) => a.ano.localeCompare(b.ano))
      .map((x) => ({ label: x.ano, valor: x.total, sub: `${x.munis.size} mun.` }));
  }, [eventosFiltrados]);

  const topClasses = useMemo(() => {
    const m = {};
    eventosFiltrados.forEach((e) => {
      if (!e.classe || e.classe === 'OUTROS EVENTOS') return;
      m[e.classe] = (m[e.classe] || 0) + 1;
    });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [eventosFiltrados]);

  const listaEventosFiltrados = useMemo(() => {
    if (!buscaLista.trim()) return eventosFiltrados;
    const b = norm(buscaLista);
    return eventosFiltrados.filter(
      (e) => norm(e.titulo).includes(b) || e.norm.includes(b) || norm(e.classe).includes(b) || norm(e.articulador).includes(b)
    );
  }, [eventosFiltrados, buscaLista]);

  /* ---------------- carregamento / erro (depois de TODOS os hooks) ---------------- */
  if (!agenda || !eleitoral || !analiseTripla) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white border border-slate-300 p-6">
          <h2 className="text-lg font-bold uppercase text-slate-900 mb-2">Agendas × Emendas × Votos</h2>
          {status === 'loading' || status === 'atualizando' || !eleitoral ? (
            <p className="text-sm text-slate-600">Carregando dados de agenda e eleitorais...</p>
          ) : (
            <>
              <p className="text-sm text-slate-700 mb-2">Não foi possível carregar os dados de agenda.</p>
              <p className="text-xs text-rose-700 font-semibold mb-3">{erro}</p>
              <button onClick={recarregar} className="bg-pink-600 text-white text-xs font-bold uppercase px-4 py-2 hover:bg-pink-700">
                Tentar novamente
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const rowsVisiveis = celulaAtiva
    ? analiseTripla.rows.filter((r) => r.celId === celulaAtiva)
    : analiseTripla.rows;

  const rowsQuadVisiveis = quadAtivo
    ? analiseTripla.rows.filter((r) => r.quad4 === quadAtivo)
    : analiseTripla.rows;

  const totalAgendasRecorte = analiseTripla.rows.reduce((s, r) => s + r.agendas, 0);
  const totalHorasRecorte = analiseTripla.rows.reduce((s, r) => s + r.horas, 0);
  const votosTotalRecorte = analiseTripla.rows.reduce((s, r) => s + r.vComp, 0);
  const votosNosVisitados = analiseTripla.comAg.reduce((s, r) => s + r.vComp, 0);
  const coberturaVotos = votosTotalRecorte > 0 ? (votosNosVisitados / votosTotalRecorte) * 100 : null;

  const abrirMunicipio = (nome) => openEntityFicha && openEntityFicha('municipio', nome);

  const textoSpearman = (rho, titulo) => {
    if (rho === null) return <p className="text-xs text-slate-400">{titulo}: amostra insuficiente.</p>;
    const a = Math.abs(rho);
    const forca = a < 0.2 ? 'muito fraca / nula' : a < 0.4 ? 'fraca' : a < 0.6 ? 'moderada' : 'forte';
    const sinal = rho >= 0 ? 'positiva' : 'negativa';
    return (
      <p className="text-xs text-slate-700">
        {titulo}: <strong className={rho >= 0.4 ? 'text-pink-700' : 'text-slate-900'}>ρ = {rho.toFixed(2).replace('.', ',')}</strong>{' '}
        <span className="text-slate-500">(correlação {forca} {sinal})</span>
      </p>
    );
  };

  const exportarCSV = () => {
    if (!exportRows) return;
    if (aba === 'lista') {
      return exportRows(
        listaEventosFiltrados.map((e) => ({
          Data: fmtDataBr(e.data),
          Título: e.titulo,
          Município: e.municipio,
          Classe: e.classe,
          Articulador: e.articulador,
          'Duração (min)': e.duracao,
          Modalidade: e.online ? 'Online' : 'Presencial',
          Status: e.status,
        })),
        'tabulum_agendas_filtradas.csv'
      );
    }
    if (aba === 'regioes') {
      return exportRows(
        regioesAgg.map((g) => ({
          Região: g.nome,
          Municípios: g.munis,
          'Municípios visitados': g.visitados,
          Agendas: g.agendas,
          Horas: g.horas.toFixed(1).replace('.', ','),
          'Emendas (R$)': dinheiroCsv(g.emendas),
          [`Votos ${elBase ? elBase.ano : 'base'}`]: g.vBase,
          [`Votos ${elComp ? elComp.ano : 'atual'}`]: g.vComp,
          'Variação de votos': g.delta,
          'Variação %': g.deltaPct === null ? '' : g.deltaPct.toFixed(1).replace('.', ','),
        })),
        'tabulum_agendas_votos_regioes.csv'
      );
    }
    const baseExp = aba === 'quadrantes' ? rowsQuadVisiveis : rowsVisiveis;
    return exportRows(
      baseExp.map((r) => ({
        Município: r.nome,
        Região: r.regiao,
        'Matriz 3x3': MATRIZ_3X3[r.celId].titulo,
        'Quadrante (Agenda x Emenda)': QUAD_4[r.quad4].label,
        Agendas: r.agendas,
        Horas: r.horas.toFixed(1).replace('.', ','),
        'Última visita': fmtDataBr(r.ultimaVisita),
        'Emendas (qtd)': r.qtdEmendas,
        'Emendas (R$)': dinheiroCsv(r.emendas),
        'Índice Combinado (0-100)': Math.round(r.indice),
        [`Votos ${elBase ? elBase.ano : 'base'}`]: r.vBase,
        [`Votos ${elComp ? elComp.ano : 'atual'}`]: r.vComp,
        'Variação de votos': r.delta,
        'Variação %': r.deltaPct === null ? '' : r.deltaPct.toFixed(1).replace('.', ','),
        Conversão: RESULTADOS[r.resultado] ? RESULTADOS[r.resultado].label : '',
      })),
      'tabulum_cruzamento_agendas_emendas_votos.csv'
    );
  };

  const colunasTriplo = [
    {
      key: 'nome', label: 'Município', align: 'left',
      render: (r) => <span className="font-semibold text-sky-800 hover:underline">{r.nome}</span>,
    },
    { key: 'regiao', label: 'Região', align: 'left', render: (r) => r.regiao || <span className="text-slate-300">—</span> },
    {
      key: 'celId', label: 'Matriz 3×3', align: 'left',
      sortValue: (r) => r.fy * 10 + r.fx,
      render: (r) => (
        <span
          className="inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase border border-slate-400/50"
          style={{ background: MATRIZ_3X3[r.celId].cor, color: MATRIZ_3X3[r.celId].texto }}
          title={MATRIZ_3X3[r.celId].desc}
        >
          {MATRIZ_3X3[r.celId].curto}
        </span>
      ),
    },
    {
      key: 'agendas', label: 'Agendas', align: 'right',
      render: (r) => (r.agendas ? <strong className="text-pink-700">{fmtInt(r.agendas)}</strong> : <span className="text-slate-300">0</span>),
    },
    { key: 'horas', label: 'Horas', align: 'right', render: (r) => (r.horas > 0 ? fmtHoras(r.horas) : <span className="text-slate-300">—</span>) },
    { key: 'ultimaVisita', label: 'Última visita', align: 'center', render: (r) => (r.ultimaVisita ? fmtDataBr(r.ultimaVisita) : <span className="text-slate-300">—</span>) },
    { key: 'emendas', label: 'Emendas (R$)', align: 'right', render: (r) => (r.emendas ? fmtBRLCompact(r.emendas) : <span className="text-slate-300">—</span>) },
    { key: 'indice', label: 'Índice', align: 'right', title: 'Índice Combinado Agenda + Emenda (0 a 100)', render: (r) => (r.indice > 0 ? Math.round(r.indice) : <span className="text-slate-300">0</span>) },
    { key: 'vBase', label: `Votos ${elBase ? elBase.ano : ''}`, align: 'right', render: (r) => fmtInt(r.vBase) },
    { key: 'vComp', label: `Votos ${elComp ? elComp.ano : ''}`, align: 'right', render: (r) => <strong>{fmtInt(r.vComp)}</strong> },
    { key: 'delta', label: 'Variação', align: 'right', render: (r) => <Delta v={r.delta} pct={r.deltaPct} /> },
    { key: 'resultado', label: 'Conversão', align: 'left', render: (r) => (RESULTADOS[r.resultado] ? <BadgeRes resultado={r.resultado} /> : '—') },
  ];

  const abas = [
    ['bivariado', 'Mapa Bivariado 3×3'],
    ['cruzamento', 'Cruzamento Triplo'],
    ['quadrantes', '4 Quadrantes (Agenda × Emenda)'],
    ['regioes', 'Regiões & Evolução'],
    ['lista', `Lista de Agendas (${fmtInt(eventosFiltrados.length)})`],
  ];

  const toggleAnoCustom = (ano) => {
    setPeriodo('custom');
    setAnosCustom((prev) => (prev.includes(ano) ? prev.filter((a) => a !== ano) : [...prev, ano].sort()));
  };

  return (
    <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-end justify-between gap-2 print:hidden">
        <div>
          <h2 className="text-base font-bold uppercase text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-4 bg-pink-600 inline-block" />
            Presença Territorial: Agendas × Emendas × Votos
          </h2>
          <p className="text-xs text-slate-500">
            Cruzamento entre a agenda do mandato ({fmtInt(eventosFiltrados.length)} registros no recorte), emendas e votação{' '}
            {elBase && elComp ? `(${elBase.label} → ${elComp.label})` : ''}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportarCSV} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-amber-100">
            Baixar CSV
          </button>
          <button onClick={() => window.print()} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-sky-700 hover:text-white">
            PDF
          </button>
          <button onClick={recarregar} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-amber-100">
            {status === 'atualizando' ? 'Atualizando...' : 'Atualizar Agendas'}
          </button>
        </div>
      </div>

      {/* Painel de controles estatísticos do recorte */}
      <div className="bg-white border border-slate-300 p-3 space-y-2.5 print:hidden">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <label className="flex items-center gap-1.5">
            <span className="font-bold uppercase text-[10px] text-pink-700">Eixo Vertical (Dados):</span>
            <select
              value={metricaY}
              onChange={(e) => { setMetricaY(e.target.value); setCelulaAtiva(''); }}
              className="border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
            >
              {METRICAS_Y.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5">
            <span className="font-bold uppercase text-[10px] text-sky-800">Eixo Horizontal (Eleição):</span>
            <select
              value={metricaX}
              onChange={(e) => { setMetricaX(e.target.value); setCelulaAtiva(''); }}
              className="border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
            >
              {METRICAS_X.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5">
            <span className="font-bold uppercase text-[10px] text-slate-600">Cortes 3×3:</span>
            <select
              value={modoCorte}
              onChange={(e) => setModoCorte(e.target.value)}
              className="border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
            >
              <option value="adaptativo">Mediana sobre ativos (recomendado)</option>
              <option value="tercis">Tercis estritos (33% / 67%)</option>
            </select>
          </label>

          <label className="flex items-center gap-1.5">
            <span className="font-bold uppercase text-[10px] text-slate-600">Classe:</span>
            <select
              value={classeSel}
              onChange={(e) => setClasseSel(e.target.value)}
              className="border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 max-w-[190px]"
            >
              <option value="">Todas as classes políticas</option>
              {agenda.classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold uppercase text-[10px] text-slate-500 mr-1">Período das agendas:</span>
            {[
              ['2023_2026', 'Mandato 2023–2026'],
              ['2025_2026', 'Pré-eleição 2025–2026'],
              ['2019_2022', 'Ciclo 2019–2022'],
              ['todos', 'Histórico Completo'],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setPeriodo(k)}
                className={`px-2 py-0.5 text-[11px] font-semibold border ${
                  periodo === k ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-amber-100'
                }`}
              >
                {l}
              </button>
            ))}
            <details className="relative inline-block">
              <summary className="list-none cursor-pointer px-2 py-0.5 text-[11px] font-semibold border border-slate-300 bg-white hover:bg-amber-100">
                Anos ({periodo === 'custom' ? anosCustom.length || 'todos' : 'escolher'})
              </summary>
              <div className="absolute left-0 z-30 mt-1 p-2 bg-white border border-slate-400 shadow-lg flex flex-wrap gap-1 w-64">
                {agenda.anos.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleAnoCustom(a)}
                    className={`px-2 py-0.5 text-[11px] font-semibold border ${
                      anosAtivos.has(a) ? 'bg-pink-600 text-white border-pink-700' : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </details>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700" title="Remove reuniões remotas/Meet para medir apenas presença física no município">
              <input type="checkbox" checked={apenasPresenciais} onChange={(e) => setApenasPresenciais(e.target.checked)} />
              Apenas presenciais
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-pink-800" title="Florianópolis concentra ~78% das agendas e ~70% dos votos. Excluir a capital revela com nitidez o padrão do interior.">
              <input type="checkbox" checked={excluirFloripa} onChange={(e) => { setExcluirFloripa(e.target.checked); setCelulaAtiva(''); }} />
              Excluir Florianópolis (analisar interior)
            </label>
          </div>
        </div>
      </div>

      {/* KPIs de síntese estatística */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi
          label="Municípios com Agenda"
          value={fmtInt(analiseTripla.comAg.length)}
          tone="pink"
          sub={`de ${fmtInt(analiseTripla.rows.length)} no recorte (${fmtPct(analiseTripla.rows.length ? (analiseTripla.comAg.length / analiseTripla.rows.length) * 100 : null)})`}
        />
        <Kpi
          label="Agendas Municipalizadas"
          value={fmtInt(totalAgendasRecorte)}
          tone="slate"
          sub={`${fmtHoras(totalHorasRecorte)} acumuladas`}
        />
        <Kpi
          label="Cobertura Eleitoral"
          value={fmtPct(coberturaVotos)}
          tone="sky"
          sub={`${fmtInt(votosNosVisitados)} votos nos visitados`}
        />
        <Kpi
          label="Mediana Δ Votos (Visitados)"
          value={fmtSigned(analiseTripla.medDeltaCom)}
          tone="pink"
          sub={`cresc. mediano: ${fmtSignedPct(analiseTripla.medPctCom)}`}
        />
        <Kpi
          label="Mediana Δ Votos (Não Visitados)"
          value={fmtSigned(analiseTripla.medDeltaSem)}
          tone="amber"
          sub={`cresc. mediano: ${fmtSignedPct(analiseTripla.medPctSem)}`}
        />
        <Kpi
          label="Correlação (Spearman)"
          value={analiseTripla.corr.agVotos !== null ? `ρ = ${analiseTripla.corr.agVotos.toFixed(2).replace('.', ',')}` : '—'}
          tone="sky"
          sub={`agendas × variação: ${analiseTripla.corr.agDelta !== null ? analiseTripla.corr.agDelta.toFixed(2).replace('.', ',') : '—'}`}
        />
      </div>

      {/* Abas internas */}
      <div className="flex flex-wrap border-b border-slate-300 print:hidden">
        {abas.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setAba(k)}
            className={`px-3.5 py-2 text-xs font-bold uppercase border border-b-0 -mb-px ${
              aba === k ? 'bg-white border-slate-300 text-pink-700' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ABA 1: MAPA BIVARIADO 3x3 */}
      {aba === 'bivariado' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <Card
              className="lg:col-span-8"
              title={`Mapa Bivariado 3×3: ${analiseTripla.metaY.label} × ${analiseTripla.metaX.label}`}
              right={
                <button
                  onClick={() => baixarSvgPng(mapaRef.current, 'tabulum_mapa_bivariado_3x3.png')}
                  className="text-[11px] font-semibold px-2 py-0.5 border border-slate-400 bg-white hover:bg-amber-100 print:hidden"
                >
                  Baixar imagem (PNG)
                </button>
              }
            >
              <div className="p-3" ref={mapaRef}>
                <MapaBivariadoSC
                  rows={analiseTripla.rows}
                  mapGeoJson={mapGeoJson}
                  celulaAtiva={celulaAtiva}
                  onOpen={abrirMunicipio}
                  metricYMeta={analiseTripla.metaY}
                  metricXMeta={analiseTripla.metaX}
                />
              </div>
            </Card>

            <div className="lg:col-span-4 space-y-4">
              <LegendaBivariada3x3
                labelY={analiseTripla.metaY.key === 'agendas' ? 'agendas' : analiseTripla.metaY.key === 'horas' ? 'horas' : analiseTripla.metaY.key === 'emendas' ? 'emendas' : 'índice'}
                labelX={analiseTripla.metaX.key === 'vComp' ? 'votos' : 'variação'}
                faixasY={analiseTripla.faixasY}
                faixasX={analiseTripla.faixasX}
                contagemCelulas={analiseTripla.contagemCelulas}
                celulaAtiva={celulaAtiva}
                onSelectCelula={setCelulaAtiva}
              />

              <Card title="Leitura Estatística (Spearman ρ)">
                <div className="p-3 space-y-1.5">
                  {textoSpearman(analiseTripla.corr.agVotos, `Agendas × Votos ${elComp ? elComp.ano : ''}`)}
                  {textoSpearman(analiseTripla.corr.agDelta, `Agendas × Variação de votos`)}
                  {textoSpearman(analiseTripla.corr.hrDelta, `Horas dedicadas × Variação de votos`)}
                  {textoSpearman(analiseTripla.corr.emDelta, `Emendas (R$) × Variação de votos`)}
                  {textoSpearman(analiseTripla.corr.idxDelta, `Índice Combinado × Variação de votos`)}
                  <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    Spearman mede relação monotônica por postos (n = {analiseTripla.corr.n}), sendo ideal para dados assimétricos como votos, agendas e emendas.
                    {!excluirFloripa && ' Dica: marque "Excluir Florianópolis" acima para testar o efeito isolado no interior.'}
                  </p>
                </div>
              </Card>
            </div>
          </div>

          <Card
            title={
              celulaAtiva
                ? `Municípios na célula "${MATRIZ_3X3[celulaAtiva].titulo}" (${rowsVisiveis.length})`
                : `Municípios no recorte (${rowsVisiveis.length}) — clique na linha para abrir a Ficha`
            }
            right={
              celulaAtiva ? (
                <button onClick={() => setCelulaAtiva('')} className="text-[11px] font-bold text-rose-700 hover:underline">
                  Mostrar todos
                </button>
              ) : null
            }
          >
            <TabelaOrdenavel
              columns={colunasTriplo}
              rows={rowsVisiveis}
              initialSort={{ key: metricaY === 'indice' ? 'indice' : metricaY === 'emendas' ? 'emendas' : 'agendas', dir: 'desc' }}
              onRowClick={(r) => abrirMunicipio(r.nome)}
              pageSize={60}
            />
          </Card>
        </div>
      )}

      {/* ABA 2: CRUZAMENTO TRIPLO COMPLETO */}
      {aba === 'cruzamento' && (
        <Card title={`Cruzamento Triplo Completo: Agendas × Emendas × Votos (${rowsVisiveis.length} municípios)`}>
          <TabelaOrdenavel
            columns={colunasTriplo}
            rows={rowsVisiveis}
            initialSort={{ key: 'vComp', dir: 'desc' }}
            onRowClick={(r) => abrirMunicipio(r.nome)}
            pageSize={150}
          />
        </Card>
      )}

      {/* ABA 3: 4 QUADRANTES (AGENDA × EMENDA × VOTOS) */}
      {aba === 'quadrantes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {analiseTripla.resumoQuad4.map((q) => {
              const ativo = quadAtivo === q.q;
              return (
                <button
                  key={q.q}
                  onClick={() => setQuadAtivo(ativo ? '' : q.q)}
                  className={`text-left p-3.5 bg-white border transition-all ${
                    ativo ? 'border-slate-950 ring-2 ring-slate-900' : 'border-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase ${q.meta.badge}`}>{q.q} • {q.meta.label}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {fmtInt(q.munis)} <span className="text-xs font-medium text-slate-500">municípios</span>
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-700 space-y-0.5">
                    <p>Agendas: <strong>{fmtInt(q.agendas)}</strong> ({fmtHoras(q.horas)})</p>
                    <p>Emendas: <strong>{fmtBRLCompact(q.emendas)}</strong></p>
                    <p>Votos {elComp ? elComp.ano : ''}: <strong>{fmtInt(q.vComp)}</strong> (<Delta v={q.delta} pct={q.deltaPctTotal} />)</p>
                    <p className="text-[10px] text-slate-500">Cresc. mediano municipal: <strong>{fmtSignedPct(q.medDeltaPct)}</strong></p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <Card
              className="lg:col-span-7"
              title="Mapa dos 4 Quadrantes (Presença × Emendas)"
              right={
                <button
                  onClick={() => baixarSvgPng(mapaQuadRef.current, 'tabulum_mapa_4_quadrantes.png')}
                  className="text-[11px] font-semibold px-2 py-0.5 border border-slate-400 bg-white hover:bg-amber-100 print:hidden"
                >
                  Baixar PNG
                </button>
              }
            >
              <div className="p-3" ref={mapaQuadRef}>
                <MapaBivariadoSC
                  rows={analiseTripla.rows}
                  mapGeoJson={mapGeoJson}
                  celulaAtiva={quadAtivo}
                  onOpen={abrirMunicipio}
                  metricYMeta={analiseTripla.metaY}
                  metricXMeta={analiseTripla.metaX}
                  modoCor="quadrantes"
                />
              </div>
            </Card>

            <Card className="lg:col-span-5" title="Prioridades imediatas (Alerta de Visita vs. Oportunidade)">
              <div className="p-3 space-y-3 text-xs">
                <div>
                  <p className="font-bold uppercase text-amber-800 mb-1">
                    Q2 • Receberam Emenda, mas 0 Agendas no período (maiores valores)
                  </p>
                  <div className="divide-y divide-slate-100 border border-slate-200 max-h-56 overflow-y-auto">
                    {analiseTripla.rows
                      .filter((r) => r.quad4 === 'Q2')
                      .sort((a, b) => b.emendas - a.emendas)
                      .slice(0, 12)
                      .map((r) => (
                        <div
                          key={r.norm}
                          onClick={() => abrirMunicipio(r.nome)}
                          className="px-2 py-1.5 flex justify-between hover:bg-amber-50 cursor-pointer"
                        >
                          <span className="font-semibold text-sky-800">{r.nome}</span>
                          <span><strong>{fmtBRLCompact(r.emendas)}</strong> • {fmtInt(r.vComp)} votos</span>
                        </div>
                      ))}
                    {analiseTripla.rows.filter((r) => r.quad4 === 'Q2').length === 0 && (
                      <p className="p-2 text-slate-400">Nenhum município nesta condição.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-bold uppercase text-sky-800 mb-1">
                    Base orgânica: mais votos sem nenhuma agenda no período
                  </p>
                  <div className="divide-y divide-slate-100 border border-slate-200 max-h-56 overflow-y-auto">
                    {analiseTripla.rows
                      .filter((r) => r.agendas === 0 && r.vComp > 0)
                      .sort((a, b) => b.vComp - a.vComp)
                      .slice(0, 12)
                      .map((r) => (
                        <div
                          key={r.norm}
                          onClick={() => abrirMunicipio(r.nome)}
                          className="px-2 py-1.5 flex justify-between hover:bg-sky-50 cursor-pointer"
                        >
                          <span className="font-semibold text-sky-800">{r.nome}</span>
                          <span><strong>{fmtInt(r.vComp)} votos</strong> • <Delta v={r.delta} /></span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card
            title={`Tabela dos Quadrantes (${rowsQuadVisiveis.length} municípios)`}
            right={quadAtivo ? <button onClick={() => setQuadAtivo('')} className="text-[11px] font-bold text-rose-700 hover:underline">Limpar quadrante</button> : null}
          >
            <TabelaOrdenavel
              columns={colunasTriplo}
              rows={rowsQuadVisiveis}
              initialSort={{ key: 'emendas', dir: 'desc' }}
              onRowClick={(r) => abrirMunicipio(r.nome)}
              pageSize={80}
            />
          </Card>
        </div>
      )}

      {/* ABA 4: REGIÕES & EVOLUÇÃO */}
      {aba === 'regioes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="Evolução Anual das Agendas no Recorte">
              <BarrasSimples cor="bg-pink-600" altura={145} itens={evolucaoAnual} />
            </Card>
            <Card title="Principais Classes de Atividade">
              <div className="p-3 space-y-2 max-h-56 overflow-y-auto">
                {topClasses.length === 0 && <p className="text-xs text-slate-400">Sem classes detalhadas.</p>}
                {topClasses.map(([cl, qtd]) => (
                  <div key={cl} className="text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">{cl}</span>
                      <span className="font-bold text-pink-700">{fmtInt(qtd)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 mt-0.5">
                      <div className="h-2 bg-amber-400" style={{ width: `${(qtd / (topClasses[0][1] || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card title="Consolidado por Região de Santa Catarina (Agendas × Emendas × Votos)">
            <TabelaOrdenavel
              initialSort={{ key: 'agendas', dir: 'desc' }}
              rows={regioesAgg}
              onRowClick={(g) => g.definida && openEntityFicha && openEntityFicha('regiao', g.nome)}
              columns={[
                { key: 'nome', label: 'Região', align: 'left', render: (g) => <span className={g.definida ? 'font-semibold text-sky-800 hover:underline' : 'italic text-slate-400'}>{g.nome}</span> },
                { key: 'munis', label: 'Municípios', align: 'center' },
                { key: 'visitados', label: 'Visitados', align: 'center' },
                { key: 'agendas', label: 'Agendas', align: 'right', render: (g) => <strong className="text-pink-700">{fmtInt(g.agendas)}</strong> },
                { key: 'horas', label: 'Horas', align: 'right', render: (g) => fmtHoras(g.horas) },
                { key: 'emendas', label: 'Emendas (R$)', align: 'right', render: (g) => fmtBRLCompact(g.emendas) },
                { key: 'vBase', label: `Votos ${elBase ? elBase.ano : ''}`, align: 'right', render: (g) => fmtInt(g.vBase) },
                { key: 'vComp', label: `Votos ${elComp ? elComp.ano : ''}`, align: 'right', render: (g) => <strong>{fmtInt(g.vComp)}</strong> },
                { key: 'delta', label: 'Variação', align: 'right', render: (g) => <Delta v={g.delta} pct={g.deltaPct} /> },
              ]}
            />
          </Card>
        </div>
      )}

      {/* ABA 5: LISTA DE AGENDAS */}
      {aba === 'lista' && (
        <Card
          title={`Agendas no recorte (${fmtInt(listaEventosFiltrados.length)})`}
          right={
            <input
              type="text"
              placeholder="Filtrar compromisso, cidade ou articulador..."
              value={buscaLista}
              onChange={(e) => setBuscaLista(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-300 bg-white w-64 focus:outline-none focus:border-pink-600"
            />
          }
        >
          <TabelaOrdenavel
            initialSort={{ key: 'data', dir: 'desc' }}
            rows={listaEventosFiltrados}
            pageSize={100}
            columns={[
              { key: 'data', label: 'Data', align: 'left', render: (e) => <span className="font-semibold">{fmtDataBr(e.data)}</span> },
              { key: 'classe', label: 'Classe', align: 'left', render: (e) => <span className="text-[10px] font-bold uppercase text-slate-600">{e.classe}</span> },
              {
                key: 'titulo', label: 'Compromisso', align: 'left', nowrap: false,
                render: (e) => (
                  <span>
                    {e.titulo}
                    {e.online && <span className="ml-1.5 px-1 bg-amber-100 border border-amber-300 text-[9px] font-bold uppercase">Online</span>}
                  </span>
                ),
              },
              {
                key: 'municipio', label: 'Município', align: 'left',
                render: (e) =>
                  e.municipio ? (
                    <button
                      onClick={(ev) => { ev.stopPropagation(); abrirMunicipio(e.municipio); }}
                      className="font-semibold text-sky-800 hover:underline"
                    >
                      {e.municipio}
                    </button>
                  ) : (
                    <span className="text-slate-300">—</span>
                  ),
              },
              { key: 'articulador', label: 'Articulador', align: 'left', render: (e) => e.articulador || <span className="text-slate-300">—</span> },
              { key: 'duracao', label: 'Duração', align: 'right', render: (e) => (e.duracao ? `${e.duracao}m` : '—') },
              { key: 'status', label: 'Status', align: 'center' },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
