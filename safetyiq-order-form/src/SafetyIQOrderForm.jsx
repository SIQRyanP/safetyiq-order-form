import { useState, useRef } from "react";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel, PageNumber, PageBreak } from "docx";
import { saveAs } from "file-saver";
 
/* ─── Data ─── */
const PRODUCTS = {
  safetyIndicators: {
    name: "Safety Indicators",
    tagline: "Modular EHS Platform",
    description: "Comprehensive environmental health & safety management",
    icon: "🛡️",
    modules: [
      { id: "incidents", name: "Incidents & Investigations", price: 3500, desc: "Track, investigate, and analyze workplace incidents with SIF/Rule of 5" },
      { id: "audits", name: "Audits & Compliance", price: 3000, desc: "Schedule and manage safety audits with automated scoring" },
      { id: "inspections", name: "Inspections", price: 2500, desc: "Mobile-ready inspection checklists and workflows" },
      { id: "observations", name: "Observations", price: 2500, desc: "Behavioral safety observations with trend analysis" },
      { id: "corrective_actions", name: "Corrective Actions", price: 2000, desc: "CAPA management with root cause tracking" },
      { id: "training", name: "Training Tracker", price: 2000, desc: "Manage certifications, compliance training, and renewals" },
      { id: "osha_reporting", name: "OSHA 300/300A Reporting", price: 1500, desc: "Automated OSHA recordkeeping and annual summary generation" },
      { id: "risk_assessment", name: "Risk Assessment", price: 2500, desc: "JSA/JHA templates and risk scoring matrices" },
    ],
  },
  druid: {
    name: "DRUID",
    tagline: "Fitness-for-Duty Assessment",
    description: "Johns Hopkins-validated 60-second psychomotor impairment detection",
    icon: "🧠",
    modules: [
      { id: "druid_standard", name: "DRUID Standard", price: 5000, desc: "Core impairment screening for up to 250 employees" },
      { id: "druid_enterprise", name: "DRUID Enterprise", price: 12000, desc: "Unlimited employees with advanced analytics & API access" },
      { id: "druid_analytics", name: "DRUID Analytics Add-On", price: 3000, desc: "Trend dashboards, shift-level insights, and predictive alerts" },
    ],
  },
  jesi: {
    name: "JESI",
    tagline: "Journey & Lone Worker Safety",
    description: "Journey management, lone worker tracking, and emergency alerts",
    icon: "📍",
    modules: [
      { id: "journey_mgmt", name: "Journey Management", price: 4000, desc: "Route planning, check-ins, and escalation workflows" },
      { id: "lone_worker", name: "Lone Worker Monitoring", price: 3500, desc: "Real-time GPS, man-down alerts, and duress capabilities" },
      { id: "jesi_analytics", name: "JESI Analytics", price: 2000, desc: "Journey compliance dashboards and reporting" },
    ],
  },
};
 
const TERMS = [
  { id: 36, label: "36 Months" },
  { id: 60, label: "60 Months" },
];
 
function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function fmtWhole(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
 
function daysBetween(a, b) {
  const d1 = new Date(a + "T00:00:00"), d2 = new Date(b + "T00:00:00");
  return Math.round((d2 - d1) / 86400000);
}
 
function dateStr(d) {
  return d.toISOString().split("T")[0];
}
 
function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ChevronDown({ open }) {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M11 4v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function DocIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10 2H5a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7l-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 2v5h5M7 10h4M7 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function InfoIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7 6.5V10M7 4.5V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}
 
const cardStyle = { background: "rgba(15,25,45,0.6)", border: "1px solid #1a2540", borderRadius: 14, padding: 24, marginBottom: 16 };
const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 8,
  border: "1px solid #263352", background: "rgba(10,15,30,0.6)", color: "#dce6f5",
  fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
};
const labelStyle = { display: "block", fontSize: 12, color: "#6b7fa3", marginBottom: 6, fontWeight: 600 };
const btnPrimary = {
  padding: "14px 36px", borderRadius: 10, border: "none",
  background: "linear-gradient(135deg, #2563eb, #0ea578)", color: "#fff",
  fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 20px rgba(37,99,235,0.3)",
};
const btnBack = { padding: "14px 28px", borderRadius: 10, border: "1px solid #263352", background: "transparent", color: "#8ea4c8", fontWeight: 600, fontSize: 14, cursor: "pointer" };
 
