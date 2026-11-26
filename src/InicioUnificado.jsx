import React, { useState, useEffect, useMemo, useRef } from 'react';
import { norm, tituloMunicipio, VotosEvolucao, textoEvolucaoMunicipio, BadgeRes } from './eleitoral.jsx';
import { BadgeLeads } from './leads.jsx';
import {
  fmtInt, fmtBRL, fmtBRLCompact, fmtHoras, fmtPct, fmtSigned, fmtSignedPct, fmtDataBr, dinheiroCsv,
  MODOS_MAPA, METRICAS_ELEITORAIS, RESULTADOS_EMENDAS, RESULTADOS_AGENDAS, RESULTADOS_LEADS, QUADRANTES_4, MATRIZ_3X3,
} from './motorUnificado.js';

/* ==========================================================================
   TABULUM — Interface Unificada (Início, Mapa Único, Municípios e Agendas)
   Linguagem natural voltada para a equipe de articuladores e estratégia.
   ========================================================================== */

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

const corTextoSobre = (cor) =>
  cor === '#f59e0b' || cor === '#facc15' || cor === '#fef08a' || cor === '#94a3b8' || cor === '#cbd5e1' || cor === '#e2e8f0'
    ? '#0f172a'
    : '#ffffff';

/* --------------------------- componentes visuais -------------------------- */
const CartaoKpi = ({ label, value, sub, destaque = 'slate' }) => {
  const cores = {
    slate: 'text-slate-900 border-t-slate-700',
    pink: 'text-pink-700 border-t-pink-600',
    sky: 'text-sky-800 border-t-sky-600',
    amber: 'text-amber-700 border-t-amber-400',
    rose: 'text-rose-700 border-t-rose-700',
  };
  const cls = cores[destaque] || cores.slate;
  const [corTexto, corBorda] = cls.split(' ');
  return (
    <div className={`bg-white border border-slate-300 border-t-4 ${corBorda} p-4 shadow-xs`}>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className={`text-xl sm:text-2xl font-extrabold leading-tight ${corTexto}`}>{value}</p>
      {sub && <p className="text-xs font-medium text-slate-600 mt-1 leading-snug">{sub}</p>}
    </div>
  );
};

