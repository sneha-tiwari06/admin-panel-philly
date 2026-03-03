import DataTable from "react-data-table-component";

const TableContainer = ({ columns, data }) => {
  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        pagination
        highlightOnHover
        striped
        responsive
        subHeader
        subHeaderComponent={
          <input
            type="text"
            placeholder="Search..."
            onChange={() => {}} // Implement filtering logic if needed
            className="form-control w-auto"
            style={{ maxWidth: 200 }}
          />
        }
      />
    </div>
  );
};

export default TableContainer;
