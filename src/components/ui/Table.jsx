import React from 'react';

export default function Table({ columns = [], data = [], renderRowActions }) {
  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => <th key={col.key} className="text-left p-3 text-sm text-gray-600">{col.title}</th>)}
            {renderRowActions && <th className="p-3 text-sm text-gray-600">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row._id} className="border-t">
              {columns.map(col => <td key={col.key} className="p-3 text-sm">{col.render ? col.render(row) : row[col.dataIndex]}</td>)}
              { renderRowActions && <td className="p-3">{renderRowActions(row)}</td> }
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
