import DataTable from "react-data-table-component";
import dayjs from "dayjs";

export default function AttendanceTable({ data }) {
  const columns = [
    { name: "Date", selector: r => r.date, sortable: true },

    {
      name: "Punch In",
      cell: r => r.punchIn ? dayjs(r.punchIn).format("hh:mm A") : "-"
    },

    {
      name: "Punch Out",
      cell: r => r.punchOut ? dayjs(r.punchOut).format("hh:mm A") : "-"
    },

    {
      name: "Hours",
      selector: r => r.totalHours || "-",
      sortable: true
    },

    {
      name: "Status",
      cell: r => (
        <span className={`px-3 py-1 rounded-full text-xs ${
          r.status === "late" ? "bg-red-100 text-red-700" :
          r.status === "half-day" ? "bg-orange-100 text-orange-700" :
          "bg-green-100 text-green-700"
        }`}>
          {r.status}
        </span>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination
      highlightOnHover
      responsive
    />
  );
}
