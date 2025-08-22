import { apiCall } from './api';

export interface Visit {
  _id: string;
  adopter: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phoneNumber: string;
    email: string;
  };
  farmer: {
    _id: string;
    farmName: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phoneNumber: string;
    location: {
      address: string;
      city: string;
      state: string;
      coordinates?: { lat: number; lng: number };
    };
  };
  proposedDate: string;
  confirmedDate?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  type: 'farm_tour' | 'adoption_ceremony' | 'harvest_participation' | 'project_review' | 'training_session';
  duration: number; // in hours
  description?: string;
  requirements?: string[];
  transportation?: {
    providedBy: 'adopter' | 'farmer' | 'shared';
    type: 'car' | 'bus' | 'bike' | 'walking';
    meetingPoint?: string;
    cost?: number;
  };
  accommodation?: {
    required: boolean;
    providedBy?: 'farmer' | 'adopter' | 'third_party';
    type?: 'homestay' | 'hotel' | 'guesthouse' | 'camping';
    cost?: number;
    details?: string;
  };
  activities: Array<{
    activity: string;
    description: string;
    duration: number;
    location?: string;
  }>;
  notes?: string;
  cancellationReason?: string;
  feedback?: {
    rating: number;
    comment: string;
    highlights: string[];
    suggestions: string[];
    wouldRecommend: boolean;
    photos?: string[];
    submittedBy: 'adopter' | 'farmer';
    submittedAt: string;
  };
  cost?: {
    visitFee: number;
    transportationCost: number;
    accommodationCost: number;
    mealsCost: number;
    totalCost: number;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    paymentReference?: string;
  };
  photos?: string[];
  weather?: {
    condition: string;
    temperature: number;
    humidity: number;
    date: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VisitTemplate {
  _id: string;
  type: string;
  name: string;
  description: string;
  defaultDuration: number;
  activities: Array<{
    activity: string;
    description: string;
    duration: number;
  }>;
  requirements: string[];
  recommendedGroup: {
    min: number;
    max: number;
  };
  seasonality: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  ageRestrictions?: {
    minimum: number;
    maximum?: number;
  };
}

export const visitService = {
  // Get all visits for user
  getVisits: async (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
    upcoming?: boolean;
  }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await apiCall<{
      success: boolean;
      data: {
        visits: Visit[];
        pagination: any;
      };
    }>('GET', `/visits${queryString}`);
  },

  // Get single visit
  getVisit: async (visitId: string) => {
    return await apiCall<{
      success: boolean;
      data: { visit: Visit };
    }>('GET', `/visits/${visitId}`);
  },

  // Request a visit (Adopter to Farmer)
  requestVisit: async (farmerId: string, visitData: {
    proposedDate: string;
    type: string;
    duration: number;
    description?: string;
    groupSize?: number;
    specialRequests?: string[];
    transportation?: any;
    accommodation?: any;
  }) => {
    return await apiCall('POST', `/visits/request/${farmerId}`, visitData);
  },

  // Confirm visit (Farmer)
  confirmVisit: async (visitId: string, confirmationData: {
    confirmedDate: string;
    finalDetails?: string;
    activities: any[];
    cost?: any;
  }) => {
    return await apiCall('POST', `/visits/${visitId}/confirm`, confirmationData);
  },

  // Reschedule visit
  rescheduleVisit: async (visitId: string, rescheduleData: {
    newDate: string;
    reason: string;
  }) => {
    return await apiCall('POST', `/visits/${visitId}/reschedule`, rescheduleData);
  },

  // Cancel visit
  cancelVisit: async (visitId: string, cancellationData: {
    reason: string;
    cancellationFee?: number;
  }) => {
    return await apiCall('POST', `/visits/${visitId}/cancel`, cancellationData);
  },

  // Complete visit
  completeVisit: async (visitId: string, completionData: {
    photos?: string[];
    notes?: string;
    activities: string[];
  }) => {
    return await apiCall('POST', `/visits/${visitId}/complete`, completionData);
  },

  // Submit visit feedback
  submitFeedback: async (visitId: string, feedbackData: {
    rating: number;
    comment: string;
    highlights: string[];
    suggestions: string[];
    wouldRecommend: boolean;
    photos?: string[];
  }) => {
    return await apiCall('POST', `/visits/${visitId}/feedback`, feedbackData);
  },

  // Get visit templates
  getVisitTemplates: async () => {
    return await apiCall<{
      success: boolean;
      data: { templates: VisitTemplate[] };
    }>('GET', '/visits/templates');
  },

  // Create visit template (Farmer)
  createVisitTemplate: async (templateData: Omit<VisitTemplate, '_id'>) => {
    return await apiCall('POST', '/visits/templates', templateData);
  },

  // Update visit template
  updateVisitTemplate: async (templateId: string, templateData: Partial<VisitTemplate>) => {
    return await apiCall('PUT', `/visits/templates/${templateId}`, templateData);
  },

  // Delete visit template
  deleteVisitTemplate: async (templateId: string) => {
    return await apiCall('DELETE', `/visits/templates/${templateId}`);
  },

  // Get available visit slots for a specific farmer (public)
  // Backend expects: GET /visits/farmer/:farmerId/availability?date=YYYY-MM-DD
  getAvailableSlots: async (farmerId: string, params?: { date?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await apiCall('GET', `/visits/farmer/${farmerId}/availability${queryString}`);
  },

  // Get saved availability for the authenticated farmer
  // Backend: GET /visits/availability?start=YYYY-MM-DD&end=YYYY-MM-DD (optional range)
  getMyAvailability: async (params?: { start?: string; end?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await apiCall<{ success: boolean; data: { availability: Array<{ date: string; timeSlots: string[] }> } }>('GET', `/visits/availability${queryString}`);
  },

  // Set availability (Farmer)
  // Backend expects: POST /visits/availability with { date: 'YYYY-MM-DD', time_slots: string[] }
  setAvailability: async (availabilityData: { date: string; time_slots: string[] }) => {
    return await apiCall('POST', '/visits/availability', availabilityData);
  },

  // Get visit statistics
  getVisitStats: async (timeframe?: 'week' | 'month' | 'year') => {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    return await apiCall('GET', `/visits/stats${params}`);
  },

  // Get nearby farms for visits
  getNearbyFarms: async (params: {
    latitude: number;
    longitude: number;
    radius: number;
    visitType?: string;
  }) => {
    const queryString = `?${new URLSearchParams(params as any).toString()}`;
    return await apiCall('GET', `/visits/nearby-farms${queryString}`);
  },

  // Generate visit itinerary
  generateItinerary: async (visitId: string) => {
    return await apiCall('GET', `/visits/${visitId}/itinerary`);
  },

  // Get visit photos
  getVisitPhotos: async (visitId: string) => {
    return await apiCall('GET', `/visits/${visitId}/photos`);
  },

  // Upload visit photos
  uploadVisitPhotos: async (visitId: string, photos: string[]) => {
    return await apiCall('POST', `/visits/${visitId}/photos`, { photos });
  },

  // Get weather forecast for visit
  getWeatherForecast: async (visitId: string) => {
    return await apiCall('GET', `/visits/${visitId}/weather`);
  },

  // Send visit reminder
  sendReminder: async (visitId: string, reminderType: 'day_before' | 'hour_before' | 'custom') => {
    return await apiCall('POST', `/visits/${visitId}/reminder`, { type: reminderType });
  },

  // Get visit checklist
  getVisitChecklist: async (visitId: string) => {
    return await apiCall('GET', `/visits/${visitId}/checklist`);
  },

  // Update visit checklist
  updateVisitChecklist: async (visitId: string, checklist: string[]) => {
    return await apiCall('POST', `/visits/${visitId}/checklist`, { checklist });
  },

  // Process visit payment
  processPayment: async (visitId: string, paymentData: {
    amount: number;
    paymentMethod: string;
  }) => {
    return await apiCall<{
      success: boolean;
      data: {
        paymentUrl: string;
        reference: string;
      };
    }>('POST', `/visits/${visitId}/payment`, paymentData);
  },

  // Verify visit payment
  verifyPayment: async (reference: string) => {
    return await apiCall('POST', '/visits/verify-payment', { reference });
  },
};