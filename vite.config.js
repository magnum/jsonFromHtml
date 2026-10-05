import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

function evalApiPlugin() {
  const attach = (middlewares) => {
    middlewares.use('/eval', async (req, res) => {
      try {
        const { EvalRequestError, handleEval } = await import('./src/server/handleEval.js')
        const requestUrl = new URL(req.url || '/', 'http://localhost')
        const result = await handleEval(requestUrl.searchParams)
        res.statusCode = 200
        res.setHeader('content-type', 'text/plain; charset=utf-8')
        res.end(result)
      } catch (error) {
        const { EvalRequestError } = await import('./src/server/errors.js')
        const status = error instanceof EvalRequestError ? error.status : 500
        const message = error instanceof EvalRequestError ? error.message : 'Errore interno'
        res.statusCode = status
        res.setHeader('content-type', 'text/plain; charset=utf-8')
        res.end(message)
      }
    })
  }

  return {
    name: 'eval-api',
    configureServer(server) {
      attach(server.middlewares)
    },
    configurePreviewServer(server) {
      attach(server.middlewares)
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), evalApiPlugin()],
})
