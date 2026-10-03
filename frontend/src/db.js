import Dexie from 'dexie';

export const db = new Dexie('NahuiNaturePOS');

db.version(8).stores({
  products: 'id, name, category',
  clients: 'id, name, location, is_active',
  routes: 'id, name',
  sync_queue: 'id',
  sync_clients_queue: 'id',
  sync_sessions_queue: 'id', 
  central_inventory: 'product_id',
  mobile_inventory: 'product_id'
});