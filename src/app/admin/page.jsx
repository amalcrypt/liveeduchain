'use client'

import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount } from 'wagmi'
import StudentForm from '../../components/StudentForm';
import AllCertificates from '../../components/AllCertificates';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'certificates'
  const { open } = useWeb3Modal()
  const { isConnected } = useAccount()

  const handleConnectWallet = async () => {
    await open();
  };

  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="text-center py-12">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Wallet size={48} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Connect Your Wallet</h2>
          <p className="text-slate-600 mb-8 text-lg leading-relaxed">
            You need to connect your wallet to access the Admin Portal.
          </p>
          <button
            onClick={handleConnectWallet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-base"
          >
            <Wallet size={24} />
            Connect Wallet
          </button>
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-4 font-semibold transition-all duration-200 ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload Certificate
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-3 px-4 font-semibold transition-all duration-200 ${
              activeTab === 'certificates'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Certificates
          </button>
        </div>
        {activeTab === 'upload' ? <StudentForm /> : <AllCertificates />}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center font-sans p-4 pt-8">
      <div className="w-full max-w-6xl">
        <div className="p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/assets/logo.svg" alt="Portal Logo" className="w-12 h-12" />
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Portal</h1>
          </div>
          <p className="text-center text-slate-600 mb-6">
            Manage and upload student certificates to the blockchain.
          </p>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
