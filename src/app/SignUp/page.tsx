"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useRouter } from "next/navigation";
import { firebaseConfig } from "../../firebaseConfig";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Save name and level to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), { name, level: 1 });
      setSuccess(true);
      setTimeout(() => router.push("/Login"), 1200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0f2027] via-[#2c5364] to-[#232526] font-sans">
      <div className="w-full max-w-md border-4 border-[#3a3f5a] rounded-3xl p-0 bg-[#1a2233] shadow-2xl relative flex flex-col items-center">
        {/* Header Section */}
        <div className="w-full flex flex-col items-center bg-gradient-to-r from-[#232526] to-[#2c5364] rounded-t-2xl pt-8 pb-4 shadow-md">
          <div className="text-6xl mb-2 select-none drop-shadow-lg">🌌</div>
          <h1 className="text-3xl font-extrabold tracking-widest text-[#aeefff] mb-1" style={{fontFamily: 'Orbitron, sans-serif'}}>Create Account</h1>
          <p className="text-[#aeefff] text-center font-semibold tracking-wide text-base">Join your cosmic pet world</p>
        </div>
        {/* Form Section */}
        <form className="w-full px-8 py-6 flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#aeefff] mb-1">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="block w-full px-3 py-2 border-2 border-[#3a3f5a] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#aeefff] focus:border-[#aeefff] bg-[#232526] text-[#aeefff] font-semibold transition-all duration-200" placeholder="Enter your name" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#aeefff] mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full px-3 py-2 border-2 border-[#3a3f5a] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#aeefff] focus:border-[#aeefff] bg-[#232526] text-[#aeefff] font-semibold transition-all duration-200" placeholder="Enter your email" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#aeefff] mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full px-3 py-2 border-2 border-[#3a3f5a] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#aeefff] focus:border-[#aeefff] bg-[#232526] text-[#aeefff] font-semibold transition-all duration-200" placeholder="Enter your password" required />
          </div>
          {error && <div className="text-red-400 text-sm text-center font-semibold bg-[#2c5364]/40 rounded-md py-2">{error}</div>}
          {success && (
            <div className="text-green-400 text-sm text-center font-semibold bg-[#185a9d]/30 rounded-md py-2">
              Account created! Redirecting to <span className="underline text-blue-300">login</span>...
            </div>
          )}
          <button type="submit" className="w-full bg-gradient-to-r from-[#43cea2] to-[#185a9d] text-white py-2 rounded-lg font-bold text-lg hover:from-[#185a9d] hover:to-[#43cea2] transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-[#aeefff] disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
        </form>
        {/* Divider */}
        <div className="w-full flex items-center px-8 mb-4">
          <div className="flex-grow border-t border-[#3a3f5a]" />
          <span className="mx-3 text-[#aeefff] text-xs font-semibold">or</span>
          <div className="flex-grow border-t border-[#3a3f5a]" />
        </div>
        {/* Footer Link */}
        <p className="mb-6 text-center text-sm text-[#aeefff]">Already have an account? <a href="/Login" className="text-[#43cea2] hover:underline font-bold">Login</a></p>
      </div>
    </div>
  );
}
