# ArchiModeler Comprehensive Roadmap 🚀
*Architecting the future with the Golden Thread: From Strategy to Execution.*

ArchiModeler is a production-grade Enterprise Architecture platform inspired by industry leaders like BizzDesign, combining expert-level design (Enterprise Studio) with collaborative intelligence (Horizzon).

---

## ✅ Phase 1: Infrastructure & Core Security (COMPLETED)
- [x] **Next.js 15 & PostgreSQL Stack**: Standalone output for Docker optimization.
- [x] **Deployment Automation**: Remote Portainer deployment via PowerShell/API scripts.
- [x] **RBAC Foundation**: User, Role, and Group schema implementation in Prisma.
- [x] **Authelia Integration**: JIT (Just-In-Time) provisioning via trusted headers (`remote-user`, `remote-email`).
- [x] **CI/CD Pipeline**: Automated build and push to remote production environment.

## ✅ Phase 2: "Enterprise Studio" Core - Visual Engine (COMPLETED)
- [x] **React Flow Integration**: Infinite canvas with zoom, pan, and minimap.
- [x] **ArchiMate 3.2 Palette**: Full layer categorization (Strategy → Tech).
- [x] **Custom Node Engine**: Layer-based coloring, standard ArchiMate geometry.
- [x] **Interaction Logic**: Drag-and-drop, multi-selection, and keyboard deletion.
- [x] **State Management**: Zustand-based store with **Undo/Redo** (Zundo).

## 🏗️ Phase 3: Relationships & Metamodel Rigor (CURRENT)
- [x] **ArchiMate Relation Types**: Implementation of all standard line styles and arrowheads.
- [x] **Dynamic Edge Labels**: Real-time label rendering on connections.
- [ ] **Validation Engine**: Metamodel enforcement (e.g., preventing illegal relations between layers).
- [ ] **Derived Relations**: Automated calculation of inferred paths (BizzDesign "Derived Relationship" logic).
- [ ] **Handling Optimization**: Visual line jumps (cross-overs) and orthogonal routing.

## 💾 Phase 4: Referentiel & Versioning (Model Packages)
*Objective: Mimic Enterprise Studio's transactional repository management.*
- [ ] **Model Packages**: Logical grouping of views and elements in the database.
- [ ] **Git Sync Service**: Deep integration with Git for object-level versioning.
- [ ] **Check-in / Check-out**: Lock mechanisms to prevent concurrent editing conflicts.
- [ ] **Project Sandboxing**: Create isolated branches for "To-Be" or "What-if" scenarios.
- [ ] **Conflict Resolution UI**: Visual diff and merge tool for architecture changes.

## � Phase 5: Advanced Visualization & "Onion" Diagrams
*Objective: Transform static diagrams into interactive heatmaps.*
- [ ] **Color Views**: Dynamic coloring of nodes based on attributes (e.g., Cost > $10k = Red).
- [ ] **Label Views**: Overlay metrics (ROI, Availability %) directly on diagram labels.
- [ ] **Onion Diagram Templates**: Concentric circle views for stakeholder and service mapping.
- [ ] **Image Export Engine**: High-fidelity SVG, PNG, and PDF exports for executive reports.

## 👁️ Phase 6: "Horizzon" Portal - Collaborative Consumption
*Objective: Democratize architecture access for non-expert users.*
- [ ] **Read-only Web Portal**: Streamlined interface for stakeholders (Consumers).
- [ ] **Global Search**: OpenSearch-powered indexing of every object, property, and diagram.
- [ ] **Social Feedback**: Comment threads on specific views or objects.
- [ ] **Knowledge Sharing**: "Tribal Knowledge" capturing via documentation fields.

## ⚙️ Phase 7: Business Architecture & Excellence (BPMN/DMN)
*Objective: Drill-down from EA to operational process detail.*
- [ ] **BPMN 2.0 Module**: Native process modeling within the same repository.
- [ ] **Contextual Drill-down**: Link ArchiMate "Business Process" to detailed BPMN diagrams.
- [ ] **DMN Tables**: Model business rules and decision logic outside of the process flow.
- [ ] **Process Mining Integration**: (Future) Import real-world execution data.

## 🛡️ Phase 8: Strategic Portfolio Management (SPM/APM)
*Objective: Data-driven decision making for IT investment.*
- [ ] **Capability-Based Planning**: Hierarchical capability maps with performance metrics.
- [ ] **TIME Analysis**: Native support for Tolerate, Invest, Migrate, Eliminate framework.
- [ ] **Portfolio Lifecycle**: Track Retirement/EOL dates for every application.
- [ ] **Investment Alignment**: Link project budgets to the strategic capabilities they enable.

## 📋 Phase 9: Model Governance & Data Quality
*Objective: The "Model Governance" add-in experience.*
- [ ] **Cataloging Rules**: Automated naming convention checks and uniqueness constraints.
- [ ] **Lifecycle Workflows**: Draft → Review → Approved → Archive state management.
- [ ] **Quality Dashboards**: Monitor data completeness (missing owners, missing costs).
- [ ] **Approval Task Management**: Personal "Inbox" for architecture reviews.

## 🔌 Phase 10: Enterprise Ecosystem (Integrations)
*Objective: Connect the "Golden Thread" to the rest of the IT stack.*
- [ ] **ServiceNow Connector**: Bidirectional sync with ServiceNow CSDM (Applications, Servers).
- [ ] **Technopedia Integration**: Automated EOL/EOS data for hardware/software assets.
- [ ] **Jira / ADO Sync**: Link ArchiMate "Work Packages" to development epics.
- [ ] **Open API**: Full RESTful access for custom integrations and external BI.

## 🍃 Phase 11: Sustainability & Risk (Green EA / FAIR)
*Objective: Future-proofing the architecture for ESG and Security.*
- [ ] **Carbon Footprint Modeling**: Import energy consumption data per server/app.
- [ ] **Green EA Dashboards**: Visualize the CO2 impact of architectural choices.
- [ ] **Risk Management (Open FAIR)**: Threat, Vulnerability, and Financial exposure modeling.

## ✨ Phase 12: AI-Assisted Architecture (SmartPack)
*Objective: Accelerate modeling with Generative AI.*
- [ ] **Diagram Importer**: OCR/Vision to convert static images into live ArchiMate nodes.
- [ ] **Impact Analysis Bot**: Natural language queries: "What happens if we retire the ERP?".
- [ ] **Auto-layout & Suggestion**: AI suggestions for related objects based on industry patterns (BIAN/TOGAF).

---

## 🛠️ Technical Stack Alignment
| Feature | ArchiModeler Implementation | BizzDesign Equivalent |
| :--- | :--- | :--- |
| **Editing** | React Flow Designer | Enterprise Studio |
| **Consumption** | Next.js Portal Mode | Horizzon Portal |
| **Versioning** | PostgreSQL + Git Branches | Model Package Check-in |
| **Search** | OpenSearch / Vector Search | Horizzon Search |
| **Automation** | Vercel AI SDK | SmartPack AI |
