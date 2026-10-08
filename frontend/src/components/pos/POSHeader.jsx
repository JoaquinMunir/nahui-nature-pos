import React from 'react';

export default function POSHeader({
  renderRouteButtons,
  isStoreView,
  showOrders,
  setShowOrders,
  showInventory,
  setShowInventory
}) {
  return (
    <>
      {/* --- BARRA SUPERIOR EXCLUSIVA PARA MÓVIL HORIZONTAL --- */}
      <div className="hidden max-lg:landscape:flex fixed top-0 left-0 right-0 h-[60px] bg-brand-bg/95 backdrop-blur-md border-b border-brand-brown/10 z-50 px-4 items-center justify-between transition-all">
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src="/icon-192.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
          <h1 className="flex items-baseline gap-1">
            <span className="font-calistoga text-brand-brown uppercase text-lg tracking-tight">Nahui</span>
            <span className="font-satisfy text-brand-green lowercase text-xl">nature</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {renderRouteButtons()}
        </div>
      </div>

      {/* --- FILA 1: LOGO Y TÍTULO --- */}
      <div className="w-full bg-brand-bg max-lg:landscape:hidden">
        <div className="px-3 py-3 sm:px-4 sm:pt-4 md:px-10 md:pt-10 flex items-center justify-between w-full max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <img src="/icon-192.png" alt="Logo Nahui Nature" className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 object-contain drop-shadow-sm" />
            <h1 className="flex items-baseline gap-1 sm:gap-2">
              <span className="font-calistoga text-brand-brown uppercase text-2xl sm:text-4xl md:text-6xl tracking-tight">Nahui</span>
              <span className="font-satisfy text-brand-green lowercase text-3xl sm:text-5xl md:text-7xl">nature</span>
            </h1>
          </div>
          <div className="flex-shrink flex items-center justify-end">
            <p className="text-brand-brown/70 font-bold text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">
              Punto de Venta Móvil
            </p>
          </div>
        </div>
      </div>

      {/* --- FILA 2: CARRUSEL Y BOTONES (Sticky en PC/Vertical, BOTONES FLOTANTES CIRCULARES en Horizontal) --- */}
      <header className="bg-brand-bg/95 backdrop-blur-md z-40 w-full transition-all sticky top-0 border-b border-brand-brown/10 shadow-sm max-lg:landscape:fixed max-lg:landscape:left-3 max-lg:landscape:top-[80px] max-lg:landscape:w-auto max-lg:landscape:border-none max-lg:landscape:bg-transparent max-lg:landscape:shadow-none">
        
        <div className="px-3 py-3 sm:px-4 sm:pb-3 md:px-10 max-w-[1400px] mx-auto w-full flex justify-between items-center gap-4 max-lg:landscape:flex-col max-lg:landscape:px-0 max-lg:landscape:gap-3 max-lg:landscape:mt-0">
          
          {/* CARRUSEL DE NAVEGACIÓN */}
          <div className="flex overflow-x-auto gap-2 flex-1 w-full max-lg:landscape:flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button 
              onClick={() => { setShowOrders(false); setShowInventory(false); }} 
              className={`border-2 font-bold px-4 py-2 max-lg:landscape:w-12 max-lg:landscape:h-12 max-lg:landscape:p-0 rounded-xl max-lg:landscape:rounded-full transition-all shadow-sm max-lg:landscape:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 hover:scale-105 ${!showOrders && !showInventory ? 'bg-brand-brown text-white border-brand-brown' : 'bg-white text-brand-brown border-brand-brown hover:bg-brand-brown/10'}`}
              title="Tienda"
            >
              <svg className="w-4 h-4 max-lg:landscape:w-6 max-lg:landscape:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="max-lg:landscape:hidden text-sm">Tienda</span>
            </button>
            <button 
              onClick={() => { setShowOrders(true); setShowInventory(false); }} 
              className={`border-2 font-bold px-4 py-2 max-lg:landscape:w-12 max-lg:landscape:h-12 max-lg:landscape:p-0 rounded-xl max-lg:landscape:rounded-full transition-all shadow-sm max-lg:landscape:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 hover:scale-105 ${showOrders ? 'bg-brand-brown text-white border-brand-brown' : 'bg-white text-brand-brown border-brand-brown hover:bg-brand-brown/10'}`}
              title="Ventas"
            >
              <svg className="w-4 h-4 max-lg:landscape:w-6 max-lg:landscape:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="max-lg:landscape:hidden text-sm">Ventas</span>
            </button>
            <button 
              onClick={() => { setShowInventory(true); setShowOrders(false); }} 
              className={`border-2 font-bold px-4 py-2 max-lg:landscape:w-12 max-lg:landscape:h-12 max-lg:landscape:p-0 rounded-xl max-lg:landscape:rounded-full transition-all shadow-sm max-lg:landscape:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 hover:scale-105 ${showInventory ? 'bg-brand-brown text-white border-brand-brown' : 'bg-white text-brand-brown border-brand-brown hover:bg-brand-brown/10'}`}
              title="Bodega"
            >
              <svg className="w-4 h-4 max-lg:landscape:w-6 max-lg:landscape:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <span className="max-lg:landscape:hidden text-sm">Bodega</span>
            </button>
          </div>

          {/* BOTONES DE RUTA Y ESTADO */}
          <div className="flex items-center gap-2 flex-shrink-0 max-lg:landscape:hidden">
            {renderRouteButtons()}
          </div>
        </div>
      </header>
    </>
  );
}