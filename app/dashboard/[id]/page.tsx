"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CalendarClock, MessageSquare, LogOut, Clock, ClipboardList, Building2, ChevronDown, ChevronUp, Briefcase, CheckCircle2, Send, Users, ShieldAlert, X, AlertTriangle, History } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const HistoryCalendar = ({ tasks, onSelectDate, selectedDate }: { tasks: any[], onSelectDate: (date: string) => void, selectedDate: string }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const daysWithTasks = tasks.reduce((acc: any, t: any) => {
    acc[t.date] = (acc[t.date] || 0) + Number(t.price);
    return acc;
  }, {});

  return (
    <div className="p-4 bg-slate-950 rounded-xl border border-white/10 mb-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="text-slate-400 hover:text-white">&larr;</button>
        <span className="text-white font-bold capitalize">{currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="text-slate-400 hover:text-white">&rarr;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
          const hasTasks = daysWithTasks[dateStr];
          const isSelected = selectedDate === dateStr;

          return (
            <button 
              key={day} 
              onClick={() => onSelectDate(dateStr)} 
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors ${isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : hasTasks ? 'bg-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/30' : 'text-slate-300 hover:bg-white/10'}`}
            >
              {day}
              {hasTasks && !isSelected && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400"></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function EmployeeDashboard() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employer, setEmployer] = useState<any>(null);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [globalTasks, setGlobalTasks] = useState<any[]>([]);
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);
  
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState("");

  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, type: "danger"|"success", onConfirm: () => void} | null>(null);

  useEffect(() => {
    try {
      const currentStr = localStorage.getItem("currentUser");
      if (!currentStr) { router.push("/login"); return; }
      const parsedCurrent = JSON.parse(currentStr);
      
      if (parsedCurrent.id.toString() !== params.id || parsedCurrent.role !== "employee") { 
        localStorage.removeItem("currentUser"); router.push("/login"); return; 
      }
      
      const savedUsers = localStorage.getItem("registeredUsers");
      if (!savedUsers) { router.push("/login"); return; }
      
      const allUsers = JSON.parse(savedUsers);
      const latestUser = allUsers.find((u: any) => u.login === parsedCurrent.login);
      
      if (!latestUser) { localStorage.removeItem("currentUser"); router.push("/login"); return; }
      
      setCurrentUser(latestUser);
      localStorage.setItem("currentUser", JSON.stringify(latestUser));

      // Находим работодателя этого сотрудника
      if (latestUser.employerLogin) {
        const emp = allUsers.find((u: any) => u.login === latestUser.employerLogin);
        setEmployer(emp);
      }

      if (latestUser.status !== "blocked") {
        const savedTasks = localStorage.getItem("registeredTasks");
        if (savedTasks) {
          const allTasks = JSON.parse(savedTasks);
          
          const assigned = allTasks.filter((t: any) => 
            (t.assignedTo?.includes(latestUser.login) || (t.employerLogin === latestUser.employerLogin && !t.isPublic)) && 
            t.status !== "declined"
          );
          
          const publicOnes = allTasks.filter((t: any) => t.isPublic && t.status === "active");
          setMyTasks(assigned);
          setGlobalTasks(publicOnes);
        }
      }
      setIsLoading(false);
    } catch (e) { router.push("/login"); }
  }, [router, params.id]);

  const handleActionTask = (taskId: number, action: string) => {
    if (action === "cannot") {
      setConfirmDialog({
        isOpen: true, title: "Отказаться от задачи?",
        message: "Вы уверены, что не сможете выполнить эту задачу?",
        type: "danger", onConfirm: () => processAction(taskId, action)
      });
    } else if (action === "paid") {
      setConfirmDialog({
        isOpen: true, title: "Подтвердить получение?",
        message: "Вы подтверждаете, что получили денежные средства?",
        type: "success", onConfirm: () => processAction(taskId, action)
      });
    } else {
      processAction(taskId, action);
    }
  };

  const processAction = (taskId: number, action: string) => {
    const savedTasks = localStorage.getItem("registeredTasks");
    if (!savedTasks) return;
    let updated = JSON.parse(savedTasks);
    
    if (action === "grab") updated = updated.map((t: any) => t.id === taskId ? { ...t, assignedTo: [...(t.assignedTo || []), currentUser.login] } : t);
    else if (action === "cannot") updated = updated.map((t: any) => t.id === taskId ? { ...t, status: "declined" } : t);
    else if (action === "paid") updated = updated.map((t: any) => t.id === taskId ? { ...t, status: "paid" } : t);
    
    localStorage.setItem("registeredTasks", JSON.stringify(updated));
    
    const newAll = JSON.parse(localStorage.getItem("registeredTasks") || "[]");
    const assigned = newAll.filter((t: any) => 
      (t.assignedTo?.includes(currentUser.login) || (t.employerLogin === currentUser.employerLogin && !t.isPublic)) && 
      t.status !== "declined"
    );
    setMyTasks(assigned);
    setGlobalTasks(newAll.filter((t: any) => t.isPublic && t.status === "active"));
  };

  const openChat = () => {
    setChatModalOpen(true);
    const chatKey = `chat_${currentUser.employerLogin}_${currentUser.login}`;
    const saved = localStorage.getItem(chatKey);
    setChatMessages(saved ? JSON.parse(saved) : []);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const chatKey = `chat_${currentUser.employerLogin}_${currentUser.login}`;
    const newMsg = { sender: currentUser.login, text: chatMessage, time: Date.now() };
    const updated = [...chatMessages, newMsg];
    localStorage.setItem(chatKey, JSON.stringify(updated));
    setChatMessages(updated); setChatMessage("");
  };

  const handleLogout = () => { localStorage.removeItem("currentUser"); router.push("/login"); };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div></div>;
  if (!currentUser) return null;

  if (currentUser.status === "blocked") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 p-10 rounded-3xl max-w-md text-center">
          <ShieldAlert size={64} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">Доступ ограничен</h1>
          <p className="text-slate-400 mb-8">Работодатель <span className="font-bold text-white">{currentUser.employerName}</span> заблокировал вашу учетную запись.</p>
          <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl">Выйти</button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const historyTasks = myTasks.filter(t => t.status === "paid");
  const activeTasks = myTasks.filter(t => t.status !== "paid");
  
  const currentMonthEarned = historyTasks
    .filter(t => t.date.startsWith(currentMonthStr))
    .reduce((acc, t) => acc + Number(t.price), 0);

  const tasksOnSelectedDate = historyTasks.filter(t => t.date === historyDate);

  // Проверка онлайна работодателя
  const isEmployerOnline = employer?.lastSeen ? (Date.now() - employer.lastSeen) < 5 * 60 * 1000 : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <header className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">Личный кабинет</h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/30">ID: {currentUser.id}</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{currentUser.name}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"><LogOut size={16} /> Выйти</button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* ПЛАШКА БАЗЫ И ЧАТА */}
        {currentUser.employerName && (
          <div className="mb-8 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="text-blue-400" size={24} />
              <div>
                <p className="text-slate-300">Вы работаете в базе: <span className="font-bold text-white">{currentUser.employerName}</span></p>
                {employer && (
                  <p className="text-xs flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${isEmployerOnline ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                    <span className="text-slate-400">Работодатель: {employer.name} ({isEmployerOnline ? 'В сети' : 'Не в сети'})</span>
                  </p>
                )}
              </div>
            </div>
            <button onClick={openChat} className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <MessageSquare size={18}/> Чат с работодателем
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div 
            onClick={() => setStatsModalOpen(true)}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity"><Wallet size={80} /></div>
            <div className="flex items-center gap-3 mb-2 text-slate-400 relative z-10"><Wallet size={20} className="text-emerald-400" /><h2 className="text-sm font-medium">Заработано за месяц</h2></div>
            <p className="text-3xl font-bold text-white relative z-10">{currentMonthEarned} ₽</p>
            <p className="text-xs text-emerald-400 mt-2 relative z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">История &rarr;</p>
          </motion.div>
          
          <motion.div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-slate-400"><Clock size={20} className="text-blue-400" /><h2 className="text-sm font-medium">В ожидании оплаты</h2></div>
            <p className="text-3xl font-bold text-white">{activeTasks.filter(t => t.status === "completed").reduce((acc, t) => acc + Number(t.price), 0)} ₽</p>
          </motion.div>
          
          <motion.div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center">
             <p className="text-sm text-slate-400">Активных задач: <span className="text-white font-bold">{activeTasks.filter(t => t.status === "active").length}</span></p>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><CalendarClock size={24} className="text-emerald-400" /> Текущие задачи</h2>
            <div className="space-y-4">
              {activeTasks.length === 0 ? (
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center"><ClipboardList size={32} className="text-slate-500 mx-auto mb-2" /><p className="text-slate-400">Нет активных задач.</p></div>
              ) : activeTasks.map(task => (
                <div key={task.id} className={`bg-white/5 border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${task.status === 'completed' ? 'border-orange-500/30' : 'border-white/10'}`}>
                  <div>
                    <h3 className="font-bold text-white text-lg">{task.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{task.date} в {task.time} • {task.location}</p>
                    <div className="flex gap-2 mt-3">
                      {task.status === 'active' && <button onClick={() => handleActionTask(task.id, 'cannot')} className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20">Не смогу выполнить</button>}
                      {task.status === 'completed' && <button onClick={() => handleActionTask(task.id, 'paid')} className="text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg font-bold flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.3)]"><CheckCircle2 size={14}/> Средства получены</button>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400 text-lg">{task.price} ₽</p>
                    <span className={`text-xs px-2 py-1 rounded ${task.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {task.status === 'active' ? 'В работе' : 'Выполнено'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setIsGlobalOpen(!isGlobalOpen)} className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-3"><Briefcase size={20} className="text-purple-400" /><h2 className="text-lg font-bold text-white">Глобальные задачи</h2></div>
              {isGlobalOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
            <AnimatePresence>
              {isGlobalOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden pt-4 space-y-4">
                  {globalTasks.map(task => {
                    const hasResponded = task.assignedTo?.includes(currentUser.login);
                    return (
                      <div key={task.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-white">{task.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">{task.date} • {task.location}</p>
                          <p className="text-xs text-purple-400 mt-1 flex items-center gap-1"><Users size={12}/> Откликов: {task.applicants?.length || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400 mb-2">{task.price} ₽</p>
                          <button onClick={() => handleActionTask(task.id, 'grab')} disabled={hasResponded} className={`px-4 py-2 rounded-xl text-sm font-bold ${hasResponded ? 'bg-slate-800 text-slate-500' : 'bg-purple-500 hover:bg-purple-400 text-white'}`}>
                            {hasResponded ? "Вы откликнулись" : "Схватить"}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* МОДАЛКА ИСТОРИИ */}
      <AnimatePresence>
        {statsModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><History size={24} className="text-emerald-400"/> История заработка</h2>
                <button onClick={() => setStatsModalOpen(false)} className="text-slate-400"><X size={24}/></button>
              </div>
              <HistoryCalendar tasks={historyTasks} selectedDate={historyDate} onSelectDate={setHistoryDate} />
              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Задачи за {new Date(historyDate).toLocaleDateString('ru-RU')}:</h3>
                <div className="space-y-2">
                  {tasksOnSelectedDate.length === 0 ? (
                    <p className="text-slate-600 text-sm bg-slate-950 p-4 rounded-xl text-center border border-white/5">В этот день работы не было</p>
                  ) : (
                    tasksOnSelectedDate.map(t => (
                      <div key={t.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-white/5">
                        <div>
                          <p className="text-white text-sm font-bold">{t.title}</p>
                          <p className="text-xs text-slate-500">{t.location}</p>
                        </div>
                        <span className="text-emerald-400 font-bold">{t.price} ₽</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Окна подтверждения и чата */}
      <AnimatePresence>
        {confirmDialog?.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-white/10 text-center shadow-2xl">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmDialog.type === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                {confirmDialog.type === 'danger' ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{confirmDialog.title}</h3>
              <p className="text-sm text-slate-400 mb-6">{confirmDialog.message}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDialog(null)} className="flex-1 bg-slate-800 text-white font-bold py-2.5 rounded-xl">Отмена</button>
                <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className={`flex-1 font-bold py-2.5 rounded-xl ${confirmDialog.type === 'danger' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-slate-950'}`}>Да</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md p-0 rounded-2xl bg-slate-900 border border-white/10 flex flex-col h-[500px]">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
                <h2 className="font-bold text-white">Чат с работодателем</h2>
                <button onClick={() => setChatModalOpen(false)} className="text-slate-400"><X size={24} /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3">
                {chatMessages.length === 0 ? <p className="text-center text-xs text-slate-500 mt-auto mb-auto">Нет сообщений</p> : 
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === currentUser.login ? "bg-emerald-600 text-white self-end rounded-tr-none" : "bg-slate-800 text-slate-200 self-start rounded-tl-none"}`}>{msg.text}</div>
                  ))
                }
              </div>
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2">
                <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Сообщение..." className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                <button type="submit" className="bg-emerald-500 p-2 rounded-xl text-slate-950 hover:bg-emerald-400"><Send size={18}/></button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}