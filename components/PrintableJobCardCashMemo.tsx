
import React from 'react';
import { JobCard } from '../types';
import { GangchillLogo, TKingLogo } from './Logo';

interface PrintableJobCardCashMemoProps {
  data: JobCard;
  onClose: () => void;
}

const numToWords = (num: number) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const n = ('000000000' + Math.floor(num)).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + ' Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + ' Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + ' Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + ' Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) + 'Taka only' : 'Taka only';
  return str;
};

const PrintableJobCardCashMemo: React.FC<PrintableJobCardCashMemoProps> = ({ data }) => {
  const partsTotal = data.partsIssued.reduce((s, p) => s + p.totalPrice, 0);
  const grandTotal = partsTotal + (data.totalLabour || 0);

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] text-black flex flex-col font-sans border relative print:shadow-none print:m-0 print:w-full invoice-style">
      {/* Module A: Branding */}
      <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
        <div className="flex flex-col items-center">
          <TKingLogo height={45} />
          <div className="text-[9px] font-black text-blue-900 uppercase text-center mt-1">
            Pick-up & Light Truck<br/>টাকা আয়ের রাজা
          </div>
        </div>
        
        <div className="text-center flex-1 px-4">
           <div className="flex items-center justify-center gap-4">
              <GangchillLogo size={45} />
              <div className="text-left">
                <h1 className="text-3xl font-ragtime text-blue-900 uppercase leading-none">Al-Amin</h1>
                <h2 className="text-xl font-artica text-gray-700 italic -mt-1">Enterprise</h2>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Authorized Service Center & Spares</p>
              </div>
           </div>
        </div>
        
        <div className="border-2 border-black px-4 py-1.5 font-black text-[12px] uppercase h-fit">SERVICE INVOICE / JOB CARD</div>
      </div>

      {/* Module A Header: Technical Data */}
      <div className="grid grid-cols-2 gap-x-8 mb-6 border border-black p-4 text-[11px] bg-gray-50">
         <div className="space-y-1.5">
            <p><span className="font-black w-32 inline-block">Job Card No:</span> <span className="font-bold border-b border-black flex-1 uppercase">{data.id}</span></p>
            <p><span className="font-black w-32 inline-block">Mechanic Name:</span> <span className="font-bold border-b border-black flex-1 uppercase">{data.mechanicName}</span></p>
            <p><span className="font-black w-32 inline-block">Chassis No:</span> <span className="font-mono border-b border-black flex-1">{data.chassisNo}</span></p>
            <p><span className="font-black w-32 inline-block">Registration No:</span> <span className="font-black border-b border-black flex-1 uppercase">{data.regNo}</span></p>
         </div>
         <div className="space-y-1.5">
            <p><span className="font-black w-32 inline-block">Date In/Out:</span> <span className="border-b border-black flex-1 font-bold">{data.dateIn} / {data.dateOut || 'N/A'}</span></p>
            <p><span className="font-black w-32 inline-block">Kms In/Out:</span> <span className="border-b border-black flex-1 font-bold">{data.kmsIn} / {data.kmsOut || 'N/A'}</span></p>
            <p><span className="font-black w-32 inline-block">Customer Name:</span> <span className="font-black border-b border-black flex-1 uppercase text-blue-900">{data.customerName}</span></p>
            <p><span className="font-black w-32 inline-block">Mobile No:</span> <span className="font-bold border-b border-black flex-1">{data.phone}</span></p>
         </div>
      </div>

      {/* Module A: Labour Table */}
      <div className="mb-6">
        <h3 className="bg-gray-100 text-[10px] font-black uppercase text-center py-1 border border-black mb-0">Labour Specification Section</h3>
        <table className="w-full border-2 border-black text-[11px] border-collapse">
           <thead className="bg-gray-50 font-black uppercase text-center border-b border-black">
              <tr className="h-8">
                <th className="w-12 border-r border-black">Sl</th>
                <th className="text-left px-4 border-r border-black">Job Description</th>
                <th className="w-32 text-right px-4">Labour Bill</th>
              </tr>
           </thead>
           <tbody>
              {data.jobs.length > 0 ? data.jobs.map((job, i) => (
                <tr key={i} className="border-b border-black last:border-0 h-8">
                   <td className="text-center border-r border-black">{i+1}</td>
                   <td className="px-4 border-r border-black uppercase font-bold">{job.description}</td>
                   <td className="text-right px-4 font-black">{job.labourBill.toFixed(2)}</td>
                </tr>
              )) : (
                <tr className="h-8"><td colSpan={3} className="text-center italic opacity-30">No labour entries</td></tr>
              )}
           </tbody>
        </table>
      </div>

      {/* Module A: Parts Section */}
      <div className="mb-6">
        <h3 className="bg-gray-900 text-white text-[10px] font-black uppercase text-center py-1 border border-black mb-0">RECEIVE FROM STORE (PARTS SPECIFICATION)</h3>
        <table className="w-full border-2 border-black text-[11px] border-collapse">
           <thead className="bg-gray-50 font-black uppercase text-center border-b border-black">
              <tr className="h-8">
                <th className="w-12 border-r border-black">Sl</th>
                <th className="text-left px-4 border-r border-black">Part Name / Number</th>
                <th className="w-20 border-r border-black">Qty</th>
                <th className="w-32 text-right px-4">Total Price</th>
              </tr>
           </thead>
           <tbody>
              {data.partsIssued.map((p, i) => (
                <tr key={p.id} className="border-b border-black last:border-0 h-8">
                   <td className="text-center border-r border-black font-bold">{i+1}</td>
                   <td className="px-4 border-r border-black uppercase font-black text-blue-900">{p.partName} <span className="text-[9px] font-mono text-gray-400">({p.partNo})</span></td>
                   <td className="text-center border-r border-black font-black">{p.quantity}</td>
                   <td className="text-right px-4 font-black">{p.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 5 - data.partsIssued.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-8 border-b border-black last:border-0 opacity-20 divide-x divide-black"><td></td><td></td><td></td><td></td></tr>
              ))}
           </tbody>
        </table>
      </div>

      {/* Grand Total - Sum of Labour + Parts */}
      <div className="flex flex-col items-end pt-4">
         <div className="w-80 bg-gray-900 text-white p-4 font-black text-lg flex justify-between border-4 border-double border-white ring-2 ring-gray-900">
            <span className="uppercase tracking-tighter">Grand Total:</span>
            <span>৳ {grandTotal.toFixed(0)}</span>
         </div>
         <p className="text-[10px] font-black uppercase italic mt-2 text-gray-700">In Word: {numToWords(grandTotal)}</p>
      </div>

      {/* Module A Signatures: Service Engineer/Foreman and Customer Signature */}
      <div className="flex justify-between items-end px-4 mt-24 mb-12 text-[11px] font-black uppercase tracking-widest">
         <div className="border-t-2 border-black w-64 text-center pt-3">Service Engineer / Foreman</div>
         <div className="border-t-2 border-black w-64 text-center pt-3">Customer Signature</div>
      </div>

      <div className="mt-auto border-t border-gray-100 pt-4 text-center text-[7.5px] text-gray-300 font-bold uppercase tracking-[0.5em]">
         AL-AMIN ENTERPRISE ERP • CLOUD TECHNICAL MODULE • SYSTEM-GENERATED DOCUMENT
      </div>
    </div>
  );
};

export default PrintableJobCardCashMemo;