/* ─── DOCX Generation ─── */
function buildOrderDocx({ customer, term, termMonths, moduleItems, customItemsCalc, moduleSubtotal, customSubtotal, annualTotal, monthlyTotal, totalContractValue, prorationCalc, existingARR, newServiceStart, annualRenewalDate, existingContractEnd, annualEscalator }) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const border = { style: BorderStyle.SINGLE, size: 1, color: "B0B0B0" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };
  const headerShading = { fill: "1a2540", type: ShadingType.CLEAR };
  const altShading = { fill: "F5F7FA", type: ShadingType.CLEAR };
 
  const tableWidth = 9360;
 
  const allItems = [
    ...moduleItems.map(m => ({ ...m, type: "module" })),
    ...customItemsCalc.map(c => ({ ...c, type: "custom" })),
  ];
 
  // Line items table
  const colWidths = [3200, 2400, 1000, 1000, 1760];
  const headerRow = new TableRow({
    children: ["Item", "Description", "List Price", "Disc %", "Net Annual"].map((text, i) => (
      new TableCell({
        borders,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: headerShading,
        margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })],
      })
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
 
  const lineItemsTable = new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...itemRows, totalRow],
  });
 
  // Proration table
  let prorationSection = [];
  if (prorationCalc) {
    const hasExisting = existingARR > 0;
    const proCols = hasExisting ? [2400, 800, 2200, 2200, 1760] : [3200, 1000, 2800, 2360];
    const proHeaders = hasExisting ? ["Period", "Days", "SafetyIQ Fee", "Existing Contract", "Total Due"] : ["Period", "Days", "SafetyIQ Fee", "Total Due"];
 
    const proHeaderRow = new TableRow({
      children: proHeaders.map((text, i) => (
        new TableCell({
          borders,
          width: { size: proCols[i], type: WidthType.DXA },
          shading: { fill: "78550A", type: ShadingType.CLEAR },
          margins: cellMargins,
          children: [new Paragraph({ alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT, children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })],
        })
      )),
    });
 
    const proRows = prorationCalc.schedule.map((yr, idx) => {
      const shading = idx % 2 === 1 ? { fill: "FFF8E1", type: ShadingType.CLEAR } : undefined;
      const cells = [
        new TableCell({ borders, width: { size: proCols[0], type: WidthType.DXA }, shading, margins: cellMargins, children: [
          new Paragraph({ children: [new TextRun({ text: yr.label, font: "Arial", size: 20, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `${yr.periodStart} \u2192 ${yr.periodEnd}`, font: "Arial", size: 16, color: "888888" })] }),
        ] }),
        new TableCell({ borders, width: { size: proCols[1], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: String(yr.days), font: "Arial", size: 20 })] })] }),
        new TableCell({ borders, width: { size: proCols[2], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmt(yr.safetyIQFee), font: "Arial", size: 20 })] })] }),
      ];
      if (hasExisting) {
        cells.push(new TableCell({ borders, width: { size: proCols[3], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: yr.existingFee > 0 ? fmt(yr.existingFee) : "\u2014", font: "Arial", size: 20 })] })] }));
      }
      cells.push(new TableCell({ borders, width: { size: proCols[hasExisting ? 4 : 3], type: WidthType.DXA }, shading, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmt(yr.total), font: "Arial", size: 20, bold: true })] })] }));
      return new TableRow({ children: cells });
    });
 
    const proTotalColSpan = hasExisting ? 4 : 3;
    const proTotalRow = new TableRow({
      children: [
        new TableCell({ borders, width: { size: proCols.slice(0, proTotalColSpan).reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnSpan: proTotalColSpan, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Total Contract Value", font: "Arial", size: 22, bold: true, color: "78550A" })] })] }),
        new TableCell({ borders, width: { size: proCols[hasExisting ? 4 : 3], type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, margins: cellMargins, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmt(prorationCalc.totalAllYears), font: "Arial", size: 22, bold: true, color: "78550A" })] })] }),
      ],
    });
 
    prorationSection = [
      new Paragraph({ spacing: { before: 400 }, children: [] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Coterminus Payment Schedule", font: "Arial" })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `New service start: ${newServiceStart} | Next annual renewal: ${annualRenewalDate} | Contract end: ${existingContractEnd} | Escalator: ${annualEscalator}%`, font: "Arial", size: 20, color: "666666" })] }),
      new Table({ width: { size: tableWidth, type: WidthType.DXA }, columnWidths: proCols, rows: [proHeaderRow, ...proRows, proTotalRow] }),
    ];
  }
 
  // Signature lines
  const sigLine = new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: "________________________________________", font: "Arial", size: 20, color: "999999" })] });
 
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: "1a2540" }, paragraph: { spacing: { before: 300, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: "1a2540" }, paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { after: 100 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2563EB", space: 1 } },
              children: [
                new TextRun({ text: "SafetyIQ, Inc.", font: "Arial", size: 24, bold: true, color: "1a2540" }),
                new TextRun({ text: "  \u2014  SaaS Software Order Form", font: "Arial", size: 20, color: "666666" }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
              spacing: { before: 100 },
              children: [
                new TextRun({ text: "Confidential \u2014 SafetyIQ, Inc.  |  Page ", font: "Arial", size: 18, color: "999999" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" }),
              ],
            }),
          ],
        }),
      },
      children: [
        // Title
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "SaaS Software Order Form", font: "Arial", size: 36, bold: true, color: "1a2540" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: `Date: ${today}`, font: "Arial", size: 22, color: "666666" })] }),
 
        // Customer Info
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Customer Information", font: "Arial" })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Company: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: customer.company || "\u2014", font: "Arial", size: 22 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Contact: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: customer.contact || "\u2014", font: "Arial", size: 22 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Email: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: customer.email || "\u2014", font: "Arial", size: 22 })] }),
        ...(customer.phone ? [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Phone: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: customer.phone, font: "Arial", size: 22 })] })] : []),
        ...((customer.city || customer.state) ? [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Address: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: [customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(", "), font: "Arial", size: 22 })] })] : []),
        ...(customer.employees ? [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Employees: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: customer.employees, font: "Arial", size: 22 })] })] : []),
 
        // Plan Config
        new Paragraph({ spacing: { before: 300 }, children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Plan Configuration", font: "Arial" })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Contract Term: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: TERMS.find(t => t.id === term)?.label || "", font: "Arial", size: 22 })] }),
 
        // Line Items
        new Paragraph({ spacing: { before: 300 }, children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Line Items", font: "Arial" })] }),
        lineItemsTable,
 
        // Pricing Summary
        new Paragraph({ spacing: { before: 400 }, children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Pricing Summary", font: "Arial" })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Annual Recurring Revenue (ARR): ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: fmt(annualTotal), font: "Arial", size: 22, bold: true, color: "0D8050" })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Monthly: ", bold: true, font: "Arial", size: 22 }), new TextRun({ text: fmt(monthlyTotal), font: "Arial", size: 22 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `Total Contract Value (${termMonths / 12}yr): `, bold: true, font: "Arial", size: 22 }), new TextRun({ text: fmt(totalContractValue), font: "Arial", size: 22 })] }),
        ...(prorationCalc ? [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `Year 1 Prorated (${prorationCalc.daysToRenewal} days): `, bold: true, font: "Arial", size: 22, color: "78550A" }), new TextRun({ text: fmt(prorationCalc.year1Prorated), font: "Arial", size: 22, bold: true, color: "78550A" })] })] : []),
 
        // Proration schedule
        ...prorationSection,
 
        // Notes
        ...(customer.notes ? [
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Notes", font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: customer.notes, font: "Arial", size: 22, color: "444444" })] }),
        ] : []),
 
        // Signatures
        new Paragraph({ spacing: { before: 600 }, children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Authorization & Signatures", font: "Arial" })] }),
        new Paragraph({ spacing: { before: 100, after: 40 }, children: [new TextRun({ text: "By signing below, the parties agree to the terms outlined in this order form. Final pricing and terms are subject to the execution of a formal SaaS agreement.", font: "Arial", size: 20, italics: true, color: "666666" })] }),
 
        // SafetyIQ signature
        new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "SafetyIQ, Inc.", font: "Arial", size: 22, bold: true })] }),
        sigLine,
        new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "Gary Warzynski, Authorized Signatory", font: "Arial", size: 20, color: "444444" })] }),
        new Paragraph({ children: [new TextRun({ text: "Date: ________________________", font: "Arial", size: 20, color: "999999" })] }),
 
        // Customer signature
        new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: customer.company || "Customer", font: "Arial", size: 22, bold: true })] }),
        sigLine,
        new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: `${customer.contact || "Authorized Representative"}, ${customer.company || "Customer"}`, font: "Arial", size: 20, color: "444444" })] }),
        new Paragraph({ children: [new TextRun({ text: "Date: ________________________", font: "Arial", size: 20, color: "999999" })] }),
      ],
    }],
  });
 
  return doc;
}
 
