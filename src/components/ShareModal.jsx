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
        // Extract token from url
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
      <div className="relative glass-card w-full max-w-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
        {/* Glow ambient background shape */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Title */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Link2 className="h-5 w-5" />
            <h3 className="text-lg font-bold text-white tracking-tight">Share Analysis</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:bg-slate-900/60 hover:text-white rounded-lg transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal content based on share state */}
        {!shareUrl ? (
          /* NOT SHARED YET */
          <div className="space-y-6">
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              Generate a secure, public share link that allows anyone to view the audit ratings, summary, and clauses analysis report of this document without requiring an account login.
            </p>
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-start space-x-3 text-slate-400 shadow-inner">
              <AlertCircle className="h-5 w-5 mt-0.5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Expiration Warning</p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-relaxed">
                  For your security, shared links are temporary and automatically expire in 7 days. Chat histories and original PDF files are not shared.
                </p>
              </div>
            </div>
            
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-extrabold text-white btn-gradient shadow-lg disabled:opacity-50 cursor-pointer flex justify-center items-center space-x-2"
            >
              <span>Generate Share Link</span>
            </button>
          </div>
        ) : (
          /* ALREADY SHARED */
          <div className="space-y-6 flex flex-col items-center">
            
            {/* Input URL Copy Field */}
            <div className="w-full space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Shareable URL</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-4 py-3 bg-[#030712]/60 border border-white/5 rounded-xl text-xs text-slate-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-3 bg-slate-900/60 hover:bg-slate-800 border border-white/5 rounded-xl text-indigo-400 hover:text-white transition cursor-pointer"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="h-4.5 w-4.5 text-emerald-450" /> : <Copy className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-4.5 rounded-2xl shadow-xl flex items-center justify-center mt-2 border border-slate-200">
              <QRCodeSVG 
                value={shareUrl} 
                size={140} 
                bgColor="#ffffff"
                fgColor="#030712"
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase mt-1">Scan QR code to view</p>

            {/* Expiry Alert banner */}
            <div className="w-full text-center py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
              <span className="text-[10px] text-indigo-400 font-bold">
                Link expires: {formatExpiryDate(shareExpiresAt)}
              </span>
            </div>

            {/* Divider */}
            <div className="w-full border-t border-white/5 my-2" />

            {/* Disable Link Action Button */}
            <button
              onClick={handleDisableLink}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-extrabold text-rose-450 hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 transition cursor-pointer flex justify-center items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Disable Share Link</span>
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
