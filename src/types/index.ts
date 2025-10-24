// User types
export interface User {
  id: string
  email: string
  phone: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  ADMIN = 'admin',
  PARTNER = 'partner',
  DRIVER = 'driver'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived'
}

// Driver types
export interface Driver extends User {
  licenseNumber: string
  vehicleType: VehicleType
  vehicleInfo: VehicleInfo
  rating: number
  totalRides: number
  documents: Document[]
  evaluations: Evaluation[]
  partner?: Partner
}

export interface VehicleInfo {
  make: string
  model: string
  year: number
  color: string
  plateNumber: string
  insurance: Insurance
}

export interface Insurance {
  provider: string
  policyNumber: string
  expirationDate: Date
}

export enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  VAN = 'van',
  TRUCK = 'truck'
}

// Partner types
export interface Partner extends User {
  companyName: string
  drivers: Driver[]
}

// Document types
export interface Document {
  id: string
  type: DocumentType
  fileName: string
  url: string
  status: DocumentStatus
  uploadedAt: Date
  expirationDate?: Date
}

export enum DocumentType {
  DRIVER_LICENSE = 'driver_license',
  VEHICLE_REGISTRATION = 'vehicle_registration',
  INSURANCE = 'insurance',
  CRIMINAL_RECORD = 'criminal_record',
  PHOTO = 'photo'
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// Evaluation types
export interface Evaluation {
  id: string
  driverId: string
  partnerId: string
  criteria: EvaluationCriteria
  overallRating: number
  comment?: string
  createdAt: Date
}

export interface EvaluationCriteria {
  punctuality: number
  courtesy: number
  vehicleCleanliness: number
  routeRespect: boolean
  communication: number
  cancellationRate: CancellationFrequency
  activityLevel: ActivityLevel
  complaints: boolean
  complaintsReason?: string
  attendance: number
}

export enum CancellationFrequency {
  NEVER = 'never',
  RARELY = 'rarely',
  OFTEN = 'often'
}

export enum ActivityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Navigation types
export interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  children?: NavigationItem[]
}

// Dashboard stats
export interface DashboardStats {
  totalDrivers: number
  activeDrivers: number
  totalPartners: number
  totalEvaluations: number
  averageRating: number
  pendingDocuments: number
}

// Authentication types
export interface LoginCredentials {
  login: string
  password: string
}

export interface AuthResponse {
  token: string
  user: AuthUser | null
}

export interface AuthUser {
  id?: string
  uuid?: string // API might use uuid instead of id
  username: string
  email: string
  firstname: string
  lastname: string
  phone?: string
  type: UserType
  roles?: Role[] // Make roles optional to handle undefined
  active: boolean
  address?: string
  city?: string
  country?: string
  countryCode?: string
  dob?: string
}

export interface Role {
  id: number
  name: string
  uuid?: string
  isActive?: boolean
  permissions?: Permission[]
}

export interface Permission {
  uuid: string
  name?: string
}

export enum UserType {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  PARTNER = 'PARTNER',
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER'
}

export interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  token: string | null
  isLoading: boolean
}

// API Response types
export interface ApiResponse<T> {
  status: number
  valid: boolean
  lang: string
  message: string
  data: T
  error: any
  timestamp: string
}

export interface PaginatedResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: Array<{
      direction: string
      property: string
      ignoreCase: boolean
      nullHandling: string
      descending: boolean
      ascending: boolean
    }>
    offset: number
    unpaged: boolean
    paged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  sort: Array<{
    direction: string
    property: string
    ignoreCase: boolean
    nullHandling: string
    descending: boolean
    ascending: boolean
  }>
  numberOfElements: number
  first: boolean
  empty: boolean
}

// API User types (from actual API responses)
export interface ApiUser {
  uuid: string
  version: number
  code: string
  slug?: string
  createdBy?: number
  createdDate: string
  lastModifiedBy?: number
  lastModifiedDate: string
  deleted?: boolean
  isDeletable?: boolean
  username?: string
  lastname: string
  firstname: string
  dob: string
  roles: ApiRole[]
  email: string
  passwordChangeRequired?: boolean
  phone: string
  address?: string
  city?: string
  country?: string
  countryISO?: string
  profileImage?: string
  active: boolean
  loginAttempts?: number
  lastLogin?: string
  connexions?: number
  authorizations?: any
}

