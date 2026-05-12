import { useState, useCallback } from "react";

/* ══════════════════════════════════════════════════════════
   PRICING DATA
   ══════════════════════════════════════════════════════════ */
const EMPLOYEE_TIERS = [
  { id: "t1", label: "1–149", range: "1–149 employees" },
  { id: "t2", label: "150–349", range: "150–349 employees" },
  { id: "t3", label: "350–749", range: "350–749 employees" },
  { id: "t4", label: "750–1,499", range: "750–1,499 employees" },
  { id: "t5", label: "1,500–2,499", range: "1,500–2,499 employees" },
  { id: "t6", label: "2,500–4,999", range: "2,500–4,999 employees" },
  { id: "t7", label: "5,000–7,499", range: "5,000–7,499 employees" },
  { id: "t8", label: "7,500–9,999", range: "7,500–9,999 employees" },
  { id: "t9", label: "10,000–14,999", range: "10,000–14,999 employees" },
  { id: "t10", label: "15,000–20,000", range: "15,000–20,000 employees" },
];

const BASE_PLATFORM_FEE = {
  t1: 3000, t2: 6000, t3: 9000, t4: 13500, t5: 19500,
  t6: 28000, t7: 37000, t8: 44000, t9: 52000, t10: 60000,
};

const PACKAGES = [
  {
    id: "launch", label: "Launch", tagline: "Essential Safety Management", color: "#2563eb",
    defaultModules: ["incidents", "audits", "observations"],
    prices: { t1: 8000, t2: 13000, t3: 20000, t4: 30400, t5: 44000, t6: 64000, t7: 84000, t8: 100000, t9: 120000, t10: 140000 },
  },
  {
    id: "scale", label: "Scale", tagline: "Advanced Operations Suite", color: "#0ea578", popular: true,
    defaultModules: ["incidents", "audits", "observations", "equipment", "sds", "checklists"],
    prices: { t1: 10800, t2: 17550, t3: 27000, t4: 41040, t5: 59400, t6: 86400, t7: 113400, t8: 135000, t9: 162000, t10: 189000 },
  },
  {
    id: "maximize", label: "Maximize", tagline: "Full EHS Platform", color: "#d97706",
    defaultModules: ["incidents", "audits", "observations", "equipment", "sds", "checklists", "risk", "moc", "documents"],
    prices: { t1: 12420, t2: 20183, t3: 31050, t4: 47196, t5: 68310, t6: 99360, t7: 130410, t8: 155250, t9: 186300, t10: 217350 },
  },
];

const SI_MODULES = [
  { id: "incidents", name: "Incident Management", desc: "Track, investigate, and analyze workplace incidents", prices: { t1: 3633, t2: 6812, t3: 11353, t4: 17260, t5: 24970, t6: 36320, t7: 47670, t8: 56750, t9: 68100, t10: 79450 } },
  { id: "audits", name: "Audits", desc: "Schedule and manage safety audits with automated scoring", prices: { t1: 2500, t2: 5000, t3: 8500, t4: 12920, t5: 18700, t6: 27200, t7: 35700, t8: 42500, t9: 51000, t10: 59500 } },
  { id: "observations", name: "Observations", desc: "Behavioral safety observations with trend analysis", prices: { t1: 2500, t2: 5000, t3: 9000, t4: 13680, t5: 19800, t6: 28800, t7: 37800, t8: 45000, t9: 54000, t10: 63000 } },
  { id: "equipment", name: "Equipment Management", desc: "Asset tracking, QR-code inspections, and maintenance scheduling", prices: { t1: 2000, t2: 4000, t3: 7000, t4: 10640, t5: 15400, t6: 22400, t7: 29400, t8: 35000, t9: 42000, t10: 49000 } },
  { id: "sds", name: "SDS Management", desc: "Safety Data Sheet library with GHS compliance", prices: { t1: 2180, t2: 4087, t3: 6812, t4: 10354, t5: 14980, t6: 21792, t7: 28604, t8: 34050, t9: 40860, t10: 47670 } },
  { id: "checklists", name: "Digital Checklists", desc: "Custom digital checklists for field operations", prices: { t1: 2000, t2: 4000, t3: 7000, t4: 10640, t5: 15400, t6: 22400, t7: 29400, t8: 35000, t9: 42000, t10: 49000 } },
  { id: "risk", name: "Risk Management", desc: "Risk register, heat maps, and mitigation tracking", prices: { t1: 2500, t2: 5000, t3: 9000, t4: 13680, t5: 19800, t6: 28800, t7: 37800, t8: 45000, t9: 54000, t10: 63000 } },
  { id: "moc", name: "Management of Change", desc: "Structured change management workflows", prices: { t1: 4000, t2: 8000, t3: 14000, t4: 21280, t5: 30800, t6: 44800, t7: 58800, t8: 70000, t9: 84000, t10: 98000 } },
  { id: "documents", name: "Document Control", desc: "Version-controlled document management", prices: { t1: 2500, t2: 5000, t3: 9000, t4: 13680, t5: 19800, t6: 28800, t7: 37800, t8: 45000, t9: 54000, t10: 63000 } },
  { id: "training", name: "Training Tracker", desc: "Employee training records and certification management", prices: { t1: 2000, t2: 4000, t3: 7000, t4: 10640, t5: 15400, t6: 22400, t7: 29400, t8: 35000, t9: 42000, t10: 49000 } },
  { id: "forms", name: "Forms", desc: "Configurable digital forms for field data collection", prices: { t1: 2000, t2: 4000, t3: 7000, t4: 10640, t5: 15400, t6: 22400, t7: 29400, t8: 35000, t9: 42000, t10: 49000 } },
];

const DRUID_TIERS = [
  { id: "d1", label: "1–50 users", min: 1, max: 50, pricePerUserMonth: 20, pricePerUserAnnual: 240 },
  { id: "d2", label: "51–100 users", min: 51, max: 100, pricePerUserMonth: 18, pricePerUserAnnual: 216 },
  { id: "d3", label: "101–250 users", min: 101, max: 250, pricePerUserMonth: 16, pricePerUserAnnual: 192 },
  { id: "d4", label: "251–1,000 users", min: 251, max: 1000, pricePerUserMonth: 14, pricePerUserAnnual: 168 },
  { id: "d5", label: "1,001–2,000 users", min: 1001, max: 2000, pricePerUserMonth: 12, pricePerUserAnnual: 144 },
  { id: "d6", label: "2,001–3,000 users", min: 2001, max: 3000, pricePerUserMonth: 10, pricePerUserAnnual: 120 },
  { id: "d7", label: "3,001–5,000 users", min: 3001, max: 5000, pricePerUserMonth: 8, pricePerUserAnnual: 96 },
  { id: "d8", label: "4,000+ users", min: 4001, max: 99999, pricePerUserMonth: 6, pricePerUserAnnual: 72 },
];

