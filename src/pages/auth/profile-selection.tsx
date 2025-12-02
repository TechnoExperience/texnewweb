import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import {
    Music,
    Users,
    PartyPopper,
    Disc,
    Building2,
    CheckCircle2
} from "lucide-react"

const PROFILE_TYPES = [
    {
        id: 'clubber',
        title: 'Clubber',
        description: 'Discover events, buy tickets, and follow your favorite artists.',
        icon: Users,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'dj',
        title: 'DJ / Artist',
        description: 'Manage your profile, upload sets, and connect with promoters.',
        icon: Music,
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'promoter',
        title: 'Promoter',
        description: 'Create events, manage ticket sales, and reach more clubbers.',
        icon: PartyPopper,
        color: 'from-orange-500 to-red-500'
    },
    {
        id: 'label',
        title: 'Record Label',
        description: 'Showcase releases, manage artists, and grow your audience.',
        icon: Disc,
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 'club',
        title: 'Club / Venue',
        description: 'Manage your venue profile, events, and community.',
        icon: Building2,
        color: 'from-indigo-500 to-violet-500'
    }
]

export default function ProfileSelectionPage() {
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            navigate('/auth/login')
        }
    }, [user, loading, navigate])

    const handleSelect = async () => {
        if (!selectedType || !user) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ profile_type: selectedType })
                .eq('id', user.id)

            if (error) throw error

            toast.success("Profile updated successfully!")

            // Redirect based on selection
            switch (selectedType) {
                case 'clubber':
                    navigate('/profile/clubber')
                    break
                case 'dj':
                    navigate('/profile/dj')
                    break
                case 'promoter':
                    navigate('/profile/promoter')
                    break
                case 'label':
                    navigate('/profile/label')
                    break
                case 'club':
                    navigate('/profile/club')
                    break
                default:
                    navigate('/')
            }
        } catch (error: any) {
            console.error('Error updating profile:', error)
            toast.error(error.message || "Failed to update profile")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <LoadingSpinner />

    return (
        <div className="min-h-screen bg-[#050315] flex items-center justify-center p-4">
            <div className="max-w-5xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-white"
                    >
                        Choose Your Persona
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 text-lg max-w-2xl mx-auto"
                    >
                        Select the profile type that best describes you to customize your experience on Techno Experience.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PROFILE_TYPES.map((type, index) => {
                        const Icon = type.icon
                        const isSelected = selectedType === type.id

                        return (
                            <motion.div
                                key={type.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className={`relative p-6 cursor-pointer transition-all duration-300 border-2 h-full flex flex-col
                    ${isSelected
                                            ? 'border-purple-500 bg-white/10'
                                            : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                    onClick={() => setSelectedType(type.id)}
                                >
                                    {isSelected && (
                                        <div className="absolute top-4 right-4 text-purple-500">
                                            <CheckCircle2 size={24} />
                                        </div>
                                    )}

                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                                        <Icon className="text-white" size={24} />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2">{type.title}</h3>
                                    <p className="text-gray-400 flex-grow">{type.description}</p>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center pt-8"
                >
                    <Button
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-6 text-lg rounded-full"
                        disabled={!selectedType || isSubmitting}
                        onClick={handleSelect}
                    >
                        {isSubmitting ? <LoadingSpinner /> : "Continue"}
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}
