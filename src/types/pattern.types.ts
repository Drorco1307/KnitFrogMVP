// ===== MAIN PATTERN OBJECT =====

export interface KnittingPattern {
  id: string;
  version: string;
  metadata: PatternMetadata;
  structure: PatternStructure;
  content: PatternContent;
  visualization: VisualizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

// ===== METADATA =====

export interface PatternMetadata {
  name: string;
  description?: string;
  author?: string;
  gauge: Gauge;
  needleSize: NeedleSize;
  yarnWeight: YarnWeight;
  yarnInfo?: YarnInfo[];
  dimensions: PatternDimensions;
  difficulty?: Difficulty;
  tags?: string[];
  category?: PatternCategory;
}

export interface Gauge {
  stitchesPerInch: number;
  rowsPerInch: number;
  measurementSize: number;
  measurementUnit: 'inches' | 'cm';
}

export interface NeedleSize {
  us?: number;
  metric?: number;
  type?: 'straight' | 'circular' | 'dpn';
  cableLength?: number;
}

export type YarnWeight = 
  | 'lace' 
  | 'fingering' 
  | 'sport' 
  | 'DK' 
  | 'worsted' 
  | 'aran' 
  | 'bulky' 
  | 'super-bulky' 
  | 'jumbo';

export interface YarnInfo {
  colorId: string;
  brand?: string;
  name?: string;
  fiberContent?: string;
  yardage?: number;
  unit?: 'yards' | 'meters';
}

export interface PatternDimensions {
  width?: number;
  height?: number;
  circumference?: number;
  unit: 'inches' | 'cm';
}

export type Difficulty = 
  | 'beginner' 
  | 'easy' 
  | 'intermediate' 
  | 'advanced' 
  | 'expert';

export type PatternCategory = 
  | 'garment' 
  | 'accessory' 
  | 'home-decor' 
  | 'toy' 
  | 'other';

// ===== STRUCTURE =====

export interface PatternStructure {
  type: 'flat' | 'circular';
  direction?: 'bottom-up' | 'top-down' | 'side-to-side';
  joinedInRound?: boolean;
  sections: PatternSection[];
  castOnCount: number;
  startsOnRS: boolean; // Whether row 1 starts on Right Side
}

export interface PatternSection {
  id: string;
  name: string;
  startRow: number;
  endRow: number;
  notes?: string;
}

// ===== CONTENT =====

export interface PatternContent {
  rows: PatternRow[];
  colorPalette: ColorDefinition[];
  stitchLibrary?: StitchDefinition[];
}

export interface PatternRow {
  rowNumber: number;
  stitches: StitchCell[];
  textInstruction?: string;
  isRightSide: boolean;
  sectionId?: string;
  notes?: string;
  expectedStitchCount: number;
  warnings?: string[];
}

// Individual stitch cell in the grid
export interface StitchCell {
  type: StitchAbbreviation;
  colorId?: string;
  isPartOfCable?: boolean;
  cableParentIndex?: number;
}

// All supported stitch abbreviations
export type StitchAbbreviation =
  // Basic
  | 'k' | 'p' | 'sl' | 'sl1'
  // Increases
  | 'yo' | 'kfb' | 'pfb' | 'm1' | 'm1l' | 'm1r' | 'm1p'
  // Decreases
  | 'k2tog' | 'p2tog' | 'ssk' | 'ssp' | 'k3tog' | 'p3tog'
  | 'sssk' | 'cdd' | 'sk2p'
  // Cables
  | 'c2f' | 'c2b' | 'c3f' | 'c3b' | 'c4f' | 'c4b'
  | 'c6f' | 'c6b' | 'c8f' | 'c8b'
  // Empty cell
  | ''
  // Non-existent cell (for shaping - black, non-interactive)
  | 'no-stitch';

export interface ColorDefinition {
  id: string;
  name: string;
  hex: string;
  yarnInfoIndex?: number;
}

export interface StitchDefinition {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  instructions: string;
}

// ===== VISUALIZATION =====

export interface VisualizationSettings {
  garmentType: GarmentType;
  show3DPreview: boolean;
  realtimePreview: boolean;
  displayMode: 'chart' | 'text' | 'grid' | 'all';
  showStitchCount: boolean;
  showRowNumbers: boolean;
  rendering3D: Rendering3DOptions;
}

export type GarmentType = 
  | 'flat-rectangle'
  | 'flat-shaped'
  | 'hat'
  | 'tube'
  | 'sweater-assembled'
  | 'sock'
  | 'glove'
  | 'custom';

export interface Rendering3DOptions {
  stitchDetail: 'simplified' | 'realistic';
  showTexture: boolean;
  lightingPreset: 'studio' | 'natural' | 'dramatic';
  cameraAngle: 'front' | 'perspective' | 'top';
}

// ===== STITCH CATEGORIES (for UI organization) =====

export interface StitchCategory {
  name: string;
  stitches: StitchInfo[];
}

export interface StitchInfo {
  abbreviation: StitchAbbreviation;
  fullName: string;
  description: string;
  spansCells?: number; // For cables
}

// ===== VALIDATION =====

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  errors: ValidationError[];
}

export interface ValidationWarning {
  rowNumber: number;
  message: string;
  type: 'stitch-count-mismatch' | 'missing-stitch' | 'other';
}

export interface ValidationError {
  rowNumber: number;
  message: string;
  type: 'invalid-stitch' | 'cable-overflow' | 'other';
}

// ===== TEXT PARSER =====

export interface ParseResult {
  success: boolean;
  stitches: ParsedStitch[];
  errors: ParseError[];
  warnings: ParseWarning[];
  totalStitchCount: number;
}

export interface ParsedStitch {
  type: StitchAbbreviation;
  colorId?: string;
}

export interface ParseError {
  message: string;
  token?: string;
  position?: number;
}

export interface ParseWarning {
  message: string;
  type: 'stitch-count' | 'unknown-color' | 'stitch-effect';
}

// ===== UI STATE =====

export interface UIState {
  selectedStitch: StitchAbbreviation;
  selectedColor: string;
  selectedRow: number | null;
  selectedCells: Set<string>; // cell coordinates as "row-col"
  activeTab: 'grid' | 'text' | '3d';
  showGrid: boolean;
  cellSize: number;
  zoom: number;
  abbreviateRepeats: boolean; // Whether to show abbreviated repeat patterns in text view
}
