# VTC Dashboard - Guide de Développement

## 🚀 Guide de Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git

### Installation
```bash
cd dashboard
npm install
npm run dev
```

### Structure du Projet à Connaître
```
dashboard/
├── src/app/           # Pages Next.js App Router
├── src/components/    # Composants réutilisables  
├── src/contexts/      # React Contexts (Theme, etc.)
├── src/types/         # Types TypeScript
└── src/lib/           # Utilitaires et helpers
```

## 📚 Conventions de Développement

### 1. Naming Conventions

#### Fichiers et Dossiers
```
pages/                 # kebab-case
├── drivers/
│   ├── page.tsx      # Toujours page.tsx pour App Router
│   └── [id]/         # Dynamic routes avec crochets
components/            # PascalCase
├── ui/
│   ├── Button.tsx    
│   └── Input.tsx     
```

#### Variables et Fonctions
```typescript
// camelCase pour variables et fonctions
const userName = 'admin'
const handleSubmit = () => {}

// PascalCase pour composants et types
interface UserData {}
const MyComponent = () => {}

// UPPER_SNAKE_CASE pour constantes
const API_BASE_URL = 'https://api.example.com'
```

### 2. Structure des Composants

#### Template Standard
```typescript
'use client' // Ajouter si hooks client nécessaires

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  IconName,
  AnotherIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { 
  Card, 
  CardContent, 
  Button 
} from '@/components/ui'

// Types d'abord
interface ComponentProps {
  id: string
  title?: string
}

// Composant principal
export default function ComponentName({ id, title }: ComponentProps) {
  // État local
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  // Effects
  useEffect(() => {
    // Logique de chargement
  }, [id])

  // Handlers
  const handleAction = async () => {
    setLoading(true)
    try {
      // Logique
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Rendu conditionnel
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  // JSX principal
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {title}
          </h1>
          <Button onClick={handleAction}>
            Action
          </Button>
        </div>

        {/* Contenu principal */}
        <Card>
          <CardContent>
            {/* Contenu */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
```

### 3. Gestion d'État

#### État Local (useState)
```typescript
// Simple state
const [isOpen, setIsOpen] = useState(false)

// Objet state
const [formData, setFormData] = useState({
  name: '',
  email: ''
})

// Update handlers
const handleInputChange = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }))
}
```

#### État de Chargement Pattern
```typescript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const fetchData = async () => {
  setLoading(true)
  setError('')
  try {
    // API call simulation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setData(mockData)
  } catch (err) {
    setError('Erreur lors du chargement')
  } finally {
    setLoading(false)
  }
}
```

### 4. Navigation et Routing

#### Navigation Programmatique  
```typescript
import { useRouter, useParams } from 'next/navigation'

const router = useRouter()
const params = useParams()

// Redirection
router.push('/drivers/123')
router.back()
router.replace('/login')

// Récupérer paramètres  
const id = params.id // Pour [id]/page.tsx
```

#### Navigation avec Query Params
```typescript
// Redirection avec paramètres
router.push('/drivers?status=active')
router.push(`/drivers/${id}?success=driver-updated`)

// Dans le composant destination, utiliser useSearchParams
```

### 5. Formulaires et Validation

#### Pattern de Validation
```typescript
interface FormData {
  name: string
  email: string
}

const [formData, setFormData] = useState<FormData>({
  name: '',
  email: ''
})
const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

const validateForm = (): boolean => {
  const newErrors: Partial<Record<keyof FormData, string>> = {}

  if (!formData.name.trim()) {
    newErrors.name = 'Le nom est requis'
  }
  
  if (!formData.email.trim()) {
    newErrors.email = 'L\'email est requis'
  } else if (!isValidEmail(formData.email)) {
    newErrors.email = 'Format d\'email invalide'
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) return
  
  // Soumettre le formulaire
}
```

### 6. Styling avec Tailwind

#### Classes Essentielles
```typescript
// Layout
<div className="space-y-6">           {/* Espacement vertical */}
<div className="grid gap-6 md:grid-cols-2"> {/* Grid responsive */}
<div className="flex items-center justify-between"> {/* Flexbox */}

// Responsive Design  
<div className="hidden md:block">     {/* Visible sur desktop seulement */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Dark Mode
<div className="bg-white dark:bg-neutral-900">
<p className="text-neutral-900 dark:text-neutral-100">

// States
<button className="hover:bg-neutral-100 dark:hover:bg-neutral-800">
<div className="border border-neutral-200 dark:border-neutral-800">
```

