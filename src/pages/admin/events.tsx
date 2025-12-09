import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TABLES } from "@/constants/tables";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Plus, Edit, Trash2, Eye, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import type { Event } from "@/types";

export default function AdminEventsPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; eventId: string | null }>({
    open: false,
    eventId: null,
  });
  const [syncingRA, setSyncingRA] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data, error } = await supabase
      .from(TABLES.EVENTS)
      .select("*")
      .order("event_date", { ascending: false });
    if (error) {
      console.error("Error fetching events:", error);
    } else {
      // Calculate status and map image_url
      const eventsWithStatus = (data || []).map((event: any) => ({
        ...event,
        status: new Date(event.event_date) > new Date() ? "upcoming" : "past",
        cover_image: event.image_url // Map image_url to cover_image if needed, or just use image_url
      }));
      setEvents(eventsWithStatus);
    }
    setLoading(false);
  }

  async function deleteEvent(id: string) {
    setDeleteConfirm({ open: true, eventId: id });
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm.eventId) return;
    
    const { error } = await supabase.from(TABLES.EVENTS).delete().eq("id", deleteConfirm.eventId);
    if (error) {
      console.error("Error deleting event:", error);
      toast.error("Error al eliminar el evento", {
        description: error.message || "No se pudo eliminar el evento.",
      });
    } else {
      setEvents(events.filter((e) => e.id !== deleteConfirm.eventId));
      toast.success("Evento eliminado correctamente");
    }
    setDeleteConfirm({ open: false, eventId: null });
  }

  async function toggleFeatured(event: Event) {
    const { error } = await supabase
      .from(TABLES.EVENTS)
      .update({ featured: !event.featured })
      .eq("id", event.id);
    if (error) {
      console.error("Error toggling featured:", error);
      toast.error("Error al actualizar featured", {
        description: error.message || "No se pudo actualizar el estado.",
      });
    } else {
      setEvents(
        events.map((e) =>
          e.id === event.id ? { ...e, featured: !e.featured } : e
        )
      );
      toast.success(`Evento ${!event.featured ? "destacado" : "removido de destacados"}`);
    }
  }

  async function toggleHeaderFeatured(event: Event) {
    const { error } = await supabase
      .from(TABLES.EVENTS)
      .update({ header_featured: !event.header_featured })
      .eq("id", event.id);
    if (error) {
      console.error("Error toggling header featured:", error);
      toast.error("Error al actualizar evento a cabecera", {
        description: error.message || "No se pudo actualizar el estado.",
      });
    } else {
      setEvents(
        events.map((e) =>
          e.id === event.id ? { ...e, header_featured: !e.header_featured } : e
        )
      );
      toast.success(`Evento ${!event.header_featured ? "añadido a" : "removido de"} cabecera`);
    }
  }

  async function syncWithResidentAdvisor() {
    setSyncingRA(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Debes estar autenticado para sincronizar");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-ra-events-stealth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Sincronización completada: ${result.totalCreated} creados, ${result.totalUpdated} actualizados`);
        await fetchEvents(); // Refrescar la lista
      } else {
        toast.error("Error en la sincronización", {
          description: result.errors?.join(', ') || "Error desconocido",
        });
      }
    } catch (error) {
      console.error("Error syncing with RA:", error);
      toast.error("Error al sincronizar con Resident Advisor", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setSyncingRA(false);
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center text-zinc-400">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full px-4 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-white" />
          <h1 className="text-3xl font-bold text-white">{t("cms.manageEvents")}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={syncWithResidentAdvisor}
            disabled={syncingRA}
            className="bg-[#00D9E6] text-black hover:bg-[#00F9FF] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncingRA ? 'animate-spin' : ''}`} />
            {syncingRA ? 'Sincronizando...' : 'Sincronizar con RA'}
          </Button>
          <Button asChild className="bg-[#00F9FF] text-black hover:bg-[#00D9E6]">
            <Link to="/admin/events/new">
              <Plus className="h-4 w-4 mr-2" />
              {t("cms.createEvent")}
            </Link>
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white">{t("cms.filters")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder={t("cms.searchEvents")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "upcoming", "past", "cancelled"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={
                    statusFilter === status
                      ? "bg-[#00F9FF] text-black hover:bg-[#00D9E6]"
                      : "border-zinc-700 text-white hover:bg-zinc-800 bg-transparent"
                  }
                >
                  {status === "all" ? t("cms.all") : status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-zinc-900 border border-zinc-800 rounded-none overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[800px]">
            <thead className="bg-zinc-800">
              <tr>
                <th className="text-left p-4 text-zinc-400 font-medium">{t("cms.cover")}</th>
                <th className="text-left p-4 text-zinc-400 font-medium">{t("cms.title")}</th>
                <th className="text-left p-4 text-zinc-400 font-medium">{t("cms.location")}</th>
                <th className="text-left p-4 text-zinc-400 font-medium">{t("cms.date")}</th>
                <th className="text-left p-4 text-zinc-400 font-medium">{t("cms.status")}</th>
                <th className="text-left p-4 text-zinc-400 font-medium">{t("cms.featured")}</th>
                <th className="text-left p-4 text-zinc-400 font-medium">Cabecera</th>
                <th className="text-right p-4 text-zinc-400 font-medium">{t("cms.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4">
                    <img
                      src={event.cover_image || "/placeholder.svg?height=60&width=60"}
                      alt={event.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{event.title}</div>
                    <div className="text-sm text-zinc-500">/{event.slug}</div>
                  </td>
                  <td className="p-4 text-zinc-300">
                    {event.city}, {event.country}
                  </td>
                  <td className="p-4 text-zinc-300">
                    {format(new Date(event.event_date), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        event.status === "upcoming"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : event.status === "past"
                            ? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                      }
                    >
                      {event.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={event.featured ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}
                    >
                      {event.featured ? t("cms.yes") : t("cms.no")}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2 text-zinc-400 hover:text-white"
                      onClick={() => toggleFeatured(event)}
                    >
                      {event.featured ? t("cms.unfeature") : t("cms.feature")}
                    </Button>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={(event as any).header_featured ? "bg-[#00F9FF]/20 text-[#00F9FF] border-[#00F9FF]/50" : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}
                    >
                      {(event as any).header_featured ? "Sí" : "No"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2 text-zinc-400 hover:text-[#00F9FF]"
                      onClick={() => toggleHeaderFeatured(event)}
                      title="Evento a cabecera (aparece en el carrusel de eventos recomendados)"
                    >
                      {(event as any).header_featured ? "Quitar" : "Añadir"}
                    </Button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" asChild>
                        <Link to={`/events/${event.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" asChild>
                        <Link to={`/admin/events/edit/${event.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">{t("cms.noEventsFound")}</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, eventId: deleteConfirm.eventId })}
        title="Eliminar Evento"
        description="¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer."
        onConfirm={handleDeleteConfirm}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
      </div>
    </div>
  );
}
