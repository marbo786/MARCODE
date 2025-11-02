/**
 * Score Card Component
 * Displays one similarity metric with progress bar.
 */

interface ScoreCardProps {
  label: string;
  value: number;
  isFinal?: boolean;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, value, isFinal = false }) => {
  const roundedValue = Math.round(value * 10) / 10;
  
  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-6 ${
        isFinal ? 'border-2 border-teal-500' : 'border border-gray-200'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className={`font-medium ${isFinal ? 'text-lg text-teal-700' : 'text-gray-700'}`}>
          {label}
        </span>
        <span className={`font-bold ${isFinal ? 'text-2xl text-teal-600' : 'text-xl text-gray-900'}`}>
          {roundedValue}%
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            isFinal
              ? 'bg-teal-600'
              : value >= 80
              ? 'bg-green-500'
              : value >= 50
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreCard;

