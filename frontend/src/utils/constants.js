// src/utils/constants.js
const API_URL = import.meta.env.VITE_API_URL || "https://nahui-nature-api.onrender.com";

export const ENDPOINTS = {
  products: `${API_URL}/products`,
  clients:  `${API_URL}/clients`,
  routes:   `${API_URL}/routes`,
  orders:   `${API_URL}/orders`,
  inventory: `${API_URL}/inventory/central`,
  mobileInventory: `${API_URL}/inventory/mobile`,
  transfer: `${API_URL}/inventory/transfer`,
  sessions: `${API_URL}/sessions`
};

export const CATEGORY_COVERS = {
  "Cecina": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/dried_beef.jpg",
  "Chips del huerto": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/veggie_chips.jpg",
  "Chocohojuelas artesanales": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/chocohojuela.jpg",
  "Lentejas con limón y chile": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/lenteja_.jpg",
  "Nubes de maíz": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/maicitos.jpg",
  "Obleas tradición de amaranto": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/obleas_.jpg",
  "Platanitos crujientes": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/platanitos.jpg",
};

export const SUPPLIERS = [
  { id: 1, name: "Cecina", emoji: "🥩", link: "https://wa.me/5213318957640" },
  { id: 2, name: "Chips", emoji: "🌿", link: "https://wa.me/5213310643081" },
  { id: 3, name: "Lentejas", emoji: "🌶", link: "https://wa.me/5218128683071" },
  { id: 4, name: "Maicitos", emoji: "🌽", link: "https://wa.me/5213328286378" },
  { id: 5, name: "Obleas", emoji: "🌾", link: "https://wa.me/5217353384879" },
  { id: 6, name: "Platanitos", emoji: "🍌", link: "https://wa.me/5213121129537" },
];

export const formatProduct = (product) => {
  const isSingle = product.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'unico';

  const getCategoryColor = (category) => {
    const cat = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (cat.includes('oblea')) return "#F17E92";
    if (cat.includes('chocohojuela')) return "#3B2216";
    if (cat.includes('chip')) return "#5B8A3C";
    if (cat.includes('nube')) return "#F3D36B";
    if (cat.includes('lenteja')) return "#953431";
    if (cat.includes('platanito')) return "#E4B647";
    if (cat.includes('cecina') || cat.includes('carne')) return "#2B1010";
    return "#7B502B"; 
  };

  const getFlavorColor = (flavor) => {
    const f = flavor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (f.includes('natural')) return "bg-[#F3D36B] text-[#F8F6EF]";
    if (f.includes('queso')) return "bg-[#ffce33] text-[#F8F6EF]";
    if (f.includes('negra')) return "bg-[#3b2418] text-[#F8F6EF]";
    if (f.includes('jalapeno')) return "bg-[#6e9550] text-[#F8F6EF]";
    if (f.includes('fuego')) return "bg-[#bc584b] text-[#F8F6EF]";
    if (f.includes('ranchero')) return "bg-[#c2774e] text-[#F8F6EF]";
    if (f.includes('adobad')) return "bg-[#8b2c15] text-[#F8F6EF]";
    if (f.includes('habanero')) return "bg-[#d97216] text-[#F8F6EF]";
    if (f.includes('limon')) return "bg-[#5B8A3C] text-[#F8F6EF]";
    if (f.includes('arcoiris')) return "bg-[#C48BE0] text-[#F8F6EF]";
    if (f.includes('cafe')) return "bg-[#A67B5B] text-[#F8F6EF]";
    if (f.includes('chocolate')) return "bg-[#905B3C] text-[#F8F6EF]";
    if (f.includes('coco')) return "bg-[#D1BBA1] text-[#F8F6EF]";
    if (f.includes('frutos rojos')) return "bg-[#F58294] text-[#F8F6EF]";
    if (f.includes('maracuya')) return "bg-[#E4CF65] text-[#F8F6EF]";
    if (f.includes('matcha')) return "bg-[#BFBB7E] text-[#F8F6EF]";
    if (f.includes('mora azul')) return "bg-[#C3BBE5] text-[#F8F6EF]";
    if (f.includes('nuez')) return "bg-[#D7BEA4] text-[#F8F6EF]";
    if (f.includes('taro')) return "bg-[#B7A2CD] text-[#F8F6EF]";
    return "bg-[#7B502B] text-[#F8F6EF]"; 
  };

  return {
    title: product.category,
    catColor: getCategoryColor(product.category),
    badge: isSingle ? null : { text: product.name, colorClass: getFlavorColor(product.name) },
    cartTitle: product.category,
    cartSubtitle: isSingle ? null : product.name,
    cartSubtitleColor: getFlavorColor(product.name),
  };
};