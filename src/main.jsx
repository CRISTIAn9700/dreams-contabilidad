import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Cloud,
  Database,
  ExternalLink,
  FilePlus2,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Sparkles,
  Trash2,
  UsersRound,
  Zap,
} from 'lucide-react';
import './styles.css';
import {
  cloudReady,
  getCloudSession,
  loadCloudState,
  saveCloudState,
  signInCloud,
  signOutCloud,
  signUpCloud,
} from './cloud';

const IVA_RATE = 0.15;
const USD = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
});

const LOCAL_TIME_ZONE = 'America/Guayaquil';
const LOCAL_LOCATION = 'Tulcán, Ecuador';
const today = localDateKey(new Date());
const currentMonth = today.slice(0, 7);
const SRI_FACTURADOR_URL = import.meta.env.VITE_SRI_FACTURADOR_URL || 'https://facturadorsri.sri.gob.ec/portal-facturadorsri-internet/pages/inicio.html';
const SRI_FACTURACION_INFO_URL = 'https://www.sri.gob.ec/facturacion-electronica';
const cloudConfigured = cloudReady;

const seedData = {
  users: [
    {
      id: 'u-admin',
      name: 'Administrador Dreams',
      email: 'admin@dreams.ec',
      password: 'Dreams2026!',
      role: 'Propietario',
    },
  ],
  business: {
    name: 'Dreams Studio Publicidad',
    ruc: '1799999999001',
    city: 'Quito',
    activity: 'Agencia de publicidad, diseño y producción con láser CO2',
    ivaRate: IVA_RATE,
    currency: 'USD',
  },
  products: [
    {
      id: 'p-001',
      name: 'Letrero acrílico personalizado',
      category: 'Publicidad visual',
      unit: 'unidad',
      price: 48,
      cost: 19,
      iva: true,
      stock: 18,
    },
    {
      id: 'p-002',
      name: 'Corte láser MDF 3 mm',
      category: 'Servicio láser CO2',
      unit: 'hora',
      price: 22,
      cost: 7,
      iva: true,
      stock: 40,
    },
    {
      id: 'p-003',
      name: 'Grabado láser en madera',
      category: 'Personalización',
      unit: 'unidad',
      price: 12,
      cost: 3.5,
      iva: true,
      stock: 65,
    },
    {
      id: 'p-004',
      name: 'Señalética interior PVC',
      category: 'Señalética',
      unit: 'unidad',
      price: 35,
      cost: 14,
      iva: true,
      stock: 24,
    },
  ],
  clients: [
    { id: 'c-001', name: 'Café Altura', ruc: '0991112223001', city: 'Guayaquil', email: 'compras@cafealtura.ec' },
    { id: 'c-002', name: 'Nova Dental', ruc: '1792223334001', city: 'Quito', email: 'admin@novadental.ec' },
    { id: 'c-003', name: 'Casa Mía Eventos', ruc: '1103334445001', city: 'Cuenca', email: 'hola@casamia.ec' },
  ],
  sales: [
    {
      id: 's-001',
      date: '2026-06-03',
      clientId: 'c-001',
      productId: 'p-001',
      quantity: 3,
      subtotal: 144,
      iva: 21.6,
      total: 165.6,
      status: 'Cobrado',
      note: 'Letreros para barra principal',
    },
    {
      id: 's-002',
      date: '2026-06-08',
      clientId: 'c-002',
      productId: 'p-003',
      quantity: 12,
      subtotal: 144,
      iva: 21.6,
      total: 165.6,
      status: 'Pendiente',
      note: 'Placas para consultorios',
    },
    {
      id: 's-003',
      date: '2026-06-15',
      clientId: 'c-003',
      productId: 'p-002',
      quantity: 5,
      subtotal: 110,
      iva: 16.5,
      total: 126.5,
      status: 'Cobrado',
      note: 'Corte de piezas para souvenirs',
    },
  ],
  expenses: [
    {
      id: 'e-001',
      date: '2026-06-02',
      supplier: 'Acrilaser Ecuador',
      category: 'Materia prima',
      description: 'Planchas acrílicas transparentes',
      subtotal: 220,
      iva: 33,
      total: 253,
      status: 'Pagado',
    },
    {
      id: 'e-002',
      date: '2026-06-06',
      supplier: 'Servicios Eléctricos Quito',
      category: 'Servicios básicos',
      description: 'Consumo eléctrico taller',
      subtotal: 74,
      iva: 11.1,
      total: 85.1,
      status: 'Pagado',
    },
    {
      id: 'e-003',
      date: '2026-06-13',
      supplier: 'Meta Ads',
      category: 'Marketing',
      description: 'Campaña para promociones de grabado',
      subtotal: 60,
      iva: 9,
      total: 69,
      status: 'Pendiente',
    },
  ],
};

