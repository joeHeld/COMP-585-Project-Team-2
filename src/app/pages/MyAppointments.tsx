import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock, User, MoreVertical, X, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {

  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { api, type Appointment, type Provider } from '../lib/api';
import { getCurrentUser } from '../lib/auth';

export function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    Promise.all([api.getPatientAppointments(user.id), api.getProviders()])
      .then(([appts, provs]) => {
        setAppointments(appts);
        setProviders(provs);
      })
      .catch(() => toast.error('Failed to load appointments'));
  }, []);

  const upcomingAppointments = appointments.filter((appt) => {
    const when = new Date(appt.appointmentDateTime);
    return when >= new Date() && appt.status !== 'Cancelled';
  });

  const pastAppointments = appointments.filter((appt) => {
    const when = new Date(appt.appointmentDateTime);
    return when < new Date() || appt.status === 'Cancelled';
  });

  const handleCancelAppointment = async (id: number) => {
    try {
      await api.cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === id ? { ...appt, status: 'Cancelled' } : appt
        )
      );
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel appointment';
      toast.error(message);
    } finally {
      setShowCancelModal(false);
      setAppointmentToCancel(null);
    }
  };

  const openCancelModal = (id: number) => {
    setAppointmentToCancel(id);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setAppointmentToCancel(null);
  };

  const confirmCancel = () => {
    if (appointmentToCancel !== null) {
      handleCancelAppointment(appointmentToCancel);
    }
  };

  const handleReschedule = (id: number) => {
    navigate(`/appointments/${id}/reschedule`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
      Confirmed: { variant: 'default', color: 'bg-green-100 text-green-700 border-green-200' },
      Pending: { variant: 'secondary', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      Completed: { variant: 'outline', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      Cancelled: { variant: 'destructive', color: 'bg-red-100 text-red-700 border-red-200' },
    };

    const statusConfig = variants[status] || variants.Pending;

    return (
      <Badge className={`${statusConfig.color} border`} variant="outline">
        {status}
      </Badge>
    );
  };

  const navigate = useNavigate();

  const getProvider = (providerId: number) => providers.find((p) => p.id === providerId);

  return (
    <Layout userType="patient">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">View and manage your healthcare appointments</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
          </TabsList>

          {/* Upcoming Appointments */}
          <TabsContent value="upcoming">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-6">No upcoming appointments yet.</p>
                  <Button onClick={() => navigate('/book-appointment')}>
                    Book Appointment
                  </Button>
                </div>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingAppointments.map((appointment) => (
                      <React.Fragment key={appointment.id}>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{getProvider(appointment.providerId)?.fullName ?? `Provider #${appointment.providerId}`}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{getProvider(appointment.providerId)?.specialty ?? 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{new Date(appointment.appointmentDateTime).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>{new Date(appointment.appointmentDateTime).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{appointment.reason}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setExpandedId(expandedId === appointment.id ? null : appointment.id)}>
                                  {expandedId === appointment.id
                                    ? <><ChevronUp className="w-4 h-4 mr-2" />Hide Details</>
                                    : <><ChevronDown className="w-4 h-4 mr-2" />View Details</>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReschedule(appointment.id)}>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openCancelModal(appointment.id)}
                                  className="text-red-600"
                                  disabled={appointment.status !== 'Booked'}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedId === appointment.id && (
                        <TableRow className="bg-gray-50">
                          <TableCell colSpan={6} className="py-3 px-6 text-sm text-gray-700">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              <div><span className="text-gray-500">Reference ID: </span><span className="font-medium">APT-{appointment.id.toString().padStart(5, '0')}</span></div>
                              <div><span className="text-gray-500">Days Until: </span><span className="font-medium">{Math.ceil((new Date(appointment.appointmentDateTime).getTime() - Date.now()) / 86400000)} days</span></div>
                              <div><span className="text-gray-500">Duration: </span><span className="font-medium">30 minutes</span></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* Past Appointments */}
          <TabsContent value="past">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastAppointments.map((appointment) => (
                    <React.Fragment key={appointment.id}>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{getProvider(appointment.providerId)?.fullName ?? `Provider #${appointment.providerId}`}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{getProvider(appointment.providerId)?.specialty ?? 'Unknown'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{new Date(appointment.appointmentDateTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{new Date(appointment.appointmentDateTime).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{appointment.reason}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === appointment.id ? null : appointment.id)}>
                          {expandedId === appointment.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedId === appointment.id && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={6} className="py-3 px-6 text-sm text-gray-700">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div><span className="text-gray-500">Reference ID: </span><span className="font-medium">APT-{appointment.id.toString().padStart(5, '0')}</span></div>
                            <div><span className="text-gray-500">Visit Date: </span><span className="font-medium">{new Date(appointment.appointmentDateTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
                            <div><span className="text-gray-500">Duration: </span><span className="font-medium">30 minutes</span></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cancel Appointment?</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this appointment?</p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={closeCancelModal}
              >
                No
              </Button>
              <Button
                onClick={confirmCancel}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}