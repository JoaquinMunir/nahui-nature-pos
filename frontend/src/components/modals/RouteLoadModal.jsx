import React from 'react';

export default function RouteLoadModal({
  showRouteLoadModal,
  setShowRouteLoadModal,
  products,
  formatProduct,
  centralInventory,
  routeLoadCart,
  setRouteLoadCart,
  handleBulkRouteLoad,
  isSubmitting
}) {
  if (!showRouteLoadModal) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowRouteLoadModal(false)}></div>
      <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

        <div className="bg-blue-600 p-6 max-lg:landscape:p-3 text-white flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="text-2xl max-lg:landscape:text-lg font-calistoga tracking-wide flex items-center gap-3 max-lg:landscape:gap-2">
              <span className="text-3xl max-lg:landscape:text-xl">🚚</span> Carga de Vehículo
            </h3>
            <p className="text-blue-100 text-xs max-lg:landscape:text-[9px] uppercase tracking-widest mt-1 max-lg:landscape:mt-0 font-bold">Traspaso Rápido (Central ➔ Móvil)</p>
          </div>
          <button onClick={() => setShowRouteLoadModal(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-brand-bg">
          <div className="bg-white rounded-2xl border border-brand-brown/10 shadow-sm overflow-hidden">
            {products.map(product => {
              const { cartTitle, cartSubtitle, catColor } = formatProduct(product);
              const stockCasa = centralInventory.find(i => String(i.product_id) === String(product.id))?.stock_quantity || 0;

              if (stockCasa === 0) return null;

              return (
                <div key={product.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <div className="flex items-center gap-3 overflow-hidden pr-3">
                    <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }}></div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-brand-brown truncate">{cartTitle}</p>
                      {cartSubtitle && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{cartSubtitle}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">En Bodega</p>
                      <p className="text-sm font-black text-brand-brown">{stockCasa}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={stockCasa}
                        placeholder="0"
                        value={routeLoadCart[product.id] || ''}
                        onChange={(e) => setRouteLoadCart(prev => ({...prev, [product.id]: parseInt(e.target.value) || 0}))}
                        className="w-16 bg-brand-bg border border-brand-brown/20 rounded-lg px-2 py-1.5 text-center font-bold text-blue-600 focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {products.filter(p => (centralInventory.find(i => String(i.product_id) === String(p.id))?.stock_quantity || 0) > 0).length === 0 && (
              <div className="p-8 text-center text-gray-500 font-bold text-sm">Bodega Central vacía.<br/>No hay mercancía para traspasar.</div>
            )}
          </div>
        </div>

        <div className="p-4 bg-white border-t border-brand-brown/10 flex-shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <button
            onClick={handleBulkRouteLoad}
            disabled={isSubmitting}
            className={`w-full text-white font-black py-4 rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wider text-sm flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Transfiriendo...' : 'Confirmar Carga y Salir'}
          </button>
        </div>

      </div>
    </div>
  );
}