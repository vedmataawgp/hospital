import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  useListAppointments, 
  useConfirmAppointment, 
  useCancelAppointment,
  getListAppointmentsQueryKey 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Search, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AppointmentsManagement() {
  const [statusFilter, setStatusFilter] = useState<any>(undefined);
  const { data, isLoading } = useListAppointments({ status: statusFilter });
  const confirmMutation = useConfirmAppointment();
  const cancelMutation = useCancelAppointment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleConfirm = async (id: number) => {
    try {
      await confirmMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
      toast({ title: "Appointment confirmed" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error confirming appointment" });
    }
  }

  const handleCancel = async (id: number) => {
    if(confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await cancelMutation.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        toast({ title: "Appointment cancelled" });
      } catch (e) {
        toast({ variant: "destructive", title: "Error cancelling appointment" });
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed': return <Badge variant="success">Confirmed</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed': return <Badge variant="info">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">Appointments</h2>
          <p className="text-sm text-slate-500">Manage all doctor appointments</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
          <Button 
            variant={statusFilter === undefined ? "default" : "outline"} 
            size="sm" onClick={() => setStatusFilter(undefined)}>All</Button>
          <Button 
            variant={statusFilter === 'pending' ? "default" : "outline"} 
            size="sm" onClick={() => setStatusFilter('pending')}>Pending</Button>
          <Button 
            variant={statusFilter === 'confirmed' ? "default" : "outline"} 
            size="sm" onClick={() => setStatusFilter('confirmed')}>Confirmed</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Doctor</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500">Loading...</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500">No appointments found</td></tr>
              ) : (
                data?.data.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{apt.patientName}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium">Dr. {apt.doctorName}</div>
                      <div className="text-xs text-slate-500">{apt.doctorSpecialization}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{apt.date} at {apt.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {apt.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => handleConfirm(apt.id)}
                          disabled={confirmMutation.isPending}
                        >
                          <Check className="w-3 h-3 mr-1" /> Confirm
                        </Button>
                      )}
                      {(apt.status === 'pending' || apt.status === 'confirmed') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleCancel(apt.id)}
                          disabled={cancelMutation.isPending}
                        >
                          <X className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
