import React, { forwardRef } from 'react';
import type { Member } from '../types/members.types';

interface PrintableMembersTableProps {
  data: Member[];
  churchName?: string;
}

export const PrintableMembersTable = forwardRef<HTMLDivElement, PrintableMembersTableProps>(
  ({ data, churchName }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black w-full print:block" style={{ position: 'absolute', left: '-9999px', top: '0' }}>
        <style type="text/css" media="print">
          {`
            @page { size: A4 landscape; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
          `}
        </style>
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold uppercase">{churchName || 'Church Directory'}</h1>
          <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left font-bold">First Name</th>
              <th className="border border-gray-300 p-2 text-left font-bold">Last Name</th>
              <th className="border border-gray-300 p-2 text-left font-bold">Phone</th>
              <th className="border border-gray-300 p-2 text-left font-bold">Email</th>
              <th className="border border-gray-300 p-2 text-left font-bold">Role</th>
              <th className="border border-gray-300 p-2 text-left font-bold">Spiritual Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((member) => (
              <tr key={member.id}>
                <td className="border border-gray-300 p-2">{member.firstName || '-'}</td>
                <td className="border border-gray-300 p-2">{member.lastName || '-'}</td>
                <td className="border border-gray-300 p-2">{member.phone || '-'}</td>
                <td className="border border-gray-300 p-2">{member.email || '-'}</td>
                <td className="border border-gray-300 p-2 capitalize">{member.role || '-'}</td>
                <td className="border border-gray-300 p-2 capitalize">{member.spiritualStatus?.replace('_', ' ') || '-'}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="border border-gray-300 p-4 text-center text-gray-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
);

PrintableMembersTable.displayName = 'PrintableMembersTable';
