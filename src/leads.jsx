import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { norm } from './eleitoral.jsx';
import { fmtInt, fmtPct, RESULTADOS_LEADS } from './motorUnificado.js';

/* ==========================================================================
   TABULUM — Módulo de Leads (100% Anonimizado / LGPD)
   Consome apenas /api/leads (agregados por cidade, bairro, tema e origem).
   Nenhum nome, CPF, telefone ou e-mail trafega neste módulo.
   ========================================================================== */

const CACHE_KEY = 'tabulum_leads_cache_v1';

export function prepararLeads(payload) {
  if (!payload || !Array.isArray(payload.grupos)) return null;

  const grupos = [];
  const temasSet = new Set();
  const origensSet = new Set();
  const ufsSet = new Set();

  for (let i = 0; i < payload.grupos.length; i++) {
    const g = payload.grupos[i];
    if (!Array.isArray(g) || g.length < 6) continue;
    const municipio = String(g[0] || '').trim();
    const uf = String(g[1] || '').trim().toUpperCase();
    const bairro = String(g[2] || '').trim();
    const tema = String(g[3] || '').trim();
    const origem = String(g[4] || '').trim();
    const qtd = Number(g[5]) || 0;
    if (qtd <= 0) continue;

    if (tema) temasSet.add(tema);
    if (origem) origensSet.add(origem);
    if (uf) ufsSet.add(uf);

    grupos.push({
      id: i,
      municipio,
      norm: norm(municipio),
      uf,
      bairro,
      tema,
      classeTema: tema ? tema.split(' - ')[0].trim() : '',
      origem,
      qtd,
    });
  }

  return {
    atualizadoEm: payload.atualizadoEm || null,
    totalBruto: Number(payload.totalBruto) || 0,
    ignoradosRepetidos: Number(payload.ignoradosRepetidos) || 0,
    totalValidos: Number(payload.totalValidos) || grupos.reduce((s, x) => s + x.qtd, 0),
    comMunicipio: Number(payload.comMunicipio) || grupos.filter((x) => x.norm).reduce((s, x) => s + x.qtd, 0),
    municipiosUnicos: Number(payload.municipiosUnicos) || new Set(grupos.map((x) => x.norm).filter(Boolean)).size,
    temas: [...temasSet].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    origens: [...origensSet].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    ufs: [...ufsSet].sort(),
    grupos,
  };
}

