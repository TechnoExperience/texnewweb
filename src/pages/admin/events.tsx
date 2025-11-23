"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { Link } from "react-router-dom"
import { format } from "date-fns"

interface Event {
  id: string
  title: string
  slug: string
  city: string
  country: string
  event_date: string
  status: string
  cover_image: string
}

export default function AdminEventsPage() {
  const { t } = useTranslation()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const query = supabase
      .from("events")
      .select("id, title, slug, city, country, event_date, status, cover_image")
      .order("event_date", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error("Error fetching events:", error)
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }

  async function deleteEvent(id: string) {
    if (!confirm(t("cms.confirmDelete"))) return

    const { error } = await supabase.from("events").delete().eq("id", id)

    if (error) {
      console.error("Error deleting event:", error)
      alert("Error al eliminar el evento")
    } else {
      setEvents(events.filter((event) => event.id !== id))
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">{t("common.loading")}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-white" />
          <h1 className="text-3xl font-bold text-white">{t("cms.manageEvents")}</h1>
        </div>
        <Button asChild className="bg-white text-black hover:bg-zinc-200">
          <Link to="/admin/events/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("cms.createEvent")}
          </Link>
        </Button>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white">{t("cms.filters")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
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
            <div className="flex gap-2">
              {["all", "upcoming", "past", "cancelled"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={
                    statusFilter === status
                      ? "bg-white text-black hover:bg-zinc-200"
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

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="text-left p-4 text-zinc-400 font-medium">{t("cms.cover")}</th>
                <th className="text-left p-4 text-zinc-400 font-medium">{t("cms.title")}</th>
                <th className="text-left p-4 text-zinc-400 font-medium">{t("cms.location")}</th>
                <th className="text-left p-4 text-zinc-400 font-medium">{t("cms.date")}</th>
                <th className="text-left p-4 text-zinc-400 font-medium">{t("cms.status")}</th>
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
                  <td className="p-4 text-zinc-300">{format(new Date(event.event_date), "dd/MM/yyyy HH:mm")}</td>
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
    </div>
  )
}
