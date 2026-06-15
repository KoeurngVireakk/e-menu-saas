export function paperWidthClass(size) {
  if (size === "58mm") return "max-w-[58mm]";
  if (size === "a4") return "max-w-[210mm]";
  return "max-w-[80mm]";
}

export const printStyles = `
  @media print {
    body * { visibility: hidden; }
    .print-surface, .print-surface * { visibility: visible; }
    .print-surface { position: absolute; left: 0; top: 0; width: var(--paper-width, 80mm); max-width: var(--paper-width, 80mm); box-shadow: none !important; border: 0 !important; }
    .no-print { display: none !important; }
    @page { margin: 4mm; }
  }
`;
