/* Panier : ajout sans rechargement, tiroir latéral, quantités.

   Le balisage du tiroir reste écrit en Liquid. Chaque appel au panier réclame
   la section dans la foulée — paramètre `sections` — et Shopify la renvoie
   re-rendue dans la même réponse. Un aller-retour au lieu de deux, et surtout
   plus de GET séparé vers `?sections=` : celui-ci portait un ETag calculé sur
   la page produit, sans en-tête de cache, si bien que le navigateur le
   resservait depuis son cache avec l'état du panier d'avant. */
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

  /* Remplace le tiroir par la version que Shopify vient de rendre. Les
     écouteurs sont posés sur `document`, donc rien n'est à réattacher. */
  function appliquer(html) {
    if (!html) return;
    var actuel = document.getElementById(WRAPPER);
    var neuf = new DOMParser().parseFromString(html, 'text/html').getElementById(WRAPPER);
    if (!actuel || !neuf) return;

    var etaitOuvert = !!actuel.querySelector('.is-open');
    actuel.replaceWith(neuf);

    var el = tiroir();
    if (!el) return;
    if (etaitOuvert) { el.hidden = false; el.classList.add('is-open'); }

    /* Le compteur de l'en-tête vit hors de la section ; le tiroir le porte en
       attribut pour qu'on le recopie sans un appel de plus. */
    var compte = el.getAttribute('data-ym-count');
    if (compte !== null) {
      document.querySelectorAll('[data-ym-cart-count]').forEach(function (n) {
        n.textContent = compte;
      });
    }
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

    /* L'appel emporte le rendu du tiroir : il dure le temps qu'il dure, et sans
       repère l'attente passe pour une panne. Le bouton la porte lui-même —
       aria-busy pour les lecteurs d'écran, et le filet d'or que dessine le CSS. */
    var bouton = form.querySelector('[name="add"]');
    if (bouton) {
      bouton.disabled = true;
      bouton.setAttribute('aria-busy', 'true');
    }
    dernierDeclencheur = bouton;

    var erreurAffichee = form.querySelector('.ym-form-error');
    if (erreurAffichee) erreurAffichee.remove();

    var corps = new FormData(form);
    corps.append('sections', SECTION);

    fetch(routes.cart_add, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: corps
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.data.description || strings.cartError);
        appliquer(res.data.sections && res.data.sections[SECTION]);
        ouvrir();
      })
      .catch(function (err) { erreur(form, err.message || strings.cartError); })
      .then(function () {
        if (!bouton) return;
        bouton.disabled = false;
        bouton.removeAttribute('aria-busy');
      });
  });

  /* ---------- Quantités et retrait ---------- */
  document.addEventListener('click', function (e) {
    var bouton = e.target.closest('[data-ym-line]');
    if (!bouton) return;
    e.preventDefault();
    bouton.disabled = true;

    /* On désigne la ligne par sa clé, pas par son rang : retirer une ligne
       décalerait toutes les suivantes. */
    fetch(routes.cart_change, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        id: bouton.dataset.ymLine,
        quantity: Number(bouton.dataset.ymTo),
        sections: SECTION
      })
    })
      .then(function (r) {
        if (!r.ok) throw new Error(strings.cartError);
        return r.json();
      })
      .then(function (data) {
        /* Sur la page /panier, la liste n'est pas dans la section du tiroir :
           un rechargement reste la façon la plus sûre de tout remettre d'aplomb. */
        if (document.querySelector('.ym-cart-page')) { window.location.reload(); return; }
        appliquer(data.sections && data.sections[SECTION]);
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
