"use client"
import { useState, useEffect } from "react"
import { Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import WelcomePage from "@/components/welcome-page"
import MainScreen from "@/components/main-screen"
import { supabase } from "@/lib/supabaseClient"

export default function VoiceToNotesApp() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://voxcribe-b9fs.vercel.app/auth/callback"
        }
      })
    } catch (error) {
      console.error("Google login error:", error)
      setIsGoogleLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
            : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100",
        )}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto animate-pulse">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <p className={cn("text-lg", isDarkMode ? "text-gray-300" : "text-gray-700")}>Loading VOXCRIBE...</p>
            <p className={cn("text-sm", isDarkMode ? "text-gray-500" : "text-gray-600")}>
              Verifying authentication
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <WelcomePage
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onGoogleLogin={handleGoogleLogin}
        isGoogleLoading={isGoogleLoading}
      />
    )
  }

  return (
    <MainScreen 
      user={user} 
      isDarkMode={isDarkMode} 
      toggleTheme={toggleTheme} 
      onLogout={handleLogout} 
    />
  )
}
