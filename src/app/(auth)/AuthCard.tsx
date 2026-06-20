"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Check, Loader2, ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AuthCardProps {
  initialMode: "login" | "signup";
}

type View = "login" | "signup" | "verify" | "forgot" | "reset";

const fieldClass =
  "w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-[#4f46e5] focus:bg-white transition-all";

export default function AuthCard({ initialMode }: AuthCardProps) {
  const [view, setView] = useState<View>(initialMode);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError("");
    setInfo("");
  }, [view]);

  const goTo = (next: View) => {
    setView(next);
    if (next === "login" || next === "signup") {
      window.history.pushState(null, "", next === "login" ? "/login" : "/signup");
    }
  };

  // After a verified signup (or auto-confirmed signup), send the student to
  // onboarding. We try to create the profile row up front, but never let that
  // block the redirect — onboarding upserts the profile as a guarantee.
  const finishSignup = async () => {
    try {
      await Promise.race([
        fetch("/api/auth/ensure-profile", { method: "POST" }),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch {
      // ignore — onboarding will create the profile
    }
    window.location.href = "/onboarding";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(
        signInError.message.toLowerCase().includes("not confirmed")
          ? "Please verify your email first. Check your inbox for the code."
          : "Invalid email or password"
      );
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
  };

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    if (password !== confirmPassword) return setError("Passwords don't match");
    if (password.length < 8) return setError("Password must be at least 8 characters long");

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes("already")
          ? "An account with this email already exists. Try logging in."
          : signUpError.message
      );
      setLoading(false);
      return;
    }

    // Already-registered emails come back with no identities.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("An account with this email already exists. Try logging in.");
      setLoading(false);
      return;
    }

    setLoading(false);

    if (data.session) {
      // Email confirmation is disabled in Supabase → signed in immediately.
      await finishSignup();
      return;
    }

    // Email confirmation is on → ask for the code.
    setInfo(`We sent a verification code to ${email}.`);
    setView("verify");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "signup",
    });
    if (verifyError) {
      setError("That code is invalid or expired. Please try again.");
      setLoading(false);
      return;
    }
    await finishSignup();
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (resetError) {
      setError("Couldn't send a reset code. Please check the email and try again.");
      return;
    }
    setOtp("");
    setNewPassword("");
    setInfo(`We sent a password reset code to ${email}.`);
    setView("reset");
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters long");

    setLoading(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "recovery",
    });
    if (verifyError) {
      setError("That code is invalid or expired. Please try again.");
      setLoading(false);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setError("Couldn't update your password. Please try again.");
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
  };

  const isAuthTabs = view === "login" || view === "signup";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9f9ff] p-4 relative selection:bg-indigo-500/10">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#4f46e5 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />

      <div className="w-full max-w-[440px] z-10 flex flex-col items-center">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-[#4f46e5] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-4">
            <Check className="text-white stroke-[3.5px]" size={26} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">ShalaOne</h1>
          <p className="mt-2 text-sm text-gray-500 font-semibold max-w-xs">
            Your personal study companion, tuned to your syllabus.
          </p>
        </div>

        <motion.div
          layout
          transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
          className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 p-8 overflow-hidden"
        >
          {/* Tabs (login/signup only) */}
          {isAuthTabs && (
            <div className="bg-gray-100 p-1 rounded-full flex relative mb-6">
              {(["login", "signup"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => goTo(tab)}
                  className="w-1/2 py-2.5 text-sm font-bold rounded-full relative z-10 focus:outline-none"
                >
                  {view === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white rounded-full shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-20 transition-colors duration-200 ${
                      view === tab ? "text-[#4f46e5]" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab === "login" ? "Log In" : "Sign Up"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Back button for sub-views */}
          {!isAuthTabs && (
            <button
              type="button"
              onClick={() => goTo(view === "reset" ? "forgot" : view === "forgot" ? "login" : "signup")}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 mb-5"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}
          {info && !error && (
            <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <ShieldCheck size={15} className="shrink-0" />
              {info}
            </div>
          )}

          {/* LOGIN / SIGNUP */}
          {isAuthTabs && (
            <form onSubmit={view === "login" ? handleLogin : handleSignup} className="space-y-4">
              {/* Full Name — smoothly expands in signup mode */}
              <motion.div
                initial={initialMode === "signup" ? { height: "auto", opacity: 1, marginBottom: 16 } : { height: 0, opacity: 0, marginBottom: 0 }}
                animate={{
                  height: view === "signup" ? "auto" : 0,
                  opacity: view === "signup" ? 1 : 0,
                  marginBottom: view === "signup" ? 16 : 0,
                }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden !mt-0"
              >
                <Field label="Full Name" icon={<User size={18} />}>
                  <input type="text" required={view === "signup"} className={fieldClass} placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </Field>
              </motion.div>

              <Field label="Email Address" icon={<Mail size={18} />}>
                <input type="email" autoComplete="email" required className={fieldClass} placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>

              <Field
                label="Password"
                icon={<Lock size={18} />}
                action={
                  view === "login" ? (
                    <button type="button" onClick={() => goTo("forgot")} className="text-xs font-bold text-[#4f46e5] hover:text-[#3b32c0]">
                      Forgot?
                    </button>
                  ) : undefined
                }
              >
                <input type="password" autoComplete={view === "login" ? "current-password" : "new-password"} required className={fieldClass} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Field>

              {/* Confirm Password — smoothly expands in signup mode */}
              <motion.div
                initial={initialMode === "signup" ? { height: "auto", opacity: 1, marginTop: 16 } : { height: 0, opacity: 0, marginTop: 0 }}
                animate={{
                  height: view === "signup" ? "auto" : 0,
                  opacity: view === "signup" ? 1 : 0,
                  marginTop: view === "signup" ? 16 : 0,
                }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden !mt-0"
              >
                <Field label="Confirm Password" icon={<Lock size={18} />}>
                  <input type="password" required={view === "signup"} className={fieldClass} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </Field>
              </motion.div>

              <SubmitButton loading={loading} label={view === "login" ? "Log In" : "Create Account"} loadingLabel={view === "login" ? "Logging in..." : "Creating account..."} />
            </form>
          )}

          {/* VERIFY OTP (signup) */}
          {view === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <Field label="Verification Code" icon={<KeyRound size={18} />}>
                <input inputMode="numeric" autoComplete="one-time-code" required maxLength={8} className={`${fieldClass} tracking-[0.35em] font-bold`} placeholder="00000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
              </Field>
              <SubmitButton loading={loading} label="Verify & Continue" loadingLabel="Verifying..." />
              <ResendRow onResend={() => handleSignup()} />
            </form>
          )}

          {/* FORGOT (request reset code) */}
          {view === "forgot" && (
            <form onSubmit={handleForgotRequest} className="space-y-4">
              <p className="text-sm text-gray-500 font-medium -mt-1">Enter your email and we'll send you a reset code.</p>
              <Field label="Email Address" icon={<Mail size={18} />}>
                <input type="email" autoComplete="email" required className={fieldClass} placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <SubmitButton loading={loading} label="Send Reset Code" loadingLabel="Sending..." />
            </form>
          )}

          {/* RESET (enter code + new password) */}
          {view === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <Field label="Reset Code" icon={<KeyRound size={18} />}>
                <input inputMode="numeric" autoComplete="one-time-code" required maxLength={8} className={`${fieldClass} tracking-[0.35em] font-bold`} placeholder="00000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
              </Field>
              <Field label="New Password" icon={<Lock size={18} />}>
                <input type="password" autoComplete="new-password" required className={fieldClass} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </Field>
              <SubmitButton loading={loading} label="Reset Password" loadingLabel="Updating..." />
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  action,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5 px-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
        {action}
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">{icon}</div>
        {children}
      </div>
    </div>
  );
}

function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex justify-center items-center gap-2 bg-[#4f46e5] hover:bg-[#3b32c0] py-4 rounded-full text-sm font-bold text-white shadow-lg shadow-indigo-600/10 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" /> {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

function ResendRow({ onResend }: { onResend: () => void }) {
  return (
    <p className="text-center text-xs text-gray-400 font-semibold">
      Didn't get a code?{" "}
      <button type="button" onClick={onResend} className="text-[#4f46e5] hover:text-[#3b32c0] font-bold">
        Resend
      </button>
    </p>
  );
}