function getDruidTier(users) {
  return DRUID_TIERS.find(t => users >= t.min && users <= t.max) || DRUID_TIERS[DRUID_TIERS.length - 1];
}
function getDruidAnnual(users) {
  const tier = getDruidTier(users);
  return tier.pricePerUserAnnual * Math.min(users, tier.max);
}

const JESI_ITEMS = [
  { id: "jesi_jm", name: "JESI Journey Management & Analytics", desc: "Journey management with integrated analytics dashboard", prices: { t1: 2500, t2: 5000, t3: 9000, t4: 13680, t5: 19800, t6: 28800, t7: 37800, t8: 45000, t9: 54000, t10: 63000 } },
  { id: "jesi_lw", name: "JESI Lone Worker Suite", desc: "Real-time lone worker monitoring, check-ins, and alerts", prices: { t1: 3000, t2: 6000, t3: 10500, t4: 15960, t5: 23100, t6: 33600, t7: 44100, t8: 52500, t9: 63000, t10: 73500 } },
  { id: "jesi_hs", name: "JESI w/ Health & Safety Companion App", desc: "Full JESI platform with mobile H&S companion for field teams", prices: { t1: 2500, t2: 5000, t3: 9000, t4: 13680, t5: 19800, t6: 28800, t7: 37800, t8: 45000, t9: 54000, t10: 63000 } },
];

const fmt = (n) => n == null ? "Custom" : "$" + n.toLocaleString("en-US");
const fmtM = (n) => n == null ? "Custom" : "$" + Math.round(n / 12).toLocaleString("en-US") + "/mo";
const uid = () => Math.random().toString(36).slice(2, 10);

/* ══════════════════════════════════════════════════════════
   THEME (outside component — stable references)
   ══════════════════════════════════════════════════════════ */
const T = {
  bg: "#060b16", card: "#0d1526", cardBorder: "#1a2540",
  accent: "#2563eb", green: "#0ea578", gold: "#d97706",
  textPrimary: "#e8ecf4", textSecondary: "#8ea4c8", textMuted: "#3a4a68",
};
const cardStyle = { background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 14, padding: 24, marginBottom: 20 };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: "#0a1020", color: T.textPrimary, fontSize: 14, outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, color: T.textSecondary, marginBottom: 4, fontWeight: 500 };
const btnPrimary = { padding: "14px 32px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.green})`, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 20px rgba(37,99,235,0.3)", transition: "transform 0.15s" };
const btnSecondary = { padding: "10px 20px", borderRadius: 8, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.textSecondary, fontWeight: 600, fontSize: 13, cursor: "pointer" };
const sectionTitle = { fontSize: 18, fontWeight: 700, color: T.textPrimary, marginBottom: 16 };
const chipActive = (color) => ({ padding: "8px 16px", borderRadius: 8, border: `2px solid ${color}`, background: color + "18", color, fontWeight: 600, fontSize: 13, cursor: "pointer" });
const chipInactive = { padding: "8px 16px", borderRadius: 8, border: `2px solid ${T.cardBorder}`, background: "transparent", color: T.textSecondary, fontWeight: 500, fontSize: 13, cursor: "pointer" };
const discountInputStyle = { width: 56, padding: "4px 6px", borderRadius: 6, border: `1px solid ${T.cardBorder}`, background: "#0a1020", color: T.textPrimary, fontSize: 12, textAlign: "center" };

const DocIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6, verticalAlign: "middle" }}><path d="M4 1h6l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M10 1v4h4" stroke="currentColor" strokeWidth="1.5"/></svg>;

/* ══════════════════════════════════════════════════════════
   EXTRACTED CHILD COMPONENTS
   Defined OUTSIDE the main component so React keeps stable
   identity across re-renders — fixes the focus-loss bug.
   ══════════════════════════════════════════════════════════ */

function DiscountInput({ value, onChange }) {
  return (
    <input type="number" min="0" max="100" placeholder="%"
      value={value || ""}
      onClick={e => e.stopPropagation()}
      onChange={e => { e.stopPropagation(); onChange(Number(e.target.value) || 0); }}
      style={discountInputStyle} />
  );
}

