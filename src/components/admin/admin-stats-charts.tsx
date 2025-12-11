import { useMemo } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

interface AdminStatsChartsProps {
  newsData?: ChartData[]
  eventsData?: ChartData[]
  releasesData?: ChartData[]
  videosData?: ChartData[]
  className?: string
}

const COLORS = ["#00F9FF", "#00D9E6", "#0099CC", "#006699", "#003366"]

export function AdminStatsCharts({
  newsData = [],
  eventsData = [],
  releasesData = [],
  videosData = [],
  className = "",
}: AdminStatsChartsProps) {
  const combinedData = useMemo(() => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    return months.map((month, index) => ({
      name: month,
      Noticias: newsData[index]?.value || 0,
      Eventos: eventsData[index]?.value || 0,
      Lanzamientos: releasesData[index]?.value || 0,
      Videos: videosData[index]?.value || 0,
    }))
  }, [newsData, eventsData, releasesData, videosData])

  const pieData = useMemo(() => {
    const totalNews = newsData.reduce((sum, d) => sum + d.value, 0)
    const totalEvents = eventsData.reduce((sum, d) => sum + d.value, 0)
    const totalReleases = releasesData.reduce((sum, d) => sum + d.value, 0)
    const totalVideos = videosData.reduce((sum, d) => sum + d.value, 0)

    return [
      { name: "Noticias", value: totalNews },
      { name: "Eventos", value: totalEvents },
      { name: "Lanzamientos", value: totalReleases },
      { name: "Videos", value: totalVideos },
    ].filter(item => item.value > 0)
  }, [newsData, eventsData, releasesData, videosData])

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Bar Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Contenido por Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  color: "#F3F4F6",
                }}
              />
              <Legend wrapperStyle={{ color: "#F3F4F6" }} />
              <Bar dataKey="Noticias" fill="#00F9FF" />
              <Bar dataKey="Eventos" fill="#00D9E6" />
              <Bar dataKey="Lanzamientos" fill="#0099CC" />
              <Bar dataKey="Videos" fill="#006699" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Line Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Tendencia de Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  color: "#F3F4F6",
                }}
              />
              <Legend wrapperStyle={{ color: "#F3F4F6" }} />
              <Line type="monotone" dataKey="Noticias" stroke="#00F9FF" strokeWidth={2} />
              <Line type="monotone" dataKey="Eventos" stroke="#00D9E6" strokeWidth={2} />
              <Line type="monotone" dataKey="Lanzamientos" stroke="#0099CC" strokeWidth={2} />
              <Line type="monotone" dataKey="Videos" stroke="#006699" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Distribución de Contenido</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    color: "#F3F4F6",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

