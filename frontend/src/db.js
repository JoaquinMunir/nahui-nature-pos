import Dexie from 'dexie';

export const db = new Dexie('NahuiNaturePOS');

db.version(4).stores({
  products: 'id, category, name',
  clients: 'id, location, route_name, is_active',
  routes: 'id, name', // Esta línea es vital
  sync_queue: 'id',
  sync_clients_queue: 'id'
});