'use client'

import { useRouter } from 'next/navigation';
import { 
  Shield, 
  CheckCircle, 
  FileText, 
  Lock, 
  GraduationCap, 
  Database,
  Cpu
} from 'lucide-react';

export default function Landing() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 overflow-hidden">
          {/* Background Blobs */}
          <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-blue-500/10 rounded-bl-[100px] blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-indigo-500/10 rounded-tr-[100px] blur-3xl"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                  Blockchain Secured Validation
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1]">
                  Trustworthy Credentials <br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Verified Instantly.</span>
                </h1>
                
                <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                  EduChain eliminates credential fraud by securing academic certificates on an immutable blockchain ledger.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => router.push('/verify')} 
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group transform hover:-translate-y-0.5"
                  >
                    <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Verify Certificate
                  </button>
                </div>

                <div className="pt-8 border-t border-slate-200/60 flex items-center gap-8">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">10k+</p>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Certificates</p>
                  </div>
                  <div className="w-px h-10 bg-slate-200"></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">50+</p>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Universities</p>

                  </div>
                  <div className="w-px h-10 bg-slate-200"></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">100%</p>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Uptime</p>
                  </div>
                </div>
              </div>
              <div className="relative flex justify-center items-center min-h-[500px]">
                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-white shadow-2xl w-full max-w-md relative z-10">
                  <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                        <GraduationCap size={24} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Certificate of Completion</div>
                        <div className="text-xs text-slate-500">University of Innovation</div>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                      <CheckCircle size={12} /> Verified
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <div className="h-3 bg-slate-100 rounded-full w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded-full w-1/2"></div>
                    <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-slate-400">
                      <Database size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Blockchain Hash</div>
                      <div className="font-mono text-xs text-slate-700 truncate">0x71C...92F1A</div>
                    </div>
                  </div>

                  <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex gap-3 items-center z-20 animate-[bounce_3s_infinite]">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                      <Shield size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Tamper Proof</div>
                      <div className="text-xs text-slate-500">AES-256 Encryption</div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500 rounded-full opacity-10 blur-xl animate-pulse"></div>
                <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-indigo-500 rounded-full opacity-10 blur-xl animate-pulse delay-700"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="process" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-blue-600 font-bold tracking-wide uppercase text-sm">Workflow</span>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">How EduChain Works</h2>
              <p className="mt-4 text-slate-500 text-lg">A secure, four-step process ensuring the immutability of academic records.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: FileText, title: "Data Submission", desc: "Universities upload student records and degree details via the secure Admin Portal.", step: 1 },
                { icon: Cpu, title: "Smart Contract", desc: "The system interacts with a Smart Contract to mint a unique digital asset for the certificate.", step: 2 },
                { icon: Lock, title: "Hash Generation", desc: "A cryptographic hash is generated and stored permanently on the blockchain ledger.", step: 3 },
                { icon: CheckCircle, title: "Verification", desc: "Employers or third parties verify the credential instantly using the unique Certificate ID.", step: 4 }
              ].map((item, index) => (
                <div key={index} className="relative group p-6 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <img className="h-10" src="/assets/logo.png" alt="EduChain" />
            <p className="text-xs text-slate-500 mt-2 pl-6">© {new Date().getFullYear()} All rights reserved.</p>
          </div>

          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
