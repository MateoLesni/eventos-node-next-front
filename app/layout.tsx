import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { ChatbotButton } from "@/components/chatbot-button"

export const metadata: Metadata = {
  title: "CRM Data Visualization",
  description: "Sistema de gestión de clientes",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <Navbar />
        {children}
        <ChatbotButton />
      </body>
    </html>
  )
}
