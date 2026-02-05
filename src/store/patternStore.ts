import { create } from 'zustand';
import {
  KnittingPattern,
  StitchAbbreviation,
  StitchCell,
  PatternRow,
  UIState,
  ParsedStitch
} from '@/types/pattern.types';
import { DEFAULT_COLORS } from '@/utils/stitchData';
import { getStitchEffect } from '@/utils/stitchEffects';

// Simple UUID generator (browser-compatible)
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface PatternStore {
  // Pattern data
  pattern: KnittingPattern;

  // UI state
  ui: UIState;

  // Actions
  setPatternName: (name: string) => void;
  setStitchAt: (rowIndex: number, colIndex: number, stitch: StitchAbbreviation, colorId?: string) => void;
  fillRow: (rowIndex: number, stitch: StitchAbbreviation, colorId?: string) => void;
  clearCell: (rowIndex: number, colIndex: number) => void;
  addRow: (isRightSide?: boolean) => void;
  deleteRow: (rowIndex: number) => void;
  setSelectedStitch: (stitch: StitchAbbreviation) => void;
  setSelectedColor: (colorId: string) => void;
  setSelectedRow: (rowNumber: number | null) => void;
  toggleCellSelection: (rowIndex: number, colIndex: number) => void;
  clearCellSelection: () => void;
  setActiveTab: (tab: 'grid' | 'text' | '3d') => void;
  updateMetadata: (updates: Partial<KnittingPattern['metadata']>) => void;
  updateStructure: (updates: Partial<KnittingPattern['structure']>) => void;
  resizeGrid: (width: number, height: number) => void;
  setRowStitchCount: (rowIndex: number, stitchCount: number) => void;
  loadPattern: (pattern: KnittingPattern) => void;
  resetPattern: () => void;
  setRowFromText: (rowIndex: number, stitches: ParsedStitch[], textInstruction: string) => void;
}

// Helper to create empty pattern
function createEmptyPattern(): KnittingPattern {
  const now = new Date();
  return {
    id: generateId(),
    version: '1.0',
    metadata: {
      name: 'Untitled Pattern',
      gauge: {
        stitchesPerInch: 4.5,
        rowsPerInch: 6,
        measurementSize: 4,
        measurementUnit: 'inches',
      },
      needleSize: {
        us: 8,
        metric: 5,
        type: 'straight',
      },
      yarnWeight: 'worsted',
      dimensions: {
        width: 8,
        height: 10,
        unit: 'inches',
      },
      difficulty: 'intermediate',
      tags: [],
      category: 'accessory',
    },
    structure: {
      type: 'flat',
      direction: 'bottom-up',
      sections: [],
      castOnCount: 20,
      startsOnRS: true,
    },
    content: {
      rows: createEmptyRows(10, 20),
      colorPalette: DEFAULT_COLORS,
      stitchLibrary: [],
    },
    visualization: {
      garmentType: 'flat-rectangle',
      show3DPreview: false,
      realtimePreview: false,
      displayMode: 'all',
      showStitchCount: true,
      showRowNumbers: true,
      rendering3D: {
        stitchDetail: 'simplified',
        showTexture: true,
        lightingPreset: 'studio',
        cameraAngle: 'perspective',
      },
    },
    createdAt: now,
    updatedAt: now,
  };
}

// Helper to create empty rows
function createEmptyRows(rowCount: number, stitchCount: number): PatternRow[] {
  const rows: PatternRow[] = [];
  for (let i = 0; i < rowCount; i++) {
    rows.push({
      rowNumber: i + 1,
      stitches: Array(stitchCount).fill(null).map(() => ({
        type: '',
        colorId: 'none',
      })),
      isRightSide: i % 2 === 0, // Odd rows (1, 3, 5...) are RS
      expectedStitchCount: stitchCount,
      warnings: [],
    });
  }
  return rows;
}

// Helper to create empty stitch cell
function createEmptyStitchCell(): StitchCell {
  return {
    type: '',
    colorId: 'none',
  };
}

