import { useState, useEffect } from 'react';
import api from '@/services/api';

interface ExpertStats {
  articles: {
    total: number;
    published: number;
    drafts: number;
  };
  engagement: {
    totalViews: number;
    totalLikes: number;
    calendarEntries: number;
  };
  platform: {
    totalFarmers: number;
    totalAdopters: number;
  };
}

interface RecentArticle {
  _id: string;
  title: string;
  status: string;
  views: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ExpertDashboardData {
  stats: ExpertStats;
  recentArticles: RecentArticle[];
}

export const useExpertDashboard = () => {
  const [data, setData] = useState<ExpertDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/experts/dashboard');
      setData(response.data);
      setError(null);
    } catch (error: unknown) {
      console.error('Failed to fetch expert dashboard data:', error);
      
      // Handle 403 Forbidden specifically
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 403) {
          setError('Access denied: You need expert permissions to view this dashboard');
          return;
        }
      }
      
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats: data?.stats,
    recentArticles: data?.recentArticles || [],
    isLoading,
    error,
    refetch: fetchDashboardData
  };
};