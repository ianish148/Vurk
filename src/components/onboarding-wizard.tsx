'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { completeOnboarding } from '@/app/onboarding/actions'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  full_name: z.string().min(2, "Name is required"),
  age: z.coerce.number().min(10).max(100),
  country: z.string().min(2, "Country is required"),
  timezone: z.string().optional(),
  
  college: z.string().min(2, "College is required"),
  branch: z.string().min(2, "Branch/Major is required"),
  semester: z.coerce.number().min(1).max(10),
  graduation_year: z.coerce.number().min(2024).max(2030),
  current_cgpa: z.coerce.number().min(0).max(10),
  target_cgpa: z.coerce.number().min(0).max(10),

  career_goal: z.string().min(2, "Career goal is required"),
  interests: z.string().optional(), // Will split by comma
  japanese_level: z.string().optional(),
  programming_languages: z.string().optional(), // Will split by comma
  goals: z.string().optional(), // Will split by comma

  github_username: z.string().optional(),
  linkedin: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function OnboardingWizard({ userId, email }: { userId: string, email: string }) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  })

  const handleNext = async () => {
    let fieldsToValidate: any[] = []
    if (step === 1) fieldsToValidate = ['username', 'full_name', 'age', 'country']
    if (step === 2) fieldsToValidate = ['college', 'branch', 'semester', 'graduation_year', 'current_cgpa', 'target_cgpa']
    if (step === 3) fieldsToValidate = ['career_goal']

    const isStepValid = await trigger(fieldsToValidate)
    if (isStepValid) {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)
    
    // Transform comma-separated strings to arrays
    const formattedData = {
      ...data,
      interests: data.interests ? data.interests.split(',').map(s => s.trim()) : [],
      programming_languages: data.programming_languages ? data.programming_languages.split(',').map(s => s.trim()) : [],
      goals: data.goals ? data.goals.split(',').map(s => s.trim()) : []
    }

    const res = await completeOnboarding(formattedData)
    if (res?.error) {
       setError(res.error)
       setIsSubmitting(false)
    } else {
       window.location.href = '/dashboard'
    }
  }

  return (
    <Card className="w-full max-w-xl border-primary/20 shadow-2xl relative overflow-hidden bg-card/95 backdrop-blur-xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-muted">
         <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
      </div>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
        <CardDescription className="text-center">
          Step {step} of 4
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form id="onboarding-form" onSubmit={handleSubmit(onSubmit)} className="overflow-hidden relative min-h-[350px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4 absolute w-full"
              >
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="cool_engineer" {...register('username')} />
                  {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" placeholder="John Doe" {...register('full_name')} />
                  {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" {...register('age')} />
                    {errors.age && <p className="text-xs text-red-500">{errors.age.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="USA" {...register('country')} />
                    {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4 absolute w-full"
              >
                <div className="grid gap-2">
                  <Label htmlFor="college">College/University</Label>
                  <Input id="college" placeholder="MIT" {...register('college')} />
                  {errors.college && <p className="text-xs text-red-500">{errors.college.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="branch">Branch/Major</Label>
                  <Input id="branch" placeholder="Computer Science" {...register('branch')} />
                  {errors.branch && <p className="text-xs text-red-500">{errors.branch.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="semester">Current Semester</Label>
                    <Input id="semester" type="number" {...register('semester')} />
                    {errors.semester && <p className="text-xs text-red-500">{errors.semester.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="graduation_year">Grad Year</Label>
                    <Input id="graduation_year" type="number" {...register('graduation_year')} />
                    {errors.graduation_year && <p className="text-xs text-red-500">{errors.graduation_year.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current_cgpa">Current CGPA</Label>
                    <Input id="current_cgpa" type="number" step="0.01" {...register('current_cgpa')} />
                    {errors.current_cgpa && <p className="text-xs text-red-500">{errors.current_cgpa.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="target_cgpa">Target CGPA</Label>
                    <Input id="target_cgpa" type="number" step="0.01" {...register('target_cgpa')} />
                    {errors.target_cgpa && <p className="text-xs text-red-500">{errors.target_cgpa.message}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4 absolute w-full"
              >
                <div className="grid gap-2">
                  <Label htmlFor="career_goal">Career Goal</Label>
                  <Input id="career_goal" placeholder="Software Engineer at FAANG" {...register('career_goal')} />
                  {errors.career_goal && <p className="text-xs text-red-500">{errors.career_goal.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="programming_languages">Programming Languages (comma separated)</Label>
                  <Input id="programming_languages" placeholder="Python, TypeScript, Rust" {...register('programming_languages')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interests">Interests (comma separated)</Label>
                  <Input id="interests" placeholder="AI, Web Dev, Anime" {...register('interests')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="goals">Key Goals (comma separated)</Label>
                  <Input id="goals" placeholder="Internship, Open Source" {...register('goals')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="japanese_level">Japanese Level (Optional)</Label>
                  <Input id="japanese_level" placeholder="N5, N4..." {...register('japanese_level')} />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4 absolute w-full"
              >
                <div className="grid gap-2">
                  <Label htmlFor="github_username">GitHub Username</Label>
                  <Input id="github_username" placeholder="johndoe" {...register('github_username')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                  <Input id="linkedin" placeholder="https://linkedin.com/in/..." {...register('linkedin')} />
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
                    {error}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-border/50 pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleBack} 
          disabled={step === 1 || isSubmitting}
        >
          Back
        </Button>
        {step < 4 ? (
          <Button type="button" onClick={handleNext}>
            Continue
          </Button>
        ) : (
          <Button type="submit" form="onboarding-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Setup
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