export const usePatternStore = create<PatternStore>((set) => ({
  pattern: createEmptyPattern(),
  
  ui: {
    selectedStitch: 'k',
    selectedColor: 'none',
    selectedRow: null,
    selectedCells: new Set(),
    activeTab: 'grid',
    showGrid: true,
    cellSize: 30,
    zoom: 1,
  },

  setPatternName: (name) => set((state) => ({
    pattern: {
      ...state.pattern,
      metadata: {
        ...state.pattern.metadata,
        name,
      },
      updatedAt: new Date(),
    },
  })),

  setStitchAt: (rowIndex, colIndex, stitch, colorId) => set((state) => {
    const newRows = [...state.pattern.content.rows].map(row => ({
      ...row,
      stitches: [...row.stitches],
    }));
    const row = newRows[rowIndex];
    const newStitches = row.stitches;

    // Get the previous stitch at this position to calculate the net change
    const previousStitch = newStitches[colIndex];
    const newEffect = getStitchEffect(stitch);

    // Calculate net stitch change for rows above based on stitchesCreated
    // - Empty cells ('') are placeholders representing a 1→1 stitch (creates 1)
    // - no-stitch cells don't exist (creates 0)
    // - Regular stitches (K, P) create 1 stitch
    // - Increases (YO, M1) create 1 stitch but consume 0 - NET GAIN for pattern
    // - Increases (KFB) create 2 stitches but consume 1 - NET GAIN for pattern
    // - Decreases (K2TOG) create 1 stitch but consume 2 - NET LOSS for pattern
    //
    // The key insight: increases that consume 0 stitches (YO, M1) add stitches "from nothing"
    // So when replacing an empty placeholder with YO, we need to check if it's a 0-consume increase

    const previousType = previousStitch?.type as StitchAbbreviation || '';
    const previousEffect = getStitchEffect(previousType);

    // Calculate net change based on stitch effects
    // The key is comparing what the stitch CREATES vs what the placeholder would create
    //
    // Examples (when placing on empty placeholder which "creates 1"):
    // - K (1→1): creates 1, placeholder creates 1 → netChange = 0
    // - YO (0→1): creates 1 BUT consumes 0 (adds stitch from nothing) → netChange = +1
    // - KFB (1→2): creates 2, placeholder creates 1 → netChange = +1
    // - K2TOG (2→1): creates 1, placeholder creates 1 → netChange = 0? NO!
    //   K2TOG consumes 2 stitches but only creates 1, so net effect is -1
    //
    // The formula should be: netChange = (newCreated - newConsumed) - (prevCreated - prevConsumed)
    // This gives us the NET effect on stitch count
    //
    // For empty placeholder: assume 1→1 (consumes 1, creates 1), net = 0
    // For YO (0→1): net = 1 - 0 = +1
    // For K (1→1): net = 1 - 1 = 0
    // For K2TOG (2→1): net = 1 - 2 = -1
    // For KFB (1→2): net = 2 - 1 = +1

    let previousNetEffect: number;
    if (previousType === 'no-stitch') {
      previousNetEffect = 0; // Doesn't exist
    } else if (previousType === '') {
      previousNetEffect = 0; // Empty placeholder: 1 created - 1 consumed = 0 net
    } else {
      previousNetEffect = previousEffect.stitchesCreated - previousEffect.stitchesConsumed;
    }

    let newNetEffect: number;
    if (stitch === 'no-stitch') {
      newNetEffect = 0;
    } else {
      newNetEffect = newEffect.stitchesCreated - newEffect.stitchesConsumed;
    }

    const netChange = newNetEffect - previousNetEffect;

    // Handle cable auto-spanning
    if (stitch.startsWith('c')) {
      const spanSize = parseInt(stitch.match(/\d+/)?.[0] || '2');

      // Check if there's enough room (excluding no-stitch cells at the end)
      const actualLength = newStitches.filter(s => s.type !== 'no-stitch').length;
      if (colIndex + spanSize > actualLength) {
        console.warn('Not enough cells for cable');
        return state;
      }

      // Set first cell
      newStitches[colIndex] = {
        type: stitch,
        colorId: colorId || state.ui.selectedColor,
      };

      // Mark subsequent cells as part of cable
      for (let i = 1; i < spanSize; i++) {
        newStitches[colIndex + i] = {
          type: '',
          colorId: colorId || state.ui.selectedColor,
          isPartOfCable: true,
          cableParentIndex: colIndex,
        };
      }
    } else {
      // Regular stitch placement
      newStitches[colIndex] = {
        type: stitch,
        colorId: colorId || state.ui.selectedColor,
      };
    }

    row.stitches = newStitches;

    // Adjust rows above (higher index = higher row number) based on net stitch change
    if (netChange !== 0) {
      for (let i = rowIndex + 1; i < newRows.length; i++) {
        const upperRow = newRows[i];

        if (netChange > 0) {
          // Increase: add more empty stitches to rows above
          for (let j = 0; j < netChange; j++) {
            upperRow.stitches.push(createEmptyStitchCell());
          }
        } else if (netChange < 0) {
          // Decrease: compact no-stitch to end, remove cells from actual, add as no-stitch (stack behavior for LIFO)
          const stitchesToRemove = Math.abs(netChange);

          // Separate actual cells from no-stitch cells
          const actualCells = upperRow.stitches.filter(s => s.type !== 'no-stitch');
          const existingNoStitchCount = upperRow.stitches.length - actualCells.length;

          // Remove cells from the end of actual cells (they'll become no-stitch)
          const remainingActualCells = actualCells.slice(0, actualCells.length - stitchesToRemove);

          // Rebuild: remaining actual cells + all existing no-stitch + new no-stitch at the very end
          upperRow.stitches = [
            ...remainingActualCells,
            ...Array(existingNoStitchCount).fill(null).map(() => ({ type: 'no-stitch' as const, colorId: 'none' })),
            ...Array(stitchesToRemove).fill(null).map(() => ({ type: 'no-stitch' as const, colorId: 'none' }))
          ];
        }
      }

      // For increases: pad rows BELOW with no-stitch at the end to maintain grid alignment
      if (netChange > 0) {
        // Find the new max width
        const maxWidth = Math.max(...newRows.map(r => r.stitches.length));

        // Pad all rows below (and including current) to match max width
        for (let i = 0; i <= rowIndex; i++) {
          const lowerRow = newRows[i];
          while (lowerRow.stitches.length < maxWidth) {
            lowerRow.stitches.push({ type: 'no-stitch', colorId: 'none' });
          }
        }
      }
    }

    return {
      pattern: {
        ...state.pattern,
        content: {
          ...state.pattern.content,
          rows: newRows,
        },
        updatedAt: new Date(),
      },
    };
  }),

  fillRow: (rowIndex, stitch, colorId) => set((state) => {
    const newRows = [...state.pattern.content.rows];
    const row = { ...newRows[rowIndex] };
    
    row.stitches = row.stitches.map(() => ({
      type: stitch,
      colorId: colorId || state.ui.selectedColor,
    }));
    
    newRows[rowIndex] = row;
    
    return {
      pattern: {
        ...state.pattern,
        content: {
          ...state.pattern.content,
          rows: newRows,
        },
        updatedAt: new Date(),
      },
    };
  }),

  clearCell: (rowIndex, colIndex) => set((state) => {
    const newRows = [...state.pattern.content.rows].map(row => ({
      ...row,
      stitches: [...row.stitches],
    }));
    const row = newRows[rowIndex];
    const newStitches = row.stitches;

    // Get the stitch being cleared
    const cell = newStitches[colIndex];
    const cellType = cell?.type as StitchAbbreviation || '';

    // If this cell is a cable parent, clear all cable cells
    if (cellType.startsWith('c')) {
      const spanSize = parseInt(cellType.match(/\d+/)?.[0] || '2');
      for (let i = 0; i < spanSize; i++) {
        newStitches[colIndex + i] = createEmptyStitchCell();
      }
    } else {
      newStitches[colIndex] = createEmptyStitchCell();
    }

    row.stitches = newStitches;

    // Recalculate grid structure based on all increases/decreases
    const baseStitchCount = state.pattern.structure.castOnCount;

    // For each row, calculate what its stitch count should be
    // based on cumulative increases/decreases from rows below
    const expectedStitchCounts: number[] = [];
    let cumulativeChange = 0;

    for (let i = 0; i < newRows.length; i++) {
      // This row should have baseStitchCount + cumulative changes from rows below
      expectedStitchCounts[i] = baseStitchCount + cumulativeChange;

      // Count net effect of all stitches in this row (for rows above)
      let rowNetEffect = 0;
      for (const stitch of newRows[i].stitches) {
        const stitchType = stitch.type as string;
        if (stitchType && stitchType !== 'no-stitch' && stitchType !== '') {
          const effect = getStitchEffect(stitch.type as StitchAbbreviation);
          rowNetEffect += effect.stitchesCreated - effect.stitchesConsumed;
        }
      }

      // Add this row's effect for rows above
      cumulativeChange += rowNetEffect;
    }

    // Find the maximum expected width across ALL rows (for grid alignment)
    const maxExpected = Math.max(...expectedStitchCounts);

    // Adjust each row to match its expected stitch count
    for (let i = 0; i < newRows.length; i++) {
      const currentRow = newRows[i];
      const expected = expectedStitchCounts[i];

      // Count current actual stitches (non-no-stitch)
      const actualCount = currentRow.stitches.filter(s => (s.type as string) !== 'no-stitch').length;

      if (actualCount < expected) {
        // Need MORE stitches - convert trailing no-stitch cells back to empty
        // This happens when a decrease is removed
        // IMPORTANT: Convert from RIGHT to LEFT (LIFO) so the most recently added
        // no-stitch cells are removed first
        let toConvert = expected - actualCount;

        // Find no-stitch cells from the right (most recently added)
        for (let j = currentRow.stitches.length - 1; j >= 0 && toConvert > 0; j--) {
          if ((currentRow.stitches[j].type as string) === 'no-stitch') {
            currentRow.stitches[j] = createEmptyStitchCell();
            toConvert--;
          }
        }
      } else if (actualCount > expected) {
        // Need FEWER stitches - convert trailing actual cells to no-stitch
        // This happens when an increase is removed
        let toConvert = actualCount - expected;

        // Find the rightmost actual (non-no-stitch) cells and convert them to no-stitch
        // This ensures we're removing in LIFO order
        for (let j = currentRow.stitches.length - 1; j >= 0 && toConvert > 0; j--) {
          const stitchType = currentRow.stitches[j].type as string;
          // Convert any non-no-stitch cell (empty placeholders or actual stitches without content)
          if (stitchType !== 'no-stitch' && stitchType === '') {
            // Only convert empty placeholders, not actual stitches with content
            currentRow.stitches[j] = { type: 'no-stitch', colorId: 'none' };
            toConvert--;
          }
        }
      }

      // Trim excess cells beyond maxExpected
      while (currentRow.stitches.length > maxExpected) {
        const lastType = currentRow.stitches[currentRow.stitches.length - 1].type as string;
        if (lastType === '' || lastType === 'no-stitch') {
          currentRow.stitches.pop();
        } else {
          break;
        }
      }

      // Pad with no-stitch if needed to maintain rectangular grid
      while (currentRow.stitches.length < maxExpected) {
        currentRow.stitches.push({ type: 'no-stitch', colorId: 'none' });
      }
    }

    return {
      pattern: {
        ...state.pattern,
        content: {
          ...state.pattern.content,
          rows: newRows,
        },
        updatedAt: new Date(),
      },
    };
  }),

  addRow: (isRightSide) => set((state) => {
    const currentRows = state.pattern.content.rows;
    const stitchCount = currentRows[0]?.stitches.length || 20;
    const newRowNumber = currentRows.length + 1;
    
    // Determine RS/WS: alternate if not specified
    const newIsRightSide = isRightSide !== undefined 
      ? isRightSide 
      : (currentRows[currentRows.length - 1]?.isRightSide ? false : true);
    
    const newRow: PatternRow = {
      rowNumber: newRowNumber,
      stitches: Array(stitchCount).fill(null).map(() => createEmptyStitchCell()),
      isRightSide: newIsRightSide,
      expectedStitchCount: stitchCount,
      warnings: [],
    };
    
    return {
      pattern: {
        ...state.pattern,
        content: {
          ...state.pattern.content,
          rows: [...currentRows, newRow],
        },
        updatedAt: new Date(),
      },
    };
  }),

  deleteRow: (rowIndex) => set((state) => {
    const newRows = state.pattern.content.rows.filter((_, idx) => idx !== rowIndex);
    
    // Renumber rows
    newRows.forEach((row, idx) => {
      row.rowNumber = idx + 1;
    });
    
    return {
      pattern: {
        ...state.pattern,
        content: {
          ...state.pattern.content,
          rows: newRows,
        },
        updatedAt: new Date(),
      },
    };
  }),

  setSelectedStitch: (stitch) => set((state) => ({
    ui: { ...state.ui, selectedStitch: stitch },
  })),

  setSelectedColor: (colorId) => set((state) => ({
    ui: { ...state.ui, selectedColor: colorId },
  })),

  setSelectedRow: (rowNumber) => set((state) => ({
    ui: { ...state.ui, selectedRow: rowNumber },
  })),

  toggleCellSelection: (rowIndex, colIndex) => set((state) => {
    const cellId = `${rowIndex}-${colIndex}`;
    const newSelection = new Set(state.ui.selectedCells);
    
    if (newSelection.has(cellId)) {
      newSelection.delete(cellId);
    } else {
      newSelection.add(cellId);
    }
    
    return {
      ui: { ...state.ui, selectedCells: newSelection },
    };
  }),

  clearCellSelection: () => set((state) => ({
    ui: { ...state.ui, selectedCells: new Set() },
  })),

  setActiveTab: (tab) => set((state) => ({
    ui: { ...state.ui, activeTab: tab },
  })),

  updateMetadata: (updates) => set((state) => ({
    pattern: {
      ...state.pattern,
      metadata: {
        ...state.pattern.metadata,
        ...updates,
      },
      updatedAt: new Date(),
    },
  })),

  updateStructure: (updates) => set((state) => {
    const newStructure = {
      ...state.pattern.structure,
      ...updates,
    };

    // If startsOnRS changed, update all rows' isRightSide
    let newRows = state.pattern.content.rows;
    if ('startsOnRS' in updates || 'type' in updates) {
      const startsOnRS = updates.startsOnRS ?? state.pattern.structure.startsOnRS;
      const isCircular = (updates.type ?? state.pattern.structure.type) === 'circular';

      newRows = state.pattern.content.rows.map((row, index) => ({
        ...row,
        // In circular, all rows are RS; in flat, alternate based on startsOnRS
        isRightSide: isCircular ? true : (startsOnRS ? index % 2 === 0 : index % 2 !== 0),
      }));
    }

    return {
      pattern: {
        ...state.pattern,
        structure: newStructure,
        content: {
          ...state.pattern.content,
          rows: newRows,
        },
        updatedAt: new Date(),
      },
    };
  }),

  resizeGrid: (width, height) => set((state) => {
    const currentRows = state.pattern.content.rows;
    const newRows: PatternRow[] = [];
    
    // Adjust existing rows or create new ones
    for (let i = 0; i < height; i++) {
      if (i < currentRows.length) {
        // Existing row - adjust width
        const row = { ...currentRows[i] };
        const currentStitches = row.stitches;
        
        if (width > currentStitches.length) {
          // Add more stitches
          const additionalStitches = Array(width - currentStitches.length)
            .fill(null)
            .map(() => createEmptyStitchCell());
          row.stitches = [...currentStitches, ...additionalStitches];
        } else if (width < currentStitches.length) {
          // Remove stitches
          row.stitches = currentStitches.slice(0, width);
        }
        
        row.expectedStitchCount = width;
        newRows.push(row);
      } else {
        // New row
        newRows.push({
          rowNumber: i + 1,
          stitches: Array(width).fill(null).map(() => createEmptyStitchCell()),
          isRightSide: i % 2 === 0,
          expectedStitchCount: width,
          warnings: [],
        });
      }
    }
    
    return {
      pattern: {
        ...state.pattern,
        content: {
          ...state.pattern.content,
          rows: newRows,
        },
        structure: {
          ...state.pattern.structure,
          castOnCount: width,
        },
        updatedAt: new Date(),
      },
    };
  }),

  setRowStitchCount: (rowIndex, stitchCount) => set((state) => {
    const newRows = [...state.pattern.content.rows];
    const row = { ...newRows[rowIndex] };
    const currentStitches = row.stitches;
    const maxWidth = Math.max(...state.pattern.content.rows.map(r => r.stitches.length));

    if (stitchCount > currentStitches.length) {
      // Add more stitches
      const additionalStitches = Array(stitchCount - currentStitches.length)
        .fill(null)
        .map(() => createEmptyStitchCell());
      row.stitches = [...currentStitches, ...additionalStitches];
    } else if (stitchCount < currentStitches.length) {
      // Mark extra stitches as no-stitch (keep grid width consistent)
      row.stitches = currentStitches.map((stitch, idx) => {
        if (idx >= stitchCount) {
          return { type: 'no-stitch' as const, colorId: 'none' };
        }
        return stitch;
      });
    }

    // If this row needs more cells than the grid has, pad all rows
    if (stitchCount > maxWidth) {
      newRows.forEach((r, idx) => {
        if (idx !== rowIndex) {
          const additionalStitches = Array(stitchCount - r.stitches.length)
            .fill(null)
            .map(() => ({ type: 'no-stitch' as const, colorId: 'none' }));
          newRows[idx] = { ...r, stitches: [...r.stitches, ...additionalStitches] };
        }
      });
    }

    row.expectedStitchCount = stitchCount;
    newRows[rowIndex] = row;

    return {
      pattern: {
        ...state.pattern,
        content: {
          ...state.pattern.content,
          rows: newRows,
        },
        updatedAt: new Date(),
      },
    };
  }),

  loadPattern: (pattern) => set({ pattern }),

  resetPattern: () => set({ pattern: createEmptyPattern() }),

  setRowFromText: (rowIndex, stitches, textInstruction) => set((state) => {
    // Get reference to the store itself to call setStitchAt
    const store = usePatternStore.getState();

    // Clear the row first
    const newRows = [...state.pattern.content.rows];
    const row = { ...newRows[rowIndex] };

    // Reset all stitches to empty
    row.stitches = row.stitches.map(() => createEmptyStitchCell());

    // Save the text instruction
    row.textInstruction = textInstruction;

    newRows[rowIndex] = row;

    // Update state with cleared row
    const clearedState = {
      pattern: {
        ...state.pattern,
        content: {
          ...state.pattern.content,
          rows: newRows,
        },
        updatedAt: new Date(),
      },
    };

    // Apply the new state
    set(clearedState);

    // Now place each stitch sequentially using setStitchAt
    // This ensures proper cable handling and stitch effect calculations
    let colIndex = 0;
    for (const stitch of stitches) {
      if (colIndex >= row.stitches.length) break;

      // Call setStitchAt to place the stitch
      store.setStitchAt(rowIndex, colIndex, stitch.type, stitch.colorId || 'none');

      // Advance by stitch span (cables take multiple cells)
      const effect = getStitchEffect(stitch.type);
      colIndex += effect.spansCells;
    }

    // Return the final state (will be updated by setStitchAt calls)
    return state;
  }),
}));
