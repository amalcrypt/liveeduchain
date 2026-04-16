'use client'

import React, { useState } from 'react';
import { readContract, getPublicClient } from 'wagmi/actions';
import { wagmiConfig } from '../../components/Providers';
import AdminAuth from '../../artifacts/AdminAuth.json';
import contractAddress from '../../artifacts/contract-address.json';
import { Search, Loader, Frown, CheckCircle, FileJson, Fingerprint, ExternalLink, Database } from 'lucide-react';

export default function Verify() {
  const [searchInput, setSearchInput] = useState('');
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCertificateData(null);
    setSearched(true);

    if (!searchInput) {
      setError('Please enter a Registration Number or IPFS CID.');
      setLoading(false);
      return;
    }

    try {
      const isCid = searchInput.startsWith('Qm') && searchInput.length === 46;

      let metadata;
      let onChainStatus = 'Unverified';
      let fetchedJsonHash = '';
      let fetchedRegNum = '';
      let fetchedTimestamp = null;
      let fetchedTxHash = null;

      const publicClient = getPublicClient(wagmiConfig);
      
      const latestBlockObj = await publicClient.getBlock({ blockTag: 'latest' });
      const latestBlock = latestBlockObj.number;

      if (isCid) {
        const jsonHashFromInput = searchInput;
        const metadataResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${jsonHashFromInput}`);
        if (!metadataResponse.ok) throw new Error('Failed to fetch metadata from IPFS.');
        metadata = await metadataResponse.json();
        
        const regNumFromMetadata = metadata.attributes.find(a => a.trait_type === 'Register Number')?.value;
        if (!regNumFromMetadata) throw new Error('Register Number not found in IPFS metadata.');
        
        const data = await readContract(wagmiConfig, {
          address: contractAddress.address,
          abi: AdminAuth.abi,
          functionName: 'getCertificate',
          args: [regNumFromMetadata],
        });
        const [, jsonHashFromChain, timestampFromChain] = data;

        if (jsonHashFromChain === jsonHashFromInput) {
          onChainStatus = 'Verified on Blockchain';
          const date = new Date(Number(timestampFromChain) * 1000);
          fetchedTimestamp = date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB');
          fetchedJsonHash = jsonHashFromInput;
          fetchedRegNum = regNumFromMetadata;

          // Fetch tx hash via targeted chunks to bypass 1000 block RPC limits
          try {
            const timeDiff = latestBlockObj.timestamp - BigInt(timestampFromChain);
            const blocksDiff = timeDiff / 12n;
            let estimatedBlock = latestBlock - blocksDiff;
            let currentToBlock = estimatedBlock + 5000n;
            if (currentToBlock > latestBlock) currentToBlock = latestBlock;
            let chunks = 0;
            while (chunks < 10) {
              const currentFromBlock = currentToBlock > 999n ? currentToBlock - 999n : 0n;
              const logs = await publicClient.getLogs({
                address: contractAddress.address,
                event: {
                  type: 'event',
                  name: 'CertificateAdded',
                  inputs: [
                    { type: 'string', name: 'registerNumber', indexed: true },
                    { type: 'string', name: 'jsonHash', indexed: false },
                  ],
                },
                args: { registerNumber: regNumFromMetadata },
                fromBlock: currentFromBlock,
                toBlock: currentToBlock
              });
              if (logs.length > 0) {
                fetchedTxHash = logs[0].transactionHash;
                break;
              }
              if (currentFromBlock === 0n) break;
              currentToBlock = currentFromBlock - 1n;
              chunks++;
            }
          } catch (e) {}

        } else {
          setCertificateData(null);
          setLoading(false);
          return;
        }
      } else {
        const regNumInput = searchInput;
        const data = await readContract(wagmiConfig, {
          address: contractAddress.address,
          abi: AdminAuth.abi,
          functionName: 'getCertificate',
          args: [regNumInput],
        });

        const [regNumFromChain, jsonHashFromChain, timestampFromChain] = data;

        if (!jsonHashFromChain || jsonHashFromChain.length === 0) {
          setCertificateData(null);
          setLoading(false);
          return;
        }

        const metadataResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${jsonHashFromChain}`);
        if (!metadataResponse.ok) throw new Error('Failed to fetch metadata from IPFS.');
        metadata = await metadataResponse.json();
        onChainStatus = 'Verified on Blockchain';
        fetchedJsonHash = jsonHashFromChain;
        fetchedRegNum = regNumFromChain;
        const date = new Date(Number(timestampFromChain) * 1000);
        fetchedTimestamp = date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB');

        // Fetch tx hash via targeted chunks to bypass 1000 block RPC limits
        try {
          const timeDiff = latestBlockObj.timestamp - BigInt(timestampFromChain);
          const blocksDiff = timeDiff / 12n;
          let estimatedBlock = latestBlock - blocksDiff;
          let currentToBlock = estimatedBlock + 5000n;
          if (currentToBlock > latestBlock) currentToBlock = latestBlock;
          let chunks = 0;
          while (chunks < 10) {
            const currentFromBlock = currentToBlock > 999n ? currentToBlock - 999n : 0n;
            const logs = await publicClient.getLogs({
              address: contractAddress.address,
              event: {
                type: 'event',
                name: 'CertificateAdded',
                inputs: [
                  { type: 'string', name: 'registerNumber', indexed: true },
                  { type: 'string', name: 'jsonHash', indexed: false },
                ],
              },
              args: { registerNumber: regNumFromChain },
              fromBlock: currentFromBlock,
              toBlock: currentToBlock
            });
            if (logs.length > 0) {
              fetchedTxHash = logs[0].transactionHash;
              break;
            }
            if (currentFromBlock === 0n) break;
            currentToBlock = currentFromBlock - 1n;
            chunks++;
          }
        } catch (e) {}
      }
      
      setCertificateData({
        ...metadata,
        timestamp: fetchedTimestamp,
        jsonHash: fetchedJsonHash,
        registerNumber: fetchedRegNum,
        onChainStatus: onChainStatus,
        txHash: fetchedTxHash,
      });

    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (loading) {
      return (
        <div className="text-center p-6 flex flex-col items-center justify-center gap-4">
          <Loader className="animate-spin text-slate-500" size={32} />
          <p className="text-slate-600">Searching...</p>
        </div>
      );
    }

    if (error) return <div className="p-4 mt-6 rounded-md bg-red-100 text-red-800">{error}</div>
    if (!searched) return null;

    if (certificateData) {
      const isChainVerified = certificateData.onChainStatus === 'Verified on Blockchain';
      return (
        <div className={`mt-6 p-6 border rounded-xl ${isChainVerified ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            {isChainVerified ? <CheckCircle className="w-8 h-8 text-green-500" /> : <FileJson className="w-8 h-8 text-blue-500" />}
            <h3 className={`text-xl font-bold ${isChainVerified ? 'text-green-800' : 'text-blue-800'}`}>
              {isChainVerified ? 'Certificate Verified' : 'IPFS Content Found'}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
            <div><strong>Student Name:</strong> {certificateData.attributes?.find(a => a.trait_type === 'Student Name')?.value || 'N/A'}</div>
            <div><strong>Degree:</strong> {certificateData.attributes?.find(a => a.trait_type === 'Degree')?.value || 'N/A'}</div>
            <div><strong>University:</strong> {certificateData.attributes?.find(a => a.trait_type === 'University')?.value || 'N/A'}</div>
            <div><strong>Register Number:</strong> {certificateData.registerNumber}</div>
            <div><strong>CGPA:</strong> <span className="font-semibold text-blue-700">{certificateData.attributes?.find(a => a.trait_type === 'CGPA')?.value || 'N/A'}</span></div>
            <div><strong>Issue Date:</strong> {certificateData.attributes?.find(a => a.trait_type === 'Issue Date')?.value || 'N/A'}</div>
          </div>
          
          {certificateData.txHash && (
            <div className="mt-4 p-4 bg-white/50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                <Database size={16} />
                Blockchain Transaction Details
              </p>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Transaction Hash:</span>
                <a 
                  href={`https://sepolia.etherscan.io/tx/${certificateData.txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-mono break-all"
                >
                  {certificateData.txHash}
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {certificateData.image && (
                <div className="mt-6 text-center">
                    <a href={certificateData.image} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                        <FileJson size={20} />
                        View Certificate Document
                    </a>
                </div>
            )}
        </div>
      );
    }

    return (
        <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
            <Frown className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-yellow-800">Not Found</h3>
            <p className="text-slate-600 mt-1">No valid certificate was found </p>
        </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-2xl">
        <div className="p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200">
            <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Fingerprint size={28} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Verify Certificate</h1>
            </div>
            <form onSubmit={handleVerify} className="flex gap-2">
                <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Registration Number or IPFS CID"
                className="flex-grow block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50" disabled={loading}>
                <Search size={18} />
                Verify
                </button>
            </form>
            {renderResult()}
        </div>
      </div>
    </div>
  );
}
