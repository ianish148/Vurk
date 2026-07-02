import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | Vurk',
  description: 'Terms of Service and Conditions for using Vurk.',
}

export default function TermsPage() {
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
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Terms & Conditions</h1>
        <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <div className="space-y-8 text-base leading-relaxed">
          <p>
            Please read these terms and conditions carefully before using Our Service. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
          </p>
          
          <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4">1. Accounts</h2>
          <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <p className="mt-2">
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4">2. AI Verification and Submissions</h2>
          <p>
            Our Service includes AI-powered verification of user submissions (Proof of Work). By submitting work, you grant Vurk the right to process, analyze, and store these submissions for the purpose of verification and improving our AI models. 
            You agree not to submit any content that is unlawful, offensive, or infringes on the intellectual property rights of others.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4">3. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by You or other users), features and functionality are and will remain the exclusive property of Vurk Inc. and its licensors.
            The Service is protected by copyright, trademark, and other laws of both the Country and foreign countries.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4">4. Limitation of Liability</h2>
          <p>
            In no event shall Vurk Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
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