function ModuleToggle({ mod, checked, price, disc, onToggle, onDiscChange, disabled, accentColor }) {
  const finalPrice = Math.round(price * (1 - disc / 100));
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, border: `1px solid ${disabled ? T.textMuted : checked ? accentColor : T.cardBorder}`, background: disabled ? "#0a0f1a" : checked ? accentColor + "10" : "transparent", opacity: disabled ? 0.4 : 1, cursor: disabled ? "default" : "pointer", marginBottom: 8, transition: "all 0.15s" }}
      onClick={() => !disabled && onToggle()}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? accentColor : T.cardBorder}`, background: checked ? accentColor : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: disabled ? T.textMuted : T.textPrimary }}>{mod.name}</div>
          <div style={{ fontSize: 11, color: T.textSecondary }}>{mod.desc}</div>
        </div>
      </div>
      <div style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 700, color: disabled ? T.textMuted : T.green }} onClick={onToggle}>{fmt(finalPrice)}<span style={{ fontSize: 10, fontWeight: 400 }}>/yr</span></div>
        {!disabled && <DiscountInput value={disc} onChange={onDiscChange} />}
      </div>
    </div>
  );
}

function CustomItemRow({ ci, onUpdate, onRemove, onDiscChange, discValue }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, marginTop: 8 }}>
      <input placeholder="Line item name" value={ci.name}
        onChange={e => onUpdate(ci.uid, "name", e.target.value)}
        style={{ ...inputStyle, flex: 2 }} />
      <input placeholder="Description" value={ci.desc}
        onChange={e => onUpdate(ci.uid, "desc", e.target.value)}
        style={{ ...inputStyle, flex: 2 }} />
      <input type="number" placeholder="Annual $" value={ci.price || ""}
        onChange={e => onUpdate(ci.uid, "price", e.target.value)}
        style={{ ...inputStyle, flex: 1 }} />
      <DiscountInput value={discValue} onChange={onDiscChange} />
      <button onClick={() => onRemove(ci.uid)} style={{ ...btnSecondary, padding: "6px 10px", color: "#ef4444", borderColor: "#ef4444" }}>✕</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function SafetyIQOrderForm() {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);

  const [tier, setTier] = useState("t1");

  // SI mode: "none" | "package" | "addon" | "alacarte"
  const [siMode, setSiMode] = useState("none");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedModules, setSelectedModules] = useState({});
  const [packageModuleOverrides, setPackageModuleOverrides] = useState({});

  const [druidEnabled, setDruidEnabled] = useState(false);
  const [druidUsers, setDruidUsers] = useState(50);

  const [jesiSelections, setJesiSelections] = useState({ jesi_jm: false, jesi_lw: false, jesi_hs: false });

  const [customItems, setCustomItems] = useState({ si: [], druid: [], jesi: [] });

  const [contractTerm, setContractTerm] = useState(36);
  const [existingContractEnd, setExistingContractEnd] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [escalator, setEscalator] = useState(3);

  const [lineDiscounts, setLineDiscounts] = useState({});

  const [customer, setCustomer] = useState({
    company: "", address: "", city: "", state: "", zip: "", country: "US",
    contactName: "", contactTitle: "", contactEmail: "", contactPhone: "",
    billingName: "", billingEmail: "", billingPhone: "",
    employees: "", notes: "",
  });

  const [logoData, setLogoData] = useState(null);

  /* ── Stable callbacks ── */
  const handleDiscountChange = useCallback((id, val) => {
    setLineDiscounts(prev => ({ ...prev, [id]: val }));
  }, []);

  const updateCustomItem = useCallback((product, itemUid, field, value) => {
    setCustomItems(prev => ({
      ...prev,
      [product]: prev[product].map(ci => ci.uid === itemUid ? { ...ci, [field]: field === "price" ? Number(value) || 0 : value } : ci),
    }));
  }, []);

  const removeCustomItem = useCallback((product, itemUid) => {
    setCustomItems(prev => ({ ...prev, [product]: prev[product].filter(ci => ci.uid !== itemUid) }));
  }, []);

  const addCustomItem = useCallback((product) => {
    setCustomItems(prev => ({
      ...prev,
      [product]: [...prev[product], { uid: uid(), name: "", desc: "", price: 0 }],
    }));
  }, []);

  /* ── Pricing calculations ── */
  const pkg = selectedPackage ? PACKAGES.find(p => p.id === selectedPackage) : null;
  const pkgPrice = pkg?.prices[tier] ?? 0;

  const getActivePackageModules = () => {
    if (!pkg) return [];
    const overrides = packageModuleOverrides[selectedPackage] || {};
    const base = [...pkg.defaultModules];
    Object.entries(overrides).forEach(([modId, included]) => {
      if (included && !base.includes(modId)) base.push(modId);
      if (!included) { const idx = base.indexOf(modId); if (idx > -1) base.splice(idx, 1); }
    });
    return base;
  };

  const calcSITotal = () => {
    if (siMode === "none") return 0;
    if (siMode === "package" || siMode === "addon") {
      if (!pkg) return 0;
      let addonTotal = 0;
      Object.entries(selectedModules).forEach(([modId, on]) => {
        if (on && !getActivePackageModules().includes(modId)) {
          const mod = SI_MODULES.find(m => m.id === modId);
          if (mod) { const price = mod.prices[tier] || 0; const disc = lineDiscounts[modId] || 0; addonTotal += price * (1 - disc / 100); }
        }
      });
      const disc = lineDiscounts[selectedPackage] || 0;
      return pkgPrice * (1 - disc / 100) + addonTotal;
    }
    let total = BASE_PLATFORM_FEE[tier] || 0;
    Object.entries(selectedModules).forEach(([modId, on]) => {
      if (on) {
        const mod = SI_MODULES.find(m => m.id === modId);
        if (mod) { const price = mod.prices[tier] || 0; const disc = lineDiscounts[modId] || 0; total += price * (1 - disc / 100); }
      }
    });
    return total;
  };

  const calcDRUIDTotal = () => {
    if (!druidEnabled) return 0;
    const base = getDruidAnnual(druidUsers);
    const disc = lineDiscounts["druid"] || 0;
    return base * (1 - disc / 100);
  };

  const calcJESITotal = () => {
    let total = 0;
    JESI_ITEMS.forEach(item => {
      if (jesiSelections[item.id]) {
        const price = item.prices[tier] || 0;
        const disc = lineDiscounts[item.id] || 0;
        total += price * (1 - disc / 100);
      }
    });
    return total;
  };

  const calcCustomTotal = (product) => {
    return (customItems[product] || []).reduce((sum, ci) => {
      const disc = lineDiscounts[ci.uid] || 0;
      return sum + (ci.price || 0) * (1 - disc / 100);
    }, 0);
  };

  const annualTotal = calcSITotal() + calcDRUIDTotal() + calcJESITotal() +
    calcCustomTotal("si") + calcCustomTotal("druid") + calcCustomTotal("jesi");

  const calcProration = () => {
    if (!existingContractEnd || !newStartDate) return null;
    const end = new Date(existingContractEnd);
    const start = new Date(newStartDate);
    if (isNaN(end) || isNaN(start) || start >= end) return null;
    const diffMs = end - start;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const fraction = diffDays / 365;
    return { days: diffDays, fraction, proratedYear1: Math.round(annualTotal * fraction) };
  };

  const proration = calcProration();

  const buildPaymentSchedule = () => {
    const schedule = [];
    const esc = escalator / 100;
    if (proration) {
      schedule.push({ year: "Year 1 (Prorated)", amount: proration.proratedYear1, note: `${proration.days} days` });
      for (let y = 2; y <= Math.ceil(contractTerm / 12); y++) {
        schedule.push({ year: `Year ${y}`, amount: Math.round(annualTotal * Math.pow(1 + esc, y - 1)), note: "" });
      }
    } else {
      for (let y = 1; y <= Math.ceil(contractTerm / 12); y++) {
        schedule.push({ year: `Year ${y}`, amount: Math.round(annualTotal * Math.pow(1 + esc, y - 1)), note: "" });
      }
    }
    return schedule;
  };

  const totalContractValue = buildPaymentSchedule().reduce((s, r) => s + r.amount, 0);

  const goStep = (s) => { setStep(s); window.scrollTo(0, 0); };

  /* ══════════════════════════════════════════════════════════
     WORD DOCUMENT GENERATION
     ══════════════════════════════════════════════════════════ */
  const generateDocx = async () => {
    setGenerating(true);
    try {
      const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
              Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
              PageNumber, ImageRun } = await import("docx");
      const { saveAs } = await import("file-saver");

      const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
      const borders = { top: border, bottom: border, left: border, right: border };
      const cellM = { top: 60, bottom: 60, left: 100, right: 100 };
      const headerBg = { fill: "0A1628", type: ShadingType.CLEAR };
      const altBg = { fill: "F3F6FB", type: ShadingType.CLEAR };

      const hdrCell = (text, w) => new TableCell({
        borders, width: { size: w, type: WidthType.DXA }, shading: headerBg, margins: cellM,
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })],
      });
      const cell = (text, w, opts = {}) => new TableCell({
        borders, width: { size: w, type: WidthType.DXA }, margins: cellM,
        shading: opts.shade ? altBg : undefined,
        children: [new Paragraph({
          alignment: opts.align || AlignmentType.LEFT,
          children: [new TextRun({ text: String(text), font: "Arial", size: 20, bold: opts.bold, color: opts.color })],
        })],
      });

      // Build line items
      const lineItems = [];

      if ((siMode === "package" || siMode === "addon") && pkg) {
        const disc = lineDiscounts[selectedPackage] || 0;
        lineItems.push({ name: `Safety Indicators — ${pkg.label} Package`, desc: pkg.tagline, annual: Math.round(pkgPrice * (1 - disc / 100)), disc });
        SI_MODULES.forEach(mod => {
          if (selectedModules[mod.id] && !getActivePackageModules().includes(mod.id)) {
            const d = lineDiscounts[mod.id] || 0;
            lineItems.push({ name: `  + ${mod.name}`, desc: mod.desc, annual: Math.round((mod.prices[tier] || 0) * (1 - d / 100)), disc: d });
          }
        });
      } else if (siMode === "alacarte") {
        const hasModules = Object.values(selectedModules).some(Boolean);
        if (hasModules) {
          lineItems.push({ name: "Safety Indicators — Base Platform Fee", desc: "Required for à la carte", annual: BASE_PLATFORM_FEE[tier], disc: 0 });
          SI_MODULES.forEach(mod => {
            if (selectedModules[mod.id]) {
              const d = lineDiscounts[mod.id] || 0;
              lineItems.push({ name: mod.name, desc: mod.desc, annual: Math.round((mod.prices[tier] || 0) * (1 - d / 100)), disc: d });
            }
          });
        }
      }

      customItems.si.forEach(ci => {
        if (ci.name) { const d = lineDiscounts[ci.uid] || 0; lineItems.push({ name: ci.name, desc: ci.desc, annual: Math.round(ci.price * (1 - d / 100)), disc: d }); }
      });

      if (druidEnabled) {
        const dt = getDruidTier(druidUsers);
        const d = lineDiscounts["druid"] || 0;
        lineItems.push({ name: `DRUID — Impairment Detection (${druidUsers} users)`, desc: `$${dt.pricePerUserMonth}/user/month`, annual: Math.round(getDruidAnnual(druidUsers) * (1 - d / 100)), disc: d });
        customItems.druid.forEach(ci => { if (ci.name) { const dd = lineDiscounts[ci.uid] || 0; lineItems.push({ name: ci.name, desc: ci.desc, annual: Math.round(ci.price * (1 - dd / 100)), disc: dd }); } });
      }

      JESI_ITEMS.forEach(item => {
        if (jesiSelections[item.id]) {
          const d = lineDiscounts[item.id] || 0;
          lineItems.push({ name: item.name, desc: item.desc, annual: Math.round((item.prices[tier] || 0) * (1 - d / 100)), disc: d });
        }
      });
      customItems.jesi.forEach(ci => { if (ci.name) { const d = lineDiscounts[ci.uid] || 0; lineItems.push({ name: ci.name, desc: ci.desc, annual: Math.round(ci.price * (1 - d / 100)), disc: d }); } });

      const schedule = buildPaymentSchedule();

      // Header with logo — right-aligned, 387×100 at 96 DPI
      const headerChildren = [];
      if (logoData) {
        try {
          let buf;
          if (typeof logoData === "string" && logoData.startsWith("data:")) {
            const b64 = logoData.split(",")[1];
            const binary = atob(b64);
            buf = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
          }
          if (buf) {
            const mimeMatch = logoData.match(/data:image\/(png|jpg|jpeg|gif|bmp)/i);
            const imgType = mimeMatch ? mimeMatch[1].replace("jpeg", "jpg") : "png";
            headerChildren.push(new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new ImageRun({
                type: imgType,
                data: buf,
                transformation: { width: 387, height: 100 },
                altText: { title: "SafetyIQ Logo", description: "SafetyIQ, Inc. company logo", name: "SIQ_Logo" },
              })],
            }));
          }
        } catch (e) { console.warn("Logo embed failed", e); }
      }
      headerChildren.push(new Paragraph({
        children: [new TextRun({ text: "SERVICE ORDER FORM", bold: true, font: "Arial", size: 28, color: "0A1628" })],
        alignment: AlignmentType.CENTER,
        spacing: { before: logoData ? 120 : 0, after: 60 },
      }));

      const infoRow = (label, value) => new TableRow({
        children: [cell(label, 2800, { bold: true }), cell(value || "—", 6560)],
      });

      const doc = new Document({
        styles: { default: { document: { run: { font: "Arial", size: 20 } } } },
        sections: [{
          properties: {
            page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
          },
          headers: { default: new Header({ children: headerChildren }) },
          footers: {
            default: new Footer({ children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "SafetyIQ, Inc. · Confidential · Page ", font: "Arial", size: 16, color: "888888" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "888888" }),
              ],
            })] }),
          },
          children: [
            new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "CUSTOMER INFORMATION", bold: true, font: "Arial", size: 22, color: "0A1628" })] }),
            new Table({
              width: { size: 9360, type: WidthType.DXA }, columnWidths: [2800, 6560],
              rows: [
                infoRow("Company", customer.company), infoRow("Address", [customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(", ")),
                infoRow("Contact", customer.contactName), infoRow("Title", customer.contactTitle),
                infoRow("Email", customer.contactEmail), infoRow("Phone", customer.contactPhone),
                infoRow("Employees", customer.employees), infoRow("Employee Tier", EMPLOYEE_TIERS.find(t => t.id === tier)?.range || tier),
              ],
            }),
            new Paragraph({ spacing: { before: 300, after: 100 }, children: [new TextRun({ text: "PRODUCTS & PRICING", bold: true, font: "Arial", size: 22, color: "0A1628" })] }),
            ...(lineItems.length > 0 ? [new Table({
              width: { size: 9360, type: WidthType.DXA }, columnWidths: [4000, 3160, 1200, 1000],
              rows: [
                new TableRow({ children: [hdrCell("Product / Module", 4000), hdrCell("Description", 3160), hdrCell("Annual", 1200), hdrCell("Disc %", 1000)] }),
                ...lineItems.map((li, i) => new TableRow({
                  children: [
                    cell(li.name, 4000, { shade: i % 2 === 1, bold: !li.name.startsWith("  ") }),
                    cell(li.desc || "", 3160, { shade: i % 2 === 1 }),
                    cell(fmt(li.annual), 1200, { shade: i % 2 === 1, align: AlignmentType.RIGHT }),
                    cell(li.disc ? `${li.disc}%` : "", 1000, { shade: i % 2 === 1, align: AlignmentType.CENTER }),
                  ],
                })),
                new TableRow({ children: [cell("", 4000), cell("Annual Total", 3160, { bold: true, align: AlignmentType.RIGHT }), cell(fmt(annualTotal), 1200, { bold: true, align: AlignmentType.RIGHT, color: "0A5C36" }), cell("", 1000)] }),
              ],
            })] : [new Paragraph({ children: [new TextRun({ text: "No products selected.", font: "Arial", size: 20, italics: true, color: "888888" })] })]),
            new Paragraph({ spacing: { before: 300, after: 100 }, children: [new TextRun({ text: "CONTRACT TERMS", bold: true, font: "Arial", size: 22, color: "0A1628" })] }),
            new Table({
              width: { size: 9360, type: WidthType.DXA }, columnWidths: [2800, 6560],
              rows: [
                infoRow("Contract Term", `${contractTerm} months`), infoRow("Annual Escalator", `${escalator}%`),
                ...(proration ? [infoRow("Coterminus Start", newStartDate), infoRow("Existing Contract End", existingContractEnd), infoRow("Prorated Days", `${proration.days} days`)] : []),
              ],
            }),
            new Paragraph({ spacing: { before: 300, after: 100 }, children: [new TextRun({ text: "PAYMENT SCHEDULE", bold: true, font: "Arial", size: 22, color: "0A1628" })] }),
            new Table({
              width: { size: 9360, type: WidthType.DXA }, columnWidths: [3000, 3360, 3000],
              rows: [
                new TableRow({ children: [hdrCell("Period", 3000), hdrCell("Amount", 3360), hdrCell("Note", 3000)] }),
                ...schedule.map((row, i) => new TableRow({
                  children: [cell(row.year, 3000, { shade: i % 2 === 1 }), cell(fmt(row.amount), 3360, { shade: i % 2 === 1, align: AlignmentType.RIGHT }), cell(row.note, 3000, { shade: i % 2 === 1 })],
                })),
                new TableRow({ children: [cell("", 3000), cell(fmt(totalContractValue), 3360, { bold: true, align: AlignmentType.RIGHT, color: "0A5C36" }), cell("Total Contract Value", 3000, { bold: true })] }),
              ],
            }),
            new Paragraph({ spacing: { before: 400, after: 100 }, children: [new TextRun({ text: "AUTHORIZATION", bold: true, font: "Arial", size: 22, color: "0A1628" })] }),
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "By signing below, both parties agree to the terms outlined in this Service Order Form.", font: "Arial", size: 20 })] }),
            new Table({
              width: { size: 9360, type: WidthType.DXA }, columnWidths: [4680, 4680],
              rows: [
                new TableRow({ children: [hdrCell("Customer", 4680), hdrCell("SafetyIQ, Inc.", 4680)] }),
                ...[["Signature:", "Signature:"], ["Name:", "Name:"], ["Title:", "Title:"], ["Date:", "Date:"]].map(([l, r]) =>
                  new TableRow({ children: [cell(l + "  ____________________________", 4680), cell(r + "  ____________________________", 4680)] })
                ),
              ],
            }),
            ...(customer.notes ? [
              new Paragraph({ spacing: { before: 300, after: 60 }, children: [new TextRun({ text: "NOTES", bold: true, font: "Arial", size: 22, color: "0A1628" })] }),
              new Paragraph({ children: [new TextRun({ text: customer.notes, font: "Arial", size: 20 })] }),
            ] : []),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = customer.company ? `SafetyIQ_Order_${customer.company.replace(/[^a-zA-Z0-9]/g, "_")}.docx` : "SafetyIQ_Order_Form.docx";
      saveAs(blob, fileName);
    } catch (err) {
      console.error("Doc generation error:", err);
      alert("Error generating document: " + err.message);
    }
    setGenerating(false);
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: T.bg, minHeight: "100vh", color: T.textPrimary }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, background: `linear-gradient(135deg, ${T.accent}, ${T.green})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>SafetyIQ Order Form</h1>
          <p style={{ fontSize: 13, color: T.textSecondary }}>Configure products, pricing & generate a professional order document</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {["Products", "Contract", "Customer", "Review"].map((s, i) => (
            <div key={i} onClick={() => goStep(i + 1)} style={{ padding: "6px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", background: step === i + 1 ? T.accent : "transparent", color: step === i + 1 ? "#fff" : T.textMuted, border: `1px solid ${step === i + 1 ? T.accent : T.cardBorder}`, transition: "all 0.15s" }}>{i + 1}. {s}</div>
          ))}
        </div>

        {/* ── STEP 1: Products ── */}
        {step === 1 && (
          <div>
            <div style={cardStyle}>
              <div style={sectionTitle}>Employee Tier</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EMPLOYEE_TIERS.map(t => (
                  <div key={t.id} onClick={() => setTier(t.id)} style={tier === t.id ? chipActive(T.accent) : chipInactive}>{t.label}</div>
                ))}
              </div>
            </div>

            {/* Safety Indicators */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div style={sectionTitle}>🛡️ Safety Indicators</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { key: "none", label: "None" },
                    { key: "package", label: "Package" },
                    { key: "addon", label: "Package + Add-Ons" },
                    { key: "alacarte", label: "À La Carte" },
                  ].map(mode => (
                    <div key={mode.key} onClick={() => {
                      setSiMode(mode.key);
                      if (mode.key === "none") { setSelectedPackage(null); setSelectedModules({}); }
                      if ((mode.key === "package" || mode.key === "addon") && !selectedPackage) setSelectedPackage("launch");
                    }} style={siMode === mode.key ? chipActive(T.accent) : chipInactive}>{mode.label}</div>
                  ))}
                </div>
              </div>

              {siMode !== "none" && (siMode === "package" || siMode === "addon") && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                  {PACKAGES.map(p => (
                    <div key={p.id} onClick={() => setSelectedPackage(selectedPackage === p.id ? null : p.id)}
                      style={{ padding: 16, borderRadius: 12, border: `2px solid ${selectedPackage === p.id ? p.color : T.cardBorder}`, background: selectedPackage === p.id ? p.color + "12" : "transparent", cursor: "pointer", transition: "all 0.15s", position: "relative" }}>
                      {p.popular && <div style={{ position: "absolute", top: -8, right: 12, background: p.color, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>POPULAR</div>}
                      <div style={{ fontSize: 16, fontWeight: 700, color: p.color }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: T.textSecondary, marginBottom: 8 }}>{p.tagline}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary }}>{fmt(p.prices[tier])}<span style={{ fontSize: 11, fontWeight: 400, color: T.textSecondary }}>/yr</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }} onClick={e => e.stopPropagation()}>
                        <DiscountInput value={lineDiscounts[p.id] || 0} onChange={(val) => handleDiscountChange(p.id, val)} />
                        <span style={{ fontSize: 11, color: T.textSecondary }}>% off</span>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 11, color: T.textSecondary }}>
                        {p.defaultModules.map(mId => SI_MODULES.find(m => m.id === mId)?.name).filter(Boolean).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {siMode === "addon" && (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.textSecondary, marginBottom: 8 }}>Add-On Modules</div>
                  {SI_MODULES.filter(m => !getActivePackageModules().includes(m.id)).map(mod => (
                    <ModuleToggle key={mod.id} mod={mod} checked={selectedModules[mod.id] || false}
                      price={mod.prices[tier] || 0} disc={lineDiscounts[mod.id] || 0} accentColor={T.accent}
                      onToggle={() => setSelectedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                      onDiscChange={(val) => handleDiscountChange(mod.id, val)} />
                  ))}
                </div>
              )}

              {siMode === "alacarte" && (
                <div>
                  <div style={{ fontSize: 13, color: T.gold, marginBottom: 12, padding: "8px 12px", background: T.gold + "12", borderRadius: 8 }}>
                    Base Platform Fee: <strong>{fmt(BASE_PLATFORM_FEE[tier])}</strong>/yr (required)
                  </div>
                  {SI_MODULES.map(mod => (
                    <ModuleToggle key={mod.id} mod={mod} checked={selectedModules[mod.id] || false}
                      price={mod.prices[tier] || 0} disc={lineDiscounts[mod.id] || 0} accentColor={T.accent}
                      onToggle={() => setSelectedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                      onDiscChange={(val) => handleDiscountChange(mod.id, val)} />
                  ))}
                </div>
              )}

              {siMode === "none" && (
                <div style={{ padding: 16, borderRadius: 10, border: `1px dashed ${T.cardBorder}`, textAlign: "center", color: T.textMuted, fontSize: 13 }}>
                  No Safety Indicators products selected. Choose a mode above or add custom line items below.
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <button onClick={() => addCustomItem("si")} style={btnSecondary}>+ Custom SI Line Item</button>
                {customItems.si.map(ci => (
                  <CustomItemRow key={ci.uid} ci={ci}
                    onUpdate={(itemUid, field, val) => updateCustomItem("si", itemUid, field, val)}
                    onRemove={(itemUid) => removeCustomItem("si", itemUid)}
                    discValue={lineDiscounts[ci.uid] || 0}
                    onDiscChange={(val) => handleDiscountChange(ci.uid, val)} />
                ))}
              </div>
            </div>

            {/* DRUID */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={sectionTitle}>🧠 DRUID — Impairment Detection</div>
                <div onClick={() => setDruidEnabled(!druidEnabled)} style={{ width: 44, height: 24, borderRadius: 12, background: druidEnabled ? T.green : T.cardBorder, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: "#fff", position: "absolute", top: 3, left: druidEnabled ? 23 : 3, transition: "left 0.2s" }} />
                </div>
              </div>

              {druidEnabled && (
                <div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <label style={labelStyle}>Number of Users</label>
                    <input type="number" min="1" value={druidUsers} onChange={e => setDruidUsers(Math.max(1, parseInt(e.target.value) || 1))} style={{ ...inputStyle, width: 120 }} />
                    <DiscountInput value={lineDiscounts["druid"] || 0} onChange={(val) => handleDiscountChange("druid", val)} />
                    <span style={{ fontSize: 11, color: T.textSecondary }}>% off</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {DRUID_TIERS.map(dt => {
                      const active = getDruidTier(druidUsers).id === dt.id;
                      return (
                        <div key={dt.id} style={{ padding: 10, borderRadius: 8, border: `1px solid ${active ? T.green : T.cardBorder}`, background: active ? T.green + "12" : "transparent", fontSize: 12 }}>
                          <div style={{ fontWeight: 600, color: active ? T.green : T.textSecondary }}>{dt.label}</div>
                          <div style={{ fontWeight: 700, color: T.textPrimary }}>${dt.pricePerUserMonth}/user/mo</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 15, fontWeight: 700, color: T.green }}>
                    Annual: {fmt(getDruidAnnual(druidUsers))}
                    {lineDiscounts["druid"] > 0 && <span style={{ fontSize: 12, color: T.textSecondary, marginLeft: 8 }}>→ {fmt(calcDRUIDTotal())} after {lineDiscounts["druid"]}% discount</span>}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button onClick={() => addCustomItem("druid")} style={btnSecondary}>+ Custom DRUID Line Item</button>
                    {customItems.druid.map(ci => (
                      <CustomItemRow key={ci.uid} ci={ci}
                        onUpdate={(itemUid, field, val) => updateCustomItem("druid", itemUid, field, val)}
                        onRemove={(itemUid) => removeCustomItem("druid", itemUid)}
                        discValue={lineDiscounts[ci.uid] || 0}
                        onDiscChange={(val) => handleDiscountChange(ci.uid, val)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* JESI */}
            <div style={cardStyle}>
              <div style={sectionTitle}>📍 JESI — Journey & Lone Worker</div>
              {JESI_ITEMS.map(item => {
                const checked = jesiSelections[item.id];
                const price = item.prices[tier] || 0;
                const disc = lineDiscounts[item.id] || 0;
                const finalPrice = Math.round(price * (1 - disc / 100));
                return (
                  <div key={item.id} onClick={() => setJesiSelections(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, border: `1px solid ${checked ? T.green : T.cardBorder}`, background: checked ? T.green + "10" : "transparent", cursor: "pointer", marginBottom: 8, transition: "all 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? T.green : T.cardBorder}`, background: checked ? T.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: T.textSecondary }}>{item.desc}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.green }}>{fmt(finalPrice)}<span style={{ fontSize: 10, fontWeight: 400 }}>/yr</span></div>
                      <DiscountInput value={disc} onChange={(val) => handleDiscountChange(item.id, val)} />
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 12 }}>
                <button onClick={() => addCustomItem("jesi")} style={btnSecondary}>+ Custom JESI Line Item</button>
                {customItems.jesi.map(ci => (
                  <CustomItemRow key={ci.uid} ci={ci}
                    onUpdate={(itemUid, field, val) => updateCustomItem("jesi", itemUid, field, val)}
                    onRemove={(itemUid) => removeCustomItem("jesi", itemUid)}
                    discValue={lineDiscounts[ci.uid] || 0}
                    onDiscChange={(val) => handleDiscountChange(ci.uid, val)} />
                ))}
              </div>
            </div>

            {/* Running total */}
            <div style={{ ...cardStyle, background: "linear-gradient(135deg, #0d1a30, #0d2520)", borderColor: T.green }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: T.textSecondary }}>Estimated Annual Total</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: T.green }}>{fmt(annualTotal)}</div>
                  <div style={{ fontSize: 12, color: T.textSecondary }}>{fmtM(annualTotal)} equivalent</div>
                </div>
                <button onClick={() => goStep(2)} style={btnPrimary}>Next: Contract →</button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Contract ── */}
        {step === 2 && (
          <div>
            <div style={cardStyle}>
              <div style={sectionTitle}>Contract Terms</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Contract Term (months)</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[12, 24, 36, 48, 60].map(m => (
                      <div key={m} onClick={() => setContractTerm(m)} style={contractTerm === m ? chipActive(T.accent) : chipInactive}>{m}mo</div>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Annual Escalator (%)</label>
                  <input type="number" min="0" max="10" value={escalator} onChange={e => setEscalator(Number(e.target.value) || 0)} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={sectionTitle}>Coterminus Proration (Optional)</div>
              <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 12 }}>If this order needs to align with an existing contract end date, enter both dates to auto-calculate proration.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>New Service Start Date</label>
                  <input type="date" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Existing Contract End Date</label>
                  <input type="date" value={existingContractEnd} onChange={e => setExistingContractEnd(e.target.value)} style={inputStyle} />
                </div>
              </div>
              {proration && (
                <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: T.accent + "12", border: `1px solid ${T.accent}` }}>
                  <div style={{ fontSize: 13, color: T.accent, fontWeight: 600 }}>Proration Applied</div>
                  <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 4 }}>
                    {proration.days} days → Year 1 prorated to <strong style={{ color: T.textPrimary }}>{fmt(proration.proratedYear1)}</strong> ({Math.round(proration.fraction * 100)}% of annual)
                  </div>
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <div style={sectionTitle}>Payment Schedule</div>
              <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${T.cardBorder}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#0a1020", padding: "10px 14px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary }}>PERIOD</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textAlign: "right" }}>AMOUNT</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textAlign: "right" }}>NOTE</div>
                </div>
                {buildPaymentSchedule().map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "10px 14px", borderTop: `1px solid ${T.cardBorder}`, background: i % 2 === 0 ? "transparent" : "#0a0f1a" }}>
                    <div style={{ fontSize: 13, color: T.textPrimary, fontWeight: 600 }}>{row.year}</div>
                    <div style={{ fontSize: 13, color: T.green, fontWeight: 700, textAlign: "right" }}>{fmt(row.amount)}</div>
                    <div style={{ fontSize: 12, color: T.textSecondary, textAlign: "right" }}>{row.note}</div>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 14px", borderTop: `2px solid ${T.green}`, background: T.green + "08" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Total Contract Value</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.green, textAlign: "right" }}>{fmt(totalContractValue)}</div>
                  <div />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => goStep(1)} style={btnSecondary}>← Back</button>
              <button onClick={() => goStep(3)} style={btnPrimary}>Next: Customer →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Customer ── */}
        {step === 3 && (
          <div>
            <div style={cardStyle}>
              <div style={sectionTitle}>Company Information</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["company", "Company Name"], ["employees", "# of Employees"], ["address", "Street Address"], ["city", "City"], ["state", "State"], ["zip", "ZIP Code"]].map(([k, l]) => (
                  <div key={k}><label style={labelStyle}>{l}</label><input value={customer[k]} onChange={e => setCustomer(prev => ({ ...prev, [k]: e.target.value }))} style={inputStyle} /></div>
                ))}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={sectionTitle}>Primary Contact</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["contactName", "Name"], ["contactTitle", "Title"], ["contactEmail", "Email"], ["contactPhone", "Phone"]].map(([k, l]) => (
                  <div key={k}><label style={labelStyle}>{l}</label><input value={customer[k]} onChange={e => setCustomer(prev => ({ ...prev, [k]: e.target.value }))} style={inputStyle} /></div>
                ))}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={sectionTitle}>Billing Contact</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[["billingName", "Name"], ["billingEmail", "Email"], ["billingPhone", "Phone"]].map(([k, l]) => (
                  <div key={k}><label style={labelStyle}>{l}</label><input value={customer[k]} onChange={e => setCustomer(prev => ({ ...prev, [k]: e.target.value }))} style={inputStyle} /></div>
                ))}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={sectionTitle}>Notes</div>
              <textarea value={customer.notes} onChange={e => setCustomer(prev => ({ ...prev, notes: e.target.value }))} rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder="Additional notes, special terms, etc." />
            </div>
            <div style={cardStyle}>
              <div style={sectionTitle}>SafetyIQ Logo (for Word Document)</div>
              <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 8 }}>Upload the SafetyIQ logo to include in the generated Word document header (right-aligned, 387×100px at 96 DPI).</p>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => setLogoData(ev.target.result);
                reader.readAsDataURL(file);
              }} style={{ fontSize: 13, color: T.textSecondary }} />
              {logoData && <div style={{ marginTop: 8, fontSize: 12, color: T.green }}>✓ Logo loaded</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => goStep(2)} style={btnSecondary}>← Back</button>
              <button onClick={() => goStep(4)} style={btnPrimary}>Next: Review →</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Review ── */}
        {step === 4 && (
          <div>
            <div style={cardStyle}>
              <div style={sectionTitle}>Order Summary</div>
              <div style={{ padding: 14, borderRadius: 10, background: "#0a1020", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>{customer.company || "Company Name"}</div>
                <div style={{ fontSize: 12, color: T.textSecondary }}>{customer.contactName} · {customer.contactEmail}</div>
                <div style={{ fontSize: 12, color: T.textSecondary }}>{EMPLOYEE_TIERS.find(t => t.id === tier)?.range} · {contractTerm}-month term</div>
              </div>

              <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${T.cardBorder}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", background: "#0a1020", padding: "10px 14px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary }}>ITEM</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textAlign: "right" }}>ANNUAL</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textAlign: "right" }}>MONTHLY</div>
                </div>

                {(siMode === "package" || siMode === "addon") && pkg && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", padding: "10px 14px", borderTop: `1px solid ${T.cardBorder}` }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>Safety Indicators — {pkg.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.green, textAlign: "right" }}>{fmt(Math.round(pkgPrice * (1 - (lineDiscounts[selectedPackage] || 0) / 100)))}</div>
                      <div style={{ fontSize: 12, color: T.textSecondary, textAlign: "right" }}>{fmtM(Math.round(pkgPrice * (1 - (lineDiscounts[selectedPackage] || 0) / 100)))}</div>
                    </div>
                    {SI_MODULES.filter(m => selectedModules[m.id] && !getActivePackageModules().includes(m.id)).map(m => {
                      const f = Math.round((m.prices[tier] || 0) * (1 - (lineDiscounts[m.id] || 0) / 100));
                      return (
                        <div key={m.id} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", padding: "8px 14px 8px 28px", borderTop: `1px solid ${T.cardBorder}`, background: "#0a0f1a" }}>
                          <div style={{ fontSize: 12, color: T.textSecondary }}>+ {m.name}</div>
                          <div style={{ fontSize: 12, color: T.textPrimary, textAlign: "right" }}>{fmt(f)}</div>
                          <div style={{ fontSize: 12, color: T.textSecondary, textAlign: "right" }}>{fmtM(f)}</div>
                        </div>
                      );
                    })}
                  </>
                )}
                {siMode === "alacarte" && Object.values(selectedModules).some(Boolean) && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", padding: "10px 14px", borderTop: `1px solid ${T.cardBorder}` }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>SI Base Platform Fee</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.green, textAlign: "right" }}>{fmt(BASE_PLATFORM_FEE[tier])}</div>
                      <div style={{ fontSize: 12, color: T.textSecondary, textAlign: "right" }}>{fmtM(BASE_PLATFORM_FEE[tier])}</div>
                    </div>
                    {SI_MODULES.filter(m => selectedModules[m.id]).map(m => {
                      const f = Math.round((m.prices[tier] || 0) * (1 - (lineDiscounts[m.id] || 0) / 100));
                      return (
                        <div key={m.id} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", padding: "8px 14px", borderTop: `1px solid ${T.cardBorder}` }}>
                          <div style={{ fontSize: 12, color: T.textPrimary }}>{m.name}</div>
                          <div style={{ fontSize: 12, color: T.textPrimary, textAlign: "right" }}>{fmt(f)}</div>
                          <div style={{ fontSize: 12, color: T.textSecondary, textAlign: "right" }}>{fmtM(f)}</div>
                        </div>
                      );
                    })}
                  </>
                )}

                {customItems.si.filter(ci => ci.name).map(ci => {
                  const f = Math.round(ci.price * (1 - (lineDiscounts[ci.uid] || 0) / 100));
                  return (
                    <div key={ci.uid} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", padding: "8px 14px", borderTop: `1px solid ${T.cardBorder}`, background: "#0a0f1a" }}>
                      <div style={{ fontSize: 12, color: T.textSecondary }}>{ci.name}</div>
                      <div style={{ fontSize: 12, color: T.textPrimary, textAlign: "right" }}>{fmt(f)}</div>
                      <div style={{ fontSize: 12, color: T.textSecondary, textAlign: "right" }}>{fmtM(f)}</div>
                    </div>
                  );
                })}

                {druidEnabled && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", padding: "10px 14px", borderTop: `2px solid ${T.cardBorder}` }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>DRUID ({druidUsers} users @ ${getDruidTier(druidUsers).pricePerUserMonth}/user/mo)</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.green, textAlign: "right" }}>{fmt(calcDRUIDTotal())}</div>
                      <div style={{ fontSize: 12, color: T.textSecondary, textAlign: "right" }}>{fmtM(calcDRUIDTotal())}</div>
                    </div>
                    {customItems.druid.filter(ci => ci.name).map(ci => {
                      const f = Math.round(ci.price * (1 - (lineDiscounts[ci.uid] || 0) / 100));
                      return (
                        <div key={ci.uid} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", padding: "8px 14px", borderTop: `1px solid ${T.cardBorder}`, background: "#0a0f1a" }}>
                          <div style={{ fontSize: 12, color: T.textSecondary }}>{ci.name}</div>
                          <div style={{ fontSize: 12, color: T.textPrimary, textAlign: "right" }}>{fmt(f)}</div>
                          <div style={{ fontSize: 12, color: T.textSecondary, textAlign: "right" }}>{fmtM(f)}</div>
                        </div>
                      );
                    })}
                  </>
                )}

                {JESI_ITEMS.filter(item => jesiSelections[item.id]).map(item => {
                  const f = Math.round((item.prices[tier] || 0) * (1 - (lineDiscounts[item.id] || 0) / 100));
                  return (
                    <div key={item.id} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", padding: "10px 14px", borderTop: `1px solid ${T.cardBorder}` }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{item.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.green, textAlign: "right" }}>{fmt(f)}</div>
                      <div style={{ fontSize: 12, color: T.textSecondary, textAlign: "right" }}>{fmtM(f)}</div>
                    </div>
                  );
                })}
                {customItems.jesi.filter(ci => ci.name).map(ci => {
                  const f = Math.round(ci.price * (1 - (lineDiscounts[ci.uid] || 0) / 100));
                  return (
                    <div key={ci.uid} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", padding: "8px 14px", borderTop: `1px solid ${T.cardBorder}`, background: "#0a0f1a" }}>
                      <div style={{ fontSize: 12, color: T.textSecondary }}>{ci.name}</div>
                      <div style={{ fontSize: 12, color: T.textPrimary, textAlign: "right" }}>{fmt(f)}</div>
                      <div style={{ fontSize: 12, color: T.textSecondary, textAlign: "right" }}>{fmtM(f)}</div>
                    </div>
                  );
                })}

                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", padding: "14px", borderTop: `2px solid ${T.green}`, background: T.green + "08" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>Annual Total</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: T.green, textAlign: "right" }}>{fmt(annualTotal)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, textAlign: "right" }}>{fmtM(annualTotal)}</div>
                </div>
              </div>

              <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: "#0a1020" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, marginBottom: 8 }}>Payment Schedule ({contractTerm}mo term, {escalator}% escalator)</div>
                {buildPaymentSchedule().map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
                    <span style={{ color: T.textPrimary }}>{row.year}</span>
                    <span style={{ color: T.green, fontWeight: 600 }}>{fmt(row.amount)} {row.note && <span style={{ color: T.textSecondary, fontSize: 11 }}>({row.note})</span>}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, marginTop: 8, borderTop: `1px solid ${T.cardBorder}`, fontSize: 14, fontWeight: 700 }}>
                  <span style={{ color: T.textPrimary }}>Total Contract Value</span>
                  <span style={{ color: T.green }}>{fmt(totalContractValue)}</span>
                </div>
              </div>

              {customer.notes && (
                <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: "#0a1020" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, marginBottom: 4 }}>Notes</div>
                  <div style={{ fontSize: 13, color: T.textPrimary }}>{customer.notes}</div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button onClick={() => goStep(3)} style={btnSecondary}>← Back</button>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={generateDocx} disabled={generating} style={{ ...btnSecondary, borderColor: T.accent, color: T.accent, opacity: generating ? 0.6 : 1 }}><DocIcon /> {generating ? "Generating..." : "Generate Word Doc"}</button>
                  <button onClick={() => goStep(5)} style={btnPrimary}>Submit Order</button>
                </div>
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: T.textMuted, marginTop: 16 }}>By submitting, you authorize SafetyIQ, Inc. to prepare a formal agreement. Final pricing subject to executed contract.</p>
          </div>
        )}

        {/* ── STEP 5: Confirmation ── */}
        {step === 5 && (
          <div style={{ ...cardStyle, textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>Order Submitted</div>
            <div style={{ fontSize: 14, color: T.textSecondary, marginBottom: 24 }}>
              {customer.company ? `Order for ${customer.company} has been recorded.` : "Order has been recorded."} A member of the SafetyIQ team will be in touch.
            </div>
            <div style={{ fontSize: 13, color: T.textSecondary }}>Contact: ryan.pollard@safetyiq.com</div>
            <button onClick={() => goStep(1)} style={{ ...btnSecondary, marginTop: 24 }}>Start New Order</button>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 44, paddingTop: 20, borderTop: "1px solid #141e35" }}>
          <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>© {new Date().getFullYear()} SafetyIQ, Inc. · Confidential</p>
        </div>
      </div>
    </div>
  );
}