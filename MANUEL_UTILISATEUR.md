# ArchiModeler - Manuel Utilisateur 📘

*Version 1.0 - Décembre 2024*

Bienvenue dans ArchiModeler, la plateforme d'architecture d'entreprise basée sur les standards ArchiMate 3.2. Ce manuel vous guidera à travers toutes les fonctionnalités de l'application.

---

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Démarrage rapide](#démarrage-rapide)
3. [Interface utilisateur](#interface-utilisateur)
4. [Création et gestion de modèles](#création-et-gestion-de-modèles)
5. [Gestion des éléments ArchiMate](#gestion-des-éléments-archimate)
6. [Relations et connexions](#relations-et-connexions)
7. [Panneau de propriétés](#panneau-de-propriétés)
8. [DataBlocks - Attributs personnalisés](#datablocks---attributs-personnalisés)
9. [Administration](#administration)
10. [Fonctionnalités avancées](#fonctionnalités-avancées)

---

## 🎯 Introduction

### Qu'est-ce qu'ArchiModeler ?

ArchiModeler est une plateforme complète de modélisation d'architecture d'entreprise qui permet de :
- Modéliser des architectures selon le standard ArchiMate 3.2
- Gérer un référentiel d'objets d'architecture
- Créer des vues et diagrammes multiples
- Étendre les modèles avec des attributs personnalisés (DataBlocks)
- Collaborer sur des projets d'architecture

### Architecture de l'application

ArchiModeler suit une architecture à deux niveaux inspirée de BizzDesign :
- **Mode Expert (Modeler)** : Interface complète pour la création et l'édition de modèles
- **Mode Administration** : Gestion de la configuration et des DataBlocks

---

## 🚀 Démarrage rapide

### Accès à l'application

1. Ouvrez votre navigateur et accédez à l'URL de l'application
2. Connectez-vous avec vos identifiants d'entreprise (authentification SSO)
3. Vous êtes redirigé vers la page d'accueil

### Premiers pas

1. **Créer un nouveau modèle** :
   - Cliquez sur "Modeling Module" ou accédez à `/modeler`
   - Sélectionnez un package dans le sélecteur en haut à gauche
   - Si aucun package n'existe, un package par défaut est créé automatiquement

2. **Créer votre première vue** :
   - Dans le Model Browser (panneau gauche), faites un clic droit sur un dossier
   - Sélectionnez "New View"
   - Nommez votre vue
   - Double-cliquez sur la vue pour l'ouvrir

3. **Ajouter des éléments** :
   - Utilisez la palette ArchiMate (panneau gauche, section inférieure)
   - Sélectionnez un type d'élément (ex: "Business Process")
   - Cliquez sur le canvas pour placer l'élément
   - Double-cliquez sur l'élément pour le renommer

---

## 🖥️ Interface utilisateur

### Disposition générale

L'interface du mode Expert est organisée en plusieurs zones :

```
┌─────────────────────────────────────────────────────────────┐
│  Header (Logo, Package Selector, Toolbar, User Info)       │
├──────────┬──────────────────────────────────────┬───────────┤
│          │                                      │           │
│  Model   │         Canvas Principal             │ Properties│
│  Browser │      (Zone de dessin)                │  Panel    │
│          │                                      │           │
│          │                                      │           │
│  Palette │                                      │           │
│ ArchiMate│                                      │           │
└──────────┴──────────────────────────────────────┴───────────┘
```

### Zones principales

#### 1. Model Browser (Navigateur de modèle)

**Localisation** : Panneau gauche, section supérieure

**Fonctionnalités** :
- Navigation hiérarchique dans la structure du projet
- Création de dossiers et vues
- Gestion des éléments du référentiel
- Réorganisation par glisser-déposer

**Actions disponibles** :
- **Clic gauche sur un élément** : Sélectionne l'élément avec un highlight visuel (fond bleu)
- **Clic droit sur un dossier** : Créer un nouveau dossier, une vue, ou un élément
- **Double-clic sur une vue** : Ouvrir la vue dans un nouvel onglet
- **Double-clic sur un élément** : Sélectionner l'élément dans le panneau de propriétés
- **Touche F2** : Renommer l'élément actuellement sélectionné
- **Touche Suppr** : Supprimer l'élément actuellement sélectionné (avec confirmation)

**Symboles ArchiMate** :
Le navigateur affiche les symboles officiels ArchiMate à côté de chaque élément du référentiel pour une identification visuelle rapide. Ces mêmes symboles apparaissent dans l'en-tête des objets sur le diagramme.

#### 2. Palette ArchiMate

**Localisation** : Panneau gauche, section inférieure

**Organisation** :
Les éléments sont organisés par couches ArchiMate :
- **Strategy Layer** : Resources, Capabilities, Courses of Action, Value Streams
- **Business Layer** : Actors, Processes, Functions, Services, Objects
- **Application Layer** : Components, Interfaces, Functions, Services, Data Objects
- **Technology Layer** : Nodes, Devices, System Software, Networks, Services
- **Physical Layer** : Equipment, Facilities, Distribution Networks, Materials
- **Motivation Layer** : Stakeholders, Drivers, Goals, Outcomes, Requirements
- **Implementation Layer** : Work Packages, Deliverables, Plateaus, Gaps

**Utilisation** :
1. Sélectionnez un type d'élément dans la palette
2. Cliquez sur le canvas pour créer l'élément
3. L'élément est automatiquement ajouté au dossier de la vue active

#### 3. Canvas (Zone de dessin)

**Fonctionnalités** :
- Surface de dessin infinie avec zoom et panoramique
- Mini-carte en bas à droite pour la navigation
- Grille magnétique (15px) pour l'alignement
- Multi-sélection avec Shift+Clic
- Gestion des groupes (conteneurs)

**Navigation** :
- **Zoom** : Molette de la souris ou Ctrl+Molette
- **Panoramique** : Clic droit + glisser, ou barre d'espace + clic + glisser
- **Sélection** : Clic simple
- **Multi-sélection** : Shift + Clic
- **Suppression** : Sélectionner + Suppr

**Onglets de vues** :
- Plusieurs vues peuvent être ouvertes simultanément
- Onglets en haut du canvas pour basculer entre les vues
- Indicateur de verrouillage pour les vues en cours d'édition

#### 4. Properties Panel (Panneau de propriétés)

**Localisation** : Panneau droit

**Sections** :
- **Properties** : Nom, Description, Documentation
- **DataBlocks** : Attributs personnalisés (si configurés)
- **Metadata** : ID, Type, Dates de création/modification, Auteur
- **Style** : Taille, police, alignement (pour les éléments visuels)

---

## 📦 Création et gestion de modèles

### Packages (Projets)

Un package est un conteneur logique pour un ensemble de modèles d'architecture.

**Gestion des packages** :
- Sélection du package actif via le sélecteur en haut à gauche
- Le package par défaut est créé automatiquement au premier lancement

### Dossiers

Les dossiers permettent d'organiser hiérarchiquement le référentiel.

**Types de dossiers** :
- **Folder** : Dossier générique
- **View Folder** : Contient uniquement des vues
- **Element Folder** : Contient uniquement des éléments

**Création d'un dossier** :
1. Clic droit sur le dossier parent
2. Sélectionner "New Folder"
3. Choisir le type de dossier
4. Nommer le dossier

**Réorganisation** :
- Glisser-déposer un dossier pour le déplacer
- La hiérarchie est illimitée

### Vues (Views)

Une vue est un diagramme qui représente une partie de l'architecture.

**Création d'une vue** :
1. Clic droit sur un dossier (de préférence un View Folder)
2. Sélectionner "New View"
3. Nommer la vue
4. Double-cliquer pour ouvrir

**Gestion des vues** :
- **Onglets** : Plusieurs vues peuvent être ouvertes simultanément
- **Verrouillage** : Système de check-in/check-out pour éviter les conflits
- **Suppression** : Clic droit sur la vue → "Delete"

---

## 🎨 Gestion des éléments ArchiMate

### Création d'éléments

**Méthode 1 : Via la palette**
1. Sélectionner un type d'élément dans la palette ArchiMate
2. Cliquer sur le canvas
3. L'élément est créé dans le référentiel et apparaît sur la vue

**Méthode 2 : Via le menu contextuel**
1. Clic droit sur le canvas
2. Sélectionner la couche ArchiMate
3. Choisir le type d'élément
4. L'élément est créé à l'emplacement du clic

**Méthode 3 : Via le Model Browser**
1. Clic droit sur un dossier
2. Sélectionner "New Element"
3. Choisir le type dans la palette qui s'ouvre
4. L'élément est créé dans le référentiel (à ajouter manuellement sur les vues)

### Modification d'éléments

**Renommage** :
- Double-clic sur le nom de l'élément sur le canvas
- Ou sélectionner l'élément et modifier le nom dans le Properties Panel
- Ou appuyer sur **F2** après avoir sélectionné l'élément dans le Model Browser

**Déplacement** :
- Glisser-déposer l'élément sur le canvas
- Utiliser les flèches du clavier pour un déplacement précis

**Redimensionnement** :
- Sélectionner l'élément
- Aller dans l'onglet "Style" du Properties Panel
- Modifier la largeur et la hauteur

**Suppression** :
- Sélectionner l'élément
- Appuyer sur Suppr
- Ou utiliser le bouton "Delete" dans le Properties Panel

### Types d'éléments ArchiMate

#### Strategy Layer
- **Resource** : Ressource stratégique
- **Capability** : Capacité organisationnelle
- **Course of Action** : Plan d'action
- **Value Stream** : Flux de valeur

#### Business Layer
- **Business Actor** : Acteur métier
- **Business Role** : Rôle métier
- **Business Process** : Processus métier
- **Business Function** : Fonction métier
- **Business Service** : Service métier
- **Business Object** : Objet métier
- **Product** : Produit
- **Contract** : Contrat
- **Representation** : Représentation

#### Application Layer
- **Application Component** : Composant applicatif
- **Application Interface** : Interface applicative
- **Application Function** : Fonction applicative
- **Application Process** : Processus applicatif
- **Application Service** : Service applicatif
- **Data Object** : Objet de données

#### Technology Layer
- **Node** : Nœud
- **Device** : Équipement
- **System Software** : Logiciel système
- **Technology Interface** : Interface technologique
- **Technology Function** : Fonction technologique
- **Technology Service** : Service technologique
- **Artifact** : Artefact

#### Physical Layer
- **Equipment** : Équipement physique
- **Facility** : Installation
- **Distribution Network** : Réseau de distribution
- **Material** : Matériau

#### Motivation Layer
- **Stakeholder** : Partie prenante
- **Driver** : Facteur de changement
- **Assessment** : Évaluation
- **Goal** : Objectif
- **Outcome** : Résultat
- **Requirement** : Exigence
- **Constraint** : Contrainte
- **Principle** : Principe

#### Implementation Layer
- **Work Package** : Lot de travail
- **Deliverable** : Livrable
- **Plateau** : Palier de migration
- **Gap** : Écart

---

## 🔗 Relations et connexions

### Types de relations ArchiMate

Les relations ArchiMate suivent des règles strictes définies par le métamodèle :

**Relations structurelles** :
- **Composition** : Relation forte (losange rempli)
- **Aggregation** : Relation faible (losange ouvert)
- **Assignment** : Affectation (cercle à la source)
- **Realization** : Réalisation (flèche triangulaire en pointillés)

**Relations dynamiques** :
- **Serving** : Service (flèche simple)
- **Access** : Accès (ligne pointillée)
- **Flow** : Flux (flèche remplie en pointillés)
- **Triggering** : Déclenchement (flèche remplie)

**Relations autres** :
- **Influence** : Influence (flèche en pointillés)
- **Association** : Association (ligne simple, relation par défaut)
- **Specialization** : Spécialisation (flèche triangulaire)

### Création de relations

**Méthode 1 : Glisser-déposer**
1. Sélectionner un élément source
2. Maintenir Shift et glisser vers l'élément cible
3. Un menu contextuel apparaît avec les relations valides
4. Sélectionner le type de relation

**Méthode 2 : Menu de connexion**
1. Sélectionner un élément source
2. Un point de connexion apparaît
3. Glisser depuis ce point vers l'élément cible
4. Choisir la relation dans le menu

**Validation automatique** :
- Le système valide automatiquement si la relation est autorisée selon le métamodèle ArchiMate
- Seules les relations valides sont proposées
- L'association est toujours disponible comme relation de secours

### Modification de relations

**Changement de type** :
1. Sélectionner la relation sur le canvas
2. Dans le Properties Panel, utiliser le sélecteur "Relationship Type"
3. Seuls les types valides sont proposés

**Suppression** :
- Sélectionner la relation + Suppr
- Ou utiliser le bouton "Delete" dans le Properties Panel

**Propriétés** :
- Les relations ont les mêmes propriétés que les éléments (nom, description, documentation)
- Sélectionner une relation sur le canvas pour voir ses propriétés

### Relations dérivées

Le système calcule automatiquement les relations dérivées :
- Si A → B → C, alors A → C peut être inféré
- Les relations dérivées utilisent le type de relation le plus faible de la chaîne

---

## 📋 Panneau de propriétés

### Vue d'ensemble

Le panneau de propriétés affiche et permet d'éditer les informations de l'élément, de la relation ou de la vue sélectionnée.

### Onglets

#### Onglet Properties

**Nom** :
- Champ texte modifiable
- Sauvegarde automatique à la perte de focus
- Ou appuyer sur Entrée pour sauvegarder

**Description** :
- Zone de texte pour une description courte
- Sauvegarde automatique

**Documentation** :
- Zone de texte pour une documentation détaillée
- Disponible uniquement pour les objets du référentiel (pas les nœuds visuels)

**DataBlocks** :
- Section affichant les DataBlocks éligibles pour le type d'objet
- Voir section [DataBlocks](#datablocks---attributs-personnalisés)

**Metadata (Lecture seule)** :
- ID unique de l'objet
- Type ArchiMate
- Date de création
- Date de modification
- Auteur

#### Onglet Style (uniquement pour les éléments visuels)

**Dimensions** :
- Largeur (Width)
- Hauteur (Height)
- Modifiable via des champs numériques

**Police** :
- **Famille de police** : Inter, Arial, Georgia, Courier, Times
- **Taille** : De 8px à 32px
- **Style** : Gras, Italique, Souligné (boutons toggle)
- **Alignement** : Gauche, Centre, Droite

**Position** :
- Coordonnées X et Y (affichage uniquement, modification par glisser-déposer)

---

## 🗂️ DataBlocks - Attributs personnalisés

### Concept

Les DataBlocks permettent d'étendre les objets ArchiMate avec des attributs personnalisés spécifiques à votre organisation.

### Configuration des DataBlocks (Administration)

**Accès** : Menu Administration → Onglet "Data Blocks"

**Création d'un DataBlock** :
1. Cliquer sur le bouton "+" dans la liste des DataBlocks
2. Nommer le DataBlock (ex: "Informations de coût")
3. Définir les types d'objets cibles (éléments et/ou relations)
4. Ajouter des attributs (voir ci-dessous)

**Gestion des attributs** :
1. Sélectionner un DataBlock
2. Cliquer sur "Add Attribute"
3. Renseigner :
   - **Display Name** : Nom affiché (ex: "Coût annuel")
   - **Internal Key** : Clé interne (ex: "annual_cost")
   - **Type** : String, Number, Date, Boolean, ou Enum
   - **Enum Values** : Si type Enum, définir la liste de valeurs

**Types d'attributs** :

- **String** : Texte libre
- **Number** : Nombre entier ou décimal
- **Date** : Sélecteur de date
- **Boolean** : Case à cocher (Oui/Non)
- **Enum** : Liste déroulante avec valeurs prédéfinies

**Édition des valeurs Enum** :
1. Dans le gestionnaire d'attributs, cliquer sur "Manage List"
2. Cliquer sur une valeur pour l'éditer
3. Utiliser les boutons Edit/Delete au survol
4. Sauvegarder avec Enter ou le bouton Check

### Utilisation des DataBlocks (Modeler)

**Affichage** :
- Les DataBlocks éligibles apparaissent automatiquement dans le Properties Panel
- Section "Custom Attributes" visible uniquement si des DataBlocks sont configurés pour le type d'objet

**Saisie des valeurs** :
1. Sélectionner un élément ou une relation
2. Dans le Properties Panel, section "Custom Attributes"
3. Renseigner les valeurs pour chaque attribut du DataBlock
4. Sauvegarde automatique via l'auto-save (toutes les 2 secondes)

**Exemple** :
```
DataBlock: "Informations financières"
- Coût annuel (Number) : 50000
- Date d'acquisition (Date) : 2024-01-15
- Actif (Boolean) : ✓ Oui
- Catégorie (Enum) : Production
```

---

## ⚙️ Administration

### Accès

Menu Administration accessible depuis la page d'accueil ou via `/admin`

### Gestion de la visibilité des éléments

**Onglet "Element Visibility"** :

Permet d'activer/désactiver les types d'éléments ArchiMate disponibles dans l'interface.

**Utilisation** :
- Cocher/décocher les types d'éléments pour les activer/désactiver
- Les éléments désactivés n'apparaissent plus dans :
  - La palette ArchiMate
  - Les menus contextuels
  - Le Model Browser
- Actions globales : "Enable All" / "Disable All"
- Recherche pour filtrer les éléments

**Cas d'usage** :
- Simplifier la palette pour des utilisateurs non experts
- Restreindre l'utilisation à un sous-ensemble standardisé
- Adapter l'interface selon les besoins du projet

### Gestion des DataBlocks

Voir section [Configuration des DataBlocks](#configuration-des-datablocks-administration)

---

## 🔧 Fonctionnalités avancées

### Auto-save

**Fonctionnement** :
- Sauvegarde automatique toutes les 2 secondes après une modification
- Indicateur visuel en haut à droite : "Saving..." ou "Saved"
- Aucune action manuelle nécessaire

**Éléments sauvegardés** :
- Structure des dossiers
- Vues et leurs layouts
- Éléments du référentiel
- Relations
- Propriétés et valeurs de DataBlocks

### Undo/Redo

**Statut** : Temporairement désactivé (problème de compatibilité React 19)

**Planifié** : Réactivation dans une version future

### Grille magnétique

**Fonctionnement** :
- Grille invisible de 15px
- Les éléments s'alignent automatiquement sur la grille
- Aide à créer des diagrammes propres et alignés

### Groupes (Conteneurs)

**Création** :
1. Créer un élément de type "Group" depuis la palette
2. Glisser-déposer des éléments dans le groupe
3. Le groupe se redimensionne automatiquement

**Utilisation** :
- Représenter des contenants logiques ou physiques
- Organiser visuellement les éléments
- Inférence automatique de relations de composition/agrégation

### Mini-carte

**Localisation** : Coin inférieur droit du canvas

**Fonctionnalités** :
- Vue d'ensemble réduite du diagramme
- Rectangle rouge indiquant la zone visible
- Clic sur la mini-carte pour se déplacer rapidement

### Navigation par onglets

**Gestion des vues** :
- Onglets en haut du canvas
- Basculer entre les vues en cliquant sur un onglet
- Indicateur de verrouillage si la vue est verrouillée
- Fermer un onglet avec le bouton X

### Check-in / Check-out

**Système de verrouillage** :
- Empêche l'édition simultanée d'une même vue
- Indicateur visuel sur l'onglet si la vue est verrouillée
- Message optionnel lors du verrouillage

**Processus** :
1. Ouvrir une vue (automatiquement vérifiée)
2. La vue est verrouillée pour vous
3. Après modification, enregistrer (automatique)
4. La vue peut être déverrouillée (check-in)

---

## 💡 Conseils et bonnes pratiques

### Organisation du référentiel

1. **Structure hiérarchique** :
   - Utilisez des dossiers pour organiser par domaine métier
   - Séparer les vues des éléments si nécessaire
   - Nommer de manière claire et cohérente

2. **Nommage** :
   - Utilisez des noms explicites et standards
   - Évitez les abréviations ambigües
   - Respectez les conventions de votre organisation

3. **Documentation** :
   - Renseignez toujours les descriptions
   - Utilisez la documentation pour les détails importants
   - Exploitez les DataBlocks pour les informations métier spécifiques

### Modélisation ArchiMate

1. **Respect du métamodèle** :
   - Le système valide automatiquement les relations
   - Utilisez les types de relations appropriés
   - Ne forcez pas des relations non valides

2. **Niveaux d'abstraction** :
   - Commencez par une vue globale (Business/Application)
   - Détaillez progressivement
   - Utilisez plusieurs vues pour différents niveaux de détail

3. **Relations dérivées** :
   - Le système calcule automatiquement les relations dérivées
   - Ne créez pas manuellement des relations qui peuvent être dérivées
   - Simplifiez vos vues en utilisant les relations dérivées

### Performance

1. **Grands modèles** :
   - Limitez le nombre d'éléments par vue (recommandé : < 100)
   - Utilisez plusieurs vues pour décomposer un modèle complexe
   - La grille magnétique aide à la lisibilité

2. **Sauvegarde** :
   - L'auto-save fonctionne automatiquement
   - Pas besoin de sauvegarder manuellement
   - L'indicateur "Saved" confirme que vos modifications sont enregistrées

---

## ❓ FAQ (Foire aux questions)

### Comment créer un nouveau projet ?

Un package par défaut est créé automatiquement. Pour créer des packages supplémentaires, utilisez l'API ou attendez une fonctionnalité future dans l'interface.

### Comment exporter un diagramme ?

L'export d'images (SVG, PNG, PDF) est prévu dans la Phase 6 du roadmap. Actuellement, vous pouvez utiliser les outils de capture d'écran de votre navigateur.

### Puis-je importer des modèles existants ?

L'import depuis des fichiers JSON est possible via l'API. Une interface graphique est prévue pour une version future.

### Comment collaborer sur un modèle ?

Le système de check-in/check-out empêche les conflits d'édition. Plusieurs utilisateurs peuvent travailler sur le même projet, mais pas simultanément sur la même vue.

### Les DataBlocks sont-ils obligatoires ?

Non, les DataBlocks sont optionnels. Ils permettent d'enrichir les modèles avec des informations spécifiques à votre organisation.

### Comment supprimer un élément ?

1. Sélectionner l'élément sur le canvas ou dans le Model Browser
2. Appuyer sur Suppr
3. Ou utiliser le bouton "Delete" dans le Properties Panel

**Attention** : La suppression d'un élément le retire également de toutes les vues où il apparaît.

---

## 📞 Support

Pour toute question ou problème :
- Consultez ce manuel
- Vérifiez le [ROADMAP.md](ROADMAP.md) pour les fonctionnalités prévues
- Contactez votre administrateur système

---

## 🔄 Historique des versions

### Version 1.0 (Décembre 2024)
- Support complet ArchiMate 3.2
- Gestion de référentiel avec PostgreSQL
- DataBlocks pour attributs personnalisés
- Interface de modélisation complète
- Système de check-in/check-out
- Auto-save automatique

---

*Document généré le : Décembre 2024*  
*ArchiModeler - Enterprise Architecture Platform*





