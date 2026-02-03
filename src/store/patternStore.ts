import { create } from 'zustand';
import { 
  KnittingPattern, 
  StitchAbbreviation, 
  StitchCell,
  PatternRow,
  UIState 
} from '@/types/pattern.types';
import { DEFAULT_COLORS } from '@/utils/stitchData';

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
  resizeGrid: (width: number, height: number) => void;
  loadPattern: (pattern: KnittingPattern) => void;
  resetPattern: () => void;
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
    const newRows = [...state.pattern.content.rows];
    const row = { ...newRows[rowIndex] };
    const newStitches = [...row.stitches];
    
    // Handle cable auto-spanning
    if (stitch.startsWith('c')) {
      const spanSize = parseInt(stitch.match(/\d+/)?.[0] || '2');
      
      // Check if there's enough room
      if (colIndex + spanSize > newStitches.length) {
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
    const newRows = [...state.pattern.content.rows];
    const row = { ...newRows[rowIndex] };
    const newStitches = [...row.stitches];
    
    // If this cell is a cable parent, clear all cable cells
    const cell = newStitches[colIndex];
    if (cell.type.startsWith('c')) {
      const spanSize = parseInt(cell.type.match(/\d+/)?.[0] || '2');
      for (let i = 0; i < spanSize; i++) {
        newStitches[colIndex + i] = createEmptyStitchCell();
      }
    } else {
      newStitches[colIndex] = createEmptyStitchCell();
    }
    
    row.stitches = newStitches;
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

  loadPattern: (pattern) => set({ pattern }),

  resetPattern: () => set({ pattern: createEmptyPattern() }),
}));
