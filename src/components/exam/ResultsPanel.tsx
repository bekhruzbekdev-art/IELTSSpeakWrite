import { ArrowRight, TriangleAlert } from 'lucide-react';
import { formatBand } from '../../lib/format';
import type {
  CriterionAnalysis,
  ImportantError,
  SpeakingAnalysis,
  WritingAnalysis,
} from '../../types/exam';
import { AiPreviewNote } from '../ui/AiScoreBadge';
import { SectionHeading, Surface } from '../ui/Surface';
import './ResultsPanel.css';

/** Says plainly how much of a result is measured rather than estimated. */
function ConfidenceNote({ confidence }: { confidence: number }) {
  return (
    <p className="results__confidence">
      <TriangleAlert size={14} aria-hidden="true" />
      <span>
        Diagnostic confidence <strong>{Math.round(confidence * 100)}%</strong>. This
        build scores from measurable signals only — timing, length and structure.
        Criteria that need a transcript are marked as not assessed.
      </span>
    </p>
  );
}

function CriterionRow({ label, criterion }: { label: string; criterion: CriterionAnalysis }) {
  return (
    <li className="results__criterion">
      <div className="results__criterion-head">
        <span className="results__criterion-label">{label}</span>
        <span className="results__criterion-band">{formatBand(criterion.band)}</span>
      </div>

      {criterion.evidence.length > 0 && (
        <ul className="results__evidence">
          {criterion.evidence.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}

      {criterion.limitations.length > 0 && (
        <ul className="results__limitations">
          {criterion.limitations.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}

      {criterion.next_priority && (
        <p className="results__next">
          <ArrowRight size={13} aria-hidden="true" />
          {criterion.next_priority}
        </p>
      )}
    </li>
  );
}

function Priorities({ items }: { items: string[] }) {
  return (
    <ol className="results__priorities">
      {items.map((item, index) => (
        <li key={item}>
          <span className="results__priority-rank">{index + 1}</span>
          {item}
        </li>
      ))}
    </ol>
  );
}

export function SpeakingResults({ analysis }: { analysis: SpeakingAnalysis }) {
  const { criteria } = analysis;

  return (
    <div className="results">
      <AiPreviewNote />

      <Surface padding="lg">
        <div className="results__headline">
          <span className="results__headline-label">Estimated Band Score</span>
          <span className="results__headline-band">{formatBand(analysis.overall_band)}</span>
        </div>
        <ConfidenceNote confidence={analysis.confidence} />
      </Surface>

      <Surface padding="lg">
        <SectionHeading title="Criteria" />
        <ul className="results__criteria">
          <CriterionRow label="Fluency & Coherence" criterion={criteria.fluency_and_coherence} />
          <CriterionRow label="Lexical Resource" criterion={criteria.lexical_resource} />
          <CriterionRow
            label="Grammatical Range & Accuracy"
            criterion={criteria.grammatical_range_and_accuracy}
          />
          <CriterionRow label="Pronunciation" criterion={criteria.pronunciation} />
        </ul>
      </Surface>

      <Surface padding="lg">
        <SectionHeading title="Top 3 areas to improve" />
        <Priorities items={analysis.top_3_priorities} />
      </Surface>

      <Surface padding="lg">
        <SectionHeading title="By part" />
        <dl className="results__parts">
          <div>
            <dt>Part 1</dt>
            <dd>{analysis.part_analysis.part_1}</dd>
          </div>
          <div>
            <dt>Part 2</dt>
            <dd>{analysis.part_analysis.part_2}</dd>
          </div>
          <div>
            <dt>Part 3</dt>
            <dd>{analysis.part_analysis.part_3}</dd>
          </div>
        </dl>
      </Surface>
    </div>
  );
}

function ErrorReview({ errors }: { errors: ImportantError[] }) {
  if (errors.length === 0) {
    return <p className="results__empty">No checkable issues were found in this task.</p>;
  }

  return (
    <ul className="results__errors">
      {errors.map((error, index) => (
        <li key={`${error.original}-${index}`} className="results__error">
          <span className="results__error-tag">{error.category}</span>
          <p className="results__error-original">{error.original}</p>
          <p className="results__error-correction">{error.correction}</p>
          <p className="results__error-explanation">{error.explanation}</p>
        </li>
      ))}
    </ul>
  );
}

export function WritingResults({ analysis }: { analysis: WritingAnalysis }) {
  const tasks = [
    { label: 'Task 1', data: analysis.task_1 },
    { label: 'Task 2', data: analysis.task_2 },
  ];

  return (
    <div className="results">
      <AiPreviewNote />

      <Surface padding="lg">
        <div className="results__headline">
          <span className="results__headline-label">Estimated Band Score</span>
          <span className="results__headline-band">{formatBand(analysis.overall_band)}</span>
        </div>
        <ConfidenceNote confidence={analysis.confidence} />
      </Surface>

      {tasks.map(({ label, data }) => (
        <Surface key={label} padding="lg">
          <SectionHeading title={`${label} — criteria`} />
          <ul className="results__criteria">
            <CriterionRow
              label="Task Achievement / Response"
              criterion={data.criteria.task_achievement}
            />
            <CriterionRow
              label="Coherence & Cohesion"
              criterion={data.criteria.coherence_and_cohesion}
            />
            <CriterionRow label="Lexical Resource" criterion={data.criteria.lexical_resource} />
            <CriterionRow
              label="Grammatical Range & Accuracy"
              criterion={data.criteria.grammatical_range_and_accuracy}
            />
          </ul>

          <div className="results__error-block">
            <h3 className="results__subheading">Error review</h3>
            <ErrorReview errors={data.important_errors} />
          </div>
        </Surface>
      ))}

      <Surface padding="lg">
        <SectionHeading title="Top 3 areas to improve" />
        <Priorities items={analysis.top_3_priorities} />
      </Surface>
    </div>
  );
}
