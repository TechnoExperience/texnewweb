import { ProfileForm } from "@/components/profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DJDashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Perfil de DJ</CardTitle>
                    </CardHeader>
                </Card>
                <ProfileForm profileType="dj" />
            </div>
        </div>
    )
}
