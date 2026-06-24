import logo from '@/assets/globalwetlands.png';

export function LoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50">
      <div className="text-center">
        <img
          src={logo}
          alt="MBCAM"
          className="w-16 h-16 mx-auto mb-4 animate-pulse"
        />
        <p className="text-gray-500 font-medium text-sm">Loading MBCAM...</p>
      </div>
    </div>
  );
}