function uid(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function localDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: LOCAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatLocalDate(date, options) {
  return new Intl.DateTimeFormat('es-EC', {
    timeZone: LOCAL_TIME_ZONE,
    ...options,
  }).format(date);
}

function useLocalClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const dayKey = localDateKey(now);
  return {
    dayKey,
    monthKey: dayKey.slice(0, 7),
    time: formatLocalDate(now, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
    dateLong: formatLocalDate(now, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    monthLabel: formatLocalDate(now, {
      month: 'long',
      year: 'numeric',
    }),
  };
}

function loadState() {
  const saved = localStorage.getItem('dreams-contabilidad-state');
  return saved ? JSON.parse(saved) : seedData;
}

function saveState(state) {
  localStorage.setItem('dreams-contabilidad-state', JSON.stringify(state));
}

function money(value) {
  return USD.format(Number(value || 0));
}

function computeTotals(state) {
  const salesSubtotal = state.sales.reduce((sum, row) => sum + Number(row.subtotal), 0);
  const salesIva = state.sales.reduce((sum, row) => sum + Number(row.iva), 0);
  const salesTotal = state.sales.reduce((sum, row) => sum + Number(row.total), 0);
  const expensesSubtotal = state.expenses.reduce((sum, row) => sum + Number(row.subtotal), 0);
  const expensesIva = state.expenses.reduce((sum, row) => sum + Number(row.iva), 0);
  const expensesTotal = state.expenses.reduce((sum, row) => sum + Number(row.total), 0);
  return {
    salesSubtotal,
    salesIva,
    salesTotal,
    expensesSubtotal,
    expensesIva,
    expensesTotal,
    ivaDue: salesIva - expensesIva,
    profit: salesSubtotal - expensesSubtotal,
  };
}

function computeMonthTotals(state, month = currentMonth) {
  const sales = state.sales.filter((sale) => sale.date?.startsWith(month));
  const expenses = state.expenses.filter((expense) => expense.date?.startsWith(month));
  return computeTotals({ ...state, sales, expenses });
}

function calendarDaysForMonth(month = currentMonth) {
  const [year, monthIndex] = month.split('-').map(Number);
  const first = new Date(year, monthIndex - 1, 1);
  const startOffset = first.getDay();
  const totalDays = new Date(year, monthIndex, 0).getDate();
  return Array.from({ length: startOffset + totalDays }, (_, index) => {
    if (index < startOffset) return null;
    return `${month}-${String(index - startOffset + 1).padStart(2, '0')}`;
  });
}

function App() {
  const [state, setState] = useState(loadState);
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('dreams-contabilidad-session') || 'null'));
  const [view, setView] = useState('panel');
  const [syncStatus, setSyncStatus] = useState(cloudConfigured ? 'Conectando nube' : 'Modo local');
  const localClock = useLocalClock();

  useEffect(() => {
    let alive = true;
    async function restoreCloudSession() {
      if (!cloudConfigured) return;
      try {
        const current = await getCloudSession();
        if (!alive || !current?.user) {
          setSyncStatus('Modo nube listo');
          return;
        }
        const cloudState = await loadCloudState(current.user.id);
        const nextSession = {
          id: current.user.id,
          cloudUserId: current.user.id,
          name: current.user.user_metadata?.name || current.user.email,
          role: 'Usuario nube',
        };
        if (cloudState) {
          setState(cloudState);
          saveState(cloudState);
        } else {
          await saveCloudState(current.user.id, state);
        }
        localStorage.setItem('dreams-contabilidad-session', JSON.stringify(nextSession));
        setSession(nextSession);
        setSyncStatus('Sincronizado en nube');
      } catch (error) {
        setSyncStatus(`Nube sin conectar: ${error.message}`);
      }
    }
    restoreCloudSession();
    return () => {
      alive = false;
    };
  }, []);

  function updateState(next) {
    setState(next);
    saveState(next);
    if (cloudConfigured && session?.cloudUserId) {
      setSyncStatus('Sincronizando');
      saveCloudState(session.cloudUserId, next)
        .then(() => setSyncStatus('Sincronizado en nube'))
        .catch((error) => setSyncStatus(`Error nube: ${error.message}`));
    }
  }

  async function login(email, password) {
    if (cloudConfigured) {
      const user = await signInCloud(email, password);
      const cloudState = await loadCloudState(user.id);
      const nextSession = {
        id: user.id,
        cloudUserId: user.id,
        name: user.user_metadata?.name || user.email,
        role: 'Usuario nube',
      };
      if (cloudState) {
        setState(cloudState);
        saveState(cloudState);
      } else {
        await saveCloudState(user.id, state);
      }
      localStorage.setItem('dreams-contabilidad-session', JSON.stringify(nextSession));
      setSession(nextSession);
      setSyncStatus('Sincronizado en nube');
      return true;
    }
    const found = state.users.find((user) => user.email === email && user.password === password);
    if (!found) return false;
    const nextSession = { id: found.id, name: found.name, role: found.role };
    localStorage.setItem('dreams-contabilidad-session', JSON.stringify(nextSession));
    setSession(nextSession);
    return true;
  }

  async function registerUser(nextUser) {
    if (cloudConfigured) {
      const data = await signUpCloud(nextUser);
      const user = data.user;
      const cloudUserId = user?.id;
      if (!cloudUserId || !data.session) {
        return { ok: false, message: 'Cuenta creada. Revisa tu correo para confirmar y luego ingresa con tu contraseña.' };
      }
      const nextSession = {
        id: cloudUserId,
        cloudUserId,
        name: nextUser.name,
        role: 'Usuario nube',
      };
      localStorage.setItem('dreams-contabilidad-session', JSON.stringify(nextSession));
      setSession(nextSession);
      await saveCloudState(cloudUserId, state);
      setSyncStatus('Sincronizado en nube');
      return { ok: true };
    }
    const exists = state.users.some((user) => user.email.toLowerCase() === nextUser.email.toLowerCase());
    if (exists) return { ok: false, message: 'Ese correo ya existe en Dreams Contabilidad.' };
    const user = {
      id: uid('u'),
      name: nextUser.name,
      email: nextUser.email,
      password: nextUser.password,
      role: 'Usuario',
    };
    const nextState = { ...state, users: [user, ...state.users] };
    updateState(nextState);
    const nextSession = { id: user.id, name: user.name, role: user.role };
    localStorage.setItem('dreams-contabilidad-session', JSON.stringify(nextSession));
    setSession(nextSession);
    return { ok: true };
  }

  async function logout() {
    if (cloudConfigured) {
      await signOutCloud();
      setSyncStatus('Modo nube listo');
    }
    localStorage.removeItem('dreams-contabilidad-session');
    setSession(null);
  }

  if (!session) {
    return <LoginScreen onLogin={login} onRegister={registerUser} />;
  }

  return (
    <Shell session={session} view={view} setView={setView} logout={logout} syncStatus={syncStatus} localClock={localClock}>
      {view === 'panel' && <Dashboard state={state} setView={setView} localClock={localClock} />}
      {view === 'ventas' && <Sales state={state} updateState={updateState} />}
      {view === 'gastos' && <Expenses state={state} updateState={updateState} />}
      {view === 'productos' && <Products state={state} updateState={updateState} />}
      {view === 'clientes' && <Clients state={state} updateState={updateState} />}
      {view === 'reportes' && <Reports state={state} />}
      {view === 'ajustes' && <SettingsView state={state} updateState={updateState} />}
    </Shell>
  );
}

