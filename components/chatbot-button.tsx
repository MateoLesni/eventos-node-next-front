"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => {
    if (!isOpen) {
      window.open(
        "https://vps-5138181-x.dattaweb.com/webhook/9f7d179d-26f8-4dc8-a38a-84487635c9ae/chat",
        "Bot NG",
        "width=400,height=600,resizable=yes,scrollbars=yes",
      )
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        size="lg"
        className="size-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-slate-700 hover:bg-slate-800 text-white"
        aria-label="Abrir Bot NG"
      >
        <MessageCircle className="size-6" />
      </Button>
      <div className="absolute -top-10 right-0 bg-slate-700 text-white px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        Bot NG
      </div>
    </div>
  )
}
