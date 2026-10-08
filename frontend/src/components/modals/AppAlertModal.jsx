import React from 'react';

export default function AppAlertModal({ appAlert, onClose }) {
  if (!appAlert.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`p-6 text-white text-center ${appAlert.type === 'error' ? 'bg-red-500' : appAlert.type === 'success' ? 'bg-brand-green' : 'bg-amber-500'}`}>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <span className="text-3xl">{appAlert.type === 'error' ? '❌' : appAlert.type === 'success' ? '✅' : '⚠️'}</span>
          </div>
          <h3 className="text-2xl font-calistoga mb-1">{appAlert.title}</h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-brand-brown font-medium mb-6">{appAlert.message}</p>
          <button onClick={onClose} className={`w-full font-black py-3.5 rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wider text-sm text-white ${appAlert.type === 'error' ? 'bg-red-500 hover:bg-red-600' : appAlert.type === 'success' ? 'bg-brand-green hover:bg-brand-green-dark' : 'bg-amber-500 hover:bg-amber-600'}`}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}