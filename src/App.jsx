import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownLeft, ArrowUpRight, Bird, Boxes, BriefcaseBusiness,
  CalendarDays, Check, ChevronDown, CircleDollarSign, Clock3, Droplets,
  Egg, FileText, Flame, LayoutDashboard, Leaf, LogOut, Menu, Pencil,
  Plus, Search, Settings2, ShieldCheck, ShoppingBag, Trash2, TrendingUp,
  Users, Wallet, X, Zap,
} from 'lucide-react'
import { supabase, supabaseConfigured } from './supabaseClient'

const navItems = [
  { id: 'overview', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'daily_records', label: 'متابعة الدورة اليومية', icon: Activity },
  { id: 'feed_invoices', label: 'فواتير العلف', icon: Leaf },
  { id: 'gas_records', label: 'أنابيب الغاز', icon: Flame },
  { id: 'electricity_bills', label: 'فواتير الكهرباء', icon: Zap },
  { id: 'workers', label: 'سجل العمال', icon: Users },
  { id: 'expenses', label: 'مصاريف إضافية', icon: Wallet },
  { id: 'merchant_sales', label: 'حسابات التجار', icon: ShoppingBag },
]

const sectionConfig = {
  daily_records: {
    title: 'متابعة الدورة اليومية', subtitle: 'سجّل تفاصيل الدورة من اليوم الأول حتى اليوم 42.',
    icon: Activity, addLabel: 'إضافة سجل يومي', table: 'daily_records',
    fields: [
      { key: 'day_number', label: 'عمر الكتاكيت (اليوم)', type: 'number', required: true, min: 1, max: 42 },
      { key: 'feed_bags', label: 'سحب العلف (شكارة)', type: 'number', min: 0, step: '0.1' },
      { key: 'daily_deaths', label: 'النافق اليومي', type: 'number', min: 0 },
      { key: 'medicine', label: 'الأدوية / التحصينات', type: 'text' },
      { key: 'notes', label: 'ملاحظات', type: 'textarea', wide: true },
    ],
    columns: [
      ['day_number', 'عمر الدورة', 'day'], ['feed_bags', 'العلف (شكارة)', 'number'],
      ['daily_deaths', 'النافق اليومي', 'number'], ['cumulative_deaths', 'النافق التراكمي', 'number'],
      ['medicine', 'الأدوية والتحصينات', 'text'], ['notes', 'ملاحظات', 'text'],
    ],
    dateKey: 'record_date',
  },
  feed_invoices: {
    title: 'فواتير العلف', subtitle: 'تابع توريدات العلف وتكلفتها والموردين.',
    icon: Leaf, addLabel: 'إضافة فاتورة علف', table: 'feed_invoices',
    fields: [
      { key: 'supplier', label: 'الشركة / المورد', type: 'text', required: true },
      { key: 'feed_type', label: 'نوع العلف', type: 'select', options: [['بادي', 'بادي'], ['نامي', 'نامي'], ['ناهي', 'ناهي']] },
      { key: 'quantity_tons', label: 'الكمية (طن)', type: 'number', min: 0, step: '0.01' },
      { key: 'quantity_bags', label: 'الكمية (شكارة)', type: 'number', min: 0, step: '0.1' },
      { key: 'price_per_ton', label: 'سعر الطن (جنيه)', type: 'number', min: 0, step: '0.01' },
      { key: 'total_amount', label: 'إجمالي الفاتورة (جنيه)', type: 'number', min: 0, step: '0.01' },
      { key: 'received_on', label: 'تاريخ الاستلام', type: 'date', required: true },
    ],
    columns: [
      ['supplier', 'المورد', 'text'], ['feed_type', 'نوع العلف', 'text'], ['quantity_tons', 'الكمية (طن)', 'number'],
      ['quantity_bags', 'الشكائر', 'number'], ['price_per_ton', 'سعر الطن', 'money'], ['total_amount', 'الإجمالي', 'money'],
    ], dateKey: 'received_on',
  },
  gas_records: {
    title: 'أنابيب الغاز', subtitle: 'سجّل الوارد والاستهلاك لمتابعة حركة الأنابيب.',
    icon: Flame, addLabel: 'إضافة حركة غاز', table: 'gas_records',
    fields: [
      { key: 'received_count', label: 'عدد الأنابيب الواردة', type: 'number', min: 0 },
      { key: 'used_count', label: 'عدد الأنابيب المستهلكة', type: 'number', min: 0 },
      { key: 'price_per_cylinder', label: 'سعر الأنبوبة (جنيه)', type: 'number', min: 0, step: '0.01' },
      { key: 'total_amount', label: 'التكلفة الإجمالية (جنيه)', type: 'number', min: 0, step: '0.01' },
      { key: 'record_date', label: 'تاريخ الورود', type: 'date', required: true },
      { key: 'notes', label: 'ملاحظات', type: 'textarea', wide: true },
    ],
    columns: [
      ['received_count', 'الوارد', 'number'], ['used_count', 'المستهلك', 'number'],
      ['price_per_cylinder', 'سعر الأنبوبة', 'money'], ['total_amount', 'التكلفة', 'money'], ['notes', 'ملاحظات', 'text'],
    ], dateKey: 'record_date',
  },
  electricity_bills: {
    title: 'فواتير الكهرباء', subtitle: 'أرشيف قراءات العداد والفواتير المسددة.',
    icon: Zap, addLabel: 'إضافة فاتورة كهرباء', table: 'electricity_bills',
    fields: [
      { key: 'billing_month', label: 'الشهر / فترة الفاتورة', type: 'text', required: true, placeholder: 'مثال: أكتوبر 2026' },
      { key: 'meter_reading', label: 'قراءة العداد', type: 'number', min: 0, step: '0.01' },
      { key: 'amount', label: 'قيمة الفاتورة (جنيه)', type: 'number', min: 0, step: '0.01' },
      { key: 'paid_on', label: 'تاريخ الدفع', type: 'date' },
      { key: 'notes', label: 'ملاحظات', type: 'textarea', wide: true },
    ],
    columns: [
      ['billing_month', 'الشهر', 'text'], ['meter_reading', 'قراءة العداد', 'number'],
      ['amount', 'قيمة الفاتورة', 'money'], ['paid_on', 'تاريخ الدفع', 'date'],
    ], dateKey: 'paid_on',
  },
  workers: {
    title: 'سجل العمال', subtitle: 'إدارة أجور العمال والحضور والسلفيات.',
    icon: Users, addLabel: 'إضافة سجل عامل', table: 'workers',
    fields: [
      { key: 'worker_name', label: 'اسم العامل', type: 'text', required: true },
      { key: 'wage_type', label: 'نظام الأجر', type: 'select', options: [['يومي', 'يومي'], ['شهري', 'شهري']] },
      { key: 'wage_amount', label: 'قيمة الأجر (جنيه)', type: 'number', min: 0, step: '0.01' },
      { key: 'attendance_days', label: 'أيام الحضور', type: 'number', min: 0 },
      { key: 'absence_days', label: 'أيام الغياب', type: 'number', min: 0 },
      { key: 'advance_amount', label: 'السلفيات (جنيه)', type: 'number', min: 0, step: '0.01' },
      { key: 'record_date', label: 'تاريخ السجل', type: 'date', required: true },
      { key: 'notes', label: 'ملاحظات', type: 'textarea', wide: true },
    ],
    columns: [
      ['worker_name', 'اسم العامل', 'text'], ['wage_type', 'نظام الأجر', 'text'],
      ['wage_amount', 'الأجر', 'money'], ['attendance_days', 'الحضور', 'number'],
      ['absence_days', 'الغياب', 'number'], ['advance_amount', 'السلفيات', 'money'],
    ], dateKey: 'record_date',
  },
  expenses: {
    title: 'مصاريف إضافية', subtitle: 'سجّل مصروفات الصيانة والنثريات وغيرها.',
    icon: Wallet, addLabel: 'إضافة مصروف', table: 'expenses',
    fields: [
      { key: 'expense_name', label: 'اسم المصروف', type: 'text', required: true, placeholder: 'مثال: صيانة أو صواني' },
      { key: 'amount', label: 'المبلغ (جنيه)', type: 'number', required: true, min: 0, step: '0.01' },
      { key: 'spent_on', label: 'تاريخ الصرف', type: 'date', required: true },
      { key: 'notes', label: 'ملاحظات', type: 'textarea', wide: true },
    ],
    columns: [['expense_name', 'المصروف', 'text'], ['amount', 'المبلغ', 'money'], ['notes', 'ملاحظات', 'text']],
    dateKey: 'spent_on',
  },
  merchant_sales: {
    title: 'حسابات التجار', subtitle: 'تابع مبيعات الدواجن والمدفوعات والمتبقي لكل تاجر.',
    icon: ShoppingBag, addLabel: 'إضافة عملية بيع', table: 'merchant_sales',
    fields: [
      { key: 'merchant_name', label: 'اسم التاجر', type: 'text', required: true },
      { key: 'quantity_kg', label: 'الكمية (كيلو)', type: 'number', min: 0, step: '0.01' },
      { key: 'crates_count', label: 'عدد الأقفاص', type: 'number', min: 0 },
      { key: 'price_per_kg', label: 'سعر الكيلو (جنيه)', type: 'number', min: 0, step: '0.01' },
      { key: 'total_amount', label: 'المبلغ الإجمالي (جنيه)', type: 'number', required: true, min: 0, step: '0.01' },
      { key: 'paid_amount', label: 'المبلغ المدفوع (جنيه)', type: 'number', min: 0, step: '0.01' },
      { key: 'sold_on', label: 'تاريخ البيع', type: 'date', required: true },
      { key: 'notes', label: 'ملاحظات', type: 'textarea', wide: true },
    ],
    columns: [
      ['merchant_name', 'التاجر', 'text'], ['quantity_kg', 'الكمية (كجم)', 'number'],
      ['crates_count', 'الأقفاص', 'number'], ['price_per_kg', 'سعر الكيلو', 'money'],
      ['total_amount', 'الإجمالي', 'money'], ['paid_amount', 'المدفوع', 'money'], ['remaining_amount', 'المتبقي', 'money'],
    ], dateKey: 'sold_on',
  },
}

