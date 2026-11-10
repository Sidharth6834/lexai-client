import React, { useState, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, UploadCloud, FileText, X, Loader, Menu, Scale } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const Upload = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form states
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('rent_agreement');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // UI/Upload states
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle file selection and validation
  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      toast.error('Only PDF documents are allowed.');
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxBytes) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
    setName(baseName);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContainerClick = () => {
    if (!file && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a PDF file');
      return;
    }

    if (!name.trim()) {
      toast.error('Please provide a document name');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('type', type);
    if (description) formData.append('description', description);
    if (expiryDate) formData.append('expiryDate', expiryDate);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      const response = await axios.post('/api/documents', formData, config);
      toast.success('Document uploaded successfully!');
      navigate(`/document/${response.data._id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(errorMsg);
      setUploading(false);
    }
  };

  return (
    <div className="h-screen bg-[#0A0B0D] text-[#F4F3EF] flex flex-col md:flex-row relative overflow-hidden font-sans">
      <Sidebar activePage="upload" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Mobile Header Bar */}
      <div className="h-16 bg-[#0E0F12] border-b border-[#202227] flex items-center justify-between px-4 sm:px-6 md:hidden sticky top-0 z-20 w-full shrink-0">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-[#8E8D88] hover:text-white hover:bg-[#181A1F] rounded-lg transition"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-2 text-[#D97706]">
          <Scale className="h-5 w-5" />
          <span className="font-serif text-lg font-bold text-[#F4F3EF] tracking-tight">LegalMind</span>
        </div>
        <div className="h-8 w-8 rounded-lg bg-[#181A1F] border border-[#2A2C34] flex items-center justify-center text-[#D97706] font-mono text-xs font-semibold">
          {getInitials(user?.name)}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 h-screen p-5 sm:p-7 lg:p-10 overflow-y-auto z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* TOP NAVBAR */}
          <header className="flex items-center space-x-3.5 pb-4 border-b border-[#202227]">
            <Link 
              to="/dashboard" 
              className="p-2 bg-[#131518] rounded-lg hover:bg-[#181A1F] text-[#8E8D88] hover:text-[#F4F3EF] transition border border-[#202227] shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#D97706] font-semibold">Document Intake</span>
              <h1 className="text-2xl font-serif font-bold text-[#F4F3EF] sm:text-3xl tracking-tight mt-0.5">
                Upload Contract for Audit
              </h1>
              <p className="text-xs text-[#8E8D88]">Deploy automated legal covenant extraction and risk profiling</p>
            </div>
          </header>

          {/* MAIN FORM CONTAINER - Chambers & Swiss Minimalist */}
          <div className="p-6 sm:p-8 rounded-xl bg-[#131518] border border-[#202227] shadow-xl">
            <form onSubmit={handleUploadSubmit} className="space-y-6">
              
              {/* UPLOAD ZONE */}
              <div>
                <label className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider mb-2">
                  Legal Document File (PDF)
                </label>

                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={handleContainerClick}
                  className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center min-h-[200px] ${
                    isDragActive 
                      ? 'border-[#D97706] bg-[#D97706]/10 scale-[1.01]' 
                      : file 
                        ? 'border-[#10B981]/40 bg-[#10B981]/5 cursor-default' 
                        : 'border-[#262830] bg-[#0A0B0D] hover:border-[#D97706]/40 hover:bg-[#181A1F]/30'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                    disabled={uploading}
                  />

                  {!file ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#181A1F] rounded-lg text-[#D97706] inline-block border border-[#2A2C34]">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#F4F3EF]">Drag & drop contract PDF here</p>
                        <p className="text-[11px] text-[#8E8D88] mt-0.5">or click to browse local filesystem</p>
                      </div>
                      <div className="inline-block px-2.5 py-0.5 rounded bg-[#181A1F] border border-[#202227] text-[10px] text-[#8E8D88] font-mono uppercase tracking-wider">
                        PDF files only • Max 10MB
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3.5 w-full max-w-md bg-[#181A1F] p-4 rounded-xl border border-[#10B981]/30 relative shadow-md">
                      <div className="p-2.5 bg-[#10B981]/10 rounded-lg text-[#10B981] border border-[#10B981]/20">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-semibold text-[#F4F3EF] truncate pr-6">{file.name}</p>
                        <p className="text-[11px] text-[#10B981] font-mono mt-0.5">{formatFileSize(file.size)}</p>
                      </div>
                      {!uploading && (
                        <button 
                          type="button" 
                          onClick={handleRemoveFile}
                          className="absolute right-3 top-3 p-1 rounded text-[#8E8D88] hover:text-[#F4F3EF] hover:bg-[#202227] transition"
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* FORM INPUTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Document Name */}
                <div>
                  <label htmlFor="doc-name" className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider mb-1.5">
                    Document Title
                  </label>
                  <input
                    id="doc-name"
                    type="text"
                    required
                    disabled={uploading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition disabled:opacity-50"
                    placeholder="e.g. Master Services Agreement v3.2"
                  />
                </div>

                {/* Document Type Dropdown */}
                <div>
                  <label htmlFor="doc-type" className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider mb-1.5">
                    Contract Category
                  </label>
                  <div className="relative">
                    <select
                      id="doc-type"
                      disabled={uploading}
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs font-medium text-[#F4F3EF] focus:outline-none focus:border-[#D97706] transition disabled:opacity-50 appearance-none cursor-pointer"
                    >
                      <option value="rent_agreement" className="bg-[#0A0B0D] text-[#F4F3EF]">Rent / Lease Agreement</option>
                      <option value="job_offer" className="bg-[#0A0B0D] text-[#F4F3EF]">Job Offer / Employment</option>
                      <option value="loan_agreement" className="bg-[#0A0B0D] text-[#F4F3EF]">Loan / Financing Covenant</option>
                      <option value="sale_deed" className="bg-[#0A0B0D] text-[#F4F3EF]">Sale Deed / Asset Purchase</option>
                      <option value="service_agreement" className="bg-[#0A0B0D] text-[#F4F3EF]">Master Services Agreement (MSA)</option>
                      <option value="other" className="bg-[#0A0B0D] text-[#F4F3EF]">Other Legal Document</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#575652]">
                      <svg className="fill-current h-3.5 w-3.5" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>

              {/* Description Textarea */}
              <div>
                <label htmlFor="doc-desc" className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider mb-1.5">
                  Internal Notes & Context (Optional)
                </label>
                <textarea
                  id="doc-desc"
                  disabled={uploading}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition disabled:opacity-50 resize-none"
                  placeholder="Jurisdiction notes, counterparty counsel details, or custom audit questions..."
                />
              </div>

              {/* Expiry Date (Optional) */}
              <div>
                <label htmlFor="doc-expiry" className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider mb-1.5">
                  Covenant Renewal / Expiration Date (Optional)
                </label>
                <input
                  id="doc-expiry"
                  type="date"
                  disabled={uploading}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs font-mono text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] transition disabled:opacity-50 cursor-pointer"
                />
                <span className="text-[10px] text-[#575652] font-mono mt-1 block">Automated renewal alert will dispatch 30 & 7 days prior</span>
              </div>

              {/* UPLOAD PROGRESS BAR */}
              {uploading && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="flex items-center space-x-1.5 text-[#D97706]">
                      <Loader className="animate-spin h-3.5 w-3.5" />
                      <span>Transmitting to secure audit vault...</span>
                    </span>
                    <span className="text-[#F4F3EF] font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#0A0B0D] rounded-full h-1.5 overflow-hidden border border-[#202227]">
                    <div 
                      className="bg-[#D97706] h-full transition-all duration-200 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!file || !name || uploading}
                  className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] border border-amber-400/20 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader className="animate-spin h-4 w-4" />
                      <span>Ingesting Contract ({uploadProgress}%) ...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      <span>Ingest & Audit Contract</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
