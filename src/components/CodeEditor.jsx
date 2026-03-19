import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { Compartment } from '@codemirror/state'
import { python } from '@codemirror/lang-python'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import styles from './CodeEditor.module.css'

// ── Superliminal / clinical white theme ──────────────────────────────────────

const superliminalTheme = EditorView.theme({
  '&': {
    background:  'var(--bg)',
    color:       'var(--text)',
    fontSize:    '13px',
    fontFamily:  'var(--font)',
    height:      '100%',
    borderRadius: '0',
  },
  '.cm-editor':       { height: '100%' },
  '.cm-scroller':     { overflow: 'auto', fontFamily: 'var(--font)' },
  '.cm-content':      { padding: '8px 0', minHeight: '120px', caretColor: 'var(--blue)' },
  '.cm-line':         { padding: '1px 14px' },
  '.cm-gutters': {
    background:  'var(--bg-secondary)',
    color:       'var(--text-dim)',
    border:      'none',
    borderRight: '1px solid var(--border)',
    minWidth:    '40px',
  },
  '.cm-gutterElement':    { paddingRight: '10px' },
  '.cm-activeLineGutter': { background: 'var(--bg-card)' },
  '.cm-activeLine':       { background: 'rgba(37,99,235,0.04)' },
  '.cm-cursor':           { borderLeftColor: 'var(--blue)', borderLeftWidth: '2px' },
  '.cm-selectionBackground':              { background: 'rgba(37,99,235,0.15) !important' },
  '&.cm-focused .cm-selectionBackground':{ background: 'rgba(37,99,235,0.2) !important' },
  '.cm-matchingBracket': { background: 'rgba(249,115,22,0.15)', outline: '1px solid var(--accent)' },
})

const superliminalHighlight = HighlightStyle.define([
  { tag: tags.keyword,                        color: 'var(--blue)',   fontWeight: '700' },
  { tag: tags.controlKeyword,                 color: 'var(--blue)',   fontWeight: '700' },
  { tag: tags.function(tags.variableName),    color: 'var(--accent)' },
  { tag: tags.definition(tags.variableName),  color: 'var(--accent)' },
  { tag: tags.number,                         color: 'var(--purple)' },
  { tag: tags.string,                         color: '#16a34a'       },
  { tag: tags.comment,                        color: 'var(--text-dim)', fontStyle: 'italic' },
  { tag: tags.operator,                       color: 'var(--blue-dim)' },
  { tag: tags.variableName,                   color: 'var(--text)'   },
  { tag: tags.propertyName,                   color: '#0891b2'       },
  { tag: tags.bool,                           color: 'var(--purple)' },
])

// ── CodeEditor component ──────────────────────────────────────────────────────

const editableCompartment = new Compartment()

export default function CodeEditor({ level, onChange, disabled, errorLine, resetKey }) {
  const containerRef = useRef(null)
  const viewRef      = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Destroy previous instance if re-mounting for a new level or after reset
    viewRef.current?.destroy()

    const view = new EditorView({
      doc: level.starterCode ?? '',
      extensions: [
        basicSetup,
        python(),
        superliminalTheme,
        syntaxHighlighting(superliminalHighlight),
        EditorView.updateListener.of(update => {
          if (update.docChanged) onChange(update.state.doc.toString())
        }),
        editableCompartment.of(EditorView.editable.of(!disabled)),
        EditorView.lineWrapping,
      ],
      parent: containerRef.current,
    })

    viewRef.current = view
    // Seed onChange with initial value
    onChange(level.starterCode ?? '')

    return () => view.destroy()
  }, [level.id, resetKey]) // eslint-disable-line

  // Disable/enable based on prop change
  useEffect(() => {
    if (!viewRef.current) return
    viewRef.current.dispatch({
      effects: editableCompartment.reconfigure(EditorView.editable.of(!disabled)),
    })
  }, [disabled])

  return (
    <div className={styles.wrapper}>
      {/* Locked function signature — Python style */}
      <div className={styles.signature}>
        <span className={styles.kw}>def</span>{' '}
        <span className={styles.fn}>{level.functionName}</span>
        <span className={styles.punct}>(</span>
        <span className={styles.param}>{level.paramName}</span>
        <span className={styles.punct}>):</span>
      </div>

      {/* Error banner */}
      {errorLine && (
        <div className={styles.errorBanner}>
          ✗ {errorLine}
        </div>
      )}

      {/* CodeMirror mounts here */}
      <div
        ref={containerRef}
        className={`${styles.editor} ${disabled ? styles.editorDisabled : ''}`}
      />

    </div>
  )
}
