export default function RouteActions({ isOfflineMode, isOnRoad, onStartRoute, onEndRoute, onOpenExpense }) {
  return (
    <>
      {isOfflineMode && (
        <div className="inline-flex bg-amber-100 text-amber-800 px-3.5 py-1.5 sm:px-4.5 sm:py-2 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-sm items-center justify-center gap-1.5 border border-amber-300" title="Modo sin conexión">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="max-lg:landscape:hidden">Sin conexión</span>
        </div>
      )}

      {isOnRoad ? (
        <>
          <button onClick={onOpenExpense} className="bg-[#dd9d5c] hover:bg-[#b78049] text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 text-xs sm:text-sm uppercase tracking-wider">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
            <span className="max-lg:landscape:hidden">Gasto</span>
          </button>
          <button onClick={onEndRoute} className="bg-[#d24343] hover:bg-[#bb2929] text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 text-xs sm:text-sm uppercase tracking-wider">
            <span className="text-sm sm:text-base leading-none">🛑</span>
            <span className="max-lg:landscape:hidden">Terminar</span>
          </button>
        </>
      ) : (
        <button onClick={onStartRoute} className="bg-brand-green hover:bg-brand-green-dark text-white font-bold px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 text-xs sm:text-sm uppercase tracking-wider">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 scale-x-[-1] translate-y-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
          <span className="max-lg:landscape:hidden">Iniciar Ruta</span>
        </button>
      )}
    </>
  );
}