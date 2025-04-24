import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/lib/context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "RPG Fast",
  description: "A web app for RPG games",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
