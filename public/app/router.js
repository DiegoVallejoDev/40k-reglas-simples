const listeners = new Set();

export function parseRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (!raw) return { name: 'dashboard', params: [] };
  const [name, ...params] = raw.split('/');
  return { name, params: params.map(decodeURIComponent) };
}

export function navigate(path) {
  const normalized = path.startsWith('#') ? path : `#/${path.replace(/^\/+/, '')}`;
  if (window.location.hash === normalized) {
    emit();
  } else {
    window.location.hash = normalized;
  }
}

export function onRouteChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  const route = parseRoute();
  listeners.forEach((listener) => listener(route));
}

window.addEventListener('hashchange', emit);
