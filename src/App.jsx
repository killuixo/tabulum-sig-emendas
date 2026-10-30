import React, { useState, useEffect, useMemo } from 'react';

const Icon = ({ path, className = "w-5 h-5", onClick, size, style }) => (
  <svg
    onClick={onClick}
    style={{ width: size, height: size, ...style }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
    strokeLinejoin="miter"
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
const LayoutDashboardIcon = (p) => <Icon {...p} path={<><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></>} />;
const TableIcon = (p) => <Icon {...p} path={<><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></>} />;
const ChevronUpIcon = (p) => <Icon {...p} path={<><path d="m18 15-6-6-6 6"/></>} />;
const ChevronDownIcon = (p) => <Icon {...p} path={<><path d="m6 9 6 6 6-6"/></>} />;
const GridIcon = (p) => <Icon {...p} path={<><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></>} />;
const ListIcon = (p) => <Icon {...p} path={<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>} />;
const DownloadIcon = (p) => <Icon {...p} path={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></>} />;
const PrinterIcon = (p) => <Icon {...p} path={<><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></>} />;
const FilterIcon = (p) => <Icon {...p} path={<><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>} />;

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
  return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
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

function sortEmendasList(list, sortConfig) {
  if (!sortConfig || !sortConfig.key) return list;
  const sorted = [...list];
  sorted.sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    if (sortConfig.key === 'TOTAL' || sortConfig.key === 'PAGO') {
      const numA = parseCurrency(valA);
      const numB = parseCurrency(valB);
      return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
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
  lideranca: { label: 'Liderança', plural: 'Lideranças', field: 'LIDERANÇA' }
};

export default function App() {
  const [emendas, setEmendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('admin');
  const [mapGeoJson, setMapGeoJson] = useState(null);

  const [currentView, setCurrentView] = useState('list');
  const [viewMode, setViewMode] = useState('table');
  const [selectedEmenda, setSelectedEmenda] = useState(null);
  const [editingEmenda, setEditingEmenda] = useState(null);

  const [selectedEntityFicha, setSelectedEntityFicha] = useState(null);
  const [entityHistory, setEntityHistory] = useState([]);

  // Filtros Universais de Multiseleção
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArticuladores, setFilterArticuladores] = useState([]);
  const [filterMunicipios, setFilterMunicipios] = useState([]);
  const [filterRegioes, setFilterRegioes] = useState([]);
  const [filterModalidades, setFilterModalidades] = useState([]);
  const [filterEntidades, setFilterEntidades] = useState([]);
  const [filterTemas, setFilterTemas] = useState([]);
  const [filterUOs, setFilterUOs] = useState([]);
  const [filterSituacoes, setFilterSituacoes] = useState([]);
  const [filterAnos, setFilterAnos] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const normalizedEmendas = useMemo(() => {
    return emendas.map(e => ({
      ...e,
      MODALIDADE: getModalidade(e),
      ANO: e.ANO ? String(e.ANO).trim() : (String(e['NÚMERO DA EMENDA'] || '').split('/')[1] || '').trim()
    }));
  }, [emendas]);

  const articuladores = useMemo(() => [...new Set(normalizedEmendas.map(e => e.ARTICULADOR).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [normalizedEmendas]);
  const municipios = useMemo(() => [...new Set(normalizedEmendas.map(e => e['MUNICÍPIO']).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [normalizedEmendas]);
  const regioes = useMemo(() => [...new Set(normalizedEmendas.map(e => e.REGIÃO).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [normalizedEmendas]);
  const modalidades = useMemo(() => [...new Set(normalizedEmendas.map(e => e.MODALIDADE).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [normalizedEmendas]);
  const entidades = useMemo(() => [...new Set(normalizedEmendas.map(e => e['RAZÃO SOCIAL']).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [normalizedEmendas]);
  const temas = useMemo(() => [...new Set(normalizedEmendas.map(e => e.TEMA).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [normalizedEmendas]);
  const unidadesOrcamentarias = useMemo(() => [...new Set(normalizedEmendas.map(e => e['UNIDADE ORÇAMENTÁRIA']).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [normalizedEmendas]);
  const situacoes = useMemo(() => [...new Set(normalizedEmendas.map(e => e.SITUAÇÃO).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [normalizedEmendas]);
  const anos = useMemo(() => [...new Set(normalizedEmendas.map(e => String(e.ANO || '').trim()).filter(Boolean))].sort(), [normalizedEmendas]);

  useEffect(() => {
    document.title = "TABULUM - Emendas";

    const loadData = async () => {
      const storedEmendas = localStorage.getItem('tabulum_emendas_data');
      if (storedEmendas) {
        try { setEmendas(JSON.parse(storedEmendas)); } catch (e) {}
      }
      const storedAuth = sessionStorage.getItem('tabulum_emendas_auth');
      if (storedAuth === 'true') setIsAdmin(true);
      const storedPass = localStorage.getItem('tabulum_emendas_pass');
      if (storedPass) setAdminPassword(storedPass);

      try {
        const response = await fetch('/api/emendas');
        if (response.ok) {
          const newData = await response.json();
          if (newData && newData.length > 0) {
            setEmendas(newData);
            localStorage.setItem('tabulum_emendas_data', JSON.stringify(newData));
          }
        }
      } catch (error) {
        console.error("Erro ao sincronizar com servidor interno:", error);
      }
      setLoading(false);
    };

    loadData();

    fetch('https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-42-mun.json')
      .then(res => res.json())
      .then(data => setMapGeoJson(data))
      .catch(err => console.error("Erro ao carregar mapa:", err));
  }, []);

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterArticuladores([]);
    setFilterMunicipios([]);
    setFilterRegioes([]);
    setFilterModalidades([]);
    setFilterEntidades([]);
    setFilterTemas([]);
    setFilterUOs([]);
    setFilterSituacoes([]);
    setFilterAnos([]);
  };

  const resetToFrontPage = () => {
    setCurrentView('list');
    setViewMode('table');
    setSelectedEntityFicha(null);
    setEntityHistory([]);
    clearAllFilters();
    setSortConfig({ key: null, direction: 'asc' });
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

  const syncWithGoogleSheet = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/emendas');
      if (!response.ok) throw new Error("Falha ao carregar do servidor interno.");
      const newData = await response.json();
      if (newData && newData.length > 0) {
        saveEmendasLocally(newData);
        alert("Sincronização concluída com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao sincronizar com proxy interno:", error);
      alert("Erro ao sincronizar. Verifique a conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmenda = async () => {
    if (!editingEmenda) return;
    try {
      const updatedEmendas = emendas.map(e =>
        e['NÚMERO DA EMENDA'] === editingEmenda['NÚMERO DA EMENDA'] ? editingEmenda : e
      );
      if (!emendas.some(e => e['NÚMERO DA EMENDA'] === editingEmenda['NÚMERO DA EMENDA'])) {
        updatedEmendas.push(editingEmenda);
      }
      saveEmendasLocally(updatedEmendas);
      setSelectedEmenda(editingEmenda);
      setEditingEmenda(null);
      setCurrentView('detail');

      fetch('/api/emendas', {
        method: 'POST',
        body: JSON.stringify({ action: 'update', data: editingEmenda }),
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.error("Erro ao enviar para o servidor:", err));
    } catch (error) {
      console.error("Erro ao salvar:", error);
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
          const newData = rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          }).filter(em => em['NÚMERO DA EMENDA']);
          saveEmendasLocally(newData);
          alert("Base importada com sucesso via CSV!");
        } else {
          alert("O arquivo CSV parece estar vazio ou o formato não foi reconhecido.");
        }
      } catch (error) {
        alert("Erro ao processar arquivo: " + error.message);
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleChangePassword = (newPassword) => {
    saveSettingsLocally(newPassword);
    alert("Senha alterada com sucesso!");
  };

  const handleLogin = () => {
    if (loginInput === adminPassword) {
      setIsAdmin(true);
      sessionStorage.setItem('tabulum_emendas_auth', 'true');
      setShowLoginModal(false);
      setLoginInput('');
    } else {
      alert("Senha incorreta.");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('tabulum_emendas_auth');
  };

  const confirmAction = (title, message, onConfirm) => {
    setConfirmModal({
      isOpen: true, title, message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const openEntityFicha = (type, value, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!value || String(value).trim() === '' || String(value).trim() === '-') return;
    const cleanVal = String(value).trim();

    if (currentView === 'entity' && selectedEntityFicha) {
      if (selectedEntityFicha.type === type && selectedEntityFicha.value === cleanVal) return;
      setEntityHistory(prev => [...prev, selectedEntityFicha]);
    } else {
      setEntityHistory([]);
    }

    setSelectedEntityFicha({ type, value: cleanVal });
    setCurrentView('entity');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBackFromEntityFicha = () => {
    if (entityHistory.length > 0) {
      const previous = entityHistory[entityHistory.length - 1];
      setEntityHistory(prev => prev.slice(0, -1));
      setSelectedEntityFicha(previous);
    } else {
      setSelectedEntityFicha(null);
      setCurrentView('list');
    }
  };

  const applyEntityFilterToMainList = (type, value) => {
    clearAllFilters();
    setSelectedEntityFicha(null);
    setEntityHistory([]);
    setCurrentView('list');
    if (type === 'articulador') setFilterArticuladores([value]);
    if (type === 'municipio') setFilterMunicipios([value]);
    if (type === 'regiao') setFilterRegioes([value]);
    if (type === 'modalidade') setFilterModalidades([value]);
    if (type === 'entidade') setFilterEntidades([value]);
    if (type === 'tema') setFilterTemas([value]);
    if (type === 'uo') setFilterUOs([value]);
    if (type === 'situacao') setFilterSituacoes([value]);
    if (type === 'ano') setFilterAnos([String(value)]);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedEmendas = useMemo(() => {
    const filtered = normalizedEmendas.filter(e => {
      const matchesSearch = searchTerm === '' || JSON.stringify(e).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesArticulador = filterArticuladores.length === 0 || filterArticuladores.includes(e.ARTICULADOR);
      const matchesMunicipio = filterMunicipios.length === 0 || filterMunicipios.includes(e['MUNICÍPIO']);
      const matchesRegiao = filterRegioes.length === 0 || filterRegioes.includes(e.REGIÃO);
      const matchesModalidade = filterModalidades.length === 0 || filterModalidades.includes(e.MODALIDADE);
      const matchesEntidade = filterEntidades.length === 0 || filterEntidades.includes(e['RAZÃO SOCIAL']);
      const matchesTema = filterTemas.length === 0 || filterTemas.includes(e.TEMA);
      const matchesUO = filterUOs.length === 0 || filterUOs.includes(e['UNIDADE ORÇAMENTÁRIA']);
      const matchesSituacao = filterSituacoes.length === 0 || filterSituacoes.includes(e.SITUAÇÃO);
      const matchesAno = filterAnos.length === 0 || filterAnos.includes(String(e.ANO || '').trim());

      return (
        matchesSearch &&
        matchesArticulador &&
        matchesMunicipio &&
        matchesRegiao &&
        matchesModalidade &&
        matchesEntidade &&
        matchesTema &&
        matchesUO &&
        matchesSituacao &&
        matchesAno
      );
    });

    return sortEmendasList(filtered, sortConfig);
  }, [
    normalizedEmendas,
    searchTerm,
    filterArticuladores,
    filterMunicipios,
    filterRegioes,
    filterModalidades,
    filterEntidades,
    filterTemas,
    filterUOs,
    filterSituacoes,
    filterAnos,
    sortConfig
  ]);

  const exportRowsToCSV = (rowsToExport, filename = "emendas_filtradas.csv") => {
    if (!rowsToExport || rowsToExport.length === 0) {
      alert("Nenhum dado disponível para exportar.");
      return;
    }

    const headers = Array.from(new Set(rowsToExport.flatMap(Object.keys)));
    const csvRows = [];
    csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

    rowsToExport.forEach(row => {
      const values = headers.map(header => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSituacaoClasses = (situacao) => {
    const s = String(situacao || '').toLowerCase();
    if (s === 'pago') return 'bg-sky-700 text-white border-slate-800 hover:bg-sky-800';
    if (s.includes('parcial')) return 'bg-sky-100 text-sky-950 border-sky-800 hover:bg-sky-200';
    if (s.includes('pagar')) return 'bg-amber-300 text-slate-900 border-slate-800 hover:bg-amber-400';
    return 'bg-slate-100 text-slate-800 border-slate-600 hover:bg-slate-200';
  };

  const getModalidadeClasses = (modalidade) => {
    const m = String(modalidade || '').toLowerCase();
    if (m.includes('convênio') || m.includes('convenio') || m.includes('entidade')) {
      return 'bg-rose-50 text-rose-800 border-rose-700 hover:bg-rose-100';
    }
    if (m.includes('transferência') || m.includes('transferencia')) {
      return 'bg-sky-50 text-sky-800 border-sky-700 hover:bg-sky-100';
    }
    if (m.includes('execução') || m.includes('execucao') || m.includes('órgão')) {
      return 'bg-amber-50 text-amber-900 border-amber-600 hover:bg-amber-100';
    }
    return 'bg-slate-50 text-slate-700 border-slate-400 hover:bg-slate-100';
  };

  const sortableFieldsList = [
    { key: 'NÚMERO DA EMENDA', label: 'Número da Emenda' },
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
    { key: 'PAGO', label: 'Valor Pago' }
  ];

  const MultiSelect = ({ id, label, options, selected, onChange }) => {
    const isOpen = openDropdown === id;
    const [optionSearch, setOptionSearch] = useState('');

    const handleToggleDropdown = (e) => {
      e.stopPropagation();
      setOpenDropdown(isOpen ? null : id);
    };

    const handleToggleOption = (e, opt) => {
      e.stopPropagation();
      if (selected.includes(opt)) {
        onChange(selected.filter(i => i !== opt));
      } else {
        onChange([...selected, opt]);
      }
    };

    const handleClear = (e) => {
      e.stopPropagation();
      onChange([]);
    };

    let displayText = `${label}: Todos`;
    if (selected.length === 1) displayText = `${label}: ${selected[0]}`;
    else if (selected.length > 1) displayText = `${label}: ${selected.length}`;

    const visibleOptions = options.filter(opt =>
      String(opt).toLowerCase().includes(optionSearch.toLowerCase())
    );

    return (
      <div className="relative w-full">
        <div
          onClick={handleToggleDropdown}
          className={`px-2.5 py-1.5 bg-white border transition-colors font-semibold uppercase text-[11px] cursor-pointer flex justify-between items-center w-full ${
            selected.length > 0
              ? 'border-sky-700 bg-sky-50 text-sky-950 shadow-[1px_1px_0_0_#0369a1]'
              : 'border-slate-300 text-slate-700 hover:border-slate-500 hover:bg-slate-50/70'
          }`}
        >
          <span className="truncate pr-1.5" title={displayText}>{displayText}</span>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {selected.length > 0 && (
              <div onClick={handleClear} className="hover:text-rose-700 bg-white/80 rounded p-0.5" title="Limpar filtro">
                <XIcon className="w-3 h-3 text-slate-800" />
              </div>
            )}
            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>
        {isOpen && (
          <div
            className="absolute z-40 top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto bg-white border border-slate-700 shadow-[3px_3px_0_0_#1e293b] flex flex-col p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {options.length > 8 && (
              <input
                type="text"
                placeholder="Filtrar lista..."
                value={optionSearch}
                onChange={(e) => setOptionSearch(e.target.value)}
                className="mb-2 px-2 py-1 text-xs border border-slate-300 focus:outline-none focus:border-sky-700 text-slate-900"
              />
            )}
            {visibleOptions.map(opt => (
              <label key={opt} className="flex items-center space-x-2 cursor-pointer hover:bg-amber-50 p-1.5 transition-colors">
                <input
                  type="checkbox"
                  className="accent-sky-700 w-3.5 h-3.5 border border-slate-600 cursor-pointer flex-shrink-0"
                  checked={selected.includes(opt)}
                  onChange={(e) => handleToggleOption(e, opt)}
                />
                <span className="text-xs font-medium uppercase truncate flex-1 text-slate-800" title={opt}>{opt}</span>
              </label>
            ))}
            {visibleOptions.length === 0 && (
              <span className="text-xs text-slate-400 italic p-2 text-center">Nenhum item</span>
            )}
          </div>
        )}
      </div>
    );
  };

  // Barra de Filtros Fixa na Parte Superior (Sticky), Suavizada e Distribuída Uniformemente
  const FilterBar = () => {
    const activeFilterCount =
      filterArticuladores.length +
      filterMunicipios.length +
      filterRegioes.length +
      filterModalidades.length +
      filterEntidades.length +
      filterTemas.length +
      filterUOs.length +
      filterSituacoes.length +
      filterAnos.length;

    const hasFilters = Boolean(searchTerm) || activeFilterCount > 0;

    return (
      <div className="sticky top-14 sm:top-16 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-300 shadow-xs mb-5 print:hidden">
        <div className="max-w-[96%] xl:max-w-[1440px] mx-auto px-3 sm:px-4 py-2.5 space-y-2">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Busca livre (número, objeto, entidade, liderança, SGPe, município...)"
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50/70 border border-slate-300 rounded-none focus:outline-none focus:border-sky-700 focus:bg-white font-medium text-xs text-slate-900 placeholder-slate-400 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Botão no celular para recolher/expandir os filtros e não ocupar tela durante a rolagem */}
            <button
              onClick={() => setMobileFiltersExpanded(prev => !prev)}
              className={`sm:hidden px-2.5 py-1.5 border text-[11px] font-bold uppercase flex items-center gap-1 ${
                activeFilterCount > 0
                  ? 'border-sky-700 bg-sky-50 text-sky-900'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              <FilterIcon className="w-3.5 h-3.5" />
              <span>Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
            </button>

            {hasFilters && (
              <button
                onClick={clearAllFilters}
                className="bg-rose-700 px-2.5 py-1.5 text-white border border-rose-800 hover:bg-rose-800 transition-colors flex items-center justify-center text-[11px] font-semibold uppercase whitespace-nowrap"
                title="Limpar todos os filtros"
              >
                <XIcon className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Limpar</span>
              </button>
            )}
          </div>

          {/* Grade com distribuição uniforme: 9 colunas iguais no desktop (1 linha única), 3x3 no tablet e 2 colunas no mobile */}
          <div className={`${mobileFiltersExpanded ? 'grid' : 'hidden'} sm:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-1.5 items-center`}>
            <MultiSelect id="mod" label="Modalidade" options={modalidades} selected={filterModalidades} onChange={setFilterModalidades} />
            <MultiSelect id="ent" label="Entidade" options={entidades} selected={filterEntidades} onChange={setFilterEntidades} />
            <MultiSelect id="art" label="Articulador" options={articuladores} selected={filterArticuladores} onChange={setFilterArticuladores} />
            <MultiSelect id="mun" label="Município" options={municipios} selected={filterMunicipios} onChange={setFilterMunicipios} />
            <MultiSelect id="reg" label="Região" options={regioes} selected={filterRegioes} onChange={setFilterRegioes} />
            <MultiSelect id="tem" label="Tema" options={temas} selected={filterTemas} onChange={setFilterTemas} />
            <MultiSelect id="uo" label="Unid. Orçamentária" options={unidadesOrcamentarias} selected={filterUOs} onChange={setFilterUOs} />
            <MultiSelect id="sit" label="Situação" options={situacoes} selected={filterSituacoes} onChange={setFilterSituacoes} />
            <MultiSelect id="ano" label="Ano" options={anos} selected={filterAnos} onChange={setFilterAnos} />
          </div>
        </div>
      </div>
    );
  };

  const Navbar = () => (
    <nav className="bg-white border-b border-slate-300 sticky top-0 z-30 print:hidden">
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-rose-700"></div>
        <div className="w-1/3 bg-sky-700"></div>
        <div className="w-1/3 bg-amber-300"></div>
      </div>
      <div className="max-w-[96%] xl:max-w-[1440px] mx-auto px-3 sm:px-4">
        <div className="flex justify-between h-13 sm:h-15">
          <div className="flex items-center cursor-pointer group" onClick={resetToFrontPage} title="Voltar ao Início">
            <img
              src="https://raw.githubusercontent.com/killuixo/tabulum-sig-emendas/refs/heads/main/icon-192.png"
              alt="Ícone TABULUM"
              className="w-7 h-7 sm:w-8 sm:h-8 mr-2.5 object-contain transition-transform group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="font-black text-base sm:text-xl tracking-tight text-slate-900">TABULUM - Emendas</span>
          </div>
          <div className="flex items-center space-x-2.5">
            {isAdmin ? (
              <>
                <div className="hidden md:flex items-center bg-sky-700 border border-slate-800 px-2.5 py-1 text-xs font-bold text-white">
                  <UserIcon className="h-3.5 w-3.5 mr-1.5" /> ADMIN
                </div>
                <button
                  onClick={() => setCurrentView('settings')}
                  className="bg-amber-300 border border-slate-800 p-1.5 hover:bg-amber-400 shadow-[2px_2px_0_0_#1e293b]"
                  title="Ajustes"
                >
                  <SettingsIcon className="h-4 w-4 text-slate-900" />
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-rose-700 border border-slate-800 p-1.5 hover:bg-rose-800 shadow-[2px_2px_0_0_#1e293b]"
                  title="Sair"
                >
                  <LogOutIcon className="h-4 w-4 text-white" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center bg-amber-300 border border-slate-800 px-3 py-1.5 font-bold text-xs text-slate-900 uppercase shadow-[2px_2px_0_0_#1e293b] hover:bg-amber-400"
              >
                <LogInIcon className="h-3.5 w-3.5 mr-1.5" /> Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  const HeaderSwitcher = ({ title }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-3 md:space-y-0 print:hidden">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">{title}</h1>
        <div className="flex border border-slate-800 bg-white shadow-[2px_2px_0_0_#1e293b]">
          <button
            onClick={() => setCurrentView('list')}
            className={`px-3 py-1.5 flex items-center font-bold uppercase text-xs border-r border-slate-800 transition-colors ${
              currentView === 'list' ? 'bg-slate-900 text-white' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5 sm:mr-1.5" /> <span className="ml-1 sm:ml-0">Quadro</span>
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1.5 flex items-center font-bold uppercase text-xs transition-colors ${
              currentView === 'dashboard' ? 'bg-amber-300 text-slate-900' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboardIcon className="h-3.5 w-3.5 sm:mr-1.5" /> <span className="ml-1 sm:ml-0">Dashboard</span>
          </button>
        </div>
      </div>
      {isAdmin && currentView === 'list' && (
        <button
          onClick={() => confirmAction("Sincronizar Planilha", "Deseja sincronizar com o Google Sheets? Isso atualizará seus dados locais com as versões mais recentes do Google.", syncWithGoogleSheet)}
          className="flex items-center px-3.5 py-1.5 bg-sky-700 text-white text-xs font-bold uppercase border border-slate-800 shadow-[2px_2px_0_0_#1e293b] hover:bg-sky-800"
        >
          <RefreshCwIcon className="h-3.5 w-3.5 mr-1.5" /> <span>Sincronizar</span>
        </button>
      )}
    </div>
  );

  const renderEmendasTableOrCards = (rows, activeSortConfig, onRequestSort, activeViewMode) => {
    const SortableHeader = ({ label, sortKey, extraClasses = "" }) => {
      const isActive = activeSortConfig?.key === sortKey;
      return (
        <th
          className={`py-2.5 text-left text-[11px] font-black text-slate-900 uppercase cursor-pointer hover:bg-amber-300/80 transition-colors border-r border-slate-800 print:border-slate-800 select-none ${extraClasses}`}
          onClick={() => onRequestSort(sortKey)}
          title={`Ordenar por ${label}`}
        >
          <div className="flex items-center justify-between space-x-1">
            <span>{label}</span>
            {isActive ? (
              activeSortConfig.direction === 'asc' ? <ChevronUpIcon className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronDownIcon className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <ChevronUpIcon className="w-3.5 h-3.5 opacity-25 print:hidden flex-shrink-0" />
            )}
          </div>
        </th>
      );
    };

    if (activeViewMode === 'table') {
      return (
        <div className="bg-white border border-slate-800 overflow-x-auto shadow-[3px_3px_0_0_#1e293b] print:shadow-none print:border print:overflow-visible print:w-full">
          <table className="min-w-[1300px] w-full border-collapse table-fixed print:min-w-0 print:w-full">
            <thead className="bg-amber-200 border-b border-slate-800 print:bg-amber-200">
              <tr>
                <SortableHeader label="Número" sortKey="NÚMERO DA EMENDA" extraClasses="w-[88px] px-2.5 print:w-[7%]" />
                <SortableHeader label="Região" sortKey="REGIÃO" extraClasses="w-[120px] px-2.5 print:w-[9%]" />
                <SortableHeader label="Município" sortKey="MUNICÍPIO" extraClasses="w-[130px] px-2.5 print:w-[10%]" />
                <SortableHeader label="Modalidade" sortKey="MODALIDADE" extraClasses="w-[140px] px-2.5 print:w-[10%]" />
                <SortableHeader label="Entidade" sortKey="RAZÃO SOCIAL" extraClasses="w-[185px] px-2.5 print:w-[14%]" />
                <SortableHeader label="Objeto" sortKey="OBJETO" extraClasses="w-auto px-3 print:w-auto" />
                <SortableHeader label="Unidade Orçamentária" sortKey="UNIDADE ORÇAMENTÁRIA" extraClasses="w-[125px] px-2.5 print:w-[8%]" />
                <SortableHeader label="Articulador" sortKey="ARTICULADOR" extraClasses="w-[110px] px-2.5 print:w-[8%]" />
                <SortableHeader label="Situação" sortKey="SITUAÇÃO" extraClasses="w-[105px] px-2.5 print:w-[8%]" />
                <SortableHeader label="Total" sortKey="TOTAL" extraClasses="w-[115px] px-2.5 print:w-[8%]" />
                <SortableHeader label="Pago" sortKey="PAGO" extraClasses="w-[115px] px-2.5 border-r-0 print:w-[8%]" />
              </tr>
            </thead>
            <tbody className="bg-white print:text-[9px]">
              {rows.map((emenda, idx) => (
                <tr
                  key={emenda['NÚMERO DA EMENDA'] || idx}
                  onClick={() => { setSelectedEmenda(emenda); setCurrentView('detail'); }}
                  className="hover:bg-amber-50/60 cursor-pointer border-b border-slate-200 transition-colors print:break-inside-avoid print:cursor-auto"
                >
                  <td className="px-2.5 py-2 text-xs print:text-[9px] font-bold text-slate-900 border-r border-slate-200 truncate print:whitespace-normal">
                    {emenda['NÚMERO DA EMENDA']}
                  </td>

                  <td
                    onClick={(e) => emenda.REGIÃO && openEntityFicha('regiao', emenda.REGIÃO, e)}
                    className="px-2.5 py-2 text-[11px] print:text-[9px] font-semibold uppercase text-slate-700 hover:text-sky-700 hover:underline border-r border-slate-200 truncate print:whitespace-normal"
                    title={emenda.REGIÃO ? `Abrir Ficha da Região: ${emenda.REGIÃO}` : ''}
                  >
                    {emenda.REGIÃO || '-'}
                  </td>

                  <td
                    onClick={(e) => emenda['MUNICÍPIO'] && openEntityFicha('municipio', emenda['MUNICÍPIO'], e)}
                    className="px-2.5 py-2 text-xs print:text-[9px] font-bold uppercase text-sky-700 hover:text-rose-700 hover:underline border-r border-slate-200 truncate print:whitespace-normal"
                    title={emenda['MUNICÍPIO'] ? `Abrir Ficha do Município: ${emenda['MUNICÍPIO']}` : ''}
                  >
                    {emenda['MUNICÍPIO']}
                  </td>

                  <td
                    onClick={(e) => emenda.MODALIDADE && openEntityFicha('modalidade', emenda.MODALIDADE, e)}
                    className="px-2.5 py-2 border-r border-slate-200 align-middle"
                  >
                    <span
                      className={`block w-full text-center border px-1.5 py-0.5 text-[10px] print:text-[8px] font-bold uppercase truncate print:whitespace-normal transition-colors ${getModalidadeClasses(emenda.MODALIDADE)}`}
                      title={emenda.MODALIDADE ? `Abrir Ficha da Modalidade: ${emenda.MODALIDADE}` : ''}
                    >
                      {emenda.MODALIDADE || '-'}
                    </span>
                  </td>

                  <td
                    onClick={(e) => emenda['RAZÃO SOCIAL'] && openEntityFicha('entidade', emenda['RAZÃO SOCIAL'], e)}
                    className={`px-2.5 py-2 text-xs print:text-[9px] font-semibold border-r border-slate-200 truncate print:whitespace-normal ${
                      emenda['RAZÃO SOCIAL'] ? 'text-slate-900 hover:text-rose-700 hover:underline' : 'text-slate-400'
                    }`}
                    title={emenda['RAZÃO SOCIAL'] ? `Abrir Ficha da Entidade: ${emenda['RAZÃO SOCIAL']}` : ''}
                  >
                    {emenda['RAZÃO SOCIAL'] || '-'}
                  </td>

                  <td className="px-3 py-2 text-xs print:text-[9px] text-slate-800 font-medium border-r border-slate-200 line-clamp-2 print:line-clamp-none print:whitespace-normal print:break-words" title={emenda.OBJETO}>
                    {emenda.OBJETO}
                  </td>

                  <td
                    onClick={(e) => emenda['UNIDADE ORÇAMENTÁRIA'] && openEntityFicha('uo', emenda['UNIDADE ORÇAMENTÁRIA'], e)}
                    className="px-2.5 py-2 text-[11px] print:text-[9px] font-bold uppercase text-slate-700 hover:text-sky-700 hover:underline border-r border-slate-200 truncate text-center"
                    title={emenda['UNIDADE ORÇAMENTÁRIA'] ? `Abrir Ficha da Unidade Orçamentária: ${emenda['UNIDADE ORÇAMENTÁRIA']}` : ''}
                  >
                    {emenda['UNIDADE ORÇAMENTÁRIA'] || '-'}
                  </td>

                  <td
                    onClick={(e) => emenda.ARTICULADOR && openEntityFicha('articulador', emenda.ARTICULADOR, e)}
                    className="px-2.5 py-2 text-xs print:text-[9px] font-bold text-rose-700 hover:text-sky-700 hover:underline border-r border-slate-200 truncate print:whitespace-normal"
                    title={emenda.ARTICULADOR ? `Abrir Ficha do Articulador: ${emenda.ARTICULADOR}` : ''}
                  >
                    {emenda.ARTICULADOR || '-'}
                  </td>

                  <td
                    onClick={(e) => emenda.SITUAÇÃO && openEntityFicha('situacao', emenda.SITUAÇÃO, e)}
                    className="px-2.5 py-2 border-r border-slate-200 align-middle"
                  >
                    <span
                      className={`block w-full text-center border px-1 py-0.5 text-[10px] print:text-[8px] font-bold uppercase truncate print:whitespace-normal transition-colors ${getSituacaoClasses(emenda.SITUAÇÃO)}`}
                      title={emenda.SITUAÇÃO ? `Abrir Ficha da Situação: ${emenda.SITUAÇÃO}` : ''}
                    >
                      {emenda.SITUAÇÃO || 'Indefinida'}
                    </span>
                  </td>

                  <td className="px-2.5 py-2 text-xs print:text-[9px] font-bold text-slate-900 border-r border-slate-200 truncate print:whitespace-normal text-right">
                    {formatCurrency(parseCurrency(emenda.TOTAL))}
                  </td>

                  <td className="px-2.5 py-2 text-xs print:text-[9px] font-bold text-sky-800 truncate print:whitespace-normal text-right border-r-0">
                    {parseCurrency(emenda.PAGO) > 0 ? formatCurrency(parseCurrency(emenda.PAGO)) : '-'}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="11" className="px-6 py-10 text-center font-bold text-slate-400 uppercase text-xs">
                    Nenhuma emenda encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="bg-slate-50 px-4 py-2.5 font-bold text-xs text-slate-800 flex flex-wrap justify-between gap-2 border-t border-slate-800 print:hidden">
            <span>Exibindo {rows.length} registros</span>
            <span className="text-slate-500">Clique em qualquer Região, Município, Modalidade, Entidade, Unidade Orçamentária, Articulador ou Situação para abrir sua Ficha</span>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 print:grid-cols-2 print:gap-4">
        {rows.map((emenda, idx) => (
          <div
            key={emenda['NÚMERO DA EMENDA'] || idx}
            className="border border-slate-800 bg-white shadow-[3px_3px_0_0_#1e293b] print:shadow-none flex flex-col hover:-translate-y-0.5 transition-transform cursor-pointer print:break-inside-avoid print:cursor-auto"
            onClick={() => { setSelectedEmenda(emenda); setCurrentView('detail'); }}
          >
            <div className="bg-amber-200 border-b border-slate-800 p-3 flex justify-between items-center print:bg-amber-200">
              <div className="flex items-center space-x-2">
                <span className="font-black text-slate-900 text-base tracking-tight print:text-sm">
                  #{emenda['NÚMERO DA EMENDA']}
                </span>
                {emenda['UNIDADE ORÇAMENTÁRIA'] && (
                  <button
                    onClick={(e) => openEntityFicha('uo', emenda['UNIDADE ORÇAMENTÁRIA'], e)}
                    className="bg-white border border-slate-800 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-800 hover:bg-sky-700 hover:text-white transition-colors"
                    title={`Abrir Ficha da Unidade Orçamentária: ${emenda['UNIDADE ORÇAMENTÁRIA']}`}
                  >
                    {emenda['UNIDADE ORÇAMENTÁRIA']}
                  </button>
                )}
              </div>
              <button
                onClick={(e) => emenda.SITUAÇÃO && openEntityFicha('situacao', emenda.SITUAÇÃO, e)}
                className={`border px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${getSituacaoClasses(emenda.SITUAÇÃO)}`}
                title={`Abrir Ficha da Situação: ${emenda.SITUAÇÃO}`}
              >
                {emenda.SITUAÇÃO || 'Indefinida'}
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col space-y-2.5 print:p-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={(e) => emenda['MUNICÍPIO'] && openEntityFicha('municipio', emenda['MUNICÍPIO'], e)}
                  className="flex items-center text-left hover:underline"
                  title={`Abrir Ficha do Município: ${emenda['MUNICÍPIO']}`}
                >
                  <MapPinIcon className="h-4 w-4 mr-1 text-sky-700 print:text-slate-900" />
                  <span className="text-sky-700 font-bold uppercase text-xs sm:text-sm print:text-slate-900">{emenda['MUNICÍPIO']}</span>
                </button>
                {emenda.REGIÃO && (
                  <button
                    onClick={(e) => openEntityFicha('regiao', emenda.REGIÃO, e)}
                    className="flex items-center text-left hover:underline"
                    title={`Abrir Ficha da Região: ${emenda.REGIÃO}`}
                  >
                    <MapIcon className="h-3.5 w-3.5 mr-1 text-slate-600" />
                    <span className="text-slate-600 font-bold uppercase text-[11px]">{emenda.REGIÃO}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-b border-slate-200 py-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500">Modalidade:</span>
                <button
                  onClick={(e) => emenda.MODALIDADE && openEntityFicha('modalidade', emenda.MODALIDADE, e)}
                  className={`border px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${getModalidadeClasses(emenda.MODALIDADE)}`}
                  title={`Abrir Ficha da Modalidade: ${emenda.MODALIDADE}`}
                >
                  {emenda.MODALIDADE || '-'}
                </button>
              </div>

              {emenda['RAZÃO SOCIAL'] && (
                <div
                  onClick={(e) => openEntityFicha('entidade', emenda['RAZÃO SOCIAL'], e)}
                  className="bg-rose-50/70 border-l-2 border-rose-700 px-2.5 py-1.5 hover:bg-rose-100/80 transition-colors"
                  title={`Abrir Ficha da Entidade: ${emenda['RAZÃO SOCIAL']}`}
                >
                  <p className="text-[10px] font-bold uppercase text-rose-700">Entidade</p>
                  <p className="text-xs font-bold text-slate-900 break-words underline-offset-2 hover:underline">{emenda['RAZÃO SOCIAL']}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Objeto</p>
                <p className="text-xs sm:text-sm font-medium text-slate-800 line-clamp-3 flex-1 print:line-clamp-none print:text-xs">
                  {emenda.OBJETO}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-800 p-3.5 flex justify-between items-end print:p-2">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Articulador</p>
                <button
                  onClick={(e) => emenda.ARTICULADOR && openEntityFicha('articulador', emenda.ARTICULADOR, e)}
                  className="text-rose-700 font-bold text-xs sm:text-sm uppercase truncate max-w-[140px] hover:underline text-left block"
                  title={emenda.ARTICULADOR ? `Abrir Ficha do Articulador: ${emenda.ARTICULADOR}` : ''}
                >
                  {emenda.ARTICULADOR || '-'}
                </button>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Total</p>
                <p className="font-black text-slate-900 text-base sm:text-lg leading-none print:text-sm">
                  {formatCurrency(parseCurrency(emenda.TOTAL))}
                </p>
                {parseCurrency(emenda.PAGO) > 0 && (
                  <p className="text-[11px] font-bold text-sky-800 mt-1">
                    Pago: {formatCurrency(parseCurrency(emenda.PAGO))}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="col-span-full py-12 text-center font-bold text-slate-500 uppercase border border-slate-400 border-dashed text-xs">
            Nenhuma emenda encontrada.
          </div>
        )}
      </div>
    );
  };

  const ListView = () => (
    <>
      <FilterBar />
      <div className="max-w-[96%] xl:max-w-[1440px] mx-auto px-3 sm:px-4 pb-6 animate-in fade-in print:w-full print:max-w-none print:m-0 print:p-0">
        <HeaderSwitcher title="Painel de Emendas" />

        <div className="flex flex-wrap justify-between gap-3 mb-4 items-center print:hidden">
          <div className="flex border border-slate-800 bg-white shadow-[2px_2px_0_0_#1e293b]">
            <button
              onClick={() => exportRowsToCSV(filteredAndSortedEmendas, "emendas_filtradas.csv")}
              className="px-3 py-1.5 flex items-center font-bold uppercase text-xs border-r border-slate-800 transition-colors hover:bg-amber-200 text-slate-900"
              title="Exportar Filtrados para CSV"
            >
              <DownloadIcon className="h-4 w-4" /> <span className="ml-1.5">CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 flex items-center font-bold uppercase text-xs transition-colors hover:bg-sky-700 hover:text-white text-slate-900"
              title="Exportar para PDF / Imprimir"
            >
              <PrinterIcon className="h-4 w-4" /> <span className="ml-1.5">PDF</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center border border-slate-800 bg-white shadow-[2px_2px_0_0_#1e293b]">
              <select
                value={sortConfig.key || ''}
                onChange={(e) => setSortConfig({ key: e.target.value || null, direction: sortConfig.direction })}
                className="px-2.5 py-1.5 text-xs font-bold uppercase bg-white text-slate-900 focus:outline-none cursor-pointer"
                title="Escolher campo para ordenar"
              >
                <option value="">Ordenar por...</option>
                {sortableFieldsList.map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
              {sortConfig.key && (
                <button
                  onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                  className="px-2.5 py-1.5 border-l border-slate-800 bg-amber-200 hover:bg-amber-300 text-xs font-black uppercase text-slate-900 flex items-center"
                  title={sortConfig.direction === 'asc' ? 'Ordem Crescente (A-Z / 0-9)' : 'Ordem Decrescente (Z-A / 9-0)'}
                >
                  {sortConfig.direction === 'asc' ? (
                    <><ChevronUpIcon className="w-3.5 h-3.5 mr-1" /> Cresc.</>
                  ) : (
                    <><ChevronDownIcon className="w-3.5 h-3.5 mr-1" /> Decresc.</>
                  )}
                </button>
              )}
            </div>

            <div className="flex border border-slate-800 bg-white shadow-[2px_2px_0_0_#1e293b]">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 flex items-center font-bold uppercase text-xs border-r border-slate-800 transition-colors ${
                  viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-800 hover:bg-slate-100'
                }`}
                title="Visualização em Lista"
              >
                <ListIcon className="h-4 w-4" /> <span className="ml-1.5 hidden sm:inline">Lista</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 flex items-center font-bold uppercase text-xs transition-colors ${
                  viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-800 hover:bg-slate-100'
                }`}
                title="Visualização em Cards"
              >
                <GridIcon className="h-4 w-4" /> <span className="ml-1.5 hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {renderEmendasTableOrCards(filteredAndSortedEmendas, sortConfig, requestSort, viewMode)}
      </div>
    </>
  );

  const EntityProfileView = () => {
    const [fichaSearch, setFichaSearch] = useState('');
    const [fichaSortConfig, setFichaSortConfig] = useState({ key: 'NÚMERO DA EMENDA', direction: 'desc' });
    const [fichaViewMode, setFichaViewMode] = useState('table');
    const [crossSortByDim, setCrossSortByDim] = useState({});

    if (!selectedEntityFicha) return null;
    const { type, value } = selectedEntityFicha;
    const meta = ENTITY_TYPE_META[type] || { label: 'Categoria', plural: 'Categorias', field: type };

    const baseEntityEmendas = useMemo(() => {
      return normalizedEmendas.filter(e => {
        const cellVal = String(e[meta.field] || '').trim();
        return cellVal.toLowerCase() === String(value).trim().toLowerCase();
      });
    }, [normalizedEmendas, meta.field, value]);

    const fichaEmendas = useMemo(() => {
      const filtered = baseEntityEmendas.filter(e =>
        fichaSearch === '' || JSON.stringify(e).toLowerCase().includes(fichaSearch.toLowerCase())
      );
      return sortEmendasList(filtered, fichaSortConfig);
    }, [baseEntityEmendas, fichaSearch, fichaSortConfig]);

    const requestFichaSort = (key) => {
      let direction = 'asc';
      if (fichaSortConfig && fichaSortConfig.key === key && fichaSortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setFichaSortConfig({ key, direction });
    };

    const totalPrevisto = baseEntityEmendas.reduce((acc, e) => acc + parseCurrency(e.TOTAL), 0);
    const totalPago = baseEntityEmendas.reduce((acc, e) => acc + parseCurrency(e.PAGO), 0);
    const saldoPagar = Math.max(totalPrevisto - totalPago, 0);
    const pctExecutado = totalPrevisto > 0 ? (totalPago / totalPrevisto) * 100 : 0;

    const buildBreakdown = (dimType) => {
      const dimMeta = ENTITY_TYPE_META[dimType];
      const map = {};
      baseEntityEmendas.forEach(e => {
        const raw = String(e[dimMeta.field] || '').trim();
        const key = raw || 'Não informado';
        if (!map[key]) {
          map[key] = { name: key, isValid: Boolean(raw), count: 0, total: 0, pago: 0 };
        }
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
        const diff = a[sortConf.key] - b[sortConf.key];
        return sortConf.direction === 'asc' ? diff : -diff;
      });

      return items;
    };

    const toggleCrossSort = (dimType, key) => {
      setCrossSortByDim(prev => {
        const current = prev[dimType] || { key: 'total', direction: 'desc' };
        const nextDir = current.key === key && current.direction === 'desc' ? 'asc' : 'desc';
        return { ...prev, [dimType]: { key, direction: nextDir } };
      });
    };

    const crossDimensions = [
      'municipio',
      'regiao',
      'modalidade',
      'entidade',
      'uo',
      'articulador',
      'situacao',
      'tema',
      'ano',
      'lideranca'
    ].filter(d => d !== type);

    const liderancasDetalhadas = useMemo(() => {
      const map = {};
      baseEntityEmendas.forEach(e => {
        const lid = String(e.LIDERANÇA || '').trim();
        if (!lid) return;
        if (!map[lid]) {
          map[lid] = {
            nome: lid,
            telefone: e['TELEFONE DA LIDERANÇA'] || '',
            email: e['EMAIL DA LIDERANÇA'] || '',
            municipio: e['MUNICÍPIO'] || '',
            count: 0,
            total: 0
          };
        }
        map[lid].count += 1;
        map[lid].total += parseCurrency(e.TOTAL);
        if (!map[lid].telefone && e['TELEFONE DA LIDERANÇA']) map[lid].telefone = e['TELEFONE DA LIDERANÇA'];
        if (!map[lid].email && e['EMAIL DA LIDERANÇA']) map[lid].email = e['EMAIL DA LIDERANÇA'];
      });
      return Object.values(map).sort((a, b) => b.total - a.total);
    }, [baseEntityEmendas]);

    const uniqueCounts = {
      municipios: new Set(baseEntityEmendas.map(e => e['MUNICÍPIO']).filter(Boolean)).size,
      regioes: new Set(baseEntityEmendas.map(e => e.REGIÃO).filter(Boolean)).size,
      articuladores: new Set(baseEntityEmendas.map(e => e.ARTICULADOR).filter(Boolean)).size,
      modalidades: new Set(baseEntityEmendas.map(e => e.MODALIDADE).filter(Boolean)).size,
      entidades: new Set(baseEntityEmendas.map(e => e['RAZÃO SOCIAL']).filter(Boolean)).size,
      uos: new Set(baseEntityEmendas.map(e => e['UNIDADE ORÇAMENTÁRIA']).filter(Boolean)).size,
      temas: new Set(baseEntityEmendas.map(e => e.TEMA).filter(Boolean)).size,
      liderancas: new Set(baseEntityEmendas.map(e => e.LIDERANÇA).filter(Boolean)).size
    };

    return (
      <div className="max-w-[96%] xl:max-w-[1440px] mx-auto px-3 sm:px-4 py-6 animate-in fade-in print:w-full print:max-w-none print:m-0 print:p-0">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={goBackFromEntityFicha}
              className="bg-slate-900 text-white px-4 py-2 font-bold uppercase text-xs border border-slate-800 hover:bg-slate-800 flex items-center shadow-[3px_3px_0_0_#1e293b]"
            >
              &larr; {entityHistory.length > 0 ? `Voltar para ${entityHistory[entityHistory.length - 1].value}` : 'Voltar ao Painel'}
            </button>
            {entityHistory.length > 0 && (
              <button
                onClick={resetToFrontPage}
                className="bg-white text-slate-900 px-3 py-2 font-bold uppercase text-xs border border-slate-800 hover:bg-slate-100 shadow-[2px_2px_0_0_#1e293b]"
              >
                Início
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyEntityFilterToMainList(type, value)}
              className="bg-amber-300 text-slate-900 px-3.5 py-2 font-bold uppercase text-xs border border-slate-800 hover:bg-amber-400 flex items-center shadow-[2px_2px_0_0_#1e293b]"
              title="Aplicar como filtro no Quadro Geral"
            >
              <FilterIcon className="h-3.5 w-3.5 mr-1.5" /> Filtrar no Quadro Geral
            </button>
            <button
              onClick={() => exportRowsToCSV(fichaEmendas, `ficha_${type}_${normalizeStr(value)}.csv`)}
              className="bg-white text-slate-900 px-3 py-2 font-bold uppercase text-xs border border-slate-800 hover:bg-amber-200 flex items-center shadow-[2px_2px_0_0_#1e293b]"
            >
              <DownloadIcon className="h-3.5 w-3.5 mr-1.5" /> CSV
            </button>
            <button
              onClick={() => window.print()}
              className="bg-sky-700 text-white px-3 py-2 font-bold uppercase text-xs border border-slate-800 hover:bg-sky-800 flex items-center shadow-[2px_2px_0_0_#1e293b]"
            >
              <PrinterIcon className="h-3.5 w-3.5 mr-1.5" /> PDF
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-800 shadow-[4px_4px_0_0_#1e293b] mb-6 print:shadow-none">
          <div className="bg-sky-700 border-b border-slate-800 p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:bg-white">
            <div>
              <span className="inline-block bg-amber-300 text-slate-900 border border-slate-900 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider mb-2">
                Ficha de {meta.label} — Cruzamento de Dados
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight break-words print:text-slate-900">
                {value}
              </h1>
            </div>
            <div className="bg-white border border-slate-900 px-4 py-2.5 text-right shadow-[2px_2px_0_0_#1e293b]">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Total de Emendas</span>
              <span className="text-2xl font-black text-rose-700">{baseEntityEmendas.length}</span>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-slate-800 bg-slate-50/60">
            <div className="bg-white border border-slate-800 p-4 shadow-[2px_2px_0_0_#1e293b]">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Valor Total Previsto</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(totalPrevisto)}</p>
            </div>
            <div className="bg-white border border-slate-800 p-4 shadow-[2px_2px_0_0_#1e293b]">
              <p className="text-[10px] font-black uppercase text-sky-700 mb-1">Valor Total Pago</p>
              <p className="text-xl sm:text-2xl font-black text-sky-700">{formatCurrency(totalPago)}</p>
              <p className="text-[11px] font-bold text-slate-600 mt-1">{pctExecutado.toFixed(1)}% executado</p>
            </div>
            <div className="bg-white border border-slate-800 p-4 shadow-[2px_2px_0_0_#1e293b]">
              <p className="text-[10px] font-black uppercase text-rose-700 mb-1">Saldo a Pagar</p>
              <p className="text-xl sm:text-2xl font-black text-rose-700">{formatCurrency(saldoPagar)}</p>
            </div>
            <div className="bg-amber-100/90 border border-slate-800 p-4 shadow-[2px_2px_0_0_#1e293b] flex flex-col justify-between">
              <p className="text-[10px] font-black uppercase text-slate-800 mb-1.5">Abrangência na Ficha</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-bold text-slate-900">
                <span>Municípios: {uniqueCounts.municipios}</span>
                <span>Regiões: {uniqueCounts.regioes}</span>
                <span>Articuladores: {uniqueCounts.articuladores}</span>
                <span>Modalidades: {uniqueCounts.modalidades}</span>
                <span>Entidades: {uniqueCounts.entidades}</span>
                <span>Unid. Orç.: {uniqueCounts.uos}</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <h2 className="text-sm sm:text-base font-black uppercase text-slate-900 tracking-wider mb-4 flex items-center">
              <span className="w-2.5 h-5 bg-rose-700 border border-slate-900 mr-2"></span>
              Cruzamento de Dados ({value}) — Clique nos cabeçalhos para ordenar ou em qualquer item para abrir sua Ficha
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {crossDimensions.map(dimKey => {
                const dimMeta = ENTITY_TYPE_META[dimKey];
                const rows = buildBreakdown(dimKey);
                const sortConf = crossSortByDim[dimKey] || { key: 'total', direction: 'desc' };

                const CrossSortHeader = ({ label, colKey, align = 'left' }) => {
                  const active = sortConf.key === colKey;
                  return (
                    <th
                      onClick={() => toggleCrossSort(dimKey, colKey)}
                      className={`py-1.5 px-2 text-[10px] font-black uppercase text-slate-900 cursor-pointer hover:bg-amber-300 select-none border-b border-slate-800 ${
                        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
                      }`}
                      title={`Ordenar ${dimMeta.plural} por ${label}`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {label}
                        {active && (sortConf.direction === 'asc' ? ' ▲' : ' ▼')}
                      </span>
                    </th>
                  );
                };

                return (
                  <div key={dimKey} className="border border-slate-800 bg-white shadow-[2px_2px_0_0_#1e293b] flex flex-col">
                    <div className="bg-amber-200 border-b border-slate-800 px-3 py-2 flex justify-between items-center">
                      <span className="font-black text-xs uppercase text-slate-900">{dimMeta.plural}</span>
                      <span className="bg-white border border-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-800">
                        {rows.filter(r => r.isValid).length}
                      </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto flex-1">
                      <table className="w-full border-collapse text-xs">
                        <thead className="bg-slate-100 sticky top-0 z-10">
                          <tr>
                            <CrossSortHeader label={dimMeta.label} colKey="name" align="left" />
                            <CrossSortHeader label="Qtd" colKey="count" align="center" />
                            <CrossSortHeader label="Total" colKey="total" align="right" />
                            <CrossSortHeader label="Pago" colKey="pago" align="right" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {rows.map((item, i) => (
                            <tr
                              key={i}
                              onClick={() => item.isValid && openEntityFicha(dimKey, item.name)}
                              className={item.isValid ? "hover:bg-sky-50 cursor-pointer transition-colors" : "text-slate-400 italic"}
                              title={item.isValid ? `Abrir Ficha de ${dimMeta.label}: ${item.name}` : ''}
                            >
                              <td className="py-1.5 px-2 font-bold text-[11px] text-sky-800 hover:underline truncate max-w-[140px]">
                                {item.name}
                              </td>
                              <td className="py-1.5 px-2 text-center font-bold text-[11px] text-slate-800">
                                {item.count}
                              </td>
                              <td className="py-1.5 px-2 text-right font-bold text-[11px] text-slate-900 whitespace-nowrap">
                                {formatCurrency(item.total)}
                              </td>
                              <td className="py-1.5 px-2 text-right font-semibold text-[11px] text-sky-700 whitespace-nowrap">
                                {item.pago > 0 ? formatCurrency(item.pago) : '-'}
                              </td>
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
              <div className="mt-6 border border-slate-800 bg-white shadow-[2px_2px_0_0_#1e293b]">
                <div className="bg-rose-700 text-white border-b border-slate-800 px-3.5 py-2 flex justify-between items-center">
                  <span className="font-black text-xs uppercase tracking-wider">
                    Lideranças e Contatos Vinculados ({liderancasDetalhadas.length})
                  </span>
                </div>
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full border-collapse text-xs">
                    <thead className="bg-slate-100 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3 text-left text-[10px] font-black uppercase">Liderança</th>
                        <th className="py-2 px-3 text-left text-[10px] font-black uppercase">Município</th>
                        <th className="py-2 px-3 text-left text-[10px] font-black uppercase">Telefone</th>
                        <th className="py-2 px-3 text-left text-[10px] font-black uppercase">Email</th>
                        <th className="py-2 px-3 text-center text-[10px] font-black uppercase">Emendas</th>
                        <th className="py-2 px-3 text-right text-[10px] font-black uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {liderancasDetalhadas.map((lid, i) => (
                        <tr
                          key={i}
                          onClick={() => openEntityFicha('lideranca', lid.nome)}
                          className="hover:bg-amber-50 cursor-pointer"
                        >
                          <td className="py-2 px-3 font-bold text-rose-700 hover:underline">{lid.nome}</td>
                          <td className="py-2 px-3 font-semibold text-sky-700">{lid.municipio || '-'}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{lid.telefone || '-'}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{lid.email || '-'}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-900">{lid.count}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">{formatCurrency(lid.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 print:hidden">
          <div className="flex items-center space-x-2 flex-1 min-w-[220px]">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder={`Filtrar dentro das ${baseEntityEmendas.length} emendas de ${value}...`}
                value={fichaSearch}
                onChange={(e) => setFichaSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-800 text-xs font-medium focus:outline-none focus:border-sky-700"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center border border-slate-800 bg-white shadow-[2px_2px_0_0_#1e293b]">
              <select
                value={fichaSortConfig.key || ''}
                onChange={(e) => setFichaSortConfig({ key: e.target.value || null, direction: fichaSortConfig.direction })}
                className="px-2.5 py-1.5 text-xs font-bold uppercase bg-white text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="">Ordenar emendas da ficha...</option>
                {sortableFieldsList.map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
              {fichaSortConfig.key && (
                <button
                  onClick={() => setFichaSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                  className="px-2.5 py-1.5 border-l border-slate-800 bg-amber-200 hover:bg-amber-300 text-xs font-black uppercase text-slate-900 flex items-center"
                >
                  {fichaSortConfig.direction === 'asc' ? (
                    <><ChevronUpIcon className="w-3.5 h-3.5 mr-1" /> Cresc.</>
                  ) : (
                    <><ChevronDownIcon className="w-3.5 h-3.5 mr-1" /> Decresc.</>
                  )}
                </button>
              )}
            </div>

            <div className="flex border border-slate-800 bg-white shadow-[2px_2px_0_0_#1e293b]">
              <button
                onClick={() => setFichaViewMode('table')}
                className={`px-3 py-1.5 flex items-center font-bold uppercase text-xs border-r border-slate-800 ${
                  fichaViewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <ListIcon className="h-4 w-4" /> <span className="ml-1.5 hidden sm:inline">Lista</span>
              </button>
              <button
                onClick={() => setFichaViewMode('cards')}
                className={`px-3 py-1.5 flex items-center font-bold uppercase text-xs ${
                  fichaViewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <GridIcon className="h-4 w-4" /> <span className="ml-1.5 hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {renderEmendasTableOrCards(fichaEmendas, fichaSortConfig, requestFichaSort, fichaViewMode)}
      </div>
    );
  };

  // ============================================================================
  // DASHBOARD ESTATÍSTICO ADAPTADO (Todas as Regiões + Valores e Quantidades + Mapa por Valor ou Quantidade + Suporte Touch/Mouse)
  // ============================================================================
  const DashboardView = () => {
    const [hoveredMuni, setHoveredMuni] = useState(null);
    const [mapMetric, setMapMetric] = useState('valor'); // 'valor' | 'quantidade'

    const totalGlobal = filteredAndSortedEmendas.reduce((acc, em) => acc + parseCurrency(em.TOTAL), 0);
    const totalPagoGlobal = filteredAndSortedEmendas.reduce((acc, em) => acc + parseCurrency(em.PAGO), 0);
    const totalCountGlobal = filteredAndSortedEmendas.length;

    const emendasPorModalidade = filteredAndSortedEmendas.reduce((acc, em) => {
      const mod = em.MODALIDADE || 'N/A';
      if (!acc[mod]) acc[mod] = { valor: 0, count: 0 };
      acc[mod].valor += parseCurrency(em.TOTAL);
      acc[mod].count += 1;
      return acc;
    }, {});
    const modalidadeData = Object.keys(emendasPorModalidade)
      .map(mod => ({ mod, valor: emendasPorModalidade[mod].valor, count: emendasPorModalidade[mod].count }))
      .sort((a, b) => b.valor - a.valor);

    const emendasPorAno = filteredAndSortedEmendas.reduce((acc, em) => {
      const ano = em.ANO || 'N/A';
      if (!acc[ano]) acc[ano] = { valor: 0, count: 0 };
      acc[ano].valor += parseCurrency(em.TOTAL);
      acc[ano].count += 1;
      return acc;
    }, {});
    const timelineData = Object.keys(emendasPorAno).sort().map(ano => ({
      ano,
      valor: emendasPorAno[ano].valor,
      count: emendasPorAno[ano].count
    }));

    // TODAS AS REGIÕES (sem .slice) com Valor Total e Quantidade de Emendas
    const emendasPorRegiao = filteredAndSortedEmendas.reduce((acc, em) => {
      const regiao = em.REGIÃO || 'N/A';
      if (!acc[regiao]) acc[regiao] = { valor: 0, count: 0 };
      acc[regiao].valor += parseCurrency(em.TOTAL);
      acc[regiao].count += 1;
      return acc;
    }, {});
    const regiaoData = Object.keys(emendasPorRegiao)
      .map(regiao => ({
        regiao,
        valor: emendasPorRegiao[regiao].valor,
        count: emendasPorRegiao[regiao].count
      }))
      .sort((a, b) => b.valor - a.valor);

    // Agrupamento por Município com Valor Total E Quantidade de Emendas
    const emendasPorMuni = useMemo(() => {
      const map = {};
      filteredAndSortedEmendas.forEach(em => {
        const mName = normalizeStr(em['MUNICÍPIO']);
        if (mName) {
          if (!map[mName]) map[mName] = { valor: 0, count: 0 };
          map[mName].valor += parseCurrency(em.TOTAL);
          map[mName].count += 1;
        }
      });
      return map;
    }, [filteredAndSortedEmendas]);

    // Coloração do Mapa: Por Valor Total (padrão) ou Por Quantidade de Emendas
    const getMuniColor = (muniStats) => {
      if (!muniStats || muniStats.count === 0) return '#ffffff';

      if (mapMetric === 'quantidade') {
        const qtd = muniStats.count;
        if (qtd <= 2) return '#fcd34d'; // Amarelo (1 a 2 emendas)
        if (qtd <= 5) return '#0369a1'; // Azul-Petróleo (3 a 5 emendas)
        return '#be123c'; // Carmesim (6+ emendas)
      }

      const val = muniStats.valor;
      if (!val || val === 0) return '#ffffff';
      if (val < 300000) return '#fcd34d';
      if (val < 800000) return '#0369a1';
      return '#be123c';
    };

    const renderMap = () => {
      if (!mapGeoJson) return <div className="p-8 text-center font-bold text-slate-600">Carregando Mapa...</div>;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      mapGeoJson.features.forEach(f => {
        const processRings = (rings) => {
          rings.forEach(ring => ring.forEach(coord => {
            if (coord[0] < minX) minX = coord[0];
            if (coord[0] > maxX) maxX = coord[0];
            if (coord[1] < minY) minY = coord[1];
            if (coord[1] > maxY) maxY = coord[1];
          }));
        };
        if (f.geometry.type === 'Polygon') processRings(f.geometry.coordinates);
        else if (f.geometry.type === 'MultiPolygon') f.geometry.coordinates.forEach(processRings);
      });

      const mapWidth = 800; const mapHeight = 600;
      const scaleX = mapWidth / (maxX - minX);
      const scaleY = mapHeight / (maxY - minY);
      const scale = Math.min(scaleX, scaleY) * 0.95;

      const offsetX = (mapWidth - (maxX - minX) * scale) / 2;
      const offsetY = (mapHeight - (maxY - minY) * scale) / 2;

      const project = (coord) => {
        const x = (coord[0] - minX) * scale + offsetX;
        const y = mapHeight - ((coord[1] - minY) * scale) - offsetY;
        return `${x},${y}`;
      };

      const generatePath = (geometry) => {
        const createString = (rings) => rings.map(ring => "M" + ring.map(coord => project(coord)).join("L") + "Z").join(" ");
        if (geometry.type === 'Polygon') return createString(geometry.coordinates);
        if (geometry.type === 'MultiPolygon') return geometry.coordinates.map(createString).join(" ");
        return "";
      };

      return (
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-auto select-none"
          onClick={() => setHoveredMuni(null)}
        >
          {mapGeoJson.features.map((feature, i) => {
            const mName = normalizeStr(feature.properties.name);
            const stats = emendasPorMuni[mName] || { valor: 0, count: 0 };
            return (
              <path
                key={i}
                d={generatePath(feature.geometry)}
                fill={getMuniColor(stats)}
                stroke="#1e293b"
                strokeWidth="0.8"
                className="hover:stroke-[2.5px] transition-all cursor-pointer relative"
                onMouseEnter={(e) => {
                  setHoveredMuni({
                    name: feature.properties.name,
                    val: stats.valor,
                    count: stats.count,
                    x: e.clientX,
                    y: e.clientY,
                    isTouch: false
                  });
                }}
                onMouseMove={(e) => {
                  setHoveredMuni(prev => prev && !prev.isTouch ? {
                    ...prev,
                    x: e.clientX,
                    y: e.clientY
                  } : prev);
                }}
                onMouseLeave={() => {
                  setHoveredMuni(prev => (prev && !prev.isTouch ? null : prev));
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  const touch = e.touches && e.touches[0];
                  setHoveredMuni({
                    name: feature.properties.name,
                    val: stats.valor,
                    count: stats.count,
                    x: touch ? touch.clientX : 180,
                    y: touch ? touch.clientY : 240,
                    isTouch: true
                  });
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (stats.count > 0) openEntityFicha('municipio', feature.properties.name);
                }}
              />
            );
          })}
        </svg>
      );
    };

    return (
      <>
        <FilterBar />
        <div className="max-w-[96%] xl:max-w-[1440px] mx-auto px-3 sm:px-4 pb-6 animate-in fade-in print:w-full print:max-w-none print:m-0 print:p-0">
          <HeaderSwitcher title="Dashboard Estatístico" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-4">
            <div className="lg:col-span-1 space-y-6">
              {/* Resumo Geral no Filtro (Valor Total + Quantidade de Emendas + Total Pago) */}
              <div className="bg-amber-200 border border-slate-800 p-5 shadow-[3px_3px_0_0_#1e293b] print:shadow-none flex flex-col justify-center">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                  <p className="text-slate-900 font-black uppercase text-xs tracking-widest">
                    Total no Filtro
                  </p>
                  <span className="bg-white border border-slate-900 px-2 py-0.5 text-[11px] font-black text-rose-700 uppercase">
                    {totalCountGlobal} {totalCountGlobal === 1 ? 'emenda' : 'emendas'}
                  </span>
                </div>
                <h2 className="text-3xl xl:text-4xl font-black text-slate-900 break-words leading-none">
                  {formatCurrency(totalGlobal)}
                </h2>
                <div className="mt-3 pt-2 border-t border-slate-800/40 flex justify-between items-baseline">
                  <span className="text-[11px] font-bold uppercase text-slate-800">Total Pago:</span>
                  <span className="text-sm font-black text-sky-900">{formatCurrency(totalPagoGlobal)}</span>
                </div>
              </div>

              {/* Por Modalidade (Valor Total + Quantidade) */}
              <div className="bg-white border border-slate-800 p-5 shadow-[3px_3px_0_0_#1e293b] print:shadow-none">
                <p className="text-slate-900 font-black uppercase text-xs tracking-widest border-b border-slate-800 pb-2 mb-4">
                  Por Modalidade
                </p>
                <div className="space-y-3.5">
                  {modalidadeData.length > 0 ? modalidadeData.map((d) => {
                    const maxVal = Math.max(...modalidadeData.map(r => r.valor));
                    const pct = Math.max((d.valor / maxVal) * 100, 5);
                    return (
                      <div key={d.mod} className="cursor-pointer group" onClick={() => openEntityFicha('modalidade', d.mod)}>
                        <div className="flex justify-between items-baseline text-xs font-bold uppercase mb-1 text-slate-800 group-hover:text-rose-700">
                          <span className="truncate pr-2">{d.mod}</span>
                          <span className="whitespace-nowrap text-[11px]">
                            <strong className="text-rose-700">{d.count} {d.count === 1 ? 'emenda' : 'emendas'}</strong> • {formatCurrency(d.valor)}
                          </span>
                        </div>
                        <div className="h-4 w-full bg-slate-50 border border-slate-800">
                          <div className="h-full bg-rose-700 border-r border-slate-800" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  }) : <p className="text-xs font-bold text-slate-400 uppercase">Sem dados.</p>}
                </div>
              </div>

              {/* Todas as Regiões (Valor Total + Quantidade de Emendas) */}
              <div className="bg-white border border-slate-800 p-5 shadow-[3px_3px_0_0_#1e293b] print:shadow-none">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                  <p className="text-slate-900 font-black uppercase text-xs tracking-widest">
                    Todas as Regiões ({regiaoData.length})
                  </p>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Qtd • Valor</span>
                </div>
                <div className="space-y-3">
                  {regiaoData.length > 0 ? regiaoData.map((d) => {
                    const maxVal = Math.max(...regiaoData.map(r => r.valor));
                    const pct = Math.max((d.valor / maxVal) * 100, 4);
                    return (
                      <div key={d.regiao} className="cursor-pointer group" onClick={() => openEntityFicha('regiao', d.regiao)}>
                        <div className="flex justify-between items-baseline text-[11px] font-bold uppercase mb-1 text-slate-800 group-hover:text-sky-700">
                          <span className="truncate pr-2" title={d.regiao}>{d.regiao}</span>
                          <span className="whitespace-nowrap">
                            <strong className="text-sky-700">{d.count} {d.count === 1 ? 'emenda' : 'emendas'}</strong> • {formatCurrency(d.valor)}
                          </span>
                        </div>
                        <div className="h-3.5 w-full bg-slate-50 border border-slate-800">
                          <div className="h-full bg-sky-700 border-r border-slate-800" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  }) : <p className="text-xs font-bold text-slate-400 uppercase">Sem dados.</p>}
                </div>
              </div>

              {/* Evolução Anual (Valor Total + Quantidade) */}
              <div className="bg-white border border-slate-800 p-5 shadow-[3px_3px_0_0_#1e293b] print:shadow-none">
                <p className="text-slate-900 font-black uppercase text-xs tracking-widest border-b border-slate-800 pb-2 mb-4">
                  Evolução Anual
                </p>
                <div className="flex items-end h-36 space-x-2 border-b border-l border-slate-800 p-2">
                  {timelineData.length > 0 ? timelineData.map((d) => {
                    const maxVal = Math.max(...timelineData.map(r => r.valor));
                    const pct = Math.max((d.valor / maxVal) * 100, 5);
                    return (
                      <div
                        key={d.ano}
                        onClick={() => openEntityFicha('ano', d.ano)}
                        className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-9 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 pointer-events-none whitespace-nowrap z-10 text-center">
                          {d.count} {d.count === 1 ? 'emenda' : 'emendas'} • {formatCurrency(d.valor)}
                        </div>
                        <div className="w-full bg-rose-700 border border-slate-800 transition-all group-hover:bg-amber-300" style={{ height: `${pct}%` }}></div>
                        <span className="text-[10px] font-black mt-1.5 text-slate-800">{d.ano}</span>
                        <span className="text-[9px] font-bold text-slate-500">{d.count} em.</span>
                      </div>
                    );
                  }) : <p className="text-xs font-bold text-slate-400 uppercase self-center w-full text-center">Sem dados.</p>}
                </div>
              </div>
            </div>

            {/* Coluna do Mapa de Santa Catarina */}
            <div className="lg:col-span-2 bg-white border border-slate-800 shadow-[3px_3px_0_0_#1e293b] print:shadow-none flex flex-col relative overflow-hidden print:break-before-page self-start">
              <div className="bg-sky-700 border-b border-slate-800 p-3.5 flex flex-wrap justify-between items-center gap-3 z-10 print:bg-white print:border-b">
                <p className="text-white font-black uppercase text-xs sm:text-sm tracking-wider flex items-center print:text-slate-900">
                  <MapPinIcon className="h-4 w-4 mr-1.5" /> Mapa de Santa Catarina
                </p>

                {/* Alternador de Visualização do Mapa: Por Valor Total vs. Por Quantidade de Emendas */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex border border-slate-900 bg-white print:hidden">
                    <button
                      onClick={() => setMapMetric('valor')}
                      className={`px-2.5 py-1 text-[10px] font-black uppercase transition-colors border-r border-slate-900 ${
                        mapMetric === 'valor' ? 'bg-amber-300 text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Por Valor (R$)
                    </button>
                    <button
                      onClick={() => setMapMetric('quantidade')}
                      className={`px-2.5 py-1 text-[10px] font-black uppercase transition-colors ${
                        mapMetric === 'quantidade' ? 'bg-amber-300 text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Por Quantidade (Nº)
                    </button>
                  </div>

                  {/* Legenda Dinâmica conforme a Métrica Selecionada */}
                  {mapMetric === 'valor' ? (
                    <div className="flex space-x-2 text-[10px] font-bold uppercase text-white items-center print:text-slate-900">
                      <div className="w-3 h-3 bg-amber-300 border border-slate-900"></div> <span>Até 300k</span>
                      <div className="w-3 h-3 bg-sky-700 border border-white ml-1.5"></div> <span>300k–800k</span>
                      <div className="w-3 h-3 bg-rose-700 border border-white ml-1.5"></div> <span>+800k</span>
                    </div>
                  ) : (
                    <div className="flex space-x-2 text-[10px] font-bold uppercase text-white items-center print:text-slate-900">
                      <div className="w-3 h-3 bg-amber-300 border border-slate-900"></div> <span>1–2 em.</span>
                      <div className="w-3 h-3 bg-sky-700 border border-white ml-1.5"></div> <span>3–5 em.</span>
                      <div className="w-3 h-3 bg-rose-700 border border-white ml-1.5"></div> <span>6+ em.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-2 sm:p-4 bg-white relative flex flex-col items-center justify-center">
                {renderMap()}

                {/* Balão Informativo no Mouse (PC) ou Toque/Segurar (Celular) mostrando Quantidade + Valor Total */}
                {hoveredMuni && (
                  <div
                    className={`${
                      hoveredMuni.isTouch
                        ? 'sticky bottom-2 left-2 right-2 w-full max-w-sm mx-auto mt-2'
                        : 'fixed pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-12px]'
                    } bg-white border-2 border-slate-900 p-3 shadow-[4px_4px_0_0_#1e293b] z-50 print:hidden`}
                    style={!hoveredMuni.isTouch ? { left: hoveredMuni.x, top: hoveredMuni.y } : {}}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <p className="font-black text-rose-700 text-xs sm:text-sm uppercase">{hoveredMuni.name}</p>
                      {hoveredMuni.isTouch && (
                        <button
                          onClick={() => setHoveredMuni(null)}
                          className="text-slate-500 hover:text-slate-900 p-0.5"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {hoveredMuni.count > 0 ? (
                      <div className="mt-1 space-y-0.5">
                        <p className="font-bold text-xs text-sky-800">
                          Quantidade: {hoveredMuni.count} {hoveredMuni.count === 1 ? 'emenda' : 'emendas'}
                        </p>
                        <p className="font-black text-xs sm:text-sm text-slate-900">
                          Valor Total: {formatCurrency(hoveredMuni.val)}
                        </p>
                        {hoveredMuni.isTouch && (
                          <button
                            onClick={() => openEntityFicha('municipio', hoveredMuni.name)}
                            className="mt-2 w-full bg-amber-300 text-slate-900 border border-slate-900 py-1 px-2 text-[10px] font-black uppercase text-center"
                          >
                            Abrir Ficha de {hoveredMuni.name}
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="font-semibold text-xs text-slate-500 mt-1">Nenhuma emenda no filtro atual</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const DetailView = () => {
    const isEditing = currentView === 'edit';
    const data = isEditing ? editingEmenda : selectedEmenda;
    const handleInputChange = (field, value) => setEditingEmenda(prev => ({ ...prev, [field]: value }));

    const InfoField = ({ label, field, icon: IconComponent, type = 'text', entityType = null, color = 'blue', isCurrency = false }) => {
      const rawValue = field === 'MODALIDADE' && !isEditing ? getModalidade(data) : data[field];
      let displayValue = rawValue;

      if (!isEditing && isCurrency) {
        displayValue = formatCurrency(parseCurrency(rawValue));
      }

      const colorClass =
        color === 'blue' ? 'text-sky-700' :
        color === 'red' ? 'text-rose-700' :
        color === 'yellow' ? 'text-amber-700' : 'text-slate-800';

      if (isEditing) {
        return (
          <div className="mb-3.5">
            <label className={`block text-xs font-black uppercase mb-1 ${colorClass}`}>{label}</label>
            {type === 'textarea' ? (
              <textarea
                className="w-full p-2 bg-white border border-slate-800 rounded-none focus:outline-none focus:border-rose-700 font-medium text-sm text-slate-900"
                rows="3"
                value={data[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            ) : (
              <input
                type="text"
                className="w-full p-2 bg-white border border-slate-800 rounded-none focus:outline-none focus:border-rose-700 font-medium text-sm text-slate-900"
                value={data[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            )}
          </div>
        );
      }

      return (
        <div className="mb-3.5 bg-white p-3 border border-slate-800 shadow-[2px_2px_0_0_#1e293b] print:shadow-none relative">
          <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 flex items-center ${colorClass} print:text-slate-900`}>
            {IconComponent && <IconComponent className="h-3.5 w-3.5 mr-1 print:hidden" />} {label}
          </label>
          <div className="text-slate-900 font-medium text-sm break-words flex items-center justify-between gap-2">
            {entityType && rawValue ? (
              <button
                onClick={(e) => openEntityFicha(entityType, rawValue, e)}
                className="font-bold text-left hover:text-rose-700 hover:underline"
                title={`Abrir Ficha de ${label}: ${rawValue}`}
              >
                {displayValue}
              </button>
            ) : (
              <span>{displayValue || <span className="text-slate-400 italic">N/A</span>}</span>
            )}
            {entityType && rawValue && (
              <button
                onClick={(e) => openEntityFicha(entityType, rawValue, e)}
                className="text-[10px] bg-amber-200 text-slate-900 border border-slate-800 px-1.5 py-0.5 uppercase font-bold hover:bg-amber-300 print:hidden flex-shrink-0"
              >
                Abrir Ficha
              </button>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 animate-in slide-in-from-right-4 print:w-full print:max-w-none print:m-0 print:p-0">
        <button
          onClick={() => {
            if (selectedEntityFicha) {
              setCurrentView('entity');
            } else {
              setCurrentView('list');
            }
            setEditingEmenda(null);
          }}
          className="bg-slate-900 text-white px-4 py-2 font-bold uppercase text-xs border border-slate-800 hover:bg-slate-800 mb-5 flex items-center shadow-[3px_3px_0_0_#1e293b] print:hidden"
        >
          &larr; {selectedEntityFicha ? `Voltar para Ficha de ${selectedEntityFicha.value}` : 'Voltar'}
        </button>

        <div className="bg-white border border-slate-800 shadow-[5px_5px_0_0_#1e293b] print:shadow-none print:border-none">
          <div className="bg-rose-700 border-b border-slate-800 p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 print:bg-white print:border-b">
            <div>
              <p className="text-rose-100 font-bold uppercase text-xs mb-1 tracking-wider print:text-slate-900">
                Ficha de Emenda
              </p>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight print:text-slate-900">
                Nº {data['NÚMERO DA EMENDA']}
              </h2>
            </div>
            {isAdmin && !isEditing && (
              <button
                onClick={() => { setEditingEmenda({ ...selectedEmenda }); setCurrentView('edit'); }}
                className="bg-amber-300 text-slate-900 border border-slate-800 px-5 py-2 font-black text-xs uppercase shadow-[3px_3px_0_0_#1e293b] hover:bg-amber-400 transition-transform active:translate-y-0.5 active:shadow-none flex items-center print:hidden"
              >
                <EditIcon className="h-4 w-4 mr-1.5" /> Editar Ficha
              </button>
            )}
            {isAdmin && isEditing && (
              <div className="flex space-x-2.5 print:hidden">
                <button
                  onClick={() => setCurrentView('detail')}
                  className="bg-white text-slate-900 border border-slate-800 px-4 py-2 font-black text-xs uppercase shadow-[2px_2px_0_0_#1e293b] hover:bg-slate-100 flex items-center"
                >
                  <XIcon className="h-4 w-4 mr-1.5" /> Cancelar
                </button>
                <button
                  onClick={() => confirmAction("Salvar Alterações", "Confirmar alterações? A mudança será salva e sincronizada na nuvem.", handleSaveEmenda)}
                  className="bg-sky-700 text-white border border-slate-800 px-5 py-2 font-black text-xs uppercase shadow-[2px_2px_0_0_#1e293b] hover:bg-sky-800 flex items-center"
                >
                  <SaveIcon className="h-4 w-4 mr-1.5" /> Salvar
                </button>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 print:p-0 print:mt-4">
            <div className="col-span-1 md:col-span-2">
              <InfoField label="Objeto / Descrição Principal" field="OBJETO" type="textarea" color="red" />
            </div>

            <div className="space-y-2 bg-slate-50/70 border border-slate-800 p-4 print:border-none print:p-0">
              <div className="bg-slate-900 text-white font-black uppercase text-xs py-1 px-3 inline-block border border-slate-800 -mt-7 mb-3 print:bg-white print:text-slate-900 print:border-b print:p-0">
                Identificação
              </div>
              <InfoField label="Município" field="MUNICÍPIO" icon={MapPinIcon} entityType="municipio" color="blue" />
              <InfoField label="Região" field="REGIÃO" icon={MapIcon} entityType="regiao" color="black" />
              <InfoField label="Modalidade" field="MODALIDADE" icon={LayersIcon} entityType="modalidade" color="red" />
              <InfoField label="Tema" field="TEMA" icon={TagIcon} entityType="tema" color="blue" />
              <InfoField label="Articulador" field="ARTICULADOR" icon={UserIcon} entityType="articulador" color="red" />
              <InfoField label="Ano" field="ANO" entityType="ano" color="black" />
            </div>

            <div className="space-y-2 bg-slate-50/70 border border-slate-800 p-4 print:border-none print:p-0">
              <div className="bg-sky-700 text-white font-black uppercase text-xs py-1 px-3 inline-block border border-slate-800 -mt-7 mb-3 print:bg-white print:text-slate-900 print:border-b print:p-0">
                Financeiro / Status
              </div>
              <InfoField label="Situação" field="SITUAÇÃO" entityType="situacao" color="red" />
              <InfoField label="Total Previsto" field="TOTAL" color="blue" isCurrency={true} />
              <InfoField label="Valor Pago" field="PAGO" color="blue" isCurrency={true} />
              <InfoField label="Esfera de Aplicação" field="ESFERA DE APLICAÇÃO" color="black" />
              <InfoField label="Unidade Orçamentária" field="UNIDADE ORÇAMENTÁRIA" entityType="uo" color="black" />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2 bg-slate-50/70 border border-slate-800 p-4 mt-2 print:border-none print:p-0">
              <div className="bg-rose-700 text-white font-black uppercase text-xs py-1 px-3 inline-block border border-slate-800 -mt-7 mb-3 print:bg-white print:text-slate-900 print:border-b print:p-0">
                Entidade / Liderança
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Entidade" field="RAZÃO SOCIAL" icon={BuildingIcon} entityType="entidade" color="red" />
                <InfoField label="Liderança" field="LIDERANÇA" icon={UserIcon} entityType="lideranca" color="blue" />
                <InfoField label="Telefone da Liderança" field="TELEFONE DA LIDERANÇA" color="red" />
                <InfoField label="Email da Liderança" field="EMAIL DA LIDERANÇA" color="black" />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2 bg-amber-100/80 border border-slate-800 p-4 mt-2 print:bg-white print:border-none print:p-0">
              <div className="bg-amber-300 text-slate-900 font-black uppercase text-xs py-1 px-3 inline-block border border-slate-800 -mt-7 mb-3 print:bg-white print:text-slate-900 print:border-b print:p-0">
                Dados Técnicos
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="SGPe" field="SGPe" color="black" />
                <InfoField label="Modalidade" field="MODALIDADE" entityType="modalidade" color="black" />
                <InfoField label="Tipo (Impositiva, Bancada, etc.)" field="TIPO (IMPOSITIVA, BANCADA, PARLAMENTARES)" color="black" />
              </div>
              <InfoField label="Entrega Realizada" field="ENTREGA" type="textarea" color="black" />
              <InfoField label="Justificativa" field="JUSTIFICATIVA" type="textarea" color="black" />
              <InfoField label="Observações Livres" field="Observação" type="textarea" color="black" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    const [newPass, setNewPass] = useState('');

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-in fade-in print:hidden">
        <button
          onClick={() => setCurrentView('list')}
          className="bg-slate-900 text-white px-4 py-2 font-bold uppercase text-xs border border-slate-800 hover:bg-slate-800 mb-5 flex items-center shadow-[3px_3px_0_0_#1e293b]"
        >
          &larr; Voltar
        </button>

        <div className="bg-white border border-slate-800 shadow-[4px_4px_0_0_#1e293b]">
          <div className="bg-sky-700 border-b border-slate-800 p-5">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
              <SettingsIcon className="mr-3 h-6 w-6" /> Configurações
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-amber-100 border border-slate-800 text-slate-900 p-4 flex items-start shadow-[2px_2px_0_0_#1e293b]">
              <AlertTriangleIcon className="h-5 w-5 mr-3 flex-shrink-0 text-rose-700" />
              <p className="text-xs sm:text-sm font-bold">
                Modo de Segurança Máxima Ativado. A URL da planilha Google é gerenciada exclusivamente pelo Servidor (Backend).
              </p>
            </div>
            <div className="border border-slate-800 p-5 bg-white">
              <h3 className="text-base font-black uppercase text-sky-700 border-b border-slate-800 pb-2 mb-4 flex items-center">
                <UploadCloudIcon className="h-5 w-5 mr-2" /> Importação CSV Manual
              </h3>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="block w-full text-xs sm:text-sm font-medium border border-slate-800 p-2 bg-white file:mr-3 file:py-1.5 file:px-3 file:border file:border-slate-800 file:text-xs file:font-black file:uppercase file:bg-amber-300 file:text-slate-900 hover:file:bg-amber-400 cursor-pointer"
              />
            </div>
            <div className="border border-slate-800 p-5 bg-white">
              <h3 className="text-base font-black uppercase text-slate-900 border-b border-slate-800 pb-2 mb-4">
                Segurança Local
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Nova senha administrativa..."
                  className="flex-1 p-2.5 bg-white border border-slate-800 rounded-none focus:outline-none focus:border-rose-700 font-medium text-sm"
                />
                <button
                  onClick={() => {
                    if (newPass.length < 3) return alert("Mínimo de 3 caracteres.");
                    handleChangePassword(newPass);
                    setNewPass('');
                  }}
                  className="bg-rose-700 text-white font-black text-xs uppercase px-5 py-2.5 border border-slate-800 shadow-[2px_2px_0_0_#1e293b] hover:bg-rose-800 whitespace-nowrap"
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
        <div className="text-center p-8 bg-white border border-slate-800 shadow-[4px_4px_0_0_#1e293b]">
          <div className="flex space-x-2 justify-center mb-5">
            <div className="w-5 h-5 bg-rose-700 border border-slate-800 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-5 h-5 bg-amber-300 border border-slate-800 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-5 h-5 bg-sky-700 border border-slate-800 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-slate-900 font-black text-xs uppercase tracking-widest">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-amber-200 selection:text-slate-900 pb-12 print:pb-0">
      <Navbar />
      <main>
        {currentView === 'list' && <ListView />}
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'entity' && <EntityProfileView />}
        {(currentView === 'detail' || currentView === 'edit') && <DetailView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white border border-slate-800 shadow-[6px_6px_0_0_#1e293b] p-6 sm:p-8 w-full max-w-sm m-4 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 bg-white border border-slate-800 p-1 hover:bg-rose-700 hover:text-white transition-colors"
            >
              <XIcon className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 uppercase mb-2 flex items-center tracking-tight">
              <LogInIcon className="mr-2.5 h-6 w-6 text-rose-700" /> Acesso
            </h3>
            <div className="w-16 h-1.5 bg-amber-300 border border-slate-800 mb-5"></div>
            <input
              type="password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Senha"
              className="w-full p-3 bg-white border border-slate-800 rounded-none focus:outline-none focus:border-sky-700 font-medium mb-5 text-slate-900"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-sky-700 text-white font-black text-xs uppercase py-3.5 border border-slate-800 shadow-[3px_3px_0_0_#1e293b] hover:bg-sky-800 transition-transform active:translate-y-0.5 active:shadow-none"
            >
              Entrar
            </button>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white border border-slate-800 shadow-[6px_6px_0_0_#1e293b] p-6 sm:p-8 w-full max-w-md m-4 relative">
            <h3 className="text-xl font-black text-slate-900 uppercase mb-3 tracking-tight">{confirmModal.title}</h3>
            <p className="text-slate-800 text-sm font-medium mb-6 border-l-4 border-amber-300 pl-3">{confirmModal.message}</p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="px-5 py-2.5 bg-white text-slate-900 font-black text-xs uppercase border border-slate-800 hover:bg-slate-100 shadow-[2px_2px_0_0_#1e293b]"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-5 py-2.5 bg-rose-700 text-white font-black text-xs uppercase border border-slate-800 hover:bg-rose-800 shadow-[2px_2px_0_0_#1e293b] flex items-center justify-center"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1.5" /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
