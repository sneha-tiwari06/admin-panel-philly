import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageContactQuery() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedContact, setSelectedContact] = useState(null); // For modal

  useEffect(() => {
    const fetchContactQueries = async () => {
      try {
        const response = await axiosInstance.get("/contact/messages");
        setContacts(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContactQueries();
  }, []);

  const columns = useMemo(
    () => [
      {
        name: "S.No.",
        cell: (row, index) => index + 1,
        width: "80px",
        sortable: false,
      },
      {
        name: "Name",
        selector: (row) => row.firstname,
        sortable: true,
      },
      {
        name: "Email",
        selector: (row) => row.con_email,
        sortable: true,
      },
      {
        name: "Mobile Number",
        selector: (row) => row.con_mobile,
        sortable: true,
      },
      {
        name: "Action",
        cell: (row) => (
          <div className="d-flex">
            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={() => setSelectedContact(row)}
            >
              View
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        width: "120px",
      },
    ],
    []
  );


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Contact Queries</h2>
      </div>

      <TableContainer columns={columns} data={contacts} />

      {/* Modal */}
      {selectedContact && (
        <div
          className="modal show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelectedContact(null)} // close on backdrop click
        >
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Contact Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedContact(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Name:</strong> {selectedContact.firstname}</p>
                <p><strong>Email:</strong> {selectedContact.con_email}</p>
                <p><strong>Mobile Number:</strong> {selectedContact.con_mobile}</p>
                {selectedContact.con_message && (
                  <p><strong>Message:</strong> {selectedContact.con_message}</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedContact(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageContactQuery;
