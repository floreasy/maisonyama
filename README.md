# Maison Yama

Ce dépôt porte deux choses qui ne vivent pas sur la même branche.

| Branche | Contenu |
|---|---|
| `main` | Le site statique d'origine (`docs/`, servi par GitHub Pages) et les fichiers d'import du catalogue (`shopify/`). |
| `shopify-live` | Le thème Shopify, connecté à la boutique. Tout commit y déploie ; tout réglage fait dans l'éditeur de thème y revient en commit. |

Les deux ne fusionnent jamais : elles ne portent pas les mêmes fichiers. C'est la
convention `gh-pages`, et elle ne demande aucun entretien.

## Pourquoi cette séparation

L'intégration GitHub de Shopify n'accepte qu'une branche dont la racine **est** le
thème. Sa documentation annonce qu'elle ignore les dossiers qui ne ressemblent pas
à un thème — ce n'est pas vrai en pratique : la présence de `docs/` faisait échouer
la connexion, très probablement sur `docs/assets/Catalogue Pro 2026 non compréssé.pdf`,
dont le nom est accentué, espacé, et le type interdit dans les assets d'un thème.

## `docs/` — le site statique

Toujours en ligne sur GitHub Pages, et pas seulement par nostalgie : c'est de là
que Shopify télécharge les visuels à l'import du catalogue. **À garder en ligne
jusqu'à ce que l'import soit fait et vérifié.**

## `shopify/` — l'import du catalogue

| Fichier | Rôle |
|---|---|
| `produits.csv` | Les sept broches : prix, référence, poids, images, textes SEO. À importer en premier. |
| `produits-metachamps.csv` | Dimensions, nombre de perles, accroches, marges de détourage. À importer ensuite, en écrasant les produits de même handle. |

Les métachamps doivent être déclarés dans l'admin **avant** le second import :
un import ne remplit pas un champ qui n'existe pas.

| Clé | Type |
|---|---|
| `custom.tagline` | Ligne de texte |
| `custom.dimensions` | Ligne de texte |
| `custom.perles` | Nombre entier |
| `custom.padding_detoure` | Nombre entier |
