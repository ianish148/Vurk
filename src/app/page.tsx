import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FAQSection } from '@/components/faq-section'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="h-16 flex items-center px-6 border-b border-border bg-background sticky top-0 z-50">
        <div className="flex-1 flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            <img src="/logo.png" alt="Vurk Logo" className="h-6 w-auto object-contain dark:hidden" />
            <img src="/logo-dark.png" alt="Vurk Logo" className="h-6 w-auto object-contain hidden dark:block" />
            <span className="font-semibold text-base tracking-tight">Vurk</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Log In
          </Link>
          <Link 
            href="/login" 
            className="flex items-center justify-center h-8 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <section className="pt-48 pb-40 text-center max-w-3xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter leading-none mb-6">
            Master Any Skill with Engineered Accountability.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">
            Vurk is your personal guide. Structured roadmaps, gamified progress, and AI-verified proof of work to ensure you never quit your goals again.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/login" 
              className="flex items-center justify-center h-12 px-6 bg-primary text-primary-foreground text-base font-medium rounded-md hover:opacity-90 transition-opacity shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start Learning
            </Link>
            <Link 
              href="/login" 
              className="flex items-center justify-center h-12 px-6 bg-transparent text-muted-foreground text-base font-medium rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View Documentation
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mb-4"></div>
              <h3 className="text-sm font-medium tracking-tight mb-2">Structured Roadmaps</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stop guessing what to learn next. Follow expert-curated, day-by-day plans designed to take you from beginner to master.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors">
              <div className="h-2.5 w-2.5 rounded-full bg-purple-500 mb-4"></div>
              <h3 className="text-sm font-medium tracking-tight mb-2">AI Verification</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No more cheating yourself. Submit proof of your work and let our AI agents verify your submissions before you can progress.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors">
              <div className="h-2.5 w-2.5 rounded-full bg-orange-500 mb-4"></div>
              <h3 className="text-sm font-medium tracking-tight mb-2">Gamified Growth</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Earn XP, maintain daily streaks, and climb the global leaderboard. Turn your personal development into an addictive game.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img src="/logo.png" alt="Vurk Logo" className="h-4 w-auto object-contain opacity-70 grayscale dark:hidden" />
            <img src="/logo-dark.png" alt="Vurk Logo" className="h-4 w-auto object-contain opacity-70 grayscale hidden dark:block" />
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Vurk Inc.</span>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center md:justify-end">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              About Us
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              Contact Us
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
