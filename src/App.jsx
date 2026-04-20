import { useState, useMemo } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Unbounded:wght@300;400;600;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f5f0e8;
    --surface: #ffffff;
    --surface2: #f0ebe0;
    --border: #e0d8cc;
    --text: #1a1208;
    --text2: #7a6e5f;
    --accent: #c8431a;
    --accent2: #e8631a;
    --green: #1a7a3a;
    --green-dim: rgba(26,122,58,0.1);
    --red: #c8431a;
    --red-dim: rgba(200,67,26,0.1);
    --yellow: #d4a017;
    --font-d: 'Unbounded', sans-serif;
    --font-m: 'Space Mono', monospace;
    --radius: 4px;
    --shadow: 0 2px 12px rgba(26,18,8,0.08);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-m);
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--border); }

  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  .app {
    min-height: 100vh;
    background: var(--bg);
    position: relative;
    overflow-x: hidden;
  }

  /* decorative grid */
  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(200,67,26,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(200,67,26,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .container { max-width: 900px; margin: 0 auto; padding: 0 20px 80px; position: relative; z-index: 1; }

  /* header */
  .header {
    padding: 32px 0 24px;
    border-bottom: 2px solid var(--text);
    margin-bottom: 32px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  .bank-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--accent);
    color: #fff;
    font-family: var(--font-d);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    padding: 4px 10px;
    margin-bottom: 8px;
  }

  .header-title {
    font-family: var(--font-d);
    font-size: clamp(22px, 4vw, 36px);
    font-weight: 900;
    letter-spacing: -1px;
    line-height: 1.1;
    text-transform: uppercase;
  }

  .header-title span { color: var(--accent); }

  .header-meta {
    font-size: 11px;
    color: var(--text2);
    margin-top: 6px;
    letter-spacing: 1px;
  }

  .limit-badge {
    text-align: right;
  }

  .limit-label {
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text2);
    margin-bottom: 4px;
  }

  .limit-value {
    font-family: var(--font-d);
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
  }

  .limit-bar-wrap {
    margin-top: 6px;
    width: 180px;
    height: 6px;
    background: var(--border);
    border-radius: 0;
    overflow: hidden;
  }

  .limit-bar-fill {
    height: 100%;
    background: var(--accent);
    transition: width 1s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* summary cards */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    border: 2px solid var(--text);
    margin-bottom: 32px;
  }

  .sum-card {
    padding: 20px;
    border-right: 2px solid var(--text);
    animation: fadeUp 0.4s ease both;
  }
  .sum-card:last-child { border-right: none; }

  .sum-label {
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text2);
    margin-bottom: 8px;
  }

  .sum-value {
    font-family: var(--font-d);
    font-size: 20px;
    font-weight: 700;
  }
  .sum-value.red { color: var(--accent); }
  .sum-value.green { color: var(--green); }

  .sum-sub { font-size: 10px; color: var(--text2); margin-top: 4px; }

  /* filters */
  .filter-bar {
    display: flex;
    gap: 0;
    margin-bottom: 24px;
    border: 2px solid var(--text);
    overflow: hidden;
  }

  .filter-btn {
    flex: 1;
    padding: 10px;
    border: none;
    border-right: 2px solid var(--text);
    background: transparent;
    font-family: var(--font-m);
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    color: var(--text2);
    transition: all 0.15s;
  }
  .filter-btn:last-child { border-right: none; }
  .filter-btn:hover { background: var(--surface2); color: var(--text); }
  .filter-btn.active { background: var(--text); color: var(--bg); }

  /* month section */
  .month-section { margin-bottom: 28px; animation: fadeUp 0.4s ease both; }

  .month-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 2px;
  }

  .month-name {
    font-family: var(--font-d);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  .month-total {
    font-family: var(--font-d);
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
  }

  /* transaction row */
  .tx-row {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
    gap: 12px;
    cursor: pointer;
    transition: background 0.1s;
    position: relative;
  }
  .tx-row:hover { background: var(--surface2); margin: 0 -12px; padding: 12px 12px; }

  .tx-date {
    font-size: 10px;
    color: var(--text2);
    width: 40px;
    flex-shrink: 0;
    letter-spacing: 0.5px;
  }

  .tx-cat {
    width: 28px; height: 28px;
    border: 1.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
    background: var(--surface);
  }

  .tx-info { flex: 1; min-width: 0; }

  .tx-desc {
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .tx-sub { font-size: 10px; color: var(--text2); margin-top: 2px; }

  .tx-amount {
    font-family: var(--font-d);
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .tx-amount.expense { color: var(--accent); }
  .tx-amount.refund { color: var(--green); }

  /* category breakdown */
  .breakdown {
    border: 2px solid var(--text);
    margin-top: 32px;
    animation: fadeUp 0.5s ease both;
  }

  .breakdown-header {
    padding: 14px 16px;
    border-bottom: 2px solid var(--text);
    font-family: var(--font-d);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    background: var(--text);
    color: var(--bg);
  }

  .breakdown-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }
  .breakdown-row:last-child { border-bottom: none; }

  .br-emoji { font-size: 16px; width: 24px; text-align: center; }
  .br-name { flex: 1; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
  .br-bar-wrap { width: 120px; height: 4px; background: var(--border); overflow: hidden; }
  .br-bar { height: 100%; background: var(--accent); transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1); }
  .br-val { font-family: var(--font-d); font-size: 12px; font-weight: 700; width: 80px; text-align: right; }

  /* empty */
  .empty {
    text-align: center;
    padding: 48px;
    color: var(--text2);
    font-size: 12px;
    letter-spacing: 1px;
  }

  /* footer */
  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 2px solid var(--text);
    font-size: 10px;
    color: var(--text2);
    letter-spacing: 1px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* detail modal */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(26,18,8,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px;
    animation: fadeIn 0.2s ease;
  }

  .modal {
    background: var(--surface);
    border: 2px solid var(--text);
    width: 100%; max-width: 380px;
    animation: fadeUp 0.25s ease both;
  }

  .modal-header {
    background: var(--text);
    color: var(--bg);
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--font-d);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .modal-close {
    background: none; border: none;
    color: var(--bg); font-size: 18px; cursor: pointer;
    line-height: 1;
  }

  .modal-body { padding: 24px; }

  .modal-amount {
    font-family: var(--font-d);
    font-size: 36px;
    font-weight: 900;
    margin-bottom: 4px;
  }

  .modal-desc {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text2);
    margin-bottom: 20px;
  }

  .modal-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
    font-size: 11px;
  }

  .modal-row-label { color: var(--text2); letter-spacing: 0.5px; }
  .modal-row-val { font-weight: 700; text-align: right; }

  @media (max-width: 600px) {
    .summary-grid { grid-template-columns: 1fr 1fr; }
    .sum-card:nth-child(2) { border-right: none; }
    .sum-card:nth-child(3) { border-top: 2px solid var(--text); border-right: none; grid-column: span 2; }
    .header { flex-direction: column; }
    .limit-badge { text-align: left; }
    .limit-bar-wrap { width: 100%; }
  }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TRANSACTIONS = [
  // MARÇO
  { id:1,  date:"2026-03-25", desc:"Supermercado Negreiros",    amount: 125.94, type:"expense", cat:"market",    mes:"Março" },
  { id:2,  date:"2026-03-25", desc:"Rei do Sabão",              amount:  35.96, type:"expense", cat:"home",      mes:"Março" },
  // ABRIL
  { id:3,  date:"2026-04-01", desc:"Infomax Consultoria",       amount:  35.00, type:"expense", cat:"edu",       mes:"Abril" },
  { id:4,  date:"2026-04-01", desc:"Vinni Doces",               amount:  65.12, type:"expense", cat:"food",      mes:"Abril" },
  { id:5,  date:"2026-04-03", desc:"Shopee Admiraredecora",     amount: 260.81, type:"expense", cat:"home",      mes:"Abril" },
  { id:6,  date:"2026-04-05", desc:"Shopee Admiraredecora (Estorno)", amount: 37.99, type:"refund", cat:"home",  mes:"Abril" },
  { id:7,  date:"2026-04-06", desc:"IFD Sugarcake",             amount:  42.23, type:"expense", cat:"food",      mes:"Abril" },
  { id:8,  date:"2026-04-07", desc:"Serralheria e Manutenção",  amount: 400.00, type:"expense", cat:"home",      mes:"Abril" },
  { id:9,  date:"2026-04-07", desc:"Casa Teruya",               amount: 216.10, type:"expense", cat:"home",      mes:"Abril" },
  { id:10, date:"2026-04-08", desc:"Velplast Embalagens",       amount:  51.40, type:"expense", cat:"other",     mes:"Abril" },
  { id:11, date:"2026-04-09", desc:"Bolos da Lu",               amount: 160.00, type:"expense", cat:"food",      mes:"Abril" },
  { id:12, date:"2026-04-10", desc:"Shopee Admiraredecora (Estorno)", amount: 28.99, type:"refund", cat:"home",  mes:"Abril" },
  { id:13, date:"2026-04-10", desc:"Shopee Trinidade",          amount: 110.00, type:"expense", cat:"market",    mes:"Abril" },
  { id:14, date:"2026-04-17", desc:"Paróquia Nossa Senhora",    amount:  40.00, type:"expense", cat:"other",     mes:"Abril" },
  { id:15, date:"2026-03-31", desc:"Lindevaldo Caetano",        amount: 106.00, type:"expense", cat:"other",     mes:"Março" },
  { id:16, date:"2026-03-31", desc:"Lindevaldo Caetano",        amount:  45.00, type:"expense", cat:"other",     mes:"Março" },
  { id:17, date:"2026-03-31", desc:"Lindevaldo Caetano",        amount:   7.00, type:"expense", cat:"other",     mes:"Março" },
];

