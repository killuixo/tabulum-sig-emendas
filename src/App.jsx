import React, { useState, useEffect, useMemo, useRef } from 'react';

const Icon = ({ path, className = "w-6 h-6", onClick, size, style }) => (
  <svg onClick={onClick} style={{ width: size, height: size, ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    {path}
  </svg>
);
const SearchIcon = (p) => <Icon {...p} path={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>} />;
const MapPinIcon = (p) => <Icon {...p} path={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>} />;
const MapIcon = (p) => <Icon {...p} path={<><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></>} />;
const UserIcon = (p) => <Icon {...p} path={<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />;
const TagIcon = (p) => <Icon {...p} path={<><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></>} />;
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
  const cleanStr = String(str).replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleanStr) || 0;
}

function formatCurrency(num) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

function normalizeStr(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArticuladores, setFilterArticuladores] = useState([]);
  const [filterMunicipios, setFilterMunicipios] = useState([]);
  const [filterRegioes, setFilterRegioes] = useState([]);
  const [filterTemas, setFilterTemas] = useState([]);
  const [filterSituacoes, setFilterSituacoes] = useState([]);
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

  const articuladores = useMemo(() => [...new Set(emendas.map(e => e.ARTICULADOR).filter(Boolean))].sort(), [emendas]);
  const municipios = useMemo(() => [...new Set(emendas.map(e => e['MUNICÍPIO']).filter(Boolean))].sort(), [emendas]);
  const regioes = useMemo(() => [...new Set(emendas.map(e => e.REGIÃO).filter(Boolean))].sort(), [emendas]);
  const temas = useMemo(() => [...new Set(emendas.map(e => e.TEMA).filter(Boolean))].sort(), [emendas]);
  const situacoes = useMemo(() => [...new Set(emendas.map(e => e.SITUAÇÃO).filter(Boolean))].sort(), [emendas]);

  useEffect(() => {
    document.title = "TABULUM - Emendas";

    const loadData = async () => {
      const storedEmendas = localStorage.getItem('tabulum_emendas_data');
      if (storedEmendas) setEmendas(JSON.parse(storedEmendas));
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

  const resetToFrontPage = () => {
    setCurrentView('list');
    setViewMode('table');
    setSearchTerm('');
    setFilterArticuladores([]);
    setFilterMunicipios([]);
    setFilterRegioes([]);
    setFilterTemas([]);
    setFilterSituacoes([]);
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
      const updatedEmendas = emendas.map(e => e['NÚMERO DA EMENDA'] === editingEmenda['NÚMERO DA EMENDA'] ? editingEmenda : e);
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
  }

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
    resetToFrontPage(); 
    if (type === 'articulador') setFilterArticuladores([value]);
    if (type === 'municipio') setFilterMunicipios([value]);
    if (type === 'regiao') setFilterRegioes([value]);
    if (type === 'tema') setFilterTemas([value]);
    if (type === 'situacao') setFilterSituacoes([value]);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedEmendas = useMemo(() => {
    let result = emendas.filter(e => {
      const matchesSearch = searchTerm === '' || JSON.stringify(e).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesArticulador = filterArticuladores.length === 0 || filterArticuladores.includes(e.ARTICULADOR);
      const matchesMunicipio = filterMunicipios.length === 0 || filterMunicipios.includes(e['MUNICÍPIO']);
      const matchesRegiao = filterRegioes.length === 0 || filterRegioes.includes(e.REGIÃO);
      const matchesTema = filterTemas.length === 0 || filterTemas.includes(e.TEMA);
      const matchesSituacao = filterSituacoes.length === 0 || filterSituacoes.includes(e.SITUAÇÃO);
      return matchesSearch && matchesArticulador && matchesMunicipio && matchesRegiao && matchesTema && matchesSituacao;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'TOTAL') {
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
  }, [emendas, searchTerm, filterArticuladores, filterMunicipios, filterRegioes, filterTemas, filterSituacoes, sortConfig]);

  const handleExportCSV = () => {
    if (!filteredAndSortedEmendas || filteredAndSortedEmendas.length === 0) {
      alert("Nenhum dado disponível para exportar.");
      return;
    }
    
    // Obter todas as chaves únicas possíveis do dataset para garantir colunas consistentes
    const headers = Array.from(new Set(filteredAndSortedEmendas.flatMap(Object.keys)));
    
    const csvRows = [];
    csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));
    
    filteredAndSortedEmendas.forEach(row => {
      const values = headers.map(header => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });
    
    const csvString = "\uFEFF" + csvRows.join('\n'); // Utiliza BOM para que o Excel leia UTF-8
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "emendas_filtradas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const MultiSelect = ({ id, label, options, selected, onChange }) => {
    const isOpen = openDropdown === id;
    
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
    else if (selected.length > 1) displayText = `${label}: ${selected.length} itens`;

    return (
      <div className="relative">
        <div onClick={handleToggleDropdown} 
             className="px-3 py-2 bg-white border-2 border-black focus:outline-none focus:border-blue-600 font-bold uppercase text-xs cursor-pointer flex justify-between items-center min-w-[160px] max-w-[200px]">
          <span className="truncate pr-2 text-black" title={displayText}>{displayText}</span>
          <div className="flex items-center space-x-1 flex-shrink-0">
             {selected.length > 0 && (
                 <div onClick={handleClear} className="hover:text-red-600 bg-gray-100 rounded p-0.5" title="Limpar filtro">
                     <XIcon className="w-3 h-3 text-black" />
                 </div>
             )}
             <ChevronDownIcon className="w-4 h-4 text-black" />
          </div>
        </div>
        {isOpen && (
          <div className="absolute z-30 top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto bg-white border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col p-2"
               onClick={(e) => e.stopPropagation()}>
             {options.map(opt => (
                 <label key={opt} className="flex items-center space-x-2 cursor-pointer hover:bg-yellow-100 p-1.5 transition-colors">
                     <input
                        type="checkbox"
                        className="accent-blue-600 w-4 h-4 border-2 border-black cursor-pointer"
                        checked={selected.includes(opt)}
                        onChange={(e) => handleToggleOption(e, opt)}
                     />
                     <span className="text-xs font-bold uppercase truncate flex-1 text-black">{opt}</span>
                 </label>
             ))}
          </div>
        )}
      </div>
    );
  };

  const FilterBar = () => {
    const hasFilters = searchTerm || filterArticuladores.length > 0 || filterMunicipios.length > 0 || filterRegioes.length > 0 || filterTemas.length > 0 || filterSituacoes.length > 0;
    
    return (
      <div className="bg-white p-4 border-4 border-black mb-4 flex flex-wrap gap-4 items-center shadow-[6px_6px_0_0_rgba(0,0,0,1)] print:hidden">
        <div className="flex-1 min-w-[150px] relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
          <input 
            type="text" 
            placeholder="Busca livre..." 
            className="w-full pl-10 pr-4 py-2 bg-white border-2 border-black rounded-none focus:outline-none focus:border-blue-600 font-medium text-black placeholder-gray-500"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <MultiSelect id="art" label="Articulador" options={articuladores} selected={filterArticuladores} onChange={setFilterArticuladores} />
        <MultiSelect id="mun" label="Município" options={municipios} selected={filterMunicipios} onChange={setFilterMunicipios} />
        <MultiSelect id="reg" label="Região" options={regioes} selected={filterRegioes} onChange={setFilterRegioes} />
        <MultiSelect id="tem" label="Tema" options={temas} selected={filterTemas} onChange={setFilterTemas} />
        <MultiSelect id="sit" label="Situação" options={situacoes} selected={filterSituacoes} onChange={setFilterSituacoes} />

        {hasFilters && (
          <button onClick={() => { setSearchTerm(''); setFilterArticuladores([]); setFilterMunicipios([]); setFilterRegioes([]); setFilterTemas([]); setFilterSituacoes([]); }}
            className="bg-red-600 p-2 text-white border-2 border-black hover:bg-red-700 transition-colors" title="Limpar todos os filtros">
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  };

  const Navbar = () => (
    <nav className="bg-white border-b-4 border-black sticky top-0 z-20 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer group" onClick={resetToFrontPage} title="Voltar ao Início">
            <img 
              src="https://raw.githubusercontent.com/killuixo/tabulum-sig-emendas/refs/heads/main/icon-192.png" 
              alt="Ícone TABULUM" 
              className="w-10 h-10 mr-3 object-contain transition-transform group-hover:scale-110"
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
            <span className="font-black text-2xl tracking-tighter text-black hidden sm:block">TABULUM - Emendas</span>
          </div>
          <div className="flex items-center space-x-3">
            {isAdmin ? (
              <>
                <div className="hidden md:flex items-center bg-blue-600 border-2 border-black px-3 py-1 text-sm font-bold text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  <UserIcon className="h-4 w-4 mr-2" /> ADMIN
                </div>
                <button onClick={() => setCurrentView('settings')} className="bg-yellow-400 border-2 border-black p-2 hover:bg-yellow-500 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none" title="Ajustes">
                  <SettingsIcon className="h-5 w-5 text-black" />
                </button>
                <button onClick={handleLogout} className="bg-red-600 border-2 border-black p-2 hover:bg-red-700 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none" title="Sair">
                  <LogOutIcon className="h-5 w-5 text-white" />
                </button>
              </>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex items-center bg-yellow-400 border-2 border-black px-4 py-2 font-black text-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-yellow-500 transition-transform active:translate-y-1 active:shadow-none">
                <LogInIcon className="h-4 w-4 mr-2" /> Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  const HeaderSwitcher = ({ title }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 print:hidden">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-black text-black uppercase tracking-tight">{title}</h1>
        <div className="flex border-2 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <button 
            onClick={() => setCurrentView('list')}
            className={`p-2 flex items-center font-bold uppercase text-xs border-r-2 border-black transition-colors ${currentView === 'list' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            <TableIcon className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Quadro</span>
          </button>
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`p-2 flex items-center font-bold uppercase text-xs transition-colors ${currentView === 'dashboard' ? 'bg-yellow-400 text-black' : 'hover:bg-gray-100'}`}
          >
            <LayoutDashboardIcon className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </div>
      {isAdmin && currentView === 'list' && (
        <button onClick={() => confirmAction("Sincronizar Planilha", "Deseja sincronizar com o Google Sheets? Isso atualizará seus dados locais com as versões mais recentes do Google.", syncWithGoogleSheet)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white font-bold uppercase border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-blue-700 transition-transform active:translate-y-1 active:shadow-none">
          <RefreshCwIcon className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Sincronizar</span>
        </button>
      )}
    </div>
  );

  const ListView = () => {
    const SortableHeader = ({ label, sortKey, extraClasses = "" }) => {
      const isActive = sortConfig?.key === sortKey;
      return (
        <th className={`py-3 text-left text-xs font-black text-black uppercase cursor-pointer hover:bg-yellow-400 transition-colors border-r-2 border-black print:border-black ${extraClasses}`}
            onClick={() => requestSort(sortKey)}>
          <div className="flex items-center space-x-1">
            <span>{label}</span>
            {isActive ? (
              sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronUpIcon className="w-4 h-4 opacity-20 print:hidden" />
            )}
          </div>
        </th>
      );
    };

    return (
      <div className="max-w-[95%] xl:max-w-[1400px] mx-auto px-4 py-8 animate-in fade-in print:w-full print:max-w-none print:m-0 print:p-0">
        <HeaderSwitcher title="Painel de Emendas" />
        <FilterBar />

        {/* Alternância Tabela/Cards e Botões de Exportação */}
        <div className="flex justify-between mb-4 items-center print:hidden">
          {/* Botões de Exportação (CSV / PDF) */}
          <div className="flex border-2 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <button 
              onClick={handleExportCSV}
              className="p-2 flex items-center font-bold uppercase text-xs border-r-2 border-black transition-colors hover:bg-yellow-400 text-black"
              title="Exportar Filtrados para CSV"
            >
              <DownloadIcon className="h-4 w-4" /> <span className="ml-2 hidden sm:inline">CSV</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="p-2 flex items-center font-bold uppercase text-xs transition-colors hover:bg-blue-600 hover:text-white text-black"
              title="Exportar para PDF / Imprimir"
            >
              <PrinterIcon className="h-4 w-4" /> <span className="ml-2 hidden sm:inline">PDF</span>
            </button>
          </div>

          {/* Toggle View Mode */}
          <div className="flex border-2 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 flex items-center font-bold uppercase text-xs border-r-2 border-black transition-colors ${viewMode === 'table' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              title="Visualização em Lista"
            >
              <ListIcon className="h-4 w-4" /> <span className="ml-2 hidden sm:inline">Lista</span>
            </button>
            <button 
              onClick={() => setViewMode('cards')}
              className={`p-2 flex items-center font-bold uppercase text-xs transition-colors ${viewMode === 'cards' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              title="Visualização em Cards"
            >
              <GridIcon className="h-4 w-4" /> <span className="ml-2 hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="bg-white border-4 border-black overflow-x-auto shadow-[8px_8px_0_0_rgba(0,0,0,1)] print:shadow-none print:border-2 print:overflow-visible print:w-full">
            <table className="min-w-[1000px] w-full border-collapse table-fixed print:min-w-0 print:w-full">
              <thead className="bg-yellow-400 border-b-4 border-black print:bg-yellow-400">
                <tr>
                  <SortableHeader label="Número" sortKey="NÚMERO DA EMENDA" extraClasses="w-[100px] px-3 print:w-[8%]" />
                  <SortableHeader label="Região" sortKey="REGIÃO" extraClasses="w-[120px] px-3 print:w-[12%]" />
                  <SortableHeader label="Município" sortKey="MUNICÍPIO" extraClasses="w-[150px] px-3 print:w-[15%]" />
                  <SortableHeader label="Objeto" sortKey="OBJETO" extraClasses="w-auto px-4 print:w-auto" />
                  <SortableHeader label="Articulador" sortKey="ARTICULADOR" extraClasses="w-[130px] px-3 print:w-[15%]" />
                  <SortableHeader label="Situação" sortKey="SITUAÇÃO" extraClasses="w-[110px] px-3 print:w-[10%]" />
                  <SortableHeader label="Total" sortKey="TOTAL" extraClasses="w-[140px] px-3 border-r-0 print:w-[15%]" />
                </tr>
              </thead>
              <tbody className="bg-white print:text-[10px]">
                {filteredAndSortedEmendas.map((emenda, idx) => (
                  <tr key={emenda['NÚMERO DA EMENDA'] || idx} onClick={() => { setSelectedEmenda(emenda); setCurrentView('detail'); }}
                    className="hover:bg-yellow-50 cursor-pointer border-b-2 border-black transition-colors h-full print:break-inside-avoid print:cursor-auto">
                    
                    <td className="px-3 py-2 text-sm print:text-[10px] font-bold text-black border-r-2 border-black truncate print:whitespace-normal">
                      {emenda['NÚMERO DA EMENDA']}
                    </td>
                    
                    <td className="px-3 py-2 text-xs print:text-[10px] font-bold uppercase text-black border-r-2 border-black truncate print:whitespace-normal" title={emenda.REGIÃO}>
                      {emenda.REGIÃO || '-'}
                    </td>

                    <td className="px-3 py-2 text-sm print:text-[10px] font-bold uppercase text-blue-600 border-r-2 border-black truncate print:whitespace-normal" title={emenda['MUNICÍPIO']}>
                      {emenda['MUNICÍPIO']}
                    </td>
                    
                    <td className="px-4 py-2 text-sm print:text-[10px] text-black font-medium border-r-2 border-black print:whitespace-normal print:break-words">
                      {emenda.OBJETO}
                    </td>
                    
                    <td className="px-3 py-2 text-sm print:text-[10px] font-bold text-red-600 border-r-2 border-black truncate print:whitespace-normal" title={emenda.ARTICULADOR}>
                      {emenda.ARTICULADOR || '-'}
                    </td>
                    
                    <td className="px-3 py-2 border-r-2 border-black align-middle">
                      <span className={`block w-full text-center border-2 border-black px-1 py-0.5 text-[10px] print:text-[8px] font-black uppercase truncate print:whitespace-normal
                        ${emenda.SITUAÇÃO?.toLowerCase().includes('pago') ? 'bg-blue-600 text-white print:bg-white print:text-black' : 
                          emenda.SITUAÇÃO?.toLowerCase().includes('pagar') ? 'bg-yellow-400 text-black print:bg-white print:text-black' : 'bg-white text-black'}`}
                        title={emenda.SITUAÇÃO}>
                        {emenda.SITUAÇÃO || 'Indefinida'}
                      </span>
                    </td>
                    
                    <td className="px-3 py-2 text-sm print:text-[10px] font-black text-black truncate print:whitespace-normal text-right border-r-0">
                      {formatCurrency(parseCurrency(emenda.TOTAL))}
                    </td>

                  </tr>
                ))}
                {filteredAndSortedEmendas.length === 0 && (
                  <tr><td colSpan="7" className="px-6 py-12 text-center font-bold text-gray-500 uppercase">Nenhuma emenda encontrada.</td></tr>
                )}
              </tbody>
            </table>
            <div className="bg-white px-6 py-3 font-bold text-sm text-black flex justify-between border-t-2 border-black print:hidden">
              <span>{filteredAndSortedEmendas.length} de {emendas.length} Registros</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
            {filteredAndSortedEmendas.map((emenda, idx) => (
              <div key={emenda['NÚMERO DA EMENDA'] || idx} 
                   className="border-4 border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] print:shadow-none flex flex-col hover:-translate-y-1 transition-transform cursor-pointer print:break-inside-avoid print:cursor-auto"
                   onClick={() => { setSelectedEmenda(emenda); setCurrentView('detail'); }}>
                <div className="bg-yellow-400 border-b-4 border-black p-3 flex justify-between items-center print:bg-yellow-400">
                  <span className="font-black text-black text-lg tracking-tighter print:text-sm">#{emenda['NÚMERO DA EMENDA']}</span>
                  <span className={`border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] print:shadow-none
                        ${emenda.SITUAÇÃO?.toLowerCase().includes('pago') ? 'bg-blue-600 text-white print:bg-white print:text-black' : 
                          emenda.SITUAÇÃO?.toLowerCase().includes('pagar') ? 'bg-white text-black' : 'bg-gray-100 text-black'}`}>
                    {emenda.SITUAÇÃO || 'Indefinida'}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col print:p-2">
                  <div className="flex flex-wrap gap-x-4 mb-2">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1 text-blue-600 print:text-black" />
                      <p className="text-blue-600 font-black uppercase text-sm print:text-black print:text-xs">{emenda['MUNICÍPIO']}</p>
                    </div>
                    {emenda.REGIÃO && (
                      <div className="flex items-center">
                        <MapIcon className="h-4 w-4 mr-1 text-black" />
                        <p className="text-black font-black uppercase text-xs">{emenda.REGIÃO}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-black line-clamp-4 flex-1 print:line-clamp-none print:text-xs">{emenda.OBJETO}</p>
                </div>
                <div className="bg-white border-t-4 border-black p-4 flex justify-between items-end print:p-2">
                  <div>
                    <p className="text-[10px] font-black uppercase text-black mb-1">Articulador</p>
                    <p className="text-red-600 font-bold text-sm uppercase truncate max-w-[120px] print:text-black print:text-xs">{emenda.ARTICULADOR || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-black mb-1">Total</p>
                    <p className="font-black text-black text-lg leading-none print:text-sm">{formatCurrency(parseCurrency(emenda.TOTAL))}</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredAndSortedEmendas.length === 0 && (
              <div className="col-span-full py-12 text-center font-bold text-black uppercase border-4 border-black border-dashed">
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
    
    const emendasPorAno = filteredAndSortedEmendas.reduce((acc, em) => {
      const ano = em.ANO || 'N/A';
      acc[ano] = (acc[ano] || 0) + parseCurrency(em.TOTAL);
      return acc;
    }, {});
    const timelineData = Object.keys(emendasPorAno).sort().map(ano => ({ ano, valor: emendasPorAno[ano] }));

    const emendasPorRegiao = filteredAndSortedEmendas.reduce((acc, em) => {
      const regiao = em.REGIÃO || 'N/A';
      acc[regiao] = (acc[regiao] || 0) + parseCurrency(em.TOTAL);
      return acc;
    }, {});
    const regiaoData = Object.keys(emendasPorRegiao).map(regiao => ({ regiao, valor: emendasPorRegiao[regiao] }))
      .sort((a, b) => b.valor - a.valor).slice(0, 5);

    const emendasPorMuni = useMemo(() => {
      const map = {};
      filteredAndSortedEmendas.forEach(em => {
        const mName = normalizeStr(em['MUNICÍPIO']);
        if(mName) map[mName] = (map[mName] || 0) + parseCurrency(em.TOTAL);
      });
      return map;
    }, [filteredAndSortedEmendas]);

    const getMuniColor = (val) => {
      if (!val || val === 0) return '#ffffff'; // Branco
      if (val < 300000) return '#facc15'; // Amarelo
      if (val < 800000) return '#2563eb'; // Azul
      return '#dc2626'; // Vermelho
    };

    const renderMap = () => {
      if (!mapGeoJson) return <div className="p-8 text-center font-bold">Carregando Mapa...</div>;

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
        <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full h-auto drop-shadow-md">
          {mapGeoJson.features.map((feature, i) => {
            const mName = normalizeStr(feature.properties.name);
            const val = emendasPorMuni[mName] || 0;
            return (
              <path 
                key={i} d={generatePath(feature.geometry)}
                fill={getMuniColor(val)} stroke="#000" strokeWidth="1"
                className="hover:stroke-[3px] transition-all cursor-crosshair relative"
                onMouseEnter={(e) => {
                  const rect = e.target.getBoundingClientRect();
                  setHoveredMuni({ name: feature.properties.name, val, x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredMuni(null)}
                onClick={() => { if(val > 0) { resetToFrontPage(); setFilterMunicipios([feature.properties.name]); } }}
              />
            );
          })}
        </svg>
      );
    };

    return (
      <div className="max-w-[95%] xl:max-w-[1400px] mx-auto px-4 py-8 animate-in fade-in print:w-full print:max-w-none print:m-0 print:p-0">
        <HeaderSwitcher title="Dashboard Estatístico" />
        <FilterBar />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-1 print:gap-4">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-yellow-400 border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] print:shadow-none flex flex-col justify-center">
              <p className="text-black font-black uppercase text-sm tracking-widest border-b-4 border-black pb-2 mb-4">Valor Total no Filtro</p>
              <h2 className="text-4xl xl:text-5xl font-black text-black break-words leading-none">
                {formatCurrency(totalGlobal)}
              </h2>
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] print:shadow-none">
              <p className="text-black font-black uppercase text-sm tracking-widest border-b-4 border-black pb-2 mb-6">Top Regiões</p>
              <div className="space-y-4">
                {regiaoData.length > 0 ? regiaoData.map((d, i) => {
                  const maxVal = Math.max(...regiaoData.map(r => r.valor));
                  const pct = Math.max((d.valor / maxVal) * 100, 5);
                  return (
                    <div key={d.regiao}>
                      <div className="flex justify-between text-xs font-bold uppercase mb-1">
                        <span>{d.regiao}</span>
                        <span>{formatCurrency(d.valor)}</span>
                      </div>
                      <div className="h-6 w-full bg-white border-2 border-black">
                        <div className="h-full bg-blue-600 border-r-2 border-black" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                }) : <p className="text-sm font-bold text-gray-500 uppercase">Sem dados.</p>}
              </div>
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] print:shadow-none">
              <p className="text-black font-black uppercase text-sm tracking-widest border-b-4 border-black pb-2 mb-6">Evolução Anual</p>
              <div className="flex items-end h-40 space-x-2 border-b-2 border-l-2 border-black p-2">
                {timelineData.length > 0 ? timelineData.map((d, i) => {
                  const maxVal = Math.max(...timelineData.map(r => r.valor));
                  const pct = Math.max((d.valor / maxVal) * 100, 5);
                  return (
                    <div key={d.ano} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black text-white text-[10px] font-bold px-2 py-1 pointer-events-none whitespace-nowrap z-10 print:opacity-100 print:relative print:-top-0 print:mb-1 print:bg-white print:text-black">
                        {formatCurrency(d.valor)}
                      </div>
                      <div className="w-full bg-red-600 border-2 border-black transition-all group-hover:bg-yellow-400" style={{ height: `${pct}%` }}></div>
                      <span className="text-[10px] font-black mt-2">{d.ano}</span>
                    </div>
                  );
                }) : <p className="text-sm font-bold text-gray-500 uppercase self-center w-full text-center">Sem dados.</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] print:shadow-none flex flex-col relative overflow-hidden print:break-before-page">
            <div className="bg-blue-600 border-b-4 border-black p-4 flex justify-between items-center z-10 print:bg-white print:border-b-2">
              <p className="text-white font-black uppercase tracking-widest flex items-center print:text-black">
                <MapPinIcon className="h-5 w-5 mr-2" /> Mapa de Santa Catarina
              </p>
              <div className="flex space-x-2 text-[10px] font-black uppercase text-white items-center print:text-black">
                <span>Legenda:</span>
                <div className="w-3 h-3 bg-yellow-400 border border-black"></div> <span>Baixo</span>
                <div className="w-3 h-3 bg-blue-600 border border-black ml-2"></div> <span>Médio</span>
                <div className="w-3 h-3 bg-red-600 border border-black ml-2"></div> <span>Alto</span>
              </div>
            </div>
            
            <div className="flex-1 p-2 bg-white relative">
              {renderMap()}
              
              {hoveredMuni && (
                <div className="fixed bg-white border-4 border-black p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px] print:hidden"
                     style={{ left: hoveredMuni.x, top: hoveredMuni.y }}>
                  <p className="font-black text-red-600 uppercase">{hoveredMuni.name}</p>
                  <p className="font-bold text-sm text-black">{hoveredMuni.val > 0 ? formatCurrency(hoveredMuni.val) : 'Nenhuma emenda'}</p>
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

    const InfoField = ({ label, field, icon: IconComponent, type = 'text', linkType = null, color = 'blue', isCurrency = false }) => {
      const rawValue = data[field];
      let displayValue = rawValue;
      
      if (!isEditing && isCurrency) {
        displayValue = formatCurrency(parseCurrency(rawValue));
      }

      const colorClass = color === 'blue' ? 'text-blue-600' : color === 'red' ? 'text-red-600' : 'text-yellow-600';
      
      if (isEditing) {
        return (
          <div className="mb-4">
            <label className={`block text-xs font-black uppercase mb-1 ${colorClass}`}>{label}</label>
            {type === 'textarea' ? (
              <textarea className="w-full p-2 bg-white border-2 border-black rounded-none focus:outline-none focus:border-red-600 font-medium text-black"
                rows="3" value={rawValue || ''} onChange={(e) => handleInputChange(field, e.target.value)} />
            ) : (
              <input type="text" className="w-full p-2 bg-white border-2 border-black rounded-none focus:outline-none focus:border-red-600 font-medium text-black"
                value={rawValue || ''} onChange={(e) => handleInputChange(field, e.target.value)} />
            )}
          </div>
        );
      }
      return (
        <div className="mb-4 bg-white p-3 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] print:shadow-none relative">
          <label className={`block text-xs font-black uppercase tracking-wider mb-1 flex items-center ${colorClass} print:text-black`}>
            {IconComponent && <IconComponent className="h-4 w-4 mr-1 print:hidden" />} {label}
          </label>
          <div className="text-black font-medium text-sm break-words">
            {displayValue || <span className="text-gray-400 italic">N/A</span>}
            {linkType && rawValue && (
               <button onClick={(e) => { e.stopPropagation(); handleEntityClick(linkType, rawValue); }} className="ml-2 text-[10px] bg-yellow-400 text-black border border-black px-1 uppercase font-bold hover:bg-yellow-500 print:hidden">
                 Filtrar
               </button>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-in slide-in-from-right-4 print:w-full print:max-w-none print:m-0 print:p-0">
        <button onClick={() => { setCurrentView('list'); setEditingEmenda(null); }}
          className="bg-black text-white px-4 py-2 font-bold uppercase text-xs border-2 border-black hover:bg-gray-800 mb-6 flex items-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] print:hidden">
          &larr; Voltar
        </button>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] print:shadow-none print:border-none">
          <div className="bg-red-600 border-b-4 border-black p-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 print:bg-white print:border-b-2">
            <div>
              <p className="text-white font-bold uppercase text-sm mb-1 tracking-wider print:text-black">Ficha de Emenda</p>
              <h2 className="text-4xl font-black text-white tracking-tighter print:text-black">Nº {data['NÚMERO DA EMENDA']}</h2>
            </div>
            {isAdmin && !isEditing && (
              <button onClick={() => { setEditingEmenda({ ...selectedEmenda }); setCurrentView('edit'); }}
                className="bg-yellow-400 text-black border-2 border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-yellow-500 transition-transform active:translate-y-1 active:shadow-none flex items-center print:hidden">
                <EditIcon className="h-5 w-5 mr-2" /> Editar Ficha
              </button>
            )}
            {isAdmin && isEditing && (
              <div className="flex space-x-3 print:hidden">
                <button onClick={() => setCurrentView('detail')}
                  className="bg-white text-black border-2 border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-gray-100 transition-transform active:translate-y-1 active:shadow-none flex items-center">
                  <XIcon className="h-5 w-5 mr-2" /> Cancelar
                </button>
                <button onClick={() => confirmAction("Salvar Alterações", "Confirmar alterações? A mudança será salva e sincronizada na nuvem.", handleSaveEmenda)}
                  className="bg-blue-600 text-white border-2 border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-blue-700 transition-transform active:translate-y-1 active:shadow-none flex items-center">
                  <SaveIcon className="h-5 w-5 mr-2" /> Salvar
                </button>
              </div>
            )}
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 print:p-0 print:mt-4">
            <div className="col-span-1 md:col-span-2">
              <InfoField label="Objeto / Descrição Principal" field="OBJETO" type="textarea" color="red" />
            </div>
            
            <div className="space-y-3 bg-white border-2 border-black p-4 print:border-none print:p-0">
              <div className="bg-black text-white font-black uppercase text-sm py-1 px-3 inline-block border-2 border-black -mt-8 mb-4 print:bg-white print:text-black print:border-b-2 print:border-t-0 print:border-l-0 print:border-r-0 print:-mt-0 print:mb-2 print:p-0">Identificação</div>
              <InfoField label="Município" field="MUNICÍPIO" icon={MapPinIcon} linkType="municipio" color="blue" />
              <InfoField label="Região" field="REGIÃO" icon={MapIcon} linkType="regiao" color="black" />
              <InfoField label="Tema" field="TEMA" icon={TagIcon} linkType="tema" color="blue" />
              <InfoField label="Articulador" field="ARTICULADOR" icon={UserIcon} linkType="articulador" color="red" />
              <InfoField label="Ano" field="ANO" color="black" />
            </div>

            <div className="space-y-3 bg-white border-2 border-black p-4 print:border-none print:p-0">
              <div className="bg-black text-white font-black uppercase text-sm py-1 px-3 inline-block border-2 border-black -mt-8 mb-4 print:bg-white print:text-black print:border-b-2 print:border-t-0 print:border-l-0 print:border-r-0 print:-mt-0 print:mb-2 print:p-0">Financeiro / Status</div>
              <InfoField label="Situação" field="SITUAÇÃO" linkType="situacao" color="red" />
              <InfoField label="Total Previsto" field="TOTAL" color="blue" isCurrency={true} />
              <InfoField label="Valor Pago" field="PAGO" color="blue" isCurrency={true} />
              <InfoField label="Esfera de Aplicação" field="ESFERA DE APLICAÇÃO" color="black" />
              <InfoField label="Unidade Orçamentária" field="UNIDADE ORÇAMENTÁRIA" color="black" />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-3 bg-white border-2 border-black p-4 mt-4 print:border-none print:p-0">
              <div className="bg-black text-white font-black uppercase text-sm py-1 px-3 inline-block border-2 border-black -mt-8 mb-4 print:bg-white print:text-black print:border-b-2 print:border-t-0 print:border-l-0 print:border-r-0 print:-mt-0 print:mb-2 print:p-0">Entidade / Liderança</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Liderança" field="LIDERANÇA" color="blue" />
                <InfoField label="Razão Social" field="RAZÃO SOCIAL" color="black" />
                <InfoField label="Telefone" field="TELEFONE DA LIDERANÇA" color="red" />
                <InfoField label="Email" field="EMAIL DA LIDERANÇA" color="black" />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-3 bg-yellow-400 border-2 border-black p-4 mt-4 print:bg-white print:border-none print:p-0">
              <div className="bg-white text-black font-black uppercase text-sm py-1 px-3 inline-block border-2 border-black -mt-8 mb-4 print:bg-white print:text-black print:border-b-2 print:border-t-0 print:border-l-0 print:border-r-0 print:-mt-0 print:mb-2 print:p-0">Dados Técnicos</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="SGPe" field="SGPe" color="black" />
                <InfoField label="Modalidade" field="MODALIDADE" color="black" />
                <InfoField label="Tipo" field="TIPO (IMPOSITIVA, BANCADA, PARLAMENTARES)" color="black" />
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
      <div className="max-w-2xl mx-auto px-4 py-8 animate-in fade-in print:hidden">
        <button onClick={() => setCurrentView('list')} className="bg-black text-white px-4 py-2 font-bold uppercase text-xs border-2 border-black hover:bg-gray-800 mb-6 flex items-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          &larr; Voltar
        </button>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          <div className="bg-blue-600 border-b-4 border-black p-6">
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center"><SettingsIcon className="mr-3 h-8 w-8" /> Configurações</h2>
          </div>
          <div className="p-8 space-y-8">
            <div className="bg-yellow-400 border-4 border-black text-black p-4 flex items-start shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <AlertTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
              <p className="text-sm font-bold">Modo de Segurança Máxima Ativado. A URL da planilha Google agora é gerenciada exclusivamente pelo Servidor (Backend).</p>
            </div>
            <div className="border-2 border-black p-6 bg-white">
              <h3 className="text-xl font-black uppercase text-blue-600 border-b-4 border-black pb-2 mb-4 flex items-center"><UploadCloudIcon className="h-6 w-6 mr-2" /> Importação CSV Manual</h3>
              <input type="file" accept=".csv" onChange={handleImportCSV} className="block w-full text-sm font-medium border-2 border-black p-2 bg-white file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-black file:uppercase file:bg-yellow-400 file:text-black hover:file:bg-yellow-500 cursor-pointer" />
            </div>
            <div className="border-2 border-black p-6 bg-white">
              <h3 className="text-xl font-black uppercase text-black border-b-4 border-black pb-2 mb-4 flex items-center">
                Segurança Local
              </h3>
              <div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <input type="text" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Nova senha administrativa..." className="flex-1 p-3 bg-white border-2 border-black rounded-none focus:outline-none focus:border-red-600 font-medium" />
                  <button onClick={() => {
                    if(newPass.length < 3) return alert("Mínimo de 3 caracteres.");
                    handleChangePassword(newPass);
                    setNewPass('');
                  }} className="bg-red-600 text-white font-black uppercase px-6 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-red-700 transition-transform active:translate-y-1 active:shadow-none whitespace-nowrap">
                    Atualizar Senha
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          <div className="flex space-x-2 justify-center mb-6">
            <div className="w-6 h-6 bg-red-600 border-2 border-black animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-6 h-6 bg-yellow-400 border-2 border-black animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-6 h-6 bg-blue-600 border-2 border-black animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
          <p className="text-black font-black uppercase tracking-widest">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-yellow-400 selection:text-black pb-12 print:pb-0">
      <Navbar />
      <main>
        {currentView === 'list' && <ListView />}
        {currentView === 'dashboard' && <DashboardView />}
        {(currentView === 'detail' || currentView === 'edit') && <DetailView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      {showLoginModal && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] p-8 w-full max-w-sm m-4 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 bg-white border-2 border-black p-1 hover:bg-red-600 hover:text-white transition-colors">
              <XIcon className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-black text-black uppercase mb-2 flex items-center tracking-tighter"><LogInIcon className="mr-3 h-8 w-8 text-red-600" /> Acesso</h3>
            <div className="w-16 h-2 bg-yellow-400 border-2 border-black mb-6"></div>
            <input type="password" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Senha" className="w-full p-4 bg-white border-4 border-black rounded-none focus:outline-none focus:border-blue-600 font-medium mb-6 text-black" />
            <button onClick={handleLogin} className="w-full bg-blue-600 text-white font-black uppercase py-4 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-blue-700 hover:-translate-y-1 transition-transform active:translate-y-1 active:shadow-none">Entrar</button>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] p-8 w-full max-w-md m-4 relative">
            <h3 className="text-2xl font-black text-black uppercase mb-4 tracking-tighter">{confirmModal.title}</h3>
            <p className="text-black font-medium mb-8 border-l-4 border-yellow-400 pl-4">{confirmModal.message}</p>
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
              <button onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })} className="px-6 py-3 bg-white text-black font-black uppercase border-4 border-black hover:bg-gray-100 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none text-center">Cancelar</button>
              <button onClick={confirmModal.onConfirm} className="px-6 py-3 bg-red-600 text-white font-black uppercase border-4 border-black hover:bg-red-700 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center justify-center"><CheckCircleIcon className="h-5 w-5 mr-2" /> Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
