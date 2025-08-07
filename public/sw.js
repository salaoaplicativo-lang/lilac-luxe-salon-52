// Service Worker simplificado para desenvolvimento
console.log('Service Worker: Modo desenvolvimento ativo');

// Instalar sem cache
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalado (desenvolvimento)');
  self.skipWaiting();
});

// Ativar sem limpeza de cache
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativado (desenvolvimento)');
  self.clients.claim();
});

// Fetch sem interceptação
self.addEventListener('fetch', (event) => {
  // Não intercepta requisições em modo desenvolvimento
  return;
});