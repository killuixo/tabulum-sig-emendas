import React, { useState, useEffect, useMemo, useCallback, useContext, useRef, createContext } from 'react';

/* ==========================================================================
   TABULUM — Módulo Eleitoral
   Dados vêm de /api/eleitoral (servidor). Nenhuma URL/ID/chave fica neste arquivo.
   ========================================================================== */

const CACHE_KEY = 'tabulum_eleitoral_cache_v1';

// Quando true (durante a impressão/PDF), as tabelas mostram TODAS as linhas filtradas.
const ImpressaoCtx = createContext(false);

/* ------------------------------ helpers ---------------------------------- */
function norm(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
}

function parseCurrency(v) {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return v;
  const c = String(v).replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(c) || 0;
}

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
const fmtPct = (n, d = 1) =>
  n === null || n === undefined || !Number.isFinite(n)
    ? '—'
    : `${n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })}%`;
const fmtSigned = (n) => (n === null || n === undefined ? '—' : `${n > 0 ? '+' : ''}${nf0.format(Math.round(n))}`);
const fmtSignedPct = (n) =>
  n === null || n === undefined || !Number.isFinite(n)
    ? '—'
    : `${n > 0 ? '+' : ''}${n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

function titulo(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/(^|[\s'-])([a-zà-ú])/g, (m, a, b) => a + b.toUpperCase())
    .replace(/\s(De|Da|Do|Das|Dos|E)\s/g, (m) => m.toLowerCase());
}

const CARGO_CURTO = {
  'Deputado Estadual': 'Dep. Estadual',
  'Deputado Federal': 'Dep. Federal',
  Vereador: 'Vereador',
  Prefeito: 'Prefeito',
};

function percentile(vals, p) {
  if (!vals.length) return 0;
  const a = [...vals].sort((x, y) => x - y);
  const idx = (p / 100) * (a.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return a[lo] + (a[hi] - a[lo]) * (idx - lo);
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

/* ------------------------- carga dos dados ------------------------------- */
export function prepararEleitoral(payload) {
  if (!payload || !Array.isArray(payload.municipios) || !Array.isArray(payload.eleicoes)) return null;

  const eleicoes = payload.eleicoes
    .map((e) => ({
      key: String(e.key),
      ano: Number(e.ano),
      cargo: e.cargo,
      label: `${e.ano} · ${CARGO_CURTO[e.cargo] || e.cargo}`,
      deputado: /deputado/i.test(e.cargo || ''),
    }))
    .sort((a, b) => a.ano - b.ano);

  const munis = payload.municipios.map((m) => ({
    nome: m.nome,
    norm: norm(m.nome),
    regiao: m.regiao || '',
    v: m.v || {},
  }));
  const porNorm = new Map(munis.map((m) => [m.norm, m]));

  const totais = {};
  eleicoes.forEach((el) => {
    let votos = 0, comp = 0, n = 0;
    munis.forEach((m) => {
      const x = m.v[el.key];
      if (x && x.votos > 0) { votos += x.votos; comp += x.comp || 0; n++; }
    });
    totais[el.key] = { votos, comp, n };
  });

  return { eleicoes, munis, porNorm, totais, atualizadoEm: payload.atualizadoEm || null };
}

export function useEleitoralData() {
  const [state, setState] = useState({ status: 'loading', payload: null, erro: '' });

  const carregar = useCallback(async () => {
    setState((s) => ({ ...s, status: s.payload ? 'atualizando' : 'loading', erro: '' }));
    try {
      const r = await fetch('/api/eleitoral');
      if (!r.ok) {
        let msg = '';
        try { msg = (await r.json()).erro || ''; } catch (e) { /* sem corpo JSON */ }
        throw new Error(msg || `HTTP ${r.status}`);
      }
      const payload = await r.json();
      if (!payload || !Array.isArray(payload.municipios)) throw new Error('Resposta inesperada do servidor');
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); } catch (e) { /* cache é opcional */ }
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

  const eleitoral = useMemo(() => prepararEleitoral(state.payload), [state.payload]);
  return { eleitoral, status: state.status, erro: state.erro, recarregar: carregar };
}

/* --------------------------- análise cruzada ----------------------------- */
const SEM_MUNICIPIO = new Set(['ESTADUAL', 'ESTADO']);

export function chavesPadrao(eleitoral) {
  const deps = eleitoral.eleicoes.filter((e) => e.deputado);
  const base = deps.length ? deps : eleitoral.eleicoes;
  const comp = base[base.length - 1];
  const ref = base.length > 1 ? base[base.length - 2] : base[base.length - 1];
  return { baseKey: ref ? ref.key : '', compKey: comp ? comp.key : '' };
}

function regiaoPorMunicipio(emendas, eleitoral) {
  const cont = new Map();
  (emendas || []).forEach((e) => {
    const m = norm(e['MUNICÍPIO']);
    const r = String(e.REGIÃO || '').trim();
    if (!m || !r || SEM_MUNICIPIO.has(norm(r))) return;
    if (!cont.has(m)) cont.set(m, new Map());
    const c = cont.get(m);
    c.set(r, (c.get(r) || 0) + 1);
  });
  const out = new Map();
  cont.forEach((c, m) => {
    let best = '', n = 0;
    c.forEach((v, r) => { if (v > n) { n = v; best = r; } });
    out.set(m, best);
  });
  // região informada diretamente na planilha de votos (coluna opcional "Região") tem prioridade
  eleitoral.munis.forEach((m) => { if (m.regiao) out.set(m.norm, m.regiao); });
  return out;
}

export function correlacoes(rows) {
  const setA = rows.filter((r) => r.vComp > 0);
  const setB = rows.filter((r) => r.vBase > 0 && r.vComp > 0);
  return {
    votos: spearman(setA.map((r) => r.total), setA.map((r) => r.vComp)),
    nA: setA.length,
    delta: spearman(setB.map((r) => r.total), setB.map((r) => r.delta)),
    nB: setB.length,
  };
}

export function analisar({ eleitoral, emendas, emendasParaRegiao, baseKey, compKey, anos, modalidades, pVotos = 50, pEmenda = 50 }) {
  // a região de cada município vem de TODAS as emendas, mesmo quando o usuário filtra as emendas
  const regiaoMap = regiaoPorMunicipio(emendasParaRegiao || emendas, eleitoral);
  const agg = new Map();
  const semMun = { qtd: 0, total: 0, pago: 0 };
  const porAnoGeral = {};

  (emendas || []).forEach((e) => {
    const ano = String(e.ANO || '').trim();
    if (anos && anos.length && !anos.includes(ano)) return;
    if (modalidades && modalidades.length && !modalidades.includes(e.MODALIDADE)) return;
    const total = parseCurrency(e.TOTAL);
    const pago = parseCurrency(e.PAGO);
    const mNorm = norm(e['MUNICÍPIO']);
    if (!mNorm || SEM_MUNICIPIO.has(mNorm)) {
      semMun.qtd++; semMun.total += total; semMun.pago += pago;
      return;
    }
    let a = agg.get(mNorm);
    if (!a) { a = { nome: String(e['MUNICÍPIO']).trim(), qtd: 0, total: 0, pago: 0, porAno: {} }; agg.set(mNorm, a); }
    a.qtd++; a.total += total; a.pago += pago;
    const pa = a.porAno[ano] || (a.porAno[ano] = { qtd: 0, total: 0, pago: 0 });
    pa.qtd++; pa.total += total; pa.pago += pago;
    const g = porAnoGeral[ano] || (porAnoGeral[ano] = { qtd: 0, total: 0, pago: 0 });
    g.qtd++; g.total += total; g.pago += pago;
  });

  const keys = new Set([...eleitoral.porNorm.keys(), ...agg.keys()]);
  const rows = [];
  const todas = [];
  keys.forEach((k) => {
    const m = eleitoral.porNorm.get(k);
    const a = agg.get(k);
    const xb = m && m.v[baseKey];
    const xc = m && m.v[compKey];
    const vBase = xb ? xb.votos || 0 : 0;
    const vComp = xc ? xc.votos || 0 : 0;
    const cComp = xc ? xc.comp || 0 : 0;
    const total = a ? a.total : 0;
    const row = {
      norm: k,
      v: m ? m.v : {},
      porAno: a ? a.porAno : {},
      nome: a ? a.nome : titulo(m.nome),
      regiao: regiaoMap.get(k) || '',
      temVotos: Boolean(m),
      vBase, vComp,
      cBase: xb ? xb.comp || 0 : 0,
      cComp,
      delta: vComp - vBase,
      deltaPct: vBase > 0 ? ((vComp - vBase) / vBase) * 100 : null,
      pctComp: cComp > 0 ? (vComp / cComp) * 100 : null,
      shareEstado: (eleitoral.totais[compKey] || {}).votos > 0 ? (vComp / eleitoral.totais[compKey].votos) * 100 : null,
      qtd: a ? a.qtd : 0,
      total,
      pago: a ? a.pago : 0,
      rsPorVoto: vComp > 0 && total > 0 ? total / vComp : null,
      votosPor100k: total > 0 ? vComp / (total / 1e5) : null,
    };
    todas.push(row);
    if (a || vBase > 0 || vComp > 0) rows.push(row);
  });

  const cortes = {
    votos: percentile(rows.filter((r) => r.vComp > 0).map((r) => r.vComp), pVotos),
    emenda: percentile(rows.filter((r) => r.total > 0).map((r) => r.total), pEmenda),
  };
  todas.forEach((r) => {
    const altoV = r.vComp > 0 && r.vComp >= cortes.votos;
    const altoE = r.total > 0 && r.total >= cortes.emenda;
    r.classe = altoV && altoE ? 'atendida' : altoV ? 'fortalecer' : altoE ? 'converter' : 'baixa';
  });

  const corr = correlacoes(rows);

  const totalComp = (eleitoral.totais[compKey] || {}).votos || 0;
  const votosEmContemplados = rows.filter((r) => r.total > 0).reduce((s, r) => s + r.vComp, 0);
  const naoCasadas = [...agg.entries()]
    .filter(([k]) => !eleitoral.porNorm.has(k))
    .map(([, a]) => a)
    .sort((x, y) => y.total - x.total);

  return {
    rows, todas, cortes, corr, semMun, porAnoGeral, naoCasadas,
    cobertura: totalComp > 0 ? (votosEmContemplados / totalComp) * 100 : null,
    contemplados: rows.filter((r) => r.total > 0).length,
    totalMunicipal: rows.reduce((s, r) => s + r.total, 0),
    pagoMunicipal: rows.reduce((s, r) => s + r.pago, 0),
    qtdMunicipal: rows.reduce((s, r) => s + r.qtd, 0),
  };
}

const CLASSES = {
  atendida: { label: 'Base atendida', cor: '#0369a1', badge: 'bg-sky-700 text-white', desc: 'Votação alta e emendas altas' },
  fortalecer: { label: 'Base a fortalecer', cor: '#be123c', badge: 'bg-rose-700 text-white', desc: 'Votação alta, emendas baixas ou inexistentes' },
  converter: { label: 'Investimento a converter', cor: '#f59e0b', badge: 'bg-amber-300 text-slate-900', desc: 'Emendas altas, votação baixa' },
  baixa: { label: 'Baixa presença', cor: '#94a3b8', badge: 'bg-slate-200 text-slate-700', desc: 'Votação e emendas baixas' },
};

const Badge = ({ classe }) => (
  <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap ${CLASSES[classe].badge}`}>
    {CLASSES[classe].label}
  </span>
);

