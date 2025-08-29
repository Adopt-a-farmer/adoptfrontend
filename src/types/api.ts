// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  total?: number;
  pages?: number;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'farmer' | 'adopter' | 'expert';
  phoneNumber?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserData;
}

export interface UserData {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  role: 'farmer' | 'adopter' | 'expert' | 'admin' | 'investor' | 'buyer' | 'logistics_partner';
  isEmailVerified?: boolean;
  isVerified?: boolean;
  avatar_url?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  avatar?: string;
  avatar_url?: string;
}

// Expert Types
export interface ExpertData {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
  specialization: string;
  mentorshipId: string;
  startDate: string;
  status: string;
  goals: GoalData[];
  completedGoals: number;
  totalGoals: number;
  conversationId: string;
}

export interface GoalData {
  title: string;
  description: string;
  status: string;
  targetDate: string;
}

// Knowledge Types
export interface KnowledgeParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  difficulty?: string;
  sort?: 'latest' | 'popular' | 'views';
}

export interface CalendarParams {
  region?: string;
  month?: number;
  category?: string;
  crop?: string;
  livestock?: string;
}

// Farmer Types
export interface FarmerParams {
  page?: number;
  limit?: number;
  farmingType?: string;
  location?: string;
  verified?: boolean;
  search?: string;
  county?: string;
  cropType?: string;
}

export interface AdoptionParams {
  status?: string;
  page?: number;
  limit?: number;
}

// Adopter Types
export interface AdopterParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface FeedbackData {
  rating: number;
  comment: string;
  images?: string[];
}

export interface AdoptionData {
  packageType: string;
  duration: number;
  message?: string;
}

export interface CreateMentorshipData {
  farmerId: string;
  specialization: string;
  goals?: string[];
  sessionFrequency?: string;
  paymentTerms?: {
    type: 'free' | 'paid';
    amount?: number;
    frequency?: string;
  };
}

// Media Types
export interface MediaUploadData {
  formData: FormData;
}

export interface MediaHeaders {
  headers: {
    'Content-Type': string;
  };
}

// Settings Types
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  oldPassword?: string;
}

export interface WithdrawalData {
  amount: number;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

// Search Types
export interface SearchFilters {
  [key: string]: string | number | boolean | undefined;
}

export interface SearchParams {
  q?: string;
  query?: string;
  filters?: SearchFilters;
}

// Calendar Types
export interface CalendarEntryData {
  title: string;
  description: string;
  category: string;
  timing: {
    month: number;
    week?: number;
    season: string;
  };
  region: string;
  cropType?: string[];
  livestockType?: string[];
  priority: string;
  resources: string[];
  tips: string[];
}

// Article Types
export interface ArticleData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  images?: string[];
  difficulty: string;
}

export interface CommentData {
  content: string;
}

// Additional types for missing interfaces
export interface FarmUpdate {
  _id: string;
  title: string;
  content: string;
  author: string;
  images?: string[];
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface WithdrawalRequest {
  _id: string;
  amount: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

export interface FarmVisit {
  _id: string;
  visitor: string;
  farmer: string;
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface VisitStats {
  totalVisits: number;
  completedVisits: number;
  upcomingVisits: number;
  cancelledVisits: number;
}

export interface FarmerAvailability {
  _id: string;
  farmer: string;
  availableDays: string[];
  timeSlots: Array<{
    start: string;
    end: string;
  }>;
  isActive: boolean;
}

export interface Conversation {
  _id: string;
  participants: string[];
  lastMessage: {
    content: string;
    sender: string;
    timestamp: string;
  };
  unreadCount: number;
}

export interface Farmer {
  _id: string;
  farmName?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  location?: {
    subCounty?: string;
    county?: string;
  };
  establishedYear?: number;
  media?: {
    farmImages?: Array<{
      url: string;
    }>;
  };
  farmSize?: {
    value: number;
    unit: string;
  };
  verificationStatus?: string;
  description?: string;
  bio?: string;
  farmingType?: string[];
  cropTypes?: string[];
  adoptionPackages?: Array<{
    _id: string;
    name: string;
    title: string;
    type: string;
    price: number;
    duration: number;
    description: string;
    benefits?: string[];
    deliverables?: string[];
  }>;
  statistics?: {
    activeAdoptions?: number;
    rating?: number;
    completedProjects?: number;
  };
}