import { createBrowserRouter } from 'react-router';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PatientDashboard } from './pages/PatientDashboard';
import { BookAppointment } from './pages/BookAppointment';
import { MyAppointments } from './pages/MyAppointments';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/dashboard',
    Component: PatientDashboard,
  },
  {
    path: '/book-appointment',
    Component: BookAppointment,
  },
  {
    path: '/my-appointments',
    Component: MyAppointments,
  },
  {
    path: '/admin',
    Component: AdminDashboard,
  },
  {
    path: '/admin/providers',
    Component: AdminDashboard,
  },
  {
    path: '/profile',
    Component: Profile,
  },
]);