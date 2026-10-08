import React from 'react';

export default function CartSidebar({
  cart, isCartOpen, setIsCartOpen, isStoreView, totalItems, totalOrder,
  sendWhatsApp, setSendWhatsApp, isSubmitting, activeClient,
  removeFromCart, handleSetQuantity, addToCart, clearCart,
  formatProduct, handleCheckout
}) {
  return (
    <>
      {/* === PANEL DERECHO === */}
      {isStoreView && (
        <div className="hidden landscape:flex landscape:col-span-4 sticky top-16 lg:top-24 flex-col bg-white rounded-3xl shadow-sm border border-brand-brown/10 h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-7rem)] overflow-hidden">
          <div className="p-2.5 px-4 lg:p-4 border-b border-brand-brown/10 bg-brand-bg flex justify-between items-center flex-shrink-0">
            <h2 className="text-lg lg:text-xl font-calistoga text-brand-brown">Orden</h2>
            <div className="flex items-center gap-2">
              <span className="bg-brand-green text-white font-sans text-[10px] lg:text-xs py-0.5 px-2.5 lg:py-1 lg:px-3 rounded-full font-bold">{totalItems} items</span>
              <button onClick={clearCart} className="text-red-500 hover:text-red-700 p-1" title="Vaciar">
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2.5 lg:p-4 bg-brand-bg/30 flex flex-col justify-start lg:justify-start">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center opacity-70 h-full min-h-[120px] lg:min-h-[200px]">
                <span className="text-3xl lg:text-4xl mb-1 lg:mb-2">🛒</span>
                <p className="text-xs lg:text-sm font-bold text-brand-brown text-center">El carrito está vacío</p>
              </div>
            ) : (
              <ul className="space-y-2 lg:space-y-3">
                {cart.map(item => {
                  const { cartTitle, cartSubtitle, cartSubtitleColor, catColor } = formatProduct(item)
                  return (
                    <li key={item.id} className="flex justify-between items-center p-2 lg:p-3 bg-white rounded-xl shadow-sm border border-brand-brown/5 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: catColor }}></div>
                      <div className="flex-1 pl-2.5 lg:pl-3 pr-2 min-w-0">
                        <p className="font-bold text-brand-brown text-xs lg:text-sm leading-tight truncate">{cartTitle}</p>
                        <div className="flex items-center gap-1 flex-wrap mt-0.5 lg:mt-0">
                          {cartSubtitle && <span className={`text-[7px] lg:text-[8px] font-bold uppercase tracking-widest px-1 py-0.5 lg:px-1.5 rounded shadow-sm whitespace-nowrap ${cartSubtitleColor}`}>{cartSubtitle}</span>}
                          <p className="text-[10px] lg:text-xs text-brand-green font-bold">${item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center w-[70px] lg:w-[90px] xl:w-[100px] justify-between bg-brand-bg rounded-lg border border-brand-brown/10 h-6 lg:h-8 overflow-hidden flex-shrink-0">
                        <button onClick={() => removeFromCart(item.id)} className="w-5 lg:w-8 h-full bg-white hover:text-red-500 font-bold text-xs lg:text-sm">-</button>
                        <input type="number" value={item.quantity} onChange={(e) => handleSetQuantity(item, e.target.value)} className="w-full text-center font-black text-xs lg:text-sm text-brand-brown bg-transparent outline-none appearance-none m-0" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
                        <button onClick={() => addToCart(item)} className="w-5 lg:w-8 h-full bg-white hover:text-brand-green font-bold text-xs lg:text-sm">+</button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          
          <div className="p-3 lg:p-4 border-t border-brand-brown/10 bg-white flex-shrink-0 space-y-2 lg:space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs lg:text-sm font-bold text-brand-brown uppercase tracking-widest font-calistoga">Total</span>
              <span className="text-xl lg:text-3xl font-black text-brand-green tracking-tighter">${totalOrder.toFixed(2)}</span>
            </div>
            <label className="flex items-center justify-between bg-emerald-50/50 px-2.5 py-1.5 lg:p-3 rounded-lg border border-emerald-100 cursor-pointer hover:bg-emerald-50 transition-colors">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                <span className="text-[9px] lg:text-[10px] font-bold text-emerald-800">WhatsApp</span>
              </div>
              <input type="checkbox" checked={sendWhatsApp} onChange={() => { const newVal = !sendWhatsApp; setSendWhatsApp(newVal); localStorage.setItem('sendWhatsApp', newVal); }} className="w-3 h-3 lg:w-4 lg:h-4 accent-emerald-600 rounded cursor-pointer" />
            </label>
            <button onClick={handleCheckout} disabled={isSubmitting || cart.length === 0 || !activeClient} className={`w-full text-white py-2.5 lg:py-4 rounded-xl font-black text-xs lg:text-sm transition-all shadow-md uppercase tracking-wide flex justify-center items-center gap-2 ${isSubmitting || cart.length === 0 || !activeClient ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-green hover:bg-brand-green-dark active:scale-[0.98]'}`}>
              {isSubmitting ? '...' : cart.length === 0 ? 'Carrito Vacío' : 'Cobrar Orden'}
            </button>
          </div>
        </div>
      )}

      {/* BOTON FLOTANTE MOVIL */}
      {cart.length > 0 && (
        <button onClick={() => setIsCartOpen(true)} className={`fixed bottom-8 right-8 z-40 bg-brand-green hover:bg-brand-green-dark text-white p-4 rounded-full shadow-[0_10px_25px_rgba(91,138,60,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 ${isStoreView ? 'max-lg:landscape:hidden' : ''}`}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <div className="bg-white text-brand-green font-black rounded-full h-7 w-7 flex items-center justify-center text-sm border-2 border-white">{totalItems}</div>
        </button>
      )}

      {/* OVERLAY Y DRAWER MOVIL */}
      {isCartOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsCartOpen(false)} />}

      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-brand-bg shadow-2xl transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col border-l border-brand-brown/10 ${isStoreView ? 'max-lg:landscape:hidden' : ''}`}>
        <div className="p-6 border-b border-brand-brown/10 flex justify-between items-start bg-white">
          <div>
            <h2 className="text-2xl font-calistoga text-brand-brown flex items-center gap-3">Orden Actual <span className="bg-brand-green text-white font-sans text-xs py-1 px-3 rounded-full font-bold">{totalItems} items</span></h2>
            <button onClick={clearCart} className="text-sm leading-none text-red-500 hover:text-red-700 font-bold mt-3 flex items-center gap-1.5 transition-colors"><svg className="w-4 h-4 mt-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Vaciar carrito</button>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-brand-brown hover:bg-brand-bg rounded-full"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-brand-bg">
          <ul className="space-y-4">
            {cart.map(item => {
              const { cartTitle, cartSubtitle, cartSubtitleColor, catColor } = formatProduct(item)
              return (
                <li key={item.id} className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-brand-brown/5 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: catColor }}></div>
                  <div className="flex-1 pl-3 pr-2 min-w-0">
                    <p className="font-bold text-brand-brown text-sm leading-tight mb-1 truncate">{cartTitle}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {cartSubtitle && <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap ${cartSubtitleColor}`}>{cartSubtitle}</span>}
                      <p className="text-xs text-brand-green font-bold">${item.price} c/u</p>
                    </div>
                  </div>
                  <div className="flex items-center w-[90px] sm:w-[100px] justify-between bg-brand-bg rounded-lg border border-brand-brown/10 h-8 overflow-hidden flex-shrink-0">
                    <button onClick={() => removeFromCart(item.id)} className="w-8 h-full bg-white hover:text-red-500 font-bold">-</button>
                    <input type="number" value={item.quantity} onChange={(e) => handleSetQuantity(item, e.target.value)} className="w-full text-center font-black text-xs sm:text-sm text-brand-brown bg-transparent outline-none appearance-none m-0" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
                    <button onClick={() => addToCart(item)} className="w-8 h-full bg-white hover:text-brand-green font-bold">+</button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="p-6 border-t border-brand-brown/10 bg-white">
          <div className="flex justify-between items-end mb-4">
            <span className="text-lg font-bold text-brand-brown uppercase tracking-widest font-calistoga">Total</span>
            <span className="text-4xl font-black text-brand-green tracking-tighter">${totalOrder.toFixed(2)}</span>
          </div>

          <label className="flex items-center justify-between mb-4 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-50 transition-colors shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              <span className="text-[10px] font-bold text-emerald-800">WhatsApp</span>
            </div>
            <input 
              type="checkbox" 
              checked={sendWhatsApp} 
              onChange={() => {
                const newVal = !sendWhatsApp;
                setSendWhatsApp(newVal);
                localStorage.setItem('sendWhatsApp', newVal);
              }} 
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer" 
            />
          </label>

          <button onClick={handleCheckout} disabled={isSubmitting || cart.length === 0 || !activeClient} className={`w-full text-white py-4 rounded-xl font-black text-lg transition-all shadow-lg uppercase tracking-wide flex justify-center items-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-green hover:bg-brand-green-dark shadow-brand-green/30 active:scale-[0.98]'}`}>
          {isSubmitting ? 'Procesando...' : 'Cobrar Orden'}
          </button>
        </div>
      </div>
    </>
  );
}