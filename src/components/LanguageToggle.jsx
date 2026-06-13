import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';

const LanguageToggle = ({ documentId, currentLanguage, status, token, onLanguageChanged }) => {
  const [loading, setLoading] = useState(false);
  const isAnalyzing = status === 'uploaded' || status === 'analyzing';

  const handleToggle = async (targetLang) => {
    if (currentLanguage === targetLang || isAnalyzing || loading) return;

    setLoading(true);
    const toastMsg = targetLang === 'hindi' 
      ? "Switching to Hindi... Re-analyzing document" 
      : "Switching to English... Re-analyzing document";
    
    const toastId = toast.loading(toastMsg);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.patch(`/api/documents/${documentId}/language`, { language: targetLang }, config);
      
      if (res.data.success) {
        // Notify parent of the language change (so it updates document status to 'analyzing' and triggers polling)
        onLanguageChanged(targetLang);
        toast.success(targetLang === 'hindi' ? "Language changed to Hindi" : "Language changed to English", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to switch language", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-slate-900/60 p-1.5 rounded-xl border border-white/5 shadow-md">
      <button
        disabled={isAnalyzing || loading}
        onClick={() => handleToggle('english')}
        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
          currentLanguage === 'english'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
        }`}
      >
        EN
      </button>
      <span className="text-slate-700 text-xs font-bold">|</span>
      <button
        disabled={isAnalyzing || loading}
        onClick={() => handleToggle('hindi')}
        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
          currentLanguage === 'hindi'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
        }`}
      >
        हिंदी
      </button>
      {(isAnalyzing || loading) && (
        <div className="pl-1 text-blue-400" title="AI is analyzing...">
          <Loader className="animate-spin h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
