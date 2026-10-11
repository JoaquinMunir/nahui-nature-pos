import React from 'react';

export default function StoreGrid({
  activeClient, setActiveClient, saleMode, setSaleMode, clearCart, cart, 
  categoryNames, groupedProducts, formatProduct, CATEGORY_COVERS, openCategoryModal
}) {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-brand-brown text-white p-4 lg:p-6 max-lg:landscape:p-3 rounded-2xl max-lg:landscape:rounded-xl mb-6 max-lg:landscape:mb-3 shadow-md flex flex-col lg:flex-row max-lg:landscape:flex-row justify-between items-start lg:items-center max-lg:landscape:items-center gap-4 max-lg:landscape:gap-3">
        <div className="flex flex-col lg:flex-row max-lg:landscape:flex-row lg:items-center max-lg:landscape:items-center gap-2 lg:gap-4 max-lg:landscape:gap-4 flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden lg:inline max-lg:landscape:inline text-xl leading-none opacity-80 flex-shrink-0">👤</span>
            <p className="lg:hidden max-lg:landscape:hidden text-brand-bg text-xs uppercase tracking-widest font-bold mb-1">Vendiendo a:</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl max-lg:landscape:text-lg font-black font-calistoga truncate leading-tight tracking-wide">{activeClient.name}</h2>
          </div>
          
          <div className="flex items-center bg-black/20 p-1.5 max-lg:landscape:p-1 rounded-xl max-lg:landscape:rounded-lg border border-white/10 w-fit flex-shrink-0">
            <button onClick={() => setSaleMode('mobile')} className={`px-3 py-1.5 max-lg:landscape:px-2.5 max-lg:landscape:py-1 rounded-lg max-lg:landscape:rounded-md text-xs lg:text-sm max-lg:landscape:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${saleMode === 'mobile' ? 'bg-[#49839a] text-white shadow-md' : 'text-white/50 hover:text-white'}`}>
              <svg className="w-4 h-4 max-lg:landscape:w-3.5 max-lg:landscape:h-3.5 scale-x-[-1] translate-y-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <span>En Ruta</span>
            </button>
            <button onClick={() => setSaleMode('central')} className={`px-3 py-1.5 max-lg:landscape:px-2.5 max-lg:landscape:py-1 rounded-lg max-lg:landscape:rounded-md text-xs lg:text-sm max-lg:landscape:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${saleMode === 'central' ? 'bg-[#67924a] text-white shadow-md' : 'text-white/50 hover:text-white'}`}>
              <svg className="w-4 h-4 max-lg:landscape:w-3.5 max-lg:landscape:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <span>En Centro</span>
            </button>
          </div>
        </div>
        <button onClick={() => { if(cart.length > 0) { if(confirm("Tienes productos en el carrito. ¿Deseas descartarlos y cambiar de cliente?")) { clearCart(); setActiveClient(null); } } else { setActiveClient(null); } }} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs lg:text-sm max-lg:landscape:text-[10px] uppercase tracking-wider font-bold py-2.5 px-4 lg:py-2 lg:px-4 max-lg:landscape:py-1.5 max-lg:landscape:px-3 rounded-xl max-lg:landscape:rounded-lg transition-all whitespace-nowrap flex-shrink-0 text-center self-start lg:self-center max-lg:landscape:self-center">
          Cambiar Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-lg:landscape:grid-cols-3 max-lg:landscape:gap-3">
        {categoryNames.map(categoryName => {
          const items = groupedProducts[categoryName];
          const { catColor } = formatProduct(items[0]);
          const coverImage = CATEGORY_COVERS[categoryName];
          const itemsInCartForCategory = items.reduce((acc, item) => acc + (cart.find(c => c.id === item.id)?.quantity || 0), 0);
          return (
            <div key={categoryName} onClick={() => openCategoryModal(categoryName)} className="bg-white rounded-2xl max-lg:landscape:rounded-xl shadow-sm border border-brand-green/10 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group relative flex flex-col h-full">
              <div className="h-1.5 max-lg:landscape:h-1 w-full" style={{ backgroundColor: catColor }}></div>
              <div className="aspect-[4/3] max-lg:landscape:aspect-[16/9] relative overflow-hidden bg-brand-bg flex items-center justify-center">
                {coverImage ? <img src={coverImage} alt={categoryName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 text-transparent" /> : <span className="text-5xl max-lg:landscape:text-2xl font-black text-brand-brown/20 uppercase tracking-widest">{categoryName.substring(0,3)}</span>}
                {itemsInCartForCategory > 0 && <div className="absolute top-3 right-3 max-lg:landscape:top-1.5 max-lg:landscape:right-1.5 bg-brand-green text-white w-8 h-8 max-lg:landscape:w-5 max-lg:landscape:h-5 max-lg:landscape:text-[10px] flex items-center justify-center rounded-full font-bold shadow-lg border-2 max-lg:landscape:border border-white">{itemsInCartForCategory}</div>}
              </div>
              <div className="p-5 max-lg:landscape:p-2 flex-1 flex flex-col justify-center text-center">
                <h2 className="text-2xl max-lg:landscape:text-sm font-bold text-brand-brown leading-tight">{categoryName}</h2>
                <p className="text-sm max-lg:landscape:text-[9px] text-gray-500 mt-2 max-lg:landscape:mt-0.5 font-medium">{items.length} variants disponibles</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}