# Services Teddy

Emplacement de toute la logique d'orchestration IA :

- `teddyConversationService` — gestion du fil de conversation et de son contexte.
- `teddyPromptBuilder` — construction des prompts à partir du profil utilisateur.
- `teddySafetyService` — détection de sujets sensibles et redirection vers des ressources adaptées.

Règle : le reste de l'application (mobile/web/backend) consomme uniquement l'API publique
exposée par `@fit4u/teddy-sdk`, jamais directement un provider IA tiers.
