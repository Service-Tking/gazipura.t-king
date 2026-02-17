
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { JobCard, JobCardStatus, JobItem } from '../types';
import PrintableJobCard from './PrintableJobCard';
import PrintableJobCardCashMemo from './PrintableJobCardCashMemo';

interface ServiceManagementProps {
  activeSubTab?: string;
  jobCards: JobCard[];
  onUpdateJobCards: (jc: JobCard[]) => void;
}

const MODELS = [
  'T-king 0.75 Ton',
  'T-king 1.0 Ton',
  'T-king 1.5 Ton',
  'T-king 2.5 Ton'
];

const ServiceManagement: React.FC<ServiceManagementProps> = ({ activeSubTab, jobCards, onUpdateJobCards }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isInspecting, setIsInspecting] = useState<string | null>(null);
  const [printingJobCardId, setPrintingJobCardId] = useState<string | null>(null);
  const [printingCombinedId, setPrintingCombinedId] = useState<string | null>(null);

  const [newJC, setNewJC] = useState<Partial<JobCard>>({
    id: `JC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    customerName: '', 
    phone: '',
    address: '', 
    regNo: '', 
    model: MODELS[0],
    warranty: '',
    dateIn: new Date().toISOString().split('T')[0],
    dateOut: '',
    deliveryDate: '',
    chassisNo: '',
    engineNo: '',
    kmsIn: '',
    mechanicName: '',
    customerComplaints: ''
  });

  const [inspectionRows, setInspectionRows] = useState<JobItem[]>([
    { sl: 1, description: '', observation: '', labourBill: 0 }
  ]);

  const handleSaveNewJC = () => {
    const jc: JobCard = {
      ...newJC,
      date: new Date().toISOString().split('T')[0],
      status: JobCardStatus.RUNNING,
      partsIssued: [],
      jobs: inspectionRows.filter(r => r.description || r.observation),
      totalLabour: inspectionRows.reduce((acc, row) => acc + (Number(row.labourBill) || 0), 0),
      remarks: '',
      serviceType: 'Customer Paid Service'
    } as JobCard;
    
    onUpdateJobCards([jc, ...jobCards]);
    setIsAdding(false);
    setInspectionRows([{ sl: 1, description: '', observation: '', labourBill: 0 }]);
  };

  const addRow = () => {
    setInspectionRows([...inspectionRows, { sl: inspectionRows.length + 1, description: '', observation: '', labourBill: 0 }]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">Service Registry</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Al-Amin Enterprise Technical Floor</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-blue-900 text-white px-10 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
          <Icons.Plus size={20} /> New Job Card
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobCards.length === 0 ? (
          <div className="bg-white p-24 rounded-[4rem] text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
            <div className="p-8 bg-gray-50 rounded-full mb-6">
              <Icons.Wrench size={48} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Operational Database Empty</p>
          </div>
        ) : (
          jobCards.map(jc => (
            <div key={jc.id} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center hover:shadow-2xl transition-all border-l-[12px] border-l-blue-900 group">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest font-mono">No: {jc.id}</span>
                  <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${jc.status === JobCardStatus.RUNNING ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{jc.status}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight group-hover:text-blue-900 transition-colors">{jc.customerName || 'N/A'}</h3>
                  <div className="flex flex-wrap gap-6 text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">
                    <span className="text-blue-600">Reg: {jc.regNo || '---'}</span>
                    <span>Model: {jc.model}</span>
                    <span className="bg-gray-100 px-3 py-0.5 rounded-full">Mechanic: {jc.mechanicName || 'TBD'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full md:w-64 mt-8 md:mt-0">
                 <button onClick={() => setPrintingJobCardId(jc.id)} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-blue-800 transition-all active:scale-95">
                   <Icons.Printer size={16} /> Print Job Card
                 </button>
                 <button onClick={() => setPrintingCombinedId(jc.id)} className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-teal-700 transition-all active:scale-95">
                   <Icons.FileText size={16} /> Print JC / Cash Memo
                 </button>
                 <button onClick={() => setIsInspecting(jc.id)} className="w-full bg-white border border-gray-200 text-gray-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                   <Icons.Search size={16} /> Audit Findings
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xl">
          <div className="bg-white rounded-[3.5rem] w-full max-w-6xl p-14 space-y-12 shadow-2xl border-t-[16px] border-blue-900 my-8">
            <div className="flex justify-between items-start border-b pb-10">
               <div>
                  <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Workshop Intake</h3>
                  <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mt-2">New Service Registration Order</p>
               </div>
               <button onClick={() => setIsAdding(false)} className="p-4 bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-3xl transition-all active:scale-90"><Icons.X size={32}/></button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16">
               <div className="space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 bg-blue-900 rounded-full"></div> Client Profile</h4>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-gray-500 px-4">Job Card No (+/- allowed)</label>
                         <input value={newJC.id} className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-black text-blue-900 outline-none focus:ring-4 focus:ring-blue-900/10" onChange={e => setNewJC({...newJC, id: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-gray-500 px-4">Customer Name [ Input here ]</label>
                         <input className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-black uppercase outline-none focus:ring-4 focus:ring-blue-900/10" value={newJC.customerName} onChange={e => setNewJC({...newJC, customerName: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 px-4">Phone [ input here ]</label>
                           <input className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-900/10" value={newJC.phone} onChange={e => setNewJC({...newJC, phone: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 px-4">Registration [ input here ]</label>
                           <input className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-black uppercase outline-none focus:ring-4 focus:ring-blue-900/10" value={newJC.regNo} onChange={e => setNewJC({...newJC, regNo: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-gray-500 px-4">Address [ input here ]</label>
                         <textarea rows={2} className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm outline-none focus:ring-4 focus:ring-blue-900/10" value={newJC.address} onChange={e => setNewJC({...newJC, address: e.target.value})} />
                      </div>
                    </div>
                  </div>
               </div>
               
               <div className="space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 bg-blue-900 rounded-full"></div> Asset Specifications</h4>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 px-4">Vehicle Model</label>
                           <select className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-black uppercase outline-none focus:ring-4 focus:ring-blue-900/10" value={newJC.model} onChange={e => setNewJC({...newJC, model: e.target.value})}>
                             {MODELS.map(m => <option key={m}>{m}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 px-4">Warranty [ input here ]</label>
                           <input className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-bold uppercase outline-none focus:ring-4 focus:ring-blue-900/10" value={newJC.warranty} onChange={e => setNewJC({...newJC, warranty: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 px-4">Date In [ Auto Calendar ]</label>
                           <input type="date" className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-bold" value={newJC.dateIn} onChange={e => setNewJC({...newJC, dateIn: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 px-4">Date Out [ Input here ]</label>
                           <input type="date" className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-bold" value={newJC.dateOut} onChange={e => setNewJC({...newJC, dateOut: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 px-4">Date of Delivery</label>
                           <input type="date" className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-bold" value={newJC.deliveryDate} onChange={e => setNewJC({...newJC, deliveryDate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-500 px-4">Mechanic Assigned</label>
                           <input placeholder="Mechanic Name" className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-900/10" value={newJC.mechanicName} onChange={e => setNewJC({...newJC, mechanicName: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <input placeholder="Chassis No" className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-mono uppercase" value={newJC.chassisNo} onChange={e => setNewJC({...newJC, chassisNo: e.target.value})} />
                        <input placeholder="Engine No" className="w-full bg-gray-50 border border-gray-100 p-5 rounded-3xl text-sm font-mono uppercase" value={newJC.engineNo} onChange={e => setNewJC({...newJC, engineNo: e.target.value})} />
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="mt-8 space-y-8 bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                 <h4 className="text-[12px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-2"><Icons.Wrench size={16}/> Service Specification Items</h4>
                 <button onClick={addRow} className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all">Add Line Row</button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <div className="col-span-1 text-center">SL [ Auto ]</div>
                  <div className="col-span-5">Job Description [ Input here ]</div>
                  <div className="col-span-4">Observation [ Input By Inspection ]</div>
                  <div className="col-span-2 text-right">Labour Bill [ Input ]</div>
                </div>
                {inspectionRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-6 items-center bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="col-span-1 text-center font-black text-gray-900 text-sm">{row.sl}</div>
                    <input 
                      placeholder="e.g. Engine noise repair" 
                      className="col-span-5 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:ring-4 focus:ring-blue-900/10"
                      value={row.description}
                      onChange={e => {
                        const newRows = [...inspectionRows];
                        newRows[idx].description = e.target.value;
                        setInspectionRows(newRows);
                      }}
                    />
                    <input 
                      placeholder="e.g. Found loose pulley" 
                      className="col-span-4 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs italic outline-none focus:ring-4 focus:ring-blue-900/10"
                      value={row.observation}
                      onChange={e => {
                        const newRows = [...inspectionRows];
                        newRows[idx].observation = e.target.value;
                        setInspectionRows(newRows);
                      }}
                    />
                    <div className="col-span-2 relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-300 text-xs">৳</span>
                       <input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-10 text-xs font-black text-right outline-none focus:ring-4 focus:ring-blue-900/10"
                        value={row.labourBill}
                        onChange={e => {
                          const newRows = [...inspectionRows];
                          newRows[idx].labourBill = parseFloat(e.target.value) || 0;
                          setInspectionRows(newRows);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button onClick={handleSaveNewJC} className="w-full bg-blue-900 text-white py-8 rounded-[3rem] font-black uppercase text-xs tracking-[0.4em] shadow-[0_20px_50px_rgba(30,58,138,0.4)] hover:scale-[1.01] active:scale-95 transition-all">
               Commit Record & Generate Document
            </button>
          </div>
        </div>
      )}

      {printingJobCardId && (
        <PrintableJobCard 
          data={jobCards.find(j => j.id === printingJobCardId)!} 
          onClose={() => setPrintingJobCardId(null)} 
        />
      )}

      {printingCombinedId && (
        <PrintableJobCardCashMemo 
          data={jobCards.find(j => j.id === printingCombinedId)!} 
          onClose={() => setPrintingCombinedId(null)} 
        />
      )}
    </div>
  );
};

export default ServiceManagement;
