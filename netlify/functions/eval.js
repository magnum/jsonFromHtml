import { EvalRequestError, handleEval } from '../../src/server/handleEval.js'

export const handler = async (event) => {
  try {
    const params = new URLSearchParams(event.rawQuery || '')
    const result = await handleEval(params)
    return {
      statusCode: 200,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      body: result,
    }
  } catch (error) {
    const status = error instanceof EvalRequestError ? error.status : 500
    const message = error instanceof EvalRequestError ? error.message : 'Errore interno'
    return {
      statusCode: status,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      body: message,
    }
  }
}
