import { apiCall } from './api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    public_id: string;
    secure_url: string;
    format: string;
    resource_type: string;
    width?: number;
    height?: number;
  };
}

export interface MultiUploadResponse {
  success: boolean;
  message: string;
  data: {
    files: Array<{
      url: string;
      public_id: string;
      secure_url: string;
      format: string;
      resource_type: string;
      width?: number;
      height?: number;
    }>;
  };
}

export const uploadService = {
  // Upload single file
  uploadSingle: async (file: File, folder?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    return await apiCall<UploadResponse>('POST', '/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload multiple files
  uploadMultiple: async (files: File[], folder?: string): Promise<MultiUploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    return await apiCall<MultiUploadResponse>('POST', '/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete file from Cloudinary
  deleteFile: async (publicId: string) => {
    return await apiCall('DELETE', '/upload', { public_id: publicId });
  },

  // Upload profile image
  uploadProfileImage: async (file: File): Promise<UploadResponse> => {
    return await uploadService.uploadSingle(file, 'profiles');
  },

  // Upload farm images
  uploadFarmImages: async (files: File[]): Promise<MultiUploadResponse> => {
    return await uploadService.uploadMultiple(files, 'farms');
  },

  // Upload document
  uploadDocument: async (file: File, type: string): Promise<UploadResponse> => {
    return await uploadService.uploadSingle(file, `documents/${type}`);
  },

  // Upload project images (for crowdfunding)
  uploadProjectImages: async (files: File[]): Promise<MultiUploadResponse> => {
    return await uploadService.uploadMultiple(files, 'projects');
  },

  // Upload chat files
  uploadChatFile: async (file: File): Promise<UploadResponse> => {
    return await uploadService.uploadSingle(file, 'chat');
  },

  // Generate optimized image variants
  getOptimizedImageUrl: (publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  }) => {
    const cloudinaryBaseUrl = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    if (!options) {
      return `${cloudinaryBaseUrl}/${publicId}`;
    }

    const transformations = [];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);

    const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : '';
    return `${cloudinaryBaseUrl}/${transformString}${publicId}`;
  },

  // Validate file before upload
  validateFile: (file: File, options?: {
    maxSize?: number; // in MB
    allowedTypes?: string[];
  }) => {
    const maxSize = options?.maxSize || 10; // 10MB default
    const allowedTypes = options?.allowedTypes || ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    if (file.size > maxSize * 1024 * 1024) {
      throw new Error(`File size must be less than ${maxSize}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    return true;
  },

  // Get file preview URL
  getPreviewUrl: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};