import React, { useState, useEffect } from "react";
import { ApiService } from "../utils/api";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Search,
  Filter,
  ChevronRight,
  Stethoscope,
  Activity,
  AlertCircle,
  CheckCircle,
  MessageSquare
} from "lucide-react";
import { Appointment, Doctor, Patient } from "../types/doctor";

interface DoctorDashboardProps {
  doctor: Doctor;
  onViewPatientHistory: (patient: Patient) => void;
  onLogout: () => void;
}

interface DoctorStatsDto {
  totalAppointments: number;
  todaysAppointments: number;
  thisWeekAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalPatients: number;
  rating: number;
  yearsOfExperience: number;
}

interface DoctorAppointmentDto {
  id: number;
  patientName: string;
  patientEmail: string;
  appointmentDate: string; // ISO string
  reason?: string;
  status: string;
  notes?: string;
  patientId?: string;
}

export function DoctorDashboard({ doctor, onViewPatientHistory, onLogout }: DoctorDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Partial<DoctorStatsDto> | null>(null);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch stats and appointments from backend
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // stats
        try {
          const s = await ApiService.get('/api/DoctorDashboard/statistics');
          setStats({
            totalAppointments: s.totalAppointments ?? s.TotalAppointments ?? 0,
            todaysAppointments: s.todaysAppointments ?? s.TodaysAppointments ?? 0,
            thisWeekAppointments: s.thisWeekAppointments ?? s.ThisWeekAppointments ?? 0,
            pendingAppointments: s.pendingAppointments ?? s.PendingAppointments ?? 0,
            completedAppointments: s.completedAppointments ?? s.CompletedAppointments ?? 0,
            totalPatients: s.totalPatients ?? s.TotalPatients ?? 0,
            rating: s.rating ?? s.Rating ?? 0,
            yearsOfExperience: s.yearsOfExperience ?? s.YearsOfExperience ?? 0,
          });
        } catch (err) {
          console.warn('Could not load doctor stats', err);
        }

        // appointments
        await fetchAppointments();
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor]);

  const fetchAppointments = async (date?: string, status?: string) => {
    try {
      let url = '/api/DoctorDashboard/appointments';
      const params: string[] = [];
      if (date) params.push(`date=${encodeURIComponent(date)}`);
      if (status && status !== 'all') params.push(`status=${encodeURIComponent(status)}`);
      if (params.length) url += `?${params.join('&')}`;

      const resp = await ApiService.get(url) as DoctorAppointmentDto[];
      if (Array.isArray(resp)) {
        const mapped: Appointment[] = resp.map(a => {
          const dt = new Date(a.appointmentDate);

          // Build local YYYY-MM-DD (so filtering by selectedDate works as expected)
          const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
          const localDate = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;

          // Build time in HH:MM (local). If time is exactly midnight, treat as "" (all-day)
          const hours = dt.getHours();
          const minutes = dt.getMinutes();
          const timeOnly = (hours === 0 && minutes === 0) ? '' : `${pad(hours)}:${pad(minutes)}`;

          // Normalize status: accept numeric codes or textual status and map to PascalCase enum names
          const rawStatus = (a as any).status;
          let statusText = '';
          if (rawStatus === null || rawStatus === undefined) statusText = 'Scheduled';
          else if (typeof rawStatus === 'number' || /^[0-9]+$/.test(String(rawStatus))) {
            const code = Number(rawStatus);
            switch (code) {
              case 0: statusText = 'Scheduled'; break;
              case 1: statusText = 'Confirmed'; break;
              case 2: statusText = 'Completed'; break;
              case 3: statusText = 'Cancelled'; break;
              default: statusText = 'Scheduled'; break;
            }
          } else {
            // convert textual status to PascalCase (e.g., "inprogress" -> "InProgress")
            const s = String(rawStatus).toLowerCase().replace(/\s+/g, '');
            const mapping: Record<string, string> = {
              'scheduled': 'Scheduled',
              'confirmed': 'Confirmed',
              'inprogress': 'InProgress',
              'completed': 'Completed',
              'cancelled': 'Cancelled',
              'noshow': 'NoShow'
            };
            statusText = mapping[s] ?? (s ? (s.charAt(0).toUpperCase() + s.slice(1)) : 'Scheduled');
          }

          return {
            id: String(a.id),
            doctorId: doctor.id,
            patient: {
              id: a.patientId ?? '',
              firstName: a.patientName.split(' ')[0] ?? '',
              lastName: a.patientName.split(' ').slice(1).join(' ') ?? '',
              email: a.patientEmail || '',
              phone: '',
            },
            patientName: a.patientName,
            patientEmail: a.patientEmail,
            patientPhone: '',
            date: localDate,
            time: timeOnly,
            reason: a.reason || '',
            symptoms: [],
            notes: a.notes || '',
            status: statusText,
            reminderSent: false,
            // attach original date object for accurate comparisons
            // (cast to any so we don't need to change the Appointment type)
            ...( { __datetime: dt } as any ),
          } as Appointment;
        });

        setAppointments(mapped);
        setFilteredAppointments(mapped);
      }
    } catch (err) {
      console.warn('Failed to load appointments', err);
    }
  };

  // Filter appointments
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => (apt.status || '').toLowerCase() === statusFilter);
    }

    if (selectedDate) {
      filtered = filtered.filter(apt => apt.date === selectedDate);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter, selectedDate]);

  // refetch from server when date or status filter changes
  useEffect(() => {
    // convert selectedDate to yyyy-mm-dd if it's set
    const dateParam = selectedDate || undefined;
    fetchAppointments(dateParam, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, statusFilter]);

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "inprogress": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "noshow": return "bg-red-50 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case "scheduled": return <Clock className="h-4 w-4" />;
      case "confirmed": return <CheckCircle className="h-4 w-4" />;
      case "inprogress": return <Activity className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
      case "noshow": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Determine today's local date string in YYYY-MM-DD for accurate comparison
  const now = new Date();
  const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
  const todayLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const todaysAppointments = filteredAppointments.filter(apt => apt.date === todayLocal);

  const upcomingAppointments = filteredAppointments.filter(apt => {
    const dt = (apt as any).__datetime ? (apt as any).__datetime as Date : new Date(apt.date);
    return dt.getTime() > Date.now();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600">Welcome back, Dr. {doctor.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold">{stats?.todaysAppointments ?? todaysAppointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{stats?.thisWeekAppointments ?? upcomingAppointments.length}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold">{stats?.totalPatients ?? appointments.length}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats?.completedAppointments ?? appointments.filter(apt => (apt.status || '').toLowerCase() === 'completed').length}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Appointments</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No appointments found</p>
                    </div>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{appointment.patientName}</h3>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(appointment.status)}>
                              <span className="flex items-center space-x-1">
                                {getStatusIcon(appointment.status)}
                                <span>{(appointment.status || '').replace(/([A-Z])/g, ' $1').trim()}</span>
                              </span>
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewPatientHistory(appointment.patient)}
                              disabled={!appointment.patient.medicalHistory}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Medical History
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setEditStatus(appointment.status || 'Scheduled');
                                setEditNotes(appointment.notes || '');
                              }}
                            >
                              Manage
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time || 'All day'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{appointment.patientPhone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{appointment.patientEmail}</span>
                          </div>
                        </div>

                        {appointment.symptoms.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Symptoms:</p>
                            <div className="flex flex-wrap gap-1">
                              {appointment.symptoms.map((symptom) => (
                                <Badge key={symptom.id} variant="secondary" className="text-xs">
                                  {symptom.description} ({symptom.severity})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {appointment.notes && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                            <p className="text-sm text-gray-600">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Today's Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysAppointments.length === 0 ? (
                  <p className="text-gray-500 text-sm">No appointments today</p>
                ) : (
                  <div className="space-y-3">
                    {todaysAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium text-sm">{appointment.patientName}</p>
                          <p className="text-xs text-gray-600">{appointment.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{appointment.time || 'All day'}</p>
                          <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                            {(appointment.status || '').replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appointment Management Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAppointment ? (
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{selectedAppointment.patientName}</p>
                      <p className="text-xs text-muted-foreground">{selectedAppointment.patientEmail}</p>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                            <select id="status" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-3 py-2 border rounded">
                        <option value="Scheduled">Scheduled</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="NoShow">No Show</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full" />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={async () => {
                        if (!selectedAppointment) return;
                        setUpdateLoading(true);
                        try {
                          // Map PascalCase enum name to numeric value expected by backend
                          const enumMap: Record<string, number> = {
                            'Scheduled': 0,
                            'Confirmed': 1,
                            'InProgress': 2,
                            'Completed': 3,
                            'Cancelled': 4,
                            'NoShow': 5,
                          };

                          const statusValue = enumMap[editStatus] ?? 0;

                          // Some backends expect the request wrapped in a property named `request`.
                          // Sending both formats is safer; here we send the wrapper the API error requested.
                          const payload = {Status: statusValue, Notes: editNotes};

                          await ApiService.put(`/api/DoctorDashboard/appointments/${selectedAppointment.id}`, payload);
                          // refresh list
                          await fetchAppointments(selectedDate, statusFilter);
                          setSelectedAppointment(null);
                        } catch (err) {
                          console.warn('Failed to update appointment', err);
                        } finally {
                          setUpdateLoading(false);
                        }
                      }} disabled={updateLoading}>
                        {updateLoading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="ghost" onClick={() => setSelectedAppointment(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Select an appointment to manage</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message to Patient
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Medical Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}