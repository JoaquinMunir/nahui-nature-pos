import React from 'react';

export default function ExpenseModal({ expenseModal, setExpenseModal, handleAddExpense }) {
  if (!expenseModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setExpenseModal({ ...expenseModal, isOpen: false })}></div>
      <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <form onSubmit={handleAddExpense}>
          <div className="bg-amber-500 p-6 max-lg:landscape:p-3 text-white text-center relative max-lg:landscape:flex max-lg:landscape:items-center max-lg:landscape:justify-center max-lg:landscape:gap-4">
            <div className="w-16 h-16 max-lg:landscape:w-10 max-lg:landscape:h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto max-lg:landscape:mx-0 mb-3 max-lg:landscape:mb-0">
              <svg className="w-5 h-5 max-lg:landscape:w-4 max-lg:landscape:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <div className="max-lg:landscape:text-left">
              <h3 className="text-2xl max-lg:landscape:text-lg font-calistoga mb-1 max-lg:landscape:mb-0 tracking-wide">Registrar Gasto</h3>
              <p className="text-amber-100 text-sm max-lg:landscape:text-[10px] font-medium">Gasolina, comidas o insumos</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Motivo</label>
              <input type="text" autoFocus required value={expenseModal.concept} onChange={e => setExpenseModal({...expenseModal, concept: e.target.value})} placeholder="Ej. Gasolina Magna" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 transition-colors text-brand-brown font-bold" />
            </div>
            <div className="mb-8 max-lg:landscape:mb-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 text-center">Monto a descontar</label>
              <input type="number" step="any" required value={expenseModal.amount} onChange={e => setExpenseModal({...expenseModal, amount: e.target.value})} placeholder="0.00" className="w-full text-center text-4xl max-lg:landscape:text-2xl font-black text-brand-brown border-b-2 border-gray-200 focus:border-amber-500 outline-none pb-2 max-lg:landscape:pb-1 transition-colors bg-transparent" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setExpenseModal({ ...expenseModal, isOpen: false })} className="flex-1 bg-gray-100 text-gray-500 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-wider text-sm">Cancelar</button>
              <button type="submit" className="flex-1 bg-amber-500 text-white font-bold py-3.5 rounded-xl hover:bg-amber-600 transition-colors shadow-md active:scale-95 uppercase tracking-wider text-sm">Guardar Gasto</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}