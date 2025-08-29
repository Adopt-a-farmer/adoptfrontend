import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus, BookOpen } from 'lucide-react';

const CalendarManager = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar Manager</h1>
          <p className="text-gray-600 mt-2">
            Manage farming calendar entries and seasonal advice
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Calendar Entry
        </Button>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Farming Calendar Management
          </CardTitle>
          <CardDescription>
            Create and manage seasonal farming advice and calendar entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar Management Coming Soon</h3>
            <p className="text-gray-500 mb-6">
              This feature will allow you to create seasonal farming advice and calendar entries
              to help farmers plan their agricultural activities throughout the year.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                View Current Calendar
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <Clock className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">Seasonal Planning</h3>
            <p className="text-sm text-gray-600">
              Create seasonal farming advice and reminders for optimal crop planning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Calendar className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="font-semibold mb-2">Activity Scheduling</h3>
            <p className="text-sm text-gray-600">
              Schedule important farming activities and provide expert guidance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <BookOpen className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="font-semibold mb-2">Knowledge Integration</h3>
            <p className="text-sm text-gray-600">
              Link calendar entries with your published articles for comprehensive guidance
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarManager;