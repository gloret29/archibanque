# ArchiModeler Roadmap 🚀

ArchiModeler is a high-performance Enterprise Architecture (EA) tool designed for collaboration, modeling as code, and framework compliance (TOGAF, ArchiMate 3.2, BIAN).

---

## ✅ Phase 1: Infrastructure & Authentication (COMPLETED)
- [x] Initial Next.js 15 & PostgreSQL setup.
- [x] Docker & Portainer deployment script (`deploy_portainer.ps1`).
- [x] Database Schema for RBAC (Users, Roles, Groups).
- [x] Authelia Integration (JIT Provisioning via Headers).
- [x] CI/CD ready deployment to remote instance.

## 🏗️ Phase 2: Core Modeler UI (CURRENT)
- [x] React Flow integration for the diagramming engine.
- [x] ArchiMate 3.2 Palette implementation (Strategy, Business, Application, Tech).
- [x] Drag-and-Drop functionality from Palette to Canvas.
- [x] Custom ArchiMate Node components with layer-based styling.
- [ ] **Next**: Node selection and deletion logic.
- [ ] **Next**: Multi-node selection and basic canvas interactions (undo/redo).

## 🔀 Phase 3: Relationships & Metamodel Logic
- [ ] Implementation of ArchiMate relationship types (Composition, Aggregation, Assignment, Realization, etc.).
- [ ] Connection validation rules (Enforce ArchiMate spec for valid relationships).
- [ ] Visual edge styling based on relationship type (dotted lines, arrowheads, etc.).
- [ ] Handle connection logic: clicking handles to create specific relations.

## 💾 Phase 4: Persistence & Model as Code (Git)
- [ ] JSON Model store in PostgreSQL.
- [ ] Git Integration for version control.
- [ ] "Model-as-Code" paradigm: models stored as specialized JSON/YAML in Git.
- [ ] Branch management (Draft vs. Main/Production models).
- [ ] Export functionality (Open Exchange Format - XML).

## 📝 Phase 5: Properties & Metadata
- [ ] Dynamic Properties Panel based on selected element type.
- [ ] Support for custom attributes and tagging.
- [ ] Rich text documentation fields for every model object.
- [ ] Cross-reference tracking: see where an object is used across all diagrams.

## 👁️ Phase 6: Portal & Publication
- [ ] Read-only "Portal" module for broad organization access.
- [ ] Model browser and global search.
- [ ] Diagram exports (SVG, High-res PNG, PDF).
- [ ] Automated change logs and version comparison view.

## 🏆 Phase 7: Advanced Frameworks & Analytics
- [ ] BIAN (Banking Industry Architecture Network) template integration.
- [ ] TOGAF Metamodel extensions.
- [ ] Gap Analysis tools and Matrix views.
- [ ] Impact analysis visualization.

---

## 🛠️ Technical Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS.
- **Modeling**: @xyflow/react (React Flow).
- **State**: Zustand.
- **Backend/DB**: Prisma 6, PostgreSQL.
- **DevOps**: Docker, Portainer, SWAG/Authelia.
- **Storage**: Git (Planned).
