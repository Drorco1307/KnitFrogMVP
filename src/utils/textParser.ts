import {
  ParseResult,
  ParsedStitch,
  ParseError,
  ParseWarning,
  ColorDefinition,
  StitchAbbreviation
} from '@/types/pattern.types';
import { isValidStitchAbbreviation } from './stitchData';

/**
 * Parse a text instruction into an array of stitches
 *
 * @param text - The text instruction to parse (e.g., "k2, p2, k2tog, yo, k10")
 * @param delimiter - The delimiter type ('comma' | 'period' | 'pipe')
 * @param colorPalette - Available colors for validation
 * @returns ParseResult with stitches, errors, and warnings
 */
export function parseTextInstruction(
  text: string,
  delimiter: 'comma' | 'period' | 'pipe',
  colorPalette: ColorDefinition[]
): ParseResult {
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];
  const stitches: ParsedStitch[] = [];

  // Handle empty input
  if (!text || text.trim() === '') {
    errors.push({
      message: 'Please enter a text instruction',
    });
    return {
      success: false,
      stitches: [],
      errors,
      warnings,
      totalStitchCount: 0,
    };
  }

  // Get delimiter character
  const delimiterChar = getDelimiterChar(delimiter);

  // Split by delimiter
  const rawTokens = text.split(delimiterChar);

  // Process each token
  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i].trim();

    // Skip empty tokens
    if (!token) continue;

    // Check for repeat notation - asterisk or parenthesis
    if (token.startsWith('*')) {
      const repeatResult = parseRepeatNotation(rawTokens, i, delimiter, colorPalette, '*');
      if (!repeatResult.success) {
        errors.push(...repeatResult.errors);
        continue;
      }
      stitches.push(...repeatResult.stitches);
      warnings.push(...repeatResult.warnings);
      // Skip tokens that were part of the repeat
      i = repeatResult.lastTokenIndex;
      continue;
    }

    if (token.startsWith('(')) {
      const repeatResult = parseRepeatNotation(rawTokens, i, delimiter, colorPalette, '(');
      if (!repeatResult.success) {
        errors.push(...repeatResult.errors);
        continue;
      }
      stitches.push(...repeatResult.stitches);
      warnings.push(...repeatResult.warnings);
      // Skip tokens that were part of the repeat
      i = repeatResult.lastTokenIndex;
      continue;
    }

    // Parse single token
    const tokenResult = parseToken(token, colorPalette);
    if (!tokenResult.success) {
      errors.push(...tokenResult.errors);
      continue;
    }

    // Use the repeat count from the token result (defaults to 1 if no inline repeat)
    const repeatCount = tokenResult.repeatCount || 1;

    // Add the stitches (repeated if necessary)
    for (let r = 0; r < repeatCount; r++) {
      stitches.push(...tokenResult.stitches);
    }
    warnings.push(...tokenResult.warnings);
  }

  return {
    success: errors.length === 0,
    stitches,
    errors,
    warnings,
    totalStitchCount: stitches.length,
  };
}

/**
 * Get the delimiter character from the delimiter type
 */
function getDelimiterChar(delimiter: 'comma' | 'period' | 'pipe'): string {
  switch (delimiter) {
    case 'comma':
      return ',';
    case 'period':
      return '.';
    case 'pipe':
      return '|';
  }
}

/**
 * Parse a single token which may be:
 * - A simple stitch: "k", "p", "k2tog"
 * - A multiplied stitch: "k10", "p5"
 * - A stitch with color: "k2 MC", "p5 CC1"
 * - A stitch with inline repeat: "c4f twice", "k2 x3"
 */
