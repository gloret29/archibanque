# ArchiModeler Comprehensive Roadmap 🚀
*Architecting the future with the Golden Thread: From Strategy to Execution.*

ArchiModeler is a production-grade Enterprise Architecture platform inspired by industry leaders like BizzDesign, combining expert-level design (Enterprise Studio) with collaborative intelligence (Horizzon).

---

## ✅ Phase 1: Infrastructure & Core Security (COMPLETED)
- [x] **Next.js 15 & PostgreSQL Stack**: Standalone output for Docker optimization.
  *Utilisation de la version la plus récente de Next.js pour maximiser les performances et la compatibilité.*
  *Base de données relationnelle sécurisée pour garantir l'intégrité de l'inventaire des objets d'architecture.*
- [x] **Deployment Automation**: Remote Portainer deployment via PowerShell/API scripts.
  *Scripts automatisés permettant de mettre à jour l'application sur le serveur distant en un clic.*
  *Réduction drastique des erreurs humaines lors de la mise en production des nouvelles fonctionnalités.*
- [x] **RBAC Foundation**: User, Role, and Group schema implementation in Prisma.
  *Architecture de sécurité permettant de définir qui peut voir ou modifier quel élément du modèle.*
  *Support des groupes d'utilisateurs pour faciliter la gestion des permissions à grande échelle.*
- [x] **Authelia Integration**: JIT (Just-In-Time) provisioning via trusted headers (`remote-user`, `remote-email`).
  *Authentification centralisée (SSO) permettant de se connecter avec ses identifiants d'entreprise.*
  *Création automatique des profils utilisateurs lors de leur première connexion sécurisée.*
- [x] **CI/CD Pipeline**: Automated build and push to remote production environment.
  *Chaîne de fabrication automatisée qui valide le code avant chaque déploiement.*
  *Garantit que seule une version stable et testée arrive sur l'instance de production.*

## ✅ Phase 2: "Enterprise Studio" Core - Visual Engine (COMPLETED)
- [x] **React Flow Integration**: Infinite canvas with zoom, pan, and minimap.
  *Moteur de rendu haute performance capable de gérer des milliers d'objets sur une surface infinie.*
  *Interface intuitive permettant de naviguer facilement dans les architectures complexes via la mini-carte.*
- [x] **ArchiMate 3.2 Palette**: Full layer categorization (Strategy → Tech).
  *Organisation de tous les concepts ArchiMate par couches logiques (Métier, Applicatif, Technique).*
  *Accès rapide aux outils de modélisation conformes aux standards internationaux de l'Open Group.*
- [x] **Custom Node Engine**: Layer-based coloring, standard ArchiMate geometry.
  *Génération dynamique de la forme et de la couleur des objets en fonction de leur type ArchiMate.*
  *Respect strict de la symbolisation officielle pour une compréhension universelle des schémas.*
- [x] **Interaction Logic**: Drag-and-drop, multi-selection, and keyboard deletion.
  *Expérience utilisateur fluide permettant de manipuler les diagrammes comme dans une application de dessin moderne.*
  *Actions groupées et raccourcis clavier pour accélérer la création et la maintenance des vues.*
- [x] **State Management**: Zustand-based store with **Undo/Redo** (Zundo).
  *Mémorisation de chaque modification pour permettre un droit à l'erreur total durant la modélisation.*
  *Synchronisation instantanée de l'état du modèle entre la zone de dessin et les panneaux de propriétés.*

## 🏗️ Phase 3: Relationships & Metamodel Rigor (COMPLETED)
- [x] **ArchiMate Relation Types**: Core implementation of line styles and arrowheads.
  *Support exhaustif des types de liens (Composition, Réalisation, Flux) avec leur graphisme officiel.*
  *Distinction claire entre les relations structurelles, dynamiques et de dépendance.*
- [x] **Connection Validation Engine**: Prevents illegal layer connections.
  *Intelligence embarquée empêchant de créer des relations qui ne respectent pas le metamodel ArchiMate.*
  *Aide les architectes à produire des modèles syntaxiquement corrects dès la première saisie.*
- [x] **Smart Connection Menu**: Dynamic menu when multiple relationship types are valid.
  *Propose intelligemment les relations valides entre deux objets lors de la création d'un lien.*
  *Élimine le besoin de mémoriser toutes les règles complexes de la spécification ArchiMate.*
- [x] **Visual Markers & Symbols**: Added markers (open/filled diamonds) and icons in node headers.
  *Affichage des icônes de type dans les en-têtes pour identifier les concepts d'un seul coup d'œil.*
  *Ajout des losanges de composition et agrégation pour une lecture précise de la structure.*
