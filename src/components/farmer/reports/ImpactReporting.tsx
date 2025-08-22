import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, 
  Download, Calendar, Leaf, Users, DollarSign, Target,
  Award, Droplets, Recycle, Sun, TreePine, Wheat
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface ImpactMetrics {
  environmental: {
    carbon_sequestered: number; // kg CO2
    water_saved: number; // liters
    organic_waste_recycled: number; // kg
    biodiversity_score: number; // 1-100
    soil_health_improvement: number; // percentage
    renewable_energy_used: number; // percentage
  };
  social: {
    jobs_created: number;
    families_supported: number;
    community_members_trained: number;
    knowledge_sessions_conducted: number;
    local_partnerships: number;
    food_security_improvement: number; // percentage
  };
  economic: {
    total_revenue: number;
    cost_savings: number;
    productivity_increase: number; // percentage
    market_access_improvement: number; // percentage
    income_stability_score: number; // 1-100
    roi_percentage: number;
  };
  production: {
    total_yield: number; // kg
    yield_per_hectare: number;
    crop_diversity_index: number;
    harvest_efficiency: number; // percentage
    post_harvest_losses: number; // percentage
    quality_grade_average: number; // 1-10
  };
}

interface ImpactReport {
  id: string;
  report_date: string;
  period_start: string;
  period_end: string;
  report_type: 'monthly' | 'quarterly' | 'annual';
  metrics: ImpactMetrics;
  achievements: string[];
  challenges: string[];
  goals_next_period: string[];
  sustainability_score: number; // 1-100
  certification_status: string[];
  generated_at: string;
}

interface ImpactComparison {
  current_period: ImpactMetrics;
  previous_period: ImpactMetrics;
  change_percentage: {
    environmental: number;
    social: number;
    economic: number;
    production: number;
  };
}

