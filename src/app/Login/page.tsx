'use client';

import { useState } from "react";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useRouter } from "next/navigation";
import { firebaseConfig } from "../../firebaseConfig";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Page() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0f2027] via-[#2c5364] to-[#232526] font-sans">
            <div className="w-full max-w-sm border-4 border-[#3a3f5a] rounded-2xl p-6 bg-[#1a2233] shadow-2xl relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl select-none">🪐</div>
                <h1 className="text-2xl text-center font-bold mb-2 tracking-widest text-[#aeefff]" style={{fontFamily: 'Orbitron, sans-serif'}}>Welcome Back!</h1>
                <p className="text-[#aeefff] mb-6 text-center font-semibold tracking-wide">Log in to your cosmic pet world</p>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-bold text-[#aeefff]">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border-2 border-[#3a3f5a] rounded-md shadow-sm focus:outline-none focus:ring-[#aeefff] focus:border-[#aeefff] bg-[#232526] text-[#aeefff] font-semibold" placeholder="Enter your email" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#aeefff]">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border-2 border-[#3a3f5a] rounded-md shadow-sm focus:outline-none focus:ring-[#aeefff] focus:border-[#aeefff] bg-[#232526] text-[#aeefff] font-semibold" placeholder="Enter your password" required />
                    </div>
                    {error && <div className="text-red-400 text-sm text-center">{error}</div>}
                    <button type="submit" className="w-full bg-gradient-to-r from-[#43cea2] to-[#185a9d] text-white py-2 rounded-md font-bold text-lg hover:from-[#185a9d] hover:to-[#43cea2] transition-colors shadow-md" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
                </form>
                <p className="mt-6 text-center text-sm text-[#aeefff]">Don&apos;t have an account? <a href="/SignUp" className="text-[#43cea2] hover:underline font-bold">Sign Up</a></p>
            </div>
        </div>
    );
}