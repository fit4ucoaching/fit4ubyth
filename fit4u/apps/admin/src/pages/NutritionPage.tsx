import { useState } from "react";
import { Apple, Plus, Trash2 } from "lucide-react";

import { Badge, Button, Card, Input } from "../components/ui";
import { useArchiveFood, useArchiveRecipe, useCreateFood, useFoodCategories, useFoodsList, useRecipesList } from "../services/useAdminNutrition";
import { useUiStore } from "../store/uiStore";

const EMPTY_FOOD = { categoryId: "", name: "", caloriesPer100g: "", proteinPer100g: "", carbsPer100g: "", fatPer100g: "" };

/**
 * CMS Nutrition (Volume 6, gap comblé) — Aliments et Recettes. Bascule par
 * onglets locaux plutôt qu'un composant `Tabs` dédié : l'app admin n'a pas
 * encore ce composant dans `components/ui/`, et un état local suffit pour
 * deux vues (pas de justification à ajouter une dépendance pour ça).
 */
export function NutritionPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<"foods" | "recipes">("foods");
  const pushToast = useUiStore((s) => s.pushToast);

  const { data: categories } = useFoodCategories();
  const { data: foods } = useFoodsList({ page: 1, pageSize: 50 });
  const { data: recipes } = useRecipesList({ page: 1, pageSize: 50 });
  const createFood = useCreateFood();
  const archiveFood = useArchiveFood();
  const archiveRecipe = useArchiveRecipe();

  const [newFood, setNewFood] = useState(EMPTY_FOOD);

  const handleCreateFood = (): void => {
    if (!newFood.categoryId || !newFood.name) return;
    createFood.mutate(
      {
        categoryId: newFood.categoryId,
        name: newFood.name,
        caloriesPer100g: Number(newFood.caloriesPer100g) || 0,
        proteinPer100g: Number(newFood.proteinPer100g) || 0,
        carbsPer100g: Number(newFood.carbsPer100g) || 0,
        fatPer100g: Number(newFood.fatPer100g) || 0,
      },
      {
        onSuccess: () => { setNewFood(EMPTY_FOOD); pushToast({ variant: "success", message: "Aliment créé." }); },
      },
    );
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <Apple className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Nutrition</h1>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("foods")}
          className={`px-4 py-2 text-sm font-medium ${activeTab === "foods" ? "border-b-2 border-primary text-primary" : "text-textSecondary"}`}
        >
          Aliments ({foods?.total ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("recipes")}
          className={`px-4 py-2 text-sm font-medium ${activeTab === "recipes" ? "border-b-2 border-primary text-primary" : "text-textSecondary"}`}
        >
          Recettes ({recipes?.total ?? 0})
        </button>
      </div>

      {activeTab === "foods" ? (
        <>
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-textPrimary">Ajouter un aliment</h2>
            <div className="flex flex-wrap items-end gap-3">
              <select
                value={newFood.categoryId}
                onChange={(e) => setNewFood({ ...newFood, categoryId: e.target.value })}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm text-textPrimary"
                aria-label="Catégorie"
              >
                <option value="">Catégorie…</option>
                {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="min-w-[160px] flex-1"><Input label="Nom" value={newFood.name} onChange={(e) => setNewFood({ ...newFood, name: e.target.value })} /></div>
              <div className="w-28"><Input label="Kcal/100g" type="number" value={newFood.caloriesPer100g} onChange={(e) => setNewFood({ ...newFood, caloriesPer100g: e.target.value })} /></div>
              <div className="w-24"><Input label="Prot. (g)" type="number" value={newFood.proteinPer100g} onChange={(e) => setNewFood({ ...newFood, proteinPer100g: e.target.value })} /></div>
              <div className="w-24"><Input label="Gluc. (g)" type="number" value={newFood.carbsPer100g} onChange={(e) => setNewFood({ ...newFood, carbsPer100g: e.target.value })} /></div>
              <div className="w-24"><Input label="Lip. (g)" type="number" value={newFood.fatPer100g} onChange={(e) => setNewFood({ ...newFood, fatPer100g: e.target.value })} /></div>
              <Button onClick={handleCreateFood} isLoading={createFood.isPending}><Plus size={16} className="mr-2" />Ajouter</Button>
            </div>
          </Card>

          <Card>
            <div className="divide-y divide-border">
              {(foods?.items ?? []).map((food) => (
                <div key={food.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-textPrimary">{food.name}</p>
                    <p className="text-xs text-textSecondary">{food.category.name} · {food.caloriesPer100g} kcal/100g · P{food.proteinPer100g}g G{food.carbsPer100g}g L{food.fatPer100g}g</p>
                  </div>
                  <button onClick={() => archiveFood.mutate(food.id)} className="text-danger hover:opacity-80" aria-label={`Archiver ${food.name}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {(foods?.items ?? []).length === 0 ? <p className="py-4 text-sm text-textTertiary">Aucun aliment.</p> : null}
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {(recipes?.items ?? []).map((recipe) => (
              <div key={recipe.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-textPrimary">{recipe.name}</p>
                    {recipe.isPremium ? <Badge variant="vip">Premium</Badge> : null}
                  </div>
                  <p className="text-xs text-textSecondary">
                    {recipe.servings} portion(s){recipe.prepTimeMinutes ? ` · ${recipe.prepTimeMinutes} min` : ""} · {recipe.ingredients.length} ingrédient(s)
                  </p>
                </div>
                <button onClick={() => archiveRecipe.mutate(recipe.id)} className="text-danger hover:opacity-80" aria-label={`Archiver ${recipe.name}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {(recipes?.items ?? []).length === 0 ? <p className="py-4 text-sm text-textTertiary">Aucune recette.</p> : null}
          </div>
          <p className="mt-3 text-xs text-textTertiary">
            La création de recette (avec ingrédients composés) nécessite une interface dédiée plus
            riche — l'API (`POST /admin/nutrition/recipes`) est prête, l'écran de composition
            d'ingrédients reste à construire.
          </p>
        </Card>
      )}
    </div>
  );
}