- [x] **Orthogonal Routing**: Implementation of "Right-Angled Lines" (SmoothStep) for relationship layouts.
  *Nettoyage automatique des liens pour éviter les croisements désordonnés et les lignes diagonales.*
  *Produit des diagrammes propres, orthogonaux et lisibles, conformes aux standards professionnels.*
- [x] **Derived Relations**: Automated inference logic (A->B->C => A->C).
  *Algorithme qui déduit les relations d'ordre supérieur à partir des liens directs existants.*
  *Permet de simplifier les vues sans perdre l'information de traçabilité entre les éléments distants.*

## ✅ Phase 4: Enterprise Studio UX - Essentials (COMPLETED)
*Objective: Mimic the rich workspace layout of Enterprise Studio.*
- [x] **Tabbed View Interface**: Full support for multiple open views with a tab bar.
  *Navigation rapide entre les différents diagrammes via une barre d'onglets intuitive située au-dessus du canevas.*
  *Permet aux architectes de travailler sur plusieurs aspects du SI simultanément sans perdre leur contexte.*
- [x] **Model Browser (Hierarchy Management)**: Repository tree-view with folders and views.
  *Explorateur hiérarchique permettant d'organiser le référentiel en dossiers logiques selon la structure de l'entreprise.*
  *Facilite la gestion de milliers d'objets et de vues grâce à une navigation arborescente standard.*
- [x] **Snap-to-Grid & Alignment Tools**: Precision layout implemented (15px grid).
  *Aide à l'alignement précis des objets pour garantir une esthétique professionnelle et une lisibilité maximale.*
  *Gain de temps significatif lors de la mise en page de diagrammes denses et complexes.*
- [ ] **Object Groups (Nesting)**: Support for containers on canvas (Next Step).
  *Capacité d'imbriquer des éléments les uns dans les autres pour représenter des contenants logiques ou physiques.*
  *Inférence automatique des relations de composition ou d'agrégation entre l'élément parent et ses enfants.*
- [ ] **Model Packages**: Logical grouping of views and elements in the database.
  *Regroupement métier des éléments du modèle pour faciliter la distribution et la réutilisation inter-projets.*
  *Structure de données robuste permettant de gérer de grands volumes d'architecture de manière modulaire.*
- [ ] **Git Sync Service**: Deep integration with Git for object-level versioning.
  *Capacité de sauvegarder et versionner chaque objet du référentiel sous forme de fichiers texte synchronisables.*
  *Ouvre la voie à une approche "Architecture as Code" partagée et distribuée.*
- [ ] **Check-in / Check-out**: Lock mechanisms to prevent concurrent editing conflicts.
  *Système de verrouillage garantissant que deux architectes ne modifient pas le même objet au même moment.*
  *Assure l'intégrité du référentiel central lors des travaux de modélisation collaborative intense.*
- [ ] **Project Sandboxing**: Create isolated branches for "To-Be" or "What-if" scenarios.
  *Création d'espaces de travail isolés pour explorer des architectures cibles sans impacter le "As-Is".*
  *Indispensable pour comparer différentes options stratégiques avant la prise de décision finale.*
- [ ] **Conflict Resolution UI**: Visual diff and merge tool for architecture changes.
  *Interface graphique permettant de visualiser et de résoudre les différences entre deux versions d'un modèle.*
  *Garantit une fusion propre des contributions de différents experts de domaine dans le socle commun.*

## � Phase 5: Advanced Visualization & "Onion" Diagrams
*Objective: Transform static diagrams into interactive heatmaps.*
- [ ] **Color Views**: Dynamic coloring of nodes based on attributes (e.g., Cost > $10k = Red).
  *Mise en évidence automatique des objets en fonction de critères de performance, de coût ou de risque.*
  *Transforme les diagrammes techniques en véritables cartes de chaleur décisionnelles pour le management.*
- [ ] **Label Views**: Overlay metrics (ROI, Availability %) directly on diagram labels.
  *Affichage en temps réel des indicateurs clés de performance directement sur les icônes du diagramme.*
  *Permet de lire les données critiques sans avoir à consulter les panneaux de propriétés détaillés.*
- [ ] **Onion Diagram Templates**: Concentric circle views for stakeholder and service mapping.
  *Modèles visuels organisés en cercles concentriques pour représenter les couches de services et d'acteurs.*
  *Vues synthétiques idéales pour la communication stratégique et la cartographie des écosystèmes.*
- [ ] **Image Export Engine**: High-fidelity SVG, PNG, and PDF exports for executive reports.
  *Génération d'exports graphiques de qualité professionnelle pour l'inclusion dans des présentations ou documents PDF.*
  *Assure que les architectures dessinées sont diffusables proprement à tous les échelons de l'entreprise.*

