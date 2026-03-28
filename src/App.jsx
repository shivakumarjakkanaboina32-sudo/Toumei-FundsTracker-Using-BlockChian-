import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from './abi.json';
import { Shield, Wallet, UploadCloud, Eye, Loader2, UserCheck, Search, Trash2, ArrowRight, Lock, CheckCircle, LogOut, Building2, FileText, ChevronDown, LayoutDashboard, DollarSign, Activity, X, Globe } from 'lucide-react';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = "0x6cb213A5D1F19126f04c60cc64966E68A4722eBd"; 

const VERIFIED_REGISTRY = [
  { name: "L&T Constructions", address: "0x123...abc", id: "VEN-001", rating: "4.9/5", type: "Vendor" },
  { name: "Tata Projects Ltd", address: "0x456...def", id: "VEN-002", rating: "4.8/5", type: "Vendor" },
  { name: "TechSolutions Infra", address: "0x789...ghi", id: "VEN-003", rating: "4.5/5", type: "Vendor" },
  { name: "Helping Hands Foundation", address: "0x999...ngo", id: "NGO-001", rating: "Verified", type: "NGO" },
  { name: "Demo Vendor Account", address: "SELF", id: "VEN-DEMO", rating: "5.0/5", type: "Vendor" } 
];

// --- UTILITIES ---
// Converts raw numbers (5000000) to Indian Format (50 L)
const formatCurrency = (value) => {
  if (!value) return "₹ 0";
  const num = parseInt(value);
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹ ${(num / 1000).toFixed(1)} K`;
  return `₹ ${num.toLocaleString('en-IN')}`;
};

function App() {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState("public"); // Default is public (Citizen View)
  const [view, setView] = useState("landing"); // Start at Landing Page
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState(""); 

  // DATA
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('toumei_projects');
    return saved ? JSON.parse(saved) : [{ id: 1, name: "Kerala Flood Relief", ngo: "Helping Hands", vendor: "L&T Constructions", amount: "5000000", status: "Released", bill: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c" }];
  });
  useEffect(() => { localStorage.setItem('toumei_projects', JSON.stringify(projects)); }, [projects]);

  const [newProject, setNewProject] = useState({ name: "", amount: "", vendorName: "" });
  const [billLink, setBillLink] = useState("");

  const totalAllocated = projects.reduce((acc, p) => acc + parseInt(p.amount || 0), 0);
  const totalReleased = projects.filter(p => p.status === "Released").reduce((acc, p) => acc + parseInt(p.amount || 0), 0);

  // --- ACTIONS ---
  const enterPublicDashboard = () => {
    setRole("public");
    setView("overview");
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please Install MetaMask!");
    try {
      setLoading(true);
      await window.ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setRole("admin"); // Default to Admin on connect for demo
      setView("overview");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tempContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      setContract(tempContract);
      setLoading(false);
    } catch (error) { setLoading(false); alert("Connection Failed"); }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleAllocate = async () => {
    if (!newProject.name || !newProject.amount || !newProject.vendorName) return alert("Fill all fields");
    setLoading(true);
    // Simulating Smart Contract Call
    try { if (contract) { const tx = await contract.allocateFunds(newProject.name, "0x000", account, { value: ethers.parseEther("0.00001") }); await tx.wait(); } } catch (error) { console.error("Ignored"); }
    
    const p = { id: Date.now(), name: newProject.name, ngo: "Helping Hands", vendor: newProject.vendorName, amount: newProject.amount, status: "Allocated", bill: "" };
    setProjects([p, ...projects]); 
    setNewProject({ name: "", amount: "", vendorName: "" });
    setLoading(false);
    setView("overview");
    showSuccess("Funds Allocated & Locked!");
  };

  const handleAction = async (id, action, link = "") => {
    setLoading(true); await new Promise(r => setTimeout(r, 1000));
    setProjects(projects.map(p => {
        if(p.id !== id) return p;
        if(action === "upload") return { ...p, status: "Verification", bill: link };
        if(action === "approve") return { ...p, status: "NGO_Approval" };
        if(action === "release") return { ...p, status: "Released" };
        if(action === "reject") return { ...p, status: "Allocated", bill: "" };
        return p;
    }));
    setLoading(false);
    
    if(action === "upload") showSuccess("Proof Uploaded to IPFS!");
    if(action === "approve") showSuccess("Verified on Blockchain!");
    if(action === "release") showSuccess("Payment Released!");
    if(action === "reject") showSuccess("Work Rejected.");
  };

  const switchRole = (newRole) => { setRole(newRole); setView('overview'); };
  const clearMemory = () => { if(confirm("Reset Demo Data?")) { localStorage.removeItem('toumei_projects'); window.location.reload(); }};

  // --- 1. LANDING PAGE ---
  if (view === 'landing') {
    return (
      <div 
        className="min-h-screen relative font-sans text-white flex flex-col items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/background.png')`, backgroundColor: '#0a0a0a' }} // Fallback color
      >
        {/* MODIFIED: Very light, non-blurring overlay for maximum background visibility */}
        <div className="absolute inset-0 bg-black/20 z-0"></div>

        <nav className="absolute top-0 w-full p-8 flex justify-between items-center z-50 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black shadow-lg"><Eye size={22}/></div>
            <span className="text-2xl font-jakarta font-bold tracking-tight">Toumei</span>
          </div>
          <div className='flex gap-4'>
            <button onClick={enterPublicDashboard} className="text-white font-medium hover:text-blue-300 transition-colors">
                Public Dashboard
            </button>
            <button onClick={connectWallet} className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg cursor-pointer">
              {loading ? <Loader2 className="animate-spin"/> : "Connect Wallet"}
            </button>
          </div>
        </nav>

        <div className="text-center z-40 px-4 mt-10">
          <h1 className="text-7xl md:text-[8rem] font-jakarta font-extrabold tracking-tighter leading-none mb-4 animate-slide-up drop-shadow-2xl">
            Toumei
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-blue-100 mb-12 animate-slide-up delay-100 opacity-0">
            Track Every Rupee.
          </h2>

          <div className="animate-slide-up delay-300 opacity-0 flex gap-4 justify-center">
            <button onClick={enterPublicDashboard} className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all cursor-pointer">
               Citizen View
            </button>
            <button onClick={connectWallet} className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition-all shadow-[0_0_40px_rgba(37,99,235,0.5)] cursor-pointer">
               Launch App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. DASHBOARD ---
  return (
    <div 
        className="min-h-screen flex font-sans text-gray-100 bg-cover bg-fixed bg-center"
        style={{ backgroundImage: `url('/background.png')`, backgroundColor: '#0f0f13' }}
    >
      {/* MODIFIED: Very light, non-blurring overlay for dashboard content */}
      <div className="fixed inset-0 bg-black/10 z-0"></div> 

      {/* SUCCESS POPUP */}
      {successMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-pop-in">
          <div className="bg-green-500/20 border border-green-500/50 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <CheckCircle className="text-green-400" size={20}/>
            <span className="font-bold">{successMsg}</span>
          </div>
        </div>
      )}
      
      {/* SIDEBAR */}
      {/* Sidebar uses custom CSS class 'sidebar-glass' which maintains a slight blur for contrast */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 hidden md:flex flex-col p-6 animate-slide-up sidebar-glass">
        <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => setView('landing')}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black"><Eye size={18}/></div>
          <span className="text-xl font-jakarta font-bold">Toumei</span>
        </div>
        
        <div className="space-y-2 flex-1">
          <div className="text-[10px] uppercase font-bold text-gray-500 mb-2 px-4">Menu</div>
          <button onClick={() => setView('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'overview' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={18}/> 
            {role === 'public' ? 'Public Ledger' : 'Overview'}
          </button>
          
          {role === 'admin' && (
            <button onClick={() => setView('allocate')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'allocate' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Shield size={18}/> Allocate Funds
            </button>
          )}

          {/* SIMULATION CONTROLS */}
          {role !== 'public' && (
              <>
                <div className="pt-8 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Simulation Mode</div>
                <button onClick={() => switchRole('admin')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${role === 'admin' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-gray-500 hover:text-white'}`}>Govt Admin</button>
                <button onClick={() => switchRole('vendor')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${role === 'vendor' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-gray-500 hover:text-white'}`}>Vendor</button>
                <button onClick={() => switchRole('ngo')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${role === 'ngo' ? 'bg-green-600/20 text-green-300 border border-green-500/30' : 'text-gray-500 hover:text-white'}`}>NGO Verifier</button>
              </>
          )}
        </div>

        {/* ACCOUNT FOOTER */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            {account ? (
                <>
                    <div className="flex items-center justify-between mb-1"><span className="text-xs text-green-400 font-mono">● Connected</span><button onClick={() => {setAccount(null); setView('landing');}} className="text-gray-400 hover:text-white"><LogOut size={14}/></button></div>
                    <div className="text-xs font-mono text-gray-300 truncate">{account}</div>
                </>
            ) : (
                <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-400 font-mono">● Public View</span>
                    <button onClick={() => setView('landing')} className="text-xs hover:text-white">Exit</button>
                </div>
            )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex-1 p-6 md:p-10 ml-0 md:ml-64 overflow-y-auto">
        <div className="max-w-6xl mx-auto animate-slide-up">
          
          {/* HEADER */}
          <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-jakarta font-bold text-white">
                    {role === 'public' ? 'Public Transparency Record' : (view === 'overview' ? 'Dashboard' : 'Allocate Funds')}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    {role === 'public' 
                        ? 'Real-time view of public spending and verification status.' 
                        : `Welcome back, ${role === 'admin' ? 'Govt Official' : role}.`
                    }
                </p>
            </div>
            {role !== 'public' && <button onClick={clearMemory} className="text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1 rounded-full">Reset Data</button>}
          </div>

          {/* VIEW: OVERVIEW (Available to Everyone) */}
          {view === 'overview' && (
            <div className="space-y-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
              {/* STATS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-blue-500">
                  <div><p className="text-gray-400 text-sm font-medium">Total Allocated</p><h3 className="text-3xl font-bold mt-1 text-white">{formatCurrency(totalAllocated)}</h3></div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-green-500">
                  <div><p className="text-gray-400 text-sm font-medium">Funds Released</p><h3 className="text-3xl font-bold mt-1 text-white">{formatCurrency(totalReleased)}</h3></div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-purple-500">
                  <div><p className="text-gray-400 text-sm font-medium">Active Projects</p><h3 className="text-3xl font-bold mt-1 text-white">{projects.length}</h3></div>
                </div>
              </div>

              {/* LIST */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white font-jakarta">Project Ledger</h3>
                    <div className="flex gap-2">
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">Live on Blockchain</span>
                    </div>
                </div>
                
                <div className="space-y-4">
                  {projects.map((p) => (
                    <div key={p.id} className="bg-black/40 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-white/20 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-bold text-base text-white">{p.name}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-2">
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded"><Building2 size={12}/> {p.vendor}</span>
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded"><UserCheck size={12}/> Verifier: {p.ngo}</span>
                          <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${p.status === 'Released' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{p.status}</span>
                        </div>
                      </div>
                      
                      {/* Currency Display using Custom Formatter */}
                      <div className="text-right mr-4 min-w-[100px]">
                        <div className="text-xl font-mono font-bold text-white tracking-tight">{formatCurrency(p.amount)}</div>
                        <div className="text-[10px] text-gray-500">Locked Amount</div>
                      </div>
                      
                      {/* ACTIONS (Only visible if NOT public and logic matches) */}
                      <div className="flex items-center gap-2">
                        {role === 'public' ? (
                             <a href="#" className="text-gray-500 hover:text-white text-xs flex items-center gap-1"><Search size={12}/> Details</a>
                        ) : (
                            <>
                                {role === 'vendor' && p.status === 'Allocated' && (
                                   <div className="flex gap-2 animate-fade-in">
                                     <input type="text" placeholder="IPFS Link" className="bg-black/30 border border-white/10 rounded px-3 py-2 text-xs text-white w-32 outline-none focus:border-blue-500" onChange={(e) => setBillLink(e.target.value)}/>
                                     <button onClick={() => handleAction(p.id, 'upload', billLink)} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-xs">Submit</button>
                                   </div>
                                )}
                                {(role === 'ngo' || role === 'admin') && p.status === 'Verification' && (
                                  <div className="flex gap-2 animate-fade-in">
                                    <a href={p.bill} target="_blank" className="flex items-center gap-1 px-3 py-2 bg-white/10 rounded-lg text-xs hover:bg-white/20 text-blue-300"><FileText size={12}/> Proof</a>
                                    <button onClick={() => handleAction(p.id, 'reject')} className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-500/30">Reject</button>
                                    {role === 'ngo' && <button onClick={() => handleAction(p.id, 'approve')} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xs">Approve</button>}
                                  </div>
                                )}
                                {role === 'admin' && p.status === 'NGO_Approval' && (
                                   <button onClick={() => handleAction(p.id, 'release')} disabled={loading} className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xs hover:bg-gray-200 animate-pulse">Release Funds</button>
                                )}
                            </>
                        )}
                        {p.status === 'Released' && <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20"><CheckCircle size={14}/> Paid</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ALLOCATE (Only for Admin) */}
          {view === 'allocate' && role === 'admin' && (
            <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl animate-slide-up mt-10 border border-white/10">
              <button onClick={() => setView('overview')} className="text-gray-400 text-sm mb-6 hover:text-white flex items-center gap-1">← Back to Overview</button>
              <h3 className="text-2xl font-jakarta font-bold mb-6 text-white">Create New Allocation</h3>
              <div className="space-y-5">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold mb-1 block ml-1">Project Name</label>
                  <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-colors" onChange={(e) => setNewProject({...newProject, name: e.target.value})} value={newProject.name}/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold mb-1 block ml-1">Amount (Full Value in INR)</label>
                  <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-8 text-white outline-none focus:border-blue-500 transition-colors font-mono" onChange={(e) => setNewProject({...newProject, amount: e.target.value})} value={newProject.amount}/>
                  </div>
                  <div className="text-right text-xs text-blue-400 mt-1 font-mono">{formatCurrency(newProject.amount)}</div>
                </div>
                
                <div className="relative">
                  <label className="text-xs text-gray-400 uppercase font-bold mb-1 block ml-1">Select Verified Vendor</label>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-left text-white flex justify-between items-center hover:bg-white/5 transition-colors">
                    {newProject.vendorName || "Select Vendor..."}
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}/>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl">
                      {VERIFIED_REGISTRY.filter(v => v.type === "Vendor").map((v) => (
                        <div key={v.id} onClick={() => { setNewProject({...newProject, vendorName: v.name}); setDropdownOpen(false); }} className="p-3 hover:bg-white/10 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0">
                          <span className="text-sm font-medium text-white">{v.name}</span>
                          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">Verified</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={handleAllocate} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-500 mt-4 shadow-lg flex justify-center items-center gap-2">
                  {loading ? <Loader2 className="animate-spin"/> : "Lock Funds in Escrow"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;