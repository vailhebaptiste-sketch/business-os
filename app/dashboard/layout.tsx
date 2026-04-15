import { Sidebar, BottomNav } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { StoreProvider } from '@/lib/store'
import { SettingsProvider } from '@/lib/settings-store'
import { AiAssistant } from '@/components/ai/AiAssistant'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StoreProvider>
    <SettingsProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          {/* pb-24 mobile = espace pour la bottom nav */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
      {/* Assistant IA flottant */}
      <AiAssistant />
    </SettingsProvider>
    </StoreProvider>
  )
}
