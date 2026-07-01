'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { updatePreferences } from '@/app/actions/settings-actions'
import { generateTasks } from '@/app/actions/scheduler-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import {
  Sun, Moon, Monitor, Key, User, Zap, AlertTriangle, Check, Loader2, Eye, EyeOff, Flame
} from 'lucide-react'
import { repairStreak } from '@/app/actions/task-actions'

// ─── Schema ────────────────────────────────────────────────────
const settingsSchema = z.object({
  gemini_api_key: z.string().optional(),
  name: z.string().optional(),
  username: z.string().regex(/^[a-z0-9_]*$/, "Only lowercase letters, numbers, and underscores").optional(),
  age: z.any().optional(),
  year_of_study: z.string().optional(),
  college: z.string().optional(),
  branch: z.string().optional(),
})
type SettingsFormValues = z.infer<typeof settingsSchema>

// ─── Theme toggle ───────────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark',  label: 'Dark',  icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  if (!mounted) return <div className="h-10" />

  return (
    <div className="flex gap-2">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          type="button"
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            theme === value
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-muted/40 hover:bg-muted border-transparent'
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────
export function SettingsClient({
  initialData,
  userId,
  profile,
  isAdmin,
}: {
  initialData: any
  userId: string
  profile: any
  isAdmin: boolean
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [schedulerLoading, setSchedulerLoading] = useState(false)
  const [streakLoading, setStreakLoading] = useState(false)

  const handleRepairStreak = async () => {
    setStreakLoading(true)
    try {
      await repairStreak(userId)
      toast.success('Streak successfully repaired! You are back in the game.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to repair streak. Make sure you have 150 coins.')
    } finally {
      setStreakLoading(false)
    }
  }

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      gemini_api_key: initialData?.gemini_api_key || '',
      name: profile?.full_name || '',
      username: profile?.username || '',
      age: profile?.age || '',
      year_of_study: profile?.year_of_study || '',
      college: profile?.college || '',
      branch: profile?.branch || '',
    },
  })

  async function onSubmit(data: SettingsFormValues) {
    setIsSaving(true)
    try {
      await updatePreferences(userId, data)
      toast.success('Settings saved!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  async function triggerScheduler() {
    setSchedulerLoading(true)
    try {
      await generateTasks()
      toast.success('Scheduler triggered successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Scheduler failed')
    } finally {
      setSchedulerLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Appearance ── */}
        <Section icon={<Monitor className="h-5 w-5 text-primary" />} title="Appearance" description="Choose how Vurk looks on your device.">
          <div className="space-y-3">
            <p className="text-sm font-medium">Theme</p>
            <ThemeToggle />
          </div>
        </Section>

        {/* ── Profile ── */}
        <Section icon={<User className="h-5 w-5 text-primary" />} title="Profile" description="Your public profile information.">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">@</span>
                      <Input placeholder="username" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year_of_study"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Study</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 2nd Year" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="college"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>College / Institution</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. IIT Bombay" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch / Degree</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        {/* ── AI Integration ── */}
        <Section icon={<Key className="h-5 w-5 text-primary" />} title="AI Integration" description="Your personal Gemini API key — used for AI Assistant and task verification.">
          <FormField
            control={form.control}
            name="gemini_api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gemini API Key</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showKey ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormDescription>
                  Get your free key from{' '}
                  <a href="https://aistudio.google.com/apikey" target="_blank" className="text-primary hover:underline font-medium">
                    Google AI Studio
                  </a>. Must start with <code className="text-xs bg-muted px-1 py-0.5 rounded">AIza</code>.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* Save button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="min-w-32">
            {isSaving ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
            ) : (
              <><Check className="h-4 w-4 mr-2" />Save Settings</>
            )}
          </Button>
        </div>

        {/* ── Streak Repair ── */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="font-semibold text-lg">Streak Repair</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Did you miss a day? Don't lose your progress! You can freeze your streak and restore it for 150 coins.
          </p>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
            <div>
              <p className="font-medium text-orange-500">Restore Streak (150 Coins)</p>
              <p className="text-sm text-muted-foreground">You currently have {profile?.coins || 0} coins.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              onClick={handleRepairStreak}
              disabled={streakLoading || (profile?.coins || 0) < 150}
            >
              {streakLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Flame className="h-4 w-4 mr-2" />}
              Repair Streak
            </Button>
          </div>
        </div>

        {/* ── Scheduler Engine ── */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Scheduler Engine</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Manually trigger the Smart Scheduler for testing purposes.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={triggerScheduler}
            disabled={schedulerLoading}
          >
            {schedulerLoading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Running...</>
              : <><Zap className="h-4 w-4 mr-2" />Trigger Task Generation</>
            }
          </Button>
        </div>

        {/* ── Danger Zone ── */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="font-semibold text-lg text-destructive">Danger Zone</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Destructive actions for testing accounts. These cannot be undone.
          </p>
          <Button type="button" variant="destructive">
            Reset My Progress
          </Button>
          <p className="text-xs text-muted-foreground">
            Deletes all user_tasks, subscriptions, and resets XP.
          </p>
        </div>
      </form>
    </Form>
  )
}

// ─── Section wrapper ─────────────────────────────────────────────
function Section({
  icon, title, description, children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-2 rounded-lg bg-primary/10">{icon}</div>
        <div>
          <h2 className="font-semibold text-base">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="pl-11">{children}</div>
    </div>
  )
}
