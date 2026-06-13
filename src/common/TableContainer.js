import DataTable from "react-data-table-component";

const defaultCustomStyles = {
  table: {
    style: {
      backgroundColor: "transparent",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      minHeight: "48px",
    },
  },
  headCells: {
    style: {
      fontSize: "0.75rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "#64748b",
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  rows: {
    style: {
      minHeight: "56px",
      fontSize: "0.875rem",
      color: "#334155",
      borderBottom: "1px solid #f1f5f9",
      "&:hover": {
        backgroundColor: "#f8fafc",
      },
    },
  },
  cells: {
    style: {
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e2e8f0",
      minHeight: "52px",
      fontSize: "0.875rem",
      color: "#64748b",
    },
  },
};

const TableContainer = ({
  columns,
  data,
  customStyles,
  showSearch = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  noDataComponent,
}) => {
  return (
    <div className="admin-table">
      <DataTable
        columns={columns}
        data={data}
        pagination
        highlightOnHover
        responsive
        subHeader={showSearch}
        subHeaderComponent={
          showSearch ? (
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="admin-page__search-input"
              style={{ maxWidth: 320 }}
            />
          ) : null
        }
        customStyles={{ ...defaultCustomStyles, ...customStyles }}
        noDataComponent={noDataComponent}
      />
    </div>
  );
};

export default TableContainer;
