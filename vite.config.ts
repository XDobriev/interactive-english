import react from '@vitejs/plugin-react'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import handler from './api/gemini.ts'

/** Serves /api/gemini in `vite dev` using the same handler as the production function. */
function geminiDevProxy(): Plugin {
  return {
    name: 'gemini-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/gemini', async (req, res) => {
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const request = new Request('http://localhost/api/gemini', {
          method: req.method,
          headers: { 'Content-Type': 'application/json' },
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        })
        const response = await handler(request)
        res.statusCode = response.status
        res.setHeader('Content-Type', 'application/json')
        res.end(await response.text())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Make server-only variables (GEMINI_API_KEY, GEMINI_MODEL) from .env.local visible to the dev proxy.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    base: './',
    plugins: [react(), geminiDevProxy()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  }
})
