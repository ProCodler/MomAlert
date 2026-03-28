import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#F5F0EB' }}>
      {/* Hero */}
      <section
        className="relative overflow-hidden px-6 pt-16 pb-12 text-center"
        style={{
          background: 'linear-gradient(160deg, #B5451B 0%, #8B2D0F 55%, #1B4B8A 100%)',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'white' }}
        />
        <div
          className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'white' }}
        />

        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Claude Builder Hackathon 2026 · Ghana
          </div>

          <div className="text-7xl mb-4">🤱</div>

          <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
            MomAlert
          </h1>
          <p className="text-white/80 text-xl font-medium mb-2">
            AI Maternal Health Companion
          </p>
          <p className="text-white/60 text-sm italic mb-10">
            &ldquo;Because every mother deserves to know when danger is near.&rdquo;
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{ color: '#B5451B' }}
            >
              🇬🇧 Start in English
            </Link>
            <Link
              href="/chat?lang=tw"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm border border-white/30 text-white text-lg font-bold rounded-2xl hover:bg-white/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              🇬🇭 Jɔ mu — Twi
            </Link>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white/90 text-sm transition-colors underline underline-offset-4"
          >
            🏥 Health Worker Dashboard →
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-6 -mt-1">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 divide-x divide-white/40 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-4 py-5 text-center">
              <p className="text-3xl font-black" style={{ color: '#B5451B' }}>308</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">deaths per<br />100K births</p>
            </div>
            <div className="px-4 py-5 text-center">
              <p className="text-3xl font-black" style={{ color: '#1B4B8A' }}>3 in 4</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">deliver far<br />from a clinic</p>
            </div>
            <div className="px-4 py-5 text-center">
              <p className="text-3xl font-black" style={{ color: '#E8A020' }}>400+</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">patients per<br />CHW, no tools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem + Solution */}
      <section className="px-6 py-10 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400">The Problem</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            Warning signs go unrecognized — <span style={{ color: '#B5451B' }}>every day</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[
            { icon: '❌', text: 'Swollen feet and headaches dismissed as "normal"' },
            { icon: '❌', text: 'Medical jargon blocks health literacy at scale' },
            { icon: '❌', text: 'CHWs have zero AI decision-support tools' },
            { icon: '❌', text: '75% of women deliver far from any clinic' },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <p className="text-sm text-gray-700 leading-snug">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400">MomAlert Changes This</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            Instant triage. Plain language. <span style={{ color: '#1B4B8A' }}>Any language.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: '💬', title: 'Symptom Chat', desc: 'Describe symptoms in plain English or Twi — no medical jargon needed.' },
            { icon: '🚨', title: '4-Level Risk Triage', desc: 'LOW · MEDIUM · HIGH · CRITICAL with clear "go to clinic now" guidance.' },
            { icon: '🌍', title: 'English + Twi', desc: 'Fully bilingual with 12 pre-built symptom chips for low-literacy users.' },
            { icon: '🏥', title: 'CHW Dashboard', desc: 'Health workers see all flagged sessions and CRITICAL alerts in real time.' },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <span className="text-2xl">{f.icon}</span>
              <h3 className="font-bold text-gray-800 mt-2 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-10 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-5 text-center">How it works</h3>
          <div className="space-y-4">
            {[
              { step: '1', label: 'Describe your symptoms', detail: 'Type or tap a quick chip — in English or Twi' },
              { step: '2', label: 'AI triage in seconds', detail: 'Claude Opus analyzes with medical safety reasoning' },
              { step: '3', label: 'Get clear guidance', detail: '"Seek emergency care now" or "This is likely normal"' },
              { step: '4', label: 'CHW is alerted', detail: 'HIGH and CRITICAL sessions flag automatically' },
            ].map((s, i) => (
              <div key={s.step} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: i < 2 ? '#B5451B' : '#1B4B8A' }}
                >
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-16 max-w-2xl mx-auto">
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #B5451B, #8B2D0F)' }}
        >
          <p className="text-white font-bold text-xl mb-2">Ready to try it?</p>
          <p className="text-white/70 text-sm mb-5">No account needed. Works on any device.</p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors"
            style={{ color: '#B5451B' }}
          >
            Start Free Assessment →
          </Link>
        </div>
      </section>

      <footer className="text-center px-6 pb-8">
        <p className="text-xs text-gray-400">
          MomAlert does not replace professional medical care. Always consult a qualified health worker.
          <br />Built with Claude Opus 4.6 · Claude Builder Hackathon 2026
        </p>
      </footer>
    </main>
  );
}
