/* Loupe au survol, et — là où la page en a — vignettes qui promeuvent l'image
   principale. La fiche produit a les deux ; une étape du savoir-faire n'a que la
   loupe. Chaque zone est traitée séparément : une page peut en contenir
   plusieurs, puisque les sections se composent librement. */
(function () {
  document.querySelectorAll('.ym-zoombox').forEach(function (zoombox) {
    var main = zoombox.querySelector('.ym-main-img');
    if (!main) return;

    /* L'origine du zoom suit le curseur. On ne la remet pas au centre en
       quittant : le retour à l'échelle 1 partirait alors d'un autre point, et
       saccaderait. */
    zoombox.addEventListener('mousemove', function (e) {
      var r = zoombox.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      main.style.transformOrigin = x + '% ' + y + '%';
    });
  });

  var galerie = document.querySelector('.ym-gallery');
  if (!galerie) return;
  var main = galerie.querySelector('.ym-main-img');
  var thumbs = Array.prototype.slice.call(galerie.querySelectorAll('.ym-thumb'));
  if (!main || !thumbs.length) return;

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      /* Chaque vignette porte son propre cadrage : une photo en situation se
         recadre en cover, un détouré se pose en contain sur son fond. */
      main.src = thumb.dataset.src;
      main.removeAttribute('srcset');
      main.alt = thumb.dataset.alt || '';
      main.style.objectFit = thumb.dataset.fit;
      main.style.padding = thumb.dataset.pad;
      main.style.background = thumb.dataset.bg;
      main.style.transformOrigin = 'center';

      thumbs.forEach(function (t) { t.setAttribute('aria-current', 'false'); });
      thumb.setAttribute('aria-current', 'true');
    });
  });
})();
