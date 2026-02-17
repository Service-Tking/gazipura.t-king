
import React from 'react';
import { JobCard } from '../types';

interface PrintableSalesInvoiceProps {
  data: JobCard;
}

const PrintableSalesInvoice: React.FC<PrintableSalesInvoiceProps> = ({ data }) => {
  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] text-black font-sans text-[11px] leading-tight flex flex-col border border-gray-100 relative print:m-0 print:p-0 print:border-none print:shadow-none shadow-2xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black tracking-widest uppercase border-b-2 border-black inline-block pb-1">Sales Invoice</h1>
      </div>

      <div className="border-t-2 border-black">
        <div className="grid grid-cols-2 border-b border-black">
           <div className="flex border-r border-black"><span className="w-24 p-1.5 font-bold uppercase">Cust Code:</span> <span className="p-1.5 border-l border-black flex-1 uppercase">CUS-0947</span></div>
           <div className="flex"><span className="w-24 p-1.5 font-bold uppercase">Cust Name:</span> <span className="p-1.5 border-l border-black flex-1 uppercase">{data.customerName}</span></div>
        </div>
        <div className="grid grid-cols-2 border-b border-black">
           <div className="flex border-r border-black"><span className="w-24 p-1.5 font-bold uppercase">Address:</span> <span className="p-1.5 border-l border-black flex-1 uppercase">{data.address}</span></div>
           <div className="flex"><span className="w-24 p-1.5 font-bold uppercase">Contact:</span> <span className="p-1.5 border-l border-black flex-1 uppercase">{data.phone}</span></div>
        </div>
        <div className="grid grid-cols-2 border-b-2 border-black">
           <div className="flex border-r border-black"><span className="w-24 p-1.5 font-bold uppercase">Invoice No:</span> <span className="p-1.5 border-l border-black flex-1 font-bold">{data.id}</span></div>
           <div className="flex"><span className="w-24 p-1.5 font-bold uppercase">Date:</span> <span className="p-1.5 border-l border-black flex-1">{data.date}</span></div>
        </div>
        <div className="border-b-2 border-black flex"><span className="w-24 p-1.5 font-bold uppercase">From:</span> <span className="p-1.5 border-l border-black flex-1 uppercase">Gazipura</span></div>
      </div>

      <div className="mt-8 flex-1">
        <table className="w-full border-2 border-black text-center border-collapse">
          <thead>
            <tr className="bg-white font-bold h-10 border-b-2 border-black">
              <th className="border-r border-black w-12">SI/No</th>
              <th className="border-r border-black text-left px-4">Product Name</th>
              <th className="border-r border-black w-24">Code</th>
              <th className="border-r border-black w-16">Unit</th>
              <th className="border-r border-black w-16">Ord QTy</th>
              <th className="border-r border-black w-24">Rate</th>
              <th className="w-32">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.partsIssued.map((p, i) => (
              <tr key={p.id} className="h-9 border-b border-black last:border-0 align-middle">
                <td className="border-r border-black">{i + 1}</td>
                <td className="border-r border-black text-left px-4 uppercase font-bold">{p.partName}</td>
                <td className="border-r border-black font-mono">{p.partNo}</td>
                <td className="border-r border-black uppercase">{p.unit}</td>
                <td className="border-r border-black">{p.quantity}</td>
                <td className="border-r border-black">{(p.unitPrice).toFixed(2)}</td>
                <td className="font-bold">{(p.totalPrice).toFixed(2)}</td>
              </tr>
            ))}
            {/* Pad with empty rows to match UI style */}
            {Array.from({ length: Math.max(0, 10 - data.partsIssued.length) }).map((_, i) => (
              <tr key={i} className="h-9 border-b border-black last:border-0"><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col items-end gap-1 px-4">
        <div className="flex w-64 justify-between font-bold"><span>Total Amount :</span> <span>{data.grandTotal?.toFixed(2)}</span></div>
        <div className="flex w-64 justify-between font-bold"><span>Discount Amount :</span> <span>{data.discountAmount?.toFixed(2) || '0.00'}</span></div>
        <div className="flex w-64 justify-between font-black text-sm border-t border-black pt-1"><span>Net Amount :</span> <span>{data.grandTotal?.toFixed(2)}</span></div>
      </div>

      {/* Signatures based on Interface 9 */}
      <div className="flex justify-between mt-auto pt-20 mb-10 px-10">
        <div className="w-48 text-center">
           <div className="border-t border-black pt-2 uppercase font-black text-[10px]">SPD Incharge</div>
        </div>
        <div className="w-48 text-center">
           <div className="border-t border-black pt-2 uppercase font-black text-[10px]">Customer Signature</div>
        </div>
      </div>

      <div className="text-center opacity-30 pointer-events-none absolute inset-0 flex items-center justify-center -rotate-12 z-0">
        <div className="border-[10px] border-blue-900/10 p-20 rounded-full flex flex-col items-center">
          <span className="text-6xl font-black text-blue-900/10 uppercase tracking-tighter">T-KING</span>
          <span className="text-xl font-bold text-red-600/10 uppercase">Al-Amin Enterprise</span>
        </div>
      </div>
    </div>
  );
};

export default PrintableSalesInvoice;
