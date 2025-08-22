
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/mock/client';
import { User, Camera, Shield, CreditCard, Download, Settings, Trash2, Eye, EyeOff, Bell, FileText, Lock } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  preferred_currency: string;
  account_type: string;
  country: string;
}

interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  frequency: string;
  farmer_updates: boolean;
  payment_reminders: boolean;
  campaigns: boolean;
  crowdfunding: boolean;
  visit_reminders: boolean;
}

interface PrivacySettings {
  display_name_to_farmers: boolean;
  show_in_success_stories: boolean;
  allow_testimonials: boolean;
  public_badge_participation: boolean;
}

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
    preferred_currency: 'KES',
    account_type: 'Individual',
    country: 'Kenya'
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_enabled: true,
    sms_enabled: true,
    in_app_enabled: true,
    frequency: 'daily',
    farmer_updates: true,
    payment_reminders: true,
    campaigns: false,
    crowdfunding: true,
    visit_reminders: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    display_name_to_farmers: true,
    show_in_success_stories: false,
    allow_testimonials: false,
    public_badge_participation: false
  });

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'M-Pesa', details: '***-***-1234', default: true },
    { id: 2, type: 'Card', details: '****-****-****-5678', default: false }
  ]);

  const [activitySummary, setActivitySummary] = useState({
    lifetime_contributions: 0,
    farmers_adopted: 0,
    average_monthly: 0,
    last_payment_date: null,
    upcoming_payment: null
  });

  useEffect(() => {
    loadProfileData();
    loadActivitySummary();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
          preferred_currency: 'KES',
          account_type: 'Individual',
          country: 'Kenya'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadActivitySummary = async () => {
    if (!user) return;

    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, payment_date, status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (error) throw error;

      const { data: adoptions } = await supabase
        .from('farmer_adoptions')
        .select('farmer_id')
        .eq('adopter_id', user.id)
        .eq('status', 'active');

      if (payments) {
        const totalContributions = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const averageMonthly = payments.length > 0 ? totalContributions / payments.length : 0;
        
        setActivitySummary({
          lifetime_contributions: totalContributions,
          farmers_adopted: adoptions?.length || 0,
          average_monthly: averageMonthly,
          last_payment_date: payments[0]?.payment_date || null,
          upcoming_payment: null
        });
      }
    } catch (error) {
      console.error('Error loading activity summary:', error);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6">
            {/* Basic Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {profileData.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Button variant="outline" className="mb-2">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Upload a new profile photo. Recommended size: 400x400px
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={profileData.country} onValueChange={(value) => setProfileData({...profileData, country: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="Uganda">Uganda</SelectItem>
                        <SelectItem value="Tanzania">Tanzania</SelectItem>
                        <SelectItem value="Rwanda">Rwanda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Preferred Currency</Label>
                    <Select value={profileData.preferred_currency} onValueChange={(value) => setProfileData({...profileData, preferred_currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select value={profileData.account_type} onValueChange={(value) => setProfileData({...profileData, account_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Corporate CSR">Corporate CSR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(activitySummary.lifetime_contributions, profileData.preferred_currency)}
                    </div>
                    <div className="text-sm text-muted-foreground">Lifetime Contributions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{activitySummary.farmers_adopted}</div>
                    <div className="text-sm text-muted-foreground">Farmers Adopted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(activitySummary.average_monthly, profileData.preferred_currency)}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Monthly</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {activitySummary.last_payment_date ? new Date(activitySummary.last_payment_date).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Last Payment</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Communication Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notify me via:</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email</Label>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email_enabled}
                      onCheckedChange={(checked) => setNotifications({...notifications, email_enabled: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications">SMS</Label>
                    <Switch
                      id="sms-notifications"
                      checked={notifications.sms_enabled}
                      onCheckedChange={(checked) => setNotifications({...notifications, sms_enabled: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="app-notifications">In-App Notifications</Label>
                    <Switch
                      id="app-notifications"
                      checked={notifications.in_app_enabled}
                      onCheckedChange={(checked) => setNotifications({...notifications, in_app_enabled: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Frequency of updates:</h4>
                <RadioGroup value={notifications.frequency} onValueChange={(value) => setNotifications({...notifications, frequency: value})}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="instant" id="instant" />
                    <Label htmlFor="instant">Instantly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Daily Digest</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly Summary</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">What I want to be notified about:</h4>
                <div className="space-y-3">
                  {[
                    { key: 'farmer_updates', label: 'New updates from adopted farmers' },
                    { key: 'payment_reminders', label: 'Upcoming payment dates' },
                    { key: 'campaigns', label: 'Platform-wide campaigns' },
                    { key: 'crowdfunding', label: 'Crowdfunding project launches' },
                    { key: 'visit_reminders', label: 'Visit reminders' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key}>{label}</Label>
                      <Switch
                        id={key}
                        checked={notifications[key as keyof NotificationPreferences] as boolean}
                        onCheckedChange={(checked) => setNotifications({...notifications, [key]: checked})}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline">
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Active Sessions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Current session (Chrome on Windows)</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Mobile app (Last active: 2 days ago)</span>
                      <Button variant="ghost" size="sm">Revoke</Button>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-3" size="sm">
                    Logout from all devices
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Payment Methods</h4>
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{method.type}</div>
                        <div className="text-sm text-muted-foreground">{method.details}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.default && <Badge>Default</Badge>}
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline">Add Payment Method</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Default Settings</h4>
                <div className="space-y-3">
                  <div>
                    <Label>Default contribution type</Label>
                    <RadioGroup defaultValue="recurring" className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="one-time" id="one-time" />
                        <Label htmlFor="one-time">One-time donation</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="recurring" id="recurring" />
                        <Label htmlFor="recurring">Recurring contribution</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label>Recurring frequency</Label>
                    <Select defaultValue="monthly">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="custom">Custom date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Public Profile Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: 'display_name_to_farmers', label: 'Display name to adopted farmers', description: 'Your name will be visible to farmers you support' },
                  { key: 'show_in_success_stories', label: 'Show in success stories', description: 'Allow your profile to be featured in success stories' },
                  { key: 'allow_testimonials', label: 'Allow testimonials', description: 'Let others see your testimonials and reviews' },
                  { key: 'public_badge_participation', label: 'Public badge participation', description: 'Participate in leaderboards and public recognition' }
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{label}</h4>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Switch
                      checked={privacy[key as keyof PrivacySettings]}
                      onCheckedChange={(checked) => setPrivacy({...privacy, [key]: checked})}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button>Save Privacy Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management Tab */}
        <TabsContent value="data">
          <div className="space-y-6">
            {/* Downloadables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Downloadables & Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Year-to-date Contributions</h4>
                      <p className="text-sm text-muted-foreground">PDF report of all your contributions this year</p>
                    </div>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Impact Metrics</h4>
                      <p className="text-sm text-muted-foreground">Detailed report of your farming impact</p>
                    </div>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">CSR Statement</h4>
                      <p className="text-sm text-muted-foreground">Corporate social responsibility documentation</p>
                    </div>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Data & Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Export My Data</h4>
                      <p className="text-sm text-muted-foreground">Download all your data in a secure zip file</p>
                    </div>
                    <Button variant="outline">Export Data</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Pause Contributions</h4>
                      <p className="text-sm text-muted-foreground">Temporarily halt all recurring payments</p>
                    </div>
                    <Button variant="outline">Pause</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-destructive">Deactivate Account</h4>
                      <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
                    </div>
                    <Button variant="outline">Deactivate</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-destructive rounded-lg bg-destructive/5">
                    <div>
                      <h4 className="font-medium text-destructive">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account,
                            cancel all active adoptions, and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;
