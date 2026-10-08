import React from 'react';

export default function RestockModal({
  showRestockModal,
  setShowRestockModal,
  SUPPLIERS,
  products,
  formatProduct,
  centralInventory,
  restockCart,
  setRestockCart,
  handleBulkRestock,
  isSubmitting
}) {
  if (!showRestockModal) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowRestockModal(false)}></div>
      <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        <div className="bg-brand-brown p-6 text-white flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="text-2xl font-calistoga tracking-wide flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Ingreso de Mercancía
            </h3>
            <p className="text-brand-bg/80 text-sm mt-1">Directorio de proveedores y registro de bodega</p>
          </div>
          <button onClick={() => setShowRestockModal(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-brand-bg">
          <div className="mb-8">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">1. Contactar Proveedores</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SUPPLIERS.map(supplier => (
                <a 
                  key={supplier.id}
                  href={supplier.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white border border-emerald-200 p-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-50 transition-colors shadow-sm group cursor-pointer"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{supplier.emoji}</span>
                  <span className="text-xs font-bold text-brand-brown text-center leading-tight">Proveedor<br/>{supplier.name}</span>
                </a>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">Toca un botón para contactar al proveedor directamente.</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">2. Ingresar a Bodega Central</h4>
            <div className="bg-white rounded-2xl border border-brand-brown/10 shadow-sm overflow-hidden">
              {products.map(product => {
                const { cartTitle, cartSubtitle, catColor } = formatProduct(product);
                const isSingle = product.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'unico';
                const currentStock = centralInventory.find(i => String(i.product_id) === String(product.id))?.stock_quantity || 0;
                
                return (
                  <div key={product.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <div className="flex items-center gap-3 overflow-hidden pr-3">
                      <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }}></div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-brand-brown truncate">{cartTitle}</p>
                        {!isSingle && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{cartSubtitle} {product.weight_g ? `(${product.weight_g}g)` : ''}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actual</p>
                        <p className={`text-sm font-black ${currentStock <= 10 ? 'text-red-500' : 'text-brand-brown'}`}>{currentStock}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-brand-green font-black text-lg">+</span>
                        <input 
                          type="number" 
                          min="0"
                          placeholder="0"
                          value={restockCart[product.id] || ''}
                          onChange={(e) => setRestockCart(prev => ({...prev, [product.id]: parseInt(e.target.value) || 0}))}
                          className="w-16 bg-brand-bg border border-brand-brown/20 rounded-lg px-2 py-1.5 text-center font-bold text-brand-brown focus:border-brand-green outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-brand-brown/10 flex-shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <button 
            onClick={handleBulkRestock} 
            disabled={isSubmitting}
            className={`w-full text-white font-black py-4 rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wider text-sm flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400' : 'bg-brand-green hover:bg-brand-green-dark'}`}
          >
            {isSubmitting ? 'Guardando Ingreso...' : 'Confirmar Ingreso a Bodega'}
          </button>
        </div>
      </div>
    </div>
  );
}