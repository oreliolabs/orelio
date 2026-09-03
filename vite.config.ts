import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function jsonDatabaseSyncPlugin(): Plugin {
  return {
    name: 'json-database-sync',
    configureServer(server) {
      server.middlewares.use('/api/save-database', (req, res) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              if (data && Array.isArray(data.familyMembers)) {
                data.familyMembers = data.familyMembers.map((m: any) => {
                  const { age, ...rest } = m;
                  return rest;
                });
              }
              if (data && Array.isArray(data.notes)) {
                data.notes = data.notes.map((n: any) => {
                  const { accentColor, ...rest } = n;
                  return rest;
                });
              }
              const targetPath = path.resolve(__dirname, 'src/data/orelio_database.json')
              fs.writeFileSync(targetPath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: String(err) }))
            }
          })
        } else {
          res.statusCode = 405
          res.end('Method Not Allowed')
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), jsonDatabaseSyncPlugin()],
  server: {
    watch: {
      ignored: ['**/src/data/orelio_database.json']
    }
  }
})
