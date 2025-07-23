import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Lock, 
  Bell, 
  Eye, 
  Wallet,
  Download,
  Trash2,
  Camera,
  Shield,
  Smartphone
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const FarmerProfileSettings = () => {
  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    farmName: 'Green Valley Farm',
    email: 'john@greenvalley.com',
    phone: '+254712345678',
    county: 'Kiambu',
    subcounty: 'Thika',
    ward: 'Hospital Ward',
    farmType: 'Mixed Farming',
    mpesaNumber: '+254712345678'
  });

  const [notifications, setNotifications] = useState({
    sms: true,
    email: true,
    app: true,
    adopter_messages: true,
    visit_requests: true,
    admin_alerts: true,
    learning_assignments: true,
    frequency: 'instant'
  });

  const [privacy, setPrivacy] = useState({
    showToAdopters: true,
    showInStories: true,
    participateInDemo: false,
    visibility: 'public'
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    lastLogin: '2024-01-15 14:30',
    activeDevices: 2
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy preferences have been saved.",
    });
  };

  const handleEnableTwoFactor = () => {
    setSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
    toast({
      title: security.twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
      description: security.twoFactorEnabled 
        ? "Two-factor authentication has been disabled." 
        : "Two-factor authentication has been enabled.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Profile & Settings</h2>
        <p className="text-muted-foreground">Manage your farm profile, security, and preferences</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Upload a clear photo of yourself for your profile
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input
                    id="farmName"
                    value={profileData.farmName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, farmName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmType">Farm Type</Label>
                  <Select value={profileData.farmType} onValueChange={(value) => setProfileData(prev => ({ ...prev, farmType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crop">Crop Farming</SelectItem>
                      <SelectItem value="livestock">Livestock</SelectItem>
                      <SelectItem value="poultry">Poultry</SelectItem>
                      <SelectItem value="mixed">Mixed Farming</SelectItem>
                      <SelectItem value="aquaculture">Aquaculture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
                Save Profile Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Details */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    value={profileData.county}
                    onChange={(e) => setProfileData(prev => ({ ...prev, county: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcounty">Subcounty</Label>
                  <Input
                    id="subcounty"
                    value={profileData.subcounty}
                    onChange={(e) => setProfileData(prev => ({ ...prev, subcounty: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ward">Ward</Label>
                  <Input
                    id="ward"
                    value={profileData.ward}
                    onChange={(e) => setProfileData(prev => ({ ...prev, ward: e.target.value }))}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">GPS Location</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Add your farm's GPS coordinates to help adopters and officers find you easily.
                </p>
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Set GPS Location
                </Button>
              </div>

              <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
                Save Location Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Change */}
              <div className="space-y-4">
                <h4 className="font-medium">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                </div>
                <Button variant="outline">Update Password</Button>
              </div>

              <Separator />

              {/* Two-Factor Authentication */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={security.twoFactorEnabled}
                    onCheckedChange={handleEnableTwoFactor}
                  />
                </div>
                {security.twoFactorEnabled && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        Two-factor authentication is enabled
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Active Sessions */}
              <div className="space-y-4">
                <h4 className="font-medium">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Current Session</p>
                        <p className="text-xs text-muted-foreground">
                          Last active: {security.lastLogin}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Sign out all other sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Preferences */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Channels */}
              <div className="space-y-4">
                <h4 className="font-medium">Notification Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>SMS Notifications</span>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Notifications</span>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>In-App Notifications</span>
                    </div>
                    <Switch
                      checked={notifications.app}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, app: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="font-medium">What to notify me about</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Adopter messages</span>
                    <Switch
                      checked={notifications.adopter_messages}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, adopter_messages: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Visit requests</span>
                    <Switch
                      checked={notifications.visit_requests}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, visit_requests: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Admin alerts</span>
                    <Switch
                      checked={notifications.admin_alerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, admin_alerts: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Learning assignments</span>
                    <Switch
                      checked={notifications.learning_assignments}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, learning_assignments: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Frequency */}
              <div className="space-y-4">
                <h4 className="font-medium">Notification Frequency</h4>
                <Select 
                  value={notifications.frequency} 
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveNotifications} className="w-full sm:w-auto">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Public Profile Visibility</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Show profile to potential adopters</span>
                      <p className="text-sm text-muted-foreground">
                        Allow your farm to be discovered by new adopters
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showToAdopters}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showToAdopters: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Feature in success stories</span>
                      <p className="text-sm text-muted-foreground">
                        Allow your farm to be featured in platform success stories
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showInStories}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showInStories: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Participate in demo campaigns</span>
                      <p className="text-sm text-muted-foreground">
                        Include your farm in marketing and promotional materials
                      </p>
                    </div>
                    <Switch
                      checked={privacy.participateInDemo}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, participateInDemo: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* M-Pesa Settings */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  M-Pesa Settings
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="mpesaNumber">Withdrawal Phone Number</Label>
                  <Input
                    id="mpesaNumber"
                    value={profileData.mpesaNumber}
                    onChange={(e) => setProfileData(prev => ({ ...prev, mpesaNumber: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    This number will be used for all withdrawal transactions
                  </p>
                </div>
              </div>

              <Button onClick={handleSavePrivacy} className="w-full sm:w-auto">
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data & Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Export Data */}
              <div className="space-y-4">
                <h4 className="font-medium">Export Your Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download a copy of all your data including profile, messages, updates, and financial records.
                </p>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export All Data
                </Button>
              </div>

              <Separator />

              {/* Account Controls */}
              <div className="space-y-4">
                <h4 className="font-medium">Account Controls</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h5 className="font-medium mb-2">Pause Contributions</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Temporarily pause receiving new contributions while keeping your profile active.
                    </p>
                    <Button variant="outline" size="sm">
                      Pause Account
                    </Button>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h5 className="font-medium mb-2">Deactivate Account</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Hide your profile and stop all activities. You can reactivate later.
                    </p>
                    <Button variant="outline" size="sm">
                      Deactivate Account
                    </Button>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h5 className="font-medium mb-2 text-red-800">Delete Account Permanently</h5>
                    <p className="text-sm text-red-600 mb-3">
                      Permanently delete your account and all associated data. This cannot be undone.
                    </p>
                    <Button variant="destructive" size="sm" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FarmerProfileSettings;