import { useEffect, useRef } from 'react';
import type { InteractionEvent } from '@glyphjs/types';
import type { InteractionLogEntry } from './useInteractionLog.js';

function summarize(event: InteractionEvent): string {
  switch (event.kind) {
    case 'quiz-submit':
      return `Q${event.payload.questionIndex + 1}: ${event.payload.correct ? 'Correct' : 'Incorrect'} (${event.payload.score.correct}/${event.payload.score.total})`;
    case 'table-sort':
      return `Sort ${event.payload.column} ${event.payload.direction}`;
    case 'table-filter':
      return `Filter ${event.payload.column}: "${event.payload.value}"`;
    case 'tab-select':
      return `Selected tab: ${event.payload.tabLabel}`;
    case 'accordion-toggle':
      return `${event.payload.expanded ? 'Expanded' : 'Collapsed'}: ${event.payload.sectionTitle}`;
    case 'filetree-select':
      return `Selected ${event.payload.type}: ${event.payload.path}`;
    case 'graph-node-click':
      return `Clicked node: ${event.payload.nodeLabel ?? event.payload.nodeId}`;
    case 'chart-select':
      return `Selected: ${event.payload.label} = ${event.payload.value}`;
    case 'comparison-select':
      return `Selected option: ${event.payload.optionName}`;
    default:
      return `Custom event`;
  }
}

interface EventLogProps {
  events: InteractionLogEntry[];
  onClear: () => void;
}

export default function EventLog({ events, onClear }: EventLogProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (events.length > 0 && !hasAutoOpened.current && detailsRef.current) {
      detailsRef.current.open = true;
      hasAutoOpened.current = true;
    }
  }, [events.length]);

  return (
    <details
      ref={detailsRef}
      style={{
        marginTop: '0.75rem',
        border: '1px solid var(--sl-color-gray-5, #dce1e8)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <summary
        style={{
          padding: '0.5rem 0.75rem',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.8125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--sl-color-gray-7, #f5f6f8)',
          color: 'var(--sl-color-white, #18181b)',
          userSelect: 'none',
        }}
      >
        Interaction Events
        {events.length > 0 && (
          <span
            style={{
              background: 'var(--sl-color-accent, #3b82f6)',
              color: '#fff',
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '0.1rem 0.45rem',
              borderRadius: '9999px',
              lineHeight: '1.4',
            }}
          >
            {events.length}
          </span>
        )}
      </summary>

      <div
        style={{
          padding: '0.5rem 0.75rem',
          maxHeight: '300px',
          overflowY: 'auto',
          background: 'var(--sl-color-gray-7, #f8f9fb)',
        }}
      >
        {events.length > 0 && (
          <div style={{ marginBottom: '0.5rem', textAlign: 'right' }}>
            <button
              onClick={onClear}
              type="button"
              style={{
                background: 'none',
                border: '1px solid var(--sl-color-gray-5, #dce1e8)',
                borderRadius: '3px',
                padding: '0.15rem 0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                color: 'var(--sl-color-gray-2, #7a8599)',
              }}
            >
              Clear
            </button>
          </div>
        )}

        {events.length === 0 ? (
          <p
            style={{
              color: 'var(--sl-color-gray-3, #7a8599)',
              fontStyle: 'italic',
              fontSize: '0.8125rem',
              margin: '0.5rem 0',
            }}
          >
            Interact with the component above to see events here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {events.map((entry) => (
              <div
                key={entry.id}
                style={{
                  border: '1px solid var(--sl-color-gray-5, #dce1e8)',
                  borderRadius: '3px',
                  padding: '0.375rem 0.5rem',
                  background: 'var(--sl-color-gray-6, #fff)',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <code
                    style={{
                      background: 'var(--sl-color-gray-5, #e8ebf0)',
                      padding: '0.05rem 0.35rem',
                      borderRadius: '3px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.event.kind}
                  </code>
                  <span
                    style={{
                      color: 'var(--sl-color-white, #18181b)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    {summarize(entry.event)}
                  </span>
                </div>

                <details style={{ marginTop: '0.25rem' }}>
                  <summary
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--sl-color-gray-2, #7a8599)',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    Payload
                  </summary>
                  <pre
                    style={{
                      margin: '0.25rem 0 0',
                      padding: '0.375rem',
                      background: 'var(--sl-color-gray-6, #f5f6f8)',
                      borderRadius: '3px',
                      fontSize: '0.6875rem',
                      lineHeight: '1.5',
                      overflow: 'auto',
                      maxHeight: '150px',
                    }}
                  >
                    {JSON.stringify(entry.event.payload, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}
