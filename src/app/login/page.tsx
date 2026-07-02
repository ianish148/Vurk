export const runtime = 'edge';

import { login, signInWithOAuth } from './actions'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams
  const signInWithGoogle = signInWithOAuth.bind(null, 'google')
  const signInWithGithub = signInWithOAuth.bind(null, 'github')
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground p-6">
      
      <div className="w-full max-w-[400px]">
        {/* Logo Header */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            <img src="/logo.png" alt="Vurk Logo" className="h-8 w-auto object-contain dark:hidden" />
            <img src="/logo-dark.png" alt="Vurk Logo" className="h-8 w-auto object-contain hidden dark:block" />
            <span className="font-bold text-2xl tracking-tight">Vurk</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card text-card-foreground p-8 rounded-xl border border-border shadow-lg">
          <h1 className="text-2xl font-semibold tracking-tight mb-2 text-center">Log In</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">Enter your email and password to continue.</p>

          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                className="w-full h-10 px-3 text-sm bg-background rounded-md border border-input placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-shadow"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="w-full h-10 px-3 text-sm bg-background rounded-md border border-input placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-shadow"
              />
            </div>

            {params?.message && (
              <p className="text-sm text-destructive text-center mt-2">
                {params.message}
              </p>
            )}

            <button 
              type="submit" 
              formAction={login} 
              className="w-full h-10 mt-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Log In
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                type="submit" 
                formAction={signInWithGoogle} 
                formNoValidate
                className="flex items-center justify-center gap-2 h-10 bg-transparent text-sm font-medium rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"/>
                </svg>
                Google
              </button>
              <button 
                type="submit" 
                formAction={signInWithGithub} 
                formNoValidate
                className="flex items-center justify-center gap-2 h-10 bg-transparent text-sm font-medium rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
                </svg>
                GitHub
              </button>
            </div>
          </form>
        </div>
        
        <p className="text-sm text-muted-foreground text-center mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}
