import { ApiResponse, PaginatedResponse } from '@/types'
import { authService } from './auth'
import { ApiEvaluation } from './evaluations'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

// Types pour les statistiques d'évaluations
export interface EvaluationStats {
  totalEvaluations: number
  completedEvaluations: number
  pendingEvaluations: number
  validatedEvaluations: number
  rejectedEvaluations: number
  averageScore: number
  evaluationsByMonth: Array<{
    month: string
    count: number
    averageScore: number
  }>
  topDrivers: Array<{
    driverUuid: string
    driverName: string
    averageScore: number
    evaluationCount: number
  }>
  evaluationsByStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
}

class EvaluationStatsService {
  private baseURL = API_BASE_URL

  async getEvaluationStats(params?: { 
    filter?: string
    startDate?: string
    endDate?: string
  }): Promise<PaginatedResponse<ApiEvaluation>> {
    try {
      console.log('🔍 [EvaluationStatsService] Récupération des statistiques...')

      const queryParams = new URLSearchParams()
      if (params?.filter) queryParams.append('filter', params.filter)
      if (params?.startDate) queryParams.append('startDate', params.startDate)
      if (params?.endDate) queryParams.append('endDate', params.endDate)

      const url = `${this.baseURL}/stats/evaluations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await authService.authenticatedFetch(url, { method: 'GET' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      if (!text) {
        throw new Error('Réponse vide du serveur')
      }

      let data: ApiResponse<PaginatedResponse<ApiEvaluation>>
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Erreur parsing JSON:', text)
        throw new Error('Réponse serveur invalide (JSON malformé)')
      }

      console.log('🔍 [EvaluationStatsService] Réponse API stats:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationStatsService] Erreur API stats:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des statistiques')
      }

      console.log('✅ [EvaluationStatsService] Statistiques récupérées:', data.data.content.length)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationStatsService] Erreur getEvaluationStats:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getEvaluationsByMonth(year: number, month: number): Promise<PaginatedResponse<ApiEvaluation>> {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`
      const filter = `(evaluationDate >= '${startDate}' and evaluationDate <= '${endDate}')`
      
      return this.getEvaluationStats({ filter })
    } catch (error) {
      console.error('❌ [EvaluationStatsService] Erreur getEvaluationsByMonth:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getEvaluationsByDriver(driverEmail: string): Promise<PaginatedResponse<ApiEvaluation>> {
    try {
      const filter = `(driver.user.email='${driverEmail}')`
      
      return this.getEvaluationStats({ filter })
    } catch (error) {
      console.error('❌ [EvaluationStatsService] Erreur getEvaluationsByDriver:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getRecentEvaluations(days: number = 30): Promise<PaginatedResponse<ApiEvaluation>> {
    try {
      const date = new Date()
      date.setDate(date.getDate() - days)
      const startDate = date.toISOString().split('T')[0]
      const filter = `(evaluationDate >= '${startDate}')`
      
      return this.getEvaluationStats({ filter })
    } catch (error) {
      console.error('❌ [EvaluationStatsService] Erreur getRecentEvaluations:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  // Méthodes utilitaires pour calculer les statistiques côté client
  calculateStats(evaluations: ApiEvaluation[]): EvaluationStats {
    const totalEvaluations = evaluations.length
    const completedEvaluations = evaluations.filter(e => e.status === 'COMPLETED').length
    const pendingEvaluations = evaluations.filter(e => e.status === 'PENDING').length
    const validatedEvaluations = evaluations.filter(e => e.status === 'VALIDATED').length
    const rejectedEvaluations = evaluations.filter(e => e.status === 'REJECTED').length

    // Calcul de la note moyenne
    const completedWithScores = evaluations.filter(e => e.status === 'COMPLETED' && e.overallScore)
    const averageScore = completedWithScores.length > 0 
      ? completedWithScores.reduce((sum, e) => sum + (e.overallScore || 0), 0) / completedWithScores.length
      : 0

    // Évaluations par mois
    const evaluationsByMonth = this.groupByMonth(evaluations)

    // Top drivers
    const topDrivers = this.getTopDrivers(evaluations)

    // Évaluations par statut
    const evaluationsByStatus = [
      { status: 'COMPLETED', count: completedEvaluations, percentage: (completedEvaluations / totalEvaluations) * 100 },
      { status: 'PENDING', count: pendingEvaluations, percentage: (pendingEvaluations / totalEvaluations) * 100 },
      { status: 'VALIDATED', count: validatedEvaluations, percentage: (validatedEvaluations / totalEvaluations) * 100 },
      { status: 'REJECTED', count: rejectedEvaluations, percentage: (rejectedEvaluations / totalEvaluations) * 100 }
    ]

    return {
      totalEvaluations,
      completedEvaluations,
      pendingEvaluations,
      validatedEvaluations,
      rejectedEvaluations,
      averageScore,
      evaluationsByMonth,
      topDrivers,
      evaluationsByStatus
    }
  }

  private groupByMonth(evaluations: ApiEvaluation[]) {
    const monthGroups: { [key: string]: ApiEvaluation[] } = {}
    
    evaluations.forEach(evaluation => {
      const date = new Date(evaluation.evaluationDate)
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = []
      }
      monthGroups[monthKey].push(evaluation)
    })

    return Object.entries(monthGroups).map(([month, evals]) => {
      const completedEvals = evals.filter(e => e.status === 'COMPLETED' && e.overallScore)
      const averageScore = completedEvals.length > 0
        ? completedEvals.reduce((sum, e) => sum + (e.overallScore || 0), 0) / completedEvals.length
        : 0

      return {
        month,
        count: evals.length,
        averageScore
      }
    }).sort((a, b) => a.month.localeCompare(b.month))
  }

  private getTopDrivers(evaluations: ApiEvaluation[]) {
    const driverGroups: { [key: string]: { evaluations: ApiEvaluation[], name: string } } = {}
    
    evaluations.forEach(evaluation => {
      const driverUuid = evaluation.driver.uuid
      const driverName = `${evaluation.driver.user.firstname} ${evaluation.driver.user.lastname}`
      
      if (!driverGroups[driverUuid]) {
        driverGroups[driverUuid] = { evaluations: [], name: driverName }
      }
      driverGroups[driverUuid].evaluations.push(evaluation)
    })

    return Object.entries(driverGroups)
      .map(([driverUuid, data]) => {
        const completedEvals = data.evaluations.filter(e => e.status === 'COMPLETED' && e.overallScore)
        const averageScore = completedEvals.length > 0
          ? completedEvals.reduce((sum, e) => sum + (e.overallScore || 0), 0) / completedEvals.length
          : 0

        return {
          driverUuid,
          driverName: data.name,
          averageScore,
          evaluationCount: data.evaluations.length
        }
      })
      .filter(driver => driver.evaluationCount > 0)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10) // Top 10
  }
}

export const evaluationStatsService = new EvaluationStatsService()