const Bloco = ({ title, subtitle, right, children, className = '' }) => (
  <div className={`border border-slate-300 bg-white flex flex-col shadow-xs ${className}`}>
    <div className="bg-amber-100/90 border-b border-slate-300 px-3.5 py-2 flex flex-wrap justify-between items-center gap-2">
      <div>
        <h3 className="font-bold text-xs sm:text-sm uppercase text-slate-900">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-600">{subtitle}</p>}
      </div>
      {right}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

const DeltaVotos = ({ v, pct }) => {
  if (v === null || v === undefined) return <span className="text-slate-400">—</span>;
  const cor = v > 0 ? 'text-sky-700' : v < 0 ? 'text-rose-700' : 'text-slate-500';
  return (
    <span className={`font-bold ${cor}`}>
      {fmtSigned(v)}
      {pct !== undefined && pct !== null && Number.isFinite(pct) ? (
        <span className="font-medium text-[11px]"> ({fmtSignedPct(pct)})</span>
      ) : null}
    </span>
  );
};

const BadgeAgenda = ({ resultado }) => {
  const r = RESULTADOS_AGENDAS[resultado];
  if (!r) return <span className="text-slate-400">—</span>;
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap ${r.badge}`}
      title={r.desc}
    >
      {r.label}
    </span>
  );
};

function TabelaSimples({ columns, rows, initialSort, onRowClick, pageSize = 80, empty = 'Nenhum registro neste filtro.' }) {
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

  if (!rows.length) return <p className="p-5 text-xs text-slate-500 text-center uppercase">{empty}</p>;
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
                  className={`py-2 px-2.5 text-[11px] font-bold uppercase text-slate-700 cursor-pointer hover:bg-amber-200/70 select-none border-b border-slate-300 whitespace-nowrap ${al(c.align)}`}
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
                className={onRowClick ? 'hover:bg-pink-50/50 cursor-pointer transition-colors' : ''}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`py-2 px-2.5 text-xs text-slate-800 ${al(c.align)} ${c.nowrap === false ? '' : 'whitespace-nowrap'}`}
                  >
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > limit && (
        <div className="p-2.5 text-center border-t border-slate-200 print:hidden">
          <button
            onClick={() => setLimit((l) => l + pageSize)}
            className="px-4 py-1.5 text-xs font-bold border border-slate-300 bg-white hover:bg-amber-100"
          >
            Ver mais ({sorted.length - limit} restantes)
          </button>
        </div>
      )}
    </div>
  );
}

function BarrasAnuais({ itens, cor = 'bg-pink-600' }) {
  if (!itens || !itens.length) return <p className="p-4 text-xs text-slate-400">Sem agendas neste período.</p>;
  const max = Math.max(1, ...itens.map((i) => i.valor || 0));
  return (
    <div className="flex items-end justify-around gap-2 px-3 pt-7 pb-3 overflow-x-auto" style={{ height: 185 }}>
      {itens.map((i) => (
        <div key={i.label} className="flex flex-col items-center flex-1 min-w-[38px]">
          <div className="flex flex-col justify-end items-center w-full max-w-[42px]" style={{ height: 125 }}>
            <span className="text-[11px] font-bold text-slate-800 mb-0.5 whitespace-nowrap">{fmtInt(i.valor)}</span>
            <div
              className={`w-full ${cor} border border-slate-700/20`}
              style={{ height: `${Math.max(((i.valor || 0) / max) * 100, i.valor ? 4 : 0)}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-700 mt-1.5">{i.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ----------- barra de atalhos de conversão (Emendas + Agendas + Leads) ---- */
export function BarraAtalhosConversao({ dados, filtros, setFiltros }) {
  const [infoAberto, setInfoAberto] = useState(false);
  if (!dados || !dados.elBase || !dados.elComp) return null;

  const toggleEmenda = (k) => {
    const atual = filtros.resEmenda || [];
    setFiltros({ resEmenda: atual.includes(k) ? atual.filter((x) => x !== k) : [...atual, k] });
  };

  const toggleAgenda = (k) => {
    const atual = filtros.resAgenda || [];
    setFiltros({ resAgenda: atual.includes(k) ? atual.filter((x) => x !== k) : [...atual, k] });
  };

  const toggleLeads = (k) => {
    const atual = filtros.resLeads || [];
    setFiltros({ resLeads: atual.includes(k) ? atual.filter((x) => x !== k) : [...atual, k] });
  };

  const temAtalho =
    (filtros.resEmenda && filtros.resEmenda.length > 0) ||
    (filtros.resAgenda && filtros.resAgenda.length > 0) ||
    (filtros.resLeads && filtros.resLeads.length > 0) ||
    Boolean(filtros.quadrante4);

  return (
    <div className="border-t border-slate-200 bg-slate-50/95 print:hidden">
      <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-2 space-y-1.5">
        {/* Linha 1: Conversão das Emendas */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-extrabold uppercase text-sky-900 mr-1 min-w-[118px]">
            Emendas ({dados.elBase.ano}→{dados.elComp.ano}):
          </span>
          {Object.entries(RESULTADOS_EMENDAS).map(([k, r]) => {
            const ativo = (filtros.resEmenda || []).includes(k);
            return (
              <button
                key={k}
                onClick={() => toggleEmenda(k)}
                title={r.desc}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-xs transition-colors ${
                  ativo ? '' : 'bg-white border-slate-300 text-slate-800 hover:bg-amber-50'
                }`}
                style={ativo ? { background: r.cor, borderColor: r.cor, color: corTextoSobre(r.cor) } : undefined}
              >
                {!ativo && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.cor }} />}
                <span>{r.label}</span>
                <span className={`text-[11px] font-extrabold ${ativo ? 'opacity-90' : 'text-slate-500'}`}>
                  {dados.contagemEmendas[k] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Linha 2: Conversão das Agendas + atalho Emenda sem visita */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-extrabold uppercase text-pink-700 mr-1 min-w-[118px]">
              Agendas ({dados.elBase.ano}→{dados.elComp.ano}):
            </span>
            {Object.entries(RESULTADOS_AGENDAS).map(([k, r]) => {
              const ativo = (filtros.resAgenda || []).includes(k);
              return (
                <button
                  key={k}
                  onClick={() => toggleAgenda(k)}
                  title={r.desc}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-xs transition-colors ${
                    ativo ? '' : 'bg-white border-slate-300 text-slate-800 hover:bg-pink-50'
                  }`}
                  style={ativo ? { background: r.cor, borderColor: r.cor, color: corTextoSobre(r.cor) } : undefined}
                >
                  {!ativo && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.cor }} />}
                  <span>{r.label}</span>
                  <span className={`text-[11px] font-extrabold ${ativo ? 'opacity-90' : 'text-slate-500'}`}>
                    {dados.contagemAgendas[k] || 0}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setFiltros({ quadrante4: filtros.quadrante4 === 'Q2' ? '' : 'Q2' })}
              title="Municípios que receberam emendas, mas ainda não tiveram nenhuma visita no período"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border rounded-xs transition-colors ${
                filtros.quadrante4 === 'Q2'
                  ? 'bg-amber-400 border-slate-900 text-slate-900'
                  : 'bg-amber-50 border-amber-400 text-amber-950 hover:bg-amber-100'
              }`}
            >
              <span>Emenda sem visita</span>
              <span className="text-[11px] font-extrabold">{dados.contagemQuadrantes.Q2 || 0}</span>
            </button>
          </div>

          {!dados.temBaseLeads && (
            <div className="flex items-center gap-3 relative">
              {temAtalho && (
                <button
                  onClick={() => setFiltros({ resEmenda: [], resAgenda: [], resLeads: [], quadrante4: '' })}
                  className="text-xs font-bold text-rose-700 hover:underline"
                >
                  Limpar atalhos
                </button>
              )}
              <button
                onClick={() => setInfoAberto((v) => !v)}
                className="text-xs font-semibold text-sky-800 hover:underline whitespace-nowrap"
              >
                Como funciona?
              </button>
            </div>
          )}
        </div>

        {/* Linha 3: Conversão dos Leads + Limpar / Como funciona */}
        {dados.temBaseLeads && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-extrabold uppercase text-sky-700 mr-1 min-w-[118px]">
                Leads ({dados.elBase.ano}→{dados.elComp.ano}):
              </span>
              {Object.entries(RESULTADOS_LEADS).map(([k, r]) => {
                const ativo = (filtros.resLeads || []).includes(k);
                return (
                  <button
                    key={k}
                    onClick={() => toggleLeads(k)}
                    title={r.desc}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-xs transition-colors ${
                      ativo ? '' : 'bg-white border-slate-300 text-slate-800 hover:bg-sky-50'
                    }`}
                    style={ativo ? { background: r.cor, borderColor: r.cor, color: corTextoSobre(r.cor) } : undefined}
                  >
                    {!ativo && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.cor }} />}
                    <span>{r.label}</span>
                    <span className={`text-[11px] font-extrabold ${ativo ? 'opacity-90' : 'text-slate-500'}`}>
                      {(dados.contagemLeads && dados.contagemLeads[k]) || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 relative">
              {temAtalho && (
                <button
                  onClick={() => setFiltros({ resEmenda: [], resAgenda: [], resLeads: [], quadrante4: '' })}
                  className="text-xs font-bold text-rose-700 hover:underline"
                >
                  Limpar atalhos
                </button>
              )}
              <button
                onClick={() => setInfoAberto((v) => !v)}
                className="text-xs font-semibold text-sky-800 hover:underline whitespace-nowrap"
              >
                Como funciona?
              </button>

              {infoAberto && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setInfoAberto(false)} />
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-[min(92vw,440px)] bg-white border-2 border-slate-800 shadow-lg p-3.5 text-xs text-slate-700 space-y-2">
                    <p className="font-bold text-slate-900 uppercase">Como medimos se a atuação converteu em votos</p>
                    <p>
                      Comparamos os votos de cada cidade entre <strong>{dados.elBase.label}</strong> e{' '}
                      <strong>{dados.elComp.label}</strong>. No estado inteiro, os votos variaram{' '}
                      <strong>{dados.crescEstado === null ? '—' : fmtSignedPct(dados.crescEstado)}</strong>.
                    </p>
                    <p>
                      Uma cidade aparece como <strong>Converteu</strong>, <strong>Visitado e cresceu</strong> ou{' '}
                      <strong>Com leads e cresceu</strong> quando teve atuação/base local e cresceu{' '}
                      {filtros.criterio === 'qualquer' ? 'qualquer quantidade de votos' : 'mais do que essa média do estado'}.
                    </p>
                    <p className="text-slate-500">
                      Use esses botões para guiar visitas, captação de leads e reuniões: votos dependem de vários fatores além de emendas, agendas e leads.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------- legenda da Matriz Bivariada 3x3 -------------------- */
function Legenda3x3({ modoInfo, metaX, faixasY, faixasX, contagemCelulas, celulaAtiva, onSelectCelula }) {
  const [guiaAberto, setGuiaAberto] = useState(false);

  return (
    <div className="bg-white border border-slate-300 p-3.5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase text-slate-900">Matriz 3 × 3 (Cores Primárias)</p>
          <p className="text-xs text-slate-600">Toque em qualquer quadrado para filtrar o mapa</p>
        </div>
        <button
          onClick={() => setGuiaAberto((v) => !v)}
          className="text-xs font-bold text-sky-700 underline hover:text-pink-600 whitespace-nowrap"
        >
          {guiaAberto ? 'Fechar guia' : 'O que cada cor diz?'}
        </button>
      </div>

      {/* Quadrado 3x3: Rosa choque (topo direito), Amarelo (meios), Azul claro (base esquerda) */}
      <div className="flex items-center justify-center gap-3 py-1">
        <div className="flex flex-col items-end justify-between h-[146px] text-[11px] font-bold text-slate-700 select-none w-20 text-right">
          <span>+ {modoInfo.labelY}</span>
          <span className="h-8 w-px bg-slate-400 mr-2" />
          <span>− {modoInfo.labelY}</span>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-1.5 w-[156px]">
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
                    title={`${c.titulo} (${qtd} cidades)\n${c.desc}`}
                    className={`w-[48px] h-[46px] border flex flex-col items-center justify-center transition-all ${
                      ativo ? 'border-slate-950 ring-2 ring-slate-900 scale-105 z-10' : 'border-slate-500/60 hover:scale-105'
                    }`}
                    style={{ background: c.cor, color: c.texto, opacity: apagado ? 0.35 : 1 }}
                  >
                    <span className="text-sm font-extrabold leading-none">{qtd}</span>
                  </button>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mt-1.5 select-none">
            <span>− {metaX.curto}</span>
            <span>→</span>
            <span>+ {metaX.curto}</span>
          </div>
        </div>
      </div>

      {celulaAtiva && (
        <div className="p-2 bg-slate-50 border border-slate-300 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-3.5 h-3.5 border border-slate-500 flex-shrink-0" style={{ background: MATRIZ_3X3[celulaAtiva].cor }} />
            <span className="font-bold text-slate-900 truncate">{MATRIZ_3X3[celulaAtiva].titulo}</span>
          </div>
          <button onClick={() => onSelectCelula('')} className="text-xs font-bold text-rose-700 hover:underline flex-shrink-0">
            Mostrar todas
          </button>
        </div>
      )}

      {/* Explicação simples das faixas */}
      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
        <p>
          <strong>{modoInfo.tituloY}:</strong> Baixo ({faixasY.labels[0]}) • Médio ({faixasY.labels[1]}) • Alto ({faixasY.labels[2]})
        </p>
        <p>
          <strong>{metaX.label}:</strong> Baixo ({faixasX.labels[0]}) • Médio ({faixasX.labels[1]}) • Alto ({faixasX.labels[2]})
        </p>
      </div>

      {guiaAberto && (
        <div className="pt-2 border-t border-slate-300 space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {['2_2', '2_1', '2_0', '1_2', '1_1', '1_0', '0_2', '0_1', '0_0'].map((id) => {
            const c = MATRIZ_3X3[id];
            return (
              <button
                key={id}
                onClick={() => onSelectCelula(celulaAtiva === id ? '' : id)}
                className={`w-full text-left flex items-start gap-2 p-2 border text-xs ${
                  celulaAtiva === id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-4 h-4 border border-slate-500 flex-shrink-0 mt-0.5" style={{ background: c.cor }} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">
                    {c.titulo} <span className="font-normal text-slate-500">({contagemCelulas[id] || 0} cidades)</span>
                  </p>
                  <p className="text-[11px] text-slate-600 leading-snug">{c.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* --------------------- mapa único de Santa Catarina ----------------------- */
function MapaUnicoSC({ dados, mapGeoJson, modoMapa, celulaAtiva, onOpenMunicipio }) {
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

  const porNorm = useMemo(() => new Map(dados.cidadesFiltradas.map((r) => [r.norm, r])), [dados.cidadesFiltradas]);

  if (!geo) {
    return <div className="p-10 text-center text-sm text-slate-500">Carregando mapa de Santa Catarina...</div>;
  }

  const obterCor = (r) => {
    if (!r) return { fill: '#e2e8f0', opacity: 0.45, stroke: '#94a3b8', sw: 0.55 };

    if (modoMapa === 'conv_emendas') {
      const c = RESULTADOS_EMENDAS[r.resEmenda];
      return { fill: c ? c.cor : '#ffffff', opacity: 1, stroke: '#334155', sw: 0.65 };
    }
    if (modoMapa === 'conv_agendas') {
      const c = RESULTADOS_AGENDAS[r.resAgenda];
      return { fill: c ? c.cor : '#ffffff', opacity: 1, stroke: '#334155', sw: 0.65 };
    }
    if (modoMapa === 'conv_leads') {
      const c = RESULTADOS_LEADS[r.resLeads];
      return { fill: c ? c.cor : '#ffffff', opacity: 1, stroke: '#334155', sw: 0.65 };
    }
    if (modoMapa === 'quad_presenca') {
      const c = QUADRANTES_4[r.quad4];
      return { fill: c ? c.cor : '#ffffff', opacity: 1, stroke: '#334155', sw: 0.65 };
    }

    const cel = MATRIZ_3X3[r.celId];
    const fill = cel ? cel.cor : '#ffffff';
    if (celulaAtiva && r.celId !== celulaAtiva) {
      return { fill: '#f1f5f9', opacity: 0.38, stroke: '#cbd5e1', sw: 0.5 };
    }
    if (celulaAtiva && r.celId === celulaAtiva) {
      return { fill, opacity: 1, stroke: '#0f172a', sw: 1.2 };
    }
    return { fill, opacity: 1, stroke: '#334155', sw: 0.65 };
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${geo.w} ${geo.h}`} className="w-full h-auto select-none" onClick={() => setHover(null)}>
        {geo.feats.map((f, i) => {
          const r = porNorm.get(f.n);
          const st = obterCor(r);
          return (
            <path
              key={i}
              d={f.d}
              fill={st.fill}
              fillOpacity={st.opacity}
              stroke={st.stroke}
              strokeWidth={st.sw}
              className="hover:stroke-[2.2px] hover:stroke-slate-950 cursor-pointer transition-colors"
              onMouseEnter={(e) => setHover({ r, nomeGeo: f.nome, x: e.clientX, y: e.clientY })}
              onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
              onMouseLeave={() => setHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                onOpenMunicipio(r ? r.nome : tituloMunicipio(f.nome));
              }}
            />
          );
        })}
      </svg>

      {hover && (
        <div
          className="fixed z-50 bg-white border-2 border-slate-900 shadow-lg p-3 text-xs pointer-events-none"
          style={{
            left: Math.min(hover.x + 16, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 285),
            top: Math.max(12, hover.y - 12),
            width: 270,
          }}
        >
          <p className="font-extrabold text-slate-900 uppercase text-sm leading-tight">
            {hover.r ? hover.r.nome : tituloMunicipio(hover.nomeGeo)}
          </p>
          {hover.r ? (
            <>
              {hover.r.regiao && <p className="text-[11px] text-slate-500 mb-1.5">{hover.r.regiao}</p>}
              <div className="space-y-1 border-t border-slate-200 pt-1.5 text-slate-800">
                <p>
                  <strong>Votos:</strong> {fmtInt(hover.r.vComp)}{' '}
                  <span className="text-slate-500">(antes: {fmtInt(hover.r.vBase)})</span>
                </p>
                <p>
                  <strong>Variação:</strong> <DeltaVotos v={hover.r.delta} pct={hover.r.deltaPct} />
                </p>
                <p>
                  <strong>Agendas:</strong> {fmtInt(hover.r.agendas)} ({fmtHoras(hover.r.horas)})
                </p>
                <p>
                  <strong>Emendas:</strong> {fmtInt(hover.r.emendasQtd)} • {fmtBRLCompact(hover.r.emendas)}
                </p>
                {dados.temBaseLeads && (
                  <p>
                    <strong>Leads:</strong> {fmtInt(hover.r.leads)}
                    {hover.r.leadsTopTema ? (
                      <span className="text-[11px] text-slate-500"> ({hover.r.leadsTopTema.split(' - ').pop()})</span>
                    ) : null}
                  </p>
                )}
                {hover.r.articuladores && (
                  <p className="text-[11px] text-rose-700 truncate">
                    <strong>Articulação:</strong> {hover.r.articuladores}
                  </p>
                )}
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                {dados.modoInfo.tipo === 'matriz' ? (
                  <span
                    className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase border border-slate-400"
                    style={{ background: MATRIZ_3X3[hover.r.celId].cor, color: MATRIZ_3X3[hover.r.celId].texto }}
                  >
                    {MATRIZ_3X3[hover.r.celId].titulo}
                  </span>
                ) : modoMapa === 'conv_emendas' ? (
                  <BadgeRes resultado={hover.r.resEmenda} />
                ) : modoMapa === 'conv_agendas' ? (
                  <BadgeAgenda resultado={hover.r.resAgenda} />
                ) : modoMapa === 'conv_leads' ? (
                  <BadgeLeads resultado={hover.r.resLeads} />
                ) : (
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${QUADRANTES_4[hover.r.quad4].badge}`}>
                    {QUADRANTES_4[hover.r.quad4].label}
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="text-slate-500 mt-1">Fora dos filtros ativos neste momento.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   TELA 1: INÍCIO UNIFICADO (RESUMO, LEITURA NATURAL, MAPA ÚNICO, EQUIPE)
   ========================================================================== */
export function InicioDashboard({
  dados, filtros, setFiltros,
  modoMapa, setModoMapa, metricaX, setMetricaX,
  mapGeoJson, openEntityFicha, irParaTela,
  recarregarTudo, atualizando,
}) {
  const [celulaAtiva, setCelulaAtiva] = useState('');
  const mapaRef = useRef(null);

  useEffect(() => {
    setCelulaAtiva('');
  }, [modoMapa, metricaX]);

  if (!dados) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-white border border-slate-300 p-8">
          <p className="text-sm font-bold uppercase text-slate-700">Carregando dados do mandato...</p>
        </div>
      </div>
    );
  }

  const R = dados.resumoGeral;
  const I = dados.insights;
  const anoBase = dados.elBase ? dados.elBase.ano : '';
  const anoComp = dados.elComp ? dados.elComp.ano : '';
  const abrirMunicipio = (nome) => openEntityFicha('municipio', nome);

  const badgeRelacao = (info) => {
    const estilos = {
      pink: 'bg-pink-600 text-white',
      sky: 'bg-sky-700 text-white',
      amber: 'bg-amber-300 text-slate-900',
      slate: 'bg-slate-200 text-slate-700',
    };
    return (
      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${estilos[info.tom] || estilos.slate}`}>
        {info.nivel}
      </span>
    );
  };

  const cidadesCelula = celulaAtiva
    ? dados.cidadesFiltradas.filter((r) => r.celId === celulaAtiva)
    : [];

  const listaAcao = (titulo, subtitulo, itens, renderDir) => (
    <Bloco title={titulo} subtitle={subtitulo}>
      {itens.length === 0 ? (
        <p className="p-4 text-xs text-slate-500">Nenhuma cidade nesta condição com os filtros atuais.</p>
      ) : (
        <table className="w-full text-xs">
          <tbody className="divide-y divide-slate-100">
            {itens.map((r) => (
              <tr
                key={r.norm}
                onClick={() => abrirMunicipio(r.nome)}
                className="hover:bg-pink-50/50 cursor-pointer transition-colors"
              >
                <td className="py-2 px-3">
                  <span className="font-bold text-sky-800 hover:underline block">{r.nome}</span>
                  {r.regiao && <span className="text-[10px] text-slate-500 uppercase">{r.regiao}</span>}
                </td>
                <td className="py-2 px-3 text-right whitespace-nowrap text-slate-800">
                  {renderDir(r)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Bloco>
  );

  // Legenda alternativa quando o mapa não está no modo 3×3
  const renderLegendaLateral = () => {
    if (dados.modoInfo.tipo === 'matriz') {
      return (
        <Legenda3x3
          modoInfo={dados.modoInfo}
          metaX={dados.metaX}
          faixasY={dados.faixasY}
          faixasX={dados.faixasX}
          contagemCelulas={dados.contagemCelulas}
          celulaAtiva={celulaAtiva}
          onSelectCelula={setCelulaAtiva}
        />
      );
    }

    const itens =
      modoMapa === 'conv_emendas'
        ? Object.entries(RESULTADOS_EMENDAS).map(([k, r]) => ({
            k, label: r.label, desc: r.desc, cor: r.cor, qtd: dados.contagemEmendas[k] || 0,
            ativo: (filtros.resEmenda || []).includes(k),
            onClick: () => {
              const atual = filtros.resEmenda || [];
              setFiltros({ resEmenda: atual.includes(k) ? atual.filter((x) => x !== k) : [...atual, k] });
            },
          }))
        : modoMapa === 'conv_agendas'
        ? Object.entries(RESULTADOS_AGENDAS).map(([k, r]) => ({
            k, label: r.label, desc: r.desc, cor: r.cor, qtd: dados.contagemAgendas[k] || 0,
            ativo: (filtros.resAgenda || []).includes(k),
            onClick: () => {
              const atual = filtros.resAgenda || [];
              setFiltros({ resAgenda: atual.includes(k) ? atual.filter((x) => x !== k) : [...atual, k] });
            },
          }))
        : modoMapa === 'conv_leads'
        ? Object.entries(RESULTADOS_LEADS).map(([k, r]) => ({
            k, label: r.label, desc: r.desc, cor: r.cor, qtd: (dados.contagemLeads && dados.contagemLeads[k]) || 0,
            ativo: (filtros.resLeads || []).includes(k),
            onClick: () => {
              const atual = filtros.resLeads || [];
              setFiltros({ resLeads: atual.includes(k) ? atual.filter((x) => x !== k) : [...atual, k] });
            },
          }))
        : Object.entries(QUADRANTES_4).map(([k, r]) => ({
            k, label: r.label, desc: r.desc, cor: r.cor, qtd: dados.contagemQuadrantes[k] || 0,
            ativo: filtros.quadrante4 === k,
            onClick: () => setFiltros({ quadrante4: filtros.quadrante4 === k ? '' : k }),
          }));

    return (
      <div className="bg-white border border-slate-300 p-3.5 space-y-2">
        <p className="text-xs font-extrabold uppercase text-slate-900">Legenda ({dados.modoInfo.label})</p>
        <p className="text-xs text-slate-600 mb-2">Clique em qualquer item para filtrar o mapa e as tabelas</p>
        <div className="space-y-1.5">
          {itens.map((it) => (
            <button
              key={it.k}
              onClick={it.onClick}
              className={`w-full text-left flex items-start gap-2.5 p-2 border transition-colors ${
                it.ativo ? 'border-slate-900 bg-amber-50/70' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="w-4 h-4 border border-slate-500 flex-shrink-0 mt-0.5" style={{ background: it.cor }} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-xs font-bold text-slate-900">{it.label}</span>
                  <span className="text-xs font-extrabold text-slate-700">{it.qtd}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{it.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4 space-y-5">
      {/* Cabeçalho da Página Inicial */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold uppercase text-slate-900 tracking-tight">
            Painel Estratégico do Mandato
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Visão unificada de <strong>Votos</strong>, <strong>Emendas</strong>, <strong>Presença de Agenda</strong>
            {dados.temBaseLeads ? <> e <strong>Leads</strong></> : null} em{' '}
            <strong>{fmtInt(R.cidades)} municípios</strong>
            {filtros.excluirFloripa ? ' (somente interior de SC)' : ' de Santa Catarina'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-xs font-bold text-pink-800 cursor-pointer hover:bg-pink-50">
            <input
              type="checkbox"
              checked={filtros.excluirFloripa}
              onChange={(e) => setFiltros({ excluirFloripa: e.target.checked })}
            />
            Ver só o interior (ocultar Florianópolis)
          </label>
          <button
            onClick={recarregarTudo}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-amber-100"
          >
            {atualizando ? 'Atualizando...' : 'Atualizar dados'}
          </button>
        </div>
      </div>

      {/* 1. Cartões de Resumo Principal */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${dados.temBaseLeads ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3.5`}>
        <CartaoKpi
          label={`Votos ${dados.elComp ? dados.elComp.label : ''}`}
          value={fmtInt(R.votosComp)}
          destaque="sky"
          sub={
            anoBase
              ? `${fmtSigned(R.deltaVotos)} (${fmtSignedPct(R.deltaPct)}) em relação a ${anoBase}`
              : 'Resultado mais recente'
          }
        />
        <CartaoKpi
          label="Emendas Destinadas"
          value={fmtBRLCompact(R.emendasVal)}
          destaque="rose"
          sub={`${fmtInt(R.emendasQtd)} emendas em ${fmtInt(R.comEmenda)} cidades • Pago: ${fmtBRLCompact(R.emendasPago)}`}
        />
        <CartaoKpi
          label="Presença de Agenda"
          value={`${fmtInt(R.agendasQtd)} agendas`}
          destaque="pink"
          sub={`${fmtInt(R.visitados)} cidades visitadas • ${fmtHoras(R.horas)} acumuladas`}
        />
        {dados.temBaseLeads && (
          <CartaoKpi
            label="Base de Leads (SC)"
            value={`${fmtInt(R.leadsTotal)} leads`}
            destaque="sky"
            sub={`${fmtInt(R.comLeads)} cidades • cobrem ${fmtPct(R.coberturaVotosLeads, 0)} dos votos`}
          />
        )}
        <CartaoKpi
          label="Sinergia no Território"
          value={`${fmtInt(R.comAmbos)} cidades`}
          destaque="amber"
          sub={`com visita e emenda • ${fmtInt(R.emendaSemVisita)} receberam emenda mas sem visita`}
        />
      </div>

      {/* 2. Mapa Único + Matriz 3×3 + Leitura em Linguagem Natural */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Bloco
          className="lg:col-span-8"
          title="Mapa Único de Santa Catarina"
          subtitle="Clique em qualquer cidade para abrir a Ficha Completa com votos, visitas, emendas e leads"
          right={
            <button
              onClick={() => baixarSvgPng(mapaRef.current, `tabulum_mapa_${modoMapa}.png`)}
              className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-400 hover:bg-amber-200 print:hidden"
            >
              Baixar imagem (PNG)
            </button>
          }
        >
          {/* Botões para trocar a leitura do Mapa Único */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/80 space-y-2 print:hidden">
            <div className="flex flex-wrap gap-1.5">
              {MODOS_MAPA.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setModoMapa(m.key)}
                  className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
                    modoMapa === m.key
                      ? 'bg-pink-600 text-white border-pink-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {dados.modoInfo.tipo === 'matriz' && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-700">
                <span className="font-bold uppercase text-[11px] text-slate-600">Comparar no eixo horizontal com:</span>
                {METRICAS_ELEITORAIS.map((mx) => (
                  <button
                    key={mx.key}
                    onClick={() => setMetricaX(mx.key)}
                    className={`px-2.5 py-0.5 text-xs font-semibold border ${
                      metricaX === mx.key
                        ? 'bg-sky-700 text-white border-sky-800'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {mx.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3" ref={mapaRef}>
            <MapaUnicoSC
              dados={dados}
              mapGeoJson={mapGeoJson}
              modoMapa={modoMapa}
              celulaAtiva={celulaAtiva}
              onOpenMunicipio={abrirMunicipio}
            />
          </div>
        </Bloco>

        {/* Coluna direita: Legenda 3x3 + Leitura em Linguagem Natural */}
        <div className="lg:col-span-4 space-y-4">
          {renderLegendaLateral()}

          <Bloco title="O que os dados mostram" subtitle="Resumo em linguagem direta para a estratégia">
            <div className="p-3.5 space-y-3 text-xs text-slate-800">
              {/* Comparação prática 1: Presença */}
              <div className="p-2.5 bg-pink-50/70 border-l-4 border-pink-600 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold uppercase text-[11px] text-pink-900">Efeito das Visitas</span>
                  {badgeRelacao(I.presenca)}
                </div>
                <p className="leading-snug">
                  Cidades visitadas tiveram crescimento típico de{' '}
                  <strong>{fmtSignedPct(I.crescTipicoVisitados)}</strong> nos votos, contra{' '}
                  <strong>{fmtSignedPct(I.crescTipicoNaoVisitados)}</strong> nas não visitadas.
                </p>
                {I.taxaCresceramVisitados !== null && (
                  <p className="text-[11px] text-slate-600">
                    {fmtPct(I.taxaCresceramVisitados, 0)} das cidades visitadas aumentaram a votação.
                  </p>
                )}
              </div>

              {/* Comparação prática 2: Emendas */}
              <div className="p-2.5 bg-sky-50/70 border-l-4 border-sky-600 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold uppercase text-[11px] text-sky-900">Efeito das Emendas</span>
                  {badgeRelacao(I.emendas)}
                </div>
                <p className="leading-snug">
                  Cidades com emendas cresceram <strong>{fmtSignedPct(I.crescTipicoComEmenda)}</strong>, contra{' '}
                  <strong>{fmtSignedPct(I.crescTipicoSemEmenda)}</strong> nas sem emendas.
                </p>
                {I.taxaCresceramEmendas !== null && (
                  <p className="text-[11px] text-slate-600">
                    {fmtPct(I.taxaCresceramEmendas, 0)} das cidades com emendas cresceram em votos.
                  </p>
                )}
              </div>

              {/* Comparação prática 3: Leads */}
              {dados.temBaseLeads && I.leads && (
                <div className="p-2.5 bg-sky-50/50 border-l-4 border-sky-500 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold uppercase text-[11px] text-sky-950">Efeito dos Leads</span>
                    {badgeRelacao(I.leads)}
                  </div>
                  <p className="leading-snug">
                    Cidades com leads cadastrados cresceram <strong>{fmtSignedPct(I.crescTipicoComLeads)}</strong>, contra{' '}
                    <strong>{fmtSignedPct(I.crescTipicoSemLeads)}</strong> nas sem leads.
                  </p>
                  {I.taxaCresceramLeads !== null && (
                    <p className="text-[11px] text-slate-600">
                      {fmtPct(I.taxaCresceramLeads, 0)} das cidades com leads aumentaram a votação.
                    </p>
                  )}
                </div>
              )}

              {/* Comparação prática 4: Combinado */}
              <div className="p-2.5 bg-amber-50/80 border-l-4 border-amber-400 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold uppercase text-[11px] text-amber-950">Visita + Emenda Juntas</span>
                  {badgeRelacao(I.combinado)}
                </div>
                <p className="leading-snug">
                  Onde houve visita e emenda juntas, o crescimento típico foi de{' '}
                  <strong>{fmtSignedPct(I.crescTipicoAmbos)}</strong> (contra{' '}
                  <strong>{fmtSignedPct(I.crescTipicoNenhum)}</strong> onde não houve nenhuma das duas).
                </p>
              </div>

              {/* Nota técnica recolhida (auditoria estatística) */}
              <details className="pt-1 text-[11px] text-slate-500">
                <summary className="cursor-pointer font-semibold text-slate-600 hover:text-sky-800">
                  Ver nota técnica (cálculos estatísticos)
                </summary>
                <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                  <p>Base analisada: <strong>{I.notaTecnica.n} municípios</strong> (crescimentos típicos usam mediana para não distorcer com Florianópolis).</p>
                  <p>Correlação de Spearman (postos):</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Agendas × Votos {anoComp}: <strong>{I.notaTecnica.rhoAgVotos !== null ? I.notaTecnica.rhoAgVotos.toFixed(2).replace('.', ',') : '—'}</strong></li>
                    <li>Agendas × Variação de votos: <strong>{I.notaTecnica.rhoAgDelta !== null ? I.notaTecnica.rhoAgDelta.toFixed(2).replace('.', ',') : '—'}</strong></li>
                    <li>Emendas × Votos {anoComp}: <strong>{I.notaTecnica.rhoEmVotos !== null ? I.notaTecnica.rhoEmVotos.toFixed(2).replace('.', ',') : '—'}</strong></li>
                    <li>Emendas × Variação de votos: <strong>{I.notaTecnica.rhoEmDelta !== null ? I.notaTecnica.rhoEmDelta.toFixed(2).replace('.', ',') : '—'}</strong></li>
                    {dados.temBaseLeads && (
                      <>
                        <li>Leads × Votos {anoComp}: <strong>{I.notaTecnica.rhoLdVotos !== null ? I.notaTecnica.rhoLdVotos.toFixed(2).replace('.', ',') : '—'}</strong></li>
                        <li>Leads × Variação de votos: <strong>{I.notaTecnica.rhoLdDelta !== null ? I.notaTecnica.rhoLdDelta.toFixed(2).replace('.', ',') : '—'}</strong></li>
                      </>
                    )}
                    <li>Índice Combinado × Variação: <strong>{I.notaTecnica.rhoCombDelta !== null ? I.notaTecnica.rhoCombDelta.toFixed(2).replace('.', ',') : '—'}</strong></li>
                  </ul>
                </div>
              </details>
            </div>
          </Bloco>
        </div>
      </div>

      {/* Se o usuário clicou em um quadrado da Matriz 3×3, exibe imediatamente a lista dessas cidades */}
      {celulaAtiva && (
        <Bloco
          title={`Cidades selecionadas na Matriz: ${MATRIZ_3X3[celulaAtiva].titulo} (${cidadesCelula.length})`}
          subtitle={MATRIZ_3X3[celulaAtiva].desc}
          right={
            <button onClick={() => setCelulaAtiva('')} className="text-xs font-bold text-rose-700 hover:underline">
              Fechar seleção
            </button>
          }
        >
          <TabelaSimples
            rows={cidadesCelula}
            initialSort={{ key: 'vComp', dir: 'desc' }}
            onRowClick={(r) => abrirMunicipio(r.nome)}
            pageSize={40}
            columns={[
              { key: 'nome', label: 'Município', align: 'left', render: (r) => <strong className="text-sky-800">{r.nome}</strong> },
              { key: 'regiao', label: 'Região', align: 'left', render: (r) => r.regiao || '—' },
              { key: 'agendas', label: 'Agendas', align: 'right', render: (r) => (r.agendas ? <strong className="text-pink-700">{fmtInt(r.agendas)}</strong> : '0') },
              { key: 'emendas', label: 'Emendas', align: 'right', render: (r) => (r.emendas ? fmtBRLCompact(r.emendas) : '—') },
              ...(dados.temBaseLeads
                ? [{ key: 'leads', label: 'Leads', align: 'right', render: (r) => (r.leads ? <strong className="text-sky-700">{fmtInt(r.leads)}</strong> : '0') }]
                : []),
              { key: 'vBase', label: `Votos ${anoBase}`, align: 'right', render: (r) => fmtInt(r.vBase) },
              { key: 'vComp', label: `Votos ${anoComp}`, align: 'right', render: (r) => <strong>{fmtInt(r.vComp)}</strong> },
              { key: 'delta', label: 'Variação', align: 'right', render: (r) => <DeltaVotos v={r.delta} pct={r.deltaPct} /> },
              { key: 'articuladores', label: 'Articulação', align: 'left', render: (r) => r.articuladores || '—' },
            ]}
          />
        </Bloco>
      )}

      {/* 3. Listas de ação prática (Emendas, Agendas e Leads) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listaAcao(
          'Prioridade de visita: recebeu emenda, mas 0 agendas',
          'Cidades com recurso destinado onde vale agendar presença do mandato',
          dados.destaques.emendaSemVisita,
          (r) => (
            <div>
              <strong className="text-rose-700">{fmtBRLCompact(r.emendas)}</strong>
              <span className="block text-[11px] text-slate-600">{fmtInt(r.vComp)} votos</span>
            </div>
          )
        )}

        {listaAcao(
          'Base espontânea: muitos votos sem visita no período',
          'Cidades com boa votação onde o mandato ainda não esteve no recorte',
          dados.destaques.baseOrganica,
          (r) => (
            <div>
              <strong className="text-sky-800">{fmtInt(r.vComp)} votos</strong>
              <span className="block text-[11px]"><DeltaVotos v={r.delta} pct={r.deltaPct} /></span>
            </div>
          )
        )}

        {dados.temBaseLeads &&
          listaAcao(
            'Oportunidade de captação: votos sem nenhum lead cadastrado',
            'Cidades onde o mandato já tem voto, mas ainda não captou contatos na base',
            dados.destaques.votosSemLeads || [],
            (r) => (
              <div>
                <strong className="text-sky-800">{fmtInt(r.vComp)} votos</strong>
                <span className="block text-[11px]"><DeltaVotos v={r.delta} pct={r.deltaPct} /></span>
              </div>
            )
          )}

        {dados.temBaseLeads &&
          listaAcao(
            'Leads a ativar: têm contatos cadastrados, mas votos não subiram',
            'Cidades com base de leads onde vale acionar comunicação e mobilização local',
            dados.destaques.leadsSemCrescimento || [],
            (r) => (
              <div>
                <strong className="text-pink-700">{fmtInt(r.leads)} leads</strong>
                <span className="block text-[11px]"><DeltaVotos v={r.delta} pct={r.deltaPct} /></span>
              </div>
            )
          )}

        {listaAcao(
          'Onde o trabalho cresceu mais nas urnas',
          'Cidades com visita, emenda ou leads que tiveram maior ganho de votos',
          dados.destaques.maioresGanhos,
          (r) => (
            <div>
              <DeltaVotos v={r.delta} pct={r.deltaPct} />
              <span className="block text-[11px] text-slate-600">
                {r.agendas} ag. • {r.emendas ? fmtBRLCompact(r.emendas) : 'sem emenda'}
                {dados.temBaseLeads && r.leads ? ` • ${fmtInt(r.leads)} leads` : ''}
              </span>
            </div>
          )
        )}

        {listaAcao(
          'Pontos de atenção: teve atuação, mas votos não subiram',
          'Cidades com emenda ou visita onde os votos ficaram estáveis ou caíram',
          dados.destaques.atencaoQueda,
          (r) => (
            <div>
              <DeltaVotos v={r.delta} pct={r.deltaPct} />
              <span className="block text-[11px] text-slate-600">
                {r.agendas} ag. • {r.emendas ? fmtBRLCompact(r.emendas) : 'sem emenda'}
              </span>
            </div>
          )
        )}
      </div>

      {/* 4. Presença da Equipe (Articuladores) */}
      <Bloco
        title={`Atuação da Equipe de Articuladores (${dados.resumoArticuladores.length})`}
        subtitle="Soma as agendas acompanhadas e as emendas articuladas com o desempenho eleitoral nas cidades de cada articulador. Clique no nome para abrir a Ficha."
      >
        <TabelaSimples
          rows={dados.resumoArticuladores}
          initialSort={{ key: 'agendas', dir: 'desc' }}
          onRowClick={(a) => openEntityFicha('articulador', a.nome)}
          pageSize={25}
          columns={[
            { key: 'nome', label: 'Articulador', align: 'left', render: (a) => <strong className="text-rose-700 hover:underline">{a.nome}</strong> },
            { key: 'municipios', label: 'Cidades', align: 'center', render: (a) => fmtInt(a.municipios) },
            { key: 'agendas', label: 'Agendas', align: 'right', render: (a) => <strong className="text-pink-700">{fmtInt(a.agendas)}</strong> },
            { key: 'horas', label: 'Horas', align: 'right', render: (a) => fmtHoras(a.horas) },
            { key: 'emendasQtd', label: 'Emendas', align: 'center', render: (a) => a.emendasQtd || '—' },
            { key: 'emendas', label: 'Valor Destinado', align: 'right', render: (a) => (a.emendas ? fmtBRLCompact(a.emendas) : '—') },
            ...(dados.temBaseLeads
              ? [{ key: 'leads', label: 'Leads nas cidades', align: 'right', render: (a) => (a.leads ? <strong className="text-sky-700">{fmtInt(a.leads)}</strong> : '—') }]
              : []),
            { key: 'vComp', label: `Votos ${anoComp} nas cidades`, align: 'right', render: (a) => <strong>{fmtInt(a.vComp)}</strong> },
            { key: 'delta', label: 'Variação nas cidades', align: 'right', render: (a) => <DeltaVotos v={a.delta} pct={a.deltaPct} /> },
            { key: 'cresceram', label: 'Cidades que cresceram', align: 'center', render: (a) => `${a.cresceram} de ${a.municipios}` },
          ]}
        />
      </Bloco>

      {/* 5. Resumo por Região + Evolução Anual das Agendas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Bloco
          className="lg:col-span-8"
          title="Resumo por Região de Santa Catarina"
          subtitle="Clique em uma região para abrir sua Ficha Completa"
          right={
            <button
              onClick={() => irParaTela('municipios')}
              className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-400 hover:bg-amber-200"
            >
              Ver tabela de todos os municípios →
            </button>
          }
        >
          <TabelaSimples
            rows={dados.resumoRegioes}
            initialSort={{ key: 'vComp', dir: 'desc' }}
            onRowClick={(g) => g.definida && openEntityFicha('regiao', g.nome)}
            pageSize={30}
            columns={[
              { key: 'nome', label: 'Região', align: 'left', render: (g) => <strong className={g.definida ? 'text-sky-800 hover:underline' : 'text-slate-400 italic'}>{g.nome}</strong> },
              { key: 'munis', label: 'Cidades', align: 'center' },
              { key: 'visitados', label: 'Visitadas', align: 'center' },
              { key: 'agendas', label: 'Agendas', align: 'right', render: (g) => <strong className="text-pink-700">{fmtInt(g.agendas)}</strong> },
              { key: 'emendas', label: 'Emendas', align: 'right', render: (g) => (g.emendas ? fmtBRLCompact(g.emendas) : '—') },
              ...(dados.temBaseLeads
                ? [{ key: 'leads', label: 'Leads', align: 'right', render: (g) => (g.leads ? <strong className="text-sky-700">{fmtInt(g.leads)}</strong> : '—') }]
                : []),
              { key: 'vComp', label: `Votos ${anoComp}`, align: 'right', render: (g) => <strong>{fmtInt(g.vComp)}</strong> },
              { key: 'delta', label: 'Variação', align: 'right', render: (g) => <DeltaVotos v={g.delta} pct={g.deltaPct} /> },
              { key: 'share', label: '% dos votos', align: 'right', render: (g) => fmtPct(g.share) },
            ]}
          />
        </Bloco>

        <Bloco className="lg:col-span-4" title="Evolução das Agendas por Ano" subtitle="Total de agendas políticas no recorte">
          <BarrasAnuais itens={dados.evolucaoAgendas} cor="bg-pink-600" />
          <div className="px-3.5 py-2.5 border-t border-slate-200 bg-slate-50 flex flex-wrap justify-between gap-2 text-xs">
            <button onClick={() => irParaTela('emendas')} className="font-bold text-rose-700 hover:underline">
              Emendas ({fmtInt(dados.emendasFiltradas.length)}) →
            </button>
            <button onClick={() => irParaTela('agendas')} className="font-bold text-pink-700 hover:underline">
              Agendas ({fmtInt(dados.agendasFiltradas.length)}) →
            </button>
            {dados.temBaseLeads && (
              <button onClick={() => irParaTela('leads')} className="font-bold text-sky-700 hover:underline">
                Leads ({fmtInt(R.leadsTotal)}) →
              </button>
            )}
          </div>
        </Bloco>
      </div>
    </div>
  );
}

/* ==========================================================================
   TELA 2: MUNICÍPIOS (TABELA UNIFICADA: VOTOS + EMENDAS + AGENDAS + LEADS)
   ========================================================================== */
export function MunicipiosUnificadosView({ dados, eleitoral, openEntityFicha, exportRows }) {
  const [mostrarTodasEleicoes, setMostrarTodasEleicoes] = useState(false);

  if (!dados || !eleitoral) {
    return <div className="p-8 text-center text-sm text-slate-500">Carregando municípios...</div>;
  }

  const anoBase = dados.elBase ? dados.elBase.ano : '';
  const anoComp = dados.elComp ? dados.elComp.ano : '';
  const temAssoc = dados.cidadesFiltradas.some((r) => r.associacao);

  const colunas = [
    { key: 'nome', label: 'Município', align: 'left', render: (r) => <strong className="text-sky-800 hover:underline">{r.nome}</strong> },
    { key: 'regiao', label: 'Região', align: 'left', render: (r) => r.regiao || <span className="text-slate-300">—</span> },
  ];
  if (temAssoc) {
    colunas.push({
      key: 'associacao', label: 'Associação', align: 'left',
      render: (r) => (r.associacao ? r.associacao.split(' - ')[0] : <span className="text-slate-300">—</span>),
    });
  }

  if (mostrarTodasEleicoes) {
    eleitoral.eleicoes.forEach((el) => {
      colunas.push({
        key: `v_${el.key}`,
        label: `Votos ${el.ano}`,
        align: 'right',
        sortValue: (r) => (r.v[el.key] ? r.v[el.key].votos : null),
        render: (r) => (r.v[el.key] ? fmtInt(r.v[el.key].votos) : <span className="text-slate-300">—</span>),
      });
    });
  } else {
    colunas.push(
      { key: 'vBase', label: `Votos ${anoBase}`, align: 'right', render: (r) => fmtInt(r.vBase) },
      { key: 'vComp', label: `Votos ${anoComp}`, align: 'right', render: (r) => <strong>{fmtInt(r.vComp)}</strong> },
      { key: 'delta', label: 'Variação', align: 'right', render: (r) => <DeltaVotos v={r.delta} pct={r.deltaPct} /> },
      {
        key: 'evol', label: 'Evolução', align: 'left',
        sortValue: (r) => r.delta,
        render: (r) => <VotosEvolucao eleitoral={eleitoral} municipio={r.nome} />,
      }
    );
  }

  colunas.push(
    { key: 'agendas', label: 'Agendas', align: 'right', render: (r) => (r.agendas ? <strong className="text-pink-700">{fmtInt(r.agendas)}</strong> : <span className="text-slate-300">0</span>) },
    { key: 'horas', label: 'Horas', align: 'right', render: (r) => (r.horas > 0 ? fmtHoras(r.horas) : <span className="text-slate-300">—</span>) },
    { key: 'ultimaVisita', label: 'Última visita', align: 'center', render: (r) => (r.ultimaVisita ? fmtDataBr(r.ultimaVisita) : <span className="text-slate-300">—</span>) },
    ...(dados.temBaseLeads
      ? [{ key: 'leads', label: 'Leads', align: 'right', render: (r) => (r.leads ? <strong className="text-sky-700">{fmtInt(r.leads)}</strong> : <span className="text-slate-300">0</span>) }]
      : []),
    { key: 'emendasQtd', label: 'Emendas', align: 'center', render: (r) => r.emendasQtd || <span className="text-slate-300">—</span> },
    { key: 'emendas', label: 'Destinado', align: 'right', render: (r) => (r.emendas ? fmtBRL(r.emendas) : <span className="text-slate-300">—</span>) },
    { key: 'pago', label: 'Pago', align: 'right', render: (r) => (r.pago ? fmtBRL(r.pago) : <span className="text-slate-300">—</span>) },
    { key: 'resEmenda', label: 'Emendas × Votos', align: 'left', render: (r) => <BadgeRes resultado={r.resEmenda} /> },
    { key: 'resAgenda', label: 'Agendas × Votos', align: 'left', render: (r) => <BadgeAgenda resultado={r.resAgenda} /> },
    ...(dados.temBaseLeads
      ? [{ key: 'resLeads', label: 'Leads × Votos', align: 'left', render: (r) => <BadgeLeads resultado={r.resLeads} /> }]
      : []),
    {
      key: 'celId', label: 'Matriz 3×3', align: 'left',
      sortValue: (r) => r.fy * 10 + r.fx,
      render: (r) => (
        <span
          className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase border border-slate-400/50"
          style={{ background: MATRIZ_3X3[r.celId].cor, color: MATRIZ_3X3[r.celId].texto }}
        >
          {MATRIZ_3X3[r.celId].curto}
        </span>
      ),
    }
  );

  const exportarCSV = () => {
    if (!exportRows) return;
    exportRows(
      dados.cidadesFiltradas.map((r) => ({
        Município: r.nome,
        Região: r.regiao,
        ...(temAssoc ? { Associação: r.associacao } : {}),
        [`Votos ${anoBase}`]: r.vBase,
        [`Votos ${anoComp}`]: r.vComp,
        'Variação de votos': r.delta,
        'Variação %': r.deltaPct === null ? '' : r.deltaPct.toFixed(1).replace('.', ','),
        'Evolução completa': textoEvolucaoMunicipio(eleitoral, r.nome),
        Agendas: r.agendas,
        Horas: r.horas.toFixed(1).replace('.', ','),
        'Última visita': fmtDataBr(r.ultimaVisita),
        ...(dados.temBaseLeads ? { Leads: r.leads, 'Principal tema (Leads)': r.leadsTopTema } : {}),
        'Emendas (qtd)': r.emendasQtd,
        'Valor destinado': dinheiroCsv(r.emendas),
        'Valor pago': dinheiroCsv(r.pago),
        'Resultado Emendas': RESULTADOS_EMENDAS[r.resEmenda] ? RESULTADOS_EMENDAS[r.resEmenda].label : '',
        'Resultado Agendas': RESULTADOS_AGENDAS[r.resAgenda] ? RESULTADOS_AGENDAS[r.resAgenda].label : '',
        ...(dados.temBaseLeads ? { 'Resultado Leads': RESULTADOS_LEADS[r.resLeads] ? RESULTADOS_LEADS[r.resLeads].label : '' } : {}),
        'Matriz 3x3': MATRIZ_3X3[r.celId].titulo,
        Articuladores: r.articuladores,
      })),
      'tabulum_municipios_unificado.csv'
    );
  };

  return (
    <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold uppercase text-slate-900">
            Todos os Municípios ({fmtInt(dados.cidadesFiltradas.length)})
          </h2>
          <p className="text-xs text-slate-600">
            Votos, visitas de agenda, leads e emendas lado a lado. Clique em qualquer cidade para abrir a Ficha Completa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMostrarTodasEleicoes((v) => !v)}
            className={`px-3 py-1.5 text-xs font-bold border ${
              mostrarTodasEleicoes ? 'bg-sky-700 text-white border-sky-800' : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
            }`}
          >
            {mostrarTodasEleicoes ? 'Voltar à visão resumida' : 'Mostrar todas as eleições'}
          </button>
          <button onClick={exportarCSV} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-amber-100">
            Baixar CSV
          </button>
          <button onClick={() => window.print()} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-sky-700 hover:text-white">
            PDF
          </button>
        </div>
      </div>

      <Bloco title={`Quadro Municipal Completo (${fmtInt(dados.cidadesFiltradas.length)} cidades)`}>
        <TabelaSimples
          columns={colunas}
          rows={dados.cidadesFiltradas}
          initialSort={{ key: 'vComp', dir: 'desc' }}
          onRowClick={(r) => openEntityFicha('municipio', r.nome)}
          pageSize={150}
        />
      </Bloco>

      {dados.semMunEmendas.qtd > 0 && (
        <p className="text-xs text-slate-500">
          Observação: existem <strong>{fmtInt(dados.semMunEmendas.qtd)} emendas estaduais</strong> ({fmtBRL(dados.semMunEmendas.total)}) que não pertencem a um único município e por isso aparecem apenas na aba <strong>Emendas</strong>.
        </p>
      )}
    </div>
  );
}

/* ==========================================================================
   TELA 4: AGENDAS (BASE COMPLETA DAS AGENDAS FILTRADAS)
   ========================================================================== */
export function AgendasListaView({ dados, openEntityFicha, exportRows }) {
  const [buscaInterna, setBuscaInterna] = useState('');

  const lista = useMemo(() => {
    const base = dados ? dados.agendasFiltradas : [];
    if (!buscaInterna.trim()) return base;
    const b = norm(buscaInterna);
    return base.filter(
      (e) => norm(e.titulo).includes(b) || e.norm.includes(b) || norm(e.classe).includes(b) || norm(e.articulador).includes(b)
    );
  }, [dados, buscaInterna]);

  if (!dados) return null;

  const totalHoras = lista.reduce((s, e) => s + e.horas, 0);
  const munisUnicos = new Set(lista.map((e) => e.norm).filter(Boolean)).size;
  const presenciais = lista.filter((e) => !e.online).length;

  const exportarCSV = () => {
    if (!exportRows) return;
    exportRows(
      lista.map((e) => ({
        Data: fmtDataBr(e.data),
        Classe: e.classe,
        Compromisso: e.titulo,
        Município: e.municipio,
        Articulador: e.articulador,
        'Duração (min)': e.duracao,
        Modalidade: e.online ? 'Online' : 'Presencial',
        Status: e.status,
      })),
      'tabulum_agendas_filtradas.csv'
    );
  };

  return (
    <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold uppercase text-slate-900">
            Base Completa de Agendas ({fmtInt(lista.length)})
          </h2>
          <p className="text-xs text-slate-600">
            {fmtInt(presenciais)} presenciais • {fmtHoras(totalHoras)} acumuladas • {fmtInt(munisUnicos)} municípios diferentes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={buscaInterna}
            onChange={(e) => setBuscaInterna(e.target.value)}
            placeholder="Filtrar compromisso, cidade ou pessoa..."
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 w-64 focus:outline-none focus:border-pink-600"
          />
          <button onClick={exportarCSV} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-amber-100">
            Baixar CSV
          </button>
          <button onClick={() => window.print()} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-sky-700 hover:text-white">
            PDF
          </button>
        </div>
      </div>

      <Bloco title={`Compromissos no recorte (${fmtInt(lista.length)})`}>
        <TabelaSimples
          rows={lista}
          initialSort={{ key: 'data', dir: 'desc' }}
          pageSize={100}
          columns={[
            { key: 'data', label: 'Data', align: 'left', render: (e) => <strong className="text-slate-800">{fmtDataBr(e.data)}</strong> },
            { key: 'classe', label: 'Tipo de agenda', align: 'left', render: (e) => <span className="text-[11px] font-bold uppercase text-slate-600">{e.classe}</span> },
            {
              key: 'titulo', label: 'Compromisso', align: 'left', nowrap: false,
              render: (e) => (
                <span>
                  {e.titulo}
                  {e.online && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 border border-amber-300 text-[10px] font-bold uppercase text-amber-900">
                      Online
                    </span>
                  )}
                </span>
              ),
            },
            {
              key: 'municipio', label: 'Município', align: 'left',
              render: (e) =>
                e.municipio ? (
                  <button
                    onClick={(ev) => { ev.stopPropagation(); openEntityFicha('municipio', e.municipio); }}
                    className="font-bold text-sky-800 hover:underline"
                  >
                    {e.municipio}
                  </button>
                ) : (
                  <span className="text-slate-300">—</span>
                ),
            },
            {
              key: 'articulador', label: 'Articulador', align: 'left',
              render: (e) =>
                e.articulador ? (
                  <button
                    onClick={(ev) => { ev.stopPropagation(); openEntityFicha('articulador', e.articulador); }}
                    className="font-bold text-rose-700 hover:underline"
                  >
                    {e.articulador}
                  </button>
                ) : (
                  <span className="text-slate-300">—</span>
                ),
            },
            { key: 'duracao', label: 'Duração', align: 'right', render: (e) => (e.duracao ? `${e.duracao} min` : '—') },
            { key: 'status', label: 'Situação', align: 'center' },
          ]}
        />
      </Bloco>
    </div>
  );
}
