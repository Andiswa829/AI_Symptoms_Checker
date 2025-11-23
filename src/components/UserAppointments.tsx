import React, { useEffect, useState } from 'react';
import { ApiService } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, User, Mail, X } from 'lucide-react';

type BackendAppointment = {
  id: number;
  appointmentDate: string; // ISO
  reason: string;
  status: string;
  notes?: string;
  createdAt: string;
  doctor: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    specialization?: string;
    phoneNumber?: string;
  };
};

type LocalAppointment = {
  id: string;
  appointmentDate: Date;
  date: string;
  time: string;
  reason: string;
  status: string;
  notes?: string;
  createdAt: string;
  doctor: BackendAppointment['doctor'];
};

export function UserAppointments() {
  const [appointments, setAppointments] = useState<LocalAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      window.location.href = '/';
      return;
    }
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      if (!user?.id) {
        setAppointments([]);
        setError('User not found');
        return;
      }

      const resp = await ApiService.get(`/api/Appointments/getUserAppointments/${encodeURIComponent(user.id)}`) as BackendAppointment[];
      if (!Array.isArray(resp)) {
        setAppointments([]);
        return;
      }

      const mapped: LocalAppointment[] = resp.map(a => {
        const dt = new Date(a.appointmentDate);
        const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
        const date = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
        const hours = dt.getHours();
        const minutes = dt.getMinutes();
        const time = (hours === 0 && minutes === 0) ? '' : `${pad(hours)}:${pad(minutes)}`;
        return {
          id: String(a.id),
          appointmentDate: dt,
          date,
          time,
          reason: a.reason,
          status: a.status,
          notes: a.notes,
          createdAt: a.createdAt,
          doctor: a.doctor,
        };
      });

      setAppointments(mapped);
    } catch (err: any) {
      console.error('Failed to load appointments', err);
      setError(err?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    setUpdatingId(id);
    try {
      await ApiService.delete(`/api/Appointments/${id}`);
      await fetchAppointments();
    } catch (err) {
      console.warn('Failed to cancel appointment', err);
      alert('Failed to cancel appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  const now = Date.now();
  const upcoming = appointments.filter(a => a.appointmentDate.getTime() > now);
  const past = appointments.filter(a => a.appointmentDate.getTime() <= now);

  const getBadgeVariant = (status: string) => {
    // Map backend PascalCase statuses to badge variants
    switch ((status || '').toLowerCase()) {
      case 'cancelled':
      case 'canceled':
      case 'noshow':
      case 'no-show':
        return 'destructive';
      case 'confirmed':
      case 'accepted':
        return 'default';
      case 'pending':
      case 'requested':
      case 'rescheduled':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-destructive">{error}</p>
            ) : appointments.length === 0 ? (
              <p>No appointments found</p>
            ) : (
              <div className="space-y-6">
                <section>
                  <h3 className="font-medium mb-2">Upcoming</h3>
                  <div className="space-y-3">
                    {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No upcoming appointments</p>}
                    {upcoming.map(a => (
                      <div key={a.id} className="border rounded p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><User className="h-5 w-5 text-blue-600"/></div>
                          <div>
                            <div className="font-medium">Dr. {a.doctor.firstName} {a.doctor.lastName}</div>
                            <div className="text-sm text-gray-600">{a.doctor.specialization}</div>
                            <div className="text-sm text-gray-700 mt-1">{a.reason}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                              <span className="flex items-center"><Calendar className="h-3 w-3 mr-1"/>{a.date}</span>
                              <span className="flex items-center"><Clock className="h-3 w-3 mr-1"/>{a.time || 'All day'}</span>
                              <span className="flex items-center"><Mail className="h-3 w-3 mr-1"/>{a.doctor.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getBadgeVariant(a.status)}>{a.status}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => handleCancel(a.id)} disabled={updatingId === a.id}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-medium mb-2">Past</h3>
                  <div className="space-y-3">
                    {past.length === 0 && <p className="text-sm text-muted-foreground">No past appointments</p>}
                    {past.map(a => (
                      <div key={a.id} className="border rounded p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">Dr. {a.doctor.firstName} {a.doctor.lastName}</div>
                          <div className="text-sm text-gray-600">{a.doctor.specialization}</div>
                          <div className="text-sm text-gray-700">{a.reason}</div>
                          <div className="text-xs text-gray-500 mt-1">{a.date} {a.time || ''}</div>
                          {a.notes && <div className="text-xs text-gray-500 mt-1">Notes: {a.notes}</div>}
                        </div>
                        <div>
                          <Badge variant={getBadgeVariant(a.status)}>{a.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserAppointments;
