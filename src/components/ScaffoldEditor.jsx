import { useState } from 'react'
import styles from './ScaffoldEditor.module.css'

// Parse template into lines of segments: { type: 'text'|'blank', value?, index? }
function parseTemplate(template) {
  let blankIndex = 0
  return template.split('\n').map(line => {
    const segments = line.split('___')
    return segments.flatMap((seg, i) => {
      const result = []
      if (i > 0) result.push({ type: 'blank', index: blankIndex++ })
      if (seg)   result.push({ type: 'text',  value: seg })
      return result
    })
  })
}

function countBlanks(lines) {
  return lines.flat().filter(p => p.type === 'blank').length
}

export default function ScaffoldEditor({ template, functionName, paramName, onRun, running }) {
  const lines      = parseTemplate(template)
  const blankCount = countBlanks(lines)
  const [values, setValues] = useState(() => Array(blankCount).fill(''))

  function updateValue(index, val) {
    setValues(prev => { const n = [...prev]; n[index] = val; return n })
  }

  function handleRun() {
    const filledCode = lines
      .map(lineParts =>
        lineParts.map(p => p.type === 'text' ? p.value : (values[p.index] ?? '')).join('')
      )
      .join('\n')
    onRun(filledCode)
  }

  return (
    <div className={styles.scaffold}>
      {/* Function signature header */}
      <div className={styles.signature}>
        <span className={styles.kw}>def</span>{' '}
        <span className={styles.fn}>{functionName}</span>
        <span className={styles.punct}>(</span>
        <span className={styles.param}>{paramName}</span>
        <span className={styles.punct}>):</span>
      </div>

      {/* Template body with blank inputs */}
      <div className={styles.body}>
        {lines.map((lineParts, li) => {
          // Compute leading whitespace from first text segment for display indent
          const firstText = lineParts.find(p => p.type === 'text')
          const leadingSpaces = firstText ? firstText.value.match(/^ */)[0].length : 0
          const baseIndent = 4  // always inside a def

          return (
            <div key={li} className={styles.codeLine}>
              <span className={styles.indent}>
                {'    '.repeat(Math.ceil((baseIndent + leadingSpaces) / 4))}
              </span>
              {lineParts.map((part, pi) => {
                if (part.type === 'blank') {
                  return (
                    <input
                      key={pi}
                      className={styles.blank}
                      value={values[part.index]}
                      onChange={e => updateValue(part.index, e.target.value)}
                      placeholder="___"
                      size={Math.max((values[part.index]?.length ?? 0) + 2, 5)}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  )
                }
                // Strip leading whitespace from text segment — indent is handled above
                const displayText = pi === 0 ? part.value.trimStart() : part.value
                return (
                  <span key={pi} className={styles.codeText}>{displayText}</span>
                )
              })}
            </div>
          )
        })}
      </div>

      <button
        className={styles.btnRun}
        onClick={handleRun}
        disabled={running}
      >
        {running ? '⏳ RUNNING…' : '▶ RUN'}
      </button>
    </div>
  )
}
