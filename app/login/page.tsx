"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Lock, User, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const savedUsers = localStorage.getItem("registeredUsers");
    const users = savedUsers ? JSON.parse(savedUsers) : [
      { id: 1, login: "admin", password: "admin", role: "admin", name: "Главный Админ", status: "active" },
      { id: 2, login: "boss", password: "123", role: "employer", name: "Иван Петров", status: "active" },
      { id: 3, login: "worker", password: "123", role: "employee", name: "Мария Иванова", status: "active" },
    ];

    const foundUser = users.find((u: any) => u.login === login && u.password === password);

    if (foundUser) {
      if (foundUser.status === "blocked") {
        setError("Ваш аккаунт заблокирован.");
        return;
      }

      const updatedUsers = users.map((u: any) => 
        u.login === foundUser.login ? { ...u, lastSeen: Date.now() } : u
      );
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
      
      const currentUser = { ...foundUser, lastSeen: Date.now() };
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      
      // ПЕРЕНАПРАВЛЕНИЕ НА УНИКАЛЬНУЮ ССЫЛКУ
      if (foundUser.role === "admin") router.push(`/admin/${foundUser.id}`);
      else if (foundUser.role === "employer") router.push(`/employer/${foundUser.id}`);
      else router.push(`/dashboard/${foundUser.id}`);
    } else {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20">
        <ArrowLeft size={20} /> На главную
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="text-emerald-500 fill-emerald-500" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">Вход в систему</h1>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm rounded-lg text-center">{error}</div>}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Логин</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
              <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Введите логин" className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-emerald-500/50" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-emerald-500/50" required />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-2">Войти</button>
        </form>
      </motion.div>
    </div>
  );
}