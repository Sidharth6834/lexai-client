import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Scale, Sparkles, Shield, ArrowRight, MessageSquare, CheckCircle, FileText } from 'lucide-react';
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

  // Render Google Login Button
  useEffect(() => {
    /* global google */
    if (typeof google !== 'undefined') {
      try {
        const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || '490767462902-rnpmt3r27bo20un613m3m1tnovcdgmai.apps.googleusercontent.com';
        google.accounts.id.initialize({
          client_id: client_id,
          callback: handleGoogleCredentialResponse,
        });
        google.accounts.id.renderButton(
          document.getElementById('googleBtn'),
          { theme: 'outline', size: 'large', width: 320 }
        );
      } catch (err) {
        console.warn('Google Identity initialization deferred:', err);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Logging in...');

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
    <div className="min-h-screen bg-[#030712] text-white flex relative overflow-hidden">
      {/* Background glowing bubbles */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* LEFT SIDE: Landing & Marketing Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-955/20 border-r border-white/5 flex-col justify-between p-12 relative overflow-hidden z-10">
        {/* Glow behind landing */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_60%)] pointer-events-none" />
        
        {/* Branding Logo Header */}
        <div className="flex items-center space-x-2.5 text-indigo-400">
          <Scale className="h-9 w-9" />
          <span className="text-2xl font-extrabold text-white tracking-wider">LexAI</span>
        </div>

        {/* Feature Presentation */}
        <div className="space-y-10 max-w-xl mx-auto my-auto relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Legal Assistant</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-white xl:text-5xl tracking-tight">
              Audit Legal Contracts <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">with AI in Seconds.</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              LexAI uses advanced retrieval-augmented LLM technology to analyze covenants, translate complex legalese, flag risks, and answer specific questions in real-time.
            </p>
          </div>

          {/* Core Highlights List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            <div className="flex space-x-3.5">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 h-fit">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Clause Breakdown</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Categorized risk alerts with suggestions for caution or risky areas.
                </p>
              </div>
            </div>

            <div className="flex space-x-3.5">
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20 h-fit">
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Interactive Chat</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Ask questions, check liabilities, and query specific sections.
                </p>
              </div>
            </div>

            <div className="flex space-x-3.5">
              <div className="p-2 bg-pink-500/10 rounded-xl text-pink-450 border border-pink-500/20 h-fit">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Plain-English Explain</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Translates complex contract clauses into simple, clear summaries.
                </p>
              </div>
            </div>

            <div className="flex space-x-3.5">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-450 border border-emerald-500/20 h-fit">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Confidential Audits</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Secure local document analysis and private cloud reports.
                </p>
              </div>
            </div>

          </div>

          {/* Interactive visual mockup container */}
          <div className="pt-6 relative">
            <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="glass-card rounded-2xl p-5 border border-white/10 text-left relative shadow-xl max-w-md w-full mx-auto transform -rotate-1 hover:rotate-0 transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-300 truncate max-w-[180px]">Mutual_NDA_Draft.pdf</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                  CAUTION
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 space-y-1">
                  <p className="text-[9px] font-extrabold text-slate-500 tracking-wider uppercase">Covenant Audited</p>
                  <p className="text-xs font-bold text-white">Section 9: Governing Law & Jurisdiction</p>
                </div>
                
                <div className="p-3.5 bg-indigo-500/5 rounded-xl border border-indigo-500/10 space-y-1.5">
                  <p className="text-[9px] font-extrabold text-indigo-400 tracking-wider uppercase">AI Suggestion</p>
                  <p className="text-[11px] font-semibold text-indigo-200 leading-relaxed">
                    "Change jurisdiction from New York to Delaware to match company standard bylaws."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-slate-500 text-xs font-semibold">
          © {new Date().getFullYear()} LexAI Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Login Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Mobile-only brand logo */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 lg:hidden mb-6">
          <div className="flex justify-center items-center space-x-2.5 text-indigo-400">
            <Scale className="h-9 w-9 animate-pulse" />
            <span className="text-3xl font-extrabold text-white tracking-wider">ScaleAI</span>
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-white tracking-tight">
            Welcome to LexAI
          </h2>
          <p className="mt-1 text-center text-xs text-slate-400 font-medium">
            Analyze and manage your legal documents securely
          </p>
        </div>

        {/* Desktop-only simple form heading */}
        <div className="hidden lg:block sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-6">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-450 font-semibold">
            Sign in to access your secure legal dashboard
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="glass-card py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/5">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm placeholder-slate-650 transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="text-xs">
                    <Link to="/forgot-password" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
                      Forgot Password?
                    </Link>
                  </div>
                </div>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-10 py-3 glass-input rounded-xl text-sm placeholder-slate-650 transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white btn-gradient disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

            {/* Social login divider */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#0d1425] text-slate-500 rounded-md font-semibold">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <div id="googleBtn" className="flex justify-center w-full"></div>
              
              {/* Developer sandbox mock button */}
              <button
                type="button"
                onClick={() => handleGoogleCredentialResponse({ credential: 'mock_google_token' })}
                className="w-full py-2.5 px-4 border border-dashed border-slate-700/60 rounded-xl text-xs font-semibold text-slate-400 bg-slate-900/40 hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
              >
                Developer Sandbox Sign-In (Mock)
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400 font-semibold">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
                  Register
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
