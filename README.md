# VTC Dashboard

Dashboard de gestion pour la plateforme VTC - Interface d'administration pour gérer les chauffeurs, partenaires et évaluations.

## Fonctionnalités

- 🎨 Interface moderne avec thème light/dark
- 📊 Dashboard avec statistiques en temps réel
- 👥 Gestion des chauffeurs
- 🤝 Gestion des partenaires
- ⭐ Système d'évaluations
- 📱 Design responsive
- 🎯 Architecture clean

## Technologies

- **Framework**: Next.js 14 avec App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Font**: Segoe UI Variable

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Lancer le serveur de développement :
```bash
npm run dev
```

3. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
src/
├── app/                 # Pages Next.js (App Router)
├── components/          # Composants React
│   ├── ui/             # Composants UI de base
│   ├── layout/         # Composants de layout
│   └── dashboard/      # Composants spécifiques au dashboard
├── contexts/           # Contexts React
├── lib/               # Utilitaires
├── types/             # Types TypeScript
└── hooks/             # Hooks personnalisés
```

## Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Build pour la production
- `npm run start` - Lance le serveur de production
- `npm run lint` - Lance ESLint
- `npm run type-check` - Vérification TypeScript

## Thèmes

Le dashboard supporte les thèmes light et dark avec basculement automatique. Le thème par défaut est light.

## Architecture

Le projet suit les principes de la clean architecture :
- Séparation des couches
- Inversion de dépendance
- Composants réutilisables
- Types TypeScript stricts


● ✅ Déploiement Docker réussi !

  L'application est maintenant containerisée et déployée avec Node.js 18 :

  ✨ Avantages du déploiement Docker :
  - ✅ Utilise Node.js 18 (version requise par le projet)
  - ✅ Environnement isolé et reproductible
  - ✅ Indépendant des limitations de CentOS 7
  - ✅ Redémarrage automatique avec restart: unless-stopped
  - ✅ Gestion simplifiée avec Docker Compose

  🔗 Accès :
  - URL : http://194.163.132.186:3000
  - Container : vtc-dashboard
  - Status : Running (démarré et prêt)

  📋 Commandes utiles :
  # Voir les logs
  docker logs vtc-dashboard -f

  # Redémarrer
  docker compose restart

  # Arrêter
  docker compose down

  # Mettre à jour le code
  git pull origin dev && docker compose up -d --build

  L'application tourne maintenant avec la version correcte de Node.js dans un
  environnement Docker stable ! 🎉