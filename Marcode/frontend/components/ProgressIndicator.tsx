/**
 * Progress Indicator Component
 * Shows progress through different stages of comparison.
 */

interface ProgressIndicatorProps {
  stage: 'normalizing' | 'tokenizing' | 'comparing' | 'complete';
  timeElapsed?: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ stage, timeElapsed }) => {
  const stages = [
    { key: 'normalizing', label: 'Normalizing Code', completed: false },
    { key: 'tokenizing', label: 'Generating Fingerprints', completed: false },
    { key: 'comparing', label: 'Calculating Similarity', completed: false },
  ];

  const currentStageIndex = stages.findIndex(s => s.key === stage);
  
  stages.forEach((stageItem, index) => {
    if (index < currentStageIndex) {
      stageItem.completed = true;
    } else if (index === currentStageIndex && stage !== 'complete') {
      stageItem.completed = false;
    } else if (stage === 'complete') {
      stageItem.completed = true;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="space-y-4">
        {stages.map((stageItem, index) => (
          <div key={stageItem.key} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              stageItem.completed
                ? 'bg-green-500 text-white'
                : index === currentStageIndex
                ? 'bg-teal-500 text-white animate-pulse'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {stageItem.completed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${
                stageItem.completed
                  ? 'text-green-600'
                  : index === currentStageIndex
                  ? 'text-teal-600'
                  : 'text-gray-500'
              }`}>
                {stageItem.label}
              </p>
              {index === currentStageIndex && stage !== 'complete' && (
                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-teal-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {timeElapsed !== undefined && timeElapsed > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Time elapsed: <span className="font-semibold">{timeElapsed.toFixed(2)}s</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;

