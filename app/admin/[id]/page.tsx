"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, UserPlus, LogOut, Briefcase, User, Pencil, X, Check, ShieldAlert, Trash2, Lock, Unlock, Dices, CalendarPlus, Ban } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

type UserType = {
  id: number;
  name: string;
  login: string;
  password: string;
  role: "admin" | "employer" | "employee";
  status: "active" | "blocked";
  lastSeen?: number;
  subscriptionEnd?: number;
};

function AdminContent() {
  const router = useRouter();
  const params = useParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "employer" | "employee">("employee");
  const [customId, setCustomId] = useState<number | string>("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const currentUserStr = localStorage.getItem("currentUser");
      if (!currentUserStr) { router.push("/login"); return; }
      const parsedUser = JSON.parse(currentUserStr);
      if (parsedUser.id.toString() !== params.id || parsedUser.role !== "admin") { 
        localStorage.removeItem("currentUser"); router.push("/login"); return; 
      }
      setCurrentUser(parsedUser);
      setIsAuthorized(true);
      
      const savedUsers = localStorage.getItem("registeredUsers");
      if (savedUsers) {
        const loadedUsers = JSON.parse(savedUsers).map((u: any) => ({ ...u, status: u.status || "active" }));
        setUsers(loadedUsers);
      }
      setIsLoading(false);
    } catch (e) { router.push("/login"); }
  }, [router, params.id]);

  const saveUsers = (newUsers: UserType[]) => {
    setUsers(newUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(newUsers));
  };

  const generateRandomId = () => { setCustomId(Math.floor(100000 + Math.random() * 900000)); };

  const handleGiveSubscription = (userId: number) => {
    const newEnd = Date.now() + 30 * 24 * 60 * 60 * 1000;
    saveUsers(users.map(u => u.id === userId ? { ...u, subscriptionEnd: newEnd } : u));
    alert("Подписка на 30 дней успешно выдана!");
  };

  const handleRevokeSubscription = (userId: number) => {
    if (confirm("Вы уверены, что хотите ОТКЛЮЧИТЬ подписку этому работодателю?")) {
      saveUsers(users.map(u => u.id === userId ? { ...u, subscriptionEnd: 0 } : u));
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !login || !password || !customId) return;
    if (users.some(u => u.id.toString() === customId.toString() && u.id !== editingId)) { alert("Этот ID уже занят!"); return; }

    if (editingId !== null) {
      const updatedUsers = users.map(u => u.id === editingId ? { ...u, id: Number(customId), name, login, password, role } : u);
      saveUsers(updatedUsers);
      if (currentUser.login === users.find(u => u.id === editingId)?.login) {
        localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, id: Number(customId), name, login, password, role }));
        router.replace(`/admin/${customId}`);
      }
    } else {
      const newUser: UserType = { id: Number(customId), name, login, password, role, status: "active" };
      saveUsers([newUser, ...users]);
    }
    closeForm();
  };

  const handleEditClick = (user: UserType) => {
    setEditingId(user.id); setName(user.name); setLogin(user.login); setPassword(user.password); setRole(user.role); setCustomId(user.id); setIsFormOpen(true);
  };

  const handleDelete = (id: number, userLogin: string) => {
    if (userLogin === currentUser.login) { alert("Вы не можете удалить самого себя!"); return; }
    if (confirm("Удалить пользователя навсегда?")) saveUsers(users.filter(u => u.id !== id));
  };

  const handleToggleBlock = (id: number, userLogin: string, currentStatus: string) => {
    if (userLogin === currentUser.login) { alert("Вы не можете заблокировать самого себя!"); return; }
    saveUsers(users.map(u => u.id === id ? { ...u, status: currentStatus === "active" ? "blocked" : "active" } : u));
  };

  const closeForm = () => { setName(""); setLogin(""); setPassword(""); setRole("employee"); setCustomId(""); setEditingId(null); setIsFormOpen(false); };
  const handleLogout = () => { localStorage.removeItem("currentUser"); router.push("/login"); };

  const checkIsOnline = (lastSeen?: number) => lastSeen ? (Date.now() - lastSeen) < 5 * 60 * 1000 : false;
  const formatTime = (lastSeen?: number) => lastSeen ? new Date(lastSeen).toLocaleString("ru-RU", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : "Никогда";

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>;
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <header className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Управление системой</h1>
            <span className="bg-purple-500/20 text-purple-400 text-xs px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-1"><ShieldCheck size={14} /> ID: {currentUser.id}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"><LogOut size={16} /> Выйти</button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Все пользователи</h2>
              <p className="text-sm text-slate-400 mt-1">Управляйте доступами, ID и подписками</p>
            </div>
            <button onClick={() => { closeForm(); generateRandomId(); setIsFormOpen(true); }} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2"><UserPlus size={18} /> Добавить</button>
          </div>

          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {users.map((user) => {
                const online = checkIsOnline(user.lastSeen);
                const subActive = user.subscriptionEnd && user.subscriptionEnd > Date.now();
                return (
                  <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${user.status === "blocked" ? "opacity-60 bg-red-950/10" : "hover:bg-white/5"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${user.status === "blocked" ? "bg-slate-800 text-slate-500" : user.role === "admin" ? "bg-purple-500/20 text-purple-400" : user.role === "employer" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                        {user.role === "admin" ? <ShieldAlert size={20} /> : user.role === "employer" ? <Briefcase size={20} /> : <User size={20} />}
                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-slate-900 rounded-full ${online ? "bg-emerald-500" : "bg-slate-500"}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white flex flex-wrap items-center gap-2">
                          {user.name} 
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono border border-white/10">ID: {user.id}</span>
                          {user.role === "admin" && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Это вы</span>}
                          {user.status === "blocked" && <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded">Заблокирован</span>}
                          
                          {user.role === "employer" && (
                            <span className={`text-[10px] px-2 py-0.5 rounded border ${subActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                              {subActive ? `Подписка до ${new Date(user.subscriptionEnd!).toLocaleDateString('ru-RU')}` : 'Нет подписки'}
                            </span>
                          )}
                        </h3>
                        <div className="text-sm text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span>Логин: <span className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">{user.login}</span></span>
                          <span className="hidden md:inline">•</span>
                          <span>Пароль: <span className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">{user.password}</span></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {user.role === "employer" && (
                        <>
                          {subActive ? (
                            <button onClick={() => handleRevokeSubscription(user.id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10" title="Отключить подписку">
                              <Ban size={18} />
                            </button>
                          ) : (
                            <button onClick={() => handleGiveSubscription(user.id)} className="text-slate-400 hover:text-emerald-400 p-2 rounded-lg hover:bg-emerald-500/10" title="Выдать подписку на 30 дней">
                              <CalendarPlus size={18} />
                            </button>
                          )}
                        </>
                      )}
                      
                      <button onClick={() => handleEditClick(user)} className="text-slate-400 hover:text-amber-400 p-2 rounded-lg hover:bg-amber-500/10" title="Редактировать"><Pencil size={18} /></button>
                      <button onClick={() => handleToggleBlock(user.id, user.login, user.status)} className={`p-2 rounded-lg ${user.status === "active" ? "text-slate-400 hover:text-orange-400" : "text-red-400 hover:text-emerald-400"}`} title={user.status === "active" ? "Заблокировать" : "Разблокировать"}>{user.status === "active" ? <Lock size={18} /> : <Unlock size={18} />}</button>
                      <button onClick={() => handleDelete(user.id, user.login)} className="text-slate-400 hover:text-red-400 p-2 rounded-lg" title="Удалить"><Trash2 size={18} /></button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/10">
              <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white">{editingId ? 'Редактирование' : 'Новый аккаунт'}</h2><button onClick={closeForm}><X size={24} className="text-slate-400"/></button></div>
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Уникальный ID</label>
                  <div className="flex gap-2">
                    <input type="number" value={customId} onChange={(e) => setCustomId(e.target.value)} placeholder="ID" className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-purple-500 outline-none" required />
                    <button type="button" onClick={generateRandomId} className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 p-3 rounded-xl transition-colors"><Dices size={20} /></button>
                  </div>
                </div>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-purple-500 outline-none" required />
                <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Логин" className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-purple-500 outline-none" required />
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-purple-500 outline-none" required />
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setRole("employee")} className={`py-2 rounded-lg text-xs border ${role === "employee" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-slate-950 border-white/10 text-slate-400"}`}>Работник</button>
                  <button type="button" onClick={() => setRole("employer")} className={`py-2 rounded-lg text-xs border ${role === "employer" ? "bg-blue-500/20 border-blue-500 text-blue-400" : "bg-slate-950 border-white/10 text-slate-400"}`}>Работодатель</button>
                  <button type="button" onClick={() => setRole("admin")} className={`py-2 rounded-lg text-xs border ${role === "admin" ? "bg-purple-500/20 border-purple-500 text-purple-400" : "bg-slate-950 border-white/10 text-slate-400"}`}>Админ</button>
                </div>
                <button type="submit" className={`w-full font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2 ${editingId ? "bg-amber-500 text-slate-950" : "bg-emerald-500 text-slate-950"}`}>{editingId ? <><Check size={20}/> Сохранить</> : "Создать"}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
      <AdminContent />
    </Suspense>
  );
}