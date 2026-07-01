import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); 
async function run() { 
  const { count } = await supabase.from('roadmap_tasks').select('*', { count: 'exact', head: true }); 
  console.log('Total tasks in DB:', count); 
} 
run();