const ImpactReporting = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch impact reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ['impact-reports', selectedPeriod, selectedYear],
    queryFn: async (): Promise<ImpactReport[]> => {
      try {
        const response = await apiCall<ImpactReport[]>(
          `/api/farmers/reports/impact?period=${selectedPeriod}&year=${selectedYear}`, 
          'GET'
        );
        return response;
      } catch (error) {
        // Return mock data for demonstration
        return mockReports;
      }
    },
    enabled: !!user
  });

  // Fetch impact comparison
  const { data: comparison } = useQuery({
    queryKey: ['impact-comparison', selectedPeriod],
    queryFn: async (): Promise<ImpactComparison> => {
      try {
        const response = await apiCall<ImpactComparison>(
          `/api/farmers/reports/impact/comparison?period=${selectedPeriod}`, 
          'GET'
        );
        return response;
      } catch (error) {
        // Return mock data for demonstration
        return mockComparison;
      }
    },
    enabled: !!user
  });

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const latestReport = reports?.[0];

  if (isLoading) {
    return <div>Loading impact reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Impact & Performance Reports</h2>
          <p className="text-muted-foreground">Track your farm's environmental, social, and economic impact</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Sustainability Score Card */}
      {latestReport && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Overall Sustainability Score</h3>
                <p className="text-sm text-gray-500">Based on environmental, social, and economic factors</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-farmer-primary">
                  {latestReport.metrics.environmental.biodiversity_score}/100
                </div>
                <div className="flex items-center justify-end">
                  {comparison && getChangeIcon(comparison.change_percentage.environmental)}
                  <span className={`text-sm ml-1 ${comparison ? getChangeColor(comparison.change_percentage.environmental) : ''}`}>
                    {comparison && comparison.change_percentage.environmental > 0 && '+'}
                    {comparison ? comparison.change_percentage.environmental.toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-farmer-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${latestReport.metrics.environmental.biodiversity_score}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="economic">Economic</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab report={latestReport} comparison={comparison} />
        </TabsContent>

        <TabsContent value="environmental" className="space-y-6">
          <EnvironmentalTab report={latestReport} comparison={comparison} />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialTab report={latestReport} comparison={comparison} />
        </TabsContent>

        <TabsContent value="economic" className="space-y-6">
          <EconomicTab report={latestReport} comparison={comparison} />
        </TabsContent>

        <TabsContent value="production" className="space-y-6">
          <ProductionTab report={latestReport} comparison={comparison} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ 
  report, 
  comparison 
}: { 
  report?: ImpactReport; 
  comparison?: ImpactComparison; 
}) => {
  if (!report) return <div>No report data available</div>;

  const keyMetrics = [
    {
      title: 'Carbon Sequestered',
      value: `${formatNumber(report.metrics.environmental.carbon_sequestered)} kg CO2`,
      change: comparison?.change_percentage.environmental || 0,
      icon: <Leaf className="h-6 w-6" />,
      color: 'text-green-600'
    },
    {
      title: 'Families Supported',
      value: formatNumber(report.metrics.social.families_supported),
      change: comparison?.change_percentage.social || 0,
      icon: <Users className="h-6 w-6" />,
      color: 'text-blue-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(report.metrics.economic.total_revenue),
      change: comparison?.change_percentage.economic || 0,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-farmer-primary'
    },
    {
      title: 'Total Yield',
      value: `${formatNumber(report.metrics.production.total_yield)} kg`,
      change: comparison?.change_percentage.production || 0,
      icon: <Wheat className="h-6 w-6" />,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={metric.color}>
                  {metric.icon}
                </div>
                <div className="flex items-center">
                  {getChangeIcon(metric.change)}
                  <span className={`text-sm ml-1 ${getChangeColor(metric.change)}`}>
                    {metric.change > 0 && '+'}{metric.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-sm text-gray-500">{metric.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements & Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Key Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-sm">{achievement}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-red-500" />
              Challenges & Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Current Challenges</h4>
                <div className="space-y-2">
                  {report.challenges.map((challenge, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-600">{challenge}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Next Period Goals</h4>
                <div className="space-y-2">
                  {report.goals_next_period.map((goal, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-600">{goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Certifications & Standards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {report.certification_status.map((certification, index) => (
              <Badge key={index} className="bg-green-100 text-green-800">
                <Award className="h-3 w-3 mr-1" />
                {certification}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Environmental Tab Component
const EnvironmentalTab = ({ 
  report, 
  comparison 
}: { 
  report?: ImpactReport; 
  comparison?: ImpactComparison; 
}) => {
  if (!report) return <div>No environmental data available</div>;

  const environmentalMetrics = [
    {
      title: 'Carbon Sequestered',
      value: `${formatNumber(report.metrics.environmental.carbon_sequestered)} kg CO2`,
      icon: <Leaf className="h-6 w-6 text-green-600" />,
      description: 'Total carbon dioxide captured from atmosphere'
    },
    {
      title: 'Water Saved',
      value: `${formatNumber(report.metrics.environmental.water_saved)} liters`,
      icon: <Droplets className="h-6 w-6 text-blue-600" />,
      description: 'Water conservation through efficient irrigation'
    },
    {
      title: 'Organic Waste Recycled',
      value: `${formatNumber(report.metrics.environmental.organic_waste_recycled)} kg`,
      icon: <Recycle className="h-6 w-6 text-emerald-600" />,
      description: 'Organic waste converted to compost and biogas'
    },
    {
      title: 'Renewable Energy Usage',
      value: `${report.metrics.environmental.renewable_energy_used}%`,
      icon: <Sun className="h-6 w-6 text-yellow-600" />,
      description: 'Percentage of farm operations powered by renewable energy'
    },
    {
      title: 'Soil Health Improvement',
      value: `${report.metrics.environmental.soil_health_improvement}%`,
      icon: <TreePine className="h-6 w-6 text-amber-600" />,
      description: 'Improvement in soil quality and fertility'
    },
    {
      title: 'Biodiversity Score',
      value: `${report.metrics.environmental.biodiversity_score}/100`,
      icon: <Award className="h-6 w-6 text-purple-600" />,
      description: 'Overall biodiversity and ecosystem health score'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {environmentalMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {metric.icon}
                <div className="flex-1">
                  <p className="text-lg font-semibold">{metric.value}</p>
                  <p className="text-sm font-medium text-gray-700">{metric.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Environmental Impact Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Environmental Impact Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <LineChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Environmental impact chart visualization</p>
              <p className="text-sm">Integration with charting library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Social Tab Component
const SocialTab = ({ 
  report, 
  comparison 
}: { 
  report?: ImpactReport; 
  comparison?: ImpactComparison; 
}) => {
  if (!report) return <div>No social impact data available</div>;

  const socialMetrics = [
    {
      title: 'Jobs Created',
      value: formatNumber(report.metrics.social.jobs_created),
      icon: <Users className="h-6 w-6 text-blue-600" />,
      description: 'Direct employment opportunities created'
    },
    {
      title: 'Families Supported',
      value: formatNumber(report.metrics.social.families_supported),
      icon: <Users className="h-6 w-6 text-green-600" />,
      description: 'Families benefiting from farm activities'
    },
    {
      title: 'Community Training',
      value: formatNumber(report.metrics.social.community_members_trained),
      icon: <Award className="h-6 w-6 text-purple-600" />,
      description: 'Community members trained in farming techniques'
    },
    {
      title: 'Knowledge Sessions',
      value: formatNumber(report.metrics.social.knowledge_sessions_conducted),
      icon: <Calendar className="h-6 w-6 text-orange-600" />,
      description: 'Educational sessions conducted for farmers'
    },
    {
      title: 'Local Partnerships',
      value: formatNumber(report.metrics.social.local_partnerships),
      icon: <Target className="h-6 w-6 text-farmer-primary" />,
      description: 'Partnerships with local organizations'
    },
    {
      title: 'Food Security Improvement',
      value: `${report.metrics.social.food_security_improvement}%`,
      icon: <Wheat className="h-6 w-6 text-yellow-600" />,
      description: 'Improvement in community food security'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {socialMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {metric.icon}
                <div className="flex-1">
                  <p className="text-lg font-semibold">{metric.value}</p>
                  <p className="text-sm font-medium text-gray-700">{metric.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Social Impact Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Community Impact Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Social impact pie chart visualization</p>
              <p className="text-sm">Integration with charting library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Economic Tab Component
const EconomicTab = ({ 
  report, 
  comparison 
}: { 
  report?: ImpactReport; 
  comparison?: ImpactComparison; 
}) => {
  if (!report) return <div>No economic data available</div>;

  const economicMetrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(report.metrics.economic.total_revenue),
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      description: 'Total income generated from farm operations'
    },
    {
      title: 'Cost Savings',
      value: formatCurrency(report.metrics.economic.cost_savings),
      icon: <TrendingDown className="h-6 w-6 text-blue-600" />,
      description: 'Savings from efficient farming practices'
    },
    {
      title: 'Productivity Increase',
      value: `${report.metrics.economic.productivity_increase}%`,
      icon: <TrendingUp className="h-6 w-6 text-farmer-primary" />,
      description: 'Improvement in overall farm productivity'
    },
    {
      title: 'Market Access',
      value: `${report.metrics.economic.market_access_improvement}%`,
      icon: <Target className="h-6 w-6 text-purple-600" />,
      description: 'Improvement in market access and reach'
    },
    {
      title: 'Income Stability Score',
      value: `${report.metrics.economic.income_stability_score}/100`,
      icon: <Award className="h-6 w-6 text-orange-600" />,
      description: 'Score indicating income stability and predictability'
    },
    {
      title: 'Return on Investment',
      value: `${report.metrics.economic.roi_percentage}%`,
      icon: <BarChart3 className="h-6 w-6 text-red-600" />,
      description: 'Overall return on farm investments'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {economicMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {metric.icon}
                <div className="flex-1">
                  <p className="text-lg font-semibold">{metric.value}</p>
                  <p className="text-sm font-medium text-gray-700">{metric.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Economic Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="h-5 w-5 mr-2" />
            Economic Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Economic performance chart visualization</p>
              <p className="text-sm">Integration with charting library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Production Tab Component
const ProductionTab = ({ 
  report, 
  comparison 
}: { 
  report?: ImpactReport; 
  comparison?: ImpactComparison; 
}) => {
  if (!report) return <div>No production data available</div>;

  const productionMetrics = [
    {
      title: 'Total Yield',
      value: `${formatNumber(report.metrics.production.total_yield)} kg`,
      icon: <Wheat className="h-6 w-6 text-yellow-600" />,
      description: 'Total crop yield for the reporting period'
    },
    {
      title: 'Yield per Hectare',
      value: `${formatNumber(report.metrics.production.yield_per_hectare)} kg/ha`,
      icon: <Target className="h-6 w-6 text-green-600" />,
      description: 'Average yield per hectare of farmland'
    },
    {
      title: 'Crop Diversity Index',
      value: `${report.metrics.production.crop_diversity_index.toFixed(2)}`,
      icon: <TreePine className="h-6 w-6 text-emerald-600" />,
      description: 'Measure of crop variety and biodiversity'
    },
    {
      title: 'Harvest Efficiency',
      value: `${report.metrics.production.harvest_efficiency}%`,
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      description: 'Efficiency of harvesting operations'
    },
    {
      title: 'Post-Harvest Losses',
      value: `${report.metrics.production.post_harvest_losses}%`,
      icon: <TrendingDown className="h-6 w-6 text-red-600" />,
      description: 'Percentage of crop lost after harvesting'
    },
    {
      title: 'Quality Grade',
      value: `${report.metrics.production.quality_grade_average}/10`,
      icon: <Award className="h-6 w-6 text-purple-600" />,
      description: 'Average quality grade of produced crops'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productionMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {metric.icon}
                <div className="flex-1">
                  <p className="text-lg font-semibold">{metric.value}</p>
                  <p className="text-sm font-medium text-gray-700">{metric.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Production Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Production Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <LineChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Production analytics chart visualization</p>
              <p className="text-sm">Integration with charting library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
const formatNumber = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
};

const getChangeIcon = (change: number) => {
  if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <div className="h-4 w-4" />;
};

const getChangeColor = (change: number) => {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
};

// Mock data for demonstration
const mockReports: ImpactReport[] = [
  {
    id: '1',
    report_date: '2024-01-31',
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    report_type: 'monthly',
    metrics: {
      environmental: {
        carbon_sequestered: 2500,
        water_saved: 15000,
        organic_waste_recycled: 800,
        biodiversity_score: 85,
        soil_health_improvement: 15,
        renewable_energy_used: 60
      },
      social: {
        jobs_created: 8,
        families_supported: 25,
        community_members_trained: 40,
        knowledge_sessions_conducted: 6,
        local_partnerships: 3,
        food_security_improvement: 20
      },
      economic: {
        total_revenue: 450000,
        cost_savings: 75000,
        productivity_increase: 25,
        market_access_improvement: 30,
        income_stability_score: 78,
        roi_percentage: 35
      },
      production: {
        total_yield: 12000,
        yield_per_hectare: 2400,
        crop_diversity_index: 3.2,
        harvest_efficiency: 92,
        post_harvest_losses: 8,
        quality_grade_average: 8.5
      }
    },
    achievements: [
      'Achieved 85% biodiversity score, exceeding target of 80%',
      'Reduced water consumption by 25% through drip irrigation',
      'Successfully trained 40 community members in organic farming',
      'Increased yield by 15% compared to previous period'
    ],
    challenges: [
      'Weather variations affected crop timing',
      'Limited access to organic certification processes',
      'Need for better post-harvest storage facilities'
    ],
    goals_next_period: [
      'Achieve organic certification for main crops',
      'Reduce post-harvest losses to under 5%',
      'Expand renewable energy usage to 75%',
      'Train additional 30 community members'
    ],
    sustainability_score: 85,
    certification_status: ['Organic Certification', 'Fair Trade', 'Rainforest Alliance'],
    generated_at: '2024-02-01T10:00:00Z'
  }
];

const mockComparison: ImpactComparison = {
  current_period: mockReports[0].metrics,
  previous_period: {
    environmental: {
      carbon_sequestered: 2200,
      water_saved: 18000,
      organic_waste_recycled: 750,
      biodiversity_score: 80,
      soil_health_improvement: 12,
      renewable_energy_used: 55
    },
    social: {
      jobs_created: 7,
      families_supported: 22,
      community_members_trained: 35,
      knowledge_sessions_conducted: 5,
      local_partnerships: 2,
      food_security_improvement: 18
    },
    economic: {
      total_revenue: 380000,
      cost_savings: 65000,
      productivity_increase: 20,
      market_access_improvement: 25,
      income_stability_score: 72,
      roi_percentage: 28
    },
    production: {
      total_yield: 10500,
      yield_per_hectare: 2100,
      crop_diversity_index: 2.8,
      harvest_efficiency: 88,
      post_harvest_losses: 12,
      quality_grade_average: 7.8
    }
  },
  change_percentage: {
    environmental: 6.25,
    social: 11.4,
    economic: 18.4,
    production: 14.3
  }
};

export default ImpactReporting;