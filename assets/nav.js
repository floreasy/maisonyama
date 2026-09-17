/* En-tête compact : passé 80 px de défilement, l'en-tête s'amincit ; il reprend
   sa hauteur sous 24 px. Deux seuils différents, pour qu'il ne clignote pas
   quand la page hésite autour d'une valeur. La classe est posée sur <html>,
   le CSS fait le reste (base.css, « En-tête »). */
(function () {
  var racine = document.documentElement;
  var compact = false, prevu = false;
  function mesurer() {
    prevu = false;
    var y = window.scrollY || window.pageYOffset;
    if (!compact && y > 80) { compact = true; racine.classList.add('is-compact'); }
    else if (compact && y < 24) { compact = false; racine.classList.remove('is-compact'); }
  }
  window.addEventListener('scroll', function () {
    if (!prevu) { prevu = true; requestAnimationFrame(mesurer); }
  }, { passive: true });
  mesurer();
})();

/* Menu burger mobile : ouvre/ferme le tiroir de navigation. */
(function () {
  var burger = document.querySelector('.ym-burger');
  var nav = document.getElementById('ym-nav');
  if (!burger || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  burger.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });

  /* Le tiroir se referme dès qu'on suit un lien. */
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });
})();
