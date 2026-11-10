import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Scale, Sparkles, Shield, MessageSquare, CheckCircle, FileText } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle Google Sign-in response
  const handleGoogleCredentialResponse = async (response) => {
    const toastId = toast.loading('Authenticating with Google...');
    try {
      const res = await axios.post('/api/auth/google', { credential: response.credential });
      const { user, token } = res.data;
      login(user, token);
      toast.success(`Welcome back, ${user.name}!`, { id: toastId });
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-in error:', err);
      const errorMsg = err.response?.data?.message || 'Google authentication failed';
      toast.error(errorMsg, { id: toastId });
    }
  };

  // Render Google Login Button with auto-retry if script is loading
  useEffect(() => {
    let intervalId = null;

    const renderGoogleBtn = () => {
      const container = document.getElementById('googleBtn');
      if (!container) return false;

      if (window.google?.accounts?.id) {
        try {
          const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || '490767462902-rnpmt3r27bo20un613m3m1tnovcdgmai.apps.googleusercontent.com';
          window.google.accounts.id.initialize({
            client_id: client_id,
            callback: handleGoogleCredentialResponse,
          });
          container.innerHTML = '';
          window.google.accounts.id.renderButton(
            container,
            { theme: 'outline', size: 'large', width: 320 }
          );
          return true;
        } catch (err) {
          console.warn('Google Identity initialization error:', err);
        }
      }
      return false;
    };

    // Ensure the Google script is loaded
    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleBtn;
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener('load', renderGoogleBtn);
    }

    // Try immediately; if not yet ready, poll every 100ms
    if (!renderGoogleBtn()) {
      const startTime = Date.now();
      intervalId = setInterval(() => {
        if (renderGoogleBtn() || Date.now() - startTime > 10000) {
          clearInterval(intervalId);
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (existingScript) existingScript.removeEventListener('load', renderGoogleBtn);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Signing in...');

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      const { user, token } = response.data;
      login(user, token);

      toast.success(`Welcome back, ${user.name}!`, { id: toastId });
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#F4F3EF] flex relative overflow-hidden">
      {/* Subtle architectural hairline dividers */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#20222715_1px,transparent_1px),linear-gradient(to_bottom,#20222715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* LEFT SIDE: Chambers Editorial Presentation */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0E0F12] border-r border-[#202227] flex-col justify-between p-12 lg:p-14 relative z-10">
        
        {/* Branding Logo Header */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#181A1F] border border-[#2A2C34] flex items-center justify-center text-[#D97706]">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <span className="font-serif text-2xl font-bold text-[#F4F3EF] tracking-tight">LegalMind</span>
            <span className="block text-[10px] font-mono uppercase tracking-widest text-[#8E8D88]">Chambers Document Intelligence</span>
          </div>
        </div>

        {/* Feature Presentation */}
        <div className="space-y-8 max-w-lg my-auto relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-[#181A1F] border border-[#2A2C34] text-xs font-mono font-medium text-[#D97706]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Institutional Legal AI</span>
            </div>
            <h1 className="text-4xl font-serif font-bold leading-tight text-[#F4F3EF] xl:text-5xl tracking-tight">
              Audit Legal Contracts <br />
              <span className="text-[#D97706]">with AI in Seconds.</span>
            </h1>
            <p className="text-[#8E8D88] text-sm leading-relaxed">
              LegalMind uses advanced retrieval-augmented LLM technology to analyze covenants, translate complex legalese, flag risks, and answer specific questions in real-time.
            </p>
          </div>

          {/* Core Highlights List - Swiss Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            
            <div className="p-3.5 rounded-lg bg-[#131518] border border-[#202227] space-y-1.5">
              <div className="flex items-center space-x-2 text-[#D97706]">
                <CheckCircle className="h-4 w-4" />
                <h4 className="text-xs font-semibold text-[#F4F3EF] tracking-wide">Clause Breakdown</h4>
              </div>
              <p className="text-[11px] text-[#8E8D88] leading-relaxed">
                Categorized risk alerts with suggestions for caution or risky areas.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#131518] border border-[#202227] space-y-1.5">
              <div className="flex items-center space-x-2 text-[#D97706]">
                <MessageSquare className="h-4 w-4" />
                <h4 className="text-xs font-semibold text-[#F4F3EF] tracking-wide">Interactive Chat</h4>
              </div>
              <p className="text-[11px] text-[#8E8D88] leading-relaxed">
                Ask questions, check liabilities, and query specific sections.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#131518] border border-[#202227] space-y-1.5">
              <div className="flex items-center space-x-2 text-[#D97706]">
                <Sparkles className="h-4 w-4" />
                <h4 className="text-xs font-semibold text-[#F4F3EF] tracking-wide">Plain-English Explain</h4>
              </div>
              <p className="text-[11px] text-[#8E8D88] leading-relaxed">
                Translates complex contract clauses into simple, clear summaries.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#131518] border border-[#202227] space-y-1.5">
              <div className="flex items-center space-x-2 text-[#D97706]">
                <Shield className="h-4 w-4" />
                <h4 className="text-xs font-semibold text-[#F4F3EF] tracking-wide">Confidential Audits</h4>
              </div>
              <p className="text-[11px] text-[#8E8D88] leading-relaxed">
                Secure local document analysis and private cloud reports.
              </p>
            </div>

          </div>

          {/* Interactive visual mockup container */}
          <div className="pt-2">
            <div className="p-4 rounded-xl bg-[#131518] border border-[#202227] text-left shadow-lg">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#202227]">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-[#D97706]" />
                  <span className="text-xs font-mono font-medium text-[#F4F3EF] truncate">Mutual_NDA_Draft.pdf</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30">
                  CAUTION
                </span>
              </div>
              
              <div className="space-y-2.5">
                <div className="p-2.5 bg-[#0A0B0D] rounded border border-[#202227]">
                  <p className="text-[10px] font-mono uppercase text-[#8E8D88]">Covenant Audited</p>
                  <p className="text-xs font-semibold text-[#F4F3EF]">Section 9: Governing Law & Jurisdiction</p>
                </div>
                <div className="p-2.5 bg-[#181A1F] rounded border border-[#2A2C34]">
                  <p className="text-[10px] font-mono uppercase text-[#D97706]">AI Recommendation</p>
                  <p className="text-[11px] text-[#C6C5BF] leading-relaxed">
                    "Change jurisdiction from New York to Delaware to match company standard bylaws."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[#575652] text-xs font-mono">
          © {new Date().getFullYear()} LegalMind Chambers Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Precision Login Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-5 sm:px-8 lg:px-12 relative z-10">
        
        {/* Mobile-only brand logo */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 lg:hidden mb-8 text-center">
          <div className="inline-flex items-center space-x-2.5 text-[#D97706] mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#181A1F] border border-[#2A2C34] flex items-center justify-center">
              <Scale className="h-5 w-5" />
            </div>
            <span className="font-serif text-2xl font-bold text-[#F4F3EF] tracking-tight">LegalMind</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#F4F3EF] tracking-tight">
            Welcome to LegalMind
          </h2>
          <p className="mt-1 text-xs text-[#8E8D88]">
            Analyze and manage your legal documents securely
          </p>
        </div>

        {/* Desktop-only simple form heading */}
        <div className="hidden lg:block sm:mx-auto sm:w-full sm:max-w-md relative z-10 mb-6">
          <h2 className="text-3xl font-serif font-bold text-[#F4F3EF] tracking-tight">
            Sign in to LegalMind
          </h2>
          <p className="mt-1.5 text-xs text-[#8E8D88]">
            Access your secure legal audit workspace and document vault
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="p-7 sm:p-8 rounded-xl bg-[#131518] border border-[#202227] shadow-xl">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#575652]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition"
                    placeholder="name@firm.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider">
                    Password
                  </label>
                  <div className="text-xs">
                    <Link to="/forgot-password" className="text-xs font-medium text-[#D97706] hover:text-[#F59E0B] transition">
                      Forgot Password?
                    </Link>
                  </div>
                </div>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#575652]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition font-mono"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#575652] hover:text-[#8E8D88] transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] border border-amber-400/20 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

            {/* Social login divider */}
            <div className="mt-5 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#202227]"></div>
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="px-3 bg-[#131518] text-[#8E8D88] font-mono">Or continue with</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col items-center">
              <div id="googleBtn" className="flex justify-center w-full min-h-[44px]"></div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#202227] text-center">
              <p className="text-xs text-[#8E8D88]">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-[#D97706] hover:text-[#F59E0B] transition">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
