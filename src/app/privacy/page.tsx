import Link from 'next/link'

export default function PrivacyPolicy() {
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
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: July 2, 2026</p>
        
        <div className="space-y-8 text-base leading-relaxed">
          <p>
            This is a placeholder for the Privacy Policy. Replace this text with your actual privacy policy content. 
            A privacy policy typically details how you collect, use, and protect user data.
          </p>
          
          <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4">1. Information We Collect</h2>
          <p>
            Describe what information you collect from users, such as email addresses, usage data, etc.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4">2. How We Use Your Information</h2>
          <p>
            Explain how the collected data is used to provide and improve the service.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4">3. Data Security</h2>
          <p>
            Detail the measures you take to keep user data secure.
          </p>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border py-10 px-6 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img src="/logo.png" alt="Vurk Logo" className="h-4 w-auto object-contain opacity-70 grayscale dark:hidden" />
            <img src="/logo-dark.png" alt="Vurk Logo" className="h-4 w-auto object-contain opacity-70 grayscale hidden dark:block" />
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Vurk Inc.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
