import { getRoadmaps } from '@/app/actions/roadmap-actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Trophy, Clock, Zap } from 'lucide-react'
import SubscribeButton from './subscribe-button'

export default async function MarketplacePage() {
  const roadmaps = await getRoadmaps()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Discover new roadmaps to learn skills, prepare for exams, and advance your career.
        </p>
      </div>

      <div className="flex items-center space-x-2 border rounded-md px-3 py-2 bg-background max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input 
          className="bg-transparent border-none focus:outline-none text-sm w-full"
          placeholder="Search roadmaps..." 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roadmaps?.map((roadmap) => (
          <Card key={roadmap.id} className="flex flex-col overflow-hidden hover:border-primary/50 transition-colors">
            {roadmap.cover_image_url && (
              <div 
                className="h-32 w-full bg-cover bg-center" 
                style={{ backgroundImage: `url(${roadmap.cover_image_url})` }}
              />
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="mb-2">{roadmap.category}</Badge>
                <Badge className={
                  roadmap.difficulty === 'easy' ? 'bg-green-500 hover:bg-green-600' :
                  roadmap.difficulty === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                  'bg-red-500 hover:bg-red-600'
                }>{roadmap.difficulty}</Badge>
              </div>
              <CardTitle>{roadmap.name}</CardTitle>
              <CardDescription className="line-clamp-2">{roadmap.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {roadmap.estimated_duration_weeks} weeks
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Trophy className="h-4 w-4" />
                  {roadmap.total_xp_available} XP
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <SubscribeButton templateId={roadmap.id} />
            </CardFooter>
          </Card>
        ))}

        {roadmaps?.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
            No roadmaps available. An admin needs to import them!
          </div>
        )}
      </div>
    </div>
  )
}
