import Link from 'next/link'

export const metadata = {
  title: 'Contact Us | Vurk',
  description: 'Get in touch with the Vurk team for support, feedback, or business inquiries.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 flex items-center px-6 border-b border-border bg-background">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Vurk Logo" className="h-6 w-auto object-contain dark:hidden" />
          <img src="/logo-dark.png" alt="Vurk Logo" className="h-6 w-auto object-contain hidden dark:block" />
          <span className="font-semibold text-base tracking-tight">Vurk</span>
        </Link>
      </header>
      
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Contact Us</h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <p>
            Have a question, feedback, or need support? We'd love to hear from you. 
            Please use the contact information below to get in touch with our team.
          </p>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Support Inquiries</h2>
            <p className="mb-2">For technical support, account issues, or billing inquiries:</p>
            <a href="mailto:support@vurk.com" className="text-primary hover:underline font-medium">support@vurk.com</a>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Business & Partnerships</h2>
            <p className="mb-2">For business development, partnerships, or media inquiries:</p>
            <a href="mailto:business@vurk.com" className="text-primary hover:underline font-medium">business@vurk.com</a>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Mailing Address</h2>
            <address className="not-italic">
              Vurk Inc.<br />
              123 Learning Way, Suite 400<br />
              San Francisco, CA 94107<br />
              United States
            </address>
          </div>
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
