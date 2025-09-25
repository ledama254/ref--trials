// Simple client for the REST backend
(function(){
  const cfg = window.APP_CONFIG || {}; 
  const BACKEND = (cfg.BACKEND_URL || '').replace(/\/$/, '');
  if (!BACKEND) {
    console.error('BACKEND_URL not set in docs/config.js');
  }

  function getToken(){ return localStorage.getItem('ref_token') || ''; }
  function setToken(t){ localStorage.setItem('ref_token', t); }
  function clearToken(){ localStorage.removeItem('ref_token'); }

  async function api(path, { method='GET', body, auth=true } = {}){
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const t = getToken();
      if (t) headers['Authorization'] = `Bearer ${t}`;
    }
    const res = await fetch(`${BACKEND}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    let data;
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
    return data;
  }

  function requireAuth(){ if(!getToken()){ window.location.href = './login.html'; } }

  function initNav(){
    const logoutBtn = document.querySelector('[data-logout]');
    if (logoutBtn){ logoutBtn.addEventListener('click', (e)=>{ e.preventDefault(); clearToken(); window.location.href='./login.html'; }); }
    const dashLink = document.querySelector('[data-dash-link]');
    if (dashLink){ if(!getToken()){ dashLink.setAttribute('hidden',''); } }
  }

  window.RefAPI = { api, getToken, setToken, clearToken, requireAuth, BACKEND };
  window.addEventListener('DOMContentLoaded', initNav);
})();
