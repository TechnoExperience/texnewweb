import { ProfileForm } from "@/components/profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PromoterDashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
            <div className="w-full px-4 py-8 ">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Perfil de Promotor</CardTitle>
                    </CardHeader>
                </Card>
                <ProfileForm profileType="promoter" />
            </div>
        </div>
    )
}
