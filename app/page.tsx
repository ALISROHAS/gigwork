"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Wallet, Zap, Briefcase, Users, X, CheckCircle2, Phone, Send } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [publicTasks, setPublicTasks] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Состояния для модалки отклика
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Поля формы
  const [appName, setAppName] = useState("");
  const [appPhone, setAppPhone] = useState("");
  const [appLocation, setAppLocation] = useState("");
  const [appTelegram, setAppTelegram] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const savedTasks = localStorage.getItem("registeredTasks");
    if (savedTasks) {
      setPublicTasks(JSON.parse(savedTasks).filter((t: any) => t.isPublic === true && t.status === "active"));
    }
    setIsLoaded(true);
  };

  const handleOpenModal = (task: any) => {
    setSelectedTask(task);
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const savedTasks = localStorage.getItem("registeredTasks");
    if (!savedTasks) return;

    const allTasks = JSON.parse(savedTasks);
    const updatedTasks = allTasks.map((t: any) => {
      if (t.id === selectedTask.id) {
        const newApplicant = { name: appName, phone: appPhone, location: appLocation, telegram: appTelegram };
        return { ...t, applicants: [...(t.applicants || []), newApplicant] };
      }
      return t;
    });

    localStorage.setItem("registeredTasks", JSON.stringify(updatedTasks));
    setIsSuccess(true);
    loadTasks(); // Обновляем счетчик на карточке
    
    // Очищаем форму
    setAppName(""); setAppPhone(""); setAppLocation(""); setAppTelegram("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-emerald-500/30 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <header className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold text-white">
            <Zap className="text-emerald-500 fill-emerald-500" />
            <span>Gig<span className="text-emerald-500">Work</span></span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all border border-white/10">
              Войти
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-24 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-6">
            Найди подработку <br /> <span className="text-emerald-400">прямо сейчас</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10">Актуальные задачи с оплатой. Выбирай и откликайся.</p>
        </motion.div>

        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-white">Свежие задачи</h2>
        </div>

        {isLoaded && publicTasks.length === 0 ? (
          <div className="bg-white/5 border border-white/10 p-16 rounded-3xl flex flex-col items-center justify-center text-center">
            <Briefcase size={40} className="text-slate-500 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Пока нет доступных задач</h3>
            <p className="text-slate-400">Загляните позже!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicTasks.map((task) => (
              <div key={task.id} className="group bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Wallet size={14} /> {task.price} ₽
                  </div>
                  <div className="text-slate-400 text-xs flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                    <Users size={14} /> Отклики: {task.applicants?.length || 0}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{task.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{task.description || "Описание не указано"}</p>
                
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs"><Clock size={14} /> {task.date} в {task.time}</div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs"><MapPin size={14} /> {task.location}</div>
                </div>

                <button onClick={() => handleOpenModal(task)} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all">
                  Откликнуться
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* МОДАЛКА ОТКЛИКА */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/10 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
              
              {isSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Заявка отправлена!</h2>
                  <p className="text-slate-400">Спасибо. Работодатель свяжется с вами по указанным контактам.</p>
                  <button onClick={() => setIsModalOpen(false)} className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl">Закрыть</button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white mb-1">Отклик на задачу</h2>
                  <p className="text-sm text-slate-400 mb-6">{selectedTask?.title}</p>
                  <form onSubmit={handleSubmitApplication} className="space-y-4">
                    <input type="text" placeholder="Ваше ФИО" value={appName} onChange={e => setAppName(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm" required />
                    <input type="tel" placeholder="Номер телефона" value={appPhone} onChange={e => setAppPhone(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm" required />
                    <input type="text" placeholder="Город проживания" value={appLocation} onChange={e => setAppLocation(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm" required />
                    <input type="text" placeholder="Telegram (необязательно, @username)" value={appTelegram} onChange={e => setAppTelegram(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm" />
                    
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl mt-4">Отправить заявку</button>
                    <p className="text-xs text-center text-slate-500 mt-2">Работодатель сможет позвонить или написать вам</p>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}