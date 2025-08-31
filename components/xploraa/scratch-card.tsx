"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Gift, Coffee, ShoppingBag, Trophy } from "lucide-react"

const PRIZES = [
  { text: "100 XP", points: 100, icon: "⭐", color: "text-yellow-600", bg: "bg-yellow-50" },
  { text: "Coffee 20% OFF", points: 0, coupon: "20% OFF Coffee", icon: "☕", color: "text-amber-600", bg: "bg-amber-50" },
  { text: "150 XP", points: 150, icon: "💫", color: "text-purple-600", bg: "bg-purple-50" },
  { text: "Mall 15% OFF", points: 0, coupon: "15% OFF Shopping", icon: "🛍️", color: "text-pink-600", bg: "bg-pink-50" },
  { text: "200 XP Bonus", points: 200, icon: "🎉", color: "text-green-600", bg: "bg-green-50" },
]

interface ScratchCardProps {
  onReveal?: (prize: { points: number; coupon?: string; text: string }) => void
}

export default function ScratchCard({ onReveal }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [revealed, setRevealed] = useState(false)
  const [scratchStarted, setScratchStarted] = useState(false)
  const [currentPrize, setCurrentPrize] = useState(() => 
    PRIZES[Math.floor(Math.random() * PRIZES.length)]
  )
  const [showWin, setShowWin] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * 2 // Higher resolution
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)
    
    // Create gradient scratch surface
    const gradient = ctx.createLinearGradient(0, 0, canvas.width/2, canvas.height/2)
    gradient.addColorStop(0, "#C4B5FD")
    gradient.addColorStop(0.5, "#A78BFA") 
    gradient.addColorStop(1, "#8B5CF6")
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width/2, canvas.height/2)
    
    // Add scratch text with better styling
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("🪄 Scratch to reveal", canvas.width/4, canvas.height/4 - 10)
    ctx.font = "12px sans-serif"
    ctx.fillText("your mystery prize!", canvas.width/4, canvas.height/4 + 8)
    
    // Add sparkle effect
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * (canvas.width/2)
      const y = Math.random() * (canvas.height/2)
      ctx.beginPath()
      ctx.arc(x, y, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [])

  function scratch(e: React.PointerEvent<HTMLCanvasElement>) {
    if (revealed) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * 2 // Account for scale
    const y = (e.clientY - rect.top) * 2
    
    if (!scratchStarted) {
      setScratchStarted(true)
    }
    
    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath()
    ctx.arc(x, y, 30, 0, Math.PI * 2) // Larger scratch area
    ctx.fill()
    
    checkReveal()
  }

  function checkReveal() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let cleared = 0
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) cleared++
    }
    const ratio = cleared / (pixels.length / 4)
    
    if (ratio > 0.4 && !revealed) { // Lower threshold for better UX
      setRevealed(true)
      setShowWin(true)
      
      onReveal?.({
        points: currentPrize.points,
        coupon: currentPrize.coupon,
        text: currentPrize.text
      })
      
      setTimeout(() => setShowWin(false), 3000)
    }
  }

  function resetCard() {
    setRevealed(false)
    setScratchStarted(false)
    setCurrentPrize(PRIZES[Math.floor(Math.random() * PRIZES.length)])
    
    // Redraw canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Recreate the scratch surface
      const gradient = ctx.createLinearGradient(0, 0, canvas.width/2, canvas.height/2)
      gradient.addColorStop(0, "#C4B5FD")
      gradient.addColorStop(0.5, "#A78BFA") 
      gradient.addColorStop(1, "#8B5CF6")
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width/2, canvas.height/2)
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("🪄 Scratch to reveal", canvas.width/4, canvas.height/4 - 10)
      ctx.font = "12px sans-serif"
      ctx.fillText("your mystery prize!", canvas.width/4, canvas.height/4 + 8)
    }
  }

  return (
    <div className="relative">
      <div className={`rounded-2xl border-2 shadow-lg p-4 transition-all ${
        scratchStarted ? "border-purple-300 shadow-purple-200" : "border-gray-200"
      }`}>
        <div className={`relative h-32 rounded-xl flex items-center justify-center overflow-hidden ${currentPrize.bg}`}>
          {/* Prize underneath */}
          <motion.div 
            className="text-center"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: revealed ? 1.1 : 0.8, opacity: revealed ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-3xl mb-2">{currentPrize.icon}</div>
            <p className={`text-lg font-bold ${currentPrize.color}`}>{currentPrize.text}</p>
            {currentPrize.coupon && (
              <p className="text-xs text-gray-600 mt-1">🎟️ {currentPrize.coupon}</p>
            )}
          </motion.div>
          
          {/* Scratch canvas overlay */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full touch-none rounded-xl cursor-pointer ${
              revealed ? "pointer-events-none" : ""
            }`}
            onPointerDown={scratch}
            onPointerMove={(e) => e.buttons === 1 && scratch(e)}
            style={{ width: '100%', height: '100%' }}
          />
          
          {/* Scratch animation effects */}
          {scratchStarted && !revealed && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="absolute top-2 right-2 text-white text-xs bg-white/20 rounded-full px-2 py-1">
                Keep scratching! 🪄
              </div>
            </motion.div>
          )}
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {revealed ? "🎉 Prize revealed!" : "Scratch at least 40% to claim"}
          </p>
          {revealed && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={resetCard}
              className="text-xs"
            >
              🔄 New Card
            </Button>
          )}
        </div>
      </div>

      {/* Win Animation */}
      <AnimatePresence>
        {showWin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl"
          >
            <Card className={`${currentPrize.bg} border-2 shadow-2xl`}>
              <CardContent className="p-6 text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: 1
                  }}
                  className="text-4xl mb-3"
                >
                  {currentPrize.icon}
                </motion.div>
                
                <h3 className="text-xl font-bold mb-2 text-gray-800">🎊 Congratulations!</h3>
                <p className={`text-lg font-bold ${currentPrize.color} mb-3`}>{currentPrize.text}</p>
                
                {currentPrize.points > 0 && (
                  <div className="flex items-center justify-center gap-2 bg-white/50 rounded-lg px-4 py-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-gray-800">+{currentPrize.points} XP Added!</span>
                  </div>
                )}
                
                {currentPrize.coupon && (
                  <div className="bg-white/50 rounded-lg px-4 py-2">
                    <span className="text-sm font-medium text-gray-800">🎟️ {currentPrize.coupon}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
