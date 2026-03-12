/*
How to use this component?
  PROPS
  columns       Column<T>[]                                    (required)
                array of column definitions - see column<T> shape below.
  rows          T[]                                            (required)
                Array of data objects; T can be any type.
  keyExtractor  (row: T, index: number) => string             (required)
                Returns a unique React key for each row.
 
  Column<T> SHAPE
  
  key     string                          unique column identifier
  header  string                          column heading text
  render  (row: T, index: number)         returns the cell content
          => React.ReactNode               (string, JSX, Badge, Avatar…)
 
  NOTES
  • Rendered inside an omg-card with overflow:hidden so it gets
    the card border-radius automatically. Pass noPadding if you
    wrap it yourself.
  • The generic <T> lets TypeScript infer cell types from your
    data shape — no casting needed.
  • Sorting, pagination, and filtering are intentionally left to
    the parent; DataTable is a pure display layer.
 
  SAMPLE USAGE
  import { DataTable } from "@/components/ui";
  import type { Column } from "@/components/ui";
  import { Badge, Avatar } from "@/components/ui";
 
  type User = {
    id:      string;
    name:    string;
    college: string;
    role:    string;
    status:  "completed" | "pending" | "none";
  };
 
  const columns: Column<User>[] = [
    {
      key: "name",
      header: "User",
      render: (row, i) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            initials={row.name.split(" ").map(n => n[0]).join("").slice(0,2)}
            size="sm"
            variant={i % 2 === 0 ? "pink" : "periwinkle"}
          />
          <span style={{ fontWeight: 500 }}>{row.name}</span>
        </div>
      ),
    },
    {
      key: "college",
      header: "College",
      render: (row) => row.college,
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <Badge variant={row.role === "Faculty" ? "periwinkle" : "pink"}>
          {row.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "GSO Status",
      render: (row) => (
        <Badge variant={
          row.status === "completed" ? "success" :
          row.status === "pending"   ? "warning" : "error"
        }>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div style={{ display: "flex", gap: 6 }}>
          <Button variant="icon" onClick={() => viewUser(row.id)}><Eye size={14}/></Button>
          <Button variant="icon" onClick={() => editUser(row.id)}><Pencil size={14}/></Button>
        </div>
      ),
    },
  ];
 
  const rows: User[] = [
    { id: "2021-00142", name: "First Name Last Name",   college: "CSS", role: "Student", status: "completed" },
    { id: "2020-03301", name: "First Name Last Name", college: "CS",   role: "Student", status: "pending"   },
    { id: "2023-98734",   name: "First Name Last Name",  college: "CAC",  role: "Faculty", status: "completed" },
  ];
 
  <DataTable
    columns={columns}
    rows={rows}
    keyExtractor={(row) => row.id}
  />

*/

import React from "react";

// types
export interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyExtractor: (row: T, index: number) => string;
}

// DataTable
export function DataTable<T>({ columns, rows, keyExtractor }: DataTableProps<T>) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={keyExtractor(row, i)}>
              {columns.map((col) => (
                <td key={col.key}>{col.render(row, i)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}