function parseToken(
  token: string,
  colorPalette: ColorDefinition[]
): {
  success: boolean;
  stitches: ParsedStitch[];
  errors: ParseError[];
  warnings: ParseWarning[];
  repeatCount?: number; // Return repeat count if found inline
} {
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];
  const stitches: ParsedStitch[] = [];
  let repeatCount = 1;

  // First, check for inline repeat modifiers (twice, x3, etc.)
  let tokenWithoutRepeat = token;
  const parts = token.trim().split(/\s+/);

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].toLowerCase();

    // Check if last part is a repeat modifier
    if (lastPart === 'twice' || lastPart.startsWith('twice')) {
      repeatCount = 2;
      tokenWithoutRepeat = parts.slice(0, -1).join(' ');

      // Check if the stitch is k or p (without color)
      const stitchToCheck = tokenWithoutRepeat.toLowerCase();
      if (stitchToCheck === 'k' || stitchToCheck === 'p') {
        errors.push({
          message: `Use numeric notation for basic stitches: "${stitchToCheck}2" instead of "${stitchToCheck} twice"`,
          token,
        });
        return { success: false, stitches: [], errors, warnings, repeatCount };
      }
    } else if (lastPart.startsWith('x')) {
      const match = lastPart.match(/^x(\d+)/);
      if (match) {
        repeatCount = parseInt(match[1], 10);
        tokenWithoutRepeat = parts.slice(0, -1).join(' ');

        // Check if the stitch is k or p (without color)
        const stitchToCheck = tokenWithoutRepeat.toLowerCase();
        if (stitchToCheck === 'k' || stitchToCheck === 'p') {
          errors.push({
            message: `Use numeric notation for basic stitches: "${stitchToCheck}${repeatCount}" instead of "${stitchToCheck} x${repeatCount}"`,
            token,
          });
          return { success: false, stitches: [], errors, warnings, repeatCount };
        }
      }
    }
  }

  // Extract color suffix if present
  const { stitchPart, colorId, colorWarning } = extractColor(tokenWithoutRepeat, colorPalette);
  if (colorWarning) warnings.push(colorWarning);

  const abbreviation = stitchPart.toLowerCase();

  // First check if the whole token is a valid stitch abbreviation
  // This handles stitches with numbers like "sl1", "m1l", "k2tog", "c4f", etc.
  if (isValidStitchAbbreviation(abbreviation)) {
    // Add the stitch (will be repeated by caller if repeatCount > 1)
    stitches.push({
      type: abbreviation as StitchAbbreviation,
      colorId,
    });
  } else {
    // Not a valid stitch, so check for multiplier: k10, p5, etc.
    // Match pattern: letters followed by digits (e.g., "k10", "p5")
    const multiplierMatch = stitchPart.match(/^([a-z]+)(\d+)$/i);

    if (multiplierMatch) {
      // Has multiplier
      const baseAbbreviation = multiplierMatch[1].toLowerCase();
      const count = parseInt(multiplierMatch[2], 10);

      if (!isValidStitchAbbreviation(baseAbbreviation)) {
        errors.push({
          message: `Unknown stitch abbreviation: "${baseAbbreviation}"`,
          token: stitchPart,
        });
        return { success: false, stitches: [], errors, warnings, repeatCount };
      }

      // Add the stitch multiple times
      for (let i = 0; i < count; i++) {
        stitches.push({
          type: baseAbbreviation as StitchAbbreviation,
          colorId,
        });
      }
    } else {
      // No multiplier and not a valid stitch - error
      errors.push({
        message: `Unknown stitch abbreviation: "${abbreviation}"`,
        token: stitchPart,
      });
      return { success: false, stitches: [], errors, warnings, repeatCount };
    }
  }

  return { success: true, stitches, errors, warnings, repeatCount };
}

/**
 * Extract color suffix from a token
 * e.g., "k2 MC" → { stitchPart: "k2", colorId: "MC" }
 * Note: Repeat keywords should be stripped before calling this function
 */
function extractColor(
  token: string,
  colorPalette: ColorDefinition[]
): {
  stitchPart: string;
  colorId?: string;
  colorWarning?: ParseWarning;
} {
  // Check for space-separated color suffix
  const parts = token.split(/\s+/);

  if (parts.length === 1) {
    // No color specified
    return { stitchPart: token };
  }

  if (parts.length === 2) {
    const [stitchPart, colorPart] = parts;
    const colorId = colorPart.toUpperCase();

    // Check if color exists in palette
    const colorExists = colorPalette.some(c => c.id === colorId);

    if (!colorExists) {
      return {
        stitchPart,
        colorId: undefined,
        colorWarning: {
          message: `Unknown color "${colorId}". Using default (no color).`,
          type: 'unknown-color',
        },
      };
    }

    return { stitchPart, colorId };
  }

  // More than 2 parts - treat entire thing as stitch part
  return { stitchPart: token };
}

/**
 * Parse repeat notation like "*k2, p2* repeat 5 times", "*k2, p2* x5", "(k2, p2) twice", or "(k2, p2) x3"
 */
