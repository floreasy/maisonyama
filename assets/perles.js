/* Le nombre de perles se compte sous les yeux du visiteur — perle après perle,
   en accéléré — quand il entre dans l'écran. Le chiffre final est déjà écrit
   dans la page : sans JavaScript, ou si le visiteur préfère moins d'animations,
   il reste tel quel. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var DUREE = 1600;

  function compter(el) {
    var total = parseInt(el.dataset.ymCompte, 10);
    if (!(total > 0)) return;
    var debut = null;
    function image(t) {
      if (debut === null) debut = t;
      var p = Math.min(1, (t - debut) / DUREE);
      var e = 1 - Math.pow(1 - p, 3);   /* vite au départ, posé à l'arrivée */
      el.textContent = String(Math.round(total * e));
      if (p < 1) requestAnimationFrame(image);
    }
    el.textContent = '0';
    requestAnimationFrame(image);
  }

  var elements = document.querySelectorAll('[data-ym-compte]');
  if (!elements.length) return;

  /* Sur téléphone, la fiche est sous la galerie : on attend que le nombre soit
     visible, sinon le compte se joue pour personne. */
  if (!('IntersectionObserver' in window)) { elements.forEach(compter); return; }
  var vigie = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (!e.isIntersecting) return;
      vigie.unobserve(e.target);
      compter(e.target);
    });
  }, { threshold: 0.6 });
  elements.forEach(function (el) { vigie.observe(el); });
})();
