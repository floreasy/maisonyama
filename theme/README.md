# Thème Maison Yama

Thème Shopify sur mesure, transposé du site statique qui vit dans `../docs/`.
Sans build : les fichiers du dossier sont ceux que Shopify sert.

## Repères

| Où | Quoi |
|---|---|
| `assets/base.css` | Tokens de la charte, en-tête, pied de page, cartes produit |
| `assets/sections.css` | Tout le reste, regroupé par section |
| `snippets/ym-cadrage.liquid` | La règle « PNG = visuel détouré » — la seule source |
| `snippets/ym-card.liquid` | La carte produit et son alternance de visuels |
| `sections/` | Une section par bloc éditorial, réglable dans l'éditeur de thème |
| `templates/*.json` | La composition de chaque page |

Les couleurs et les polices sont **volontairement** hors de l'admin : elles vivent
dans le bloc `Tokens` de `base.css`. Une charte de cette précision se protège mieux
dans le code que derrière un sélecteur de couleur.

## Deux conventions à connaître

**Les visuels produit.** Un PNG est traité comme un détouré (posé en entier sur
son fond clair), un JPEG comme une photo (recadrée pour remplir son cadre). Rien
à cocher : c'est déjà la distinction qu'impose l'export — la transparence exige
le PNG. Chargez la photo portée en premier, elle devient l'image mise en avant.

**L'alternance de la grille.** Une carte sur deux montre la photo portée au
repos, l'autre le détouré. C'est piloté par la position dans la grille, pas par
le produit : l'ordre de la collection suffit à régler le rythme.

## Métachamps attendus

| Clé | Type | Rôle |
|---|---|---|
| `custom.tagline` | Ligne de texte | La phrase en italique sous le titre |
| `custom.dimensions` | Ligne de texte | `6 × 2,8 cm` |
| `custom.perles` | Entier | `599` |
| `custom.padding_detoure` | Entier | Marge du détouré, en % (10 par défaut) |

Tous facultatifs : leur bloc disparaît s'ils sont vides.

## Vérifier

```sh
shopify theme check --path theme   # linter officiel
python3 shopify/verifier.py        # références internes et clés de traduction
shopify theme dev --path theme     # aperçu local branché sur la boutique
```
