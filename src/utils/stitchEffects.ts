import { StitchAbbreviation } from '@/types/pattern.types';

/**
 * Defines how each stitch type affects stitch count
 * - stitchesConsumed: How many stitches from previous row this stitch uses
 * - stitchesCreated: How many stitches this stitch produces for next row
 */
export interface StitchEffect {
  stitchesConsumed: number;
  stitchesCreated: number;
  spansCells: number; // How many grid cells this stitch occupies
}

export const STITCH_EFFECTS: Record<StitchAbbreviation, StitchEffect> = {
  // Basic stitches (1→1)
  'k': { stitchesConsumed: 1, stitchesCreated: 1, spansCells: 1 },
  'p': { stitchesConsumed: 1, stitchesCreated: 1, spansCells: 1 },
  'sl': { stitchesConsumed: 1, stitchesCreated: 1, spansCells: 1 },
  'sl1': { stitchesConsumed: 1, stitchesCreated: 1, spansCells: 1 },
  
  // Increases (0→1)
  'yo': { stitchesConsumed: 0, stitchesCreated: 1, spansCells: 1 },
  'm1': { stitchesConsumed: 0, stitchesCreated: 1, spansCells: 1 },
  'm1l': { stitchesConsumed: 0, stitchesCreated: 1, spansCells: 1 },
  'm1r': { stitchesConsumed: 0, stitchesCreated: 1, spansCells: 1 },
  'm1p': { stitchesConsumed: 0, stitchesCreated: 1, spansCells: 1 },
  
  // Increases (1→2)
  'kfb': { stitchesConsumed: 1, stitchesCreated: 2, spansCells: 1 },
  'pfb': { stitchesConsumed: 1, stitchesCreated: 2, spansCells: 1 },
  
  // Decreases (2→1)
  'k2tog': { stitchesConsumed: 2, stitchesCreated: 1, spansCells: 1 },
  'p2tog': { stitchesConsumed: 2, stitchesCreated: 1, spansCells: 1 },
  'ssk': { stitchesConsumed: 2, stitchesCreated: 1, spansCells: 1 },
  'ssp': { stitchesConsumed: 2, stitchesCreated: 1, spansCells: 1 },
  
  // Decreases (3→1)
  'k3tog': { stitchesConsumed: 3, stitchesCreated: 1, spansCells: 1 },
  'p3tog': { stitchesConsumed: 3, stitchesCreated: 1, spansCells: 1 },
  'sssk': { stitchesConsumed: 3, stitchesCreated: 1, spansCells: 1 },
  'cdd': { stitchesConsumed: 3, stitchesCreated: 1, spansCells: 1 },
  'sk2p': { stitchesConsumed: 3, stitchesCreated: 1, spansCells: 1 },
  
  // Cables (n→n)
  'c2f': { stitchesConsumed: 2, stitchesCreated: 2, spansCells: 2 },
  'c2b': { stitchesConsumed: 2, stitchesCreated: 2, spansCells: 2 },
  'c3f': { stitchesConsumed: 3, stitchesCreated: 3, spansCells: 3 },
  'c3b': { stitchesConsumed: 3, stitchesCreated: 3, spansCells: 3 },
  'c4f': { stitchesConsumed: 4, stitchesCreated: 4, spansCells: 4 },
  'c4b': { stitchesConsumed: 4, stitchesCreated: 4, spansCells: 4 },
  'c6f': { stitchesConsumed: 6, stitchesCreated: 6, spansCells: 6 },
  'c6b': { stitchesConsumed: 6, stitchesCreated: 6, spansCells: 6 },
  'c8f': { stitchesConsumed: 8, stitchesCreated: 8, spansCells: 8 },
  'c8b': { stitchesConsumed: 8, stitchesCreated: 8, spansCells: 8 },
  
  // Empty cell
  '': { stitchesConsumed: 0, stitchesCreated: 0, spansCells: 1 },
};

/**
 * Get stitch effect for a given abbreviation
 */
export function getStitchEffect(abbreviation: StitchAbbreviation): StitchEffect {
  return STITCH_EFFECTS[abbreviation] || { stitchesConsumed: 0, stitchesCreated: 0, spansCells: 1 };
}

/**
 * Check if a stitch is a cable stitch
 */
export function isCableStitch(abbreviation: StitchAbbreviation): boolean {
  return abbreviation.startsWith('c') && abbreviation.length >= 3;
}

/**
 * Calculate total stitches consumed by a row
 */
export function calculateStitchesConsumed(stitches: StitchAbbreviation[]): number {
  return stitches.reduce((total, stitch) => {
    return total + getStitchEffect(stitch).stitchesConsumed;
  }, 0);
}

/**
 * Calculate total stitches created by a row
 */
export function calculateStitchesCreated(stitches: StitchAbbreviation[]): number {
  return stitches.reduce((total, stitch) => {
    return total + getStitchEffect(stitch).stitchesCreated;
  }, 0);
}
