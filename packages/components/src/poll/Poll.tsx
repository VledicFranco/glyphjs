import { useState, type ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';
import {
  containerStyle,
  headerStyle,
  questionStyle,
  optionsStyle,
  optionLabelStyle,
  voteButtonStyle,
  resultsStyle,
  resultRowStyle,
  resultLabelStyle,
  barTrackStyle,
  barFillStyle,
} from './styles.js';

// ─── Types ─────────────────────────────────────────────────────

export interface PollData {
  question: string;
  options: string[];
  multiple?: boolean;
  showResults?: boolean;
  title?: string;
}

// ─── Component ─────────────────────────────────────────────────

export function Poll({ data, block, onInteraction }: GlyphComponentProps<PollData>): ReactElement {
  const { question, options, multiple = false, showResults = true, title } = data;
  const baseId = `glyph-poll-${block.id}`;

  const [selected, setSelected] = useState<number[]>([]);
  const [votes, setVotes] = useState<number[]>(() => options.map(() => 0));
  const [hasVoted, setHasVoted] = useState(false);

  const toggleOption = (index: number): void => {
    if (hasVoted) return;
    if (multiple) {
      setSelected((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
      );
    } else {
      setSelected([index]);
    }
  };

  const handleVote = (): void => {
    if (selected.length === 0 || hasVoted) return;

    const newVotes = [...votes];
    for (const idx of selected) {
      newVotes[idx] = (newVotes[idx] ?? 0) + 1;
    }
    setVotes(newVotes);
    setHasVoted(true);

    if (onInteraction) {
      onInteraction({
        kind: 'poll-vote',
        timestamp: new Date().toISOString(),
        blockId: block.id,
        blockType: block.type,
        payload: {
          selectedOptions: selected.map((i) => options[i] ?? String(i)),
          selectedIndices: [...selected],
        },
      });
    }
  };

  const totalVotes = votes.reduce((a, b) => a + b, 0);

  return (
    <div id={baseId} role="region" aria-label={title ?? 'Poll'} style={containerStyle}>
      {title && <div style={headerStyle}>{title}</div>}
      <div style={questionStyle}>{question}</div>

      <div role="group" aria-label={question} style={optionsStyle}>
        {options.map((option, index) => (
          <label key={index} style={optionLabelStyle(selected.includes(index))}>
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={`${baseId}-option`}
              checked={selected.includes(index)}
              disabled={hasVoted}
              onChange={() => toggleOption(index)}
              aria-checked={selected.includes(index)}
            />
            {option}
          </label>
        ))}
      </div>

      {!hasVoted && (
        <button
          type="button"
          disabled={selected.length === 0}
          style={{
            ...voteButtonStyle,
            opacity: selected.length === 0 ? 0.5 : 1,
            cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
          }}
          onClick={handleVote}
        >
          Vote
        </button>
      )}

      {showResults && hasVoted && (
        <div role="status" aria-live="polite" style={resultsStyle}>
          {options.map((option, index) => {
            const count = votes[index] ?? 0;
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            return (
              <div key={index} style={resultRowStyle}>
                <div style={resultLabelStyle}>
                  <span>{option}</span>
                  <span>
                    {String(count)} vote{count !== 1 ? 's' : ''} ({String(Math.round(percentage))}%)
                  </span>
                </div>
                <div
                  style={barTrackStyle}
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${option}: ${String(Math.round(percentage))}%`}
                >
                  <div style={barFillStyle(percentage)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