const CATS = {
  food:   { emoji:"🍔", label:"Alimentação" },
  market: { emoji:"🛒", label:"Mercado" },
  home:   { emoji:"🏠", label:"Casa / Lar" },
  edu:    { emoji:"📚", label:"Serviços" },
  other:  { emoji:"📦", label:"Outros" },
};

const LIMIT = 4100;

const fmt = n => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);
const fmtDate = iso => {
  const d = new Date(iso+"T12:00");
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
};

export default function App() {
  const [filter, setFilter] = useState("all");
  const [sel, setSel] = useState(null);

  const filtered = useMemo(() => {
    if(filter === "all") return TRANSACTIONS;
    if(filter === "marco") return TRANSACTIONS.filter(t => t.mes === "Março");
    if(filter === "abril") return TRANSACTIONS.filter(t => t.mes === "Abril");
    if(filter === "estorno") return TRANSACTIONS.filter(t => t.type === "refund");
    return TRANSACTIONS;
  }, [filter]);

  const totalExpense = TRANSACTIONS.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const totalRefund  = TRANSACTIONS.filter(t=>t.type==="refund").reduce((s,t)=>s+t.amount,0);
  const totalLiquido = totalExpense - totalRefund;
  const usedPct = Math.min((totalLiquido/LIMIT)*100, 100);

  // by month
  const byMonth = ["Março","Abril"].map(mes => ({
    mes,
    txs: filtered.filter(t => t.mes === mes),
    total: filtered.filter(t => t.mes === mes && t.type==="expense").reduce((s,t)=>s+t.amount,0),
    refund: filtered.filter(t => t.mes === mes && t.type==="refund").reduce((s,t)=>s+t.amount,0),
  })).filter(m => m.txs.length > 0);

  // category breakdown
  const byCat = {};
  TRANSACTIONS.filter(t=>t.type==="expense").forEach(t => {
    byCat[t.cat] = (byCat[t.cat]||0) + t.amount;
  });
  const catList = Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  const maxCat = Math.max(...catList.map(c=>c[1]));

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="container">

          {/* HEADER */}
          <div className="header">
            <div>
              <div className="bank-tag">● BANRISUL</div>
              <div className="header-title">
                Fatura<br/><span>Cartão</span>
              </div>
              <div className="header-meta">MAR–ABR 2026 · EXTRATO COMPLETO</div>
            </div>
            <div className="limit-badge">
              <div className="limit-label">Limite do cartão</div>
              <div className="limit-value">{fmt(LIMIT)}</div>
              <div className="limit-bar-wrap">
                <div className="limit-bar-fill" style={{ width:`${usedPct}%` }} />
              </div>
              <div style={{ fontSize:10, color:"var(--text2)", marginTop:4, letterSpacing:"0.5px" }}>
                {Math.round(usedPct)}% utilizado
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="summary-grid">
            <div className="sum-card" style={{ animationDelay:"0.05s" }}>
              <div className="sum-label">Total Gastos</div>
              <div className="sum-value red">{fmt(totalExpense)}</div>
              <div className="sum-sub">{TRANSACTIONS.filter(t=>t.type==="expense").length} lançamentos</div>
            </div>
            <div className="sum-card" style={{ animationDelay:"0.10s" }}>
              <div className="sum-label">Estornos</div>
              <div className="sum-value green">+{fmt(totalRefund)}</div>
              <div className="sum-sub">{TRANSACTIONS.filter(t=>t.type==="refund").length} estornos</div>
            </div>
            <div className="sum-card" style={{ animationDelay:"0.15s" }}>
              <div className="sum-label">Valor Líquido</div>
              <div className="sum-value red">{fmt(totalLiquido)}</div>
              <div className="sum-sub">Disponível: {fmt(LIMIT-totalLiquido)}</div>
            </div>
          </div>

          {/* FILTERS */}
          <div className="filter-bar">
            {[
              { id:"all",     label:"Todos" },
              { id:"marco",   label:"Março" },
              { id:"abril",   label:"Abril" },
              { id:"estorno", label:"Estornos" },
            ].map(f => (
              <button key={f.id} className={`filter-btn ${filter===f.id?"active":""}`} onClick={()=>setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>

          {/* TRANSACTIONS */}
          {byMonth.map(({ mes, txs, total, refund }) => (
            <div key={mes} className="month-section">
              <div className="month-header">
                <div className="month-name">{mes} 2026</div>
                <div className="month-total">
                  {refund > 0 && <span style={{ color:"var(--green)", marginRight:8, fontSize:11 }}>+{fmt(refund)}</span>}
                  {fmt(total)}
                </div>
              </div>
              {txs.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(tx => {
                const cat = CATS[tx.cat];
                return (
                  <div key={tx.id} className="tx-row" onClick={()=>setSel(tx)}>
                    <div className="tx-date">{fmtDate(tx.date)}</div>
                    <div className="tx-cat">{cat.emoji}</div>
                    <div className="tx-info">
                      <div className="tx-desc">{tx.desc}</div>
                      <div className="tx-sub">{cat.label}</div>
                    </div>
                    <div className={`tx-amount ${tx.type}`}>
                      {tx.type==="refund" ? "+" : "-"}{fmt(tx.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {byMonth.length === 0 && (
            <div className="empty">NENHUMA TRANSAÇÃO ENCONTRADA</div>
          )}

          {/* CATEGORY BREAKDOWN */}
          <div className="breakdown">
            <div className="breakdown-header">Gastos por Categoria</div>
            {catList.map(([cat, val]) => {
              const c = CATS[cat];
              const pct = (val/maxCat)*100;
              return (
                <div key={cat} className="breakdown-row">
                  <div className="br-emoji">{c.emoji}</div>
                  <div className="br-name">{c.label}</div>
                  <div className="br-bar-wrap">
                    <div className="br-bar" style={{ width:`${pct}%` }} />
                  </div>
                  <div className="br-val">{fmt(val)}</div>
                </div>
              );
            })}
          </div>

          {/* FOOTER */}
          <div className="footer">
            <span>BANRISUL · EXTRATO MAR–ABR 2026</span>
            <span>LIMITE: {fmt(LIMIT)} · USADO: {fmt(totalLiquido)}</span>
          </div>

        </div>
      </div>

      {/* DETAIL MODAL */}
      {sel && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setSel(null)}>
          <div className="modal">
            <div className="modal-header">
              <span>Detalhe</span>
              <button className="modal-close" onClick={()=>setSel(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className={`modal-amount ${sel.type==="refund"?"":""}`} style={{ color: sel.type==="refund"?"var(--green)":"var(--accent)" }}>
                {sel.type==="refund"?"+":"-"}{fmt(sel.amount)}
              </div>
              <div className="modal-desc">{sel.desc}</div>
              {[
                ["Data",      fmtDate(sel.date)],
                ["Mês",       sel.mes + " 2026"],
                ["Categoria", CATS[sel.cat].emoji + " " + CATS[sel.cat].label],
                ["Tipo",      sel.type==="refund" ? "✅ Estorno" : "💳 Débito no cartão"],
                ["Cartão",    "Banrisul"],
              ].map(([k,v]) => (
                <div key={k} className="modal-row">
                  <span className="modal-row-label">{k}</span>
                  <span className="modal-row-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
