import React, { useState, useEffect, useMemo, useCallback } from 'react';

/* ==========================================================================
   TABULUM — Módulo Eleitoral
   Dados vêm de /api/eleitoral (servidor). Nenhuma URL/ID/chave fica neste arquivo.
   ========================================================================== */

const CACHE_KEY = 'tabulum_eleitoral_cache_v1';

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

export function analisar({ eleitoral, emendas, baseKey, compKey, anos, modalidades, pVotos = 50, pEmenda = 50 }) {
  const regiaoMap = regiaoPorMunicipio(emendas, eleitoral);
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
    if (!a) { a = { nome: String(e['MUNICÍPIO']).trim(), qtd: 0, total: 0, pago: 0 }; agg.set(mNorm, a); }
    a.qtd++; a.total += total; a.pago += pago;
    const g = porAnoGeral[ano] || (porAnoGeral[ano] = { qtd: 0, total: 0, pago: 0 });
    g.qtd++; g.total += total; g.pago += pago;
  });

  const keys = new Set([...eleitoral.porNorm.keys(), ...agg.keys()]);
  const rows = [];
  keys.forEach((k) => {
    const m = eleitoral.porNorm.get(k);
    const a = agg.get(k);
    const xb = m && m.v[baseKey];
    const xc = m && m.v[compKey];
    const vBase = xb ? xb.votos || 0 : 0;
    const vComp = xc ? xc.votos || 0 : 0;
    if (!a && vBase === 0 && vComp === 0) return;
    const cComp = xc ? xc.comp || 0 : 0;
    const total = a ? a.total : 0;
    rows.push({
      norm: k,
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
    });
  });

  const cortes = {
    votos: percentile(rows.filter((r) => r.vComp > 0).map((r) => r.vComp), pVotos),
    emenda: percentile(rows.filter((r) => r.total > 0).map((r) => r.total), pEmenda),
  };
  rows.forEach((r) => {
    const altoV = r.vComp > 0 && r.vComp >= cortes.votos;
    const altoE = r.total > 0 && r.total >= cortes.emenda;
    r.classe = altoV && altoE ? 'atendida' : altoV ? 'fortalecer' : altoE ? 'converter' : 'baixa';
  });

  const setA = rows.filter((r) => r.vComp > 0);
  const setB = rows.filter((r) => r.vBase > 0 && r.vComp > 0);
  const corr = {
    votos: spearman(setA.map((r) => r.total), setA.map((r) => r.vComp)),
    nA: setA.length,
    delta: spearman(setB.map((r) => r.total), setB.map((r) => r.delta)),
    nB: setB.length,
  };

  const totalComp = (eleitoral.totais[compKey] || {}).votos || 0;
  const votosEmContemplados = rows.filter((r) => r.total > 0).reduce((s, r) => s + r.vComp, 0);
  const naoCasadas = [...agg.entries()]
    .filter(([k]) => !eleitoral.porNorm.has(k))
    .map(([, a]) => a)
    .sort((x, y) => y.total - x.total);

  return {
    rows, cortes, corr, semMun, porAnoGeral, naoCasadas,
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

function DataTable({ columns, rows, initialSort, onRowClick, pageSize = 100, empty = 'Sem dados.' }) {
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
            {sorted.slice(0, limit).map((r, i) => (
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
        </table>
      </div>
      {sorted.length > limit && (
        <div className="p-2 text-center border-t border-slate-200">
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

function MapaEleitoral({ rows, mapGeoJson, onOpen }) {
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
                  key={i} d={f.d} fill={cor(r)} stroke="#334155" strokeWidth="0.6"
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
          </div>
        </div>
      </div>
      {hover && <Tooltip h={hover} />}
    </div>
  );
}

/* --------------------------- barra de controles -------------------------- */
const Chip = ({ ativo, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-2 py-0.5 text-[11px] font-semibold border ${ativo ? 'bg-sky-700 border-sky-800 text-white' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-100'}`}
  >
    {children}
  </button>
);

const Seletor = ({ label, value, onChange, options }) => (
  <label className="flex flex-col text-[10px] font-bold uppercase text-slate-500">
    {label}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-0.5 border border-slate-300 bg-white text-xs font-medium text-slate-800 normal-case px-2 py-1 focus:outline-none focus:border-sky-700"
    >
      {options.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
    </select>
  </label>
);

const OPCOES_CORTE = [['50', 'Mediana (50%)'], ['67', 'Terço superior (67%)'], ['75', 'Quartil superior (75%)']];

/* ------------------------- módulo: Inteligência Eleitoral ---------------- */
export function EleitoralModule({ eleitoral, status, erro, recarregar, emendas, mapGeoJson, openEntityFicha, exportRows }) {
  const padrao = useMemo(() => (eleitoral ? chavesPadrao(eleitoral) : { baseKey: '', compKey: '' }), [eleitoral]);
  const [baseKey, setBaseKey] = useState('');
  const [compKey, setCompKey] = useState('');
  const [anosSel, setAnosSel] = useState(null);
  const [modSel, setModSel] = useState(null);
  const [pVotos, setPVotos] = useState('50');
  const [pEmenda, setPEmenda] = useState('50');
  const [aba, setAba] = useState('geral');

  const anosDisp = useMemo(() => [...new Set((emendas || []).map((e) => String(e.ANO || '').trim()).filter(Boolean))].sort(), [emendas]);
  const modsDisp = useMemo(() => [...new Set((emendas || []).map((e) => e.MODALIDADE).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [emendas]);

  const base = baseKey || padrao.baseKey;
  const comp = compKey || padrao.compKey;
  const anos = anosSel || anosDisp;
  const mods = modSel || modsDisp.filter((m) => !/execu[cç][aã]o direta/i.test(m));

  const A = useMemo(
    () => (eleitoral && base && comp
      ? analisar({ eleitoral, emendas, baseKey: base, compKey: comp, anos, modalidades: mods, pVotos: Number(pVotos), pEmenda: Number(pEmenda) })
      : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eleitoral, emendas, base, comp, JSON.stringify(anos), JSON.stringify(mods), pVotos, pEmenda]
  );

  if (!eleitoral) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white border border-slate-300 p-6">
          <h2 className="text-lg font-bold uppercase text-slate-900 mb-2">Inteligência Eleitoral</h2>
          {status === 'loading' ? (
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
  const tBase = eleitoral.totais[base] || { votos: 0, n: 0 };
  const tComp = eleitoral.totais[comp] || { votos: 0, n: 0 };
  const nomesEl = eleitoral.eleicoes.map((e) => [e.key, e.label]);

  const alternar = (lista, setLista, todos, v) => {
    const atual = lista || todos;
    const novo = atual.includes(v) ? atual.filter((x) => x !== v) : [...atual, v];
    setLista(novo.length ? novo : todos);
  };

  const abrirMunicipio = (r) => openEntityFicha('municipio', r.nome);

  const exportar = () => {
    const out = A.rows.map((r) => ({
      Município: r.nome,
      Região: r.regiao,
      [`Votos ${elBase.label}`]: r.vBase,
      [`Votos ${elComp.label}`]: r.vComp,
      'Variação de votos': r.delta,
      'Variação %': r.deltaPct === null ? '' : r.deltaPct.toFixed(1).replace('.', ','),
      'Emendas (qtd)': r.qtd,
      'Valor destinado': r.total.toFixed(2).replace('.', ','),
      'Valor pago': r.pago.toFixed(2).replace('.', ','),
      'R$ por voto': r.rsPorVoto === null ? '' : r.rsPorVoto.toFixed(2).replace('.', ','),
      Classificação: CLASSES[r.classe].label,
    }));
    exportRows(out, 'cruzamento_votos_emendas.csv');
  };

  /* ---- abas ---- */
  const colunasMunicipios = [
    { key: 'nome', label: 'Município', align: 'left', render: (r) => <span className="font-semibold text-sky-800 hover:underline">{r.nome}</span> },
    { key: 'regiao', label: 'Região', align: 'left', render: (r) => r.regiao || <span className="text-slate-300">—</span> },
    { key: 'vBase', label: `Votos ${elBase.ano}`, align: 'right', render: (r) => fmtInt(r.vBase) },
    { key: 'vComp', label: `Votos ${elComp.ano}`, align: 'right', render: (r) => <strong>{fmtInt(r.vComp)}</strong> },
    { key: 'delta', label: 'Variação', align: 'right', render: (r) => <Delta v={r.delta} pct={r.deltaPct} /> },
    { key: 'pctComp', label: '% s/ comp.*', title: 'Votos ÷ comparecimento das seções em que houve voto (pode superestimar em municípios pequenos).', align: 'right', render: (r) => fmtPct(r.pctComp, 2) },
    { key: 'qtd', label: 'Emendas', align: 'center', render: (r) => r.qtd || '—' },
    { key: 'total', label: 'Destinado', align: 'right', render: (r) => (r.total ? fmtBRL(r.total) : '—') },
    { key: 'pago', label: 'Pago', align: 'right', render: (r) => (r.pago ? fmtBRL(r.pago) : '—') },
    { key: 'rsPorVoto', label: 'R$/voto', title: 'Valor destinado ÷ votos na eleição mais recente', align: 'right', render: (r) => (r.rsPorVoto ? fmtBRL(r.rsPorVoto) : '—') },
    { key: 'classe', label: 'Classificação', align: 'left', sortValue: (r) => CLASSES[r.classe].label, render: (r) => <Badge classe={r.classe} /> },
  ];

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

  const abas = [['geral', 'Visão geral'], ['municipios', 'Municípios'], ['mapa', 'Mapa'], ['matriz', 'Matriz votos × emendas'], ['regioes', 'Regiões'], ['dados', 'Qualidade dos dados']];

  const leitura = (rho, n, texto) => {
    if (rho === null) return <p className="text-xs text-slate-400">{texto}: dados insuficientes.</p>;
    const a = Math.abs(rho);
    const forca = a < 0.2 ? 'praticamente nenhuma' : a < 0.4 ? 'fraca' : a < 0.6 ? 'moderada' : 'forte';
    return (
      <p className="text-xs text-slate-700">
        {texto}: <strong>ρ = {rho.toFixed(2).replace('.', ',')}</strong> ({forca}, {n} municípios).
      </p>
    );
  };

  const regioesAgg = useMemo(() => {
    const m = new Map();
    A.rows.forEach((r) => {
      const k = r.regiao || 'Sem região definida';
      let g = m.get(k);
      if (!g) { g = { norm: norm(k), nome: k, definida: Boolean(r.regiao), munis: 0, comVotos: 0, vBase: 0, vComp: 0, qtd: 0, total: 0, pago: 0, top: null }; m.set(k, g); }
      g.munis++; if (r.vComp > 0) g.comVotos++;
      g.vBase += r.vBase; g.vComp += r.vComp; g.qtd += r.qtd; g.total += r.total; g.pago += r.pago;
      if (!g.top || r.vComp > g.top.vComp) g.top = r;
    });
    return [...m.values()].map((g) => ({
      ...g,
      delta: g.vComp - g.vBase,
      deltaPct: g.vBase > 0 ? ((g.vComp - g.vBase) / g.vBase) * 100 : null,
      share: tComp.votos > 0 ? (g.vComp / tComp.votos) * 100 : null,
      rsPorVoto: g.vComp > 0 && g.total > 0 ? g.total / g.vComp : null,
    }));
  }, [A, tComp.votos]);

  return (
    <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4 animate-in fade-in print:max-w-none">
      {/* controles */}
      <div className="bg-white border border-slate-300 shadow-xs mb-4 p-3.5 print:hidden">
        <div className="flex flex-wrap items-end gap-3">
          <Seletor label="Eleição de partida" value={base} onChange={setBaseKey} options={nomesEl} />
          <Seletor label="Eleição de chegada" value={comp} onChange={setCompKey} options={nomesEl} />
          <Seletor label="Corte de votos" value={pVotos} onChange={setPVotos} options={OPCOES_CORTE} />
          <Seletor label="Corte de emendas" value={pEmenda} onChange={setPEmenda} options={OPCOES_CORTE} />
          <div className="ml-auto flex items-center gap-2">
            <button onClick={exportar} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-amber-100">Exportar CSV</button>
            <button onClick={recarregar} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-amber-100" title="Recarregar dados eleitorais">
              {status === 'atualizando' ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase text-slate-500 mr-1">Ano das emendas</span>
            {anosDisp.map((a) => (<Chip key={a} ativo={anos.includes(a)} onClick={() => alternar(anosSel, setAnosSel, anosDisp, a)}>{a}</Chip>))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase text-slate-500 mr-1">Modalidade</span>
            {modsDisp.map((m) => (<Chip key={m} ativo={mods.includes(m)} onClick={() => alternar(modSel, setModSel, modsDisp, m)}>{m}</Chip>))}
          </div>
        </div>
        {modsDisp.some((m) => /execu[cç][aã]o direta/i.test(m)) && !mods.some((m) => /execu[cç][aã]o direta/i.test(m)) && (
          <p className="text-[11px] text-slate-500 mt-2">
            Execução Direta fica de fora por padrão: o recurso vai para órgãos do estado (UDESC, bombeiros etc.), não para o município, e inflaria Florianópolis.
          </p>
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

      {aba === 'geral' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <Kpi label={`Votos ${elComp.label}`} value={fmtInt(tComp.votos)} tone="sky"
              sub={`${fmtSignedPct(tBase.votos > 0 ? ((tComp.votos - tBase.votos) / tBase.votos) * 100 : null)} vs ${elBase.ano} (${fmtInt(tBase.votos)})`} />
            <Kpi label="Municípios com votos" value={fmtInt(tComp.n)} sub={`${fmtInt(tBase.n)} em ${elBase.ano}`} />
            <Kpi label="Emendas destinadas" value={fmtBRLCompact(A.totalMunicipal)} tone="rose" sub={`${fmtInt(A.qtdMunicipal)} emendas no período`} />
            <Kpi label="Valor pago" value={fmtBRLCompact(A.pagoMunicipal)} tone="sky" sub={`${fmtPct(A.totalMunicipal > 0 ? (A.pagoMunicipal / A.totalMunicipal) * 100 : null)} do destinado`} />
            <Kpi label="Municípios contemplados" value={fmtInt(A.contemplados)} sub={`${fmtPct(A.cobertura)} dos votos de ${elComp.ano}`} />
            <Kpi label="R$ por voto (estado)" value={tComp.votos > 0 ? fmtBRL(A.totalMunicipal / tComp.votos) : '—'} tone="amber" sub={`destinado ÷ votos ${elComp.ano}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="Votos por eleição">
              <Barras
                formatar={fmtInt}
                itens={eleitoral.eleicoes.filter((e) => e.deputado).map((e) => ({ label: String(e.ano), sub: CARGO_CURTO[e.cargo] || e.cargo, valor: eleitoral.totais[e.key].votos }))}
              />
            </Card>
            <Card title="Emendas por ano (destinado × pago)" right={<span className="text-[10px] text-slate-500">azul: destinado • amarelo: pago</span>}>
              <Barras
                formatar={fmtBRLCompact}
                itens={Object.keys(A.porAnoGeral).sort().map((a) => ({ label: a, sub: `${A.porAnoGeral[a].qtd} emendas`, valor: A.porAnoGeral[a].total, valor2: A.porAnoGeral[a].pago }))}
              />
            </Card>
          </div>

          <Card title="Leitura estatística (correlação de postos de Spearman)">
            <div className="p-3 space-y-1.5">
              {leitura(A.corr.votos, A.corr.nA, `Emendas destinadas × votos em ${elComp.ano}`)}
              {leitura(A.corr.delta, A.corr.nB, `Emendas destinadas × variação de votos ${elBase.ano}→${elComp.ano}`)}
              <p className="text-[11px] text-slate-500 pt-1">
                Associação não é causa: cidades grandes concentram votos e emendas ao mesmo tempo. Use como pista para aprofundar, não como prova de retorno eleitoral.
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {lista('Bases a fortalecer — votos altos, pouca ou nenhuma emenda',
              A.rows.filter((r) => r.classe === 'fortalecer').sort((a, b) => b.vComp - a.vComp).slice(0, 10),
              (r) => [`${fmtInt(r.vComp)} votos`, r.total ? fmtBRLCompact(r.total) : 'sem emenda'])}
            {lista('Investimento a converter — emendas altas, votos baixos',
              A.rows.filter((r) => r.classe === 'converter').sort((a, b) => b.total - a.total).slice(0, 10),
              (r) => [fmtBRLCompact(r.total), `${fmtInt(r.vComp)} votos`])}
            {lista(`Maior crescimento de votos (${elBase.ano}→${elComp.ano})`,
              A.rows.filter((r) => r.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 10),
              (r) => [<Delta key="d" v={r.delta} pct={r.deltaPct} />, r.total ? fmtBRLCompact(r.total) : 'sem emenda'])}
            {lista(`Maior queda de votos (${elBase.ano}→${elComp.ano})`,
              A.rows.filter((r) => r.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 10),
              (r) => [<Delta key="d" v={r.delta} pct={r.deltaPct} />, r.total ? fmtBRLCompact(r.total) : 'sem emenda'])}
          </div>
        </div>
      )}

      {aba === 'municipios' && <MunicipiosTab rows={A.rows} colunas={colunasMunicipios} onOpen={abrirMunicipio} regioes={[...new Set(A.rows.map((r) => r.regiao).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))} />}

      {aba === 'mapa' && (
        <Card title={`Mapa de Santa Catarina — ${elComp.label}`}>
          <MapaEleitoral rows={A.rows} mapGeoJson={mapGeoJson} onOpen={abrirMunicipio} />
        </Card>
      )}

      {aba === 'matriz' && (
        <Card
          title="Matriz votos × emendas"
          right={<span className="text-[10px] text-slate-500">Cortes: ≥ {fmtInt(A.cortes.votos)} votos • ≥ {fmtBRLCompact(A.cortes.emenda)} em emendas</span>}
        >
          <div className="p-3">
            <Matriz rows={A.rows} cortes={A.cortes} onOpen={abrirMunicipio} />
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-[11px] text-slate-600">
              {Object.entries(CLASSES).map(([k, c]) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: c.cor }} />
                  <strong>{c.label}</strong>: {c.desc} ({A.rows.filter((r) => r.classe === k).length})
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
            A região de cada município vem das emendas cadastradas. Municípios sem emendas aparecem em “Sem região definida”.
            Para fechar essa lacuna, basta incluir uma coluna “Região” na aba Municípios da planilha de votos: o app passa a usá-la automaticamente.
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
                  O Marquito pode simplesmente não ter tido votos nesses municípios. Se o nome estiver escrito de forma diferente nas duas fontes, o cruzamento fica incompleto: confira.
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
              <li>A classificação usa cortes por percentil (ajustáveis acima) sobre os municípios com votos/emendas no recorte atual.</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function MunicipiosTab({ rows, colunas, onOpen, regioes }) {
  const [busca, setBusca] = useState('');
  const [reg, setReg] = useState('');
  const [cls, setCls] = useState('');
  const [emd, setEmd] = useState('');
  const filtradas = useMemo(
    () => rows.filter((r) =>
      (!busca || norm(r.nome).includes(norm(busca))) &&
      (!reg || r.regiao === reg) &&
      (!cls || r.classe === cls) &&
      (!emd || (emd === 'com' ? r.total > 0 : r.total === 0))
    ),
    [rows, busca, reg, cls, emd]
  );
  return (
    <Card
      title={`Municípios (${filtradas.length})`}
      right={
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar município..." className="border border-slate-300 bg-white px-2 py-1 text-xs w-40 focus:outline-none focus:border-sky-700" />
          <select value={reg} onChange={(e) => setReg(e.target.value)} className="border border-slate-300 bg-white px-1.5 py-1 text-xs">
            <option value="">Todas as regiões</option>
            {regioes.map((r) => (<option key={r} value={r}>{r}</option>))}
          </select>
          <select value={cls} onChange={(e) => setCls(e.target.value)} className="border border-slate-300 bg-white px-1.5 py-1 text-xs">
            <option value="">Todas as classificações</option>
            {Object.entries(CLASSES).map(([k, c]) => (<option key={k} value={k}>{c.label}</option>))}
          </select>
          <select value={emd} onChange={(e) => setEmd(e.target.value)} className="border border-slate-300 bg-white px-1.5 py-1 text-xs">
            <option value="">Com e sem emendas</option>
            <option value="com">Só com emendas</option>
            <option value="sem">Só sem emendas</option>
          </select>
        </div>
      }
    >
      <DataTable columns={colunas} rows={filtradas} initialSort={{ key: 'vComp', dir: 'desc' }} onRowClick={onOpen} />
    </Card>
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
