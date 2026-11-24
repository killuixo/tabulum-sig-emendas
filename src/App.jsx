import React, { useState, useEffect, useMemo } from 'react';
import {
  useEleitoralData, EleitoralPerfil, EleitoralStatus, VotosEvolucao, textoEvolucaoMunicipio,
  norm as chaveMun, tituloMunicipio,
} from './eleitoral.jsx';
import { useAgendaData, AgendaPerfil, AgendaStatus } from './agenda.jsx';
import {
  FILTROS_PADRAO, PERIODOS_AGENDA, RESULTADOS_EMENDAS, RESULTADOS_AGENDAS, QUADRANTES_4,
  calcularPainelUnificado, fmtInt,
} from './motorUnificado.js';
import {
  BarraAtalhosConversao, InicioDashboard, MunicipiosUnificadosView, AgendasListaView,
} from './InicioUnificado.jsx';

/* ============================== ícones SVG ================================ */
const Icon = ({ path, className = 'w-4 h-4', onClick, size, style }) => (
  <svg
    onClick={onClick}
    style={{ width: size, height: size, ...style }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {path}
  </svg>
);

const SearchIcon = (p) => <Icon {...p} path={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>} />;
const MapPinIcon = (p) => <Icon {...p} path={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>} />;
const MapIcon = (p) => <Icon {...p} path={<><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></>} />;
const UserIcon = (p) => <Icon {...p} path={<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />;
const TagIcon = (p) => <Icon {...p} path={<><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></>} />;
const BuildingIcon = (p) => <Icon {...p} path={<><rect width="16" height="20" x="4" y="2" rx="1"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></>} />;
const LayersIcon = (p) => <Icon {...p} path={<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>} />;
const EditIcon = (p) => <Icon {...p} path={<><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></>} />;
const SaveIcon = (p) => <Icon {...p} path={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>} />;
const XIcon = (p) => <Icon {...p} path={<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>} />;
const SettingsIcon = (p) => <Icon {...p} path={<><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>} />;
const LogInIcon = (p) => <Icon {...p} path={<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></>} />;
const LogOutIcon = (p) => <Icon {...p} path={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></>} />;
const CheckCircleIcon = (p) => <Icon {...p} path={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>} />;
const AlertTriangleIcon = (p) => <Icon {...p} path={<><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></>} />;
const RefreshCwIcon = (p) => <Icon {...p} path={<><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></>} />;
const UploadCloudIcon = (p) => <Icon {...p} path={<><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></>} />;
const HomeIcon = (p) => <Icon {...p} path={<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>} />;
const TableIcon = (p) => <Icon {...p} path={<><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></>} />;
const ChevronUpIcon = (p) => <Icon {...p} path={<><path d="m18 15-6-6-6 6"/></>} />;
const ChevronDownIcon = (p) => <Icon {...p} path={<><path d="m6 9 6 6 6-6"/></>} />;
const GridIcon = (p) => <Icon {...p} path={<><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></>} />;
const ListIcon = (p) => <Icon {...p} path={<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>} />;
const DownloadIcon = (p) => <Icon {...p} path={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></>} />;
const PrinterIcon = (p) => <Icon {...p} path={<><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></>} />;
const FilterIcon = (p) => <Icon {...p} path={<><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>} />;
const BellIcon = (p) => <Icon {...p} path={<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>} />;
const VoteIcon = (p) => <Icon {...p} path={<><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></>} />;
const CalendarIcon = (p) => <Icon {...p} path={<><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></>} />;
const ClockIcon = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />;

/* =========================== utilitários de dados ========================= */
function parseCSV(text) {
  const csvText = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (inQuotes) {
      if (char === '"') {
        if (csvText[i + 1] === '"') { cell += '"'; i++; }
        else { inQuotes = false; }
      } else { cell += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(cell.trim()); cell = ''; }
      else if (char === '\n' || char === '\r') {
        row.push(cell.trim()); rows.push(row); row = []; cell = '';
        if (char === '\r' && csvText[i + 1] === '\n') i++;
      } else { cell += char; }
    }
  }
  if (cell || csvText[csvText.length - 1] === ',') row.push(cell.trim());
  if (row.length > 0) rows.push(row);
  return rows;
}

function parseCurrency(str) {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  const cleanStr = String(str).replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleanStr) || 0;
}

function formatCurrency(num) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
}

function normalizeStr(str) {
  if (!str) return '';
  return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
}

function getModalidade(emenda) {
  if (!emenda) return '';
  if (emenda.MODALIDADE && String(emenda.MODALIDADE).trim() !== '') {
    return String(emenda.MODALIDADE).trim();
  }
  const esfera = String(emenda['ESFERA DE APLICAÇÃO'] || '').toUpperCase();
  const obj = String(emenda.OBJETO || '').toUpperCase();
  if (esfera.includes('TRANSFERÊNCIA ESPECIAL') || esfera.includes('TRANSF. ESPECIAL') || obj.startsWith('TRANSFERÊNCIA ESPECIAL')) {
    return 'Transferência Especial';
  }
  if (esfera.includes('ÓRGÃO ESTADUAL') || obj.startsWith('EXECUÇÃO DIRETA')) {
    return 'Execução Direta';
  }
  if (esfera.includes('ENTIDADE') || obj.startsWith('CONVÊNIO')) {
    return 'Convênio';
  }
  return String(emenda['ESFERA DE APLICAÇÃO'] || '').trim();
}

function formatDateBr(val) {
  if (!val) return '';
  const s = String(val).trim();
  if (!s || s === '-' || s === '—' || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'null') return '';
  const mBr = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (mBr) return `${mBr[1]}/${mBr[2]}/${mBr[3]}`;
  const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (mIso) return `${mIso[3]}/${mIso[2]}/${mIso[1]}`;
  return s;
}

function getDataPagamento(emenda, historyList = []) {
  if (!emenda) return '';
  const candidatos = [
    emenda['DATA DO PAGAMENTO'],
    emenda['DATA DE PAGAMENTO'],
    emenda['DATA PAGAMENTO'],
    emenda['Data do Pagamento'],
    emenda['Data de Pagamento'],
    emenda['DT_PAGTO_PP'],
    emenda['DATA_PAGAMENTO'],
  ];
  for (const c of candidatos) {
    const fmt = formatDateBr(c);
    if (fmt) return fmt;
  }
  for (const k of Object.keys(emenda)) {
    const kNorm = normalizeStr(k);
    if (kNorm.includes('DATA') && kNorm.includes('PAG')) {
      const fmt = formatDateBr(emenda[k]);
      if (fmt) return fmt;
    }
  }
  const num = String(emenda['NÚMERO DA EMENDA'] || '').trim();
  if (num && Array.isArray(historyList) && historyList.length > 0) {
    const logsPagto = historyList.filter(
      (u) =>
        String(u.numeroEmenda || '').trim() === num &&
        (u.tipo === 'PAGAMENTO' || u.campo === 'PAGO' || String(u.valorNovo || '').toUpperCase().includes('PAGO'))
    );
    if (logsPagto.length > 0) {
      const maisAntigo = logsPagto[logsPagto.length - 1];
      const fmt = formatDateBr(maisAntigo.dataHora);
      if (fmt) return fmt;
    }
  }
  return '';
}

