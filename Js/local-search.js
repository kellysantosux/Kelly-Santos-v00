// =================================================================
// /Js/local-search.js - Loader shim (Keep for backwards compatibility only)
// =================================================================

// Loader shim: keeps existing HTML references to /Js/local-search.js working
// and loads the real search implementation at /Js/search.js
(function(){
  try {
    var s = document.createElement('script');
    s.src = '/Js/search.js';
    s.defer = true;
    document.head.appendChild(s);
  } catch (e) {
    console.error('Failed to load search script', e);
  }
})();