function LoginScreen({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('Nuevo usuario Dreams');
  const [email, setEmail] = useState('admin@dreams.ec');
  const [password, setPassword] = useState('Dreams2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        if (!(await onLogin(email.trim(), password))) setError('Usuario o contraseña incorrectos.');
        return;
      }
      if (!name.trim() || !email.trim() || password.length < 6) {
        setError('Completa nombre, correo y una contraseña de al menos 6 caracteres.');
        return;
      }
      const result = await onRegister({ name: name.trim(), email: email.trim(), password });
      if (!result.ok) setError(result.message);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <BrandLogo variant="inverse" size="hero" />
        <p className="eyebrow">Sistema contable para Ecuador</p>
        <h1>Dreams Contabilidad</h1>
        <p>
          Controla ventas, gastos, productos, clientes e IVA de tu agencia de publicidad y taller láser CO2 desde una interfaz clara y editable.
        </p>
        <div className="login-highlights">
          <span>IVA Ecuador 15%</span>
          <span>USD</span>
          <span>{cloudConfigured ? 'Nube activa' : 'Modo local'}</span>
        </div>
      </section>
      <form className="login-card" onSubmit={submit}>
        <div>
          <LockKeyhole size={24} />
          <h2>{mode === 'login' ? 'Ingresar' : 'Crear usuario'}</h2>
          <p>{mode === 'login' ? 'Usuario inicial incluido para probar el sistema.' : 'Crea un acceso local para otro miembro del equipo.'}</p>
        </div>
        <div className="segmented">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Ingresar</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Crear usuario</button>
        </div>
        {mode === 'register' && (
          <label>
            Nombre
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        )}
        <label>
          Correo
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>
        <label>
          Contraseña
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Procesando' : mode === 'login' ? 'Entrar al panel' : 'Crear y entrar'}
        </button>
        <p className="demo-note">
          {mode === 'login' ? 'Demo: admin@dreams.ec / Dreams2026!' : 'Este usuario se guarda localmente; en nube se usará Supabase Auth.'}
        </p>
      </form>
    </main>
  );
}

