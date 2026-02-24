/**
 * Loading state indicator for the map
 */
export function LoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading GLOWdex...</p>
      </div>
    </div>
  );
}
