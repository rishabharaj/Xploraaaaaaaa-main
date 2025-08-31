import type { Metadata } from "next"
import XploraaAppShell from "@/components/xploraa/app-shell"

export const metadata: Metadata = {
  title: "Xploraa — Explore. Play. Earn.",
  description: "Gamified city exploration with AR coins, challenges, and rewards.",
}

export default function Page() {
  // Scope dark theme to this page so we don't change the rest of the app
  return (
    <div className="dark min-h-screen">
      <XploraaAppShell />
    </div>
  )
}
