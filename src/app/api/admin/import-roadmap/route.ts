import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'anishff148@gmail.com'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    const body = await request.json()
    
    // Extract template
    const template = {
      name: body.name,
      description: body.description,
      category: body.category || 'Language',
      difficulty: body.difficulty || 'medium',
      status: body.status || 'published',
      total_xp_available: body.total_xp_available || 0,
      estimated_duration_weeks: body.estimated_duration_weeks || 16,
      version: 1,
      is_latest: true
    }

    // Insert template
    const { data: newTemplate, error: templateError } = await supabase
      .from('roadmap_templates')
      .insert(template)
      .select('id')
      .single()

    if (templateError) {
      console.error('Template insert error:', templateError)
      return NextResponse.json({ error: 'Failed to create roadmap template: ' + templateError.message }, { status: 500 })
    }

    const templateId = newTemplate.id
    
    // We will collect arrays of items to bulk insert
    const phasesToInsert: any[] = []
    const milestonesToInsert: any[] = []
    const modulesToInsert: any[] = []
    const tasksToInsert: any[] = []

    let phaseOrder = 1
    for (const phase of (body.phases || [])) {
      const phaseId = crypto.randomUUID()
      phasesToInsert.push({
        id: phaseId,
        template_id: templateId,
        title: phase.title,
        description: phase.description || '',
        order_index: phaseOrder++
      })

      let milestoneOrder = 1
      for (const milestone of (phase.milestones || [])) {
        const milestoneId = crypto.randomUUID()
        milestonesToInsert.push({
          id: milestoneId,
          phase_id: phaseId,
          title: milestone.title,
          description: milestone.description || '',
          order_index: milestoneOrder++
        })

        let moduleOrder = 1
        for (const mod of (milestone.modules || [])) {
          const moduleId = crypto.randomUUID()
          modulesToInsert.push({
            id: moduleId,
            milestone_id: milestoneId,
            title: mod.title,
            description: mod.description || '',
            order_index: moduleOrder++
          })

          let taskOrder = 1
          for (const task of (mod.tasks || [])) {
            const taskId = crypto.randomUUID()
            tasksToInsert.push({
              id: taskId,
              module_id: moduleId,
              title: task.title,
              description: task.description || '',
              type: task.type || 'reading',
              difficulty: task.difficulty || 'easy',
              estimated_time_minutes: task.estimated_time_minutes || 15,
              xp_reward: task.xp_reward || 10,
              order_index: taskOrder++
            })
          }
        }
      }
    }

    // Bulk inserts
    if (phasesToInsert.length > 0) {
      const { error } = await supabase.from('roadmap_phases').insert(phasesToInsert)
      if (error) throw new Error('Phase insert error: ' + error.message)
    }
    if (milestonesToInsert.length > 0) {
      const { error } = await supabase.from('roadmap_milestones').insert(milestonesToInsert)
      if (error) throw new Error('Milestone insert error: ' + error.message)
    }
    if (modulesToInsert.length > 0) {
      const { error } = await supabase.from('roadmap_modules').insert(modulesToInsert)
      if (error) throw new Error('Module insert error: ' + error.message)
    }
    if (tasksToInsert.length > 0) {
      // Chunk task inserts to avoid payload limits if it's very large
      const chunkSize = 200;
      for (let i = 0; i < tasksToInsert.length; i += chunkSize) {
        const chunk = tasksToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from('roadmap_tasks').insert(chunk)
        if (error) throw new Error('Task insert error: ' + error.message)
      }
    }

    return NextResponse.json({ message: 'Roadmap imported successfully!', templateId })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
