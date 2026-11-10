import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Copy, Check, Link2, AlertCircle, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, documentId, token, shareEnabled, shareToken, shareExpiresAt, onShareStateChanged }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (shareEnabled && shareToken) {
      const frontendUrl = window.location.origin;
      setShareUrl(`${frontendUrl}/shared/${shareToken}`);
    } else {
      setShareUrl('');
    }
  }, [shareEnabled, shareToken]);

  if (!isOpen) return null;

  const handleGenerateLink = async () => {
    setLoading(true);
    const toastId = toast.loading('Generating shareable link...');
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(`/api/documents/${documentId}/share`, {}, config);
      if (response.data && response.data.shareUrl) {
        setShareUrl(response.data.shareUrl);
        const generatedToken = response.data.shareUrl.split('/').pop();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        
        onShareStateChanged({
          shareEnabled: true,
          shareToken: generatedToken,
          shareExpiresAt: expiresAt
        });
        
        toast.success('Share link generated!', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to generate share link', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableLink = async () => {
    if (!window.confirm('Are you sure you want to disable this link? Anyone using it will immediately lose access.')) return;
    
    setLoading(true);
    const toastId = toast.loading('Disabling share link...');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/documents/${documentId}/share`, config);
      setShareUrl('');
      
      onShareStateChanged({
        shareEnabled: false,
        shareToken: null,
        shareExpiresAt: null
      });
      
      toast.success('Share link disabled successfully', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to disable link', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatExpiryDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Dimmer */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md rounded-xl bg-[#131518] border border-[#202227] p-6 sm:p-7 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in duration-150 font-sans">
        
        {/* Header Title */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#202227]">
          <div className="flex items-center space-x-2 text-[#D97706]">
            <Link2 className="h-4.5 w-4.5" />
            <h3 className="text-base font-serif font-bold text-[#F4F3EF] tracking-tight">Share Audit Intelligence</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-[#8E8D88] hover:bg-[#181A1F] hover:text-[#F4F3EF] rounded-lg transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal content based on share state */}
        {!shareUrl ? (
          /* NOT SHARED YET */
          <div className="space-y-5">
            <p className="text-xs text-[#8E8D88] leading-relaxed">
              Generate a secure, authenticated link allowing third-party counsel or executive review without requiring an account login.
            </p>
            <div className="bg-[#0A0B0D] border border-[#202227] rounded-lg p-3.5 flex items-start space-x-3 text-[#8E8D88]">
              <AlertCircle className="h-4 w-4 mt-0.5 text-[#D97706] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#F4F3EF]">Security & Expiration Notice</p>
                <p className="text-[11px] text-[#575652] mt-0.5 font-mono leading-relaxed">
                  Shared links auto-expire in 7 days. Raw chat queries and original storage credentials remain inaccessible.
                </p>
              </div>
            </div>
            
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] shadow-sm disabled:opacity-50 cursor-pointer flex justify-center items-center space-x-2 transition"
            >
              <span>Generate Share Link</span>
            </button>
          </div>
        ) : (
          /* ALREADY SHARED */
          <div className="space-y-5 flex flex-col items-center">
            
            {/* Input URL Copy Field */}
            <div className="w-full space-y-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#8E8D88]">Shareable URL</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs font-mono text-[#F4F3EF] focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 bg-[#181A1F] hover:bg-[#202227] border border-[#2A2C34] rounded-lg text-[#D97706] hover:text-[#F4F3EF] transition cursor-pointer"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="h-4 w-4 text-[#10B981]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-[#FFFFFF] p-3 rounded-lg shadow-md flex items-center justify-center mt-1 border border-[#202227]">
              <QRCodeSVG 
                value={shareUrl} 
                size={130} 
                bgColor="#ffffff"
                fgColor="#0A0B0D"
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-[10px] font-mono text-[#575652] uppercase tracking-wider">Scan QR code for direct mobile access</p>

            {/* Expiry Alert banner */}
            <div className="w-full text-center py-2 bg-[#181A1F] border border-[#202227] rounded-lg">
              <span className="text-[10px] font-mono text-[#D97706]">
                Expires: {formatExpiryDate(shareExpiresAt)}
              </span>
            </div>

            <div className="w-full border-t border-[#202227]" />

            {/* Disable Link Action Button */}
            <button
              onClick={handleDisableLink}
              disabled={loading}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-[#E11D48] hover:text-white bg-rose-500/10 hover:bg-[#E11D48] border border-rose-500/20 transition cursor-pointer flex justify-center items-center space-x-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Disable Share Link</span>
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
