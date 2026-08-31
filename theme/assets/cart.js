/* Panier : ajout sans rechargement, tiroir latéral, quantités.

   Le balisage du tiroir reste écrit en Liquid. Après chaque modification on
   redemande la section au serveur et on remplace le bloc : aucune duplication
   du gabarit en JavaScript, et le prix affiché est toujours celui que Shopify
   vient de calculer. */
(function () {
  var routes = (window.YM && window.YM.routes) || {};
  var strings = (window.YM && window.YM.strings) || {};
  var SECTION = 'ym-cart-drawer';
  var WRAPPER = 'shopify-section-' + SECTION;

  var dernierDeclencheur = null;

  function tiroir() {
    return document.querySelector('[data-ym-drawer]');
  }

  function ouvrir() {
    var el = tiroir();
    if (!el) return;
    el.hidden = false;
    /* Laisse un rendu s'intercaler avant la transition, sinon le panneau
       apparaît d'un coup au lieu de glisser. */
    requestAnimationFrame(function () { el.classList.add('is-open'); });
    document.body.classList.add('ym-no-scroll');
    var fermer = el.querySelector('.ym-drawer-close');
    if (fermer) fermer.focus();
  }

  function fermer() {
    var el = tiroir();
    if (!el) return;
    el.classList.remove('is-open');
    document.body.classList.remove('ym-no-scroll');
    /* On attend la fin du glissement avant de retirer le tiroir du flux. */
    setTimeout(function () { if (!el.classList.contains('is-open')) el.hidden = true; }, 320);
    if (dernierDeclencheur) {
      dernierDeclencheur.focus();
      dernierDeclencheur = null;
    }
  }

  /* Redemande la section au serveur et remplace le bloc en place. Les écouteurs
     sont posés sur `document`, donc rien n'est à réattacher après coup. */
  function rafraichir() {
    return fetch(window.location.pathname + '?sections=' + SECTION, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        var actuel = document.getElementById(WRAPPER);
        var doc = new DOMParser().parseFromString(json[SECTION], 'text/html');
        var neuf = doc.getElementById(WRAPPER);
        if (!actuel || !neuf) return;
        var etaitOuvert = actuel.querySelector('.is-open');
        actuel.replaceWith(neuf);
        if (etaitOuvert) {
          var el = tiroir();
          if (el) { el.hidden = false; el.classList.add('is-open'); }
        }
        return compter();
      });
  }

  /* Le compteur de l'en-tête vit hors de la section : on le met à jour à part. */
  function compter() {
    return fetch(routes.cart + '.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (panier) {
        document.querySelectorAll('[data-ym-cart-count]').forEach(function (n) {
          n.textContent = panier.item_count;
        });
      });
  }

  function erreur(form, message) {
    var existant = form.querySelector('.ym-form-error');
    if (existant) existant.remove();
    var p = document.createElement('p');
    p.className = 'ym-form-error';
    p.setAttribute('role', 'alert');
    p.textContent = message;
    form.appendChild(p);
  }

  /* ---------- Ajout au panier ---------- */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[action*="/cart/add"]');
    if (!form) return;
    e.preventDefault();

    var bouton = form.querySelector('[name="add"]');
    if (bouton) bouton.disabled = true;
    dernierDeclencheur = bouton;

    var erreurAffichee = form.querySelector('.ym-form-error');
    if (erreurAffichee) erreurAffichee.remove();

    fetch(routes.cart_add, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.data.description || strings.cartError);
        return rafraichir().then(ouvrir);
      })
      .catch(function (err) { erreur(form, err.message || strings.cartError); })
      .then(function () { if (bouton) bouton.disabled = false; });
  });

  /* ---------- Quantités et retrait ---------- */
  document.addEventListener('click', function (e) {
    var bouton = e.target.closest('[data-ym-qty]');
    if (!bouton) return;
    e.preventDefault();
    bouton.disabled = true;

    fetch(routes.cart_change, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: Number(bouton.dataset.ymQty), quantity: Number(bouton.dataset.ymTo) })
    })
      .then(function () {
        /* Sur la page /panier, la liste n'est pas dans la section du tiroir :
           un rechargement reste la façon la plus sûre de tout remettre d'aplomb. */
        if (document.querySelector('.ym-cart-page')) { window.location.reload(); return; }
        return rafraichir();
      })
      .catch(function () { bouton.disabled = false; });
  });

  /* ---------- Ouverture, fermeture ---------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-ym-close]')) { e.preventDefault(); fermer(); return; }

    var lien = e.target.closest('[data-ym-cart-link]');
    if (lien && tiroir()) {
      e.preventDefault();
      dernierDeclencheur = lien;
      ouvrir();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fermer();
  });
})();
