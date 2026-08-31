# API — Teddy AI Engine (SDK)

## Principe d'injection de dépendance

Le SDK ne lit **aucune** variable d'environnement et n'instancie jamais de
client OpenAI lui-même — chaque fonction reçoit un client `OpenAI` déjà
configuré en paramètre. Ceci garde le SDK agnostique de tout runtime
(backend Node aujourd'hui, potentiellement un autre contexte demain).

## Points d'entrée principaux

### Orchestration (`core/`)
```ts
initiateTeddyTurn(openai: OpenAI, input: TeddyCoreInput): Promise<TeddyTurnResult>
completeTeddyTurn(openai: OpenAI, pendingMessages, toolResults): Promise<TeddyReply>
```

### Mémoire (`memory/`)
```ts
formatMemoryForPrompt(memory: TeddyFullMemory): string
generateIntelligentSummary(openai, memory): Promise<string>
extractDNAFacts(openai, exchange): Promise<DNAExtractionResult>
```

### Sécurité (`safety/`)
```ts
checkSafety(message: string): SafetyCheckResult
```

### Modules domaine (calcul déterministe + Domain Prompt)
```ts
computeAdaptation(context: CoachContext): WorkoutAdaptation
calculateMacroTargets(input: CalorieCalculationInput): MacroTargets
decideRecovery(input: RecoveryInput): { decision, reason }
computeMotivationTone(input: MotivationInput): MotivationTone
detectTrend(snapshot: AnalyticsSnapshot): Trend
buildWeeklyPlan(constraints: PlannerConstraints): PlannedEvent[]
parseVoiceCommand(rawText: string): ParsedVoiceCommand
analyzeExerciseForm(openai, imageBase64DataUrl, exerciseName?): Promise<VisionAnalysisResult>
```

### Outils (`tools/`)
```ts
TOOL_DEFINITIONS: ToolDefinition[]
toOpenAIToolsFormat(): { type: "function"; function: ToolDefinition }[]
```

## Consommateurs (backend)

| Fichier backend | Utilise |
|---|---|
| `ai/ai.service.ts` | `initiateTeddyTurn`, `completeTeddyTurn`, générateurs Volume 3 |
| `ai/tools/toolExecutor.ts` | `calculateMacroTargets` (+ repositories des autres modules) |
| `ai/memory/teddyMemory.service.ts` | Types `TeddyFullMemory` uniquement (assemblage côté backend) |

## Compatibilité ascendante (Volume 1/3)

`generateTeddyReply`, `generateWorkoutPlanData`, `generateNutritionPlanData`,
`generateProgressSummary`, `generateChallengeData`, `analyzeFoodPhoto`
(services/) restent exportés et utilisés tels quels par
`generateWorkoutProgram`/`generateNutritionPlan`/`analyzeProgress` — ces
générateurs n'ont pas été migrés vers `TeddyCore` car ils répondent à un
besoin différent (génération structurée ponctuelle, pas une conversation).
Seul `chat()` utilise le nouveau `TeddyCore`.
