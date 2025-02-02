"use client";

const BookCard = ({ id, title, author, progress, color, onDelete, onProgressUpdate }) => {
  const handleProgressUpdate = async (newProgress) => {
    if (newProgress >= 0 && newProgress <= 100 && typeof onProgressUpdate === 'function') {
      await onProgressUpdate(id, newProgress);
    }
  };

  return (
    <div
      className={`w-full p-6 mb-4 rounded-xl transition-all duration-300 hover:translate-x-2 ${color}`}
    >
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{author}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleProgressUpdate(Math.max(0, progress - 10))}
              className="w-8 h-8 rounded-lg bg-black/10 flex items-center text-black justify-center hover:bg-black/20"
            >
              -
            </button>
            <div className="w-12 h-12 rounded-lg bg-black/10 flex items-center justify-center">
              <span className="text-lg text-black font-semibold">
                {progress}%
              </span>
            </div>
            <button
              onClick={() => handleProgressUpdate(Math.min(100, progress + 10))}
              className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-black hover:bg-black/20"
            >
              +
            </button>
          </div>
          {typeof onDelete === "function" && (
            <button
              onClick={() => onDelete(id)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
