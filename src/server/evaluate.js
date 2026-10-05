import vm from 'node:vm'
import { parseHTML } from 'linkedom'
import { EvalRequestError } from './errors.js'

const MAX_CODE = 12_000

function formatResult(result) {
  if (typeof result === 'string') return result
  if (result === undefined) return ''
  return JSON.stringify(result)
}

export function evaluateOnHtml(html, code) {
  if (typeof code !== 'string' || !code.trim()) {
    throw new EvalRequestError('Codice vuoto')
  }
  if (code.length > MAX_CODE) {
    throw new EvalRequestError('Codice troppo lungo')
  }

  const { document } = parseHTML(String(html))
  const sandbox = {
    document,
    JSON: {
      parse: JSON.parse,
      stringify: JSON.stringify,
      generate: JSON.stringify,
    },
  }

  vm.createContext(sandbox, {
    codeGeneration: { strings: false, wasm: false },
  })

  try {
    const result = vm.runInContext(code, sandbox, { timeout: 1000 })
    return formatResult(result)
  } catch (error) {
    if (error instanceof EvalRequestError) throw error
    throw new EvalRequestError(errorText(error))
  }
}

function errorText(error) {
  if (typeof error === 'string' && error.trim()) return error
  if (error && typeof error === 'object' && 'message' in error && error.message) {
    return String(error.message)
  }
  return 'Errore di esecuzione'
}
