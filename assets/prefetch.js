/* Préchargement au survol. La navigation reste celle du navigateur, sans fondu
   ni voile : c'est l'attente elle-même qu'on retire, plutôt que de l'habiller.
   Dès que le pointeur s'attarde sur un lien, la page suivante part se charger,
   et le clic ne trouve plus rien à attendre. */
(function () {
  /* Sur un forfait mesuré ou un réseau lent, charger une page qu'on ne verra
     peut-être jamais coûte plus qu'il ne rapporte. */
  var reseau = navigator.connection;
  if (reseau && (reseau.saveData || /(^|-)2g$/.test(reseau.effectiveType || ''))) return;

  /* Le panier et la commande changent d'état : on ne les précharge jamais. */
  var RESERVE = /\/(cart|checkout|account|challenge)(\/|$)/;
  var deja = {};
  var attente;
  var vise = null;

  function cible(lien) {
    if (!lien || !lien.href) return null;
    if (lien.hasAttribute('download')) return null;
    if (lien.target && lien.target !== '_self') return null;
    var url;
    try { url = new URL(lien.href); } catch (e) { return null; }
    if (url.origin !== window.location.origin) return null;
    if (url.pathname === window.location.pathname) return null;
    if (RESERVE.test(url.pathname)) return null;
    return url.href;
  }

  function precharger(href) {
    if (!href || deja[href]) return;
    deja[href] = true;
    var lien = document.createElement('link');
    lien.rel = 'prefetch';
    lien.href = href;
    document.head.appendChild(lien);
  }

  /* Un court délai : le pointeur qui balaie une grille de huit broches ne demande
     pas les huit fiches, seulement celle sur laquelle il s'arrête. */
  document.addEventListener('mouseover', function (e) {
    var href = cible(e.target.closest('a'));
    /* Toujours le même lien : on laisse le compte à rebours courir. Le pointeur
       qui traverse une carte passe sur ses enfants, ce n'est pas en sortir. */
    if (href === vise) return;
    clearTimeout(attente);
    vise = href;
    if (href) attente = setTimeout(function () { precharger(href); }, 90);
  });

  /* Au doigt, le contact vaut décision : on ne fait pas attendre. */
  document.addEventListener('touchstart', function (e) {
    var lien = e.target.closest('a');
    if (lien) precharger(cible(lien));
  }, { passive: true });
})();
