import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Home, BarChart2, TrendingUp, Users, Map, Sun, Moon, Download, Filter, X, ChevronDown, CheckCircle } from 'lucide-react';

// =========================================================================
// 1. DADOS MOCKADOS E CONSTANTES
// =========================================================================

// Simulação dos dados extraídos do relatório GCM/MOVAM-SE 2023 (gcm_bahia_data.json)
// Os dados de ocorrências são MOCKADOS, pois o PDF não detalha as ocorrências por tipologia e mês.
const mockData = {
  // Resumo Executivo (Dados do Relatório)
  kpis: {
    totalGuardas: 9816,
    totalMunicipiosGCM: 268,
    percentualComCorregedoria: 25.8,
    percentualComPlanoCargos: 25.8,
    percentualComPorteArma: 4.8, // Baseado em 268 municípios (13/268)
    percentualFeminino: 10,
    municipioMelhorIndice: "Santa Cruz da Vitória", // 1/180 hab
    municipioPiorIndice: "Inhambupe", // 1/33.771 hab
  },
  
  // Dados simulados para Tabela e Gráficos
  tableData: [
    { id: 1, mes: 'Janeiro', ano: 2023, municipio: 'Salvador', tipologia: 'Furto', guardasEnvolvidos: 12, valorSalarioSM: 2.5,  guardasFeminino: 3,  efetivoTotal: 1375, indiceHabitante: 1899 },
    { id: 2, mes: 'Fevereiro', ano: 2023, municipio: 'Feira de Santana', tipologia: 'Violência Doméstica', guardasEnvolvidos: 8, valorSalarioSM: 1.5, guardasFeminino: 66, efetivoTotal: 218, indiceHabitante: 2994 },
    { id: 3, mes: 'Março', ano: 2023, municipio: 'Vitória da Conquista', tipologia: 'Atendimento Social', guardasEnvolvidos: 5, valorSalarioSM: 1.0, guardasFeminino: 10, efetivoTotal: 197, indiceHabitante: 1967 },
    { id: 4, mes: 'Abril', ano: 2023, municipio: 'Salvador', tipologia: 'Furto', guardasEnvolvidos: 10, valorSalarioSM: 2.5, guardasFeminino: 3, efetivoTotal: 1375, indiceHabitante: 1899 },
    { id: 5, mes: 'Maio', ano: 2023, municipio: 'Vitória da Conquista', tipologia: 'Violência Doméstica', guardasEnvolvidos: 7, valorSalarioSM: 1.0, guardasFeminino: 10, efetivoTotal: 197, indiceHabitante: 1967 },
    { id: 6, mes: 'Junho', ano: 2023, municipio: 'Feira de Santana', tipologia: 'Furto', guardasEnvolvidos: 15, valorSalarioSM: 1.5, guardasFeminino: 66, efetivoTotal: 218, indiceHabitante: 2994 },
    { id: 7, mes: 'Julho', ano: 2023, municipio: 'Salvador', tipologia: 'Atendimento Social', guardasEnvolvidos: 6, valorSalarioSM: 2.5, guardasFeminino: 3, efetivoTotal: 1375, indiceHabitante: 1899 },
    { id: 8, mes: 'Agosto', ano: 2023, municipio: 'Candeias', tipologia: 'Trânsito', guardasEnvolvidos: 4, valorSalarioSM: 1.0, guardasFeminino: 2, efetivoTotal: 211, indiceHabitante: 365 },
    { id: 9, mes: 'Setembro', ano: 2023, municipio: 'Candeias', tipologia: 'Furto', guardasEnvolvidos: 9, valorSalarioSM: 1.0, guardasFeminino: 2, efetivoTotal: 211, indiceHabitante: 365 },
    { id: 10, mes: 'Outubro', ano: 2023, municipio: 'Jequié', tipologia: 'Violência Doméstica', guardasEnvolvidos: 11, valorSalarioSM: 1.5, guardasFeminino: 41, efetivoTotal: 164, indiceHabitante: 954 },
    { id: 11, mes: 'Novembro', ano: 2023, municipio: 'Juazeiro', tipologia: 'Furto', guardasEnvolvidos: 14, valorSalarioSM: 2.0, guardasFeminino: 28, efetivoTotal: 169, indiceHabitante: 1446 },
    { id: 12, mes: 'Dezembro', ano: 2023, municipio: 'Feira de Santana', tipologia: 'Atendimento Social', guardasEnvolvidos: 18, valorSalarioSM: 1.5, guardasFeminino: 66, efetivoTotal: 218, indiceHabitante: 2994 },
  ],

  // Dados para o Gráfico de Vencimento Base (Baseado na p.35 do PDF)
  vencimentoData: [
    { name: '1 Salário Mínimo (SM)', value: 174, percent: 64.93, color: '#072044' },
    { name: '+1 até 1,5 SM', value: 62, percent: 23.13, color: '#1B5F88' },
    { name: '+1,5 até 2 SM', value: 17, percent: 6.34, color: '#6FB7FF' },
    { name: '+2,0 até 2,5 SM', value: 7, percent: 2.61, color: '#0A3A62' },
    { name: '+2,5 até 3 SM', value: 4, percent: 1.49, color: '#3A7EA5' },
    { name: '+3 SM', value: 4, percent: 1.49, color: '#4A9FC6' },
  ],
};

