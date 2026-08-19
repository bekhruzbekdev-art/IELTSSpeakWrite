import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { WritingMock } from '../../components/exam/WritingMock';
import { useAppData } from '../../state/AppDataContext';

export function WritingMockPage() {
  const {
    startingPoint,
    beginWritingMock,
    saveWritingResponse,
    setWritingRemaining,
    submitWritingMock,
    exitExamMode,
  } = useAppData();
  const navigate = useNavigate();

  const { writing } = startingPoint;

  useEffect(() => {
    if (writing.status !== 'submitted') beginWritingMock();
  }, [writing.status, beginWritingMock]);

  if (writing.status === 'submitted') {
    return <Navigate to="/sprint/starting-point" replace />;
  }

  return (
    <WritingMock
      responses={writing.responses}
      remainingMs={writing.remainingMs}
      onSave={saveWritingResponse}
      onRemaining={setWritingRemaining}
      onSubmit={(auto) => {
        submitWritingMock(auto);
        navigate('/sprint/starting-point');
      }}
      onExit={() => {
        exitExamMode();
        navigate('/sprint/starting-point');
      }}
    />
  );
}
