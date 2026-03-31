import { Layout } from '../components/Layout';
import { Card } from '../components/ui/card';
import { Calendar, Clock, User, Activity } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';

export function PatientDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Upcoming Appointments',
      value: '3',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Past Appointments',
      value: '12',
      icon: Clock,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Active Providers',
      value: '5',
      icon: User,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Health Records',
      value: '8',
      icon: Activity,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      provider: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      date: '2026-02-25',
      time: '10:00 AM',
      status: 'Confirmed',
    },
    {
      id: 2,
      provider: 'Dr. Michael Chen',
      specialty: 'Dermatologist',
      date: '2026-02-28',
      time: '2:30 PM',
      status: 'Confirmed',
    },
    {
      id: 3,
      provider: 'Dr. Emily Williams',
      specialty: 'General Practice',
      date: '2026-03-05',
      time: '11:00 AM',
      status: 'Pending',
    },
  ];

  return (
    <Layout userType="patient">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h1>
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
            <Button variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              View Health Records
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
                          appointment.status === 'Confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {appointment.status}
                      </span>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
