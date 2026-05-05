import { useEffect, useState } from 'react';
import { format, startOfDay } from 'date-fns';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { CalendarIcon, Check } from 'lucide-react';
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
import { api, type Appointment, type Provider } from '../lib/api';
import { getCurrentUser } from '../lib/auth';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

export function RescheduleAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { navigate('/login'); return; }
    if (!id) { navigate('/my-appointments'); return; }

    Promise.all([api.getAppointmentById(Number(id)), api.getProviders()])
      .then(([appt, provs]) => {
        if (appt.patientId !== user.id) {
          toast.error('Not authorized to reschedule this appointment.');
          navigate('/my-appointments');
          return;
        }
        const dt = new Date(appt.appointmentDateTime);
        setAppointment(appt);
        setProviders(provs);
        setDate(dt);
        setTimeSlot(format(dt, 'hh:mm aa'));
        setReason(appt.reason);
      })
      .catch(() => { toast.error('Failed to load appointment.'); navigate('/my-appointments'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !date || !timeSlot || !reason.trim()) {
      toast.error('Please complete all fields.');
      return;
    }

    const [time, period] = timeSlot.split(' ');
    const [rawH, mins] = time.split(':').map(Number);
    let hours = rawH;
    if (period === 'PM' && rawH !== 12) hours += 12;
    if (period === 'AM' && rawH === 12) hours = 0;

    const dt = new Date(date);
    dt.setHours(hours, mins, 0, 0);

    setSaving(true);
    try {
      await api.rescheduleAppointment(appointment.id, {
        appointmentDateTime: format(dt, "yyyy-MM-dd'T'HH:mm:ss"),
        reason: reason.trim(),
      });
      toast.success('Appointment rescheduled!');
      navigate('/my-appointments');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reschedule.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout userType="patient"><div className="p-8">Loading...</div></Layout>;
  if (!appointment) return null;

  const provider = providers.find((p) => p.id === appointment.providerId);

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reschedule Appointment</h1>
            <p className="text-gray-600">Choose a new date and time.</p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Provider</Label>
                <p className="mt-1.5 text-gray-900 font-medium">
                  {provider ? `${provider.fullName} — ${provider.specialty}` : `Provider #${appointment.providerId}`}
                </p>
              </div>

              <div>
                <Label>New Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-1.5">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => startOfDay(d) < startOfDay(new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>New Time</Label>
                <Select value={timeSlot} onValueChange={setTimeSlot}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1.5 min-h-[100px]"
                  required
                />
              </div>

              {date && timeSlot && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm space-y-1">
                  <p className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-blue-600" /> Updated Summary
                  </p>
                  <p className="text-gray-700"><span className="font-medium">Date:</span> {format(date, 'MMMM d, yyyy')}</p>
                  <p className="text-gray-700"><span className="font-medium">Time:</span> {timeSlot}</p>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={saving}>
                  {saving ? 'Saving...' : 'Save New Time'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/my-appointments')}>
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
