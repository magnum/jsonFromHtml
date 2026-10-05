export class EvalRequestError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'EvalRequestError'
    this.status = status
  }
}
