# ArchiModeler Roadmap 🚀 (BizzDesign Alignment)

ArchiModeler is evolving into a comprehensive Enterprise Architecture (EA) platform, mimicking the core capabilities of industry leaders like BizzDesign.

---

## ✅ Phase 1: Infrastructure & Authentication (COMPLETED)
- [x] Initial Next.js 15 & PostgreSQL setup.
- [x] Docker & Portainer deployment script.
- [x] Database Schema for RBAC (Users, Roles, Groups).
- [x] Authelia Integration (JIT Provisioning).

## ✅ Phase 2: Core Modeler UI - "Enterprise Studio Minimal" (COMPLETED)
- [x] React Flow engine integration.
- [x] ArchiMate 3.2 Basic Palette & custom node styling.
- [x] Drag-and-Drop from Palette to Canvas.
- [x] Basic properties panel & node deletion.
- [x] Multi-node selection & movement.
- [x] Undo/Redo history (Zundo).

## 🏗️ Phase 3: Relationships & Metamodel Logic (CURRENT)
- [x] Implementation of ArchiMate relationship types (Composition, Aggregation, etc.).
- [x] Visual edge styling (Dashed lines, arrowheads).
- [ ] **Next**: **Connection Validation Engine** (Enforce ArchiMate spec for valid relationships).
- [ ] **Next**: **Derived Relationships Calculation** (Automated inference based on BizzDesign's "Golden Path").

## 💾 Phase 4: Lifecycle & Versioning (Persistence)
*Objective: Mimic Enterprise Studio's Check-in/Check-out and Project Sandboxing.*
- [ ] **Model Packages**: Store full models as logical packages in PostgreSQL.
- [ ] **Git as Backend Service**: Use Git for versioning, diffing, and branching.
- [ ] **Project Sandboxing**: Create "To-Be" branches without affecting the "Main" (Golden Copy) model.
- [ ] **Merges & Conflict Resolution**: Basic UI for merging a "To-Be" project back into the main repository.

## 👁️ Phase 5: Horizzon-like Portal & High-End Viz
*Objective: Democratize access and provide strategic dashboards.*
- [ ] **Read-only Consumption Mode**: Optimized view for non-architects.
- [ ] **Color Views & Label Views**: Dynamic coloring of elements based on attributes (e.g., Lifecycle status, Cost).
- [ ] **Strategic Heatmaps**: Capability maps dimensioned by performance/strategic importance.
- [ ] **Social Features**: Commenting/Threading on specific objects or views.

## ⚙️ Phase 6: Multi-Standard & Drill-down
*Objective: Unify EA with Process and Data modeling.*
- [ ] **BPMN 2.0 Integration**: Drill-down from an ArchiMate Business Process to a detailed BPMN diagram.
- [ ] **Entity-Relationship (ERD)**: Data modeling module linked to ArchiMate Data Objects.
- [ ] **Drill-down Contextual Navigation**: Seamless transition between different abstraction layers.

## 🛡️ Phase 7: Governance & Workflows
*Objective: Implement the "Model Governance" add-in logic.*
- [ ] **Workflow Engine**: Submit changes for review; approve/reject before merging into the main model.
- [ ] **Cataloging Rules**: Automated linting/validation of naming conventions and naming uniqueness.
- [ ] **Lifecycle States**: Track objects as Draft, Approved, Archived.

## 🔌 Phase 8: Integrations & Connectors
*Objective: Bridge ArchiModeler with the rest of the IT ecosystem.*
- [ ] **ITSM Bridge (ServiceNow)**: Map ArchiMate Application Components to ServiceNow CSDM.
- [ ] **Asset Intelligence (Flexera/Technopedia)**: Automated EOL/EOS date imports.
- [ ] **Modern BI Integration**: Expose model data for external analytics tools.

## ✨ Phase 9: AI Assistance (SmartPack)
- [ ] **Diagram Importer**: Convert images/captures into live ArchiMate nodes using Vercel AI SDK.
- [ ] **Impact Analysis Bot**: AI-driven analysis of "What happens if we remove this Application?".

---

## 🛠️ Stack Alignment
- **Conception**: Enterprise Studio (Our React-based Modeler).
- **Consommation**: Horizzon (Our Portal Mode).
- **Referentiel**: Model Packages (PostgreSQL + Git).
