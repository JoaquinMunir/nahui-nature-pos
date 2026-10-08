import React from 'react';

export default function CategoryModal({
  selectedCategory,
  setSelectedCategory,
  groupedProducts,
  expandedWeights,
  toggleWeight,
  cart,
  addToCart,
  removeFromCart,
  handleSetQuantity,
  formatProduct
}) {
  if (!selectedCategory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedCategory(null)}></div>
      <div className="bg-brand-bg w-full max-w-5xl max-h-[95vh] rounded-2xl sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="bg-white p-4 sm:p-6 max-lg:landscape:py-3 max-lg:landscape:px-6 border-b border-brand-brown/10 flex justify-between items-center shadow-sm z-10 flex-shrink-0">
          <div><h2 className="text-2xl sm:text-3xl max-lg:landscape:text-2xl font-calistoga text-brand-brown leading-none">{selectedCategory}</h2><p className="text-brand-green font-bold text-xs sm:text-sm max-lg:landscape:text-xs tracking-widest uppercase mt-1">Selecciona por gramaje</p></div>
          <button onClick={() => setSelectedCategory(null)} className="bg-brand-bg text-brand-brown hover:bg-red-100 hover:text-red-500 w-10 h-10 max-lg:landscape:w-8 max-lg:landscape:h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"><svg className="w-6 h-6 max-lg:landscape:w-5 max-lg:landscape:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        
        <div className="p-2 sm:p-6 max-lg:landscape:p-4 overflow-y-auto flex-1">
          {Object.keys(groupedProducts[selectedCategory].reduce((acc, item) => { const w = item.weight_g || '0'; if (!acc[w]) acc[w] = []; acc[w].push(item); return acc; }, {})).sort((a,b) => Number(a) - Number(b)).map(weight => {
            const subItems = groupedProducts[selectedCategory].filter(i => (i.weight_g || '0') == weight); const isExpanded = expandedWeights[weight];                return (
              <div key={weight} className="mb-4 max-lg:landscape:mb-3 bg-white rounded-xl shadow-sm border border-brand-brown/5 overflow-hidden">
                <button onClick={() => toggleWeight(weight)} className="w-full bg-brand-brown/5 p-4 max-lg:landscape:p-3 flex justify-between items-center hover:bg-brand-brown/10 transition-colors"><span className="font-bold text-brand-brown text-lg max-lg:landscape:text-base">Presentación {weight}g <span className="text-brand-green text-sm max-lg:landscape:text-xs ml-2">({subItems.length} sabores)</span></span><svg className={`w-5 h-5 text-brand-brown transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
                {isExpanded && (
                  <div className="grid grid-cols-1 max-lg:landscape:grid-cols-2 gap-0 max-lg:landscape:gap-2 p-0 max-lg:landscape:p-2 bg-gray-50/50">
                    {subItems.map(product => {
                      const quantity = cart.find(item => item.id === product.id)?.quantity || 0; const { badge, catColor } = formatProduct(product);
                      return (
                        <div key={product.id} className="p-3 sm:p-4 max-lg:landscape:p-2 border-b max-lg:landscape:border border-gray-100 max-lg:landscape:rounded-xl max-lg:landscape:bg-white flex flex-row items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors shadow-sm">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 max-lg:landscape:w-12 max-lg:landscape:h-12 rounded-lg relative flex-shrink-0 bg-brand-bg overflow-hidden flex items-center justify-center shadow-sm">
                            {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover text-transparent" /> : <div className="w-full h-full flex items-center justify-center text-white" style={{ backgroundColor: catColor }}><span className="font-black text-2xl max-lg:landscape:text-lg opacity-70 tracking-tighter">{product.name.substring(0,2).toUpperCase()}</span></div>}
                          </div>
                          <div className="flex-1 flex flex-col justify-center min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">{badge ? <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2 py-0.5 max-lg:landscape:px-1.5 rounded shadow-sm whitespace-nowrap ${badge.colorClass}`}>{badge.text}</span> : <span className="text-xs font-bold text-brand-brown">ÚNICO</span>}</div>
                            <span className="text-lg sm:text-xl max-lg:landscape:text-base font-black text-brand-green leading-none truncate">${product.price}</span>
                          </div>
                          <div className="w-[110px] sm:w-[130px] max-lg:landscape:w-[100px] flex-shrink-0">
                            {quantity > 0 ? (
                              <div className="flex items-center justify-between bg-white rounded-xl overflow-hidden border border-brand-green/40 h-[40px] sm:h-[44px] max-lg:landscape:h-[36px] shadow-sm"><button onClick={() => removeFromCart(product.id)} className="w-8 sm:w-10 max-lg:landscape:w-8 h-full flex items-center justify-center text-brand-green hover:bg-brand-green hover:text-white transition-colors text-xl font-bold">-</button><input type="number" value={quantity} onChange={(e) => handleSetQuantity(product, e.target.value)} className="w-full text-center font-bold text-brand-brown text-base sm:text-lg max-lg:landscape:text-sm bg-transparent outline-none appearance-none m-0" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} /><button onClick={() => addToCart(product)} className="w-8 sm:w-10 max-lg:landscape:w-8 h-full flex items-center justify-center text-brand-green hover:bg-brand-green hover:text-white transition-colors text-xl font-bold">+</button></div>
                            ) : (
                              <button onClick={() => addToCart(product)} className="w-full h-[40px] sm:h-[44px] max-lg:landscape:h-[36px] bg-white border-2 border-brand-green text-brand-green font-bold rounded-xl hover:bg-brand-green hover:text-white active:scale-[0.98] transition-all text-xs sm:text-sm uppercase tracking-wider shadow-sm">Agregar</button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="bg-white border-t border-brand-brown/10 p-3 sm:p-4 max-lg:landscape:py-2 flex justify-center flex-shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button onClick={() => setSelectedCategory(null)} className="w-full sm:w-auto bg-brand-brown text-white font-bold py-3 px-8 max-lg:landscape:py-2 rounded-xl hover:bg-brand-brown/90 transition-colors uppercase tracking-wider text-sm max-lg:landscape:text-xs shadow-md active:scale-95">Volver a Categorías</button>
        </div>
        
      </div>
    </div>
  );
}