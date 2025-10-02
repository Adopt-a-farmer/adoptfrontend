import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface FarmerAvailabilitySchedulerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
}

interface AvailabilitySlot {
  time: string;
  formattedTime: string;
  available: boolean;
}

interface AvailabilityResponse {
  date: string;
  availableSlots: AvailabilitySlot[];
  bookedSlots: number;
  hasCustomAvailability: boolean;
}

export const FarmerAvailabilityScheduler: React.FC<FarmerAvailabilitySchedulerProps> = ({
  open,
  onOpenChange,
  farmerId,
  farmerName,
  farmerLocation
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('half_day');
  const [adults, setAdults] = useState('1');
  const [children, setChildren] = useState('0');
  const [notes, setNotes] = useState('');

  // Fetch farmer availability for selected date
  const { data: availabilityData, isLoading: isLoadingAvailability } = useQuery<AvailabilityResponse>({
    queryKey: ['farmer-availability', farmerId, selectedDate?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!selectedDate) throw new Error('No date selected');
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await apiCall<{ data: AvailabilityResponse }>(
        'GET', 
        `/visits/farmer/${farmerId}/availability?date=${dateStr}`
      );
      return response.data;
    },
    enabled: !!selectedDate && open,
  });

  // Schedule visit mutation
  const scheduleVisitMutation = useMutation({
    mutationFn: async (visitData: {
      farmerId: string;
      requestedDate: string;
      duration: string;
      purpose: string;
      notes?: string;
      groupSize: { adults: number; children: number };
    }) => {
      return await apiCall('POST', '/visits', visitData);
    },
    onSuccess: () => {
      toast({
        title: 'Visit Scheduled Successfully',
        description: 'Your farm visit request has been sent to the farmer for confirmation.',
      });
      queryClient.invalidateQueries({ queryKey: ['expert-visits'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-availability'] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Schedule Visit',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleScheduleVisit = () => {
    if (!selectedDate || !selectedTimeSlot || !purpose.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Combine date and time
    const [hours, minutes] = selectedTimeSlot.split(':');
    const visitDateTime = new Date(selectedDate);
    visitDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    scheduleVisitMutation.mutate({
      farmerId,
      requestedDate: visitDateTime.toISOString(),
      duration,
      purpose: purpose.trim(),
      notes: notes.trim(),
      groupSize: {
        adults: parseInt(adults),
        children: parseInt(children)
      }
    });
  };

  const handleClose = () => {
    setSelectedDate(new Date());
    setSelectedTimeSlot('');
    setPurpose('');
    setDuration('half_day');
    setAdults('1');
    setChildren('0');
    setNotes('');
    onOpenChange(false);
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3); // Allow booking up to 3 months ahead

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Farm Visit</DialogTitle>
          <DialogDescription>
            Book a visit to {farmerName}'s farm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Farmer Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{farmerName}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {farmerLocation}
                  </div>
                </div>
                <Badge variant="outline">Expert Visit</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calendar Selection */}
            <div>
              <Label className="mb-3 block">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < minDate || date > maxDate}
                className="rounded-md border"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can schedule visits up to 3 months in advance
              </p>
            </div>

            {/* Available Time Slots */}
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Available Time Slots</Label>
                {isLoadingAvailability ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : availabilityData?.availableSlots && availabilityData.availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                    {availabilityData.availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTimeSlot === slot.time ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => setSelectedTimeSlot(slot.time)}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {slot.formattedTime}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-muted/50">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {selectedDate 
                        ? 'No available slots for this date. Please select another date.'
                        : 'Select a date to view available time slots'}
                    </p>
                  </div>
                )}
                {availabilityData && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                    {availabilityData.bookedSlots} slot(s) already booked
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Visit Duration *</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="half_day">Half Day (4 hours)</SelectItem>
                    <SelectItem value="full_day">Full Day (8 hours)</SelectItem>
                    <SelectItem value="weekend">Weekend Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="adults">Adults</Label>
                  <Select value={adults} onValueChange={setAdults}>
                    <SelectTrigger id="adults">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="children">Children</Label>
                  <Select value={children} onValueChange={setChildren}>
                    <SelectTrigger id="children">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="purpose">Purpose of Visit *</Label>
              <Textarea
                id="purpose"
                placeholder="e.g., Farm assessment, mentorship session, knowledge transfer, etc."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={3}
                className="resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {purpose.length}/500 characters
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requirements or additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Selected Visit Summary */}
          {selectedDate && selectedTimeSlot && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3">Visit Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedTimeSlot} - {duration.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{farmerLocation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={scheduleVisitMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleScheduleVisit} 
            disabled={!selectedDate || !selectedTimeSlot || !purpose.trim() || scheduleVisitMutation.isPending}
          >
            {scheduleVisitMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Schedule Visit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
