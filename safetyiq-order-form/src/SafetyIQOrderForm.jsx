import { useState, useRef } from "react";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel, PageNumber } from "docx";
import { saveAs } from "file-saver";

/* ─── Pricing Data ─── */
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
  { id: "incidents", name: "Incident Management", desc: "Track, investigate, and analyze workplace incidents with SIF/Rule of 5", prices: { t1: 3633, t2: 6812, t3: 11353, t4: 17260, t5: 24970, t6: 36320, t7: 47670, t8: 56750, t9: 68100, t10: 79450 } },
  { id: "audits", name: "Audits", desc: "Schedule and manage safety audits with automated scoring", prices: { t1: 2500, t2: 5000, t3: 8500, t4: 12920, t5: 18700, t6: 27200, t7: 35700, t8: 42500, t9: 51000, t10: 59500 } },
  { id: "observations", name: "Observations", desc: "Behavioral safety observations with trend analysis", prices: { t1: 2500, t2: 5000, t3: 9000, t4: 13680, t5: 19800, t6: 28800, t7: 37800, t8: 45000, t9: 54000, t10: 63000 } },
  { id: "equipment", name: "Equipment Management", desc: "Asset tracking, QR-code inspections, and maintenance scheduling", prices: { t1: 2000, t2: 4000, t3: 7000, t4: 10640, t5: 15400, t6: 22400, t7: 29400, t8: 35000, t9: 42000, t10: 49000 } },
  { id: "sds", name: "SDS Management", desc: "Safety Data Sheet library with GHS compliance and search", prices: { t1: 2180, t2: 4087, t3: 6812, t4: 10354, t5: 14986, t6: 21798, t7: 28622, t8: 34073, t9: 40888, t10: 47702 } },
  { id: "checklists", name: "Digital Checklists", desc: "Configurable mobile checklists for any workflow", prices: { t1: 2000, t2: 4000, t3: 7000, t4: 10640, t5: 15400, t6: 22400, t7: 29400, t8: 35000, t9: 42000, t10: 49000 } },
  { id: "risk", name: "Risk Management", desc: "JSA/JHA templates, risk scoring matrices, and mitigation tracking", prices: { t1: 2500, t2: 5000, t3: 9000, t4: 13680, t5: 19800, t6: 28800, t7: 37800, t8: 45000, t9: 54000, t10: 63000 } },
  { id: "moc", name: "Management of Change", desc: "Structured change management with impact assessment and approvals", prices: { t1: 4000, t2: 8000, t3: 14000, t4: 21280, t5: 30800, t6: 44800, t7: 58800, t8: 70000, t9: 84000, t10: 98000 } },
  { id: "documents", name: "Document Control", desc: "Version-controlled document management with approval workflows", prices: { t1: 2500, t2: 5000, t3: 9000, t4: 13680, t5: 19800, t6: 28800, t7: 37800, t8: 45000, t9: 54000, t10: 63000 } },
  { id: "training", name: "Training Tracker", desc: "Certifications, compliance training, and renewal management", prices: { t1: 2000, t2: 4000, t3: 7000, t4: 10640, t5: 15400, t6: 22400, t7: 29400, t8: 35000, t9: 42000, t10: 49000 } },
  { id: "forms", name: "Forms", desc: "Custom form builder for any data capture workflow", prices: { t1: 2000, t2: 4000, t3: 7000, t4: 10640, t5: 15400, t6: 22400, t7: 29400, t8: 35000, t9: 42000, t10: 49000 } },
];

const DRUID_MODULES = [
  { id: "druid_standard", name: "DRUID Standard", desc: "Core impairment screening for up to 250 employees", prices: { t1: 5000, t2: 5000, t3: 5000, t4: 7500, t5: 10000, t6: 15000, t7: 20000, t8: 25000, t9: 30000, t10: 35000 } },
  { id: "druid_enterprise", name: "DRUID Enterprise", desc: "Unlimited employees with advanced analytics & API access", prices: { t1: 12000, t2: 12000, t3: 12000, t4: 18000, t5: 25000, t6: 35000, t7: 45000, t8: 55000, t9: 65000, t10: 75000 } },
  { id: "druid_analytics", name: "DRUID Analytics Add-On", desc: "Trend dashboards, shift-level insights, and predictive alerts", prices: { t1: 3000, t2: 3000, t3: 3000, t4: 4500, t5: 6000, t6: 9000, t7: 12000, t8: 15000, t9: 18000, t10: 21000 } },
];

const JESI_MODULES = [
  { id: "journey_mgmt", name: "Journey Management", desc: "Route planning, check-ins, and escalation workflows", prices: { t1: 4000, t2: 4000, t3: 4000, t4: 6000, t5: 8500, t6: 12000, t7: 16000, t8: 20000, t9: 24000, t10: 28000 } },
  { id: "lone_worker", name: "Lone Worker Monitoring", desc: "Real-time GPS, man-down alerts, and duress capabilities", prices: { t1: 3500, t2: 3500, t3: 3500, t4: 5250, t5: 7500, t6: 10500, t7: 14000, t8: 17500, t9: 21000, t10: 24500 } },
  { id: "jesi_analytics", name: "JESI Analytics", desc: "Journey compliance dashboards and reporting", prices: { t1: 2000, t2: 2000, t3: 2000, t4: 3000, t5: 4000, t6: 6000, t7: 8000, t8: 10000, t9: 12000, t10: 14000 } },
];

const PRODUCTS = [
  { key: "safetyIndicators", name: "Safety Indicators", tagline: "Modular EHS Platform", icon: "🛡️", modules: SI_MODULES, hasPackages: true },
  { key: "druid", name: "DRUID", tagline: "Fitness-for-Duty Assessment", icon: "🧠", modules: DRUID_MODULES, hasPackages: false },
  { key: "jesi", name: "JESI", tagline: "Journey & Lone Worker Safety", icon: "📍", modules: JESI_MODULES, hasPackages: false },
];

const TERMS = [
  { id: 36, label: "36 Months" },
  { id: 60, label: "60 Months" },
];

const CORE_INCLUDES = "Includes OSHA 300/300A Reporting and Corrective Actions as standard.";

function fmt(n) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); }
function fmtWhole(n) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n); }
function daysBetween(a, b) { const d1 = new Date(a + "T00:00:00"), d2 = new Date(b + "T00:00:00"); return Math.round((d2 - d1) / 86400000); }
function dateStr(d) { return d.toISOString().split("T")[0]; }

/* ─── Icons ─── */
function CheckIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function ChevronDown({ open }) { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function PlusIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function TrashIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M11 4v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function DocIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10 2H5a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7l-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 2v5h5M7 10h4M7 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function InfoIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7 6.5V10M7 4.5V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }

/* ─── Styles ─── */
const cardStyle = { background: "rgba(15,25,45,0.6)", border: "1px solid #1a2540", borderRadius: 14, padding: 24, marginBottom: 16 };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 8, border: "1px solid #263352", background: "rgba(10,15,30,0.6)", color: "#dce6f5", fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" };
const labelStyle = { display: "block", fontSize: 12, color: "#6b7fa3", marginBottom: 6, fontWeight: 600 };
const btnPrimary = { padding: "14px 36px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #2563eb, #0ea578)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 20px rgba(37,99,235,0.3)" };
const btnBack = { padding: "14px 28px", borderRadius: 10, border: "1px solid #263352", background: "transparent", color: "#8ea4c8", fontWeight: 600, fontSize: 14, cursor: "pointer" };

