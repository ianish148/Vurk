'use server'

import { createClient } from '@/utils/supabase/server'
import { RoadmapImportSchema } from '@/lib/roadmap-schemas'
import { revalidatePath } from 'next/cache'

export async function importRoadmapJson(jsonString: string) {
  const supabase = await createClient()
  
  try {
    // 1. Validate Admin (For now, just check auth)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 2. Parse and Validate JSON
    const parsed = JSON.parse(jsonString)
    const roadmap = RoadmapImportSchema.parse(parsed)

    // 3. Generate UUIDs and flatten hierarchy for bulk inserts
    const templateId = crypto.randomUUID()
    
    let totalXp = 0
    const phasesToInsert = []
    const milestonesToInsert = []
    const modulesToInsert = []
    const tasksToInsert = []

    let phaseOrder = 1
    for (const phase of roadmap.phases) {
      const phaseId = crypto.randomUUID()
      phasesToInsert.push({
        id: phaseId,
        template_id: templateId,
        title: phase.title,
        description: phase.description,
        order_index: phaseOrder++
      })

      let milestoneOrder = 1
      for (const milestone of phase.milestones) {
        const milestoneId = crypto.randomUUID()
        milestonesToInsert.push({
          id: milestoneId,
          phase_id: phaseId,
          title: milestone.title,
          description: milestone.description,
          order_index: milestoneOrder++
        })

        let moduleOrder = 1
        for (const module of milestone.modules) {
          const moduleId = crypto.randomUUID()
          modulesToInsert.push({
            id: moduleId,
            milestone_id: milestoneId,
            title: module.title,
            description: module.description,
            order_index: moduleOrder++
          })

          let taskOrder = 1
          for (const task of module.tasks) {
            tasksToInsert.push({
              module_id: moduleId,
              title: task.title,
              description: task.description || 'No description provided.',
              type: task.type || 'reading',
              difficulty: task.difficulty || 'easy',
              priority: task.priority || 'normal',
              estimated_time_minutes: task.estimated_minutes || 15,
              xp_reward: task.xp_reward || 10,
              coin_reward: task.coin_reward || 0,
              submission_req: task.submission_requirement || 'none',
              requires_ai_verification: task.requires_ai_verification || false,
              ai_verification_type: task.ai_verification_type || null,
              ai_verification_prompt: task.ai_verification_prompt || null,
              order_index: taskOrder++
            })
            totalXp += (task.xp_reward || 10)
          }
        }
      }
    }

    // 4. Bulk Inserts
    const { error: tErr } = await supabase.from('roadmap_templates').insert({
      id: templateId,
      name: roadmap.name,
      description: roadmap.description,
      cover_image_url: roadmap.cover_image_url,
      version: roadmap.version,
      is_latest: true,
      difficulty: roadmap.difficulty,
      category: roadmap.category,
      tags: roadmap.tags,
      total_xp_available: totalXp,
      estimated_duration_weeks: Math.ceil(roadmap.duration_days / 7),
      status: 'published',
      missed_strategy: roadmap.missed_strategy
    })
    if (tErr) throw new Error('Template Insert Failed: ' + tErr.message)

    const { error: pErr } = await supabase.from('roadmap_phases').insert(phasesToInsert)
    if (pErr) throw new Error('Phases Insert Failed: ' + pErr.message)

    const { error: mErr } = await supabase.from('roadmap_milestones').insert(milestonesToInsert)
    if (mErr) throw new Error('Milestones Insert Failed: ' + mErr.message)

    const { error: modErr } = await supabase.from('roadmap_modules').insert(modulesToInsert)
    if (modErr) throw new Error('Modules Insert Failed: ' + modErr.message)

    const { error: taskErr } = await supabase.from('roadmap_tasks').insert(tasksToInsert)
    if (taskErr) throw new Error('Tasks Insert Failed: ' + taskErr.message)

    revalidatePath('/dashboard/admin')
    revalidatePath('/dashboard/roadmaps')
    return { success: true, message: `Successfully imported "${roadmap.name}" with ${tasksToInsert.length} tasks.` }

  } catch (error: any) {
    console.error('Import error:', error)
    return { success: false, error: error.message || 'Unknown error occurred' }
  }
}
