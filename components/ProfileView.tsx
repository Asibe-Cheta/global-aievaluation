import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Check, Trash2, LogOut,
  Trophy, Clock, Globe, ShieldAlert, Award, Camera, RefreshCw,
  Moon, Sun, Mail, Lock, Eye, EyeOff, Shield, MapPin, Briefcase
} from "lucide-react";
import { UserStats, Module } from "../types";
import { createClient } from "../lib/supabase/client";

interface ProfileViewProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  activeRank: string;
  overallReadiness: number;
  setActiveTab: (tab: string) => void;
  moduleCurriculum: Module[];
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

const PRESET_AVATARS = [
  { id: "avatar-1", label: "Quantum Purple", bg: "from-purple-500 to-indigo-600", initial: "QP" },
  { id: "avatar-2", label: "Neon Cyberpunk", bg: "from-pink-500 to-rose-600", initial: "NC" },
  { id: "avatar-3", label: "Emerald Analyst", bg: "from-emerald-400 to-teal-600", initial: "EA" },
  { id: "avatar-4", label: "Oceanic SFT Expert", bg: "from-cyan-400 to-blue-600", initial: "OS" },
  { id: "avatar-5", label: "Golden Aligner", bg: "from-amber-400 to-orange-600", initial: "GA" },
  { id: "avatar-6", label: "Zenith Slate", bg: "from-slate-700 to-slate-900", initial: "ZS" }
];

