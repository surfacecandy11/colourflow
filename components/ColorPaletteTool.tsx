'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  Palette,
  Sparkles,
  Brain,
  Clock,
  TrendingUp,
  BookmarkCheck,
  X,
  Copy,
  Download,
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  Pencil,
} from 'lucide-react';
import {
  TREND_PALETTES,
  PERIOD_PALETTES,
  CLASSIC_PALETTES,
  PSYCHOLOGICAL_PALETTES,
} from '@/lib/paletteLib';

// ─── Colour Math Utilities ────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function rgbToCmyk(r: number, g: number, b: number) {
  const rp = r / 255;
  const gp = g / 255;
  const bp = b / 255;
  const k = 1 - Math.max(rp, gp, bp);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rp - k) / (1 - k)) * 100),
    m: Math.round(((1 - gp - k) / (1 - k)) * 100),
    y: Math.round(((1 - bp - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rp = r / 255;
  const gp = g / 255;
  const bp = b / 255;
  const max = Math.max(rp, gp, bp);
  const min = Math.min(rp, gp, bp);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case rp:
      h = ((gp - bp) / d + (gp < bp ? 6 : 0)) / 6;
      break;
    case gp:
      h = ((bp - rp) / d + 2) / 6;
      break;
    case bp:
      h = ((rp - gp) / d + 4) / 6;
      break;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const sp = s / 100;
  const lp = l / 100;
  const c = (1 - Math.abs(2 * lp - 1)) * sp;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lp - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return rgbToHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  );
}

function isLight(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 128;
}

function generateTintsShades(hex: string): string[] {
  const { h, s } = hexToHsl(hex);
  const result: string[] = [];
  for (let i = 8; i >= 0; i--) {
    result.push(hslToHex(h, s, 10 + i * 9));
  }
  return result;
}

function generateTheoryPalette(baseHex: string, scheme: string): string[] {
  const { h, s, l } = hexToHsl(baseHex);
  switch (scheme) {
    case 'complementary':
      return [
        baseHex,
        hslToHex((h + 180) % 360, s, l),
        hslToHex(h, s, Math.min(90, l + 20)),
        hslToHex((h + 180) % 360, s, Math.min(90, l + 20)),
        hslToHex(h, Math.max(10, s - 30), Math.max(10, l - 20)),
      ];
    case 'analogous':
      return [
        hslToHex((h - 30 + 360) % 360, s, l),
        hslToHex((h - 15 + 360) % 360, s, l),
        baseHex,
        hslToHex((h + 15) % 360, s, l),
        hslToHex((h + 30) % 360, s, l),
      ];
    case 'triadic':
      return [
        baseHex,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
        hslToHex(h, s, Math.min(90, l + 20)),
        hslToHex(h, Math.max(10, s - 20), Math.max(10, l - 10)),
      ];
    case 'split-complementary':
      return [
        baseHex,
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
        hslToHex(h, s, Math.min(90, l + 20)),
        hslToHex(h, Math.max(10, s - 20), Math.max(10, l - 20)),
      ];
    case 'tetradic':
      return [
        baseHex,
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
        hslToHex(h, s, Math.min(90, l + 20)),
      ];
    default:
      return [baseHex];
  }
}

// ─── K-means Colour Extraction ────────────────────────────────────────────────

function colourDistance(a: number[], b: number[]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function extractColoursFromCanvas(canvas: HTMLCanvasElement): string[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;

  const pixels: number[][] = [];
  for (let i = 0; i < data.length; i += 4 * 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;
    pixels.push([r, g, b]);
  }

  if (pixels.length === 0) return [];

  // k-means with k=12, pick 8 after filtering
  const k = 12;
  let centroids = pixels.slice(0, k).map((p) => [...p]);
  for (let iter = 0; iter < 30; iter++) {
    const clusters: number[][][] = Array.from({ length: k }, () => []);
    for (const pixel of pixels) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let ci = 0; ci < k; ci++) {
        const d = colourDistance(pixel, centroids[ci]);
        if (d < minDist) { minDist = d; minIdx = ci; }
      }
      clusters[minIdx].push(pixel);
    }
    let changed = false;
    for (let ci = 0; ci < k; ci++) {
      if (clusters[ci].length === 0) continue;
      const newC = [
        clusters[ci].reduce((s, p) => s + p[0], 0) / clusters[ci].length,
        clusters[ci].reduce((s, p) => s + p[1], 0) / clusters[ci].length,
        clusters[ci].reduce((s, p) => s + p[2], 0) / clusters[ci].length,
      ];
      if (colourDistance(newC, centroids[ci]) > 0.5) changed = true;
      centroids[ci] = newC;
    }
    if (!changed) break;
  }

  // Filter near-white and near-black
  const filtered = centroids.filter((c) => {
    const allHigh = c[0] > 240 && c[1] > 240 && c[2] > 240;
    const allLow = c[0] < 15 && c[1] < 15 && c[2] < 15;
    return !allHigh && !allLow;
  });

  // Remove near-duplicates
  const unique: number[][] = [];
  for (const c of filtered) {
    if (!unique.some((u) => colourDistance(u, c) < 25)) {
      unique.push(c);
    }
  }

  return unique.slice(0, 8).map((c) => rgbToHex(c[0], c[1], c[2]));
}

