import { StitchCell } from '@/types/pattern.types';

/**
 * Check if two stitches are identical (same type and color)
 */
function stitchesEqual(a: StitchCell, b: StitchCell): boolean {
  return a.type === b.type && a.colorId === b.colorId;
}

/**
 * Check if a pattern repeats starting at a given index
 * Returns the repeat count if found, or 0 if no repeat
 */
function findRepeatPattern(stitches: StitchCell[], startIndex: number, patternLength: number): number {
  if (startIndex + patternLength * 2 > stitches.length) return 0;

  let repeatCount = 0;
  let currentIndex = startIndex;

  while (currentIndex + patternLength <= stitches.length) {
    // Check if the next 'patternLength' stitches match the pattern
    let matches = true;
    for (let i = 0; i < patternLength; i++) {
      if (!stitchesEqual(stitches[startIndex + i], stitches[currentIndex + i])) {
        matches = false;
        break;
      }
    }

    if (matches) {
      repeatCount++;
      currentIndex += patternLength;
    } else {
      break;
    }
  }

  return repeatCount >= 2 ? repeatCount : 0;
}

/**
 * Convert an array of StitchCell objects back to text notation
 * Groups consecutive stitches of the same type and color
 *
 * @param stitches - Array of stitch cells from a row
 * @param isRightSide - Whether this is a right side (RS) row. RS rows are read right-to-left, WS rows left-to-right
 * @param abbreviateRepeats - Whether to detect and abbreviate repeating patterns (e.g., "(yo, k2) twice")
 * @returns Object with text representation and hasGaps flag
 */
