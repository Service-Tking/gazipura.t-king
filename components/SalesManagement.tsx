
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { JobCard, JobCardStatus, TemplateConfig, IssuedPart, Product, JobItem, Estimate } from '../types';
import { INITIAL_PRODUCTS } from '../constants';
import InvoicePreviewer from './InvoicePreviewer';

interface SalesManagementProps {
  templates: TemplateConfig[];
  activeSubTab?: string;
  jobCards: JobCard[];
  onUpdateJobCards: (jc: JobCard[]) => void;
  products?: Product[];
  onUpdateProducts?: (p: Product[]) => void;
  estimates?: Estimate[];
}

const SalesManagement: React.FC<SalesManagementProps> = ({ 
  templates, 
  activeSubTab, 
  jobCards, 
  onUpdateJobCards,
  products = INITIAL_PRODUCTS,
  estimates = []
}) => {
  const [view, setView] = useState<'manage' | 'new'>('manage');
  const [previewingInvoiceId, setPreviewingInvoiceId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLTableDataCellElement>(null);

  const mode = activeSubTab === 'sales-invoice' ? 'SERVICE' : 'SALES';

  // Navigation Logic: Fixed sequence for Invoice Entry
  useEffect(() => {
    if (activeSubTab === 'sales-invoice') {
      setView('manage'); // Always start with history for Invoice Entry
    } else {
      setView('new'); // Direct entry for Cash Memo as requested
    }
  }, [activeSubTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayRecords = jobCards.filter(jc => 
    mode === 'SERVICE' ? jc.serviceType === 'Service Invoice' : jc.serviceType === 'Bill/Cash Memo'
  );

  const [header, setHeader] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerCode: '',
    address: 'N/A',
    contact: '',
    regNo: '',
    chassisNo: '',
    engineNo: '',
    mechanicName: '',
    dateIn: new Date().toISOString().split('T')[0],
    dateOut: '',
    kmsIn: '0',
    kmsOut: '0',
    payterms: 'Cash',
    warehouse: 'Service Center Gazipura',
    estimateNo: ''
  });

  useEffect(() => {
    setHeader(h => ({
      ...h,
      number: mode === 'SERVICE' 
        ? `INS-${Math.floor(Math.random() * 90000000 + 10000000)}` 
        : `BN-${Math.floor(Math.random() * 90000000 + 10000000)}`
    }));
  }, [view, mode]);

  const [partEntry, setPartEntry] = useState({
    search: '',
    code: '',
    selectedProduct: null as Product | null,
    qty: 1,
    sellRate: 0,
    taxRate: 0,
    unit: 'Pcs',
    suggestions: [] as Product[]
  });

  const [labourRows, setLabourRows] = useState<JobItem[]>([
    { sl: 1, description: '', observation: '', labourBill: 0 }
  ]);

  const [partsIssued, setPartsIssued] = useState<IssuedPart[]>([]);
  const [breakdown, setBreakdown] = useState({ discountRate: 0, discountAmount: 0, taxAmount: 0 });

  const totalParts = partsIssued.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalLabour = mode === 'SERVICE' ? labourRows.reduce((sum, r) => sum + (r.labourBill || 0), 0) : 0;
  const subTotal = totalParts + totalLabour;
  const calculatedDiscount = breakdown.discountAmount || (subTotal * (breakdown.discountRate / 100));
  const grandTotal = subTotal - calculatedDiscount + breakdown.taxAmount;

  const handleProductSearch = (term: string) => {
    setPartEntry(prev => ({ ...prev, search: term }));
    if (term.trim().length > 0) {
      // 1st word search logic
      const termLower = term.toLowerCase();
      const filtered = products.filter(p => 
        p.name.toLowerCase().startsWith(termLower) || 
        p.sku.toLowerCase().startsWith(termLower)
      ).slice(0, 10);
      setPartEntry(prev => ({ ...prev, suggestions: filtered }));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectProduct = (prod: Product) => {
    setPartEntry({ 
      ...partEntry, 
      search: prod.name, 
      code: prod.sku, 
      selectedProduct: prod, 
      sellRate: prod.price, 
      taxRate: prod.taxRate || 0,
      unit: prod.unit || 'Pcs',
      suggestions: []
    });
    setShowSuggestions(false);
  };

  const handleFetchEstimate = (estimateNo: string) => {
    const est = estimates.find(e => e.id === estimateNo);
    if (!est) return;

    // Auto-populate
    setHeader({
      ...header,
      customerName: est.customerName,
      regNo: est.registrationNo,
      chassisNo: est.chassisNo,
      contact: est.phone,
      estimateNo: est.id
    });
    setPartsIssued(est.parts);
    alert(`Successfully fetched ${est.parts.length} items from Estimate ${est.id}`);
  };

  const handleAddPart = () => {
    if (!partEntry.selectedProduct || partEntry.qty <= 0) {
      alert("Select valid product.");
      return;
    }
    if (partEntry.selectedProduct.stock <= 0) {
      alert(`STOP: ${partEntry.selectedProduct.name} is OUT OF STOCK.`);
      return;
    }
    const newItem: IssuedPart = {
      id: Math.random().toString(36).substr(2, 9),
      partNo: partEntry.selectedProduct.sku,
      partName: partEntry.selectedProduct.name,
      quantity: partEntry.qty,
      unitPrice: partEntry.sellRate,
      totalPrice: partEntry.qty * partEntry.sellRate,
      unit: partEntry.unit,
      taxRate: partEntry.taxRate
    };
    setPartsIssued([...partsIssued, newItem]);
    setPartEntry({ search: '', code: '', selectedProduct: null, qty: 1, sellRate: 0, taxRate: 0, unit: 'Pcs', suggestions: [] });
  };

  const handleSave = () => {
    const newDoc: JobCard = {
      id: header.number,
      date: header.date,
      customerName: header.customerName || 'Walking Customer',
      address: header.address,
      phone: header.contact,
      regNo: header.regNo || 'N/A',
      chassisNo: header.chassisNo,
      engineNo: header.engineNo,
      model: mode === 'SERVICE' ? 'T-King Service' : 'T-King Sales',
      dateIn: header.dateIn,
      dateOut: header.dateOut,
      kmsIn: header.kmsIn,
      kmsOut: header.kmsOut,
      mechanicName: header.mechanicName,
      serviceType: mode === 'SERVICE' ? 'Service Invoice' : 'Bill/Cash Memo',
      status: JobCardStatus.COMPLETED,
      invoiceStatus: 'Paid',
      partsIssued,
      jobs: mode === 'SERVICE' ? labourRows.filter(r => r.description) : [],
      totalLabour,
      remarks: 'Committed to Ledger',
      discountAmount: calculatedDiscount,
      taxAmount: breakdown.taxAmount,
      grandTotal,
      payterms: header.payterms,
      warehouse: header.warehouse,
      warranty: 'N/A',
      customerComplaints: mode === 'SERVICE' ? 'Vehicle Service' : 'Direct Sale',
      estimateNo: header.estimateNo
    };

    onUpdateJobCards([newDoc, ...jobCards]);
    alert("Transaction committed successfully.");
    setView('manage');
    resetForm();
  };

  const resetForm = () => {
    setPartsIssued([]);
    setLabourRows([{ sl: 1, description: '', observation: '', labourBill: 0 }]);
    setBreakdown({ discountRate: 0, discountAmount: 0, taxAmount: 0 });
    setPartEntry({ search: '', code: '', selectedProduct: null, qty: 1, sellRate: 0, taxRate: 0, unit: 'Pcs', suggestions: [] });
  };

  const renderManageInvoice = () => (
    <div className="bg-[#f3f4f6] min-h-screen p-4 font-sans text-[11px] space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-[#3c8dbc] font-bold text-lg uppercase">Manage Invoice</h2>
        <span className="text-gray-400">»</span>
        <button onClick={() => setView('new')} className="text-blue-600 hover:underline font-bold">New Invoice</button>
      </div>

      <div className="bg-white border-t-4 border-[#3c8dbc] rounded shadow-md p-6">
        <div className="flex items-start gap-2 mb-6 bg-blue-50 p-4 rounded border border-blue-100">
           <Icons.Info size={16} className="text-blue-500 mt-0.5" />
           <p className="text-[11px] leading-relaxed text-gray-700 font-bold uppercase">
             <span className="text-blue-700">Manage Invoice:</span> View historical sales records. Click Sales Number to preview. Use Cancel/Confirm to manage workflow.
           </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-[10.5px]">
            <thead className="bg-[#3c8dbc] text-white font-bold uppercase border-b-2 border-gray-300">
              <tr className="divide-x divide-white/20 h-11">
                <th className="px-2">Sales Number</th>
                <th className="px-2">Sales Date</th>
                <th className="px-2">Customer Code</th>
                <th className="px-2">Estimate Ref</th>
                <th className="px-2">Payterms</th>
                <th className="px-2">Net Amount</th>
                <th className="px-2">Status</th>
                <th className="px-2">GL Voucher No</th>
                <th className="px-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-bold text-gray-600">
              {displayRecords.map(jc => (
                <tr key={jc.id} className="h-10 hover:bg-blue-50/50 border-b border-gray-200">
                  <td className="p-2 text-blue-600 underline cursor-pointer" onClick={() => setPreviewingInvoiceId(jc.id)}>{jc.id}</td>
                  <td className="p-2">{jc.date}</td>
                  <td className="p-2 uppercase">{jc.customerName.slice(0,8)}...</td>
                  <td className="p-2 text-teal-600">{jc.estimateNo || 'None'}</td>
                  <td className="p-2">{jc.payterms}</td>
                  <td className="p-2 font-black text-gray-900">৳ {jc.grandTotal?.toFixed(2)}</td>
                  <td className="p-2">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase text-[9px]">Delivered</span>
                  </td>
                  <td className="p-2 font-mono text-[9px]">AR-{Math.floor(Math.random()*100000)}</td>
                  <td className="p-2 flex justify-center gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-red-500" title="Cancel"><Icons.X size={14}/></button>
                    <button className="p-1.5 text-gray-400 hover:text-green-500" title="Confirm"><Icons.Check size={14}/></button>
                    <button onClick={() => setPreviewingInvoiceId(jc.id)} className="p-1.5 text-gray-400 hover:text-blue-500" title="Reports"><Icons.FileText size={14}/></button>
                  </td>
                </tr>
              ))}
              {displayRecords.length === 0 && (
                <tr><td colSpan={9} className="p-20 text-gray-300 uppercase tracking-widest italic">No sales history found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderNewInvoiceForm = () => (
    <div className="bg-[#f3f4f6] min-h-screen p-4 font-sans text-[11px] space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('manage')} className="text-[#3c8dbc] font-bold hover:underline uppercase">Manage Invoice</button>
          <span className="text-gray-400">»</span>
          <span className="text-gray-600 font-bold uppercase">New Invoice Entry</span>
        </div>
        
        {/* Fetch from Estimate Dropdown */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
           <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1"><Icons.FileSpreadsheet size={14}/> Bridge:</span>
           <select 
              className="bg-teal-50 border-none rounded-lg px-4 py-1.5 text-[11px] font-black uppercase text-teal-800 outline-none cursor-pointer hover:bg-teal-100 transition-colors"
              onChange={e => handleFetchEstimate(e.target.value)}
              value={header.estimateNo}
           >
              <option value="">Fetch from Estimate...</option>
              {estimates.map(est => (
                <option key={est.id} value={est.id}>{est.id} - {est.customerName}</option>
              ))}
           </select>
        </div>
      </div>

      {/* Al-AMIN BRANDING HEADER */}
      <div className="bg-[#3c8dbc] text-white py-2 px-6 rounded-t-md border border-[#3c8dbc] flex justify-between items-center shadow-sm">
        <span className="font-black uppercase tracking-tight">M/S AL-AMIN ENTERPRISE: TECHNICAL SERVICE TERMINAL</span>
        <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Digital Entry Protocol v2.5</span>
      </div>

      <div className="bg-white border border-gray-300 p-6 rounded-b-md shadow-lg space-y-8">
        {/* Module A specific Header Info */}
        <div className="bg-[#f4f4f4] p-4 rounded-md border-l-4 border-[#3c8dbc]">
          <h3 className="text-[#3c8dbc] font-black uppercase text-xs mb-4">Job Card / Invoice Header Information</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-3">
             <div className="flex items-center h-8"><label className="w-32 font-black text-gray-500 uppercase">Job Card No</label><input className="form-input-compact bg-gray-50 text-blue-800 font-black" value={header.number} readOnly /></div>
             <div className="flex items-center h-8"><label className="w-32 font-black text-gray-500 uppercase">Job Card Date</label><input type="date" className="form-input-compact font-bold" value={header.date} onChange={e=>setHeader({...header, date: e.target.value})} /></div>
             <div className="flex items-center h-8"><label className="w-32 font-black text-gray-500 uppercase">Estimate No</label><input className="form-input-compact bg-teal-50 text-teal-900 font-black" value={header.estimateNo} placeholder="N/A" readOnly /></div>
             <div className="flex items-center h-8"><label className="w-32 font-black text-gray-500 uppercase">Mechanic Name</label><select className="form-input-compact font-bold" value={header.mechanicName} onChange={e=>setHeader({...header, mechanicName: e.target.value})}><option value="">-- Select Mechanic --</option><option value="Mr. Mostofa">Mr. Mostofa</option></select></div>
             <div className="flex items-center h-8"><label className="w-32 font-black text-gray-500 uppercase">Date In</label><input type="date" className="form-input-compact" value={header.dateIn} onChange={e=>setHeader({...header, dateIn: e.target.value})} /></div>
             <div className="flex items-center h-8"><label className="w-32 font-black text-gray-500 uppercase">Date Out</label><input type="date" className="form-input-compact" value={header.dateOut} onChange={e=>setHeader({...header, dateOut: e.target.value})} /></div>
             <div className="flex items-center h-8"><label className="w-32 font-black text-gray-500 uppercase">Kms In</label><input className="form-input-compact" value={header.kmsIn} onChange={e=>setHeader({...header, kmsIn: e.target.value})} /></div>
             <div className="flex items-center h-8"><label className="w-32 font-black text-gray-500 uppercase">Kms Out</label><input className="form-input-compact" value={header.kmsOut} onChange={e=>setHeader({...header, kmsOut: e.target.value})} /></div>
             <div className="flex items-center h-8"><label className="w-32 font-black text-gray-500 uppercase">Payterms</label><select className="form-input-compact font-bold" value={header.payterms} onChange={e=>setHeader({...header, payterms: e.target.value})}><option>Cash</option><option>Credit</option></select></div>
             <div className="flex items-center h-8"><label className="w-32 font-black text-gray-500 uppercase">Warehouse</label><select className="form-input-compact" value={header.warehouse} onChange={e=>setHeader({...header, warehouse: e.target.value})}><option>Service Center Gazipura</option></select></div>
             <div className="flex items-center h-8 col-span-2"><label className="w-32 font-black text-gray-500 uppercase">Customer Name</label><input className="flex-1 form-input-compact uppercase font-black text-gray-800" placeholder="Type Client Name" value={header.customerName} onChange={e=>setHeader({...header, customerName: e.target.value})} /></div>
          </div>
        </div>

        {/* Dynamic Item Entry Section */}
        <div className="space-y-4">
          <div className="bg-[#3c8dbc] text-white py-1.5 px-4 font-black uppercase text-[10px] rounded-sm tracking-widest">Item / Service specification Grid</div>
          <div className="bg-blue-50/20 border border-gray-200 p-4 rounded-sm">
             <div className="grid grid-cols-12 gap-3 mb-2 px-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <div className="col-span-5">Product Name (Search Ledger)</div>
                <div className="col-span-1">Code</div>
                <div className="col-span-1 text-right">Rate</div>
                <div className="col-span-1 text-center">Tax %</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Sub-total</div>
                <div className="col-span-1"></div>
             </div>
             <div className="grid grid-cols-12 gap-3 items-center relative">
                <div className="col-span-5 relative" ref={dropdownRef}>
                  <input 
                    placeholder="Search by part name..." 
                    className="form-input-compact font-bold uppercase border-blue-100" 
                    value={partEntry.search} 
                    onChange={e => handleProductSearch(e.target.value)}
                    autoComplete="off"
                  />
                  {showSuggestions && partEntry.suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-2xl z-[100] max-h-60 overflow-y-auto">
                      {partEntry.suggestions.map((p) => (
                        <div key={p.id} className="p-2 cursor-pointer hover:bg-blue-50 border-b last:border-0 flex justify-between items-center transition-colors" onClick={() => selectProduct(p)}>
                          <div className="flex flex-col">
                            <span className="font-black text-[10px] uppercase text-gray-800">{p.name}</span>
                            <span className="text-[8px] text-gray-400 font-mono">CODE: {p.sku}</span>
                          </div>
                          <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${p.stock <= 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            Stock: {p.stock}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {partEntry.selectedProduct && (
                    <div className="mt-1 text-[9px] font-black flex items-center gap-1">
                      <span className="text-gray-400 uppercase">Availability:</span>
                      <span className={partEntry.selectedProduct.stock <= 0 ? 'text-red-600' : 'text-green-600'}>{partEntry.selectedProduct.stock} {partEntry.selectedProduct.unit}</span>
                    </div>
                  )}
                </div>
                <div className="col-span-1"><input className="form-input-compact bg-gray-50 text-center font-mono" value={partEntry.code} readOnly /></div>
                <div className="col-span-1"><input className="form-input-compact text-right font-black" value={partEntry.sellRate} readOnly /></div>
                <div className="col-span-1"><input className="form-input-compact text-center" value={partEntry.taxRate} readOnly /></div>
                <div className="col-span-1"><input type="number" className="form-input-compact text-center font-black" value={partEntry.qty} onChange={e => setPartEntry({...partEntry, qty: parseInt(e.target.value)||0})}/></div>
                <div className="col-span-2 text-right font-black text-blue-900 text-[12px]">৳ {(partEntry.qty * partEntry.sellRate).toFixed(2)}</div>
                <div className="col-span-1"><button onClick={handleAddPart} className="bg-[#f0ad4e] hover:bg-[#ec971f] text-white w-full h-8 rounded font-black uppercase text-[10px] shadow active:scale-95 transition-all">Add</button></div>
             </div>
          </div>

          <table className="w-full border border-gray-200">
             <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[9px] border-b">
                <tr><th className="p-2 text-left">Description</th><th className="p-2 w-24">Code</th><th className="p-2 w-20 text-right">Rate</th><th className="p-2 w-16">Qty</th><th className="p-2 w-24 text-right">Total</th><th className="p-2 w-10"></th></tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {partsIssued.map(p => (
                  <tr key={p.id} className="text-[10.5px] font-bold text-gray-700">
                    <td className="p-2 uppercase">{p.partName}</td>
                    <td className="p-2 font-mono text-center">{p.partNo}</td>
                    <td className="p-2 text-right">{p.unitPrice.toFixed(2)}</td>
                    <td className="p-2 text-center">{p.quantity}</td>
                    <td className="p-2 text-right font-black">৳ {p.totalPrice.toFixed(2)}</td>
                    <td className="p-2 text-center"><button onClick={()=>setPartsIssued(partsIssued.filter(i=>i.id!==p.id))} className="text-red-400 hover:text-red-600">×</button></td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>

        {/* Labour Section (Only for SERVICE) */}
        {mode === 'SERVICE' && (
          <div className="space-y-4">
             <div className="bg-[#3c8dbc] text-white py-1 px-4 font-black uppercase text-[10px] rounded-sm tracking-widest flex justify-between items-center">
                <span>Labour / Inspection Specification</span>
                <button onClick={()=>setLabourRows([...labourRows, {sl: labourRows.length+1, description:'', observation:'', labourBill:0}])} className="text-[9px] underline">Add Line Row</button>
             </div>
             <div className="space-y-2">
                {labourRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-center px-2">
                     <div className="col-span-1 text-center font-black text-gray-400">{row.sl}</div>
                     <div className="col-span-5"><input placeholder="Job Description..." className="form-input-compact font-bold uppercase" value={row.description} onChange={e=>{const updated=[...labourRows]; updated[idx].description=e.target.value; setLabourRows(updated);}}/></div>
                     <div className="col-span-4"><input placeholder="Observation..." className="form-input-compact italic" value={row.observation} onChange={e=>{const updated=[...labourRows]; updated[idx].observation=e.target.value; setLabourRows(updated);}}/></div>
                     <div className="col-span-2 relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-[9px]">৳</span><input type="number" className="form-input-compact pl-6 text-right font-black" value={row.labourBill} onChange={e=>{const updated=[...labourRows]; updated[idx].labourBill=parseFloat(e.target.value)||0; setLabourRows(updated);}}/></div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Breakdown of Amount */}
        <div className="flex justify-end pt-6">
           <div className="w-80 bg-white border border-gray-300 shadow-md rounded overflow-hidden">
              <div className="bg-gray-800 text-white text-center py-2 font-black uppercase text-[10px] tracking-widest">Break Down of Amount</div>
              <div className="p-3 space-y-2 text-[11px] font-bold text-gray-600 uppercase">
                 <div className="flex justify-between border-b pb-1"><span>Sub Total Amount:</span> <span>৳ {subTotal.toFixed(2)}</span></div>
                 <div className="flex justify-between border-b pb-1"><span>Applied Discount:</span> <span>৳ {calculatedDiscount.toFixed(2)}</span></div>
                 <div className="flex justify-between items-center h-10 px-3 bg-blue-900 text-white font-black mt-2">
                    <span className="text-[10px]">Net Payable Amount:</span>
                    <span className="text-[14px]">৳ {grandTotal.toFixed(2)}</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex justify-center pt-8">
           <button onClick={handleSave} className="bg-[#5cb85c] hover:bg-[#449d44] text-white px-24 py-4 rounded-[3rem] shadow-xl font-black uppercase text-[12px] tracking-[0.2em] active:scale-95 transition-all">
             Commit Record & Log Ledger
           </button>
        </div>
      </div>
    </div>
  );

  const renderNewCashMemoForm = () => (
    <div className="bg-[#f3f4f6] min-h-screen p-4 font-sans text-[11px] space-y-4">
      {/* Al-AMIN BRANDING HEADER */}
      <div className="bg-[#3c8dbc] text-white py-2 px-6 rounded-t-md border border-[#3c8dbc] flex justify-between items-center">
        <span className="font-black uppercase tracking-tight">M/S AL-AMIN ENTERPRISE: BILL / CASH MEMO INTERFACE</span>
      </div>

      <div className="bg-white border border-gray-300 p-6 rounded-b-md shadow-lg space-y-6">
        <div className="bg-gray-50 p-4 border rounded">
           <h3 className="text-gray-900 font-black uppercase text-xs mb-3 border-b pb-2">Header Information</h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center"><label className="w-32 font-bold uppercase text-gray-500">Bill No</label><input className="form-input-compact bg-gray-100 font-black text-blue-800" value={header.number} readOnly /></div>
              <div className="flex items-center"><label className="w-32 font-bold uppercase text-gray-500">Bill Date</label><input type="date" className="form-input-compact font-bold" value={header.date} onChange={e=>setHeader({...header, date: e.target.value})} /></div>
              <div className="flex items-center col-span-2"><label className="w-32 font-bold uppercase text-gray-500">Customer Name</label><input className="flex-1 form-input-compact uppercase font-black" value={header.customerName} onChange={e=>setHeader({...header, customerName: e.target.value})} /></div>
           </div>
        </div>

        <div className="bg-blue-50/20 border border-gray-200 p-4 rounded">
           <div className="bg-[#3c8dbc] text-white p-1 text-center font-black uppercase text-[9px] mb-4">Direct Parts Selection</div>
           <div className="grid grid-cols-12 gap-3 items-center relative mb-4">
                <div className="col-span-6 relative" ref={dropdownRef}>
                  <input 
                    placeholder="Search ledger by product name..." 
                    className="form-input-compact font-black uppercase" 
                    value={partEntry.search} 
                    onChange={e => handleProductSearch(e.target.value)}
                  />
                  {showSuggestions && partEntry.suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-2xl z-[100] max-h-60 overflow-y-auto">
                      {partEntry.suggestions.map((p) => (
                        <div key={p.id} className="p-2 cursor-pointer hover:bg-blue-50 border-b last:border-0 flex justify-between items-center" onClick={() => selectProduct(p)}>
                          <span className="font-black text-[10px] uppercase">{p.name}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${p.stock <= 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>Stock: {p.stock}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-2"><input className="form-input-compact bg-gray-50 text-center font-mono" value={partEntry.code} readOnly /></div>
                <div className="col-span-1"><input type="number" className="form-input-compact text-center font-black" value={partEntry.qty} onChange={e => setPartEntry({...partEntry, qty: parseInt(e.target.value)||0})}/></div>
                <div className="col-span-2 text-right font-black text-blue-900">৳ {(partEntry.qty * partEntry.sellRate).toFixed(2)}</div>
                <div className="col-span-1"><button onClick={handleAddPart} className="bg-[#f0ad4e] hover:bg-[#ec971f] text-white w-full h-8 rounded font-black uppercase text-[10px]">Add</button></div>
           </div>

           <table className="w-full border text-[11px] font-bold">
              <thead className="bg-gray-100 uppercase text-[9px]">
                 <tr><th className="p-2 text-left">Product Description</th><th className="p-2 w-32">Code</th><th className="p-2 w-20">Qty</th><th className="p-2 w-32 text-right">Rate</th><th className="p-2 w-32 text-right">Total</th><th className="p-2 w-10"></th></tr>
              </thead>
              <tbody className="divide-y">
                 {partsIssued.map(p => (
                   <tr key={p.id}>
                     <td className="p-2 uppercase">{p.partName}</td>
                     <td className="p-2 font-mono text-center">{p.partNo}</td>
                     <td className="p-2 text-center">{p.quantity}</td>
                     <td className="p-2 text-right">{p.unitPrice.toFixed(2)}</td>
                     <td className="p-2 text-right font-black">৳ {p.totalPrice.toFixed(2)}</td>
                     <td className="p-2"><button onClick={()=>setPartsIssued(partsIssued.filter(i=>i.id!==p.id))} className="text-red-400">×</button></td>
                   </tr>
                ))}
              </tbody>
           </table>
        </div>

        <div className="flex justify-end">
           <div className="w-80 border-2 border-black p-4 bg-gray-900 text-white flex justify-between font-black text-lg">
              <span className="uppercase">Net Amount:</span>
              <span>৳ {grandTotal.toFixed(2)}</span>
           </div>
        </div>

        <div className="flex justify-center pt-8">
           <button onClick={handleSave} className="bg-blue-900 text-white px-24 py-4 rounded-[3rem] shadow-xl font-black uppercase text-[12px] tracking-[0.2em] active:scale-95 transition-all">
             Generate Bill & Commit
           </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mode === 'SERVICE' ? (
        view === 'manage' ? renderManageInvoice() : renderNewInvoiceForm()
      ) : (
        renderNewCashMemoForm()
      )}
      
      {previewingInvoiceId && (
        <InvoicePreviewer 
          data={jobCards.find(j => j.id === previewingInvoiceId)!} 
          templates={templates}
          onClose={() => setPreviewingInvoiceId(null)} 
          onTemplateChange={() => {}} 
        />
      )}
    </>
  );
};

export default SalesManagement;
