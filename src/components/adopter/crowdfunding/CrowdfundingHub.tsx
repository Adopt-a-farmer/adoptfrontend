
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Users, Wallet, Calendar, Target, TrendingUp, Plus, Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CrowdfundingProject {
  id: string;
  title: string;
  description: string;
  farmer_id: number;
  farmer_name: string;
  farmer_image: string;
  farmer_location: string;
  target_amount: number;
  raised_amount: number;
  currency: string;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
  category: string;
  image_url?: string;
  backers_count: number;
  created_at: string;
}

const CrowdfundingHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('discover');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Fetch crowdfunding projects
  const { data: projectsResponse, isLoading } = useQuery({
    queryKey: ['crowdfunding-projects', filterCategory, searchTerm],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filterCategory !== 'all') params.append('category', filterCategory);
        if (searchTerm) params.append('search', searchTerm);
        
        const response = await apiCall('GET', `/crowdfunding/projects?${params}`);
        return response;
      } catch (error) {
        return { data: [] };
      }
    },
  });

  // Extract projects from response
  const projects = (() => {
    const response = projectsResponse as { data?: CrowdfundingProject[] | { projects?: CrowdfundingProject[] } };
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.projects)) return response.data.projects;
    return [];
  })() as CrowdfundingProject[];

  // Fetch user's backed projects
  const { data: backedProjectsResponse } = useQuery({
    queryKey: ['backed-projects', user?.id],
    queryFn: async () => {
      if (!user) return { data: [] };
      try {
        const response = await apiCall('GET', '/crowdfunding/backed-projects');
        return response;
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        if (err?.response?.status === 404) {
          // Endpoint doesn't exist yet, return empty data
          console.warn('Backed projects endpoint not available yet');
          return { data: [] };
        }
        return { data: [] };
      }
    },
    enabled: !!user,
    retry: false // Don't retry 404s
  });

  // Extract backed projects from response
  const backedProjects = (() => {
    const response = backedProjectsResponse as { data?: CrowdfundingProject[] | { projects?: CrowdfundingProject[] } };
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.projects)) return response.data.projects;
    return [];
  })() as CrowdfundingProject[];

  // Support project mutation
  const supportProjectMutation = useMutation({
    mutationFn: async ({ projectId, amount }: { projectId: string; amount: number }) => {
      const response = await apiCall('POST', '/payments/create-payment', {
        crowdfunding_project_id: projectId,
        amount,
        currency: 'KES',
        description: `Crowdfunding support for project ${projectId}`
      });
      return response;
    },
    onSuccess: (data) => {
      if (data && typeof data === 'object' && 'authorization_url' in data) {
        window.location.href = data.authorization_url as string;
      }
      queryClient.invalidateQueries({ queryKey: ['crowdfunding-projects'] });
      queryClient.invalidateQueries({ queryKey: ['backed-projects'] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    }
  });

  const categories = [
    'all', 'Seeds & Inputs', 'Equipment', 'Infrastructure', 'Irrigation', 'Storage', 'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crowdfunding Hub</h1>
          <p className="text-gray-600 mt-1">Support specific farming projects and see direct impact</p>
        </div>
        {user?.role === 'farmer' && (
          <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-farmer-primary hover:bg-farmer-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Crowdfunding Project</DialogTitle>
              </DialogHeader>
              <CreateProjectForm onSuccess={() => setShowCreateProject(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover Projects</TabsTrigger>
          <TabsTrigger value="backed">My Backed Projects</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSupport={(amount) => supportProjectMutation.mutate({ projectId: project.id, amount })}
                isLoading={supportProjectMutation.isPending}
              />
            ))}
          </div>

          {projects.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later for new projects</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="backed" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {backedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSupport={(amount) => supportProjectMutation.mutate({ projectId: project.id, amount })}
                isLoading={supportProjectMutation.isPending}
                showBackedBadge
              />
            ))}
          </div>

          {backedProjects.length === 0 && (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No backed projects yet</h3>
              <p className="text-gray-500">Start supporting farmers by backing your first project</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects
              .filter(p => p.status === 'active')
              .sort((a, b) => (b.raised_amount / b.target_amount) - (a.raised_amount / a.target_amount))
              .slice(0, 6)
              .map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSupport={(amount) => supportProjectMutation.mutate({ projectId: project.id, amount })}
                  isLoading={supportProjectMutation.isPending}
                  showTrendingBadge
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper functions
const formatCurrency = (amount: number, currency: string = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const calculateDaysLeft = (deadline: string) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Project Card Component
const ProjectCard = ({ 
  project, 
  onSupport, 
  isLoading, 
  showBackedBadge = false,
  showTrendingBadge = false 
}: {
  project: CrowdfundingProject;
  onSupport: (amount: number) => void;
  isLoading: boolean;
  showBackedBadge?: boolean;
  showTrendingBadge?: boolean;
}) => {
  const [supportAmount, setSupportAmount] = useState(500);
  const [showSupportDialog, setShowSupportDialog] = useState(false);

  const fundingProgress = (project.raised_amount / project.target_amount) * 100;
  const daysLeft = calculateDaysLeft(project.deadline);

  const handleSupport = () => {
    onSupport(supportAmount);
    setShowSupportDialog(false);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img 
          src={project.image_url || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} 
          alt={project.title}
          className="w-full h-full object-cover rounded-t-lg"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {showTrendingBadge && (
            <Badge className="bg-orange-500 text-white">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          )}
          {showBackedBadge && (
            <Badge className="bg-green-500 text-white">
              <Heart className="w-3 h-3 mr-1" />
              Backed
            </Badge>
          )}
          <Badge variant="outline" className="bg-white">
            {project.category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
        </div>

        <div className="flex items-center text-sm text-gray-500">
          <img 
            src={project.farmer_image} 
            alt={project.farmer_name}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="font-medium">{project.farmer_name}</span>
          <span className="mx-2">•</span>
          <MapPin className="h-4 w-4 mr-1" />
          {project.farmer_location}
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progress</span>
            <span className="text-farmer-primary font-medium">
              {formatCurrency(project.raised_amount)} / {formatCurrency(project.target_amount)}
            </span>
          </div>
          <Progress value={fundingProgress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {project.backers_count} backers
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {daysLeft} days left
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="flex-1 bg-farmer-primary hover:bg-farmer-primary/90"
                disabled={project.status !== 'active' || daysLeft === 0}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Support
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Support {project.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="amount">Support Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={supportAmount}
                    onChange={(e) => setSupportAmount(parseInt(e.target.value) || 500)}
                    min={100}
                    step={100}
                    className="mt-1"
                  />
                </div>
                <div className="bg-farmer-secondary/10 p-4 rounded-lg">
                  <h4 className="font-medium text-farmer-primary mb-2">Your Impact</h4>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowSupportDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSupport}
                    disabled={isLoading}
                    className="bg-farmer-primary hover:bg-farmer-primary/90"
                  >
                    {isLoading ? "Processing..." : `Support with ${formatCurrency(supportAmount)}`}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button size="sm" variant="outline" className="flex-1">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Create Project Form Component
const CreateProjectForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: 10000,
    deadline: '',
    category: '',
    image_url: ''
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiCall('POST', '/crowdfunding/projects', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your crowdfunding project has been created!",
      });
      queryClient.invalidateQueries({ queryKey: ['crowdfunding-projects'] });
      onSuccess();
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Project Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="target_amount">Target Amount (KES)</Label>
          <Input
            id="target_amount"
            type="number"
            value={formData.target_amount}
            onChange={(e) => setFormData({ ...formData, target_amount: parseInt(e.target.value) || 0 })}
            required
            min={1000}
            step={1000}
          />
        </div>
        
        <div>
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Seeds & Inputs">Seeds & Inputs</SelectItem>
            <SelectItem value="Equipment">Equipment</SelectItem>
            <SelectItem value="Infrastructure">Infrastructure</SelectItem>
            <SelectItem value="Irrigation">Irrigation</SelectItem>
            <SelectItem value="Storage">Storage</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="image_url">Project Image URL (optional)</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createProjectMutation.isPending}
          className="bg-farmer-primary hover:bg-farmer-primary/90"
        >
          {createProjectMutation.isPending ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
};

export default CrowdfundingHub;
