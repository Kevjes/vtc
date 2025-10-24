import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { ApiEvaluationTemplate } from '@/types'
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface TemplateCardProps {
  template: ApiEvaluationTemplate
  onDelete: (uuid: string) => void
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onDelete }) => {
  const router = useRouter()

  return (
    <Card className="template-card">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm line-clamp-1">
                {template.name}
              </h3>
              <Badge variant={template.active ? 'success' : 'warning'} className="compact-badge">
                {template.active ? 'Actif' : 'Inactif'}
              </Badge>
              <span className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[10px]">
                {template.code || 'N/A'}
              </span>
            </div>
            
            {template.description && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-1">
                {template.description}
              </p>
            )}
            
            <div className="flex items-center gap-3 text-[10px] text-neutral-500">
              <span>
                <span className="font-medium">{Array.isArray(template.templateCriteriaList) ? template.templateCriteriaList.length : 0}</span> critères
              </span>
              <span>
                Créé le {template.createdDate ? new Date(template.createdDate).toLocaleDateString('fr-FR') : '—'}
              </span>
              {template.lastModifiedDate && template.lastModifiedDate !== template.createdDate && (
                <span>
                  Modifié le {new Date(template.lastModifiedDate).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-3 action-buttons">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push(`/evaluations/templates/${template.uuid}`)}
              className="action-button px-1.5 h-7"
              title="Voir les détails"
            >
              <EyeIcon className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push(`/evaluations/templates/${template.uuid}/edit`)}
              className="action-button px-1.5 h-7"
              title="Modifier"
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="action-button text-red-600 hover:text-red-700 px-1.5 h-7" 
              onClick={() => onDelete(template.uuid)}
              title="Supprimer"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}