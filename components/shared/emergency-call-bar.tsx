'use client';

interface EmergencyCallBarProps {
  /** Show the 1968 (national highway police) button — only relevant on highways */
  showHighway?: boolean;
}

export function EmergencyCallBar({ showHighway = false }: EmergencyCallBarProps) {
  return (
    <div className="rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/20 p-3">
      <div className="text-sm font-bold text-red-700 dark:text-red-300 mb-2 flex items-center gap-1">
        <span>🆘</span>
        <span>緊急通話（直接撥號）</span>
      </div>
      <div className="flex gap-2">
        <a href="tel:119" className="flex-1">
          <button className="w-full h-12 rounded-lg bg-red-600 text-white font-bold text-base hover:bg-red-700 active:bg-red-800 transition-colors">
            🚑 119 救護
          </button>
        </a>
        <a href="tel:110" className="flex-1">
          <button className="w-full h-12 rounded-lg bg-blue-600 text-white font-bold text-base hover:bg-blue-700 active:bg-blue-800 transition-colors">
            🚓 110 報警
          </button>
        </a>
        {showHighway && (
          <a href="tel:1968" className="flex-1">
            <button className="w-full h-12 rounded-lg bg-orange-600 text-white font-bold text-base hover:bg-orange-700 active:bg-orange-800 transition-colors">
              🛣️ 1968
            </button>
          </a>
        )}
      </div>
    </div>
  );
}
