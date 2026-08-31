#!/usr/bin/env python3
"""Vérifie les références internes du thème : snippets, sections, groupes,
assets, types de blocs et clés de traduction. Complète `shopify theme check`,
qui ne relie pas les gabarits JSON aux schémas des sections, et qui ne suit pas
les noms de fichiers passés en paramètre de snippet (repli:).

    python3 shopify/verifier.py
"""
import re, os, sys, glob, json

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
os.chdir(RACINE)

# Toute chaîne entre guillemets qui ressemble à un nom de fichier d'asset.
NOMS = re.compile(r"['\"]([\w.\-]+\.(?:css|js|png|jpe?g|woff2))['\"]")

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

gabarits = glob.glob('templates/*.json') + glob.glob('sections/*-group.json')
for p in gabarits:
    brut = open(p, encoding='utf-8').read()
    for nom in NOMS.findall(brut):
        if nom not in assets: erreurs.append(f"{p} : asset manquant « {nom} »")
    d = json.loads(brut)
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

trad = json.load(open('locales/fr.default.json', encoding='utf-8'))
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