#### Design System Colors
```typescript
// Primary (jaune/orange)
bg-primary-50   text-primary-900
bg-primary-500  text-primary-100

// Neutral (greys)  
bg-neutral-50   text-neutral-900
bg-neutral-500  text-neutral-100

// Semantic
bg-green-500    // Success
bg-red-500      // Danger  
bg-yellow-500   // Warning
bg-blue-500     // Info
```

### 7. Mock Data Patterns

#### Structure Mock Data
```typescript
// Créer au niveau du composant
const mockItems = [
  {
    id: '1',
    name: 'Item 1',
    status: 'active',
    createdAt: '2024-09-09T10:00:00Z'
  },
  // Plus d'items...
]

// Simulation API avec délai
const fetchData = async () => {
  setLoading(true)
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    setData(mockItems)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setLoading(false)
  }
}
```

### 8. Composants UI Usage

#### Composants de Base
```typescript
// Button variants
<Button variant="primary">Primaire</Button>
<Button variant="outline">Outline</Button>  
<Button variant="ghost" size="icon">
  <IconName className="h-4 w-4" />
</Button>

// Input avec validation
<Input
  label="Nom d'utilisateur"
  value={formData.username}
  onChange={(e) => handleChange('username', e.target.value)}
  error={errors.username}
  icon={<UserIcon className="h-4 w-4" />}
/>

// Select avec options
<Select
  label="Statut"
  value={selectedStatus}
  onChange={(e) => setSelectedStatus(e.target.value)}
  options={[
    { value: '', label: 'Sélectionner' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' }
  ]}
  error={errors.status}
/>
```

#### Card Layouts
```typescript
<Card>
  <CardHeader>
    <CardTitle className="flex items-center">
      <IconName className="h-5 w-5 mr-2" />
      Titre
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Contenu */}
  </CardContent>
</Card>
```

### 9. Error Handling

#### Pattern Standard
```typescript
const [error, setError] = useState('')

const handleAction = async () => {
  setError('')
  try {
    // Action
  } catch (error) {
    console.error('Action failed:', error)
    setError('Une erreur est survenue')
  }
}

// Dans le JSX
{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-800">{error}</p>
  </div>
)}
```

### 10. Performance Best Practices

#### Optimisations
```typescript
// Memoization pour calculs coûteux
import { useMemo } from 'react'

const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// Callback memoization
import { useCallback } from 'react'

const handleClick = useCallback(() => {
  // Handler logic
}, [dependency])
```

## 🔧 Outils de Développement

### Scripts Utiles
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server  
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

### Extensions VSCode Recommandées
- TypeScript Hero
- Tailwind CSS IntelliSense  
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Bracket Pair Colorizer

### Debugging
```typescript
// Console.log avec contexte
console.log('Component rendered:', { props, state })

// React DevTools
// Installer l'extension browser pour debug

// Network debugging
// Utiliser onglet Network pour simuler API calls
```

## 📋 Checklist Nouveau Développeur

### Setup Initial
- [ ] Clone le repo
- [ ] `npm install` 
- [ ] `npm run dev`
- [ ] Vérifier localhost:3000 fonctionne

### Familiarisation  
- [ ] Lire CLAUDE.md et PROJECT_STATUS.md
- [ ] Explorer structure `src/` 
- [ ] Tester navigation dashboard
- [ ] Examiner composants UI dans `src/components/ui/`

### Premier Développement
- [ ] Créer une page simple suivant le template
- [ ] Utiliser composants UI existants
- [ ] Implémenter navigation basique  
- [ ] Tester responsive et dark mode

### Contribution
- [ ] Suivre conventions naming
- [ ] Utiliser pattern de gestion d'état
- [ ] Implémenter error handling
- [ ] Tester avant commit

## 🎯 Prochains Développements

### Priorités Immédiates
1. **Finaliser `/evaluations/new`** - Formulaire création évaluation
2. **Créer `/evaluations/criteria`** - Gestion critères
3. **Améliorer UX** - Loading states, toast, pagination

### Améliorations Futures  
- Intégration API backend
- Tests automatisés
- i18n complet
- PWA capabilities
- Analytics dashboard

---

*Ce guide couvre l'essentiel pour développer efficacement sur le projet VTC Dashboard. Pour des questions spécifiques, consulter la documentation technique dans CLAUDE.md*

*Dernière mise à jour: 09/09/2024*