/* --------------------------- componentes base ---------------------------- */
const Kpi = ({ label, value, sub, tone = 'slate' }) => {
  const tones = {
    slate: 'text-slate-900', sky: 'text-sky-700', rose: 'text-rose-700', amber: 'text-amber-700',
  };
  return (
    <div className="bg-white border border-slate-200 p-3.5">
      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{label}</p>
      <p className={`text-lg sm:text-xl font-bold ${tones[tone]}`}>{value}</p>
      {sub && <p className="text-[11px] font-medium text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
};

const Card = ({ title, right, children, className = '' }) => (
  <div className={`border border-slate-300 bg-white flex flex-col ${className}`}>
    <div className="bg-amber-100/90 border-b border-slate-300 px-3 py-1.5 flex justify-between items-center gap-2">
      <span className="font-bold text-xs uppercase text-slate-800">{title}</span>
      {right}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

function DataTable({ columns, rows, initialSort, onRowClick, pageSize = 100, empty = 'Sem dados.', footer }) {
  const imprimindo = useContext(ImpressaoCtx);
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
  const visiveis = imprimindo ? sorted : sorted.slice(0, limit);

  return (
    <div>
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full border-collapse text-xs print:text-[9px]">
          <thead className="bg-slate-50 sticky top-0 z-10 print:static">
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
                key={r.norm || r.key || i}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={onRowClick ? 'hover:bg-sky-50/70 cursor-pointer' : ''}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`py-1.5 px-2 text-[11px] text-slate-800 ${al(c.align)} ${c.nowrap === false ? '' : 'whitespace-nowrap'}`}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer && (
            <tfoot className="bg-slate-100 border-t-2 border-slate-400">
              <tr>
                {columns.map((c) => (
                  <td key={c.key} className={`py-1.5 px-2 text-[11px] font-bold text-slate-900 whitespace-nowrap ${al(c.align)}`}>
                    {footer[c.key] === undefined ? '' : footer[c.key]}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {!imprimindo && sorted.length > limit && (
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

const Delta = ({ v, pct }) => {
  if (v === null || v === undefined) return <span className="text-slate-400">—</span>;
  const cor = v > 0 ? 'text-sky-700' : v < 0 ? 'text-rose-700' : 'text-slate-500';
  return (
    <span className={`font-semibold ${cor}`}>
      {fmtSigned(v)}
      {pct !== undefined && pct !== null && Number.isFinite(pct) ? <span className="font-normal text-[10px]"> ({fmtSignedPct(pct)})</span> : null}
    </span>
  );
};

/* ------------------------- gráficos simples (SVG/div) -------------------- */
function Barras({ itens, formatar, altura = 140 }) {
  const max = Math.max(1, ...itens.map((i) => Math.max(i.valor || 0, i.valor2 || 0)));
  return (
    <div className="flex items-end justify-around gap-3 px-3 pt-6 pb-2" style={{ height: altura + 44 }}>
      {itens.map((i) => (
        <div key={i.label} className="flex flex-col items-center flex-1 min-w-0">
          <div className="flex items-end gap-1 w-full justify-center" style={{ height: altura }}>
            <div className="flex flex-col justify-end items-center w-5/12 max-w-[44px]" style={{ height: '100%' }}>
              <span className="text-[10px] font-bold text-slate-700 mb-0.5 whitespace-nowrap">{formatar(i.valor || 0)}</span>
              <div className="w-full bg-sky-700" style={{ height: `${Math.max(((i.valor || 0) / max) * 100, i.valor ? 2 : 0)}%` }} />
            </div>
            {i.valor2 !== undefined && (
              <div className="flex flex-col justify-end items-center w-5/12 max-w-[44px]" style={{ height: '100%' }}>
                <span className="text-[10px] font-bold text-amber-700 mb-0.5 whitespace-nowrap">{formatar(i.valor2 || 0)}</span>
                <div className="w-full bg-amber-300" style={{ height: `${Math.max(((i.valor2 || 0) / max) * 100, i.valor2 ? 2 : 0)}%` }} />
              </div>
            )}
          </div>
          <span className="text-[10px] font-semibold text-slate-600 mt-1 text-center leading-tight">{i.label}</span>
          {i.sub && <span className="text-[9px] text-slate-400 text-center leading-tight">{i.sub}</span>}
        </div>
      ))}
    </div>
  );
}

function Matriz({ rows, cortes, onOpen }) {
  const [hover, setHover] = useState(null);
  const W = 860, H = 520, M = { l: 70, r: 20, t: 16, b: 46 };
  const pts = rows.filter((r) => r.vComp > 0 || r.total > 0).map((r) => ({ r, x: Math.log10(1 + r.vComp), y: Math.log10(1 + r.total) }));
  const maxX = Math.max(1, ...pts.map((p) => p.x)) * 1.05;
  const maxY = Math.max(1, ...pts.map((p) => p.y)) * 1.05;
  const sx = (v) => M.l + (v / maxX) * (W - M.l - M.r);
  const sy = (v) => H - M.b - (v / maxY) * (H - M.t - M.b);
  const xt = [1, 10, 100, 1000, 10000, 100000].filter((t) => Math.log10(1 + t) <= maxX);
  const yt = [1e3, 1e4, 1e5, 1e6, 1e7, 1e8].filter((t) => Math.log10(1 + t) <= maxY);
  const rotulados = new Set([
    ...[...pts].sort((a, b) => b.r.vComp - a.r.vComp).slice(0, 7).map((p) => p.r.norm),
    ...[...pts].sort((a, b) => b.r.total - a.r.total).slice(0, 7).map((p) => p.r.norm),
  ]);
  const qx = sx(Math.log10(1 + cortes.votos));
  const qy = sy(Math.log10(1 + cortes.emenda));

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <rect x={qx} y={M.t} width={W - M.r - qx} height={qy - M.t} fill="#0369a1" opacity="0.05" />
        <rect x={qx} y={qy} width={W - M.r - qx} height={H - M.b - qy} fill="#be123c" opacity="0.06" />
        <rect x={M.l} y={M.t} width={qx - M.l} height={qy - M.t} fill="#f59e0b" opacity="0.08" />
        {xt.map((t) => (
          <g key={`x${t}`}>
            <line x1={sx(Math.log10(1 + t))} x2={sx(Math.log10(1 + t))} y1={M.t} y2={H - M.b} stroke="#e2e8f0" />
            <text x={sx(Math.log10(1 + t))} y={H - M.b + 14} textAnchor="middle" fontSize="10" fill="#64748b">{fmtInt(t)}</text>
          </g>
        ))}
        {yt.map((t) => (
          <g key={`y${t}`}>
            <line x1={M.l} x2={W - M.r} y1={sy(Math.log10(1 + t))} y2={sy(Math.log10(1 + t))} stroke="#e2e8f0" />
            <text x={M.l - 6} y={sy(Math.log10(1 + t)) + 3} textAnchor="end" fontSize="10" fill="#64748b">{fmtBRLCompact(t)}</text>
          </g>
        ))}
        <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke="#334155" />
        <line x1={M.l} x2={M.l} y1={M.t} y2={H - M.b} stroke="#334155" />
        <line x1={qx} x2={qx} y1={M.t} y2={H - M.b} stroke="#334155" strokeDasharray="4 3" />
        <line x1={M.l} x2={W - M.r} y1={qy} y2={qy} stroke="#334155" strokeDasharray="4 3" />
        <text x={W - M.r - 4} y={M.t + 12} textAnchor="end" fontSize="10" fontWeight="700" fill="#0369a1">BASE ATENDIDA</text>
        <text x={W - M.r - 4} y={H - M.b - 6} textAnchor="end" fontSize="10" fontWeight="700" fill="#be123c">BASE A FORTALECER</text>
        <text x={M.l + 4} y={M.t + 12} fontSize="10" fontWeight="700" fill="#b45309">INVESTIMENTO A CONVERTER</text>
        <text x={M.l + 4} y={H - M.b - 6} fontSize="10" fontWeight="700" fill="#64748b">BAIXA PRESENÇA</text>
        <text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="#334155">Votos (escala logarítmica)</text>
        <text transform={`translate(14 ${(M.t + H - M.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" fontWeight="600" fill="#334155">Emendas destinadas (escala logarítmica)</text>
        {pts.map((p) => (
          <g key={p.r.norm}>
            <circle
              cx={sx(p.x)} cy={sy(p.y)} r="4.5"
              fill={CLASSES[p.r.classe].cor} fillOpacity="0.75" stroke="#fff" strokeWidth="1"
              className="cursor-pointer"
              onMouseEnter={(e) => setHover({ r: p.r, x: e.clientX, y: e.clientY })}
              onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
              onMouseLeave={() => setHover(null)}
              onClick={() => onOpen(p.r)}
            />
            {rotulados.has(p.r.norm) && (
              <text x={sx(p.x) + 7} y={sy(p.y) + 3} fontSize="10" fill="#0f172a" pointerEvents="none">{p.r.nome}</text>
            )}
          </g>
        ))}
      </svg>
      {hover && <Tooltip h={hover} />}
    </div>
  );
}

function Tooltip({ h }) {
  const r = h.r;
  return (
    <div
      className="fixed z-50 bg-white border border-slate-400 shadow-lg p-2.5 text-[11px] pointer-events-none"
      style={{ left: Math.min(h.x + 14, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 250), top: h.y + 14, width: 230 }}
    >
      <p className="font-bold text-slate-900 uppercase text-xs">{r.nome}</p>
      {r.regiao && <p className="text-slate-500 mb-1">{r.regiao}</p>}
      <p>Votos: <strong>{fmtInt(r.vComp)}</strong> <span className="text-slate-500">(antes: {fmtInt(r.vBase)})</span></p>
      <p>Variação: <Delta v={r.delta} pct={r.deltaPct} /></p>
      <p>Emendas: <strong>{r.qtd}</strong> • {fmtBRL(r.total)}</p>
      <p>R$ por voto: <strong>{r.rsPorVoto ? fmtBRL(r.rsPorVoto) : '—'}</strong></p>
      <div className="mt-1"><Badge classe={r.classe} /></div>
    </div>
  );
}

/* ------------------------------- mapa ------------------------------------ */
const RAMPA_VOTOS = ['#e0f2fe', '#7dd3fc', '#38bdf8', '#0284c7', '#0c4a6e'];
const RAMPA_VALOR = ['#fef3c7', '#fcd34d', '#f59e0b', '#d97706', '#92400e'];
const RAMPA_NEG = ['#ffe4e6', '#fda4af', '#fb7185', '#e11d48', '#881337'];

function quantis(vals, k = 5) {
  const a = vals.filter((v) => v > 0).sort((x, y) => x - y);
  if (!a.length) return [];
  const cuts = [];
  for (let i = 1; i < k; i++) cuts.push(a[Math.min(a.length - 1, Math.floor((i / k) * a.length))]);
  return cuts;
}
const faixa = (v, cuts) => cuts.filter((c) => v >= c).length;

function MapaEleitoral({ rows, mapGeoJson, onOpen, foraDoFiltro }) {
  const [metrica, setMetrica] = useState('votos');
  const [hover, setHover] = useState(null);

  const geo = useMemo(() => {
    if (!mapGeoJson || !mapGeoJson.features) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const eachRing = (g, fn) => {
      if (g.type === 'Polygon') g.coordinates.forEach(fn);
      else if (g.type === 'MultiPolygon') g.coordinates.forEach((p) => p.forEach(fn));
    };
    mapGeoJson.features.forEach((f) => eachRing(f.geometry, (ring) => ring.forEach((c) => {
      if (c[0] < minX) minX = c[0]; if (c[0] > maxX) maxX = c[0];
      if (c[1] < minY) minY = c[1]; if (c[1] > maxY) maxY = c[1];
    })));
    const w = 800, h = 600;
    const scale = Math.min(w / (maxX - minX), h / (maxY - minY)) * 0.95;
    const ox = (w - (maxX - minX) * scale) / 2;
    const oy = (h - (maxY - minY) * scale) / 2;
    const pt = (c) => `${(c[0] - minX) * scale + ox},${h - (c[1] - minY) * scale - oy}`;
    const ring = (rg) => 'M' + rg.map(pt).join('L') + 'Z';
    const path = (g) =>
      g.type === 'Polygon' ? g.coordinates.map(ring).join(' ')
        : g.type === 'MultiPolygon' ? g.coordinates.map((p) => p.map(ring).join(' ')).join(' ') : '';
    return { w, h, feats: mapGeoJson.features.map((f) => ({ nome: f.properties.name, n: norm(f.properties.name), d: path(f.geometry) })) };
  }, [mapGeoJson]);

  const porNorm = useMemo(() => new Map(rows.map((r) => [r.norm, r])), [rows]);

  const esc = useMemo(() => {
    if (metrica === 'votos') return { cuts: quantis(rows.map((r) => r.vComp)), pos: RAMPA_VOTOS };
    if (metrica === 'emendas') return { cuts: quantis(rows.map((r) => r.total)), pos: RAMPA_VALOR };
    if (metrica === 'delta') {
      return { cuts: quantis(rows.map((r) => r.delta)), cutsNeg: quantis(rows.map((r) => -r.delta)), pos: RAMPA_VOTOS, neg: RAMPA_NEG };
    }
    return null;
  }, [metrica, rows]);

  const cor = (r) => {
    if (!r) return '#ffffff';
    if (metrica === 'classe') return r.vComp > 0 || r.total > 0 ? CLASSES[r.classe].cor : '#ffffff';
    if (metrica === 'votos') return r.vComp > 0 ? esc.pos[faixa(r.vComp, esc.cuts)] : '#ffffff';
    if (metrica === 'emendas') return r.total > 0 ? esc.pos[faixa(r.total, esc.cuts)] : '#ffffff';
    if (r.delta > 0) return esc.pos[faixa(r.delta, esc.cuts)];
    if (r.delta < 0) return esc.neg[faixa(-r.delta, esc.cutsNeg)];
    return '#f1f5f9';
  };

  const legenda = () => {
    if (metrica === 'classe') return Object.values(CLASSES).map((c) => ({ cor: c.cor, t: c.label }));
    const fm = metrica === 'emendas' ? fmtBRLCompact : fmtInt;
    const mk = (cuts, rampa, prefixo = '') => {
      const lim = [0, ...cuts];
      return rampa.slice(0, lim.length).map((c, i) => ({
        cor: c,
        t: i === lim.length - 1 ? `${prefixo}${fm(lim[i])}+` : `${prefixo}${fm(lim[i])} a ${fm(lim[i + 1])}`,
      }));
    };
    if (metrica === 'delta') return [...mk(esc.cutsNeg, esc.neg, '−').reverse(), ...mk(esc.cuts, esc.pos, '+')];
    return mk(esc.cuts, esc.pos);
  };

  if (!geo) return <div className="p-8 text-center font-medium text-slate-500">Carregando mapa...</div>;

  const opcoes = [['votos', 'Votos'], ['delta', 'Variação de votos'], ['emendas', 'Emendas (R$)'], ['classe', 'Classificação']];
  return (
    <div className="p-3">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {opcoes.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setMetrica(k)}
            className={`px-2.5 py-1 text-xs font-semibold border ${metrica === k ? 'bg-amber-300 border-slate-500 text-slate-900' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <svg viewBox={`0 0 ${geo.w} ${geo.h}`} className="w-full h-auto select-none" onClick={() => setHover(null)}>
            {geo.feats.map((f, i) => {
              const r = porNorm.get(f.n);
              return (
                <path
                  key={i} d={f.d} fill={r ? cor(r) : (foraDoFiltro && foraDoFiltro.has(f.n) ? '#e2e8f0' : '#ffffff')} stroke="#334155" strokeWidth="0.6"
                  className="hover:stroke-[2px] cursor-pointer"
                  onMouseEnter={(e) => setHover({ r: r || { nome: titulo(f.nome), regiao: '', vComp: 0, vBase: 0, delta: 0, deltaPct: null, qtd: 0, total: 0, rsPorVoto: null, classe: 'baixa' }, x: e.clientX, y: e.clientY })}
                  onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
                  onMouseLeave={() => setHover(null)}
                  onClick={(e) => { e.stopPropagation(); if (r) onOpen(r); }}
                />
              );
            })}
          </svg>
        </div>
        <div className="text-xs">
          <p className="font-bold uppercase text-slate-700 mb-2">Legenda</p>
          <div className="space-y-1.5">
            {legenda().map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4 h-4 border border-slate-400 flex-shrink-0" style={{ background: l.cor }} />
                <span className="text-slate-700">{l.t}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border border-slate-400 bg-white flex-shrink-0" />
              <span className="text-slate-500">Sem registro</span>
            </div>
            {foraDoFiltro && foraDoFiltro.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border border-slate-400 flex-shrink-0" style={{ background: '#e2e8f0' }} />
                <span className="text-slate-500">Fora dos filtros</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {hover && <Tooltip h={hover} />}
    </div>
  );
}

/* ------------------------ evolução de votos (sparkline) ------------------- */
// Série principal = eleições do mesmo cargo da eleição mais recente (deputado estadual),
// que são comparáveis entre si. Eleições de outros cargos (vereador/prefeito, só em
// Florianópolis) entram como pontos vazados, sem ligar a linha.
export function serieEvolucao(eleitoral, v) {
  const els = eleitoral.eleicoes;
  if (!els.length) return null;
  const deps = els.filter((e) => e.deputado);
  const ref = deps.length ? deps : els;
  const cargo = ref[ref.length - 1].cargo;
  const pontos = els
    .filter((e) => e.cargo === cargo || v[e.key])
    .map((e) => ({ e, votos: v[e.key] ? v[e.key].votos || 0 : 0, principal: e.cargo === cargo, registro: Boolean(v[e.key]) }));
  const pr = pontos.filter((p) => p.principal);
  const primeiro = pr[0];
  const ultimo = pr[pr.length - 1];
  const delta = ultimo.votos - primeiro.votos;
  return {
    pontos, primeiro, ultimo, delta, cargo,
    pct: primeiro.votos > 0 ? (delta / primeiro.votos) * 100 : null,
    novo: primeiro.votos === 0 && ultimo.votos > 0,
    sem: pontos.every((p) => p.votos === 0),
  };
}

export function textoEvolucao(serie) {
  if (!serie || serie.sem) return '';
  return serie.pontos.map((p) => `${p.e.label}: ${p.votos}`).join(' | ');
}

function Sparkline({ serie, w = 88, h = 28 }) {
  const pad = 4;
  const n = serie.pontos.length;
  const max = Math.max(1, ...serie.pontos.map((p) => p.votos));
  const x = (i) => (n === 1 ? w / 2 : pad + (i * (w - 2 * pad)) / (n - 1));
  const y = (v) => h - pad - (v / max) * (h - 2 * pad);
  const cor = serie.delta > 0 ? '#0369a1' : serie.delta < 0 ? '#be123c' : '#64748b';
  const pts = serie.pontos.map((p, i) => ({ ...p, px: x(i), py: y(p.votos) }));
  const linha = pts.filter((p) => p.principal).map((p) => `${p.px},${p.py}`).join(' ');
  const titulo = serie.pontos
    .map((p) => `${p.e.label}: ${nf0.format(p.votos)} votos${p.principal ? '' : ' (outro cargo)'}`)
    .join('\n');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0 overflow-visible">
      <title>{titulo}</title>
      <line x1={pad} x2={w - pad} y1={h - pad} y2={h - pad} stroke="#e2e8f0" />
      {linha.includes(' ') && <polyline points={linha} fill="none" stroke={cor} strokeWidth="1.6" strokeLinejoin="round" />}
      {pts.map((p, i) => (
        p.principal
          ? <circle key={i} cx={p.px} cy={p.py} r={i === pts.length - 1 ? 3.2 : 2.3} fill={cor} />
          : <circle key={i} cx={p.px} cy={p.py} r="2.6" fill="#fff" stroke="#f59e0b" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

const cacheSerie = new WeakMap();
function serieDoMunicipio(eleitoral, m) {
  let c = cacheSerie.get(eleitoral);
  if (!c) { c = new Map(); cacheSerie.set(eleitoral, c); }
  if (!c.has(m.norm)) c.set(m.norm, serieEvolucao(eleitoral, m.v));
  return c.get(m.norm);
}

// Texto da evolução para exportação (ex.: CSV do painel de emendas)
export function textoEvolucaoMunicipio(eleitoral, municipio) {
  if (!eleitoral) return '';
  const m = eleitoral.porNorm.get(norm(municipio));
  return m ? textoEvolucao(serieDoMunicipio(eleitoral, m)) : '';
}

export function VotosEvolucao({ eleitoral, municipio, onClick }) {
  if (!eleitoral) return null;
  const m = eleitoral.porNorm.get(norm(municipio));
  if (!m) return <span className="text-slate-300 text-xs" title="Sem votos registrados neste município">—</span>;
  const s = serieDoMunicipio(eleitoral, m);
  if (!s || s.sem) return <span className="text-slate-300 text-xs">—</span>;
  const rotulo = `${s.cargo}: ${s.primeiro.e.ano} → ${s.ultimo.e.ano}`;
  return (
    <div className="flex items-center gap-1.5" title={`${rotulo}\nClique para abrir a ficha do município`} onClick={onClick}>
      <Sparkline serie={s} />
      <div className="leading-tight">
        <div className="text-[10px] font-bold text-slate-800 whitespace-nowrap">{fmtInt(s.primeiro.votos)} → {fmtInt(s.ultimo.votos)}</div>
        <div className="text-[10px] font-semibold">
          {s.novo ? <span className="text-sky-700">novo</span>
            : s.pct !== null ? <span className={s.pct >= 0 ? 'text-sky-700' : 'text-rose-700'}>{fmtSignedPct(s.pct)}</span> : null}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- PNG de gráficos/mapas ----------------------- */
function baixarSvgPng(container, nome) {
  const svg = container && container.querySelector('svg');
  if (!svg) return;
  const vb = svg.viewBox && svg.viewBox.baseVal;
  const w = (vb && vb.width) || 800;
  const h = (vb && vb.height) || 600;
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', w);
  clone.setAttribute('height', h);
  const fundo = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  fundo.setAttribute('width', '100%'); fundo.setAttribute('height', '100%'); fundo.setAttribute('fill', '#ffffff');
  clone.insertBefore(fundo, clone.firstChild);
  const xml = new XMLSerializer().serializeToString(clone);
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    const esc = 2;
    c.width = w * esc; c.height = h * esc;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    c.toBlob((b) => {
      if (!b) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = nome;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    });
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
}

/* ------------------------------ filtros ---------------------------------- */
function MultiFiltro({ label, opcoes, valor, onChange, vazioTexto = 'Todos', largura = 'w-64' }) {
  const [aberto, setAberto] = useState(false);
  const [q, setQ] = useState('');
  const sel = valor || [];
  const lista = opcoes.filter((o) => !q || norm(o).includes(norm(q)));
  const resumo = sel.length === 0 ? vazioTexto : sel.length === 1 ? sel[0] : `${sel.length} selecionados`;
  const alternar = (o) => onChange(sel.includes(o) ? sel.filter((x) => x !== o) : [...sel, o]);
  return (
    <div className="relative">
      <button
        onClick={() => setAberto((a) => !a)}
        className={`flex flex-col items-start border px-2 py-1 min-w-[120px] max-w-[200px] text-left hover:bg-slate-50 ${sel.length ? 'border-sky-700 bg-sky-50' : 'border-slate-300 bg-white'}`}
      >
        <span className="text-[10px] font-bold uppercase text-slate-500">{label}</span>
        <span className="text-xs font-medium text-slate-800 truncate w-full">{resumo} ▾</span>
      </button>
      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className={`absolute z-50 mt-1 bg-white border border-slate-400 shadow-lg ${largura}`}>
            {opcoes.length > 8 && (
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="w-full border-b border-slate-200 px-2 py-1.5 text-xs focus:outline-none" />
            )}
            <div className="max-h-64 overflow-y-auto">
              {lista.map((o) => (
                <label key={o} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-amber-50 cursor-pointer">
                  <input type="checkbox" checked={sel.includes(o)} onChange={() => alternar(o)} />
                  <span className="truncate">{o}</span>
                </label>
              ))}
              {!lista.length && <p className="px-2 py-2 text-xs text-slate-400">Nada encontrado</p>}
            </div>
            <div className="flex justify-between border-t border-slate-200 px-2 py-1">
              <button onClick={() => onChange([])} className="text-[11px] text-sky-700 font-semibold hover:underline">Limpar</button>
              <button onClick={() => setAberto(false)} className="text-[11px] font-semibold text-slate-600 hover:underline">Fechar</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const Chip = ({ ativo, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-2 py-0.5 text-[11px] font-semibold border ${ativo ? 'bg-sky-700 border-sky-800 text-white' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-100'}`}
  >
    {children}
  </button>
);

const Seletor = ({ label, value, onChange, options, className = '' }) => (
  <label className={`flex flex-col text-[10px] font-bold uppercase text-slate-500 ${className}`}>
    {label}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-0.5 border border-slate-300 bg-white text-xs font-medium text-slate-800 normal-case px-1.5 py-[3px] focus:outline-none focus:border-sky-700"
    >
      {options.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
    </select>
  </label>
);

const OPCOES_CORTE = [['50', '50% (metade)'], ['67', '33% (um terço)'], ['75', '25% (um quarto)']];
const FILTROS_VAZIOS = {
  busca: '', regioes: [], classes: [], emenda: 'todos', votos: 'todos',
  anos: [], mods: null, articuladores: [], temas: [], situacoes: [],
};
const vf = (v) => String(v === null || v === undefined ? '' : v).trim() || '(não informado)';
const unicos = (arr, ordem) => [...new Set(arr)].sort(ordem || ((a, b) => a.localeCompare(b, 'pt-BR')));
const dinheiroCsv = (n) => (n || 0).toFixed(2).replace('.', ',');

/* ------------------------- módulo: Inteligência Eleitoral ---------------- */
export function EleitoralModule({ eleitoral, status, erro, recarregar, emendas, mapGeoJson, openEntityFicha, exportRows }) {
  const padrao = useMemo(() => (eleitoral ? chavesPadrao(eleitoral) : { baseKey: '', compKey: '' }), [eleitoral]);
  const [baseKey, setBaseKey] = useState('');
  const [compKey, setCompKey] = useState('');
  const [fil, setFil] = useState(FILTROS_VAZIOS);
  const [pVotos, setPVotos] = useState('50');
  const [pEmenda, setPEmenda] = useState('50');
  const [aba, setAba] = useState('lista');
  const [detalheComp, setDetalheComp] = useState(false);
  const [emendasAno, setEmendasAno] = useState(false);
  const [imprimindo, setImprimindo] = useState(false);
  const mapaRef = useRef(null);
  const matrizRef = useRef(null);

  const setF = (parcial) => setFil((f) => ({ ...f, ...parcial }));
  // Ao escolher ano/articulador/tema/situação, a lista passa a mostrar só os municípios que
  // têm essas emendas (o seletor "Emendas no município" muda junto e pode ser revertido).
  const setFEmenda = (parcial) =>
    setFil((f) => ({ ...f, ...parcial, ...(f.emenda === 'todos' && Object.values(parcial).some((v) => Array.isArray(v) && v.length) ? { emenda: 'com' } : {}) }));

  // PDF = impressão do navegador, com todas as linhas e sem a barra de filtros
  useEffect(() => {
    if (!imprimindo) return undefined;
    const fim = () => setImprimindo(false);
    window.addEventListener('afterprint', fim);
    const t = setTimeout(() => window.print(), 350);
    const seguranca = setTimeout(fim, 120000);
    return () => { clearTimeout(t); clearTimeout(seguranca); window.removeEventListener('afterprint', fim); };
  }, [imprimindo]);

  const opc = useMemo(() => {
    const lista = emendas || [];
    return {
      anos: unicos(lista.map((e) => vf(e.ANO)), (a, b) => a.localeCompare(b)),
      mods: unicos(lista.map((e) => vf(e.MODALIDADE))),
      arts: unicos(lista.map((e) => vf(e.ARTICULADOR))),
      temas: unicos(lista.map((e) => vf(e.TEMA))),
      sits: unicos(lista.map((e) => vf(e['SITUAÇÃO']))),
    };
  }, [emendas]);

  const modsPadrao = useMemo(() => opc.mods.filter((m) => !/execu[cç][aã]o direta/i.test(m)), [opc.mods]);
  const mods = fil.mods === null ? modsPadrao : fil.mods;
  const passa = (lista, v) => !lista.length || lista.includes(vf(v));

  const emendasFiltradas = useMemo(
    () => (emendas || []).filter((e) =>
      passa(fil.anos, e.ANO) && passa(mods, e.MODALIDADE) && passa(fil.articuladores, e.ARTICULADOR) &&
      passa(fil.temas, e.TEMA) && passa(fil.situacoes, e['SITUAÇÃO'])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [emendas, fil.anos, mods, fil.articuladores, fil.temas, fil.situacoes]
  );

  const base = baseKey || padrao.baseKey;
  const comp = compKey || padrao.compKey;

  const A = useMemo(
    () => (eleitoral && base && comp
      ? analisar({ eleitoral, emendas: emendasFiltradas, emendasParaRegiao: emendas, baseKey: base, compKey: comp, pVotos: Number(pVotos), pEmenda: Number(pEmenda) })
      : null),
    [eleitoral, emendasFiltradas, emendas, base, comp, pVotos, pEmenda]
  );

  const passaMun = useCallback((r) =>
    (!fil.busca || norm(r.nome).includes(norm(fil.busca))) &&
    (!fil.regioes.length || fil.regioes.includes(r.regiao || '(sem região)')) &&
    (!fil.classes.length || fil.classes.includes(CLASSES[r.classe].label)) &&
    (fil.emenda === 'todos' || (fil.emenda === 'com' ? r.total > 0 : r.total === 0)) &&
    (fil.votos === 'todos' || (fil.votos === 'com' ? r.vComp > 0 : r.vComp === 0)),
  [fil]);

  const rowsF = useMemo(() => (A ? A.rows.filter(passaMun) : []), [A, passaMun]);
  const todasF = useMemo(() => (A ? A.todas.filter(passaMun) : []), [A, passaMun]);
  const foraDoFiltro = useMemo(() => new Set(A ? A.todas.filter((r) => !passaMun(r)).map((r) => r.norm) : []), [A, passaMun]);
  const regioesOpc = useMemo(() => unicos((A ? A.todas : []).map((r) => r.regiao || '(sem região)')), [A]);
  const corr = useMemo(() => correlacoes(rowsF), [rowsF]);

  const regioesAgg = useMemo(() => {
    const m = new Map();
    rowsF.forEach((r) => {
      const k = r.regiao || 'Sem região definida';
      let g = m.get(k);
      if (!g) { g = { norm: norm(k), nome: k, definida: Boolean(r.regiao), munis: 0, comVotos: 0, vBase: 0, vComp: 0, qtd: 0, total: 0, pago: 0, top: null }; m.set(k, g); }
      g.munis++; if (r.vComp > 0) g.comVotos++;
      g.vBase += r.vBase; g.vComp += r.vComp; g.qtd += r.qtd; g.total += r.total; g.pago += r.pago;
      if (!g.top || r.vComp > g.top.vComp) g.top = r;
    });
    const totComp = eleitoral && comp ? (eleitoral.totais[comp] || {}).votos : 0;
    return [...m.values()].map((g) => ({
      ...g,
      delta: g.vComp - g.vBase,
      deltaPct: g.vBase > 0 ? ((g.vComp - g.vBase) / g.vBase) * 100 : null,
      share: totComp > 0 ? (g.vComp / totComp) * 100 : null,
      rsPorVoto: g.vComp > 0 && g.total > 0 ? g.total / g.vComp : null,
    }));
  }, [rowsF, eleitoral, comp]);

  /* ---- colunas da aba Lista (parecida com a planilha original) ---- */
  const anosEmenda = opc.anos.filter((a) => /^\d{4}$/.test(a));
  const colunasLista = useMemo(() => {
    if (!eleitoral) return [];
    const cols = [
      { key: 'nome', label: 'Município', align: 'left', render: (r) => <span className="font-semibold text-sky-800 hover:underline">{r.nome}</span> },
      { key: 'regiao', label: 'Região', align: 'left', render: (r) => r.regiao || <span className="text-slate-300">—</span> },
    ];
    eleitoral.eleicoes.forEach((el) => {
      const get = (r) => r.v[el.key];
      const cab = (t) => (<span>{t}<br /><span className="font-normal normal-case text-[9px] text-slate-500">{CARGO_CURTO[el.cargo] || el.cargo}</span></span>);
      if (detalheComp) {
        cols.push({ key: `c_${el.key}`, label: cab(`Comparec. ${el.ano}`), align: 'right', sortValue: (r) => (get(r) ? get(r).comp : null), render: (r) => (get(r) ? fmtInt(get(r).comp) : '—') });
      }
      cols.push({ key: `v_${el.key}`, label: cab(`Votos ${el.ano}`), align: 'right', sortValue: (r) => (get(r) ? get(r).votos : null), render: (r) => (get(r) ? <strong>{fmtInt(get(r).votos)}</strong> : <span className="text-slate-300">—</span>) });
      if (detalheComp) {
        cols.push({ key: `p_${el.key}`, label: cab(`% ${el.ano}`), align: 'right', sortValue: (r) => (get(r) && get(r).comp > 0 ? get(r).votos / get(r).comp : null), render: (r) => (get(r) && get(r).comp > 0 ? fmtPct((get(r).votos / get(r).comp) * 100, 2) : '—') });
      }
    });
    cols.push({
      key: 'evol', label: 'Evolução dos votos', align: 'left',
      title: 'Primeiro → último pleito do mesmo cargo (deputado estadual). Passe o mouse sobre o gráfico para ver cada eleição.',
      sortValue: (r) => { const s = serieEvolucao(eleitoral, r.v); return s && !s.sem ? s.delta : null; },
      render: (r) => { const s = serieEvolucao(eleitoral, r.v); return s && !s.sem ? <VotosEvolucao eleitoral={eleitoral} municipio={r.nome} /> : <span className="text-slate-300">—</span>; },
    });
    cols.push({ key: 'qtd', label: 'Emendas', align: 'center', render: (r) => r.qtd || '—' });
    cols.push({ key: 'total', label: 'Destinado', align: 'right', render: (r) => (r.total ? fmtBRL(r.total) : '—') });
    cols.push({ key: 'pago', label: 'Pago', align: 'right', render: (r) => (r.pago ? fmtBRL(r.pago) : '—') });
    if (emendasAno) {
      anosEmenda.forEach((a) => {
        cols.push({ key: `q_${a}`, label: `Emendas ${a}`, align: 'center', sortValue: (r) => (r.porAno[a] ? r.porAno[a].qtd : null), render: (r) => (r.porAno[a] ? r.porAno[a].qtd : '—') });
        cols.push({ key: `t_${a}`, label: `Destinado ${a}`, align: 'right', sortValue: (r) => (r.porAno[a] ? r.porAno[a].total : null), render: (r) => (r.porAno[a] ? fmtBRL(r.porAno[a].total) : '—') });
        cols.push({ key: `g_${a}`, label: `Pago ${a}`, align: 'right', sortValue: (r) => (r.porAno[a] ? r.porAno[a].pago : null), render: (r) => (r.porAno[a] ? fmtBRL(r.porAno[a].pago) : '—') });
      });
    }
    return cols;
  }, [eleitoral, detalheComp, emendasAno, anosEmenda.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const rodapeLista = useMemo(() => {
    if (!eleitoral) return null;
    const f = { nome: `Total (${todasF.length} municípios)` };
    eleitoral.eleicoes.forEach((el) => {
      let v = 0, c = 0;
      todasF.forEach((r) => { const x = r.v[el.key]; if (x) { v += x.votos || 0; c += x.comp || 0; } });
      f[`v_${el.key}`] = fmtInt(v);
      if (detalheComp) { f[`c_${el.key}`] = fmtInt(c); f[`p_${el.key}`] = c > 0 ? fmtPct((v / c) * 100, 2) : '—'; }
    });
    f.qtd = fmtInt(todasF.reduce((s, r) => s + r.qtd, 0));
    f.total = fmtBRL(todasF.reduce((s, r) => s + r.total, 0));
    f.pago = fmtBRL(todasF.reduce((s, r) => s + r.pago, 0));
    if (emendasAno) {
      anosEmenda.forEach((a) => {
        f[`q_${a}`] = fmtInt(todasF.reduce((s, r) => s + (r.porAno[a] ? r.porAno[a].qtd : 0), 0));
        f[`t_${a}`] = fmtBRL(todasF.reduce((s, r) => s + (r.porAno[a] ? r.porAno[a].total : 0), 0));
        f[`g_${a}`] = fmtBRL(todasF.reduce((s, r) => s + (r.porAno[a] ? r.porAno[a].pago : 0), 0));
      });
    }
    return f;
  }, [eleitoral, todasF, detalheComp, emendasAno, anosEmenda.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------- estado de carregamento / erro (depois de TODOS os hooks) ---------------- */
  if (!eleitoral || !A) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white border border-slate-300 p-6">
          <h2 className="text-lg font-bold uppercase text-slate-900 mb-2">Inteligência Eleitoral</h2>
          {status === 'loading' || status === 'atualizando' ? (
            <p className="text-sm text-slate-600">Carregando dados eleitorais...</p>
          ) : (
            <>
              <p className="text-sm text-slate-700 mb-2">Não foi possível carregar os dados eleitorais.</p>
              <p className="text-xs text-rose-700 font-semibold mb-3">{erro}</p>
              <p className="text-xs text-slate-500 mb-3">Confira as variáveis de ambiente do projeto no Vercel (veja o LEIA-ME_ELEITORAL.md).</p>
              <button onClick={recarregar} className="bg-sky-700 text-white text-xs font-bold uppercase px-4 py-2 hover:bg-sky-800">Tentar novamente</button>
            </>
          )}
        </div>
      </div>
    );
  }

  const elBase = eleitoral.eleicoes.find((e) => e.key === base);
  const elComp = eleitoral.eleicoes.find((e) => e.key === comp);
  const nomesEl = eleitoral.eleicoes.map((e) => [e.key, e.label]);
  const abrirMunicipio = (r) => openEntityFicha('municipio', r.nome);

  const nFiltros =
    (fil.busca ? 1 : 0) + (fil.regioes.length ? 1 : 0) + (fil.classes.length ? 1 : 0) + (fil.emenda !== 'todos' ? 1 : 0) +
    (fil.votos !== 'todos' ? 1 : 0) + (fil.anos.length ? 1 : 0) + (fil.mods !== null ? 1 : 0) +
    (fil.articuladores.length ? 1 : 0) + (fil.temas.length ? 1 : 0) + (fil.situacoes.length ? 1 : 0);

  const resumoFiltros = () => {
    const p = [];
    if (fil.busca) p.push(`Busca: “${fil.busca}”`);
    if (fil.regioes.length) p.push(`Região: ${fil.regioes.join(', ')}`);
    if (fil.classes.length) p.push(`Classificação: ${fil.classes.join(', ')}`);
    if (fil.emenda !== 'todos') p.push(fil.emenda === 'com' ? 'Só municípios com emendas' : 'Só municípios sem emendas');
    if (fil.votos !== 'todos') p.push(fil.votos === 'com' ? `Só com votos em ${elComp.ano}` : `Só sem votos em ${elComp.ano}`);
    if (fil.anos.length) p.push(`Ano das emendas: ${fil.anos.join(', ')}`);
    if (fil.mods === null) { if (modsPadrao.length !== opc.mods.length) p.push('Modalidades: todas, exceto Execução Direta'); }
    else if (fil.mods.length) p.push(`Modalidade: ${fil.mods.join(', ')}`);
    if (fil.articuladores.length) p.push(`Articulador: ${fil.articuladores.join(', ')}`);
    if (fil.temas.length) p.push(`Tema: ${fil.temas.join(', ')}`);
    if (fil.situacoes.length) p.push(`Situação: ${fil.situacoes.join(', ')}`);
    if (aba !== 'lista') p.push(`Comparação de votos: ${elBase.label} → ${elComp.label}`);
    return p.length ? p.join(' • ') : 'Sem filtros (todos os municípios)';
  };

  /* ---- exportação CSV (o que está na aba aberta, já filtrado) ---- */
  const objetosCruzamento = () => rowsF.map((r) => ({
    Município: r.nome,
    Região: r.regiao,
    [`Votos ${elBase.label}`]: r.vBase,
    [`Votos ${elComp.label}`]: r.vComp,
    'Variação de votos': r.delta,
    'Variação %': r.deltaPct === null ? '' : r.deltaPct.toFixed(1).replace('.', ','),
    'Emendas (qtd)': r.qtd,
    'Valor destinado': dinheiroCsv(r.total),
    'Valor pago': dinheiroCsv(r.pago),
    'R$ por voto': r.rsPorVoto === null ? '' : dinheiroCsv(r.rsPorVoto),
    Classificação: CLASSES[r.classe].label,
  }));

  const objetosLista = () => todasF.map((r) => {
    const o = { Município: r.nome, Região: r.regiao };
    eleitoral.eleicoes.forEach((el) => {
      const x = r.v[el.key];
      if (detalheComp) o[`Comparecimento ${el.label}`] = x && x.comp !== null ? x.comp : '';
      o[`Votos ${el.label}`] = x ? x.votos : '';
      if (detalheComp) o[`% ${el.label}`] = x && x.comp > 0 ? ((x.votos / x.comp) * 100).toFixed(2).replace('.', ',') : '';
    });
    o['Evolução dos votos'] = textoEvolucao(serieEvolucao(eleitoral, r.v));
    o['Emendas (qtd)'] = r.qtd;
    o['Valor destinado'] = dinheiroCsv(r.total);
    o['Valor pago'] = dinheiroCsv(r.pago);
    if (emendasAno) {
      anosEmenda.forEach((a) => {
        const x = r.porAno[a];
        o[`Emendas ${a} (qtd)`] = x ? x.qtd : 0;
        o[`Destinado ${a}`] = dinheiroCsv(x ? x.total : 0);
        o[`Pago ${a}`] = dinheiroCsv(x ? x.pago : 0);
      });
    }
    return o;
  });

  const exportarCSV = () => {
    if (aba === 'lista') return exportRows(objetosLista(), 'eleitoral_lista_municipios.csv');
    if (aba === 'regioes') {
      return exportRows(regioesAgg.map((g) => ({
        Região: g.nome, Municípios: g.munis, [`Com votos ${elComp.ano}`]: g.comVotos,
        [`Votos ${elBase.label}`]: g.vBase, [`Votos ${elComp.label}`]: g.vComp, 'Variação de votos': g.delta,
        'Emendas (qtd)': g.qtd, 'Valor destinado': dinheiroCsv(g.total), 'Valor pago': dinheiroCsv(g.pago),
        'R$ por voto': g.rsPorVoto === null ? '' : dinheiroCsv(g.rsPorVoto),
      })), 'eleitoral_regioes.csv');
    }
    if (aba === 'dados') {
      return exportRows(A.naoCasadas.map((a) => ({ Município: a.nome, 'Emendas (qtd)': a.qtd, 'Valor destinado': dinheiroCsv(a.total) })), 'eleitoral_emendas_sem_votos.csv');
    }
    return exportRows(objetosCruzamento(), 'eleitoral_cruzamento_votos_emendas.csv');
  };

  const alternarModo = (lista, valor) => (lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);

  /* ---- listas / quadros ---- */
  const lista = (titulo_, itens, cols) => (
    <Card title={titulo_}>
      {itens.length === 0 ? (
        <p className="p-3 text-xs text-slate-400 uppercase">Nenhum município nesta condição.</p>
      ) : (
        <table className="w-full text-xs">
          <tbody className="divide-y divide-slate-100">
            {itens.map((r) => (
              <tr key={r.norm} onClick={() => abrirMunicipio(r)} className="hover:bg-sky-50/70 cursor-pointer">
                <td className="py-1.5 px-2 font-semibold text-sky-800">{r.nome}</td>
                {cols(r).map((c, i) => (<td key={i} className="py-1.5 px-2 text-right whitespace-nowrap text-slate-700">{c}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );

  const leitura = (rho, n, texto) => {
    if (rho === null) return <p className="text-xs text-slate-400">{texto}: dados insuficientes com os filtros atuais.</p>;
    const a = Math.abs(rho);
    const forca = a < 0.2 ? 'praticamente nenhuma' : a < 0.4 ? 'fraca' : a < 0.6 ? 'moderada' : 'forte';
    return (
      <p className="text-xs text-slate-700">
        {texto}: <strong>ρ = {rho.toFixed(2).replace('.', ',')}</strong> (associação {forca}, {n} municípios).
      </p>
    );
  };

  const colunasCruzamento = [
    { key: 'nome', label: 'Município', align: 'left', render: (r) => <span className="font-semibold text-sky-800 hover:underline">{r.nome}</span> },
    { key: 'regiao', label: 'Região', align: 'left', render: (r) => r.regiao || <span className="text-slate-300">—</span> },
    { key: 'vBase', label: `Votos ${elBase.ano}`, align: 'right', render: (r) => fmtInt(r.vBase) },
    { key: 'vComp', label: `Votos ${elComp.ano}`, align: 'right', render: (r) => <strong>{fmtInt(r.vComp)}</strong> },
    { key: 'delta', label: 'Variação', align: 'right', render: (r) => <Delta v={r.delta} pct={r.deltaPct} /> },
    { key: 'pctComp', label: '% s/ comp.*', title: 'Votos ÷ comparecimento das seções em que houve voto (pode superestimar em municípios pequenos).', align: 'right', render: (r) => fmtPct(r.pctComp, 2) },
    { key: 'qtd', label: 'Emendas', align: 'center', render: (r) => r.qtd || '—' },
    { key: 'total', label: 'Destinado', align: 'right', render: (r) => (r.total ? fmtBRL(r.total) : '—') },
    { key: 'pago', label: 'Pago', align: 'right', render: (r) => (r.pago ? fmtBRL(r.pago) : '—') },
    { key: 'rsPorVoto', label: 'R$/voto', title: 'Valor destinado ÷ votos na eleição de chegada', align: 'right', render: (r) => (r.rsPorVoto ? fmtBRL(r.rsPorVoto) : '—') },
    { key: 'classe', label: 'Classificação', align: 'left', sortValue: (r) => CLASSES[r.classe].label, render: (r) => <Badge classe={r.classe} /> },
  ];

  const sumComp = rowsF.reduce((s, r) => s + r.vComp, 0);
  const sumBase = rowsF.reduce((s, r) => s + r.vBase, 0);
  const totEstadoComp = (eleitoral.totais[comp] || {}).votos || 0;
  const totalMun = rowsF.reduce((s, r) => s + r.total, 0);
  const pagoMun = rowsF.reduce((s, r) => s + r.pago, 0);
  const qtdMun = rowsF.reduce((s, r) => s + r.qtd, 0);
  const contemplados = rowsF.filter((r) => r.total > 0);
  const cobertura = sumComp > 0 ? (contemplados.reduce((s, r) => s + r.vComp, 0) / sumComp) * 100 : null;
  const porAnoGeral = {};
  rowsF.forEach((r) => Object.entries(r.porAno).forEach(([a, x]) => {
    const g = porAnoGeral[a] || (porAnoGeral[a] = { qtd: 0, total: 0, pago: 0 });
    g.qtd += x.qtd; g.total += x.total; g.pago += x.pago;
  }));
  const filtrado = nFiltros > 0;

  const abas = [['lista', 'Lista'], ['geral', 'Visão geral'], ['cruzamento', 'Votos × emendas'], ['mapa', 'Mapa'], ['matriz', 'Matriz'], ['regioes', 'Regiões'], ['dados', 'Qualidade dos dados']];
  const nomeAba = abas.find((a) => a[0] === aba)[1];

  return (
    <ImpressaoCtx.Provider value={imprimindo}>
      <style>{`@media print { @page { size: A4 landscape; margin: 9mm; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>
      <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4 print:max-w-none print:p-0">
        {/* cabeçalho que só aparece no PDF */}
        <div className="hidden print:block mb-3 border-b-2 border-slate-800 pb-2">
          <p className="text-base font-bold uppercase">TABULUM — Inteligência Eleitoral • {nomeAba}</p>
          <p className="text-[10px] text-slate-700">Emitido em {new Date().toLocaleString('pt-BR')}</p>
          <p className="text-[10px] text-slate-700"><strong>Filtros:</strong> {resumoFiltros()}</p>
        </div>

        <div className="mb-3 print:hidden">
          <h2 className="text-base font-bold uppercase text-slate-900">Inteligência Eleitoral</h2>
          <p className="text-xs text-slate-500">
            Votos do mandato em cada município, cruzados com as emendas. Os filtros abaixo valem para todas as abas, para o CSV e para o PDF.
          </p>
        </div>

        {/* filtros universais */}
        <div className="bg-white border border-slate-300 shadow-xs mb-4 p-3 print:hidden space-y-3">
          <div className="flex flex-wrap items-end gap-2.5">
            <span className="text-[10px] font-bold uppercase text-sky-800 w-full lg:w-auto lg:mr-1 lg:pb-2">Onde</span>
            <label className="flex flex-col text-[10px] font-bold uppercase text-slate-500">
              Município
              <input value={fil.busca} onChange={(e) => setF({ busca: e.target.value })} placeholder="Digite o nome..." className="mt-0.5 border border-slate-300 bg-white px-2 py-[3px] text-xs font-medium normal-case text-slate-800 w-40 focus:outline-none focus:border-sky-700" />
            </label>
            <MultiFiltro label="Região" opcoes={regioesOpc} valor={fil.regioes} onChange={(v) => setF({ regioes: v })} vazioTexto="Todas" />
            <MultiFiltro label="Classificação" opcoes={Object.values(CLASSES).map((c) => c.label)} valor={fil.classes} onChange={(v) => setF({ classes: v })} vazioTexto="Todas" largura="w-56" />
            <Seletor label="Emendas no município" value={fil.emenda} onChange={(v) => setF({ emenda: v })} options={[['todos', 'Com e sem emendas'], ['com', 'Só com emendas'], ['sem', 'Só sem emendas']]} />
            <Seletor label="Votos" value={fil.votos} onChange={(v) => setF({ votos: v })} options={[['todos', 'Com e sem votos'], ['com', `Só com votos em ${elComp.ano}`], ['sem', `Só sem votos em ${elComp.ano}`]]} />
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {nFiltros > 0 && (
                <button onClick={() => setFil(FILTROS_VAZIOS)} className="px-3 py-1.5 text-xs font-semibold text-rose-700 border border-rose-300 bg-white hover:bg-rose-50">
                  Limpar filtros ({nFiltros})
                </button>
              )}
              <button onClick={exportarCSV} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-amber-100" title="Baixa em CSV o que está na aba aberta, com os filtros aplicados">Baixar CSV</button>
              <button onClick={() => setImprimindo(true)} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-sky-700 hover:text-white" title="Gera o PDF da aba aberta, com os filtros aplicados">PDF</button>
              <button onClick={recarregar} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-amber-100" title="Recarregar dados eleitorais">
                {status === 'atualizando' ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2.5 pt-3 border-t border-slate-200">
            <span className="text-[10px] font-bold uppercase text-sky-800 w-full lg:w-auto lg:mr-1 lg:pb-2">Quais emendas</span>
            <MultiFiltro label="Ano da emenda" opcoes={opc.anos} valor={fil.anos} onChange={(v) => setFEmenda({ anos: v })} vazioTexto="Todos" largura="w-44" />
            <MultiFiltro label="Modalidade" opcoes={opc.mods} valor={mods} onChange={(v) => setF({ mods: v })} vazioTexto="Todas" />
            <MultiFiltro label="Articulador" opcoes={opc.arts} valor={fil.articuladores} onChange={(v) => setFEmenda({ articuladores: v })} vazioTexto="Todos" />
            <MultiFiltro label="Tema" opcoes={opc.temas} valor={fil.temas} onChange={(v) => setFEmenda({ temas: v })} vazioTexto="Todos" />
            <MultiFiltro label="Situação" opcoes={opc.sits} valor={fil.situacoes} onChange={(v) => setFEmenda({ situacoes: v })} vazioTexto="Todas" largura="w-52" />
            {modsPadrao.length !== opc.mods.length && fil.mods === null && (
              <p className="text-[11px] text-slate-500 max-w-md pb-1">
                A <strong>Execução Direta</strong> fica de fora por padrão: o dinheiro vai para órgãos do estado, não para o município. Para incluí-la, marque-a em Modalidade.
              </p>
            )}
          </div>

          {aba !== 'lista' && (
            <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase text-sky-800 w-full lg:w-auto lg:mr-1 lg:pb-2">Comparar votos</span>
              <Seletor label="De" value={base} onChange={setBaseKey} options={nomesEl} />
              <Seletor label="Para" value={comp} onChange={setCompKey} options={nomesEl} />
              <details className="text-xs self-end pb-0.5">
                <summary className="cursor-pointer text-sky-700 font-semibold">Como os municípios são classificados?</summary>
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 space-y-2 text-slate-700 max-w-2xl">
                  <p>
                    Cada município é comparado com os demais. <strong>Votação alta</strong> = está entre os{' '}
                    <select value={pVotos} onChange={(e) => setPVotos(e.target.value)} className="border border-slate-300 bg-white px-1 py-0.5">
                      {OPCOES_CORTE.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
                    </select>{' '}
                    que mais votaram no candidato. <strong>Emenda alta</strong> = está entre os{' '}
                    <select value={pEmenda} onChange={(e) => setPEmenda(e.target.value)} className="border border-slate-300 bg-white px-1 py-0.5">
                      {OPCOES_CORTE.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
                    </select>{' '}
                    que mais receberam em emendas.
                  </p>
                  <ul className="space-y-1">
                    {Object.values(CLASSES).map((c) => (
                      <li key={c.label} className="flex items-center gap-2"><span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase ${c.badge}`}>{c.label}</span><span>{c.desc}</span></li>
                    ))}
                  </ul>
                  <p className="text-slate-500">Atualmente: votação alta a partir de <strong>{fmtInt(A.cortes.votos)}</strong> votos; emenda alta a partir de <strong>{fmtBRL(A.cortes.emenda)}</strong>.</p>
                </div>
              </details>
            </div>
          )}
        </div>

        {/* abas */}
        <div className="flex flex-wrap border-b border-slate-300 mb-4 print:hidden">
          {abas.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setAba(k)}
              className={`px-3.5 py-2 text-xs font-bold uppercase border border-b-0 -mb-px ${aba === k ? 'bg-white border-slate-300 text-sky-800' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              {l}
            </button>
          ))}
        </div>

        {aba === 'lista' && (
          <Card
            title={`Lista por município (${todasF.length}${filtrado ? ' após filtros' : ''})`}
            right={
              <div className="flex items-center gap-1.5 print:hidden">
                <Chip ativo={detalheComp} onClick={() => setDetalheComp((v) => !v)}>Comparecimento e %</Chip>
                <Chip ativo={emendasAno} onClick={() => setEmendasAno((v) => !v)}>Emendas por ano</Chip>
              </div>
            }
          >
            <DataTable columns={colunasLista} rows={todasF} initialSort={{ key: `v_${comp}`, dir: 'desc' }} onRowClick={abrirMunicipio} pageSize={150} footer={rodapeLista} empty="Nenhum município com os filtros atuais." />
            <p className="px-3 py-2 text-[10px] text-slate-500 border-t border-slate-200">
              “—” = sem votos registrados naquela eleição. Vereador e prefeito (2016, 2020, 2024) existem apenas em Florianópolis. A planilha só traz as seções em que o candidato teve voto: o comparecimento é o dessas seções.
              Clique no cabeçalho para ordenar; clique na linha para abrir a ficha do município.
            </p>
          </Card>
        )}

        {aba === 'geral' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <Kpi label={`Votos ${elComp.label}`} value={fmtInt(sumComp)} tone="sky"
                sub={`${fmtSignedPct(sumBase > 0 ? ((sumComp - sumBase) / sumBase) * 100 : null)} vs ${elBase.ano} (${fmtInt(sumBase)})${filtrado ? ` • ${fmtPct(totEstadoComp > 0 ? (sumComp / totEstadoComp) * 100 : null)} do total` : ''}`} />
              <Kpi label="Municípios com votos" value={fmtInt(rowsF.filter((r) => r.vComp > 0).length)} sub={`${fmtInt(rowsF.filter((r) => r.vBase > 0).length)} em ${elBase.ano}`} />
              <Kpi label="Emendas destinadas" value={fmtBRLCompact(totalMun)} tone="rose" sub={`${fmtInt(qtdMun)} emendas`} />
              <Kpi label="Valor pago" value={fmtBRLCompact(pagoMun)} tone="sky" sub={`${fmtPct(totalMun > 0 ? (pagoMun / totalMun) * 100 : null)} do destinado`} />
              <Kpi label="Municípios contemplados" value={fmtInt(contemplados.length)} sub={`${fmtPct(cobertura)} dos votos de ${elComp.ano}`} />
              <Kpi label="R$ por voto" value={sumComp > 0 ? fmtBRL(totalMun / sumComp) : '—'} tone="amber" sub={`destinado ÷ votos ${elComp.ano}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card title="Votos por eleição (deputado estadual)">
                <Barras
                  formatar={fmtInt}
                  itens={eleitoral.eleicoes.filter((e) => e.deputado).map((e) => ({
                    label: String(e.ano), sub: CARGO_CURTO[e.cargo] || e.cargo,
                    valor: todasF.reduce((s, r) => s + (r.v[e.key] ? r.v[e.key].votos || 0 : 0), 0),
                  }))}
                />
              </Card>
              <Card title="Emendas por ano (destinado × pago)" right={<span className="text-[10px] text-slate-500">azul: destinado • amarelo: pago</span>}>
                <Barras
                  formatar={fmtBRLCompact}
                  itens={Object.keys(porAnoGeral).sort().map((a) => ({ label: a, sub: `${porAnoGeral[a].qtd} emendas`, valor: porAnoGeral[a].total, valor2: porAnoGeral[a].pago }))}
                />
              </Card>
            </div>

            <Card title="Leitura estatística (correlação de postos de Spearman)">
              <div className="p-3 space-y-1.5">
                {leitura(corr.votos, corr.nA, `Emendas destinadas × votos em ${elComp.ano}`)}
                {leitura(corr.delta, corr.nB, `Emendas destinadas × variação de votos ${elBase.ano}→${elComp.ano}`)}
                <p className="text-[11px] text-slate-500 pt-1">
                  Associação não é causa: cidades grandes concentram votos e emendas ao mesmo tempo. Use como pista para aprofundar, não como prova de retorno eleitoral.
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {lista('Bases a fortalecer — votos altos, pouca ou nenhuma emenda',
                rowsF.filter((r) => r.classe === 'fortalecer').sort((a, b) => b.vComp - a.vComp).slice(0, 10),
                (r) => [`${fmtInt(r.vComp)} votos`, r.total ? fmtBRLCompact(r.total) : 'sem emenda'])}
              {lista('Investimento a converter — emendas altas, votos baixos',
                rowsF.filter((r) => r.classe === 'converter').sort((a, b) => b.total - a.total).slice(0, 10),
                (r) => [fmtBRLCompact(r.total), `${fmtInt(r.vComp)} votos`])}
              {lista(`Maior crescimento de votos (${elBase.ano}→${elComp.ano})`,
                rowsF.filter((r) => r.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 10),
                (r) => [<Delta key="d" v={r.delta} pct={r.deltaPct} />, r.total ? fmtBRLCompact(r.total) : 'sem emenda'])}
              {lista(`Maior queda de votos (${elBase.ano}→${elComp.ano})`,
                rowsF.filter((r) => r.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 10),
                (r) => [<Delta key="d" v={r.delta} pct={r.deltaPct} />, r.total ? fmtBRLCompact(r.total) : 'sem emenda'])}
            </div>
          </div>
        )}

        {aba === 'cruzamento' && (
          <Card title={`Votos × emendas por município (${rowsF.length})`}>
            <DataTable columns={colunasCruzamento} rows={rowsF} initialSort={{ key: 'vComp', dir: 'desc' }} onRowClick={abrirMunicipio} empty="Nenhum município com os filtros atuais." />
          </Card>
        )}

        {aba === 'mapa' && (
          <Card
            title={`Mapa de Santa Catarina — ${elComp.label}`}
            right={<button onClick={() => baixarSvgPng(mapaRef.current, 'eleitoral_mapa.png')} className="text-[11px] font-semibold px-2 py-0.5 border border-slate-400 bg-white hover:bg-amber-100 print:hidden">Baixar imagem (PNG)</button>}
          >
            <div ref={mapaRef}>
              <MapaEleitoral rows={rowsF} mapGeoJson={mapGeoJson} onOpen={abrirMunicipio} foraDoFiltro={foraDoFiltro} />
            </div>
          </Card>
        )}

        {aba === 'matriz' && (
          <Card
            title="Matriz votos × emendas"
            right={
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">Cortes: ≥ {fmtInt(A.cortes.votos)} votos • ≥ {fmtBRLCompact(A.cortes.emenda)} em emendas</span>
                <button onClick={() => baixarSvgPng(matrizRef.current, 'eleitoral_matriz.png')} className="text-[11px] font-semibold px-2 py-0.5 border border-slate-400 bg-white hover:bg-amber-100 print:hidden">Baixar imagem (PNG)</button>
              </div>
            }
          >
            <div className="p-3">
              <div ref={matrizRef}><Matriz rows={rowsF} cortes={A.cortes} onOpen={abrirMunicipio} /></div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-[11px] text-slate-600">
                {Object.entries(CLASSES).map(([k, c]) => (
                  <span key={k} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: c.cor }} />
                    <strong>{c.label}</strong>: {c.desc} ({rowsF.filter((r) => r.classe === k).length})
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}

        {aba === 'regioes' && (
          <Card title="Resumo por região">
            <DataTable
              initialSort={{ key: 'vComp', dir: 'desc' }}
              rows={regioesAgg}
              onRowClick={(g) => g.definida && openEntityFicha('regiao', g.nome)}
              columns={[
                { key: 'nome', label: 'Região', align: 'left', render: (g) => <span className={g.definida ? 'font-semibold text-sky-800 hover:underline' : 'italic text-slate-400'}>{g.nome}</span> },
                { key: 'munis', label: 'Municípios', align: 'center' },
                { key: 'comVotos', label: `Com votos ${elComp.ano}`, align: 'center' },
                { key: 'vBase', label: `Votos ${elBase.ano}`, align: 'right', render: (g) => fmtInt(g.vBase) },
                { key: 'vComp', label: `Votos ${elComp.ano}`, align: 'right', render: (g) => <strong>{fmtInt(g.vComp)}</strong> },
                { key: 'delta', label: 'Variação', align: 'right', render: (g) => <Delta v={g.delta} pct={g.deltaPct} /> },
                { key: 'share', label: '% dos votos', align: 'right', render: (g) => fmtPct(g.share) },
                { key: 'qtd', label: 'Emendas', align: 'center' },
                { key: 'total', label: 'Destinado', align: 'right', render: (g) => fmtBRL(g.total) },
                { key: 'pago', label: 'Pago', align: 'right', render: (g) => fmtBRL(g.pago) },
                { key: 'rsPorVoto', label: 'R$/voto', align: 'right', render: (g) => (g.rsPorVoto ? fmtBRL(g.rsPorVoto) : '—') },
                { key: 'top', label: 'Maior base', align: 'left', sortValue: (g) => (g.top ? g.top.vComp : null), render: (g) => (g.top ? `${g.top.nome} (${fmtInt(g.top.vComp)})` : '—') },
              ]}
            />
            <p className="p-3 text-[11px] text-slate-500 border-t border-slate-200">
              A região de cada município vem das emendas cadastradas; municípios sem emendas aparecem em “Sem região definida”.
              Para fechar essa lacuna, inclua uma coluna “Região” na aba Municípios da planilha de votos: o app passa a usá-la automaticamente.
            </p>
          </Card>
        )}

        {aba === 'dados' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Kpi label="Dados eleitorais" value={eleitoral.atualizadoEm ? new Date(eleitoral.atualizadoEm).toLocaleString('pt-BR') : '—'} sub={status === 'ok-cache' ? 'servidor indisponível: usando cópia local' : 'lido da planilha de votos'} />
              <Kpi label="Municípios na planilha de votos" value={fmtInt(eleitoral.munis.length)} />
              <Kpi label="Emendas sem município" value={fmtInt(A.semMun.qtd)} tone="rose" sub={`${fmtBRL(A.semMun.total)} (ex.: “ESTADUAL”)`} />
              <Kpi label="Municípios com emenda sem votos" value={fmtInt(A.naoCasadas.length)} tone="amber" sub="podem ser nomes divergentes" />
            </div>
            <Card title="Municípios com emendas, mas sem linha na planilha de votos">
              {A.naoCasadas.length === 0 ? (
                <p className="p-3 text-xs text-slate-500">Nenhum. Todos os municípios com emendas têm votos registrados.</p>
              ) : (
                <div className="p-3">
                  <p className="text-[11px] text-slate-500 mb-2">
                    O candidato pode simplesmente não ter tido votos nesses municípios. Se o nome estiver escrito de forma diferente nas duas fontes, o cruzamento fica incompleto: confira.
                  </p>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-100">
                      {A.naoCasadas.map((a) => (
                        <tr key={a.nome}><td className="py-1 px-2 font-semibold">{a.nome}</td><td className="py-1 px-2 text-center">{a.qtd} emendas</td><td className="py-1 px-2 text-right">{fmtBRL(a.total)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
            <Card title="Como ler os números">
              <ul className="p-3 text-xs text-slate-700 space-y-1.5 list-disc pl-6">
                <li>A planilha de votos só traz as seções em que o candidato teve voto. Por isso o comparecimento é o das seções com voto e “% s/ comp.” pode ficar um pouco acima do real em municípios pequenos.</li>
                <li>Votos de eleições diferentes só são comparáveis entre o mesmo cargo (deputado × deputado). Vereador e prefeito (2016, 2020, 2024) existem apenas para Florianópolis.</li>
                <li>“R$ por voto” = valor destinado ÷ votos da eleição de chegada. Serve para comparar municípios, não como custo de voto.</li>
                <li>A classificação compara cada município com os demais (critério ajustável em “Como os municípios são classificados?”).</li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </ImpressaoCtx.Provider>
  );
}

/* ------------------------ status (tela de Configurações) ----------------- */
export function EleitoralStatus({ eleitoral, status, erro, recarregar }) {
  const ok = Boolean(eleitoral);
  return (
    <div className="border border-slate-200 p-5 bg-white">
      <h3 className="text-sm font-bold uppercase text-sky-700 border-b border-slate-200 pb-2 mb-3">Dados eleitorais</h3>
      <p className="text-xs text-slate-700 mb-1">
        Situação:{' '}
        <strong className={ok ? 'text-sky-700' : 'text-rose-700'}>
          {status === 'loading' ? 'carregando...' : ok ? (status === 'ok-cache' ? 'usando cópia local (servidor indisponível)' : 'conectado') : 'indisponível'}
        </strong>
      </p>
      {ok && <p className="text-xs text-slate-500 mb-1">{eleitoral.munis.length} municípios • {eleitoral.eleicoes.length} eleições • lido em {eleitoral.atualizadoEm ? new Date(eleitoral.atualizadoEm).toLocaleString('pt-BR') : '—'}</p>}
      {erro && <p className="text-xs text-rose-700 mb-1">{erro}</p>}
      <button onClick={recarregar} className="mt-2 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-amber-100">Recarregar</button>
    </div>
  );
}

/* ------------------- perfil eleitoral dentro das fichas ------------------ */
function HistoricoMunicipio({ muni, eleitoral }) {
  const linhas = eleitoral.eleicoes
    .map((e) => ({ e, x: muni.v[e.key] }))
    .filter((l) => l.x);
  if (!linhas.length) return null;
  const ultimoPorCargo = {};
  const itens = linhas.map(({ e, x }) => {
    const ant = ultimoPorCargo[e.cargo];
    ultimoPorCargo[e.cargo] = x.votos;
    return {
      key: e.key, label: e.label, comp: x.comp, votos: x.votos,
      pct: x.comp > 0 ? (x.votos / x.comp) * 100 : null,
      delta: ant === undefined ? null : x.votos - ant,
      deltaPct: ant > 0 ? ((x.votos - ant) / ant) * 100 : null,
    };
  });
  return (
    <div className="border border-slate-300 bg-white">
      <div className="bg-amber-100/90 border-b border-slate-300 px-3 py-1.5 font-bold text-xs uppercase text-slate-800">Histórico eleitoral</div>
      <table className="w-full text-xs">
        <thead className="bg-slate-50">
          <tr>
            {['Eleição', 'Comparecimento*', 'Votos', '% s/ comp.*', 'Variação (mesmo cargo)'].map((h, i) => (
              <th key={h} className={`py-1.5 px-2 text-[10px] font-bold uppercase text-slate-700 border-b border-slate-300 ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {itens.map((i) => (
            <tr key={i.key}>
              <td className="py-1.5 px-2 font-semibold text-slate-800">{i.label}</td>
              <td className="py-1.5 px-2 text-right">{fmtInt(i.comp)}</td>
              <td className="py-1.5 px-2 text-right font-bold text-slate-900">{fmtInt(i.votos)}</td>
              <td className="py-1.5 px-2 text-right">{fmtPct(i.pct, 2)}</td>
              <td className="py-1.5 px-2 text-right"><Delta v={i.delta} pct={i.deltaPct} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-3 py-1.5 text-[10px] text-slate-400 border-t border-slate-100">* Considera apenas as seções em que houve voto.</p>
    </div>
  );
}

export function EleitoralPerfil({ type, value, emendasFicha, emendasTodas, eleitoral, openEntityFicha }) {
  const chaves = useMemo(() => (eleitoral ? chavesPadrao(eleitoral) : null), [eleitoral]);

  const analiseGeral = useMemo(
    () => (eleitoral && chaves && (type === 'municipio' || type === 'regiao')
      ? analisar({ eleitoral, emendas: emendasTodas, baseKey: chaves.baseKey, compKey: chaves.compKey })
      : null),
    [eleitoral, chaves, emendasTodas, type]
  );
  const analiseFicha = useMemo(
    () => (eleitoral && chaves && type !== 'municipio' && type !== 'regiao'
      ? analisar({ eleitoral, emendas: emendasFicha, baseKey: chaves.baseKey, compKey: chaves.compKey })
      : null),
    [eleitoral, chaves, emendasFicha, type]
  );

  if (!eleitoral || !chaves || !chaves.compKey) return null;
  const elBase = eleitoral.eleicoes.find((e) => e.key === chaves.baseKey);
  const elComp = eleitoral.eleicoes.find((e) => e.key === chaves.compKey);
  const totalEstado = (eleitoral.totais[chaves.compKey] || {}).votos || 0;

  const Wrapper = ({ children, nota }) => (
    <div className="p-4 border-b border-slate-200 bg-white">
      <h2 className="text-xs sm:text-sm font-bold uppercase text-slate-800 tracking-wider mb-3 flex items-center">
        <span className="w-2 h-4 bg-sky-700 mr-2"></span>
        Perfil Eleitoral
        {nota && <span className="ml-2 normal-case font-medium text-[11px] text-slate-500">{nota}</span>}
      </h2>
      {children}
    </div>
  );

  const tabelaMunis = (rows, limite = 15) => (
    <div className="border border-slate-300 bg-white overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-slate-50">
          <tr>
            {['Município', `Votos ${elBase.ano}`, `Votos ${elComp.ano}`, 'Variação', 'Emendas', 'Destinado', 'R$/voto'].map((h, i) => (
              <th key={h} className={`py-1.5 px-2 text-[10px] font-bold uppercase text-slate-700 border-b border-slate-300 whitespace-nowrap ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.slice(0, limite).map((r) => (
            <tr key={r.norm} onClick={() => openEntityFicha('municipio', r.nome)} className="hover:bg-sky-50/70 cursor-pointer">
              <td className="py-1.5 px-2 font-semibold text-sky-800 hover:underline">{r.nome}</td>
              <td className="py-1.5 px-2 text-right">{fmtInt(r.vBase)}</td>
              <td className="py-1.5 px-2 text-right font-bold">{fmtInt(r.vComp)}</td>
              <td className="py-1.5 px-2 text-right"><Delta v={r.delta} pct={r.deltaPct} /></td>
              <td className="py-1.5 px-2 text-right">{r.qtd || '—'}</td>
              <td className="py-1.5 px-2 text-right whitespace-nowrap">{r.total ? fmtBRL(r.total) : '—'}</td>
              <td className="py-1.5 px-2 text-right whitespace-nowrap">{r.rsPorVoto ? fmtBRL(r.rsPorVoto) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > limite && <p className="px-3 py-1.5 text-[10px] text-slate-400 border-t border-slate-100">Mostrando {limite} de {rows.length}. O quadro completo está em Inteligência Eleitoral.</p>}
    </div>
  );

  /* ---------- ficha de município ---------- */
  if (type === 'municipio') {
    const k = norm(value);
    const muni = eleitoral.porNorm.get(k);
    const row = analiseGeral.rows.find((r) => r.norm === k);
    if (!muni) {
      return (
        <Wrapper>
          <p className="text-xs text-slate-500">Sem votos registrados para este município na planilha eleitoral (ou o nome está escrito de forma diferente nas duas fontes).</p>
        </Wrapper>
      );
    }
    const comVotos = analiseGeral.rows.filter((r) => r.vComp > 0).sort((a, b) => b.vComp - a.vComp);
    const comEmenda = analiseGeral.rows.filter((r) => r.total > 0).sort((a, b) => b.total - a.total);
    const posVotos = comVotos.findIndex((r) => r.norm === k) + 1;
    const posEmenda = comEmenda.findIndex((r) => r.norm === k) + 1;
    return (
      <Wrapper nota={`partida ${elBase.label} • chegada ${elComp.label}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Kpi label={`Votos ${elComp.label}`} value={fmtInt(row.vComp)} tone="sky"
            sub={posVotos ? `${posVotos}º entre ${comVotos.length} municípios • ${fmtPct(row.shareEstado, 2)} do total` : 'sem votos'} />
          <Kpi label={`Variação ${elBase.ano}→${elComp.ano}`} value={fmtSigned(row.delta)} tone={row.delta >= 0 ? 'sky' : 'rose'}
            sub={`${fmtSignedPct(row.deltaPct)} (${fmtInt(row.vBase)} → ${fmtInt(row.vComp)})`} />
          <Kpi label="Emendas destinadas" value={fmtBRL(row.total)} tone="rose"
            sub={row.total ? `${row.qtd} emendas • ${posEmenda}º entre ${comEmenda.length} • pago ${fmtBRL(row.pago)}` : 'nenhuma emenda'} />
          <Kpi label="R$ por voto" value={row.rsPorVoto ? fmtBRL(row.rsPorVoto) : '—'} tone="amber"
            sub={row.vComp > 0 && row.total > 0 ? `${row.votosPor100k.toFixed(1).replace('.', ',')} votos por R$ 100 mil` : ''} />
        </div>
        <div className="mb-3"><Badge classe={row.classe} /> <span className="text-[11px] text-slate-500 ml-1">{CLASSES[row.classe].desc}</span></div>
        <HistoricoMunicipio muni={muni} eleitoral={eleitoral} />
      </Wrapper>
    );
  }

  /* ---------- ficha de região ---------- */
  if (type === 'regiao') {
    const k = norm(value);
    const rows = analiseGeral.rows.filter((r) => norm(r.regiao) === k);
    const vBase = rows.reduce((s, r) => s + r.vBase, 0);
    const vComp = rows.reduce((s, r) => s + r.vComp, 0);
    const total = rows.reduce((s, r) => s + r.total, 0);
    const pago = rows.reduce((s, r) => s + r.pago, 0);
    const sorted = [...rows].sort((a, b) => b.vComp - a.vComp);
    return (
      <Wrapper nota={`partida ${elBase.label} • chegada ${elComp.label}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Kpi label={`Votos ${elComp.label}`} value={fmtInt(vComp)} tone="sky" sub={`${fmtPct(totalEstado > 0 ? (vComp / totalEstado) * 100 : null)} do total estadual`} />
          <Kpi label={`Variação ${elBase.ano}→${elComp.ano}`} value={fmtSigned(vComp - vBase)} tone={vComp - vBase >= 0 ? 'sky' : 'rose'} sub={fmtSignedPct(vBase > 0 ? ((vComp - vBase) / vBase) * 100 : null)} />
          <Kpi label="Emendas destinadas" value={fmtBRL(total)} tone="rose" sub={`pago ${fmtBRL(pago)}`} />
          <Kpi label="R$ por voto" value={vComp > 0 && total > 0 ? fmtBRL(total / vComp) : '—'} tone="amber" sub={`${rows.filter((r) => r.vComp > 0).length} de ${rows.length} municípios com votos`} />
        </div>
        {tabelaMunis(sorted, 20)}
        <p className="text-[10px] text-slate-400 mt-1.5">Municípios da região conforme cadastro das emendas; cidades sem emendas não entram na soma regional.</p>
      </Wrapper>
    );
  }

  /* ---------- demais fichas (entidade, tema, articulador, UO, ano...) ---------- */
  const alcancados = analiseFicha.rows.filter((r) => r.qtd > 0);
  if (!alcancados.length) return null;
  const vBase = alcancados.reduce((s, r) => s + r.vBase, 0);
  const vComp = alcancados.reduce((s, r) => s + r.vComp, 0);
  const total = alcancados.reduce((s, r) => s + r.total, 0);
  const comVotos = alcancados.filter((r) => r.vComp > 0).length;
  const sorted = [...alcancados].sort((a, b) => b.total - a.total);
  return (
    <Wrapper nota={`municípios alcançados por esta ficha • partida ${elBase.label} • chegada ${elComp.label}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi label="Municípios alcançados" value={fmtInt(alcancados.length)} sub={`${comVotos} com votos em ${elComp.ano}`} />
        <Kpi label={`Votos ${elComp.ano} nesses municípios`} value={fmtInt(vComp)} tone="sky" sub={`${fmtPct(totalEstado > 0 ? (vComp / totalEstado) * 100 : null)} do total estadual`} />
        <Kpi label={`Variação ${elBase.ano}→${elComp.ano}`} value={fmtSigned(vComp - vBase)} tone={vComp - vBase >= 0 ? 'sky' : 'rose'} sub={fmtSignedPct(vBase > 0 ? ((vComp - vBase) / vBase) * 100 : null)} />
        <Kpi label="R$ por voto" value={vComp > 0 && total > 0 ? fmtBRL(total / vComp) : '—'} tone="amber" sub="valor desta ficha ÷ votos desses municípios" />
      </div>
      {tabelaMunis(sorted, 10)}
    </Wrapper>
  );
}
