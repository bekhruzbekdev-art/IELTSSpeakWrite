import { Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatBand } from '../../lib/format';
import type { FocusTag } from '../../lib/adaptiveSprint';
import type { LearningProfileNote } from '../../types/exam';
import './DiagnosticNote.css';

interface DiagnosticNoteProps {
  note: LearningProfileNote;
  focuses: FocusTag[];
}

/** The AI Learning Profile Note — the diagnostic's output, and what drives Day 1. */
export function DiagnosticNote({ note, focuses }: DiagnosticNoteProps) {
  return (
    <div className="diagnostic-note">
      <div className="diagnostic-note__summary">
        <Sparkles size={16} aria-hidden="true" />
        <p>{note.note}</p>
      </div>

      <div className="diagnostic-note__grid">
        <section>
          <h3 className="diagnostic-note__heading">Weakest sub-skills</h3>
          <ul className="diagnostic-note__list">
            {note.weakestSubSkills.map((subSkill) => (
              <li key={subSkill.id}>
                <span className="diagnostic-note__skill">{subSkill.label}</span>
                <span className="diagnostic-note__skill-meta">
                  {subSkill.skill} · band {formatBand(subSkill.band)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="diagnostic-note__heading">Recurring error tags</h3>
          {note.recurringErrorTags.length === 0 ? (
            <p className="diagnostic-note__empty">None found by the pattern checks.</p>
          ) : (
            <ul className="diagnostic-note__tags">
              {note.recurringErrorTags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {focuses.length > 0 && (
        <section className="diagnostic-note__adaptive">
          <h3 className="diagnostic-note__heading">
            <Target size={14} aria-hidden="true" />
            What your early Sprint days will prioritise
          </h3>
          <ul className="diagnostic-note__focuses">
            {focuses.map((focus) => (
              <li key={focus.id}>
                <span className="diagnostic-note__focus-label">{focus.label}</span>
                <span className="diagnostic-note__focus-why">{focus.because}</span>
              </li>
            ))}
          </ul>
          <Link to="/sprint" className="diagnostic-note__link">
            See it on Day 1 →
          </Link>
        </section>
      )}
    </div>
  );
}
