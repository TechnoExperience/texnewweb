import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Filter, 
  X, 
  Calendar, 
  User, 
  Tag, 
  MapPin, 
  Music,
  Search,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { format, subDays, subMonths, subYears } from "date-fns"

export interface AdvancedFiltersProps {
  type: "news" | "events" | "releases" | "videos" | "reviews"
  onFilterChange: (filters: FilterState) => void
  availableAuthors?: string[]
  availableTags?: string[]
  availableLocations?: string[]
  availableArtists?: string[]
  availableLabels?: string[]
  className?: string
}

export interface FilterState {
  search: string
  dateFrom?: string
  dateTo?: string
  authors?: string[]
  tags?: string[]
  locations?: string[]
  artists?: string[]
  labels?: string[]
  datePreset?: "today" | "week" | "month" | "year" | "all"
}

export function AdvancedFilters({
  type,
  onFilterChange,
  availableAuthors = [],
  availableTags = [],
  availableLocations = [],
  availableArtists = [],
  availableLabels = [],
  className = "",
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    datePreset: "all",
  })

  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedArtists, setSelectedArtists] = useState<string[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const handleDatePreset = (preset: FilterState["datePreset"]) => {
    let dateFrom: string | undefined
    const dateTo = new Date().toISOString()

    switch (preset) {
      case "today":
        dateFrom = new Date().toISOString()
        break
      case "week":
        dateFrom = subDays(new Date(), 7).toISOString()
        break
      case "month":
        dateFrom = subMonths(new Date(), 1).toISOString()
        break
      case "year":
        dateFrom = subYears(new Date(), 1).toISOString()
        break
      case "all":
        dateFrom = undefined
        break
    }

    handleFilterChange({ datePreset: preset, dateFrom, dateTo })
  }

  const toggleAuthor = (author: string) => {
    const newAuthors = selectedAuthors.includes(author)
      ? selectedAuthors.filter(a => a !== author)
      : [...selectedAuthors, author]
    setSelectedAuthors(newAuthors)
    handleFilterChange({ authors: newAuthors })
  }

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(newTags)
    handleFilterChange({ tags: newTags })
  }

  const toggleLocation = (location: string) => {
    const newLocations = selectedLocations.includes(location)
      ? selectedLocations.filter(l => l !== location)
      : [...selectedLocations, location]
    setSelectedLocations(newLocations)
    handleFilterChange({ locations: newLocations })
  }

  const toggleArtist = (artist: string) => {
    const newArtists = selectedArtists.includes(artist)
      ? selectedArtists.filter(a => a !== artist)
      : [...selectedArtists, artist]
    setSelectedArtists(newArtists)
    handleFilterChange({ artists: newArtists })
  }

  const toggleLabel = (label: string) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label]
    setSelectedLabels(newLabels)
    handleFilterChange({ labels: newLabels })
  }

  const clearFilters = () => {
    setFilters({ search: "", datePreset: "all" })
    setSelectedAuthors([])
    setSelectedTags([])
    setSelectedLocations([])
    setSelectedArtists([])
    setSelectedLabels([])
    onFilterChange({ search: "", datePreset: "all" })
  }

  const activeFiltersCount = 
    (filters.search ? 1 : 0) +
    (filters.datePreset !== "all" ? 1 : 0) +
    selectedAuthors.length +
    selectedTags.length +
    selectedLocations.length +
    selectedArtists.length +
    selectedLabels.length

  return (
    <div className={className}>
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros Avanzados
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-[#00F9FF] text-black">
              {activeFiltersCount}
            </Badge>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-white/60 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 mb-6">
          <CardContent className="p-6 space-y-6">
            {/* Search */}
            <div>
              <label className="block text-white/70 text-sm mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Búsqueda
              </label>
              <Input
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                placeholder="Buscar por título, descripción..."
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            {/* Date Presets */}
            <div>
              <label className="block text-white/70 text-sm mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Período
              </label>
              <div className="flex flex-wrap gap-2">
                {(["all", "today", "week", "month", "year"] as const).map((preset) => (
                  <Button
                    key={preset}
                    variant={filters.datePreset === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDatePreset(preset)}
                    className={
                      filters.datePreset === preset
                        ? "bg-[#00F9FF] text-black"
                        : "border-white/20 text-white hover:bg-white/10"
                    }
                  >
                    {preset === "all" && "Todos"}
                    {preset === "today" && "Hoy"}
                    {preset === "week" && "Esta semana"}
                    {preset === "month" && "Este mes"}
                    {preset === "year" && "Este año"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Desde</label>
                <Input
                  type="date"
                  value={filters.dateFrom?.split("T")[0] || ""}
                  onChange={(e) => handleFilterChange({ dateFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Hasta</label>
                <Input
                  type="date"
                  value={filters.dateTo?.split("T")[0] || ""}
                  onChange={(e) => handleFilterChange({ dateTo: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            {/* Authors (for news) */}
            {type === "news" && availableAuthors.length > 0 && (
              <div>
                <label className="block text-white/70 text-sm mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Autores
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableAuthors.map((author) => (
                    <Badge
                      key={author}
                      onClick={() => toggleAuthor(author)}
                      className={`cursor-pointer transition-colors ${
                        selectedAuthors.includes(author)
                          ? "bg-[#00F9FF] text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {author}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags (for news) */}
            {type === "news" && availableTags.length > 0 && (
              <div>
                <label className="block text-white/70 text-sm mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Etiquetas
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`cursor-pointer transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-[#00F9FF] text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Locations (for events) */}
            {type === "events" && availableLocations.length > 0 && (
              <div>
                <label className="block text-white/70 text-sm mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ubicaciones
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableLocations.map((location) => (
                    <Badge
                      key={location}
                      onClick={() => toggleLocation(location)}
                      className={`cursor-pointer transition-colors ${
                        selectedLocations.includes(location)
                          ? "bg-[#00F9FF] text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Artists (for releases) */}
            {type === "releases" && availableArtists.length > 0 && (
              <div>
                <label className="block text-white/70 text-sm mb-2 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Artistas
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableArtists.map((artist) => (
                    <Badge
                      key={artist}
                      onClick={() => toggleArtist(artist)}
                      className={`cursor-pointer transition-colors ${
                        selectedArtists.includes(artist)
                          ? "bg-[#00F9FF] text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {artist}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Labels (for releases) */}
            {type === "releases" && availableLabels.length > 0 && (
              <div>
                <label className="block text-white/70 text-sm mb-2 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Sellos
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableLabels.map((label) => (
                    <Badge
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={`cursor-pointer transition-colors ${
                        selectedLabels.includes(label)
                          ? "bg-[#00F9FF] text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

