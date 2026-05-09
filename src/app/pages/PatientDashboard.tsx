import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/card';
import { Calendar, Clock, User, Activity } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { api } from '../lib/api';
import { getCurrentUser } from '../lib/auth';

type DashboardAppointment = {
  id: number;
  provider: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
};

export function PatientDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [stats, setStats] = useState([
    { title: 'Upcoming Appointments', value: '0', icon: Calendar, color: 'bg-blue-100 text-blue-600' },
    { title: 'Past Appointments', value: '0', icon: Clock, color: 'bg-green-100 text-green-600' },
    { title: 'Active Providers', value: '0', icon: User, color: 'bg-purple-100 text-purple-600' },
    { title: 'Cancelled Appointments', value: '0', icon: Activity, color: 'bg-orange-100 text-orange-600' },
  ]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<DashboardAppointment[]>([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    Promise.all([api.getPatientAppointments(currentUser.id), api.getProviders()]).then(([appointments, providers]) => {
      const upcoming = appointments
        .filter((appointment) => new Date(appointment.appointmentDateTime) >= new Date() && appointment.status !== 'Cancelled')
        .sort((a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime());

      setStats([
        { title: 'Upcoming Appointments', value: String(upcoming.length), icon: Calendar, color: 'bg-blue-100 text-blue-600' },
        { title: 'Past Appointments', value: String(Math.max(appointments.length - upcoming.length, 0)), icon: Clock, color: 'bg-green-100 text-green-600' },
        { title: 'Active Providers', value: String(providers.length), icon: User, color: 'bg-purple-100 text-purple-600' },
        { title: 'Cancelled Appointments', value: String(appointments.filter((appointment) => appointment.status === 'Cancelled').length), icon: Activity, color: 'bg-orange-100 text-orange-600' },
      ]);

      setUpcomingAppointments(
        upcoming.slice(0, 3).map((appointment) => {
          const provider = providers.find((item) => item.id === appointment.providerId);
          const when = new Date(appointment.appointmentDateTime);
          return {
            id: appointment.id,
            provider: provider?.fullName || `Provider #${appointment.providerId}`,
            specialty: provider?.specialty || 'General Care',
            date: when.toLocaleDateString(),
            time: when.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            status: appointment.status,
          };
        })
      );
    }).catch(() => {
      setUpcomingAppointments([]);
    });
  }, [currentUser, navigate]);

  return (
    <Layout userType="patient">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {currentUser?.fullName?.split(' ')[0] || 'Patient'}!</h1>
          <p className="text-gray-600">Here's an overview of your health appointments</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Button 
              onClick={() => navigate('/book-appointment')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book New Appointment
            </Button>
            <Button variant="outline" onClick={() => navigate('/my-appointments')}>
              <Activity className="w-4 h-4 mr-2" />
              View My Appointments
            </Button>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointments</h2>
          <Card>
            <div className="divide-y divide-gray-200">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {appointment.provider}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{appointment.specialty}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'Confirmed' || appointment.status === 'Booked'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {appointment.status}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => navigate('/my-appointments')}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <div className="p-6 text-gray-600">No upcoming appointments found.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
