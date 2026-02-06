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
  /** Required permissions to view this navigation item (any of these permissions) */
  permissions?: string[]
  /** If true, user must have ALL permissions instead of ANY */
  requireAllPermissions?: boolean
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
  partnerId?: string // Partner UUID for users associated with a partner
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
  guardName?: string
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
  roles?: Array<{ uuid: string; name: string }>
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
  partner?: ApiPartner
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

// Agent types
export interface ApiAgent {
  uuid: string
  version: number
  code: string
  slug?: string | null
  createdBy?: number
  createdDate: string
  lastModifiedBy?: number
  lastModifiedDate: string
  deleted?: boolean | null
  isDeletable?: boolean | null
  user: ApiUser
  partner: ApiPartner
  position: string
  status: string
}

export interface CreateAgentRequest {
  // User informations
  phone: string
  lastname: string
  firstname: string
  dob: string
  email: string
  address?: string
  city?: string
  country?: string
  countryISO?: string
  countryCode?: string
  // Agent informations
  partner: { uuid: string }
  position: string
  status: string
}

// Optional: query params for fetching agents
export interface GetAgentsParams {
  page?: number
  size?: number
  filter?: string
  status?: string
  partnerUuid?: string
  active?: boolean
}

// Permission guard names for Users
export enum UserPermissions {
  VIEW_MENU_USER = 'CAN_VIEW_MENU_USER',
  CREATE_USER = 'CAN_CREATE_USER',
  READ_ANY_USER = 'CAN_READ_ANY_USER',
  READ_USER = 'CAN_READ_USER',
  READ_OWN_USER = 'CAN_READ_OWN_USER',
  UPDATE_USER = 'CAN_UPDATE_USER',
  UPDATE_OWN_USER = 'CAN_UPDATE_OWN_USER',
  DELETE_USER = 'CAN_DELETE_USER',
  DELETE_OWN_USER = 'CAN_DELETE_OWN_USER',
  RESTORE_USER = 'CAN_RESTORE_USER',
  RESTORE_OWN_USER = 'CAN_RESTORE_OWN_USER'
}

// Permission guard names for Roles
export enum RolePermissions {
  VIEW_MENU_ROLE = 'CAN_VIEW_MENU_ROLE',
  CREATE_ROLE = 'CAN_CREATE_ROLE',
  READ_ANY_ROLE = 'CAN_READ_ANY_ROLE',
  READ_ROLE = 'CAN_READ_ROLE',
  READ_OWN_ROLE = 'CAN_READ_OWN_ROLE',
  UPDATE_ROLE = 'CAN_UPDATE_ROLE',
  UPDATE_OWN_ROLE = 'CAN_UPDATE_OWN_ROLE',
  DELETE_ROLE = 'CAN_DELETE_ROLE',
  DELETE_OWN_ROLE = 'CAN_DELETE_OWN_ROLE',
  RESTORE_ROLE = 'CAN_RESTORE_ROLE',
  RESTORE_OWN_ROLE = 'CAN_RESTORE_OWN_ROLE'
}

// Permission guard names for Drivers
export enum DriverPermissions {
  VIEW_MENU_DRIVER = 'CAN_VIEW_MENU_DRIVER',
  CREATE_DRIVER = 'CAN_CREATE_DRIVER',
  READ_ANY_DRIVER = 'CAN_READ_ANY_DRIVER',
  READ_DRIVER = 'CAN_READ_DRIVER',
  READ_OWN_DRIVER = 'CAN_READ_OWN_DRIVER',
  UPDATE_DRIVER = 'CAN_UPDATE_DRIVER',
  UPDATE_OWN_DRIVER = 'CAN_UPDATE_OWN_DRIVER',
  DELETE_DRIVER = 'CAN_DELETE_DRIVER',
  DELETE_OWN_DRIVER = 'CAN_DELETE_OWN_DRIVER',
  RESTORE_DRIVER = 'CAN_RESTORE_DRIVER',
  RESTORE_OWN_DRIVER = 'CAN_RESTORE_OWN_DRIVER',
  // Driver Documents
  VIEW_MENU_DRIVER_DOCUMENT = 'CAN_VIEW_MENU_DRIVER_DOCUMENT',
  CREATE_DRIVER_DOCUMENT = 'CAN_CREATE_DRIVER_DOCUMENT',
  READ_ANY_DRIVER_DOCUMENT = 'CAN_READ_ANY_DRIVER_DOCUMENT',
  READ_DRIVER_DOCUMENT = 'CAN_READ_DRIVER_DOCUMENT',
  READ_OWN_DRIVER_DOCUMENT = 'CAN_READ_OWN_DRIVER_DOCUMENT',
  UPDATE_DRIVER_DOCUMENT = 'CAN_UPDATE_DRIVER_DOCUMENT',
  UPDATE_OWN_DRIVER_DOCUMENT = 'CAN_UPDATE_OWN_DRIVER_DOCUMENT',
  DELETE_DRIVER_DOCUMENT = 'CAN_DELETE_DRIVER_DOCUMENT',
  DELETE_OWN_DRIVER_DOCUMENT = 'CAN_DELETE_OWN_DRIVER_DOCUMENT',
  RESTORE_DRIVER_DOCUMENT = 'CAN_RESTORE_DRIVER_DOCUMENT',
  RESTORE_OWN_DRIVER_DOCUMENT = 'CAN_RESTORE_OWN_DRIVER_DOCUMENT'
}

