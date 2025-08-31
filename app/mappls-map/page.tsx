"use client"

export default function MapplsMapPage() {
  return (
    <div className="w-full h-screen">
      <iframe 
        src="/mappls-map.html" 
        className="w-full h-full border-none"
        title="Mappls Interactive Map"
      />
    </div>
  )
}