function Shell({ children, session, view, setView, logout, syncStatus, localClock }) {
  const nav = [
    ['panel', 'Panel', LayoutDashboard],
    ['ventas', 'Ventas', ReceiptText],
    ['gastos', 'Gastos', CircleDollarSign],
    ['productos', 'Productos', Boxes],
    ['clientes', 'Clientes', UsersRound],
    ['reportes', 'Reportes', BarChart3],
    ['ajustes', 'Ajustes', Settings],
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <BrandLogo variant="inverse" size="sidebar" />
        </div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <button className="logout" onClick={logout}><LogOut size={18} /> Salir</button>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Agencia de publicidad + láser CO2</p>
            <h1>{pageTitle(view)}</h1>
          </div>
          <div className="user-chip">
            {cloudConfigured ? <Cloud size={18} /> : <Database size={18} />}
            <span>{syncStatus}</span>
          </div>
          <div className="local-clock">
            <MapPin size={18} />
            <div>
              <strong>{localClock.time}</strong>
              <span>{LOCAL_LOCATION} · {localClock.dateLong}</span>
            </div>
          </div>
          <div className="user-chip">
            <Building2 size={18} />
            <span>{session.name}</span>
          </div>
        </header>
        <div className="view-stage" key={view}>
          {children}
        </div>
      </div>
    </div>
  );
}

function pageTitle(view) {
  return {
    panel: 'Panel financiero',
    ventas: 'Registro de ventas',
    gastos: 'Registro de gastos',
    productos: 'Productos y servicios',
    clientes: 'Clientes',
    reportes: 'Reportes Ecuador',
    ajustes: 'Configuración',
  }[view];
}

