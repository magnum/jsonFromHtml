const WORD = /[A-Za-z0-9_$]/

function isWord(char) {
  return Boolean(char) && WORD.test(char)
}

function readQuoted(source, start) {
  const quote = source[start]
  let index = start + 1
  while (index < source.length) {
    if (source[index] === '\\') {
      index += 2
      continue
    }
    if (source[index] === quote) return index + 1
    index += 1
  }
  return source.length
}

function readTemplate(source, start) {
  let index = start + 1
  while (index < source.length) {
    if (source[index] === '\\') {
      index += 2
      continue
    }
    if (source[index] === '`') return index + 1
    index += 1
  }
  return source.length
}

export function minifyCode(code) {
  const source = String(code).replace(/\r\n?/g, '\n')
  let out = ''
  let index = 0
  let pendingSpace = false

  const emit = (text) => {
    if (!text) return
    if (pendingSpace) {
      const prev = out.at(-1)
      const next = text[0]
      const keep =
        prev &&
        next &&
        ((isWord(prev) && isWord(next)) ||
          (prev === '+' && next === '+') ||
          (prev === '-' && next === '-'))
      if (keep) out += ' '
      pendingSpace = false
    }
    out += text
  }

  while (index < source.length) {
    const char = source[index]
    const next = source[index + 1]

    if (char === '/' && next === '/') {
      index += 2
      while (index < source.length && source[index] !== '\n') index += 1
      if (out) pendingSpace = true
      continue
    }

    if (char === '/' && next === '*') {
      index += 2
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        index += 1
      }
      index = Math.min(source.length, index + 2)
      if (out) pendingSpace = true
      continue
    }

    if (char === '"' || char === "'") {
      const end = readQuoted(source, index)
      emit(source.slice(index, end))
      index = end
      continue
    }

    if (char === '`') {
      const end = readTemplate(source, index)
      emit(source.slice(index, end))
      index = end
      continue
    }

    if (char === ' ' || char === '\n' || char === '\t' || char === '\f') {
      if (out) pendingSpace = true
      index += 1
      continue
    }

    emit(char)
    index += 1
  }

  return out.trim()
}
