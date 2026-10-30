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
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "emendas_filtradas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Estilo de Badge para Modalidade (Paleta Mondrian Suave)
  const getModalidadeBadgeStyle = (mod) => {
    const m = String(mod || '').toLowerCase();
    if (m.includes('convênio') || m.includes('convenio') || m.includes('entidade')) {
      return 'bg-rose-50 text-rose-800 border-rose-700/60';
    }
    if (m.includes('transferência') || m.includes('transferencia')) {
      return 'bg-teal-50 text-teal-800 border-teal-700/60';
    }
    if (m.includes('execução') || m.includes('execucao') || m.includes('órgão')) {
      return 'bg-amber-50 text-amber-900 border-amber-600/60';
    }
    return 'bg-stone-100 text-stone-700 border-stone-400';
  };

  // Estilo de Badge para Situação SEF/SC
  const getSituacaoBadgeStyle = (sit) => {
    const s = String(sit || '').toLowerCase();
    if (s === 'pago') {
      return 'bg-teal-700 text-white border-stone-800';
    }
    if (s.includes('parcial')) {
      return 'bg-teal-50 text-teal-900 border-teal-700';
    }
    if (s.includes('pagar')) {
      return 'bg-amber-200/80 text-stone-900 border-stone-800';
    }
    return 'bg-stone-100 text-stone-700 border-stone-400';
  };

  const MultiSelect = ({ id, label, options, selected, onChange }) => {
    const isOpen = openDropdown === id;
    const [innerSearch, setInnerSearch] = useState('');

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
          }`}
        >
          <span className="truncate pr-1.5" title={displayText}>{displayText}</span>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {selected.length > 0 && (
              <div onClick={handleClear} className="hover:text-rose-700 rounded p-0.5" title="Limpar filtro">
                <XIcon className="w-3 h-3" />
              </div>
            )}
            <ChevronDownIcon className="w-3.5 h-3.5 text-stone-600" />
          </div>
        </div>

        {isOpen && (
          <div
            className="absolute z-30 top-full left-0 mt-1 w-64 max-h-72 overflow-y-auto bg-white border border-stone-800 shadow-[4px_4px_0_0_#1c1917] flex flex-col p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {options.length > 8 && (
              <input
                type="text"
                placeholder="Filtrar opções..."
                value={innerSearch}
                onChange={(e) => setInnerSearch(e.target.value)}
                className="mb-1.5 px-2 py-1 text-xs border border-stone-300 focus:outline-none focus:border-teal-700"
              />
            )}
            {filteredOptions.map(opt => (
              <label key={opt} className="flex items-center space-x-2 cursor-pointer hover:bg-amber-50/80 p-1.5 transition-colors">
                <input
                  type="checkbox"
                  className="accent-teal-700 w-3.5 h-3.5 border border-stone-800 cursor-pointer"
                  checked={selected.includes(opt)}
                  onChange={(e) => handleToggleOption(e, opt)}
                />
                <span className="text-[11px] font-medium uppercase truncate flex-1 text-stone-800" title={opt}>{opt}</span>
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <span className="text-[11px] text-stone-400 italic p-2 text-center">Nenhuma opção</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const FilterBar = () => {
    const hasFilters =
      searchTerm ||
      filterModalidades.length > 0 ||
      filterEntidades.length > 0 ||
      filterArticuladores.length > 0 ||
      filterMunicipios.length > 0 ||
      filterRegioes.length > 0 ||
      filterTemas.length > 0 ||
      filterSituacoes.length > 0 ||
      filterAnos.length > 0;

    return (
      <div className="bg-white p-3.5 border border-stone-800 mb-4 flex flex-wrap gap-2.5 items-center shadow-[3px_3px_0_0_#1c1917] print:hidden">
        <div className="flex-1 min-w-[200px] relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <input
            type="text"
            placeholder="Buscar por entidade, objeto, número, SGPe, liderança..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#fafaf8] border border-stone-800 text-xs focus:outline-none focus:border-teal-700 focus:bg-white text-stone-900 placeholder-stone-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <MultiSelect id="mod" label="Modalidade" options={modalidades} selected={filterModalidades} onChange={setFilterModalidades} />
        <MultiSelect id="ent" label="Entidade" options={entidades} selected={filterEntidades} onChange={setFilterEntidades} />
        <MultiSelect id="mun" label="Município" options={municipios} selected={filterMunicipios} onChange={setFilterMunicipios} />
        <MultiSelect id="reg" label="Região" options={regioes} selected={filterRegioes} onChange={setFilterRegioes} />
        <MultiSelect id="art" label="Articulador" options={articuladores} selected={filterArticuladores} onChange={setFilterArticuladores} />
        <MultiSelect id="tem" label="Tema" options={temas} selected={filterTemas} onChange={setFilterTemas} />
        <MultiSelect id="sit" label="Situação" options={situacoes} selected={filterSituacoes} onChange={setFilterSituacoes} />
        <MultiSelect id="ano" label="Ano" options={anos} selected={filterAnos} onChange={setFilterAnos} />

        {hasFilters && (
          <button
            onClick={clearAllFilters}
            className="bg-rose-700 px-2.5 py-1.5 text-white border border-stone-800 hover:bg-rose-800 transition-colors flex items-center text-[11px] font-semibold uppercase"
            title="Limpar todos os filtros"
          >
            <XIcon className="h-3.5 w-3.5 mr-1" /> Limpar
          </button>
        )}
      </div>
    );
  };

  const Navbar = () => (
    <nav className="bg-white border-b border-stone-800 sticky top-0 z-20 print:hidden">
      {/* Filete Superior Mondrian Minimalista (Carmesim / Azul-Esverdeado / Amarelo) */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-rose-700"></div>
        <div className="w-1/3 bg-teal-700"></div>
        <div className="w-1/3 bg-amber-300"></div>
      </div>
      <div className="max-w-[95%] xl:max-w-[1400px] mx-auto px-4">
        <div className="flex justify-between h-14">
          <div className="flex items-center cursor-pointer group" onClick={resetToFrontPage} title="Voltar ao Início">
            <img
              src="https://raw.githubusercontent.com/killuixo/tabulum-sig-emendas/refs/heads/main/icon-192.png"
              alt="Ícone TABULUM"
              className="w-8 h-8 mr-3 object-contain transition-transform group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="flex items-baseline space-x-2">
              <span className="font-bold text-lg tracking-tight text-stone-900">TABULUM</span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-teal-800 bg-teal-50 border border-stone-800 px-1.5 py-0.5">
                Emendas
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            {isAdmin ? (
              <>
                <div className="hidden md:flex items-center bg-teal-700 border border-stone-800 px-2.5 py-1 text-[11px] font-semibold text-white tracking-wider">
                  <UserIcon className="h-3.5 w-3.5 mr-1.5" /> ADMIN
                </div>
                <button
                  onClick={() => setCurrentView('settings')}
                  className="bg-amber-300/90 border border-stone-800 p-1.5 hover:bg-amber-300 shadow-[2px_2px_0_0_#1c1917] transition-transform active:translate-y-0.5 active:shadow-none"
                  title="Ajustes"
                >
                  <SettingsIcon className="h-4 w-4 text-stone-900" />
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-rose-700 border border-stone-800 p-1.5 hover:bg-rose-800 shadow-[2px_2px_0_0_#1c1917] transition-transform active:translate-y-0.5 active:shadow-none"
                  title="Sair"
                >
                  <LogOutIcon className="h-4 w-4 text-white" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center bg-amber-300/90 border border-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-900 uppercase shadow-[2px_2px_0_0_#1c1917] hover:bg-amber-300 transition-transform active:translate-y-0.5 active:shadow-none"
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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 space-y-3 md:space-y-0 print:hidden">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-6 bg-rose-700 border border-stone-800"></div>
          <h1 className="text-2xl font-bold text-stone-900 uppercase tracking-tight">{title}</h1>
        </div>
        <div className="flex border border-stone-800 bg-white shadow-[2px_2px_0_0_#1c1917]">
          <button
            onClick={() => setCurrentView('list')}
            className={`px-3 py-1.5 flex items-center font-semibold uppercase text-xs border-r border-stone-800 transition-colors ${
              currentView === 'list' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">Quadro</span>
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1.5 flex items-center font-semibold uppercase text-xs transition-colors ${
              currentView === 'dashboard' ? 'bg-amber-300 text-stone-900' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <LayoutDashboardIcon className="h-3.5 w-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </div>

      {isAdmin && currentView === 'list' && (
        <button
          onClick={() => confirmAction(
            "Sincronizar Planilha",
            "Deseja sincronizar com o Google Sheets? Isso atualizará seus dados locais com as versões mais recentes do Google.",
            syncWithGoogleSheet
          )}
          className="flex items-center px-3.5 py-1.5 bg-teal-700 text-white text-xs font-semibold uppercase border border-stone-800 shadow-[2px_2px_0_0_#1c1917] hover:bg-teal-800 transition-transform active:translate-y-0.5 active:shadow-none"
        >
          <RefreshCwIcon className="h-3.5 w-3.5 mr-1.5" /> <span>Sincronizar</span>
        </button>
      )}
    </div>
  );

  const ListView = () => {
    const SortableHeader = ({ label, sortKey, extraClasses = "" }) => {
      const isActive = sortConfig?.key === sortKey;
      return (
        <th
          className={`py-2.5 text-left text-[11px] font-bold text-stone-900 uppercase tracking-wider cursor-pointer hover:bg-amber-200/70 transition-colors border-r border-stone-800 print:border-stone-800 ${extraClasses}`}
          onClick={() => requestSort(sortKey)}
        >
          <div className="flex items-center justify-between space-x-1">
            <span>{label}</span>
            {isActive ? (
              sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />
            ) : (
              <ChevronUpIcon className="w-3.5 h-3.5 opacity-20 print:hidden" />
            )}
          </div>
        </th>
      );
    };

    const totalFiltrado = filteredAndSortedEmendas.reduce((acc, e) => acc + parseCurrency(e.TOTAL), 0);
    const totalPagoFiltrado = filteredAndSortedEmendas.reduce((acc, e) => acc + parseCurrency(e.PAGO), 0);

    return (
      <div className="max-w-[95%] xl:max-w-[1400px] mx-auto px-4 py-6 animate-in fade-in print:w-full print:max-w-none print:m-0 print:p-0">
        <HeaderSwitcher title="Painel de Emendas" />
        <FilterBar />

        {/* Barra de Resumo Rápido, Nota SEF/SC e Alternância Lista/Cards */}
        <div className="flex flex-col lg:flex-row justify-between mb-4 gap-3 items-start lg:items-center print:hidden">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-white border border-stone-800 px-3 py-1.5 shadow-[2px_2px_0_0_#1c1917] flex items-center space-x-2">
              <span className="text-stone-500 font-semibold uppercase text-[10px]">Emendas:</span>
              <span className="font-bold text-stone-900">{filteredAndSortedEmendas.length}</span>
            </div>
            <div className="bg-white border border-stone-800 px-3 py-1.5 shadow-[2px_2px_0_0_#1c1917] flex items-center space-x-2">
              <span className="text-stone-500 font-semibold uppercase text-[10px]">Total Previsto:</span>
              <span className="font-bold text-teal-800">{formatCurrency(totalFiltrado)}</span>
            </div>
            <div className="bg-white border border-stone-800 px-3 py-1.5 shadow-[2px_2px_0_0_#1c1917] flex items-center space-x-2">
              <span className="text-stone-500 font-semibold uppercase text-[10px]">Total Pago:</span>
              <span className="font-bold text-rose-700">{formatCurrency(totalPagoFiltrado)}</span>
            </div>
            <div className="hidden xl:flex items-center text-[11px] text-stone-600 bg-amber-50/80 border border-stone-400 px-2.5 py-1">
              <InfoIcon className="w-3.5 h-3.5 mr-1.5 text-amber-700 flex-shrink-0" />
              <span>Status financeiro SEF/SC (emendas em <strong>Pago Parcial</strong> ou <strong>Pago</strong> já concluíram as etapas do SGPe).</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 self-end lg:self-auto">
            {/* Exportação CSV / PDF */}
            <div className="flex border border-stone-800 bg-white shadow-[2px_2px_0_0_#1c1917]">
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1.5 flex items-center font-semibold uppercase text-[11px] border-r border-stone-800 transition-colors hover:bg-amber-200/60 text-stone-800"
                title="Exportar Filtrados para CSV"
              >
                <DownloadIcon className="h-3.5 w-3.5" /> <span className="ml-1.5 hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-2.5 py-1.5 flex items-center font-semibold uppercase text-[11px] transition-colors hover:bg-teal-700 hover:text-white text-stone-800"
                title="Exportar para PDF / Imprimir"
              >
                <PrinterIcon className="h-3.5 w-3.5" /> <span className="ml-1.5 hidden sm:inline">PDF</span>
              </button>
            </div>

            {/* Alternância Lista / Cards */}
            <div className="flex border border-stone-800 bg-white shadow-[2px_2px_0_0_#1c1917]">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 flex items-center font-semibold uppercase text-[11px] border-r border-stone-800 transition-colors ${
                  viewMode === 'table' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
                title="Visualização em Lista"
              >
                <ListIcon className="h-3.5 w-3.5" /> <span className="ml-1.5 hidden sm:inline">Lista</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 flex items-center font-semibold uppercase text-[11px] transition-colors ${
                  viewMode === 'cards' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
                title="Visualização em Cards"
              >
                <GridIcon className="h-3.5 w-3.5" /> <span className="ml-1.5 hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="bg-white border border-stone-800 overflow-x-auto shadow-[4px_4px_0_0_#1c1917] print:shadow-none print:border print:overflow-visible print:w-full">
            <table className="min-w-[1100px] w-full border-collapse table-fixed print:min-w-0 print:w-full">
              <thead className="bg-amber-200/80 border-b border-stone-800 print:bg-amber-100">
                <tr>
                  <SortableHeader label="Nº Emenda" sortKey="NÚMERO DA EMENDA" extraClasses="w-[95px] px-2.5 print:w-[8%]" />
                  <SortableHeader label="Município / Região" sortKey="MUNICÍPIO" extraClasses="w-[155px] px-2.5 print:w-[14%]" />
                  <SortableHeader label="Modalidade" sortKey="_modalidade" extraClasses="w-[145px] px-2.5 print:w-[12%]" />
                  <SortableHeader label="Entidade (Razão Social) / Objeto" sortKey="OBJETO" extraClasses="w-auto px-3 print:w-auto" />
                  <SortableHeader label="Articulador" sortKey="ARTICULADOR" extraClasses="w-[120px] px-2.5 print:w-[11%]" />
                  <SortableHeader label="Situação" sortKey="SITUAÇÃO" extraClasses="w-[110px] px-2.5 print:w-[9%]" />
                  <SortableHeader label="Total / Pago" sortKey="TOTAL" extraClasses="w-[135px] px-2.5 border-r-0 print:w-[13%]" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200 print:text-[10px]">
                {filteredAndSortedEmendas.map((emenda, idx) => {
                  const valTotal = parseCurrency(emenda.TOTAL);
                  const valPago = parseCurrency(emenda.PAGO);

                  return (
                    <tr
                      key={emenda['NÚMERO DA EMENDA'] || idx}
                      onClick={() => { setSelectedEmenda(emenda); setCurrentView('detail'); }}
                      className="hover:bg-amber-50/40 cursor-pointer transition-colors print:break-inside-avoid print:cursor-auto"
                    >
                      <td className="px-2.5 py-2.5 text-xs print:text-[10px] font-bold text-stone-900 border-r border-stone-300 align-top">
                        <div>{emenda['NÚMERO DA EMENDA']}</div>
                        {emenda['UNIDADE ORÇAMENTÁRIA'] && (
                          <span className="inline-block mt-1 text-[10px] font-semibold text-stone-500 uppercase">
                            {emenda['UNIDADE ORÇAMENTÁRIA']}
                          </span>
                        )}
                      </td>

                      <td className="px-2.5 py-2.5 border-r border-stone-300 align-top">
                        <div className="text-xs print:text-[10px] font-bold uppercase text-teal-800 truncate print:whitespace-normal" title={emenda['MUNICÍPIO']}>
                          {emenda['MUNICÍPIO']}
                        </div>
                        {emenda.REGIÃO && (
                          <div className="text-[10px] font-medium uppercase text-stone-500 truncate mt-0.5" title={emenda.REGIÃO}>
                            {emenda.REGIÃO}
                          </div>
                        )}
                      </td>

                      <td className="px-2.5 py-2.5 border-r border-stone-300 align-top">
                        <span className={`inline-block border px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-tight ${getModalidadeBadgeStyle(emenda._modalidade)}`}>
                          {emenda._modalidade || '-'}
                        </span>
                        {emenda.SGPe && (
                          <div className="text-[10px] text-stone-500 font-medium mt-1 truncate" title={`SGPe: ${emenda.SGPe}`}>
                            {emenda.SGPe}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-xs print:text-[10px] text-stone-800 border-r border-stone-300 align-top print:whitespace-normal print:break-words">
                        {emenda._entidade && (
                          <div className="mb-1 flex items-center flex-wrap gap-1">
                            <span className="inline-flex items-center bg-rose-50 text-rose-900 border border-rose-700/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight">
                              <BuildingIcon className="w-3 h-3 mr-1 text-rose-700 flex-shrink-0" />
                              {emenda._entidade}
                            </span>
                          </div>
                        )}
                        <p className="text-stone-700 leading-relaxed line-clamp-2 print:line-clamp-none">
                          {emenda.OBJETO}
                        </p>
                      </td>

                      <td className="px-2.5 py-2.5 text-xs print:text-[10px] font-semibold text-rose-700 border-r border-stone-300 align-top truncate print:whitespace-normal" title={emenda.ARTICULADOR}>
                        <div>{emenda.ARTICULADOR || '-'}</div>
                        {emenda.LIDERANÇA && (
                          <div className="text-[10px] font-normal text-stone-500 truncate mt-0.5" title={`Liderança: ${emenda.LIDERANÇA}`}>
                            Lid.: {emenda.LIDERANÇA}
                          </div>
                        )}
                      </td>

                      <td className="px-2.5 py-2.5 border-r border-stone-300 align-top">
                        <span
                          className={`block w-full text-center border px-1.5 py-0.5 text-[10px] print:text-[8px] font-bold uppercase truncate print:whitespace-normal ${getSituacaoBadgeStyle(emenda.SITUAÇÃO)}`}
                          title={emenda.SITUAÇÃO}
                        >
                          {emenda.SITUAÇÃO || 'Indefinida'}
                        </span>
                      </td>

                      <td className="px-2.5 py-2.5 text-right align-top border-r-0">
                        <div className="text-xs print:text-[10px] font-bold text-stone-900">
                          {formatCurrency(valTotal)}
                        </div>
                        {valPago > 0 && (
                          <div className="text-[10px] font-semibold text-teal-800 mt-0.5" title="Valor Pago na SEF/SC">
                            Pago: {formatCurrency(valPago)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredAndSortedEmendas.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center font-semibold text-stone-400 uppercase text-xs">
                      Nenhuma emenda encontrada para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="bg-[#fafaf8] px-4 py-2.5 font-semibold text-xs text-stone-600 flex justify-between border-t border-stone-800 print:hidden">
              <span>Exibindo {filteredAndSortedEmendas.length} de {enrichedEmendas.length} emendas</span>
              <span>Clique em qualquer linha para abrir a ficha completa</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 print:grid-cols-2 print:gap-4">
            {filteredAndSortedEmendas.map((emenda, idx) => {
              const valTotal = parseCurrency(emenda.TOTAL);
              const valPago = parseCurrency(emenda.PAGO);

              return (
                <div
                  key={emenda['NÚMERO DA EMENDA'] || idx}
                  className="border border-stone-800 bg-white shadow-[3px_3px_0_0_#1c1917] print:shadow-none flex flex-col hover:-translate-y-0.5 transition-transform cursor-pointer print:break-inside-avoid print:cursor-auto"
                  onClick={() => { setSelectedEmenda(emenda); setCurrentView('detail'); }}
                >
                  {/* Topo do Card Mondrian Suave */}
                  <div className="bg-amber-100/80 border-b border-stone-800 px-3.5 py-2.5 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-stone-900 text-sm">#{emenda['NÚMERO DA EMENDA']}</span>
                      {emenda['UNIDADE ORÇAMENTÁRIA'] && (
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-white border border-stone-400 text-stone-700">
                          {emenda['UNIDADE ORÇAMENTÁRIA']}
                        </span>
                      )}
                    </div>
                    <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${getSituacaoBadgeStyle(emenda.SITUAÇÃO)}`}>
                      {emenda.SITUAÇÃO || 'Indefinida'}
                    </span>
                  </div>

                  {/* Corpo do Card */}
                  <div className="p-4 flex-1 flex flex-col space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center text-teal-800 font-bold uppercase text-xs">
                        <MapPinIcon className="h-3.5 w-3.5 mr-1 text-teal-700" />
                        <span>{emenda['MUNICÍPIO']}</span>
                      </div>
                      <span className={`border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${getModalidadeBadgeStyle(emenda._modalidade)}`}>
                        {emenda._modalidade}
                      </span>
                    </div>

                    {/* Destaque da Entidade / Razão Social */}
                    {emenda._entidade && (
                      <div className="bg-rose-50/80 border-l-2 border-rose-700 px-2.5 py-1.5">
                        <p className="text-[9px] font-bold uppercase text-rose-700 tracking-wider">Entidade / Órgão Recebedor</p>
                        <p className="text-xs font-bold text-stone-900 leading-snug">{emenda._entidade}</p>
                      </div>
                    )}

                    <p className="text-xs text-stone-700 leading-relaxed line-clamp-3 flex-1 print:line-clamp-none">
                      {emenda.OBJETO}
                    </p>
                  </div>

                  {/* Rodapé do Card */}
                  <div className="bg-[#fafaf8] border-t border-stone-800 px-3.5 py-2.5 flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-bold uppercase text-stone-400">Articulador</p>
                      <p className="text-rose-700 font-semibold text-xs uppercase truncate max-w-[140px]">
                        {emenda.ARTICULADOR || '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase text-stone-400">Total Previsto</p>
                      <p className="font-bold text-stone-900 text-sm leading-none">{formatCurrency(valTotal)}</p>
                      {valPago > 0 && (
                        <p className="text-[10px] font-semibold text-teal-800 mt-0.5">
                          Pago: {formatCurrency(valPago)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredAndSortedEmendas.length === 0 && (
              <div className="col-span-full py-12 text-center font-semibold text-stone-500 uppercase border border-stone-400 border-dashed text-xs">
                Nenhuma emenda encontrada.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const DashboardView = () => {
    const [hoveredMuni, setHoveredMuni] = useState(null);

    const totalGlobal = filteredAndSortedEmendas.reduce((acc, em) => acc + parseCurrency(em.TOTAL), 0);
    const totalPagoGlobal = filteredAndSortedEmendas.reduce((acc, em) => acc + parseCurrency(em.PAGO), 0);

    const emendasPorModalidade = filteredAndSortedEmendas.reduce((acc, em) => {
      const mod = em._modalidade || 'Outros';
      acc[mod] = (acc[mod] || 0) + parseCurrency(em.TOTAL);
      return acc;
    }, {});
    const modalidadeData = Object.keys(emendasPorModalidade)
      .map(mod => ({ mod, valor: emendasPorModalidade[mod] }))
      .sort((a, b) => b.valor - a.valor);

    const emendasPorAno = filteredAndSortedEmendas.reduce((acc, em) => {
      const ano = em._ano || 'N/A';
      acc[ano] = (acc[ano] || 0) + parseCurrency(em.TOTAL);
      return acc;
    }, {});
    const timelineData = Object.keys(emendasPorAno).sort().map(ano => ({ ano, valor: emendasPorAno[ano] }));

    const emendasPorRegiao = filteredAndSortedEmendas.reduce((acc, em) => {
      const regiao = em.REGIÃO || 'N/A';
      acc[regiao] = (acc[regiao] || 0) + parseCurrency(em.TOTAL);
      return acc;
    }, {});
    const regiaoData = Object.keys(emendasPorRegiao)
      .map(regiao => ({ regiao, valor: emendasPorRegiao[regiao] }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);

    const emendasPorMuni = useMemo(() => {
      const map = {};
      filteredAndSortedEmendas.forEach(em => {
        const mName = normalizeStr(em['MUNICÍPIO']);
        if (mName) map[mName] = (map[mName] || 0) + parseCurrency(em.TOTAL);
      });
      return map;
    }, [filteredAndSortedEmendas]);

    // Cores Mondrian Suavizadas no Mapa
    const getMuniColor = (val) => {
      if (!val || val === 0) return '#ffffff';
      if (val < 300000) return '#fde68a'; // Mostarda suave
      if (val < 800000) return '#0f766e'; // Azul-esverdeado
      return '#be123c'; // Carmesim
    };

    const renderMap = () => {
      if (!mapGeoJson) return <div className="p-8 text-center font-semibold text-xs text-stone-500">Carregando Mapa...</div>;

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
        <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full h-auto">
          {mapGeoJson.features.map((feature, i) => {
            const mName = normalizeStr(feature.properties.name);
            const val = emendasPorMuni[mName] || 0;
            return (
              <path
                key={i}
                d={generatePath(feature.geometry)}
                fill={getMuniColor(val)}
                stroke="#292524"
                strokeWidth="0.7"
                className="hover:stroke-[2px] transition-all cursor-crosshair relative"
                onMouseEnter={(e) => {
                  setHoveredMuni({ name: feature.properties.name, val, x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredMuni(null)}
                onClick={() => { if (val > 0) { resetToFrontPage(); setFilterMunicipios([feature.properties.name]); } }}
              />
            );
          })}
        </svg>
      );
    };

    return (
      <div className="max-w-[95%] xl:max-w-[1400px] mx-auto px-4 py-6 animate-in fade-in print:w-full print:max-w-none print:m-0 print:p-0">
        <HeaderSwitcher title="Dashboard Estatístico" />
        <FilterBar />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-4">
          <div className="lg:col-span-1 space-y-6">
            {/* Bloco Financeiro Principal */}
            <div className="bg-amber-100/90 border border-stone-800 p-5 shadow-[3px_3px_0_0_#1c1917] print:shadow-none">
              <p className="text-stone-800 font-bold uppercase text-xs tracking-wider border-b border-stone-800 pb-2 mb-3">
                Resumo Financeiro no Filtro
              </p>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-stone-600">Total Alocado</span>
                  <h2 className="text-2xl xl:text-3xl font-bold text-stone-900 leading-tight">
                    {formatCurrency(totalGlobal)}
                  </h2>
                </div>
                <div className="pt-2 border-t border-stone-800/30 flex justify-between items-baseline">
                  <span className="text-[10px] font-bold uppercase text-teal-900">Total Já Pago (SEF/SC)</span>
                  <span className="text-base font-bold text-teal-800">{formatCurrency(totalPagoGlobal)}</span>
                </div>
              </div>
            </div>

            {/* Por Modalidade (Convênio, Transferência Especial, Execução Direta) */}
            <div className="bg-white border border-stone-800 p-5 shadow-[3px_3px_0_0_#1c1917] print:shadow-none">
              <p className="text-stone-900 font-bold uppercase text-xs tracking-wider border-b border-stone-800 pb-2 mb-4">
                Por Modalidade
              </p>
              <div className="space-y-3">
                {modalidadeData.length > 0 ? modalidadeData.map((d) => {
                  const maxVal = Math.max(...modalidadeData.map(r => r.valor));
                  const pct = Math.max((d.valor / maxVal) * 100, 5);
                  return (
                    <div
                      key={d.mod}
                      className="cursor-pointer group"
                      onClick={() => handleEntityClick('modalidade', d.mod)}
                    >
                      <div className="flex justify-between text-[11px] font-semibold uppercase mb-1 group-hover:text-rose-700">
                        <span>{d.mod}</span>
                        <span>{formatCurrency(d.valor)}</span>
                      </div>
                      <div className="h-4 w-full bg-[#fafaf8] border border-stone-800">
                        <div className="h-full bg-rose-700 border-r border-stone-800" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                }) : <p className="text-xs text-stone-400 uppercase">Sem dados.</p>}
              </div>
            </div>

            {/* Top Regiões */}
            <div className="bg-white border border-stone-800 p-5 shadow-[3px_3px_0_0_#1c1917] print:shadow-none">
              <p className="text-stone-900 font-bold uppercase text-xs tracking-wider border-b border-stone-800 pb-2 mb-4">
                Top Regiões
              </p>
              <div className="space-y-3">
                {regiaoData.length > 0 ? regiaoData.map((d) => {
                  const maxVal = Math.max(...regiaoData.map(r => r.valor));
                  const pct = Math.max((d.valor / maxVal) * 100, 5);
                  return (
                    <div
                      key={d.regiao}
                      className="cursor-pointer group"
                      onClick={() => handleEntityClick('regiao', d.regiao)}
                    >
                      <div className="flex justify-between text-[11px] font-semibold uppercase mb-1 group-hover:text-teal-700">
                        <span>{d.regiao}</span>
                        <span>{formatCurrency(d.valor)}</span>
                      </div>
                      <div className="h-4 w-full bg-[#fafaf8] border border-stone-800">
                        <div className="h-full bg-teal-700 border-r border-stone-800" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                }) : <p className="text-xs text-stone-400 uppercase">Sem dados.</p>}
              </div>
            </div>

            {/* Evolução Anual */}
            <div className="bg-white border border-stone-800 p-5 shadow-[3px_3px_0_0_#1c1917] print:shadow-none">
              <p className="text-stone-900 font-bold uppercase text-xs tracking-wider border-b border-stone-800 pb-2 mb-4">
                Evolução Anual
              </p>
              <div className="flex items-end h-36 space-x-3 border-b border-l border-stone-800 p-2">
                {timelineData.length > 0 ? timelineData.map((d) => {
                  const maxVal = Math.max(...timelineData.map(r => r.valor));
                  const pct = Math.max((d.valor / maxVal) * 100, 5);
                  return (
                    <div key={d.ano} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-stone-900 text-white text-[10px] font-semibold px-2 py-0.5 pointer-events-none whitespace-nowrap z-10">
                        {formatCurrency(d.valor)}
                      </div>
                      <div
                        className="w-full bg-teal-700 border border-stone-800 transition-all group-hover:bg-amber-300"
                        style={{ height: `${pct}%` }}
                      ></div>
                      <span className="text-[10px] font-bold mt-1.5 text-stone-700">{d.ano}</span>
                    </div>
                  );
                }) : <p className="text-xs text-stone-400 uppercase self-center w-full text-center">Sem dados.</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-stone-800 shadow-[3px_3px_0_0_#1c1917] print:shadow-none flex flex-col relative overflow-hidden">
            <div className="bg-teal-700 border-b border-stone-800 px-4 py-3 flex justify-between items-center z-10 print:bg-white">
              <p className="text-white font-bold uppercase text-xs tracking-wider flex items-center print:text-stone-900">
                <MapPinIcon className="h-4 w-4 mr-1.5" /> Distribuição Territorial (Santa Catarina)
              </p>
              <div className="flex space-x-2 text-[10px] font-semibold uppercase text-white items-center print:text-stone-900">
                <span>Volume:</span>
                <div className="w-3 h-3 bg-[#fde68a] border border-stone-900"></div> <span>Até 300k</span>
                <div className="w-3 h-3 bg-[#0f766e] border border-stone-900 ml-1.5"></div> <span>300k–800k</span>
                <div className="w-3 h-3 bg-[#be123c] border border-stone-900 ml-1.5"></div> <span>+800k</span>
              </div>
            </div>

            <div className="flex-1 p-4 bg-[#fafaf8] relative flex items-center justify-center">
              {renderMap()}

              {hoveredMuni && (
                <div
                  className="fixed bg-white border border-stone-800 p-2.5 shadow-[3px_3px_0_0_#1c1917] z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px] print:hidden"
                  style={{ left: hoveredMuni.x, top: hoveredMuni.y }}
                >
                  <p className="font-bold text-rose-700 text-xs uppercase">{hoveredMuni.name}</p>
                  <p className="font-semibold text-xs text-stone-900">
                    {hoveredMuni.val > 0 ? formatCurrency(hoveredMuni.val) : 'Nenhuma emenda no filtro'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DetailView = () => {
    const isEditing = currentView === 'edit';
    const data = isEditing ? editingEmenda : selectedEmenda;
    const handleInputChange = (field, value) => setEditingEmenda(prev => ({ ...prev, [field]: value }));

    const modResolved = resolveModalidade(data);
    const entResolved = resolveEntidade(data);

    const InfoField = ({ label, field, valueOverride = null, icon: IconComponent, type = 'text', linkType = null, accent = 'stone', isCurrency = false }) => {
      const rawValue = valueOverride !== null ? valueOverride : data[field];
      let displayValue = rawValue;

      if (!isEditing && isCurrency) {
        displayValue = formatCurrency(parseCurrency(rawValue));
      }

      const labelColor =
        accent === 'teal' ? 'text-teal-800' :
        accent === 'rose' ? 'text-rose-700' :
        accent === 'amber' ? 'text-amber-800' : 'text-stone-600';

      if (isEditing) {
        return (
          <div className="mb-3.5">
            <label className={`block text-[11px] font-bold uppercase mb-1 ${labelColor}`}>{label}</label>
            {type === 'textarea' ? (
              <textarea
                className="w-full p-2 bg-[#fafaf8] border border-stone-800 text-xs focus:outline-none focus:border-teal-700 focus:bg-white text-stone-900"
                rows="3"
                value={data[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            ) : (
              <input
                type="text"
                className="w-full p-2 bg-[#fafaf8] border border-stone-800 text-xs focus:outline-none focus:border-teal-700 focus:bg-white text-stone-900"
                value={data[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            )}
          </div>
        );
      }

      return (
        <div className="mb-3 bg-white p-3 border border-stone-300 relative">
          <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center ${labelColor}`}>
            {IconComponent && <IconComponent className="h-3.5 w-3.5 mr-1 print:hidden" />} {label}
          </label>
          <div className="text-stone-900 font-medium text-xs break-words flex items-center justify-between gap-2">
            <span>{displayValue || <span className="text-stone-400 italic">Não informado</span>}</span>
            {linkType && rawValue && (
              <button
                onClick={(e) => { e.stopPropagation(); handleEntityClick(linkType, rawValue); }}
                className="text-[10px] bg-amber-100 text-stone-800 border border-stone-700 px-1.5 py-0.5 uppercase font-semibold hover:bg-amber-200 print:hidden flex-shrink-0"
              >
                Filtrar
              </button>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-in slide-in-from-right-4 print:w-full print:max-w-none print:m-0 print:p-0">
        <button
          onClick={() => { setCurrentView('list'); setEditingEmenda(null); }}
          className="bg-white text-stone-900 px-3.5 py-1.5 font-semibold uppercase text-xs border border-stone-800 hover:bg-stone-100 mb-5 flex items-center shadow-[2px_2px_0_0_#1c1917] print:hidden"
        >
          &larr; Voltar para a Lista
        </button>

        <div className="bg-white border border-stone-800 shadow-[5px_5px_0_0_#1c1917] print:shadow-none print:border-none">
          {/* Cabeçalho da Ficha em Carmesim Suave */}
          <div className="bg-rose-700 border-b border-stone-800 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:bg-white print:border-b">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-rose-100 font-semibold uppercase text-xs tracking-wider print:text-stone-600">
                  Ficha de Emenda Parlamentar
                </span>
                <span className="bg-amber-300 text-stone-900 border border-stone-900 px-2 py-0.5 text-[10px] font-bold uppercase">
                  {modResolved || 'Modalidade N/A'}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight print:text-stone-900">
                Nº {data['NÚMERO DA EMENDA']}
              </h2>
            </div>

            {isAdmin && !isEditing && (
              <button
                onClick={() => { setEditingEmenda({ ...selectedEmenda }); setCurrentView('edit'); }}
                className="bg-amber-300 text-stone-900 border border-stone-900 px-4 py-1.5 text-xs font-bold uppercase shadow-[2px_2px_0_0_#1c1917] hover:bg-amber-200 transition-transform active:translate-y-0.5 active:shadow-none flex items-center print:hidden"
              >
                <EditIcon className="h-4 w-4 mr-1.5" /> Editar Ficha
              </button>
            )}

            {isAdmin && isEditing && (
              <div className="flex space-x-2.5 print:hidden">
                <button
                  onClick={() => setCurrentView('detail')}
                  className="bg-white text-stone-900 border border-stone-900 px-3.5 py-1.5 text-xs font-bold uppercase shadow-[2px_2px_0_0_#1c1917] hover:bg-stone-100 flex items-center"
                >
                  <XIcon className="h-4 w-4 mr-1" /> Cancelar
                </button>
                <button
                  onClick={() => confirmAction("Salvar Alterações", "Confirmar alterações? A mudança será salva e sincronizada.", handleSaveEmenda)}
                  className="bg-teal-700 text-white border border-stone-900 px-4 py-1.5 text-xs font-bold uppercase shadow-[2px_2px_0_0_#1c1917] hover:bg-teal-800 flex items-center"
                >
                  <SaveIcon className="h-4 w-4 mr-1.5" /> Salvar
                </button>
              </div>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 print:p-0 print:mt-4">
            {/* Destaque Principal: Modalidade + Entidade Beneficiária + Objeto */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              {!isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#fafaf8] p-4 border border-stone-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-500 block">Modalidade da Emenda</span>
                    <span className={`inline-block mt-1 border px-2 py-0.5 text-xs font-bold uppercase ${getModalidadeBadgeStyle(modResolved)}`}>
                      {modResolved || 'N/A'}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-bold uppercase text-rose-700 block">
                      Entidade Beneficiária / Órgão Específico (Razão Social)
                    </span>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-stone-900">
                        {entResolved || <span className="text-stone-400 italic font-normal">Não especificada no objeto / coluna O</span>}
                      </span>
                      {entResolved && (
                        <button
                          onClick={() => handleEntityClick('entidade', entResolved)}
                          className="text-[10px] bg-amber-100 text-stone-800 border border-stone-700 px-2 py-0.5 uppercase font-semibold hover:bg-amber-200 print:hidden"
                        >
                          Ver todas desta entidade
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <InfoField label="Objeto / Descrição Oficial da Emenda" field="OBJETO" type="textarea" accent="rose" />
            </div>

            {/* Coluna 1: Identificação Territorial e Política */}
            <div className="bg-[#fafaf8] border border-stone-800 p-4 print:border-none print:p-0">
              <div className="bg-stone-900 text-white font-bold uppercase text-xs py-1 px-2.5 inline-block mb-3">
                Identificação & Território
              </div>
              <InfoField label="Município" field="MUNICÍPIO" icon={MapPinIcon} linkType="municipio" accent="teal" />
              <InfoField label="Região" field="REGIÃO" icon={MapIcon} linkType="regiao" accent="stone" />
              <InfoField label="Tema" field="TEMA" icon={TagIcon} linkType="tema" accent="teal" />
              <InfoField label="Articulador" field="ARTICULADOR" icon={UserIcon} linkType="articulador" accent="rose" />
              <InfoField label="Ano" field="ANO" valueOverride={!isEditing ? resolveAno(data) : null} linkType="ano" accent="stone" />
            </div>

            {/* Coluna 2: Financeiro e Execução SEF/SC */}
            <div className="bg-[#fafaf8] border border-stone-800 p-4 print:border-none print:p-0">
              <div className="bg-teal-700 text-white font-bold uppercase text-xs py-1 px-2.5 inline-block mb-3">
                Execução Financeira (SEF/SC)
              </div>
              <InfoField label="Situação Atual (SEF/SC)" field="SITUAÇÃO" linkType="situacao" accent="rose" />
              <InfoField label="Valor Total Previsto" field="TOTAL" accent="teal" isCurrency={true} />
              <InfoField label="Valor Pago" field="PAGO" accent="teal" isCurrency={true} />
              <InfoField label="Esfera de Aplicação" field="ESFERA DE APLICAÇÃO" accent="stone" />
              <InfoField label="Unidade Orçamentária" field="UNIDADE ORÇAMENTÁRIA" accent="stone" />
            </div>

            {/* Entidade e Contatos da Liderança */}
            <div className="col-span-1 md:col-span-2 bg-[#fafaf8] border border-stone-800 p-4 print:border-none print:p-0">
              <div className="bg-rose-700 text-white font-bold uppercase text-xs py-1 px-2.5 inline-block mb-3">
                Entidade & Liderança Relacionada
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoField
                  label="Razão Social / Entidade (Coluna O)"
                  field="RAZÃO SOCIAL"
                  valueOverride={!isEditing ? entResolved : null}
                  icon={BuildingIcon}
                  linkType="entidade"
                  accent="rose"
                />
                <InfoField label="Liderança" field="LIDERANÇA" icon={UserIcon} accent="teal" />
                <InfoField label="Telefone da Liderança" field="TELEFONE DA LIDERANÇA" accent="stone" />
                <InfoField label="Email da Liderança" field="EMAIL DA LIDERANÇA" accent="stone" />
              </div>
            </div>

            {/* Dados Técnicos, SGPe, Justificativa e Observações */}
            <div className="col-span-1 md:col-span-2 bg-amber-50/70 border border-stone-800 p-4 print:bg-white print:border-none print:p-0">
              <div className="bg-amber-300 text-stone-900 border border-stone-800 font-bold uppercase text-xs py-1 px-2.5 inline-block mb-3">
                Dados Técnicos & Controle Interno
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <InfoField label="Processo SGPe" field="SGPe" accent="stone" />
                <InfoField
                  label="Modalidade (Coluna T)"
                  field="MODALIDADE"
                  valueOverride={!isEditing ? modResolved : null}
                  icon={LayersIcon}
                  linkType="modalidade"
                  accent="stone"
                />
                <InfoField label="Tipo (Impositiva, Bancada, etc.)" field="TIPO (IMPOSITIVA, BANCADA, PARLAMENTARES)" accent="stone" />
              </div>
              <InfoField label="Entrega Realizada" field="ENTREGA" type="textarea" accent="stone" />
              <InfoField label="Justificativa" field="JUSTIFICATIVA" type="textarea" accent="stone" />
              <InfoField label="Observações Livres" field="Observação" type="textarea" accent="stone" />
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
          className="bg-white text-stone-900 px-3.5 py-1.5 font-semibold uppercase text-xs border border-stone-800 hover:bg-stone-100 mb-5 flex items-center shadow-[2px_2px_0_0_#1c1917]"
        >
          &larr; Voltar
        </button>

        <div className="bg-white border border-stone-800 shadow-[4px_4px_0_0_#1c1917]">
          <div className="bg-teal-700 border-b border-stone-800 p-5">
            <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center">
              <SettingsIcon className="mr-2.5 h-5 w-5" /> Configurações
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-amber-50 border border-stone-800 text-stone-800 p-4 flex items-start">
              <AlertTriangleIcon className="h-5 w-5 mr-2.5 text-amber-700 flex-shrink-0" />
              <p className="text-xs font-medium leading-relaxed">
                Modo de Segurança Máxima Ativado. A comunicação com a planilha Google é gerenciada exclusivamente pelo Backend (<code>/api/emendas</code>), sem expor credenciais ou links no navegador.
              </p>
            </div>
            <div className="border border-stone-300 p-5 bg-[#fafaf8]">
              <h3 className="text-sm font-bold uppercase text-teal-800 border-b border-stone-300 pb-2 mb-3 flex items-center">
                <UploadCloudIcon className="h-4 w-4 mr-2" /> Importação CSV Manual
              </h3>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="block w-full text-xs font-medium border border-stone-800 p-2 bg-white file:mr-3 file:py-1.5 file:px-3 file:border file:border-stone-800 file:text-xs file:font-bold file:uppercase file:bg-amber-300 file:text-stone-900 hover:file:bg-amber-200 cursor-pointer"
              />
            </div>
            <div className="border border-stone-300 p-5 bg-[#fafaf8]">
              <h3 className="text-sm font-bold uppercase text-stone-900 border-b border-stone-300 pb-2 mb-3">
                Segurança Local
              </h3>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Nova senha administrativa..."
                  className="flex-1 p-2 bg-white border border-stone-800 text-xs focus:outline-none focus:border-rose-700"
                />
                <button
                  onClick={() => {
                    if (newPass.length < 3) return alert("Mínimo de 3 caracteres.");
                    handleChangePassword(newPass);
                    setNewPass('');
                  }}
                  className="bg-rose-700 text-white text-xs font-bold uppercase px-4 py-2 border border-stone-800 shadow-[2px_2px_0_0_#1c1917] hover:bg-rose-800 whitespace-nowrap"
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
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-center p-6 bg-white border border-stone-800 shadow-[4px_4px_0_0_#1c1917]">
          <div className="flex space-x-2 justify-center mb-4">
            <div className="w-4 h-4 bg-rose-700 border border-stone-800 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-4 h-4 bg-amber-300 border border-stone-800 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-4 h-4 bg-teal-700 border border-stone-800 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
          <p className="text-stone-800 text-xs font-bold uppercase tracking-widest">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] font-sans text-stone-900 selection:bg-amber-200 selection:text-stone-900 pb-12 print:pb-0">
      <Navbar />
      <main>
        {currentView === 'list' && <ListView />}
        {currentView === 'dashboard' && <DashboardView />}
        {(currentView === 'detail' || currentView === 'edit') && <DetailView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      {showLoginModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white border border-stone-800 shadow-[6px_6px_0_0_#1c1917] p-6 w-full max-w-sm m-4 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-3 right-3 bg-white border border-stone-800 p-1 hover:bg-rose-700 hover:text-white transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-stone-900 uppercase mb-1 flex items-center">
              <LogInIcon className="mr-2 h-5 w-5 text-rose-700" /> Acesso Administrativo
            </h3>
            <div className="w-12 h-1 bg-amber-300 border border-stone-800 mb-5"></div>
            <input
              type="password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Senha"
              className="w-full p-2.5 bg-[#fafaf8] border border-stone-800 text-sm focus:outline-none focus:border-teal-700 mb-4 text-stone-900"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-teal-700 text-white text-xs font-bold uppercase py-2.5 border border-stone-800 shadow-[2px_2px_0_0_#1c1917] hover:bg-teal-800 transition-transform active:translate-y-0.5 active:shadow-none"
            >
              Entrar
            </button>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white border border-stone-800 shadow-[6px_6px_0_0_#1c1917] p-6 w-full max-w-md m-4 relative">
            <h3 className="text-lg font-bold text-stone-900 uppercase mb-3">{confirmModal.title}</h3>
            <p className="text-stone-700 text-xs leading-relaxed mb-6 border-l-2 border-amber-400 pl-3">
              {confirmModal.message}
            </p>
            <div className="flex justify-end space-x-2.5">
              <button
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="px-4 py-2 bg-white text-stone-800 text-xs font-bold uppercase border border-stone-800 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-700 text-white text-xs font-bold uppercase border border-stone-800 hover:bg-rose-800 shadow-[2px_2px_0_0_#1c1917] flex items-center"
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
