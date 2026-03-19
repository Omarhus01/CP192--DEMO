// ═══════════════════════════════════════════════════════════════════════════
//  codeExecutor.js
//
//  Executes user-written Python code via Skulpt (loaded via CDN in index.html).
//  Returns animation steps + outcome, same interface as before — but async.
//
//  The user writes only the function body (indented). We wrap it in:
//    def functionName(paramName):
//      <userCode>
//  then redefine the function with a tracking wrapper before calling it.
// ═══════════════════════════════════════════════════════════════════════════

const MAX_CALLS = 60

// ── Skulpt helper ─────────────────────────────────────────────────────────────

function builtinRead(x) {
  if (
    window.Sk?.builtinFiles === undefined ||
    window.Sk.builtinFiles['files'][x] === undefined
  ) {
    throw new Error("File not found: '" + x + "'")
  }
  return window.Sk.builtinFiles['files'][x]
}

// ── Script builder ────────────────────────────────────────────────────────────

function normalizeIndent(code) {
  const lines = code.split('\n')
  const nonEmpty = lines.filter(l => l.trim().length > 0)
  if (nonEmpty.length === 0) return code
  const minIndent = Math.min(...nonEmpty.map(l => l.match(/^ */)[0].length))
  return lines.map(l => l.trim() ? '    ' + l.slice(minIndent) : l).join('\n')
}

function buildPythonScript(functionName, paramName, initialValue, userCode) {
  userCode = normalizeIndent(userCode)
  // Note: userCode is the indented function body supplied by the user.
  // We assemble a full Python module that:
  //   1. Defines the user's function
  //   2. Wraps it with call/return tracking
  //   3. Calls it with initialValue
  //   4. Prints results as JSON
  return `\
def __jv(v):
    if v is None: return 'null'
    if v is True: return 'true'
    if v is False: return 'false'
    if isinstance(v, int): return str(v)
    if isinstance(v, str):
        s = v.replace('\\\\', '\\\\\\\\').replace('"', '\\\\"')
        return '"' + s + '"'
    if isinstance(v, list): return '[' + ','.join([__jv(i) for i in v]) + ']'
    if isinstance(v, dict): return '{' + ','.join(['"' + k + '":' + __jv(vv) for k, vv in v.items()]) + '}'
    return 'null'

def ${functionName}(${paramName}):
${userCode}

__orig  = ${functionName}
__calls = [0]
__depth = [0]
__steps = []

def ${functionName}(${paramName}):
    __calls[0] += 1
    if __calls[0] > ${MAX_CALLS}:
        raise RecursionError("Max recursive calls exceeded")
    __depth[0] += 1
    d   = __depth[0] - 1
    val = ${paramName}
    __steps.append({"type": "call", "depth": d, "label": "${functionName}(" + str(val) + ")", "value": val})
    result = __orig(${paramName})
    __depth[0] -= 1
    __steps.append({"type": "return", "depth": d, "value": result})
    return result

__error  = None
__result = None
try:
    __result = ${functionName}(${initialValue})
    __steps.append({"type": "complete"})
except RecursionError:
    __steps.append({"type": "overflow"})
    __error = "overflow"
except Exception as e:
    __error = str(e)

print(__jv({"steps": __steps, "result": __result, "error": __error}))
`
}

// ── Main executor ─────────────────────────────────────────────────────────────

/**
 * Execute the user's Python function body using Skulpt.
 * @returns {Promise<{ outcome, steps, result, error }>}
 *
 * outcome: 'success' | 'overflow' | 'earlyExit' | 'wrongResult' | 'syntaxError'
 */
export async function executeCode(level, userCode) {
  const { functionName, paramName, initialValue } = level

  if (typeof window.Sk === 'undefined') {
    return { outcome: 'syntaxError', steps: [], result: null, error: 'Skulpt not loaded' }
  }

  const script = buildPythonScript(functionName, paramName, initialValue, userCode)

  let output = ''

  window.Sk.configure({
    output:    (text) => { output += text },
    read:      builtinRead,
    execLimit: 8000,   // ms — prevents infinite loops hanging the browser
  })

  try {
    await window.Sk.misceval.asyncToPromise(() =>
      window.Sk.importMainWithBody('<stdin>', false, script, true)
    )
  } catch (err) {
    // Skulpt wraps Python exceptions; err.tp$name is the Python exception class name
    const errType = err.tp$name ?? ''
    const errMsg  = err.args?.v?.[0]?.v ?? err.toString()

    const isRecursion = errType === 'RecursionError' ||
                        errMsg.toLowerCase().includes('recursionerror') ||
                        errMsg.toLowerCase().includes('maximum recursion')

    if (isRecursion) {
      return {
        outcome: 'overflow',
        steps:   [{ type: 'overflow', depth: 0 }],
        result:  null,
        error:   'RecursionError: maximum recursion depth exceeded',
      }
    }

    return {
      outcome: 'syntaxError',
      steps:   [],
      result:  null,
      error:   formatPythonError(errType, errMsg),
    }
  }

  // ── Parse JSON output ────────────────────────────────────────────────────

  let parsed
  try {
    parsed = JSON.parse(output.trim())
  } catch {
    return { outcome: 'syntaxError', steps: [], result: null, error: 'No output from code' }
  }

  const { steps: rawSteps, result, error } = parsed

  if (error === 'overflow') {
    const safeCalls = rawSteps.filter(s => s.type === 'call').slice(0, 8)
    return {
      outcome: 'overflow',
      steps:   [...safeCalls, { type: 'overflow', depth: 8 }],
      result:  null,
      error:   'RecursionError: max recursive calls exceeded',
    }
  }

  if (error) {
    return { outcome: 'syntaxError', steps: [], result: null, error }
  }

  // ── Enhance steps: mark base cases ──────────────────────────────────────

  const enhancedSteps = []
  for (let i = 0; i < rawSteps.length; i++) {
    const step = rawSteps[i]
    enhancedSteps.push(step)
    if (step.type === 'call') {
      const next = rawSteps[i + 1]
      if (next && next.type === 'return' && next.depth === step.depth) {
        enhancedSteps.push({ type: 'baseCase', depth: step.depth, label: step.label + ' → base case!', value: step.value })
      }
    }
  }

  const callCount = rawSteps.filter(s => s.type === 'call').length
  const outcome   = determineOutcome(level, callCount, result)

  return { outcome, steps: enhancedSteps, result, error: null }
}

// ── Outcome logic ─────────────────────────────────────────────────────────────

function determineOutcome(level, callCount, result) {
  if (level.id === 1) {
    if (callCount <= 1) return 'earlyExit'
    return 'success'
  }

  if (level.id === 2) {
    if (callCount <= 1) return 'earlyExit'
    if (result === level.initialValue) return 'success'
    return 'wrongResult'
  }

  return callCount > 1 ? 'success' : 'earlyExit'
}

// ── Unrecognized pattern check ────────────────────────────────────────────────

export function isUnrecognizedCode(userCode, functionName) {
  const hasRecursion   = new RegExp(`\\b${functionName}\\s*\\(`).test(userCode)
  const hasConditional = /\bif\b/.test(userCode)   // Python `if` has no parens
  return hasRecursion && !hasConditional
}

// ── Error formatting ──────────────────────────────────────────────────────────

function formatPythonError(type, msg) {
  if (type === 'SyntaxError' || type === 'IndentationError') {
    return `${type}: ${msg}`
  }
  return msg || type || 'Unknown error'
}
