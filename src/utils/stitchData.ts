import { StitchCategory, StitchAbbreviation } from '@/types/pattern.types';

/**
 * Comprehensive stitch library organized by categories
 */
export const STITCH_CATEGORIES: StitchCategory[] = [
  {
    name: 'Basic Stitches',
    stitches: [
      {
        abbreviation: 'k',
        fullName: 'Knit',
        description: 'Standard knit stitch',
      },
      {
        abbreviation: 'p',
        fullName: 'Purl',
        description: 'Standard purl stitch',
      },
      {
        abbreviation: 'sl',
        fullName: 'Slip',
        description: 'Slip stitch without working',
      },
    ],
  },
  {
    name: 'Increases',
    stitches: [
      {
        abbreviation: 'yo',
        fullName: 'Yarn Over',
        description: 'Creates a hole/eyelet increase',
      },
      {
        abbreviation: 'kfb',
        fullName: 'Knit Front and Back',
        description: 'Increase by knitting twice into one stitch',
      },
      {
        abbreviation: 'pfb',
        fullName: 'Purl Front and Back',
        description: 'Increase by purling twice into one stitch',
      },
      {
        abbreviation: 'm1',
        fullName: 'Make One',
        description: 'Increase between stitches',
      },
      {
        abbreviation: 'm1l',
        fullName: 'Make One Left',
        description: 'Left-leaning increase between stitches',
      },
      {
        abbreviation: 'm1r',
        fullName: 'Make One Right',
        description: 'Right-leaning increase between stitches',
      },
    ],
  },
  {
    name: 'Decreases',
    stitches: [
      {
        abbreviation: 'k2tog',
        fullName: 'Knit Two Together',
        description: 'Right-leaning decrease',
      },
      {
        abbreviation: 'p2tog',
        fullName: 'Purl Two Together',
        description: 'Purl decrease',
      },
      {
        abbreviation: 'ssk',
        fullName: 'Slip Slip Knit',
        description: 'Left-leaning decrease',
      },
      {
        abbreviation: 'ssp',
        fullName: 'Slip Slip Purl',
        description: 'Left-leaning purl decrease',
      },
      {
        abbreviation: 'k3tog',
        fullName: 'Knit Three Together',
        description: 'Double decrease',
      },
      {
        abbreviation: 'cdd',
        fullName: 'Central Double Decrease',
        description: 'Centered double decrease',
      },
    ],
  },
  {
    name: 'Cables',
    stitches: [
      {
        abbreviation: 'c2f',
        fullName: 'Cable 2 Front',
        description: 'Cross 2 stitches with cable needle in front',
        spansCells: 2,
      },
      {
        abbreviation: 'c2b',
        fullName: 'Cable 2 Back',
        description: 'Cross 2 stitches with cable needle in back',
        spansCells: 2,
      },
      {
        abbreviation: 'c4f',
        fullName: 'Cable 4 Front',
        description: 'Cross 4 stitches with cable needle in front',
        spansCells: 4,
      },
      {
        abbreviation: 'c4b',
        fullName: 'Cable 4 Back',
        description: 'Cross 4 stitches with cable needle in back',
        spansCells: 4,
      },
      {
        abbreviation: 'c6f',
        fullName: 'Cable 6 Front',
        description: 'Cross 6 stitches with cable needle in front',
        spansCells: 6,
      },
      {
        abbreviation: 'c6b',
        fullName: 'Cable 6 Back',
        description: 'Cross 6 stitches with cable needle in back',
        spansCells: 6,
      },
      {
        abbreviation: 'c8f',
        fullName: 'Cable 8 Front',
        description: 'Cross 8 stitches with cable needle in front',
        spansCells: 8,
      },
      {
        abbreviation: 'c8b',
        fullName: 'Cable 8 Back',
        description: 'Cross 8 stitches with cable needle in back',
        spansCells: 8,
      },
    ],
  },
];

/**
 * Default color palette from PRD
 */
export const DEFAULT_COLORS = [
  { id: 'MC', name: 'Main Color', hex: '#4A90E2' },
  { id: 'CC1', name: 'Contrast Color 1', hex: '#E63946' },
  { id: 'CC2', name: 'Contrast Color 2', hex: '#F1C40F' },
  { id: 'CC3', name: 'Contrast Color 3', hex: '#2ECC71' },
  { id: 'CC4', name: 'Contrast Color 4', hex: '#9B59B6' },
  { id: 'CC5', name: 'Contrast Color 5', hex: '#E67E22' },
  { id: 'CC6', name: 'Contrast Color 6', hex: '#34495E' },
];

/**
 * Get background color for a stitch type
 */
export function getStitchBackgroundColor(abbreviation: StitchAbbreviation): string {
  if (abbreviation === 'k') return '#E6F3FF'; // Light blue
  if (abbreviation === 'p') return '#FFF5E6'; // Light orange
  if (abbreviation.startsWith('c')) return '#FFE6F0'; // Light pink (cables)
  if (['k2tog', 'p2tog', 'ssk', 'ssp', 'k3tog', 'cdd'].includes(abbreviation)) {
    return '#FFE6E6'; // Light red (decreases)
  }
  if (['yo', 'kfb', 'pfb', 'm1', 'm1l', 'm1r'].includes(abbreviation)) {
    return '#E6FFE6'; // Light green (increases)
  }
  return '#FFFFFF'; // White default
}

/**
 * Get full stitch info by abbreviation
 */
export function getStitchInfo(abbreviation: StitchAbbreviation) {
  for (const category of STITCH_CATEGORIES) {
    const stitch = category.stitches.find(s => s.abbreviation === abbreviation);
    if (stitch) return stitch;
  }
  return null;
}

/**
 * Validate if a string is a valid stitch abbreviation
 */
export function isValidStitchAbbreviation(input: string): input is StitchAbbreviation {
  return STITCH_CATEGORIES.some(category =>
    category.stitches.some(stitch => stitch.abbreviation === input.toLowerCase())
  ) || input === '';
}