export function stitchesToText(
  stitches: StitchCell[],
  isRightSide: boolean = false,
  abbreviateRepeats: boolean = false
): { text: string; hasGaps: boolean } {
  if (stitches.length === 0) return { text: '', hasGaps: false };

  // Check if there are gaps (empty cells between non-empty cells)
  let hasGaps = false;
  let foundNonEmpty = false;

  for (let i = 0; i < stitches.length; i++) {
    const hasStitch = stitches[i].type && stitches[i].type !== 'no-stitch';

    if (hasStitch) {
      foundNonEmpty = true;
    } else if (foundNonEmpty) {
      // Found an empty cell after a non-empty cell - check if there are more non-empty cells after
      for (let j = i + 1; j < stitches.length; j++) {
        if (stitches[j].type && stitches[j].type !== 'no-stitch') {
          hasGaps = true;
          break;
        }
      }
      if (hasGaps) break;
    }
  }

  // Filter out empty cells and no-stitch cells
  const nonEmptyStitches = stitches.filter(s => s.type && s.type !== 'no-stitch');

  if (nonEmptyStitches.length === 0) return { text: '', hasGaps: false };

  // For Right Side (RS) rows, read right-to-left (reverse the array)
  // For Wrong Side (WS) rows, read left-to-right (as-is)
  const stitchesInReadingOrder = isRightSide ? [...nonEmptyStitches].reverse() : nonEmptyStitches;

  const tokens: string[] = [];
  let i = 0;

  while (i < stitchesInReadingOrder.length) {
    // Try to find repeating patterns if abbreviation is enabled
    let foundRepeat = false;

    if (abbreviateRepeats) {
      // Try different pattern lengths and find the one with the best repeat count
      const maxPatternLength = Math.floor((stitchesInReadingOrder.length - i) / 2);

      let bestPattern: { length: number; count: number } | null = null;

      // Evaluate all possible pattern lengths
      for (let patternLength = 1; patternLength <= maxPatternLength; patternLength++) {
        const repeatCount = findRepeatPattern(stitchesInReadingOrder, i, patternLength);

        if (repeatCount >= 2) {
          // Check if this pattern is valid (not single k/p)
          const patternStitches = stitchesInReadingOrder.slice(i, i + patternLength);
          const uniqueStitchTypes = new Set(
            patternStitches.map(s => s.type.toLowerCase() + (s.colorId || ''))
          );

          // Skip single k/p patterns
          if (uniqueStitchTypes.size === 1) {
            const stitchType = patternStitches[0].type.toLowerCase();
            if (stitchType === 'k' || stitchType === 'p') {
              continue;
            }
          }

          // Prefer patterns that cover more stitches (length * count)
          // and have higher repeat counts
          const coverage = patternLength * repeatCount;
          const currentBest = bestPattern ? bestPattern.length * bestPattern.count : 0;

          if (!bestPattern || coverage > currentBest ||
              (coverage === currentBest && repeatCount > bestPattern.count)) {
            bestPattern = { length: patternLength, count: repeatCount };
          }
        }
      }

      // Use the best pattern found
      if (bestPattern && bestPattern.count >= 2) {
        const patternLength = bestPattern.length;
        const repeatCount = bestPattern.count;
        const patternStitches = stitchesInReadingOrder.slice(i, i + patternLength);

        // Convert pattern stitches to tokens, grouping consecutive stitches
        const patternTokens: string[] = [];
        let j = 0;
        while (j < patternStitches.length) {
          const currentStitch = patternStitches[j];

          // Count consecutive stitches of the same type and color within the pattern
          let count = 1;
          while (
            j + count < patternStitches.length &&
            patternStitches[j + count].type === currentStitch.type &&
            patternStitches[j + count].colorId === currentStitch.colorId
          ) {
            count++;
          }

          // Build the token
          let token = currentStitch.type;

          // Add count if more than 1
          if (count > 1) {
            // k and p use numeric notation, others can use "twice"
            const stitchType = currentStitch.type.toLowerCase();
            if (count === 2 && stitchType !== 'k' && stitchType !== 'p') {
              token += ' twice';
            } else {
              token += count.toString();
            }
          }

          // Add color if specified
          if (currentStitch.colorId && currentStitch.colorId !== 'none') {
            token += ' ' + currentStitch.colorId;
          }

          patternTokens.push(token);
          j += count;
        }

        // Build the repeat notation
        const patternText = patternTokens.join(', ');
        let repeatToken: string;

        if (repeatCount === 2) {
          repeatToken = `(${patternText}) twice`;
        } else {
          repeatToken = `(${patternText}) x${repeatCount}`;
        }

        tokens.push(repeatToken);
        i += patternLength * repeatCount;
        foundRepeat = true;
      }
    }

    if (!foundRepeat) {
      // No repeat found, handle as normal single stitch or consecutive stitches
      const currentStitch = stitchesInReadingOrder[i];

      // Count consecutive stitches of the same type and color
      let count = 1;
      while (
        i + count < stitchesInReadingOrder.length &&
        stitchesInReadingOrder[i + count].type === currentStitch.type &&
        stitchesInReadingOrder[i + count].colorId === currentStitch.colorId
      ) {
        count++;
      }

      // Build the token
      let token = currentStitch.type;

      // Add count if more than 1
      if (count > 1) {
        // Special case: if count is 2 and stitch is NOT k or p, use "twice"
        // k and p must always use numeric notation (k2, p2, k3, p3, etc.)
        const stitchType = currentStitch.type.toLowerCase();
        if (count === 2 && stitchType !== 'k' && stitchType !== 'p') {
          token += ' twice';
        } else {
          token += count.toString();
        }
      }

      // Add color if specified
      if (currentStitch.colorId && currentStitch.colorId !== 'none') {
        token += ' ' + currentStitch.colorId;
      }

      tokens.push(token);
      i += count;
    }
  }

  return { text: tokens.join(', '), hasGaps };
}

/**
 * Convert all pattern rows to text notation
 * Returns an array of objects with text and hasGaps flag
 */
export function patternRowsToText(rows: Array<{ stitches: StitchCell[] }>): Array<{ text: string; hasGaps: boolean }> {
  return rows.map(row => stitchesToText(row.stitches));
}
