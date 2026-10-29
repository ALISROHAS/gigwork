"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Users, ListTodo, LogOut, Plus, UserCircle2, X, Check, Building2, Trash2, Lock, Unlock, MessageSquare, Send, Phone, SendIcon, AlertTriangle, Edit, Calendar, Clock, History, CreditCard, ShieldCheck } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const CustomDatePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  useEffect(() => { if (value) setCurrentMonth(new Date(value)); }, [value]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const handleDateSelect = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(d.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)} className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white text-sm cursor-pointer flex items-center hover:border-purple-500 transition-colors">
        <Calendar className="absolute left-3 top-3.5 text-slate-500" size={18} />
        {value ? new Date(value).toLocaleDateString('ru-RU') : <span className="text-slate-500">Выберите дату</span>}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute z-50 top-full mt-2 w-64 p-4 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="text-slate-400 hover:text-white">&larr;</button>
              <span className="text-white font-bold capitalize">{currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</span>
              <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="text-slate-400 hover:text-white">&rarr;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
              {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = value === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                return (
                  <button key={day} type="button" onClick={() => handleDateSelect(day)} className={`p-1.5 rounded-lg text-sm transition-colors ${isSelected ? 'bg-purple-500 text-white font-bold' : 'text-slate-200 hover:bg-white/10'}`}>
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomTimePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const handleSelect = (h: string, m: string) => {
    onChange(`${h}:${m}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)} className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white text-sm cursor-pointer flex items-center hover:border-purple-500 transition-colors">
        <Clock className="absolute left-3 top-3.5 text-slate-500" size={18} />
        {value ? value : <span className="text-slate-500">Выберите время</span>}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute z-50 top-full mt-2 w-48 p-2 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl flex gap-2">
            <div className="flex-1 h-48 overflow-y-auto pr-1">
              {hours.map(h => (
                <button key={`h-${h}`} type="button" onClick={() => handleSelect(h, value.split(':')[1] || '00')} className={`w-full text-center py-1.5 rounded-lg text-sm mb-1 ${value.startsWith(h) ? 'bg-purple-500 text-white' : 'text-slate-300 hover:bg-white/10'}`}>{h}</button>
              ))}
            </div>
            <div className="flex-1 h-48 overflow-y-auto pr-1">
              {minutes.map(m => (
                <button key={`m-${m}`} type="button" onClick={() => handleSelect(value.split(':')[0] || '12', m)} className={`w-full text-center py-1.5 rounded-lg text-sm mb-1 ${value.endsWith(m) ? 'bg-purple-500 text-white' : 'text-slate-300 hover:bg-white/10'}`}>{m}</button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors ${isSelected ? 'bg-amber-500 text-slate-950 font-bold' : hasTasks ? 'bg-amber-500/20 text-amber-400 font-bold hover:bg-amber-500/30' : 'text-slate-300 hover:bg-white/10'}`}
            >
              {day}
              {hasTasks && !isSelected && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400"></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function EmployerDashboard() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [baseName, setBaseName] = useState("");
  const [isEditingBase, setIsEditingBase] = useState(false);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [applicantsModalTask, setApplicantsModalTask] = useState<any>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [chatModalUser, setChatModalUser] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState("");

  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskPrice, setTaskPrice] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskLocation, setTaskLocation] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskIsPublic, setTaskIsPublic] = useState(true);
  const [taskRequiredPeople, setTaskRequiredPeople] = useState(1);
  const [taskAssignedTo, setTaskAssignedTo] = useState<string[]>([]);

  const [empName, setEmpName] = useState("");
  const [empLogin, setEmpLogin] = useState("");
  const [empPassword, setEmpPassword] = useState("");

  useEffect(() => {
    try {
      const currentStr = localStorage.getItem("currentUser");
      if (!currentStr) { router.push("/login"); return; }
      const parsedCurrent = JSON.parse(currentStr);
      
      if (parsedCurrent.id.toString() !== params.id || parsedCurrent.role !== "employer") { 
        localStorage.removeItem("currentUser"); router.push("/login"); return; 
      }
      
      const savedUsers = localStorage.getItem("registeredUsers");
      if (!savedUsers) { router.push("/login"); return; }
      
      const allUsers = JSON.parse(savedUsers);
      const latestUser = allUsers.find((u: any) => u.login === parsedCurrent.login);
      
      if (!latestUser) { localStorage.removeItem("currentUser"); router.push("/login"); return; }
      
      setCurrentUser(latestUser);
      localStorage.setItem("currentUser", JSON.stringify(latestUser));

      const savedBase = localStorage.getItem(`base_${latestUser.login}`);
      if (savedBase) setBaseName(savedBase);

      const savedTasks = localStorage.getItem("registeredTasks");
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks).filter((t: any) => t.employerLogin === latestUser.login));
      }
      setEmployees(allUsers.filter((u: any) => u.employerLogin === latestUser.login && u.role === "employee"));
      
      setIsLoading(false);
    } catch (e) { router.push("/login"); }
  }, [router, params.id]);

  const handlePaySubscription = () => {
    // ЗДЕСЬ ПОЗЖЕ БУДЕТ РЕАЛЬНЫЙ ВЫЗОВ ROBOKASSA
    // Пока что имитируем успешную оплату
    const newEnd = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const updatedUser = { ...currentUser, subscriptionEnd: newEnd };
    
    const savedUsers = localStorage.getItem("registeredUsers");
    if (savedUsers) {
      const allUsers = JSON.parse(savedUsers);
      const updated = allUsers.map((u: any) => u.login === currentUser.login ? updatedUser : u);
      localStorage.setItem("registeredUsers", JSON.stringify(updated));
    }
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const handleSaveBase = () => { 
    localStorage.setItem(`base_${currentUser.login}`, baseName); 
    
    const savedUsers = localStorage.getItem("registeredUsers");
    if (savedUsers) {
      const allUsers = JSON.parse(savedUsers);
      const updated = allUsers.map((u: any) => 
        u.employerLogin === currentUser.login ? { ...u, employerName: baseName } : u
      );
      localStorage.setItem("registeredUsers", JSON.stringify(updated));
    }
    setIsEditingBase(false); 
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDate || !taskTime) { alert("Выберите дату и время!"); return; }
    
    const finalIsPublic = taskAssignedTo.length > 0 ? false : taskIsPublic;

    if (editingTaskId) {
      const savedTasks = localStorage.getItem("registeredTasks");
      if (!savedTasks) return;
      const allTasks = JSON.parse(savedTasks);
      
      const updatedTasks = allTasks.map((t: any) => {
        if (t.id === editingTaskId) {
          return { ...t, title: taskTitle, price: taskPrice, date: taskDate, time: taskTime, location: taskLocation, description: taskDesc, isPublic: finalIsPublic, requiredPeople: taskRequiredPeople, assignedTo: taskAssignedTo, status: "active" };
        }
        return t;
      });
      localStorage.setItem("registeredTasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks.filter((t: any) => t.employerLogin === currentUser.login));
    } else {
      const newTask = { id: Date.now(), title: taskTitle, price: taskPrice, date: taskDate, time: taskTime, location: taskLocation, description: taskDesc, isPublic: finalIsPublic, requiredPeople: taskRequiredPeople, assignedTo: taskAssignedTo, employerLogin: currentUser.login, employerName: baseName || currentUser.name, status: "active", applicants: [] };
      const savedTasks = localStorage.getItem("registeredTasks");
      const allTasks = savedTasks ? JSON.parse(savedTasks) : [];
      localStorage.setItem("registeredTasks", JSON.stringify([newTask, ...allTasks]));
      setTasks([newTask, ...tasks]);
    }
    closeTaskModal();
  };

  const handleEditTaskClick = (task: any) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title); setTaskPrice(task.price); setTaskDate(task.date); setTaskTime(task.time);
    setTaskLocation(task.location); setTaskDesc(task.description || ""); setTaskIsPublic(task.isPublic);
    setTaskRequiredPeople(task.requiredPeople); setTaskAssignedTo(task.assignedTo || []);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false); setEditingTaskId(null);
    setTaskTitle(""); setTaskPrice(""); setTaskDate(""); setTaskTime(""); setTaskLocation(""); 
    setTaskDesc(""); setTaskIsPublic(true); setTaskRequiredPeople(1); setTaskAssignedTo([]);
  };

  const handleCompleteTask = (taskId: number) => {
    setConfirmDialog({
      isOpen: true, title: "Завершить задачу?", message: "Сотрудник выполнил работу?",
      onConfirm: () => {
        const savedTasks = localStorage.getItem("registeredTasks");
        if (!savedTasks) return;
        const allTasks = JSON.parse(savedTasks);
        const updated = allTasks.map((t: any) => t.id === taskId ? { ...t, status: "completed" } : t);
        localStorage.setItem("registeredTasks", JSON.stringify(updated));
        setTasks(tasks.map((t: any) => t.id === taskId ? { ...t, status: "completed" } : t));
      }
    });
  };

  const handleDeleteTask = (taskId: number) => {
    setConfirmDialog({
      isOpen: true, title: "Удалить задачу?", message: "Это действие нельзя отменить.",
      onConfirm: () => {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        const savedTasks = localStorage.getItem("registeredTasks");
        if (savedTasks) localStorage.setItem("registeredTasks", JSON.stringify(JSON.parse(savedTasks).filter((t: any) => t.id !== taskId)));
      }
    });
  };

  const handleToggleBlockEmployee = (empLogin: string, currentStatus: string) => {
    const savedUsers = localStorage.getItem("registeredUsers");
    if (!savedUsers) return;
    const allUsers = JSON.parse(savedUsers);
    const updated = allUsers.map((u: any) => u.login === empLogin ? { ...u, status: currentStatus === "active" ? "blocked" : "active" } : u);
    localStorage.setItem("registeredUsers", JSON.stringify(updated));
    setEmployees(employees.map(u => u.login === empLogin ? { ...u, status: currentStatus === "active" ? "blocked" : "active" } : u));
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp = { id: Date.now(), name: empName, login: empLogin, password: empPassword, role: "employee", status: "active", employerLogin: currentUser.login, employerName: baseName || currentUser.name };
    const savedUsers = localStorage.getItem("registeredUsers");
    const allUsers = savedUsers ? JSON.parse(savedUsers) : [];
    localStorage.setItem("registeredUsers", JSON.stringify([newEmp, ...allUsers]));
    setEmployees([newEmp, ...employees]);
    setIsEmpModalOpen(false); setEmpName(""); setEmpLogin(""); setEmpPassword("");
  };

  const toggleAssignEmployee = (login: string) => {
    if (taskAssignedTo.includes(login)) setTaskAssignedTo(taskAssignedTo.filter(l => l !== login));
    else setTaskAssignedTo([...taskAssignedTo, login]);
  };

  const openChat = (emp: any) => {
    setChatModalUser(emp);
    const chatKey = `chat_${currentUser.login}_${emp.login}`;
    const saved = localStorage.getItem(chatKey);
    setChatMessages(saved ? JSON.parse(saved) : []);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !chatModalUser) return;
    const chatKey = `chat_${currentUser.login}_${chatModalUser.login}`;
    const newMsg = { sender: currentUser.login, text: chatMessage, time: Date.now() };
    const updated = [...chatMessages, newMsg];
    localStorage.setItem(chatKey, JSON.stringify(updated));
    setChatMessages(updated); setChatMessage("");
  };

  const handleLogout = () => { localStorage.removeItem("currentUser"); router.push("/login"); };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!currentUser) return null;

  const isSubscriptionActive = currentUser.subscriptionEnd && currentUser.subscriptionEnd > Date.now();

  if (!isSubscriptionActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 text-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard size={40} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Требуется подписка</h1>
          <p className="text-slate-400 mb-8">Для доступа к панели управления и создания задач необходима активная подписка.</p>
          
          <div className="bg-slate-950 border border-white/10 rounded-2xl p-6 mb-8 text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-300">Тариф "Бизнес"</span>
              <span className="text-xl font-bold text-white">1000 ₽ <span className="text-sm text-slate-500 font-normal">/ мес</span></span>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400"/> Неограниченное число задач</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400"/> Создание базы сотрудников</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400"/> Чат с работниками</li>
            </ul>
          </div>

          <button onClick={handlePaySubscription} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2">
            <ShieldCheck size={20} /> Оплатить 1000 ₽
          </button>
          <p className="text-xs text-slate-500 mt-3">Нажимая кнопку, вы перейдете на защищенную страницу оплаты</p>
          
          <button onClick={handleLogout} className="w-full text-slate-500 hover:text-white text-sm mt-4">Выйти из аккаунта</button>
        </motion.div>
      </div>
    );
  }

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const historyTasks = tasks.filter(t => t.status === "paid");
  const activeTasks = tasks.filter(t => t.status !== "paid");
  
  const currentMonthSpent = historyTasks
    .filter(t => t.date.startsWith(currentMonthStr))
    .reduce((acc, t) => acc + Number(t.price), 0);

  const tasksOnSelectedDate = historyTasks.filter(t => t.date === historyDate);

  const isUserOnline = (lastSeen?: number) => lastSeen ? (Date.now() - lastSeen) < 5 * 60 * 1000 : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden pb-20">
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <header className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">Панель управления</h1>
              <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30">ID: {currentUser.id}</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1"><Check size={12}/> Подписка активна</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{currentUser.name}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"><LogOut size={16} /> Выйти</button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"><Building2 className="text-blue-400" size={24} /></div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Название базы</p>
              {isEditingBase ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={baseName} onChange={(e) => setBaseName(e.target.value)} className="bg-slate-900 border border-white/20 rounded-lg px-3 py-1.5 text-white outline-none focus:border-blue-500" />
                  <button onClick={handleSaveBase} className="bg-blue-500 p-2 rounded-lg text-white"><Check size={16}/></button>
                </div>
              ) : (
                <h2 className="text-xl font-bold text-white cursor-pointer hover:text-blue-400" onClick={() => setIsEditingBase(true)}>{baseName || "Задать название"}</h2>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
            <div><div className="flex items-center gap-2 mb-2 text-slate-400"><Users size={20} className="text-emerald-400" /><h2 className="text-sm font-medium">Сотрудники</h2></div><p className="text-3xl font-bold text-white">{employees.length}</p></div>
            <button onClick={() => setIsEmpModalOpen(true)} className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus size={16}/> Нанять</button>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
            <div><div className="flex items-center gap-2 mb-2 text-slate-400"><ListTodo size={20} className="text-purple-400" /><h2 className="text-sm font-medium">В работе</h2></div><p className="text-3xl font-bold text-white">{activeTasks.length}</p></div>
            <button onClick={() => setIsTaskModalOpen(true)} className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus size={16}/> Создать</button>
          </div>
          <div 
            onClick={() => setStatsModalOpen(true)}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30"><Wallet size={80} /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-slate-400"><Wallet size={20} className="text-amber-400" /><h2 className="text-sm font-medium">Потрачено за месяц</h2></div>
              <p className="text-3xl font-bold text-white">{currentMonthSpent} ₽</p>
              <p className="text-xs text-amber-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">История &rarr;</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Users size={24} className="text-emerald-400" /> Штат</h2>
            <div className="space-y-4">
              {employees.map(emp => {
                const online = isUserOnline(emp.lastSeen);
                return (
                  <div key={emp.id} className={`bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between ${emp.status === 'blocked' ? 'opacity-60 border-red-500/30' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <UserCircle2 size={40} className="text-slate-500" />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-slate-900 rounded-full ${online ? "bg-emerald-500" : "bg-slate-500"}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{emp.name} {emp.status === 'blocked' && <span className="text-xs text-red-400">(Заблокирован)</span>}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-2">
                          <span>ID: {emp.id}</span>
                          <span className={`w-1 h-1 rounded-full ${online ? "bg-emerald-500" : "bg-slate-500"}`}></span>
                          <span className={online ? "text-emerald-400" : "text-slate-500"}>{online ? "В сети" : "Не в сети"}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openChat(emp)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"><MessageSquare size={16}/></button>
                      <button onClick={() => handleToggleBlockEmployee(emp.login, emp.status)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300">
                        {emp.status === 'active' ? <Lock size={16}/> : <Unlock size={16}/>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ListTodo size={24} className="text-purple-400" /> Текущие задачи</h2>
              <div className="space-y-4">
                {activeTasks.length === 0 ? <p className="text-slate-500 text-sm p-4 bg-white/5 rounded-xl text-center">Нет активных задач</p> : activeTasks.map(task => (
                  <div key={task.id} className={`bg-white/5 border p-5 rounded-2xl relative ${task.status === 'declined' ? 'border-red-500/30' : 'border-white/10'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        {task.isPublic && <span className="inline-block bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-1 rounded mb-1 mr-2">На главной</span>}
                        {task.status === 'declined' && <span className="inline-block bg-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded mb-1 flex items-center gap-1"><AlertTriangle size={10}/> Отказ</span>}
                        <h3 className="font-bold text-white pr-8">{task.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditTaskClick(task)} className="text-slate-500 hover:text-amber-400" title="Редактировать / Назначить"><Edit size={18}/></button>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-slate-500 hover:text-red-400" title="Удалить"><Trash2 size={18}/></button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{task.date} в {task.time} • {task.location}</p>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-emerald-400 font-bold">{task.price} ₽</p>
                      <span className={`text-xs px-2 py-1 rounded ${task.status === 'active' ? 'bg-blue-500/20 text-blue-400' : task.status === 'completed' ? 'bg-orange-500/20 text-orange-400' : task.status === 'declined' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800'}`}>
                        {task.status === 'active' ? 'В работе' : task.status === 'completed' ? 'Ждет оплаты' : task.status === 'declined' ? 'Отказ' : 'Оплачено'}
                      </span>
                    </div>
                    
                    {task.assignedTo?.length > 0 ? (
                      <p className="text-xs text-blue-400 mt-2 bg-blue-500/10 p-2 rounded-lg">Назначено: {task.assignedTo.join(", ")}</p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-800 p-2 rounded-lg">Исполнитель еще не назначен</p>
                    )}
                    
                    <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                      {task.status === 'active' && task.assignedTo?.length > 0 && (
                        <button onClick={() => handleCompleteTask(task.id)} className="flex-1 bg-orange-500/20 text-orange-400 text-xs py-1.5 rounded hover:bg-orange-500/30">Пометить выполненной</button>
                      )}
                      
                      {task.status === 'declined' && (
                        <button onClick={() => handleEditTaskClick(task)} className="flex-1 bg-red-500 hover:bg-red-400 text-white text-xs py-2 rounded font-bold flex items-center justify-center gap-1">
                          <Edit size={14}/> Переназначить
                        </button>
                      )}
                      
                      {task.isPublic && (
                        <button onClick={() => setApplicantsModalTask(task)} className="flex-1 bg-purple-500/20 text-purple-400 text-xs py-1.5 rounded hover:bg-purple-500/30">
                          Отклики ({task.applicants?.length || 0})
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {statsModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><History size={24} className="text-amber-400"/> История расходов</h2>
                <button onClick={() => setStatsModalOpen(false)} className="text-slate-400"><X size={24}/></button>
              </div>
              <HistoryCalendar tasks={historyTasks} selectedDate={historyDate} onSelectDate={setHistoryDate} />
              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Задачи за {new Date(historyDate).toLocaleDateString('ru-RU')}:</h3>
                <div className="space-y-2">
                  {tasksOnSelectedDate.length === 0 ? (
                    <p className="text-slate-600 text-sm bg-slate-950 p-4 rounded-xl text-center border border-white/5">В этот день расходов не было</p>
                  ) : (
                    tasksOnSelectedDate.map(t => (
                      <div key={t.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-white/5">
                        <div>
                          <p className="text-white text-sm font-bold">{t.title}</p>
                          <p className="text-xs text-slate-500">{t.assignedTo?.join(", ") || "Свободная задача"}</p>
                        </div>
                        <span className="text-amber-400 font-bold">{t.price} ₽</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {applicantsModalTask && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Отклики: {applicantsModalTask.title}</h2>
                <button onClick={() => setApplicantsModalTask(null)} className="text-slate-400"><X size={24}/></button>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {(!applicantsModalTask.applicants || applicantsModalTask.applicants.length === 0) ? (
                  <p className="text-slate-500 text-center py-4">Пока нет откликов</p>
                ) : applicantsModalTask.applicants.map((app: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-white/10">
                    <p className="font-bold text-white">{app.name}</p>
                    <p className="text-sm text-slate-400 flex items-center gap-1 mt-1"><Phone size={14}/> {app.phone}</p>
                    <p className="text-sm text-slate-400 mt-1">Город: {app.location}</p>
                    {app.telegram && <p className="text-sm text-blue-400 mt-1 flex items-center gap-1"><SendIcon size={14}/> TG: {app.telegram}</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDialog?.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-white/10 text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-red-500" /></div>
              <h3 className="text-xl font-bold text-white mb-2">{confirmDialog.title}</h3>
              <p className="text-sm text-slate-400 mb-6">{confirmDialog.message}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDialog(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl">Отмена</button>
                <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 rounded-xl">Подтвердить</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTaskModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-white/10 my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">{editingTaskId ? "Редактировать / Назначить" : "Создать задачу"}</h2>
                <button onClick={closeTaskModal} className="text-slate-400"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveTask} className="space-y-4">
                <input type="text" placeholder="Название" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-purple-500 outline-none" required />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Оплата (₽)" value={taskPrice} onChange={e => setTaskPrice(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-purple-500 outline-none" required />
                  <input type="number" placeholder="Человек" min="1" max="10" value={taskRequiredPeople} onChange={e => setTaskRequiredPeople(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-purple-500 outline-none" required />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <CustomDatePicker value={taskDate} onChange={setTaskDate} />
                  <CustomTimePicker value={taskTime} onChange={setTaskTime} />
                </div>

                <input type="text" placeholder="Место (город, адрес)" value={taskLocation} onChange={e => setTaskLocation(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-purple-500 outline-none" required />
                <textarea placeholder="Описание (необязательно)" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-purple-500 outline-none" rows={2} />
                
                {employees.length > 0 && (
                  <div className="border border-white/10 rounded-xl p-3 bg-slate-950/50">
                    <p className="text-sm font-medium text-slate-300 mb-2">Назначить сотрудникам (снимет с публикации):</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {employees.map(emp => (
                        <label key={emp.login} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                          <input type="checkbox" checked={taskAssignedTo.includes(emp.login)} onChange={() => toggleAssignEmployee(emp.login)} className="accent-purple-500 w-4 h-4" />
                          {emp.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <label className={`flex items-center gap-3 p-3 border border-white/10 rounded-xl cursor-pointer ${taskAssignedTo.length > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'}`}>
                  <input type="checkbox" checked={taskIsPublic} disabled={taskAssignedTo.length > 0} onChange={e => setTaskIsPublic(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-white">Опубликовать на главной</p>
                    <p className="text-xs text-slate-400">{taskAssignedTo.length > 0 ? "Задача будет скрыта с главной, так как назначен исполнитель" : "Смогут увидеть все"}</p>
                  </div>
                </label>
                <button type="submit" className={`w-full font-bold py-3 rounded-xl mt-2 ${editingTaskId ? "bg-amber-500 text-slate-950" : "bg-purple-500 text-white"}`}>
                  {editingTaskId ? "Сохранить" : "Опубликовать"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatModalUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md p-0 rounded-2xl bg-slate-900 border border-white/10 flex flex-col h-[500px]">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
                <h2 className="font-bold text-white">Чат с {chatModalUser.name}</h2>
                <button onClick={() => setChatModalUser(null)} className="text-slate-400"><X size={24} /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3">
                {chatMessages.length === 0 ? <p className="text-center text-xs text-slate-500 mt-auto mb-auto">Нет сообщений</p> : 
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === currentUser.login ? "bg-blue-600 text-white self-end rounded-tr-none" : "bg-slate-800 text-slate-200 self-start rounded-tl-none"}`}>{msg.text}</div>
                  ))
                }
              </div>
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2">
                <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Сообщение..." className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
                <button type="submit" className="bg-blue-500 p-2 rounded-xl text-white hover:bg-blue-400"><Send size={18}/></button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEmpModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/10">
              <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white">Нанять сотрудника</h2><button onClick={() => setIsEmpModalOpen(false)}><X size={24} className="text-slate-400"/></button></div>
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <input type="text" placeholder="ФИО" value={empName} onChange={e => setEmpName(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-emerald-500 outline-none" required />
                <input type="text" placeholder="Логин" value={empLogin} onChange={e => setEmpLogin(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-emerald-500 outline-none" required />
                <input type="text" placeholder="Пароль" value={empPassword} onChange={e => setEmpPassword(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-emerald-500 outline-none" required />
                <button type="submit" className="w-full bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl">Создать</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}