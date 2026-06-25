import React, { useState, useEffect, useMemo } from 'react';

// --- ÍCONES SVG NATIVOS (Independentes de bibliotecas externas) ---
const Icon = ({ path, className = "w-6 h-6", onClick, size, style }) => (
  <svg onClick={onClick} style={{ width: size, height: size, ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
    {path}
  </svg>
);
const SearchIcon = (p) => <Icon {...p} path={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>} />;
const MapPinIcon = (p) => <Icon {...p} path={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>} />;
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
const LinkIcon = (p) => <Icon {...p} path={<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>} />;
const LayoutDashboardIcon = (p) => <Icon {...p} path={<><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></>} />;
const TableIcon = (p) => <Icon {...p} path={<><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></>} />;

// --- FUNÇÕES UTILITÁRIAS ---
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
  
  // Navegação e Estados de Tela
  const [currentView, setCurrentView] = useState('list'); // 'list', 'dashboard', 'detail', 'edit', 'settings'
  const [selectedEmenda, setSelectedEmenda] = useState(null);
  const [editingEmenda, setEditingEmenda] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArticulador, setFilterArticulador] = useState('');
  const [filterMunicipio, setFilterMunicipio] = useState('');
  const [filterTema, setFilterTema] = useState('');
  const [filterSituacao, setFilterSituacao] = useState('');

  // Modais
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Listas Únicas para os Filtros
  const articuladores = useMemo(() => [...new Set(emendas.map(e => e.ARTICULADOR).filter(Boolean))].sort(), [emendas]);
  const municipios = useMemo(() => [...new Set(emendas.map(e => e['MUNICÍPIO']).filter(Boolean))].sort(), [emendas]);
  const temas = useMemo(() => [...new Set(emendas.map(e => e.TEMA).filter(Boolean))].sort(), [emendas]);
  const situacoes = useMemo(() => [...new Set(emendas.map(e => e.SITUAÇÃO).filter(Boolean))].sort(), [emendas]);

  // --- EFEITOS: INICIALIZAÇÃO UNIVERSAL (Padrão TABULUM MAIN) ---
  useEffect(() => {
    const loadData = async () => {
      // 1. Tenta carregar dados locais para visualização instantânea
      const storedEmendas = localStorage.getItem('tabulum_emendas_data');
      if (storedEmendas) setEmendas(JSON.parse(storedEmendas));

      const storedAuth = sessionStorage.getItem('tabulum_emendas_auth');
      if (storedAuth === 'true') setIsAdmin(true);

      const storedPass = localStorage.getItem('tabulum_emendas_pass');
      if (storedPass) setAdminPassword(storedPass);

      // 2. Busca dados atualizados do Proxy Seguro no Backend (Vercel)
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

    // Carregar o GeoJSON de SC para o mapa
    fetch('https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-42-mun.json')
      .then(res => res.json())
      .then(data => setMapGeoJson(data))
      .catch(err => console.error("Erro ao carregar mapa:", err));
  }, []); // Dependência vazia, roda apenas na inicialização

  // --- FUNÇÕES DE DADOS E AÇÕES ---
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
      // Usa a rota segura do servidor interno
      const response = await fetch('/api/emendas');
      if (!response.ok) throw new Error("Falha ao carregar do servidor interno.");
      
      const newData = await response.json();
      if (newData && newData.length > 0) {
        saveEmendasLocally(newData);
        alert("Sincronização concluída com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao sincronizar com proxy interno:", error);
      alert("Erro ao sincronizar. Verifique se as variáveis de ambiente estão configuradas no Vercel.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmenda = async () => {
    if (!editingEmenda) return;
    try {
      // Salva localmente
      const updatedEmendas = emendas.map(e => e['NÚMERO DA EMENDA'] === editingEmenda['NÚMERO DA EMENDA'] ? editingEmenda : e);
      if (!emendas.some(e => e['NÚMERO DA EMENDA'] === editingEmenda['NÚMERO DA EMENDA'])) {
         updatedEmendas.push(editingEmenda);
      }
      
      saveEmendasLocally(updatedEmendas);
      setSelectedEmenda(editingEmenda);
      setEditingEmenda(null);
      setCurrentView('detail');

      // Tenta salvar na Planilha usando o Proxy Interno Seguro
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
      sessionStorage.setItem('tabulum_emendas_auth', 'true'); // Mantém logado na sessão da aba
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
    setCurrentView('list');
    setSearchTerm('');
    if (type === 'articulador') setFilterArticulador(value);
    if (type === 'municipio') setFilterMunicipio(value);
    if (type === 'tema') setFilterTema(value);
    if (type === 'situacao') setFilterSituacao(value);
  };

  // --- DADOS FILTRADOS PARA LISTA E DASHBOARD ---
  const filteredEmendas = useMemo(() => {
    return emendas.filter(e => {
      const matchesSearch = searchTerm === '' || JSON.stringify(e).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesArticulador = filterArticulador === '' || e.ARTICULADOR === filterArticulador;
      const matchesMunicipio = filterMunicipio === '' || e['MUNICÍPIO'] === filterMunicipio;
      const matchesTema = filterTema === '' || e.TEMA === filterTema;
      const matchesSituacao = filterSituacao === '' || e.SITUAÇÃO === filterSituacao;
      
      return matchesSearch && matchesArticulador && matchesMunicipio && matchesTema && matchesSituacao;
    });
  }, [emendas, searchTerm, filterArticulador, filterMunicipio, filterTema, filterSituacao]);

  // --- COMPONENTES COMPARTILHADOS ---

  const FilterBar = () => (
    <div className="bg-white p-4 border-4 border-black mb-8 flex flex-wrap gap-4 items-center shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
      <div className="flex-1 min-w-[150px] relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Busca livre..." 
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-black rounded-none focus:outline-none focus:border-rose-700 font-medium"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <select className="px-3 py-2 bg-gray-50 border-2 border-black rounded-none focus:outline-none focus:border-rose-700 font-bold uppercase text-xs cursor-pointer"
        value={filterArticulador} onChange={(e) => setFilterArticulador(e.target.value)}>
        <option value="">Articulador: Todos</option>
        {articuladores.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      <select className="px-3 py-2 bg-gray-50 border-2 border-black rounded-none focus:outline-none focus:border-rose-700 font-bold uppercase text-xs cursor-pointer max-w-[180px] truncate"
        value={filterMunicipio} onChange={(e) => setFilterMunicipio(e.target.value)}>
        <option value="">Município: Todos</option>
        {municipios.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <select className="px-3 py-2 bg-gray-50 border-2 border-black rounded-none focus:outline-none focus:border-rose-700 font-bold uppercase text-xs cursor-pointer max-w-[150px] truncate"
        value={filterTema} onChange={(e) => setFilterTema(e.target.value)}>
        <option value="">Tema: Todos</option>
        {temas.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <select className="px-3 py-2 bg-gray-50 border-2 border-black rounded-none focus:outline-none focus:border-rose-700 font-bold uppercase text-xs cursor-pointer"
        value={filterSituacao} onChange={(e) => setFilterSituacao(e.target.value)}>
        <option value="">Situação: Todas</option>
        {situacoes.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      {(searchTerm || filterArticulador || filterMunicipio || filterTema || filterSituacao) && (
        <button onClick={() => { setSearchTerm(''); setFilterArticulador(''); setFilterMunicipio(''); setFilterTema(''); setFilterSituacao(''); }}
          className="bg-rose-700 p-2 text-white border-2 border-black hover:bg-rose-800 transition-colors" title="Limpar filtros">
          <XIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  const Navbar = () => (
    <nav className="bg-white border-b-4 border-black sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => setCurrentView('list')}>
            <div className="bg-rose-700 w-10 h-10 border-2 border-black flex items-center justify-center mr-3 group-hover:bg-amber-400 transition-colors">
              <MapPinIcon className="h-6 w-6 text-white group-hover:text-black" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase text-black hidden sm:block">TABULUM - EMENDAS</span>
          </div>
          <div className="flex items-center space-x-3">
            {isAdmin ? (
              <>
                <div className="hidden md:flex items-center bg-teal-600 border-2 border-black px-3 py-1 text-sm font-bold text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  <UserIcon className="h-4 w-4 mr-2" /> ADMIN
                </div>
                <button onClick={() => setCurrentView('settings')} className="bg-amber-400 border-2 border-black p-2 hover:bg-amber-500 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none" title="Ajustes">
                  <SettingsIcon className="h-5 w-5 text-black" />
                </button>
                <button onClick={handleLogout} className="bg-rose-700 border-2 border-black p-2 hover:bg-rose-800 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none" title="Sair">
                  <LogOutIcon className="h-5 w-5 text-white" />
                </button>
              </>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex items-center bg-amber-400 border-2 border-black px-4 py-2 font-black text-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-amber-500 transition-transform active:translate-y-1 active:shadow-none">
                <LogInIcon className="h-4 w-4 mr-2" /> Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  const HeaderSwitcher = ({ title }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
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
            className={`p-2 flex items-center font-bold uppercase text-xs transition-colors ${currentView === 'dashboard' ? 'bg-amber-400 text-black' : 'hover:bg-gray-100'}`}
          >
            <LayoutDashboardIcon className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </div>
      {isAdmin && currentView === 'list' && (
        <button onClick={() => confirmAction("Sincronizar Planilha", "Deseja sincronizar com o Google Sheets? Isso atualizará seus dados locais com as versões mais recentes do Google.", syncWithGoogleSheet)}
          className="flex items-center px-4 py-2 bg-teal-600 text-white font-bold uppercase border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-teal-700 transition-transform active:translate-y-1 active:shadow-none">
          <RefreshCwIcon className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Sincronizar</span>
        </button>
      )}
    </div>
  );

  // --- VIEWS ---

  const ListView = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <HeaderSwitcher title="Painel de Emendas" />
      <FilterBar />

      <div className="bg-white border-4 border-black overflow-x-auto shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <table className="min-w-full border-collapse">
          <thead className="bg-amber-400 border-b-4 border-black">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-black text-black uppercase border-r-2 border-black">Número</th>
              <th className="px-4 py-3 text-left text-xs font-black text-black uppercase border-r-2 border-black">Município</th>
              <th className="px-4 py-3 text-left text-xs font-black text-black uppercase border-r-2 border-black">Objeto</th>
              <th className="px-4 py-3 text-left text-xs font-black text-black uppercase border-r-2 border-black">Articulador</th>
              <th className="px-4 py-3 text-left text-xs font-black text-black uppercase border-r-2 border-black">Situação</th>
              <th className="px-4 py-3 text-left text-xs font-black text-black uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredEmendas.map((emenda, idx) => (
              <tr key={emenda['NÚMERO DA EMENDA'] || idx} onClick={() => { setSelectedEmenda(emenda); setCurrentView('detail'); }}
                className="hover:bg-amber-50 cursor-pointer border-b-2 border-black transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-black border-r-2 border-gray-200">{emenda['NÚMERO DA EMENDA']}</td>
                <td className="px-4 py-3 whitespace-nowrap border-r-2 border-gray-200">
                  <span className="inline-block bg-teal-200 text-teal-900 border-2 border-black px-2 py-0.5 text-xs font-bold uppercase">{emenda['MUNICÍPIO']}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 font-medium max-w-[200px] truncate border-r-2 border-gray-200" title={emenda.OBJETO}>{emenda.OBJETO}</td>
                <td className="px-4 py-3 whitespace-nowrap border-r-2 border-gray-200">
                  <span className="text-sm font-bold text-rose-700">{emenda.ARTICULADOR || '-'}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap border-r-2 border-gray-200">
                  <span className={`inline-block border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase
                    ${emenda.SITUAÇÃO?.toLowerCase().includes('pago') ? 'bg-teal-600 text-white' : 
                      emenda.SITUAÇÃO?.toLowerCase().includes('pagar') ? 'bg-amber-400 text-black' : 'bg-gray-200 text-black'}`}>
                    {emenda.SITUAÇÃO || 'Indefinida'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-black text-black">{emenda.TOTAL}</td>
              </tr>
            ))}
            {filteredEmendas.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-12 text-center font-bold text-gray-500 uppercase">Nenhuma emenda encontrada.</td></tr>
            )}
          </tbody>
        </table>
        <div className="bg-gray-100 px-6 py-3 font-bold text-sm text-black flex justify-between">
          <span>{filteredEmendas.length} de {emendas.length} Registros</span>
        </div>
      </div>
    </div>
  );

  const DashboardView = () => {
    const [hoveredMuni, setHoveredMuni] = useState(null);

    // --- CÁLCULOS DO DASHBOARD ---
    const totalGlobal = filteredEmendas.reduce((acc, em) => acc + parseCurrency(em.TOTAL), 0);
    
    // Agrupamento por Ano
    const emendasPorAno = filteredEmendas.reduce((acc, em) => {
      const ano = em.ANO || 'N/A';
      acc[ano] = (acc[ano] || 0) + parseCurrency(em.TOTAL);
      return acc;
    }, {});
    const timelineData = Object.keys(emendasPorAno).sort().map(ano => ({ ano, valor: emendasPorAno[ano] }));

    // Agrupamento por Região
    const emendasPorRegiao = filteredEmendas.reduce((acc, em) => {
      const regiao = em.REGIÃO || 'N/A';
      acc[regiao] = (acc[regiao] || 0) + parseCurrency(em.TOTAL);
      return acc;
    }, {});
    const regiaoData = Object.keys(emendasPorRegiao).map(regiao => ({ regiao, valor: emendasPorRegiao[regiao] }))
      .sort((a, b) => b.valor - a.valor).slice(0, 5); // Top 5

    // Agrupamento por Município para o Mapa
    const emendasPorMuni = useMemo(() => {
      const map = {};
      filteredEmendas.forEach(em => {
        const mName = normalizeStr(em['MUNICÍPIO']);
        if(mName) map[mName] = (map[mName] || 0) + parseCurrency(em.TOTAL);
      });
      return map;
    }, [filteredEmendas]);

    // Função de cor do mapa (Gradiente Discreto Mondrian)
    const getMuniColor = (val) => {
      if (!val || val === 0) return '#f9fafb'; // Cinza muito claro (quase branco)
      if (val < 200000) return '#fcd34d'; // Amber leve
      if (val < 500000) return '#fbbf24'; // Amber forte
      if (val < 1000000) return '#0d9488'; // Teal
      return '#be123c'; // Rose
    };

    // Renderização do Mapa de SC
    const renderMap = () => {
      if (!mapGeoJson) return <div className="p-8 text-center font-bold">Carregando Mapa...</div>;

      // Calcular limites do mapa para projeção simples
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
      const scale = Math.min(scaleX, scaleY) * 0.95; // 5% margin
      
      const offsetX = (mapWidth - (maxX - minX) * scale) / 2;
      const offsetY = (mapHeight - (maxY - minY) * scale) / 2;

      const project = (coord) => {
        const x = (coord[0] - minX) * scale + offsetX;
        const y = mapHeight - ((coord[1] - minY) * scale) - offsetY; // Inverter Y
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
                className="hover:stroke-[3px] hover:fill-amber-300 transition-all cursor-crosshair relative"
                onMouseEnter={(e) => {
                  const rect = e.target.getBoundingClientRect();
                  setHoveredMuni({ name: feature.properties.name, val, x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredMuni(null)}
                onClick={() => { if(val > 0) { setCurrentView('list'); setFilterMunicipio(feature.properties.name); } }}
              />
            );
          })}
        </svg>
      );
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
        <HeaderSwitcher title="Dashboard Estatístico" />
        <FilterBar />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUNA ESQUERDA: KPIs e Gráficos */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* KPI TOTAL */}
            <div className="bg-amber-400 border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col justify-center">
              <p className="text-black font-black uppercase text-sm tracking-widest border-b-4 border-black pb-2 mb-4">Valor Total no Filtro</p>
              <h2 className="text-4xl xl:text-5xl font-black text-black break-words leading-none">
                {formatCurrency(totalGlobal)}
              </h2>
            </div>

            {/* GRÁFICO BARRAS: REGIÃO */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
              <p className="text-black font-black uppercase text-sm tracking-widest border-b-4 border-black pb-2 mb-6">Top Regiões</p>
              <div className="space-y-4">
                {regiaoData.length > 0 ? regiaoData.map((d, i) => {
                  const maxVal = Math.max(...regiaoData.map(r => r.valor));
                  const pct = Math.max((d.valor / maxVal) * 100, 5); // min 5% width
                  return (
                    <div key={d.regiao}>
                      <div className="flex justify-between text-xs font-bold uppercase mb-1">
                        <span>{d.regiao}</span>
                        <span>{formatCurrency(d.valor)}</span>
                      </div>
                      <div className="h-6 w-full bg-gray-200 border-2 border-black">
                        <div className="h-full bg-teal-600 border-r-2 border-black" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                }) : <p className="text-sm font-bold text-gray-500 uppercase">Sem dados.</p>}
              </div>
            </div>

            {/* GRÁFICO LINHAS (Barras verticais): ANO */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
              <p className="text-black font-black uppercase text-sm tracking-widest border-b-4 border-black pb-2 mb-6">Evolução Anual</p>
              <div className="flex items-end h-40 space-x-2 border-b-2 border-l-2 border-black p-2">
                {timelineData.length > 0 ? timelineData.map((d, i) => {
                  const maxVal = Math.max(...timelineData.map(r => r.valor));
                  const pct = Math.max((d.valor / maxVal) * 100, 5);
                  return (
                    <div key={d.ano} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black text-white text-[10px] font-bold px-2 py-1 pointer-events-none whitespace-nowrap z-10">
                        {formatCurrency(d.valor)}
                      </div>
                      <div className="w-full bg-rose-700 border-2 border-black transition-all group-hover:bg-amber-400" style={{ height: `${pct}%` }}></div>
                      <span className="text-[10px] font-black mt-2">{d.ano}</span>
                    </div>
                  );
                }) : <p className="text-sm font-bold text-gray-500 uppercase self-center w-full text-center">Sem dados.</p>}
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA: MAPA */}
          <div className="lg:col-span-2 bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col relative overflow-hidden">
            <div className="bg-teal-600 border-b-4 border-black p-4 flex justify-between items-center z-10">
              <p className="text-white font-black uppercase tracking-widest flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" /> Mapa de Santa Catarina
              </p>
              <div className="flex space-x-2 text-[10px] font-black uppercase text-white items-center">
                <span>Legenda:</span>
                <div className="w-3 h-3 bg-amber-400 border border-black"></div> <span>Baixo</span>
                <div className="w-3 h-3 bg-teal-600 border border-black ml-2"></div> <span>Médio</span>
                <div className="w-3 h-3 bg-rose-700 border border-black ml-2"></div> <span>Alto</span>
              </div>
            </div>
            
            <div className="flex-1 p-2 bg-[#f4f4f0] relative">
              {renderMap()}
              
              {hoveredMuni && (
                <div className="fixed bg-white border-4 border-black p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px]"
                     style={{ left: hoveredMuni.x, top: hoveredMuni.y }}>
                  <p className="font-black text-rose-700 uppercase">{hoveredMuni.name}</p>
                  <p className="font-bold text-sm">{hoveredMuni.val > 0 ? formatCurrency(hoveredMuni.val) : 'Nenhuma emenda'}</p>
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

    const InfoField = ({ label, field, icon: IconComponent, type = 'text', linkType = null, color = 'teal' }) => {
      const value = data[field];
      const colorClass = color === 'teal' ? 'text-teal-700' : color === 'rose' ? 'text-rose-700' : 'text-amber-600';
      
      if (isEditing) {
        return (
          <div className="mb-4">
            <label className={`block text-xs font-black uppercase mb-1 ${colorClass}`}>{label}</label>
            {type === 'textarea' ? (
              <textarea className="w-full p-2 bg-gray-50 border-2 border-black rounded-none focus:outline-none focus:border-rose-700 font-medium"
                rows="3" value={value || ''} onChange={(e) => handleInputChange(field, e.target.value)} />
            ) : (
              <input type="text" className="w-full p-2 bg-gray-50 border-2 border-black rounded-none focus:outline-none focus:border-rose-700 font-medium"
                value={value || ''} onChange={(e) => handleInputChange(field, e.target.value)} />
            )}
          </div>
        );
      }
      return (
        <div className="mb-4 bg-white p-3 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] relative">
          <label className={`block text-xs font-black uppercase tracking-wider mb-1 flex items-center ${colorClass}`}>
            {IconComponent && <IconComponent className="h-4 w-4 mr-1" />} {label}
          </label>
          <div className="text-black font-medium text-sm">
            {value || <span className="text-gray-400 italic">N/A</span>}
            {linkType && value && (
               <button onClick={() => handleEntityClick(linkType, value)} className="ml-2 text-[10px] bg-amber-400 text-black border border-black px-1 uppercase font-bold hover:bg-amber-500">
                 Filtrar
               </button>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-in slide-in-from-right-4">
        <button onClick={() => { setCurrentView('list'); setEditingEmenda(null); }}
          className="bg-black text-white px-4 py-2 font-bold uppercase text-xs border-2 border-black hover:bg-gray-800 mb-6 flex items-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          &larr; Voltar
        </button>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          <div className="bg-rose-700 border-b-4 border-black p-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <p className="text-white font-bold uppercase text-sm mb-1 tracking-wider">Ficha de Emenda</p>
              <h2 className="text-4xl font-black text-white tracking-tighter">Nº {data['NÚMERO DA EMENDA']}</h2>
            </div>
            {isAdmin && !isEditing && (
              <button onClick={() => { setEditingEmenda({ ...selectedEmenda }); setCurrentView('edit'); }}
                className="bg-amber-400 text-black border-2 border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-amber-500 transition-transform active:translate-y-1 active:shadow-none flex items-center">
                <EditIcon className="h-5 w-5 mr-2" /> Editar Ficha
              </button>
            )}
            {isAdmin && isEditing && (
              <div className="flex space-x-3">
                <button onClick={() => setCurrentView('detail')}
                  className="bg-white text-black border-2 border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-gray-100 transition-transform active:translate-y-1 active:shadow-none flex items-center">
                  <XIcon className="h-5 w-5 mr-2" /> Cancelar
                </button>
                <button onClick={() => confirmAction("Salvar Alterações", "Confirmar alterações? A mudança será salva e sincronizada na nuvem.", handleSaveEmenda)}
                  className="bg-teal-500 text-black border-2 border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-teal-600 transition-transform active:translate-y-1 active:shadow-none flex items-center">
                  <SaveIcon className="h-5 w-5 mr-2" /> Salvar
                </button>
              </div>
            )}
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="col-span-1 md:col-span-2">
              <InfoField label="Objeto / Descrição Principal" field="OBJETO" type="textarea" color="rose" />
            </div>
            
            <div className="space-y-3 bg-gray-50 border-2 border-black p-4">
              <div className="bg-black text-white font-black uppercase text-sm py-1 px-3 inline-block border-2 border-black -mt-8 mb-4">Identificação</div>
              <InfoField label="Município" field="MUNICÍPIO" icon={MapPinIcon} linkType="municipio" color="teal" />
              <InfoField label="Região" field="REGIÃO" />
              <InfoField label="Tema" field="TEMA" icon={TagIcon} linkType="tema" color="teal" />
              <InfoField label="Articulador" field="ARTICULADOR" icon={UserIcon} linkType="articulador" color="rose" />
              <InfoField label="Ano" field="ANO" />
            </div>

            <div className="space-y-3 bg-gray-50 border-2 border-black p-4">
              <div className="bg-black text-white font-black uppercase text-sm py-1 px-3 inline-block border-2 border-black -mt-8 mb-4">Financeiro / Status</div>
              <InfoField label="Situação" field="SITUAÇÃO" linkType="situacao" color="rose" />
              <InfoField label="Total Previsto" field="TOTAL" color="teal" />
              <InfoField label="Valor Pago" field="PAGO" color="teal" />
              <InfoField label="Esfera de Aplicação" field="ESFERA DE APLICAÇÃO" />
              <InfoField label="Unidade Orçamentária" field="UNIDADE ORÇAMENTÁRIA" />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-3 bg-gray-50 border-2 border-black p-4 mt-4">
              <div className="bg-black text-white font-black uppercase text-sm py-1 px-3 inline-block border-2 border-black -mt-8 mb-4">Entidade / Liderança</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Liderança" field="LIDERANÇA" color="teal" />
                <InfoField label="Razão Social" field="RAZÃO SOCIAL" />
                <InfoField label="Telefone" field="TELEFONE DA LIDERANÇA" color="rose" />
                <InfoField label="Email" field="EMAIL DA LIDERANÇA" />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-3 bg-amber-50 border-2 border-black p-4 mt-4">
              <div className="bg-amber-400 text-black font-black uppercase text-sm py-1 px-3 inline-block border-2 border-black -mt-8 mb-4">Dados Técnicos</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="SGPe" field="SGPe" />
                <InfoField label="Modalidade" field="MODALIDADE" />
                <InfoField label="Tipo" field="TIPO (IMPOSITIVA, BANCADA, PARLAMENTARES)" />
              </div>
              <InfoField label="Entrega Realizada" field="ENTREGA" type="textarea" />
              <InfoField label="Justificativa" field="JUSTIFICATIVA" type="textarea" />
              <InfoField label="Observações Livres" field="Observação" type="textarea" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    const [newPass, setNewPass] = useState('');

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-in fade-in">
        <button onClick={() => setCurrentView('list')} className="bg-black text-white px-4 py-2 font-bold uppercase text-xs border-2 border-black hover:bg-gray-800 mb-6 flex items-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          &larr; Voltar
        </button>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          <div className="bg-teal-600 border-b-4 border-black p-6">
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center"><SettingsIcon className="mr-3 h-8 w-8" /> Configurações</h2>
          </div>
          <div className="p-8 space-y-8">
            <div className="bg-amber-400 border-4 border-black text-black p-4 flex items-start shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <AlertTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
              <p className="text-sm font-bold">Modo de Segurança Máxima Ativado. A URL da planilha Google agora é gerenciada exclusivamente pelo Servidor (Backend). Você não precisa mais configurá-la aqui.</p>
            </div>
            <div className="border-2 border-black p-6 bg-gray-50">
              <h3 className="text-xl font-black uppercase text-teal-700 border-b-4 border-black pb-2 mb-4 flex items-center"><UploadCloudIcon className="h-6 w-6 mr-2" /> Importação CSV Manual</h3>
              <input type="file" accept=".csv" onChange={handleImportCSV} className="block w-full text-sm font-medium border-2 border-black p-2 bg-white file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-black file:uppercase file:bg-amber-400 file:text-black hover:file:bg-amber-500 cursor-pointer" />
            </div>
            <div className="border-2 border-black p-6 bg-gray-50">
              <h3 className="text-xl font-black uppercase text-black border-b-4 border-black pb-2 mb-4 flex items-center">
                Segurança Local
              </h3>
              <div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <input type="text" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Nova senha administrativa..." className="flex-1 p-3 bg-white border-2 border-black rounded-none focus:outline-none focus:border-rose-700 font-medium" />
                  <button onClick={() => {
                    if(newPass.length < 3) return alert("Mínimo de 3 caracteres.");
                    handleChangePassword(newPass);
                    setNewPass('');
                  }} className="bg-rose-700 text-white font-black uppercase px-6 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-rose-800 transition-transform active:translate-y-1 active:shadow-none whitespace-nowrap">
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
      <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center">
        <div className="text-center p-8 bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          <div className="flex space-x-2 justify-center mb-6">
            <div className="w-6 h-6 bg-rose-700 border-2 border-black animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-6 h-6 bg-amber-400 border-2 border-black animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-6 h-6 bg-teal-600 border-2 border-black animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
          <p className="text-black font-black uppercase tracking-widest">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-sans text-gray-900 selection:bg-amber-400 selection:text-black pb-12">
      <Navbar />
      <main>
        {currentView === 'list' && <ListView />}
        {currentView === 'dashboard' && <DashboardView />}
        {(currentView === 'detail' || currentView === 'edit') && <DetailView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      {/* MODAL DE LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] p-8 w-full max-w-sm m-4 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 bg-white border-2 border-black p-1 hover:bg-rose-700 hover:text-white transition-colors">
              <XIcon className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-black text-black uppercase mb-2 flex items-center tracking-tighter"><LogInIcon className="mr-3 h-8 w-8 text-rose-700" /> Acesso</h3>
            <div className="w-16 h-2 bg-amber-400 border-2 border-black mb-6"></div>
            <input type="password" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Senha" className="w-full p-4 bg-gray-50 border-4 border-black rounded-none focus:outline-none focus:border-teal-600 font-medium mb-6" />
            <button onClick={handleLogin} className="w-full bg-teal-600 text-white font-black uppercase py-4 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-teal-700 hover:-translate-y-1 transition-transform active:translate-y-1 active:shadow-none">Entrar</button>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] p-8 w-full max-w-md m-4 relative">
            <h3 className="text-2xl font-black text-black uppercase mb-4 tracking-tighter">{confirmModal.title}</h3>
            <p className="text-black font-medium mb-8 border-l-4 border-amber-400 pl-4">{confirmModal.message}</p>
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
              <button onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })} className="px-6 py-3 bg-white text-black font-black uppercase border-4 border-black hover:bg-gray-100 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none text-center">Cancelar</button>
              <button onClick={confirmModal.onConfirm} className="px-6 py-3 bg-rose-700 text-white font-black uppercase border-4 border-black hover:bg-rose-800 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none flex items-center justify-center"><CheckCircleIcon className="h-5 w-5 mr-2" /> Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
