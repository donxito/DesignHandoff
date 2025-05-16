interface FeatureVisualProps {
  activeFeature: number;
  features: {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[];
}

export default function FeatureVisual({
  activeFeature,
  features,
}: FeatureVisualProps) {
  return (
    <>
      {/* Feature 1: Design File Management */}
      {activeFeature === 0 && (
        <div className="w-full aspect-video bg-pink-100 dark:bg-pink-900/30 border-4 border-black dark:border-white rounded-lg overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4 p-4 w-full max-w-md">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-white dark:bg-gray-800 border-2 border-black dark:border-white rounded p-2 flex flex-col items-center justify-center text-center hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors cursor-pointer"
                >
                  <div className="w-full h-3/4 bg-gray-200 dark:bg-gray-700 mb-2 rounded flex items-center justify-center text-xs">
                    {i % 2 === 0 ? "IMG" : "DOC"}
                  </div>
                  <span className="text-xs font-pixel truncate w-full">
                    File-{i}.{i % 2 === 0 ? "png" : "pdf"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feature 2: Design Specifications */}
      {activeFeature === 1 && (
        <div className="w-full aspect-video bg-blue-100 dark:bg-blue-900/30 border-4 border-black dark:border-white rounded-lg overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-4 w-full max-w-md">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 h-8 bg-blue-200 dark:bg-blue-800 border-2 border-black dark:border-white"></div>
                <div className="w-16 h-8 bg-blue-400 border-2 border-black flex items-center justify-center text-xs font-pixel">
                  24px
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {["#FF5733", "#33FF57", "#3357FF", "#F3FF33"].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="aspect-square border-2 border-black dark:border-white rounded flex flex-col overflow-hidden"
                    >
                      <div
                        className="h-3/4"
                        style={{ backgroundColor: color }}
                      ></div>
                      <div className="h-1/4 bg-white dark:bg-gray-800 flex items-center justify-center text-xs font-pixel">
                        {color}
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="flex gap-2">
                <div className="w-16 h-16 bg-blue-200 dark:bg-blue-800 border-2 border-black dark:border-white flex items-center justify-center text-xs font-pixel">
                  16px
                </div>
                <div className="w-16 h-16 bg-blue-300 dark:bg-blue-700 border-2 border-black dark:border-white flex items-center justify-center text-xs font-pixel">
                  24px
                </div>
                <div className="w-16 h-16 bg-blue-400 dark:bg-blue-600 border-2 border-black dark:border-white flex items-center justify-center text-xs font-pixel">
                  32px
                </div>
                <div className="w-16 h-16 bg-blue-500 dark:bg-blue-500 border-2 border-black dark:border-white flex items-center justify-center text-xs font-pixel">
                  48px
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature 3: Asset Management */}
      {activeFeature === 2 && (
        <div className="w-full aspect-video bg-yellow-100 dark:bg-yellow-900/30 border-4 border-black dark:border-white rounded-lg overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-6 gap-2 p-4 w-full">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square ${
                    i % 3 === 0
                      ? "bg-yellow-300"
                      : i % 3 === 1
                        ? "bg-pink-300"
                        : "bg-blue-300"
                  } dark:opacity-80 border-2 border-black dark:border-white rounded flex items-center justify-center text-black text-xs font-bold hover:scale-110 transition-transform cursor-pointer`}
                >
                  {i % 5 === 0
                    ? "★"
                    : i % 4 === 0
                      ? "◆"
                      : i % 3 === 0
                        ? "●"
                        : i % 2 === 0
                          ? "▲"
                          : "◼"}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-yellow-400 border-4 border-black rounded-lg transform rotate-12 z-[-1]"></div>
      <div className="absolute -top-8 -left-8 w-20 h-20 bg-pink-400 border-4 border-black rounded-full transform -rotate-12 z-[-1]"></div>
    </>
  );
}
