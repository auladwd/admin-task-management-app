/**
 * Loading Spinner Component
 * Displays a centered loading spinner
 */
export default function Loading({ fullScreen = true, size = 'lg' }) {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  };

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <span
            className={`loading loading-spinner ${sizeClasses[size]} text-primary`}
          ></span>
          <p className="mt-4 text-base-content/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <span
        className={`loading loading-spinner ${sizeClasses[size]} text-primary`}
      ></span>
    </div>
  );
}