const today = () => new Date().toISOString().slice(0, 10)
const formatMoney = (value) => `${Number(value || 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 })} ج.م`
const showValue = (value, kind) => {
  if (value === null || value === undefined || value === '') return '—'
  if (kind === 'money') return formatMoney(value)
  if (kind === 'day') return `اليوم ${value}`
  if (kind === 'date') return new Date(`${value}T00:00:00`).toLocaleDateString('ar-EG')
  if (kind === 'number') return Number(value).toLocaleString('ar-EG')
  return value
}
const dateField = new Set(['record_date', 'received_on', 'paid_on', 'spent_on', 'sold_on'])

function AuthScreen({ setupError }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (result.error) setMessage(result.error.message)
    else if (mode === 'signup' && !result.data.session) setMessage('تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيده ثم سجّل الدخول.')
  }
  return (
    <main className="auth-page">
      <div className="auth-art">
        <div className="auth-art-orb orb-one" /><div className="auth-art-orb orb-two" />
        <div className="auth-brand"><span className="brand-mark"><Bird size={25} /></span><span>المالك</span></div>
        <div className="auth-message"><span className="eyebrow">إدارة أذكى لمزرعتك</span><h1>كل تفاصيل مزرعتك،<br />في مكان واحد.</h1><p>تابع دورتك اليومية ومصروفاتك ومبيعاتك بسهولة وأمان، من أي جهاز.</p><div className="auth-feature"><ShieldCheck size={18} /> بياناتك خاصة ومحمية بحسابك</div></div>
        <span className="auth-art-caption">ALMALEK · POULTRY FARM</span>
      </div>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><Bird size={23} /> المالك</div>
          <span className="eyebrow">مرحباً بك في مزرعتك</span>
          <h2>{mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
          <p className="auth-subtitle">أدخل بياناتك للوصول إلى لوحة إدارة المزرعة.</p>
          {!supabaseConfigured && <div className="setup-warning"><Settings2 size={18} /><span>{setupError || 'يلزم إعداد مفاتيح Supabase في ملف .env.local لتفعيل التطبيق.'}</span></div>}
          {message && <div className="inline-message">{message}</div>}
          <form onSubmit={submit}>
            <label className="form-label">البريد الإلكتروني<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></label>
            <label className="form-label">كلمة المرور<input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 أحرف على الأقل" /></label>
            <button className="button primary auth-submit" disabled={busy || !supabaseConfigured}>{busy ? 'جارٍ التنفيذ...' : mode === 'signin' ? 'دخول إلى المزرعة' : 'إنشاء الحساب'}<ArrowUpRight size={17} /></button>
          </form>
          <p className="auth-switch">{mode === 'signin' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'} <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }}>{mode === 'signin' ? 'أنشئ حساباً' : 'سجّل الدخول'}</button></p>
          <div className="auth-foot"><ShieldCheck size={15} /> تسجيل آمن عبر Supabase</div>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [sessionLoaded, setSessionLoaded] = useState(!supabaseConfigured)
  const [active, setActive] = useState('overview')
  const [rows, setRows] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data, error: authError }) => {
      if (authError) setError(authError.message)
      setSession(data.session)
      setSessionLoaded(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => subscription.unsubscribe()
  }, [])

  const loadAll = useCallback(async () => {
    if (!supabase || !session) return
    setLoading(true)
    setError('')
    const results = await Promise.all(Object.entries(sectionConfig).map(async ([key, config]) => {
      const { data, error: queryError } = await supabase.from(config.table).select('*').order(config.dateKey, { ascending: false })
      return { key, data, error: queryError }
    }))
    const failed = results.find((result) => result.error)
    if (failed) setError(`تعذر تحميل بيانات «${sectionConfig[failed.key].title}»: ${failed.error.message}`)
    else setRows(Object.fromEntries(results.map(({ key, data }) => [key, data || []])))
    setLoading(false)
  }, [session])

  useEffect(() => { loadAll() }, [loadAll])
  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 3500)
    return () => clearTimeout(timer)
  }, [notice])

  const totals = useMemo(() => {
    const sum = (items, key) => (items || []).reduce((total, item) => total + Number(item[key] || 0), 0)
    return {
      feed: sum(rows.feed_invoices, 'quantity_tons'),
      feedBags: sum(rows.feed_invoices, 'quantity_bags'),
      expenses: sum(rows.expenses, 'amount') + sum(rows.electricity_bills, 'amount') + sum(rows.gas_records, 'total_amount') + sum(rows.feed_invoices, 'total_amount'),
      birdsLost: (rows.daily_records || []).reduce((max, row) => Math.max(max, Number(row.cumulative_deaths || 0)), 0),
      sales: sum(rows.merchant_sales, 'total_amount'),
      remaining: sum(rows.merchant_sales, 'remaining_amount'),
      lastDay: Math.max(0, ...(rows.daily_records || []).map((row) => Number(row.day_number || 0))),
    }
  }, [rows])

  async function recalculateDailyTotals() {
    const { data, error: fetchError } = await supabase
      .from('daily_records')
      .select('id, day_number, daily_deaths, cumulative_deaths')
      .order('day_number', { ascending: true })
    if (fetchError) return fetchError

    let cumulativeDeaths = 0
    for (const row of data || []) {
      cumulativeDeaths += Number(row.daily_deaths || 0)
      if (Number(row.cumulative_deaths) === cumulativeDeaths) continue
      const { error: updateError } = await supabase
        .from('daily_records')
        .update({ cumulative_deaths: cumulativeDeaths })
        .eq('id', row.id)
      if (updateError) return updateError
    }
    return null
  }

  async function saveRecord(event) {
    event.preventDefault()
    const { section, record } = modal
    const config = sectionConfig[section]
    const formData = new FormData(event.currentTarget)
    const payload = { user_id: session.user.id }
    for (const field of config.fields) {
      const value = formData.get(field.key)
      payload[field.key] = field.type === 'number' ? (value === '' ? null : Number(value)) : (value || null)
    }
    if (section === 'merchant_sales') payload.remaining_amount = Math.max(0, Number(payload.total_amount || 0) - Number(payload.paid_amount || 0))
    if (section === 'merchant_sales' && Number(payload.paid_amount || 0) > Number(payload.total_amount || 0)) {
      setError('المبلغ المدفوع لا يمكن أن يتجاوز إجمالي البيع.')
      return
    }
    if (section === 'daily_records') {
      const daily = rows.daily_records || []
      const dayNumber = Number(payload.day_number)
      const previous = daily.find((row) => row.day_number === dayNumber && row.id !== record?.id)
      if (previous) {
        setError(`يوجد سجل بالفعل لليوم ${dayNumber}. عدّل السجل الموجود بدلاً من إضافة سجل مكرر.`)
        return
      }
      const priorDeaths = daily.filter((row) => row.day_number < dayNumber && row.id !== record?.id).reduce((max, row) => Math.max(max, Number(row.cumulative_deaths || 0)), 0)
      payload.cumulative_deaths = priorDeaths + Number(payload.daily_deaths || 0)
    }
    setLoading(true)
    setError('')
    const query = record
      ? supabase.from(config.table).update(payload).eq('id', record.id)
      : supabase.from(config.table).insert(payload)
    const { error: saveError } = await query
    setLoading(false)
    if (saveError) { setError(`تعذر حفظ البيانات: ${saveError.message}`); return }
    if (section === 'daily_records') {
    const recalculateError = await recalculateDailyTotals()
    if (recalculateError) {
      setModal(null)
      setError(`تم حفظ السجل، لكن تعذرت مزامنة النافق التراكمي للأيام اللاحقة: ${recalculateError.message}`)
      await loadAll()
      return
    }
    }
    setModal(null)
    setNotice(record ? 'تم تحديث السجل بنجاح.' : 'تمت إضافة السجل بنجاح.')
    await loadAll()
  }

  async function deleteRecord(section, record) {
    const config = sectionConfig[section]
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن الحذف.')) return
    setLoading(true)
    const { error: deleteError } = await supabase.from(config.table).delete().eq('id', record.id)
    setLoading(false)
    if (deleteError) { setError(`تعذر حذف السجل: ${deleteError.message}`); return }
    if (section === 'daily_records') {
      const recalculateError = await recalculateDailyTotals()
      if (recalculateError) {
        setError(`تم حذف السجل، لكن تعذرت مزامنة النافق التراكمي للأيام اللاحقة: ${recalculateError.message}`)
        await loadAll()
        return
      }
    }
    setNotice('تم حذف السجل.')
    await loadAll()
  }

  if (!sessionLoaded) return <div className="loading-screen"><div className="spinner" /><span>جارٍ الاتصال بالمزرعة...</span></div>
  if (!session) return <AuthScreen setupError={!supabaseConfigured ? 'أنشئ مشروع Supabase، ثم انسخ .env.example إلى .env.local وأضف رابط المشروع ومفتاح anon.' : ''} />

  const current = sectionConfig[active]
  const profileEmail = session.user.email || 'حساب المزرعة'
  const initials = profileEmail.slice(0, 1).toUpperCase()
  const openCreate = (section) => { setModal({ section, record: null }); setError(''); setMenuOpen(false) }
  const chooseSection = (id) => { setActive(id); setSearch(''); setMenuOpen(false); setError('') }

  return (
    <div className="app-shell">
      {menuOpen && <button className="mobile-scrim" aria-label="إغلاق القائمة" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><span className="brand-mark"><Bird size={22} /></span><span className="brand-copy"><strong>المالك</strong><small>إدارة مزرعة الدواجن</small></span><button className="icon-button sidebar-close" aria-label="إغلاق" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
        <div className="farm-chip"><span className="live-dot" /><span><strong>مزرعة المالك</strong><small>الدورة الحالية</small></span><ChevronDown size={15} /></div>
        <div className="nav-caption">القائمة الرئيسية</div>
        <nav className="side-nav">
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-link ${active === id ? 'nav-active' : ''}`} onClick={() => chooseSection(id)}><Icon size={18} /><span>{label}</span>{id === 'daily_records' && totals.lastDay > 0 && <span className="nav-count">{totals.lastDay}/42</span>}</button>)}
        </nav>
        <div className="sidebar-bottom"><div className="cycle-card"><div className="cycle-card-top"><span><Egg size={16} /> الدورة الحالية</span><span className="cycle-pct">{Math.min(100, Math.round(totals.lastDay / 42 * 100))}%</span></div><div className="progress-track"><span style={{ width: `${Math.min(100, totals.lastDay / 42 * 100)}%` }} /></div><small>اليوم {totals.lastDay} <span>من 42 يوماً</span></small></div><div className="user-strip"><span className="avatar">{initials}</span><span className="user-details"><strong>{profileEmail}</strong><small>مدير المزرعة</small></span><button className="icon-button logout-button" aria-label="تسجيل الخروج" title="تسجيل الخروج" onClick={() => supabase.auth.signOut()}><LogOut size={17} /></button></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="topbar-title"><button className="icon-button menu-toggle" aria-label="فتح القائمة" onClick={() => setMenuOpen(true)}><Menu size={21} /></button><div><span className="breadcrumb">المالك <span>/</span> {active === 'overview' ? 'نظرة عامة' : current.title}</span><strong>{active === 'overview' ? 'صباح الخير، أهلاً بك 👋' : current.title}</strong></div></div><div className="topbar-actions"><span className="today-date"><CalendarDays size={16} />{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span><span className="top-avatar">{initials}</span></div></header>
        <div className="content-wrap">
          {error && <div className="alert error-alert"><span>{error}</span><button className="icon-button" onClick={() => setError('')} aria-label="إغلاق"><X size={17} /></button></div>}
          {notice && <div className="alert success-alert"><Check size={17} /><span>{notice}</span></div>}
          {active === 'overview'
            ? <Dashboard rows={rows} totals={totals} onNavigate={chooseSection} onCreate={openCreate} loading={loading} />
            : <SectionPage section={active} config={current} records={rows[active] || []} loading={loading} search={search} setSearch={setSearch} onCreate={() => openCreate(active)} onEdit={(record) => setModal({ section: active, record })} onDelete={(record) => deleteRecord(active, record)} />}
          <footer className="page-footer"><span>المالك — إدارة مزرعة الدواجن</span><span><ShieldCheck size={14} /> بياناتك محفوظة بأمان</span></footer>
        </div>
      </main>
      {modal && <RecordModal modal={modal} onClose={() => setModal(null)} onSubmit={saveRecord} busy={loading} />}
    </div>
  )
}

function Dashboard({ rows, totals, onNavigate, onCreate, loading }) {
  const latestDaily = [...(rows.daily_records || [])].sort((a, b) => b.day_number - a.day_number).slice(0, 5)
  const recentSales = [...(rows.merchant_sales || [])].sort((a, b) => b.sold_on?.localeCompare(a.sold_on) || 0).slice(0, 4)
  const cards = [
    { label: 'علف مستلم', value: totals.feed ? `${totals.feed.toLocaleString('ar-EG')} طن` : `${totals.feedBags.toLocaleString('ar-EG')} شكارة`, detail: `${(rows.feed_invoices || []).length} فاتورة مسجلة`, icon: Leaf, tone: 'mint', trend: 'إجمالي التوريدات' },
    { label: 'إجمالي المصروفات', value: formatMoney(totals.expenses), detail: 'علف + كهرباء + غاز + مصاريف', icon: CircleDollarSign, tone: 'amber', trend: 'كل المصروفات المسجلة' },
    { label: 'مبيعات الدواجن', value: formatMoney(totals.sales), detail: `${(rows.merchant_sales || []).length} عملية بيع`, icon: TrendingUp, tone: 'blue', trend: 'إجمالي المبيعات' },
    { label: 'مستحقات التجار', value: formatMoney(totals.remaining), detail: 'إجمالي المبالغ المتبقية', icon: Wallet, tone: 'rose', trend: 'قيد التحصيل' },
  ]
  return <div className="dashboard-page">
    <section className="welcome-banner"><div className="welcome-text"><span className="welcome-tag"><span className="live-dot" /> لوحة المزرعة</span><h1>نظرة عامة على مزرعتك</h1><p>كل شيء يسير على ما يرام. إليك ملخص نشاط مزرعة المالك.</p></div><div className="banner-illustration"><span className="banner-circle circle-a" /><span className="banner-circle circle-b" /><Bird className="banner-bird" size={110} strokeWidth={1.1} /><Leaf className="banner-leaf" size={38} /></div><div className="banner-cycle"><span>الدورة الحالية</span><strong>اليوم {totals.lastDay}<small> / 42</small></strong><div className="banner-track"><i style={{ width: `${Math.min(100, totals.lastDay / 42 * 100)}%` }} /></div><span>{totals.lastDay ? `متبقي ${42 - totals.lastDay} يوماً` : 'ابدأ بتسجيل بيانات الدورة'}</span></div></section>
    <section className="stats-grid">{cards.map(({ label, value, detail, icon: Icon, tone, trend }) => <article className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon size={19} /></div><span className="stat-label">{label}</span><strong className="stat-value">{loading ? '...' : value}</strong><div className="stat-foot"><span>{detail}</span><span className="stat-trend"><ArrowDownLeft size={13} /> {trend}</span></div></article>)}</section>
    <div className="dashboard-grid"><section className="panel daily-panel"><div className="panel-heading"><div><h2><Activity size={19} /> متابعة الدورة اليومية</h2><p>آخر السجلات المسجلة للدورة الحالية</p></div><button className="text-button" onClick={() => onNavigate('daily_records')}>عرض السجل <ArrowUpRight size={15} /></button></div>{latestDaily.length ? <div className="mini-table-wrap"><table className="data-table mini-table"><thead><tr><th>اليوم</th><th>سحب العلف</th><th>النافق اليومي</th><th>النافق التراكمي</th></tr></thead><tbody>{latestDaily.map((row) => <tr key={row.id}><td><span className="day-pill">اليوم {row.day_number}</span></td><td>{showValue(row.feed_bags, 'number')} شكارة</td><td>{showValue(row.daily_deaths, 'number')}</td><td><strong>{showValue(row.cumulative_deaths, 'number')}</strong></td></tr>)}</tbody></table></div> : <EmptyState icon={Egg} title="لم تسجّل بيانات الدورة بعد" text="ابدأ بإضافة أول سجل يومي لمتابعة دورتك." action="إضافة سجل اليوم" onClick={() => onCreate('daily_records')} />}</section>
      <section className="panel quick-panel"><div className="panel-heading"><div><h2><Settings2 size={19} /> إجراءات سريعة</h2><p>أضف سجلاً جديداً بخطوة واحدة</p></div></div><div className="quick-actions">{[{ id: 'daily_records', title: 'سجل يومي', desc: 'العلف والنافق والتحصينات', icon: Activity, color: 'mint' }, { id: 'feed_invoices', title: 'فاتورة علف', desc: 'توريد جديد للمزرعة', icon: Leaf, color: 'amber' }, { id: 'merchant_sales', title: 'عملية بيع', desc: 'تسجيل مبيعات تاجر', icon: ShoppingBag, color: 'blue' }, { id: 'expenses', title: 'مصروف جديد', desc: 'سجّل مصروفات المزرعة', icon: CircleDollarSign, color: 'rose' }].map(({ id, title, desc, icon: Icon, color }) => <button className="quick-item" key={id} onClick={() => onCreate(id)}><span className={`quick-icon ${color}`}><Icon size={18} /></span><span className="quick-copy"><strong>{title}</strong><small>{desc}</small></span><Plus size={16} className="quick-plus" /></button>)}</div></section>
      <section className="panel sales-panel"><div className="panel-heading"><div><h2><BriefcaseBusiness size={19} /> آخر مبيعات التجار</h2><p>حسابات المبيعات والمدفوعات</p></div><button className="text-button" onClick={() => onNavigate('merchant_sales')}>كشف الحساب <ArrowUpRight size={15} /></button></div>{recentSales.length ? <div className="merchant-list">{recentSales.map((sale) => <div className="merchant-row" key={sale.id}><span className="merchant-avatar">{sale.merchant_name?.slice(0, 1) || 'ت'}</span><span className="merchant-info"><strong>{sale.merchant_name}</strong><small>{showValue(sale.sold_on, 'date')} · {showValue(sale.quantity_kg, 'number')} كجم</small></span><span className="merchant-amount"><strong>{formatMoney(sale.total_amount)}</strong><small className={Number(sale.remaining_amount) > 0 ? 'unpaid' : 'paid'}>{Number(sale.remaining_amount) > 0 ? `متبقي ${formatMoney(sale.remaining_amount)}` : 'تم السداد'}</small></span></div>)}</div> : <EmptyState icon={ShoppingBag} title="لا توجد مبيعات بعد" text="ستظهر عمليات البيع الجديدة هنا." action="إضافة عملية بيع" onClick={() => onCreate('merchant_sales')} />}</section>
      <section className="panel overview-panel"><div className="panel-heading"><div><h2><Boxes size={19} /> ملخص المزرعة</h2><p>نظرة سريعة على السجلات</p></div></div><div className="overview-list">{[{ label: 'أيام الدورة المسجلة', value: `${totals.lastDay} من 42`, icon: Clock3 }, { label: 'النافق التراكمي', value: `${totals.birdsLost.toLocaleString('ar-EG')} طائر`, icon: Bird }, { label: 'فواتير العلف', value: `${(rows.feed_invoices || []).length} فاتورة`, icon: FileText }, { label: 'سجلات العمال', value: `${(rows.workers || []).length} سجل`, icon: Users }].map(({ label, value, icon: Icon }) => <div className="overview-item" key={label}><span><Icon size={16} /> {label}</span><strong>{loading ? '...' : value}</strong></div>)}</div><button className="overview-link" onClick={() => onNavigate('daily_records')}>استعرض بيانات الدورة <ArrowUpRight size={15} /></button></section></div>
  </div>
}

function EmptyState({ icon: Icon, title, text, action, onClick }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={22} /></span><strong>{title}</strong><p>{text}</p><button className="button secondary small-button" onClick={onClick}><Plus size={15} />{action}</button></div>
}

function SectionPage({ section, config, records, loading, search, setSearch, onCreate, onEdit, onDelete }) {
  const Icon = config.icon
  const visibleRecords = records.filter((record) => Object.values(record).some((value) => String(value ?? '').toLowerCase().includes(search.toLowerCase())))
  const sums = section === 'feed_invoices' ? [
    { label: 'إجمالي العلف المستلم', value: `${records.reduce((sum, row) => sum + Number(row.quantity_tons || 0), 0).toLocaleString('ar-EG')} طن`, icon: Leaf, tone: 'mint' },
    { label: 'إجمالي المبالغ', value: formatMoney(records.reduce((sum, row) => sum + Number(row.total_amount || 0), 0)), icon: CircleDollarSign, tone: 'amber' },
  ] : section === 'merchant_sales' ? [
    { label: 'إجمالي المبيعات', value: formatMoney(records.reduce((sum, row) => sum + Number(row.total_amount || 0), 0)), icon: TrendingUp, tone: 'blue' },
    { label: 'إجمالي المبالغ المتبقية', value: formatMoney(records.reduce((sum, row) => sum + Number(row.remaining_amount || 0), 0)), icon: Wallet, tone: 'rose' },
  ] : []
  return <div className="section-page"><div className="section-heading"><div className="section-heading-icon"><Icon size={22} /></div><div className="section-heading-copy"><span className="eyebrow">إدارة المزرعة</span><h1>{config.title}</h1><p>{config.subtitle}</p></div><button className="button primary add-record" onClick={onCreate}><Plus size={17} />{config.addLabel}</button></div>
    {sums.length > 0 && <div className="section-stat-row">{sums.map(({ label, value, icon: StatIcon, tone }) => <div className="section-stat" key={label}><span className={`stat-icon ${tone}`}><StatIcon size={18} /></span><span><small>{label}</small><strong>{value}</strong></span></div>)}</div>}
    <section className="panel records-panel"><div className="records-toolbar"><div><h2>السجلات المسجلة <span className="record-count">{records.length}</span></h2><p>يمكنك تعديل أو حذف أي سجل من الجدول.</p></div><label className="search-box"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث في السجلات..." /></label></div>
      {loading && !records.length ? <div className="table-loading"><div className="spinner" />جارٍ تحميل السجلات...</div> : visibleRecords.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>التاريخ</th>{config.columns.map(([, label]) => <th key={label}>{label}</th>)}<th>إجراءات</th></tr></thead><tbody>{visibleRecords.map((record) => <tr key={record.id}><td className="date-cell">{showValue(record[config.dateKey], 'date')}</td>{config.columns.map(([key, , kind]) => <td key={key} className={key === 'remaining_amount' && Number(record[key]) > 0 ? 'unpaid-cell' : ''}>{showValue(record[key], kind)}</td>)}<td><div className="row-actions"><button className="row-action edit-action" title="تعديل" aria-label="تعديل السجل" onClick={() => onEdit(record)}><Pencil size={15} /></button><button className="row-action delete-action" title="حذف" aria-label="حذف السجل" onClick={() => onDelete(record)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState icon={Icon} title={search ? 'لا توجد نتائج مطابقة' : 'لا توجد سجلات حتى الآن'} text={search ? 'جرّب البحث بكلمة مختلفة.' : `ابدأ بإضافة أول سجل في قسم ${config.title}.`} action={search ? 'إضافة سجل جديد' : config.addLabel} onClick={onCreate} />}
    </section>
  </div>
}

function RecordModal({ modal, onClose, onSubmit, busy }) {
  const config = sectionConfig[modal.section]
  const record = modal.record
  const Icon = config.icon
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="record-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="modal-header"><div className="modal-icon"><Icon size={19} /></div><div><h2 id="modal-title">{record ? 'تعديل السجل' : config.addLabel}</h2><p>{config.title} · جميع الحقول تحفظ بأمان</p></div><button className="icon-button modal-close" onClick={onClose} aria-label="إغلاق"><X size={19} /></button></header>
    <form onSubmit={onSubmit}><div className="form-grid">{config.fields.map((field) => <label key={field.key} className={`form-label ${field.wide ? 'field-wide' : ''}`}>{field.label}{field.type === 'textarea' ? <textarea name={field.key} rows={3} defaultValue={record?.[field.key] ?? ''} placeholder={field.placeholder || 'أضف تفاصيل...'} /> : field.type === 'select' ? <select name={field.key} defaultValue={record?.[field.key] || field.options[0][0]}>{field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : <input name={field.key} type={field.type} required={field.required} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder} defaultValue={record?.[field.key] ?? (dateField.has(field.key) ? today() : '')} />}</label>)}</div>
      {modal.section === 'daily_records' && <div className="form-note"><Activity size={15} /> يتم حساب النافق التراكمي تلقائياً بالاعتماد على السجلات السابقة.</div>}
      {modal.section === 'merchant_sales' && <div className="form-note"><CircleDollarSign size={15} /> يتم حساب المبلغ المتبقي تلقائياً بعد حفظ السجل.</div>}
      <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>إلغاء</button><button type="submit" className="button primary" disabled={busy}><Check size={16} />{busy ? 'جارٍ الحفظ...' : record ? 'حفظ التعديلات' : 'حفظ السجل'}</button></div>
    </form></section></div>
}

export default App
