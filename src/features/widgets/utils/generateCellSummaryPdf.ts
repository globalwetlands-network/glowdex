import type { CellSummary } from './buildCellSummary';
import { ordinalSuffix } from './indicatorStats';

const BRAND_GREEN: [number, number, number] = [10, 92, 71]; // glowdex-green
const MARGIN = 48;
const LINE = 14;

function formatNumber(value: number): string {
  // Compact but precise: up to 4 dp, trailing zeros trimmed.
  return Number(value.toFixed(4)).toString();
}

/**
 * Renders a CellSummary to a PDF and triggers a browser download.
 *
 * jsPDF and jspdf-autotable are imported dynamically so they are
 * code-split out of the main bundle and only fetched when a user
 * actually exports a summary.
 */
export async function generateCellSummaryPdf(
  summary: CellSummary,
): Promise<void> {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  /** Adds a new page when the next block would overflow. */
  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const heading = (text: string) => {
    ensureSpace(LINE * 2);
    y += LINE * 0.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...BRAND_GREEN);
    doc.text(text, MARGIN, y);
    y += LINE;
  };

  const paragraph = (
    text: string,
    opts: {
      size?: number;
      color?: [number, number, number];
      italic?: boolean;
    } = {},
  ) => {
    const { size = 10, color = [40, 40, 40], italic = false } = opts;
    doc.setFont('helvetica', italic ? 'italic' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    for (const line of lines) {
      ensureSpace(LINE);
      doc.text(line, MARGIN, y);
      y += LINE;
    }
  };

  const labelValue = (label: string, value: string) => {
    ensureSpace(LINE);
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}: `, MARGIN, y);
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const valueLines = doc.splitTextToSize(
      value,
      contentWidth - labelWidth,
    ) as string[];
    doc.text(valueLines[0] ?? '', MARGIN + labelWidth, y);
    y += LINE;
    for (let i = 1; i < valueLines.length; i++) {
      ensureSpace(LINE);
      doc.text(valueLines[i], MARGIN + labelWidth, y);
      y += LINE;
    }
  };

  // --- Title ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...BRAND_GREEN);
  doc.text(`MBCAM Site Summary — Tile ${summary.location.tileId}`, MARGIN, y);
  y += LINE * 1.4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated ${summary.generatedDate}`, MARGIN, y);
  y += LINE;

  // --- Location ---
  heading('Location');
  labelValue(
    'Country',
    summary.location.iso3
      ? `${summary.location.country} (${summary.location.iso3})`
      : summary.location.country,
  );
  labelValue('Coordinates', summary.location.coordinates);
  labelValue('Tile ID', String(summary.location.tileId));

  // --- Typology ---
  heading('Typology');
  if (summary.typology.name) {
    labelValue(
      'Typology',
      `${summary.typology.number} — ${summary.typology.name}`,
    );
    if (summary.typology.description) {
      paragraph(summary.typology.description);
    }
  } else {
    labelValue('Typology', String(summary.typology.number));
    paragraph(
      'Full typology descriptions for the 18-typology scale are available ' +
        'in Sievers et al. (2021).',
      { italic: true, color: [110, 110, 110] },
    );
  }

  // --- Indicators ---
  heading('Indicators');
  if (!summary.hasMangrove) {
    paragraph(
      'No mangrove habitat is recorded for this tile, so statistical ' +
        'indicator comparisons are not available.',
      { italic: true, color: [110, 110, 110] },
    );
  } else if (summary.indicators.length === 0) {
    paragraph('No indicator statistics are available for this tile.', {
      italic: true,
      color: [110, 110, 110],
    });
  } else {
    paragraph(summary.caveat, { size: 9, color: [90, 90, 90], italic: true });
    y += LINE * 0.3;
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [['Indicator', 'Value', 'Percentile', 'Reading (within typology)']],
      body: summary.indicators.map((ind) => [
        ind.label,
        formatNumber(ind.value),
        ordinalSuffix(ind.percentile),
        ind.interpretation,
      ]),
      styles: { fontSize: 9, cellPadding: 4, textColor: [40, 40, 40] },
      headStyles: { fillColor: BRAND_GREEN, textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [244, 248, 246] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    });
    const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } })
      .lastAutoTable?.finalY;
    y = (finalY ?? y) + LINE;
  }

  // --- Species ---
  heading('Species recorded for the region');
  if (summary.species.length === 0) {
    paragraph('No species records are available for this region.', {
      italic: true,
      color: [110, 110, 110],
    });
  } else {
    for (const sp of summary.species) {
      labelValue(
        sp.commonName,
        `${sp.scientificName} — ${sp.conservationStatus} (IUCN)`,
      );
    }
  }

  // --- Local monitoring ---
  heading('Local monitoring data');
  const local = summary.localMonitoring;
  if (!local) {
    paragraph('No local field-monitoring data is associated with this tile.', {
      italic: true,
      color: [110, 110, 110],
    });
  } else {
    labelValue('Site', `${local.siteName}, ${local.country}`);
    labelValue('Partner', local.partner);
    labelValue('Most recent year', String(local.year));
    y += LINE * 0.3;
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [['Condition', 'Density', 'Std. error', 'Samples']],
      body: local.conditions.map((c) => [
        c.siteType,
        formatNumber(c.totalDensity),
        formatNumber(c.combinedSE),
        String(c.samplesN),
      ]),
      styles: { fontSize: 9, cellPadding: 4, textColor: [40, 40, 40] },
      headStyles: { fillColor: BRAND_GREEN, textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [244, 248, 246] },
    });
    const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } })
      .lastAutoTable?.finalY;
    y = (finalY ?? y) + LINE;
  }

  // --- Source / citation ---
  heading('Source');
  paragraph(summary.citation, { size: 8, color: [110, 110, 110] });

  doc.save(
    `MBCAM-summary-tile-${summary.location.tileId}-${summary.generatedDate}.pdf`,
  );
}
