import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://winfxmdkqjpwpgthuhgt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmZ4bWRrcWpwd3BndGh1aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzYwMzIsImV4cCI6MjA2MDc1MjAzMn0.B5GHsHlFYmZrUWMCZLuiiFfBMVJfMGABsMOJT4X7few";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATS = {
  food:      { emoji:"🍔", label:"Alimentação",  color:"#e8631a" },
  market:    { emoji:"🛒", label:"Mercado",       color:"#2563eb" },
  home:      { emoji:"🏠", label:"Casa / Lar",    color:"#7c3aed" },
  transport: { emoji:"🚗", label:"Transporte",    color:"#0891b2" },
  health:    { emoji:"💊", label:"Saúde",         color:"#059669" },
  leisure:   { emoji:"🎮", label:"Lazer",         color:"#db2777" },
  edu:       { emoji:"📚", label:"Educação",      color:"#d97706" },
  other:     { emoji:"📦", label:"Outros",        color:"#6b7280" },
};

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const CARD_LIMIT = 4100;

const fmt = n => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n||0);
const fmtDate = iso => { const d=new Date(iso+"T12:00"); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`; };
const genId = () => Math.random().toString(36).slice(2,10);

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Unbounded:wght@300;400;600;700;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#f5f0e8;--surface:#ffffff;--surface2:#f0ebe0;--border:#e0d8cc;
    --text:#1a1208;--text2:#7a6e5f;
    --accent:#c8431a;--green:#1a7a3a;--green-dim:rgba(26,122,58,0.1);
    --red:#c8431a;--red-dim:rgba(200,67,26,0.1);--yellow:#d4a017;
    --font-d:'Unbounded',sans-serif;--font-m:'Space Mono',monospace;
    --shadow:0 2px 12px rgba(26,18,8,0.08);
  }
  body{background:var(--bg);color:var(--text);font-family:var(--font-m);min-height:100vh}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--border)}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pop{0%{transform:scale(0.94);opacity:0}60%{transform:scale(1.02)}100%{transform:scale(1);opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fade-up{animation:fadeUp 0.4s ease both}
  .s1{animation-delay:.05s}.s2{animation-delay:.1s}.s3{animation-delay:.15s}.s4{animation-delay:.2s}.s5{animation-delay:.25s}

  /* app grid */
  .app{display:flex;min-height:100vh;background:var(--bg);position:relative}
  .app::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(200,67,26,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,67,26,0.03) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0}

  /* sidebar */
  .sidebar{width:220px;min-width:220px;background:var(--text);display:flex;flex-direction:column;padding:0;z-index:10;position:relative}
  .sidebar-logo{padding:24px 20px;border-bottom:1px solid rgba(255,255,255,0.1)}
  .logo-name{font-family:var(--font-d);font-size:14px;font-weight:900;color:#fff;letter-spacing:-0.5px}
  .logo-sub{font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:2px;margin-top:4px}
  .card-pill{margin-top:12px;background:var(--accent);padding:8px 10px;border-radius:2px}
  .card-pill-name{font-size:10px;font-weight:700;color:#fff;letter-spacing:1px}
  .card-pill-limit{font-family:var(--font-d);font-size:13px;font-weight:700;color:#fff;margin-top:2px}
  .nav-section{padding:16px 0 4px 20px;font-size:9px;letter-spacing:2px;color:rgba(255,255,255,0.3);text-transform:uppercase}
  .nav-item{display:flex;align-items:center;gap:10px;padding:11px 20px;cursor:pointer;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.5px;border-left:2px solid transparent;transition:all .15s}
  .nav-item:hover{background:rgba(255,255,255,0.05);color:#fff}
  .nav-item.active{background:rgba(200,67,26,0.2);color:#fff;border-left-color:var(--accent)}
  .nav-icon{font-size:14px;width:18px;text-align:center}
  .sidebar-foot{margin-top:auto;padding:16px 20px;border-top:1px solid rgba(255,255,255,0.1)}
  .signout-btn{width:100%;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-family:var(--font-m);font-size:10px;letter-spacing:1px;cursor:pointer;transition:all .15s}
  .signout-btn:hover{background:rgba(255,255,255,0.1);color:#fff}

  /* main */
  .main{flex:1;overflow-y:auto;position:relative;z-index:1}
  .topbar{position:sticky;top:0;z-index:50;background:rgba(245,240,232,0.9);backdrop-filter:blur(12px);border-bottom:2px solid var(--text);padding:0 28px;height:56px;display:flex;align-items:center;justify-content:space-between}
  .topbar-title{font-family:var(--font-d);font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase}
  .topbar-right{display:flex;align-items:center;gap:8px}
  .page{padding:28px;max-width:1000px}

  /* buttons */
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 16px;font-family:var(--font-m);font-size:11px;font-weight:700;letter-spacing:1px;cursor:pointer;border:none;transition:all .15s;text-transform:uppercase}
  .btn-p{background:var(--text);color:var(--bg)}
  .btn-p:hover{background:#333;transform:translateY(-1px)}
  .btn-p:disabled{opacity:.4;cursor:not-allowed;transform:none}
  .btn-g{background:transparent;color:var(--text2);border:2px solid var(--border)}
  .btn-g:hover{border-color:var(--text);color:var(--text)}
  .btn-d{background:var(--red-dim);color:var(--red);border:2px solid rgba(200,67,26,.2)}
  .btn-d:hover{background:rgba(200,67,26,.2)}
  .btn-sm{padding:5px 10px;font-size:10px}
  .btn-accent{background:var(--accent);color:#fff}
  .btn-accent:hover{background:#a8360f}

  /* stat cards */
  .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:2px solid var(--text);margin-bottom:24px}
  .stat-card{padding:18px;border-right:2px solid var(--text);position:relative;overflow:hidden}
  .stat-card:last-child{border-right:none}
  .stat-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px}
  .stat-card.red::after{background:var(--accent)}
  .stat-card.green::after{background:var(--green)}
  .stat-card.blue::after{background:#2563eb}
  .stat-card.yellow::after{background:var(--yellow)}
  .stat-lbl{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text2);margin-bottom:8px}
  .stat-val{font-family:var(--font-d);font-size:18px;font-weight:700}
  .stat-val.red{color:var(--accent)}.stat-val.green{color:var(--green)}.stat-val.blue{color:#2563eb}.stat-val.yellow{color:var(--yellow)}
  .stat-sub{font-size:10px;color:var(--text2);margin-top:4px}

  /* progress */
  .prog-bar{height:4px;background:var(--border);overflow:hidden;margin-top:8px}
  .prog-fill{height:100%;transition:width .8s cubic-bezier(0.34,1.56,0.64,1)}

  /* alerts */
  .alert-box{padding:10px 14px;font-size:11px;margin-bottom:8px;display:flex;align-items:center;gap:8px;border-left:3px solid}
  .alert-box.warn{background:rgba(212,160,23,0.1);border-color:var(--yellow);color:#92700a}
  .alert-box.danger{background:var(--red-dim);border-color:var(--accent);color:var(--accent)}
  .alert-box.info{background:rgba(37,99,235,0.08);border-color:#2563eb;color:#1d4ed8}

  /* tx list */
  .tx-list{display:flex;flex-direction:column}
  .tx-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);cursor:pointer;transition:all .1s}
  .tx-row:hover{background:var(--surface2);margin:0 -12px;padding:12px}
  .tx-date{font-size:10px;color:var(--text2);width:38px;flex-shrink:0;letter-spacing:.5px}
  .tx-cat-ico{width:28px;height:28px;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;background:var(--surface)}
  .tx-info{flex:1;min-width:0}
  .tx-desc{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:uppercase;letter-spacing:.5px}
  .tx-sub{font-size:10px;color:var(--text2);margin-top:2px}
  .tx-amt{font-family:var(--font-d);font-size:13px;font-weight:700;white-space:nowrap;flex-shrink:0}
  .tx-amt.expense{color:var(--accent)}.tx-amt.refund{color:var(--green)}
  .tx-actions{display:flex;gap:4px;opacity:0;transition:opacity .15s}
  .tx-row:hover .tx-actions{opacity:1}
  .tx-action-btn{width:26px;height:26px;border:1px solid var(--border);background:var(--surface);cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;transition:all .15s}
  .tx-action-btn:hover{background:var(--surface2)}
  .tx-action-btn.del:hover{background:var(--red-dim);border-color:var(--accent)}

  /* month header */
  .month-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);margin-bottom:2px}
  .month-name{font-family:var(--font-d);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase}
  .month-total{font-family:var(--font-d);font-size:12px;font-weight:700;color:var(--accent)}

  /* section */
  .section{margin-bottom:24px}
  .section-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--text)}
  .section-title{font-family:var(--font-d);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase}

  /* budget cards */
  .budget-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .budget-card{border:2px solid var(--border);padding:14px;transition:border-color .2s}
  .budget-card:hover{border-color:var(--text)}
  .budget-cat{display:flex;align-items:center;gap:8px;margin-bottom:10px}
  .budget-emoji{font-size:18px}
  .budget-cat-name{font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
  .budget-nums{display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px}
  .budget-spent{font-family:var(--font-d);font-weight:700}
  .budget-limit{color:var(--text2)}
  .budget-pct{font-size:10px;letter-spacing:.5px;margin-top:4px}

  /* filter chips */
  .filter-bar{display:flex;gap:0;border:2px solid var(--text);margin-bottom:20px;overflow:hidden}
  .filter-btn{flex:1;padding:9px;border:none;border-right:2px solid var(--text);background:transparent;font-family:var(--font-m);font-size:10px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;color:var(--text2);transition:all .15s}
  .filter-btn:last-child{border-right:none}
  .filter-btn:hover{background:var(--surface2);color:var(--text)}
  .filter-btn.active{background:var(--text);color:var(--bg)}

  /* month nav */
  .month-nav{display:flex;align-items:center;gap:8px}
  .month-nav button{background:var(--surface);border:2px solid var(--border);color:var(--text2);width:28px;height:28px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all .15s}
  .month-nav button:hover{border-color:var(--text);color:var(--text)}
  .month-nav span{font-size:11px;font-weight:700;min-width:90px;text-align:center;letter-spacing:1px}

  /* overlay / modal */
  .overlay{position:fixed;inset:0;background:rgba(26,18,8,0.65);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;animation:fadeIn .2s ease}
  .modal{background:var(--surface);border:2px solid var(--text);width:100%;max-width:420px;max-height:90vh;overflow-y:auto;animation:pop .3s ease both}
  .modal-hd{background:var(--text);color:var(--bg);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;font-family:var(--font-d);font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase}
  .modal-close{background:none;border:none;color:var(--bg);font-size:18px;cursor:pointer;line-height:1}
  .modal-body{padding:24px}

  /* forms */
  .fg{margin-bottom:14px}
  .fl{display:block;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text2);margin-bottom:6px}
  .fi{width:100%;background:var(--surface2);border:2px solid var(--border);padding:10px 12px;color:var(--text);font-family:var(--font-m);font-size:13px;outline:none;transition:border-color .2s}
  .fi:focus{border-color:var(--text)}
  .fi::placeholder{color:var(--text2);opacity:.5}
  .type-tog{display:flex;gap:0;margin-bottom:16px;border:2px solid var(--border)}
  .type-btn{flex:1;padding:9px;border:none;font-family:var(--font-m);font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;background:transparent;color:var(--text2);transition:all .2s;border-right:2px solid var(--border)}
  .type-btn:last-child{border-right:none}
  .type-btn.ae{background:var(--accent);color:#fff;border-color:var(--accent)}
  .type-btn.ar{background:var(--green);color:#fff;border-color:var(--green)}
  .cat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:4px}
  .cat-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;border:2px solid var(--border);background:transparent;cursor:pointer;font-size:10px;color:var(--text2);text-align:center;transition:all .15s}
  .cat-btn:hover{background:var(--surface2);color:var(--text)}
  .cat-btn.sel{border-color:var(--text);background:var(--surface2);color:var(--text);font-weight:700}
  .fsel{width:100%;background:var(--surface2);border:2px solid var(--border);padding:10px 12px;color:var(--text);font-family:var(--font-m);font-size:13px;outline:none;appearance:none;cursor:pointer;transition:border-color .2s}
  .fsel:focus{border-color:var(--text)}
  .amt-wrap{position:relative;margin-bottom:16px}
  .amt-pre{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--text2);font-family:var(--font-d);font-weight:700}
  .amt-inp{width:100%;background:var(--surface2);border:2px solid var(--border);padding:14px 12px 14px 38px;color:var(--text);font-family:var(--font-d);font-size:24px;font-weight:700;outline:none;transition:border-color .2s}
  .amt-inp:focus{border-color:var(--text)}

  /* auth */
  .auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--bg)}
  .auth-box{background:var(--surface);border:2px solid var(--text);padding:36px;width:100%;max-width:380px}
  .auth-logo{font-family:var(--font-d);font-size:20px;font-weight:900;text-transform:uppercase;margin-bottom:4px}
  .auth-sub{font-size:10px;letter-spacing:2px;color:var(--text2);margin-bottom:28px}
  .tabs{display:flex;border-bottom:2px solid var(--border);margin-bottom:20px}
  .tab{padding:10px 16px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text2);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .15s}
  .tab:hover{color:var(--text)}.tab.active{color:var(--accent);border-bottom-color:var(--accent)}

  /* loading */
  .loading-screen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
  .spinner{width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--text);border-radius:50%;animation:spin .7s linear infinite}

  /* toast */
  .toast-wrap{position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:8px;z-index:2000}
  .toast{background:var(--text);color:var(--bg);padding:12px 16px;font-size:11px;letter-spacing:.5px;display:flex;align-items:center;gap:8px;animation:fadeUp .3s ease;max-width:260px}

  /* empty */
  .empty{text-align:center;padding:48px;color:var(--text2);font-size:11px;letter-spacing:1px}

  /* divider */
  .divider{height:1px;background:var(--border);margin:12px 0}

  /* badge */
  .badge{display:inline-flex;align-items:center;padding:2px 8px;font-size:10px;font-weight:700;letter-spacing:.5px}
  .badge.red{background:var(--red-dim);color:var(--accent)}
  .badge.green{background:var(--green-dim);color:var(--green)}
  .badge.yellow{background:rgba(212,160,23,0.1);color:var(--yellow)}

  /* bar chart */
  .bar-chart{display:flex;align-items:flex-end;gap:8px;height:72px;margin-bottom:8px}
  .bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
  .bar{width:100%;border-radius:0;transition:height .6s cubic-bezier(0.34,1.56,0.64,1);min-height:2px}
  .bar-lbl{font-size:9px;color:var(--text2);letter-spacing:.5px}

  /* breakdown */
  .breakdown-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
  .br-emoji{font-size:14px;width:22px;text-align:center}
  .br-name{flex:1;font-size:10px;text-transform:uppercase;letter-spacing:.5px}
  .br-bar-wrap{width:100px;height:3px;background:var(--border);overflow:hidden}
  .br-bar{height:100%;transition:width .8s cubic-bezier(0.34,1.56,0.64,1)}
  .br-val{font-family:var(--font-d);font-size:11px;font-weight:700;width:72px;text-align:right}

  /* rt dot */
  .rt-dot{width:7px;height:7px;border-radius:50%;background:var(--green)}

  @media(max-width:768px){
    .sidebar{display:none}
    .stat-grid{grid-template-columns:repeat(2,1fr)}
    .budget-grid{grid-template-columns:1fr 1fr}
    .page{padding:16px}
    .topbar{padding:0 16px}
  }
`;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span>{t.type==="success"?"✓":"✕"}</span>{t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handle() {
    setLoading(true); setError("");
    try {
      if(mode==="login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if(error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password: pass });
        if(error) throw error;
        setDone(true);
      }
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  if(done) return (
    <div className="auth-wrap">
      <div className="auth-box" style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:16 }}>📧</div>
        <div className="auth-logo">Confirme o e-mail</div>
        <p style={{ fontSize:12, color:"var(--text2)", marginTop:8 }}>
          Enviamos um link para <strong>{email}</strong>. Clique nele para ativar sua conta.
        </p>
        <button className="btn btn-g" style={{ marginTop:20, width:"100%" }} onClick={()=>{ setDone(false); setMode("login"); }}>
          ← Voltar ao login
        </button>
      </div>
    </div>
  );

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">● BANRISUL</div>
        <div className="auth-sub">CONTROLE DE FATURA</div>
        <div className="tabs">
          <div className={`tab ${mode==="login"?"active":""}`} onClick={()=>{ setMode("login"); setError(""); }}>Entrar</div>
          <div className={`tab ${mode==="signup"?"active":""}`} onClick={()=>{ setMode("signup"); setError(""); }}>Criar conta</div>
        </div>
        {error && <div className="alert-box danger" style={{ marginBottom:14 }}>⚠ {error}</div>}
        <div className="fg"><label className="fl">E-mail</label><input className="fi" type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} /></div>
        <div className="fg"><label className="fl">Senha</label><input className="fi" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} /></div>
        <button className="btn btn-p" style={{ width:"100%", padding:"14px" }} onClick={handle} disabled={loading||!email||!pass}>
          {loading ? <div className="spinner" /> : mode==="login" ? "ENTRAR →" : "CRIAR CONTA →"}
        </button>
      </div>
    </div>
  );
}

