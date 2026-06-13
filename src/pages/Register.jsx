import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, Scale, ShieldCheck, ArrowLeft } from 'lucide-react';
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
          document.getElementById('googleBtnRegister'),
          { theme: 'outline', size: 'large', width: 320 }
        );
      } catch (err) {
        console.warn('Google Identity initialization deferred:', err);
      }
    }
  }, []);

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
        otp,
      });

      const { user, token } = response.data;
      login(user, token);
      
      toast.success('Account created successfully!', { id: toastId });
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing bubbles */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center space-x-2 text-indigo-400">
          <Scale className="h-10 w-10 animate-pulse" />
          <span className="text-3xl font-extrabold text-white tracking-wider">LexAI</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Analyze legal documents with ease using AI
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {step === 1 ? (
            /* STEP 1: ENTER DETAILS FORM */
            <form className="space-y-6" onSubmit={handleSendCode}>
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm placeholder-slate-650 transition"
                    placeholder="John Doe"
                  />
                </div>
              </div>

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
                <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
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
                  {loading ? 'Sending Code...' : 'Send Verification Code'}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: VERIFY CODE FORM */
            <form className="space-y-6" onSubmit={handleVerifyAndRegister}>
              <div className="text-center pb-2">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition mb-3 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Change registration details</span>
                </button>
                <p className="text-xs text-slate-400">
                  Verification code sent to <strong className="text-white">{email}</strong>.
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  6-Digit Verification Code
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="block w-full pl-11 pr-4 py-3.5 glass-input rounded-xl text-center text-lg font-bold tracking-[0.2em] placeholder-slate-700 transition"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white btn-gradient disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Registering Account...' : 'Verify & Register'}
                </button>
              </div>
            </form>
          )}

          {/* Social login divider */}
          {step === 1 && (
            <>
              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-[#0d1425] text-slate-500 rounded-md font-semibold">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-3">
                <div id="googleBtnRegister" className="flex justify-center w-full"></div>
                
                {/* Developer sandbox mock button */}
                <button
                  type="button"
                  onClick={() => handleGoogleCredentialResponse({ credential: 'mock_google_token' })}
                  className="w-full py-2.5 px-4 border border-dashed border-slate-700/60 rounded-xl text-xs font-semibold text-slate-400 bg-slate-900/40 hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
                >
                  Developer Sandbox Sign-In (Mock)
                </button>
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
