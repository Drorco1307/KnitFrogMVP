# Knitting Pattern Editor - Product Requirements Document (PRD)

## Document Information
**Version**: 1.0  
**Date**: February 3, 2026  
**Status**: MVP Planning  
**Author**: Product Planning Session

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Product Vision](#product-vision)
3. [Target Audience](#target-audience)
4. [Core Features](#core-features)
5. [Technical Architecture](#technical-architecture)
6. [Data Models](#data-models)
7. [User Interface Specifications](#user-interface-specifications)
8. [User Flows](#user-flows)
9. [Technical Requirements](#technical-requirements)
10. [MVP Scope](#mvp-scope)
11. [Future Enhancements](#future-enhancements)
12. [Success Metrics](#success-metrics)

---

## Executive Summary

The Knitting Pattern Editor is a web-based application that enables knitters to design custom knitting patterns through an intuitive grid-based interface, visualize them in 3D, and export them for use. The MVP focuses on flat knitting patterns with basic stitch types, cables, and colorwork, targeting both beginners and experienced knitters who want to create and modify patterns digitally.

**Key Value Propositions:**
- Visual pattern creation with instant feedback
- 3D preview of finished piece
- Support for both grid editing and text input
- Export capabilities for sharing and printing

---

## Product Vision

### Long-term Vision
To become the go-to platform for knitters worldwide to design, share, and collaborate on knitting patterns, supporting all knitting techniques and garment types with realistic 3D visualization.

### MVP Vision
Create a functional pattern editor that allows users to design flat knitting patterns, visualize them in simplified 3D, and save/load their work.

### Success Criteria
- Users can create a complete flat pattern from scratch
- Users can edit patterns using both grid and text input
- Users can see a 3D representation of their pattern
- Users can save and reload their patterns
- Application works reliably in modern web browsers

---

## Target Audience

### Primary Users
- **Hobby Knitters**: Intermediate level, familiar with standard abbreviations
- **Pattern Designers**: Creating original patterns for personal use or sharing
- **Knitting Instructors**: Need to create custom patterns for students

### User Characteristics
- Age range: 25-65
- Tech comfort: Basic to intermediate
- Knitting experience: Intermediate to advanced
- Primary devices: Desktop/laptop (tablet support desirable)

### User Needs
1. Easy way to visualize pattern ideas before knitting
2. Ability to modify existing patterns
3. Tools to calculate stitch counts and gauge
4. Way to see how colorwork will look
5. Export patterns in readable format

---

## Core Features

### 1. Grid-Based Pattern Editor

#### Description
Visual grid where each cell represents a stitch. Users can click or drag to place stitches.

#### Requirements
- **Grid Display**
  - Configurable width (number of stitches per row)
  - Configurable height (number of rows)
  - Minimum: 10 stitches × 10 rows
  - Maximum: 200 stitches × 500 rows
  - Cell size: 30px × 30px (may be adjustable in settings)

- **Row Management**
  - Rows numbered starting from 1 at the bottom, incrementing upward
  - Row numbers displayed on the side where the row starts:
    - RS (Right Side) rows: number on the RIGHT
    - WS (Wrong Side) rows: number on the LEFT
  - Visual indicator for RS vs WS (label shown)
  - Ability to add/delete rows
  - Alternating RS/WS by default (configurable for circular knitting)

- **Stitch Placement**
  - Click to place single stitch
  - Click and drag to place multiple stitches of same type
  - Right-click to delete single stitch
  - Right-click and drag to delete multiple stitches
  - Selected stitch type and color applied on placement

- **Cell Highlighting**
  - Click on row number: highlight entire row
  - Click on cell: select individual cell
  - Shift+click: select range of cells
  - Visual feedback: highlighted cells show distinct background color

- **Visual Indicators**
  - Different background colors for stitch types:
    - Knit: Light blue (#e6f3ff)
    - Purl: Light orange (#fff5e6)
    - Cable: Light pink (#ffe6f0)
    - Decrease: Light red (#ffe6e6)
    - Increase: Light green (#e6ffe6)
  - Stitch abbreviation displayed in cell
  - Color overlay for colorwork patterns

### 2. Stitch Palette

#### Description
Dropdown selector in toolbar showing available stitches organized by category.

#### Supported Stitches (MVP)

**Basic Stitches:**
- K (Knit)
- P (Purl)
- SL or SL1 (Slip stitch)

**Increases:**
- YO (Yarn Over)
- KFB (Knit Front and Back)
- PFB (Purl Front and Back)
- M1 (Make One)
- M1L (Make One Left)
- M1R (Make One Right)

**Decreases:**
- K2TOG (Knit Two Together)
- P2TOG (Purl Two Together)
- SSK (Slip Slip Knit)
- SSP (Slip Slip Purl)
- K3TOG (Knit Three Together)
- CDD (Central Double Decrease)

**Cables:**
- C2F, C2B (Cable 2 Front/Back)
- C4F, C4B (Cable 4 Front/Back)
- C6F, C6B (Cable 6 Front/Back)
- C8F, C8B (Cable 8 Front/Back)

#### Behavior
- Dropdown button shows currently selected stitch
- Click to open categorized list
- Click stitch to select (closes dropdown)
- Current selection persists until changed
- Default: K (Knit)

### 3. Color Palette

#### Description
Color selector in toolbar for colorwork patterns.

#### Requirements
- Dropdown showing grid of available colors
- Default colors provided:
  - Main Color (MC): #4A90E2 (blue)
  - Contrast Color 1 (CC1): #E63946 (red)
  - Contrast Color 2 (CC2): #F1C40F (yellow)
  - Contrast Color 3 (CC3): #2ECC71 (green)
  - Contrast Color 4 (CC4): #9B59B6 (purple)
  - Contrast Color 5 (CC5): #E67E22 (orange)
  - Contrast Color 6 (CC6): #34495E (dark gray)
- Ability to add custom colors (future enhancement)
- Current selection shown in toolbar button
- Default: Main Color

#### Color Application
- Colors combined with stitch type
- Internal representation: `"k:MC"`, `"p:CC1"`, etc.
- Visual display: stitch cell background colored + abbreviation shown

### 4. Text Input Parser

#### Description
Alternative input method where users type row instructions using standard knitting abbreviations.

#### Requirements
- Text area for entering stitch instructions
- Row number selector
- Parse button to convert text to grid
- Support for:
  - Comma-separated: `"k2, p2, k2tog, yo, k10"`
  - Period-separated: `"k2. p2. k2tog. yo. k10"`
  - Pipe-separated: `"k2 | p2 | k2tog | yo | k10"`
  - Repeat notation: `"*k2, p2* repeat 5 times"` or `"*k2, p2* x5"`
  - Color notation: `"k2 MC, k2 CC1"`

#### Parsing Logic
- Split by delimiter (comma, period, pipe)
- Trim whitespace
- Recognize stitch abbreviations (case-insensitive)
- Expand repeats into individual stitches
- Parse color suffixes
- Generate array of stitches: `['k', 'k', 'p', 'p', 'k2tog', 'yo', ...]`

#### Validation
- Check if parsed stitch count matches row width
- Warn if mismatches (non-blocking)
- Validate all abbreviations are recognized
- Error message for unknown stitches

#### Preview
- Show parsed result before adding to grid
- Display: "Will create: ['k', 'k', 'p', 'p', ...], Expected count: 20"
- Allow user to review before confirming

### 5. Cable Auto-Spanning

#### Description
When a cable stitch is placed, automatically fill the required number of cells.

#### Behavior
- C2F/C2B: Spans 2 cells
- C4F/C4B: Spans 4 cells
- C6F/C6B: Spans 6 cells
- C8F/C8B: Spans 8 cells

#### Implementation
- First cell: Shows cable abbreviation (e.g., "C4B")
- Subsequent cells: Marked as part of cable (empty text, same background color)
- Internal tracking: Subsequent cells reference parent cable
- Dragging: Each click/drag position creates new cable span

#### Edge Cases
- If not enough cells remain in row, show warning
- Prevent partial cable placement at row end
- Deletion: Removing first cable cell removes entire span

### 6. Pattern Metadata

#### Description
Information about the pattern beyond the stitch data.

#### Fields
- **Pattern Name** (required): Text input, max 100 chars
- **Description** (optional): Text area, max 500 chars
- **Author** (optional): Text input, max 50 chars
- **Pattern Type**: Dropdown - "Flat Knitting" or "Circular Knitting"
- **Direction**: Dropdown - "Bottom-Up", "Top-Down", "Side-to-Side"
- **Dimensions**:
  - Width: Number input (inches or cm)
  - Height: Number input (inches or cm)
  - Unit selector: "inches" or "cm"
- **Gauge**:
  - Stitches per inch: Number input (decimal, e.g., 5.5)
  - Rows per inch: Number input (decimal, e.g., 7)
  - Measurement size: Number input (default: 4)
- **Needle Size**:
  - US size: Number input (e.g., 8)
  - Metric size: Number input (mm, e.g., 5)
  - Type: Dropdown - "Straight", "Circular", "DPN"
- **Yarn Weight**: Dropdown - "Lace", "Fingering", "Sport", "DK", "Worsted", "Aran", "Bulky", "Super Bulky", "Jumbo"
- **Difficulty**: Dropdown - "Beginner", "Easy", "Intermediate", "Advanced", "Expert"
- **Tags**: Text input, comma-separated

#### Display Location
- Left sidebar panel
- Collapsible sections for organization
- Auto-save on change (after debounce)

### 7. Stitch Count Validation

#### Description
Real-time validation of stitch counts across rows.

#### Validation Rules

**Stitch Effects Table:**
```
Basic (1→1): k, p, sl
Increases (0→1): yo, m1, m1l, m1r
Increases (1→2): kfb, pfb
Decreases (2→1): k2tog, p2tog, ssk, ssp
Decreases (3→1): k3tog, cdd
Cables (n→n): c2f, c2b, c4f, c4b, c6f, c6b, c8f, c8b
```

#### Validation Process
1. **Row Consumption Check**:
   - Count how many stitches the row consumes from previous row
   - Compare to previous row's stitch count
   - Warn if mismatch

2. **Row Creation Check**:
   - Count how many stitches the row creates
   - Compare to expected stitch count for this row
   - Warn if mismatch

3. **Pattern-Level Check**:
   - Ensure all rows can connect (output of row N = input to row N+1)
   - Highlight problematic rows

#### Warning Display
- Non-blocking warnings shown in status bar
- Format: `"⚠ Row 5: Expected 20 stitches but found 19. Check for missing stitch."`
- Color-coded: Yellow for warnings, Red for errors
- Click warning to highlight affected row

#### Status Bar Display
- **Current Row**: Number of selected/active row
- **Stitch Count**: Count of stitches in current row
- **Pattern Status**: "✓ Valid" (green) or "⚠ Warnings" (yellow) or "✗ Errors" (red)
- **Active Warning**: Most recent validation warning

### 8. 3D Visualization

#### Description
Three-dimensional preview of the knitted fabric showing how the pattern will look when knitted.

#### MVP Implementation
- **Rendering Library**: Three.js via React Three Fiber
- **Detail Level**: Simplified representation
  - Each stitch represented as a simple geometric shape
  - Knit stitches: V-shaped bumps
  - Purl stitches: Horizontal ridges
  - Cables: Twisted/braided appearance
- **Garment Type (MVP)**: Flat rectangle only
  - Represents scarf, dishcloth, blanket panel
  - Lies flat or slightly curved
  - Shows both sides (front and back)

#### Features
- **Camera Controls**:
  - Orbit: Click and drag to rotate
  - Zoom: Scroll wheel
  - Pan: Right-click and drag
  - Reset button to return to default view
- **Lighting**: Studio lighting preset (three-point lighting)
- **Background**: Neutral gradient
- **Grid Toggle**: Optional reference grid
- **Real-time Toggle**: Checkbox to enable/disable live updates
  - If enabled: Updates as user edits pattern
  - If disabled: Updates only when user clicks "Refresh Preview"

#### Rendering Logic
1. Parse pattern data (rows × stitches array)
2. Generate 3D mesh for fabric base
3. For each stitch:
   - Determine stitch type
   - Place appropriate geometry at grid position
   - Apply color from color palette
   - Add slight random variation for realism
4. Apply lighting and materials
5. Render to canvas

#### Performance Considerations
- Limit geometry complexity for large patterns
- Use instancing for repeated stitch types
- Debounce real-time updates (500ms delay)
- Show loading indicator for complex patterns

### 9. Save and Load Patterns

#### Description
Persist patterns so users can return to their work.

#### MVP Implementation
- **Storage**: Browser Local Storage
- **Format**: JSON
- **Features**:
  - Save current pattern
  - Load previously saved pattern
  - Auto-save every 30 seconds (if changes detected)
  - List of saved patterns (name + date)

#### Data Structure
See "Data Models" section for complete JSON schema.

#### User Interface
- **Save Button**: In header toolbar
  - Click to save current pattern
  - Shows "Saved!" confirmation (3 seconds)
- **Load Button**: In header toolbar
  - Click to open modal with list of saved patterns
  - Shows: Pattern name, last modified date, thumbnail (future)
  - Click pattern to load
  - Confirmation if current pattern has unsaved changes
- **Auto-save Indicator**: Small text in header
  - "Last saved: 2 minutes ago"
  - Updates automatically

#### Future Enhancement (Post-MVP)
- Backend database storage
- User accounts and authentication
- Cloud sync across devices
- Pattern sharing and public gallery

### 10. Export Functionality

#### Description
Export patterns in various formats for printing, sharing, or use with other tools.

#### MVP Formats

**1. JSON Export**
- Complete pattern data structure
- For programmatic use or backup
- One-click download

**2. Text Export**
- Row-by-row written instructions
- Format example:
  ```
  Row 1 (RS): k20
  Row 2 (WS): p20
  Row 3 (RS): k2, p2, k2tog, yo, k12
  ```
- Includes pattern metadata at top
- One-click download as .txt file

**3. PDF Export** (Future Enhancement)
- Formatted pattern document
- Includes metadata, instructions, and chart
- Print-ready

#### Export UI
- Export button in header
- Opens modal with format options
- Click format to download
- Shows "Downloading..." indicator

---

## Technical Architecture

### Technology Stack

#### Frontend
- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand (lightweight, simple API)
- **Styling**: TailwindCSS
- **3D Rendering**: React Three Fiber (Three.js wrapper)
- **Grid/Canvas**: HTML Canvas API or DOM-based grid (decide during implementation)

#### Backend
- **Framework**: ASP.NET Core 8 Web API
- **Language**: C# 12
- **Database**: PostgreSQL (or SQL Server)
- **ORM**: Entity Framework Core
- **Authentication**: JWT (future enhancement)

#### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **IDE**: Visual Studio Code (frontend), Visual Studio (backend)
- **API Testing**: Swagger/OpenAPI

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              React Application                    │   │
│  │  ┌──────────────┐  ┌──────────────┐             │   │
│  │  │ Pattern Editor│  │ 3D Viewer    │             │   │
│  │  │ Component     │  │ (React 3     │             │   │
│  │  │               │  │  Fiber)      │             │   │
│  │  └──────────────┘  └──────────────┘             │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │      Zustand State Management            │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                          │ HTTP/REST API                 │
│                          ▼                               │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                  ASP.NET Core Web API                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │              API Controllers                      │   │
│  │  ┌──────────────┐  ┌──────────────┐             │   │
│  │  │ Pattern      │  │ Export       │             │   │
│  │  │ Controller   │  │ Controller   │             │   │
│  │  └──────────────┘  └──────────────┘             │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Business Logic Layer                 │   │
│  │  ┌──────────────┐  ┌──────────────┐             │   │
│  │  │ Pattern      │  │ Text Parser  │             │   │
│  │  │ Validation   │  │ Service      │             │   │
│  │  └──────────────┘  └──────────────┘             │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Entity Framework Core (ORM)               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│               PostgreSQL Database                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Tables: Patterns, Users (future), etc.          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Component Structure (React)

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainContent.tsx
│   ├── pattern-editor/
│   │   ├── PatternGrid.tsx
│   │   ├── GridCell.tsx
│   │   ├── StitchPalette.tsx
│   │   ├── ColorPalette.tsx
│   │   ├── Toolbar.tsx
│   │   └── StatusBar.tsx
│   ├── text-input/
│   │   ├── TextInputPanel.tsx
│   │   └── TextParser.ts
│   ├── 3d-viewer/
│   │   ├── ThreeDViewer.tsx
│   │   ├── FabricMesh.tsx
│   │   ├── StitchGeometry.tsx
│   │   └── CameraControls.tsx
│   ├── metadata/
│   │   ├── PatternInfoPanel.tsx
│   │   ├── GaugeInput.tsx
│   │   └── DimensionsInput.tsx
│   └── modals/
│       ├── SaveModal.tsx
│       ├── LoadModal.tsx
│       └── ExportModal.tsx
├── store/
│   ├── patternStore.ts (Zustand)
│   └── uiStore.ts (Zustand)
├── services/
│   ├── api/
│   │   ├── patternApi.ts
│   │   └── exportApi.ts
│   ├── localStorage.ts
│   └── validation.ts
├── types/
│   ├── pattern.types.ts
│   ├── stitch.types.ts
│   └── api.types.ts
├── utils/
│   ├── stitchEffects.ts
│   ├── colorUtils.ts
│   └── exportUtils.ts
├── App.tsx
└── main.tsx
```

### API Endpoints

#### Pattern Management
```
POST   /api/patterns                 - Create new pattern
GET    /api/patterns/{id}            - Get pattern by ID
PUT    /api/patterns/{id}            - Update pattern
DELETE /api/patterns/{id}            - Delete pattern
GET    /api/patterns/user/{userId}   - List user's patterns (future)
```

#### Pattern Operations
```
POST   /api/patterns/validate        - Validate pattern stitch counts
POST   /api/patterns/parse-text      - Parse text input to stitch array
```

#### Export
```
GET    /api/export/{id}/json         - Export as JSON
GET    /api/export/{id}/text         - Export as text instructions
GET    /api/export/{id}/pdf          - Export as PDF (future)
```

---

## Data Models

### Complete TypeScript Interfaces

```typescript
// ===== MAIN PATTERN OBJECT =====

interface KnittingPattern {
  id: string;                          // GUID
  version: string;                     // Schema version (e.g., "1.0")
  metadata: PatternMetadata;
  structure: PatternStructure;
  content: PatternContent;
  visualization: VisualizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

// ===== METADATA =====

interface PatternMetadata {
  name: string;                        // Required
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

interface Gauge {
  stitchesPerInch: number;
  rowsPerInch: number;
  measurementSize: number;             // Typically 4
  measurementUnit: 'inches' | 'cm';
}

interface NeedleSize {
  us?: number;                         // US size
  metric?: number;                     // mm
  type?: 'straight' | 'circular' | 'dpn';
  cableLength?: number;                // For circular, in inches
}

type YarnWeight = 'lace' | 'fingering' | 'sport' | 'DK' | 'worsted' | 
                  'aran' | 'bulky' | 'super-bulky' | 'jumbo';

interface YarnInfo {
  colorId: string;
  brand?: string;
  name?: string;
  fiberContent?: string;
  yardage?: number;
  unit?: 'yards' | 'meters';
}

interface PatternDimensions {
  width?: number;
  height?: number;
  circumference?: number;
  unit: 'inches' | 'cm';
}

type Difficulty = 'beginner' | 'easy' | 'intermediate' | 'advanced' | 'expert';

type PatternCategory = 'garment' | 'accessory' | 'home-decor' | 'toy' | 'other';

// ===== STRUCTURE =====

interface PatternStructure {
  type: 'flat' | 'circular';
  direction?: 'bottom-up' | 'top-down' | 'side-to-side';
  joinedInRound?: boolean;
  sections: PatternSection[];
  castOnCount: number;
}

interface PatternSection {
  id: string;
  name: string;
  startRow: number;
  endRow: number;
  notes?: string;
}

// ===== CONTENT =====

interface PatternContent {
  rows: PatternRow[];
  colorPalette: ColorDefinition[];
  stitchLibrary?: StitchDefinition[];
}

interface PatternRow {
  rowNumber: number;
  stitches: StitchAbbreviation[];      // Simple string array
  textInstruction?: string;            // Original text input
  isRightSide: boolean;
  sectionId?: string;
  notes?: string;
  expectedStitchCount: number;
  warnings?: string[];
}

// All supported stitch abbreviations
type StitchAbbreviation = 
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
  
  // With color notation
  | `${string}:${string}`;             // e.g., "k:MC", "p:CC1"

interface ColorDefinition {
  id: string;                          // e.g., "MC", "CC1"
  name: string;
  hex: string;                         // "#4A90E2"
  yarnInfoIndex?: number;
}

interface StitchDefinition {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  instructions: string;
}

// ===== VISUALIZATION =====

interface VisualizationSettings {
  garmentType: GarmentType;
  show3DPreview: boolean;
  realtimePreview: boolean;
  displayMode: 'chart' | 'text' | 'grid' | 'all';
  showStitchCount: boolean;
  showRowNumbers: boolean;
  rendering3D: Rendering3DOptions;
}

type GarmentType = 
  | 'flat-rectangle'
  | 'flat-shaped'
  | 'hat'
  | 'tube'
  | 'sweater-assembled'
  | 'sock'
  | 'glove'
  | 'custom';

interface Rendering3DOptions {
  stitchDetail: 'simplified' | 'realistic';
  showTexture: boolean;
  lightingPreset: 'studio' | 'natural' | 'dramatic';
  cameraAngle: 'front' | 'perspective' | 'top';
}
```

### Database Schema (PostgreSQL)

```sql
-- Patterns table
CREATE TABLE patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),  -- For future multi-user support
    name VARCHAR(100) NOT NULL,
    description TEXT,
    pattern_data JSONB NOT NULL,         -- Full pattern JSON
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_public BOOLEAN DEFAULT FALSE,     -- For future sharing feature
    INDEX idx_user_patterns (user_id, created_at DESC),
    INDEX idx_public_patterns (is_public, created_at DESC)
);

-- Users table (future)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);
```

### Example Pattern JSON

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "version": "1.0",
  "metadata": {
    "name": "Simple Cable Scarf",
    "description": "A beginner-friendly cable scarf",
    "author": "Jane Knitter",
    "gauge": {
      "stitchesPerInch": 4.5,
      "rowsPerInch": 6,
      "measurementSize": 4,
      "measurementUnit": "inches"
    },
    "needleSize": {
      "us": 8,
      "metric": 5,
      "type": "straight"
    },
    "yarnWeight": "worsted",
    "dimensions": {
      "width": 8,
      "height": 60,
      "unit": "inches"
    },
    "difficulty": "easy",
    "tags": ["scarf", "cables", "winter"],
    "category": "accessory"
  },
  "structure": {
    "type": "flat",
    "direction": "bottom-up",
    "sections": [
      {
        "id": "sec-1",
        "name": "Main Body",
        "startRow": 1,
        "endRow": 10
      }
    ],
    "castOnCount": 20
  },
  "content": {
    "rows": [
      {
        "rowNumber": 1,
        "stitches": ["k", "k", "k", "k", "k", "k", "k", "k", "k", "k", 
                     "k", "k", "k", "k", "k", "k", "k", "k", "k", "k"],
        "textInstruction": "k20",
        "isRightSide": true,
        "expectedStitchCount": 20,
        "warnings": []
      },
      {
        "rowNumber": 2,
        "stitches": ["p", "p", "p", "p", "p", "p", "p", "p", "p", "p",
                     "p", "p", "p", "p", "p", "p", "p", "p", "p", "p"],
        "textInstruction": "p20",
        "isRightSide": false,
        "expectedStitchCount": 20,
        "warnings": []
      }
    ],
    "colorPalette": [
      {
        "id": "MC",
        "name": "Main Color",
        "hex": "#4A90E2"
      }
    ]
  },
  "visualization": {
    "garmentType": "flat-rectangle",
    "show3DPreview": true,
    "realtimePreview": false,
    "displayMode": "all",
    "showStitchCount": true,
    "showRowNumbers": true,
    "rendering3D": {
      "stitchDetail": "simplified",
      "showTexture": true,
      "lightingPreset": "studio",
      "cameraAngle": "perspective"
    }
  },
  "createdAt": "2026-02-03T10:00:00Z",
  "updatedAt": "2026-02-03T12:30:00Z"
}
```

---

## User Interface Specifications

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo | Pattern Name | Save | Export | Load         │
├─────────┬───────────────────────────────────────────────────┤
│         │  Tab Bar: Grid Editor | Text Input | 3D Preview   │
│ Side    ├───────────────────────────────────────────────────┤
│ bar     │                                                     │
│         │                                                     │
│ Pattern │               Main Content Area                    │
│ Info    │            (Grid / Text / 3D View)                 │
│         │                                                     │
│ Gauge   │                                                     │
│         │                                                     │
│         ├───────────────────────────────────────────────────┤
│         │  Status Bar: Row # | Stitch Count | Warnings       │
└─────────┴───────────────────────────────────────────────────┘
```

### Color Scheme

**Primary Colors:**
- Primary Blue: `#4299E1`
- Primary Dark: `#2B6CB0`
- Success Green: `#48BB78`
- Warning Yellow: `#ECC94B`
- Error Red: `#F56565`

**Neutral Colors:**
- Background: `#F7FAFC`
- Surface: `#FFFFFF`
- Border: `#E2E8F0`
- Text Primary: `#2D3748`
- Text Secondary: `#718096`

**Stitch Type Colors:**
- Knit: `#E6F3FF`
- Purl: `#FFF5E6`
- Cable: `#FFE6F0`
- Decrease: `#FFE6E6`
- Increase: `#E6FFE6`

### Typography

- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: 
  - H1: 24px, bold
  - H2: 18px, semibold
  - H3: 16px, medium
- **Body**: 14px, regular
- **Small**: 12px, regular
- **Monospace (for stitch abbr)**: 'Courier New', monospace

### Spacing

- Base unit: 4px
- Common spacing:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px

### Interactive Elements

**Buttons:**
- Primary: Blue background, white text, rounded corners
- Secondary: White background, gray border, gray text
- Danger: Red background, white text
- Hover: Slightly darker shade
- Active: Even darker shade

**Inputs:**
- Border: 1px solid gray
- Focus: 2px blue border
- Error: 2px red border
- Padding: 8px 12px
- Border radius: 4px

**Dropdowns:**
- Max height: 400px (with scroll)
- Item hover: Light gray background
- Selected item: Blue background, white text
- Separator lines between categories

**Grid Cells:**
- Size: 30px × 30px
- Border: 1px solid `#CBD5E0`
- Hover: Border becomes blue, slight scale up
- Selected: Blue border, shadow
- Highlighted row: Yellow background
- Highlighted cell: Blue border with outer glow

---

## User Flows

### Flow 1: Create New Pattern from Scratch

1. User arrives at application
2. Application loads with empty pattern grid (default: 20×10)
3. User fills in pattern metadata in sidebar:
   - Pattern name: "My Cable Scarf"
   - Needle size: US 8
   - Yarn weight: Worsted
4. User selects stitch from dropdown (e.g., "K")
5. User clicks and drags across Row 1 cells → all cells fill with "K"
6. User selects "P" stitch
7. User clicks Row 2 → entire row highlights
8. User drags across highlighted row → all cells fill with "P"
9. User selects "C4B" cable stitch
10. User clicks on Row 3, cell 5 → cable automatically spans cells 5-8
11. User continues filling pattern
12. User clicks "Save" button → pattern saves to local storage
13. Success message appears: "Pattern saved!"

### Flow 2: Edit Pattern Using Text Input

1. User has existing pattern loaded
2. User clicks "Text Input" tab
3. Text input panel appears
4. User types row instruction: `"k2, p2, c4b, p2, k2tog, yo, k8"`
5. User clicks "Parse & Add Row"
6. System parses text:
   - Recognizes abbreviations
   - Converts to array: `['k', 'k', 'p', 'p', 'c4b', 'p', 'p', 'k2tog', 'yo', 'k', ...]`
   - Validates stitch count
7. Preview appears: "Will create: ['k', 'k', 'p', 'p', ...], Expected count: 19"
8. User confirms → row added to grid
9. User switches back to "Grid Editor" tab → sees new row in grid

### Flow 3: View 3D Preview

1. User has created pattern in grid
2. User clicks "3D Preview" tab
3. System generates 3D mesh:
   - Creates rectangular fabric mesh
   - Places stitch geometry for each stitch
   - Applies colors
4. Loading indicator shows: "Generating preview..."
5. 3D view renders
6. User can:
   - Drag to rotate camera
   - Scroll to zoom
   - Right-click and drag to pan
7. User clicks "Reset Camera" → returns to default view
8. User toggles "Real-time Preview" checkbox
9. User switches to "Grid Editor" tab
10. User edits stitches → 3D preview updates automatically (if real-time enabled)

### Flow 4: Save and Load Pattern

**Saving:**
1. User creates/edits pattern
2. User clicks "Save" button in header
3. Pattern saves to local storage (auto-generates filename if none)
4. Confirmation message: "Saved!"
5. Auto-save indicator updates: "Last saved: just now"

**Loading:**
1. User clicks "Load" button in header
2. Modal appears with list of saved patterns:
   - Pattern name
   - Last modified date
3. User clicks on a pattern
4. If current pattern has unsaved changes:
   - Warning modal: "You have unsaved changes. Load anyway?"
   - User confirms or cancels
5. Selected pattern loads into editor
6. All views update (grid, metadata, 3D preview)

### Flow 5: Export Pattern

1. User has completed pattern
2. User clicks "Export" button in header
3. Export modal appears with format options:
   - JSON (for backup/programming)
   - Text (written instructions)
   - PDF (future)
4. User clicks "Text" format
5. System generates text file:
   ```
   Pattern: My Cable Scarf
   Author: Jane Knitter
   
   Cast on: 20 stitches
   
   Row 1 (RS): k20
   Row 2 (WS): p20
   Row 3 (RS): k2, p2, c4b, p2, k10
   ...
   ```
6. Browser downloads file: "my-cable-scarf.txt"
7. Success message: "Pattern exported!"

### Flow 6: Fix Validation Warning

1. User creates pattern with mistake
2. Status bar shows: "⚠ Row 5: Expected 20 stitches but found 19"
3. User clicks on warning message
4. Row 5 highlights in yellow
5. User examines row, finds missing stitch
6. User clicks on empty cell in row 5
7. User selects "K" stitch and places it
8. System recalculates stitch count
9. Warning clears, status bar shows: "✓ Valid"

---

## Technical Requirements

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **No support**: Internet Explorer
- **Mobile**: Responsive design, touch-friendly (basic support)

### Performance Requirements
- **Initial Load**: < 3 seconds on broadband
- **Grid Interaction**: < 16ms response time (60fps)
- **3D Rendering**: 30fps minimum for patterns up to 100×100 stitches
- **Auto-save**: Non-blocking, should not interrupt user

### Accessibility
- **Keyboard Navigation**: Full support for grid editing, dropdowns, modals
- **Screen Reader**: ARIA labels for all interactive elements
- **Color Contrast**: WCAG AA compliance minimum
- **Focus Indicators**: Clear visual focus states

### Data Limits
- **Maximum Pattern Size**: 200 stitches × 500 rows
- **Maximum Colors**: 10 colors per pattern
- **Local Storage**: 5MB limit (approx. 20-30 large patterns)
- **Pattern Name**: 100 characters max
- **Description**: 500 characters max

### Security Considerations
- **Input Validation**: All user input sanitized on both client and server
- **XSS Protection**: React's built-in escaping + CSP headers
- **SQL Injection**: Parameterized queries via EF Core
- **Rate Limiting**: API rate limits (future, when backend deployed)

---

## MVP Scope

### Phase 1: Core Grid Editor (Weeks 1-2)
- [ ] Project setup (React + Vite + TypeScript + Tailwind)
- [ ] Basic layout structure (header, sidebar, main content)
- [ ] Pattern grid component
  - [ ] Render grid cells
  - [ ] Click to place stitch
  - [ ] Display stitch abbreviations
- [ ] Stitch palette dropdown
  - [ ] Basic stitches (k, p, sl)
  - [ ] Increases (yo, kfb, m1)
  - [ ] Decreases (k2tog, ssk, p2tog)
- [ ] Pattern metadata panel
  - [ ] Basic inputs (name, width, height)
  - [ ] Gauge inputs
  - [ ] Needle size, yarn weight

### Phase 2: Enhanced Interactions (Weeks 3-4)
- [ ] Click and drag to place stitches
- [ ] Right-click to delete
- [ ] Right-click and drag to delete
- [ ] Color palette dropdown
- [ ] Color application (colored cells)
- [ ] Cable stitches
  - [ ] Add cable types to palette
  - [ ] Auto-spanning logic
- [ ] Row highlighting (click row number)
- [ ] Cell highlighting (click cell)

### Phase 3: Text Input & Validation (Week 5)
- [ ] Text input panel component
- [ ] Text parser service
  - [ ] Parse basic abbreviations
  - [ ] Support comma/period/pipe delimiters
  - [ ] Handle repeats
  - [ ] Parse color notation
- [ ] Preview parsed result
- [ ] Add parsed row to grid
- [ ] Stitch count validation
  - [ ] Calculate stitch effects
  - [ ] Validate row-to-row consistency
  - [ ] Display warnings in status bar

### Phase 4: 3D Visualization (Weeks 6-7)
- [ ] Set up React Three Fiber
- [ ] Basic 3D scene setup
  - [ ] Camera, lights, background
- [ ] Fabric mesh generation
  - [ ] Create flat rectangular mesh
  - [ ] Map grid coordinates to 3D positions
- [ ] Stitch geometry
  - [ ] Simplified knit stitch shape
  - [ ] Simplified purl stitch shape
  - [ ] Cable representation
- [ ] Camera controls
  - [ ] Orbit, zoom, pan
  - [ ] Reset button
- [ ] Real-time toggle
  - [ ] Update on pattern change (with debounce)

### Phase 5: Save/Load & Export (Week 8)
- [ ] Local storage service
  - [ ] Save pattern to localStorage
  - [ ] Load pattern from localStorage
  - [ ] List saved patterns
- [ ] Save/Load UI
  - [ ] Save button
  - [ ] Load modal
  - [ ] Unsaved changes warning
- [ ] Auto-save (every 30 seconds)
- [ ] Export functionality
  - [ ] JSON export
  - [ ] Text export
  - [ ] Download functionality

### Phase 6: Polish & Testing (Week 9)
- [ ] Responsive design adjustments
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] User testing
- [ ] Documentation

### Phase 7: Backend Setup (Week 10) [Optional for MVP]
- [ ] ASP.NET Core Web API project setup
- [ ] Database schema creation
- [ ] API endpoints implementation
  - [ ] CRUD operations for patterns
  - [ ] Text parser endpoint
  - [ ] Validation endpoint
- [ ] Connect frontend to backend
- [ ] Deploy to cloud (Azure/AWS)

---

## Future Enhancements

### Post-MVP Features (Priority Order)

**High Priority:**
1. **User Accounts & Authentication**
   - Sign up, login, password reset
   - User profile management
   - Pattern ownership and privacy settings

2. **Cloud Storage & Sync**
   - Save patterns to cloud database
   - Sync across devices
   - Backup and restore

3. **Pattern Sharing & Gallery**
   - Make patterns public
   - Browse public pattern gallery
   - Download/fork others' patterns
   - Comments and ratings

4. **Advanced Export Options**
   - PDF export with formatted charts
   - Image export (PNG/JPG of chart)
   - Ravelry integration

5. **Circular Knitting Support**
   - Round-by-round editing
   - Joined-in-round indicator
   - Different row numbering

**Medium Priority:**
6. **Advanced Stitch Library**
   - Lace stitches (k3tog, sk2p, nupp, etc.)
   - Brioche stitches
   - Custom stitch definitions
   - Stitch pattern library (seed stitch, moss stitch, etc.)

7. **Shaped Garments**
   - Hat with decreases
   - Sweater panels with shaping
   - Sock heel and toe shaping
   - Raglan increases

8. **Advanced 3D Features**
   - Realistic stitch rendering
   - Cloth physics simulation
   - Multiple garment types
   - Try-on feature (body model)
   - Different yarn textures

9. **Charting Features**
   - Traditional knitting chart view
   - Symbol library
   - Print-optimized chart layout
   - Chart annotations

10. **Pattern Wizard**
    - Guided pattern creation
    - Templates for common items
    - Auto-calculate dimensions from gauge
    - Sizing calculator

**Low Priority:**
11. **Collaboration Features**
    - Shared pattern editing
    - Comments and suggestions
    - Version history
    - Pattern collections/projects

12. **Mobile App**
    - Native iOS app
    - Native Android app
    - Offline mode
    - Knitting counter integration

13. **Advanced Tools**
    - Colorwork designer
    - Fair Isle pattern generator
    - Intarsia support
    - Duplicate stitch overlay

14. **Learning Resources**
    - Integrated tutorials
    - Stitch technique videos
    - Pattern tips and best practices
    - Beginner guides

15. **Community Features**
    - Forums/discussion boards
    - Pattern challenges
    - Designer profiles
    - Follow favorite designers

---

## Success Metrics

### MVP Success Criteria

**User Engagement:**
- 100 patterns created in first month
- Average session duration: > 10 minutes
- Return visit rate: > 40% within first week

**Functionality:**
- Zero critical bugs in core features
- 95% of patterns save/load successfully
- 90% of text inputs parse correctly

**Performance:**
- Grid interaction response time: < 16ms
- 3D render time: < 5 seconds for 50×50 pattern
- App load time: < 3 seconds on broadband

**User Satisfaction:**
- Positive feedback from 5+ beta testers
- No major usability complaints
- Feature requests indicate engagement

### Key Performance Indicators (KPIs)

**For Public Launch:**
- Monthly Active Users (MAU)
- Patterns created per user
- Average pattern complexity (rows × stitches)
- Patterns shared publicly (if feature exists)
- User retention rate (30-day, 90-day)
- Time to first saved pattern
- Export usage rate

---

## Development Timeline

### 10-Week MVP Timeline

**Week 1-2: Core Grid Editor**
- React + TypeScript project setup
- Basic layout and navigation
- Grid component with cell rendering
- Basic stitch placement
- Stitch palette dropdown (basic stitches)

**Week 3-4: Enhanced Interactions**
- Click and drag placement
- Right-click deletion
- Color system implementation
- Cable auto-spanning
- Row/cell highlighting

**Week 5: Text Input & Validation**
- Text input UI
- Parser implementation
- Stitch count validation logic
- Warning system

**Week 6-7: 3D Visualization**
- Three.js/R3F setup
- Basic scene and camera
- Fabric mesh generation
- Simplified stitch geometry
- Real-time toggle

**Week 8: Save/Load & Export**
- LocalStorage integration
- Save/load UI
- Auto-save
- JSON and text export

**Week 9: Polish & Testing**
- Responsive design
- Accessibility
- Performance optimization
- Bug fixing
- User testing

**Week 10: Backend (Optional)**
- ASP.NET Core API
- Database setup
- API integration
- Deployment

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 3D rendering performance issues | High | Medium | Start with simplified geometry; add LOD if needed; provide quality settings |
| Complex state management in grid | Medium | Medium | Use Zustand for predictable state; thorough testing |
| Text parser edge cases | Medium | High | Comprehensive test suite; clear error messages |
| Browser compatibility issues | Medium | Low | Test on major browsers early; use polyfills if needed |
| LocalStorage limits | Low | Medium | Warn users near limit; provide export before clearing |

### Product Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Users find grid editor unintuitive | High | Medium | User testing; tooltips; tutorial |
| 3D preview not useful/accurate | Medium | Medium | Iterative improvement based on feedback |
| Text parser doesn't support user's notation | Medium | Medium | Support common formats first; add more based on requests |
| Limited features vs. existing tools | High | Low | Focus on unique value (3D + grid combo) |

---

## Appendices

### Appendix A: Stitch Abbreviation Reference

| Abbr | Full Name | Type | Effect | Description |
|------|-----------|------|--------|-------------|
| k | Knit | Basic | 1→1 | Standard knit stitch |
| p | Purl | Basic | 1→1 | Standard purl stitch |
| sl | Slip | Basic | 1→1 | Slip stitch without working |
| yo | Yarn Over | Increase | 0→1 | Creates a hole/increase |
| kfb | Knit Front & Back | Increase | 1→2 | Increase by knitting twice into one stitch |
| m1 | Make One | Increase | 0→1 | Increase between stitches |
| k2tog | Knit Two Together | Decrease | 2→1 | Right-leaning decrease |
| ssk | Slip Slip Knit | Decrease | 2→1 | Left-leaning decrease |
| p2tog | Purl Two Together | Decrease | 2→1 | Purl decrease |
| c4f | Cable 4 Front | Cable | 4→4 | Cross 4 sts with cable needle in front |
| c4b | Cable 4 Back | Cable | 4→4 | Cross 4 sts with cable needle in back |

### Appendix B: Color Palette Defaults

| Color | ID | Hex | RGB | Purpose |
|-------|----|----|-----|---------|
| Main Color | MC | #4A90E2 | rgb(74, 144, 226) | Primary color |
| Contrast 1 | CC1 | #E63946 | rgb(230, 57, 70) | First accent |
| Contrast 2 | CC2 | #F1C40F | rgb(241, 196, 15) | Second accent |
| Contrast 3 | CC3 | #2ECC71 | rgb(46, 204, 113) | Third accent |
| Contrast 4 | CC4 | #9B59B6 | rgb(155, 89, 182) | Fourth accent |
| Contrast 5 | CC5 | #E67E22 | rgb(230, 126, 34) | Fifth accent |
| Contrast 6 | CC6 | #34495E | rgb(52, 73, 94) | Dark neutral |

### Appendix C: Glossary

- **Cast On**: The first row of stitches that begins a knitting project
- **RS (Right Side)**: The "public" side of the fabric that faces outward
- **WS (Wrong Side)**: The "private" side of the fabric that faces inward
- **Gauge**: The number of stitches and rows per inch in knitted fabric
- **Stitch Count**: The total number of stitches in a row
- **Colorwork**: Knitting technique using multiple colors in the same row
- **Cable**: Technique where stitches cross over each other
- **Flat Knitting**: Knitting back and forth in rows
- **Circular Knitting**: Knitting in a continuous spiral (rounds)
- **Shaping**: Increasing or decreasing stitches to create curves/angles

### Appendix D: Development Resources

**Learning Resources:**
- React Documentation: https://react.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- TailwindCSS Docs: https://tailwindcss.com/docs
- Three.js Manual: https://threejs.org/manual/
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber/

**Knitting Resources:**
- Craft Yarn Council (standardized terms): https://www.craftyarncouncil.com
- Ravelry (pattern community): https://www.ravelry.com
- Knitting abbreviations: https://www.craftyarncouncil.com/standards/knit-abbreviations

**Tools:**
- Figma (for future design work): https://www.figma.com
- GitHub (version control): https://github.com
- Vercel (hosting option): https://vercel.com
- Supabase (database option): https://supabase.com

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-03 | Initial PRD created | Planning Session |

---

## Approval & Sign-off

**Product Owner**: [Name]  
**Technical Lead**: [Name]  
**Date**: [Date]

---

*End of Product Requirements Document*
