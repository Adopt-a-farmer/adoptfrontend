import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Image,
  Video,
  FileText,
  Calendar,
  Eye,
  Heart,
  Share2,
  Upload,
  Edit,
  Trash2,
  Pin,
  Search,
  MapPin,
  Camera
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { farmerService } from '@/services/farmer';

// Interfaces
interface FarmUpdate {
  _id: string;
  title: string;
  content: string;
  type: 'general' | 'harvest' | 'planting' | 'weather' | 'milestone' | 'challenge';
  media_urls: string[];
  tags: string[];
  visibility: 'public' | 'adopters_only' | 'private';
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  weather_data?: {
    temperature: number;
    humidity: number;
    rainfall: number;
    conditions: string;
  };
}

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploaded_at: string;
}

interface CreateUpdateFormProps {
  onSubmit: (data: Omit<FarmUpdate, '_id' | 'views_count' | 'likes_count' | 'comments_count' | 'created_at' | 'updated_at'>) => void;
  isLoading: boolean;
  initialData?: Partial<FarmUpdate>;
}

// Helper functions
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'harvest': return <Image className="h-4 w-4" />;
    case 'planting': return <Calendar className="h-4 w-4" />;
    case 'weather': return <MapPin className="h-4 w-4" />;
    case 'milestone': return <Calendar className="h-4 w-4" />;
    case 'challenge': return <FileText className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'harvest': return 'bg-green-100 text-green-800';
    case 'planting': return 'bg-blue-100 text-blue-800';
    case 'weather': return 'bg-yellow-100 text-yellow-800';
    case 'milestone': return 'bg-purple-100 text-purple-800';
    case 'challenge': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getVisibilityColor = (visibility: string) => {
  switch (visibility) {
    case 'public': return 'bg-green-100 text-green-800';
    case 'adopters_only': return 'bg-blue-100 text-blue-800';
    case 'private': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Create Update Form Component
const CreateUpdateForm: React.FC<CreateUpdateFormProps> = ({ 
  onSubmit, 
  isLoading,
  initialData = {}
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    content: initialData.content || '',
    type: initialData.type || 'general',
    visibility: initialData.visibility || 'adopters_only',
    tags: initialData.tags || [],
    media_urls: initialData.media_urls || [],
    is_pinned: initialData.is_pinned || false
  });
  
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addMediaUrl = (url: string) => {
    setFormData(prev => ({
      ...prev,
      media_urls: [...prev.media_urls, url]
    }));
  };

  const removeMediaUrl = (url: string) => {
    setFormData(prev => ({
      ...prev,
      media_urls: prev.media_urls.filter(mediaUrl => mediaUrl !== url)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter update title"
          required
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Share what's happening on your farm..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="harvest">Harvest</SelectItem>
              <SelectItem value="planting">Planting</SelectItem>
              <SelectItem value="weather">Weather</SelectItem>
              <SelectItem value="milestone">Milestone</SelectItem>
              <SelectItem value="challenge">Challenge</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="visibility">Visibility</Label>
          <Select 
            value={formData.visibility} 
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, visibility: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="adopters_only">Adopters Only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} variant="outline">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
              {tag} ×
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Media</Label>
        <div className="mt-2">
          <MediaUploader 
            onUploadComplete={addMediaUrl}
            existingMedia={formData.media_urls}
            onRemoveMedia={removeMediaUrl}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <input
          type="checkbox"
          id="is-pinned"
          checked={formData.is_pinned}
          onChange={(e) => setFormData(prev => ({ ...prev, is_pinned: e.target.checked }))}
        />
        <Label htmlFor="is-pinned">Pin this update</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
          {isLoading ? 'Saving...' : initialData._id ? 'Update' : 'Create Update'}
        </Button>
      </div>
    </form>
  );
};

// Media Uploader Component
interface MediaUploaderProps {
  onUploadComplete: (url: string) => void;
  existingMedia?: string[];
  onRemoveMedia?: (url: string) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  onUploadComplete, 
  existingMedia = [], 
  onRemoveMedia 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      // Actual upload
      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await farmerService.uploadMedia(formData);
      clearInterval(interval);
      setUploadProgress(100);

      if (response.url) {
        onUploadComplete(response.url);
        toast({
          title: "Upload successful",
          description: "Media file has been uploaded",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload media file. Please try again.",
        variant: "destructive",
      });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getMediaType = (url: string) => {
    if (url.match(/\.(jpeg|jpg|gif|png)$/i)) return 'image';
    if (url.match(/\.(mp4|mov|avi|wmv)$/i)) return 'video';
    return 'document';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {existingMedia.map((url, index) => (
          <div key={index} className="relative border rounded p-1 w-24 h-24">
            {getMediaType(url) === 'image' ? (
              <img src={url} className="w-full h-full object-cover" alt="Media preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                {getMediaType(url) === 'video' ? (
                  <Video className="h-10 w-10 text-gray-400" />
                ) : (
                  <FileText className="h-10 w-10 text-gray-400" />
                )}
              </div>
            )}
            {onRemoveMedia && (
              <button
                type="button"
                onClick={() => onRemoveMedia(url)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/3 -translate-y-1/3"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <div className="w-full">
              <div className="flex justify-between mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full gap-2">
              <Upload className="h-5 w-5" />
              Upload Media
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

// Media Library Component
interface MediaLibraryProps {
  media: MediaFile[];
  onSelect?: (url: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ media, onSelect, onDelete, isLoading }) => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [search, setSearch] = useState('');

  const filteredMedia = media.filter(file => {
    if (filter !== 'all' && file.type !== filter) return false;
    if (search && !file.filename.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center">
          <Label className="mr-2">Filter:</Label>
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 md:max-w-xs">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading media...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-10">No media files found</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredMedia.map((file) => (
            <div key={file.id} className="border rounded-md overflow-hidden bg-white">
              <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.filename} className="h-full w-full object-cover" />
                ) : file.type === 'video' ? (
                  <Video className="h-16 w-16 text-gray-400" />
                ) : (
                  <FileText className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <div className="p-2">
                <p className="text-sm truncate font-medium">{file.filename}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                <div className="flex justify-between items-center mt-2">
                  {onSelect && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onSelect(file.url)}
                      className="text-xs px-2"
                    >
                      Select
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(file.id)}
                    className="text-xs px-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Component
const UpdatesMediaManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('updates');
  const [createUpdateDialogOpen, setCreateUpdateDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<FarmUpdate | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [updateFilter, setUpdateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch farm updates
  const {
    data: updates,
    isLoading: isLoadingUpdates,
    error: updatesError,
  } = useQuery({
    queryKey: ['farmUpdates', user?.id],
    queryFn: () => farmerService.getFarmUpdates(),
  });

  // Fetch media library
  const {
    data: mediaLibrary,
    isLoading: isLoadingMedia,
    error: mediaError,
  } = useQuery({
    queryKey: ['mediaLibrary', user?.id],
    queryFn: () => farmerService.getMediaLibrary(),
  });

  // Create update mutation
  const createUpdateMutation = useMutation({
    mutationFn: (data: Omit<FarmUpdate, '_id' | 'views_count' | 'likes_count' | 'comments_count' | 'created_at' | 'updated_at'>) => 
      farmerService.createFarmUpdate(data),
    onSuccess: (newUpdate) => {
      queryClient.invalidateQueries({ queryKey: ['farmUpdates'] });
      setCreateUpdateDialogOpen(false);
      toast({
        title: "Update created",
        description: "Your farm update has been published and is now visible.",
      });
      console.log('New update created:', newUpdate);
    },
    onError: (error) => {
      toast({
        title: "Failed to create update",
        description: "There was an error creating your farm update. Please try again.",
        variant: "destructive",
      });
      console.error('Create update error:', error);
    }
  });

  // Update farm update mutation
  const updateFarmUpdateMutation = useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string;
      data: Omit<FarmUpdate, '_id' | 'views_count' | 'likes_count' | 'comments_count' | 'created_at' | 'updated_at'>;
    }) => farmerService.updateFarmUpdate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmUpdates'] });
      setEditingUpdate(null);
      setCreateUpdateDialogOpen(false);
      toast({
        title: "Update saved",
        description: "Your farm update has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update",
        description: "There was an error updating your farm update. Please try again.",
        variant: "destructive",
      });
      console.error('Update error:', error);
    }
  });

  // Delete update mutation
  const deleteUpdateMutation = useMutation({
    mutationFn: (id: string) => farmerService.deleteFarmUpdate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmUpdates'] });
      setConfirmDeleteId(null);
      toast({
        title: "Update deleted",
        description: "The farm update has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete",
        description: "There was an error deleting the farm update. Please try again.",
        variant: "destructive",
      });
      console.error('Delete error:', error);
      setConfirmDeleteId(null);
    }
  });

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) => 
      farmerService.updateFarmUpdate(id, { is_pinned: isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmUpdates'] });
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: "Failed to update pin status. Please try again.",
        variant: "destructive",
      });
      console.error('Pin toggle error:', error);
    }
  });

  // Delete media mutation
  const deleteMediaMutation = useMutation({
    mutationFn: (id: string) => farmerService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaLibrary'] });
      toast({
        title: "Media deleted",
        description: "The media file has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete media",
        description: "There was an error deleting the media file. Please try again.",
        variant: "destructive",
      });
      console.error('Delete media error:', error);
    }
  });

  const handleCreateUpdate = (data: Omit<FarmUpdate, '_id' | 'views_count' | 'likes_count' | 'comments_count' | 'created_at' | 'updated_at'>) => {
    createUpdateMutation.mutate(data);
  };

  const handleUpdateFarmUpdate = (data: Omit<FarmUpdate, '_id' | 'views_count' | 'likes_count' | 'comments_count' | 'created_at' | 'updated_at'>) => {
    if (editingUpdate) {
      updateFarmUpdateMutation.mutate({ 
        id: editingUpdate._id, 
        data 
      });
    }
  };

  const handleEditUpdate = (update: FarmUpdate) => {
    setEditingUpdate(update);
    setCreateUpdateDialogOpen(true);
  };

  const handleTogglePin = (id: string, currentPinState: boolean) => {
    togglePinMutation.mutate({ id, isPinned: !currentPinState });
  };

  const handleDeleteUpdate = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deleteUpdateMutation.mutate(confirmDeleteId);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const filteredUpdates = updates?.updates 
    ? updates.updates.filter(update => {
        if (updateFilter !== 'all' && update.type !== updateFilter) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            update.title.toLowerCase().includes(query) ||
            update.content.toLowerCase().includes(query) ||
            update.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }
        return true;
      })
    : [];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="media">Media Library</TabsTrigger>
          </TabsList>
          {activeTab === 'updates' && (
            <Button onClick={() => { setEditingUpdate(null); setCreateUpdateDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              New Update
            </Button>
          )}
        </div>

        <TabsContent value="updates" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center">
              <Label className="mr-2">Filter by type:</Label>
              <Select value={updateFilter} onValueChange={setUpdateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="harvest">Harvest</SelectItem>
                  <SelectItem value="planting">Planting</SelectItem>
                  <SelectItem value="weather">Weather</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="challenge">Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 md:max-w-xs">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search updates..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {isLoadingUpdates ? (
            <div className="text-center py-10">Loading updates...</div>
          ) : updatesError ? (
            <div className="text-center py-10 text-red-500">
              Error loading updates. Please refresh and try again.
            </div>
          ) : filteredUpdates.length === 0 ? (
            <div className="text-center py-10">
              No updates found. Create your first farm update!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredUpdates.map((update) => (
                <Card key={update._id} className={update.is_pinned ? 'border-green-500' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center">
                          {update.is_pinned && <Pin className="h-4 w-4 mr-2 text-green-500" />}
                          {update.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge className={getTypeColor(update.type)}>
                            {getTypeIcon(update.type)}
                            <span className="ml-1">{update.type.charAt(0).toUpperCase() + update.type.slice(1)}</span>
                          </Badge>
                          <Badge className={getVisibilityColor(update.visibility)}>
                            {update.visibility === 'public' ? 'Public' : 
                             update.visibility === 'adopters_only' ? 'Adopters Only' : 'Private'}
                          </Badge>
                          {update.tags.map((tag) => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePin(update._id, update.is_pinned)}
                          title={update.is_pinned ? "Unpin update" : "Pin update"}
                        >
                          <Pin className={`h-4 w-4 ${update.is_pinned ? 'text-green-500 fill-green-500' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUpdate(update)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUpdate(update._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{update.content}</p>
                    {update.media_urls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {update.media_urls.slice(0, 4).map((url, idx) => (
                          <div key={idx} className="w-16 h-16 relative">
                            {url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                              <img src={url} alt="Media" className="w-full h-full object-cover rounded" />
                            ) : url.match(/\.(mp4|mov|avi|wmv)$/i) ? (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded">
                                <Video className="h-8 w-8 text-gray-400" />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded">
                                <FileText className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        ))}
                        {update.media_urls.length > 4 && (
                          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded">
                            <span className="text-sm text-gray-500">+{update.media_urls.length - 4}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
                      <div className="flex space-x-4">
                        <span className="flex items-center">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          {update.views_count}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-3.5 w-3.5 mr-1" />
                          {update.likes_count}
                        </span>
                        <span className="flex items-center">
                          <Share2 className="h-3.5 w-3.5 mr-1" />
                          {update.comments_count}
                        </span>
                      </div>
                      <span>{formatDate(update.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <MediaLibrary
            media={mediaLibrary || []}
            onDelete={(id) => deleteMediaMutation.mutate(id)}
            isLoading={isLoadingMedia}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Update Dialog */}
      <Dialog open={createUpdateDialogOpen} onOpenChange={setCreateUpdateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUpdate ? 'Edit Update' : 'Create New Update'}</DialogTitle>
          </DialogHeader>
          {createUpdateDialogOpen && (
            <CreateUpdateForm
              key={createUpdateDialogOpen ? 'create' : 'closed'}
              onSubmit={editingUpdate ? handleUpdateFarmUpdate : handleCreateUpdate}
              isLoading={createUpdateMutation.isPending || updateFarmUpdateMutation.isPending}
              initialData={editingUpdate || {}}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      {confirmDeleteId && (
        <Dialog open={!!confirmDeleteId} onOpenChange={handleCancelDelete}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this update? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDelete} 
                variant="destructive"
                disabled={deleteUpdateMutation.isPending}
              >
                {deleteUpdateMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UpdatesMediaManager;
