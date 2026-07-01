import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); 
async function run() { 
  const {data} = await supabase.from('roadmap_templates').select('id, name, roadmap_phases(id, title, roadmap_milestones(id, title, roadmap_modules(id, title, roadmap_tasks(id, title))))'); 
  console.log(JSON.stringify(data, null, 2)); 
} 
run();
