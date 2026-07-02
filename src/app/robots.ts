import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Use environment variable for the base URL, defaulting to a generic one
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vurk.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/_next/', '/onboarding/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
