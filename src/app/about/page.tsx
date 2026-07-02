import Link from 'next/link'

export const metadata = {
  title: 'About Us | Vurk',
  description: 'Learn about Vurk and our mission to help you master any skill through engineered accountability.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 flex items-center px-6 border-b border-border bg-background">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Vurk Logo" className="h-6 w-auto object-contain dark:hidden" />
          <img src="/logo-dark.png" alt="Vurk Logo" className="h-6 w-auto object-contain hidden dark:block" />
          <span className="font-semibold text-base tracking-tight">Vurk</span>
        </Link>
      </header>
      
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-8">About Us</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Welcome to Vurk, your ultimate platform for mastering new skills through structured roadmaps and engineered accountability. We believe that anyone can achieve their goals if they have the right plan and the right motivation.
          </p>
          <p>
            Vurk was built to solve a common problem: people start learning a new skill, but quickly lose motivation or get lost in the sea of available resources. We provide curated, day-by-day roadmaps that remove the guesswork from learning.
          </p>
          <p>
            But a roadmap isn't enough. That's why we built our AI-powered Proof of Work verification system. By requiring you to submit tangible proof of your learning, and having our AI verify it before you can progress, we ensure that you actually do the work.
          </p>
          <p>
            Combined with gamification features like daily streaks, XP, and leaderboards, Vurk turns personal development into an engaging and addictive experience.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Our Mission</h2>
          <p>
            Our mission is to empower individuals to achieve their full potential by providing the structure, accountability, and motivation they need to succeed.
          </p>
        </div>
      </main>
      
      <footer className="border-t border-border py-10 px-6 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Vurk Inc.</span>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center md:justify-end">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact Us</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
