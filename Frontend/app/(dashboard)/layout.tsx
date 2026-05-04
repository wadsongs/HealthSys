import { RequireAuth } from "@/components/auth/require-auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { RealtimeNotificationsProvider } from "@/components/providers/realtime-notifications-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth>
      <RealtimeNotificationsProvider>
        <div className="min-h-screen flex bg-background">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col lg:ml-64">
            <DashboardHeader />
            <main className="flex-1 p-4 lg:p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </RealtimeNotificationsProvider>
    </RequireAuth>
  )
}
