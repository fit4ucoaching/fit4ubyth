import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Controller, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { Input } from "../src/components/ui";

const grantVipSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  note: z.string().max(280).optional(),
});
type FormValues = z.infer<typeof grantVipSchema>;

/**
 * Form tests (Volume 6) — vérifie la validation Zod + affichage d'erreur
 * sur un formulaire représentatif (même schéma que `VipPage`), sans
 * dépendre de la page complète (React Query non nécessaire ici).
 */
function TestForm({ onValid }: { onValid: (values: FormValues) => void }): JSX.Element {
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(grantVipSchema) });
  return (
    <form onSubmit={handleSubmit(onValid)}>
      <Controller
        control={control}
        name="email"
        render={({ field }) => <Input label="Email à accorder" error={errors.email?.message} {...field} />}
      />
      <button type="submit">Valider</button>
    </form>
  );
}

describe("Formulaire d'octroi VIP — validation Zod", () => {
  it("affiche une erreur si l'email est invalide", async () => {
    const user = userEvent.setup();
    const onValid = () => undefined;
    render(<TestForm onValid={onValid} />);

    await user.type(screen.getByLabelText("Email à accorder"), "pas-un-email");
    await user.click(screen.getByText("Valider"));

    expect(await screen.findByText("Adresse email invalide")).toBeInTheDocument();
  });

  it("n'affiche aucune erreur et soumet avec un email valide", async () => {
    const user = userEvent.setup();
    let submitted: FormValues | undefined;
    render(<TestForm onValid={(values) => { submitted = values; }} />);

    await user.type(screen.getByLabelText("Email à accorder"), "admin@fit4u.app");
    await user.click(screen.getByText("Valider"));

    expect(screen.queryByText("Adresse email invalide")).not.toBeInTheDocument();
    expect(submitted?.email).toBe("admin@fit4u.app");
  });
});
