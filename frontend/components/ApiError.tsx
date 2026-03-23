interface ApiErrorProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

export default function ApiError({ message, onRetry, compact = false }: ApiErrorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm">
        <i className="bi bi-exclamation-circle-fill text-[#E63946]" />
        <span className="text-red-700 flex-1">{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-[#2C74B3] font-semibold hover:underline whitespace-nowrap"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <i className="bi bi-wifi-off text-3xl text-[#E63946]" />
      </div>
      <h3 className="text-lg font-bold text-[#0A2647] mb-2">Unable to load data</h3>
      <p className="text-gray-500 text-sm max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-[#2C74B3] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#0A2647] transition-all"
        >
          <i className="bi bi-arrow-clockwise mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
}
