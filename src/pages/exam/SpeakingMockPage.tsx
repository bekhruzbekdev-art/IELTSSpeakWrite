import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { SpeakingMock } from '../../components/exam/SpeakingMock';
import { useAppData } from '../../state/AppDataContext';

export function SpeakingMockPage() {
  const {
    startingPoint,
    beginSpeakingMock,
    recordSpeakingAnswer,
    advanceSpeakingCursor,
    submitSpeakingMock,
    exitExamMode,
  } = useAppData();
  const navigate = useNavigate();

  const { speaking } = startingPoint;

  useEffect(() => {
    if (speaking.status !== 'submitted') beginSpeakingMock();
  }, [speaking.status, beginSpeakingMock]);

  // Submitted papers are read-only — send the candidate to the results.
  if (speaking.status === 'submitted') {
    return <Navigate to="/sprint/starting-point" replace />;
  }

  return (
    <SpeakingMock
      startCursor={speaking.cursor}
      onAnswer={recordSpeakingAnswer}
      onCursor={advanceSpeakingCursor}
      onSubmit={() => {
        submitSpeakingMock();
        navigate('/sprint/starting-point');
      }}
      onExit={() => {
        exitExamMode();
        navigate('/sprint/starting-point');
      }}
    />
  );
}
