import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar as CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { api, type Provider } from '../lib/api';
import { getCurrentUser } from '../lib/auth';

export function BookAppointment() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [provider, setProvider] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    api.getProviders()
      .then(setProviders)
      .catch(() => toast.error('Failed to load providers'));
  }, []);

  const timeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = getCurrentUser();
    if (!user) {
      toast.error('Please log in before booking');
      return;
    }

    if (!date || !provider || !timeSlot || !reason) {
      toast.error('Please complete all required fields');
      return;
    }

    const [time, period] = timeSlot.split(' ');
    const [rawHours, minutes] = time.split(':').map(Number);
    let hours = rawHours;
    if (period === 'PM' && rawHours !== 12) hours += 12;
    if (period === 'AM' && rawHours === 12) hours = 0;

    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    try {
      await api.bookAppointment({
        patientId: user.id,
        providerId: Number(provider),
        appointmentDateTime: appointmentDateTime.toISOString(),
        reason,
      });

      toast.success('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to book appointment';
      toast.error(message);
    }
  };

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
            <p className="text-gray-600">Schedule your next medical consultation</p>
          </div>

          {/* Booking Form */}
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Provider Selection */}
              <div>
                <Label htmlFor="provider">Select Healthcare Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Choose a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((prov) => (
                      <SelectItem key={prov.id} value={String(prov.id)}>
                        {prov.fullName} - {prov.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div>
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1.5"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Slot Selection */}
              <div>
                <Label htmlFor="timeSlot">Select Time Slot</Label>
                <Select value={timeSlot} onValueChange={setTimeSlot}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reason for Visit */}
              <div>
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                  id="reason"
                  placeholder="Please describe the reason for your appointment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1.5 min-h-[120px]"
                  required
                />
              </div>

              {/* Summary */}
              {provider && date && timeSlot && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-blue-600" />
                    Appointment Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Provider:</span>{' '}
                      {providers.find((p) => String(p.id) === provider)?.fullName}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Date:</span> {format(date, 'MMMM d, yyyy')}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Time:</span> {timeSlot}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!provider || !date || !timeSlot || !reason}
                >
                  Confirm Appointment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