function parseRepeatNotation(
  tokens: string[],
  startIndex: number,
  delimiter: 'comma' | 'period' | 'pipe',
  colorPalette: ColorDefinition[],
  marker: '*' | '('
): {
  success: boolean;
  stitches: ParsedStitch[];
  errors: ParseError[];
  warnings: ParseWarning[];
  lastTokenIndex: number;
} {
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];
  const stitches: ParsedStitch[] = [];

  // Determine closing marker
  const closingMarker = marker === '*' ? '*' : ')';

  // Find the repeat pattern boundaries
  let patternStart = -1;
  let patternEnd = -1;
  let repeatCount = 0;

  // Check if pattern starts with the marker
  const firstToken = tokens[startIndex].trim();
  if (firstToken.startsWith(marker)) {
    patternStart = startIndex;

    // Find closing marker (can be in the middle of a token, followed by repeat count)
    for (let i = startIndex; i < tokens.length; i++) {
      const token = tokens[i].trim();

      // Look for closing marker after the start (skip if it's just the opening marker)
      const markerIndex = (i === startIndex) ? token.indexOf(closingMarker, 1) : token.indexOf(closingMarker);

      if (markerIndex !== -1 && i >= startIndex) {
        // Found closing marker
        patternEnd = i;

        // Extract the part after the closing marker
        const afterMarker = token.substring(markerIndex + 1).trim();

        // Check if repeat count is in the same token (e.g., "*k2* x5", "(k2) twice")
        const afterMarkerLower = afterMarker.toLowerCase();

        if (afterMarkerLower === 'twice' || afterMarkerLower.startsWith('twice')) {
          repeatCount = 2;
        } else if (afterMarker.startsWith('x')) {
          const match = afterMarker.match(/x\s*(\d+)/);
          if (match) {
            repeatCount = parseInt(match[1], 10);
          }
        } else if (afterMarkerLower.startsWith('repeat')) {
          const match = afterMarker.match(/repeat\s+(\d+)/i);
          if (match) {
            repeatCount = parseInt(match[1], 10);
          }
        }

        // If not found in same token, check next token
        if (repeatCount === 0 && i + 1 < tokens.length) {
          const nextToken = tokens[i + 1].trim().toLowerCase();

          // Check for "twice"
          if (nextToken === 'twice' || nextToken.startsWith('twice')) {
            repeatCount = 2;
          }
          // Check for "repeat N times" or "repeat N"
          else if (nextToken.startsWith('repeat')) {
            const match = nextToken.match(/repeat\s+(\d+)/);
            if (match) {
              repeatCount = parseInt(match[1], 10);
            }
          }
          // Check for "xN" or "x N"
          else if (nextToken.startsWith('x')) {
            const match = nextToken.match(/x\s*(\d+)/);
            if (match) {
              repeatCount = parseInt(match[1], 10);
            }
          }
        }

        break;
      }
    }
  }

  // Validate repeat pattern
  if (patternStart === -1 || patternEnd === -1) {
    const exampleFormat = marker === '*' ? '"*pattern*"' : '"(pattern)"';
    errors.push({
      message: `Unbalanced repeat markers (${marker}${closingMarker}). Please use ${exampleFormat} format.`,
      token: tokens[startIndex],
    });
    return {
      success: false,
      stitches: [],
      errors,
      warnings,
      lastTokenIndex: startIndex,
    };
  }

  if (repeatCount === 0) {
    const exampleFormat = marker === '*'
      ? '"*pattern* repeat N times", "*pattern* xN", or "*pattern* twice"'
      : '"(pattern) repeat N times", "(pattern) xN", or "(pattern) twice"';
    errors.push({
      message: `Repeat count not found. Use ${exampleFormat}.`,
      token: tokens.slice(patternStart, patternEnd + 1).join(', '),
    });
    return {
      success: false,
      stitches: [],
      errors,
      warnings,
      lastTokenIndex: patternEnd,
    };
  }

  // Extract pattern tokens (remove the markers)
  const patternTokens: string[] = [];

  // First token: remove leading marker
  const firstPatternToken = tokens[patternStart].trim().substring(1).trim();
  if (firstPatternToken) patternTokens.push(firstPatternToken);

  // Middle tokens: add as-is
  for (let i = patternStart + 1; i < patternEnd; i++) {
    patternTokens.push(tokens[i].trim());
  }

  // Last token: remove trailing closing marker
  const lastPatternToken = tokens[patternEnd].trim();
  const endMarkerIndex = lastPatternToken.indexOf(closingMarker);
  const cleanLastToken = lastPatternToken.substring(0, endMarkerIndex).trim();
  if (cleanLastToken) patternTokens.push(cleanLastToken);

  // Parse pattern tokens
  const patternStitches: ParsedStitch[] = [];
  for (const token of patternTokens) {
    if (!token) continue;

    const tokenResult = parseToken(token, colorPalette);
    if (!tokenResult.success) {
      errors.push(...tokenResult.errors);
      continue;
    }
    patternStitches.push(...tokenResult.stitches);
    warnings.push(...tokenResult.warnings);
  }

  // Repeat the pattern
  for (let i = 0; i < repeatCount; i++) {
    stitches.push(...patternStitches);
  }

  // Figure out last token index
  // If repeat count was in the same token as closing marker, we're done with patternEnd
  // If repeat count was in a separate token, we need to skip that token too
  let lastTokenIndex = patternEnd;

  // Check if the closing token had the repeat count embedded
  const closingToken = tokens[patternEnd].trim();
  const markerIdx = (patternEnd === patternStart) ? closingToken.indexOf(closingMarker, 1) : closingToken.indexOf(closingMarker);
  const afterClosingMarker = closingToken.substring(markerIdx + 1).trim();
  const afterClosingMarkerLower = afterClosingMarker.toLowerCase();
  const hasEmbeddedRepeat = afterClosingMarkerLower.startsWith('repeat')
    || afterClosingMarker.startsWith('x')
    || afterClosingMarkerLower === 'twice'
    || afterClosingMarkerLower.startsWith('twice');

  // If no embedded repeat, check if next token has the repeat count
  if (!hasEmbeddedRepeat && patternEnd + 1 < tokens.length) {
    const nextToken = tokens[patternEnd + 1].trim().toLowerCase();
    if (nextToken.startsWith('repeat') || nextToken.startsWith('x') || nextToken === 'twice' || nextToken.startsWith('twice')) {
      lastTokenIndex = patternEnd + 1;
    }
  }

  return {
    success: errors.length === 0,
    stitches,
    errors,
    warnings,
    lastTokenIndex,
  };
}
