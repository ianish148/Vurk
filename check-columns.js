const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const dotenv = require('dotenv')

const envConfig = dotenv.parse(fs.readFileSync('C:/Vurk/.env.local'))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function main() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error:', error)
  } else {
    if (data.length > 0) {
      console.log('Columns in profiles table:', Object.keys(data[0]))
    } else {
      console.log('No rows found, cannot infer columns. Try fetching schema directly.')
    }
  }
}

main()