export function useLeadsData() {
  const [state, setState] = useState({ status: 'loading', payload: null, erro: '' });

  const carregar = useCallback(async () => {
    setState((s) => ({ ...s, status: s.payload ? 'atualizando' : 'loading', erro: '' }));
    try {
      const r = await fetch('/api/leads');
      if (!r.ok) {
        let msg = '';
        try { msg = (await r.json()).erro || ''; } catch (e) { /* sem JSON */ }
        throw new Error(msg || `HTTP ${r.status}`);
      }
      const payload = await r.json();
      if (!payload || !Array.isArray(payload.grupos)) throw new Error('Resposta inesperada do servidor de leads');
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

  const leads = useMemo(() => prepararLeads(state.payload), [state.payload]);
  return { leads, status: state.status, erro: state.erro, recarregar: carregar };
}

export const BadgeLeads = ({ resultado }) => {
  const r = RESULTADOS_LEADS[resultado];
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

/* --------------------- status na tela de Configurações -------------------- */
export function LeadsStatus({ leads, status, erro, recarregar }) {
  const ok = Boolean(leads);
  return (
    <div className="border border-slate-200 p-5 bg-white">
      <h3 className="text-sm font-bold uppercase text-sky-800 border-b border-slate-200 pb-2 mb-3">
        Central de Leads (Agregados Anonimizados — LGPD)
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
          {fmtInt(leads.totalValidos)} leads válidos ({fmtInt(leads.ignoradosRepetidos)} repetidos filtrados) •{' '}
          {fmtInt(leads.municipiosUnicos)} municípios • lido em{' '}
          {leads.atualizadoEm ? new Date(leads.atualizadoEm).toLocaleString('pt-BR') : '—'}
        </p>
      )}
      {erro && <p className="text-xs text-rose-700 mb-1">{erro}</p>}
      <button onClick={recarregar} className="mt-2 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-amber-100">
        Recarregar Leads
      </button>
    </div>
  );
}

/* ---------------- perfil de leads dentro das Fichas ----------------------- */
export function LeadsPerfil({ type, value, leads, eleitoral, openEntityFicha }) {
  const tipoSuportado = ['municipio', 'regiao', 'tema'].includes(type);

  const gruposFicha = useMemo(() => {
    if (!leads || !value || !tipoSuportado) return [];
    const k = norm(value);
    return leads.grupos.filter((g) => {
      if (type === 'municipio') return g.norm === k;
      if (type === 'regiao') {
        if (!eleitoral || !g.norm) return false;
        const reg = eleitoral.regiaoPorChave.get(g.norm) || '';
        return norm(reg) === k;
      }
      if (type === 'tema') return g.tema && norm(g.tema) === k;
      return false;
    });
  }, [leads, eleitoral, type, value, tipoSuportado]);

  const porTema = useMemo(() => {
    const m = new Map();
    gruposFicha.forEach((g) => {
      const k = g.tema || 'Sem tema específico';
      m.set(k, (m.get(k) || 0) + g.qtd);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [gruposFicha]);

  const porOrigem = useMemo(() => {
    const m = new Map();
    gruposFicha.forEach((g) => {
      const k = g.origem || 'Sem origem informada';
      m.set(k, (m.get(k) || 0) + g.qtd);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [gruposFicha]);

  const porBairro = useMemo(() => {
    if (type !== 'municipio' || norm(value) !== 'FLORIANOPOLIS') return [];
    const m = new Map();
    gruposFicha.forEach((g) => {
      if (!g.bairro) return;
      m.set(g.bairro, (m.get(g.bairro) || 0) + g.qtd);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [gruposFicha, type, value]);

  const porCidade = useMemo(() => {
    if (type === 'municipio') return [];
    const m = new Map();
    gruposFicha.forEach((g) => {
      if (!g.municipio) return;
      m.set(g.municipio, (m.get(g.municipio) || 0) + g.qtd);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [gruposFicha, type]);

  if (!leads || !tipoSuportado) return null;

  const totalLeads = gruposFicha.reduce((s, g) => s + g.qtd, 0);
  const shareTotal = leads.totalValidos > 0 ? (totalLeads / leads.totalValidos) * 100 : null;

  return (
    <div className="p-4 border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-xs sm:text-sm font-bold uppercase text-slate-800 tracking-wider flex items-center">
          <span className="w-2 h-4 bg-sky-600 mr-2" />
          Base de Leads & Mobilização (Anonimizado)
          <span className="ml-2 normal-case font-medium text-[11px] text-slate-500">
            ({fmtInt(totalLeads)} contatos válidos • {fmtPct(shareTotal)} da base)
          </span>
        </h2>
      </div>

      {totalLeads === 0 ? (
        <p className="text-xs text-slate-500">
          Nenhum lead válido registrado para este recorte na Central de Leads.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {type !== 'tema' && (
            <div className="border border-slate-300 bg-white">
              <div className="bg-amber-100/90 border-b border-slate-300 px-3 py-1.5 flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-slate-800">Leads por Tema</span>
                <span className="text-[10px] font-bold text-slate-600">{porTema.length}</span>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                {porTema.slice(0, 15).map(([tema, qtd]) => (
                  <div
                    key={tema}
                    onClick={() => tema !== 'Sem tema específico' && openEntityFicha && openEntityFicha('tema', tema)}
                    className={`px-3 py-1.5 flex justify-between gap-2 ${
                      tema !== 'Sem tema específico' ? 'hover:bg-sky-50 cursor-pointer' : 'text-slate-400 italic'
                    }`}
                  >
                    <span className="truncate" title={tema}>{tema}</span>
                    <strong className="text-sky-800 whitespace-nowrap">{fmtInt(qtd)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border border-slate-300 bg-white">
            <div className="bg-amber-100/90 border-b border-slate-300 px-3 py-1.5 flex justify-between items-center">
              <span className="font-bold text-xs uppercase text-slate-800">Campanhas & Origens</span>
              <span className="text-[10px] font-bold text-slate-600">{porOrigem.length}</span>
            </div>
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
              {porOrigem.slice(0, 15).map(([orig, qtd]) => (
                <div key={orig} className="px-3 py-1.5 flex justify-between gap-2">
                  <span className="truncate text-slate-700" title={orig}>{orig}</span>
                  <strong className="text-pink-700 whitespace-nowrap">{fmtInt(qtd)}</strong>
                </div>
              ))}
            </div>
          </div>

          {porBairro.length > 0 && (
            <div className="border border-slate-300 bg-white">
              <div className="bg-amber-100/90 border-b border-slate-300 px-3 py-1.5 flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-slate-800">Bairros REPLAN (Florianópolis)</span>
                <span className="text-[10px] font-bold text-slate-600">{porBairro.length}</span>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                {porBairro.slice(0, 20).map(([bairro, qtd]) => (
                  <div key={bairro} className="px-3 py-1.5 flex justify-between gap-2">
                    <span className="truncate font-medium text-slate-800">{bairro}</span>
                    <strong className="text-sky-800 whitespace-nowrap">{fmtInt(qtd)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {porCidade.length > 0 && (
            <div className="border border-slate-300 bg-white">
              <div className="bg-amber-100/90 border-b border-slate-300 px-3 py-1.5 flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-slate-800">Principais Cidades</span>
                <span className="text-[10px] font-bold text-slate-600">{porCidade.length}</span>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                {porCidade.slice(0, 20).map(([cid, qtd]) => (
                  <div
                    key={cid}
                    onClick={() => openEntityFicha && openEntityFicha('municipio', cid)}
                    className="px-3 py-1.5 flex justify-between gap-2 hover:bg-sky-50 cursor-pointer"
                  >
                    <span className="truncate font-semibold text-sky-800 hover:underline">{cid}</span>
                    <strong className="text-slate-900 whitespace-nowrap">{fmtInt(qtd)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------- tela: LEADS (base anonimizada) --------------------- */
export function LeadsListaView({ dados, leads, openEntityFicha, exportRows }) {
  const [subAba, setSubAba] = useState('origens'); // 'origens' | 'temas' | 'grupos'
  const [buscaInterna, setBuscaInterna] = useState('');

  const gruposFiltrados = useMemo(() => {
    const base = dados ? dados.leadsFiltrados : [];
    if (!buscaInterna.trim()) return base;
    const b = norm(buscaInterna);
    return base.filter(
      (g) => norm(g.municipio).includes(b) || norm(g.tema).includes(b) || norm(g.origem).includes(b) || norm(g.bairro).includes(b)
    );
  }, [dados, buscaInterna]);

  const origensFiltradas = useMemo(() => {
    const m = new Map();
    gruposFiltrados.forEach((g) => {
      const k = g.origem || 'Sem origem informada';
      let item = m.get(k);
      if (!item) {
        item = { origem: k, tema: g.tema, qtd: 0, cidades: new Set() };
        m.set(k, item);
      }
      item.qtd += g.qtd;
      if (!item.tema && g.tema) item.tema = g.tema;
      if (g.norm) item.cidades.add(g.norm);
    });
    return [...m.values()]
      .map((x) => ({ origem: x.origem, tema: x.tema, qtd: x.qtd, cidades: x.cidades.size }))
      .sort((a, b) => b.qtd - a.qtd);
  }, [gruposFiltrados]);

  const temasFiltrados = useMemo(() => {
    const m = new Map();
    gruposFiltrados.forEach((g) => {
      const k = g.tema || 'Sem tema específico';
      let item = m.get(k);
      if (!item) {
        item = { tema: k, qtd: 0, cidades: new Set(), origens: new Set() };
        m.set(k, item);
      }
      item.qtd += g.qtd;
      if (g.norm) item.cidades.add(g.norm);
      if (g.origem) item.origens.add(g.origem);
    });
    return [...m.values()]
      .map((x) => ({ tema: x.tema, qtd: x.qtd, cidades: x.cidades.size, origens: x.origens.size }))
      .sort((a, b) => b.qtd - a.qtd);
  }, [gruposFiltrados]);

  if (!dados) return null;

  const totalLeadsRecorte = gruposFiltrados.reduce((s, g) => s + g.qtd, 0);
  const cidadesRecorte = new Set(gruposFiltrados.map((g) => g.norm).filter(Boolean)).size;

  const exportarCSV = () => {
    if (!exportRows) return;
    if (subAba === 'origens') {
      return exportRows(
        origensFiltradas.map((r) => ({
          'Campanha / Origem': r.origem,
          Tema: r.tema,
          'Leads Válidos': r.qtd,
          'Cidades Alcançadas': r.cidades,
        })),
        'tabulum_leads_por_campanha.csv'
      );
    }
    if (subAba === 'temas') {
      return exportRows(
        temasFiltrados.map((r) => ({
          Tema: r.tema,
          'Leads Válidos': r.qtd,
          'Cidades Alcançadas': r.cidades,
          Campanhas: r.origens,
        })),
        'tabulum_leads_por_tema.csv'
      );
    }
    return exportRows(
      gruposFiltrados.map((g) => ({
        Município: g.municipio,
        UF: g.uf,
        'Bairro (Floripa)': g.bairro,
        Tema: g.tema,
        'Campanha / Origem': g.origem,
        'Leads Válidos': g.qtd,
      })),
      'tabulum_leads_detalhado_anonimizado.csv'
    );
  };

  return (
    <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold uppercase text-slate-900">
            Base de Leads & Mobilização ({fmtInt(totalLeadsRecorte)} contatos válidos)
          </h2>
          <p className="text-xs text-slate-600">
            {fmtInt(cidadesRecorte)} municípios • {fmtInt(origensFiltradas.length)} campanhas/origens •{' '}
            {leads ? `${fmtInt(leads.ignoradosRepetidos)} repetidos removidos automaticamente • ` : ''}
            <strong>LGPD:</strong> dados pessoais protegidos no servidor (exibição apenas por contagens).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={buscaInterna}
            onChange={(e) => setBuscaInterna(e.target.value)}
            placeholder="Filtrar cidade, tema ou campanha..."
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 w-64 focus:outline-none focus:border-sky-700"
          />
          <button onClick={exportarCSV} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-amber-100">
            Baixar CSV
          </button>
          <button onClick={() => window.print()} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-sky-700 hover:text-white">
            PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-slate-300 print:hidden">
        {[
          ['origens', `Por Campanha / Origem (${fmtInt(origensFiltradas.length)})`],
          ['temas', `Por Tema (${fmtInt(temasFiltrados.length)})`],
          ['grupos', `Detalhamento Cidade × Tema (${fmtInt(gruposFiltrados.length)})`],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setSubAba(k)}
            className={`px-4 py-2 text-xs font-bold uppercase border border-b-0 -mb-px ${
              subAba === k ? 'bg-white border-slate-300 text-sky-800' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {subAba === 'origens' && (
        <div className="border border-slate-300 bg-white overflow-x-auto shadow-xs">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-amber-100/90 border-b border-slate-300">
              <tr>
                <th className="py-2 px-3 text-left text-[11px] font-bold uppercase text-slate-800">Campanha / Origem</th>
                <th className="py-2 px-3 text-left text-[11px] font-bold uppercase text-slate-800">Tema</th>
                <th className="py-2 px-3 text-center text-[11px] font-bold uppercase text-slate-800">Cidades</th>
                <th className="py-2 px-3 text-right text-[11px] font-bold uppercase text-slate-800">Leads Válidos</th>
                <th className="py-2 px-3 text-right text-[11px] font-bold uppercase text-slate-800">% no recorte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {origensFiltradas.map((r) => (
                <tr key={r.origem} className="hover:bg-sky-50/50">
                  <td className="py-2 px-3 font-medium text-slate-900">{r.origem}</td>
                  <td className="py-2 px-3 text-slate-700">
                    {r.tema ? (
                      <button onClick={() => openEntityFicha && openEntityFicha('tema', r.tema)} className="text-sky-800 hover:underline text-left">
                        {r.tema}
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center font-semibold">{fmtInt(r.cidades)}</td>
                  <td className="py-2 px-3 text-right font-extrabold text-pink-700">{fmtInt(r.qtd)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{fmtPct(totalLeadsRecorte > 0 ? (r.qtd / totalLeadsRecorte) * 100 : null)}</td>
                </tr>
              ))}
              {origensFiltradas.length === 0 && (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400 uppercase">Nenhum dado neste filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {subAba === 'temas' && (
        <div className="border border-slate-300 bg-white overflow-x-auto shadow-xs">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-amber-100/90 border-b border-slate-300">
              <tr>
                <th className="py-2 px-3 text-left text-[11px] font-bold uppercase text-slate-800">Tema (Classe — Subclasse)</th>
                <th className="py-2 px-3 text-center text-[11px] font-bold uppercase text-slate-800">Campanhas</th>
                <th className="py-2 px-3 text-center text-[11px] font-bold uppercase text-slate-800">Cidades</th>
                <th className="py-2 px-3 text-right text-[11px] font-bold uppercase text-slate-800">Leads Válidos</th>
                <th className="py-2 px-3 text-right text-[11px] font-bold uppercase text-slate-800">% no recorte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {temasFiltrados.map((r) => (
                <tr
                  key={r.tema}
                  onClick={() => r.tema !== 'Sem tema específico' && openEntityFicha && openEntityFicha('tema', r.tema)}
                  className={r.tema !== 'Sem tema específico' ? 'hover:bg-sky-50/50 cursor-pointer' : 'text-slate-500 italic'}
                >
                  <td className="py-2 px-3 font-semibold text-sky-900">{r.tema}</td>
                  <td className="py-2 px-3 text-center">{fmtInt(r.origens)}</td>
                  <td className="py-2 px-3 text-center">{fmtInt(r.cidades)}</td>
                  <td className="py-2 px-3 text-right font-extrabold text-pink-700">{fmtInt(r.qtd)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{fmtPct(totalLeadsRecorte > 0 ? (r.qtd / totalLeadsRecorte) * 100 : null)}</td>
                </tr>
              ))}
              {temasFiltrados.length === 0 && (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400 uppercase">Nenhum dado neste filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {subAba === 'grupos' && (
        <div className="border border-slate-300 bg-white overflow-x-auto shadow-xs">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-amber-100/90 border-b border-slate-300">
              <tr>
                <th className="py-2 px-3 text-left text-[11px] font-bold uppercase text-slate-800">Município</th>
                <th className="py-2 px-3 text-center text-[11px] font-bold uppercase text-slate-800">UF</th>
                <th className="py-2 px-3 text-left text-[11px] font-bold uppercase text-slate-800">Bairro (Floripa)</th>
                <th className="py-2 px-3 text-left text-[11px] font-bold uppercase text-slate-800">Tema</th>
                <th className="py-2 px-3 text-left text-[11px] font-bold uppercase text-slate-800">Campanha / Origem</th>
                <th className="py-2 px-3 text-right text-[11px] font-bold uppercase text-slate-800">Qtd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gruposFiltrados.slice(0, 250).map((g) => (
                <tr key={g.id} className="hover:bg-sky-50/50">
                  <td className="py-2 px-3">
                    {g.municipio ? (
                      <button onClick={() => openEntityFicha && openEntityFicha('municipio', g.municipio)} className="font-bold text-sky-800 hover:underline">
                        {g.municipio}
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600">{g.uf || '—'}</td>
                  <td className="py-2 px-3 text-slate-700">{g.bairro || <span className="text-slate-300">—</span>}</td>
                  <td className="py-2 px-3 text-slate-700">{g.tema || <span className="text-slate-300">—</span>}</td>
                  <td className="py-2 px-3 text-slate-700">{g.origem || '—'}</td>
                  <td className="py-2 px-3 text-right font-extrabold text-pink-700">{fmtInt(g.qtd)}</td>
                </tr>
              ))}
              {gruposFiltrados.length === 0 && (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400 uppercase">Nenhum registro encontrado.</td></tr>
              )}
            </tbody>
          </table>
          {gruposFiltrados.length > 250 && (
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
              Exibindo os 250 maiores grupos de {fmtInt(gruposFiltrados.length)}. Use a busca ou clique em <strong>Baixar CSV</strong> para ver todos.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
