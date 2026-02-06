import { authService } from './auth'
import { ApiResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8007/api'

export interface ApiDashboardStats {
    totalDrivers: number
    activeDrivers: number
    pendingDrivers: number
    totalPartners: number
    totalEvaluations: number
    averageGlobalScore: number
    totalUsers: number
}

class StatsService {
    private baseURL = `${API_BASE_URL}/stats`

    async getDashboardStats(): Promise<ApiDashboardStats> {
        try {
            const response = await authService.authenticatedFetch(`${this.baseURL}/dashboard`)
            if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques')
            const result: ApiResponse<ApiDashboardStats> = await response.json()
            return result.data
        } catch (error) {
            console.error('❌ [StatsService] Erreur getDashboardStats:', error)
            throw error
        }
    }

    async getDriverStats(filter?: string): Promise<any> {
        try {
            const url = new URL(`${this.baseURL}/drivers`)
            if (filter) url.searchParams.append('filter', filter)

            const response = await authService.authenticatedFetch(url.toString())
            if (!response.ok) throw new Error('Erreur lors de la récupération des stats chauffeurs')
            const result = await response.json()
            return result.data
        } catch (error) {
            console.error('❌ [StatsService] Erreur getDriverStats:', error)
            throw error
        }
    }

    async getDriverGlobalScore(driverUuid: string): Promise<number> {
        try {
            const response = await authService.authenticatedFetch(`${this.baseURL}/drivers/global-score?driverId=${driverUuid}`)
            if (!response.ok) throw new Error('Erreur lors de la récupération du score global')
            const result: ApiResponse<number> = await response.json()
            return result.data
        } catch (error) {
            console.error('❌ [StatsService] Erreur getDriverGlobalScore:', error)
            throw error
        }
    }
}

export const statsService = new StatsService()
