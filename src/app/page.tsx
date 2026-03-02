import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0A0A0A] rounded-lg" />
          <span className="font-semibold text-[#0A0A0A] text-lg">Spreadfilms Casting</span>
        </div>
        <Link
          href="/admin/login"
          className="text-sm text-[#737373] hover:text-[#0A0A0A] transition-colors duration-200"
        >
          Admin →
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#737373]">
            Casting Platform
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-[#0A0A0A] leading-tight tracking-tight">
            Your SetCard.
            <br />
            <span className="text-[#737373]">Professional.</span>
          </h1>
          <p className="text-lg text-[#737373] max-w-lg mx-auto leading-relaxed">
            Create your digital profile for casting inquiries at Spreadfilms.
            Fast, easy and professional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/neu"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#0A0A0A] text-white font-medium rounded-xl hover:opacity-90 transition-opacity duration-200 text-base"
            >
              Create SetCard
            </Link>
            <Link
              href="/update"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#0A0A0A] font-medium rounded-xl border border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors duration-200 text-base"
            >
              Update SetCard
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16 border-t border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "✦", title: "5 simple steps", description: "Guided form – from personal details to your photos." },
            { icon: "◎", title: "Live preview", description: "See your SetCard in real time as you fill it in." },
            { icon: "⟳", title: "Update anytime", description: "PIN-secured access – update your profile whenever you want." }
          ].map((f) => (
            <div key={f.title} className="space-y-3">
              <div className="w-10 h-10 flex items-center justify-center text-xl">{f.icon}</div>
              <h3 className="font-semibold text-[#0A0A0A]">{f.title}</h3>
              <p className="text-sm text-[#737373] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-[#E5E5E5] text-center">
        <p className="text-xs text-[#737373]">© 2025 Spreadfilms. All rights reserved.</p>
      </footer>
    </main>
  );
}
