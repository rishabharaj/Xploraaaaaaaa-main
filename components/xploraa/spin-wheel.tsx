"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, Star, Zap, Coffee } from "lucide-react"

const SEGMENTS = [
  { label: "50 XP", points: 50, color: "#FDE68A", icon: "⭐" },
  { label: "100 XP", points: 100, color: "#BBF7D0", icon: "💫" },
  { label: "Coffee 15% OFF", points: 0, coupon: "15% OFF Coffee", color: "#FECACA", icon: "☕" },
  { label: "Try Again", points: 0, color: "#E5E7EB", icon: "🔄" },
  { label: "200 XP", points: 200, color: "#99F6E4", icon: "⚡" },
  { label: "JACKPOT!", points: 500, color: "#34D399", icon: "🎉" },
]

interface SpinWheelProps {
  onReward?: (reward: { points: number; coupon?: string; label: string }) => void
}

export default function SpinWheel({ onReward }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false)
  const [angle, setAngle] = useState(0)
  const [lastWin, setLastWin] = useState<any>(null)
  const [showWin, setShowWin] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)

  function spin() {
    if (spinning) return
    
    const segmentAngle = 360 / SEGMENTS.length
    const randomSegment = Math.floor(Math.random() * SEGMENTS.length)
    const targetAngle = (randomSegment * segmentAngle) + (segmentAngle / 2)
    const turns = 6 + Math.random() * 4
    const final = angle + (turns * 360) + targetAngle
    
    setSpinning(true)
    setAngle(final)
    
    setTimeout(() => {
      setSpinning(false)
      const winner = SEGMENTS[randomSegment]
      setLastWin(winner)
      setShowWin(true)
      
      onReward?.({
        points: winner.points,
        coupon: winner.coupon,
        label: winner.label
      })
      
      setTimeout(() => setShowWin(false), 3000)
    }, 3000)
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="relative h-48 w-48">
        {/* Wheel */}
        <div
          ref={wheelRef}
          className="absolute inset-0 rounded-full border-4 border-white shadow-2xl overflow-hidden"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: spinning ? "transform 3s cubic-bezier(0.22, 0.61, 0.36, 1)" : "none",
          }}
        >
          {SEGMENTS.map((segment, i) => {
            const segmentAngle = 360 / SEGMENTS.length
            const rotation = i * segmentAngle
            
            return (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                style={{
                  background: segment.color,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.cos((segmentAngle * Math.PI) / 180)}%)`,
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                <div 
                  className="flex flex-col items-center justify-center h-full"
                  style={{ transform: `rotate(${segmentAngle / 2}deg) translateY(-60px)` }}
                >
                  <span className="text-lg">{segment.icon}</span>
                  <span className="text-[10px] font-bold text-gray-800 whitespace-nowrap">
                    {segment.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Center Hub */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <div className="text-center">
              <div className="text-white text-xs font-bold">SPIN</div>
            </div>
          </div>
        </div>
        
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-8 border-transparent border-b-red-500 shadow-lg z-10" />
        
        {/* Spinning Animation Effect */}
        {spinning && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-yellow-400"
            animate={{ 
              scale: [1, 1.1, 1], 
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              duration: 0.5, 
              repeat: Infinity 
            }}
          />
        )}
      </div>
      
      <Button 
        onClick={spin} 
        disabled={spinning}
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-8 py-2 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
      >
        {spinning ? (
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-4 h-4" />
            </motion.div>
            Spinning...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Spin to Win!
          </div>
        )}
      </Button>
      
      {/* Win Animation */}
      <AnimatePresence>
        {showWin && lastWin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg"
          >
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-white shadow-2xl">
              <CardContent className="p-6 text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 0.6,
                    repeat: 2
                  }}
                  className="text-4xl mb-3"
                >
                  {lastWin.icon}
                </motion.div>
                
                <h3 className="text-xl font-bold text-white mb-2">🎉 You Won!</h3>
                <p className="text-lg text-white font-bold mb-2">{lastWin.label}</p>
                
                {lastWin.points > 0 && (
                  <div className="flex items-center justify-center gap-2 bg-white/20 rounded-lg px-3 py-1">
                    <Star className="w-4 h-4 text-yellow-200" />
                    <span className="text-white font-bold">+{lastWin.points} XP</span>
                  </div>
                )}
                
                {lastWin.coupon && (
                  <div className="bg-white/20 rounded-lg px-3 py-1 mt-2">
                    <span className="text-white text-sm">🎟️ {lastWin.coupon}</span>
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
