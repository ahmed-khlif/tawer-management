"use client";

type CsvValue = string | number | boolean | null | undefined | Date;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeCsvValue(value: CsvValue) {
  if (value instanceof Date) return value.toISOString();
  if (value === null || value === undefined) return "";
  return String(value);
}

function escapeCsvValue(value: CsvValue) {
  const normalized = normalizeCsvValue(value);
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function exportRowsToCsv(
  filename: string,
  columns: Array<{ key: string; label: string }>,
  rows: Array<Record<string, CsvValue>>,
) {
  const header = columns.map((column) => escapeCsvValue(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => escapeCsvValue(row[column.key])).join(","),
  );
  const csv = [header, ...body].join("\n");
  downloadBlob(
    filename,
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
  );
}

export function exportReportToPdfPrintWindow({
  title,
  subtitle,
  sections,
  filename,
}: {
  title: string;
  subtitle?: string;
  sections: Array<{
    title: string;
    rows: Array<{ label: string; value: string }>;
  }>;
  filename: string;
}) {
  const openedWindow = window.open("", "_blank", "noopener,noreferrer,width=1080,height=900");
  if (!openedWindow) return;

  const sectionsHtml = sections
    .map(
      (section) => `
        <section class="section">
          <h2>${escapeHtml(section.title)}</h2>
          <div class="grid">
            ${section.rows
              .map(
                (row) => `
                  <div class="row">
                    <div class="label">${escapeHtml(row.label)}</div>
                    <div class="value">${escapeHtml(row.value)}</div>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");

  openedWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(filename)}</title>
        <style>
          body {
            font-family: Inter, Arial, sans-serif;
            margin: 32px;
            color: #160a33;
            background: #ffffff;
          }
          .hero {
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            padding: 24px;
            margin-bottom: 24px;
            background: linear-gradient(135deg, rgba(22,10,51,0.06), rgba(255,255,255,1));
          }
          h1 {
            margin: 0 0 8px;
            font-size: 28px;
          }
          .subtitle {
            margin: 0;
            color: #5b6474;
            font-size: 14px;
          }
          .meta {
            margin-top: 10px;
            font-size: 12px;
            color: #6b7280;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .section {
            margin-bottom: 24px;
            break-inside: avoid;
          }
          .section h2 {
            font-size: 16px;
            margin: 0 0 12px;
          }
          .grid {
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            overflow: hidden;
          }
          .row {
            display: grid;
            grid-template-columns: minmax(180px, 220px) 1fr;
            gap: 16px;
            padding: 12px 14px;
            border-bottom: 1px solid #eef2f7;
          }
          .row:last-child {
            border-bottom: none;
          }
          .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #6b7280;
            font-weight: 600;
          }
          .value {
            font-size: 14px;
            line-height: 1.5;
            color: #101828;
            word-break: break-word;
          }
          @media print {
            body { margin: 18px; }
          }
        </style>
      </head>
      <body>
        <header class="hero">
          <h1>${escapeHtml(title)}</h1>
          ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
          <div class="meta">Generated ${new Date().toLocaleString()}</div>
        </header>
        ${sectionsHtml}
      </body>
    </html>
  `);
  openedWindow.document.close();
  openedWindow.focus();
  openedWindow.print();
}
