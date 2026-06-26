import {
  ArrowRight, CalendarCheck, Shield, Wrench, Users,
  CheckCircle, Clock, Building2, GraduationCap,
  ChevronRight, BarChart3, CalendarDays,
  Bell, Settings2, Search,
  MapPin, Calendar, Plus, Minus
} from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "../components/Logo";
import { useFadeNavigate } from "../hooks/useFadeNavigate";

const BLUE = "#1e66ff";
const BLUE_LIGHT = "#4da3ff";

/* ─── Badge ─── */
function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
      style={{ background: "rgba(30,102,255,0.09)", color: BLUE }}>
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
      {children}
    </span>
  );
}

/* ─── Feature card ─── */
function FeatureCard({ icon: Icon, color, title, desc }) {
  return (
    <div className="group flex flex-col gap-4 p-6 rounded-2xl border border-gray-100 bg-white">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}15` }}>
        <Icon size={19} style={{ color }} />
      </div>
      <div>
        <h3 className="text-gray-800 font-bold text-sm mb-1.5">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Step ─── */
function Step({ n, title, desc }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 mt-0.5"
        style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})` }}>
        {n}
      </div>
      <div>
        <p className="font-bold text-gray-800 text-sm mb-1">{title}</p>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
      >
        <span className="text-sm font-semibold text-gray-800">{question}</span>
        <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{ background: open ? `${BLUE}15` : "#f3f4f6" }}>
          {open
            ? <Minus size={12} style={{ color: BLUE }} />
            : <Plus size={12} className="text-gray-500" />}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}

