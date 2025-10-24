import React from 'react'
import { Button, Input, Select } from '@/components/ui'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface TemplateSearchBarProps {
  searchTerm: string
  statusFilter: 'all' | 'active' | 'inactive'
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: 'all' | 'active' | 'inactive') => void
  onSearch: () => void
  onClear: () => void
}

export const TemplateSearchBar: React.FC<TemplateSearchBarProps> = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onSearch,
  onClear
}) => {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Rechercher par nom ou description..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            className="pr-8 h-8 text-sm"
          />
          <MagnifyingGlassIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
          options={[
            { value: 'all', label: 'Tous' },
            { value: 'active', label: 'Actifs' },
            { value: 'inactive', label: 'Inactifs' },
          ]}
          className="w-24 h-8 text-sm"
        />
        {(searchTerm || statusFilter !== 'all') && (
          <Button 
            variant="outline" 
            onClick={onClear}
            size="sm"
            className="h-8 px-2 text-xs"
            title="Effacer les filtres"
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  )
}