const PALETTE = {
  NAVY_900: '#072044', // Darkest Navy
  NAVY_800: '#0A3A62', // Dark Navy
  NAVY_600: '#1B5F88', // Medium Navy
  ACCENT: '#6FB7FF',  // Light Blue Accent
  MUTED: '#F4F7FB',   // Light Background
  TEXT_DARK: '#0B1A2B',
  WHITE: '#FFFFFF',
  ERROR: '#EF4444',
  SUCCESS: '#10B981',
};

const FILTERS_OPTIONS = {
  municipio: [...new Set(mockData.tableData.map(d => d.municipio))],
  tipologia: [...new Set(mockData.tableData.map(d => d.tipologia))],
  ano: [...new Set(mockData.tableData.map(d => d.ano.toString()))],
  mes: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  salario: ['1 SM', '+1 até 1,5 SM', '+1,5 até 2 SM', '+2,0 até 2,5 SM', '+2,5 até 3 SM', '+3 SM'],
};

// =========================================================================
// 2. CONFIGURAÇÃO DE ESTADO (Zustand/Redux Simples com React Hooks)
// =========================================================================

const useStore = (initialState) => {
  const [state, setState] = useState(initialState);
  
  const setFilters = useCallback((newFilters) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...newFilters } }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(prev => ({ ...prev, filters: initialState.filters }));
  }, [initialState.filters]);

  const setPage = useCallback((newPage) => {
    setState(prev => ({ ...prev, page: newPage }));
  }, []);
  
  const toggleTheme = useCallback(() => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  }, []);

  return { state, setFilters, resetFilters, setPage, toggleTheme };
};

const initialStoreState = {
  theme: 'light',
  page: 'welcome', // Mudança inicial para 'welcome' para mostrar a Hero Section primeiro
  filters: {
    municipio: '',
    tipologia: '',
    ano: '2023',
    searchText: '',
    guardasMin: 0,
  },
};

// =========================================================================
// 3. COMPONENTES DE UI E UTILIDADES
// =========================================================================

// Função utilitária para Debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Componente Card Reutilizável
const Card = ({ title, children, className = '' }) => (
  <div className={`p-4 md:p-6 rounded-xl shadow-lg transition-colors duration-500 bg-white dark:bg-navy-800 ${className}`}>
    <h3 className="text-xl font-bold mb-4 text-navy-900 dark:text-white border-b border-navy-600/20 dark:border-navy-600/50 pb-2">{title}</h3>
    {children}
  </div>
);

// Componente KPI Card
const KPICard = ({ title, value, icon: Icon, color }) => (
  <div className="p-4 rounded-xl shadow-md bg-navy-600/10 dark:bg-navy-800/50 flex items-center justify-between transition-colors duration-500">
    <div className="flex-grow">
      <p className="text-sm font-semibold uppercase text-navy-600 dark:text-navy-600/70">{title}</p>
      <p className={`text-3xl font-extrabold mt-1 text-navy-900 dark:text-white`}>{value}</p>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

// Formatação
const formatNumber = (num) => num.toLocaleString('pt-BR');
const formatPercentage = (num) => num.toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 1 });


// =========================================================================
// 4. FUNÇÕES DE CÁLCULO / LÓGICA DE FILTRO
// =========================================================================

const filterData = (data, filters) => {
  return data.filter(item => {
    const matchesMunicipio = filters.municipio ? item.municipio === filters.municipio : true;
    const matchesTipologia = filters.tipologia ? item.tipologia === filters.tipologia : true;
    const matchesAno = filters.ano ? item.ano.toString() === filters.ano : true;
    const matchesGuardasMin = item.guardasEnvolvidos >= filters.guardasMin;
    const matchesSearch = filters.searchText.toLowerCase()
      ? Object.values(item).some(val => 
          String(val).toLowerCase().includes(filters.searchText.toLowerCase()))
      : true;

    return matchesMunicipio && matchesTipologia && matchesAno && matchesGuardasMin && matchesSearch;
  });
};

