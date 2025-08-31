"use client"

export function BadgesShowcase() {
  const badges = [
    { name: "City Explorer", color: "bg-teal-600 text-white" },
    { name: "Santa’s Helper", color: "bg-amber-300 text-amber-900" },
    { name: "Diwali Dazzler", color: "bg-amber-200 text-amber-900" },
    { name: "Green Walker", color: "bg-teal-100 text-teal-900" },
  ]
  return (
    <section className="rounded-2xl border shadow-sm p-4">
      <h3 className="font-semibold mb-2">Digital Collectibles</h3>
      <div className="flex flex-wrap gap-2">
        {badges.map((b) => (
          <span key={b.name} className={`px-3 py-1 rounded-full text-xs font-medium ${b.color}`}>
            {b.name}
          </span>
        ))}
      </div>
    </section>
  )
}
