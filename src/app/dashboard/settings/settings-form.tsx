"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updatePreferences } from "@/app/actions/settings-actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const settingsSchema = z.object({
  gemini_api_key: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export function SettingsForm({ initialData, userId }: { initialData: any, userId: string }) {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      gemini_api_key: initialData.gemini_api_key || "",
    },
  })

  async function onSubmit(data: SettingsFormValues) {
    setIsSaving(true)
    try {
      await updatePreferences(userId, data)
      toast.success("Settings updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="gemini_api_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gemini API Key</FormLabel>
              <FormControl>
                <Input type="password" placeholder="AIzaSy..." {...field} />
              </FormControl>
              <FormDescription>
                Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary hover:underline">Google AI Studio</a>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </Form>
  )
}