const useDashboardCalculations = (data, filters) => {
  const filteredData = useMemo(() => filterData(data, filters), [data, filters]);

  // Cálculo de Ocorrências por Mês (Série Temporal)
  const ocorrenciasPorMes = useMemo(() => {
    const monthlyData = FILTERS_OPTIONS.mes.map(m => ({ mes: m, ocorrencias: 0 }));
    filteredData.forEach(item => {
      const index = monthlyData.findIndex(d => d.mes === item.mes);
      if (index !== -1) {
        monthlyData[index].ocorrencias += 1; // Contando cada linha como uma ocorrência
      }
    });
    return monthlyData;
  }, [filteredData]);

  // Cálculo de Ocorrências por Tipologia (Barras)
  const ocorrenciasPorTipologia = useMemo(() => {
    const counts = filteredData.reduce((acc, item) => {
      acc[item.tipologia] = (acc[item.tipologia] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filteredData]);

  // Cálculo de Ocorrências por Município (Donut)
  const ocorrenciasPorMunicipio = useMemo(() => {
    const counts = filteredData.reduce((acc, item) => {
      acc[item.municipio] = (acc[item.municipio] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filteredData]);

  // Total de Ocorrências Filtradas
  const totalOcorrencias = filteredData.length;
  
  // Média Mensal (para o período analisado)
  const mesesComOcorrencia = new Set(filteredData.map(d => d.mes));
  const mediaMensal = totalOcorrencias / mesesComOcorrencia.size || 0;

  return {
    filteredData,
    totalOcorrencias,
    mediaMensal,
    ocorrenciasPorMes,
    ocorrenciasPorTipologia,
    ocorrenciasPorMunicipio,
  };
};

// =========================================================================
// 5. COMPONENTES DO DASHBOARD (GRÁFICOS)
// =========================================================================

const TipologiaBarChart = ({ data }) => {
  const isMobile = window.innerWidth < 768;
  return (
    <Card title="Ocorrências por Tipologia (Top 5)">
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 350}>
        <BarChart data={data.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 20, left: isMobile ? 0 : 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.NAVY_600} opacity={0.3} />
          <XAxis type="number" stroke={PALETTE.ACCENT} className="dark:text-white text-sm" />
          <YAxis type="category" dataKey="name" stroke={PALETTE.ACCENT} className="dark:text-white text-xs" />
          <Tooltip contentStyle={{ backgroundColor: PALETTE.NAVY_900, borderColor: PALETTE.ACCENT, borderRadius: '8px' }} itemStyle={{ color: PALETTE.WHITE }} formatter={(value) => formatNumber(value)} labelFormatter={(label) => `Tipologia: ${label}`} />
          <Bar dataKey="count" fill={PALETTE.NAVY_600} radius={[10, 10, 0, 0]} name="Ocorrências" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

const SerieTemporalChart = ({ data }) => (
  <Card title="Ocorrências ao longo do ano (2023)">
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.NAVY_600} opacity={0.3} />
        <XAxis dataKey="mes" stroke={PALETTE.ACCENT} className="dark:text-white text-xs" />
        <YAxis stroke={PALETTE.ACCENT} className="dark:text-white text-sm" tickFormatter={formatNumber} />
        <Tooltip contentStyle={{ backgroundColor: PALETTE.NAVY_900, borderColor: PALETTE.ACCENT, borderRadius: '8px' }} itemStyle={{ color: PALETTE.WHITE }} formatter={(value) => formatNumber(value)} labelFormatter={(label) => `Mês: ${label}`} />
        <Line type="monotone" dataKey="ocorrencias" stroke={PALETTE.ACCENT} strokeWidth={3} dot={{ stroke: PALETTE.NAVY_900, strokeWidth: 2, r: 4, fill: PALETTE.ACCENT }} activeDot={{ r: 6 }} name="Ocorrências" />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

const MunicipioDonutChart = ({ data }) => {
  const COLORS = [PALETTE.NAVY_900, PALETTE.NAVY_600, PALETTE.ACCENT, '#3A7EA5', '#0A3A62'];
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    // Only show label if slice is large enough
    if (percent * 100 < 5) return null;

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  return (
    <Card title="Distribuição por Município (Top 5)">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data.slice(0, 5)}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            label={renderCustomizedLabel}
            labelLine={false}
          >
            {data.slice(0, 5).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: PALETTE.NAVY_900, borderColor: PALETTE.ACCENT, borderRadius: '8px' }} itemStyle={{ color: PALETTE.WHITE }} formatter={(value) => formatNumber(value)} labelFormatter={(label) => `Município: ${label}`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-1 text-sm dark:text-gray-300">
        {data.slice(0, 5).map((entry, index) => (
          <div key={entry.name} className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              {entry.name}
            </div>
            <span className="font-semibold text-navy-900 dark:text-white">{formatPercentage(entry.count / total)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};


// =========================================================================
// 6. COMPONENTES DE LAYOUT E NAVEGAÇÃO
// =========================================================================

// Componente Header
const Header = ({ theme, toggleTheme, setPage }) => {
  // Use um SVG simples como placeholder de logo para evitar problemas de CORS/URL na implementação real.
  const logoSvg = (
    <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
      <rect width="100" height="40" rx="8" fill={PALETTE.NAVY_900}/>
      <text x="50" y="25" fill={PALETTE.WHITE} fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="Inter">MOVAM-SE</text>
    </svg>
  );

  const icon = theme === 'light' ? Sun : Moon;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 shadow-md bg-white dark:bg-navy-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="h-8 md:h-10 flex items-center">
            {logoSvg}
          </div>
          <h1 className="text-xl md:text-2xl font-black text-navy-900 dark:text-white hidden sm:block">
            MOVAM-SE | GCM Bahia 2023
          </h1>
        </div>
        
        <nav className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={() => setPage('dashboard')}
            className="px-3 py-1 rounded-full text-sm font-semibold text-white bg-navy-600 hover:bg-navy-800 transition-colors duration-300 flex items-center"
            aria-label="Ir para o Painel de Dados"
          >
            <BarChart2 className="w-4 h-4 mr-1" /> Painel
          </button>
          <button
            onClick={() => setPage('movam-se')}
            className="px-3 py-1 rounded-full text-sm font-semibold text-navy-900 dark:text-white border border-navy-600 hover:bg-navy-600 hover:text-white dark:hover:bg-navy-600 transition-colors duration-300 flex items-center"
            aria-label="Ir para o Destaque MOVAM-SE"
          >
            <CheckCircle className="w-4 h-4 mr-1" /> MOVAM-SE
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-navy-900 dark:text-white bg-navy-600/10 dark:bg-navy-800/50 hover:bg-navy-600 hover:text-white dark:hover:bg-navy-600 transition-colors duration-500"
            aria-label={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
          >
            {React.createElement(icon, { className: "w-5 h-5" })}
          </button>
        </nav>
      </div>
    </header>
  );
};

// Componente Footer
const Footer = () => (
  <footer className="mt-16 py-8 text-center border-t border-navy-600/20 dark:border-navy-600/50 transition-colors duration-500">
    <div className="max-w-4xl mx-auto px-4 text-sm text-navy-600 dark:text-gray-400">
      <p className="font-semibold mb-2">
        Citação Obrigatória:
      </p>
      <p>
        "Dados extraídos do relatório produzido pelo Núcleo de Estatística da GCM de Salvador e pesquisas na internet pelo MOVAM-SE."
      </p>
      <p className="mt-4">
        &copy; 2023 Movimento Azul-Marinho pela Segurança (MOVAM-SE). Todos os direitos reservados.
      </p>
    </div>
  </footer>
);

// Componente Filtro Lateral
const FilterBar = ({ filters, setFilters, resetFilters, totalOcorrencias }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [localSearchText, setLocalSearchText] = useState(filters.searchText);
  const debouncedSearchText = useDebounce(localSearchText, 400);

  useEffect(() => {
    setFilters({ searchText: debouncedSearchText });
  }, [debouncedSearchText, setFilters]);

  const FilterGroup = ({ title, name, options }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium mb-1 text-navy-900 dark:text-white">{title}</label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={filters[name]}
          onChange={(e) => setFilters({ [name]: e.target.value })}
          className="w-full p-2 border border-navy-600/30 dark:border-navy-600/50 rounded-lg bg-white dark:bg-navy-800 text-navy-900 dark:text-white appearance-none pr-8 transition-colors duration-300"
        >
          <option value="">Todos ({name.charAt(0).toUpperCase() + name.slice(1)})</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-600 dark:text-accent" />
      </div>
    </div>
  );

  const FilterContent = (
    <Card title="Filtros do Infográfico" className="shadow-none bg-transparent dark:bg-transparent">
      <div className="text-center mb-6 p-3 bg-navy-600 text-white rounded-lg shadow-md">
        <p className="text-sm">Ocorrências Filtradas:</p>
        <p className="text-3xl font-extrabold">{formatNumber(totalOcorrencias)}</p>
      </div>

      <div className="mb-4">
        <label htmlFor="searchText" className="block text-sm font-medium mb-1 text-navy-900 dark:text-white">Pesquisa na Tabela</label>
        <input
          id="searchText"
          type="text"
          value={localSearchText}
          onChange={(e) => setLocalSearchText(e.target.value)}
          placeholder="Buscar texto na tabela..."
          className="w-full p-2 border border-navy-600/30 dark:border-navy-600/50 rounded-lg bg-white dark:bg-navy-800 text-navy-900 dark:text-white transition-colors duration-300"
        />
      </div>

      <FilterGroup title="Município" name="municipio" options={FILTERS_OPTIONS.municipio} />
      <FilterGroup title="Tipologia" name="tipologia" options={FILTERS_OPTIONS.tipologia} />
      <FilterGroup title="Ano" name="ano" options={FILTERS_OPTIONS.ano} />
      
      <div className="mt-6 flex justify-between space-x-2">
        <button
          onClick={resetFilters}
          className="w-full py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-300 text-sm"
          aria-label="Limpar todos os filtros"
        >
          Limpar Filtros
        </button>
      </div>
    </Card>
  );

  return (
    <>
      {/* Botão flutuante para Mobile */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-4 rounded-full bg-navy-600 text-white shadow-xl md:hidden"
        aria-label="Abrir filtros"
      >
        <Filter className="w-6 h-6" />
      </button>

      {/* Sidebar Desktop */}
      <div className="hidden md:block md:w-64 lg:w-72 flex-shrink-0 sticky top-24 h-[calc(100vh-100px)] overflow-y-auto">
        {FilterContent}
      </div>

      {/* Modal Mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-navy-900/80 backdrop-blur-sm md:hidden" onClick={() => setIsMobileOpen(false)}>
          <div className="absolute right-0 top-0 w-4/5 h-full bg-white dark:bg-navy-900 p-6 shadow-2xl transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-navy-900 dark:text-white bg-navy-600/10 dark:bg-navy-800/50 hover:bg-navy-600 hover:text-white"
              aria-label="Fechar filtros"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mt-10">
              {FilterContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// =========================================================================
// 7. TELAS DA APLICAÇÃO
// =========================================================================

// Tela Inicial / Hero
const HeroSection = ({ setPage }) => (
  <section className="mt-16 md:mt-12 py-10 md:py-16 bg-white dark:bg-navy-900 transition-colors duration-500 rounded-xl shadow-lg">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-navy-900 dark:text-white mb-4 leading-tight">
        Painel Interativo — Indicadores da GCM Bahia (2023)
      </h2>
      <p className="text-xl md:text-2xl font-light text-navy-600 dark:text-accent mb-8">
        Visualize, filtre e compreenda os principais dados sobre atendimento e ocorrências da Guarda Civil Municipal no estado da Bahia.
      </p>
      
      <p className="text-base text-navy-900 dark:text-gray-300 mb-8">
        Através deste painel interativo, apresentamos um infográfico dinâmico que reúne os registros e análises do relatório **gcm\_bahia\_2023**, produzido pelo Núcleo de Estatística da GCM de Salvador. Navegue pelos gráficos e tabelas, use os filtros para explorar por município, tipologia ou período, e gere relatórios exportáveis para apoiar tomada de decisão e controle social. Para mais informações institucionais e ações correlatas, acesse o destaque do Movimento Azul-Marinho pela Segurança (MOVAM-SE).
      </p>

      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
        <button
          onClick={() => setPage('dashboard')}
          className="px-8 py-3 rounded-full text-lg font-bold text-white bg-navy-800 hover:bg-navy-600 transition-colors duration-300 shadow-lg"
          aria-label="Ver o infográfico completo"
        >
          <BarChart2 className="w-5 h-5 inline mr-2" /> Ver Infográfico Completo
        </button>
        <button
          onClick={() => setPage('movam-se')}
          className="px-8 py-3 rounded-full text-lg font-bold text-navy-900 dark:text-white border-2 border-navy-600 hover:bg-navy-600 hover:text-white dark:hover:bg-navy-600 transition-colors duration-300"
          aria-label="Ir para o destaque institucional do MOVAM-SE"
        >
          <CheckCircle className="w-5 h-5 inline mr-2" /> Destaque MOVAM-SE
        </button>
      </div>
    </div>
  </section>
);


// Tabela Dinâmica
const DataTable = React.memo(({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Ordenação
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Paginação
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const headers = [
    { key: 'mes', label: 'Mês' },
    { key: 'municipio', label: 'Município' },
    { key: 'tipologia', label: 'Tipologia' },
    { key: 'guardasEnvolvidos', label: 'Guardas Env.' },
    { key: 'valorSalarioSM', label: 'Salário (SM)' },
    { key: 'efetivoTotal', label: 'Efetivo Total' },
  ];

  const TableHeader = ({ header }) => (
    <th
      className="p-3 text-sm font-semibold tracking-wider text-left uppercase cursor-pointer bg-navy-800 text-white dark:bg-navy-600/90 hover:bg-navy-600 transition-colors duration-300"
      onClick={() => requestSort(header.key)}
      aria-sort={sortConfig.key === header.key ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'}
    >
      {header.label} {getSortIcon(header.key)}
    </th>
  );

  return (
    <Card title={`Tabela Dinâmica (${data.length} Registros)`}>
      <div className="overflow-x-auto rounded-xl border border-navy-600/30 dark:border-navy-600/50">
        <table className="min-w-full divide-y divide-navy-600/30 dark:divide-navy-600/50">
          <thead>
            <tr className="dark:bg-navy-700">
              {headers.map(header => <TableHeader key={header.key} header={header} />)}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-600/20 dark:divide-navy-600/40 text-navy-900 dark:text-gray-200">
            {paginatedData.map((item, index) => (
              <tr key={item.id} className="hover:bg-navy-600/5 dark:hover:bg-navy-800/50 transition-colors duration-200">
                <td className="p-3 text-sm">{item.mes}</td>
                <td className="p-3 text-sm font-medium">{item.municipio}</td>
                <td className="p-3 text-sm">{item.tipologia}</td>
                <td className="p-3 text-sm text-right">{item.guardasEnvolvidos}</td>
                <td className="p-3 text-sm text-right">{item.valorSalarioSM.toFixed(1)}</td>
                <td className="p-3 text-sm text-right">{formatNumber(item.efetivoTotal)}</td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="p-6 text-center text-sm italic text-gray-500 dark:text-gray-400">
                  Nenhum registro encontrado com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <!-- Paginação -->
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 text-navy-900 dark:text-white">
        <span className="text-sm">
          Página **{currentPage}** de **{totalPages}**
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-navy-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 text-sm font-semibold"
            aria-label="Página anterior"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 rounded-lg bg-navy-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 text-sm font-semibold"
            aria-label="Próxima página"
          >
            Próxima
          </button>
        </div>
      </div>
    </Card>
  );
});

// Resumo Executivo e KPIs
const ExecutiveSummary = React.memo(({ kpis, totalOcorrencias, mediaMensal, setPage }) => {
  const topTipologia = mockData.tableData.reduce((acc, item) => {
    acc[item.tipologia] = (acc[item.tipologia] || 0) + 1;
    return acc;
  }, {});
  const topTipologiaName = Object.keys(topTipologia).sort((a, b) => topTipologia[b] - topTipologia[a])[0];

  return (
    <section className="space-y-8">
      <Card title="Resumo Executivo (GCM Bahia 2023)">
        <p className="text-sm font-semibold text-navy-600 dark:text-accent mb-2">Período Analisado: 01/01/2023 – 31/12/2023</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total de Guardas (Efetivo)" value={formatNumber(kpis.totalGuardas)} icon={Users} color={`bg-navy-900`} />
          <KPICard title="Total Ocorrências (Filtradas)" value={formatNumber(totalOcorrencias)} icon={BarChart2} color={`bg-navy-600`} />
          <KPICard title="Média Mensal Ocorrências" value={formatNumber(mediaMensal.toFixed(1))} icon={TrendingUp} color={`bg-accent`} />
          <KPICard title="Municípios com GCM" value={formatNumber(kpis.totalMunicipiosGCM)} icon={Map} color={`bg-navy-800`} />
        </div>

        <div className="mt-6 p-4 border border-navy-600/30 dark:border-navy-600/50 rounded-lg dark:bg-navy-900/50">
          <p className="font-bold text-navy-900 dark:text-white mb-2">Principais Indicadores</p>
          <div className="text-sm dark:text-gray-300">
            <p>1. **Top Ocorrência**: {topTipologiaName} (na amostra).</p>
            <p>2. **Guarda Feminino**: {formatPercentage(kpis.percentualFeminino / 100)} do efetivo total.</p>
            <p>3. **Estrutura**: {formatPercentage(kpis.percentualComPlanoCargos / 100)} dos municípios têm Plano de Cargos e Salários.</p>
            <p>4. **Melhor Índice GCM/Hab**: {kpis.municipioMelhorIndice} (1 para cada 180 habitantes).</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
            <button
                onClick={() => setPage('movam-se')}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-navy-900 dark:text-white border border-navy-600 hover:bg-navy-600 hover:text-white dark:hover:bg-navy-600 transition-colors duration-300"
                aria-label="Ver detalhes institucionais do MOVAM-SE"
            >
                Detalhes MOVAM-SE
            </button>
        </div>
      </Card>
    </section>
  );
});

// Visão geral dos gráficos do dashboard
const ChartsView = ({ ocorrenciasPorMes, ocorrenciasPorTipologia, ocorrenciasPorMunicipio, vencimentoData }) => (
  <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
    <div className="lg:col-span-2 space-y-6">
      <SerieTemporalChart data={ocorrenciasPorMes} />
      <TipologiaBarChart data={ocorrenciasPorTipologia} />
    </div>
    <div className="lg:col-span-1 space-y-6">
      <MunicipioDonutChart data={ocorrenciasPorMunicipio} />
      <Card title="Vencimento-Base Inicial (Municípios)">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={vencimentoData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" stroke={PALETTE.ACCENT} className="dark:text-white text-xs" tickFormatter={formatNumber} />
            <YAxis type="category" dataKey="name" stroke={PALETTE.ACCENT} className="dark:text-white text-xs" />
            <Tooltip contentStyle={{ backgroundColor: PALETTE.NAVY_900, borderColor: PALETTE.ACCENT, borderRadius: '8px' }} itemStyle={{ color: PALETTE.WHITE }} formatter={(value, name, props) => [`${formatPercentage(props.payload.percent / 100)} (${value})`, 'Percentual']} labelFormatter={(label) => `Faixa: ${label}`} />
            <Bar dataKey="value" fill={PALETTE.NAVY_800} name="Municípios" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-center mt-2 text-navy-600 dark:text-gray-400">* 64.93% dos municípios com GCM recebem 1 SM (Salário Mínimo)</p>
      </Card>
    </div>
  </section>
);

// Tela Destaque MOVAM-SE
const MovamSePage = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <Card title="Movimento Azul-Marinho pela Segurança (MOVAM-SE)">
      <div className="space-y-6 text-navy-900 dark:text-gray-300">
        <p className="text-lg">
          O **MOVAM-SE** atua no monitoramento da segurança municipal e na defesa dos interesses das guardas municipais em todo o estado da Bahia. Nosso foco é promover a valorização, o aparelhamento e a formação contínua dos agentes, garantindo que as Guardas Civis Municipais possam cumprir plenamente seu papel como entes de segurança pública.
        </p>

        <h3 className="text-2xl font-bold text-navy-900 dark:text-accent pt-4">Nossas Iniciativas Principais:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>**Monitoramento Estatístico:** Produção de relatórios e infográficos (como este painel) em parceria com o Núcleo de Estatística da GCM de Salvador.</li>
          <li>**Defesa Institucional:** Articulação junto a esferas políticas e legislativas para a implementação do Plano de Cargos e Salários e a adequação à Lei Federal $n^{\circ}$ 13.022/2014.</li>
          <li>**Capacitação:** Promoção de cursos de formação e aperfeiçoamento, visando a padronização e o uso legal de equipamentos, como o porte de arma.</li>
        </ul>

        <p className="text-lg pt-4">
          Os dados estatísticos que você visualiza no painel são a base para nossas recomendações e ações. Clique abaixo para acessar nossos comunicados e relatórios completos:
        </p>

        <div className="flex flex-wrap gap-4 pt-4">
          <a href="mailto:contato@movamse.com.br" className="px-6 py-2 rounded-full font-semibold text-white bg-navy-600 hover:bg-navy-800 transition-colors" target="_blank" rel="noopener noreferrer">
            Contato MOVAM-SE
          </a>
          <a href="#" className="px-6 py-2 rounded-full font-semibold text-navy-900 dark:text-white border border-navy-600 hover:bg-navy-600 hover:text-white transition-colors" aria-label="Ver relatórios anteriores (Link Placeholder)">
            Ver Relatórios Anteriores
          </a>
        </div>
      </div>
    </Card>
  </div>
);

// =========================================================================
// 8. COMPONENTE PRINCIPAL (APP)
// =========================================================================

const App = () => {
  const { state, setFilters, resetFilters, setPage, toggleTheme } = useStore(initialStoreState);
  const { theme, page, filters } = state;
  const { filteredData, totalOcorrencias, mediaMensal, ocorrenciasPorMes, ocorrenciasPorTipologia, ocorrenciasPorMunicipio } = useDashboardCalculations(mockData.tableData, filters);
  
  // Efeito para aplicar o tema no body
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);
  
  // Estilo para o background com a logomarca do MOVAM-SE (Mockado com URL placeholder)
  const backgroundStyle = {
    // Logo placeholder do MOVAM-SE (fundo escuro na cor navy 900)
    backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHJ4PSIxMCIgZmlsbD0iIzA3MjA0NCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTA1IiBmaWxsPSIjRjRGOUZGIiBmb250LXNpemU9IjMwIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkludGVyIj5NT1ZBTS1TRTwvdGV4dD48L3N2Zz4=')`,
    backgroundSize: '300px', // Tamanho grande para ser sutil
    backgroundRepeat: 'repeat',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    opacity: 0.03, // Opacidade baixa para não atrapalhar a leitura
    zIndex: 0,
    transition: 'opacity 0.5s',
  };

  const Content = () => {
    switch (page) {
      case 'movam-se':
        return <MovamSePage />;
      case 'dashboard':
        return (
          <div className="flex flex-col md:flex-row max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 gap-6">
            <FilterBar 
              filters={filters} 
              setFilters={setFilters} 
              resetFilters={resetFilters} 
              totalOcorrencias={totalOcorrencias}
            />
            <main className="flex-grow">
              <ExecutiveSummary 
                kpis={mockData.kpis} 
                totalOcorrencias={totalOcorrencias} 
                mediaMensal={mediaMensal} 
                setPage={setPage}
              />
              <ChartsView 
                ocorrenciasPorMes={ocorrenciasPorMes} 
                ocorrenciasPorTipologia={ocorrenciasPorTipologia} 
                ocorrenciasPorMunicipio={ocorrenciasPorMunicipio}
                vencimentoData={mockData.vencimentoData}
              />
              <div className="mt-8">
                <DataTable data={filteredData} />
              </div>
              <div className="mt-8 p-4 rounded-xl bg-navy-600/10 dark:bg-navy-800/50 text-navy-900 dark:text-gray-300">
                <h3 className="text-lg font-bold">Download / Export</h3>
                <p className="text-sm mt-2">Os dados da tabela e a imagem do infográfico (em breve, funcionalidade a ser implementada).</p>
                <button
                    onClick={() => console.log('Simulação de Download CSV/PNG')}
                    className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-navy-600 hover:bg-navy-800 transition-colors duration-300 flex items-center"
                    aria-label="Exportar dados ou imagem"
                >
                    <Download className="w-4 h-4 mr-2" /> Exportar Dados / Imagem
                </button>
              </div>
            </main>
          </div>
        );
      case 'welcome':
        return (
           <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
             <HeroSection setPage={setPage} />
           </div>
        );
      default:
        return (
           <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
             <HeroSection setPage={setPage} />
           </div>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-inter ${theme === 'light' ? 'bg-muted text-text-dark' : 'bg-navy-900 text-white'}`}>
      {/* Background da Logomarca (Layer de Baixa Opacidade) */}
      <div 
        className="fixed inset-0 pointer-events-none" 
        style={backgroundStyle}
        aria-hidden="true"
      />
      
      <Header theme={theme} toggleTheme={toggleTheme} setPage={setPage} />
      
      {/* Conteúdo Principal */}
      <div className="relative z-10">
        <Content />
      </div>

      <Footer />
      
      {/* Estilos Globais para o Tema (necessário para Recharts/Tailwind compatibilidade) */}
      <style jsx global>{`
        /* Importante para que o Tailwind funcione */
        @import url('[https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap)');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        
        /* Tema Claro */
        .light .recharts-tooltip-label, 
        .light .recharts-default-tooltip, 
        .light .recharts-text, 
        .light .recharts-legend-item-text {
          color: ${PALETTE.TEXT_DARK}; 
          fill: ${PALETTE.TEXT_DARK};
        }
        
        /* Tema Escuro */
        .dark .recharts-tooltip-label, 
        .dark .recharts-default-tooltip, 
        .dark .recharts-text, 
        .dark .recharts-legend-item-text {
          color: ${PALETTE.WHITE}; 
          fill: ${PALETTE.WHITE};
        }

        /* Classes Tailwind para Recharts */
        .dark .recharts-cartesian-grid-vertical line,
        .dark .recharts-cartesian-grid-horizontal line {
          stroke: rgba(255, 255, 255, 0.1);
        }
        
        /* Transição suave do tema */
        body, div, h1, h2, h3, p, span, button {
          transition: background-color 0.5s, color 0.5s, border-color 0.5s;
        }
      `}</style>
      
    </div>
  );
};

export default App;
