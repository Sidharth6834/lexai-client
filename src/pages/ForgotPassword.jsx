import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, Scale, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Request Code, 2 = Verify & Reset

  const navigate = useNavigate();

  // Step 1: Request reset code
  const handleRequestCode = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending reset code to your email...');

    try {
      await axios.post('/api/auth/forgot-password', { email });
      toast.success('Reset code sent! Please check your email.', { id: toastId });
      setStep(2);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send reset code';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and update password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword) {
      toast.error('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Resetting password...');

    try {
      const response = await axios.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword,
      });

      toast.success(response.data.message || 'Password reset successful!', { id: toastId });
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Password reset failed';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#F4F3EF] flex flex-col justify-center py-12 px-5 sm:px-8 lg:px-12 relative overflow-hidden">
      {/* Background architectural grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#20222715_1px,transparent_1px),linear-gradient(to_bottom,#20222715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center space-x-2.5 text-[#D97706] mb-3">
          <div className="w-9 h-9 rounded-lg bg-[#181A1F] border border-[#2A2C34] flex items-center justify-center">
            <Scale className="h-5 w-5" />
          </div>
          <span className="font-serif text-2xl font-bold text-[#F4F3EF] tracking-tight">LegalMind</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-[#F4F3EF] tracking-tight">
          Reset Password
        </h2>
        <p className="mt-1.5 text-xs text-[#8E8D88]">
          Recover access to your account securely via authenticated email code
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="p-7 sm:p-8 rounded-xl bg-[#131518] border border-[#202227] shadow-xl">
          {step === 1 ? (
            /* STEP 1: REQUEST CODE */
            <form className="space-y-5" onSubmit={handleRequestCode}>
              <div className="text-center pb-1">
                <p className="text-xs text-[#8E8D88] leading-relaxed">
                  Enter your registered account email. We will dispatch a 6-digit verification code.
                </p>
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] border border-amber-400/20 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: ENTER OTP & NEW PASSWORD */
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div className="text-center pb-2">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center text-xs font-medium text-[#D97706] hover:text-[#F59E0B] transition mb-3 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Use different email address</span>
                </button>
                <p className="text-xs text-[#8E8D88]">
                  Enter the 6-digit reset code sent to <strong className="text-[#F4F3EF] font-mono">{email}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider mb-1.5 text-center">
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
                    className="block w-full py-2.5 bg-[#0A0B0D] border border-[#202227] rounded-lg text-center text-lg font-mono font-bold tracking-[0.25em] text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider">
                  New Password (Min. 6 chars)
                </label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#575652]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  {loading ? 'Resetting Password...' : 'Confirm & Update Password'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#202227] text-center">
            <Link to="/login" className="inline-flex items-center text-xs font-medium text-[#8E8D88] hover:text-[#F4F3EF] transition">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
