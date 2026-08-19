import { BandDumbbell } from '../components/analytics/BandDumbbell';
import { BarChart, type BarDatum } from '../components/analytics/BarChart';
import { ComparisonPanel } from '../components/analytics/ComparisonPanel';
import { InsightCard } from '../components/analytics/InsightCard';
import { ProgressBanner } from '../components/analytics/ProgressBanner';
import { AiPreviewNote } from '../components/ui/AiScoreBadge';
import { formatBand } from '../lib/format';
import { PageHeader, SectionHeading, Surface } from '../components/ui/Surface';
import { demoLearningProfile as profile } from '../data/demo';
import './LearningProfilePage.css';

export function LearningProfilePage() {
  const errorData: BarDatum[] = profile.errorTrend.map((point) => ({
    id: `error-${point.day}`,
    label: point.label,
    value: point.errors,
    valueLabel: 'errors',
  }));

  const errorMax = Math.max(...profile.errorTrend.map((p) => p.errors));

  const partData: BarDatum[] = profile.speakingParts.map((part) => ({
    id: part.id,
    label: part.label,
    value: part.band,
  }));

  return (
    <div className="learning-page">
      <PageHeader
        title="Learning Profile"
        subtitle="How your Speaking and Writing have moved across the Sprint"
      />

      <AiPreviewNote />

      <ProgressBanner
        startingBand={profile.startingBand}
        currentBand={profile.currentBand}
        maxBand={profile.maxBand}
      />

      <div className="learning-page__split">
        <Surface padding="lg">
          <BandDumbbell
            title="Writing criteria"
            criteria={profile.writing}
            maxBand={profile.maxBand}
          />
        </Surface>

        <Surface padding="lg">
          <BandDumbbell
            title="Speaking criteria"
            criteria={profile.speaking}
            maxBand={profile.maxBand}
          />
        </Surface>
      </div>

      <div className="learning-page__split">
        <Surface padding="lg">
          <BarChart
            title="Speaking parts"
            description="Latest estimated band for each part of the Speaking test."
            data={partData}
            max={profile.maxBand}
            scaleLabel={`Band scale 0–${profile.maxBand}`}
            formatValue={formatBand}
          />
        </Surface>

        <Surface padding="lg">
          <BarChart
            title="Grammar errors over time"
            description="Errors flagged per written submission. Shorter is better."
            data={errorData}
            max={errorMax}
            scaleLabel={`Errors per submission · peak ${errorMax}`}
          />
        </Surface>
      </div>

      <Surface padding="lg">
        <SectionHeading
          title="AI insights"
          description="Generated from your submissions. Your teacher reviews these."
        />
        <div className="learning-page__insights">
          {profile.insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </Surface>

      <Surface padding="lg">
        <SectionHeading
          title="Day 1 vs Day 30"
          description="Your first submission against your most recent one."
        />
        <ComparisonPanel
          first={profile.comparison.first}
          latest={profile.comparison.latest}
        />
      </Surface>
    </div>
  );
}