/* ─── DOCX Builder ─── */
function buildOrderDocx({ customer, term, termMonths, pricingMode, selectedPackage, empTier, packagePrice, packageModuleNames, addonItems, alacarteItems, basePlatformFee, customLineItems, annualTotal, monthlyTotal, totalContractValue, prorationCalc, existingARR, newServiceStart, annualRenewalDate, existingContractEnd, annualEscalator }) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const border = { style: BorderStyle.SINGLE, size: 1, color: "B0B0B0" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };
  const headerShading = { fill: "1a2540", type: ShadingType.CLEAR };
  const altShading = { fill: "F5F7FA", type: ShadingType.CLEAR };
  const tableWidth = 9360;

  const allItems = [];
  if (pricingMode === "package" || pricingMode === "package_addon") {
    allItems.push({ name: `${selectedPackage} Package`, desc: `Includes: ${packageModuleNames.join(", ")}`, listPrice: packagePrice, discount: 0, netPrice: packagePrice });
  }
  if (pricingMode === "package_addon") { addonItems.forEach(a => allItems.push(a)); }
  if (pricingMode === "alacarte") {
    allItems.push({ name: "Base Platform Fee", desc: "Required for à la carte module access", listPrice: basePlatformFee, discount: 0, netPrice: basePlatformFee });
    alacarteItems.forEach(a => allItems.push(a));
  }
  customLineItems.forEach(c => allItems.push(c));

  const colWidths = [3200, 2400, 1000, 1000, 1760];
  const headerRow = new TableRow({
    children: ["Item", "Description", "List Price", "Disc %", "Net Annual"].map((text, i) => (
      new TableCell({ borders, width: { size: colWidths[i], type: WidthType.DXA }, shading: headerShading, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })] })
    )),
  });

  const itemRows = allItems.map((item, idx) => {
    const shading = idx % 2 === 1 ? altShading : undefined;
    return new TableRow({
      children: [
        new TableCell({ borders, width: { size: colWidths[0], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: item.name, font: "Arial", size: 20, bold: true })] })] }),
        new TableCell({ borders, width: { size: colWidths[1], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: item.desc || "", font: "Arial", size: 18, color: "555555" })] })] }),
        new TableCell({ borders, width: { size: colWidths[2], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmt(item.listPrice), font: "Arial", size: 20 })] })] }),
        new TableCell({ borders, width: { size: colWidths[3], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.discount > 0 ? `${item.discount}%` : "\u2014", font: "Arial", size: 20, color: item.discount > 0 ? "E53E3E" : "999999" })] })] }),
        new TableCell({ borders, width: { size: colWidths[4], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmt(item.netPrice), font: "Arial", size: 20, bold: true })] })] }),
      ],
    });
  });

  const totalRow = new TableRow({
    children: [
      new TableCell({ borders, width: { size: colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], type: WidthType.DXA }, columnSpan: 4, shading: { fill: "E8F5E9", type: ShadingType.CLEAR }, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Annual Total", font: "Arial", size: 22, bold: true })] })] }),
      new TableCell({ borders, width: { size: colWidths[4], type: WidthType.DXA }, shading: { fill: "E8F5E9", type: ShadingType.CLEAR }, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmt(annualTotal), font: "Arial", size: 22, bold: true, color: "0D8050" })] })] }),
    ],
  });

  const lineItemsTable = new Table({ width: { size: tableWidth, type: WidthType.DXA }, columnWidths: colWidths, rows: [headerRow, ...itemRows, totalRow] });

  let prorationSection = [];
  if (prorationCalc) {
    const hasExisting = existingARR > 0;
    const proCols = hasExisting ? [2400, 800, 2200, 2200, 1760] : [3200, 1000, 2800, 2360];
    const proHeaders = hasExisting ? ["Period", "Days", "SafetyIQ Fee", "Existing Contract", "Total Due"] : ["Period", "Days", "SafetyIQ Fee", "Total Due"];
    const proHeaderRow = new TableRow({ children: proHeaders.map((text, i) => new TableCell({ borders, width: { size: proCols[i], type: WidthType.DXA }, shading: { fill: "78550A", type: ShadingType.CLEAR }, margins: cellMargins, children: [new Paragraph({ alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT, children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })] })) });
    const proRows = prorationCalc.schedule.map((yr, idx) => {
      const shading = idx % 2 === 1 ? { fill: "FFF8E1", type: ShadingType.CLEAR } : undefined;
      const cells = [
        new TableCell({ borders, width: { size: proCols[0], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: yr.label, font: "Arial", size: 20, bold: true })] }), new Paragraph({ children: [new TextRun({ text: `${yr.periodStart} \u2192 ${yr.periodEnd}`, font: "Arial", size: 16, color: "888888" })] })] }),
        new TableCell({ borders, width: { size: proCols[1], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: String(yr.days), font: "Arial", size: 20 })] })] }),
        new TableCell({ borders, width: { size: proCols[2], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmt(yr.safetyIQFee), font: "Arial", size: 20 })] })] }),
      ];
      if (hasExisting) cells.push(new TableCell({ borders, width: { size: proCols[3], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: yr.existingFee > 0 ? fmt(yr.existingFee) : "\u2014", font: "Arial", size: 20 })] })] }));
      cells.push(new TableCell({ borders, width: { size: proCols[hasExisting ? 4 : 3], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmt(yr.total), font: "Arial", size: 20, bold: true })] })] }));
      return new TableRow({ children: cells });
    });
    const proTotalColSpan = hasExisting ? 4 : 3;
    const proTotalRow = new TableRow({ children: [
      new TableCell({ borders, width: { size: proCols.slice(0, proTotalColSpan).reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnSpan: proTotalColSpan, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Total Contract Value", font: "Arial", size: 22, bold: true, color: "78550A" })] })] }),
      new TableCell({ borders, width: { size: proCols[hasExisting ? 4 : 3], type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmt(prorationCalc.totalAllYears), font: "Arial", size: 22, bold: true, color: "78550A" })] })] }),
    ] });
    prorationSection = [
      new Paragraph({ spacing: { before: 400 }, children: [] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Coterminus Payment Schedule", font: "Arial" })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `New service start: ${newServiceStart} | Next annual renewal: ${annualRenewalDate} | Contract end: ${existingContractEnd} | Escalator: ${annualEscalator}%`, font: "Arial", size: 20, color: "666666" })] }),
      new Table({ width: { size: tableWidth, type: WidthType.DXA }, columnWidths: proCols, rows: [proHeaderRow, ...proRows, proTotalRow] }),
    ];
  }

  const sigLine = new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: "________________________________________", font: "Arial", size: 20, color: "999999" })] });
  const tierLabel = EMPLOYEE_TIERS.find(t => t.id === empTier)?.label || "";

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: "1a2540" }, paragraph: { spacing: { before: 300, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: "1a2540" }, paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      ],
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 100 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2563EB", space: 1 } }, children: [new TextRun({ text: "SafetyIQ, Inc.", font: "Arial", size: 24, bold: true, color: "1a2540" }), new TextRun({ text: "  \u2014  SaaS Software Order Form", font: "Arial", size: 20, color: "666666" })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } }, spacing: { before: 100 }, children: [new TextRun({ text: "Confidential \u2014 SafetyIQ, Inc.  |  Page ", font: "Arial", size: 18, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" })] })] }) },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "SaaS Software Order Form", font: "Arial", size: 36, bold: true, color: "1a2540" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: `Date: ${today}`, font: "Arial", size: 22, color: "666666" })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Customer Information", font: "Arial" })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Company: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: customer.company || "\u2014", font: "Arial", size: 22 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Contact: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: customer.contact || "\u2014", font: "Arial", size: 22 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Email: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: customer.email || "\u2014", font: "Arial", size: 22 })] }),
        ...(customer.phone ? [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Phone: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: customer.phone, font: "Arial", size: 22 })] })] : []),
        ...((customer.city || customer.state) ? [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Address: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: [customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(", "), font: "Arial", size: 22 })] })] : []),
        ...(customer.employees ? [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Employees: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: customer.employees, font: "Arial", size: 22 })] })] : []),
        new Paragraph({ spacing: { before: 300 }, children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Plan Configuration", font: "Arial" })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Employee Tier: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: tierLabel, font: "Arial", size: 22 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Contract Term: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: TERMS.find(t => t.id === term)?.label || "", font: "Arial", size: 22 })] }),
        ...(pricingMode !== "alacarte" ? [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Package: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: selectedPackage, font: "Arial", size: 22 })] })] : []),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: CORE_INCLUDES, font: "Arial", size: 20, italics: true, color: "666666" })] }),
        new Paragraph({ spacing: { before: 300 }, children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Line Items", font: "Arial" })] }),
        lineItemsTable,
        new Paragraph({ spacing: { before: 400 }, children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Pricing Summary", font: "Arial" })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Annual Recurring Revenue (ARR): ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: fmt(annualTotal), font: "Arial", size: 22, bold: true, color: "0D8050" })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Monthly: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: fmt(monthlyTotal), font: "Arial", size: 22 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `Total Contract Value (${termMonths / 12}yr): `, bold: true, font: "Arial", size: 22 }), new TextRun({ text: fmt(totalContractValue), font: "Arial", size: 22 })] }),
        ...(prorationCalc ? [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `Year 1 Prorated (${prorationCalc.daysToRenewal} days): `, bold: true, font: "Arial", size: 22, color: "78550A" }), new TextRun({ text: fmt(prorationCalc.year1Prorated), font: "Arial", size: 22, bold: true, color: "78550A" })] })] : []),
        ...prorationSection,
        ...(customer.notes ? [new Paragraph({ spacing: { before: 400 }, children: [] }), new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Notes", font: "Arial" })] }), new Paragraph({ children: [new TextRun({ text: customer.notes, font: "Arial", size: 22, color: "444444" })] })] : []),
        new Paragraph({ spacing: { before: 600 }, children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Authorization & Signatures", font: "Arial" })] }),
        new Paragraph({ spacing: { before: 100, after: 40 }, children: [new TextRun({ text: "By signing below, the parties agree to the terms outlined in this order form. Final pricing and terms are subject to the execution of a formal SaaS agreement.", font: "Arial", size: 20, italics: true, color: "666666" })] }),
        new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "SafetyIQ, Inc.", font: "Arial", size: 22, bold: true })] }),
        sigLine,
        new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "Gary Warzynski, Authorized Signatory", font: "Arial", size: 20, color: "444444" })] }),
        new Paragraph({ children: [new TextRun({ text: "Date: ________________________", font: "Arial", size: 20, color: "999999" })] }),
        new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: customer.company || "Customer", font: "Arial", size: 22, bold: true })] }),
        sigLine,
        new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: `${customer.contact || "Authorized Representative"}, ${customer.company || "Customer"}`, font: "Arial", size: 20, color: "444444" })] }),
        new Paragraph({ children: [new TextRun({ text: "Date: ________________________", font: "Arial", size: 20, color: "999999" })] }),
      ],
    }],
  });
  return doc;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function SafetyIQOrderForm() {
  const [step, setStep] = useState(0);
  const [pricingMode, setPricingMode] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [empTier, setEmpTier] = useState("t3");
  const [packageModuleOverrides, setPackageModuleOverrides] = useState({});
  const [addonModules, setAddonModules] = useState({});
  const [alacarteModules, setAlacarteModules] = useState({});
  const [customItems, setCustomItems] = useState([]);
  const [term, setTerm] = useState(36);
  const [customer, setCustomer] = useState({ company: "", contact: "", email: "", phone: "", employees: "", address: "", city: "", state: "", zip: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [animIn, setAnimIn] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prorationEnabled, setProrationEnabled] = useState(false);
  const [newServiceStart, setNewServiceStart] = useState(() => new Date().toISOString().split("T")[0]);
  const [annualRenewalDate, setAnnualRenewalDate] = useState("");
  const [existingContractEnd, setExistingContractEnd] = useState("");
  const [existingARR, setExistingARR] = useState(0);
  const [annualEscalator, setAnnualEscalator] = useState(3);
  const topRef = useRef(null);

  const getModulePrice = (mod, tier) => mod.prices[tier] || 0;
  const pkg = selectedPackage ? PACKAGES.find(p => p.id === selectedPackage) : null;
  const pkgModules = pkg ? (packageModuleOverrides[pkg.id] || pkg.defaultModules) : [];
  const allModules = [...SI_MODULES, ...DRUID_MODULES, ...JESI_MODULES];
  const findModule = (id) => allModules.find(m => m.id === id);
  const packagePrice = pkg ? (pkg.prices[empTier] || 0) : 0;

  const addonItems = Object.keys(addonModules).map(id => {
    const mod = findModule(id);
    if (!mod) return null;
    const listPrice = getModulePrice(mod, empTier);
    const disc = addonModules[id]?.discount || 0;
    return { id, name: mod.name, desc: mod.desc, listPrice, discount: disc, netPrice: listPrice * (1 - disc / 100) };
  }).filter(Boolean);
  const addonSubtotal = addonItems.reduce((s, a) => s + a.netPrice, 0);

  const basePlatformFee = BASE_PLATFORM_FEE[empTier] || 0;
  const alacarteItems = Object.keys(alacarteModules).map(id => {
    const mod = findModule(id);
    if (!mod) return null;
    const listPrice = getModulePrice(mod, empTier);
    const disc = alacarteModules[id]?.discount || 0;
    return { id, name: mod.name, desc: mod.desc, listPrice, discount: disc, netPrice: listPrice * (1 - disc / 100) };
  }).filter(Boolean);
  const alacarteSubtotal = alacarteItems.reduce((s, a) => s + a.netPrice, 0);

  const validCustomItems = customItems.filter(c => c.name && c.price > 0).map(c => ({ ...c, listPrice: c.price, netPrice: c.price * (1 - (c.discount || 0) / 100) }));
  const customSubtotal = validCustomItems.reduce((s, c) => s + c.netPrice, 0);

  let annualTotal = 0;
  if (pricingMode === "package") annualTotal = packagePrice + customSubtotal;
  else if (pricingMode === "package_addon") annualTotal = packagePrice + addonSubtotal + customSubtotal;
  else annualTotal = basePlatformFee + alacarteSubtotal + customSubtotal;

  const monthlyTotal = annualTotal / 12;
  const termMonths = term;
  const totalContractValue = annualTotal * (termMonths / 12);

  let prorationCalc = null;
  if (prorationEnabled && newServiceStart && annualRenewalDate) {
    const daysToRenewal = daysBetween(newServiceStart, annualRenewalDate);
    const proFactor = daysToRenewal > 0 ? Math.min(1, daysToRenewal / 365) : 1;
    const year1Prorated = annualTotal * proFactor;
    const schedule = [];
    const contractEndD = existingContractEnd ? new Date(existingContractEnd + "T00:00:00") : null;
    schedule.push({ year: 1, label: "Year 1 (Prorated)", periodStart: newServiceStart, periodEnd: annualRenewalDate, days: Math.max(0, daysToRenewal), safetyIQFee: year1Prorated, existingFee: 0, total: year1Prorated, isProrated: true });
    if (contractEndD) {
      let yearNum = 2;
      let currentRenewal = new Date(annualRenewalDate + "T00:00:00");
      const maxYears = Math.ceil(termMonths / 12) + 1;
      while (yearNum <= maxYears) {
        const periodStart = new Date(currentRenewal);
        const nextRenewal = new Date(currentRenewal.getFullYear() + 1, currentRenewal.getMonth(), currentRenewal.getDate());
        if (periodStart >= contractEndD) break;
        const periodEnd = nextRenewal > contractEndD ? contractEndD : nextRenewal;
        const periodDays = daysBetween(dateStr(periodStart), dateStr(periodEnd));
        const isPartial = periodDays < 365;
        const periodFactor = isPartial ? periodDays / 365 : 1;
        const escalatedExisting = existingARR * Math.pow(1 + annualEscalator / 100, yearNum - 1);
        const existingFee = escalatedExisting * periodFactor;
        const siqFee = annualTotal * periodFactor;
        schedule.push({ year: yearNum, label: isPartial ? `Year ${yearNum} (Partial)` : `Year ${yearNum}`, periodStart: dateStr(periodStart), periodEnd: dateStr(periodEnd), days: periodDays, safetyIQFee: siqFee, existingFee: existingARR > 0 ? existingFee : 0, total: siqFee + (existingARR > 0 ? existingFee : 0), isProrated: isPartial });
        currentRenewal = nextRenewal;
        yearNum++;
      }
    }
    const totalAllYears = schedule.reduce((s, y) => s + y.total, 0);
    prorationCalc = { proFactor, year1Prorated, schedule, totalAllYears, daysToRenewal, fullPeriod: 365 };
  }

  const hasItems = (pricingMode === "package" && selectedPackage) || (pricingMode === "package_addon" && selectedPackage && Object.keys(addonModules).length > 0) || (pricingMode === "alacarte" && Object.keys(alacarteModules).length > 0) || validCustomItems.length > 0;

  const goStep = (s) => { setAnimIn(false); setTimeout(() => { setStep(s); setAnimIn(true); }, 220); topRef.current?.scrollIntoView({ behavior: "smooth" }); };
  const handleSubmit = () => { setAnimIn(false); setTimeout(() => { setSubmitted(true); setAnimIn(true); }, 220); };

  const generateDocx = async () => {
    setGenerating(true);
    try {
      const pkgLabel = pkg?.label || "";
      const pkgModNames = pkgModules.map(id => findModule(id)?.name).filter(Boolean);
      const doc = buildOrderDocx({ customer, term, termMonths, pricingMode, selectedPackage: pkgLabel, empTier, packagePrice, packageModuleNames: pkgModNames, addonItems, alacarteItems, basePlatformFee, customLineItems: validCustomItems, annualTotal, monthlyTotal, totalContractValue, prorationCalc, existingARR, newServiceStart, annualRenewalDate, existingContractEnd, annualEscalator });
      const buffer = await Packer.toBlob(doc);
      const filename = `SafetyIQ_Order_${customer.company ? customer.company.replace(/[^a-zA-Z0-9]/g, "_") : "Form"}_${new Date().toISOString().split("T")[0]}.docx`;
      saveAs(buffer, filename);
    } catch (err) { console.error("Error generating document:", err); alert("Error generating document. Please try again."); }
    setGenerating(false);
  };

  const addCustomItem = () => { setCustomItems(prev => [...prev, { id: `c_${Date.now()}`, name: "", price: 0, desc: "", discount: 0 }]); };
  const updateCustomItem = (idx, field, value) => { setCustomItems(prev => { const arr = [...prev]; if (field === "price") arr[idx] = { ...arr[idx], price: parseFloat(value) || 0 }; else if (field === "discount") arr[idx] = { ...arr[idx], discount: Math.min(100, Math.max(0, parseFloat(value) || 0)) }; else arr[idx] = { ...arr[idx], [field]: value }; return arr; }); };
  const removeCustomItem = (idx) => { setCustomItems(prev => { const arr = [...prev]; arr.splice(idx, 1); return arr; }); };

  const toggleAddon = (id) => { setAddonModules(prev => { const next = { ...prev }; if (next[id]) delete next[id]; else next[id] = { discount: 0 }; return next; }); };
  const setAddonDiscount = (id, disc) => { setAddonModules(prev => prev[id] ? { ...prev, [id]: { ...prev[id], discount: Math.min(100, Math.max(0, parseFloat(disc) || 0)) } } : prev); };
  const toggleAlacarte = (id) => { setAlacarteModules(prev => { const next = { ...prev }; if (next[id]) delete next[id]; else next[id] = { discount: 0 }; return next; }); };
  const setAlacarteDiscount = (id, disc) => { setAlacarteModules(prev => prev[id] ? { ...prev, [id]: { ...prev[id], discount: Math.min(100, Math.max(0, parseFloat(disc) || 0)) } } : prev); };

  const stepTitles = ["Build Your Plan", "Configure & Price", "Customer Details", "Review & Submit"];

  const DiscountBadge = ({ value, onChange }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
      <div style={{ position: "relative", width: 56 }}>
        <input type="number" min="0" max="100" step="1" value={value || ""} onClick={e => e.stopPropagation()} onChange={e => { e.stopPropagation(); onChange(e.target.value); }} placeholder="0" style={{ width: "100%", boxSizing: "border-box", padding: "5px 20px 5px 8px", borderRadius: 6, border: value > 0 ? "1px solid rgba(239,68,68,0.4)" : "1px solid #263352", background: value > 0 ? "rgba(239,68,68,0.08)" : "rgba(10,15,30,0.4)", color: value > 0 ? "#f87171" : "#6b7fa3", fontSize: 12, outline: "none", fontFamily: "inherit", textAlign: "right", fontWeight: 600 }} />
        <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: value > 0 ? "#f87171" : "#506480", pointerEvents: "none", fontWeight: 600 }}>%</span>
      </div>
    </div>
  );

  const ModuleRow = ({ mod, selected, onToggle, discount, onDiscountChange, tier }) => {
    const price = getModulePrice(mod, tier);
    const net = price * (1 - (discount || 0) / 100);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, cursor: "pointer", background: selected ? "rgba(37,99,235,0.08)" : "rgba(20,30,55,0.5)", border: `1px solid ${selected ? "rgba(37,99,235,0.35)" : "#1a2540"}`, transition: "all 0.2s ease" }}>
        <div onClick={onToggle} style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: selected ? "linear-gradient(135deg, #2563eb, #0ea578)" : "transparent", border: selected ? "none" : "2px solid #34405a", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", color: "#fff" }}>{selected && <CheckIcon />}</div>
        <div onClick={onToggle} style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: selected ? "#dce6f5" : "#a0b0c8" }}>{mod.name}</div>
          <div style={{ fontSize: 12, color: "#506480", marginTop: 2 }}>{mod.desc}</div>
        </div>
        {selected && onDiscountChange && <DiscountBadge value={discount} onChange={onDiscountChange} />}
        <div onClick={onToggle} style={{ textAlign: "right", flexShrink: 0, minWidth: 80 }}>
          {selected && discount > 0 ? (
            <><div style={{ fontSize: 11, color: "#506480", textDecoration: "line-through" }}>{fmtWhole(price)}</div><div style={{ fontWeight: 700, fontSize: 14, color: "#0ea578" }}>{fmt(net)}<span style={{ fontSize: 11, fontWeight: 400 }}>/yr</span></div></>
          ) : (
            <div style={{ fontWeight: 700, fontSize: 14, color: selected ? "#0ea578" : "#4a5a7a" }}>{fmtWhole(price)}<span style={{ fontSize: 11, fontWeight: 400 }}>/yr</span></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(165deg, #0a0f1a 0%, #0d1927 40%, #0f1f30 100%)", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#cfd8e8", padding: 0, position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-15%", left: "-10%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(14,165,120,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div ref={topRef} style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 60px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #2563eb, #0ea578)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", boxShadow: "0 4px 20px rgba(37,99,235,0.3)" }}>S</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#f0f4fa", letterSpacing: "-0.5px" }}>SafetyIQ</span>
          </div>
          <p style={{ fontSize: 13, color: "#6b7fa3", letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>SaaS Software Order Form</p>
        </div>

        {/* Progress */}
        {!submitted && (
          <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 40, position: "relative" }}>
            <div style={{ position: "absolute", top: 16, left: "15%", right: "15%", height: 2, background: "#1a2540" }} />
            <div style={{ position: "absolute", top: 16, left: "15%", height: 2, background: "linear-gradient(90deg, #2563eb, #0ea578)", transition: "width 0.5s ease", width: `${(step / 3) * 70}%` }} />
            {stepTitles.map((t, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 1 }}>
                <div onClick={() => i < step && goStep(i)} style={{ width: 32, height: 32, borderRadius: "50%", background: i <= step ? "linear-gradient(135deg, #2563eb, #0ea578)" : "#1a2540", border: i <= step ? "none" : "2px solid #263352", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: i <= step ? "#fff" : "#4a5a7a", transition: "all 0.3s ease", cursor: i < step ? "pointer" : "default", boxShadow: i === step ? "0 0 16px rgba(37,99,235,0.4)" : "none" }}>{i < step ? <CheckIcon /> : i + 1}</div>
                <span style={{ fontSize: 11, marginTop: 8, color: i <= step ? "#8ea4c8" : "#3a4a68", fontWeight: i === step ? 600 : 400, whiteSpace: "nowrap" }}>{t}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(12px)", transition: "all 0.25s ease" }}>

          {submitted ? (
            <div style={{ textAlign: "center", padding: "50px 20px" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #0ea578, #2563eb)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 24, boxShadow: "0 8px 32px rgba(14,165,120,0.3)" }}>✓</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: "#f0f4fa", margin: "0 0 12px" }}>Order Submitted</h2>
              <p style={{ color: "#6b7fa3", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.7 }}>Your SafetyIQ order has been received. A member of our team will reach out within 1 business day.</p>
              <div style={{ background: "rgba(14,165,120,0.08)", border: "1px solid rgba(14,165,120,0.2)", borderRadius: 12, padding: "20px 28px", display: "inline-block", textAlign: "left" }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: "#6b7fa3" }}>SafetyIQ New ARR</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0ea578" }}>{fmt(annualTotal)}<span style={{ fontSize: 13, fontWeight: 400, color: "#6b7fa3" }}>/year</span></p>
                {prorationCalc && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#d4a82a" }}>Year 1 prorated: {fmt(prorationCalc.year1Prorated)}</p>}
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8ea4c8" }}>{EMPLOYEE_TIERS.find(t => t.id === empTier)?.label} employees · {TERMS.find(t => t.id === term)?.label}</p>
              </div>
              <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 12 }}>
                <button onClick={generateDocx} disabled={generating} style={{ ...btnPrimary, padding: "12px 28px", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8, opacity: generating ? 0.6 : 1 }}><DocIcon /> {generating ? "Generating..." : "Generate Word Document"}</button>
              </div>
              <p style={{ fontSize: 13, color: "#4a5a68", marginTop: 20 }}>Questions? Contact <span style={{ color: "#8ea4c8" }}>ryan.pollard@safetyiq.com</span></p>
            </div>

          ) : step === 0 ? (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0f4fa", margin: "0 0 6px", textAlign: "center" }}>Build Your Plan</h2>
              <p style={{ textAlign: "center", color: "#6b7fa3", margin: "0 0 28px", fontSize: 14 }}>Choose employee tier, pricing approach, and select your modules</p>

              {/* Employee Tier */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: 13, color: "#8ea4c8", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Employee Count</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  {EMPLOYEE_TIERS.map(t => (
                    <div key={t.id} onClick={() => setEmpTier(t.id)} style={{ padding: "12px 8px", borderRadius: 10, cursor: "pointer", textAlign: "center", background: empTier === t.id ? "rgba(37,99,235,0.1)" : "rgba(20,30,55,0.5)", border: `2px solid ${empTier === t.id ? "#2563eb" : "#1a2540"}`, transition: "all 0.2s" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: empTier === t.id ? "#f0f4fa" : "#6b7fa3" }}>{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Mode */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: 13, color: "#8ea4c8", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Pricing Approach</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { id: "package", label: "Package Only", desc: "Select a bundled package" },
                    { id: "package_addon", label: "Package + Add-Ons", desc: "Package plus individual modules" },
                    { id: "alacarte", label: "À La Carte", desc: "Pick individual modules" },
                  ].map(m => (
                    <div key={m.id} onClick={() => setPricingMode(m.id)} style={{ padding: "16px 14px", borderRadius: 10, cursor: "pointer", textAlign: "center", background: pricingMode === m.id ? "rgba(14,165,120,0.1)" : "rgba(20,30,55,0.5)", border: `2px solid ${pricingMode === m.id ? "#0ea578" : "#1a2540"}`, transition: "all 0.2s" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: pricingMode === m.id ? "#f0f4fa" : "#6b7fa3" }}>{m.label}</div>
                      <div style={{ fontSize: 12, color: "#506480", marginTop: 4 }}>{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Package Selection */}
              {(pricingMode === "package" || pricingMode === "package_addon") && (
                <div style={cardStyle}>
                  <h3 style={{ fontSize: 13, color: "#8ea4c8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Select Package</h3>
                  <p style={{ fontSize: 12, color: "#506480", margin: "0 0 14px" }}>{CORE_INCLUDES}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {PACKAGES.map(p => {
                      const price = p.prices[empTier] || 0;
                      const isSelected = selectedPackage === p.id;
                      const mods = (packageModuleOverrides[p.id] || p.defaultModules).map(id => findModule(id)?.name).filter(Boolean);
                      return (
                        <div key={p.id} onClick={() => setSelectedPackage(p.id)} style={{ padding: "20px 16px", borderRadius: 12, cursor: "pointer", background: isSelected ? "rgba(37,99,235,0.1)" : "rgba(20,30,55,0.5)", border: `2px solid ${isSelected ? p.color : "#1a2540"}`, transition: "all 0.2s", position: "relative" }}>
                          {p.popular && <div style={{ position: "absolute", top: -10, right: 12, background: "linear-gradient(135deg, #0ea578, #2563eb)", borderRadius: 12, padding: "2px 10px", fontSize: 10, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>Popular</div>}
                          <div style={{ fontWeight: 800, fontSize: 18, color: isSelected ? "#f0f4fa" : "#6b7fa3", marginBottom: 4 }}>{p.label}</div>
                          <div style={{ fontSize: 12, color: "#506480", marginBottom: 12 }}>{p.tagline}</div>
                          <div style={{ fontSize: 24, fontWeight: 800, color: isSelected ? p.color : "#4a5a7a", fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>{fmtWhole(price)}<span style={{ fontSize: 12, fontWeight: 400, color: "#6b7fa3" }}>/yr</span></div>
                          <div style={{ fontSize: 12, color: "#506480" }}>
                            {mods.map((name, i) => <div key={i} style={{ padding: "2px 0", display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: isSelected ? "#0ea578" : "#3a4a68" }}>✓</span> {name}</div>)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedPackage && (
                    <div style={{ marginTop: 16, background: "rgba(20,30,55,0.5)", borderRadius: 10, padding: "14px 18px", border: "1px solid #1a2540" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <InfoIcon />
                        <span style={{ fontSize: 12, color: "#8ea4c8" }}>Customize which modules are included in this package for this customer:</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {SI_MODULES.map(mod => {
                          const included = pkgModules.includes(mod.id);
                          return (
                            <div key={mod.id} onClick={() => {
                              setPackageModuleOverrides(prev => {
                                const current = prev[selectedPackage] || PACKAGES.find(p => p.id === selectedPackage).defaultModules;
                                const next = included ? current.filter(id => id !== mod.id) : [...current, mod.id];
                                return { ...prev, [selectedPackage]: next };
                              });
                            }} style={{ padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, background: included ? "rgba(37,99,235,0.15)" : "rgba(20,30,55,0.8)", border: `1px solid ${included ? "rgba(37,99,235,0.4)" : "#263352"}`, color: included ? "#8eb8ff" : "#506480", transition: "all 0.2s" }}>
                              {included ? "✓ " : ""}{mod.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Add-on Modules */}
              {pricingMode === "package_addon" && selectedPackage && (
                <div style={cardStyle}>
                  <h3 style={{ fontSize: 13, color: "#8ea4c8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Add-On Modules</h3>
                  <p style={{ fontSize: 12, color: "#506480", margin: "0 0 14px" }}>Select additional modules not included in {pkg?.label}. DRUID and JESI modules can also be added.</p>
                  {PRODUCTS.map(prod => {
                    const availableModules = prod.hasPackages ? prod.modules.filter(m => !pkgModules.includes(m.id)) : prod.modules;
                    if (availableModules.length === 0) return null;
                    return (
                      <div key={prod.key} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 20 }}>{prod.icon}</span>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f4fa" }}>{prod.name}</span>
                          <span style={{ fontSize: 12, color: "#506480" }}>— {prod.tagline}</span>
                        </div>
                        <div style={{ display: "grid", gap: 8 }}>
                          {availableModules.map(mod => (
                            <ModuleRow key={mod.id} mod={mod} selected={!!addonModules[mod.id]} onToggle={() => toggleAddon(mod.id)} discount={addonModules[mod.id]?.discount || 0} onDiscountChange={v => setAddonDiscount(mod.id, v)} tier={empTier} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* À La Carte Modules */}
              {pricingMode === "alacarte" && (
                <div style={cardStyle}>
                  <h3 style={{ fontSize: 13, color: "#8ea4c8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Select Modules</h3>
                  <p style={{ fontSize: 12, color: "#506480", margin: "0 0 4px" }}>Base platform fee of {fmtWhole(basePlatformFee)}/yr applies for {EMPLOYEE_TIERS.find(t => t.id === empTier)?.label} employees.</p>
                  <p style={{ fontSize: 12, color: "#506480", margin: "0 0 14px" }}>{CORE_INCLUDES}</p>
                  {PRODUCTS.map(prod => (
                    <div key={prod.key} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 20 }}>{prod.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f4fa" }}>{prod.name}</span>
                        <span style={{ fontSize: 12, color: "#506480" }}>— {prod.tagline}</span>
                      </div>
                      <div style={{ display: "grid", gap: 8 }}>
                        {prod.modules.map(mod => (
                          <ModuleRow key={mod.id} mod={mod} selected={!!alacarteModules[mod.id]} onToggle={() => toggleAlacarte(mod.id)} discount={alacarteModules[mod.id]?.discount || 0} onDiscountChange={v => setAlacarteDiscount(mod.id, v)} tier={empTier} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Line Items */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 13, color: "#8ea4c8", margin: 0, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Custom Line Items</h3>
                  <button onClick={addCustomItem} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "1px dashed #2563eb", background: "rgba(37,99,235,0.06)", color: "#4d8ef7", fontSize: 13, fontWeight: 600, cursor: "pointer" }}><PlusIcon /> Add Item</button>
                </div>
                {customItems.map((item, idx) => (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 60px 32px", gap: 8, alignItems: "end", marginBottom: 10, background: "rgba(20,30,55,0.5)", padding: "12px 14px", borderRadius: 10, border: "1px solid #1a2540" }}>
                    <div><label style={labelStyle}>Item Name</label><input value={item.name} onChange={e => updateCustomItem(idx, "name", e.target.value)} placeholder="e.g., Implementation" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Description</label><input value={item.desc} onChange={e => updateCustomItem(idx, "desc", e.target.value)} placeholder="Optional" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Annual Fee</label><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#506480", fontSize: 14 }}>$</span><input type="number" value={item.price || ""} onChange={e => updateCustomItem(idx, "price", e.target.value)} placeholder="0" style={{ ...inputStyle, paddingLeft: 22 }} /></div></div>
                    <div><label style={labelStyle}>Disc %</label><input type="number" min="0" max="100" value={item.discount || ""} onChange={e => updateCustomItem(idx, "discount", e.target.value)} placeholder="0" style={{ ...inputStyle, textAlign: "center", padding: "11px 6px", color: item.discount > 0 ? "#f87171" : "#dce6f5", borderColor: item.discount > 0 ? "rgba(239,68,68,0.3)" : "#263352" }} /></div>
                    <button onClick={() => removeCustomItem(idx)} style={{ width: 32, height: 38, borderRadius: 8, border: "1px solid #3a2030", background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><TrashIcon /></button>
                  </div>
                ))}
                {customItems.length === 0 && <p style={{ fontSize: 13, color: "#3a4a68", margin: "4px 0 0", fontStyle: "italic" }}>No custom items — click "Add Item" to create one.</p>}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                <button onClick={() => hasItems && goStep(1)} disabled={!hasItems} style={{ ...btnPrimary, opacity: hasItems ? 1 : 0.4, cursor: hasItems ? "pointer" : "not-allowed" }}>Continue</button>
              </div>
            </div>

          ) : step === 1 ? (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0f4fa", margin: "0 0 6px", textAlign: "center" }}>Configure & Price</h2>
              <p style={{ textAlign: "center", color: "#6b7fa3", margin: "0 0 28px", fontSize: 14 }}>Set contract term and coterminus proration</p>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 13, color: "#8ea4c8", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Contract Term</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {TERMS.map(t => (
                    <div key={t.id} onClick={() => setTerm(t.id)} style={{ padding: "16px 14px", borderRadius: 10, cursor: "pointer", textAlign: "center", background: term === t.id ? "rgba(14,165,120,0.1)" : "rgba(20,30,55,0.5)", border: `2px solid ${term === t.id ? "#0ea578" : "#1a2540"}`, transition: "all 0.2s" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: term === t.id ? "#f0f4fa" : "#6b7fa3" }}>{t.label}</div>
                      <div style={{ fontSize: 12, color: "#506480", marginTop: 4 }}>{t.id / 12} year{t.id > 12 ? "s" : ""}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...cardStyle, borderColor: prorationEnabled ? "rgba(251,191,36,0.3)" : "#1a2540" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: prorationEnabled ? 18 : 0 }}>
                  <div>
                    <h3 style={{ fontSize: 13, color: "#8ea4c8", margin: 0, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Coterminus Proration</h3>
                    <p style={{ fontSize: 12, color: "#506480", margin: "4px 0 0" }}>Align new services with an existing contract's billing cycle</p>
                  </div>
                  <div onClick={() => setProrationEnabled(!prorationEnabled)} style={{ width: 48, height: 26, borderRadius: 13, cursor: "pointer", position: "relative", background: prorationEnabled ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#263352", transition: "background 0.3s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: prorationEnabled ? 25 : 3, transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                  </div>
                </div>
                {prorationEnabled && (
                  <div>
                    <div style={{ background: "rgba(251,191,36,0.04)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, border: "1px solid rgba(251,191,36,0.1)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <InfoIcon /><span style={{ fontSize: 12, color: "#b08d28", lineHeight: 1.5 }}>Year 1 is prorated from the new service start date to the next annual renewal. Year 2+ bills the full SafetyIQ ARR plus the existing contract fee with the annual escalator applied.</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div><label style={labelStyle}>New Service Start Date</label><input type="date" value={newServiceStart} onChange={e => setNewServiceStart(e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Next Annual Renewal Date</label><input type="date" value={annualRenewalDate} onChange={e => setAnnualRenewalDate(e.target.value)} style={inputStyle} /><span style={{ fontSize: 11, color: "#506480", marginTop: 4, display: "block" }}>When the existing annual fee is next due</span></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      <div><label style={labelStyle}>Master Contract End Date</label><input type="date" value={existingContractEnd} onChange={e => setExistingContractEnd(e.target.value)} style={inputStyle} /><span style={{ fontSize: 11, color: "#506480", marginTop: 4, display: "block" }}>End of master term</span></div>
                      <div><label style={labelStyle}>Existing Contract ARR</label><div style={{ position: "relative" }}><span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#506480", fontSize: 14 }}>$</span><input type="number" value={existingARR || ""} onChange={e => setExistingARR(parseFloat(e.target.value) || 0)} placeholder="0" style={{ ...inputStyle, paddingLeft: 24 }} /></div><span style={{ fontSize: 11, color: "#506480", marginTop: 4, display: "block" }}>Current annual fee</span></div>
                      <div><label style={labelStyle}>Annual Escalator (%)</label><div style={{ position: "relative" }}><input type="number" min="0" max="25" step="0.5" value={annualEscalator} onChange={e => setAnnualEscalator(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, paddingRight: 28 }} /><span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#506480", fontSize: 14 }}>%</span></div><span style={{ fontSize: 11, color: "#506480", marginTop: 4, display: "block" }}>Applied each year</span></div>
                    </div>
                    {prorationCalc && (
                      <div style={{ marginTop: 20, background: "rgba(251,191,36,0.06)", borderRadius: 10, padding: "16px 18px", border: "1px solid rgba(251,191,36,0.15)" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#d4a82a", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Payment Schedule Preview</div>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead><tr style={{ borderBottom: "1px solid rgba(251,191,36,0.2)" }}>
                              <th style={{ textAlign: "left", padding: "8px 10px", color: "#b08d28", fontWeight: 600 }}>Period</th>
                              <th style={{ textAlign: "center", padding: "8px 6px", color: "#b08d28", fontWeight: 600 }}>Days</th>
                              <th style={{ textAlign: "right", padding: "8px 10px", color: "#b08d28", fontWeight: 600 }}>SafetyIQ Fee</th>
                              {existingARR > 0 && <th style={{ textAlign: "right", padding: "8px 10px", color: "#b08d28", fontWeight: 600 }}>Existing Contract</th>}
                              <th style={{ textAlign: "right", padding: "8px 10px", color: "#b08d28", fontWeight: 600 }}>Total Due</th>
                            </tr></thead>
                            <tbody>{prorationCalc.schedule.map(yr => (
                              <tr key={yr.year} style={{ borderBottom: "1px solid rgba(251,191,36,0.08)" }}>
                                <td style={{ padding: "8px 10px", color: "#dce6f5" }}><div style={{ fontWeight: 600 }}>{yr.label}</div><div style={{ fontSize: 11, color: "#506480" }}>{yr.periodStart} → {yr.periodEnd}</div></td>
                                <td style={{ textAlign: "center", padding: "8px 6px", color: yr.isProrated ? "#d4a82a" : "#8ea4c8" }}>{yr.days}</td>
                                <td style={{ textAlign: "right", padding: "8px 10px", color: yr.isProrated ? "#d4a82a" : "#8ea4c8", fontWeight: 600 }}>{fmt(yr.safetyIQFee)}</td>
                                {existingARR > 0 && <td style={{ textAlign: "right", padding: "8px 10px", color: "#8ea4c8" }}>{yr.existingFee > 0 ? fmt(yr.existingFee) : "—"}</td>}
                                <td style={{ textAlign: "right", padding: "8px 10px", color: "#f0f4fa", fontWeight: 700 }}>{fmt(yr.total)}</td>
                              </tr>
                            ))}</tbody>
                            <tfoot><tr style={{ borderTop: "2px solid rgba(251,191,36,0.3)" }}>
                              <td colSpan={existingARR > 0 ? 4 : 3} style={{ padding: "10px 10px", color: "#d4a82a", fontWeight: 700 }}>Total Contract Value</td>
                              <td style={{ textAlign: "right", padding: "10px 10px", color: "#d4a82a", fontWeight: 800, fontSize: 15 }}>{fmt(prorationCalc.totalAllYears)}</td>
                            </tr></tfoot>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing Summary */}
              <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(14,165,120,0.06))", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 14, padding: 24 }}>
                {(pricingMode === "package" || pricingMode === "package_addon") && pkg && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#6b7fa3", fontSize: 14 }}>{pkg.label} Package</span>
                    <span style={{ color: "#8ea4c8", fontWeight: 600 }}>{fmt(packagePrice)}/yr</span>
                  </div>
                )}
                {pricingMode === "package_addon" && addonSubtotal > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#6b7fa3", fontSize: 14 }}>Add-On Modules ({addonItems.length})</span>
                    <span style={{ color: "#8ea4c8", fontWeight: 600 }}>{fmt(addonSubtotal)}/yr</span>
                  </div>
                )}
                {pricingMode === "alacarte" && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: "#6b7fa3", fontSize: 14 }}>Base Platform Fee</span>
                      <span style={{ color: "#8ea4c8", fontWeight: 600 }}>{fmt(basePlatformFee)}/yr</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: "#6b7fa3", fontSize: 14 }}>Modules ({alacarteItems.length})</span>
                      <span style={{ color: "#8ea4c8", fontWeight: 600 }}>{fmt(alacarteSubtotal)}/yr</span>
                    </div>
                  </>
                )}
                {customSubtotal > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#6b7fa3", fontSize: 14 }}>Custom Items ({validCustomItems.length})</span>
                    <span style={{ color: "#8ea4c8", fontWeight: 600 }}>{fmt(customSubtotal)}/yr</span>
                  </div>
                )}
                <div style={{ borderTop: "1px solid #1a2540", paddingTop: 14, marginTop: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ color: "#f0f4fa", fontWeight: 700, fontSize: 16 }}>SafetyIQ ARR</span>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#f0f4fa", fontFamily: "'Playfair Display', serif" }}>{fmt(annualTotal)}<span style={{ fontSize: 14, fontWeight: 400, color: "#6b7fa3" }}>/yr</span></div>
                      <div style={{ fontSize: 13, color: "#6b7fa3" }}>{fmt(monthlyTotal)}/mo · {fmt(totalContractValue)} TCV ({term / 12}yr)</div>
                    </div>
                  </div>
                  {prorationCalc && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10, paddingTop: 10, borderTop: "1px dashed rgba(251,191,36,0.3)" }}>
                      <span style={{ color: "#d4a82a", fontWeight: 700, fontSize: 14 }}>Year 1 (Prorated — {prorationCalc.daysToRenewal} days)</span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: "#d4a82a", fontFamily: "'Playfair Display', serif" }}>{fmt(prorationCalc.year1Prorated)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button onClick={() => goStep(0)} style={btnBack}>Back</button>
                <button onClick={() => goStep(2)} style={btnPrimary}>Continue</button>
              </div>
            </div>

          ) : step === 2 ? (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0f4fa", margin: "0 0 6px", textAlign: "center" }}>Customer Details</h2>
              <p style={{ textAlign: "center", color: "#6b7fa3", margin: "0 0 28px", fontSize: 14 }}>Enter the customer information for this order</p>
              <div style={cardStyle}>
                {[
                  { row: [{ key: "company", label: "Company / Organization", required: true }] },
                  { row: [{ key: "contact", label: "Primary Contact Name", required: true }, { key: "email", label: "Email Address", required: true }] },
                  { row: [{ key: "phone", label: "Phone Number" }, { key: "employees", label: "# of Employees", type: "number" }] },
                  { row: [{ key: "address", label: "Street Address" }] },
                  { row: [{ key: "city", label: "City" }, { key: "state", label: "State" }, { key: "zip", label: "ZIP Code" }] },
                ].map((group, gi) => (
                  <div key={gi} style={{ display: "grid", gridTemplateColumns: `repeat(${group.row.length}, 1fr)`, gap: 16, marginBottom: 16 }}>
                    {group.row.map(f => (
                      <div key={f.key}><label style={labelStyle}>{f.label}{f.required && <span style={{ color: "#ef4444" }}> *</span>}</label><input type={f.type || "text"} value={customer[f.key]} onChange={e => setCustomer({ ...customer, [f.key]: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = "#2563eb"} onBlur={e => e.target.style.borderColor = "#263352"} /></div>
                    ))}
                  </div>
                ))}
                <div><label style={labelStyle}>Notes / Special Requirements</label><textarea value={customer.notes} onChange={e => setCustomer({ ...customer, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} onFocus={e => e.target.style.borderColor = "#2563eb"} onBlur={e => e.target.style.borderColor = "#263352"} /></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button onClick={() => goStep(1)} style={btnBack}>Back</button>
                <button onClick={() => customer.company && customer.contact && customer.email ? goStep(3) : null} disabled={!customer.company || !customer.contact || !customer.email} style={{ ...btnPrimary, opacity: customer.company && customer.contact && customer.email ? 1 : 0.4, cursor: customer.company && customer.contact && customer.email ? "pointer" : "not-allowed" }}>Continue</button>
              </div>
            </div>

          ) : (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0f4fa", margin: "0 0 6px", textAlign: "center" }}>Review Your Order</h2>
              <p style={{ textAlign: "center", color: "#6b7fa3", margin: "0 0 28px", fontSize: 14 }}>Verify all details before submitting</p>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 13, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 12px", fontWeight: 600 }}>Customer</h3>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f4fa" }}>{customer.company}</div>
                <div style={{ fontSize: 14, color: "#8ea4c8", marginTop: 4 }}>{customer.contact} · {customer.email}</div>
                {customer.phone && <div style={{ fontSize: 13, color: "#6b7fa3", marginTop: 2 }}>{customer.phone}</div>}
                {(customer.city || customer.state) && <div style={{ fontSize: 13, color: "#6b7fa3", marginTop: 2 }}>{[customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(", ")}</div>}
                {customer.employees && <div style={{ fontSize: 13, color: "#6b7fa3", marginTop: 2 }}>{customer.employees} employees</div>}
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 13, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 12px", fontWeight: 600 }}>Plan Configuration</h3>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "#6b7fa3" }}>Employee Tier</span><span style={{ color: "#cfd8e8", fontWeight: 600 }}>{EMPLOYEE_TIERS.find(t => t.id === empTier)?.label}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "#6b7fa3" }}>Term</span><span style={{ color: "#cfd8e8", fontWeight: 600 }}>{TERMS.find(t => t.id === term)?.label}</span></div>
                {(pricingMode === "package" || pricingMode === "package_addon") && pkg && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#6b7fa3" }}>Package</span><span style={{ color: "#cfd8e8", fontWeight: 600 }}>{pkg.label}</span></div>}
                <div style={{ fontSize: 12, color: "#506480", marginTop: 8, fontStyle: "italic" }}>{CORE_INCLUDES}</div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 13, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 12px", fontWeight: 600 }}>Line Items</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead><tr style={{ borderBottom: "1px solid #1a2540" }}>
                      <th style={{ textAlign: "left", padding: "8px 8px", color: "#6b7fa3", fontWeight: 600 }}>Item</th>
                      <th style={{ textAlign: "right", padding: "8px 8px", color: "#6b7fa3", fontWeight: 600 }}>List Price</th>
                      <th style={{ textAlign: "center", padding: "8px 8px", color: "#6b7fa3", fontWeight: 600 }}>Disc</th>
                      <th style={{ textAlign: "right", padding: "8px 8px", color: "#6b7fa3", fontWeight: 600 }}>Net Annual</th>
                    </tr></thead>
                    <tbody>
                      {(pricingMode === "package" || pricingMode === "package_addon") && pkg && (
                        <tr style={{ borderBottom: "1px solid #141e35" }}>
                          <td style={{ padding: "8px 8px", color: "#cfd8e8" }}><div style={{ fontWeight: 600 }}>{pkg.label} Package</div><div style={{ fontSize: 11, color: "#506480" }}>Includes: {pkgModules.map(id => findModule(id)?.name).filter(Boolean).join(", ")}</div></td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#6b7fa3" }}>{fmt(packagePrice)}</td>
                          <td style={{ textAlign: "center", padding: "8px 8px", color: "#3a4a68" }}>—</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#8ea4c8", fontWeight: 600 }}>{fmt(packagePrice)}</td>
                        </tr>
                      )}
                      {pricingMode === "alacarte" && (
                        <tr style={{ borderBottom: "1px solid #141e35" }}>
                          <td style={{ padding: "8px 8px", color: "#cfd8e8" }}>Base Platform Fee</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#6b7fa3" }}>{fmt(basePlatformFee)}</td>
                          <td style={{ textAlign: "center", padding: "8px 8px", color: "#3a4a68" }}>—</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#8ea4c8", fontWeight: 600 }}>{fmt(basePlatformFee)}</td>
                        </tr>
                      )}
                      {pricingMode === "package_addon" && addonItems.map(a => (
                        <tr key={a.id} style={{ borderBottom: "1px solid #141e35" }}>
                          <td style={{ padding: "8px 8px", color: "#cfd8e8" }}>{a.name}</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#6b7fa3" }}>{fmt(a.listPrice)}</td>
                          <td style={{ textAlign: "center", padding: "8px 8px", color: a.discount > 0 ? "#f87171" : "#3a4a68" }}>{a.discount > 0 ? `-${a.discount}%` : "—"}</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#8ea4c8", fontWeight: 600 }}>{fmt(a.netPrice)}</td>
                        </tr>
                      ))}
                      {pricingMode === "alacarte" && alacarteItems.map(a => (
                        <tr key={a.id} style={{ borderBottom: "1px solid #141e35" }}>
                          <td style={{ padding: "8px 8px", color: "#cfd8e8" }}>{a.name}</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#6b7fa3" }}>{fmt(a.listPrice)}</td>
                          <td style={{ textAlign: "center", padding: "8px 8px", color: a.discount > 0 ? "#f87171" : "#3a4a68" }}>{a.discount > 0 ? `-${a.discount}%` : "—"}</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#8ea4c8", fontWeight: 600 }}>{fmt(a.netPrice)}</td>
                        </tr>
                      ))}
                      {validCustomItems.map(c => (
                        <tr key={c.id} style={{ borderBottom: "1px solid #141e35" }}>
                          <td style={{ padding: "8px 8px" }}><span style={{ color: "#d4a82a" }}>{c.name}</span>{c.desc && <span style={{ color: "#506480", fontSize: 11, marginLeft: 6 }}>— {c.desc}</span>}</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#6b7fa3" }}>{fmt(c.listPrice)}</td>
                          <td style={{ textAlign: "center", padding: "8px 8px", color: c.discount > 0 ? "#f87171" : "#3a4a68" }}>{c.discount > 0 ? `-${c.discount}%` : "—"}</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#d4a82a", fontWeight: 600 }}>{fmt(c.netPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr style={{ borderTop: "2px solid #263352" }}>
                      <td colSpan={3} style={{ padding: "10px 8px", color: "#f0f4fa", fontWeight: 700 }}>Annual Total</td>
                      <td style={{ textAlign: "right", padding: "10px 8px", color: "#0ea578", fontWeight: 800, fontSize: 16 }}>{fmt(annualTotal)}</td>
                    </tr></tfoot>
                  </table>
                </div>
              </div>

              {prorationCalc && (
                <div style={{ ...cardStyle, borderColor: "rgba(251,191,36,0.3)" }}>
                  <h3 style={{ fontSize: 13, color: "#d4a82a", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 14px", fontWeight: 600 }}>Coterminus Payment Schedule</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead><tr style={{ borderBottom: "1px solid rgba(251,191,36,0.2)" }}>
                        <th style={{ textAlign: "left", padding: "8px 8px", color: "#b08d28", fontWeight: 600 }}>Period</th>
                        <th style={{ textAlign: "center", padding: "8px 6px", color: "#b08d28", fontWeight: 600 }}>Days</th>
                        <th style={{ textAlign: "right", padding: "8px 8px", color: "#b08d28", fontWeight: 600 }}>SafetyIQ</th>
                        {existingARR > 0 && <th style={{ textAlign: "right", padding: "8px 8px", color: "#b08d28", fontWeight: 600 }}>Existing + Esc.</th>}
                        <th style={{ textAlign: "right", padding: "8px 8px", color: "#b08d28", fontWeight: 600 }}>Total Due</th>
                      </tr></thead>
                      <tbody>{prorationCalc.schedule.map(yr => (
                        <tr key={yr.year} style={{ borderBottom: "1px solid rgba(251,191,36,0.08)" }}>
                          <td style={{ padding: "8px 8px", color: "#dce6f5" }}><div style={{ fontWeight: 600 }}>{yr.label}</div><div style={{ fontSize: 11, color: "#506480" }}>{yr.periodStart} → {yr.periodEnd}</div></td>
                          <td style={{ textAlign: "center", padding: "8px 6px", color: yr.isProrated ? "#d4a82a" : "#8ea4c8" }}>{yr.days}</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: yr.isProrated ? "#d4a82a" : "#8ea4c8", fontWeight: 600 }}>{fmt(yr.safetyIQFee)}</td>
                          {existingARR > 0 && <td style={{ textAlign: "right", padding: "8px 8px", color: "#8ea4c8" }}>{yr.existingFee > 0 ? fmt(yr.existingFee) : "—"}</td>}
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#f0f4fa", fontWeight: 700 }}>{fmt(yr.total)}</td>
                        </tr>
                      ))}</tbody>
                      <tfoot><tr style={{ borderTop: "2px solid rgba(251,191,36,0.3)" }}>
                        <td colSpan={existingARR > 0 ? 4 : 3} style={{ padding: "10px 8px", color: "#d4a82a", fontWeight: 700 }}>Total Contract Value</td>
                        <td style={{ textAlign: "right", padding: "10px 8px", color: "#d4a82a", fontWeight: 800, fontSize: 15 }}>{fmt(prorationCalc.totalAllYears)}</td>
                      </tr></tfoot>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(14,165,120,0.08))", border: "1px solid rgba(37,99,235,0.25)", borderRadius: 14, padding: 24, textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "#6b7fa3", marginBottom: 8 }}>SafetyIQ Annual Recurring Revenue</div>
                <div style={{ fontSize: 38, fontWeight: 800, color: "#f0f4fa", fontFamily: "'Playfair Display', serif" }}>{fmt(annualTotal)}<span style={{ fontSize: 14, fontWeight: 400, color: "#6b7fa3" }}>/year</span></div>
                <div style={{ fontSize: 14, color: "#6b7fa3", marginTop: 4 }}>{fmt(monthlyTotal)}/month · {fmt(totalContractValue)} TCV</div>
                {prorationCalc && <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed rgba(251,191,36,0.3)" }}><span style={{ fontSize: 14, color: "#d4a82a", fontWeight: 700 }}>Year 1 prorated: {fmt(prorationCalc.year1Prorated)} ({prorationCalc.daysToRenewal} days)</span></div>}
              </div>

              {customer.notes && (
                <div style={cardStyle}>
                  <h3 style={{ fontSize: 13, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 8px", fontWeight: 600 }}>Notes</h3>
                  <p style={{ margin: 0, color: "#8ea4c8", fontSize: 14, lineHeight: 1.6 }}>{customer.notes}</p>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, flexWrap: "wrap", gap: 12 }}>
                <button onClick={() => goStep(2)} style={btnBack}>Back</button>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={generateDocx} disabled={generating} style={{ ...btnBack, display: "inline-flex", alignItems: "center", gap: 8, borderColor: "#2563eb", color: "#4d8ef7", opacity: generating ? 0.6 : 1 }}><DocIcon /> {generating ? "Generating..." : "Generate Word Doc"}</button>
                  <button onClick={handleSubmit} style={btnPrimary} onMouseEnter={e => e.target.style.transform = "scale(1.03)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>Submit Order</button>
                </div>
              </div>
              <p style={{ textAlign: "center", fontSize: 12, color: "#3a4a68", marginTop: 16 }}>By submitting, you authorize SafetyIQ, Inc. to prepare a formal agreement. Final pricing subject to executed contract.</p>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 44, paddingTop: 20, borderTop: "1px solid #141e35" }}>
          <p style={{ fontSize: 12, color: "#2a3a58", margin: 0 }}>© {new Date().getFullYear()} SafetyIQ, Inc. · Confidential</p>
        </div>
      </div>
    </div>
  );
}