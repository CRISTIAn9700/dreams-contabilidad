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
  Download,
  ExternalLink,
  EyeOff,
  FileSpreadsheet,
  FilePlus2,
  History,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Trash2,
  UsersRound,
  Zap,
} from 'lucide-react';
import './styles.css';
import {
  cloudReady,
  getCloudSession,
  loadCloudState,
  onCloudAuthStateChange,
  resetPasswordCloud,
  saveCloudState,
  signInCloud,
  signOutCloud,
  signUpCloud,
  updateCloudPassword,
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
const allowPublicSignup = !cloudConfigured || import.meta.env.VITE_ALLOW_PUBLIC_SIGNUP === 'true';
const APP_BASE = import.meta.env.BASE_URL || './';

function assetPath(path) {
  return `${APP_BASE}${path.replace(/^\//, '')}`;
}

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

function useInstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [installed, setInstalled] = useState(() => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone);

  useEffect(() => {
    function beforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }
    function appInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowHelp(false);
    }
    window.addEventListener('beforeinstallprompt', beforeInstallPrompt);
    window.addEventListener('appinstalled', appInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPrompt);
      window.removeEventListener('appinstalled', appInstalled);
    };
  }, []);

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    setShowHelp((current) => !current);
  }

  return {
    canInstall: Boolean(deferredPrompt),
    installed,
    install,
    showHelp,
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

function labelForMonth(monthKey) {
  if (!monthKey) return 'Todos los meses';
  const [year, monthIndex] = monthKey.split('-').map(Number);
  return formatLocalDate(new Date(year, monthIndex - 1, 1), {
    month: 'long',
    year: 'numeric',
  });
}

function labelForDay(dayKey) {
  if (!dayKey) return 'Todos los días';
  const [year, monthIndex, day] = dayKey.split('-').map(Number);
  return formatLocalDate(new Date(year, monthIndex - 1, day), {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function downloadExcelHtml(filename, sheets) {
  const style = `
    <style>
      body { font-family: Arial, sans-serif; }
      h1 { color: #071933; }
      h2 { color: #f97316; margin-top: 28px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
      th { background: #071933; color: #fff; }
      th, td { border: 1px solid #dce3ee; padding: 8px; text-align: left; }
      .number { mso-number-format:"0.00"; text-align: right; }
    </style>`;
  const content = sheets.map((sheet) => {
    const rows = sheet.rows.map((row) => (
      `<tr>${row.map((cell, index) => `<td${index >= sheet.textColumns ? ' class="number"' : ''}>${escapeHtml(cell)}</td>`).join('')}</tr>`
    )).join('');
    return `<h2>${escapeHtml(sheet.title)}</h2><table><thead><tr>${sheet.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
  }).join('');
  const html = `<!doctype html><html><head><meta charset="UTF-8">${style}</head><body><h1>Dreams Contabilidad</h1>${content}</body></html>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [state, setState] = useState(loadState);
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('dreams-contabilidad-session') || 'null'));
  const [view, setView] = useState('panel');
  const [syncStatus, setSyncStatus] = useState(cloudConfigured ? 'Conectando nube' : 'Modo local');
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const localClock = useLocalClock();
  const installApp = useInstallApp();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(assetPath('sw.js')).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!cloudConfigured) return undefined;
    const { data } = onCloudAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

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
    if (!allowPublicSignup) {
      return { ok: false, message: 'El registro público está cerrado. Crea o invita usuarios desde Supabase para mantener el acceso privado.' };
    }
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

  async function recoverPassword(email) {
    if (!cloudConfigured) {
      return { ok: false, message: 'La recuperación por correo se activa cuando la app está conectada a Supabase.' };
    }
    await resetPasswordCloud(email);
    return { ok: true, message: 'Te enviamos un correo con el enlace para crear una nueva contraseña.' };
  }

  async function changeRecoveredPassword(password) {
    await updateCloudPassword(password);
    setPasswordRecovery(false);
    setSyncStatus('Contraseña actualizada');
  }

  async function logout() {
    if (cloudConfigured) {
      await signOutCloud();
      setSyncStatus('Modo nube listo');
    }
    localStorage.removeItem('dreams-contabilidad-session');
    setSession(null);
  }

  if (passwordRecovery) {
    return <PasswordResetScreen onSave={changeRecoveredPassword} />;
  }

  if (!session) {
    return <LoginScreen onLogin={login} onRegister={registerUser} onRecover={recoverPassword} allowSignup={allowPublicSignup} />;
  }

  return (
    <Shell session={session} view={view} setView={setView} logout={logout} syncStatus={syncStatus} localClock={localClock} installApp={installApp}>
      {view === 'panel' && <Dashboard state={state} setView={setView} localClock={localClock} />}
      {view === 'ventas' && <Sales state={state} updateState={updateState} />}
      {view === 'gastos' && <Expenses state={state} updateState={updateState} />}
      {view === 'productos' && <Products state={state} updateState={updateState} />}
      {view === 'clientes' && <Clients state={state} updateState={updateState} />}
      {view === 'historico' && <HistoryView state={state} />}
      {view === 'reportes' && <Reports state={state} />}
      {view === 'ajustes' && <SettingsView state={state} updateState={updateState} />}
    </Shell>
  );
}

function LoginScreen({ onLogin, onRegister, onRecover, allowSignup }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('Nuevo usuario Dreams');
  const [email, setEmail] = useState(cloudConfigured ? '' : 'admin@dreams.ec');
  const [password, setPassword] = useState(cloudConfigured ? '' : 'Dreams2026!');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (mode === 'login') {
        if (!(await onLogin(email.trim(), password))) setError('Usuario o contraseña incorrectos.');
        return;
      }
      if (mode === 'recover') {
        if (!email.trim()) {
          setError('Escribe el correo de tu cuenta.');
          return;
        }
        const result = await onRecover(email.trim());
        if (result.ok) setNotice(result.message);
        else setError(result.message);
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
      <section className="login-hero" style={{ '--hero-image': `url("${assetPath('images/laser-co2-hero.png')}")` }}>
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
          <h2>{mode === 'recover' ? 'Recuperar contraseña' : mode === 'login' ? 'Ingresar' : 'Crear usuario'}</h2>
          <p>
            {mode === 'recover'
              ? 'Te enviaremos un enlace seguro al correo registrado.'
              : mode === 'login'
                ? cloudConfigured ? 'Accede con tu correo autorizado de Dreams.' : 'Usuario inicial incluido para probar el sistema.'
                : 'Crea un acceso local para otro miembro del equipo.'}
          </p>
        </div>
        <div className={`segmented ${allowSignup ? '' : 'single'}`}>
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Ingresar</button>
          {allowSignup && <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Crear usuario</button>}
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
        {mode !== 'recover' && (
          <label>
            Contraseña
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
        )}
        {error && <p className="form-error">{error}</p>}
        {notice && <p className="form-notice">{notice}</p>}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Procesando' : mode === 'recover' ? 'Enviar enlace' : mode === 'login' ? 'Entrar al panel' : 'Crear y entrar'}
        </button>
        {mode === 'login' && (
          <button className="link-button" type="button" onClick={() => setMode('recover')}>
            ¿Olvidaste tu contraseña?
          </button>
        )}
        {mode === 'recover' && (
          <button className="link-button" type="button" onClick={() => setMode('login')}>
            Volver al ingreso
          </button>
        )}
        <p className="demo-note">
          {cloudConfigured
            ? allowSignup ? 'Nube activa con Supabase Auth.' : 'Registro público cerrado para proteger la información financiera.'
            : mode === 'login' ? 'Demo: admin@dreams.ec / Dreams2026!' : 'Este usuario se guarda localmente en este navegador.'}
        </p>
      </form>
    </main>
  );
}

function PasswordResetScreen({ onSave }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Usa una contraseña de al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await onSave(password);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page password-page">
      <section className="login-hero" style={{ '--hero-image': `url("${assetPath('images/laser-co2-hero.png')}")` }}>
        <BrandLogo variant="inverse" size="hero" />
        <p className="eyebrow">Seguridad Dreams</p>
        <h1>Nueva contraseña</h1>
        <p>Completa este paso para recuperar tu acceso a Dreams Contabilidad.</p>
      </section>
      <form className="login-card" onSubmit={submit}>
        <div>
          <KeyRound size={24} />
          <h2>Actualizar acceso</h2>
          <p>El enlace de recuperación fue validado por Supabase.</p>
        </div>
        <label>
          Nueva contraseña
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </label>
        <label>
          Confirmar contraseña
          <input value={confirm} onChange={(event) => setConfirm(event.target.value)} type="password" />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Guardando' : 'Guardar nueva contraseña'}
        </button>
      </form>
    </main>
  );
}

function Shell({ children, session, view, setView, logout, syncStatus, localClock, installApp }) {
  const nav = [
    ['panel', 'Panel', LayoutDashboard],
    ['ventas', 'Ventas', ReceiptText],
    ['gastos', 'Gastos', CircleDollarSign],
    ['productos', 'Productos', Boxes],
    ['clientes', 'Clientes', UsersRound],
    ['historico', 'Histórico', History],
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
          {!installApp.installed && (
            <div className="install-wrap">
              <button className="install-chip" onClick={installApp.install}>
                <Smartphone size={18} />
                <span>{installApp.canInstall ? 'Instalar app' : 'Acceso rápido'}</span>
              </button>
              {installApp.showHelp && (
                <div className="install-help">
                  En celular: abre el menú del navegador y elige “Agregar a pantalla de inicio”.
                </div>
              )}
            </div>
          )}
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
    historico: 'Histórico de ventas',
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
  const src = assetPath(variant === 'inverse' ? 'brand/dreams-logo-inverse.png' : 'brand/dreams-logo-primary.png');
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

function HistoryView({ state }) {
  const availableYears = [...new Set(state.sales.map((sale) => sale.date?.slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  const [year, setYear] = useState(availableYears[0] || today.slice(0, 4));
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [focusInsight, setFocusInsight] = useState('');
  const months = Array.from({ length: 12 }, (_, index) => `${year}-${String(index + 1).padStart(2, '0')}`);
  const days = month ? calendarDaysForMonth(month).filter(Boolean) : [];
  const rows = state.sales
    .filter((sale) => !year || sale.date?.startsWith(year))
    .filter((sale) => !month || sale.date?.startsWith(month))
    .filter((sale) => !day || sale.date === day)
    .sort((a, b) => b.date.localeCompare(a.date));
  const totals = computeTotals({ ...state, sales: rows, expenses: [] });
  const grouped = rows.reduce((acc, sale) => {
    const monthKey = sale.date.slice(0, 7);
    const dayKey = sale.date;
    acc[monthKey] ||= {};
    acc[monthKey][dayKey] ||= [];
    acc[monthKey][dayKey].push(sale);
    return acc;
  }, {});
  const enrichedRows = rows.map((sale) => {
    const client = state.clients.find((item) => item.id === sale.clientId);
    const product = state.products.find((item) => item.id === sale.productId);
    const estimatedCost = Number(product?.cost || 0) * Number(sale.quantity || 0);
    return {
      ...sale,
      clientName: client?.name || 'Cliente sin nombre',
      productName: product?.name || 'Producto sin nombre',
      estimatedCost,
      estimatedProfit: Number(sale.subtotal || 0) - estimatedCost,
    };
  });
  const clientStats = summarizeBy(enrichedRows, (sale) => sale.clientName)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
  const monthStats = months.map((monthKey) => {
    const monthRows = enrichedRows.filter((sale) => sale.date?.startsWith(monthKey));
    return summarizeRows(labelForMonth(monthKey), monthRows);
  });
  const activeMonthStats = monthStats.filter((item) => item.count > 0);
  const dayStats = Object.entries(
    enrichedRows.reduce((acc, sale) => {
      acc[sale.date] ||= [];
      acc[sale.date].push(sale);
      return acc;
    }, {})
  )
    .map(([dateKey, dateRows]) => summarizeRows(labelForDay(dateKey), dateRows, dateKey))
    .sort((a, b) => b.total - a.total)
    .slice(0, 7);
  const productStats = summarizeBy(enrichedRows, (sale) => sale.productName)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);
  const bestClient = clientStats[0];
  const bestMonth = [...activeMonthStats].sort((a, b) => b.profit - a.profit)[0];
  const bestDay = dayStats[0];
  const bestProduct = productStats[0];

  function saleDetail(sale) {
    return {
      client: state.clients.find((client) => client.id === sale.clientId),
      product: state.products.find((product) => product.id === sale.productId),
    };
  }

  function exportAccountantReport() {
    const byMonth = Object.entries(grouped).map(([monthKey, daysByMonth]) => {
      const monthRows = Object.values(daysByMonth).flat();
      const monthTotals = computeTotals({ ...state, sales: monthRows, expenses: [] });
      return [labelForMonth(monthKey), monthRows.length, monthTotals.salesSubtotal, monthTotals.salesIva, monthTotals.salesTotal];
    });
    const byDay = Object.entries(grouped).flatMap(([, daysByMonth]) => (
      Object.entries(daysByMonth).map(([dayKey, dayRows]) => {
        const dayTotals = computeTotals({ ...state, sales: dayRows, expenses: [] });
        return [labelForDay(dayKey), dayRows.length, dayTotals.salesSubtotal, dayTotals.salesIva, dayTotals.salesTotal];
      })
    ));
    const detailRows = rows.map((sale) => {
      const { client, product } = saleDetail(sale);
      return [
        sale.date,
        client?.name || '',
        client?.ruc || '',
        product?.name || '',
        sale.quantity,
        sale.status,
        sale.subtotal,
        sale.iva,
        sale.total,
        sale.note || '',
      ];
    });
    downloadExcelHtml(`dreams-ventas-${year || 'todo'}${month ? `-${month.slice(5)}` : ''}${day ? `-${day.slice(-2)}` : ''}.xls`, [
      {
        title: 'Resumen para contador',
        headers: ['Periodo', 'Ventas', 'Subtotal', 'IVA', 'Total'],
        rows: [[day ? labelForDay(day) : month ? labelForMonth(month) : year, rows.length, totals.salesSubtotal, totals.salesIva, totals.salesTotal]],
        textColumns: 2,
      },
      {
        title: 'Resumen por mes',
        headers: ['Mes', 'Ventas', 'Subtotal', 'IVA', 'Total'],
        rows: byMonth,
        textColumns: 2,
      },
      {
        title: 'Resumen por dia',
        headers: ['Dia', 'Ventas', 'Subtotal', 'IVA', 'Total'],
        rows: byDay,
        textColumns: 2,
      },
      {
        title: 'Detalle de ventas',
        headers: ['Fecha', 'Cliente', 'RUC/Cedula', 'Producto', 'Cantidad', 'Estado', 'Subtotal', 'IVA', 'Total', 'Nota'],
        rows: detailRows,
        textColumns: 6,
      },
    ]);
  }

  return (
    <main className="content-grid">
      <section className="hero-panel history-hero">
        <div>
          <p className="eyebrow">Año fiscal y operación</p>
          <h2>Ventas ordenadas por año, mes y día</h2>
          <p>Filtra periodos, revisa totales con IVA y descarga un archivo compatible con Excel para entregar al contador.</p>
        </div>
        <button className="primary-button" onClick={exportAccountantReport} disabled={!rows.length}>
          <Download size={18} /> Descargar reporte Excel
        </button>
      </section>
      <section className="metrics-grid">
        <Metric title="Ventas filtradas" value={rows.length} hint="Registros encontrados" tone="brand" />
        <Metric title="Subtotal" value={money(totals.salesSubtotal)} hint="Base imponible" />
        <Metric title="IVA cobrado" value={money(totals.salesIva)} hint={`IVA ${Math.round(state.business.ivaRate * 100)}%`} tone="warn" />
        <Metric title="Total facturado" value={money(totals.salesTotal)} hint="Incluye IVA" tone="good" />
      </section>
      <section className="panel wide">
        <div className="section-title">
          <div>
            <p className="eyebrow">Filtros</p>
            <h2>Periodo contable</h2>
          </div>
          <FileSpreadsheet size={20} />
        </div>
        <div className="filters-grid">
          <Field label="Año">
            <select value={year} onChange={(event) => { setYear(event.target.value); setMonth(''); setDay(''); }}>
              {availableYears.length ? availableYears.map((item) => <option key={item}>{item}</option>) : <option>{today.slice(0, 4)}</option>}
            </select>
          </Field>
          <Field label="Mes">
            <select value={month} onChange={(event) => { setMonth(event.target.value); setDay(''); }}>
              <option value="">Todos los meses</option>
              {months.map((item) => <option value={item} key={item}>{labelForMonth(item)}</option>)}
            </select>
          </Field>
          <Field label="Día">
            <select value={day} onChange={(event) => setDay(event.target.value)} disabled={!month}>
              <option value="">Todos los días</option>
              {days.map((item) => <option value={item} key={item}>{labelForDay(item)}</option>)}
            </select>
          </Field>
        </div>
      </section>
      <section className="panel analytics-panel wide">
        <div className="section-title">
          <div>
            <p className="eyebrow">Análisis estadístico</p>
            <h2>Clientes, temporadas y rentabilidad</h2>
          </div>
          <BarChart3 size={20} />
        </div>
        <div className="insight-grid">
          <InsightCard title="Cliente principal" value={bestClient?.label || 'Sin datos'} hint={bestClient ? `${bestClient.count} venta(s) · ${money(bestClient.total)}` : 'Registra ventas para analizar'} />
          <InsightCard title="Mes más rentable" value={bestMonth?.label || 'Sin datos'} hint={bestMonth ? `Utilidad estimada ${money(bestMonth.profit)}` : 'Aparecerá con más ventas'} />
          <InsightCard title="Día más fuerte" value={bestDay?.label || 'Sin datos'} hint={bestDay ? `${money(bestDay.total)} facturado` : 'Filtra o registra ventas'} />
          <InsightCard title="Producto estrella" value={bestProduct?.label || 'Sin datos'} hint={bestProduct ? `Margen estimado ${money(bestProduct.profit)}` : 'Según precio y costo'} />
        </div>
        <div className="analytics-grid">
          <InsightBarChart
            title="Clientes que más compran"
            rows={clientStats}
            selected={focusInsight}
            onSelect={setFocusInsight}
            empty="Aún no hay clientes con ventas en este periodo."
          />
          <InsightBarChart
            title="Meses con mayor facturación"
            rows={activeMonthStats}
            selected={focusInsight}
            onSelect={setFocusInsight}
            empty="Selecciona un año con ventas para ver meses fuertes."
          />
          <InsightBarChart
            title="Días pico de venta"
            rows={dayStats}
            selected={focusInsight}
            onSelect={setFocusInsight}
            empty="Aún no hay días con ventas en este filtro."
          />
          <ProfitChart
            title="Meses más rentables"
            rows={activeMonthStats}
            selected={focusInsight}
            onSelect={setFocusInsight}
          />
        </div>
      </section>
      <section className="panel wide">
        <div className="section-title">
          <div>
            <p className="eyebrow">Detalle histórico</p>
            <h2>{rows.length ? `${rows.length} registros` : 'Sin ventas en este periodo'}</h2>
          </div>
          <History size={20} />
        </div>
        <div className="history-tree">
          {Object.entries(grouped).map(([monthKey, daysByMonth]) => (
            <div className="history-group" key={monthKey}>
              <h3>{labelForMonth(monthKey)}</h3>
              {Object.entries(daysByMonth).map(([dayKey, dayRows]) => {
                const dayTotals = computeTotals({ ...state, sales: dayRows, expenses: [] });
                return (
                  <div className="history-day" key={dayKey}>
                    <div className="history-day-title">
                      <strong>{labelForDay(dayKey)}</strong>
                      <span>{money(dayTotals.salesTotal)}</span>
                    </div>
                    {dayRows.map((sale) => {
                      const { client, product } = saleDetail(sale);
                      return (
                        <div className="history-sale" key={sale.id}>
                          <div>
                            <strong>{client?.name}</strong>
                            <span>{product?.name} · {sale.quantity} unidad(es)</span>
                          </div>
                          <b>{money(sale.total)}</b>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
          {!rows.length && <p className="empty-state">Cuando registres ventas de este periodo aparecerán aquí automáticamente.</p>}
        </div>
      </section>
      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Continuidad</p>
            <h2>Año tras año</h2>
          </div>
          <CalendarDays size={20} />
        </div>
        <div className="tax-notes">
          <p><strong>Guardado:</strong> cada venta queda con su fecha exacta y no se cierra al cambiar de mes o año.</p>
          <p><strong>Escalable:</strong> puedes seguir registrando junio, julio, diciembre y el siguiente año sin perder el historial.</p>
          <p><strong>Exportación:</strong> descarga el periodo filtrado para revisión contable y respaldo externo.</p>
        </div>
      </section>
    </main>
  );
}

function summarizeRows(label, rows, id = label) {
  return rows.reduce((acc, sale) => ({
    ...acc,
    count: acc.count + 1,
    quantity: acc.quantity + Number(sale.quantity || 0),
    subtotal: acc.subtotal + Number(sale.subtotal || 0),
    total: acc.total + Number(sale.total || 0),
    profit: acc.profit + Number(sale.estimatedProfit || 0),
  }), { id, label, count: 0, quantity: 0, subtotal: 0, total: 0, profit: 0 });
}

function summarizeBy(rows, getLabel) {
  const grouped = rows.reduce((acc, sale) => {
    const label = getLabel(sale);
    acc[label] ||= [];
    acc[label].push(sale);
    return acc;
  }, {});
  return Object.entries(grouped).map(([label, saleRows]) => summarizeRows(label, saleRows));
}

function InsightCard({ title, value, hint }) {
  return (
    <article className="insight-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

function InsightBarChart({ title, rows, selected, onSelect, empty }) {
  const max = Math.max(...rows.map((row) => row.total), 1);
  return (
    <div className="chart-card">
      <div className="chart-title">
        <h3>{title}</h3>
        <span>Total facturado</span>
      </div>
      <div className="chart-bars">
        {rows.map((row) => (
          <button className={selected === row.id ? 'active' : ''} key={row.id} onClick={() => onSelect(selected === row.id ? '' : row.id)}>
            <span>{row.label}</span>
            <div><i style={{ width: `${Math.max(8, (row.total / max) * 100)}%` }} /></div>
            <b>{money(row.total)}</b>
            {selected === row.id && <em>{row.count} venta(s), utilidad estimada {money(row.profit)}</em>}
          </button>
        ))}
        {!rows.length && <p className="empty-state">{empty}</p>}
      </div>
    </div>
  );
}

function ProfitChart({ title, rows, selected, onSelect }) {
  const sorted = [...rows].sort((a, b) => b.profit - a.profit).slice(0, 6);
  const max = Math.max(...sorted.map((row) => Math.abs(row.profit)), 1);
  return (
    <div className="chart-card">
      <div className="chart-title">
        <h3>{title}</h3>
        <span>Precio - costo del producto</span>
      </div>
      <div className="profit-bars">
        {sorted.map((row) => (
          <button className={selected === `profit-${row.id}` ? 'active' : ''} key={row.id} onClick={() => onSelect(selected === `profit-${row.id}` ? '' : `profit-${row.id}`)}>
            <span>{row.label}</span>
            <div><i style={{ height: `${Math.max(12, (Math.abs(row.profit) / max) * 100)}%` }} /></div>
            <b>{money(row.profit)}</b>
          </button>
        ))}
        {!sorted.length && <p className="empty-state">Cuando existan ventas se calculará la rentabilidad estimada.</p>}
      </div>
    </div>
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
            <p><strong>Acceso:</strong> {cloudConfigured ? 'usuarios autorizados con Supabase Auth.' : 'usuario demo local para pruebas.'}</p>
            {!cloudConfigured && <p><strong>Demo:</strong> admin@dreams.ec / Dreams2026!</p>}
            <p><strong>Guardado actual:</strong> {cloudConfigured ? 'sincronización Supabase activa.' : 'local en este navegador.'}</p>
            <p><strong>Base continua:</strong> Supabase Auth + tabla app_states para datos compartidos.</p>
          </div>
          <button className="danger-button" onClick={reset}>Restaurar datos de prueba</button>
        </section>
        <section className="panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">Privacidad</p>
              <h2>Protección de acceso</h2>
            </div>
            <ShieldCheck size={20} />
          </div>
          <div className="security-list">
            <div><EyeOff size={18} /><span>La página pide a buscadores que no la indexen ni la muestren en resultados.</span></div>
            <div><LockKeyhole size={18} /><span>Los datos contables se guardan por usuario en Supabase con acceso autenticado.</span></div>
            <div><KeyRound size={18} /><span>La recuperación de contraseña se hace por correo y enlace seguro.</span></div>
          </div>
          <p className="security-note">Importante: GitHub Pages muestra la aplicación públicamente, pero no los datos. Para máxima privacidad futura conviene moverla a un hosting con acceso restringido o dominio privado.</p>
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
            <div><b>1</b><span>Repositorio publicado en GitHub Pages.</span></div>
            <div><b>2</b><span>Supabase activo para usuarios, contraseña y guardado en nube.</span></div>
            <div><b>3</b><span>Registro público cerrado desde la app publicada.</span></div>
            <div><b>4</b><span>La app puede crecer con inventario, facturación y reportes adicionales.</span></div>
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
