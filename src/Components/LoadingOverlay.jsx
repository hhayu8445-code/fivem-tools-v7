export default function LoadingOverlay({ message = 'Processing...' }) {
  return (
    <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm z-40 flex items-center justify-center rounded-xl">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 relative mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-fuchsia-500 animate-spin"></div>
        </div>
        <p className="text-zinc-300 text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