## 👁️ Phase 6: "Horizzon" Portal - Collaborative Consumption
*Objective: Democratize architecture access for non-expert users.*
- [ ] **Read-only Web Portal**: Streamlined interface for stakeholders (Consumers).
  *Interface simplifiée permettant à n'importe quel employé de consulter l'architecture sans risque de la modifier.*
  *Point d'entrée unique pour la "Vérité Unique" (Single Source of Truth) du système d'information.*
- [ ] **Global Search**: OpenSearch-powered indexing of every object, property, and diagram.
  *Moteur de recherche ultra-rapide capable de retrouver instantanément n'importe quel concept dans le référentiel.*
  *Facilite la navigation et l'analyse d'impact en identifiant tous les contextes d'utilisation d'un objet.*
- [ ] **Social Feedback**: Comment threads on specific views or objects.
  *Espace collaboratif permettant de laisser des avis et de poser des questions directement sur les diagrammes.*
  *Favorise l'adoption de l'architecture en intégrant les retours des utilisateurs métiers et techniques.*
- [ ] **Knowledge Sharing**: "Tribal Knowledge" capturing via documentation fields.
  *Stockage des explications, des raisons des choix techniques et des connaissances historiques du SI.*
  *Évite la perte de savoir lors des départs de collaborateurs clés en le centralisant dans l'outil.*

## ⚙️ Phase 7: Business Architecture & Excellence (BPMN/DMN)
*Objective: Drill-down from EA to operational process detail.*
- [ ] **BPMN 2.0 Module**: Native process modeling within the same repository.
  *Support complet du standard BPMN 2.0 pour dessiner des diagrammes de processus métier ultra-détaillés.*
  *Permet de descendre d'un niveau par rapport à ArchiMate pour capturer la logique opérationnelle précise.*
- [ ] **Contextual Drill-down**: Link ArchiMate "Business Process" to detailed BPMN diagrams.
  *Mécanisme de navigation permettant de cliquer sur un processus ArchiMate pour ouvrir son diagramme BPMN associé.*
  *Garantit une traçabilité totale entre la vision stratégique globale et l'exécution quotidienne au niveau métier.*
- [ ] **DMN Tables**: Model business rules and decision logic outside of the process flow.
  *Outils de modélisation de règles métier dissociés des flux de processus pour une maintenance simplifiée.*
  *Permet de capturer la complexité des décisions stratégiques sous forme de tables de décisions claires.*
- [ ] **Process Mining Integration**: (Future) Import real-world execution data.
  *Capacité d'importer des logs d'exécution réels pour comparer le processus modélisé au processus exécuté.*
  *Identifie les goulots d'étranglement et les dérives opérationnelles par rapport à l'architecture cible.*

## 🛡️ Phase 8: Strategic Portfolio Management (SPM/APM)
*Objective: Data-driven decision making for IT investment.*
- [ ] **Capability-Based Planning**: Hierarchical capability maps with performance metrics.
  *Visualisation synthétique des capacités de l'entreprise liées à leur niveau de maturité et leur importance.*
  *Outil d'aide à la décision pour identifier les domaines nécessitant des investissements IT prioritaires.*
- [ ] **TIME Analysis**: Native support for Tolerate, Invest, Migrate, Eliminate framework.
  *Framework intégré pour classer les applications selon leur valeur métier et leur qualité technique.*
  *Génère automatiquement des plans de route de rationalisation du parc applicatif.*
- [ ] **Portfolio Lifecycle**: Track Retirement/EOL dates for every application.
  *Suivi précis des cycles de vie techniques pour anticiper les fins de support et les risques d'obsolescence.*
  *Permet de planifier les projets de remplacement bien avant que les technologies ne deviennent critiques.*
- [ ] **Investment Alignment**: Link project budgets to the strategic capabilities they enable.
  *Visualisation de la répartition des budgets SI par rapport aux objectifs stratégiques de l'entreprise.*
  *Assure que chaque euro dépensé contribue directement à la valeur ajoutée métier attendue.*

## 📋 Phase 9: Model Governance & Data Quality
*Objective: The "Model Governance" add-in experience.*
- [ ] **Cataloging Rules**: Automated naming convention checks and uniqueness constraints.
  *Moteur de règles vérifiant la qualité des noms et évitant la création de doublons dans le référentiel.*
  *Garantit un catalogue d'objets propre, standardisé et facilement exploitable par les outils de Reporting.*
- [ ] **Lifecycle Workflows**: Draft → Review → Approved → Archive state management.
  *Processus de validation systématique pour garantir que seule l'architecture validée devient la référence.*
  *Sécurise l'évolution du SI en imposant des étapes de revue aux experts de domaine.*
