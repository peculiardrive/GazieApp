"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isMock } from '@/lib/supabase';
import { uploadDocument } from '@/lib/storage';
import { ShieldCheck, Phone, User, Lock, Upload, ArrowRight, ArrowLeft, Info, HelpCircle, Eye, EyeOff, Mail } from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'rider' | 'driver'>('rider');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailVerificationScreen, setShowEmailVerificationScreen] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Form step
  const [step, setStep] = useState(1);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  // Step 1 values
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 2 values (Rider)
  const [emergencyContact, setEmergencyContact] = useState('');
  const [riderIdFile, setRiderIdFile] = useState<File | null>(null);

  // Step 2 values (Driver)
  const [driverIdFile, setDriverIdFile] = useState<File | null>(null);
  const [driverLicenseFile, setDriverLicenseFile] = useState<File | null>(null);
  const [driverInsuranceFile, setDriverInsuranceFile] = useState<File | null>(null);
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [usualRoute, setUsualRoute] = useState('');
  const [availableTimeWindow, setAvailableTimeWindow] = useState('07:30 AM - 08:30 AM');
  const [driverFare, setDriverFare] = useState('1000');

  const formatAuthError = (message: string) => {
    if (/rate.*exceed|email.*rate|too many/i.test(message)) {
      return 'Gazie email verification is temporarily busy. Please try again later, or message us on WhatsApp at 08164737221 so we can help complete your onboarding.';
    }
    return message;
  };

  useEffect(() => {
    // Check url parameter
    const urlRole = searchParams.get('role');
    if (urlRole === 'driver' || urlRole === 'rider') {
      setRole(urlRole);
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in your email address and password');
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (signInError) {
      const errMsg = signInError.message;
      if (/email.*not.*confirm/i.test(errMsg)) {
        setError('Your email has not been verified yet. We have sent a verification code to your email.');
        // Automatically trigger resend and switch to OTP verification screen
        fetch('/api/auth/resend-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() })
        }).catch(() => {});
        setShowEmailVerificationScreen(true);
      } else if (/invalid.*credentials/i.test(errMsg)) {
        setError('Incorrect email or password. Please check your credentials or click "Forgot password?" below.');
      } else {
        setError(formatAuthError(errMsg));
      }
      setLoading(false);
      return;
    }

    if (data.session) {
      // Fetch profile to redirect correctly
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, verification_status')
        .eq('id', data.session.user.id)
        .single();

      if (profile) {
        if (profile.role === 'admin') {
          await supabase.auth.signOut();
          setError('Administrators must sign in via the Admin Access Portal.');
          setLoading(false);
          return;
        }

        if (profile.verification_status === 'pending_email') {
          setCreatedUserId(data.session.user.id);
          setShowEmailVerificationScreen(true);
          setLoading(false);
          return;
        }

        router.push('/dashboard');
      } else {
        setError('Profile not found.');
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to send password reset email');
      } else {
        setSuccess(data.message || `A password reset link has been dispatched to ${email.trim()}. Please check your email inbox and spam folder.`);
        setForgotSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone || !fullName || !password) {
      setError('Please complete all account details');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!agreedToPrivacy) {
      setError('You must agree to the Privacy Policy and Terms of Service to proceed.');
      setLoading(false);
      return;
    }

    if (!email || !phone || !fullName || !password) {
      setError('Please complete all account details');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // 1. Sign Up User in Auth system
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/dashboard` 
        : 'https://gaziecommute.com/dashboard';

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        phone: phone.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone: phone.trim(),
            role: role
          }
        }
      });

      if (authError) {
        setError(formatAuthError(authError.message));
        setLoading(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setError('Sign up failed. Please try again.');
        setLoading(false);
        return;
      }

      // Also trigger guaranteed delivery via Resend API in background
      fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      }).catch(err => console.warn('Resend verification background trigger:', err));

      setSuccess('Saving your commuter profile...');
      const updateData: any = {
        full_name: fullName,
        phone: phone.trim(),
        role: role,
        verification_status: 'pending_email'
      };

      // Support environments with and without automated database triggers
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      let profileError;
      if (existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);
        profileError = error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert({ id: userId, ...updateData });
        profileError = error;
      }

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setCreatedUserId(userId);
      setShowEmailVerificationScreen(true);
      setSuccess('Account created! A verification code has been dispatched to your email.');
      setResendCooldown(60);

    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the verification code sent to your email.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Verify with Supabase Auth OTP API
      const { data, error: otpError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: 'signup'
      });

      if (otpError) {
        // Fallback check for standard email token type
        const { error: retryError } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otpCode.trim(),
          type: 'email'
        });
        if (retryError) throw retryError;
      }

      // 2. Mark profile as email_verified
      if (createdUserId) {
        await supabase
          .from('profiles')
          .update({ verification_status: 'email_verified' })
          .eq('id', createdUserId);
      }

      setSuccess('Email verified successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code. Please check your email or request a new code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        // Fallback to supabase direct resend
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (resendError) throw resendError;
      }

      setSuccess('A fresh verification code has been dispatched to your email.');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please wait a moment and try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleTestAutoFill = (phoneNum: string) => {
    setEmail(`${phoneNum}@gazie.com`);
    setPhone(phoneNum);
    setPassword('password123');
    setIsSignUp(false);
    setError(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Test Credentials Box */}
      {isMock && (
        <div className="bg-gazie-navy text-gazie-paper p-4 rounded-xl border border-gazie-navy shadow-sm text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold border-b border-white/20 pb-1.5 text-gazie-yellow">
            <Info className="w-4 h-4" /> PILOT DEMO LOGIN BANNERS
          </div>
          <p className="opacity-90 leading-relaxed">
            Fast-track testing using these seeded mock accounts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
            <button type="button" onClick={() => handleTestAutoFill('09011111111')} className="flex justify-between items-center text-left bg-white/10 hover:bg-white/20 p-1.5 rounded cursor-pointer transition-all">
              <span>👮 Admin: 09011111111</span>
              <span className="bg-gazie-yellow text-gazie-navy px-1 py-0.2 rounded font-bold uppercase">Autofill</span>
            </button>
            <button type="button" onClick={() => handleTestAutoFill('09022222222')} className="flex justify-between items-center text-left bg-white/10 hover:bg-white/20 p-1.5 rounded cursor-pointer transition-all">
              <span>🚗 Rider (Obinna): 09022222222</span>
              <span className="bg-gazie-yellow text-gazie-navy px-1 py-0.2 rounded font-bold uppercase">Autofill</span>
            </button>
            <button type="button" onClick={() => handleTestAutoFill('09033333333')} className="flex justify-between items-center text-left bg-white/10 hover:bg-white/20 p-1.5 rounded cursor-pointer transition-all">
              <span>🚕 Driver (Bello): 09033333333</span>
              <span className="bg-gazie-yellow text-gazie-navy px-1 py-0.2 rounded font-bold uppercase">Autofill</span>
            </button>
            <button type="button" onClick={() => handleTestAutoFill('09044444444')} className="flex justify-between items-center text-left bg-white/10 hover:bg-white/20 p-1.5 rounded cursor-pointer transition-all">
              <span>⏳ Rider (Pending): 09044444444</span>
              <span className="bg-gazie-yellow text-gazie-navy px-1 py-0.2 rounded font-bold uppercase">Autofill</span>
            </button>
            <button type="button" onClick={() => handleTestAutoFill('09055555555')} className="flex justify-between items-center text-left bg-white/10 hover:bg-white/20 p-1.5 rounded cursor-pointer transition-all text-ellipsis overflow-hidden whitespace-nowrap">
              <span>⏳ Driver (Pending): 09055555555</span>
              <span className="bg-gazie-yellow text-gazie-navy px-1 py-0.2 rounded font-bold uppercase">Autofill</span>
            </button>
          </div>
          <p className="text-[9px] opacity-75 italic text-center">Password for all seeded users is: <span className="underline font-bold">password123</span></p>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white border-2 border-gazie-navy rounded-2xl shadow-md overflow-hidden">
        {showEmailVerificationScreen ? (
          <div className="p-6 text-center space-y-5 animate-fadeIn">
            <div className="w-14 h-14 bg-gazie-yellow/15 text-gazie-navy rounded-full flex items-center justify-center mx-auto border-2 border-gazie-navy/20">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display font-black text-xl tracking-tight uppercase">Verify Your Email</h3>
              <p className="text-xs text-gazie-navy/70 max-w-sm mx-auto leading-relaxed font-semibold">
                We sent a verification code and confirmation link to <span className="text-gazie-navy font-bold underline">{email}</span>.
              </p>
              <p className="text-[11px] text-gazie-navy/60 max-w-xs mx-auto">
                Enter the verification code from your email below to activate your account and start commuting.
              </p>
            </div>

            {/* Error / Success Feedback */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold text-left">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 text-gazie-green border border-gazie-green/20 rounded-xl text-xs font-semibold text-left">
                {success}
              </div>
            )}

            {/* OTP Form (Supports 6 to 8 Digits) */}
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">
                  Email Verification Code
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="Enter code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                  className="w-full text-center tracking-[0.3em] font-mono text-2xl font-black py-3 bg-gazie-paper/30 border-2 border-gazie-navy rounded-xl focus:outline-none focus:border-gazie-yellow text-gazie-navy placeholder:tracking-normal placeholder:font-sans placeholder:text-sm uppercase"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !otpCode}
                className="w-full bg-gazie-navy text-gazie-paper hover:bg-gazie-yellow hover:text-gazie-navy font-bold py-3 rounded-xl border-2 border-gazie-navy transition-all cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-display disabled:opacity-50"
              >
                {loading ? 'Verifying Code...' : 'Verify Code & Continue'} <ShieldCheck className="w-4 h-4" />
              </button>
            </form>

            {/* Resend Code & Link Fallback */}
            <div className="pt-3 border-t border-dashed border-gazie-navy/15 space-y-2 text-xs">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-gazie-navy/70">
                <span>Didn&rsquo;t get the code?</span>
                {resendCooldown > 0 ? (
                  <span className="font-mono font-bold text-gazie-navy/50">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="font-bold text-gazie-green hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    const { data: profile } = await supabase
                      .from('profiles')
                      .select('verification_status')
                      .eq('id', createdUserId)
                      .single();
                      
                    if (profile && profile.verification_status !== 'pending_email') {
                      setSuccess('Email confirmed! Redirecting...');
                      setTimeout(() => {
                        router.push('/dashboard');
                      }, 1000);
                    } else {
                      setError('Email is still unverified. Please enter the 6-digit code from the email or click the link in your inbox.');
                    }
                  } catch (err: any) {
                    setError('Error checking status. Please enter the code above.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-[11px] text-gazie-navy/60 hover:text-gazie-navy font-semibold underline block mx-auto cursor-pointer"
              >
                I clicked the link in my email &rarr; Check Status
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setShowEmailVerificationScreen(false);
                setIsSignUp(false);
                setError(null);
                setSuccess(null);
                setOtpCode('');
              }}
              className="text-xs font-bold text-gazie-navy/60 hover:text-gazie-navy flex items-center gap-1 mx-auto hover:underline cursor-pointer pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </button>
          </div>
        ) : showSuccessScreen ? (
          <div className="p-6 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 bg-gazie-green/10 text-gazie-green rounded-full flex items-center justify-center mx-auto border-2 border-gazie-green/20">
              <ShieldCheck className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-xl tracking-tight">Registration Submitted!</h3>
              <p className="text-sm text-gazie-navy/70 max-w-sm mx-auto leading-relaxed">
                Your NIN profile and verification files have been queued for admin check. We'll update you soon.
              </p>
            </div>
            <button
              onClick={() => {
                setIsSignUp(false);
                setShowSuccessScreen(false);
                setStep(1);
              }}
              className="bg-gazie-navy text-gazie-paper hover:bg-gazie-yellow hover:text-gazie-navy font-bold py-2.5 px-6 rounded-xl border border-gazie-navy transition-all cursor-pointer inline-flex items-center gap-2 text-xs mx-auto"
            >
              Go to Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Toggle Mode */}
            <div className="flex border-b border-gazie-navy">
              <button
                onClick={() => { setIsSignUp(false); setError(null); }}
                className={`flex-1 py-3 text-center text-sm font-bold tracking-wider cursor-pointer ${
                  !isSignUp ? 'bg-gazie-navy text-gazie-paper' : 'bg-white text-gazie-navy hover:bg-gazie-paper/30'
                }`}
              >
                SIGN IN
              </button>
              <button
                onClick={() => { setIsSignUp(true); setError(null); }}
                className={`flex-1 py-3 text-center text-sm font-bold tracking-wider cursor-pointer ${
                  isSignUp ? 'bg-gazie-navy text-gazie-paper' : 'bg-white text-gazie-navy hover:bg-gazie-paper/30'
                }`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 mb-4 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-gazie-green text-xs p-3 rounded-lg border border-gazie-green/20 mb-4 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gazie-green inline-block animate-ping" />
              <span>{success}</span>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4 animate-fadeIn">
              <div className="text-left space-y-1 mb-2">
                <h3 className="font-display font-extrabold text-base text-gazie-navy">Reset your password</h3>
                <p className="text-xs text-gazie-navy/60">
                  Enter your registered email address and we&apos;ll send you a password recovery link.
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                  <input
                    type="email"
                    placeholder="e.g. obinna@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm focus:outline-none focus:border-gazie-yellow font-semibold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gazie-navy text-gazie-paper hover:bg-gazie-yellow hover:text-gazie-navy font-bold py-3 rounded-xl border border-gazie-navy transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 text-sm"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'} <ArrowRight className="w-4 h-4" />
              </button>

              {forgotSent && (
                <div className="pt-2 text-center">
                  <Link
                    href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center justify-center gap-1.5 w-full bg-gazie-yellow text-gazie-navy font-bold py-2.5 px-4 rounded-xl border border-gazie-navy text-xs hover:bg-gazie-yellow/80 transition"
                  >
                    Have your 6-digit code? Set New Password &rarr;
                  </Link>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                    setSuccess(null);
                    setForgotSent(false);
                  }}
                  className="text-xs font-bold text-gazie-navy/70 hover:text-gazie-navy hover:underline cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          ) : !isSignUp ? (
            /* SIGN IN FORM */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                  <input
                    type="email"
                    placeholder="e.g. obinna@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm focus:outline-none focus:border-gazie-yellow font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-[11px] font-bold text-gazie-navy/60 hover:text-gazie-navy hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm focus:outline-none focus:border-gazie-yellow"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gazie-navy/40 hover:text-gazie-navy focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gazie-navy text-gazie-paper hover:bg-gazie-yellow hover:text-gazie-navy font-bold py-3 rounded-xl border border-gazie-navy transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 text-sm"
              >
                {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : null}

          {/* SIGN UP FORM */}
          {isSignUp && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-4 animate-fadeIn">
                {/* Role Segment Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70 text-center">I want to signup as:</label>
                  <div className="flex bg-gazie-paper/30 p-1.5 rounded-xl border border-gazie-navy/20 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('rider')}
                      className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        role === 'rider' ? 'bg-gazie-yellow text-gazie-navy shadow-sm' : 'text-gazie-navy/60 hover:text-gazie-navy'
                      }`}
                    >
                      RIDER (Book Commutes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('driver')}
                      className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        role === 'driver' ? 'bg-gazie-yellow text-gazie-navy shadow-sm' : 'text-gazie-navy/60 hover:text-gazie-navy'
                      }`}
                    >
                      DRIVER (Provide Rides)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                    <input
                      type="text"
                      placeholder="First and Last Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm focus:outline-none focus:border-gazie-yellow"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70">Email Address (for login)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                    <input
                      type="email"
                      placeholder="e.g. commuter@gazie.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm focus:outline-none focus:border-gazie-yellow font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70">Phone Number (for matches)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                    <input
                      type="tel"
                      placeholder="e.g. 08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm focus:outline-none focus:border-gazie-yellow font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-gazie-navy/70">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gazie-navy/40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-gazie-paper/20 border-2 border-gazie-navy rounded-xl text-sm focus:outline-none focus:border-gazie-yellow"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gazie-navy/40 hover:text-gazie-navy focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Privacy & Terms Agreement Checkbox */}
                <div className="flex items-start gap-2 pt-2 pb-1 text-left">
                  <input
                    type="checkbox"
                    id="agreePrivacy"
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-gazie-navy rounded border-gray-300 text-gazie-navy cursor-pointer focus:ring-gazie-yellow"
                    required
                  />
                  <label htmlFor="agreePrivacy" className="text-[11px] text-gazie-navy/80 font-medium select-none cursor-pointer leading-tight">
                    I agree to the{' '}
                    <Link href="/privacy" target="_blank" className="underline font-bold text-gazie-navy hover:text-gazie-green transition">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/terms" target="_blank" className="underline font-bold text-gazie-navy hover:text-gazie-green transition">
                      Terms of Service
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-gazie-navy text-gazie-paper hover:bg-gazie-yellow hover:text-gazie-navy font-bold py-3 rounded-xl border border-gazie-navy transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 font-display uppercase tracking-wider text-xs"
                >
                  {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
        </>
        )}
      </div>
      <div className="text-center mt-4">
        <Link href="/login/admin" className="font-mono text-[10px] font-bold text-gazie-navy/40 hover:text-gazie-navy hover:underline uppercase tracking-wider">
          🔒 Admin Access Portal
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gazie-paper text-gazie-navy">
      <header className="sticky top-0 z-50 bg-white border-b-2 border-gazie-navy px-4 py-3 flex justify-between items-center shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/brand/gazie-commute-icon.png"
            alt="Gazie Commute Logo"
            className="h-9 w-9 object-contain rounded-lg border border-gazie-navy/15"
          />
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-base leading-none tracking-tight text-gazie-navy">
              GAZIE <span className="text-gazie-yellow">COMMUTE</span>
            </span>
            <span className="font-mono text-[9px] tracking-wider text-gazie-navy/60 font-bold mt-1">ABUJA & ENVIRONS</span>
          </div>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-lg mx-auto w-full">
        <Suspense fallback={
          <div className="bg-white border-2 border-gazie-navy rounded-2xl shadow-md p-8 text-center w-full">
            <div className="w-8 h-8 border-4 border-gazie-yellow border-t-gazie-navy rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-gazie-navy">Loading Portal...</p>
          </div>
        }>
          <LoginFormContent />
        </Suspense>
      </main>
    </div>
  );
}
