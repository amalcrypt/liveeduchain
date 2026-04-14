'use client'

import React, { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Eye } from 'lucide-react';
import AdminAuth from '../artifacts/AdminAuth.json';
import contractAddress from '../artifacts/contract-address.json';

const StudentForm = () => {
  const [studentName, setStudentName] = useState('');
  const [degree, setDegree] = useState('');
  const [university, setUniversity] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    });

  useEffect(() => {
    if (isConfirmed) {
      setStudentName('');
      setDegree('');
      setUniversity('');
      setIssueDate('');
      setCgpa('');
      setRegisterNumber('');
      setCertificateFile(null);
      if (document.getElementById('certificate')) {
        document.getElementById('certificate').value = '';
      }
      setUploadResponse(null);
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (error && uploadResponse?.success) {
      const deleteFromPinata = async () => {
        try {
          const response = await fetch('/api/delete-from-pinata', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              jsonHash: uploadResponse.jsonHash,
              fileHash: uploadResponse.fileHash 
            }),
          });

          if (!response.ok) {
            console.error('Failed to unpin from Pinata');
          }
        } catch (e) {
          console.error('Error calling unpin API:', e);
        }
      };

      deleteFromPinata();
    }
  }, [error, uploadResponse]);

  const validateForm = () => {
    const errors = {};
    if (!studentName.trim() || studentName.trim().length < 2 || studentName.trim().length > 100) {
      errors.studentName = 'Student Name must be between 2 and 100 characters';
    }
    if (!degree.trim() || degree.trim().length < 2 || degree.trim().length > 100) {
      errors.degree = 'Degree must be between 2 and 100 characters';
    }
    if (!university.trim() || university.trim().length < 2 || university.trim().length > 150) {
      errors.university = 'University must be between 2 and 150 characters';
    }
    if (!issueDate.trim()) {
      errors.issueDate = 'Issue Date is required';
    }
    if (!cgpa.trim() || cgpa.trim().length < 1 || cgpa.trim().length > 5) {
      errors.cgpa = 'CGPA must be between 1 and 5 characters';
    }
    if (!/^\d+(\.\d{1,2})?$/.test(cgpa.trim())) {
      errors.cgpa = 'CGPA must be a valid number (e.g., 3.8)';
    }
    if (!registerNumber.trim() || registerNumber.trim().length < 1 || registerNumber.trim().length > 50) {
      errors.registerNumber = 'Register Number must be between 1 and 50 characters';
    }
    if (!certificateFile) {
      errors.certificate = 'Certificate file is required';
    } else if (certificateFile.type !== 'application/pdf') {
      errors.certificate = 'Only PDF files are allowed';
    } else if (certificateFile.size > 10 * 1024 * 1024) {
      errors.certificate = 'File size must not exceed 10MB';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUploading(true);
    setUploadResponse(null);

    const formData = new FormData();
    formData.append('studentName', studentName);
    formData.append('degree', degree);
    formData.append('university', university);
    formData.append('issueDate', issueDate);
    formData.append('cgpa', cgpa);
    formData.append('registerNumber', registerNumber);
    formData.append('certificate', certificateFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message);

      setUploadResponse(responseData);
      
      if (responseData.success) {
        const uploadedCerts = JSON.parse(localStorage.getItem('uploadedCertificates') || '[]');
        if (!uploadedCerts.includes(registerNumber)) {
          uploadedCerts.push(registerNumber);
          localStorage.setItem('uploadedCertificates', JSON.stringify(uploadedCerts));
        }
      }
      
      if (responseData.success && responseData.jsonHash) {
        writeContract({
          address: contractAddress.address,
          abi: AdminAuth.abi,
          functionName: 'addCertificate',
          args: [registerNumber, responseData.jsonHash],
        });
      }
    } catch (error) {
      setUploadResponse({ success: false, message: error.message || 'An error occurred while uploading.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <h3 className="text-lg font-bold mb-4 text-slate-900">Upload Student Details</h3>
      <form onSubmit={handleSubmit} className="space-y-3 flex-1 overflow-y-auto pr-1">
        <div>
          <label htmlFor="studentName" className="block text-sm font-semibold text-slate-800 mb-1">Student Name</label>
          <input type="text" id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} className={`w-full px-3 py-2 bg-white border rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition ${validationErrors.studentName ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'}`} required />
          {validationErrors.studentName && <p className="text-red-500 text-xs mt-1">{validationErrors.studentName}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="degree" className="block text-sm font-semibold text-slate-800 mb-1">Degree</label>
            <input type="text" id="degree" value={degree} onChange={(e) => setDegree(e.target.value)} className={`w-full px-3 py-2 bg-white border rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition ${validationErrors.degree ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'}`} required />
            {validationErrors.degree && <p className="text-red-500 text-xs mt-1">{validationErrors.degree}</p>}
          </div>
          <div>
            <label htmlFor="university" className="block text-sm font-semibold text-slate-800 mb-1">University</label>
            <input type="text" id="university" value={university} onChange={(e) => setUniversity(e.target.value)} className={`w-full px-3 py-2 bg-white border rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition ${validationErrors.university ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'}`} required />
            {validationErrors.university && <p className="text-red-500 text-xs mt-1">{validationErrors.university}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="issueDate" className="block text-sm font-semibold text-slate-800 mb-1">Issue Date</label>
          <input type="date" id="issueDate" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={`w-full px-3 py-2 bg-white border rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition ${validationErrors.issueDate ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'}`} required />
          {validationErrors.issueDate && <p className="text-red-500 text-xs mt-1">{validationErrors.issueDate}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cgpa" className="block text-sm font-semibold text-slate-800 mb-1">CGPA</label>
            <input type="text" id="cgpa" value={cgpa} onChange={(e) => setCgpa(e.target.value)} placeholder="3.8" className={`w-full px-3 py-2 bg-white border rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition ${validationErrors.cgpa ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'}`} required />
            {validationErrors.cgpa && <p className="text-red-500 text-xs mt-1">{validationErrors.cgpa}</p>}
          </div>
          <div>
            <label htmlFor="registerNumber" className="block text-sm font-semibold text-slate-800 mb-1">Register Number</label>
            <input type="text" id="registerNumber" value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)} className={`w-full px-3 py-2 bg-white border rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition ${validationErrors.registerNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'}`} required />
            {validationErrors.registerNumber && <p className="text-red-500 text-xs mt-1">{validationErrors.registerNumber}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="certificate" className="block text-sm font-semibold text-slate-800 mb-1">Certificate PDF</label>
          <div className="flex gap-2">
            <input type="file" id="certificate" onChange={(e) => setCertificateFile(e.target.files[0])} className={`flex-1 text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold transition cursor-pointer ${validationErrors.certificate ? 'file:bg-red-100 file:text-red-700 hover:file:bg-red-200' : 'file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200'}`} required />
            {certificateFile && (
              <button type="button" onClick={() => setShowPreview(true)} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 text-sm flex-shrink-0">
                <Eye size={16} />
                Preview
              </button>
            )}
          </div>
          {validationErrors.certificate && <p className="text-red-500 text-xs mt-1">{validationErrors.certificate}</p>}
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-2 flex-shrink-0 text-base" disabled={uploading || isPending}>
          {uploading ? 'Uploading to IPFS...' : isPending ? 'Adding to Blockchain...' : 'Upload & Add to Blockchain'}
        </button>
      </form>

      {uploadResponse && uploadResponse.success && (
        <div className="mt-5 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
          <div>
            <p className="font-semibold text-sm mb-3">✓ Successfully uploaded to IPFS</p>
            <div className="space-y-2 text-xs">
              <div>
                <p className="font-medium text-green-900 mb-1">File Hash:</p>
                <a href={`https://gateway.pinata.cloud/ipfs/${uploadResponse.fileHash}`} target="_blank" rel="noopener noreferrer" className="break-all text-green-600 hover:underline text-xs">{uploadResponse.fileHash}</a>
              </div>
              <div>
                <p className="font-medium text-green-900 mb-1">Metadata Hash:</p>
                <a href={`https://gateway.pinata.cloud/ipfs/${uploadResponse.jsonHash}`} target="_blank" rel="noopener noreferrer" className="break-all text-green-600 hover:underline text-xs">{uploadResponse.jsonHash}</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {isConfirming && (
        <div className="mt-5 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
          <p className="font-semibold text-sm mb-2">⏳ Confirming transaction...</p>
        </div>
      )}

      {isConfirmed && (
        <div className="mt-5 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
          <p className="font-semibold text-sm">✓ Transaction Confirmed!</p>
          <p className="text-sm mt-1">The certificate has been successfully added to the blockchain.</p>
          {hash && (
            <div className="mt-2 text-xs">
              <p className="font-medium text-green-900 mb-1">Transaction Hash:</p>
              <a 
                href={`https://sepolia.etherscan.io/tx/${hash}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="break-all text-green-600 hover:underline"
              >
                {hash}
              </a>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
          <p className="font-semibold text-sm">Error: {error.message}</p>
        </div>
      )}

      {showPreview && certificateFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full h-[calc(100vh-100px)] flex flex-col max-w-2xl border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Certificate Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-8 h-8 flex items-center justify-center">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50">
              <iframe src={URL.createObjectURL(certificateFile)} className="w-full h-full" title="Certificate Preview"></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentForm;
