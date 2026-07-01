const { GoogleGenerativeAI } = require('@google/generative-ai')
const fs = require('fs')
const dotenv = require('dotenv')

const envConfig = dotenv.parse(fs.readFileSync('C:/Vurk/.env.local'))
// assuming they have an api key, but I don't know it.
// Wait, I can't test Gemini SDK without an API key!
