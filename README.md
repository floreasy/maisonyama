# Maison Yama

Thème Shopify sur mesure, transposé du site statique qui vit dans `docs/`.
Sans build : les fichiers de ce dépôt sont ceux que Shopify sert.

## Deux branches, deux contenus

Cette branche — `shopify-live` — **ne contient que le thème**, et elle est
connectée à la boutique : tout commit ici déploie, et tout réglage fait dans
l'éditeur de thème revient ici en commit.

`main` garde le site statique d'origine (`docs/`, toujours servi par GitHub
Pages) et les fichiers d'import du catalogue. Les deux branches ne fusionnent
jamais : elles ne portent pas les mêmes fichiers. C'est la même convention que
`gh-pages`, et elle ne demande aucun entretien.

Le thème occupe la racine parce que l'intégration GitHub de Shopify n'accepte pas
de sous-dossier. Elle ne se contente d'ailleurs pas d'ignorer les dossiers hors
thème, contrairement à ce qu'annonce sa documentation : la présence de `docs/`
faisait échouer la connexion, sur un PDF au nom accentué rangé sous
`docs/assets/`. D'où la séparation.

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
dans le bloc `Tokens` de `assets/base.css`. Une charte de cette précision se protège mieux
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
| `custom.cles_tagline` | Ligne de texte | La phrase en italique sous le titre |
| `custom.dimensions` | Ligne de texte | `6 × 2,8 cm` |
| `custom.perles` | Entier | `599` |
| `custom.padding_detoure` | Entier | Marge du détouré, en % (10 par défaut) |

Tous facultatifs : leur bloc disparaît s'ils sont vides.

## Vérifier

```sh
shopify theme check      # linter officiel
python3 verifier.py      # références internes et clés de traduction
shopify theme dev        # aperçu local branché sur la boutique
```
