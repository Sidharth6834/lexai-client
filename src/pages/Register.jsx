import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, Scale, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Details, 2 = Verify Code

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
    if (step !== 1) return;

    let intervalId = null;

    const renderGoogleBtn = () => {
      const container = document.getElementById('googleBtnRegister');
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
  }, [step]);

  // Step 1: Send OTP code to email
  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('All fields are required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending verification code to your email...');

    try {
      await axios.post('/api/auth/register/send-otp', { email });
      toast.success('Verification code sent! Please check your inbox.', { id: toastId });
      setStep(2);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send verification code';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and create user account
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Verifying code and registering account...');

    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        otp
      });

      const { user, token } = response.data;
      login(user, token);

      toast.success(`Account verified! Welcome, ${user.name}!`, { id: toastId });
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Verification failed';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#F4F3EF] flex relative overflow-hidden">
      {/* Background subtle architectural grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#20222715_1px,transparent_1px),linear-gradient(to_bottom,#20222715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* LEFT SIDE: Chambers Overview */}
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
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Account Setup</span>
            </div>
            <h1 className="text-4xl font-serif font-bold leading-tight text-[#F4F3EF] xl:text-5xl tracking-tight">
              Create your LegalMind <br />
              <span className="text-[#D97706]">Audit Workspace.</span>
            </h1>
            <p className="text-[#8E8D88] text-sm leading-relaxed">
              Join legal counsels, enterprise risk managers, and business operators who audit agreements with verified precision.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] space-y-3.5">
            <div className="flex items-start space-x-3 text-xs text-[#C6C5BF]">
              <CheckCircle2 className="h-4 w-4 text-[#D97706] mt-0.5 shrink-0" />
              <span>Two-step email verification for authenticated, secure document access</span>
            </div>
            <div className="flex items-start space-x-3 text-xs text-[#C6C5BF]">
              <CheckCircle2 className="h-4 w-4 text-[#D97706] mt-0.5 shrink-0" />
              <span>Full private cloud report export & interactive covenant query engine</span>
            </div>
            <div className="flex items-start space-x-3 text-xs text-[#C6C5BF]">
              <CheckCircle2 className="h-4 w-4 text-[#D97706] mt-0.5 shrink-0" />
              <span>Encrypted audit storage with zero third-party data training</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[#575652] text-xs font-mono">
          © {new Date().getFullYear()} LegalMind Chambers Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Register Panel */}
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
            Create an Account
          </h2>
          <p className="mt-1 text-xs text-[#8E8D88]">
            Start analyzing your contracts with verified precision
          </p>
        </div>

        {/* Desktop-only simple form heading */}
        <div className="hidden lg:block sm:mx-auto sm:w-full sm:max-w-md relative z-10 mb-6">
          <h2 className="text-3xl font-serif font-bold text-[#F4F3EF] tracking-tight">
            {step === 1 ? 'Create an Account' : 'Verify Your Email'}
          </h2>
          <p className="mt-1.5 text-xs text-[#8E8D88]">
            {step === 1 
              ? 'Enter your details below to establish your legal workspace' 
              : 'Enter the 6-digit verification code sent to your email'}
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="p-7 sm:p-8 rounded-xl bg-[#131518] border border-[#202227] shadow-xl">
            {step === 1 ? (
              /* STEP 1: USER DETAILS FORM */
              <form className="space-y-4" onSubmit={handleSendCode}>
                <div>
                  <label htmlFor="name" className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="mt-1.5 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#575652]">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="mt-1.5 relative">
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
                  <label htmlFor="password" className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider">
                    Password (Min. 6 characters)
                  </label>
                  <div className="mt-1.5 relative">
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] border border-amber-400/20 shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: VERIFY CODE FORM */
              <form className="space-y-5" onSubmit={handleVerifyAndRegister}>
                <div className="text-center pb-2">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center text-xs font-medium text-[#D97706] hover:text-[#F59E0B] transition mb-3 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    <span>Change registration details</span>
                  </button>
                  <p className="text-xs text-[#8E8D88]">
                    Verification code sent to <strong className="text-[#F4F3EF] font-mono">{email}</strong>
                  </p>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider mb-2 text-center">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="block w-full py-3 bg-[#0A0B0D] border border-[#202227] rounded-lg text-center text-xl font-mono font-bold tracking-[0.25em] text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] border border-amber-400/20 shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Registering Account...' : 'Verify & Register'}
                  </button>
                </div>
              </form>
            )}

            {/* Social login divider */}
            {step === 1 && (
              <>
                <div className="mt-5 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#202227]"></div>
                  </div>
                  <div className="relative flex justify-center text-[11px]">
                    <span className="px-3 bg-[#131518] text-[#8E8D88] font-mono">Or continue with</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col items-center">
                  <div id="googleBtnRegister" className="flex justify-center w-full min-h-[44px]"></div>
                </div>
              </>
            )}

            <div className="mt-6 pt-5 border-t border-[#202227] text-center">
              <p className="text-xs text-[#8E8D88]">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#D97706] hover:text-[#F59E0B] transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
