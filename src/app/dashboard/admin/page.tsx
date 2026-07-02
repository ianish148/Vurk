export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImportRoadmapForm } from './import-roadmap-form'

export default function AdminToolsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Tools</h1>
        <p className="text-muted-foreground mt-2">
          System management and roadmap importing tools.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>JSON Roadmap Importer</CardTitle>
          <CardDescription>
            Upload a valid Vurk Roadmap JSON file to bulk-insert phases, milestones, modules, and tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportRoadmapForm />
        </CardContent>
      </Card>
    </div>
  )
}
