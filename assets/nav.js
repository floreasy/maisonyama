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
