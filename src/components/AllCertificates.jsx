'use client'

import React, { useState, useEffect } from 'react';
import { readContract, waitForTransactionReceipt, getPublicClient } from 'wagmi/actions';
import { wagmiConfig } from './Providers';
import AdminAuth from '../artifacts/AdminAuth.json';
import contractAddress from '../artifacts/contract-address.json';
import { Search, Loader, AlertCircle, Database, Trash2, ExternalLink } from 'lucide-react';
import { useAccount, useWriteContract } from 'wagmi';

const AllCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (isConnected) {
      fetchAllCertificates();
    }
  }, [isConnected]);

  const fetchAllCertificates = async () => {
    setLoading(true);
    setError(null);
    const fetchedCerts = [];

    try {
      const uploadedRegisterNumbers = JSON.parse(
        localStorage.getItem('uploadedCertificates') || '[]'
      );

      if (uploadedRegisterNumbers.length === 0) {
        setCertificates([]);
        setLoading(false);
        return;
      }

      const publicClient = getPublicClient(wagmiConfig);
      
      // Fetch latest block to avoid range errors (limited to 1000 blocks for some RPCs)
      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlock > 1000n ? latestBlock - 1000n : 0n;

      for (const regNum of uploadedRegisterNumbers) {
        try {
          const data = await readContract(wagmiConfig, {
            address: contractAddress.address,
            abi: AdminAuth.abi,
            functionName: 'getCertificate',
            args: [regNum],
          });

          const [registerNumber, jsonHash, timestamp] = data;

          if (jsonHash && jsonHash.length > 0) {
            // Fetch transaction hash from logs
            let txHash = null;
            try {
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
                args: {
                  registerNumber: regNum
                },
                fromBlock: fromBlock,
                toBlock: latestBlock
              });
              if (logs.length > 0) {
                txHash = logs[0].transactionHash;
              }
            } catch (logError) {
              console.error(`Failed to fetch logs for ${regNum}:`, logError);
            }

            try {
              const metadataResponse = await fetch(
                `https://gateway.pinata.cloud/ipfs/${jsonHash}`
              );
              
              if (metadataResponse.ok) {
                const metadata = await metadataResponse.json();
                
                fetchedCerts.push({
                  registerNumber,
                  jsonHash,
                  txHash,
                  timestamp: new Date(Number(timestamp) * 1000).toLocaleDateString('en-GB') + 
                             ' ' + new Date(Number(timestamp) * 1000).toLocaleTimeString('en-GB'),
                  studentName: metadata.attributes.find(a => a.trait_type === 'Student Name')?.value || 'N/A',
                  degree: metadata.attributes.find(a => a.trait_type === 'Degree')?.value || 'N/A',
                  university: metadata.attributes.find(a => a.trait_type === 'University')?.value || 'N/A',
                  cgpa: metadata.attributes.find(a => a.trait_type === 'CGPA')?.value || 'N/A',
                  issueDate: metadata.attributes.find(a => a.trait_type === 'Issue Date')?.value || 'N/A',
                  fileHash: metadata.attributes.find(a => a.trait_type === 'Certificate File IPFS Hash')?.value || 'N/A',
                });
              }
            } catch (metadataError) {
              console.error(`Failed to fetch metadata for ${regNum}:`, metadataError);
            }
          }
        } catch (err) {
          continue;
        }
      }

      setCertificates(fetchedCerts);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('Failed to fetch certificates from blockchain');
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.degree.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCertificate = async (registerNumber) => {
    if (!window.confirm(`Are you sure you want to delete the certificate for ${registerNumber}?`)) {
      return;
    }

    setDeleting(registerNumber);
    try {
      const cert = certificates.find(c => c.registerNumber === registerNumber);
      if (!cert) throw new Error('Certificate not found');

      const hash = await writeContractAsync({
        address: contractAddress.address,
        abi: AdminAuth.abi,
        functionName: 'removeCertificate',
        args: [registerNumber],
      });

      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      if (receipt.status !== 'success') throw new Error('Blockchain transaction failed');

      const deleteResponse = await fetch('/api/delete-from-pinata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonHash: cert.jsonHash,
          fileHash: cert.fileHash
        })
      });

      if (!deleteResponse.ok) {
        alert('Blockchain deletion succeeded, but failed to delete from Pinata.');
      }

      const uploadedCerts = JSON.parse(localStorage.getItem('uploadedCertificates') || '[]');
      const updatedCerts = uploadedCerts.filter(reg => reg !== registerNumber);
      localStorage.setItem('uploadedCertificates', JSON.stringify(updatedCerts));

      fetchAllCertificates();
    } catch (err) {
      console.error('Error deleting certificate:', err);
      setError(`Failed to delete certificate: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center font-sans p-4 py-12">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Wallet Not Connected</h1>
          <p className="text-slate-600">Please connect your wallet to view certificates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col font-sans p-4 pt-8">
      <div className="w-full">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Database size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">All Certificates</h1>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="flex-grow px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
            <button
              onClick={fetchAllCertificates}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              <Search size={18} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
            <Loader className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-600 font-semibold">Loading certificates...</p>
          </div>
        )}

        {error && (
          <div className="p-6 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && filteredCertificates.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Register Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Degree</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">CGPA</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Issue Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Blockchain Info</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map((cert, index) => (
                  <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm font-mono">{cert.registerNumber}</td>
                    <td className="px-4 py-3 text-sm">{cert.studentName}</td>
                    <td className="px-4 py-3 text-sm">{cert.degree}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-700">{cert.cgpa}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{cert.issueDate}</td>
                    <td className="px-4 py-3 text-xs">
                      {cert.txHash ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-500">Tx Hash:</span>
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${cert.txHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline flex items-center gap-1 font-mono"
                          >
                            {cert.txHash.slice(0, 10)}...{cert.txHash.slice(-8)}
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not found</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <a href={`https://gateway.pinata.cloud/ipfs/${cert.fileHash}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs">PDF</a>
                        <button
                          onClick={() => handleDeleteCertificate(cert.registerNumber)}
                          disabled={deleting === cert.registerNumber}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          {deleting === cert.registerNumber ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCertificates;
