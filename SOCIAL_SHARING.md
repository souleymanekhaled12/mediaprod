# Social Media Integration & Sharing Features

## 📱 Features implémentées

### 1. **ShareButtons Component** (`src/components/articles/ShareButtons.tsx`)
- ✅ Support de 7+ réseaux sociaux (Facebook, Twitter/X, LinkedIn, WhatsApp, Telegram, Email, Copy Link)
- ✅ 3 variantes: horizontal, vertical, floating
- ✅ 3 tailles: sm, md, lg
- ✅ Tooltips intelligents
- ✅ Dark mode support
- ✅ Accessibilité (ARIA labels)

### 2. **Social Engagement** (`src/components/articles/SocialEngagement.tsx`)
- **SocialStats**: Like button, commentaires, partages, vues
- **SocialFeed**: Intégration de flux social en temps réel
- **SocialProof**: Widget de preuve sociale avec followers

### 3. **Configuration Sociale** (`src/config/social.ts`)
- 8 plateformes majeures pré-configurées
- URL templates prêts à l'emploi
- Tracking d'événements d'analytiques
- Estimation de partages par plateforme
- Tendances et hashtags

### 4. **API Route** (`src/app/api/analytics/shares/route.ts`)
- Enregistrement des événements de partage
- Intégration Supabase/PostgreSQL
- Notifications aux créateurs

## 🎯 Réseaux Sociaux Supportés

| Réseau | Utilisateurs | Fonctionnalité |
|--------|--------------|---|
| **Facebook** | 3.07 milliards | Partage direct |
| **X/Twitter** | 541 millions | Tweet avec hashtags |
| **LinkedIn** | 950 millions | Partage professionnel |
| **Instagram** | 2 milliards | Via Story/DM |
| **WhatsApp** | 2 milliards | Partage direct |
| **Telegram** | 900 millions | Via Canal/Chat |
| **Reddit** | 500 millions | Soumission à subs |
| **Pinterest** | 507 millions | Épingles avec images |

## 💻 Utilisation

### Basic Share Buttons
```tsx
<ShareButtons
  url="https://example.com/article"
  title="Titre de l'article"
  description="Description courte"
  variant="horizontal"
  size="md"
/>
```

### Share Section Complète
```tsx
<ArticleShareSection
  articleUrl={url}
  articleTitle={title}
  articleDescription={description}
/>
```

### Social Stats
```tsx
<SocialStats
  articleId="123"
  likes={1250}
  comments={89}
  shares={450}
  views={12500}
/>
```

### Social Proof Widget
```tsx
<SocialProof
  totalShares={450}
  totalFollowers={847000}
  platforms={[
    { name: 'Facebook', followers: 250000 },
    { name: 'Twitter', followers: 180000 }
  ]}
/>
```

## 🔗 Open Graph Meta Tags

Générez automatiquement les meta tags pour les prévisualisations sociales:

```tsx
import { generateSocialMetaTags } from '@/components/articles/ShareButtons';

const metaTags = generateSocialMetaTags({
  title: 'Mon Article',
  description: 'Description',
  imageUrl: 'https://example.com/image.jpg',
  articleUrl: 'https://example.com/article',
  author: 'Jean Dupont',
  publishedDate: '2026-05-18'
});
```

## 📊 Analytics & Tracking

### Track Share Events
```tsx
import { trackShareEvent } from '@/config/social';

trackShareEvent({
  platform: 'facebook',
  articleId: '123',
  articleTitle: 'Mon Article',
  timestamp: new Date(),
  userId: 'user123'
});
```

### Trending Hashtags
```tsx
import { getTrendingHashtags } from '@/config/social';

const trends = await getTrendingHashtags('twitter', 5);
```

## 🎨 Styling & Customization

### Dark Mode
- Support natif du dark mode via Tailwind CSS
- Couleurs adaptatives pour chaque plateforme
- Transitions fluides

### Responsive Design
- Mobile-first approach
- Adapté à tous les écrans
- Floating share buttons sur mobile

## 🚀 Intégrations Futures

- [ ] Analytics en temps réel
- [ ] Share counters en direct
- [ ] Trending content detection
- [ ] Influencer detection
- [ ] Viral score prediction
- [ ] Social listening
- [ ] Sentiment analysis
- [ ] Competitor monitoring

## 📝 Bonnes Pratiques

1. **Utilisez des images optimisées** (1200x630px min)
2. **Écrivez des titres accrocheurs** (50-60 caractères)
3. **Descriptions courtes mais informatives**
4. **Hashtags pertinents** (3-5 par plateforme)
5. **Timing optimal** pour chaque plateforme
6. **Test A/B** des descriptions

## 🔒 Sécurité

- XSS protection via encodeURIComponent
- CSP headers configurés
- Validation des URLs
- Rate limiting sur l'API de shares

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-05-18
