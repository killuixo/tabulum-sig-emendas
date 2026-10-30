import React, { useState, useEffect, useMemo } from 'react';

const Icon = ({ path, className = "w-5 h-5", onClick, size, style }) => (
  <svg
    onClick={onClick}
    style={{ width: size, height: size, ...style }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
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
const InfoIcon = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>} />;
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
  const s = String(str).replace(/R\$\s?/g, '').trim();
  if (!s) return 0;
  if (s.includes(',')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  }
  return parseFloat(s) || 0;
}

function formatCurrency(num) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
}

function normalizeStr(str) {
  if (!str) return '';
  return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

const GENERIC_RAZAO_TERMS = [
  'PREFEITURAS / MUNICIPIOS',
  'FUNDOS',
  'UNIDADES GESTORAS',
  'ENTIDADE PRIVADA SEM FINS LUCRATIVOS'
];

// Recupera a Modalidade (da coluna MODALIDADE ou inferida a partir de ESFERA DE APLICAÇÃO / OBJETO)
function resolveModalidade(emenda) {
  if (!emenda) return '';
  const mod = String(emenda.MODALIDADE || '').trim();
  if (mod) return mod;

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

// Recupera o nome específico da Entidade / Razão Social (da coluna O ou extraído como fallback do OBJETO)
function resolveEntidade(emenda) {
  if (!emenda) return '';
  const rawRazao = String(emenda['RAZÃO SOCIAL'] || '').trim();
  if (rawRazao && !GENERIC_RAZAO_TERMS.includes(normalizeStr(rawRazao))) {
    return rawRazao;
  }

  const obj = String(emenda.OBJETO || '').trim();
  if (!obj) return '';

  const regexEntidade = /(1º\s*BPMA\s*-\s*1º\s*Batalhão de Polícia Militar Ambiental|2º\s*BPMA\s*–\s*2º\s*Batalhão de Polícia Militar Ambiental|\d+º\s*Batalhão(?:\s+de)?\s+Bombeiro(?:s)?\s+Militar(?:\s*\([^)]+\))?|Corpo de Bombeiros(?:\s+Militar)?\s+de\s+[A-ZÀ-Úa-zà-ú\s]+|Bombeiros Militar de Garopaba e são José|CBM\/SC|Polícia Militar de Santa Catarina|Orquestra Sinfônica de Santa Catarina|UDESC\/CEART|CEART-\s*UDESC|CERES-UDESC|LATEC\/UDESC|MESC-UDESC|FAED-UDESC|CEPED-UDESC|CEPED|Grupo de Pesquisa[^,\.;:]+da UDESC|Museu Digital de Artes Cênicas na UDESC|Museu da Escola Catarinense\s*[–-]\s*MESC-UDESC|Laboratório de Soluções em Tecnologia\s*\(LATEC\/UDESC\)|ESAG KIDS|NUDHA|Centro de Ciências Agrarias da UFSC\s*-\s*CCA|Células de Consumidores Responsáveis\s*\(CCR\)|(?:Escola de Samba|G\.R\.E\.S\.)\s+[A-ZÀ-Ú0-9][^,\.;]+|Escola\s+(?:Municipal|Estadual|Básica|Ambiental|Socio\s*Ambiental|do\s+Rio\s+e\s+Mar|do\s+Mar|Isolada|Livre|para\s+Educação\s+Quilombola)[^,\.;]+|Hospital\s+(?:Ana\s+Schmitt|Governador\s+Celso\s+Ramos(?:\s*\(HGCR\))?|São\s+Camilo|de\s+Imaruí|Frei\s+Rogério(?:\s+de\s+Anita\s+Garibaldi)?)|Museu\s+(?:Histórico|Comunitário|da\s+Escola|Digital)[^,\.;]+|Instituto\s+[A-ZÀ-Ú0-9][^,\.;]+|Intituto\s+[A-ZÀ-Ú0-9][^,\.;]+|Associação\s+[A-ZÀ-Ú0-9][^,\.;]+|Fundação\s+[A-ZÀ-Ú0-9][^,\.;]+|Consórcio\s+Intermunicipal[^,\.;]+|Conselho\s+Municipal[^,\.;]+|Centro\s+(?:Público|de\s+Formação|de\s+Saúde|de\s+Atenção\s+Psicossocial|de\s+Ciências)[^,\.;]+|CAPS(?:\s+AD|\s+II)?\s+(?:do\s+município\s+de\s+|de\s+|Ponta\s+do\s+Coral)[A-ZÀ-Úa-zà-ú\s]*|UBS\s+da\s+comunidade\s+[^,\.;]+|Serviço\s+Residencial\s+Terapeutico[^,\.;]+|Comissão\s+de\s+Práticas\s+Integrativas[^,\.;]+|Parque\s+(?:Ecológico|Natural\s+Municipal|do\s+Agricultor|das\s+Dunas)[^,\.;]+|Diretoria\s+de\s+Bem-estar\s+Animal\s+da\s+Prefeitura\s+Municipal\s+de\s+Florianópolis|Fundo\s+Estadual\s+de\s+Segurança\s+Alimentar[^,\.;]+|Cuidatoria\s+Hub\s+do\s+Terceiro\s+Setor|Casa\s+Lar\s+Luz\s+do\s+Caminho|ONG\s+[A-ZÀ-Ú0-9][^,\.;]+|ACUSTRA|SERTE|ICOM|CEPESI|FANFARRA DA PONTE|AfroFeira Ação Zumbi|EnCenAção Negra|FAM\s+Florianópolis\s+Audiovisual\s+Mercosul|Blocos\s+Afro\s+de\s+Florianópolis|Quilombo\s+Invernada\s+dos\s+Negros|aldeia\s+indígena\s+Tekoa\s+Marangatu|comunidade\s+Kondá|Casarão\s+e\s+Engenho\s+dos\s+Andrade|Cozinhas\s+Solidarias|Veleiro\s+Eco|Lagoa\s+Viva|UDESC|FAPESC|UFSC)/i;

  const match = obj.match(regexEntidade);
  return match ? match[1].trim() : '';
}

function resolveAno(emenda) {
  if (!emenda) return '';
  if (emenda.ANO) return String(emenda.ANO).trim();
  const num = String(emenda['NÚMERO DA EMENDA'] || '');
  const parts = num.split('/');
  return parts.length > 1 ? parts[1].trim() : '';
}

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

  // Filtros Universais de Multiseleção + Busca Livre
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalidades, setFilterModalidades] = useState([]);
  const [filterEntidades, setFilterEntidades] = useState([]);
  const [filterArticuladores, setFilterArticuladores] = useState([]);
  const [filterMunicipios, setFilterMunicipios] = useState([]);
  const [filterRegioes, setFilterRegioes] = useState([]);
  const [filterTemas, setFilterTemas] = useState([]);
  const [filterSituacoes, setFilterSituacoes] = useState([]);
  const [filterAnos, setFilterAnos] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [openDropdown, setOpenDropdown] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Enriquecimento leve em memória para garantir Modalidade, Razão Social e Ano consistentes
  const enrichedEmendas = useMemo(() => {
    return emendas.map(e => ({
      ...e,
      _modalidade: resolveModalidade(e),
      _entidade: resolveEntidade(e),
      _ano: resolveAno(e)
    }));
  }, [emendas]);

  const modalidades = useMemo(() => [...new Set(enrichedEmendas.map(e => e._modalidade).filter(Boolean))].sort(), [enrichedEmendas]);
  const entidades = useMemo(() => [...new Set(enrichedEmendas.map(e => e._entidade).filter(Boolean))].sort(), [enrichedEmendas]);
  const articuladores = useMemo(() => [...new Set(enrichedEmendas.map(e => e.ARTICULADOR).filter(Boolean))].sort(), [enrichedEmendas]);
  const municipios = useMemo(() => [...new Set(enrichedEmendas.map(e => e['MUNICÍPIO']).filter(Boolean))].sort(), [enrichedEmendas]);
  const regioes = useMemo(() => [...new Set(enrichedEmendas.map(e => e.REGIÃO).filter(Boolean))].sort(), [enrichedEmendas]);
  const temas = useMemo(() => [...new Set(enrichedEmendas.map(e => e.TEMA).filter(Boolean))].sort(), [enrichedEmendas]);
  const situacoes = useMemo(() => [...new Set(enrichedEmendas.map(e => e.SITUAÇÃO).filter(Boolean))].sort(), [enrichedEmendas]);
  const anos = useMemo(() => [...new Set(enrichedEmendas.map(e => e._ano).filter(Boolean))].sort(), [enrichedEmendas]);

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
    setFilterModalidades([]);
    setFilterEntidades([]);
    setFilterArticuladores([]);
    setFilterMunicipios([]);
    setFilterRegioes([]);
    setFilterTemas([]);
    setFilterSituacoes([]);
    setFilterAnos([]);
  };

  const resetToFrontPage = () => {
    setCurrentView('list');
    setViewMode('table');
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
      const cleanToSave = { ...editingEmenda };
      delete cleanToSave._modalidade;
      delete cleanToSave._entidade;
      delete cleanToSave._ano;

      const updatedEmendas = emendas.map(e =>
        e['NÚMERO DA EMENDA'] === cleanToSave['NÚMERO DA EMENDA'] ? cleanToSave : e
      );
      if (!emendas.some(e => e['NÚMERO DA EMENDA'] === cleanToSave['NÚMERO DA EMENDA'])) {
        updatedEmendas.push(cleanToSave);
      }
      saveEmendasLocally(updatedEmendas);
      setSelectedEmenda({
        ...cleanToSave,
        _modalidade: resolveModalidade(cleanToSave),
        _entidade: resolveEntidade(cleanToSave),
        _ano: resolveAno(cleanToSave)
      });
      setEditingEmenda(null);
      setCurrentView('detail');

      fetch('/api/emendas', {
        method: 'POST',
        body: JSON.stringify({ action: 'update', data: cleanToSave }),
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

  const handleEntityClick = (type, value) => {
    if (!value) return;
    setCurrentView('list');
    clearAllFilters();
    if (type === 'modalidade') setFilterModalidades([value]);
    if (type === 'entidade') setFilterEntidades([value]);
    if (type === 'articulador') setFilterArticuladores([value]);
    if (type === 'municipio') setFilterMunicipios([value]);
    if (type === 'regiao') setFilterRegioes([value]);
    if (type === 'tema') setFilterTemas([value]);
    if (type === 'situacao') setFilterSituacoes([value]);
    if (type === 'ano') setFilterAnos([value]);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedEmendas = useMemo(() => {
    let result = enrichedEmendas.filter(e => {
      const matchesSearch = searchTerm === '' || JSON.stringify(e).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModalidade = filterModalidades.length === 0 || filterModalidades.includes(e._modalidade);
      const matchesEntidade = filterEntidades.length === 0 || filterEntidades.includes(e._entidade);
      const matchesArticulador = filterArticuladores.length === 0 || filterArticuladores.includes(e.ARTICULADOR);
      const matchesMunicipio = filterMunicipios.length === 0 || filterMunicipios.includes(e['MUNICÍPIO']);
      const matchesRegiao = filterRegioes.length === 0 || filterRegioes.includes(e.REGIÃO);
      const matchesTema = filterTemas.length === 0 || filterTemas.includes(e.TEMA);
      const matchesSituacao = filterSituacoes.length === 0 || filterSituacoes.includes(e.SITUAÇÃO);
      const matchesAno = filterAnos.length === 0 || filterAnos.includes(e._ano);

      return (
        matchesSearch &&
        matchesModalidade &&
        matchesEntidade &&
        matchesArticulador &&
        matchesMunicipio &&
        matchesRegiao &&
        matchesTema &&
        matchesSituacao &&
        matchesAno
      );
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'TOTAL' || sortConfig.key === 'PAGO') {
          valA = parseCurrency(valA);
          valB = parseCurrency(valB);
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }

        if (sortConfig.key === 'NÚMERO DA EMENDA') {
          const partsA = (String(valA) || '').split('/');
          const partsB = (String(valB) || '').split('/');
          const numA = parseInt(partsA[0]) || 0;
          const yearA = parseInt(partsA[1]) || 0;
          const numB = parseInt(partsB[0]) || 0;
          const yearB = parseInt(partsB[1]) || 0;

          if (yearA !== yearB) {
            return sortConfig.direction === 'asc' ? yearA - yearB : yearB - yearA;
          }
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        }

        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    enrichedEmendas,
    searchTerm,
    filterModalidades,
    filterEntidades,
    filterArticuladores,
    filterMunicipios,
    filterRegioes,
    filterTemas,
    filterSituacoes,
    filterAnos,
    sortConfig
  ]);

  const handleExportCSV = () => {
    if (!filteredAndSortedEmendas || filteredAndSortedEmendas.length === 0) {
      alert("Nenhum dado disponível para exportar.");
      return;
    }

    const cleanRows = filteredAndSortedEmendas.map(r => {
      const copy = { ...r };
      copy['MODALIDADE'] = copy['MODALIDADE'] || copy._modalidade || '';
      copy['RAZÃO SOCIAL'] = copy['RAZÃO SOCIAL'] || copy._entidade || '';
      copy['ANO'] = copy['ANO'] || copy._ano || '';
      delete copy._modalidade;
      delete copy._entidade;
      delete copy._ano;
      return copy;
    });

    const headers = Array.from(new Set(cleanRows.flatMap(Object.keys)));
    const csvRows = [];
    csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

    cleanRows.forEach(row => {
      const values = headers.map(header => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
        return `"${val.replace(/"/g, '""')}"`; }); csvRows.push(values.join(',')); });  const csvString = "\uFEFF" + csvRows.join('\n'); const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.setAttribute("download", "emendas_filtradas.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link); };  // Estilo de Badge para Modalidade (Paleta Mondrian Suave) const getModalidadeBadgeStyle = (mod) => { const m = String(mod \vert{}\vert{} '').toLowerCase(); if (m.includes('convênio') \vert{}\vert{} m.includes('convenio') \vert{}\vert{} m.includes('entidade')) { return 'bg-rose-50 text-rose-800 border-rose-700/60'; } if (m.includes('transferência') \vert{}\vert{} m.includes('transferencia')) { return 'bg-teal-50 text-teal-800 border-teal-700/60'; } if (m.includes('execução') \vert{}\vert{} m.includes('execucao') \vert{}\vert{} m.includes('órgão')) { return 'bg-amber-50 text-amber-900 border-amber-600/60'; } return 'bg-stone-100 text-stone-700 border-stone-400'; };  // Estilo de Badge para Situação SEF/SC const getSituacaoBadgeStyle = (sit) => { const s = String(sit \vert{}\vert{} '').toLowerCase(); if (s === 'pago') { return 'bg-teal-700 text-white border-stone-800'; } if (s.includes('parcial')) { return 'bg-teal-50 text-teal-900 border-teal-700'; } if (s.includes('pagar')) { return 'bg-amber-200/80 text-stone-900 border-stone-800'; } return 'bg-stone-100 text-stone-700 border-stone-400'; };  const MultiSelect = ({ id, label, options, selected, onChange }) => { const isOpen = openDropdown === id; const [innerSearch, setInnerSearch] = useState('');  const handleToggleDropdown = (e) => { e.stopPropagation(); setOpenDropdown(isOpen ? null : id); };  const handleToggleOption = (e, opt) => { e.stopPropagation(); if (selected.includes(opt)) { onChange(selected.filter(i => i !== opt)); } else { onChange([...selected, opt]); } };  const handleClear = (e) => { e.stopPropagation(); onChange([]); };  let displayText = `${label}: Todos`;
    if (selected.length === 1) displayText = `${label}:${selected[0]}`;
    else if (selected.length > 1) displayText = `${label}:${selected.length}`;

    const filteredOptions = options.filter(o =>
      String(o).toLowerCase().includes(innerSearch.toLowerCase())
    );

    return (
      <div className="relative">
        <div
          onClick={handleToggleDropdown}
          className={`px-2.5 py-1.5 bg-white border transition-colors text-[11px] font-semibold uppercase tracking-wide cursor-pointer flex justify-between items-center min-w-[135px] max-w-[190px] ${
            selected.length > 0
              ? 'border-teal-700 bg-teal-50/50 text-teal-950 shadow-[2px_2px_0_0_#0f766e]'
              : 'border-stone-800 text-stone-800 hover:bg-stone-50'
