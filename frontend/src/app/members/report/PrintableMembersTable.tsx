import React, { forwardRef } from 'react';
import type { Member } from '../types/members.types';

interface PrintableMembersTableProps {
  data: Member[];
  churchName?: string;
}

export const PrintableMembersTable = forwardRef<HTMLDivElement, PrintableMembersTableProps>(
  ({ data, churchName }, ref) => {
    return (
      <div className="hidden print:block p-8 bg-white text-black w-full" ref={ref}>
        <style type="text/css" media="print">
          {`
            @page { size: A4 landscape; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          `}
        </style>
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-gray-900">{churchName || 'Church Directory'}</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Member List • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <div className="mt-4 border-b-2 border-gray-900 w-24 mx-auto"></div>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="p-3 text-left font-bold uppercase tracking-wider text-gray-700">Name</th>
              <th className="p-3 text-left font-bold uppercase tracking-wider text-gray-700">Phone</th>
              <th className="p-3 text-left font-bold uppercase tracking-wider text-gray-700">Email</th>
              <th className="p-3 text-left font-bold uppercase tracking-wider text-gray-700">Role</th>
              <th className="p-3 text-left font-bold uppercase tracking-wider text-gray-700">Spiritual Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 font-semibold text-gray-900">
                  {member.firstName} {member.lastName}
                </td>
                <td className="p-3 text-gray-600">{member.phone || '-'}</td>
                <td className="p-3 text-gray-600">{member.email || '-'}</td>
                <td className="p-3 capitalize">
                  <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {member.role || '-'}
                  </span>
                </td>
                <td className="p-3 capitalize">
                  <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold">
                    {member.spiritualStatus?.replace('_', ' ') || '-'}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-400 italic">
                  No member records found for this directory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="mt-12 pt-8 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between uppercase tracking-widest font-medium">
          <span>Official Church Document</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    );
  }
);

PrintableMembersTable.displayName = 'PrintableMembersTable';
