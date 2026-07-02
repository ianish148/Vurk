export const runtime = 'edge';

import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Vurk',
  description: 'Privacy Policy for Vurk.',
}

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
        <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <div className="space-y-8 text-base leading-relaxed">
          <p>
            Vurk Inc. ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. 
            This Privacy Policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
          </p>
          
          <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4">1. Information We Collect</h2>
          <p>
            We collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address.</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            <li><strong>Usage Data:</strong> includes information about how you use our website, products and services (including tasks, roadmaps, and AI verification submissions).</li>
          </ul>

          <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4">2. How We Use Your Information</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4">3. Third-Party Advertising (Google AdSense)</h2>
          <p>
            We may use third-party advertising companies, such as Google AdSense, to serve ads when you visit our Website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
          </p>
          <p className="mt-4">
            <strong>Google's use of advertising cookies:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Ads Settings</a>.</li>
          </ul>

          <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4">4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
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
