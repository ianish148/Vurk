import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteDuplicate() {
  // Find all roadmaps named "JLPT N5 (4 Months)"
  const { data, error } = await supabase
    .from('roadmap_templates')
    .select('id, created_at')
    .eq('name', 'JLPT N5 (4 Months)')
    .order('created_at', { ascending: false }) // Newest first

  if (error) {
    console.error('Error fetching roadmaps:', error)
    return
  }

  if (data && data.length > 1) {
    // Keep the first one (newest), delete the rest
    const toDelete = data.slice(1).map(r => r.id)
    
    console.log('Found duplicates! Deleting:', toDelete)

    const { error: deleteError } = await supabase
      .from('roadmap_templates')
      .delete()
      .in('id', toDelete)

    if (deleteError) {
      console.error('Error deleting duplicates:', deleteError)
    } else {
      console.log('Successfully deleted older duplicates.')
    }
  } else {
    console.log('No duplicates found.')
  }
}

deleteDuplicate()
