import { authService } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8007/api'

class ImportExportService {
    private baseURL = API_BASE_URL

    async exportDrivers(): Promise<Blob> {
        try {
            console.log('🔍 [ImportExportService] Export des chauffeurs...')
            const response = await authService.authenticatedFetch(`${this.baseURL}/export/drivers`, {
                method: 'GET'
            })

            if (!response.ok) {
                throw new Error(`Erreur lors de l'export: ${response.statusText}`)
            }

            return await response.blob()
        } catch (error) {
            console.error('❌ [ImportExportService] Erreur exportDrivers:', error)
            throw error
        }
    }

    async importDrivers(file: File): Promise<any> {
        try {
            console.log('🔍 [ImportExportService] Import des chauffeurs...', file.name)

            const formData = new FormData()
            formData.append('file', file)

            // Note: authenticatedFetch uses JSON content-type by default, we need to override or use native fetch for FormData
            const token = authService.getToken()
            const response = await fetch(`${this.baseURL}/export/drivers/import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Browser will set the correct Content-Type with boundary for FormData
                },
                body: formData
            })

            if (response.status === 401) {
                await authService.handleUnauthorized()
                throw new Error('Session expirée')
            }

            const data = await response.json()
            if (!data.valid || data.status !== 200) {
                throw new Error(data.message || 'Erreur lors de l\'import')
            }

            console.log('✅ [ImportExportService] Import réussi:', data.data)
            return data.data
        } catch (error) {
            console.error('❌ [ImportExportService] Erreur importDrivers:', error)
            throw error
        }
    }
}

export const importExportService = new ImportExportService()
