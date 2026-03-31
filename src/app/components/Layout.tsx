import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { 
  Calendar, 
  Home, 
  Users, 
  ClipboardList, 
  LogOut,
  UserCircle
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  userType?: 'patient' | 'admin';
}

export function Layout({ children, userType = 'patient' }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const patientNavItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/book-appointment', icon: Calendar, label: 'Book Appointment' },
    { path: '/my-appointments', icon: ClipboardList, label: 'My Appointments' },
  ];

  const adminNavItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/providers', icon: Users, label: 'Manage Providers' },
  ];

  const navItems = userType === 'admin' ? adminNavItems : patientNavItems;

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">HealthCare</h1>
          <p className="text-sm text-gray-600 mt-1">Appointment System</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <UserCircle className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {userType === 'admin' ? 'Admin User' : 'John Doe'}
              </p>
              <p className="text-xs text-gray-500">
                {userType === 'admin' ? 'Administrator' : 'Patient'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