// ─── Mood Mapping ─────────────────────────────────────────────────────────────

const MOOD_MAP: Record<string, string[]> = {
  vintage: ['#117F8D', '#DFB381', '#FAF3E0', '#3D3D3D', '#CF87A8'],
  modern: ['#001D4D', '#FAF3E0', '#117F8D', '#3D3D3D', '#688ED9'],
  nature: ['#74AF93', '#D2EC41', '#FAF3E0', '#2E3D2E', '#C4B617'],
  neon: ['#D2EC41', '#D0498F', '#117F8D', '#245DA3', '#C4B617'],
  genie: ['#117F8D', '#D0498F', '#74AF93', '#CF87A8', '#FAF3E0'],
  calm: ['#E0F2F1', '#B2DFDB', '#80CBC4', '#4DB6AC', '#26A69A'],
  energy: ['#FFD54F', '#FFC107', '#FFA000', '#FF8F00', '#FF6F00'],
  trust: ['#1A3A5A', '#245DA3', '#688ED9', '#A5C1F0', '#D9E6FF'],
  passion: ['#701112', '#96181A', '#C2568E', '#D0498F', '#CF87A8'],
  retro: ['#8B4513', '#D2691E', '#D48C6F', '#D4AF37', '#708D81'],
};

function getMoodPalette(input: string): string[] {
  const lower = input.toLowerCase();
  for (const [keyword, colors] of Object.entries(MOOD_MAP)) {
    if (lower.includes(keyword)) return colors;
  }
  // Try partial matches
  const words = lower.split(/\s+/);
  for (const word of words) {
    for (const [keyword, colors] of Object.entries(MOOD_MAP)) {
      if (keyword.includes(word) || word.includes(keyword)) return colors;
    }
  }
  return MOOD_MAP['genie'];
}

// ─── Saved Palettes ───────────────────────────────────────────────────────────

interface SavedPalette {
  id: string;
  name: string;
  colors: string[];
  savedAt: string;
}

function loadSaved(): SavedPalette[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('colourflow-saved') ?? '[]');
  } catch {
    return [];
  }
}

function persistSaved(palettes: SavedPalette[]) {
  localStorage.setItem('colourflow-saved', JSON.stringify(palettes));
}

// ─── Vision Filter Styles ─────────────────────────────────────────────────────

