# Prompts — Teddy AI Engine

## Système hiérarchique (Volume 5)

```
System Prompt → Safety Prompt → Domain Prompt → User Memory →
Conversation Context → Tool Results → Final Response
```

Assemblé exclusivement par `core/teddyCore.ts` via `prompts/promptChain.ts#buildPromptChain()`.
**Aucun autre fichier du SDK ne construit de prompt final** — chaque module
domaine expose uniquement sa fonction `build<Module>DomainPrompt()`, qui
retourne un fragment de texte, jamais un prompt complet.

## Les étages

| Étage | Fichier | Personnalisé ? |
|---|---|---|
| System | `prompts/identityPrompt.ts` | Non — invariant |
| Safety | `prompts/globalSafetyPrompt.ts` | Non — invariant |
| Domain | `<module>/teddy<Module>.ts` | Selon le domaine détecté |
| User Memory | `memory/formatMemory.ts` | Oui — par utilisateur |
| Conversation Context | résumé ou historique récent | Oui — par conversation |
| Tool Results | injecté par `core/teddyCore.ts#completeTeddyTurn` | Oui — par tour |

## Pourquoi des balises XML-like (`<system>`, `<safety>`...) ?

Un modèle de langage interprète mieux des instructions dont la provenance
est explicite. Sans délimitation claire, un LLM peut mélanger "ce que dit
le système" et "ce que rapporte la mémoire utilisateur" — risque accru
d'injection de prompt via un champ utilisateur mal isolé. Chaque balise
rend explicite la source de chaque instruction.

## Règle absolue : ne jamais mélanger les responsabilités

- Le System Prompt ne contient **jamais** de données utilisateur.
- Le Safety Prompt ne contient **jamais** de logique métier (formulation de séance, etc.).
- Le Domain Prompt ne contient **jamais** l'identité de Teddy (déjà couverte par System).
- La Mémoire ne contient **jamais** d'instruction de comportement (c'est le rôle du Domain Prompt/Motivation).

## Ajouter un nouveau Domain Prompt

1. Créer `<nouveauModule>/teddy<NouveauModule>.ts` dans le SDK.
2. Exposer `build<NouveauModule>DomainPrompt(context): string`.
3. Ajouter le cas dans `core/buildDomainPrompt.ts` (switch sur `DetectedDomain`).
4. Ajouter les patterns de détection dans `core/contextDetection.ts`.
5. Documenter le nouveau domaine ici.

Ne jamais construire de prompt directement dans `core/teddyCore.ts` — ce
fichier assemble uniquement les fragments fournis par les modules.
