import type { ColumnDef } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DataTable } from "../src/components/data-table";

interface Row {
  id: string;
  name: string;
  email: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Nom" },
  { accessorKey: "email", header: "Email" },
];

const rows: Row[] = [
  { id: "1", name: "Alice Martin", email: "alice@fit4u.app" },
  { id: "2", name: "Bob Dupont", email: "bob@fit4u.app" },
  { id: "3", name: "Chloé Petit", email: "chloe@fit4u.app" },
];

/** Table tests (Volume 6) — recherche, rendu, pagination du composant `DataTable` générique. */
describe("DataTable", () => {
  it("affiche toutes les lignes par défaut", () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.getByText("Alice Martin")).toBeInTheDocument();
    expect(screen.getByText("Bob Dupont")).toBeInTheDocument();
    expect(screen.getByText("Chloé Petit")).toBeInTheDocument();
  });

  it("filtre les lignes via la recherche globale", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={rows} searchPlaceholder="Rechercher…" />);

    await user.type(screen.getByLabelText("Rechercher…"), "alice");

    expect(screen.getByText("Alice Martin")).toBeInTheDocument();
    expect(screen.queryByText("Bob Dupont")).not.toBeInTheDocument();
  });

  it("affiche les en-têtes de colonnes fournis", () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.getByText("Nom")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("affiche une table vide sans erreur si aucune donnée", () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.queryByText("Alice Martin")).not.toBeInTheDocument();
  });

  it("respecte pageSize pour la pagination", () => {
    render(<DataTable columns={columns} data={rows} pageSize={2} />);
    expect(screen.getByText("Alice Martin")).toBeInTheDocument();
    expect(screen.getByText("Bob Dupont")).toBeInTheDocument();
    expect(screen.queryByText("Chloé Petit")).not.toBeInTheDocument();
    expect(screen.getByText(/Page 1/)).toBeInTheDocument();
  });
});
