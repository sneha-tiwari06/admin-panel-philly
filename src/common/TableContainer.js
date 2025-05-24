import React from "react";
import {
  useTable,
  useSortBy,
  usePagination,
  useGlobalFilter,
} from "react-table";

const TableContainer = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    setGlobalFilter,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="form-control w-auto"
        />
      </div>

      <table {...getTableProps()} className="table table-striped">
        <thead className="bg-dark text-white">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  {column.isSorted ? (column.isSortedDesc ? " ↓" : " ↑") : ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          onClick={previousPage}
          disabled={!canPreviousPage}
          className="btn btn-secondary w-auto"
        >
          <i className="fa-solid fa-backward"></i>
        </button>
        <button
          onClick={nextPage}
          disabled={!canNextPage}
          className="btn btn-secondary w-auto"
        >
          <i className="fa-solid fa-forward"></i>
        </button>
      </div>
    </div>
  );
};

export default TableContainer;