const VISION_FILTER_STYLES: Record<string, React.CSSProperties> = {
  none: {},
  protanopia: { filter: 'url(#protanopia)' },
  deuteranopia: { filter: 'url(#deuteranopia)' },
  tritanopia: { filter: 'url(#tritanopia)' },
  grayscale: { filter: 'grayscale(100%)' },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'trends' | 'periods' | 'theory' | 'mood' | 'psychological' | 'extract' | 'saved';
type VisionMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'grayscale';

interface ColourDetail {
  hex: string;
  label?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ColourSwatch({
  hex,
  size = 'md',
  onClick,
  onRemove,
  isEditing = false,
  label,
}: {
  hex: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  onRemove?: () => void;
  isEditing?: boolean;
  label?: string;
}) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative ${sizeClasses[size]} rounded-xl cursor-pointer shadow-md hover:scale-105 transition-transform ${isEditing ? 'ring-4 ring-offset-2 ring-blue-500' : ''}`}
        style={{ backgroundColor: hex }}
        onClick={onClick}
        title={hex}
      >
        {isEditing && (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[9px] font-bold px-1 rounded-full">
            ✎
          </span>
        )}
        {onRemove && (
          <button
            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            ×
          </button>
        )}
      </div>
      {label && <span className="text-xs text-gray-600 font-mono">{label}</span>}
    </div>
  );
}

function ColourDetailPanel({
  colour,
  onClose,
}: {
  colour: ColourDetail;
  onClose: () => void;
}) {
  const { hex } = colour;
  const rgb = hexToRgb(hex);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const hsl = hexToHsl(hex);
  const tints = generateTintsShades(hex);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-4 w-full">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800">Colour Details</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div
        className="w-full h-32 rounded-2xl shadow-inner"
        style={{ backgroundColor: hex }}
      />

      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          { label: 'HEX', value: hex },
          { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
          { label: 'CMYK', value: `${cmyk.c}% ${cmyk.m}% ${cmyk.y}% ${cmyk.k}%` },
          { label: 'HSL', value: `${hsl.h}° ${hsl.s}% ${hsl.l}%` },
        ].map(({ label, value }) => (
          <button
            key={label}
            className="flex flex-col items-start p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            onClick={() => copy(value, label)}
          >
            <span className="text-xs text-gray-500 font-medium">{label}</span>
            <span className="font-mono text-gray-800 break-all">{value}</span>
            {copied === label && (
              <span className="text-xs text-green-600 mt-0.5">Copied!</span>
            )}
          </button>
        ))}
      </div>

      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">Tints & Shades</p>
        <div className="flex gap-1 rounded-xl overflow-hidden">
          {tints.map((t, i) => (
            <div
              key={i}
              className="flex-1 h-8 cursor-pointer hover:scale-y-110 transition-transform origin-bottom"
              style={{ backgroundColor: t }}
              title={t}
              onClick={() => copy(t, `tint-${i}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PaletteRow({
  palette,
  onSelect,
  onSave,
  visionStyle,
}: {
  palette: { id: string; label: string; colors: string[]; description: string };
  onSelect: (hex: string) => void;
  onSave: (colors: string[], name: string) => void;
  visionStyle: React.CSSProperties;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="font-semibold text-gray-800">{palette.label}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{palette.description}</p>
        </div>
        <button
          className="shrink-0 p-1.5 text-gray-400 hover:text-teal-600 transition-colors"
          title="Save palette"
          onClick={() => onSave(palette.colors, palette.label)}
        >
          <BookmarkCheck size={18} />
        </button>
      </div>
      <div className="flex gap-2 flex-wrap" style={visionStyle}>
        {palette.colors.map((c) => (
          <ColourSwatch key={c} hex={c} size="md" onClick={() => onSelect(c)} label={c} />
        ))}
      </div>
    </div>
  );
}

// ─── Export Helpers ───────────────────────────────────────────────────────────

function buildExportColors(extracted: string[], manual: string[]): string[] {
  return [...extracted, ...manual];
}

function exportCSS(colors: string[], name: string) {
  const vars = colors.map((c, i) => `  --colour-${i + 1}: ${c};`).join('\n');
  const content = `/* ${name} — exported from ColourFlow */\n:root {\n${vars}\n}\n`;
  const blob = new Blob([content], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.css`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(colors: string[], name: string) {
  const data = colors.map((hex) => {
    const rgb = hexToRgb(hex);
    return { hex, rgb, cmyk: rgbToCmyk(rgb.r, rgb.g, rgb.b) };
  });
  const blob = new Blob([JSON.stringify({ name, colours: data }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPNG(colors: string[], name: string) {
  const W = 1200;
  const H = 400;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#FAF3E0';
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = '#1A1A2E';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(name, 40, 60);

  // Swatches
  const swatchW = Math.min(140, (W - 80) / colors.length - 10);
  const swatchH = 220;
  const startX = 40;
  const startY = 100;
  colors.forEach((hex, i) => {
    const x = startX + i * (swatchW + 10);
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.roundRect(x, startY, swatchW, swatchH, 12);
    ctx.fill();

    ctx.fillStyle = isLight(hex) ? '#1A1A2E' : '#FFFFFF';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(hex.toUpperCase(), x + swatchW / 2, startY + swatchH + 22);
  });
  ctx.textAlign = 'left';

  // Branding
  ctx.fillStyle = '#117F8D';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('ColourFlow', W - 140, H - 20);

  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.png`;
  a.click();
}

function exportJPEG(colors: string[], name: string, uploadedImageSrc: string | null) {
  const W = 1400;
  const H = 600;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const doExport = () => {
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Outer decorative double-line frame
    ctx.strokeStyle = '#1A1A2E';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, W - 24, H - 24);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    const imgAreaW = uploadedImageSrc ? 280 : 0;
    const contentStartX = uploadedImageSrc ? imgAreaW + 40 : 40;

    // Uploaded image on left
    if (uploadedImageSrc) {
      const img = new window.Image();
      img.src = uploadedImageSrc;
      const imgSize = 240;
      const imgX = 36;
      const imgY = (H - imgSize) / 2;

      // Drop shadow
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.roundRect(imgX - 8, imgY - 8, imgSize + 16, imgSize + 16, 8);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Image frame (double border)
      ctx.strokeStyle = '#1A1A2E';
      ctx.lineWidth = 3;
      ctx.strokeRect(imgX - 8, imgY - 8, imgSize + 16, imgSize + 16);
      ctx.lineWidth = 1;
      ctx.strokeRect(imgX - 3, imgY - 3, imgSize + 6, imgSize + 6);

      // Clip and draw image
      ctx.save();
      ctx.beginPath();
      ctx.rect(imgX, imgY, imgSize, imgSize);
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
      ctx.restore();
    }

    // Palette title
    ctx.fillStyle = '#1A1A2E';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(name, contentStartX, 70);

    // Swatches
    const cols = Math.min(4, colors.length);
    const rows = Math.ceil(colors.length / cols);
    const swatchW = Math.min(160, (W - contentStartX - 60) / cols - 14);
    const swatchH = Math.min(130, (H - 140) / rows - 30);

    colors.forEach((hex, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = contentStartX + col * (swatchW + 14);
      const y = 100 + row * (swatchH + 40);

      // Swatch
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.roundRect(x, y, swatchW, swatchH, 10);
      ctx.fill();

      // HEX on swatch
      ctx.fillStyle = isLight(hex) ? '#1A1A2E' : '#FFFFFF';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hex.toUpperCase(), x + swatchW / 2, y + swatchH - 20);

      // RGB below
      const rgb = hexToRgb(hex);
      ctx.fillStyle = '#555';
      ctx.font = '11px sans-serif';
      ctx.fillText(`RGB ${rgb.r} ${rgb.g} ${rgb.b}`, x + swatchW / 2, y + swatchH + 18);
    });
    ctx.textAlign = 'left';

    // Branding
    ctx.fillStyle = '#117F8D';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('ColourFlow', W - 120, H - 28);

    const url = canvas.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    a.click();
  };

  if (uploadedImageSrc) {
    const img = new window.Image();
    img.onload = () => {
      // Draw to temp canvas to get src
      doExport();
    };
    img.src = uploadedImageSrc;
  } else {
    doExport();
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ColorPaletteTool() {
  const [activeTab, setActiveTab] = useState<Tab>('trends');
  const [selectedColour, setSelectedColour] = useState<ColourDetail | null>(null);

  // Vision
  const [visionMode, setVisionMode] = useState<VisionMode>('none');

  // Theory tab
  const [theoryBase, setTheoryBase] = useState('#117F8D');
  const [theoryScheme, setTheoryScheme] = useState('complementary');
  const [theoryPalette, setTheoryPalette] = useState<string[]>([]);

  // Mood tab
  const [moodInput, setMoodInput] = useState('');
  const [moodPalette, setMoodPalette] = useState<string[]>([]);

  // Extract tab
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [manualColors, setManualColors] = useState<string[]>([]);
  const [manualPickerValue, setManualPickerValue] = useState('#117F8D');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPickerValue, setEditPickerValue] = useState('#117F8D');
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Active palette (for export context)
  const [activePaletteName, setActivePaletteName] = useState('My Palette');

  // Saved
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [saveNameInput, setSaveNameInput] = useState('');

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSavedPalettes(loadSaved());
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Current display colours based on active tab
  const currentColors = useCallback((): string[] => {
    if (activeTab === 'extract') {
      return buildExportColors(extractedColors, manualColors);
    }
    if (activeTab === 'theory') return theoryPalette;
    if (activeTab === 'mood') return moodPalette;
    return [];
  }, [activeTab, extractedColors, manualColors, theoryPalette, moodPalette]);

  // Save palette
  const savePalette = useCallback((colors: string[], name: string) => {
    if (colors.length === 0) return;
    const newPalette: SavedPalette = {
      id: `saved-${Date.now()}`,
      name,
      colors,
      savedAt: new Date().toISOString(),
    };
    const updated = [newPalette, ...savedPalettes];
    setSavedPalettes(updated);
    persistSaved(updated);
    showToast(`Saved "${name}"!`);
  }, [savedPalettes, showToast]);

  const deleteSaved = useCallback((id: string) => {
    const updated = savedPalettes.filter((p) => p.id !== id);
    setSavedPalettes(updated);
    persistSaved(updated);
  }, [savedPalettes]);

  // Image upload
  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setUploadedImageSrc(src);
      setIsExtracting(true);
      setEditingIndex(null);

      const img = new window.Image();
      img.onload = () => {
        imageRef.current = img;
        const maxSide = 500;
        let w = img.width;
        let h = img.height;
        if (w > h) { h = Math.round((h / w) * maxSide); w = maxSide; }
        else { w = Math.round((w / h) * maxSide); h = maxSide; }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);

        const colors = extractColoursFromCanvas(canvas);
        setExtractedColors(colors);
        setIsExtracting(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageUpload(file);
  }, [handleImageUpload]);

  // Edit extracted colour
  const startEditExtracted = useCallback((index: number) => {
    setEditingIndex(index);
    setEditPickerValue(extractedColors[index]);
  }, [extractedColors]);

  const handleEditPickerChange = useCallback((value: string) => {
    setEditPickerValue(value);
    if (editingIndex !== null) {
      setExtractedColors((prev) => {
        const next = [...prev];
        next[editingIndex] = value.toUpperCase();
        return next;
      });
    }
  }, [editingIndex]);

  const stopEditing = useCallback(() => setEditingIndex(null), []);

  // Manual colours
  const addManualColour = useCallback(() => {
    if (manualColors.length >= 6) return;
    const hex = manualPickerValue.toUpperCase();
    setManualColors((prev) => [...prev, hex]);
  }, [manualColors, manualPickerValue]);

  const removeManualColour = useCallback((i: number) => {
    setManualColors((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const clearManualColors = useCallback(() => setManualColors([]), []);

  // Export
  const handleExport = useCallback((format: string) => {
    const colors = currentColors().length > 0 ? currentColors() : extractedColors.concat(manualColors);
    const name = activePaletteName || 'ColourFlow Palette';
    switch (format) {
      case 'copy':
        navigator.clipboard.writeText(colors.join(', ')).then(() => showToast('Copied!'));
        break;
      case 'css':
        exportCSS(colors, name);
        break;
      case 'json':
        exportJSON(colors, name);
        break;
      case 'png':
        exportPNG(colors, name);
        break;
      case 'jpeg':
        exportJPEG(colors, name, uploadedImageSrc);
        break;
    }
  }, [currentColors, extractedColors, manualColors, activePaletteName, uploadedImageSrc, showToast]);

  const visionStyle = VISION_FILTER_STYLES[visionMode];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'trends', label: '2026 Trends', icon: <TrendingUp size={16} /> },
    { id: 'periods', label: 'Periods', icon: <Clock size={16} /> },
    { id: 'theory', label: 'Colour Theory', icon: <Palette size={16} /> },
    { id: 'mood', label: 'Mood', icon: <Sparkles size={16} /> },
    { id: 'psychological', label: 'Psychological', icon: <Brain size={16} /> },
    { id: 'extract', label: 'Extract', icon: <Upload size={16} /> },
    { id: 'saved', label: 'Saved', icon: <BookmarkCheck size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAF3E0] font-sans">
      {/* SVG Filters for vision simulation */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#117F8D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1A1A2E] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#117F8D] flex items-center justify-center">
            <Palette size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ColourFlow</h1>
            <p className="text-xs text-gray-400">Colour Palette Generator</p>
          </div>
        </div>
        {/* Vision Controls */}
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-gray-400" />
          <span className="text-xs text-gray-400 mr-1">Vision:</span>
          {(['none', 'protanopia', 'deuteranopia', 'tritanopia', 'grayscale'] as VisionMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setVisionMode(v)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                visionMode === v
                  ? 'bg-[#117F8D] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {v === 'none' ? 'None' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#1A1A2E] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* ── Trends Tab ── */}
            {activeTab === 'trends' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#1A1A2E]">2026 Colour Trends</h2>
                {TREND_PALETTES.map((p) => (
                  <PaletteRow
                    key={p.id}
                    palette={p}
                    onSelect={(hex) => { setSelectedColour({ hex }); setActivePaletteName(p.label); }}
                    onSave={savePalette}
                    visionStyle={visionStyle}
                  />
                ))}
              </div>
            )}

            {/* ── Periods Tab ── */}
            {activeTab === 'periods' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#1A1A2E]">Historical Periods</h2>
                <div className="space-y-4">
                  {PERIOD_PALETTES.map((p) => (
                    <PaletteRow
                      key={p.id}
                      palette={p}
                      onSelect={(hex) => { setSelectedColour({ hex }); setActivePaletteName(p.label); }}
                      onSave={savePalette}
                      visionStyle={visionStyle}
                    />
                  ))}
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] pt-2">Classic Fundamentals</h3>
                <div className="space-y-4">
                  {CLASSIC_PALETTES.map((p) => (
                    <PaletteRow
                      key={p.id}
                      palette={p}
                      onSelect={(hex) => { setSelectedColour({ hex }); setActivePaletteName(p.label); }}
                      onSave={savePalette}
                      visionStyle={visionStyle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Theory Tab ── */}
            {activeTab === 'theory' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#1A1A2E]">Colour Theory</h2>
                <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Colour</label>
                      <input
                        type="color"
                        value={theoryBase}
                        onChange={(e) => setTheoryBase(e.target.value)}
                        className="w-16 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Harmony Scheme</label>
                      <select
                        value={theoryScheme}
                        onChange={(e) => setTheoryScheme(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#117F8D]"
                      >
                        <option value="complementary">Complementary</option>
                        <option value="analogous">Analogous</option>
                        <option value="triadic">Triadic</option>
                        <option value="split-complementary">Split-Complementary</option>
                        <option value="tetradic">Tetradic</option>
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        const palette = generateTheoryPalette(theoryBase, theoryScheme);
                        setTheoryPalette(palette);
                        setActivePaletteName(`${theoryScheme.charAt(0).toUpperCase() + theoryScheme.slice(1)} Palette`);
                      }}
                      className="px-5 py-2 bg-[#117F8D] text-white rounded-xl font-medium hover:bg-[#0e6b78] transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                  {theoryPalette.length > 0 && (
                    <div className="flex gap-3 flex-wrap pt-2" style={visionStyle}>
                      {theoryPalette.map((c) => (
                        <ColourSwatch
                          key={c}
                          hex={c}
                          size="lg"
                          onClick={() => setSelectedColour({ hex: c })}
                          label={c}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Mood Tab ── */}
            {activeTab === 'mood' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#1A1A2E]">Mood Generator</h2>
                <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={moodInput}
                      onChange={(e) => setMoodInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const palette = getMoodPalette(moodInput);
                          setMoodPalette(palette);
                          setActivePaletteName(`${moodInput} Mood`);
                        }
                      }}
                      placeholder="Describe your vibe… (e.g. vintage, modern, nature, neon)"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#117F8D]"
                    />
                    <button
                      onClick={() => {
                        const palette = getMoodPalette(moodInput);
                        setMoodPalette(palette);
                        setActivePaletteName(`${moodInput} Mood`);
                      }}
                      className="px-5 py-2 bg-[#117F8D] text-white rounded-xl font-medium hover:bg-[#0e6b78] transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Try: vintage, modern, nature, neon, genie, calm, energy, trust, passion, retro
                  </p>
                  {moodPalette.length > 0 && (
                    <div className="flex gap-3 flex-wrap pt-2" style={visionStyle}>
                      {moodPalette.map((c) => (
                        <ColourSwatch
                          key={c}
                          hex={c}
                          size="lg"
                          onClick={() => setSelectedColour({ hex: c })}
                          label={c}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Psychological Tab ── */}
            {activeTab === 'psychological' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#1A1A2E]">Psychological Palettes</h2>
                {PSYCHOLOGICAL_PALETTES.map((p) => (
                  <PaletteRow
                    key={p.id}
                    palette={p}
                    onSelect={(hex) => { setSelectedColour({ hex }); setActivePaletteName(p.label); }}
                    onSave={savePalette}
                    visionStyle={visionStyle}
                  />
                ))}
              </div>
            )}

            {/* ── Extract Tab ── */}
            {activeTab === 'extract' && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#1A1A2E]">Extract from Image</h2>

                {/* Upload + Manual Picker Row */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Upload area */}
                  <div
                    className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#117F8D] transition-colors bg-white min-h-[180px]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={28} className="text-gray-400" />
                    <p className="text-sm text-gray-500 text-center">
                      {uploadedImageSrc ? 'Click or drag to replace image' : 'Click or drag & drop an image'}
                    </p>
                    {uploadedImageSrc && (
                      <img
                        src={uploadedImageSrc}
                        alt="Uploaded"
                        className="max-h-32 max-w-full rounded-xl shadow"
                      />
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </div>

                  {/* Manual Colour Picker Panel */}
                  <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4 md:w-72">
                    <h3 className="font-semibold text-gray-800">Manual Colour Picker</h3>

                    {/* Add new colour section */}
                    {editingIndex === null ? (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500">Add a new colour to your palette:</p>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={manualPickerValue}
                            onChange={(e) => setManualPickerValue(e.target.value)}
                            className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                          />
                          <span className="font-mono text-sm text-gray-700 flex-1">{manualPickerValue.toUpperCase()}</span>
                          <button
                            onClick={addManualColour}
                            disabled={manualColors.length >= 6}
                            className="px-3 py-1.5 bg-[#117F8D] text-white rounded-lg text-sm font-medium hover:bg-[#0e6b78] disabled:opacity-40 transition-colors flex items-center gap-1"
                          >
                            <Plus size={14} /> Add
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                          {manualColors.length} of 6 manual colours added
                        </p>
                      </div>
                    ) : (
                      /* Edit mode */
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Pencil size={14} className="text-blue-500" />
                          <p className="text-xs text-blue-600 font-semibold">
                            Editing extracted colour #{editingIndex + 1}
                          </p>
                        </div>
                        <div
                          className="w-full h-10 rounded-xl border-2 border-blue-400"
                          style={{ backgroundColor: editPickerValue }}
                        />
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={editPickerValue}
                            onChange={(e) => handleEditPickerChange(e.target.value)}
                            className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                          />
                          <span className="font-mono text-sm text-gray-700 flex-1">{editPickerValue.toUpperCase()}</span>
                          <button
                            onClick={stopEditing}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                          >
                            Done
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Click another swatch to edit it, or press Done.
                        </p>
                      </div>
                    )}

                    {/* Manual swatches */}
                    {manualColors.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs text-gray-500 font-medium">Manual colours:</p>
                          <button
                            onClick={clearManualColors}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {manualColors.map((c, i) => (
                            <ColourSwatch
                              key={`${c}-${i}`}
                              hex={c}
                              size="sm"
                              label={c}
                              onClick={() => setSelectedColour({ hex: c })}
                              onRemove={() => removeManualColour(i)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Extracted colours */}
                {isExtracting && (
                  <div className="bg-white rounded-2xl p-6 text-center text-gray-500">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-[#117F8D] border-t-transparent rounded-full mb-2" />
                    <p className="text-sm">Extracting colours…</p>
                  </div>
                )}

                {!isExtracting && extractedColors.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800">
                        Extracted Colours
                        <span className="text-xs text-gray-500 font-normal ml-2">
                          (click a swatch to edit it)
                        </span>
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-4" style={visionStyle}>
                      {extractedColors.map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <ColourSwatch
                            hex={c}
                            size="lg"
                            isEditing={editingIndex === i}
                            onClick={() => startEditExtracted(i)}
                            label={c}
                          />
                          <div className="text-xs text-gray-500 text-center">
                            {(() => {
                              const rgb = hexToRgb(c);
                              return `RGB ${rgb.r} ${rgb.g} ${rgb.b}`;
                            })()}
                          </div>
                          <div className="text-xs text-gray-400 text-center">
                            {(() => {
                              const rgb = hexToRgb(c);
                              const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
                              return `CMYK ${cmyk.c} ${cmyk.m} ${cmyk.y} ${cmyk.k}`;
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Export panel for extract tab */}
                {(extractedColors.length > 0 || manualColors.length > 0) && (
                  <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                    <h3 className="font-semibold text-gray-800">Export Palette</h3>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={activePaletteName}
                        onChange={(e) => setActivePaletteName(e.target.value)}
                        placeholder="Palette name"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#117F8D]"
                      />
                      <button
                        onClick={() => savePalette(buildExportColors(extractedColors, manualColors), activePaletteName)}
                        className="px-3 py-2 bg-[#117F8D] text-white rounded-xl text-sm hover:bg-[#0e6b78] transition-colors flex items-center gap-1.5"
                      >
                        <BookmarkCheck size={15} /> Save
                      </button>
                    </div>
                    <ExportButtons onExport={handleExport} />
                  </div>
                )}
              </div>
            )}

            {/* ── Saved Tab ── */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#1A1A2E]">Saved Palettes</h2>

                {/* Save current */}
                <div className="bg-white rounded-2xl shadow-sm p-5 flex gap-3 items-center">
                  <input
                    type="text"
                    value={saveNameInput}
                    onChange={(e) => setSaveNameInput(e.target.value)}
                    placeholder="Name for current palette…"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#117F8D]"
                  />
                  <button
                    onClick={() => {
                      const colors = currentColors().length > 0 ? currentColors() : extractedColors.concat(manualColors);
                      if (colors.length > 0 && saveNameInput.trim()) {
                        savePalette(colors, saveNameInput.trim());
                        setSaveNameInput('');
                      }
                    }}
                    className="px-4 py-2 bg-[#117F8D] text-white rounded-xl text-sm font-medium hover:bg-[#0e6b78] transition-colors"
                  >
                    Save Current
                  </button>
                </div>

                {savedPalettes.length === 0 ? (
                  <p className="text-gray-500 text-center py-12">No saved palettes yet.</p>
                ) : (
                  <div className="space-y-3">
                    {savedPalettes.map((p) => (
                      <div key={p.id} className="bg-white rounded-2xl shadow-sm p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">{p.name}</h4>
                            <p className="text-xs text-gray-400">
                              {new Date(p.savedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setActivePaletteName(p.name);
                                navigator.clipboard.writeText(p.colors.join(', ')).then(() => showToast('Copied!'));
                              }}
                              className="p-1.5 text-gray-400 hover:text-[#117F8D] transition-colors"
                              title="Copy hex codes"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={() => deleteSaved(p.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap" style={visionStyle}>
                          {p.colors.map((c) => (
                            <ColourSwatch
                              key={c}
                              hex={c}
                              size="md"
                              onClick={() => setSelectedColour({ hex: c })}
                              label={c}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right Panel: Colour Detail ── */}
          <div className="w-72 shrink-0 space-y-4">
            {selectedColour ? (
              <ColourDetailPanel
                colour={selectedColour}
                onClose={() => setSelectedColour(null)}
              />
            ) : (
              <div className="bg-white rounded-3xl shadow-sm p-6 text-center text-gray-400">
                <Palette size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Click any colour swatch to see its details</p>
              </div>
            )}

            {/* Global Export */}
            <div className="bg-white rounded-3xl shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-gray-700 text-sm">Export</h3>
              <input
                type="text"
                value={activePaletteName}
                onChange={(e) => setActivePaletteName(e.target.value)}
                placeholder="Palette name"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#117F8D]"
              />
              <ExportButtons onExport={handleExport} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Export Buttons ───────────────────────────────────────────────────────────

function ExportButtons({
  onExport,
}: {
  onExport: (format: string) => void;
}) {
  const buttons = [
    { format: 'copy', icon: <Copy size={14} />, label: 'Copy Hex' },
    { format: 'css', icon: <Download size={14} />, label: 'CSS' },
    { format: 'json', icon: <Download size={14} />, label: 'JSON' },
    { format: 'png', icon: <Download size={14} />, label: 'PNG' },
    { format: 'jpeg', icon: <Download size={14} />, label: 'JPEG' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map(({ format, icon, label }) => (
        <button
          key={format}
          onClick={() => onExport(format)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A2E] text-white rounded-lg text-xs font-medium hover:bg-[#2a2a3e] transition-colors"
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}
