import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Badge, Button } from "../src/components/ui";

/** Component tests (Volume 6) — comportement des primitives UI partagées par tous les modules. */
describe("Button", () => {
  it("affiche le texte fourni", () => {
    render(<Button>Enregistrer</Button>);
    expect(screen.getByText("Enregistrer")).toBeInTheDocument();
  });

  it("déclenche onClick au clic", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Cliquer</Button>);
    fireEvent.click(screen.getByText("Cliquer"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("est désactivé pendant isLoading et n'affiche pas les enfants", () => {
    render(<Button isLoading>Enregistrer</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.queryByText("Enregistrer")).not.toBeInTheDocument();
  });

  it("respecte disabled explicite", () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Action</Button>);
    fireEvent.click(screen.getByText("Action"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Badge", () => {
  it("affiche le contenu fourni", () => {
    render(<Badge variant="success">Actif</Badge>);
    expect(screen.getByText("Actif")).toBeInTheDocument();
  });

  it("applique une classe différente selon le variant", () => {
    const { container: successContainer } = render(<Badge variant="success">A</Badge>);
    const { container: dangerContainer } = render(<Badge variant="danger">B</Badge>);
    expect(successContainer.firstChild).not.toHaveClass("border-danger");
    expect(dangerContainer.firstChild).toHaveClass("border-danger");
  });
});