export default function SafetyIQOrderForm() {
  const [step, setStep] = useState(0);
  const [selectedModules, setSelectedModules] = useState({});
  const [customItems, setCustomItems] = useState({});
  const [term, setTerm] = useState(36);
  const [expandedProduct, setExpandedProduct] = useState("safetyIndicators");
  const [customer, setCustomer] = useState({ company: "", contact: "", email: "", phone: "", employees: "", address: "", city: "", state: "", zip: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [animIn, setAnimIn] = useState(true);
  const [generating, setGenerating] = useState(false);
 
  // Coterminus proration
  const [prorationEnabled, setProrationEnabled] = useState(false);
  const [newServiceStart, setNewServiceStart] = useState(() => new Date().toISOString().split("T")[0]);
  const [annualRenewalDate, setAnnualRenewalDate] = useState("");
  const [existingContractEnd, setExistingContractEnd] = useState("");
  const [existingARR, setExistingARR] = useState(0);
  const [annualEscalator, setAnnualEscalator] = useState(3);
 
  const topRef = useRef(null);
 
  /* ── Module selection with discount ── */
  const toggleModule = (id) => {
    setSelectedModules((prev) => {
      const next = { ...prev };
      if (next[id]) { delete next[id]; }
      else {
        for (const prod of Object.values(PRODUCTS)) {
          const mod = prod.modules.find((m) => m.id === id);
          if (mod) { next[id] = { ...mod, discount: 0 }; break; }
        }
      }
      return next;
    });
  };
 
  const setModuleDiscount = (id, disc) => {
    setSelectedModules((prev) => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], discount: Math.min(100, Math.max(0, parseFloat(disc) || 0)) } };
    });
  };
 
  /* ── Custom line items ── */
  const addCustomItem = (prodKey) => {
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setCustomItems((prev) => ({ ...prev, [prodKey]: [...(prev[prodKey] || []), { id, name: "", price: 0, desc: "", discount: 0 }] }));
  };
  const updateCustomItem = (prodKey, idx, field, value) => {
    setCustomItems((prev) => {
      const arr = [...(prev[prodKey] || [])];
      if (field === "price") arr[idx] = { ...arr[idx], price: parseFloat(value) || 0 };
      else if (field === "discount") arr[idx] = { ...arr[idx], discount: Math.min(100, Math.max(0, parseFloat(value) || 0)) };
      else arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [prodKey]: arr };
    });
  };
  const removeCustomItem = (prodKey, idx) => {
    setCustomItems((prev) => {
      const arr = [...(prev[prodKey] || [])];
      arr.splice(idx, 1);
      return { ...prev, [prodKey]: arr };
    });
  };
 
  /* ── Calculations ── */
  const selectedCount = Object.keys(selectedModules).length;
  const allCustomItems = Object.values(customItems).flat().filter((c) => c.name && c.price > 0);
 
  const moduleItems = Object.values(selectedModules).map((m) => {
    const listPrice = m.price;
    const netPrice = listPrice * (1 - m.discount / 100);
    return { ...m, listPrice, netPrice };
  });
  const moduleSubtotal = moduleItems.reduce((s, m) => s + m.netPrice, 0);
 
  const customItemsCalc = allCustomItems.map((c) => {
    const netPrice = c.price * (1 - c.discount / 100);
    return { ...c, listPrice: c.price, netPrice };
  });
  const customSubtotal = customItemsCalc.reduce((s, c) => s + c.netPrice, 0);
 
  const annualTotal = moduleSubtotal + customSubtotal;
  const monthlyTotal = annualTotal / 12;
  const termMonths = term;
  const termYears = termMonths / 12;
  const totalContractValue = annualTotal * termYears;
 
  /* ── Coterminus Proration ── */
  let prorationCalc = null;
  if (prorationEnabled && newServiceStart && annualRenewalDate) {
    const daysToRenewal = daysBetween(newServiceStart, annualRenewalDate);
    const fullPeriod = 365;
    const proFactor = daysToRenewal > 0 ? Math.min(1, daysToRenewal / fullPeriod) : 1;
    const year1Prorated = annualTotal * proFactor;
    const schedule = [];
    const contractEndD = existingContractEnd ? new Date(existingContractEnd + "T00:00:00") : null;
 
    schedule.push({
      year: 1, label: "Year 1 (Prorated)", periodStart: newServiceStart, periodEnd: annualRenewalDate,
      days: Math.max(0, daysToRenewal), safetyIQFee: year1Prorated, existingFee: 0, total: year1Prorated, isProrated: true,
    });
 
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
 
        schedule.push({
          year: yearNum, label: isPartial ? `Year ${yearNum} (Partial)` : `Year ${yearNum}`,
          periodStart: dateStr(periodStart), periodEnd: dateStr(periodEnd), days: periodDays,
          safetyIQFee: siqFee, existingFee: existingARR > 0 ? existingFee : 0,
          total: siqFee + (existingARR > 0 ? existingFee : 0), isProrated: isPartial,
        });
        currentRenewal = nextRenewal;
        yearNum++;
      }
    }
 
    const totalAllYears = schedule.reduce((s, y) => s + y.total, 0);
    prorationCalc = { proFactor, year1Prorated, schedule, totalAllYears, daysToRenewal, fullPeriod };
  }
 
  const hasItems = selectedCount > 0 || allCustomItems.length > 0;
 
  const goStep = (s) => {
    setAnimIn(false);
    setTimeout(() => { setStep(s); setAnimIn(true); }, 220);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };
 
  const handleSubmit = () => {
    setAnimIn(false);
    setTimeout(() => { setSubmitted(true); setAnimIn(true); }, 220);
  };
 
  const generateDocx = async () => {
    setGenerating(true);
    try {
      const doc = buildOrderDocx({
        customer, term, termMonths, moduleItems, customItemsCalc, moduleSubtotal, customSubtotal,
        annualTotal, monthlyTotal, totalContractValue, prorationCalc, existingARR, newServiceStart,
        annualRenewalDate, existingContractEnd, annualEscalator,
      });
      const buffer = await Packer.toBlob(doc);
      const filename = `SafetyIQ_Order_${customer.company ? customer.company.replace(/[^a-zA-Z0-9]/g, "_") : "Form"}_${new Date().toISOString().split("T")[0]}.docx`;
      saveAs(buffer, filename);
    } catch (err) {
      console.error("Error generating document:", err);
      alert("There was an error generating the document. Please try again.");
    }
    setGenerating(false);
  };
 
  const stepTitles = ["Select Modules", "Configure Plan", "Customer Details", "Review & Submit"];
 
  /* ── Discount input (inline) ── */
  const DiscountBadge = ({ value, onChange }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
      <div style={{ position: "relative", width: 56 }}>
        <input
          type="number" min="0" max="100" step="1" value={value || ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => { e.stopPropagation(); onChange(e.target.value); }}
          placeholder="0"
          style={{
            width: "100%", boxSizing: "border-box", padding: "5px 20px 5px 8px", borderRadius: 6,
            border: value > 0 ? "1px solid rgba(239,68,68,0.4)" : "1px solid #263352",
            background: value > 0 ? "rgba(239,68,68,0.08)" : "rgba(10,15,30,0.4)",
            color: value > 0 ? "#f87171" : "#6b7fa3", fontSize: 12, outline: "none",
            fontFamily: "inherit", textAlign: "right", fontWeight: 600,
          }}
        />
        <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: value > 0 ? "#f87171" : "#506480", pointerEvents: "none", fontWeight: 600 }}>%</span>
      </div>
    </div>
  );
 
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(165deg, #0a0f1a 0%, #0d1927 40%, #0f1f30 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#cfd8e8", padding: 0, position: "relative", overflow: "hidden",
    }}>
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
                <div onClick={() => i < step && goStep(i)} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: i <= step ? "linear-gradient(135deg, #2563eb, #0ea578)" : "#1a2540",
                  border: i <= step ? "none" : "2px solid #263352",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: i <= step ? "#fff" : "#4a5a7a",
                  transition: "all 0.3s ease", cursor: i < step ? "pointer" : "default",
                  boxShadow: i === step ? "0 0 16px rgba(37,99,235,0.4)" : "none",
                }}>{i < step ? <CheckIcon /> : i + 1}</div>
                <span style={{ fontSize: 11, marginTop: 8, color: i <= step ? "#8ea4c8" : "#3a4a68", fontWeight: i === step ? 600 : 400, whiteSpace: "nowrap" }}>{t}</span>
              </div>
            ))}
          </div>
        )}
 
        <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(12px)", transition: "all 0.25s ease" }}>
 
          {/* ═══ SUBMITTED ═══ */}
          {submitted ? (
            <div style={{ textAlign: "center", padding: "50px 20px" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #0ea578, #2563eb)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 24, boxShadow: "0 8px 32px rgba(14,165,120,0.3)" }}>✓</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: "#f0f4fa", margin: "0 0 12px" }}>Order Submitted</h2>
              <p style={{ color: "#6b7fa3", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.7 }}>Your SafetyIQ order has been received. A member of our team will reach out within 1 business day.</p>
              <div style={{ background: "rgba(14,165,120,0.08)", border: "1px solid rgba(14,165,120,0.2)", borderRadius: 12, padding: "20px 28px", display: "inline-block", textAlign: "left" }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: "#6b7fa3" }}>SafetyIQ New ARR</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0ea578" }}>
                  {fmt(annualTotal)}<span style={{ fontSize: 13, fontWeight: 400, color: "#6b7fa3" }}>/year</span>
                </p>
                {prorationCalc && (
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#d4a82a" }}>
                    Year 1 prorated: {fmt(prorationCalc.year1Prorated)}
                  </p>
                )}
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8ea4c8" }}>
                  {selectedCount + allCustomItems.length} item{(selectedCount + allCustomItems.length) !== 1 ? "s" : ""} · {TERMS.find(t => t.id === term)?.label}
                </p>
              </div>
              <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 12 }}>
                <button onClick={generateDocx} disabled={generating} style={{
                  ...btnPrimary, padding: "12px 28px", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8, opacity: generating ? 0.6 : 1,
                }}><DocIcon /> {generating ? "Generating..." : "Generate Word Document"}</button>
              </div>
              <p style={{ fontSize: 13, color: "#4a5a68", marginTop: 20 }}>Questions? Contact <span style={{ color: "#8ea4c8" }}>ryan.pollard@safetyiq.com</span></p>
            </div>
 
          /* ═══ STEP 0: MODULES ═══ */
          ) : step === 0 ? (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0f4fa", margin: "0 0 6px", textAlign: "center" }}>Choose Your Modules</h2>
              <p style={{ textAlign: "center", color: "#6b7fa3", margin: "0 0 28px", fontSize: 14 }}>Select modules, set per-item discounts, and add custom line items</p>
 
              {Object.entries(PRODUCTS).map(([key, prod]) => {
                const isOpen = expandedProduct === key;
                const prodSelectedCount = prod.modules.filter(m => selectedModules[m.id]).length;
                const prodCustomCount = (customItems[key] || []).filter(c => c.name).length;
                const totalForProd = prodSelectedCount + prodCustomCount;
                return (
                  <div key={key} style={{ ...cardStyle, padding: 0, overflow: "hidden", borderColor: totalForProd > 0 ? "rgba(37,99,235,0.3)" : "#1a2540" }}>
                    <div onClick={() => setExpandedProduct(isOpen ? null : key)} style={{ padding: "18px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ fontSize: 28 }}>{prod.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: "#f0f4fa", fontSize: 16 }}>{prod.name}</div>
                          <div style={{ fontSize: 12, color: "#6b7fa3", marginTop: 2 }}>{prod.tagline}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {totalForProd > 0 && <span style={{ background: "linear-gradient(135deg, #2563eb, #0ea578)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#fff" }}>{totalForProd}</span>}
                        <ChevronDown open={isOpen} />
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 24px 24px" }}>
                        <p style={{ fontSize: 13, color: "#6b7fa3", margin: "0 0 16px" }}>{prod.description}</p>
                        <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
                          {prod.modules.map((mod) => {
                            const sel = !!selectedModules[mod.id];
                            const disc = sel ? selectedModules[mod.id].discount : 0;
                            const listPrice = mod.price;
                            const netPrice = listPrice * (1 - disc / 100);
                            return (
                              <div key={mod.id} style={{
                                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                                background: sel ? "rgba(37,99,235,0.08)" : "rgba(20,30,55,0.5)",
                                border: `1px solid ${sel ? "rgba(37,99,235,0.35)" : "#1a2540"}`, transition: "all 0.2s ease",
                              }}>
                                <div onClick={() => toggleModule(mod.id)} style={{
                                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                                  background: sel ? "linear-gradient(135deg, #2563eb, #0ea578)" : "transparent",
                                  border: sel ? "none" : "2px solid #34405a",
                                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", color: "#fff",
                                }}>{sel && <CheckIcon />}</div>
                                <div onClick={() => toggleModule(mod.id)} style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 600, fontSize: 14, color: sel ? "#dce6f5" : "#a0b0c8" }}>{mod.name}</div>
                                  <div style={{ fontSize: 12, color: "#506480", marginTop: 2 }}>{mod.desc}</div>
                                </div>
                                {sel && <DiscountBadge value={disc} onChange={(v) => setModuleDiscount(mod.id, v)} />}
                                <div onClick={() => toggleModule(mod.id)} style={{ textAlign: "right", flexShrink: 0, minWidth: 80 }}>
                                  {sel && disc > 0 ? (
                                    <>
                                      <div style={{ fontSize: 11, color: "#506480", textDecoration: "line-through" }}>{fmtWhole(listPrice)}</div>
                                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0ea578" }}>{fmt(netPrice)}<span style={{ fontSize: 11, fontWeight: 400 }}>/yr</span></div>
                                    </>
                                  ) : (
                                    <div style={{ fontWeight: 700, fontSize: 14, color: sel ? "#0ea578" : "#4a5a7a" }}>{fmtWhole(mod.price)}<span style={{ fontSize: 11, fontWeight: 400 }}>/yr</span></div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Custom line items */}
                        <div style={{ borderTop: "1px solid #1a2540", paddingTop: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#8ea4c8", textTransform: "uppercase", letterSpacing: 1 }}>Custom Line Items</span>
                            <button onClick={() => addCustomItem(key)} style={{
                              display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
                              borderRadius: 8, border: "1px dashed #2563eb", background: "rgba(37,99,235,0.06)",
                              color: "#4d8ef7", fontSize: 13, fontWeight: 600, cursor: "pointer",
                            }}><PlusIcon /> Add Item</button>
                          </div>
                          {(customItems[key] || []).map((item, idx) => (
                            <div key={item.id} style={{
                              display: "grid", gridTemplateColumns: "1fr 1fr 100px 60px 32px", gap: 8, alignItems: "end", marginBottom: 10,
                              background: "rgba(20,30,55,0.5)", padding: "12px 14px", borderRadius: 10, border: "1px solid #1a2540",
                            }}>
                              <div>
                                <label style={labelStyle}>Item Name</label>
                                <input value={item.name} onChange={(e) => updateCustomItem(key, idx, "name", e.target.value)} placeholder="e.g., Implementation" style={inputStyle} />
                              </div>
                              <div>
                                <label style={labelStyle}>Description</label>
                                <input value={item.desc} onChange={(e) => updateCustomItem(key, idx, "desc", e.target.value)} placeholder="Optional" style={inputStyle} />
                              </div>
                              <div>
                                <label style={labelStyle}>Annual Fee</label>
                                <div style={{ position: "relative" }}>
                                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#506480", fontSize: 14 }}>$</span>
                                  <input type="number" value={item.price || ""} onChange={(e) => updateCustomItem(key, idx, "price", e.target.value)} placeholder="0" style={{ ...inputStyle, paddingLeft: 22 }} />
                                </div>
                              </div>
                              <div>
                                <label style={labelStyle}>Disc %</label>
                                <input type="number" min="0" max="100" value={item.discount || ""} onChange={(e) => updateCustomItem(key, idx, "discount", e.target.value)} placeholder="0"
                                  style={{ ...inputStyle, textAlign: "center", padding: "11px 6px", color: item.discount > 0 ? "#f87171" : "#dce6f5", borderColor: item.discount > 0 ? "rgba(239,68,68,0.3)" : "#263352" }} />
                              </div>
                              <button onClick={() => removeCustomItem(key, idx)} style={{
                                width: 32, height: 38, borderRadius: 8, border: "1px solid #3a2030",
                                background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}><TrashIcon /></button>
                            </div>
                          ))}
                          {(customItems[key] || []).length === 0 && (
                            <p style={{ fontSize: 13, color: "#3a4a68", margin: "4px 0 0", fontStyle: "italic" }}>No custom items — click "Add Item" to create one.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
 
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                <button onClick={() => hasItems && goStep(1)} disabled={!hasItems} style={{ ...btnPrimary, opacity: hasItems ? 1 : 0.4, cursor: hasItems ? "pointer" : "not-allowed" }}>
                  Continue — {selectedCount + allCustomItems.length} item{(selectedCount + allCustomItems.length) !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
 
          /* ═══ STEP 1: CONFIGURE ═══ */
          ) : step === 1 ? (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0f4fa", margin: "0 0 6px", textAlign: "center" }}>Configure Your Plan</h2>
              <p style={{ textAlign: "center", color: "#6b7fa3", margin: "0 0 28px", fontSize: 14 }}>Set contract term and coterminus proration</p>
 
              {/* Term */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: 13, color: "#8ea4c8", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Contract Term</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {TERMS.map((t) => (
                    <div key={t.id} onClick={() => setTerm(t.id)} style={{
                      padding: "16px 14px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                      background: term === t.id ? "rgba(14,165,120,0.1)" : "rgba(20,30,55,0.5)",
                      border: `2px solid ${term === t.id ? "#0ea578" : "#1a2540"}`, transition: "all 0.2s",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: term === t.id ? "#f0f4fa" : "#6b7fa3" }}>{t.label}</div>
                      <div style={{ fontSize: 12, color: "#506480", marginTop: 4 }}>{t.id / 12} year{t.id > 12 ? "s" : ""}</div>
                    </div>
                  ))}
                </div>
              </div>
 
              {/* Coterminus Proration */}
              <div style={{ ...cardStyle, borderColor: prorationEnabled ? "rgba(251,191,36,0.3)" : "#1a2540" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: prorationEnabled ? 18 : 0 }}>
                  <div>
                    <h3 style={{ fontSize: 13, color: "#8ea4c8", margin: 0, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Coterminus Proration</h3>
                    <p style={{ fontSize: 12, color: "#506480", margin: "4px 0 0" }}>Align new services with an existing contract's annual billing cycle</p>
                  </div>
                  <div onClick={() => setProrationEnabled(!prorationEnabled)} style={{
                    width: 48, height: 26, borderRadius: 13, cursor: "pointer", position: "relative",
                    background: prorationEnabled ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#263352", transition: "background 0.3s",
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: prorationEnabled ? 25 : 3, transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                  </div>
                </div>
                {prorationEnabled && (
                  <div>
                    <div style={{ background: "rgba(251,191,36,0.04)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, border: "1px solid rgba(251,191,36,0.1)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <InfoIcon />
                      <span style={{ fontSize: 12, color: "#b08d28", lineHeight: 1.5 }}>
                        Year 1 is prorated from the new service start date to the next annual renewal. Year 2+ bills the full SafetyIQ ARR plus the existing contract fee with the annual escalator applied.
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={labelStyle}>New Service Start Date</label>
                        <input type="date" value={newServiceStart} onChange={(e) => setNewServiceStart(e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Next Annual Renewal Date</label>
                        <input type="date" value={annualRenewalDate} onChange={(e) => setAnnualRenewalDate(e.target.value)} style={inputStyle} />
                        <span style={{ fontSize: 11, color: "#506480", marginTop: 4, display: "block" }}>When the existing annual fee is next due</span>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Master Contract End Date</label>
                        <input type="date" value={existingContractEnd} onChange={(e) => setExistingContractEnd(e.target.value)} style={inputStyle} />
                        <span style={{ fontSize: 11, color: "#506480", marginTop: 4, display: "block" }}>End of 36 or 60 month term</span>
                      </div>
                      <div>
                        <label style={labelStyle}>Existing Contract ARR</label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#506480", fontSize: 14 }}>$</span>
                          <input type="number" value={existingARR || ""} onChange={(e) => setExistingARR(parseFloat(e.target.value) || 0)} placeholder="0" style={{ ...inputStyle, paddingLeft: 24 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#506480", marginTop: 4, display: "block" }}>Current annual fee for existing services</span>
                      </div>
                      <div>
                        <label style={labelStyle}>Annual Escalator (%)</label>
                        <div style={{ position: "relative" }}>
                          <input type="number" min="0" max="25" step="0.5" value={annualEscalator} onChange={(e) => setAnnualEscalator(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, paddingRight: 28 }} />
                          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#506480", fontSize: 14 }}>%</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#506480", marginTop: 4, display: "block" }}>Applied to existing contract each year</span>
                      </div>
                    </div>
 
                    {/* Proration Preview */}
                    {prorationCalc && (
                      <div style={{ marginTop: 20, background: "rgba(251,191,36,0.06)", borderRadius: 10, padding: "16px 18px", border: "1px solid rgba(251,191,36,0.15)" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#d4a82a", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Payment Schedule Preview</div>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                              <tr style={{ borderBottom: "1px solid rgba(251,191,36,0.2)" }}>
                                <th style={{ textAlign: "left", padding: "8px 10px", color: "#b08d28", fontWeight: 600 }}>Period</th>
                                <th style={{ textAlign: "center", padding: "8px 6px", color: "#b08d28", fontWeight: 600 }}>Days</th>
                                <th style={{ textAlign: "right", padding: "8px 10px", color: "#b08d28", fontWeight: 600 }}>SafetyIQ Fee</th>
                                {existingARR > 0 && <th style={{ textAlign: "right", padding: "8px 10px", color: "#b08d28", fontWeight: 600 }}>Existing Contract</th>}
                                <th style={{ textAlign: "right", padding: "8px 10px", color: "#b08d28", fontWeight: 600 }}>Total Due</th>
                              </tr>
                            </thead>
                            <tbody>
                              {prorationCalc.schedule.map((yr) => (
                                <tr key={yr.year} style={{ borderBottom: "1px solid rgba(251,191,36,0.08)" }}>
                                  <td style={{ padding: "8px 10px", color: "#dce6f5" }}>
                                    <div style={{ fontWeight: 600 }}>{yr.label}</div>
                                    <div style={{ fontSize: 11, color: "#506480" }}>{yr.periodStart} → {yr.periodEnd}</div>
                                  </td>
                                  <td style={{ textAlign: "center", padding: "8px 6px", color: yr.isProrated ? "#d4a82a" : "#8ea4c8" }}>{yr.days}</td>
                                  <td style={{ textAlign: "right", padding: "8px 10px", color: yr.isProrated ? "#d4a82a" : "#8ea4c8", fontWeight: 600 }}>{fmt(yr.safetyIQFee)}</td>
                                  {existingARR > 0 && <td style={{ textAlign: "right", padding: "8px 10px", color: "#8ea4c8" }}>{yr.existingFee > 0 ? fmt(yr.existingFee) : "—"}</td>}
                                  <td style={{ textAlign: "right", padding: "8px 10px", color: "#f0f4fa", fontWeight: 700 }}>{fmt(yr.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr style={{ borderTop: "2px solid rgba(251,191,36,0.3)" }}>
                                <td colSpan={existingARR > 0 ? 4 : 3} style={{ padding: "10px 10px", color: "#d4a82a", fontWeight: 700 }}>Total Contract Value</td>
                                <td style={{ textAlign: "right", padding: "10px 10px", color: "#d4a82a", fontWeight: 800, fontSize: 15 }}>{fmt(prorationCalc.totalAllYears)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
 
              {/* Pricing summary */}
              <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(14,165,120,0.06))", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 14, padding: 24 }}>
                {moduleItems.filter(m => m.discount > 0).length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Line Item Discounts Applied</div>
                    {moduleItems.filter(m => m.discount > 0).map(m => (
                      <div key={m.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0" }}>
                        <span style={{ color: "#a0b0c8" }}>{m.name} <span style={{ color: "#f87171" }}>(-{m.discount}%)</span></span>
                        <span style={{ color: "#6b7fa3" }}><span style={{ textDecoration: "line-through", marginRight: 8 }}>{fmt(m.listPrice)}</span>{fmt(m.netPrice)}</span>
                      </div>
                    ))}
                    {customItemsCalc.filter(c => c.discount > 0).map(c => (
                      <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0" }}>
                        <span style={{ color: "#a0b0c8" }}>{c.name} <span style={{ color: "#f87171" }}>(-{c.discount}%)</span></span>
                        <span style={{ color: "#6b7fa3" }}><span style={{ textDecoration: "line-through", marginRight: 8 }}>{fmt(c.listPrice)}</span>{fmt(c.netPrice)}</span>
                      </div>
                    ))}
                    <div style={{ borderBottom: "1px solid #1a2540", marginTop: 10 }} />
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#6b7fa3", fontSize: 14 }}>Modules ({selectedCount})</span>
                  <span style={{ color: "#8ea4c8", fontWeight: 600 }}>{fmt(moduleSubtotal)}/yr</span>
                </div>
                {customSubtotal > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#6b7fa3", fontSize: 14 }}>Custom items ({allCustomItems.length})</span>
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
 
          /* ═══ STEP 2: CUSTOMER ═══ */
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
                    {group.row.map((f) => (
                      <div key={f.key}>
                        <label style={labelStyle}>{f.label}{f.required && <span style={{ color: "#ef4444" }}> *</span>}</label>
                        <input type={f.type || "text"} value={customer[f.key]} onChange={(e) => setCustomer({ ...customer, [f.key]: e.target.value })} style={inputStyle}
                          onFocus={(e) => e.target.style.borderColor = "#2563eb"} onBlur={(e) => e.target.style.borderColor = "#263352"} />
                      </div>
                    ))}
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>Notes / Special Requirements</label>
                  <textarea value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} rows={3}
                    style={{ ...inputStyle, resize: "vertical" }} onFocus={(e) => e.target.style.borderColor = "#2563eb"} onBlur={(e) => e.target.style.borderColor = "#263352"} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button onClick={() => goStep(1)} style={btnBack}>Back</button>
                <button onClick={() => customer.company && customer.contact && customer.email ? goStep(3) : null}
                  disabled={!customer.company || !customer.contact || !customer.email}
                  style={{ ...btnPrimary, opacity: customer.company && customer.contact && customer.email ? 1 : 0.4, cursor: customer.company && customer.contact && customer.email ? "pointer" : "not-allowed" }}>Continue</button>
              </div>
            </div>
 
          /* ═══ STEP 3: REVIEW ═══ */
          ) : (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0f4fa", margin: "0 0 6px", textAlign: "center" }}>Review Your Order</h2>
              <p style={{ textAlign: "center", color: "#6b7fa3", margin: "0 0 28px", fontSize: 14 }}>Verify all details before submitting</p>
 
              {/* Customer */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: 13, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 12px", fontWeight: 600 }}>Customer</h3>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f4fa" }}>{customer.company}</div>
                <div style={{ fontSize: 14, color: "#8ea4c8", marginTop: 4 }}>{customer.contact} · {customer.email}</div>
                {customer.phone && <div style={{ fontSize: 13, color: "#6b7fa3", marginTop: 2 }}>{customer.phone}</div>}
                {(customer.city || customer.state) && <div style={{ fontSize: 13, color: "#6b7fa3", marginTop: 2 }}>{[customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(", ")}</div>}
                {customer.employees && <div style={{ fontSize: 13, color: "#6b7fa3", marginTop: 2 }}>{customer.employees} employees</div>}
              </div>
 
              {/* Line items table */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: 13, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 12px", fontWeight: 600 }}>Line Items</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1a2540" }}>
                        <th style={{ textAlign: "left", padding: "8px 8px", color: "#6b7fa3", fontWeight: 600 }}>Item</th>
                        <th style={{ textAlign: "right", padding: "8px 8px", color: "#6b7fa3", fontWeight: 600 }}>List Price</th>
                        <th style={{ textAlign: "center", padding: "8px 8px", color: "#6b7fa3", fontWeight: 600 }}>Disc</th>
                        <th style={{ textAlign: "right", padding: "8px 8px", color: "#6b7fa3", fontWeight: 600 }}>Net Annual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moduleItems.map((m) => (
                        <tr key={m.id} style={{ borderBottom: "1px solid #141e35" }}>
                          <td style={{ padding: "8px 8px", color: "#cfd8e8" }}>{m.name}</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#6b7fa3" }}>{fmt(m.listPrice)}</td>
                          <td style={{ textAlign: "center", padding: "8px 8px", color: m.discount > 0 ? "#f87171" : "#3a4a68" }}>{m.discount > 0 ? `-${m.discount}%` : "—"}</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#8ea4c8", fontWeight: 600 }}>{fmt(m.netPrice)}</td>
                        </tr>
                      ))}
                      {customItemsCalc.map((c) => (
                        <tr key={c.id} style={{ borderBottom: "1px solid #141e35" }}>
                          <td style={{ padding: "8px 8px" }}>
                            <span style={{ color: "#d4a82a" }}>{c.name}</span>
                            {c.desc && <span style={{ color: "#506480", fontSize: 11, marginLeft: 6 }}>— {c.desc}</span>}
                          </td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#6b7fa3" }}>{fmt(c.listPrice)}</td>
                          <td style={{ textAlign: "center", padding: "8px 8px", color: c.discount > 0 ? "#f87171" : "#3a4a68" }}>{c.discount > 0 ? `-${c.discount}%` : "—"}</td>
                          <td style={{ textAlign: "right", padding: "8px 8px", color: "#d4a82a", fontWeight: 600 }}>{fmt(c.netPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: "2px solid #263352" }}>
                        <td colSpan={3} style={{ padding: "10px 8px", color: "#f0f4fa", fontWeight: 700 }}>Annual Total</td>
                        <td style={{ textAlign: "right", padding: "10px 8px", color: "#0ea578", fontWeight: 800, fontSize: 16 }}>{fmt(annualTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
 
              {/* Plan */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: 13, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 12px", fontWeight: 600 }}>Plan Configuration</h3>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b7fa3" }}>Term</span><span style={{ color: "#cfd8e8", fontWeight: 600 }}>{TERMS.find(t => t.id === term)?.label}</span>
                </div>
              </div>
 
              {/* Proration schedule */}
              {prorationCalc && (
                <div style={{ ...cardStyle, borderColor: "rgba(251,191,36,0.3)" }}>
                  <h3 style={{ fontSize: 13, color: "#d4a82a", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 14px", fontWeight: 600 }}>Coterminus Payment Schedule</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(251,191,36,0.2)" }}>
                          <th style={{ textAlign: "left", padding: "8px 8px", color: "#b08d28", fontWeight: 600 }}>Period</th>
                          <th style={{ textAlign: "center", padding: "8px 6px", color: "#b08d28", fontWeight: 600 }}>Days</th>
                          <th style={{ textAlign: "right", padding: "8px 8px", color: "#b08d28", fontWeight: 600 }}>SafetyIQ</th>
                          {existingARR > 0 && <th style={{ textAlign: "right", padding: "8px 8px", color: "#b08d28", fontWeight: 600 }}>Existing + Esc.</th>}
                          <th style={{ textAlign: "right", padding: "8px 8px", color: "#b08d28", fontWeight: 600 }}>Total Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prorationCalc.schedule.map((yr) => (
                          <tr key={yr.year} style={{ borderBottom: "1px solid rgba(251,191,36,0.08)" }}>
                            <td style={{ padding: "8px 8px", color: "#dce6f5" }}>
                              <div style={{ fontWeight: 600 }}>{yr.label}</div>
                              <div style={{ fontSize: 11, color: "#506480" }}>{yr.periodStart} → {yr.periodEnd}</div>
                            </td>
                            <td style={{ textAlign: "center", padding: "8px 6px", color: yr.isProrated ? "#d4a82a" : "#8ea4c8" }}>{yr.days}</td>
                            <td style={{ textAlign: "right", padding: "8px 8px", color: yr.isProrated ? "#d4a82a" : "#8ea4c8", fontWeight: 600 }}>{fmt(yr.safetyIQFee)}</td>
                            {existingARR > 0 && <td style={{ textAlign: "right", padding: "8px 8px", color: "#8ea4c8" }}>{yr.existingFee > 0 ? fmt(yr.existingFee) : "—"}</td>}
                            <td style={{ textAlign: "right", padding: "8px 8px", color: "#f0f4fa", fontWeight: 700 }}>{fmt(yr.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: "2px solid rgba(251,191,36,0.3)" }}>
                          <td colSpan={existingARR > 0 ? 4 : 3} style={{ padding: "10px 8px", color: "#d4a82a", fontWeight: 700 }}>Total Contract Value</td>
                          <td style={{ textAlign: "right", padding: "10px 8px", color: "#d4a82a", fontWeight: 800, fontSize: 15 }}>{fmt(prorationCalc.totalAllYears)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
 
              {/* Total */}
              <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(14,165,120,0.08))", border: "1px solid rgba(37,99,235,0.25)", borderRadius: 14, padding: 24, textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "#6b7fa3", marginBottom: 8 }}>SafetyIQ Annual Recurring Revenue</div>
                <div style={{ fontSize: 38, fontWeight: 800, color: "#f0f4fa", fontFamily: "'Playfair Display', serif" }}>{fmt(annualTotal)}<span style={{ fontSize: 14, fontWeight: 400, color: "#6b7fa3" }}>/year</span></div>
                <div style={{ fontSize: 14, color: "#6b7fa3", marginTop: 4 }}>{fmt(monthlyTotal)}/month · {fmt(totalContractValue)} TCV</div>
                {prorationCalc && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed rgba(251,191,36,0.3)" }}>
                    <span style={{ fontSize: 14, color: "#d4a82a", fontWeight: 700 }}>Year 1 prorated: {fmt(prorationCalc.year1Prorated)} ({prorationCalc.daysToRenewal} days)</span>
                  </div>
                )}
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
                  <button onClick={generateDocx} disabled={generating} style={{
                    ...btnBack, display: "inline-flex", alignItems: "center", gap: 8,
                    borderColor: "#2563eb", color: "#4d8ef7", opacity: generating ? 0.6 : 1,
                  }}><DocIcon /> {generating ? "Generating..." : "Generate Word Doc"}</button>
                  <button onClick={handleSubmit} style={btnPrimary}
                    onMouseEnter={(e) => e.target.style.transform = "scale(1.03)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                  >Submit Order</button>
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
 