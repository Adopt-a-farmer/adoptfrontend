// Enhanced farmer service with caching for better performance
import { farmerService } from '@/services/farmer';

interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  crops?: string;
  farmingType?: string;
  experience?: string;
  verified?: boolean;
  minFarmSize?: number;
  maxFarmSize?: number;
  sortBy?: string;
  [key: string]: string | number | boolean | undefined;
}

class FarmerCacheService {
  private cache = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(method: string, params?: SearchParams): string {
    return `${method}_${JSON.stringify(params || {})}`;
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.cacheTimeout;
  }

  async getFarmersWithCache(params?: SearchParams) {
    const cacheKey = this.getCacheKey('getFarmers', params);
    const cached = this.cache.get(cacheKey);

    if (cached && !this.isExpired(cached.timestamp)) {
      console.log('🎯 Using cached farmer data');
      return cached.data;
    }

    console.log('🔄 Fetching fresh farmer data');
    try {
      const data = await farmerService.getFarmers(params);
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      // If fresh fetch fails and we have expired cache, use it
      if (cached) {
        console.log('⚠️ Using expired cache due to fetch error');
        return cached.data;
      }
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Farmer cache cleared');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const farmerCacheService = new FarmerCacheService();