function parseBrDateTime(str) {
  if (!str) return 0;
  const s = String(str).trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    const [, dd, mm, yyyy, hh = '00', min = '00', ss = '00'] = m;
    return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`).getTime() || 0;
  }
  const t = Date.parse(s);
  return isNaN(t) ? 0 : t;
}

function formatNowBr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function gerarDiffsLocais(antigas, novas, origem = 'Sincronização') {
  if (!Array.isArray(antigas) || antigas.length === 0 || !Array.isArray(novas) || novas.length === 0) {
    return [];
  }
  const mapaAntigas = {};
  antigas.forEach((e) => {
    const num = String(e['NÚMERO DA EMENDA'] || '').trim();
    if (num) mapaAntigas[num] = e;
  });

  const camposMonitorados = [
    { key: 'PAGO', tipo: 'PAGAMENTO' },
    { key: 'SITUAÇÃO', tipo: 'SITUACAO' },
    { key: 'DATA DO PAGAMENTO', tipo: 'PAGAMENTO' },
    { key: 'SGPe', tipo: 'SGPE' },
    { key: 'TOTAL', tipo: 'VALOR_TOTAL' },
    { key: 'ARTICULADOR', tipo: 'EDICAO_MANUAL' },
    { key: 'LIDERANÇA', tipo: 'EDICAO_MANUAL' },
    { key: 'RAZÃO SOCIAL', tipo: 'ATUALIZACAO' },
  ];

  const agora = formatNowBr();
  const novosLogs = [];

  novas.forEach((itemNovo) => {
    const num = String(itemNovo['NÚMERO DA EMENDA'] || '').trim();
    if (!num) return;
    const mun = String(itemNovo['MUNICÍPIO'] || '').trim();
    const ent = String(itemNovo['RAZÃO SOCIAL'] || '').trim();
    const itemAntigo = mapaAntigas[num];

    if (!itemAntigo) {
      novosLogs.push({
        id: `local-${num}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        dataHora: agora,
        numeroEmenda: num,
        municipio: mun,
        entidade: ent,
        tipo: 'NOVA_EMENDA',
        campo: 'CADASTRO SEF/SC',
        valorAnterior: '—',
        valorNovo: `${itemNovo['SITUAÇÃO'] || 'A Pagar'} (${formatCurrency(parseCurrency(itemNovo['TOTAL']))})`,
        origem,
      });
    } else {
      camposMonitorados.forEach(({ key, tipo }) => {
        const vAnt = String(itemAntigo[key] || '').trim();
        const vNov = String(itemNovo[key] || '').trim();
        if (vAnt.toUpperCase() !== vNov.toUpperCase() && (vAnt !== '' || vNov !== '')) {
          novosLogs.push({
            id: `local-${num}-${key}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            dataHora: agora,
            numeroEmenda: num,
            municipio: mun,
            entidade: ent || String(itemAntigo['RAZÃO SOCIAL'] || '').trim(),
            tipo,
            campo: key,
            valorAnterior: vAnt || '—',
            valorNovo: vNov || '—',
            origem,
          });
        }
      });
    }
  });

  return novosLogs;
}

function sortEmendasList(list, sortConfig) {
  if (!sortConfig || !sortConfig.key) return list;
  const sorted = [...list];
  sorted.sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

    if (sortConfig.key === 'TOTAL' || sortConfig.key === 'PAGO') {
      const numA = parseCurrency(valA);
      const numB = parseCurrency(valB);
      return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
    }

    if (sortConfig.key === 'DATA DO PAGAMENTO') {
      const tA = parseBrDateTime(valA);
      const tB = parseBrDateTime(valB);
      if (!tA && tB) return 1;
      if (tA && !tB) return -1;
      return sortConfig.direction === 'asc' ? tA - tB : tB - tA;
    }

    if (sortConfig.key === 'ANO') {
      const numA = parseInt(valA) || 0;
      const numB = parseInt(valB) || 0;
      return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
    }

    if (sortConfig.key === 'NÚMERO DA EMENDA' || sortConfig.key === 'SGPe') {
      const strA = String(valA || '').replace(/[^\d/]/g, '');
      const strB = String(valB || '').replace(/[^\d/]/g, '');
      const partsA = strA.split('/');
      const partsB = strB.split('/');
      const numA = parseInt(partsA[0]) || 0;
      const yearA = parseInt(partsA[1]) || 0;
      const numB = parseInt(partsB[0]) || 0;
      const yearB = parseInt(partsB[1]) || 0;

      if (yearA !== yearB) {
        return sortConfig.direction === 'asc' ? yearA - yearB : yearB - yearA;
      }
      return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
    }

    const strA = String(valA || '').trim();
    const strB = String(valB || '').trim();
    if (!strA && strB) return 1;
    if (strA && !strB) return -1;

    const cmp = strA.localeCompare(strB, 'pt-BR', { sensitivity: 'base', numeric: true });
    return sortConfig.direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

const ENTITY_TYPE_META = {
  regiao: { label: 'Região', plural: 'Regiões', field: 'REGIÃO' },
  municipio: { label: 'Município', plural: 'Municípios', field: 'MUNICÍPIO' },
  modalidade: { label: 'Modalidade', plural: 'Modalidades', field: 'MODALIDADE' },
  entidade: { label: 'Entidade', plural: 'Entidades', field: 'RAZÃO SOCIAL' },
  uo: { label: 'Unidade Orçamentária', plural: 'Unidades Orçamentárias', field: 'UNIDADE ORÇAMENTÁRIA' },
  situacao: { label: 'Situação', plural: 'Situações', field: 'SITUAÇÃO' },
  articulador: { label: 'Articulador', plural: 'Articuladores', field: 'ARTICULADOR' },
  tema: { label: 'Tema', plural: 'Temas', field: 'TEMA' },
  ano: { label: 'Ano', plural: 'Anos', field: 'ANO' },
  lideranca: { label: 'Liderança', plural: 'Lideranças', field: 'LIDERANÇA' },
  dataPagamento: { label: 'Data de Pagamento', plural: 'Datas de Pagamento', field: 'DATA DO PAGAMENTO' },
};

const SORTABLE_EMENDAS = [
  { key: 'NÚMERO DA EMENDA', label: 'Número' },
  { key: 'ANO', label: 'Ano' },
  { key: 'REGIÃO', label: 'Região' },
  { key: 'MUNICÍPIO', label: 'Município' },
  { key: 'MODALIDADE', label: 'Modalidade' },
  { key: 'RAZÃO SOCIAL', label: 'Entidade' },
  { key: 'OBJETO', label: 'Objeto' },
  { key: 'UNIDADE ORÇAMENTÁRIA', label: 'Unidade Orçamentária' },
  { key: 'SGPe', label: 'SGPe' },
  { key: 'TEMA', label: 'Tema' },
  { key: 'ARTICULADOR', label: 'Articulador' },
  { key: 'LIDERANÇA', label: 'Liderança' },
  { key: 'SITUAÇÃO', label: 'Situação' },
  { key: 'TOTAL', label: 'Valor Total' },
  { key: 'PAGO', label: 'Valor Pago' },
  { key: 'DATA DO PAGAMENTO', label: 'Data de Pagamento' },
];

/* =================== componentes externos de filtro ======================= */
function SubclasseChecklist({ label, options, selected, onChange, placeholder = 'Buscar...' }) {
  const [busca, setBusca] = useState('');
  const visiveis = useMemo(() => {
    if (!busca.trim()) return options;
    const b = chaveMun(busca);
    return options.filter((o) => chaveMun(o).includes(b));
  }, [options, busca]);

  const alternar = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter((x) => x !== opt));
    else onChange([...selected, opt]);
  };

  return (
    <div className="border border-slate-200 bg-slate-50/50 p-2.5">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-extrabold uppercase text-slate-800">
          {label} {selected.length > 0 && <span className="text-pink-700">({selected.length})</span>}
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[11px] font-bold text-rose-700 hover:underline"
          >
            limpar
          </button>
        )}
      </div>

      {options.length > 6 && (
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={placeholder}
          className="w-full mb-1.5 px-2 py-1 text-xs bg-white border border-slate-300 focus:outline-none focus:border-sky-700"
        />
      )}

      <div className="max-h-36 overflow-y-auto space-y-1 pr-1 bg-white border border-slate-200 p-1.5">
        {visiveis.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer hover:bg-amber-50 px-1 py-0.5"
          >
            <input
              type="checkbox"
              className="accent-pink-600 w-3.5 h-3.5 flex-shrink-0"
              checked={selected.includes(opt)}
              onChange={() => alternar(opt)}
            />
            <span className="truncate" title={opt}>{opt}</span>
          </label>
        ))}
        {visiveis.length === 0 && (
          <p className="text-[11px] text-slate-400 italic text-center py-2">Nenhuma opção encontrada</p>
        )}
      </div>
    </div>
  );
}

function ClasseFiltroBotao({ id, label, icon: IconComp, count, corAtiva, isOpen, onToggle, children, largura = 'w-[min(92vw,540px)]' }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(id);
        }}
        className={`px-3 py-1.5 text-xs font-bold border rounded-xs flex items-center gap-1.5 transition-colors ${
          isOpen
            ? 'bg-slate-900 text-white border-slate-900'
            : count > 0
            ? corAtiva
            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-amber-50'
        }`}
      >
        {IconComp && <IconComp className="w-3.5 h-3.5 flex-shrink-0" />}
        <span>{label}</span>
        {count > 0 && (
          <span className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${isOpen ? 'bg-amber-300 text-slate-900' : 'bg-white/90 text-slate-900'}`}>
            {count}
          </span>
        )}
        <ChevronDownIcon className="w-3.5 h-3.5 opacity-70" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 top-full mt-1.5 z-50 ${largura} max-h-[75vh] overflow-y-auto bg-white border-2 border-slate-800 shadow-xl p-3.5 space-y-3`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* =============================== APP ====================================== */
export default function App() {
  const [emendas, setEmendas] = useState([]);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [lastSeenUpdateId, setLastSeenUpdateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('admin');
  const [mapGeoJson, setMapGeoJson] = useState(null);

  // Telas principais: 'inicio' | 'municipios' | 'emendas' | 'agendas' | 'updates' | 'entity' | 'detail' | 'edit' | 'settings'
  const [currentView, setCurrentView] = useState('inicio');
  const [viewMode, setViewMode] = useState('table');
  const [selectedEmenda, setSelectedEmenda] = useState(null);
  const [editingEmenda, setEditingEmenda] = useState(null);

  const [selectedEntityFicha, setSelectedEntityFicha] = useState(null);
  const [entityHistory, setEntityHistory] = useState([]);

  const [cardsPerPage, setCardsPerPage] = useState(50);
  const [currentCardPage, setCurrentCardPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Estado único de filtros (Classes e Subclasses) + controles do Mapa Único
  const [filtros, setFiltrosState] = useState(FILTROS_PADRAO);
  const setFiltros = (parcial) => setFiltrosState((prev) => ({ ...prev, ...parcial }));
  const [modoMapa, setModoMapa] = useState('matriz_agendas');
  const [metricaX, setMetricaX] = useState('vComp');

  const [openDropdown, setOpenDropdown] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Fontes seguras de servidor (sem URLs ou tokens no código)
  const { eleitoral, status: eleitoralStatus, erro: eleitoralErro, recarregar: recarregarEleitoral } = useEleitoralData();
  const { agenda, status: agendaStatus, erro: agendaErro, recarregar: recarregarAgenda } = useAgendaData();

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentCardPage(1);
  }, [filtros, sortConfig, cardsPerPage]);

  const normalizedEmendas = useMemo(() => {
    return emendas.map((e) => ({
      ...e,
      MODALIDADE: getModalidade(e),
      ANO: e.ANO ? String(e.ANO).trim() : (String(e['NÚMERO DA EMENDA'] || '').split('/')[1] || '').trim(),
      'DATA DO PAGAMENTO': getDataPagamento(e, updateHistory),
    }));
  }, [emendas, updateHistory]);

  // Opções únicas para todas as subclasses de filtros
  const opcoes = useMemo(() => {
    const munMap = new Map();
    normalizedEmendas.forEach((e) => {
      const n = e['MUNICÍPIO'];
      if (n && !munMap.has(chaveMun(n))) munMap.set(chaveMun(n), n);
    });
    if (eleitoral) {
      eleitoral.munis.forEach((m) => {
        if (!munMap.has(m.norm)) munMap.set(m.norm, tituloMunicipio(m.nome));
      });
    }

    const regMap = new Map();
    normalizedEmendas.forEach((e) => {
      if (e.REGIÃO && chaveMun(e.REGIÃO) !== 'ESTADUAL' && !regMap.has(chaveMun(e.REGIÃO))) {
        regMap.set(chaveMun(e.REGIÃO), e.REGIÃO);
      }
    });
    if (eleitoral) {
      eleitoral.regiaoPorChave.forEach((r) => {
        if (!regMap.has(chaveMun(r))) regMap.set(chaveMun(r), r);
      });
    }

    const artMap = new Map();
    normalizedEmendas.forEach((e) => {
      if (e.ARTICULADOR && !artMap.has(chaveMun(e.ARTICULADOR))) artMap.set(chaveMun(e.ARTICULADOR), e.ARTICULADOR);
    });
    if (agenda) {
      agenda.articuladores.forEach((a) => {
        if (!artMap.has(chaveMun(a))) artMap.set(chaveMun(a), a);
      });
    }

    return {
      municipios: [...munMap.values()].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      regioes: [...regMap.values()].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      associacoes: eleitoral ? [...new Set([...eleitoral.associacaoPorChave.values()])].sort((a, b) => a.localeCompare(b, 'pt-BR')) : [],
      articuladores: [...artMap.values()].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      classesAgenda: agenda ? agenda.classes : [],
      anosAgenda: agenda ? agenda.anos : [],
      modalidades: [...new Set(normalizedEmendas.map((e) => e.MODALIDADE).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      entidades: [...new Set(normalizedEmendas.map((e) => e['RAZÃO SOCIAL']).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      temas: [...new Set(normalizedEmendas.map((e) => e.TEMA).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      uos: [...new Set(normalizedEmendas.map((e) => e['UNIDADE ORÇAMENTÁRIA']).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      situacoes: [...new Set(normalizedEmendas.map((e) => e.SITUAÇÃO).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      anosEmenda: [...new Set(normalizedEmendas.map((e) => String(e.ANO || '').trim()).filter(Boolean))].sort(),
    };
  }, [normalizedEmendas, eleitoral, agenda]);

  // Motor unificado (alimenta Início, Mapa Único, Municípios, Emendas e Agendas com os MESMOS filtros)
  const dadosUnificados = useMemo(
    () =>
      calcularPainelUnificado({
        emendasTodas: normalizedEmendas,
        eleitoral,
        agenda,
        filtros,
        modoMapa,
        metricaX,
      }),
    [normalizedEmendas, eleitoral, agenda, filtros, modoMapa, metricaX]
  );

  const emendasOrdenadas = useMemo(
    () => sortEmendasList(dadosUnificados.emendasFiltradas, sortConfig),
    [dadosUnificados.emendasFiltradas, sortConfig]
  );

  const mergeAndSaveHistory = (serverHist = [], localDiffs = [], currentHist = []) => {
    const combined = [...serverHist, ...localDiffs, ...currentHist];
    const seen = new Set();
    const deduped = [];
    for (const item of combined) {
      if (!item) continue;
      const signature = `${item.dataHora?.slice(0, 16)}|${item.numeroEmenda}|${item.campo}|${item.valorAnterior}|${item.valorNovo}`;
      if (!seen.has(signature)) {
        seen.add(signature);
        deduped.push(item);
      }
    }
    deduped.sort((a, b) => parseBrDateTime(b.dataHora) - parseBrDateTime(a.dataHora));
    const limited = deduped.slice(0, 500);
    setUpdateHistory(limited);
    localStorage.setItem('tabulum_emendas_history', JSON.stringify(limited));
    return limited;
  };

  const processarPayloadServidor = (rawPayload, baseAnterior = [], histAnterior = []) => {
    let listaEmendas = [];
    let histServidor = [];

    if (Array.isArray(rawPayload)) {
      listaEmendas = rawPayload.map((item) => ({ ...item }));
      if (listaEmendas.length > 0 && Array.isArray(listaEmendas[0].__historico)) {
        histServidor = listaEmendas[0].__historico;
        delete listaEmendas[0].__historico;
      }
    } else if (rawPayload && typeof rawPayload === 'object') {
      if (Array.isArray(rawPayload.emendas)) {
        listaEmendas = rawPayload.emendas.map((item) => ({ ...item }));
        if (listaEmendas.length > 0 && Array.isArray(listaEmendas[0].__historico)) {
          histServidor = listaEmendas[0].__historico;
          delete listaEmendas[0].__historico;
        }
      }
      if (Array.isArray(rawPayload.historico)) {
        histServidor = rawPayload.historico;
      }
    }

    if (listaEmendas.length > 0) {
      const diffs = histServidor.length === 0 ? gerarDiffsLocais(baseAnterior, listaEmendas, 'Sincronização Planilha') : [];
      mergeAndSaveHistory(histServidor, diffs, histAnterior);
      setEmendas(listaEmendas);
      localStorage.setItem('tabulum_emendas_data', JSON.stringify(listaEmendas));
    }
  };

  useEffect(() => {
    document.title = 'TABULUM — Mandato & Território';

    const loadData = async () => {
      let cachedEmendas = [];
      let cachedHistory = [];

      const storedEmendas = localStorage.getItem('tabulum_emendas_data');
      if (storedEmendas) {
        try {
          cachedEmendas = JSON.parse(storedEmendas);
          setEmendas(cachedEmendas);
        } catch (e) {}
      }

      const storedHistory = localStorage.getItem('tabulum_emendas_history');
      if (storedHistory) {
        try {
          cachedHistory = JSON.parse(storedHistory);
          setUpdateHistory(cachedHistory);
        } catch (e) {}
      }

      const storedLastSeen = localStorage.getItem('tabulum_emendas_last_seen_update');
      if (storedLastSeen) setLastSeenUpdateId(storedLastSeen);

      const storedAuth = sessionStorage.getItem('tabulum_emendas_auth');
      if (storedAuth === 'true') setIsAdmin(true);
      const storedPass = localStorage.getItem('tabulum_emendas_pass');
      if (storedPass) setAdminPassword(storedPass);

      try {
        const response = await fetch('/api/emendas');
        if (response.ok) {
          const newData = await response.json();
          processarPayloadServidor(newData, cachedEmendas, cachedHistory);
        }
      } catch (error) {
        console.error('Erro ao sincronizar com servidor interno:', error);
      }
      setLoading(false);
    };

    loadData();

    fetch('https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-42-mun.json')
      .then((res) => res.json())
      .then((data) => setMapGeoJson(data))
      .catch((err) => console.error('Erro ao carregar mapa:', err));
  }, []);

  const clearAllFilters = () => {
    setFiltrosState(FILTROS_PADRAO);
  };

  const resetToFrontPage = () => {
    setCurrentView('inicio');
    setSelectedEntityFicha(null);
    setEntityHistory([]);
    clearAllFilters();
    setSortConfig({ key: null, direction: 'asc' });
  };

  const recarregarTudo = async () => {
    recarregarEleitoral();
    recarregarAgenda();
    try {
      const response = await fetch('/api/emendas');
      if (response.ok) {
        const newData = await response.json();
        processarPayloadServidor(newData, emendas, updateHistory);
      }
    } catch (err) {
      console.error('Erro ao recarregar emendas:', err);
    }
  };

  const syncWithGoogleSheet = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/emendas');
      if (!response.ok) throw new Error('Falha ao carregar do servidor interno.');
      const newData = await response.json();
      processarPayloadServidor(newData, emendas, updateHistory);
      recarregarEleitoral();
      recarregarAgenda();
      alert('Sincronização concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar com proxy interno:', error);
      alert('Erro ao sincronizar. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const saveEmendasLocally = (data) => {
    localStorage.setItem('tabulum_emendas_data', JSON.stringify(data));
    setEmendas(data);
  };

  const saveSettingsLocally = (pass) => {
    if (pass) {
      localStorage.setItem('tabulum_emendas_pass', pass);
      setAdminPassword(pass);
    }
  };

  const handleSaveEmenda = async () => {
    if (!editingEmenda) return;
    try {
      const emendaAntiga = emendas.find((e) => e['NÚMERO DA EMENDA'] === editingEmenda['NÚMERO DA EMENDA']);
      const diffsEdicao = emendaAntiga ? gerarDiffsLocais([emendaAntiga], [editingEmenda], 'Painel Mandato') : [];
      if (diffsEdicao.length > 0) mergeAndSaveHistory([], diffsEdicao, updateHistory);

      const updatedEmendas = emendas.map((e) =>
        e['NÚMERO DA EMENDA'] === editingEmenda['NÚMERO DA EMENDA'] ? editingEmenda : e
      );
      if (!emendas.some((e) => e['NÚMERO DA EMENDA'] === editingEmenda['NÚMERO DA EMENDA'])) {
        updatedEmendas.push(editingEmenda);
      }
      saveEmendasLocally(updatedEmendas);
      setSelectedEmenda(editingEmenda);
      setEditingEmenda(null);
      setCurrentView('detail');

      fetch('/api/emendas', {
        method: 'POST',
        body: JSON.stringify({ action: 'update', data: editingEmenda }),
        headers: { 'Content-Type': 'application/json' },
      }).catch((err) => console.error('Erro ao enviar para o servidor:', err));
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const csvText = evt.target.result;
        const rows = parseCSV(csvText);
        if (rows.length > 1) {
          const headers = rows[0];
          const newData = rows
            .slice(1)
            .map((row) => {
              const obj = {};
              headers.forEach((header, index) => { obj[header] = row[index] || ''; });
              return obj;
            })
            .filter((em) => em['NÚMERO DA EMENDA']);
          const diffs = gerarDiffsLocais(emendas, newData, 'Importação CSV');
          mergeAndSaveHistory([], diffs, updateHistory);
          saveEmendasLocally(newData);
          alert('Base importada com sucesso via CSV!');
        } else {
          alert('O arquivo CSV parece estar vazio ou o formato não foi reconhecido.');
        }
      } catch (error) {
        alert('Erro ao processar arquivo: ' + error.message);
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleChangePassword = (newPassword) => {
    saveSettingsLocally(newPassword);
    alert('Senha alterada com sucesso!');
  };

  const handleLogin = () => {
    if (loginInput === adminPassword) {
      setIsAdmin(true);
      sessionStorage.setItem('tabulum_emendas_auth', 'true');
      setShowLoginModal(false);
      setLoginInput('');
    } else {
      alert('Senha incorreta.');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('tabulum_emendas_auth');
  };

  const confirmAction = (title, message, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      },
    });
  };

  const openEntityFicha = (type, value, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!value || String(value).trim() === '' || String(value).trim() === '-') return;
    const cleanVal = String(value).trim();

    if (currentView === 'entity' && selectedEntityFicha) {
      if (selectedEntityFicha.type === type && chaveMun(selectedEntityFicha.value) === chaveMun(cleanVal)) return;
      setEntityHistory((prev) => [...prev, selectedEntityFicha]);
    } else {
      setEntityHistory([]);
    }

    setSelectedEntityFicha({ type, value: cleanVal });
    setCurrentView('entity');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEmendaByNumber = (numEmenda, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const target = normalizedEmendas.find(
      (em) => String(em['NÚMERO DA EMENDA'] || '').trim() === String(numEmenda || '').trim()
    );
    if (target) {
      setSelectedEmenda(target);
      setOpenDropdown(null);
      setCurrentView('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBackFromEntityFicha = () => {
    if (entityHistory.length > 0) {
      const previous = entityHistory[entityHistory.length - 1];
      setEntityHistory((prev) => prev.slice(0, -1));
      setSelectedEntityFicha(previous);
    } else {
      setSelectedEntityFicha(null);
      setCurrentView('inicio');
    }
  };

  const applyEntityFilterToMain = (type, value) => {
    const proximo = { ...FILTROS_PADRAO };
    if (type === 'articulador') proximo.articuladores = [value];
    if (type === 'municipio') proximo.municipios = [value];
    if (type === 'regiao') proximo.regioes = [value];
    if (type === 'modalidade') proximo.modalidades = [value];
    if (type === 'entidade') proximo.entidades = [value];
    if (type === 'tema') proximo.temas = [value];
    if (type === 'uo') proximo.uos = [value];
    if (type === 'situacao') proximo.situacoes = [value];
    if (type === 'ano') proximo.anosEmenda = [String(value)];
    setFiltrosState(proximo);
    setSelectedEntityFicha(null);
    setEntityHistory([]);
    setCurrentView('inicio');
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const exportRowsToCSV = (rowsToExport, filename = 'tabulum_dados.csv') => {
    if (!rowsToExport || rowsToExport.length === 0) {
      alert('Nenhum dado disponível para exportar.');
      return;
    }
    const headers = Array.from(new Set(rowsToExport.flatMap(Object.keys)));
    const csvRows = [headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',')];
    rowsToExport.forEach((row) => {
      const values = headers.map((header) => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSituacaoClasses = (situacao) => {
    const s = String(situacao || '').toLowerCase();
    if (s === 'pago') return 'bg-sky-700 text-white border-slate-700 hover:bg-sky-800';
    if (s.includes('parcial')) return 'bg-sky-100 text-sky-950 border-sky-700 hover:bg-sky-200';
    if (s.includes('pagar')) return 'bg-amber-300 text-slate-900 border-slate-700 hover:bg-amber-400';
    return 'bg-slate-100 text-slate-800 border-slate-400 hover:bg-slate-200';
  };

  const getModalidadeClasses = (modalidade) => {
    const m = String(modalidade || '').toLowerCase();
    if (m.includes('convênio') || m.includes('convenio') || m.includes('entidade')) {
      return 'bg-rose-50 text-rose-800 border-rose-600/70 hover:bg-rose-100';
    }
    if (m.includes('transferência') || m.includes('transferencia')) {
      return 'bg-sky-50 text-sky-800 border-sky-600/70 hover:bg-sky-100';
    }
    if (m.includes('execução') || m.includes('execucao') || m.includes('órgão')) {
      return 'bg-amber-50 text-amber-900 border-amber-500/80 hover:bg-amber-100';
    }
    return 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100';
  };

  const getUpdateTypeBadge = (tipo, campo) => {
    const t = String(tipo || '').toUpperCase();
    const c = String(campo || '').toUpperCase();
    if (t === 'PAGAMENTO' || c === 'PAGO') return { label: 'Pagamento', classes: 'bg-sky-700 text-white border-slate-800' };
    if (t === 'SITUACAO' || c === 'SITUAÇÃO') return { label: 'Situação', classes: 'bg-amber-300 text-slate-900 border-slate-700' };
    if (t === 'NOVA_EMENDA') return { label: 'Nova Emenda', classes: 'bg-rose-700 text-white border-rose-900' };
    if (t === 'SGPE' || c === 'SGPE') return { label: 'SGPe', classes: 'bg-sky-50 text-sky-900 border-sky-600' };
    if (t === 'EDICAO_MANUAL') return { label: 'Edição Mandato', classes: 'bg-rose-50 text-rose-800 border-rose-600' };
    return { label: campo || 'Atualização', classes: 'bg-slate-100 text-slate-700 border-slate-300' };
  };

  const unreadUpdatesCount = useMemo(() => {
    if (!updateHistory || updateHistory.length === 0) return 0;
    if (!lastSeenUpdateId) return Math.min(updateHistory.length, 7);
    const idx = updateHistory.findIndex((u) => u.id === lastSeenUpdateId);
    return idx === -1 ? Math.min(updateHistory.length, 7) : idx;
  }, [updateHistory, lastSeenUpdateId]);

  const handleToggleNotifications = (e) => {
    e.stopPropagation();
    const isOpening = openDropdown !== 'notifications';
    setOpenDropdown(isOpening ? 'notifications' : null);
    if (isOpening && updateHistory.length > 0) {
      const latestId = updateHistory[0].id;
      setLastSeenUpdateId(latestId);
      localStorage.setItem('tabulum_emendas_last_seen_update', latestId);
    }
  };

  // Contagens por Classe de filtro + Etiquetas ativas removíveis
  const contTerritorio =
    filtros.regioes.length + filtros.associacoes.length + filtros.municipios.length + (filtros.excluirFloripa ? 1 : 0);
  const contPresenca =
    filtros.articuladores.length +
    filtros.classesAgenda.length +
    (filtros.periodoAgenda !== FILTROS_PADRAO.periodoAgenda ? 1 : 0) +
    (!filtros.apenasPresenciais ? 1 : 0);
  const contEmendas =
    filtros.anosEmenda.length +
    filtros.situacoes.length +
    filtros.modalidades.length +
    filtros.entidades.length +
    filtros.temas.length +
    filtros.uos.length +
    (filtros.incluirExecDireta ? 1 : 0);
  const contEleicoes =
    (filtros.baseKey ? 1 : 0) + (filtros.compKey ? 1 : 0) + (filtros.criterio !== 'media' ? 1 : 0);

  const etiquetasAtivas = useMemo(() => {
    const list = [];
    if (filtros.excluirFloripa) list.push({ id: 'fln', label: 'Só interior (sem Florianópolis)', onRemove: () => setFiltros({ excluirFloripa: false }) });
    filtros.regioes.forEach((v) => list.push({ id: `reg_${v}`, label: `Região: ${v}`, onRemove: () => setFiltros({ regioes: filtros.regioes.filter((x) => x !== v) }) }));
    filtros.associacoes.forEach((v) => list.push({ id: `ass_${v}`, label: `Associação: ${v.split(' - ')[0]}`, onRemove: () => setFiltros({ associacoes: filtros.associacoes.filter((x) => x !== v) }) }));
    filtros.municipios.forEach((v) => list.push({ id: `mun_${v}`, label: `Cidade: ${v}`, onRemove: () => setFiltros({ municipios: filtros.municipios.filter((x) => x !== v) }) }));
    filtros.articuladores.forEach((v) => list.push({ id: `art_${v}`, label: `Articulador: ${v}`, onRemove: () => setFiltros({ articuladores: filtros.articuladores.filter((x) => x !== v) }) }));
    if (filtros.periodoAgenda !== FILTROS_PADRAO.periodoAgenda) {
      const pLabel = PERIODOS_AGENDA.find((p) => p.key === filtros.periodoAgenda)?.label || `Anos: ${filtros.anosAgenda.join(', ')}`;
      list.push({ id: 'per', label: `Agendas: ${pLabel}`, onRemove: () => setFiltros({ periodoAgenda: FILTROS_PADRAO.periodoAgenda, anosAgenda: [] }) });
    }
    if (!filtros.apenasPresenciais) list.push({ id: 'onl', label: 'Incluindo agendas online', onRemove: () => setFiltros({ apenasPresenciais: true }) });
    filtros.classesAgenda.forEach((v) => list.push({ id: `cls_${v}`, label: `Tipo agenda: ${v}`, onRemove: () => setFiltros({ classesAgenda: filtros.classesAgenda.filter((x) => x !== v) }) }));
    filtros.anosEmenda.forEach((v) => list.push({ id: `ano_${v}`, label: `Ano emenda: ${v}`, onRemove: () => setFiltros({ anosEmenda: filtros.anosEmenda.filter((x) => x !== v) }) }));
    filtros.situacoes.forEach((v) => list.push({ id: `sit_${v}`, label: `Situação: ${v}`, onRemove: () => setFiltros({ situacoes: filtros.situacoes.filter((x) => x !== v) }) }));
    filtros.modalidades.forEach((v) => list.push({ id: `mod_${v}`, label: `Modalidade: ${v}`, onRemove: () => setFiltros({ modalidades: filtros.modalidades.filter((x) => x !== v) }) }));
    filtros.entidades.forEach((v) => list.push({ id: `ent_${v}`, label: `Entidade: ${v}`, onRemove: () => setFiltros({ entidades: filtros.entidades.filter((x) => x !== v) }) }));
    filtros.temas.forEach((v) => list.push({ id: `tem_${v}`, label: `Tema: ${v}`, onRemove: () => setFiltros({ temas: filtros.temas.filter((x) => x !== v) }) }));
    filtros.uos.forEach((v) => list.push({ id: `uo_${v}`, label: `Unid. Orç.: ${v}`, onRemove: () => setFiltros({ uos: filtros.uos.filter((x) => x !== v) }) }));
    if (filtros.incluirExecDireta) list.push({ id: 'exec', label: 'Inclui Execução Direta', onRemove: () => setFiltros({ incluirExecDireta: false }) });
    filtros.resEmenda.forEach((k) => list.push({ id: `re_${k}`, label: `Emendas: ${RESULTADOS_EMENDAS[k]?.label || k}`, onRemove: () => setFiltros({ resEmenda: filtros.resEmenda.filter((x) => x !== k) }) }));
    filtros.resAgenda.forEach((k) => list.push({ id: `ra_${k}`, label: `Agendas: ${RESULTADOS_AGENDAS[k]?.label || k}`, onRemove: () => setFiltros({ resAgenda: filtros.resAgenda.filter((x) => x !== k) }) }));
    if (filtros.quadrante4) list.push({ id: 'q4', label: QUADRANTES_4[filtros.quadrante4]?.label || filtros.quadrante4, onRemove: () => setFiltros({ quadrante4: '' }) });
    return list;
  }, [filtros]);

  const temAlgumFiltro = Boolean(filtros.busca) || etiquetasAtivas.length > 0 || contEleicoes > 0;
  const mostrarBarraFiltros = ['inicio', 'municipios', 'emendas', 'agendas'].includes(currentView);
  const toggleDropdown = (id) => setOpenDropdown((prev) => (prev === id ? null : id));

  const toggleAnoAgendaCustom = (ano) => {
    const atual = filtros.periodoAgenda === 'custom' ? filtros.anosAgenda : [];
    const prox = atual.includes(ano) ? atual.filter((x) => x !== ano) : [...atual, ano].sort();
    setFiltros({ periodoAgenda: 'custom', anosAgenda: prox });
  };

  /* =================== tabela / cards de Emendas ========================== */
  const renderEmendasTableOrCards = (rows, activeSortConfig, onRequestSort, activeViewMode) => {
    const SortableHeader = ({ label, sortKey, extraClasses = '' }) => {
      const isActive = activeSortConfig?.key === sortKey;
      return (
        <th
          className={`py-2.5 text-left text-[11px] font-bold text-slate-800 uppercase cursor-pointer hover:bg-amber-300/70 transition-colors border-r border-slate-300 print:border-slate-800 select-none ${extraClasses}`}
          onClick={() => onRequestSort(sortKey)}
          title={`Ordenar por ${label}`}
        >
          <div className="flex items-center justify-between gap-1">
            <span>{label}</span>
            {isActive ? (
              activeSortConfig.direction === 'asc' ? <ChevronUpIcon className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronDownIcon className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <ChevronUpIcon className="w-3.5 h-3.5 opacity-20 print:hidden flex-shrink-0" />
            )}
          </div>
        </th>
      );
    };

    if (activeViewMode === 'table') {
      return (
        <div className="bg-white border border-slate-300 overflow-x-auto shadow-xs print:shadow-none print:border print:overflow-visible print:w-full">
          <table className={`${eleitoral ? 'min-w-[1350px]' : 'min-w-[1200px]'} w-full border-collapse table-fixed print:min-w-0 print:w-full`}>
            <thead className="bg-amber-200/85 border-b border-slate-400 print:bg-amber-200">
              <tr>
                <SortableHeader label="Número" sortKey="NÚMERO DA EMENDA" extraClasses="w-[82px] px-2.5 print:w-[7%]" />
                <SortableHeader label="Região" sortKey="REGIÃO" extraClasses="w-[105px] px-2.5 print:w-[8%]" />
                <SortableHeader label="Município" sortKey="MUNICÍPIO" extraClasses="w-[125px] px-2.5 print:w-[10%]" />
                {eleitoral && (
                  <th
                    className="w-[150px] px-2 py-2.5 text-left text-[11px] font-bold text-slate-800 uppercase border-r border-slate-300 print:border-slate-800 print:w-[8%]"
                    title="Votos do mandato no município"
                  >
                    Votos (evolução)
                  </th>
                )}
                <SortableHeader label="Modalidade" sortKey="MODALIDADE" extraClasses="w-[120px] px-2 print:w-[9%]" />
                <SortableHeader label="Entidade" sortKey="RAZÃO SOCIAL" extraClasses="w-[155px] px-2.5 print:w-[13%]" />
                <SortableHeader label="Objeto" sortKey="OBJETO" extraClasses="w-[34%] min-w-[300px] px-3 print:w-[21%]" />
                <SortableHeader label="Unid. Orç." sortKey="UNIDADE ORÇAMENTÁRIA" extraClasses="w-[105px] px-2 print:w-[7%]" />
                <SortableHeader label="Articulador" sortKey="ARTICULADOR" extraClasses="w-[95px] px-2.5 print:w-[7%]" />
                <SortableHeader label="Situação" sortKey="SITUAÇÃO" extraClasses="w-[95px] px-2 print:w-[7%]" />
                <SortableHeader label="Total" sortKey="TOTAL" extraClasses="w-[108px] px-2.5 print:w-[7%]" />
                <SortableHeader label="Pago" sortKey="PAGO" extraClasses="w-[108px] px-2.5 border-r-0 print:w-[7%]" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 print:text-[9px]">
              {rows.map((emenda, idx) => (
                <tr
                  key={emenda['NÚMERO DA EMENDA'] || idx}
                  onClick={() => { setSelectedEmenda(emenda); setCurrentView('detail'); }}
                  className="hover:bg-amber-50/50 cursor-pointer transition-colors print:break-inside-avoid print:cursor-auto"
                >
                  <td className="px-2.5 py-2.5 text-xs print:text-[9px] font-bold text-slate-900 border-r border-slate-200 align-top whitespace-normal break-words">
                    {emenda['NÚMERO DA EMENDA']}
                  </td>
                  <td
                    onClick={(e) => emenda.REGIÃO && openEntityFicha('regiao', emenda.REGIÃO, e)}
                    className="px-2.5 py-2.5 text-[11px] print:text-[9px] font-medium uppercase text-slate-700 hover:text-sky-700 hover:underline border-r border-slate-200 align-top whitespace-normal break-words leading-snug"
                  >
                    {emenda.REGIÃO || '-'}
                  </td>
                  <td
                    onClick={(e) => emenda['MUNICÍPIO'] && openEntityFicha('municipio', emenda['MUNICÍPIO'], e)}
                    className="px-2.5 py-2.5 text-xs print:text-[9px] font-bold uppercase text-sky-700 hover:text-rose-700 hover:underline border-r border-slate-200 align-top whitespace-normal break-words leading-snug"
                  >
                    {emenda['MUNICÍPIO']}
                  </td>
                  {eleitoral && (
                    <td
                      onClick={(e) => emenda['MUNICÍPIO'] && openEntityFicha('municipio', emenda['MUNICÍPIO'], e)}
                      className="px-2 py-2.5 border-r border-slate-200 align-top cursor-pointer"
                    >
                      <VotosEvolucao eleitoral={eleitoral} municipio={emenda['MUNICÍPIO']} />
                    </td>
                  )}
                  <td
                    onClick={(e) => emenda.MODALIDADE && openEntityFicha('modalidade', emenda.MODALIDADE, e)}
                    className="px-2 py-2.5 border-r border-slate-200 align-top"
                  >
                    <span className={`block w-full text-center border px-1.5 py-0.5 text-[10px] print:text-[8px] font-semibold uppercase whitespace-normal break-words leading-tight transition-colors ${getModalidadeClasses(emenda.MODALIDADE)}`}>
                      {emenda.MODALIDADE || '-'}
                    </span>
                  </td>
                  <td
                    onClick={(e) => emenda['RAZÃO SOCIAL'] && openEntityFicha('entidade', emenda['RAZÃO SOCIAL'], e)}
                    className={`px-2.5 py-2.5 text-xs print:text-[9px] font-medium border-r border-slate-200 align-top whitespace-normal break-words leading-snug ${
                      emenda['RAZÃO SOCIAL'] ? 'text-slate-900 hover:text-rose-700 hover:underline' : 'text-slate-400'
                    }`}
                  >
                    {emenda['RAZÃO SOCIAL'] || '-'}
                  </td>
                  <td className="px-3 py-2.5 text-xs print:text-[9px] text-slate-800 border-r border-slate-200 align-top whitespace-normal break-words leading-relaxed">
                    {emenda.OBJETO}
                  </td>
                  <td
                    onClick={(e) => emenda['UNIDADE ORÇAMENTÁRIA'] && openEntityFicha('uo', emenda['UNIDADE ORÇAMENTÁRIA'], e)}
                    className="px-2 py-2.5 text-[11px] print:text-[9px] font-semibold uppercase text-slate-700 hover:text-sky-700 hover:underline border-r border-slate-200 align-top text-center whitespace-normal break-words leading-snug"
                  >
                    {emenda['UNIDADE ORÇAMENTÁRIA'] || '-'}
                  </td>
                  <td
                    onClick={(e) => emenda.ARTICULADOR && openEntityFicha('articulador', emenda.ARTICULADOR, e)}
                    className="px-2.5 py-2.5 text-xs print:text-[9px] font-semibold text-rose-700 hover:text-sky-700 hover:underline border-r border-slate-200 align-top whitespace-normal break-words leading-snug"
                  >
                    {emenda.ARTICULADOR || '-'}
                  </td>
                  <td
                    onClick={(e) => emenda.SITUAÇÃO && openEntityFicha('situacao', emenda.SITUAÇÃO, e)}
                    className="px-2 py-2.5 border-r border-slate-200 align-top"
                  >
                    <span className={`block w-full text-center border px-1 py-0.5 text-[10px] print:text-[8px] font-semibold uppercase whitespace-normal break-words leading-tight transition-colors ${getSituacaoClasses(emenda.SITUAÇÃO)}`}>
                      {emenda.SITUAÇÃO || 'Indefinida'}
                    </span>
                  </td>
                  <td className="px-2.5 py-2.5 text-xs print:text-[9px] font-bold text-slate-900 border-r border-slate-200 align-top text-right whitespace-nowrap">
                    {formatCurrency(parseCurrency(emenda.TOTAL))}
                  </td>
                  <td className="px-2.5 py-2.5 text-xs print:text-[9px] font-semibold text-sky-800 align-top text-right border-r-0 whitespace-nowrap">
                    <div>{parseCurrency(emenda.PAGO) > 0 ? formatCurrency(parseCurrency(emenda.PAGO)) : '-'}</div>
                    {emenda['DATA DO PAGAMENTO'] && (
                      <div className="text-[10px] font-normal text-slate-500 mt-0.5">{emenda['DATA DO PAGAMENTO']}</div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={eleitoral ? 12 : 11} className="px-6 py-10 text-center font-medium text-slate-400 uppercase text-xs">
                    Nenhuma emenda encontrada com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="bg-slate-50 px-4 py-2 text-xs text-slate-600 flex flex-wrap justify-between gap-2 border-t border-slate-300 print:hidden">
            <span>Exibindo todas as <strong>{rows.length}</strong> emendas filtradas</span>
            <span className="text-slate-500">Clique em qualquer Município, Região, Entidade ou Articulador para abrir a Ficha Completa</span>
          </div>
        </div>
      );
    }

    const totalCards = rows.length;
    const effectivePerPage = cardsPerPage === 'all' ? (totalCards || 1) : Number(cardsPerPage);
    const totalPages = Math.max(Math.ceil(totalCards / effectivePerPage), 1);
    const safePage = Math.min(currentCardPage, totalPages);
    const startIndex = cardsPerPage === 'all' ? 0 : (safePage - 1) * effectivePerPage;
    const endIndex = cardsPerPage === 'all' ? totalCards : Math.min(startIndex + effectivePerPage, totalCards);
    const paginatedCards = rows.slice(startIndex, endIndex);

    const PaginationBar = () => (
      <div className="bg-white border border-slate-300 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 print:hidden">
        <div>
          Exibindo <strong>{totalCards > 0 ? startIndex + 1 : 0}–{endIndex}</strong> de <strong>{totalCards}</strong> emendas
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-slate-600">
            <span>Por página:</span>
            <select
              value={cardsPerPage}
              onChange={(e) => setCardsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-2 py-0.5 border border-slate-300 rounded-xs bg-slate-50 text-slate-800 font-semibold cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">Todas</option>
            </select>
          </label>
          {cardsPerPage !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-1 ml-2">
              <button
                disabled={safePage <= 1}
                onClick={() => { setCurrentCardPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-2 py-0.5 border border-slate-300 bg-slate-50 hover:bg-amber-100 disabled:opacity-40 font-medium"
              >
                ← Anterior
              </button>
              <span className="px-2 font-semibold text-slate-800">Pág. {safePage} de {totalPages}</span>
              <button
                disabled={safePage >= totalPages}
                onClick={() => { setCurrentCardPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-2 py-0.5 border border-slate-300 bg-slate-50 hover:bg-amber-100 disabled:opacity-40 font-medium"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        <PaginationBar />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
          {paginatedCards.map((emenda, idx) => (
            <div
              key={emenda['NÚMERO DA EMENDA'] || idx}
              className="border border-slate-300 bg-white shadow-xs hover:border-slate-500 transition-all flex flex-col cursor-pointer print:break-inside-avoid"
              onClick={() => { setSelectedEmenda(emenda); setCurrentView('detail'); }}
            >
              <div className="bg-amber-100/90 border-b border-slate-300 px-3.5 py-2.5 flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">#{emenda['NÚMERO DA EMENDA']}</span>
                  {emenda['UNIDADE ORÇAMENTÁRIA'] && (
                    <button
                      onClick={(e) => openEntityFicha('uo', emenda['UNIDADE ORÇAMENTÁRIA'], e)}
                      className="bg-white border border-slate-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-700 hover:bg-sky-700 hover:text-white"
                    >
                      {emenda['UNIDADE ORÇAMENTÁRIA']}
                    </button>
                  )}
                </div>
                <button
                  onClick={(e) => emenda.SITUAÇÃO && openEntityFicha('situacao', emenda.SITUAÇÃO, e)}
                  className={`border px-2 py-0.5 text-[10px] font-semibold uppercase ${getSituacaoClasses(emenda.SITUAÇÃO)}`}
                >
                  {emenda.SITUAÇÃO || 'Indefinida'}
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col space-y-2.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <button
                    onClick={(e) => emenda['MUNICÍPIO'] && openEntityFicha('municipio', emenda['MUNICÍPIO'], e)}
                    className="flex items-start text-left hover:underline"
                  >
                    <MapPinIcon className="w-3.5 h-3.5 mr-1 mt-0.5 text-sky-700 flex-shrink-0" />
                    <span className="text-sky-700 font-bold uppercase text-xs">{emenda['MUNICÍPIO']}</span>
                  </button>
                  {emenda.REGIÃO && (
                    <button
                      onClick={(e) => openEntityFicha('regiao', emenda.REGIÃO, e)}
                      className="flex items-start text-left hover:underline"
                    >
                      <MapIcon className="w-3.5 h-3.5 mr-1 mt-0.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-500 font-semibold uppercase text-[11px]">{emenda.REGIÃO}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-b border-slate-100 py-1.5 gap-2">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Modalidade:</span>
                  <button
                    onClick={(e) => emenda.MODALIDADE && openEntityFicha('modalidade', emenda.MODALIDADE, e)}
                    className={`border px-2 py-0.5 text-[10px] font-semibold uppercase ${getModalidadeClasses(emenda.MODALIDADE)}`}
                  >
                    {emenda.MODALIDADE || '-'}
                  </button>
                </div>

                {emenda['RAZÃO SOCIAL'] && (
                  <div
                    onClick={(e) => openEntityFicha('entidade', emenda['RAZÃO SOCIAL'], e)}
                    className="bg-rose-50/60 border-l-2 border-rose-700 px-2.5 py-1.5 hover:bg-rose-100/70"
                  >
                    <p className="text-[10px] font-semibold uppercase text-rose-700">Entidade</p>
                    <p className="text-xs font-semibold text-slate-900 hover:underline">{emenda['RAZÃO SOCIAL']}</p>
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Objeto</p>
                  <p className="text-xs text-slate-800 leading-relaxed">{emenda.OBJETO}</p>
                </div>
              </div>

              <div className="bg-slate-50/80 border-t border-slate-200 px-3.5 py-2.5 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Articulador</p>
                  <button
                    onClick={(e) => emenda.ARTICULADOR && openEntityFicha('articulador', emenda.ARTICULADOR, e)}
                    className="text-rose-700 font-semibold text-xs uppercase hover:underline text-left"
                  >
                    {emenda.ARTICULADOR || '-'}
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Total</p>
                  <p className="font-bold text-slate-900 text-sm leading-none">{formatCurrency(parseCurrency(emenda.TOTAL))}</p>
                  {parseCurrency(emenda.PAGO) > 0 && (
                    <p className="text-[11px] font-semibold text-sky-800 mt-1">Pago: {formatCurrency(parseCurrency(emenda.PAGO))}</p>
                  )}
                  {emenda['DATA DO PAGAMENTO'] && (
                    <p className="text-[10px] text-slate-500 mt-0.5">Em {emenda['DATA DO PAGAMENTO']}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {totalCards > 0 && <PaginationBar />}
      </div>
    );
  };

  /* =================== tela: EMENDAS (base completa) ====================== */
  const renderEmendasView = () => {
    const totalPrevisto = emendasOrdenadas.reduce((s, e) => s + parseCurrency(e.TOTAL), 0);
    const totalPago = emendasOrdenadas.reduce((s, e) => s + parseCurrency(e.PAGO), 0);
    const rowsExport = eleitoral
      ? emendasOrdenadas.map((e) => ({ ...e, 'EVOLUÇÃO DE VOTOS DO MUNICÍPIO': textoEvolucaoMunicipio(eleitoral, e['MUNICÍPIO']) }))
      : emendasOrdenadas;

    return (
      <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold uppercase text-slate-900">
              Base Completa de Emendas ({fmtInt(emendasOrdenadas.length)})
            </h2>
            <p className="text-xs text-slate-600">
              Destinado: <strong>{formatCurrency(totalPrevisto)}</strong> • Pago: <strong className="text-sky-800">{formatCurrency(totalPago)}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border border-slate-300 bg-white">
              <select
                value={sortConfig.key || ''}
                onChange={(e) => setSortConfig({ key: e.target.value || null, direction: sortConfig.direction })}
                className="px-2.5 py-1.5 text-xs text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="">Ordenar por...</option>
                {SORTABLE_EMENDAS.map((f) => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
              {sortConfig.key && (
                <button
                  onClick={() => setSortConfig((prev) => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                  className="px-2 py-1.5 border-l border-slate-300 bg-amber-100 hover:bg-amber-200 text-xs font-bold"
                >
                  {sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            <div className="flex border border-slate-300 bg-white overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 flex items-center text-xs font-bold border-r border-slate-300 ${
                  viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ListIcon className="w-3.5 h-3.5 mr-1" /> Lista
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 flex items-center text-xs font-bold ${
                  viewMode === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <GridIcon className="w-3.5 h-3.5 mr-1" /> Cards
              </button>
            </div>

            <button
              onClick={() => exportRowsToCSV(rowsExport, 'tabulum_emendas_filtradas.csv')}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-amber-100 flex items-center gap-1"
            >
              <DownloadIcon className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-sky-700 hover:text-white flex items-center gap-1"
            >
              <PrinterIcon className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>

        {renderEmendasTableOrCards(emendasOrdenadas, sortConfig, requestSort, viewMode)}
      </div>
    );
  };

  /* =================== tela: HISTÓRICO DE ATUALIZAÇÕES ==================== */
  const UpdatesHistoryView = () => {
    const [histSearch, setHistSearch] = useState('');
    const [histTypeFilter, setHistTypeFilter] = useState('TODOS');
    const [histSort, setHistSort] = useState({ key: 'dataHora', direction: 'desc' });

    const filteredHistory = useMemo(() => {
      const list = updateHistory.filter((item) => {
        const matchesSearch = histSearch === '' || JSON.stringify(item).toLowerCase().includes(histSearch.toLowerCase());
        if (!matchesSearch) return false;
        if (histTypeFilter === 'TODOS') return true;
        if (histTypeFilter === 'PAGAMENTO') return item.tipo === 'PAGAMENTO' || item.campo === 'PAGO';
        if (histTypeFilter === 'SITUACAO') return item.tipo === 'SITUACAO' || item.campo === 'SITUAÇÃO';
        if (histTypeFilter === 'NOVA_EMENDA') return item.tipo === 'NOVA_EMENDA';
        if (histTypeFilter === 'SGPE') return item.tipo === 'SGPE' || item.campo === 'SGPe';
        if (histTypeFilter === 'EDICAO_MANUAL') return item.tipo === 'EDICAO_MANUAL';
        return true;
      });
      list.sort((a, b) => {
        if (histSort.key === 'dataHora') {
          const tA = parseBrDateTime(a.dataHora);
          const tB = parseBrDateTime(b.dataHora);
          return histSort.direction === 'asc' ? tA - tB : tB - tA;
        }
        const sA = String(a[histSort.key] || '').trim();
        const sB = String(b[histSort.key] || '').trim();
        const cmp = sA.localeCompare(sB, 'pt-BR', { sensitivity: 'base', numeric: true });
        return histSort.direction === 'asc' ? cmp : -cmp;
      });
      return list;
    }, [updateHistory, histSearch, histTypeFilter, histSort]);

    const requestHistSort = (key) => {
      setHistSort((prev) => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));
    };

    const countPagamentos = updateHistory.filter((u) => u.tipo === 'PAGAMENTO' || u.campo === 'PAGO').length;
    const countSituacoes = updateHistory.filter((u) => u.tipo === 'SITUACAO' || u.campo === 'SITUAÇÃO').length;
    const countNovas = updateHistory.filter((u) => u.tipo === 'NOVA_EMENDA').length;

    const HistSortableHeader = ({ label, colKey, extraClasses = '' }) => (
      <th
        onClick={() => requestHistSort(colKey)}
        className={`py-2.5 px-3 text-left text-[11px] font-bold text-slate-800 uppercase cursor-pointer hover:bg-amber-300/70 border-r border-slate-300 select-none ${extraClasses}`}
      >
        <div className="flex items-center justify-between gap-1">
          <span>{label}</span>
          {histSort.key === colKey ? (
            histSort.direction === 'asc' ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />
          ) : (
            <ChevronUpIcon className="w-3.5 h-3.5 opacity-20" />
          )}
        </div>
      </th>
    );

    return (
      <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentView('inicio')} className="bg-slate-800 text-white px-3 py-1.5 font-semibold text-xs hover:bg-slate-700">
              ← Voltar ao Início
            </button>
            <h1 className="text-lg font-bold text-slate-900 uppercase flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-rose-700" />
              Histórico de Atualizações das Emendas
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => exportRowsToCSV(filteredHistory, 'historico_atualizacoes_emendas.csv')} className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-amber-100 text-xs font-bold flex items-center gap-1">
              <DownloadIcon className="w-3.5 h-3.5" /> CSV
            </button>
            <button onClick={() => window.print()} className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1">
              <PrinterIcon className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-white border border-slate-300 p-3.5"><p className="text-[10px] font-bold uppercase text-slate-400">Total</p><p className="text-2xl font-black text-slate-900">{updateHistory.length}</p></div>
          <div className="bg-sky-50/70 border border-sky-200 p-3.5"><p className="text-[10px] font-bold uppercase text-sky-800">Pagamentos</p><p className="text-2xl font-black text-sky-800">{countPagamentos}</p></div>
          <div className="bg-amber-50/80 border border-amber-200 p-3.5"><p className="text-[10px] font-bold uppercase text-amber-900">Situação</p><p className="text-2xl font-black text-amber-900">{countSituacoes}</p></div>
          <div className="bg-rose-50/70 border border-rose-200 p-3.5"><p className="text-[10px] font-bold uppercase text-rose-800">Novas Emendas</p><p className="text-2xl font-black text-rose-700">{countNovas}</p></div>
        </div>

        <div className="bg-white border border-slate-300 p-3 mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <input
            type="text"
            placeholder="Buscar por emenda, cidade, entidade ou valor..."
            value={histSearch}
            onChange={(e) => setHistSearch(e.target.value)}
            className="flex-1 min-w-[220px] max-w-md px-3 py-1.5 bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:border-sky-600 focus:bg-white"
          />
          <div className="flex flex-wrap gap-1.5">
            {[['TODOS', 'Todas'], ['PAGAMENTO', 'Pagamentos'], ['SITUACAO', 'Situação'], ['NOVA_EMENDA', 'Novas'], ['SGPE', 'SGPe'], ['EDICAO_MANUAL', 'Edições']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setHistTypeFilter(id)}
                className={`px-2.5 py-1 text-xs border ${histTypeFilter === id ? 'bg-slate-800 text-white border-slate-800 font-bold' : 'bg-slate-50 text-slate-700 border-slate-300'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-300 overflow-x-auto shadow-xs">
          <table className="min-w-[980px] w-full border-collapse">
            <thead className="bg-amber-200/85 border-b border-slate-400">
              <tr>
                <HistSortableHeader label="Data / Hora" colKey="dataHora" />
                <HistSortableHeader label="Tipo" colKey="tipo" />
                <HistSortableHeader label="Nº Emenda" colKey="numeroEmenda" />
                <HistSortableHeader label="Município" colKey="municipio" />
                <HistSortableHeader label="Entidade" colKey="entidade" />
                <HistSortableHeader label="Campo" colKey="campo" />
                <HistSortableHeader label="Antes" colKey="valorAnterior" />
                <HistSortableHeader label="Depois" colKey="valorNovo" />
                <HistSortableHeader label="Origem" colKey="origem" extraClasses="border-r-0" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredHistory.map((item, idx) => {
                const badge = getUpdateTypeBadge(item.tipo, item.campo);
                return (
                  <tr key={item.id || idx} onClick={() => openEmendaByNumber(item.numeroEmenda)} className="hover:bg-amber-50/50 cursor-pointer">
                    <td className="py-2 px-3 whitespace-nowrap text-slate-600 border-r border-slate-200">{item.dataHora}</td>
                    <td className="py-2 px-3 border-r border-slate-200"><span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase border ${badge.classes}`}>{badge.label}</span></td>
                    <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">#{item.numeroEmenda}</td>
                    <td onClick={(e) => item.municipio && openEntityFicha('municipio', item.municipio, e)} className="py-2 px-3 font-bold uppercase text-sky-700 hover:underline border-r border-slate-200">{item.municipio || '-'}</td>
                    <td onClick={(e) => item.entidade && openEntityFicha('entidade', item.entidade, e)} className="py-2 px-3 text-slate-800 hover:underline border-r border-slate-200">{item.entidade || '-'}</td>
                    <td className="py-2 px-3 font-semibold uppercase text-slate-700 border-r border-slate-200">{item.campo}</td>
                    <td className="py-2 px-3 text-slate-400 line-through border-r border-slate-200">{item.valorAnterior || '—'}</td>
                    <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">{item.valorNovo || '—'}</td>
                    <td className="py-2 px-3 text-[11px] text-slate-500">{item.origem || 'Robô SEF/SC'}</td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && (
                <tr><td colSpan="9" className="py-10 text-center text-slate-400 uppercase">Nenhum registro encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* =================== tela: FICHA COMPLETA (MUNICÍPIO, REGIÃO, ARTICULADOR...) === */
  const EntityProfileView = () => {
    const [fichaSearch, setFichaSearch] = useState('');
    const [fichaSortConfig, setFichaSortConfig] = useState({ key: 'NÚMERO DA EMENDA', direction: 'desc' });
    const [crossSortByDim, setCrossSortByDim] = useState({});

    const type = selectedEntityFicha ? selectedEntityFicha.type : '';
    const value = selectedEntityFicha ? selectedEntityFicha.value : '';
    const meta = ENTITY_TYPE_META[type] || { label: 'Categoria', plural: 'Categorias', field: type };

    const baseEntityEmendas = useMemo(() => {
      if (!type || !value) return [];
      const valKey = chaveMun(value);
      return normalizedEmendas.filter((e) => {
        if (type === 'municipio') return chaveMun(e['MUNICÍPIO']) === valKey;
        if (type === 'regiao') {
          const rPlan = eleitoral && eleitoral.regiaoPorChave.get(chaveMun(e['MUNICÍPIO']));
          return chaveMun(rPlan || e.REGIÃO) === valKey;
        }
        if (type === 'articulador') return chaveMun(e.ARTICULADOR) === valKey;
        return String(e[meta.field] || '').trim().toLowerCase() === String(value).trim().toLowerCase();
      });
    }, [normalizedEmendas, eleitoral, type, value, meta.field]);

    const fichaEmendas = useMemo(() => {
      const filtered = baseEntityEmendas.filter(
        (e) => fichaSearch === '' || JSON.stringify(e).toLowerCase().includes(fichaSearch.toLowerCase())
      );
      return sortEmendasList(filtered, fichaSortConfig);
    }, [baseEntityEmendas, fichaSearch, fichaSortConfig]);

    const liderancasDetalhadas = useMemo(() => {
      const map = {};
      baseEntityEmendas.forEach((e) => {
        const lid = String(e.LIDERANÇA || '').trim();
        if (!lid) return;
        if (!map[lid]) {
          map[lid] = {
            nome: lid,
            telefone: e['TELEFONE DA LIDERANÇA'] || '',
            email: e['EMAIL DA LIDERANÇA'] || '',
            municipio: e['MUNICÍPIO'] || '',
            count: 0,
            total: 0,
          };
        }
        map[lid].count += 1;
        map[lid].total += parseCurrency(e.TOTAL);
        if (!map[lid].telefone && e['TELEFONE DA LIDERANÇA']) map[lid].telefone = e['TELEFONE DA LIDERANÇA'];
        if (!map[lid].email && e['EMAIL DA LIDERANÇA']) map[lid].email = e['EMAIL DA LIDERANÇA'];
      });
      return Object.values(map).sort((a, b) => b.total - a.total);
    }, [baseEntityEmendas]);

    if (!selectedEntityFicha) return null;

    const requestFichaSort = (key) => {
      setFichaSortConfig((prev) => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const totalPrevisto = baseEntityEmendas.reduce((acc, e) => acc + parseCurrency(e.TOTAL), 0);
    const totalPago = baseEntityEmendas.reduce((acc, e) => acc + parseCurrency(e.PAGO), 0);
    const saldoPagar = Math.max(totalPrevisto - totalPago, 0);
    const pctExecutado = totalPrevisto > 0 ? (totalPago / totalPrevisto) * 100 : 0;

    const buildBreakdown = (dimType) => {
      const dimMeta = ENTITY_TYPE_META[dimType];
      const map = {};
      baseEntityEmendas.forEach((e) => {
        const raw = String(e[dimMeta.field] || '').trim();
        const key = raw || 'Não informado';
        if (!map[key]) map[key] = { name: key, isValid: Boolean(raw), count: 0, total: 0, pago: 0 };
        map[key].count += 1;
        map[key].total += parseCurrency(e.TOTAL);
        map[key].pago += parseCurrency(e.PAGO);
      });
      const items = Object.values(map);
      const sortConf = crossSortByDim[dimType] || { key: 'total', direction: 'desc' };
      items.sort((a, b) => {
        if (sortConf.key === 'name') {
          const cmp = a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base', numeric: true });
          return sortConf.direction === 'asc' ? cmp : -cmp;
        }
        return sortConf.direction === 'asc' ? a[sortConf.key] - b[sortConf.key] : b[sortConf.key] - a[sortConf.key];
      });
      return items;
    };

    const toggleCrossSort = (dimType, key) => {
      setCrossSortByDim((prev) => {
        const cur = prev[dimType] || { key: 'total', direction: 'desc' };
        return { ...prev, [dimType]: { key, direction: cur.key === key && cur.direction === 'desc' ? 'asc' : 'desc' } };
      });
    };

    const crossDimensions = [
      'municipio', 'regiao', 'modalidade', 'entidade', 'uo', 'articulador', 'situacao', 'tema', 'ano', 'lideranca', 'dataPagamento',
    ].filter((d) => d !== type);

    return (
      <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={goBackFromEntityFicha} className="bg-slate-800 text-white px-3 py-1.5 font-bold text-xs hover:bg-slate-700">
              ← {entityHistory.length > 0 ? `Voltar para ${entityHistory[entityHistory.length - 1].value}` : 'Voltar ao Início'}
            </button>
            <button
              onClick={() => applyEntityFilterToMain(type, value)}
              className="bg-amber-200 text-slate-900 px-3 py-1.5 font-bold text-xs border border-slate-400 hover:bg-amber-300 flex items-center gap-1.5"
            >
              <FilterIcon className="w-3.5 h-3.5" /> Filtrar o Painel por {value}
            </button>
            <button onClick={() => window.print()} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-sky-700 hover:text-white flex items-center gap-1">
              <PrinterIcon className="w-3.5 h-3.5" /> Imprimir / PDF
            </button>
          </div>
          {baseEntityEmendas.length > 0 && (
            <input
              type="text"
              placeholder={`Buscar nas emendas de ${value}...`}
              value={fichaSearch}
              onChange={(e) => setFichaSearch(e.target.value)}
              className="w-60 px-3 py-1.5 bg-white border border-slate-300 text-xs focus:outline-none focus:border-sky-600"
            />
          )}
        </div>

        <div className="bg-white border border-slate-300 shadow-xs mb-5 print:shadow-none">
          <div className="bg-sky-700 border-b border-slate-300 p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 print:bg-white">
            <div>
              <span className="inline-block bg-amber-300 text-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                Ficha Completa • {meta.label}
              </span>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white uppercase tracking-tight break-words print:text-slate-900">
                {value}
              </h1>
            </div>
            <div className="bg-white border border-slate-300 px-4 py-2 text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Emendas vinculadas</span>
              <span className="text-xl font-extrabold text-rose-700">{baseEntityEmendas.length}</span>
            </div>
          </div>

          {baseEntityEmendas.length > 0 && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-200 bg-slate-50/50">
              <div className="bg-white border border-slate-200 p-3.5">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Valor Total Destinado</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900">{formatCurrency(totalPrevisto)}</p>
              </div>
              <div className="bg-white border border-slate-200 p-3.5">
                <p className="text-[10px] font-bold uppercase text-sky-700 mb-1">Valor Pago</p>
                <p className="text-lg sm:text-xl font-bold text-sky-700">{formatCurrency(totalPago)}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{pctExecutado.toFixed(1)}% pago</p>
              </div>
              <div className="bg-white border border-slate-200 p-3.5">
                <p className="text-[10px] font-bold uppercase text-rose-700 mb-1">Saldo a Pagar</p>
                <p className="text-lg sm:text-xl font-bold text-rose-700">{formatCurrency(saldoPagar)}</p>
              </div>
            </div>
          )}

          {/* Bloco 1: Perfil Eleitoral */}
          <EleitoralPerfil
            type={type}
            value={value}
            emendasFicha={baseEntityEmendas}
            emendasTodas={normalizedEmendas}
            eleitoral={eleitoral}
            openEntityFicha={openEntityFicha}
          />

          {/* Bloco 2: Presença de Agenda */}
          <AgendaPerfil
            type={type}
            value={value}
            agenda={agenda}
            eleitoral={eleitoral}
            openEntityFicha={openEntityFicha}
          />

          {/* Bloco 3: Cruzamento das Emendas */}
          {baseEntityEmendas.length > 0 && (
            <div className="p-4">
              <h2 className="text-xs sm:text-sm font-bold uppercase text-slate-800 tracking-wider mb-3 flex items-center">
                <span className="w-2 h-4 bg-rose-700 mr-2" />
                Detalhamento das Emendas ({value})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {crossDimensions.map((dimKey) => {
                  const dimMeta = ENTITY_TYPE_META[dimKey];
                  const rows = buildBreakdown(dimKey);
                  const sortConf = crossSortByDim[dimKey] || { key: 'total', direction: 'desc' };
                  return (
                    <div key={dimKey} className="border border-slate-300 bg-white flex flex-col">
                      <div className="bg-amber-100/90 border-b border-slate-300 px-3 py-1.5 flex justify-between items-center">
                        <span className="font-bold text-xs uppercase text-slate-800">{dimMeta.plural}</span>
                        <span className="bg-white border border-slate-300 px-1.5 text-[10px] font-semibold text-slate-700">
                          {rows.filter((r) => r.isValid).length}
                        </span>
                      </div>
                      <div className="max-h-52 overflow-y-auto flex-1">
                        <table className="w-full border-collapse text-xs">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              <th onClick={() => toggleCrossSort(dimKey, 'name')} className="py-1.5 px-2 text-left text-[10px] font-bold uppercase cursor-pointer border-b border-slate-300">{dimMeta.label}{sortConf.key === 'name' ? (sortConf.direction === 'asc' ? ' ▲' : ' ▼') : ''}</th>
                              <th onClick={() => toggleCrossSort(dimKey, 'count')} className="py-1.5 px-2 text-center text-[10px] font-bold uppercase cursor-pointer border-b border-slate-300">Qtd</th>
                              <th onClick={() => toggleCrossSort(dimKey, 'total')} className="py-1.5 px-2 text-right text-[10px] font-bold uppercase cursor-pointer border-b border-slate-300">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rows.map((item, i) => (
                              <tr
                                key={i}
                                onClick={() => item.isValid && openEntityFicha(dimKey, item.name)}
                                className={item.isValid ? 'hover:bg-sky-50/70 cursor-pointer' : 'text-slate-400 italic'}
                              >
                                <td className="py-1.5 px-2 font-medium text-[11px] text-sky-800 hover:underline">{item.name}</td>
                                <td className="py-1.5 px-2 text-center font-semibold text-[11px]">{item.count}</td>
                                <td className="py-1.5 px-2 text-right font-semibold text-[11px] whitespace-nowrap">{formatCurrency(item.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              {liderancasDetalhadas.length > 0 && (
                <div className="mt-5 border border-slate-300 bg-white">
                  <div className="bg-rose-700 text-white border-b border-slate-300 px-3.5 py-1.5">
                    <span className="font-bold text-xs uppercase">Lideranças e Contatos Vinculados ({liderancasDetalhadas.length})</span>
                  </div>
                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full border-collapse text-xs">
                      <thead className="bg-slate-50 border-b border-slate-300">
                        <tr>
                          <th className="py-1.5 px-3 text-left text-[10px] font-bold uppercase">Liderança</th>
                          <th className="py-1.5 px-3 text-left text-[10px] font-bold uppercase">Município</th>
                          <th className="py-1.5 px-3 text-left text-[10px] font-bold uppercase">Telefone</th>
                          <th className="py-1.5 px-3 text-left text-[10px] font-bold uppercase">Email</th>
                          <th className="py-1.5 px-3 text-center text-[10px] font-bold uppercase">Emendas</th>
                          <th className="py-1.5 px-3 text-right text-[10px] font-bold uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {liderancasDetalhadas.map((lid, i) => (
                          <tr key={i} onClick={() => openEntityFicha('lideranca', lid.nome)} className="hover:bg-amber-50/60 cursor-pointer">
                            <td className="py-1.5 px-3 font-semibold text-rose-700 hover:underline">{lid.nome}</td>
                            <td className="py-1.5 px-3 font-medium text-sky-700">{lid.municipio || '-'}</td>
                            <td className="py-1.5 px-3 text-slate-700">{lid.telefone || '-'}</td>
                            <td className="py-1.5 px-3 text-slate-700">{lid.email || '-'}</td>
                            <td className="py-1.5 px-3 text-center font-semibold">{lid.count}</td>
                            <td className="py-1.5 px-3 text-right font-semibold">{formatCurrency(lid.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {baseEntityEmendas.length > 0 && renderEmendasTableOrCards(fichaEmendas, fichaSortConfig, requestFichaSort, viewMode)}
      </div>
    );
  };

  /* =================== tela: FICHA INDIVIDUAL DA EMENDA =================== */
  const DetailView = () => {
    const isEditing = currentView === 'edit';
    const data = isEditing ? editingEmenda : selectedEmenda;

    const emendaUpdates = useMemo(() => {
      if (!data) return [];
      const num = String(data['NÚMERO DA EMENDA'] || '').trim();
      return updateHistory.filter((u) => String(u.numeroEmenda || '').trim() === num);
    }, [data, updateHistory]);

    const dataPagtoResolvida = useMemo(() => (data ? getDataPagamento(data, updateHistory) : ''), [data, updateHistory]);

    if (!data) return null;

    const handleInputChange = (field, value) => setEditingEmenda((prev) => ({ ...prev, [field]: value }));
    const temValorPago = parseCurrency(data.PAGO) > 0 || String(data.SITUAÇÃO || '').toUpperCase().includes('PAGO');

    const InfoField = ({ label, field, valueOverride = null, emptyFallback = 'N/A', icon: IconComp, type = 'text', entityType = null, color = 'blue', isCurrency = false }) => {
      const rawValue = valueOverride !== null ? valueOverride : (field === 'MODALIDADE' && !isEditing ? getModalidade(data) : data[field]);
      const displayValue = !isEditing && isCurrency ? formatCurrency(parseCurrency(rawValue)) : rawValue;
      const colorClass = color === 'blue' ? 'text-sky-700' : color === 'red' ? 'text-rose-700' : 'text-slate-700';

      if (isEditing) {
        return (
          <div className="mb-3">
            <label className={`block text-xs font-bold uppercase mb-1 ${colorClass}`}>{label}</label>
            {type === 'textarea' ? (
              <textarea
                className="w-full p-2 bg-white border border-slate-300 focus:outline-none focus:border-rose-700 text-sm text-slate-900"
                rows="3"
                value={data[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            ) : (
              <input
                type="text"
                className="w-full p-2 bg-white border border-slate-300 focus:outline-none focus:border-rose-700 text-sm text-slate-900"
                value={data[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            )}
          </div>
        );
      }

      return (
        <div className="mb-3 bg-white p-3 border border-slate-200">
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center ${colorClass}`}>
            {IconComp && <IconComp className="h-3.5 w-3.5 mr-1 print:hidden" />} {label}
          </label>
          <div className="text-slate-900 font-medium text-sm break-words flex items-center justify-between gap-2">
            {entityType && rawValue ? (
              <button onClick={(e) => openEntityFicha(entityType, rawValue, e)} className="font-semibold text-left hover:text-rose-700 hover:underline">
                {displayValue}
              </button>
            ) : (
              <span>{displayValue || <span className="text-slate-400 italic">{emptyFallback}</span>}</span>
            )}
            {entityType && rawValue && (
              <button
                onClick={(e) => openEntityFicha(entityType, rawValue, e)}
                className="text-[10px] bg-amber-100 text-slate-800 border border-slate-300 px-1.5 py-0.5 uppercase font-semibold hover:bg-amber-200 print:hidden flex-shrink-0"
              >
                Abrir Ficha
              </button>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5">
        <button
          onClick={() => {
            setCurrentView(selectedEntityFicha ? 'entity' : 'emendas');
            setEditingEmenda(null);
          }}
          className="bg-slate-800 text-white px-3.5 py-1.5 font-bold uppercase text-xs hover:bg-slate-700 mb-4 print:hidden"
        >
          ← {selectedEntityFicha ? `Voltar para Ficha de ${selectedEntityFicha.value}` : 'Voltar para Emendas'}
        </button>

        <div className="bg-white border border-slate-300 shadow-xs print:shadow-none print:border-none">
          <div className="bg-rose-700 border-b border-slate-300 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 print:bg-white">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-rose-100 font-semibold uppercase text-xs print:text-slate-900">Ficha de Emenda</p>
                {data.SITUAÇÃO && <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${getSituacaoClasses(data.SITUAÇÃO)}`}>{data.SITUAÇÃO}</span>}
                {dataPagtoResolvida && (
                  <span className="bg-amber-200 text-slate-900 border border-slate-800 text-[10px] font-bold uppercase px-2 py-0.5 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" /> Pago em: {dataPagtoResolvida}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white print:text-slate-900">Nº {data['NÚMERO DA EMENDA']}</h2>
            </div>

            {isAdmin && !isEditing && (
              <button
                onClick={() => { setEditingEmenda({ ...selectedEmenda }); setCurrentView('edit'); }}
                className="bg-amber-300 text-slate-900 border border-slate-800 px-4 py-1.5 font-bold text-xs uppercase hover:bg-amber-400 flex items-center print:hidden"
              >
                <EditIcon className="h-4 w-4 mr-1.5" /> Editar Ficha
              </button>
            )}
            {isAdmin && isEditing && (
              <div className="flex space-x-2 print:hidden">
                <button onClick={() => setCurrentView('detail')} className="bg-white text-slate-900 border border-slate-400 px-3.5 py-1.5 font-bold text-xs uppercase hover:bg-slate-100 flex items-center">
                  <XIcon className="h-4 w-4 mr-1" /> Cancelar
                </button>
                <button
                  onClick={() => confirmAction('Salvar Alterações', 'Confirmar alterações? A mudança será salva e sincronizada na nuvem.', handleSaveEmenda)}
                  className="bg-sky-700 text-white border border-sky-900 px-4 py-1.5 font-bold text-xs uppercase hover:bg-sky-800 flex items-center"
                >
                  <SaveIcon className="h-4 w-4 mr-1.5" /> Salvar
                </button>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            <div className="col-span-1 md:col-span-2">
              <InfoField label="Objeto / Descrição Principal" field="OBJETO" type="textarea" color="red" />
            </div>

            <div className="space-y-2 bg-slate-50/70 border border-slate-200 p-4">
              <div className="bg-slate-800 text-white font-bold uppercase text-xs py-1 px-2.5 inline-block mb-2">Identificação</div>
              <InfoField label="Município" field="MUNICÍPIO" icon={MapPinIcon} entityType="municipio" color="blue" />
              <InfoField label="Região" field="REGIÃO" icon={MapIcon} entityType="regiao" color="black" />
              <InfoField label="Modalidade" field="MODALIDADE" icon={LayersIcon} entityType="modalidade" color="red" />
              <InfoField label="Tema" field="TEMA" icon={TagIcon} entityType="tema" color="blue" />
              <InfoField label="Articulador" field="ARTICULADOR" icon={UserIcon} entityType="articulador" color="red" />
              <InfoField label="Ano" field="ANO" entityType="ano" color="black" />
            </div>

            <div className="space-y-2 bg-slate-50/70 border border-slate-200 p-4">
              <div className="bg-sky-700 text-white font-bold uppercase text-xs py-1 px-2.5 inline-block mb-2">Financeiro / Status</div>
              <InfoField label="Situação" field="SITUAÇÃO" entityType="situacao" color="red" />
              <InfoField label="Total Previsto" field="TOTAL" color="blue" isCurrency />
              <InfoField label="Valor Pago" field="PAGO" color="blue" isCurrency />
              <InfoField
                label="Data de Pagamento"
                field="DATA DO PAGAMENTO"
                valueOverride={!isEditing ? dataPagtoResolvida : null}
                emptyFallback={temValorPago ? 'Pago (data não registrada)' : 'Aguardando pagamento'}
                icon={ClockIcon}
                entityType="dataPagamento"
                color="blue"
              />
              <InfoField label="Esfera de Aplicação" field="ESFERA DE APLICAÇÃO" color="black" />
              <InfoField label="Unidade Orçamentária" field="UNIDADE ORÇAMENTÁRIA" entityType="uo" color="black" />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2 bg-slate-50/70 border border-slate-200 p-4">
              <div className="bg-rose-700 text-white font-bold uppercase text-xs py-1 px-2.5 inline-block mb-2">Entidade / Liderança</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <InfoField label="Entidade" field="RAZÃO SOCIAL" icon={BuildingIcon} entityType="entidade" color="red" />
                <InfoField label="Liderança" field="LIDERANÇA" icon={UserIcon} entityType="lideranca" color="blue" />
                <InfoField label="Telefone da Liderança" field="TELEFONE DA LIDERANÇA" color="red" />
                <InfoField label="Email da Liderança" field="EMAIL DA LIDERANÇA" color="black" />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2 bg-amber-50/70 border border-amber-200 p-4">
              <div className="bg-amber-300 text-slate-900 font-bold uppercase text-xs py-1 px-2.5 inline-block mb-2">Dados Técnicos</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <InfoField label="SGPe" field="SGPe" color="black" />
                <InfoField label="Modalidade" field="MODALIDADE" entityType="modalidade" color="black" />
                <InfoField label="Tipo" field="TIPO (IMPOSITIVA, BANCADA, PARLAMENTARES)" color="black" />
              </div>
              <InfoField label="Entrega Realizada" field="ENTREGA" type="textarea" color="black" />
              <InfoField label="Justificativa" field="JUSTIFICATIVA" type="textarea" color="black" />
              <InfoField label="Observações Livres" field="Observação" type="textarea" color="black" />
            </div>

            {!isEditing && (
              <div className="col-span-1 md:col-span-2 bg-slate-50/80 border border-slate-200 p-4">
                <div className="bg-slate-800 text-white font-bold uppercase text-xs py-1 px-2.5 inline-flex items-center gap-1.5 mb-3">
                  <ClockIcon className="w-3.5 h-3.5 text-amber-300" />
                  Histórico de Atualizações ({emendaUpdates.length})
                </div>
                {emendaUpdates.length > 0 ? (
                  <div className="divide-y divide-slate-200 bg-white border border-slate-200">
                    {emendaUpdates.map((u, i) => {
                      const badge = getUpdateTypeBadge(u.tipo, u.campo);
                      return (
                        <div key={u.id || i} className="p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 border ${badge.classes}`}>{badge.label}</span>
                            <span className="font-semibold text-slate-700">{u.campo}:</span>
                            <span className="line-through text-slate-400">{u.valorAnterior || '—'}</span>
                            <span>→</span>
                            <span className="font-bold text-slate-900">{u.valorNovo || '—'}</span>
                          </div>
                          <span className="text-[11px] text-slate-500">{u.dataHora} ({u.origem || 'Robô SEF/SC'})</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhuma alteração registrada para esta emenda.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* =================== tela: CONFIGURAÇÕES ================================ */
  const SettingsView = () => {
    const [newPass, setNewPass] = useState('');
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 print:hidden">
        <button onClick={() => setCurrentView('inicio')} className="bg-slate-800 text-white px-3.5 py-1.5 font-bold uppercase text-xs hover:bg-slate-700 mb-4">
          ← Voltar ao Início
        </button>

        <div className="bg-white border border-slate-300 shadow-xs">
          <div className="bg-sky-700 border-b border-slate-300 p-4">
            <h2 className="text-xl font-bold text-white uppercase flex items-center">
              <SettingsIcon className="mr-2.5 h-5 w-5" /> Configurações
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-amber-50 border border-amber-300 text-slate-800 p-4 flex items-start">
              <AlertTriangleIcon className="h-5 w-5 mr-3 flex-shrink-0 text-rose-700" />
              <p className="text-xs sm:text-sm font-medium">
                Modo de Segurança Ativado. Todas as URLs e senhas das planilhas Google ficam protegidas exclusivamente no servidor da Vercel.
              </p>
            </div>
            <EleitoralStatus eleitoral={eleitoral} status={eleitoralStatus} erro={eleitoralErro} recarregar={recarregarEleitoral} />
            <AgendaStatus agenda={agenda} status={agendaStatus} erro={agendaErro} recarregar={recarregarAgenda} />
            <div className="border border-slate-200 p-5 bg-white">
              <h3 className="text-sm font-bold uppercase text-sky-700 border-b border-slate-200 pb-2 mb-4 flex items-center">
                <UploadCloudIcon className="h-4 w-4 mr-2" /> Importação CSV Manual (Emendas)
              </h3>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="block w-full text-xs border border-slate-300 p-2 bg-white file:mr-3 file:py-1.5 file:px-3 file:border file:border-slate-400 file:text-xs file:font-bold file:uppercase file:bg-amber-200 file:text-slate-900 hover:file:bg-amber-300 cursor-pointer"
              />
            </div>
            <div className="border border-slate-200 p-5 bg-white">
              <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-200 pb-2 mb-4">Segurança Local</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Nova senha administrativa..."
                  className="flex-1 p-2 bg-white border border-slate-300 focus:outline-none focus:border-rose-700 text-sm"
                />
                <button
                  onClick={() => {
                    if (newPass.length < 3) return alert('Mínimo de 3 caracteres.');
                    handleChangePassword(newPass);
                    setNewPass('');
                  }}
                  className="bg-rose-700 text-white font-bold text-xs uppercase px-5 py-2 hover:bg-rose-800 whitespace-nowrap"
                >
                  Atualizar Senha
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center p-6 bg-white border border-slate-300 shadow-xs">
          <div className="flex space-x-2 justify-center mb-4">
            <div className="w-4 h-4 bg-pink-600 animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-4 h-4 bg-amber-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-4 h-4 bg-sky-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-slate-700 font-bold text-xs uppercase tracking-widest">Carregando dados do mandato...</p>
        </div>
      </div>
    );
  }

  const latestSevenUpdates = updateHistory.slice(0, 7);
  const nomesEleicoes = eleitoral ? eleitoral.eleicoes.map((e) => [e.key, e.label]) : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-amber-200 selection:text-slate-900 pb-12 print:pb-0">
      {/* ======================= CABEÇALHO FIXO UNIFICADO ======================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-300 shadow-xs print:hidden">
        {/* Filete Mondrian nas 3 cores primárias */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-pink-600" />
          <div className="w-1/3 bg-amber-300" />
          <div className="w-1/3 bg-sky-500" />
        </div>

        {/* Linha 1: Marca + 4 Telas Principais + Notificações/Admin */}
        <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center cursor-pointer group flex-shrink-0" onClick={resetToFrontPage} title="Voltar ao Início e limpar filtros">
              <img
                src="https://raw.githubusercontent.com/killuixo/tabulum-sig-emendas/refs/heads/main/icon-192.png"
                alt="Ícone TABULUM"
                className="w-7 h-7 mr-2 object-contain transition-transform group-hover:scale-105"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="font-extrabold text-base tracking-tight text-slate-900 whitespace-nowrap">TABULUM</span>
            </div>

            {/* 4 Telas Principais */}
            <nav className="flex border border-slate-300 rounded-xs overflow-hidden bg-slate-50">
              {[
                { id: 'inicio', label: 'Início', icon: HomeIcon, cor: 'bg-pink-600 text-white' },
                { id: 'municipios', label: 'Municípios', icon: MapPinIcon, cor: 'bg-sky-700 text-white' },
                { id: 'emendas', label: 'Emendas', icon: TableIcon, cor: 'bg-slate-900 text-white' },
                { id: 'agendas', label: 'Agendas', icon: CalendarIcon, cor: 'bg-amber-300 text-slate-900' },
              ].map((tab, i) => {
                const TabIcon = tab.icon;
                const ativo = currentView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setCurrentView(tab.id); setSelectedEntityFicha(null); }}
                    className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold transition-colors ${
                      i > 0 ? 'border-l border-slate-300' : ''
                    } ${ativo ? tab.cor : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {isAdmin && (
              <button
                onClick={() => confirmAction('Sincronizar Planilhas', 'Deseja atualizar os dados agora?', syncWithGoogleSheet)}
                className="px-2.5 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xs flex items-center gap-1"
              >
                <RefreshCwIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sincronizar</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <div className="relative">
              <button
                onClick={handleToggleNotifications}
                className={`relative px-2.5 py-1.5 border rounded-xs flex items-center gap-1.5 text-xs font-bold transition-colors ${
                  openDropdown === 'notifications' || currentView === 'updates'
                    ? 'bg-sky-700 text-white border-sky-800'
                    : 'bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-300'
                }`}
                title="Últimas atualizações nas emendas"
              >
                <BellIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Atualizações</span>
                {unreadUpdatesCount > 0 && (
                  <span className="bg-rose-700 text-white text-[10px] font-bold px-1.5 rounded-full leading-tight">
                    {unreadUpdatesCount}
                  </span>
                )}
              </button>

              {openDropdown === 'notifications' && (
                <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white border-2 border-slate-800 shadow-lg z-50 overflow-hidden">
                  <div className="bg-slate-800 text-white px-3.5 py-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase">Últimas 7 Atualizações</span>
                    <span className="text-[10px] text-slate-300">{updateHistory.length} no histórico</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {latestSevenUpdates.length > 0 ? (
                      latestSevenUpdates.map((item, idx) => {
                        const badge = getUpdateTypeBadge(item.tipo, item.campo);
                        return (
                          <div key={item.id || idx} onClick={(e) => openEmendaByNumber(item.numeroEmenda, e)} className="p-3 hover:bg-amber-50 cursor-pointer">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border ${badge.classes}`}>{badge.label}</span>
                                <span className="text-xs font-bold text-slate-900">#{item.numeroEmenda}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{item.dataHora}</span>
                            </div>
                            <p className="text-xs text-slate-700">
                              <span className="font-semibold">{item.campo}:</span>{' '}
                              <span className="line-through text-slate-400">{item.valorAnterior || '—'}</span> → <strong>{item.valorNovo || '—'}</strong>
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">Nenhuma modificação recente registrada.</div>
                    )}
                  </div>
                  <div className="bg-amber-100 border-t border-slate-300 p-2">
                    <button
                      onClick={() => { setOpenDropdown(null); setCurrentView('updates'); }}
                      className="w-full py-1.5 bg-white hover:bg-sky-700 hover:text-white text-slate-900 border border-slate-400 text-xs font-bold uppercase"
                    >
                      Ver histórico completo ({updateHistory.length}) →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isAdmin ? (
              <>
                <button onClick={() => setCurrentView('settings')} className="bg-amber-200 border border-slate-300 p-1.5 hover:bg-amber-300 text-slate-900" title="Configurações">
                  <SettingsIcon className="w-4 h-4" />
                </button>
                <button onClick={handleLogout} className="bg-rose-700 border border-rose-800 p-1.5 hover:bg-rose-800 text-white" title="Sair">
                  <LogOutIcon className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1 bg-amber-200 border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-300"
              >
                <LogInIcon className="w-3.5 h-3.5" /> Editar
              </button>
            )}
          </div>
        </div>

        {/* Linha 2: Barra de Filtros Unificados por CLASSES e SUBCLASSES */}
        {mostrarBarraFiltros && (
          <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-2 bg-white space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Busca universal */}
              <div className="relative flex-1 min-w-[190px] max-w-xs">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar cidade, emenda, agenda..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ busca: e.target.value })}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xs text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-600 focus:bg-white"
                />
              </div>

              {/* CLASSE 1: TERRITÓRIO */}
              <ClasseFiltroBotao
                id="cls_territorio"
                label="Território"
                icon={MapIcon}
                count={contTerritorio}
                corAtiva="bg-sky-50 border-sky-600 text-sky-900"
                isOpen={openDropdown === 'cls_territorio'}
                onToggle={toggleDropdown}
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-extrabold uppercase text-sky-900">Classe: Território</span>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-pink-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtros.excluirFloripa}
                      onChange={(e) => setFiltros({ excluirFloripa: e.target.checked })}
                    />
                    Só interior (ocultar Florianópolis)
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SubclasseChecklist label="Região de SC" options={opcoes.regioes} selected={filtros.regioes} onChange={(v) => setFiltros({ regioes: v })} placeholder="Buscar região..." />
                  <SubclasseChecklist label="Município" options={opcoes.municipios} selected={filtros.municipios} onChange={(v) => setFiltros({ municipios: v })} placeholder="Buscar cidade..." />
                  {opcoes.associacoes.length > 0 && (
                    <div className="sm:col-span-2">
                      <SubclasseChecklist label="Associação de Municípios" options={opcoes.associacoes} selected={filtros.associacoes} onChange={(v) => setFiltros({ associacoes: v })} placeholder="Buscar associação..." />
                    </div>
                  )}
                </div>
              </ClasseFiltroBotao>

              {/* CLASSE 2: PRESENÇA & EQUIPE */}
              <ClasseFiltroBotao
                id="cls_presenca"
                label="Presença & Equipe"
                icon={CalendarIcon}
                count={contPresenca}
                corAtiva="bg-pink-50 border-pink-600 text-pink-900"
                isOpen={openDropdown === 'cls_presenca'}
                onToggle={toggleDropdown}
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-extrabold uppercase text-pink-800">Classe: Presença & Equipe</span>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtros.apenasPresenciais}
                      onChange={(e) => setFiltros({ apenasPresenciais: e.target.checked })}
                    />
                    Apenas agendas presenciais
                  </label>
                </div>

                {/* Período das agendas */}
                <div className="border border-slate-200 bg-slate-50/50 p-2.5 space-y-2">
                  <span className="text-[11px] font-extrabold uppercase text-slate-800 block">Período das agendas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PERIODOS_AGENDA.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setFiltros({ periodoAgenda: p.key, anosAgenda: [] })}
                        className={`px-2.5 py-1 text-xs font-semibold border ${
                          filtros.periodoAgenda === p.key ? 'bg-pink-600 text-white border-pink-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {opcoes.anosAgenda.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-200">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Ou escolher anos específicos:</span>
                      <div className="flex flex-wrap gap-1">
                        {opcoes.anosAgenda.map((ano) => {
                          const ativo = filtros.periodoAgenda === 'custom' && filtros.anosAgenda.includes(ano);
                          return (
                            <button
                              key={ano}
                              type="button"
                              onClick={() => toggleAnoAgendaCustom(ano)}
                              className={`px-2 py-0.5 text-xs font-semibold border ${
                                ativo ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                              }`}
                            >
                              {ano}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SubclasseChecklist label="Articulador (Equipe)" options={opcoes.articuladores} selected={filtros.articuladores} onChange={(v) => setFiltros({ articuladores: v })} placeholder="Buscar articulador..." />
                  <SubclasseChecklist label="Tipo de Agenda" options={opcoes.classesAgenda} selected={filtros.classesAgenda} onChange={(v) => setFiltros({ classesAgenda: v })} placeholder="Buscar tipo..." />
                </div>
              </ClasseFiltroBotao>

              {/* CLASSE 3: EMENDAS */}
              <ClasseFiltroBotao
                id="cls_emendas"
                label="Emendas"
                icon={LayersIcon}
                count={contEmendas}
                corAtiva="bg-amber-50 border-amber-500 text-amber-950"
                isOpen={openDropdown === 'cls_emendas'}
                onToggle={toggleDropdown}
                largura="w-[min(94vw,640px)]"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-extrabold uppercase text-amber-950">Classe: Emendas</span>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer" title="Execução Direta vai para órgãos do estado (UDESC, bombeiros etc.), não para a prefeitura.">
                    <input
                      type="checkbox"
                      checked={filtros.incluirExecDireta}
                      onChange={(e) => setFiltros({ incluirExecDireta: e.target.checked })}
                    />
                    Incluir Execução Direta no cruzamento
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SubclasseChecklist label="Ano da Emenda" options={opcoes.anosEmenda} selected={filtros.anosEmenda} onChange={(v) => setFiltros({ anosEmenda: v })} />
                  <SubclasseChecklist label="Situação do Pagamento" options={opcoes.situacoes} selected={filtros.situacoes} onChange={(v) => setFiltros({ situacoes: v })} />
                  <SubclasseChecklist label="Modalidade" options={opcoes.modalidades} selected={filtros.modalidades} onChange={(v) => setFiltros({ modalidades: v })} />
                  <SubclasseChecklist label="Tema" options={opcoes.temas} selected={filtros.temas} onChange={(v) => setFiltros({ temas: v })} />
                  <SubclasseChecklist label="Entidade Beneficiada" options={opcoes.entidades} selected={filtros.entidades} onChange={(v) => setFiltros({ entidades: v })} placeholder="Buscar entidade..." />
                  <SubclasseChecklist label="Unidade Orçamentária" options={opcoes.uos} selected={filtros.uos} onChange={(v) => setFiltros({ uos: v })} />
                </div>
              </ClasseFiltroBotao>

              {/* CLASSE 4: ELEIÇÕES */}
              {nomesEleicoes.length > 0 && (
                <ClasseFiltroBotao
                  id="cls_eleicoes"
                  label={`Eleições (${dadosUnificados.elBase ? dadosUnificados.elBase.ano : ''}→${dadosUnificados.elComp ? dadosUnificados.elComp.ano : ''})`}
                  icon={VoteIcon}
                  count={contEleicoes}
                  corAtiva="bg-sky-50 border-sky-600 text-sky-900"
                  isOpen={openDropdown === 'cls_eleicoes'}
                  onToggle={toggleDropdown}
                  largura="w-[min(92vw,400px)]"
                >
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold uppercase text-sky-900">Classe: Comparação Eleitoral</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <label className="block">
                      <span className="font-bold text-slate-700 block mb-1">Eleição de partida (antes):</span>
                      <select
                        value={dadosUnificados.baseKey}
                        onChange={(e) => setFiltros({ baseKey: e.target.value })}
                        className="w-full p-2 border border-slate-300 bg-white font-semibold"
                      >
                        {nomesEleicoes.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="font-bold text-slate-700 block mb-1">Eleição de chegada (depois):</span>
                      <select
                        value={dadosUnificados.compKey}
                        onChange={(e) => setFiltros({ compKey: e.target.value })}
                        className="w-full p-2 border border-slate-300 bg-white font-semibold"
                      >
                        {nomesEleicoes.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="font-bold text-slate-700 block mb-1">Regra para considerar que “converteu”:</span>
                      <select
                        value={filtros.criterio}
                        onChange={(e) => setFiltros({ criterio: e.target.value })}
                        className="w-full p-2 border border-slate-300 bg-white"
                      >
                        <option value="media">Cresceu acima da média do estado (recomendado)</option>
                        <option value="qualquer">Qualquer aumento de votos</option>
                      </select>
                    </label>
                  </div>
                </ClasseFiltroBotao>
              )}

              {temAlgumFiltro && (
                <button
                  onClick={clearAllFilters}
                  className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xs flex items-center gap-1"
                >
                  <XIcon className="w-3.5 h-3.5" /> Limpar tudo
                </button>
              )}
            </div>

            {/* Etiquetas dos filtros ativos (removíveis com 1 clique) */}
            {etiquetasAtivas.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {etiquetasAtivas.map((et) => (
                  <span
                    key={et.id}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 border border-amber-400 text-slate-900 text-[11px] font-semibold"
                  >
                    <span>{et.label}</span>
                    <button onClick={et.onRemove} className="hover:text-rose-700 font-bold" title="Remover filtro">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Atalhos rápidos de conversão (Emendas + Agendas) */}
      {mostrarBarraFiltros && eleitoral && (
        <BarraAtalhosConversao dados={dadosUnificados} filtros={filtros} setFiltros={setFiltros} />
      )}

      {/* ======================= CONTEÚDO PRINCIPAL ======================= */}
      <main>
        {currentView === 'inicio' && (
          <InicioDashboard
            dados={dadosUnificados}
            filtros={filtros}
            setFiltros={setFiltros}
            modoMapa={modoMapa}
            setModoMapa={setModoMapa}
            metricaX={metricaX}
            setMetricaX={setMetricaX}
            mapGeoJson={mapGeoJson}
            openEntityFicha={openEntityFicha}
            irParaTela={(tela) => { setCurrentView(tela); setSelectedEntityFicha(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            recarregarTudo={recarregarTudo}
            atualizando={eleitoralStatus === 'atualizando' || agendaStatus === 'atualizando'}
          />
        )}
        {currentView === 'municipios' && (
          <MunicipiosUnificadosView
            dados={dadosUnificados}
            eleitoral={eleitoral}
            openEntityFicha={openEntityFicha}
            exportRows={exportRowsToCSV}
          />
        )}
        {currentView === 'emendas' && renderEmendasView()}
        {currentView === 'agendas' && (
          <AgendasListaView
            dados={dadosUnificados}
            openEntityFicha={openEntityFicha}
            exportRows={exportRowsToCSV}
          />
        )}
        {currentView === 'updates' && <UpdatesHistoryView />}
        {currentView === 'entity' && <EntityProfileView />}
        {(currentView === 'detail' || currentView === 'edit') && <DetailView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white border border-slate-300 shadow-lg p-6 w-full max-w-sm m-4 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-3.5 right-3.5 bg-white border border-slate-300 p-1 hover:bg-rose-700 hover:text-white">
              <XIcon className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 uppercase mb-1.5 flex items-center">
              <LogInIcon className="mr-2 h-5 w-5 text-rose-700" /> Acesso Administrativo
            </h3>
            <div className="w-12 h-1 bg-amber-300 mb-5" />
            <input
              type="password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Senha"
              className="w-full p-2.5 bg-white border border-slate-300 focus:outline-none focus:border-sky-700 mb-4 text-sm text-slate-900"
            />
            <button onClick={handleLogin} className="w-full bg-sky-700 text-white font-bold text-xs uppercase py-2.5 hover:bg-sky-800">
              Entrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white border border-slate-300 shadow-lg p-6 w-full max-w-md m-4 relative">
            <h3 className="text-lg font-bold text-slate-900 uppercase mb-2.5">{confirmModal.title}</h3>
            <p className="text-slate-700 text-sm mb-6 border-l-2 border-amber-400 pl-3">{confirmModal.message}</p>
            <div className="flex justify-end gap-2.5">
              <button onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })} className="px-4 py-2 bg-white text-slate-700 font-semibold text-xs uppercase border border-slate-300 hover:bg-slate-100">
                Cancelar
              </button>
              <button onClick={confirmModal.onConfirm} className="px-4 py-2 bg-rose-700 text-white font-semibold text-xs uppercase hover:bg-rose-800 flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1.5" /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
