const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Vurk/public/roadmaps/jlpt-n5.json', 'utf8'));
const tasks = [];
data.phases.forEach(p => p.milestones.forEach(m => m.modules.forEach(mod => mod.tasks.forEach(t => tasks.push(t)))));

let sql = '-- Update task descriptions\n';
for (const t of tasks) {
  if (!t.description) continue;
  sql += `UPDATE roadmap_tasks SET description = '${t.description.replace(/'/g, "''")}' WHERE title = '${t.title.replace(/'/g, "''")}';\n`;
}
fs.writeFileSync('c:/Vurk/supabase/update_task_descriptions.sql', sql);
console.log('Created SQL file!');
