# Knitting Pattern Editor

A web-based application that enables knitters to design custom knitting patterns through an intuitive grid-based interface, visualize them in 3D, and export them for use.

## 🧶 Features

### MVP Phase 1 (Current)
- ✅ **Grid-Based Pattern Editor**: Visual grid where each cell represents a stitch
- ✅ **Comprehensive Stitch Library**: Basic stitches, increases, decreases, and cables
- ✅ **Color Palette**: Support for multiple yarn colors
- ✅ **Click & Drag Interface**: Place and remove stitches intuitively
- ✅ **Cable Auto-Spanning**: Cables automatically span the correct number of cells
- ✅ **Row Management**: Add/delete rows, RS/WS indicators
- ✅ **Pattern Metadata**: Name, gauge, needle size, yarn weight, and more
- ✅ **Status Bar**: Real-time stitch counts and validation

### Coming Soon
- 📝 Text input parser for written knitting instructions
- 🎨 3D visualization with Three.js
- 💾 Save and load patterns (localStorage + backend)
- 📤 Export to JSON, Text, and PDF
- ✓ Stitch count validation and warnings
- 🔄 Pattern sharing and gallery

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd knitting-pattern-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎯 How to Use

### Creating a Pattern

1. **Set Pattern Info**: Use the left sidebar to enter pattern name, gauge, needle size, etc.

2. **Select a Stitch**: Click the "Stitch" dropdown in the toolbar and choose from:
   - Basic: Knit (k), Purl (p), Slip (sl)
   - Increases: Yarn Over (yo), KFB, M1, etc.
   - Decreases: K2tog, SSK, P2tog, etc.
   - Cables: C2F/B, C4F/B, C6F/B, C8F/B

3. **Select a Color**: Click the "Color" dropdown to choose yarn color

4. **Place Stitches**:
   - **Click** on a cell to place the selected stitch
   - **Click and drag** to fill multiple cells
   - **Right-click** to delete a stitch
   - **Right-click and drag** to delete multiple stitches

5. **Manage Rows**:
   - Click row numbers to select entire row
   - Use "+ Add Row" button to add more rows
   - Delete selected rows with "Delete Row" button

6. **Adjust Grid Size**: Use "Resize Grid" in the sidebar to change dimensions

### Understanding the Interface

#### Grid Layout
- Rows are numbered bottom-to-top (Row 1 at bottom)
- RS (Right Side) rows: Number appears on the RIGHT
- WS (Wrong Side) rows: Number appears on the LEFT
- Cell colors indicate stitch types:
  - Light blue: Knit stitches
  - Light orange: Purl stitches
  - Light pink: Cable stitches
  - Light red: Decrease stitches
  - Light green: Increase stitches

#### Status Bar
- Shows selected row information
- Displays stitch counts
- Indicates validation status (warnings/errors)

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/              # Main layout components
│   │   ├── Header.tsx       # Top header with save/load
│   │   ├── Sidebar.tsx      # Left sidebar with metadata
│   │   └── MainContent.tsx  # Main content area with tabs
│   ├── pattern-editor/      # Grid editor components
│   │   ├── PatternGrid.tsx  # Main grid component
│   │   ├── GridCell.tsx     # Individual stitch cell
│   │   ├── StitchPalette.tsx
│   │   ├── ColorPalette.tsx
│   │   ├── Toolbar.tsx
│   │   └── StatusBar.tsx
│   ├── text-input/          # Text parser (coming soon)
│   ├── 3d-viewer/           # 3D visualization (coming soon)
│   ├── metadata/            # Pattern info panels
│   └── modals/              # Save/Load/Export modals
├── store/
│   └── patternStore.ts      # Zustand state management
├── types/
│   └── pattern.types.ts     # TypeScript type definitions
├── utils/
│   ├── stitchData.ts        # Stitch library and colors
│   └── stitchEffects.ts     # Stitch effect calculations
├── App.tsx
└── main.tsx
```

## 🛠 Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **3D Rendering**: Three.js + React Three Fiber (coming soon)
- **Backend** (future): ASP.NET Core Web API
- **Database** (future): PostgreSQL

## 📋 Development Roadmap

### Phase 1: Core Grid Editor ✅
- [x] Project setup
- [x] Basic layout
- [x] Grid component with cell rendering
- [x] Stitch placement (click & drag)
- [x] Stitch palette dropdown
- [x] Color system
- [x] Cable auto-spanning
- [x] Row/cell highlighting
- [x] Pattern metadata panel

### Phase 2: Text Input & Validation (In Progress)
- [ ] Text input UI
- [ ] Parser implementation
- [ ] Stitch count validation
- [ ] Warning system

### Phase 3: 3D Visualization (Planned)
- [ ] Three.js/R3F setup
- [ ] Basic scene and camera
- [ ] Fabric mesh generation
- [ ] Simplified stitch geometry
- [ ] Real-time toggle

### Phase 4: Save/Load & Export (Planned)
- [ ] LocalStorage integration
- [ ] Save/load UI
- [ ] Auto-save
- [ ] JSON and text export

### Phase 5: Backend Integration (Future)
- [ ] ASP.NET Core API
- [ ] Database setup
- [ ] User accounts
- [ ] Cloud sync
- [ ] Pattern sharing

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to open issues or submit pull requests.

## 📝 License

TBD

## 🙏 Acknowledgments

- Knitting community for inspiration and testing
- React and Three.js communities for excellent documentation
- All the knitters who helped define requirements

---

**Current Version**: 1.0.0 (MVP Phase 1)  
**Last Updated**: February 3, 2026