// ─── TX MODAL ─────────────────────────────────────────────────────────────────
function TxModal({ onClose, onSave, workspaceId, editTx }) {
  const [type, setType]   = useState(editTx?.type||"expense");
  const [amount, setAmount] = useState(editTx ? String(editTx.amount) : "");
  const [desc, setDesc]   = useState(editTx?.description||"");
  const [catId, setCatId] = useState(editTx?.category_id||"");
  const [date, setDate]   = useState(editTx?.date || new Date().toISOString().slice(0,10));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if(!amount||!catId) return;
    setSaving(true);
    await onSave({
      type, amount: parseFloat(amount),
      description: desc || CATS[catId]?.label,
      category_id: catId, date,
      ...(editTx ? { id: editTx.id } : {}),
    });
    setSaving(false);
  }

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <span>{editTx?"Editar":"Nova"} Transação</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="type-tog">
            <button className={`type-btn ${type==="expense"?"ae":""}`} onClick={()=>setType("expense")}>↓ Despesa</button>
            <button className={`type-btn ${type==="refund"?"ar":""}`}  onClick={()=>setType("refund")}>↑ Estorno</button>
          </div>
          <div className="amt-wrap">
            <span className="amt-pre">R$</span>
            <input className="amt-inp" type="number" placeholder="0,00" value={amount} onChange={e=>setAmount(e.target.value)} autoFocus />
          </div>
          <div className="fg">
            <label className="fl">Descrição</label>
            <input className="fi" placeholder="Ex: Supermercado" value={desc} onChange={e=>setDesc(e.target.value)} />
          </div>
          <div className="fg">
            <label className="fl">Categoria</label>
            <div className="cat-grid">
              {Object.entries(CATS).map(([id,c]) => (
                <button key={id} className={`cat-btn ${catId===id?"sel":""}`} onClick={()=>setCatId(id)}>
                  <span style={{ fontSize:18 }}>{c.emoji}</span>
                  <span style={{ fontSize:9 }}>{c.label.split("/")[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="fg">
            <label className="fl">Data</label>
            <input className="fi" type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
          <button className="btn btn-p" style={{ width:"100%", padding:14 }} onClick={handleSave} disabled={saving||!amount||!catId}>
            {saving ? <div className="spinner" /> : editTx ? "SALVAR ALTERAÇÕES" : "ADICIONAR"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BUDGET MODAL ─────────────────────────────────────────────────────────────
function BudgetModal({ onClose, onSave, workspaceId, month, year, existing }) {
  const [values, setValues] = useState(() => {
    const init = {};
    Object.keys(CATS).forEach(id => {
      init[id] = existing[id] ? String(existing[id]) : "";
    });
    return init;
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(values);
    setSaving(false);
  }

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:480 }}>
        <div className="modal-hd">
          <span>Orçamento — {MONTH_NAMES[month]} {year}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize:11, color:"var(--text2)", marginBottom:16, letterSpacing:.5 }}>
            Defina o limite de gasto por categoria para este mês.
          </p>
          {Object.entries(CATS).map(([id,c]) => (
            <div key={id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <span style={{ fontSize:18, width:24 }}>{c.emoji}</span>
              <span style={{ fontSize:11, flex:1, textTransform:"uppercase", letterSpacing:.5 }}>{c.label}</span>
              <div style={{ position:"relative", width:140 }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:11, color:"var(--text2)" }}>R$</span>
                <input
                  className="fi"
                  type="number"
                  placeholder="—"
                  style={{ paddingLeft:32, fontSize:13 }}
                  value={values[id]}
                  onChange={e=>setValues(v=>({...v,[id]:e.target.value}))}
                />
              </div>
            </div>
          ))}
          <button className="btn btn-p" style={{ width:"100%", padding:14, marginTop:8 }} onClick={handleSave} disabled={saving}>
            {saving ? <div className="spinner" /> : "SALVAR ORÇAMENTO"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ txs, budgets, currentMonth, onMonthChange, workspaceId }) {
  const [y, m] = currentMonth;
  const mTxs = txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===y&&d.getMonth()===m; });
  const totalExp = mTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
  const totalRef = mTxs.filter(t=>t.type==="refund").reduce((s,t)=>s+Number(t.amount),0);
  const totalNet = totalExp - totalRef;
  const usedPct  = Math.min((totalNet/CARD_LIMIT)*100,100);

  // alerts
  const alerts = [];
  if(usedPct>80) alerts.push({ type:"danger", msg:`⚠ Cartão a ${Math.round(usedPct)}% do limite! Disponível: ${fmt(CARD_LIMIT-totalNet)}` });
  else if(usedPct>60) alerts.push({ type:"warn", msg:`Cartão a ${Math.round(usedPct)}% do limite. Disponível: ${fmt(CARD_LIMIT-totalNet)}` });

  // budget alerts
  const mBudgets = budgets.filter(b=>b.month===m+1&&b.year===y);
  mBudgets.forEach(b => {
    const spent = mTxs.filter(t=>t.type==="expense"&&t.category_id===b.category_id).reduce((s,t)=>s+Number(t.amount),0);
    const pct = (spent/b.amount)*100;
    if(pct>=100) alerts.push({ type:"danger", msg:`${CATS[b.category_id]?.emoji} ${CATS[b.category_id]?.label}: orçamento ESTOURADO (${fmt(spent)} / ${fmt(b.amount)})` });
    else if(pct>=80) alerts.push({ type:"warn", msg:`${CATS[b.category_id]?.emoji} ${CATS[b.category_id]?.label}: ${Math.round(pct)}% do orçamento usado` });
  });

  // by category
  const byCat = {};
  mTxs.filter(t=>t.type==="expense").forEach(t=>{ byCat[t.category_id]=(byCat[t.category_id]||0)+Number(t.amount); });
  const catList = Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  const maxCat = Math.max(...catList.map(c=>c[1]),1);

  // 6 month bar
  const barData = Array.from({length:6},(_,i)=>{
    const mi=((m-5+i)+12)%12; const yi=m-5+i<0?y-1:y;
    const bd=txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===yi&&d.getMonth()===mi; });
    return { label:MONTHS[mi], val:bd.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0) };
  });
  const maxBar = Math.max(...barData.map(b=>b.val),1);

  const recent = [...mTxs].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);

  return (
    <div className="page">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-d)", fontSize:20, fontWeight:900, letterSpacing:-0.5, textTransform:"uppercase" }}>Dashboard</h1>
          <p style={{ fontSize:10, color:"var(--text2)", marginTop:4, letterSpacing:1 }}>FATURA BANRISUL · VISÃO GERAL</p>
        </div>
        <div className="month-nav">
          <button onClick={()=>onMonthChange(-1)}>‹</button>
          <span>{MONTHS[m]}/{y}</span>
          <button onClick={()=>onMonthChange(1)}>›</button>
        </div>
      </div>

      {alerts.map((a,i) => <div key={i} className={`alert-box ${a.type} fade-up`}>{a.msg}</div>)}

      <div className="stat-grid fade-up" style={{ marginBottom:20 }}>
        <div className="stat-card red">
          <div className="stat-lbl">Total Gastos</div>
          <div className="stat-val red">{fmt(totalExp)}</div>
          <div className="stat-sub">{mTxs.filter(t=>t.type==="expense").length} lançamentos</div>
        </div>
        <div className="stat-card green">
          <div className="stat-lbl">Estornos</div>
          <div className="stat-val green">+{fmt(totalRef)}</div>
          <div className="stat-sub">{mTxs.filter(t=>t.type==="refund").length} estornos</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-lbl">Valor Líquido</div>
          <div className="stat-val blue">{fmt(totalNet)}</div>
          <div className="stat-sub">Disponível: {fmt(CARD_LIMIT-totalNet)}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-lbl">Uso do Limite</div>
          <div className="stat-val yellow">{Math.round(usedPct)}%</div>
          <div className="prog-bar"><div className="prog-fill" style={{ width:`${usedPct}%`, background:usedPct>80?"var(--accent)":usedPct>60?"var(--yellow)":"var(--green)" }} /></div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div className="section fade-up s1">
          <div className="section-hd"><div className="section-title">Evolução Mensal</div></div>
          <div className="bar-chart">
            {barData.map((b,i) => (
              <div key={i} className="bar-col">
                <div className="bar" style={{ height:`${(b.val/maxBar)*100}%`, background:"var(--accent)", opacity:.8 }} />
                <div className="bar-lbl">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="section fade-up s2">
          <div className="section-hd"><div className="section-title">Por Categoria</div></div>
          {catList.length===0 ? <div style={{ fontSize:11, color:"var(--text2)" }}>Sem gastos</div> :
            catList.slice(0,5).map(([cId,val]) => {
              const c=CATS[cId]; if(!c) return null;
              return (
                <div key={cId} className="breakdown-row">
                  <div className="br-emoji">{c.emoji}</div>
                  <div className="br-name">{c.label}</div>
                  <div className="br-bar-wrap"><div className="br-bar" style={{ width:`${(val/maxCat)*100}%`, background:c.color }} /></div>
                  <div className="br-val">{fmt(val)}</div>
                </div>
              );
            })
          }
        </div>
      </div>

      <div className="section fade-up s3">
        <div className="section-hd"><div className="section-title">Últimos Lançamentos</div></div>
        {recent.length===0 ? <div className="empty">SEM TRANSAÇÕES NO PERÍODO</div> :
          <div className="tx-list">
            {recent.map(tx => {
              const c=CATS[tx.category_id];
              return (
                <div key={tx.id} className="tx-row">
                  <div className="tx-date">{fmtDate(tx.date)}</div>
                  <div className="tx-cat-ico">{c?.emoji||"📦"}</div>
                  <div className="tx-info">
                    <div className="tx-desc">{tx.description||c?.label}</div>
                    <div className="tx-sub">{c?.label}</div>
                  </div>
                  <div className={`tx-amt ${tx.type}`}>{tx.type==="refund"?"+":"-"}{fmt(tx.amount)}</div>
                </div>
              );
            })}
          </div>
        }
      </div>
    </div>
  );
}

// ─── TRANSACTIONS PAGE ────────────────────────────────────────────────────────
function Transactions({ txs, onAdd, onEdit, onDelete, currentMonth, onMonthChange, workspaceId }) {
  const [filter, setFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [y, m] = currentMonth;

  const mTxs = txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===y&&d.getMonth()===m; });
  const filtered = mTxs.filter(t => {
    if(filter==="expense"&&t.type!=="expense") return false;
    if(filter==="refund"&&t.type!=="refund") return false;
    const catFilter = Object.keys(CATS).find(k=>k===filter);
    if(catFilter&&t.category_id!==catFilter) return false;
    return true;
  }).sort((a,b)=>new Date(b.date)-new Date(a.date));

  const totalExp = mTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
  const totalRef = mTxs.filter(t=>t.type==="refund").reduce((s,t)=>s+Number(t.amount),0);

  return (
    <div className="page">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-d)", fontSize:20, fontWeight:900, textTransform:"uppercase" }}>Transações</h1>
          <p style={{ fontSize:10, color:"var(--text2)", marginTop:4, letterSpacing:1 }}>{MONTH_NAMES[m].toUpperCase()} {y}</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div className="month-nav">
            <button onClick={()=>onMonthChange(-1)}>‹</button>
            <span>{MONTHS[m]}/{y}</span>
            <button onClick={()=>onMonthChange(1)}>›</button>
          </div>
          <button className="btn btn-accent" onClick={()=>setShowNew(true)}>+ NOVO</button>
        </div>
      </div>

      <div className="stat-grid fade-up" style={{ marginBottom:20, gridTemplateColumns:"repeat(3,1fr)" }}>
        <div className="stat-card red"><div className="stat-lbl">Gastos</div><div className="stat-val red">{fmt(totalExp)}</div></div>
        <div className="stat-card green"><div className="stat-lbl">Estornos</div><div className="stat-val green">+{fmt(totalRef)}</div></div>
        <div className="stat-card blue"><div className="stat-lbl">Líquido</div><div className="stat-val blue">{fmt(totalExp-totalRef)}</div></div>
      </div>

      <div className="filter-bar fade-up s1">
        {[
          {id:"all",label:"Todos"},
          {id:"expense",label:"Despesas"},
          {id:"refund",label:"Estornos"},
          {id:"food",label:"🍔"},
          {id:"market",label:"🛒"},
          {id:"home",label:"🏠"},
          {id:"other",label:"📦"},
        ].map(f=>(
          <button key={f.id} className={`filter-btn ${filter===f.id?"active":""}`} onClick={()=>setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      <div className="section fade-up s2">
        {filtered.length===0 ? <div className="empty">NENHUMA TRANSAÇÃO ENCONTRADA</div> :
          <div className="tx-list">
            {filtered.map(tx => {
              const c=CATS[tx.category_id];
              return (
                <div key={tx.id} className="tx-row">
                  <div className="tx-date">{fmtDate(tx.date)}</div>
                  <div className="tx-cat-ico">{c?.emoji||"📦"}</div>
                  <div className="tx-info">
                    <div className="tx-desc">{tx.description||c?.label}</div>
                    <div className="tx-sub">{c?.label} · {tx.type==="refund"?"Estorno":"Despesa"}</div>
                  </div>
                  <div className={`tx-amt ${tx.type}`}>{tx.type==="refund"?"+":"-"}{fmt(tx.amount)}</div>
                  <div className="tx-actions">
                    <button className="tx-action-btn" onClick={()=>setEditTx(tx)} title="Editar">✏</button>
                    <button className="tx-action-btn del" onClick={()=>onDelete(tx.id)} title="Excluir">🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>

      {(showNew||editTx) && (
        <TxModal
          onClose={()=>{ setShowNew(false); setEditTx(null); }}
          onSave={async tx => { await (editTx?onEdit:onAdd)(tx); setShowNew(false); setEditTx(null); }}
          workspaceId={workspaceId}
          editTx={editTx}
        />
      )}
    </div>
  );
}

// ─── BUDGETS PAGE ─────────────────────────────────────────────────────────────
function Budgets({ txs, budgets, onSaveBudget, currentMonth, onMonthChange, workspaceId }) {
  const [showModal, setShowModal] = useState(false);
  const [y, m] = currentMonth;
  const mTxs = txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===y&&d.getMonth()===m; });
  const mBudgets = budgets.filter(b=>b.month===m+1&&b.year===y);

  const existing = {};
  mBudgets.forEach(b=>{ existing[b.category_id]=b.amount; });

  return (
    <div className="page">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-d)", fontSize:20, fontWeight:900, textTransform:"uppercase" }}>Orçamento</h1>
          <p style={{ fontSize:10, color:"var(--text2)", marginTop:4, letterSpacing:1 }}>{MONTH_NAMES[m].toUpperCase()} {y}</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div className="month-nav">
            <button onClick={()=>onMonthChange(-1)}>‹</button>
            <span>{MONTHS[m]}/{y}</span>
            <button onClick={()=>onMonthChange(1)}>›</button>
          </div>
          <button className="btn btn-accent" onClick={()=>setShowModal(true)}>✏ EDITAR</button>
        </div>
      </div>

      {mBudgets.length===0 ? (
        <div className="empty" style={{ border:"2px dashed var(--border)" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>📊</div>
          <div style={{ fontWeight:700, marginBottom:4 }}>NENHUM ORÇAMENTO DEFINIDO</div>
          <div>Clique em "Editar" para definir limites por categoria</div>
          <button className="btn btn-p" style={{ marginTop:16 }} onClick={()=>setShowModal(true)}>DEFINIR ORÇAMENTO</button>
        </div>
      ) : (
        <div className="budget-grid fade-up">
          {Object.entries(CATS).map(([id,c]) => {
            const budget = existing[id];
            if(!budget) return null;
            const spent = mTxs.filter(t=>t.type==="expense"&&t.category_id===id).reduce((s,t)=>s+Number(t.amount),0);
            const pct = Math.min((spent/budget)*100,100);
            const status = pct>=100?"danger":pct>=80?"warn":"ok";
            return (
              <div key={id} className="budget-card">
                <div className="budget-cat">
                  <span className="budget-emoji">{c.emoji}</span>
                  <span className="budget-cat-name">{c.label}</span>
                  {status==="danger" && <span className="badge red" style={{ marginLeft:"auto" }}>ESTOURADO</span>}
                  {status==="warn"   && <span className="badge yellow" style={{ marginLeft:"auto" }}>ATENÇÃO</span>}
                </div>
                <div className="budget-nums">
                  <span className="budget-spent" style={{ color:status==="danger"?"var(--accent)":status==="warn"?"var(--yellow)":"var(--text)" }}>{fmt(spent)}</span>
                  <span className="budget-limit">/ {fmt(budget)}</span>
                </div>
                <div className="prog-bar" style={{ height:6 }}>
                  <div className="prog-fill" style={{ width:`${pct}%`, background:status==="danger"?"var(--accent)":status==="warn"?"var(--yellow)":"var(--green)" }} />
                </div>
                <div className="budget-pct" style={{ color:status==="danger"?"var(--accent)":status==="warn"?"var(--yellow)":"var(--text2)" }}>
                  {Math.round(pct)}% utilizado · Disponível: {fmt(Math.max(budget-spent,0))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <BudgetModal
          onClose={()=>setShowModal(false)}
          onSave={async vals => { await onSaveBudget(vals, m, y); setShowModal(false); }}
          workspaceId={workspaceId}
          month={m} year={y}
          existing={existing}
        />
      )}
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function Reports({ txs }) {
  const now = new Date();
  const months = Array.from({length:6},(_,i)=>{ const d=new Date(now.getFullYear(),now.getMonth()-i,1); return {y:d.getFullYear(),m:d.getMonth()}; }).reverse();

  const byCat={};
  txs.filter(t=>t.type==="expense").forEach(t=>{ byCat[t.category_id]=(byCat[t.category_id]||0)+Number(t.amount); });
  const totalExp=Object.values(byCat).reduce((s,v)=>s+v,0);
  const maxCat=Math.max(...Object.values(byCat),1);

  return (
    <div className="page">
      <h1 style={{ fontFamily:"var(--font-d)", fontSize:20, fontWeight:900, textTransform:"uppercase", marginBottom:6 }}>Relatórios</h1>
      <p style={{ fontSize:10, color:"var(--text2)", marginBottom:24, letterSpacing:1 }}>ÚLTIMOS 6 MESES</p>

      <div className="section fade-up">
        <div className="section-hd"><div className="section-title">Gastos por Categoria (acumulado)</div></div>
        {Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([cId,val])=>{
          const c=CATS[cId]; if(!c) return null;
          return (
            <div key={cId} className="breakdown-row">
              <div className="br-emoji">{c.emoji}</div>
              <div className="br-name">{c.label}</div>
              <div style={{ flex:1, height:4, background:"var(--border)", marginRight:12 }}>
                <div style={{ height:"100%", width:`${(val/maxCat)*100}%`, background:c.color, transition:"width .8s" }} />
              </div>
              <div style={{ fontSize:10, color:"var(--text2)", width:36, textAlign:"right" }}>{Math.round((val/totalExp)*100)}%</div>
              <div className="br-val">{fmt(val)}</div>
            </div>
          );
        })}
      </div>

      <div className="section fade-up s1" style={{ marginTop:24 }}>
        <div className="section-hd"><div className="section-title">Resumo Mensal</div></div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:"2px solid var(--text)" }}>
                <th style={{ textAlign:"left", padding:"8px 12px", color:"var(--text2)", fontWeight:400, letterSpacing:1 }}>MÊS</th>
                <th style={{ textAlign:"right", padding:"8px 12px", color:"var(--accent)", fontWeight:400 }}>GASTOS</th>
                <th style={{ textAlign:"right", padding:"8px 12px", color:"var(--green)", fontWeight:400 }}>ESTORNOS</th>
                <th style={{ textAlign:"right", padding:"8px 12px", fontWeight:400 }}>LÍQUIDO</th>
                <th style={{ textAlign:"right", padding:"8px 12px", color:"var(--text2)", fontWeight:400 }}>LANÇAMENTOS</th>
              </tr>
            </thead>
            <tbody>
              {months.map(({y,m})=>{
                const mTx=txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===y&&d.getMonth()===m; });
                const exp=mTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
                const ref=mTx.filter(t=>t.type==="refund").reduce((s,t)=>s+Number(t.amount),0);
                return (
                  <tr key={`${y}-${m}`} style={{ borderBottom:"1px solid var(--border)" }}>
                    <td style={{ padding:"10px 12px", fontWeight:700 }}>{MONTHS[m]}/{y}</td>
                    <td style={{ padding:"10px 12px", textAlign:"right", color:"var(--accent)" }}>{fmt(exp)}</td>
                    <td style={{ padding:"10px 12px", textAlign:"right", color:"var(--green)" }}>+{fmt(ref)}</td>
                    <td style={{ padding:"10px 12px", textAlign:"right", fontWeight:700 }}>{fmt(exp-ref)}</td>
                    <td style={{ padding:"10px 12px", textAlign:"right", color:"var(--text2)" }}>{mTx.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [txs, setTxs]     = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [page, setPage]   = useState("dashboard");
  const [showNewTx, setShowNewTx] = useState(false);
  const [toasts, setToasts] = useState([]);
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState([now.getFullYear(), now.getMonth()]);
  const channelRef = useRef(null);

  function addToast(msg, type="success") {
    const id = genId();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  }

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{ setSession(session); setLoading(false); });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,s)=>setSession(s));
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{ if(session) loadWorkspace(); },[session]);

  async function loadWorkspace() {
    const { data: members } = await supabase.from("workspace_members").select("*").eq("user_id",session.user.id);
    if(!members||members.length===0) { setWorkspace(null); return; }
    const wsId = members[0].workspace_id;
    const { data: ws } = await supabase.from("workspaces").select("*").eq("id",wsId).single();
    setWorkspace(ws);
    await loadData(wsId);
    setupRealtime(wsId);
  }

  async function loadData(wsId) {
    const id = wsId||workspace?.id; if(!id) return;
    const [{ data: txData }, { data: budgetData }] = await Promise.all([
      supabase.from("transactions").select("*").eq("workspace_id",id).order("date",{ascending:false}),
      supabase.from("budgets").select("*").eq("workspace_id",id),
    ]);
    setTxs(txData||[]);
    setBudgets(budgetData||[]);
  }

  function setupRealtime(wsId) {
    if(channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase.channel(`banrisul:${wsId}`)
      .on("postgres_changes",{event:"*",schema:"public",table:"transactions",filter:`workspace_id=eq.${wsId}`},()=>loadData(wsId))
      .on("postgres_changes",{event:"*",schema:"public",table:"budgets",filter:`workspace_id=eq.${wsId}`},()=>loadData(wsId))
      .subscribe();
    channelRef.current=ch;
  }

  async function addTx(tx) {
    const { error } = await supabase.from("transactions").insert({ ...tx, workspace_id:workspace.id, user_id:session.user.id });
    if(error) { addToast("Erro ao salvar","error"); return; }
    setShowNewTx(false);
    addToast(`${tx.type==="refund"?"Estorno":"Despesa"} de ${fmt(tx.amount)} adicionada!`);
  }

  async function editTx(tx) {
    const { error } = await supabase.from("transactions").update({
      type:tx.type, amount:tx.amount, description:tx.description,
      category_id:tx.category_id, date:tx.date,
    }).eq("id",tx.id);
    if(error) { addToast("Erro ao editar","error"); return; }
    addToast("Transação atualizada!");
  }

  async function deleteTx(id) {
    await supabase.from("transactions").delete().eq("id",id);
    addToast("Transação removida");
  }

  async function saveBudget(vals, m, y) {
    const upserts = Object.entries(vals)
      .filter(([,v])=>v&&Number(v)>0)
      .map(([cat,val])=>({
        workspace_id:workspace.id, category_id:cat,
        month:m+1, year:y, amount:Number(val),
      }));
    if(upserts.length===0) return;
    const { error } = await supabase.from("budgets").upsert(upserts, { onConflict:"workspace_id,category_id,month,year" });
    if(error) { addToast("Erro ao salvar orçamento","error"); return; }
    addToast("Orçamento salvo!");
  }

  function changeMonth(dir) {
    setCurrentMonth(([y,m])=>{
      let nm=m+dir,ny=y;
      if(nm<0){nm=11;ny--;} if(nm>11){nm=0;ny++;}
      return [ny,nm];
    });
  }

  async function signOut() { await supabase.auth.signOut(); setWorkspace(null); setTxs([]); setBudgets([]); }

  // budget alerts count
  const [y,m]=currentMonth;
  const mTxs=txs.filter(t=>{ const d=new Date(t.date+"T12:00"); return d.getFullYear()===y&&d.getMonth()===m; });
  const budgetAlerts = budgets.filter(b=>{
    if(b.month!==m+1||b.year!==y) return false;
    const spent=mTxs.filter(t=>t.type==="expense"&&t.category_id===b.category_id).reduce((s,t)=>s+Number(t.amount),0);
    return (spent/b.amount)>=0.8;
  }).length;

  const navItems = [
    {id:"dashboard",  icon:"📊", label:"Dashboard"},
    {id:"transactions",icon:"💸", label:"Transações"},
    {id:"budgets",    icon:"🎯", label:"Orçamento"},
    {id:"reports",    icon:"📈", label:"Relatórios"},
  ];

  const pageLabels = {dashboard:"Dashboard",transactions:"Transações",budgets:"Orçamento",reports:"Relatórios"};

  // ── render ──
  if(loading) return (
    <>
      <style>{css}</style>
      <div className="loading-screen">
        <div style={{ fontFamily:"var(--font-d)", fontSize:16, fontWeight:900, letterSpacing:2 }}>● BANRISUL</div>
        <div className="spinner" />
      </div>
    </>
  );

  if(!session) return ( <><style>{css}</style><AuthScreen /></> );

  // if no workspace — auto-create one for single user
  if(!workspace) return (
    <>
      <style>{css}</style>
      <div className="auth-wrap">
        <div className="auth-box" style={{ textAlign:"center" }}>
          <div className="auth-logo">● BANRISUL</div>
          <div className="auth-sub" style={{ marginBottom:20 }}>CONFIGURAÇÃO INICIAL</div>
          <p style={{ fontSize:11, color:"var(--text2)", marginBottom:20 }}>Clique abaixo para configurar seu espaço.</p>
          <button className="btn btn-p" style={{ width:"100%", padding:14 }} onClick={async ()=>{
            const { data:ws } = await supabase.from("workspaces").insert({ name:"Banrisul" }).select().single();
            await supabase.from("workspace_members").insert({ workspace_id:ws.id, user_id:session.user.id, display_name:"Eu", color:"#c8431a", role:"owner" });
            loadWorkspace();
          }}>CONFIGURAR →</button>
        </div>
      </div>
    </>
  );

  const totalNet = mTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0) - mTxs.filter(t=>t.type==="refund").reduce((s,t)=>s+Number(t.amount),0);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-name">● BANRISUL</div>
            <div className="logo-sub">CONTROLE DE FATURA</div>
            <div className="card-pill">
              <div className="card-pill-name">LIMITE</div>
              <div className="card-pill-limit">{fmt(CARD_LIMIT)}</div>
            </div>
          </div>

          <div className="nav-section">MENU</div>
          {navItems.map(n=>(
            <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
              {n.id==="budgets"&&budgetAlerts>0&&<span style={{ marginLeft:"auto", background:"var(--accent)", color:"#fff", fontSize:9, padding:"1px 6px", fontWeight:700 }}>{budgetAlerts}</span>}
            </div>
          ))}

          <div className="sidebar-foot">
            <button className="signout-btn" onClick={signOut}>SAIR DA CONTA</button>
          </div>
        </nav>

        <main className="main">
          <div className="topbar">
            <div className="topbar-title">{pageLabels[page]}</div>
            <div className="topbar-right">
              <div className="rt-dot" title="Sincronizado" />
              <span style={{ fontSize:10, color:"var(--text2)", letterSpacing:1 }}>AO VIVO</span>
              <button className="btn btn-accent btn-sm" onClick={()=>setShowNewTx(true)}>+ LANÇAR</button>
            </div>
          </div>

          {page==="dashboard"    && <Dashboard txs={txs} budgets={budgets} currentMonth={currentMonth} onMonthChange={changeMonth} workspaceId={workspace.id} />}
          {page==="transactions" && <Transactions txs={txs} onAdd={addTx} onEdit={editTx} onDelete={deleteTx} currentMonth={currentMonth} onMonthChange={changeMonth} workspaceId={workspace.id} />}
          {page==="budgets"      && <Budgets txs={txs} budgets={budgets} onSaveBudget={saveBudget} currentMonth={currentMonth} onMonthChange={changeMonth} workspaceId={workspace.id} />}
          {page==="reports"      && <Reports txs={txs} />}
        </main>
      </div>

      <button
        style={{ position:"fixed", right:24, bottom:24, width:48, height:48, borderRadius:0, background:"var(--text)", color:"var(--bg)", fontSize:22, fontWeight:900, cursor:"pointer", border:"none", boxShadow:"4px 4px 0 var(--accent)", transition:"all .2s", zIndex:200 }}
        onClick={()=>setShowNewTx(true)}
        onMouseEnter={e=>{ e.target.style.transform="translateY(-2px)"; }}
        onMouseLeave={e=>{ e.target.style.transform="translateY(0)"; }}
      >+</button>

      {showNewTx && <TxModal onClose={()=>setShowNewTx(false)} onSave={addTx} workspaceId={workspace.id} />}

      <Toast toasts={toasts} />
    </>
  );
}
