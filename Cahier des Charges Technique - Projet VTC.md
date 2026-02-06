**Cahier des Charges**

**Plateforme de Gestion des Chauffeurs & Partenaires**

**1\. Contexte et Objectifs**

Développer une plateforme web et mobile pour gérer les **profils, performances et interactions** des **chauffeurs** et **partenaires**, tout en offrant aux **administrateurs** un tableau de bord centralisé, des outils de supervision, d’analyse et d’audit.

**2\. Composants Logicielle Principaux**

| Composant | Stack / Technologie |
| :---- | :---- |
| **Frontend Web Admin** | Next.js / React / Tailwind / Shadcn |
| **App Mobile (chauffeur/partenaire)** | Flutter  |
| **Backend API** | Spring Boot |
| **Base de données** | PostgreSQL  |
| **Authentification** | JWT \+ 2FA OTP (email/SMS) |
| **Déploiement** | Docker \+ Docker Compose |
| **Logs & Monitoring** |  |

**3\. Besoins Fonctionnels par Modules et Acteurs**

Cette section est divisée par module fonctionnel, mais chaque fonctionnalité est aussi assignée à un acteur principal.

**3.1 Module Authentification et Sécurité**

| Fonctionnalité | Chauffeur | Partenaire | Admin |
| :---- | :---- | :---- | :---- |
| **Connexion via email ou téléphone \+ mot de passe** | ✅ | ✅ | ✅ |
| **Envoi OTP (2FA) pour renforcer la sécurité** | ✅ | ✅ | ✅ |
| **Réinitialisation mot de passe** | ✅ | ✅ | ✅ |
| **Déconnexion à distance (en cas de vol, etc.)** | ✅ | ✅ | ✅ |
| **Gestion des permissions et rôles** |  |  | ✅ |
| **Journal des connexions** |  |  | ✅ |

**3.2 Module Gestion des Chauffeurs**

| Fonctionnalité | Chauffeur | Partenaire | Admin |
| :---- | :---- | :---- | :---- |
| **Création / édition de son profil** | ✅ |  | ✅ |
| **Envoi de documents administratifs** | ✅ |  | ✅ |
| **Suivi de l’évolution de carrière** | ✅ | ✅ | ✅ |
| **Affectation à un partenaire** |  | ✅ | ✅ |
| **Suspension ou archivage** |  |  | ✅ |
| **Visualisation de ses évaluations** | ✅ | ✅ | ✅ |

**3.3 Module Gestion des Partenaires**

| Fonctionnalité | Chauffeur | Partenaire | Admin |
| :---- | :---- | :---- | :---- |
| **Création / édition du compte partenaire** |  | ✅ | ✅ |
| **Affectation de chauffeurs** |  | ✅ | ✅ |
| **Visualisation des performances de ses chauffeurs** |  | ✅ | ✅ |
| **Relance d’un chauffeur pour évaluation** |  | ✅ | ✅ |

**3.4 Module Évaluations**

| Fonctionnalité | Chauffeur | Partenaire | Admin |
| :---- | :---- | :---- | :---- |
| **Consultation de ses propres évaluations** | ✅ |  |  |
| **Remplir une évaluation pour un chauffeur** |  | ✅ | ✅ |
| **Définition des critères d’évaluation** |  |  | ✅ |
| **Analyse des performances par période / agence** |  | ✅ | ✅ |
| **Historique des évaluations** | ✅ | ✅ | ✅ |

### **Critères d’évaluation des chauffeurs (remplis uniquement par les partenaires)**

- ### **Mode d’évaluation :** Saisie manuelle partenaire

