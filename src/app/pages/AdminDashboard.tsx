import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Users, Calendar, ClipboardList, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

interface Provider {
  id: number;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export function AdminDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '',
    specialty: '',
    workingHours: '',
    email: '',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  useEffect(() => {
    api.getProviders()
      .then((apiProviders) => {
        setProviders(
          apiProviders.map((provider) => ({
            id: provider.id,
            name: provider.fullName,
            specialty: provider.specialty,
            email: '',
            phone: '',
            status: 'Active',
          }))
        );
      })
      .catch(() => toast.error('Failed to load providers'));
  }, []);

  const stats = [
    {
      title: 'Total Providers',
      value: providers.length.toString(),
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Active Providers',
      value: providers.filter((p) => p.status === 'Active').length.toString(),
      icon: Users,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Total Appointments Today',
      value: '24',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Pending Appointments',
      value: '8',
      icon: ClipboardList,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const handleAddProvider = async () => {
    try {
      const created = await api.createProvider(
        newProvider.name,
        newProvider.specialty,
        newProvider.workingHours || 'Mon-Fri 9am-5pm'
      );

      const provider: Provider = {
        id: created.id,
        name: created.fullName,
        specialty: created.specialty,
        email: newProvider.email,
        phone: newProvider.phone,
        status: newProvider.status,
      };

      setProviders((prev) => [...prev, provider]);
      setIsAddDialogOpen(false);
      setNewProvider({
        name: '',
        specialty: '',
        workingHours: '',
        email: '',
        phone: '',
        status: 'Active',
      });
      toast.success('Provider added successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add provider';
      toast.error(message);
    }
  };

  const handleDeleteProvider = (id: number) => {
    setProviders(providers.filter((p) => p.id !== id));
    toast.success('Provider deleted successfully');
  };

  const handleEditProvider = (id: number) => {
    toast.info('Edit functionality coming soon');
  };

  return (
    <Layout userType="admin">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage healthcare providers and appointments</p>
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

        {/* Provider Management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Healthcare Providers</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Provider
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Provider</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new healthcare provider
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Dr. John Doe"
                      value={newProvider.name}
                      onChange={(e) =>
                        setNewProvider({ ...newProvider, name: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      placeholder="Cardiologist"
                      value={newProvider.specialty}
                      onChange={(e) =>
                        setNewProvider({ ...newProvider, specialty: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@hospital.com"
                      value={newProvider.email}
                      onChange={(e) =>
                        setNewProvider({ ...newProvider, email: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 000-0000"
                      value={newProvider.phone}
                      onChange={(e) =>
                        setNewProvider({ ...newProvider, phone: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newProvider.status}
                      onValueChange={(value: 'Active' | 'Inactive') =>
                        setNewProvider({ ...newProvider, status: value })
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddProvider}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Provider
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>{provider.specialty}</TableCell>
                    <TableCell className="text-gray-600">{provider.email}</TableCell>
                    <TableCell className="text-gray-600">{provider.phone}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          provider.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {provider.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProvider(provider.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProvider(provider.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