- [ ] **Quality Dashboards**: Monitor data completeness (missing owners, missing costs).
  *Vues synthétiques listant les objets dont les attributs critiques ne sont pas renseignés par les architectes.*
  *Incite à la maintenance continue de la donnée pour que le modèle reste fiable et utile à la décision.*
- [ ] **Approval Task Management**: Personal "Inbox" for architecture reviews.
  *Interface regroupant toutes les demandes de validation en attente pour un contributeur donné.*
  *Optimise le temps des architectes seniors en fluidifiant le processus de passage en revue.*

## 🔌 Phase 10: Enterprise Ecosystem (Integrations)
*Objective: Connect the "Golden Thread" to the rest of the IT stack.*
- [ ] **ServiceNow Connector**: Bidirectional sync with ServiceNow CSDM (Applications, Servers).
  *Réconciliation automatique entre le référentiel d'architecture et la base de données opérationnelle (CMDB).*
  *Assure que les applications modélisées correspondent à la réalité des serveurs et services déployés.*
- [ ] **Technopedia Integration**: Automated EOL/EOS data for hardware/software assets.
  *Alimentation automatique des données de cycles de vie produits à partir d'une base de connaissance mondiale.*
  *Réduit la saisie manuelle et garantit la précision des alertes d'obsolescence matérielle et logicielle.*
- [ ] **Jira / ADO Sync**: Link ArchiMate "Work Packages" to development epics.
  *Connexion entre les projets d'architecture et les outils de gestion de tickets de développement.*
  *Permet de suivre la réalisation concrète des changements architecturaux par les équipes techniques.*
- [ ] **Open API**: Full RESTful access for custom integrations and external BI.
  *Exposition programmatique de toutes les données du modèle pour créer des outils personnalisés.*
  *Permet d'alimenter des tableaux de bord Power BI ou de connecter des outils tiers spécifiques.*

## 🍃 Phase 11: Sustainability & Risk (Green EA / FAIR)
*Objective: Future-proofing the architecture for ESG and Security.*
- [ ] **Carbon Footprint Modeling**: Import energy consumption data per server/app.
  *Attribution de scores d'émission de gaz à effet de serre à chaque composant de l'infrastructure IT.*
  *Permet aux architectes d'intégrer le critère de durabilité lors du choix des solutions technologiques.*
- [ ] **Green EA Dashboards**: Visualize the CO2 impact of architectural choices.
  *Tableaux de bord comparatifs montrant l'impact carbone de différents scénarios de transformation SI.*
  *Aide l'entreprise à atteindre ses objectifs de responsabilité sociétale et environnementale (RSE).*
- [ ] **Risk Management (Open FAIR)**: Threat, Vulnerability, and Financial exposure modeling.
  *Calcul scientifique du risque cyber basé sur des probabilités et des impacts financiers réels.*
  *Transforme les inquiétudes techniques en données chiffrées actionnables pour les comités de direction.*

## ✨ Phase 12: AI-Assisted Architecture (SmartPack)
*Objective: Accelerate modeling with Generative AI.*
- [ ] **Diagram Importer**: OCR/Vision to convert static images into live ArchiMate nodes.
  *Capture intelligente de photos de tableaux blancs ou de vieux diagrammes Visio pour les digitaliser.*
  *Gain de temps massif pour importer l'historique de l'entreprise dans le nouveau référentiel.*
- [ ] **Impact Analysis Bot**: Natural language queries: "What happens if we retire the ERP?".
  *Assistant IA capable de parcourir tout le graphique de relations pour identifier les casseroles d'un changement.*
  *Fournit une réponse argumentée et visuelle en quelques secondes au lieu de plusieurs heures d'analyse manuelle.*
- [ ] **Auto-layout & Suggestion**: AI suggestions for related objects based on industry patterns (BIAN/TOGAF).
  *Propose automatiquement les objets manquants à un diagramme en se basant sur les meilleures pratiques mondiales.*
  *Assure que l'architecture est complète et ne néglige aucun aspect critique selon les standards du marché.*

---

## 🛠️ Technical Stack Alignment
| Feature | ArchiModeler Implementation | BizzDesign Equivalent |
| :--- | :--- | :--- |
| **Editing** | React Flow Designer | Enterprise Studio |
| **Consumption** | Next.js Portal Mode | Horizzon Portal |
| **Versioning** | PostgreSQL + Git Branches | Model Package Check-in |
| **Search** | OpenSearch / Vector Search | Horizzon Search |
| **Automation** | Vercel AI SDK | SmartPack AI |
