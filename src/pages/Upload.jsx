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

  // Helper to get initials
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

    // Validate type (must be PDF)
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      toast.error('Only PDF documents are allowed.');
      return;
    }

    // Validate size (max 10MB)
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxBytes) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
    
    // Auto-fill document name (strip extension)
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
    setName(baseName);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Drag and drop events handlers
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
    e.preventDefault();
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

  // Submit Handler
  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!file || !name) {
      toast.error('Please select a PDF file and specify a document name.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('description', description);
    if (expiryDate) {
      formData.append('expiryDate', expiryDate);
    }

    try {
      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      toast.success('Document uploaded! Analysis starting...');
      // Redirect to the document analysis page
      navigate(`/document/${response.data._id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(errorMsg);
      setUploading(false);
    }
  };

  return (
    <div className="h-screen bg-[#030712] text-white flex flex-col md:flex-row relative overflow-hidden">
      {/* Background glowing shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar activePage="upload" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Mobile Header Bar */}
      <div className="h-16 bg-slate-950/75 backdrop-blur-xl border-b border-slate-900 flex items-center justify-between px-4 sm:px-6 md:hidden sticky top-0 z-20 w-full shrink-0">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2 text-indigo-400">
          <Scale className="h-6 w-6" />
          <span className="text-lg font-bold text-white tracking-wide">LegalMind</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-indigo-650 flex items-center justify-center text-white font-bold text-xs shadow-md">
          {getInitials(user?.name)}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 h-screen p-6 sm:p-8 lg:p-12 overflow-y-auto z-10">
        <div className="max-w-3xl mx-auto">
          {/* TOP NAVBAR */}
          <header className="flex items-center space-x-4 mb-8">
            <Link 
              to="/dashboard" 
              className="p-2 bg-slate-900/40 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white transition border border-slate-800/50 hover:border-slate-700/50 shadow-md backdrop-blur-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">Upload Document</h1>
              <p className="text-slate-400 text-sm mt-0.5 font-medium">Prepare a PDF legal document for AI review</p>
            </div>
          </header>

          {/* MAIN FORM CONTAINER */}
          <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800/80 shadow-2xl relative overflow-hidden">
            {/* Ambient subtle card glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <form onSubmit={handleUploadSubmit} className="space-y-8 relative z-10">
              
              {/* UPLOAD ZONE */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Legal Document (PDF)
                </label>

                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={handleContainerClick}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] ${
                    isDragActive 
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.25)] scale-[1.01]' 
                      : file 
                        ? 'border-emerald-500/40 bg-emerald-500/5 cursor-default' 
                        : 'border-slate-800 bg-slate-950/40 hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                  }`}
                >
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                    disabled={uploading}
                  />

                  {!file ? (
                    /* DEFAULT STATE */
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900/60 rounded-full text-indigo-400 inline-block border border-slate-800/80 shadow-md">
                        <UploadCloud className="h-8 w-8 animate-bounce" style={{ animationDuration: '3s' }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Drag & drop your document here</p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">or click to browse local files</p>
                      </div>
                      <div className="inline-block px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] text-slate-500 font-extrabold tracking-wider uppercase">
                        PDF files only • Max 10MB
                      </div>
                    </div>
                  ) : (
                    /* FILE SELECTED STATE */
                    <div className="flex items-center space-x-4 w-full max-w-md bg-slate-900/60 p-4.5 rounded-2xl border border-emerald-500/20 relative shadow-lg">
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-bold text-white truncate pr-6">{file.name}</p>
                        <p className="text-xs text-emerald-400 font-semibold mt-0.5">{formatFileSize(file.size)}</p>
                      </div>
                      {!uploading && (
                        <button 
                          type="button" 
                          onClick={handleRemoveFile}
                          className="absolute right-3.5 top-3.5 p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Document Name */}
                <div>
                  <label htmlFor="doc-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Document Name
                  </label>
                  <input
                    id="doc-name"
                    type="text"
                    required
                    disabled={uploading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-3.5 glass-input rounded-xl text-sm placeholder-slate-650 transition disabled:opacity-50"
                    placeholder="e.g. NDA for Project Genesis"
                  />
                </div>

                {/* Document Type Dropdown */}
                <div>
                  <label htmlFor="doc-type" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Document Type
                  </label>
                  <div className="relative">
                    <select
                      id="doc-type"
                      disabled={uploading}
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="block w-full px-4 py-3.5 glass-input rounded-xl text-sm transition disabled:opacity-50 appearance-none cursor-pointer"
                    >
                      <option value="rent_agreement" className="bg-slate-950 text-white">Rent Agreement</option>
                      <option value="job_offer" className="bg-slate-950 text-white">Job Offer Letter</option>
                      <option value="loan_agreement" className="bg-slate-950 text-white">Loan Agreement</option>
                      <option value="sale_deed" className="bg-slate-950 text-white">Sale Deed</option>
                      <option value="service_agreement" className="bg-slate-950 text-white">Service Agreement</option>
                      <option value="other" className="bg-slate-950 text-white">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>

              {/* Description Textarea */}
              <div>
                <label htmlFor="doc-desc" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Description (Optional)
                </label>
                <textarea
                  id="doc-desc"
                  disabled={uploading}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full px-4 py-3.5 glass-input rounded-xl text-sm placeholder-slate-650 transition disabled:opacity-50 resize-none"
                  placeholder="Any notes about this document..."
                />
              </div>

              {/* Expiry Date (Optional) */}
              <div>
                <label htmlFor="doc-expiry" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Agreement Expiry Date (optional)
                </label>
                <input
                  id="doc-expiry"
                  type="date"
                  disabled={uploading}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="block w-full px-4 py-3.5 glass-input rounded-xl text-sm placeholder-slate-650 transition disabled:opacity-50 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">Set a reminder before this document expires</span>
              </div>

              {/* UPLOAD PROGRESS BAR */}
              {uploading && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-450">
                    <span className="flex items-center space-x-1.5 text-indigo-400">
                      <Loader className="animate-spin h-3.5 w-3.5" />
                      <span>Uploading to secure vault...</span>
                    </span>
                    <span className="text-white font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950/80 rounded-full h-2.5 overflow-hidden border border-slate-900 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div>
                <button
                  type="submit"
                  disabled={!file || !name || uploading}
                  className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white btn-gradient disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader className="animate-spin h-5 w-5" />
                      <span>Uploading ({uploadProgress}%) ...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-5 w-5" />
                      <span>Upload & Analyze</span>
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
