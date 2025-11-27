export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold-50 to-white p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Test Page - Layout Works! ✅
        </h1>
        <p className="text-lg text-[#CCC]">
          If you can see this, the basic layout and routing is working.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="p-6 bg-[#0A0A0A] rounded-lg shadow-lg border border-gold-200">
            <h3 className="font-bold text-gold-600">Tailwind CSS</h3>
            <p className="text-sm text-[#CCC]">Styling works ✓</p>
          </div>
          <div className="p-6 bg-[#0A0A0A] rounded-lg shadow-lg border border-gold-200">
            <h3 className="font-bold text-gold-600">Next.js Routing</h3>
            <p className="text-sm text-[#CCC]">Routing works ✓</p>
          </div>
        </div>
      </div>
    </div>
  )
}
