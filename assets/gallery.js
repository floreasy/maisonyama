/* Loupe — au survol à la souris, à l'appui maintenu au doigt — et, là où la page
   en a, vignettes qui promeuvent l'image principale. La fiche produit a les deux ;
   une étape du savoir-faire n'a que la loupe. Chaque zone est traitée séparément :
   une page peut en contenir plusieurs, puisque les sections se composent librement. */
(function () {
  /* Sans souris, la loupe s'ouvre sur un appui maintenu. En deçà de ce délai, ou si
     le doigt a déjà glissé, le geste appartient au défilement de la page : une image
     de 600 px de haut ne peut pas confisquer tout mouvement qui la traverse. */
  var ATTENTE = 180;
  var GLISSE = 10;

  document.querySelectorAll('.ym-zoombox').forEach(function (zoombox) {
    var main = zoombox.querySelector('.ym-main-img');
    if (!main) return;

    /* L'origine du zoom suit le pointeur. On ne la remet pas au centre en quittant :
       le retour à l'échelle 1 partirait alors d'un autre point, et saccaderait. */
    function viser(x, y, etirer) {
      var r = zoombox.getBoundingClientRect();
      var px = ((x - r.left) / r.width) * 100;
      var py = ((y - r.top) / r.height) * 100;
      if (etirer) { px = etendre(px); py = etendre(py); }
      main.style.transformOrigin = px + '% ' + py + '%';
    }

    /* Un pouce ne vise pas le bord du cadre, et il masque ce qu'il désigne. On étire
       sa course : les 80 % centraux balaient l'image entière, donc les coins restent
       atteignables sans avoir à poser le doigt exactement dessus. */
    function etendre(v) {
      v = (v - 10) / 0.8;
      return v < 0 ? 0 : (v > 100 ? 100 : v);
    }

    zoombox.addEventListener('mousemove', function (e) {
      viser(e.clientX, e.clientY, false);
    });

    var attente = null, depart = null, ouverte = false;

    zoombox.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;  /* un pincement n'est pas une loupe */
      var t = e.touches[0];
      depart = { x: t.clientX, y: t.clientY };
      attente = setTimeout(function () {
        attente = null;
        ouverte = true;
        approcher();
        viser(depart.x, depart.y, true);
        zoombox.classList.add('is-zooming');
      }, ATTENTE);
    }, { passive: true });

    /* Non passif : une fois la loupe ouverte, le doigt explore l'image au lieu de
       faire défiler la page. Le défilement n'a pas encore démarré à ce moment —
       l'appui est resté immobile — donc l'annuler ici est encore possible. */
    zoombox.addEventListener('touchmove', function (e) {
      if (!depart) return;
      var t = e.touches[0];
      if (ouverte) {
        e.preventDefault();
        viser(t.clientX, t.clientY, true);
      } else if (Math.abs(t.clientX - depart.x) > GLISSE ||
                 Math.abs(t.clientY - depart.y) > GLISSE) {
        refermer();  /* parti avant l'ouverture : c'était un défilement */
      }
    }, { passive: false });

    zoombox.addEventListener('touchend', refermer);
    zoombox.addEventListener('touchcancel', refermer);

    function refermer() {
      clearTimeout(attente);
      attente = null;
      depart = null;
      ouverte = false;
      zoombox.classList.remove('is-zooming');
    }

    /* La source affichée est calibrée pour la taille du cadre : agrandie deux fois
       et demie, elle ramollit. On ne charge la pleine largeur qu'au premier appui,
       pour ne pas la faire payer à qui ne zoome pas. */
    function approcher() {
      var pleine = zoombox.dataset.zoomSrc;
      if (!pleine) return;
      main.src = pleine;
      main.removeAttribute('srcset');
      main.removeAttribute('sizes');
      delete zoombox.dataset.zoomSrc;
    }
  });

  var galerie = document.querySelector('.ym-gallery');
  if (!galerie) return;
  var main = galerie.querySelector('.ym-main-img');
  var boite = galerie.querySelector('.ym-zoombox');
  var thumbs = Array.prototype.slice.call(galerie.querySelectorAll('.ym-thumb'));
  if (!main || !thumbs.length) return;

  /* « Voir la broche dans son écrin » : la carte écrin promeut la vignette dont le
     texte alternatif est celui qu'elle porte, et ramène la galerie à l'écran là où
     elle est sortie du champ — sur téléphone, elle est bien au-dessus. */
  document.querySelectorAll('[data-ym-voir-ecrin]').forEach(function (lien) {
    lien.addEventListener('click', function () {
      var cible = thumbs.filter(function (t) { return t.dataset.alt === lien.dataset.ymVoirEcrin; })[0];
      if (!cible) return;
      cible.click();
      var r = galerie.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        galerie.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

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
      /* La vignette sert déjà la pleine largeur : plus rien à charger au zoom, et
         surtout plus la première image, qui n'est plus celle qu'on regarde. */
      if (boite) delete boite.dataset.zoomSrc;

      thumbs.forEach(function (t) { t.setAttribute('aria-current', 'false'); });
      thumb.setAttribute('aria-current', 'true');
    });
  });
})();
