# Ligne Rouge — Média numérique international premium

<div align="center">

**Plateforme d'information internationale indépendante**

*Actualité · Politique · Économie · Technologie · Sport · Culture*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io)

</div>

---

## Aperçu

Ligne Rouge est une plateforme média premium construite avec **Next.js 15 App Router**, **TypeScript strict** et **TailwindCSS**. Elle offre une expérience éditoriale de niveau international, comparable aux standards de Reuters, Bloomberg ou BBC News.

### Fonctionnalités principales

- **Architecture Next.js 15 App Router** — SSR, SSG, ISR, streaming
- **Design éditorial premium** — Typographie Playfair Display + Source Sans 3, palette navy/rouge
- **Dark mode** — Thème sombre complet avec basculement fluide
- **Dashboard CMS** — Gestion des articles, commentaires, analytics
- **SEO avancé** — Sitemap XML, RSS feed, JSON-LD, OpenGraph, Google News ready
- **API REST** — Routes API pour articles, recherche, newsletter
- **Responsive mobile-first** — Adapté à tous les écrans
- **Accessibilité WCAG AA** — Navigation clavier, ARIA, contrastes
- **Performance** — Images optimisées (next/image), code splitting, caching
- **Sécurité** — Headers CSP, X-Frame-Options, anti-XSS
- **Breaking news ticker** — Bandeau d'actualités défilant en temps réel
- **Prisma Schema** — Modèle de données PostgreSQL complet et prêt pour la production

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | Next.js 15, TypeScript, TailwindCSS |
| Fonts | Playfair Display, Source Sans 3, Source Serif 4 |
| Icons | Lucide React |
| Theme | next-themes |
| Validation | Zod |
| ORM | Prisma (PostgreSQL) |
| Dates | date-fns |
| Animations | Framer Motion |

## Structure du projet

```
/
├── prisma/              # Schéma Prisma (PostgreSQL)
├── public/              # Assets statiques, favicon
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── admin/       # Dashboard CMS
│   │   ├── api/         # API Routes
│   │   ├── article/     # Pages article [slug]
│   │   ├── author/      # Pages auteur [slug]
│   │   ├── category/    # Pages catégorie [slug]
│   │   ├── search/      # Page recherche
│   │   ├── about/       # À propos
│   │   ├── contact/     # Contact
│   │   ├── legal/       # Mentions légales
│   │   ├── privacy/     # Confidentialité
│   │   ├── feed.xml/    # RSS Feed
│   │   ├── sitemap.ts   # Sitemap XML
│   │   └── robots.ts    # Robots.txt
│   ├── components/      # Composants React
│   │   ├── layout/      # Header, Footer, Ticker, Logo, Search
│   │   ├── articles/    # HeroSection, ArticleCard, Newsletter
│   │   └── ui/          # Composants UI réutilisables
│   ├── config/          # Configuration du site
│   ├── hooks/           # Custom React hooks
│   ├── lib/
│   │   ├── data/        # Données (articles, catégories, auteurs)
│   │   └── utils/       # Utilitaires (cn, etc.)
│   ├── styles/          # Styles globaux
│   └── types/           # Types TypeScript
├── .env.example         # Variables d'environnement
└── next.config.ts       # Configuration Next.js
```

## Démarrage rapide

### Prérequis

- Node.js 20+
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone https://github.com/souleymanekhaled12/media.git
cd media

# Installer les dépendances
npm install

# Copier la configuration
cp .env.example .env.local

# Lancer le serveur de développement
npm run dev
```

Le site est accessible sur [http://localhost:3000](http://localhost:3000).

### Build production

```bash
npm run build
npm start
```

### Configuration PostgreSQL (optionnel)

Pour connecter une base de données PostgreSQL :

1. Mettre à jour `DATABASE_URL` dans `.env.local`
2. Exécuter les migrations :
   ```bash
   npx prisma migrate dev
   ```
3. Seeder la base :
   ```bash
   npx prisma db seed
   ```

## Pages

| Route | Description |
|-------|------------|
| `/` | Page d'accueil avec hero, trending, catégories |
| `/article/[slug]` | Page article avec JSON-LD, related articles |
| `/category/[slug]` | Liste des articles par catégorie |
| `/search` | Recherche full-text |
| `/author/[slug]` | Profil auteur et articles |
| `/admin` | Dashboard CMS |
| `/about` | À propos |
| `/contact` | Formulaire de contact |
| `/legal` | Mentions légales |
| `/privacy` | Politique de confidentialité |
| `/feed.xml` | Flux RSS |
| `/sitemap.xml` | Sitemap XML |

## API Routes

| Endpoint | Méthode | Description |
|----------|---------|------------|
| `/api/articles` | GET | Liste des articles (filtres: category, limit, offset) |
| `/api/search?q=` | GET | Recherche d'articles |
| `/api/newsletter` | POST | Inscription newsletter |

## Déploiement

### Vercel (recommandé)

```bash
npx vercel --prod
```

Ou connecter le repository GitHub directement dans le dashboard Vercel.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Licence

© 2026 Ligne Rouge. Tous droits réservés.
