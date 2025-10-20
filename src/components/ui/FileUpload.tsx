'use client'

import React, { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from './Button'

interface FileUploadProps {
  label?: string
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onFileSelect: (files: File[]) => void
  error?: string
  className?: string
}

export function FileUpload({
  label,
  accept = '*/*',
  multiple = false,
  maxSize = 5,
  onFileSelect,
  error,
  className
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      const sizeInMB = file.size / (1024 * 1024)
      return sizeInMB <= maxSize
    })

    setSelectedFiles(multiple ? [...selectedFiles, ...validFiles] : validFiles)
    onFileSelect(validFiles)
  }, [maxSize, multiple, onFileSelect, selectedFiles])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }, [handleFiles])

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFileSelect(newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400',
          error && 'border-red-500'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-3">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <div>
            <p className="text-sm text-neutral-900 dark:text-neutral-100">
              <span className="font-medium text-primary-600">Cliquez pour télécharger</span> ou glissez-déposez
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Taille max: {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <DocumentIcon className="h-5 w-5 text-neutral-500" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}