import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { norm } from './eleitoral.jsx';
import { fmtInt, fmtPct, RESULTADOS_LEADS } from './motorUnificado.js';

/* ==========================================================================
   TABULUM — Módulo de Leads (Agregados + Acesso Nominal Protegido / LGPD)
   ========================================================================== */

const CACHE_KEY = 'tabulum_leads_cache_v1';
const SESSION_PASS_KEY = 'tabulum_leads_nominal_pass';

function formatarLinkZap(tel) {
  const digits = String(tel || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  const full = digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;
  return `https://wa.me/${full}`;
}

function exportarContatosCSV(contatos, nomeArquivo) {
  if (!contatos || !contatos.length) return;
  const cols = [
    ['Nome', 'nome'],
    ['Município', 'municipio'],
    ['Bairro', 'bairro'],
    ['UF', 'uf'],
    ['WhatsApp', 'whatsapp'],
    ['E-mail', 'email'],
    ['Tema', 'tema'],
    ['Campanha / Origem', 'origem'],
    ['Status', 'status'],
    ['Observações', 'observacoes'],
  ];
  const linhas = [cols.map(([h]) => `"${h}"`).join(',')];
  contatos.forEach((c) => {
    linhas.push(
      cols
        .map(([, k]) => `"${String(c[k] || '').replace(/"/g, '""')}"`)
        .join(',')
    );
  });
  const blob = new Blob(['\uFEFF' + linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

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
        Central de Leads (Agregados + Acesso Nominal Restrito — LGPD)
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

  // Estado da lista nominal sob demanda (protegida por senha no servidor)
  const [senhaSessao, setSenhaSessao] = useState(() => {
    try { return sessionStorage.getItem(SESSION_PASS_KEY) || ''; } catch (e) { return ''; }
  });
  const [senhaInput, setSenhaInput] = useState('');
  const [nomEstado, setNomEstado] = useState({ status: 'idle', contatos: [], erro: '' });
  const [buscaNom, setBuscaNom] = useState('');
  const [filtroTemaNom, setFiltroTemaNom] = useState('');
  const [filtroOrigNom, setFiltroOrigNom] = useState('');
  const [limiteNom, setLimiteNom] = useState(100);

  const municipiosConsulta = useMemo(() => {
    if (!tipoSuportado || !value) return [];
    if (type === 'municipio') return [value];
    if (type === 'regiao' && eleitoral && Array.isArray(eleitoral.munis)) {
      const k = norm(value);
      return eleitoral.munis.filter((m) => norm(m.regiao) === k).map((m) => m.nome);
    }
    return [];
  }, [type, value, eleitoral, tipoSuportado]);

  const buscarNominais = useCallback(async (senhaUsar) => {
    if (!senhaUsar || !tipoSuportado || !value) return;
    setNomEstado({ status: 'loading', contatos: [], erro: '' });
    try {
      const payloadReq =
        type === 'tema'
          ? { password: senhaUsar, tema: value }
          : { password: senhaUsar, municipios: municipiosConsulta };

      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadReq),
      });
      const dados = await r.json();
      if (!r.ok) {
        if (r.status === 401) {
          try { sessionStorage.removeItem(SESSION_PASS_KEY); } catch (e) {}
          setSenhaSessao('');
        }
        throw new Error(dados.erro || `HTTP ${r.status}`);
      }
      try { sessionStorage.setItem(SESSION_PASS_KEY, senhaUsar); } catch (e) {}
      setSenhaSessao(senhaUsar);
      setNomEstado({ status: 'ok', contatos: dados.contatos || [], erro: '' });
    } catch (err) {
      setNomEstado({ status: 'erro', contatos: [], erro: String((err && err.message) || err) });
    }
  }, [type, value, municipiosConsulta, tipoSuportado]);

  // Recarrega automaticamente ao trocar de cidade/região/tema se a sessão já estiver desbloqueada
  useEffect(() => {
    setBuscaNom('');
    setFiltroTemaNom('');
    setFiltroOrigNom('');
    setLimiteNom(100);
    if (senhaSessao && tipoSuportado && value) {
      buscarNominais(senhaSessao);
    } else {
      setNomEstado({ status: 'idle', contatos: [], erro: '' });
    }
  }, [type, value, senhaSessao, tipoSuportado, buscarNominais]);

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

  const temasNominais = useMemo(
    () => [...new Set(nomEstado.contatos.map((c) => c.tema).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [nomEstado.contatos]
  );

  const origensNominais = useMemo(
    () => [...new Set(nomEstado.contatos.map((c) => c.origem).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [nomEstado.contatos]
  );

  const contatosFiltrados = useMemo(() => {
    const b = norm(buscaNom);
    return nomEstado.contatos.filter((c) => {
      if (filtroTemaNom && c.tema !== filtroTemaNom) return false;
      if (filtroOrigNom && c.origem !== filtroOrigNom) return false;
      if (b) {
        const alvo = norm(`${c.nome} ${c.municipio} ${c.bairro} ${c.email} ${c.whatsapp} ${c.tema} ${c.origem} ${c.observacoes}`);
        if (!alvo.includes(b)) return false;
      }
      return true;
    });
  }, [nomEstado.contatos, buscaNom, filtroTemaNom, filtroOrigNom]);

  if (!leads || !tipoSuportado) return null;

  const totalLeads = gruposFicha.reduce((s, g) => s + g.qtd, 0);
  const shareTotal = leads.totalValidos > 0 ? (totalLeads / leads.totalValidos) * 100 : null;

  const sairNominal = () => {
    try { sessionStorage.removeItem(SESSION_PASS_KEY); } catch (e) {}
    setSenhaSessao('');
    setSenhaInput('');
    setNomEstado({ status: 'idle', contatos: [], erro: '' });
  };

  return (
    <div className="p-4 border-b border-slate-200 bg-white space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs sm:text-sm font-bold uppercase text-slate-800 tracking-wider flex items-center">
          <span className="w-2 h-4 bg-sky-600 mr-2" />
          Base de Leads & Mobilização
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
        <>
          {/* 1. Resumo agregado (sempre visível) */}
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

          {/* 2. Lista Nominal de Contatos (Acesso Restrito — LGPD) */}
          <div className="border border-slate-300 bg-slate-50/60">
            <div className="bg-slate-800 text-white px-3.5 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide">
                  Lista Nominal de Contatos — {value}
                </span>
                {nomEstado.status === 'ok' && (
                  <span className="bg-amber-300 text-slate-900 px-1.5 py-0.5 text-[10px] font-extrabold">
                    {fmtInt(contatosFiltrados.length)} de {fmtInt(nomEstado.contatos.length)}
                  </span>
                )}
              </div>
              {senhaSessao && (
                <button
                  onClick={sairNominal}
                  className="text-[11px] font-bold text-amber-200 hover:underline print:hidden"
                >
                  Bloquear contatos
                </button>
              )}
            </div>

            {!senhaSessao ? (
              <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-white print:hidden">
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Acesso restrito à equipe (LGPD)</p>
                  <p className="text-slate-500">
                    Digite a senha de contatos nominais para visualizar nomes, WhatsApp, e-mails e exportar CSV/PDF de <strong>{value}</strong>.
                  </p>
                  {nomEstado.erro && <p className="text-rose-700 font-semibold mt-1">{nomEstado.erro}</p>}
                </div>
                <form
                  onSubmit={(e) => { e.preventDefault(); buscarNominais(senhaInput); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="password"
                    value={senhaInput}
                    onChange={(e) => setSenhaInput(e.target.value)}
                    placeholder="Senha de acesso..."
                    className="px-3 py-1.5 text-xs bg-white border border-slate-300 focus:outline-none focus:border-sky-700 w-44"
                  />
                  <button
                    type="submit"
                    disabled={!senhaInput || nomEstado.status === 'loading'}
                    className="px-3.5 py-1.5 text-xs font-bold uppercase bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-50"
                  >
                    {nomEstado.status === 'loading' ? 'Verificando...' : 'Liberar lista'}
                  </button>
                </form>
              </div>
            ) : nomEstado.status === 'loading' ? (
              <div className="p-6 text-center text-xs font-semibold text-slate-600 bg-white">
                Carregando lista nominal de {value}...
              </div>
            ) : nomEstado.status === 'erro' ? (
              <div className="p-4 bg-white text-xs text-rose-700 flex items-center justify-between gap-2">
                <span>Erro ao carregar contatos: {nomEstado.erro}</span>
                <button onClick={() => buscarNominais(senhaSessao)} className="px-3 py-1 bg-white border border-slate-300 text-slate-800 font-bold hover:bg-amber-100">
                  Tentar novamente
                </button>
              </div>
            ) : (
              <div className="bg-white">
                {/* Filtros e ações CSV/PDF */}
                <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 print:hidden">
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={buscaNom}
                      onChange={(e) => setBuscaNom(e.target.value)}
                      placeholder="Buscar nome, bairro, telefone, e-mail..."
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 w-56 focus:outline-none focus:border-sky-700"
                    />
                    {temasNominais.length > 0 && (
                      <select
                        value={filtroTemaNom}
                        onChange={(e) => setFiltroTemaNom(e.target.value)}
                        className="px-2 py-1.5 text-xs bg-white border border-slate-300 max-w-[210px]"
                      >
                        <option value="">Todos os temas ({temasNominais.length})</option>
                        {temasNominais.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    )}
                    {origensNominais.length > 0 && (
                      <select
                        value={filtroOrigNom}
                        onChange={(e) => setFiltroOrigNom(e.target.value)}
                        className="px-2 py-1.5 text-xs bg-white border border-slate-300 max-w-[230px]"
                      >
                        <option value="">Todas as campanhas ({origensNominais.length})</option>
                        {origensNominais.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportarContatosCSV(contatosFiltrados, `leads_${norm(value).toLowerCase()}.csv`)}
                      className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-amber-100"
                    >
                      Baixar CSV ({fmtInt(contatosFiltrados.length)})
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 text-xs font-bold bg-sky-700 text-white hover:bg-sky-800"
                    >
                      Imprimir / PDF
                    </button>
                  </div>
                </div>

                {/* Tabela nominal */}
                <div className="overflow-x-auto max-h-[520px] print:max-h-none">
                  <table className="w-full border-collapse text-xs">
                    <thead className="bg-amber-100/90 sticky top-0 border-b border-slate-300">
                      <tr>
                        <th className="py-2 px-2.5 text-left text-[10px] font-bold uppercase text-slate-800">Nome</th>
                        {type !== 'municipio' && (
                          <th className="py-2 px-2.5 text-left text-[10px] font-bold uppercase text-slate-800">Município</th>
                        )}
                        <th className="py-2 px-2.5 text-left text-[10px] font-bold uppercase text-slate-800">Bairro</th>
                        <th className="py-2 px-2.5 text-left text-[10px] font-bold uppercase text-slate-800">WhatsApp</th>
                        <th className="py-2 px-2.5 text-left text-[10px] font-bold uppercase text-slate-800">E-mail</th>
                        <th className="py-2 px-2.5 text-left text-[10px] font-bold uppercase text-slate-800">Tema</th>
                        <th className="py-2 px-2.5 text-left text-[10px] font-bold uppercase text-slate-800">Campanha / Origem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {contatosFiltrados.slice(0, limiteNom).map((c) => {
                        const linkZap = formatarLinkZap(c.whatsapp);
                        return (
                          <tr key={c.id} className="hover:bg-sky-50/50">
                            <td className="py-1.5 px-2.5 font-semibold text-slate-900">{c.nome || '—'}</td>
                            {type !== 'municipio' && (
                              <td className="py-1.5 px-2.5 text-sky-800 font-medium whitespace-nowrap">{c.municipio || '—'}</td>
                            )}
                            <td className="py-1.5 px-2.5 text-slate-600">{c.bairro || '—'}</td>
                            <td className="py-1.5 px-2.5 whitespace-nowrap">
                              {linkZap ? (
                                <a
                                  href={linkZap}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sky-700 font-semibold hover:underline"
                                >
                                  {c.whatsapp}
                                </a>
                              ) : (
                                <span className="text-slate-400">{c.whatsapp || '—'}</span>
                              )}
                            </td>
                            <td className="py-1.5 px-2.5">
                              {c.email ? (
                                <a href={`mailto:${c.email}`} className="text-slate-700 hover:text-sky-700 hover:underline">
                                  {c.email}
                                </a>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-1.5 px-2.5 text-[11px] text-slate-700">{c.tema || '—'}</td>
                            <td className="py-1.5 px-2.5 text-[11px] text-slate-600 max-w-[240px] truncate" title={c.origem}>
                              {c.origem || '—'}
                            </td>
                          </tr>
                        );
                      })}
                      {contatosFiltrados.length === 0 && (
                        <tr>
                          <td colSpan={type !== 'municipio' ? 7 : 6} className="py-6 text-center text-slate-400 uppercase">
                            Nenhum contato encontrado com esses filtros.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {contatosFiltrados.length > limiteNom && (
                  <div className="p-2.5 text-center border-t border-slate-200 print:hidden">
                    <button
                      onClick={() => setLimiteNom((l) => l + 150)}
                      className="px-4 py-1 text-xs font-bold border border-slate-300 bg-white hover:bg-amber-100"
                    >
                      Mostrar mais ({fmtInt(contatosFiltrados.length - limiteNom)} restantes)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
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
            Clique em qualquer cidade ou tema para abrir a Ficha e liberar a lista nominal.
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