/* ─── Mock Dashboard ─── */
function DashboardMock() {
  const rooms = [
    { name: "Lab. Informática A", reservas: 12, pct: 80 },
    { name: "Sala 2.01",          reservas: 9,  pct: 60 },
    { name: "Auditório Principal", reservas: 5, pct: 33 },
    { name: "Sala de Reuniões 1", reservas: 15, pct: 100 },
  ];
  const activities = [
    { label: "Reserva confirmada",  target: "Lab. Informática A",          color: "bg-emerald-100 text-emerald-600" },
    { label: "Problema reportado",  target: "Sala 2.01 — projetor avariado", color: "bg-orange-100 text-orange-500" },
    { label: "Reserva cancelada",   target: "Auditório Principal",          color: "bg-red-100 text-red-500" },
  ];

  return (
    <div style={{
      transform: "perspective(1100px) rotateY(-14deg) rotateX(5deg)",
      transformStyle: "preserve-3d",
      boxShadow: "0 32px 80px rgba(30,102,255,0.18), 0 8px 24px rgba(0,0,0,0.10)",
      borderRadius: "16px", overflow: "hidden", border: "1px solid #e5e7eb"
    }} className="w-full">
      <div className="flex" style={{ height: 340 }}>
        {/* Sidebar mock */}
        <div className="flex flex-col bg-white border-r border-gray-100 shrink-0" style={{ width: 120 }}>
          <div className="flex items-center gap-1.5 px-3 py-3 border-b border-gray-100">
            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})` }}>
              <Logo className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-gray-800" style={{ letterSpacing: "-0.3px" }}>Roomly</span>
          </div>
          <div className="px-2 py-2">
            <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1.5">
              <Search size={9} className="text-gray-400 shrink-0" />
              <span className="text-[9px] text-gray-400">Pesquisar...</span>
            </div>
          </div>
          <div className="flex-1 px-1.5 overflow-hidden">
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-2 pt-2 pb-1">Principal</p>
            {[{ label: "Dashboard", active: true }, { label: "Salas" }, { label: "Reservas" }].map(({ label, active }) => (
              <div key={label} className={`flex items-center px-2 py-1.5 rounded-lg text-[9px] font-medium mb-0.5 ${active ? "bg-blue-600 text-white" : "text-gray-500"}`}>
                {label}
              </div>
            ))}
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-2 pt-3 pb-1">Suporte</p>
            {["Reportar Problema"].map((label) => (
              <div key={label} className="flex items-center px-2 py-1.5 rounded-lg text-[9px] font-medium text-gray-500 mb-0.5">{label}</div>
            ))}
          </div>
          <div className="px-2 pb-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 text-[7px] font-black"
                style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})` }}>AD</div>
              <div>
                <p className="text-[8px] font-semibold text-gray-800 leading-tight">Admin</p>
                <p className="text-[7px] text-blue-500">Administrador</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-gray-50 p-3 flex flex-col gap-2.5 overflow-hidden">
          <div>
            <p className="text-xs font-bold text-gray-800">Olá, Admin!</p>
            <p className="text-[9px] text-gray-400">sexta-feira, 22 de maio de 2026</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Salas Disponíveis", val: "8",  iconBg: "bg-blue-500" },
              { label: "Reservas Hoje",     val: "34", iconBg: "bg-emerald-500" },
              { label: "Prob. Reportados",  val: "3",  iconBg: "bg-orange-500" },
              { label: "Utilizadores",      val: "24", iconBg: "bg-rose-500" },
            ].map(({ label, val, iconBg }) => (
              <div key={label} className="bg-white rounded-xl p-2 border border-gray-100">
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-[8px] text-gray-400 font-semibold leading-tight">{label}</span>
                  <div className={`w-3.5 h-3.5 rounded-md ${iconBg} flex items-center justify-center`}>
                    <span className="w-1.5 h-1.5 rounded-sm bg-white/80 inline-block" />
                  </div>
                </div>
                <span className="text-base font-black text-gray-800">{val}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-3 flex flex-col overflow-hidden">
              <p className="text-[9px] font-bold text-gray-700 mb-2">Salas Mais Reservadas</p>
              <div className="flex flex-col gap-1.5 flex-1">
                {rooms.map((r) => (
                  <div key={r.name} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[8px] font-semibold text-gray-700 truncate">{r.name}</p>
                        <span className="text-[8px] font-bold text-blue-600 ml-1 shrink-0">{r.reservas}</span>
                      </div>
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${r.pct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col overflow-hidden">
              <p className="text-[9px] font-bold text-gray-700 mb-2">Atividade Recente</p>
              <div className="flex flex-col gap-1.5">
                {activities.map((a, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <div className={`w-4 h-4 rounded-full ${a.color} flex items-center justify-center shrink-0`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 inline-block" />
                    </div>
                    <div>
                      <p className="text-[8px] font-semibold text-gray-700 leading-tight">{a.label}</p>
                      <p className="text-[7px] text-gray-400 truncate">{a.target}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mock Nova Reserva ─── */
function ReservationMock() {
  return (
    <div style={{
      transform: "perspective(1100px) rotateY(14deg) rotateX(5deg)",
      transformStyle: "preserve-3d",
      boxShadow: "0 32px 80px rgba(30,102,255,0.18), 0 8px 24px rgba(0,0,0,0.10)",
      borderRadius: "16px", overflow: "hidden", border: "1px solid #e5e7eb"
    }} className="w-full">
      <div className="flex" style={{ minHeight: 360 }}>
        {/* Sidebar mini */}
        <div className="flex flex-col bg-white border-r border-gray-100 shrink-0 py-3 px-1.5" style={{ width: 100 }}>
          <div className="flex items-center gap-1 px-1.5 pb-2 mb-1 border-b border-gray-100">
            <div className="w-4 h-4 rounded-md flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})` }}>
              <Logo className="w-3 h-3" />
            </div>
            <span className="text-[9px] font-black text-gray-800">Roomly</span>
          </div>
          {[
            { label: "Dashboard" },
            { label: "Salas" },
            { label: "Minhas Reservas", active: true },
            { label: "Reportar Problema" },
          ].map(({ label, active }) => (
            <div key={label} className={`px-1.5 py-1 rounded-lg text-[8px] font-medium mb-0.5 truncate ${active ? "bg-blue-600 text-white" : "text-gray-500"}`}>
              {label}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="flex-1 bg-gray-50 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CalendarCheck size={16} className="text-blue-500" />
            <div>
              <p className="text-xs font-bold text-gray-800">Nova Reserva</p>
              <p className="text-[9px] text-gray-400">Preenche os detalhes e confirma</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col gap-2">
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Sala</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <MapPin size={9} className="text-gray-400 shrink-0" />
              <span className="text-[10px] text-gray-700 font-medium">Lab. Informática A — cap. 20</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">LABORATÓRIO</span>
              <span className="text-[8px] font-bold bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">Projetor</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col gap-2">
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Data &amp; Horário</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg">
              <Calendar size={9} className="text-gray-400 shrink-0" />
              <span className="text-[10px] text-gray-700 font-medium">2026-05-22</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[{ l: "Início", v: "09:00" }, { l: "Fim", v: "11:00" }].map(({ l, v }) => (
                <div key={l}>
                  <p className="text-[8px] font-bold text-gray-600 mb-1">{l}</p>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-lg">
                    <Clock size={8} className="text-gray-400 shrink-0" />
                    <span className="text-[10px] text-gray-700 font-medium">{v}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col gap-2">
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Motivo</span>
            <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-[10px] text-gray-700 font-medium">Aula de Programação Web</span>
            </div>
          </div>
          <button className="w-full py-2 rounded-xl text-white text-[10px] font-semibold flex items-center justify-center gap-1.5"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})`, boxShadow: "0 4px 14px rgba(30,102,255,0.30)" }}>
            <CheckCircle size={11} /> Confirmar Reserva
          </button>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════ */
export default function Landing() {
  const go = useFadeNavigate();

  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");
    return () => { if (wasDark) root.classList.add("dark"); };
  }, []);

  const faqs = [
    {
      question: "Como obtenho acesso ao sistema?",
      answer: "As credenciais de acesso são criadas pelo administrador da instituição. Não é possível criar conta de forma autónoma — o administrador regista cada utilizador e atribui o respetivo perfil de acesso (Administrador, Funcionário ou Professor).",
    },
    {
      question: "O que acontece se tentar reservar uma sala já ocupada?",
      answer: "O sistema verifica conflitos em tempo real antes de confirmar a reserva. Se o horário escolhido já estiver ocupado, é apresentado um aviso imediato com sugestões de horários alternativos disponíveis para a mesma sala.",
    },
    {
      question: "Posso cancelar ou editar uma reserva depois de confirmada?",
      answer: "Sim. Na secção «Minhas Reservas», é possível editar ou cancelar qualquer reserva futura. Reservas passadas ficam arquivadas no histórico mas não podem ser alteradas.",
    },
    {
      question: "Como funciona o reporte de avarias?",
      answer: "Na secção «Reportar Problema», seleciona a sala afetada, descreve a situação e pode anexar uma fotografia (até 5 MB). O relatório fica visível para os funcionários com acesso de gestão, que acompanham o estado — Em análise, Em curso ou Resolvido.",
    },
    {
      question: "Qual é a diferença entre os perfis de Funcionário e Professor?",
      answer: "Ambos podem reservar salas e reportar avarias. A distinção é organizacional: o perfil de Professor é atribuído ao corpo docente e o de Funcionário aos restantes colaboradores. Nenhum dos dois tem acesso à gestão de utilizadores, salas ou reservas globais — essas funções são exclusivas do Administrador.",
    },
    {
      question: "O sistema funciona em dispositivos móveis?",
      answer: "Sim. O Roomly foi desenvolvido com design responsivo e pode ser instalado como aplicação no telemóvel através da opção «Instalar aplicação» que aparece na barra lateral. Uma vez instalado, funciona de forma idêntica a uma aplicação nativa.",
    },
    {
      question: "Os dados são atualizados automaticamente?",
      answer: "Sim. Todas as páginas do sistema atualizam os dados automaticamente a cada 10 segundos, sem necessidade de atualizar o browser. Isto garante que a disponibilidade de salas e o estado das reservas estão sempre atualizados.",
    },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter','Poppins',sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/85 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})` }}>
              <Logo className="w-6 h-6" />
            </div>
            <span className="text-xl font-black text-gray-800" style={{ letterSpacing: "-0.5px" }}>roomly</span>
          </div>

          <div className="hidden md:flex items-center gap-7">
            {[
              { label: "Funcionalidades", href: "#funcionalidades" },
              { label: "Como Funciona",   href: "#como-funciona" },
              { label: "Perfis de Acesso",href: "#perfis" },
              { label: "FAQ",             href: "#faq" },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
                {label}
              </a>
            ))}
          </div>

          <button onClick={() => go("/login")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:brightness-110"
            style={{ background: BLUE, boxShadow: "0 4px 16px rgba(30,102,255,0.30)" }}>
            Entrar <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(30,102,255,0.06) 0%, transparent 70%)",
            transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(77,163,255,0.05) 0%, transparent 70%)",
            transform: "translate(-30%, 30%)" }} />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Texto */}
            <div className="flex-1 text-center lg:text-left">

              <h1 className="mt-6 text-gray-900 font-black leading-[1.1]"
                style={{ fontSize: "clamp(2.2rem,4.5vw,3.4rem)", letterSpacing: "-1.5px" }}>
                Gestão de espaços<br />
                escolares, sem complicações.
              </h1>

              <p className="mt-5 text-gray-500 text-base leading-relaxed max-w-[480px] mx-auto lg:mx-0">
                Reserve salas, consulte disponibilidade em tempo real, reporte avarias e acompanha tudo
                a partir de um único sistema — acessível em qualquer dispositivo.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button onClick={() => go("/login")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm transition-colors hover:opacity-90"
                  style={{ background: BLUE }}>
                  Aceder ao Sistema <ArrowRight size={16} />
                </button>
                <a href="#funcionalidades"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-gray-600 font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                  Ver Funcionalidades <ChevronRight size={15} />
                </a>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 flex-wrap">
                {[
                  { val: "100%", label: "Sem conflitos de horário" },
                  { val: "10s",  label: "Atualização automática" },
                  { val: "3",    label: "Perfis de acesso" },
                ].map(({ val, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-sm font-black" style={{ color: BLUE }}>{val}</span>
                    <span className="text-xs text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard mock 3D */}
            <div className="flex-1 w-full max-w-[520px] hidden lg:block">
              <DashboardMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-8 sm:py-10 border-y border-gray-100"
        style={{ background: "linear-gradient(90deg, #f0f6ff 0%, #f8fbff 100%)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {[
            { val: "100%", label: "Conflitos eliminados" },
            { val: "10s",  label: "Atualização de dados" },
            { val: "3",    label: "Perfis de acesso" },
            { val: "4",    label: "Tipos de espaço suportados" },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="text-2xl font-black" style={{ color: BLUE, letterSpacing: "-1px" }}>{val}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section id="funcionalidades" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 font-black"
              style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", letterSpacing: "-1px" }}>
              O que o sistema oferece.
            </h2>
            <p className="mt-3 text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
              Reservas, gestão de espaços, reporte de avarias e controlo de acessos —
              tudo integrado numa única plataforma institucional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon={CalendarCheck} color="#1e66ff"
              title="Reserva de Salas"
              desc="Seleciona a sala, define data e hora e confirma a reserva em segundos. O sistema valida conflitos automaticamente antes de confirmar." />
            <FeatureCard icon={Clock} color="#10b981"
              title="Atualização a Cada 10 Segundos"
              desc="Disponibilidade, reservas e relatórios atualizam-se automaticamente — sem necessidade de atualizar o browser." />
            <FeatureCard icon={Wrench} color="#f59e0b"
              title="Reporte de Avarias"
              desc="Descreve o problema, indica a sala e junta uma fotografia opcional. O estado do relatório (Em análise / Em curso / Resolvido) é acompanhado em tempo real." />
            <FeatureCard icon={BarChart3} color="#ef4444"
              title="Dashboard de Administração"
              desc="Visão geral com salas disponíveis, reservas do dia, problemas em aberto e atividade recente da instituição." />
            <FeatureCard icon={Shield} color="#0891b2"
              title="Controlo de Acessos por Perfil"
              desc="Três perfis distintos — Administrador, Funcionário e Professor. Cada utilizador acede apenas às funcionalidades do seu perfil." />
            <FeatureCard icon={CalendarDays} color="#6366f1"
              title="Histórico de Reservas"
              desc="As reservas passadas ficam arquivadas automaticamente. É possível consultar o histórico completo de atividade." />
            <FeatureCard icon={Bell} color="#f43f5e"
              title="Notificações Imediatas"
              desc="Cada ação — criação de reserva, cancelamento, erro — gera uma notificação imediata no ecrã." />
            <FeatureCard icon={Settings2} color="#64748b"
              title="Gestão de Utilizadores"
              desc="O administrador cria contas, define perfis, ativa ou desativa utilizadores e gere credenciais de acesso." />
            <FeatureCard icon={Building2} color="#8b5cf6"
              title="Gestão de Espaços"
              desc="Regista salas com nome, tipo, capacidade e equipamentos disponíveis. Edita ou remove espaços a qualquer momento." />
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="py-16 sm:py-24 px-4 sm:px-6"
        style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef4ff 100%)" }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Steps */}
          <div className="flex-1 flex flex-col gap-9">
            <div className="text-center lg:text-left">
              <h2 className="text-gray-900 font-black"
                style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", letterSpacing: "-1px" }}>
                Em 3 passos.
              </h2>
              <p className="mt-3 text-gray-500 text-sm leading-relaxed max-w-[400px] mx-auto lg:mx-0">
                O processo de reserva foi desenhado para ser rápido e direto,
                sem formulários desnecessários.
              </p>
            </div>
            <div className="flex flex-col gap-7">
              <Step n="1" title="Inicia sessão com as tuas credenciais"
                desc="O administrador cria a tua conta e fornece as credenciais de acesso. Não é necessário registo manual." />
              <Step n="2" title="Pesquisa e filtra salas disponíveis"
                desc="Na secção Salas, filtra por tipo, capacidade, equipamentos ou data e hora específica para ver o que está disponível." />
              <Step n="3" title="Confirma a reserva e gere tudo num só lugar"
                desc="Reserva com um clique. Se precisares, edita ou cancela em qualquer altura. O histórico fica guardado automaticamente." />
            </div>
          </div>

          {/* Reservation mock 3D */}
          <div className="flex-1 w-full max-w-[380px] hidden lg:block">
            <ReservationMock />
          </div>
        </div>
      </section>

      {/* ── PWA ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">

          {/* Texto */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-gray-900 font-black"
              style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", letterSpacing: "-1px" }}>
              Funciona no telemóvel<br />como uma aplicação.
            </h2>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed max-w-[420px] mx-auto lg:mx-0">
              O Roomly é uma PWA — pode ser instalado diretamente no telemóvel
              a partir do browser, sem passar pela App Store ou Google Play.
              Uma vez instalado, funciona como uma aplicação nativa: abre com ícone
              próprio, sem barras do browser.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {[
                { label: "Sem instalação de loja", icon: CheckCircle },
                { label: "iOS e Android", icon: CheckCircle },
                { label: "Funciona offline", icon: CheckCircle },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={15} style={{ color: BLUE }} />
                  <span className="text-sm text-gray-600 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mock telemóvel */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-[220px]">
              {/* Frame do telemóvel */}
              <div className="rounded-[36px] border-[6px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.08)" }}>
                {/* Notch */}
                <div className="bg-gray-800 flex justify-center pt-2 pb-1">
                  <div className="w-16 h-4 bg-gray-900 rounded-full" />
                </div>
                {/* Ecrã */}
                <div className="bg-gray-50 overflow-hidden" style={{ height: 420 }}>
                  {/* Header da app */}
                  <div className="bg-white border-b border-gray-100 px-3 py-2.5 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})` }}>
                      <Logo className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-black text-gray-800">roomly</span>
                  </div>
                  {/* Conteúdo */}
                  <div className="p-3 flex flex-col gap-2.5">
                    <p className="text-[10px] font-bold text-gray-800">Olá, Ana Silva!</p>
                    {/* KPIs 2x2 */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: "Salas Disponíveis", val: "8",  dot: "bg-blue-500" },
                        { label: "Reservas Hoje",     val: "34", dot: "bg-emerald-500" },
                        { label: "Prob. Reportados",  val: "3",  dot: "bg-orange-500" },
                        { label: "Utilizadores",      val: "24", dot: "bg-rose-500" },
                      ].map(({ label, val, dot }) => (
                        <div key={label} className="bg-white rounded-xl p-2 border border-gray-100">
                          <div className="flex items-center gap-1 mb-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                            <span className="text-[7px] text-gray-400 font-medium leading-tight">{label}</span>
                          </div>
                          <span className="text-sm font-black text-gray-800">{val}</span>
                        </div>
                      ))}
                    </div>
                    {/* Reserva próxima */}
                    <div className="bg-white rounded-xl border border-gray-100 p-2.5">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-2">Próxima Reserva</p>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${BLUE}15` }}>
                          <CalendarCheck size={13} style={{ color: BLUE }} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-800">Lab. Informática A</p>
                          <p className="text-[8px] text-gray-400">Hoje · 14:00 – 16:00</p>
                        </div>
                      </div>
                    </div>
                    {/* Botão instalar */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed mt-1"
                      style={{ borderColor: BLUE, background: `${BLUE}08` }}>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: BLUE }}>
                        <Logo className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-bold leading-tight" style={{ color: BLUE }}>Instalar aplicação</p>
                        <p className="text-[7px] text-gray-400">Adicionar ao ecrã inicial</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Barra inferior */}
                <div className="bg-gray-800 flex justify-center py-2">
                  <div className="w-10 h-1 bg-gray-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERFIS DE ACESSO ── */}
      <section id="perfis" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-gray-900 font-black mb-3"
            style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", letterSpacing: "-1px" }}>
            Três perfis, três níveis de acesso.
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-12 leading-relaxed">
            Cada utilizador acede apenas às funcionalidades do seu perfil.
            A distinção de acessos é definida pelo administrador no momento do registo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                role: "Administrador", color: BLUE, bgLight: "#eef4ff", icon: Shield,
                perms: [
                  "Gestão completa de salas e equipamentos",
                  "Criação e gestão de contas de utilizadores",
                  "Definição de perfis e credenciais de acesso",
                  "Dashboard com KPIs e atividade global",
                  "Gestão de todas as reservas da instituição",
                  "Acompanhamento de todos os relatórios de avarias",
                ],
              },
              {
                role: "Funcionário", color: "#8b5cf6", bgLight: "#f5f3ff", icon: Users,
                perms: [
                  "Reserva e gestão das suas próprias reservas",
                  "Consulta de disponibilidade de salas",
                  "Reporte de avarias com fotografia",
                  "Acompanhamento dos seus relatórios",
                  "Historial de atividade pessoal",
                  "Gestão de dados do perfil pessoal",
                ],
              },
              {
                role: "Professor", color: "#10b981", bgLight: "#ecfdf5", icon: GraduationCap,
                perms: [
                  "Reserva e gestão das suas próprias reservas",
                  "Consulta de disponibilidade de salas",
                  "Reporte de avarias com fotografia",
                  "Acompanhamento dos seus relatórios",
                  "Historial de atividade pessoal",
                  "Gestão de dados do perfil pessoal",
                ],
              },
            ].map(({ role, color, bgLight, icon: I, perms }) => (
              <div key={role}
                className="flex flex-col gap-5 p-6 rounded-2xl bg-white border border-gray-100 text-left"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: bgLight }}>
                    <I size={18} style={{ color }} />
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{role}</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {perms.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle size={13} style={{ color, flexShrink: 0, marginTop: 2 }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6"
        style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef4ff 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 font-black"
              style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", letterSpacing: "-1px" }}>
              Dúvidas mais comuns.
            </h2>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
              Se não encontrares resposta aqui, contacta o administrador da tua instituição.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-7 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})` }}>
              <Logo className="w-5 h-5" />
            </div>
            <span className="font-black text-gray-700 text-sm" style={{ letterSpacing: "-0.3px" }}>roomly</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            © 2026 Roomly — Plataforma de Gestão de Espaços Institucionais.
          </p>
          <button onClick={() => go("/login")}
            className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors">
            Aceder ao Sistema →
          </button>
        </div>
      </footer>

    </div>
  );
}
