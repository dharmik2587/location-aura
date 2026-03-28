import { type SiteScore } from '@/engine/scoringEngine';
import { type UseCase, useCaseConfigs } from '@/data/syntheticData';
import jsPDF from 'jspdf';

export function exportPDF(lat: number, lng: number, score: SiteScore, useCase: UseCase) {
  const doc = new jsPDF();
  const config = useCaseConfigs[useCase];

  doc.setFillColor(15, 20, 35);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(200, 220, 240);
  doc.setFontSize(20);
  doc.text('GeoSpatial Site Readiness Report', 20, 25);

  doc.setFontSize(10);
  doc.setTextColor(120, 140, 170);
  doc.text('Prama Innovations — Location Intelligence Platform', 20, 33);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 39);

  doc.setDrawColor(40, 60, 90);
  doc.line(20, 44, 190, 44);

  doc.setTextColor(200, 220, 240);
  doc.setFontSize(14);
  doc.text('Site Overview', 20, 55);

  doc.setFontSize(10);
  doc.setTextColor(160, 180, 200);
  const yStart = 64;
  doc.text(`Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`, 20, yStart);
  doc.text(`Use Case: ${config.name} ${config.icon}`, 20, yStart + 7);
  doc.text(`Overall Score: ${score.total}/100 — ${score.label}`, 20, yStart + 14);

  doc.setFontSize(14);
  doc.setTextColor(200, 220, 240);
  doc.text('Layer Scores', 20, yStart + 28);

  const layers = [
    ['Demographics', score.breakdown.demographics],
    ['Transportation', score.breakdown.transportation],
    ['POI / Competitors', score.breakdown.poi],
    ['Land Use & Zoning', score.breakdown.landuse],
    ['Environmental', score.breakdown.environmental],
  ];

  doc.setFontSize(10);
  layers.forEach(([name, val], i) => {
    const y = yStart + 36 + i * 9;
    doc.setTextColor(160, 180, 200);
    doc.text(`${name}:`, 25, y);
    doc.setTextColor(100, 220, 220);
    doc.text(`${val}/100`, 90, y);

    // Bar
    doc.setFillColor(30, 40, 60);
    doc.rect(110, y - 3, 70, 4, 'F');
    const barColor = (val as number) >= 70 ? [52, 211, 153] : (val as number) >= 50 ? [34, 211, 238] : (val as number) >= 30 ? [251, 191, 36] : [248, 113, 113];
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.rect(110, y - 3, (val as number) * 0.7, 4, 'F');
  });

  const detailY = yStart + 36 + layers.length * 9 + 12;
  doc.setFontSize(14);
  doc.setTextColor(200, 220, 240);
  doc.text('Key Metrics', 20, detailY);

  doc.setFontSize(10);
  doc.setTextColor(160, 180, 200);
  const metrics = [
    ['Population Density', `${score.details.nearestPopDensity.toLocaleString()}/km²`],
    ['Median Income', `₹${(score.details.nearestIncome / 100000).toFixed(1)}L`],
    ['Catchment Population', score.details.catchmentPopulation.toLocaleString()],
    ['Competitors Nearby', score.details.competitorCount.toString()],
    ['Flood Risk', `${(score.details.floodRisk * 100).toFixed(0)}%`],
    ['Air Quality (AQI)', score.details.airQuality.toString()],
    ['Zoning Match', score.details.zoningMatch ? 'Yes' : 'No'],
  ];

  metrics.forEach(([label, value], i) => {
    const y = detailY + 8 + i * 7;
    doc.text(`${label}:`, 25, y);
    doc.setTextColor(100, 220, 220);
    doc.text(value, 90, y);
    doc.setTextColor(160, 180, 200);
  });

  doc.setFontSize(8);
  doc.setTextColor(80, 100, 130);
  doc.text('© Prama Innovations — GeoSpatial Site Readiness Analyzer', 20, 285);

  doc.save(`site-report-${lat.toFixed(3)}-${lng.toFixed(3)}.pdf`);
}

export function exportCSV(lat: number, lng: number, score: SiteScore, useCase: UseCase) {
  const config = useCaseConfigs[useCase];
  const rows = [
    ['Metric', 'Value'],
    ['Latitude', lat.toFixed(5)],
    ['Longitude', lng.toFixed(5)],
    ['Use Case', config.name],
    ['Overall Score', score.total.toString()],
    ['Rating', score.label],
    ['Demographics Score', score.breakdown.demographics.toString()],
    ['Transportation Score', score.breakdown.transportation.toString()],
    ['POI Score', score.breakdown.poi.toString()],
    ['Land Use Score', score.breakdown.landuse.toString()],
    ['Environmental Score', score.breakdown.environmental.toString()],
    ['Population Density', score.details.nearestPopDensity.toString()],
    ['Median Income', score.details.nearestIncome.toString()],
    ['Catchment Population', score.details.catchmentPopulation.toString()],
    ['Competitors', score.details.competitorCount.toString()],
    ['Flood Risk', score.details.floodRisk.toString()],
    ['Air Quality', score.details.airQuality.toString()],
    ['Zoning Match', score.details.zoningMatch ? 'Yes' : 'No'],
  ];

  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `site-report-${lat.toFixed(3)}-${lng.toFixed(3)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
