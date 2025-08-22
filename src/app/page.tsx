'use client';

import PetDisplay from "../components/PetDisplay";
import PetChat from "../components/PetChat";
import PetActions from "../components/PetActions";
import MiniGames from "../components/MiniGames";
import Journal from "../components/Journal";
import { redirect } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState, useCallback } from "react";
import { firebaseConfig } from "../firebaseConfig";
import { initializeApp } from "firebase/app";
import Playlist from "../components/Playlist";
import PetLevel from "../components/PetLevel";
import DailyJournal from "../components/DailyJournal";
import AIChat from "../components/AIChat";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// User profile interface
interface UserProfile {
  name: string;
  level: number;
  email: string;
  uid: string;
  solvedProblems?: string[];
  totalXP?: number;
}

// Save user profile to Firestore with better error handling
async function saveUserProfileToFirestore(uid: string, profileData: Partial<UserProfile>) {
  try {
    console.log('Saving user profile:', { uid, ...profileData });
    
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('User profile saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
}

// Update specific fields in Firestore
async function updateUserField(uid: string, field: string, value: any) {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      [field]: value,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    return false;
  }
}

export default function Page() {
  // --- State management ---
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<'home' | 'playlist' | 'journal'>('home');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Calculate level and XP from solved problems
  const calculateLevelAndXP = useCallback((solvedCount: number) => {
    const level = Math.floor(solvedCount / 5) + 1;
    const xp = solvedCount % 5;
    return { level, xp };
  }, []);

  // Handler to sync solved problems from Playlist
  const handleSolvedChange = useCallback(async (solved: string[]) => {
    setSolvedProblems(solved);
    
    if (!userProfile) return;

    const { level: newLevel } = calculateLevelAndXP(solved.length);
    
    // Update Firestore with new solved problems and level if changed
    if (newLevel !== userProfile.level || solved.length !== (userProfile.solvedProblems?.length || 0)) {
      const success = await saveUserProfileToFirestore(userProfile.uid, {
        solvedProblems: solved,
        level: newLevel,
        totalXP: solved.length
      });

      if (success) {
        setUserProfile(prev => prev ? {
          ...prev,
          level: newLevel,
          solvedProblems: solved,
          totalXP: solved.length
        } : null);
      }
    }
  }, [userProfile, calculateLevelAndXP]);

  // Authentication and user profile loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      
      if (!user) {
        setAuthChecked(true);
        setIsLoading(false);
        if (typeof window !== 'undefined') {
          redirect("/Login");
        }
        return;
      }

      try {
        console.log('User authenticated:', user.uid);
        
        // Fetch user profile from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let profile: UserProfile;
        
        if (userDocSnap.exists()) {
          console.log('User document exists:', userDocSnap.data());
          const data = userDocSnap.data();
          
          profile = {
            name: data.name || user.displayName || "User",
            level: data.level || 1,
            email: data.email || user.email || "",
            uid: user.uid,
            solvedProblems: data.solvedProblems || [],
            totalXP: data.totalXP || 0
          };
        } else {
          console.log('Creating new user profile');
          // Create new profile
          profile = { 
            name: user.displayName || "User", 
            level: 1, 
            email: user.email || "", 
            uid: user.uid,
            solvedProblems: [],
            totalXP: 0
          };
          
          // Save the new profile
          await saveUserProfileToFirestore(user.uid, profile);
        }
        
        console.log('Setting user profile:', profile);
        setUserProfile(profile);
        setSolvedProblems(profile.solvedProblems || []);
        
      } catch (error) {
        console.error('Error fetching/creating user profile:', error);
        
        // Fallback profile
        const fallbackProfile: UserProfile = { 
          name: user.displayName || "User", 
          level: 1, 
          email: user.email || "", 
          uid: user.uid,
          solvedProblems: [],
          totalXP: 0
        };
        setUserProfile(fallbackProfile);
        setSolvedProblems([]);
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (typeof window !== 'undefined') {
        window.location.href = '/Login';
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Render main section based on active tab
  const renderMainSection = () => {
    if (activeSection === 'playlist') {
      return (
        <>
          <section className="w-full max-w-2xl mx-auto mt-6">
            <AIChat />
          </section>
          <section className="w-full max-w-2xl mx-auto mt-6">
            <Playlist onSolvedChange={handleSolvedChange} />
          </section>
        </>
      );
    }
    
    if (activeSection === 'journal') {
      return (
        <>
          <section className="w-full max-w-2xl mx-auto mt-6">
            <Journal />
          </section>
          <section className="w-full max-w-2xl mx-auto mt-4 flex flex-col items-center">
            <Calendar
              onChange={date => setSelectedDate(date as Date)}
              value={selectedDate}
              className="bg-[#181e2a] rounded-xl border border-[#232536]/60 text-[#7fd7ff] shadow-md p-2"
              tileClassName={({ view }) =>
                view === 'month' ? 'hover:bg-[#232536] rounded-lg transition-colors' : ''
              }
            />
            <span className="mt-2 text-xs text-[#7fd7ff]/70">Select a date to revisit your journal notes.</span>
          </section>
        </>
      );
    }
    
    // Home section
    return (
      <section aria-label="Pet Display" className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-2xl bg-[#181e2a] rounded-3xl shadow-lg border border-[#232536]/60 p-6 relative flex flex-col items-center">
          <PetDisplay />
        </div>
      </section>
    );
  };

  // Show loading screen while authentication is being resolved
  if (isLoading || !authChecked) {
    return (
      <main className="flex flex-col min-h-screen font-sans bg-black text-[#b6eaff] relative overflow-x-hidden">
        <div className="flex items-center justify-center h-screen">
          <div className="text-[#43cea2] text-xl animate-pulse">Loading...</div>
        </div>
      </main>
    );
  }

  // If no user profile, show error
  if (!userProfile) {
    return (
      <main className="flex flex-col min-h-screen font-sans bg-black text-[#b6eaff] relative overflow-x-hidden">
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-400 text-xl">Error loading user profile</div>
        </div>
      </main>
    );
  }

  const { level, xp } = calculateLevelAndXP(solvedProblems.length);

  return (
    <main className="flex flex-col min-h-screen font-sans bg-black text-[#b6eaff] relative overflow-x-hidden">
      {/* AMOLED Cosmic background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0 opacity-20">
          <defs>
            <radialGradient id="star" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#43cea2" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[...Array(40)].map((_, i) => (
            <circle 
              key={i} 
              cx={Math.random() * 1600} 
              cy={Math.random() * 900} 
              r={Math.random() * 2 + 0.5} 
              fill="url(#star)" 
            />
          ))}
        </svg>
      </div>

      {/* Top Bar with Level and User Info */}
      <div className="h-8" />
      <header className="sticky top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-xl px-4">
        <div className="flex items-center bg-[#0a0a0a] rounded-full shadow-2xl border border-[#232536]/80 py-2 px-4 gap-2 backdrop-blur-xl">
          {/* Logo */}
          <span className="flex-1 text-[#43cea2] text-lg font-bold tracking-widest drop-shadow-glow flex items-center justify-start" 
                style={{letterSpacing: '0.18em', textShadow: '0 0 8px #43cea2, 0 0 1px #fff'}}>
            <svg width="28" height="28" viewBox="0 0 32 32" className="inline-block mr-2 align-middle">
              <circle cx="16" cy="16" r="14" fill="#232536" stroke="#43cea2" strokeWidth="2" />
              <circle cx="16" cy="16" r="7" fill="#43cea2" opacity="0.3" />
            </svg>
            ASTROPET
          </span>
          
          {/* Level Display */}
          <div className="flex-1 flex justify-center items-center">
            <PetLevel level={level} xp={xp} />
          </div>
          
          {/* User Info and Logout */}
          <div className="flex-1 flex justify-end items-center gap-2">
            <span className="text-[#b6eaff] text-sm font-semibold bg-[#10131a] px-3 py-1 rounded-lg flex items-center gap-2 border border-[#232536]/60 shadow-glow">
              <span className="text-base">👤</span>
              <span className="hidden sm:inline">{userProfile.name}</span>
            </span>
            <button 
              className="text-[#43cea2] hover:text-[#b6eaff] text-lg px-2 py-1 rounded-full bg-[#10131a] hover:bg-[#232536] border border-[#232536]/60 transition-colors shadow-glow" 
              title="Logout" 
              onClick={handleLogout}
            >
              <span>⎋ Logout</span>
            </button>
          </div>
        </div>
      </header>
      <div className="h-4" />

      {/* Main Section */}
      {renderMainSection()}

      {/* Bottom Navigation */}
      <nav aria-label="Main Navigation" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
        <div className="flex justify-between items-center bg-[#0a0a0a] rounded-full shadow-2xl border border-[#232536]/80 py-2 px-4 gap-2 backdrop-blur-xl">
          <button
            className={`flex flex-col items-center flex-1 group py-2 px-1 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#43cea2] ${
              activeSection === 'home' 
                ? 'bg-[#10131a] border border-[#43cea2]/40 shadow-glow' 
                : 'hover:bg-[#181e2a]'
            }`}
            onClick={() => setActiveSection('home')}
            aria-current={activeSection === 'home' ? 'page' : undefined}
          >
            <span className={`text-xs font-semibold tracking-wide ${
              activeSection === 'home' 
                ? 'text-[#43cea2] drop-shadow-glow' 
                : 'text-[#b6eaff] group-hover:text-[#43cea2]'
            }`}>
              Home
            </span>
          </button>
          
          <div className="w-0.5 h-8 bg-[#232536]/60 rounded-full mx-2" />
          
          <button
            className={`flex flex-col items-center flex-1 group py-2 px-1 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#43cea2] ${
              activeSection === 'playlist' 
                ? 'bg-[#10131a] border border-[#43cea2]/40 shadow-glow' 
                : 'hover:bg-[#181e2a]'
            }`}
            onClick={() => setActiveSection('playlist')}
            aria-current={activeSection === 'playlist' ? 'page' : undefined}
          >
            <span className={`text-xs font-semibold tracking-wide ${
              activeSection === 'playlist' 
                ? 'text-[#43cea2] drop-shadow-glow' 
                : 'text-[#b6eaff] group-hover:text-[#43cea2]'
            }`}>
              Questions
            </span>
          </button>
          
          <div className="w-0.5 h-8 bg-[#232536]/60 rounded-full mx-2" />
          
          <button
            className={`flex flex-col items-center flex-1 group py-2 px-1 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#43cea2] ${
              activeSection === 'journal' 
                ? 'bg-[#10131a] border border-[#43cea2]/40 shadow-glow' 
                : 'hover:bg-[#181e2a]'
            }`}
            onClick={() => setActiveSection('journal')}
            aria-current={activeSection === 'journal' ? 'page' : undefined}
          >
            <span className={`text-xs font-semibold tracking-wide ${
              activeSection === 'journal' 
                ? 'text-[#43cea2] drop-shadow-glow' 
                : 'text-[#b6eaff] group-hover:text-[#43cea2]'
            }`}>
              Journal
            </span>
          </button>
        </div>
      </nav>
    </main>
  );
}