import { useState } from 'react';

export function useCart({ saleMode, mobileInventory, centralInventory, setAppAlert }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product) => setCart(prevCart => {
    const existing = prevCart.find(item => item.id === product.id);
    const requestedQty = existing ? existing.quantity + 1 : 1;
    
    // Verificación dinámica de stock según el modo de venta
    let availableStock = 0;
    if (saleMode === 'mobile') {
      availableStock = mobileInventory.find(i => String(i.product_id) === String(product.id))?.stock_quantity || 0;
    } else {
      availableStock = centralInventory.find(i => String(i.product_id) === String(product.id))?.stock_quantity || 0;
    }

    if (requestedQty > availableStock) {
      setAppAlert({
        isOpen: true,
        title: 'Stock Agotado',
        message: `Solo tienes ${availableStock} unidades en ${saleMode === 'mobile' ? 'la Camioneta' : 'el Centro'}.`,
        type: 'error'
      });
      return prevCart; 
    }

    if (existing) return prevCart.map(item => item.id === product.id ? { ...item, quantity: requestedQty } : item);
    return [...prevCart, { ...product, quantity: 1 }];
  });

  const removeFromCart = (productId) => setCart(prevCart => {
    const existing = prevCart.find(item => item.id === productId);
    if (existing.quantity === 1) {
      const newCart = prevCart.filter(item => item.id !== productId);
      if (newCart.length === 0) setIsCartOpen(false);
      return newCart;
    }
    return prevCart.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
  });

  const handleSetQuantity = (product, value) => {
    const q = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(q) || q < 0) return;
    setCart(prevCart => {
      if (q === 0) return prevCart.filter(item => item.id !== product.id);
      if (prevCart.find(item => item.id === product.id)) return prevCart.map(item => item.id === product.id ? { ...item, quantity: q } : item);
      return [...prevCart, { ...product, quantity: q }];
    });
  };

  const clearCart = () => { 
    setCart([]); 
    setIsCartOpen(false); 
  };

  // Cálculos derivados automáticos
  const totalOrder = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    setCart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    handleSetQuantity,
    clearCart,
    totalOrder,
    totalItems
  };
}