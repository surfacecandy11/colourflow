export interface Palette {
  id: string;
  label: string;
  colors: string[];
  description: string;
}

export const TREND_PALETTES: Palette[] = [
  {
    id: 'trend-26-genie-official',
    label: 'PatternGenie Official (2026)',
    colors: ['#117F8D', '#D0498F', '#74AF93', '#D2EC41', '#245DA3', '#C4B617', '#CF87A8', '#688ED9', '#DFB381'],
    description: 'The standardized brand suite for all PatternGenie professional tools.',
  },
  {
    id: 'trend-26-teal',
    label: 'Transformative Teal (2026)',
    colors: ['#117F8D', '#20B2AA', '#48D1CC', '#E0F2F1', '#001D4D'],
    description: 'WGSN 2026 Hero: Calming yet bold blue-green hybrid.',
  },
  {
    id: 'trend-26-cherry',
    label: 'Regal Cherry (2026)',
    colors: ['#701112', '#96181A', '#BC1F22', '#E22629', '#3D090A'],
    description: 'Refined rich cherry red for professional 2026 collections.',
  },
  {
    id: 'trend-26-mahogany',
    label: 'Warm Mahogany (2026)',
    colors: ['#54231E', '#7E352D', '#B05E53', '#E6C9C5', '#2E110F'],
    description: 'Glidden: Earthy, grounded red for sophisticated warmth.',
  },
  {
    id: 'trend-26-ivory',
    label: 'Melodious Ivory (2026)',
    colors: ['#F5F5DC', '#EEE8AA', '#FFF8DC', '#FAFAD2', '#D2B48C'],
    description: 'Dutch Boy: Soft, creamy beige for timeless foundations.',
  },
  {
    id: 'trend-26-eucalyptus',
    label: 'Warm Eucalyptus (2026)',
    colors: ['#8AA399', '#B8D8D0', '#708D81', '#546A60', '#DBEBE5'],
    description: 'Valspar: Nature-rooted green replacing traditional neutrals.',
  },
];

export const PERIOD_PALETTES: Palette[] = [
  {
    id: 'period-victorian',
    label: 'Victorian Opulence',
    colors: ['#701112', '#4A5D4E', '#2E1A47', '#D4AF37', '#FAF3E0'],
    description: 'Rich cherry, muted eucalyptus, and gold accents.',
  },
  {
    id: 'period-art-deco',
    label: 'Art Deco Drama',
    colors: ['#1A1A1A', '#D4AF37', '#2E4053', '#701112', '#FAF3E0'],
    description: 'High contrast charcoal, gold, and cherry tones.',
  },
  {
    id: 'period-mcm',
    label: 'Mid-Century Modern',
    colors: ['#14B8A6', '#CC7722', '#E2725B', '#8AA399', '#FAF3E0'],
    description: 'Teal, ochre, and warm eucalyptus accents.',
  },
  {
    id: 'period-bauhaus',
    label: 'Bauhaus Refined',
    colors: ['#701112', '#2E4053', '#D4AF37', '#1A1A1A', '#FAF3E0'],
    description: 'Sophisticated 2026 take on primary contrasts.',
  },
  {
    id: 'period-retro-70s',
    label: '70s Retro Groove',
    colors: ['#8B4513', '#D2691E', '#D48C6F', '#D4AF37', '#708D81'],
    description: 'Sophisticated ochre and warm eucalyptus tones.',
  },
];

export const CLASSIC_PALETTES: Palette[] = [
  {
    id: 'classic-mono',
    label: 'Classic Monochromatic',
    colors: ['#1A1A1A', '#404040', '#808080', '#BFBFBF', '#FAF3E0'],
    description: 'Timeless shades of charcoal and warm cream.',
  },
  {
    id: 'classic-nautical',
    label: 'Timeless Nautical',
    colors: ['#2E4053', '#FAF3E0', '#701112', '#8AA399', '#1A1A1A'],
    description: 'Deep charcoal, warm cream, and cherry accents.',
  },
  {
    id: 'classic-botanical',
    label: 'Vintage Botanical',
    colors: ['#4A5D4E', '#8AA399', '#FAF3E0', '#D48C6F', '#2F4F4F'],
    description: 'Antique eucalyptus and parchment creams.',
  },
];

export const PSYCHOLOGICAL_PALETTES: Palette[] = [
  {
    id: 'psych-calm',
    label: 'Calm & Serene',
    colors: ['#E0F2F1', '#B2DFDB', '#80CBC4', '#4DB6AC', '#26A69A'],
    description: 'Nature-rooted teals and soft eucalyptus for relaxation.',
  },
  {
    id: 'psych-energy',
    label: 'Dynamic Energy',
    colors: ['#FFD54F', '#FFC107', '#FFA000', '#FF8F00', '#FF6F00'],
    description: 'Vibrant mustard and amber tones to stimulate creativity.',
  },
  {
    id: 'psych-trust',
    label: 'Professional Trust',
    colors: ['#1A3A5A', '#245DA3', '#688ED9', '#A5C1F0', '#D9E6FF'],
    description: 'Deep midnight and cornflower blues for stability.',
  },
  {
    id: 'psych-focus',
    label: 'Clear Focus',
    colors: ['#3D3D3D', '#757575', '#9E9E9E', '#BDBDBD', '#E0E0E0'],
    description: 'Neutral charcoals and greys for minimalist clarity.',
  },
  {
    id: 'psych-passion',
    label: 'Vibrant Passion',
    colors: ['#701112', '#96181A', '#C2568E', '#D0498F', '#CF87A8'],
    description: 'Rich cherry and dusty rose for high-impact emotion.',
  },
];
