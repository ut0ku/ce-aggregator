export default function SkeletonBlock({ tk }) {
  return (
    <div className="animate-pulse">
      <div className={`aspect-video w-full rounded-3xl ${tk.skeleton}`} />
      <div className={`h-7 w-2/3 rounded mt-4 ${tk.skeleton}`} />
      <div className={`h-4 w-full rounded mt-3 ${tk.skeleton}`} />
      <div className={`h-4 w-5/6 rounded mt-2 ${tk.skeleton}`} />
      <div className="mt-8 space-y-5">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex gap-4">
            <div className={`w-28 h-20 sm:w-32 sm:h-24 rounded-2xl flex-shrink-0 ${tk.skeleton}`} />
            <div className="flex-1 space-y-2 py-1">
              <div className={`h-4 w-4/5 rounded ${tk.skeleton}`} />
              <div className={`h-3 w-3/5 rounded ${tk.skeleton}`} />
              <div className={`h-3 w-2/5 rounded ${tk.skeleton}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}