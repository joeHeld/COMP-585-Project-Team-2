import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import { FileText, ChevronDown, ChevronUp, Stethoscope } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/card';
import { api, type Appointment, type Provider } from '../lib/api';
import { getCurrentUser } from '../lib/auth';

type VisitRecord = Appointment & { providerName: string; providerSpecialty: string };

export function HealthRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { navigate('/login'); return; }

    Promise.all([api.getPatientAppointments(user.id), api.getProviders()])
      .then(([appointments, providers]) => {
        const providerMap = new Map<number, Provider>(providers.map((p) => [p.id, p]));
        const past = appointments
          .filter((a) => new Date(a.appointmentDateTime) < new Date())
          .sort((a, b) => new Date(b.appointmentDateTime).getTime() - new Date(a.appointmentDateTime).getTime())
          .map((a) => {
            const p = providerMap.get(a.providerId);
            return {
              ...a,
              providerName: p?.fullName ?? `Provider #${a.providerId}`,
              providerSpecialty: p?.specialty ?? '',
            };
          });
        setRecords(past);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const toggle = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Records</h1>
            <p className="text-gray-600">Your complete visit history and doctor notes.</p>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading records...</p>
          ) : records.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No past visits found.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {records.map((record) => {
                const isExpanded = expandedId === record.id;
                const visitDate = new Date(record.appointmentDateTime);
                return (
                  <div key={record.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      className="w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                      onClick={() => toggle(record.id)}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{record.providerName}</p>
                        <p className="text-sm text-gray-500">{record.providerSpecialty}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-gray-900">{format(visitDate, 'MMM d, yyyy')}</p>
                        <p className="text-sm text-gray-500">{format(visitDate, 'h:mm a')}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-5 border-t border-gray-100 bg-gray-50 space-y-4 pt-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reason for Visit</p>
                          <p className="text-gray-800">{record.reason || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Doctor Notes</p>
                          {record.notes ? (
                            <p className="text-gray-800 whitespace-pre-wrap">{record.notes}</p>
                          ) : (
                            <p className="text-gray-400 italic">No notes recorded for this visit.</p>
                          )}
                        </div>
                        <div className="flex gap-6 text-sm text-gray-500 pt-1">
                          <span><span className="font-medium text-gray-700">Status:</span> {record.status}</span>
                          <span><span className="font-medium text-gray-700">Ref #:</span> {record.id}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
