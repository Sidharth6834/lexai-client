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
    <div className="flex items-center space-x-1.5 bg-[#181A1F] p-1 rounded-lg border border-[#202227]">
      <button
        disabled={isAnalyzing || loading}
        onClick={() => handleToggle('english')}
        className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded transition cursor-pointer ${
          currentLanguage === 'english'
            ? 'bg-[#D97706] text-white shadow-sm'
            : 'text-[#8E8D88] hover:text-[#F4F3EF] disabled:opacity-50'
        }`}
      >
        EN
      </button>
      <span className="text-[#2E313A] text-xs font-mono">|</span>
      <button
        disabled={isAnalyzing || loading}
        onClick={() => handleToggle('hindi')}
        className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded transition cursor-pointer ${
          currentLanguage === 'hindi'
            ? 'bg-[#D97706] text-white shadow-sm'
            : 'text-[#8E8D88] hover:text-[#F4F3EF] disabled:opacity-50'
        }`}
      >
        हिंदी
      </button>
      {(isAnalyzing || loading) && (
        <div className="pl-1 text-[#D97706]" title="AI is analyzing...">
          <Loader className="animate-spin h-3 w-3" />
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
