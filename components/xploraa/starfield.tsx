"use client"

import { useEffect, useRef } from "react"

export default function Starfield({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId = 0
    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
      init()
    }
    const stars: { x: number; y: number; z: number; r: number; s: number }[] = []
    function init() {
      stars.length = 0
      const count = Math.floor((width * height) / 12000)
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 0.6 + 0.4, // depth
          r: Math.random() * 1.4 + 0.4,
          s: Math.random() * 0.6 + 0.2, // speed
        })
      }
    }
    function tick() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)
      for (const st of stars) {
        st.y += st.s
        if (st.y > height) st.y = -2
        const alpha = 0.5 + 0.5 * Math.sin((st.y + st.x) * 0.01)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.beginPath()
        ctx.arc(st.x, st.y, st.r * st.z, 0, Math.PI * 2)
        ctx.fill()
      }
      animationId = requestAnimationFrame(tick)
    }

    init()
    animationId = requestAnimationFrame(tick)
    window.addEventListener("resize", handleResize)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={ref} className={className} />
}