export default function ProfileView({
  stats,
  setStats,
  activeRank,
  overallReadiness,
  setActiveTab,
  moduleCurriculum,
  isDarkMode,
  setIsDarkMode
 }: ProfileViewProps) {
  const router = useRouter();

  // Local state for editing form
  const [nameInput, setNameInput] = useState(stats.displayName || "");
  const [roleInput, setRoleInput] = useState(stats.role || "");
  const [locationInput, setLocationInput] = useState(stats.location || "");
  const [timezoneInput, setTimezoneInput] = useState(stats.timezone || "");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account confirmation
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Default selected avatar or preset
  const selectedAvatar = PRESET_AVATARS.find(a => a.id === stats.avatarUrl) || PRESET_AVATARS[0];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setStats(prev => ({
      ...prev,
      displayName: nameInput,
      role: roleInput,
      location: locationInput,
      timezone: timezoneInput
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    const supabase = createClient();

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: stats.email!,
      password: currentPassword,
    });

    if (verifyError) {
      setIsChangingPassword(false);
      setPasswordError("Current password is incorrect.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsChangingPassword(false);

    if (updateError) {
      setPasswordError(updateError.message);
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleAvatarSelect = (avatarId: string) => {
    setStats(prev => ({
      ...prev,
      avatarUrl: avatarId
    }));
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteEmailConfirm !== stats.email) {
      alert("Email address does not match your active account.");
      return;
    }
    setIsDeleting(true);

    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete account");
      }
      setIsDeleting(false);
      setDeleteSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: any) {
      setIsDeleting(false);
      alert(err.message || "Failed to delete account");
    }
  };

  // Calculate completed stats
  const totalSyllabusLessons = moduleCurriculum.flatMap(m => m.lessons).length;
  const completedCount = stats.completedLessons.length;
  
  return (
    <div className="space-y-6 animate-fade-in pl-1">
      
      {/* 1. Profile Hero Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Visualizer */}
          <div className="relative group shrink-0">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${selectedAvatar.bg} flex items-center justify-center text-white text-3xl font-black shadow-md border-4 border-white dark:border-indigo-950 transition-transform duration-300 group-hover:scale-105`}>
              {selectedAvatar.initial}
            </div>
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" title="Online & Active"></div>
          </div>

          {/* User Status Details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.displayName || "Evaluator #3824"}
              </h2>
              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-750 dark:text-indigo-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Vetted Remote Agent
              </span>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeRank}</span>
              <span>&bull;</span>
              <span>Readiness Rating: <strong className="text-slate-800 dark:text-slate-200">{overallReadiness}%</strong></span>
              <span>&bull;</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Registered: Today</span>
            </p>

            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-slate-50 dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Total XP</span>
                <span className="text-xs font-black text-slate-900 dark:text-white mt-1 block">{stats.xp} XP</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Lessons Completed</span>
                <span className="text-xs font-black text-slate-900 dark:text-white mt-1 block">{completedCount} / {totalSyllabusLessons}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider leading-none">Exams Verified</span>
                <span className="text-xs font-black text-slate-900 dark:text-white mt-1 block">{stats.passedExams.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Customization Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Edit Details & Avatar Choice */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Name and Info Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="space-y-1 mb-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                Personal Profile Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your account details and directory listings.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-455 font-bold uppercase tracking-wider block" htmlFor="profile-name">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="profile-name"
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter display name..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      maxLength={30}
                      required
                    />
                  </div>
                </div>

                {/* Email (read-only: this is your real login identity) */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-455 font-bold uppercase tracking-wider block" htmlFor="profile-email">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="profile-email"
                      type="email"
                      value={stats.email || ""}
                      disabled
                      readOnly
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Role / Job Title */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-455 font-bold uppercase tracking-wider block" htmlFor="profile-role">
                    Job Title / Role
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      id="profile-role"
                      type="text"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      placeholder="Enter job role..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-455 font-bold uppercase tracking-wider block" htmlFor="profile-location">
                    Location
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      id="profile-location"
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="Enter location..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Timezone */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs text-slate-455 font-bold uppercase tracking-wider block" htmlFor="profile-timezone">
                    Timezone Preference
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Globe className="w-4 h-4" />
                    </span>
                    <input
                      id="profile-timezone"
                      type="text"
                      value={timezoneInput}
                      onChange={(e) => setTimezoneInput(e.target.value)}
                      placeholder="Enter timezone..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                <p className="text-[10px] text-slate-400 leading-normal">
                  Changes save to your account and sync across devices.
                </p>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                >
                  <Check className="w-4 h-4" />
                  Save Details
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl animate-fade-in">
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Profile credentials successfully updated and locked in!
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Password & Security Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="space-y-1 mb-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" />
                Password & Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Change your system password to protect remote access tokens.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-455 font-bold uppercase tracking-wider block" htmlFor="current-pw">
                    Current Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                    <input
                      id="current-pw"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-455 font-bold uppercase tracking-wider block" htmlFor="new-pw">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                    <input
                      id="new-pw"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 chars"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-455 font-bold uppercase tracking-wider block" htmlFor="confirm-pw">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                    <input
                      id="confirm-pw"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <p className="text-[11px] text-rose-600 dark:text-rose-405 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> {passwordError}
                </p>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl animate-fade-in">
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Password changed successfully and updated in your system parameters!
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Settings, Pacing, and Dangerous actions */}
        <div className="space-y-6">
          
          {/* Settings Control Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">System Preferences</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure how the simulator pacing and alerts behave.</p>
            </div>

            <div className="space-y-4">
              {/* Dark Visual Theme Toggle */}
              <div className="flex items-center justify-between gap-4 p-1">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {isDarkMode ? <Sun className="w-3.5 h-3.5 text-indigo-500" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
                    Dark Visual Theme
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-normal">
                    Toggle eye-safe low light visual simulator canvas.
                  </span>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                    isDarkMode ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-805"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? "translate-x-4" : "translate-x-0"}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>

          {/* Dangerous Operations Zone */}
          <div className="bg-rose-50/30 dark:bg-rose-950/5 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-450" />
                Destructive Account Area
              </h3>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 leading-relaxed">
                Permanently delete your account and wipe your completed syllabus achievements. This action is final and irreversible.
              </p>
            </div>

            {showConfirmReset ? (
              <div className="space-y-3 animate-fade-in">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/50 space-y-2">
                  <p className="text-[11px] text-rose-900 dark:text-rose-250 font-bold">
                    To authorize complete deletion of your account and files, type your active email address <span className="underline select-all">{stats.email}</span> below:
                  </p>
                  <input
                    type="email"
                    value={deleteEmailConfirm}
                    onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                    placeholder="Type email to confirm..."
                    className="w-full bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-900/60 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteEmailConfirm !== stats.email || isDeleting || deleteSuccess}
                    className={`flex-1 text-white font-bold p-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      deleteEmailConfirm === stats.email && !isDeleting && !deleteSuccess
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {isDeleting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : deleteSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Account Deleted
                      </>
                    ) : (
                      "Delete Account Permanently"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmReset(false);
                      setDeleteEmailConfirm("");
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete My Account
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