export interface ApiRole {
  uuid: string
  version: number
  code: string
  slug?: string
  createdBy?: number
  createdDate: string
  lastModifiedBy?: number
  lastModifiedDate: string
  deleted?: boolean
  isDeletable?: boolean
  name: string
  guardName: string
  isActive: boolean
  isVisible: boolean
  permissions: ApiPermission[]
}

export interface ApiPermission {
  uuid: string
  version: number
  code: string
  slug?: string
  createdBy?: number
  createdDate: string
  lastModifiedBy?: number
  lastModifiedDate: string
  deleted: boolean
  isDeletable: boolean
  name: string
  guardName: string
}

export interface ApiSession {
  uuid: string
  version: number
  code: string
  slug?: string
  createdBy?: number
  createdDate: string
  lastModifiedBy?: number
  lastModifiedDate: string
  deleted?: boolean
  isDeletable?: boolean
  sessionId: string
  userId: string
  ipAddress?: string
  userAgent?: string
  active: boolean
  expiresAt: string
}

// Create/Update DTOs
export interface CreateUserRequest {
  username: string
  lastname: string
  firstname: string
  dob: string
  roles: Array<{ uuid: string; name: string }>
  email: string
  type: UserType
  password: string
  phone: string
  address?: string
  city?: string
  country?: string
  countryISO: string
  active: boolean
}

export interface UpdateUserRequest {
  lastname?: string
  firstname?: string
  dob?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  active?: boolean
}

export interface CreateRoleRequest {
  name: string
  isActive: boolean
  permissions: Array<{ uuid: string }>
}

export interface UpdateRoleRequest {
  name?: string
  isActive?: boolean
  permissions?: Array<{ uuid: string }>
}

// API Driver types (from actual API responses)
export interface ApiDriver {
  uuid: string
  version: number
  code: string
  slug?: string
  createdBy?: number
  createdDate: string
  lastModifiedBy?: number
  lastModifiedDate: string
  deleted?: boolean
  isDeletable?: boolean
  user: ApiUser
  licenseID: string
  issueDate: string
  expiryDate: string
  issuedAt: string
  status: string
  // Additional properties that might be returned by API
  licenseNumber?: string
  vehicleType?: string
  vehicleInfo?: ApiVehicleInfo
  rating?: number
  totalRides?: number
  evaluations?: ApiEvaluation[]
  documents?: ApiDocument[]
  partnerName?: string
  partnerId?: string
  profileImage?: string
  dob?: string
  active?: boolean
}


export interface ApiVehicleInfo {
  make: string
  model: string
  year: number
  color: string
  plateNumber: string
  insurance?: ApiInsurance
}

export interface ApiInsurance {
  provider: string
  policyNumber: string
  expirationDate: string
}

export interface ApiDocument {
  uuid: string
  type: string
  fileName: string
  url: string
  status: string
  uploadedAt: string
  expirationDate?: string
}

export interface ApiEvaluation {
  uuid: string
  version: number
  code: string
  slug?: string | null
  createdBy?: number
  createdDate: string
  lastModifiedBy?: number
  lastModifiedDate: string
  deleted?: boolean
  isDeletable?: boolean
  driver: ApiDriver
  partner: ApiPartner
  evaluator: AuthUser
  template: ApiEvaluationTemplate
  evaluationDate: string
  comments?: string
  periodStart: string
  periodEnd: string
  averageScore: number
  status: 'PENDING' | 'COMPLETED' | 'VALIDATED' | 'REJECTED'
  evaluationScores: ApiEvaluationScore[]
}

export interface ApiEvaluationScore {
  uuid: string
  version: number
  code: string
  slug?: string | null
  createdBy?: number
  createdDate: string
  lastModifiedBy?: number
  lastModifiedDate: string
  deleted?: boolean
  isDeletable?: boolean
  evaluation: string
  criteria: ApiEvaluationCriteria
  value?: string | null
  numericValue: number
  comment?: string
}

