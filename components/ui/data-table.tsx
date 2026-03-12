/*
How to use this component?


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