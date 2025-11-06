import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminReports.css";
import AdminHeader from "./AdminHeader.jsx";
export default function AdminReports() {
  const [reports, setReports] = useState([]);

  const fetchReports = () => {
    axios.get("http://localhost:5000/api/admin/reports")
      .then(res => setReports(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const deleteReport = (reportId) => {
    if (!window.confirm("Delete this report?")) return;
    axios.delete(`http://localhost:5000/api/admin/reports/${reportId}`)
      .then(() => fetchReports())
      .catch(err => console.error(err));
  };

  return (
            <div className="home-container">
              <AdminHeader />
    <div className="admin-reports">
      <h2>User Reports</h2>
      <table>
        <thead>
          <tr>
            <th>Reporter</th>
            <th>Reported User</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(rep => (
            <tr key={rep._id}>
              <td>{rep.reporterEmail}</td>
              <td>{rep.reportedEmail}</td>
              <td>{rep.reason}{rep.otherReason ? `: ${rep.otherReason}` : ""}</td>
              <td>
                <button onClick={() => deleteReport(rep._id)}>Delete Report</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
