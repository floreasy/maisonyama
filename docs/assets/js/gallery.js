/* Zoom au survol, et — si la page en a — vignettes qui promeuvent l'image principale.
   La fiche produit a les deux ; la page savoir-faire n'a que le zoom. */
(function () {
  var zoombox = document.querySelector('.ym-zoombox');
  var main = document.querySelector('.ym-main-img');
  if (!zoombox || !main) return;

  /* L'origine du zoom suit le curseur. On ne la remet pas au centre en quittant :
     le retour à l'échelle 1 se ferait alors depuis un autre point, et saccaderait. */
  zoombox.addEventListener('mousemove', function (e) {
    var r = zoombox.getBoundingClientRect();
    var x = ((e.clientX - r.left) / r.width) * 100;
    var y = ((e.clientY - r.top) / r.height) * 100;
    main.style.transformOrigin = x + '% ' + y + '%';
  });

  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.ym-thumb'));
  if (!thumbs.length) return;

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      /* Chaque vignette porte son propre cadrage : une photo en situation se
         recadre en cover, un détouré se pose en contain sur son fond. */
      main.src = thumb.dataset.src;
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