| Critère | Formulation utilisateur (partenaire) | Type d’entrée (interface) | Unité de mesure | Fréquence d’évaluation | Pondération (%) |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **Ponctualité** | Le chauffeur était-il à l’heure aux rendez-vous ? | 1 à 5 | Moyenne des notes /5 | Après chaque mission ou hebdomadaire | 20% |
| **Courtoisie** | Le chauffeur était-il respectueux et professionnel ? | 1 à 5 | Moyenne des notes /5 | Après chaque mission ou hebdomadaire | 15% |
| **Propreté du véhicule** | Le véhicule était-il propre et entretenu correctement ? |  1 à 5 | Moyenne des notes /5 | Après chaque mission ou hebdomadaire | 10% |
| **Respect des itinéraires** | Le chauffeur respecte-t-il les trajets prévus ou indiqués ? | Oui / Non \+ Commentaire | % de respect basé sur évaluations | Après chaque mission ou hebdomadaire | 10% |
| **Communication** | La communication du chauffeur est-elle claire et courtoise ? | 1 à 5 | Moyenne des notes /5 | Après chaque mission ou hebdomadaire | 10% |
| **Taux d’annulation** | Le chauffeur a-t-il annulé des missions sans raison valable ? | Sélection de fréquence (Jamais / Rarement / Souvent) | Fréquence perçue (%) | Hebdomadaire ou mensuelle | 15% |
| **Volume d’activité** | Le chauffeur est-il suffisamment actif ? | Sélection (Faible / Moyen / Fort) | Appréciation qualitative | Mensuelle | — |
| **Réclamations reçues** | Avez-vous reçu des plaintes le concernant ? | Oui / Non \+ Motif | Nombre et nature des réclamations | Dès qu’un incident est signalé | 10% |
| **Assiduité générale** | Le chauffeur est-il présent et régulier dans ses engagements ? | 1 à 5 | Note moyenne | Hebdomadaire ou mensuelle | 10% |

### **Remarques complémentaires**

* **Tous les champs sont accessibles via un formulaire simple** sur l’interface partenaire web et mobile.  
* Un **rappel par notification** peut être déclenché à la fin de chaque course pour inviter le partenaire à évaluer.  
* Une **page d’historique** permettra à chaque partenaire de consulter ses évaluations passées sur chaque chauffeur.  
* **Seules les dernières évaluations sur les 3 derniers mois** sont prises en compte pour le calcul du **score global**.  
* Un module de **commentaire libre** peut compléter les entrées pour ajouter du contexte.

**3.5 Module Import / Export**

| Fonctionnalité | Chauffeur | Partenaire | Admin |
| :---- | :---- | :---- | :---- |
| Import en masse de chauffeurs |  |  | ✅ |
| Import / export des évaluations |  |  | ✅ |
| Export des historiques / profils |  | ✅ | ✅ |
| Fichier modèle disponible pour importation |  |  | ✅ |

**3.6 Module Reporting & Suivi**

| Fonctionnalité | Chauffeur | Partenaire | Admin |
| :---- | :---- | :---- | :---- |
| Tableau de bord personnel (indicateurs clés) | ✅ | ✅ | ✅ |
| Vue consolidée des partenaires |  | ✅ | ✅ |
| Statistiques globales |  |  | ✅ |

**3.7 Module Notifications & Relances**

| Fonctionnalité | Chauffeur | Partenaire | Admin |
| :---- | :---- | :---- | :---- |
| Notifications Email | ✅ | ✅ | ✅ |
| Relance automatique des évaluations en retard |  | ✅ | ✅ |
| Relance pour pièces manquantes | ✅ | ✅ | ✅ |

**4\. Besoins Non Fonctionnels**

| Catégorie | Besoin |
| :---- | :---- |
| **Sécurité** | Données encryptées, accès restreints, RGPD |
| **Ergonomie** | UX adapté mobile / web, interfaces fluides |
| **Mobile First** | Application fluide avec longues sessions et mise en cache |
| **Modularité** | Architecture modulaire pour déploiement indépendant de modules |
| **Performance** | API \< 500 ms, pages \< 1 s de chargement |
| **Synchronisation** | Données temps réel ou quasi temps réel |
| **Backups & Résilience** | Sauvegardes journalières |
| **Maintenance** | Journalisation complète, erreurs traçables, monitoring |
| **Déploiement CI/CD** | Utilisation de Docker \+ pipelines automatiques  |

**5\. Planning Indicatif** 

| Phase | Durée estimée | Dates prévues |
| ----- | ----- | ----- |
| Rédaction des specs : Analyse et Conception  | 1 semaine | 26/05/2025 – 01/06/2025 |
| Design UI/UX | 1 semaine | 02/06/2025 – 08/06/2025 |
| Développement MVP | 4 semaines | 09/06/2025 – 06/07/2025 |
| Tests & QA | 1 semaine | 07/07/2025 – 13/07/2025 |
| Déploiement | 1 semaine | 14/07/2025 – 20/07/2025 |
| Support & ajustements | Continu | À partir du 21/07/2025 |

