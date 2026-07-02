'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How does Vurk guarantee accountability?',
    answer: 'Vurk uses AI agents to verify your Proof of Work. You cannot advance to the next task in your roadmap until your work is reviewed and approved, ensuring you actually learn the material instead of just skimming it.'
  },
  {
    question: 'What is a structured roadmap?',
    answer: 'A roadmap is a step-by-step curriculum broken down into daily, actionable tasks. Instead of guessing what to study next, you follow a proven path curated by experts.'
  },
  {
    question: 'How do XP and streaks work?',
    answer: 'Every completed task earns you XP and contributes to your daily streak. Maintaining your streak and gaining XP helps you climb the global leaderboard and unlocks new gamified rewards.'
  },
  {
    question: 'Can I create my own tasks?',
    answer: 'Yes! You can add custom tasks to your dashboard. Completing custom tasks also rewards you with XP, allowing you to tailor your learning journey.'
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <section className="py-24 border-t border-border bg-background">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center tracking-tight mb-12">Frequently Asked Questions</h2>
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div 
                key={index} 
                className="border border-border rounded-lg overflow-hidden bg-card transition-colors hover:border-primary/30"
              >
                <button
                  onClick={() => toggleOpen(index)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium focus:outline-none focus-visible:bg-muted"
                  aria-expanded={isOpen}
                >
                  <span className="text-foreground">{faq.question}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div 
                  className={`px-4 text-muted-foreground overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