export interface ApiEvaluationCriteria {
  uuid: string
  version: number
  code: string
  slug?: string | null
  createdBy?: number
  createdDate: string
  lastModifiedBy?: number
  lastModifiedDate: string
  deleted?: boolean
  isDeletable?: boolean
  name: string
  description?: string
  active: boolean
  templateCriteriaList?: any[] | null
}

// Create/Update DTOs for Drivers
export interface CreateDriverRequest {
  firstname: string
  lastname: string
  email: string
  phone: string
  address?: string
  city?: string
  country?: string
  countryISO: string
  dob: string
  licenseNumber: string
  vehicleType: string
  vehicleInfo?: CreateVehicleInfoRequest
  partnerId?: string
  active: boolean
}

export interface UpdateDriverRequest {
  firstname?: string
  lastname?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  dob?: string
  licenseNumber?: string
  vehicleType?: string
  vehicleInfo?: UpdateVehicleInfoRequest
  partnerId?: string
  active?: boolean
}

export interface CreateVehicleInfoRequest {
  make: string
  model: string
  year: number
  color: string
  plateNumber: string
  insurance?: CreateInsuranceRequest
}

export interface UpdateVehicleInfoRequest {
  make?: string
  model?: string
  year?: number
  color?: string
  plateNumber?: string
  insurance?: UpdateInsuranceRequest
}

export interface CreateInsuranceRequest {
  provider: string
  policyNumber: string
  expirationDate: string
}

export interface UpdateInsuranceRequest {
  provider?: string
  policyNumber?: string
  expirationDate?: string
}

// API Partner types (from actual API responses)
export interface ApiPartner {
  uuid: string
  version: number
  code: string
  slug?: string
  createdBy?: number
  createdDate: string
  lastModifiedBy?: number
  lastModifiedDate: string
  deleted?: boolean
  isDeletable?: boolean
  name: string
  shortName: string
  status: string
  email: string
  phone: string
  companyIdentifier: string
  address: string
}

// Create/Update DTOs for Partners
export interface CreatePartnerRequest {
  name: string
  shortName: string
  status: string
  email: string
  phone: string
  companyIdentifier: string
  address: string
}

export interface UpdatePartnerRequest {
  name?: string
  shortName?: string
  status?: string
  email?: string
  phone?: string
  companyIdentifier?: string
  address?: string
}

// Create/Update DTOs for Evaluation Criteria
export interface CreateEvaluationCriteriaRequest {
  name: string
  description?: string
  active: boolean
}

export interface UpdateEvaluationCriteriaRequest {
  name?: string
  description?: string
  active?: boolean
}

// API Evaluation Template types
export interface ApiEvaluationTemplate {
  uuid: string
  version: number
  code: string
  slug?: string | null
  createdBy?: number
  createdDate: string
  lastModifiedBy?: number
  lastModifiedDate: string
  deleted?: boolean
  isDeletable?: boolean
  name: string
  description?: string
  active: boolean
  templateCriteriaList?: ApiTemplateCriteria[] | null
}

export interface CreateEvaluationTemplateRequest {
  name: string
  description?: string
  active: boolean
  evaluationCriteriaList?: Array<{ uuid: string }>
}

export interface UpdateEvaluationTemplateRequest {
  name?: string
  description?: string
  active?: boolean
  evaluationCriteriaList?: Array<{ uuid: string }>
}

// Template Criteria types for API response
export interface ApiTemplateCriteria {
  uuid: string
  version?: number | null
  code?: string | null
  slug?: string | null
  createdBy?: number | null
  createdDate?: string | null
  lastModifiedBy?: number | null
  lastModifiedDate?: string | null
  deleted: boolean
  isDeletable: boolean
  evaluationTemplate: string
  evaluationCriteria: ApiEvaluationCriteria
  orderIndex: number
}

// Template export/import types
export interface TemplateExportData {
  name: string
  description?: string
  active: boolean
  evaluationCriteriaList: Array<{
    uuid: string
    name: string
    description?: string
    orderIndex: number
  }>
  exportedAt: string
  exportedBy: string
}

// Bulk operations types
export interface BulkTemplateOperation {
  uuids: string[]
  action: 'activate' | 'deactivate' | 'delete'
}

// Template statistics types
export interface TemplateStats {
  uuid: string
  name: string
  usageCount: number
  lastUsed?: string
  averageScore?: number
}