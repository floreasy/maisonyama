#!/usr/bin/env python3
"""Vérifie les références internes du thème : snippets, sections, groupes,
assets, types de blocs et clés de traduction. Signale aussi les filtres glissés
dans un paramètre d'image_tag, que Liquid applique à la sortie entière.

Complète `shopify theme check`, qui ne relie pas les gabarits JSON aux schémas
des sections, et qui ne suit pas les noms de fichiers passés en paramètre de
snippet (repli:).

    python3 verifier.py
"""
import re, os, sys, glob, json

RACINE = os.path.dirname(os.path.abspath(__file__))
os.chdir(RACINE)

# Toute chaîne entre guillemets qui ressemble à un nom de fichier d'asset.
NOMS = re.compile(r"['\"]([\w.\-]+\.(?:css|js|png|jpe?g|woff2))['\"]")

# Liquid n'évalue pas de filtre dans un paramètre de balise : écrire
# `image_tag: style: 'object-fit:' | append: fit` applique le filtre à la sortie
# entière de la balise. Le paramètre reste vide et la valeur filtrée s'imprime
# en texte à côté de l'image. Le linter de Shopify ne voit rien, la page si.
SORTIES = re.compile(r'\{\{.*?\}\}', re.S)

def sans_entete(brut):
    """Retire l'avertissement que l'éditeur de thème pose en tête des gabarits.

    Shopify écrit un bloc /* … */ avant le JSON de ses fichiers de thème, et le
    relit sans broncher. json.loads, lui, refuse. On ne coupe qu'en tête : un
    /* au milieu appartiendrait à une chaîne, pas à un commentaire.
    """
    reste = brut.lstrip('\ufeff \t\r\n')
    while reste.startswith('/*'):
        fin = reste.find('*/')
        if fin == -1:
            break
        reste = reste[fin + 2:].lstrip(' \t\r\n')
    return reste


erreurs = []
liquides = glob.glob('**/*.liquid', recursive=True)
snippets = {os.path.basename(p)[:-7] for p in glob.glob('snippets/*.liquid')}
sections = {os.path.basename(p)[:-7] for p in glob.glob('sections/*.liquid')}
groupes  = {os.path.basename(p)[:-5] for p in glob.glob('sections/*.json')}
assets   = set(os.listdir('assets'))

for p in liquides:
    s = open(p, encoding='utf-8').read()
    for nom in re.findall(r"{%-?\s*render\s+'([^']+)'", s):
        if nom not in snippets: erreurs.append(f"{p} : snippet manquant « {nom} »")
    for nom in re.findall(r"{%-?\s*section\s+'([^']+)'", s):
        if nom not in sections: erreurs.append(f"{p} : section manquante « {nom} »")
    for nom in re.findall(r"{%-?\s*sections\s+'([^']+)'", s):
        if nom not in groupes: erreurs.append(f"{p} : groupe manquant « {nom} »")
    for nom in NOMS.findall(s):
        if nom not in assets: erreurs.append(f"{p} : asset manquant « {nom} »")
    for sortie in SORTIES.finditer(s):
        expr = sortie.group(0)
        i = expr.find('image_tag:')
        if i != -1 and '|' in expr[i:]:
            ligne = s[:sortie.start()].count('\n') + 1
            erreurs.append(f"{p}:{ligne} : filtre dans un paramètre d'image_tag — "
                           "composez la valeur avant, avec assign ou capture")

gabarits = glob.glob('templates/*.json') + glob.glob('sections/*-group.json')
for p in gabarits:
    brut = open(p, encoding='utf-8').read()
    for nom in NOMS.findall(brut):
        if nom not in assets: erreurs.append(f"{p} : asset manquant « {nom} »")
    d = json.loads(sans_entete(brut))
    for cle, sec in d.get('sections', {}).items():
        if sec['type'] not in sections:
            erreurs.append(f"{p} : type de section inconnu « {sec['type']} »")
            continue
        if 'blocks' in sec:
            src = open(f"sections/{sec['type']}.liquid", encoding='utf-8').read()
            schema = json.loads(re.search(r'{%\s*schema\s*%}(.*?){%\s*endschema\s*%}', src, re.S).group(1))
            connus = {b['type'] for b in schema.get('blocks', [])}
            for b in sec['blocks'].values():
                if b['type'] not in connus:
                    erreurs.append(f"{p} : bloc « {b['type']} » inconnu de {sec['type']}")
    for cle in d.get('order', []):
        if cle not in d.get('sections', {}):
            erreurs.append(f"{p} : « {cle} » listé dans order mais non défini")

trad = json.loads(sans_entete(
    open('locales/fr.default.json', encoding='utf-8').read()))
def resoudre(cle):
    n = trad
    for part in cle.split('.'):
        if not isinstance(n, dict) or part not in n: return False
        n = n[part]
    return isinstance(n, str)
for p in liquides:
    for cle in re.findall(r"'([a-z0-9_]+(?:\.[a-z0-9_]+)+)'\s*\|\s*t\b", open(p, encoding='utf-8').read()):
        if not resoudre(cle): erreurs.append(f"{p} : clé de traduction absente « {cle} »")

if erreurs:
    print('\n'.join('✗ ' + e for e in sorted(set(erreurs))))
    sys.exit(1)
print(f"✓ {len(liquides)} fichiers Liquid, {len(gabarits)} gabarits : "
      "toutes les références internes résolvent.")