// Permission guard names for Evaluations
export enum EvaluationPermissions {
  VIEW_MENU_EVALUATION = 'CAN_VIEW_MENU_EVALUATION',
  CREATE_EVALUATION = 'CAN_CREATE_EVALUATION',
  READ_ANY_EVALUATION = 'CAN_READ_ANY_EVALUATION',
  READ_EVALUATION = 'CAN_READ_EVALUATION',
  READ_OWN_EVALUATION = 'CAN_READ_OWN_EVALUATION',
  UPDATE_EVALUATION = 'CAN_UPDATE_EVALUATION',
  UPDATE_OWN_EVALUATION = 'CAN_UPDATE_OWN_EVALUATION',
  DELETE_EVALUATION = 'CAN_DELETE_EVALUATION',
  DELETE_OWN_EVALUATION = 'CAN_DELETE_OWN_EVALUATION',
  RESTORE_EVALUATION = 'CAN_RESTORE_EVALUATION',
  RESTORE_OWN_EVALUATION = 'CAN_RESTORE_OWN_EVALUATION'
}

// Permission guard names for Partners
export enum PartnerPermissions {
  VIEW_MENU_PARTNER = 'CAN_VIEW_MENU_PARTNER',
  CREATE_PARTNER = 'CAN_CREATE_PARTNER',
  READ_ANY_PARTNER = 'CAN_READ_ANY_PARTNER',
  READ_PARTNER = 'CAN_READ_PARTNER',
  READ_OWN_PARTNER = 'CAN_READ_OWN_PARTNER',
  UPDATE_PARTNER = 'CAN_UPDATE_PARTNER',
  UPDATE_OWN_PARTNER = 'CAN_UPDATE_OWN_PARTNER',
  DELETE_PARTNER = 'CAN_DELETE_PARTNER',
  DELETE_OWN_PARTNER = 'CAN_DELETE_OWN_PARTNER',
  RESTORE_PARTNER = 'CAN_RESTORE_PARTNER',
  RESTORE_OWN_PARTNER = 'CAN_RESTORE_OWN_PARTNER'
}

// Permission guard names for Agents
export enum AgentPermissions {
  VIEW_MENU_AGENT = 'CAN_VIEW_MENU_AGENT',
  CREATE_AGENT = 'CAN_CREATE_AGENT',
  READ_ANY_AGENT = 'CAN_READ_ANY_AGENT',
  READ_AGENT = 'CAN_READ_AGENT',
  READ_OWN_AGENT = 'CAN_READ_OWN_AGENT',
  UPDATE_AGENT = 'CAN_UPDATE_AGENT',
  UPDATE_OWN_AGENT = 'CAN_UPDATE_OWN_AGENT',
  DELETE_AGENT = 'CAN_DELETE_AGENT',
  DELETE_OWN_AGENT = 'CAN_DELETE_OWN_AGENT',
  RESTORE_AGENT = 'CAN_RESTORE_AGENT',
  RESTORE_OWN_AGENT = 'CAN_RESTORE_OWN_AGENT'
}

// Multi-partner workflow types
export interface ApiDriverPartnerHistory {
  id: number
  driver: ApiDriver
  partner: ApiPartner
  startDate: string
  endDate: string | null
  status: 'ACTIVE' | 'TERMINATED'
}