function Dashboard({ state, setView, localClock }) {
  const totals = computeTotals(state);
  const monthTotals = computeMonthTotals(state, localClock.monthKey);
  const calendarEvents = useMemo(() => {
    return [...state.sales.map((sale) => ({ ...sale, type: 'sale' })), ...state.expenses.map((expense) => ({ ...expense, type: 'expense' }))];
  }, [state.sales, state.expenses]);
  const topProducts = state.products
    .map((product) => {
      const sold = state.sales
        .filter((sale) => sale.productId === product.id)
        .reduce((sum, sale) => sum + Number(sale.quantity), 0);
      return { ...product, sold };
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4);

  return (
    <main className="content-grid">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">{localClock.monthLabel}</p>
          <h2>Visión general de Dreams Contabilidad</h2>
          <p>Ventas, gastos, IVA y flujo de caja para operar tu agencia de publicidad con láser CO2 desde {LOCAL_LOCATION}.</p>
        </div>
        <div className="quick-actions">
          <button onClick={() => setView('ventas')}><FilePlus2 size={18} /> Nueva venta <ArrowRight size={16} /></button>
          <button onClick={() => setView('gastos')}><CircleDollarSign size={18} /> Nuevo gasto <ArrowRight size={16} /></button>
        </div>
      </section>
      <section className="metrics-grid">
        <Metric title="Ventas del mes" value={money(monthTotals.salesTotal)} hint="Facturado con IVA" tone="brand" />
        <Metric title="Gastos del mes" value={money(monthTotals.expensesTotal)} hint="Compras y operación" />
        <Metric title="IVA mensual" value={money(monthTotals.ivaDue)} hint="IVA ventas - IVA compras" tone={monthTotals.ivaDue >= 0 ? 'warn' : 'good'} />
        <Metric title="Utilidad mensual" value={money(monthTotals.profit)} hint="Antes de impuestos y ajustes" tone="good" />
      </section>
      <section className="panel wide">
        <div className="section-title">
          <div>
            <p className="eyebrow">Resumen mensual</p>
            <h2>Flujo para decisiones rápidas</h2>
          </div>
          <CalendarDays size={20} />
        </div>
        <div className="bars">
          <Bar label="Ventas" value={monthTotals.salesSubtotal} max={Math.max(monthTotals.salesSubtotal, monthTotals.expensesSubtotal, 1)} />
          <Bar label="Gastos" value={monthTotals.expensesSubtotal} max={Math.max(monthTotals.salesSubtotal, monthTotals.expensesSubtotal, 1)} />
          <Bar label="IVA cobrado" value={monthTotals.salesIva} max={Math.max(monthTotals.salesIva, monthTotals.expensesIva, 1)} />
          <Bar label="IVA pagado" value={monthTotals.expensesIva} max={Math.max(monthTotals.salesIva, monthTotals.expensesIva, 1)} />
        </div>
      </section>
      <section className="panel calendar-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Calendario</p>
            <h2>{localClock.monthLabel}</h2>
          </div>
          <CalendarDays size={20} />
        </div>
        <MiniCalendar days={calendarDaysForMonth(localClock.monthKey)} events={calendarEvents} localClock={localClock} />
      </section>
      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Producción</p>
            <h2>Más vendidos</h2>
          </div>
          <Boxes size={20} />
        </div>
        <div className="stack">
          {topProducts.map((product) => (
            <div className="list-row" key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <span>{product.category}</span>
              </div>
              <b>{product.sold}</b>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">SRI</p>
            <h2>Facturación electrónica</h2>
          </div>
          <ReceiptText size={20} />
        </div>
        <div className="tax-notes">
          <p><strong>Acceso rápido:</strong> abre el Facturador SRI para emitir factura con RUC y clave.</p>
          <p><strong>Necesario:</strong> autorización de comprobantes electrónicos y firma digital tipo archivo.</p>
          <p><strong>Integración futura:</strong> enviar desde Dreams los datos de cliente, producto, subtotal e IVA.</p>
        </div>
        <div className="button-row">
          <a className="primary-button" href={SRI_FACTURADOR_URL} target="_blank" rel="noreferrer">
            Abrir Facturador SRI <ExternalLink size={16} />
          </a>
          <a className="ghost-button" href={SRI_FACTURACION_INFO_URL} target="_blank" rel="noreferrer">
            Ver requisitos
          </a>
        </div>
      </section>
      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Nube</p>
            <h2>Datos continuos</h2>
          </div>
          <Cloud size={20} />
        </div>
        <div className="tax-notes">
          <p><strong>Modo actual:</strong> local en este navegador para pruebas rápidas.</p>
          <p><strong>Siguiente paso:</strong> conectar Supabase para usuarios reales y registros compartidos.</p>
          <p><strong>Publicación:</strong> estructura lista para GitHub Pages con acción automática.</p>
        </div>
      </section>
    </main>
  );
}

function Metric({ title, value, hint, tone = '' }) {
  return (
    <article className={`metric ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

function BrandLogo({ variant = 'primary', size = 'default' }) {
  const [fallback, setFallback] = useState(false);
  const src = variant === 'inverse' ? '/brand/dreams-logo-inverse.png' : '/brand/dreams-logo-primary.png';
  return (
    <div className={`brand-logo ${size} ${variant}`}>
      {fallback ? (
        <span>Dreams</span>
      ) : (
        <img src={src} alt="Dreams" onError={() => setFallback(true)} />
      )}
    </div>
  );
}

function MiniCalendar({ days, events, localClock }) {
  const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return (
    <div className="calendar-wrap">
      <div className="calendar-context">
        <span>{LOCAL_LOCATION}</span>
        <strong>{localClock.dateLong}</strong>
        <b>{localClock.time}</b>
      </div>
      <div className="mini-calendar">
        {labels.map((label) => <strong key={label}>{label}</strong>)}
        {days.map((day, index) => {
          const dayEvents = day ? events.filter((event) => event.date === day) : [];
          return (
            <div className={`calendar-day ${day === localClock.dayKey ? 'today' : ''}`} key={`${day || 'empty'}-${index}`}>
              <span>{day ? Number(day.slice(-2)) : ''}</span>
              <div>
                {dayEvents.slice(0, 2).map((event) => (
                  <i className={event.type} key={event.id} title={event.type === 'sale' ? 'Venta' : 'Gasto'} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Bar({ label, value, max }) {
  return (
    <div className="bar-row">
      <div><span>{label}</span><b>{money(value)}</b></div>
      <div className="bar-track"><span style={{ width: `${Math.max(8, (value / max) * 100)}%` }} /></div>
    </div>
  );
}

function Sales({ state, updateState }) {
  const [draft, setDraft] = useState({
    date: today,
    clientId: state.clients[0]?.id || '',
    productId: state.products[0]?.id || '',
    quantity: 1,
    status: 'Cobrado',
    note: '',
  });
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const selectedProduct = state.products.find((item) => item.id === draft.productId);
  const previewSubtotal = Number(selectedProduct?.price || 0) * Number(draft.quantity || 0);
  const previewIva = selectedProduct?.iva ? previewSubtotal * state.business.ivaRate : 0;

  const rows = state.sales.filter((sale) => {
    const client = state.clients.find((item) => item.id === sale.clientId)?.name || '';
    const product = state.products.find((item) => item.id === sale.productId)?.name || '';
    return `${client} ${product} ${sale.note}`.toLowerCase().includes(search.toLowerCase());
  });

  function addSale(event) {
    event.preventDefault();
    const product = state.products.find((item) => item.id === draft.productId);
    const subtotal = Number(product.price) * Number(draft.quantity);
    const iva = product.iva ? subtotal * state.business.ivaRate : 0;
    const next = {
      ...draft,
      id: uid('s'),
      quantity: Number(draft.quantity),
      subtotal,
      iva,
      total: subtotal + iva,
    };
    updateState({ ...state, sales: [next, ...state.sales] });
    setDraft({ ...draft, quantity: 1, note: '' });
  }

  async function copySriSummary(sale) {
    const client = state.clients.find((item) => item.id === sale.clientId);
    const product = state.products.find((item) => item.id === sale.productId);
    const text = [
      'Datos para Facturador SRI - Dreams Contabilidad',
      `Fecha: ${sale.date}`,
      `Cliente: ${client?.name || ''}`,
      `RUC/Cedula: ${client?.ruc || ''}`,
      `Correo: ${client?.email || ''}`,
      `Producto/Servicio: ${product?.name || ''}`,
      `Cantidad: ${sale.quantity}`,
      `Subtotal: ${money(sale.subtotal)}`,
      `IVA: ${money(sale.iva)}`,
      `Total: ${money(sale.total)}`,
      `Nota: ${sale.note || ''}`,
    ].join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedId(sale.id);
    window.setTimeout(() => setCopiedId(''), 1800);
  }

  return (
    <main className="two-column">
      <FormPanel title="Nueva venta" icon={FilePlus2}>
        <form onSubmit={addSale} className="form-grid">
          <Field label="Fecha"><input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field>
          <Field label="Cliente">
            <select value={draft.clientId} onChange={(e) => setDraft({ ...draft, clientId: e.target.value })}>
              {state.clients.map((client) => <option value={client.id} key={client.id}>{client.name}</option>)}
            </select>
          </Field>
          <Field label="Producto o servicio">
            <select value={draft.productId} onChange={(e) => setDraft({ ...draft, productId: e.target.value })}>
              {state.products.map((product) => <option value={product.id} key={product.id}>{product.name} - {money(product.price)}</option>)}
            </select>
          </Field>
          <Field label="Cantidad"><input min="1" step="1" type="number" value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: e.target.value })} /></Field>
          <Field label="Estado">
            <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              <option>Cobrado</option>
              <option>Pendiente</option>
            </select>
          </Field>
          <Field label="Nota"><textarea value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} /></Field>
          <div className="live-total">
            <span>Subtotal {money(previewSubtotal)}</span>
            <span>IVA {money(previewIva)}</span>
            <strong>Total {money(previewSubtotal + previewIva)}</strong>
          </div>
          <button className="primary-button full" type="submit"><Plus size={18} /> Registrar venta</button>
        </form>
      </FormPanel>
      <DataPanel title="Historial de ventas" search={search} setSearch={setSearch}>
        <table>
          <thead>
            <tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Total</th><th>Estado</th><th>Factura</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.date}</td>
                <td>{state.clients.find((client) => client.id === sale.clientId)?.name}</td>
                <td>{state.products.find((product) => product.id === sale.productId)?.name}</td>
                <td>{money(sale.total)}</td>
                <td><span className={`status ${sale.status === 'Cobrado' ? 'paid' : 'pending'}`}>{sale.status}</span></td>
                <td>
                  <div className="sri-actions">
                    <button className="sri-link" onClick={() => copySriSummary(sale)}>
                      {copiedId === sale.id ? 'Copiado' : 'Copiar datos'}
                    </button>
                    <a className="sri-link" href={SRI_FACTURADOR_URL} target="_blank" rel="noreferrer">
                      SRI <ExternalLink size={14} />
                    </a>
                  </div>
                </td>
                <td><IconButton label="Eliminar" onClick={() => updateState({ ...state, sales: state.sales.filter((item) => item.id !== sale.id) })}><Trash2 size={16} /></IconButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataPanel>
    </main>
  );
}

function Expenses({ state, updateState }) {
  const [draft, setDraft] = useState({
    date: today,
    supplier: '',
    category: 'Materia prima',
    description: '',
    subtotal: 0,
    status: 'Pagado',
  });
  const expenseSubtotal = Number(draft.subtotal || 0);
  const expenseIva = expenseSubtotal * state.business.ivaRate;

  function addExpense(event) {
    event.preventDefault();
    const subtotal = Number(draft.subtotal);
    const iva = subtotal * state.business.ivaRate;
    const next = { ...draft, id: uid('e'), subtotal, iva, total: subtotal + iva };
    updateState({ ...state, expenses: [next, ...state.expenses] });
    setDraft({ ...draft, supplier: '', description: '', subtotal: 0 });
  }

  return (
    <main className="two-column">
      <FormPanel title="Nuevo gasto" icon={CircleDollarSign}>
        <form onSubmit={addExpense} className="form-grid">
          <Field label="Fecha"><input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field>
          <Field label="Proveedor"><input value={draft.supplier} onChange={(e) => setDraft({ ...draft, supplier: e.target.value })} required /></Field>
          <Field label="Categoría">
            <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
              <option>Materia prima</option>
              <option>Servicios básicos</option>
              <option>Marketing</option>
              <option>Mantenimiento</option>
              <option>Sueldos</option>
              <option>Otros</option>
            </select>
          </Field>
          <Field label="Subtotal"><input min="0" step="0.01" type="number" value={draft.subtotal} onChange={(e) => setDraft({ ...draft, subtotal: e.target.value })} /></Field>
          <Field label="Estado">
            <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              <option>Pagado</option>
              <option>Pendiente</option>
            </select>
          </Field>
          <Field label="Descripción"><textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} required /></Field>
          <div className="live-total">
            <span>Subtotal {money(expenseSubtotal)}</span>
            <span>IVA {money(expenseIva)}</span>
            <strong>Total {money(expenseSubtotal + expenseIva)}</strong>
          </div>
          <button className="primary-button full" type="submit"><Plus size={18} /> Registrar gasto</button>
        </form>
      </FormPanel>
      <DataPanel title="Historial de gastos">
        <table>
          <thead>
            <tr><th>Fecha</th><th>Proveedor</th><th>Categoría</th><th>Total</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {state.expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.date}</td>
                <td>{expense.supplier}</td>
                <td>{expense.category}</td>
                <td>{money(expense.total)}</td>
                <td><span className={`status ${expense.status === 'Pagado' ? 'paid' : 'pending'}`}>{expense.status}</span></td>
                <td><IconButton label="Eliminar" onClick={() => updateState({ ...state, expenses: state.expenses.filter((item) => item.id !== expense.id) })}><Trash2 size={16} /></IconButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataPanel>
    </main>
  );
}

function Products({ state, updateState }) {
  const empty = { name: '', category: 'Servicio láser CO2', unit: 'unidad', price: 0, cost: 0, iva: true, stock: 0 };
  const [draft, setDraft] = useState(empty);

  function addProduct(event) {
    event.preventDefault();
    const next = { ...draft, id: uid('p'), price: Number(draft.price), cost: Number(draft.cost), stock: Number(draft.stock) };
    updateState({ ...state, products: [next, ...state.products] });
    setDraft(empty);
  }

  return (
    <main className="two-column">
      <FormPanel title="Nuevo producto" icon={Boxes}>
        <form onSubmit={addProduct} className="form-grid">
          <Field label="Nombre"><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></Field>
          <Field label="Categoría"><input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></Field>
          <Field label="Unidad"><input value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} /></Field>
          <Field label="Precio"><input min="0" step="0.01" type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></Field>
          <Field label="Costo"><input min="0" step="0.01" type="number" value={draft.cost} onChange={(e) => setDraft({ ...draft, cost: e.target.value })} /></Field>
          <Field label="Stock"><input min="0" step="1" type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} /></Field>
          <label className="check"><input type="checkbox" checked={draft.iva} onChange={(e) => setDraft({ ...draft, iva: e.target.checked })} /> Aplica IVA</label>
          <button className="primary-button full" type="submit"><Plus size={18} /> Guardar producto</button>
        </form>
      </FormPanel>
      <DataPanel title="Catálogo editable">
        <div className="product-grid">
          {state.products.map((product) => (
            <article className="product-card" key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <span>{product.category}</span>
              </div>
              <div className="product-meta">
                <b>{money(product.price)}</b>
                <span>Stock {product.stock}</span>
                <span>{product.iva ? 'IVA 15%' : 'IVA 0%'}</span>
              </div>
              <button onClick={() => updateState({ ...state, products: state.products.filter((item) => item.id !== product.id) })}>
                <Trash2 size={16} /> Eliminar
              </button>
            </article>
          ))}
        </div>
      </DataPanel>
    </main>
  );
}

function Clients({ state, updateState }) {
  const empty = { name: '', ruc: '', city: '', email: '' };
  const [draft, setDraft] = useState(empty);

  function addClient(event) {
    event.preventDefault();
    updateState({ ...state, clients: [{ ...draft, id: uid('c') }, ...state.clients] });
    setDraft(empty);
  }

  return (
    <main className="two-column">
      <FormPanel title="Nuevo cliente" icon={UsersRound}>
        <form onSubmit={addClient} className="form-grid">
          <Field label="Nombre comercial"><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></Field>
          <Field label="RUC / cédula"><input value={draft.ruc} onChange={(e) => setDraft({ ...draft, ruc: e.target.value })} /></Field>
          <Field label="Ciudad"><input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} /></Field>
          <Field label="Correo"><input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
          <button className="primary-button full" type="submit"><Plus size={18} /> Guardar cliente</button>
        </form>
      </FormPanel>
      <DataPanel title="Base de clientes">
        <table>
          <thead>
            <tr><th>Cliente</th><th>RUC</th><th>Ciudad</th><th>Correo</th><th></th></tr>
          </thead>
          <tbody>
            {state.clients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.ruc}</td>
                <td>{client.city}</td>
                <td>{client.email}</td>
                <td><IconButton label="Eliminar" onClick={() => updateState({ ...state, clients: state.clients.filter((item) => item.id !== client.id) })}><Trash2 size={16} /></IconButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataPanel>
    </main>
  );
}

function Reports({ state }) {
  const totals = computeTotals(state);
  const pendingSales = state.sales.filter((sale) => sale.status === 'Pendiente').reduce((sum, sale) => sum + sale.total, 0);
  const pendingExpenses = state.expenses.filter((expense) => expense.status === 'Pendiente').reduce((sum, expense) => sum + expense.total, 0);

  return (
    <main className="content-grid">
      <section className="metrics-grid">
        <Metric title="Base imponible ventas" value={money(totals.salesSubtotal)} hint="Ventas antes de IVA" />
        <Metric title="IVA cobrado" value={money(totals.salesIva)} hint="Crédito al SRI" />
        <Metric title="IVA pagado" value={money(totals.expensesIva)} hint="Crédito tributario" />
        <Metric title="Saldo IVA" value={money(totals.ivaDue)} hint="Referencia para declaración" />
      </section>
      <section className="panel wide">
        <div className="section-title">
          <div>
            <p className="eyebrow">Cuentas por cobrar y pagar</p>
            <h2>Compromisos abiertos</h2>
          </div>
          <ReceiptText size={20} />
        </div>
        <div className="split-summary">
          <Metric title="Por cobrar" value={money(pendingSales)} hint="Ventas pendientes" tone="warn" />
          <Metric title="Por pagar" value={money(pendingExpenses)} hint="Gastos pendientes" tone="warn" />
        </div>
      </section>
      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Modelo Ecuador</p>
            <h2>Indicadores a conectar</h2>
          </div>
          <BarChart3 size={20} />
        </div>
        <div className="tax-notes">
          <p>Inflación mensual, crecimiento del PIB y tasas activas pueden enlazarse después desde BCE.</p>
          <p>Retenciones, anexos y facturación electrónica pueden añadirse en una fase servidor con SRI.</p>
          <p>Este prototipo separa subtotal, IVA y total para facilitar declaraciones mensuales.</p>
        </div>
      </section>
    </main>
  );
}

function SettingsView({ state, updateState }) {
  const [business, setBusiness] = useState({
    ...state.business,
    ivaRate: Number(state.business.ivaRate * 100).toFixed(0),
  });

  function save(event) {
    event.preventDefault();
    updateState({ ...state, business: { ...business, ivaRate: Number(business.ivaRate) / 100 } });
  }

  function reset() {
    localStorage.removeItem('dreams-contabilidad-state');
    updateState(seedData);
  }

  return (
    <main className="two-column">
      <FormPanel title="Datos del negocio" icon={Settings}>
        <form className="form-grid" onSubmit={save}>
          <Field label="Nombre"><input value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} /></Field>
          <Field label="RUC"><input value={business.ruc} onChange={(e) => setBusiness({ ...business, ruc: e.target.value })} /></Field>
          <Field label="Ciudad"><input value={business.city} onChange={(e) => setBusiness({ ...business, city: e.target.value })} /></Field>
          <Field label="Actividad"><textarea value={business.activity} onChange={(e) => setBusiness({ ...business, activity: e.target.value })} /></Field>
          <Field label="IVA %"><input min="0" max="100" step="0.01" type="number" value={business.ivaRate} onChange={(e) => setBusiness({ ...business, ivaRate: e.target.value })} /></Field>
          <button className="primary-button full" type="submit"><Pencil size={18} /> Guardar ajustes</button>
        </form>
      </FormPanel>
      <div className="settings-stack">
        <section className="panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">Datos del prototipo</p>
              <h2>Administración</h2>
            </div>
            <Settings size={20} />
          </div>
          <div className="tax-notes">
            <p><strong>Usuario inicial:</strong> admin@dreams.ec</p>
            <p><strong>Contraseña inicial:</strong> Dreams2026!</p>
            <p><strong>Guardado actual:</strong> {cloudConfigured ? 'sincronización Supabase activa.' : 'local en este navegador.'}</p>
            <p><strong>Base continua:</strong> Supabase Auth + tabla app_states para datos compartidos.</p>
          </div>
          <button className="danger-button" onClick={reset}>Restaurar datos de prueba</button>
        </section>
        <section className="panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">Publicación</p>
              <h2>Nube y acceso remoto</h2>
            </div>
            <Cloud size={20} />
          </div>
          <div className="cloud-steps">
            <div><b>1</b><span>Subir el repositorio a GitHub.</span></div>
            <div><b>2</b><span>Activar GitHub Pages con Actions.</span></div>
            <div><b>3</b><span>Crear Supabase y ejecutar el esquema SQL.</span></div>
            <div><b>4</b><span>Configurar URL y clave anon en variables de entorno.</span></div>
          </div>
          <div className={`cloud-state ${cloudConfigured ? 'ready' : ''}`}>
            {cloudConfigured ? 'Supabase configurado: la app puede sincronizar datos.' : 'Supabase pendiente: la app funciona localmente hasta añadir credenciales.'}
          </div>
        </section>
      </div>
    </main>
  );
}

function FormPanel({ title, icon: Icon, children }) {
  return (
    <section className="panel">
      <div className="section-title">
        <h2>{title}</h2>
        <Icon size={20} />
      </div>
      {children}
    </section>
  );
}

function DataPanel({ title, children, search, setSearch }) {
  return (
    <section className="panel data-panel">
      <div className="section-title">
        <h2>{title}</h2>
        {setSearch && (
          <label className="search">
            <Search size={16} />
            <input placeholder="Buscar" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}

function IconButton({ children, label, onClick }) {
  return (
    <button className="icon-button" aria-label={label} title={label} onClick={onClick}>
      {children}
    </button>
  );
}

createRoot(document.getElementById('root')).render(<App />);
