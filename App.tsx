import React, { useState, useCallback, useEffect, FormEvent } from 'react';
import { Role, Assignment, Proctor, ExamSlot } from './types';
import { Button } from './components/Button';
import { AssignmentCard } from './components/AssignmentCard';

// Extend the Window interface to include XLSX
declare global {
  interface Window {
    XLSX: any;
  }
}

// --- Hardcoded user accounts for demonstration ---
const USER_ACCOUNTS = {
    'admin': { password: '123', role: 'admin' },
    'user': { password: '123', role: 'user' },
};

// --- ICONS ---
const DrawIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.69-3.182-3.182a8.25 8.25 0 0 0-11.667 0L2.985 16.95m4.992-4.992h-4.992" />
    </svg>
);
const ExportIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25" />
    </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
  </svg>
);
const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
);
const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);


interface CurrentUser {
    username: string;
    role: 'admin' | 'user';
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [session, setSession] = useState<{ date: string; time: string } | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lastResult, setLastResult] = useState<Assignment | null>(null);
  
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');

  // --- Login State ---
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Load user session and app data from localStorage on initial render
  useEffect(() => {
    try {
        const savedUser = localStorage.getItem('proctorDrawUser');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }

        const savedData = localStorage.getItem('proctorDrawApp');
        if (savedData) {
            const { session, assignments } = JSON.parse(savedData);
            setSession(session || null);
            setAssignments(assignments || []);
        }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        localStorage.clear(); // Clear corrupted data
    }
  }, []);

  // Save app data to localStorage whenever it changes
  useEffect(() => {
    try {
        if (session) {
            const dataToSave = { session, assignments };
            localStorage.setItem('proctorDrawApp', JSON.stringify(dataToSave));
        } else {
             localStorage.removeItem('proctorDrawApp');
        }
    } catch (error) {
        console.error("Failed to save data to localStorage", error);
    }
  }, [session, assignments]);

  // Handle login
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const account = USER_ACCOUNTS[loginUsername as keyof typeof USER_ACCOUNTS];
    if (account && account.password === loginPassword) {
        const user: CurrentUser = { username: loginUsername, role: account.role as 'admin' | 'user' };
        setCurrentUser(user);
        localStorage.setItem('proctorDrawUser', JSON.stringify(user));
        setLoginError('');
        setLoginUsername('');
        setLoginPassword('');
    } else {
        setLoginError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('proctorDrawUser');
  };

  const handleStartSession = (e: FormEvent) => {
    e.preventDefault();
    if (!examDate.trim() || !examTime.trim()) return;

    const newSession = { date: examDate, time: examTime.trim() };
    setSession(newSession);

    const predefinedRooms = ['G203', 'G205', 'G206', 'G207'];
    const roles = [Role.Proctor1, Role.Proctor2, Role.Supervisor];
    
    const initialAssignments: Assignment[] = [];
    predefinedRooms.forEach(room => {
        roles.forEach(role => {
            initialAssignments.push({
                proctor: null,
                role: role,
                examSlot: { room, date: newSession.date, time: newSession.time }
            });
        });
    });
    
    setAssignments(initialAssignments);
    setLastResult(null);
  };

  const handleDrawForUser = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const alreadyDrawn = assignments.some(a => a.proctor?.name === currentUser.username);
    if(alreadyDrawn) {
        alert("Bạn đã bốc thăm rồi!");
        return;
    }

    const availableSlots = assignments.filter(a => a.proctor === null);
    if (availableSlots.length === 0) {
        alert("Rất tiếc, tất cả các vị trí đã được bốc thăm hết.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableSlots.length);
    const chosenSlot = availableSlots[randomIndex];
    const newProctor: Proctor = { id: Date.now(), name: currentUser.username };

    const newAssignments = assignments.map(a =>
        (a.examSlot.room === chosenSlot.examSlot.room && a.role === chosenSlot.role)
        ? { ...a, proctor: newProctor }
        : a
    );
    setAssignments(newAssignments);
    setLastResult({ ...chosenSlot, proctor: newProctor });
  };

  const handleExport = useCallback(() => {
    if (assignments.length === 0) return;
    const dataToExport = assignments
        .filter(a => a.proctor)
        .map(a => ({
            'Phòng thi': a.examSlot.room,
            'Ngày thi': a.examSlot.date,
            'Giờ thi': a.examSlot.time,
            'Vai trò': a.role,
            'Cán bộ': a.proctor?.name,
        }));

    const worksheet = window.XLSX.utils.json_to_sheet(dataToExport);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'PhanCongCoiThi');
    worksheet['!cols'] = [ { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 25 } ];
    window.XLSX.writeFile(workbook, 'PhanCongCoiThi.xlsx');
  }, [assignments]);
  
  const handleResetSession = useCallback(() => {
    if (window.confirm('Bạn có chắc chắn muốn bắt đầu phiên mới? Toàn bộ kết quả hiện tại sẽ bị xóa.')) {
        setSession(null);
        setAssignments([]);
        setExamDate('');
        setExamTime('');
        setLastResult(null);
    }
  }, []);

  // --- Render Login Screen ---
  if (!currentUser) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-sm w-full mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <header className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-800">Đăng nhập</h1>
                    <p className="mt-2 text-md text-gray-500">Sử dụng tài khoản được cấp để tiếp tục.</p>
                </header>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                        <input id="username" type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required/>
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input id="password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required/>
                    </div>
                    {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                    <Button type="submit" variant="primary" className="w-full">Đăng nhập</Button>
                </form>
            </div>
        </div>
    )
  }

  // --- Render App Content based on Role ---
  if (!session) {
    if (currentUser.role === 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-lg relative">
                     <button onClick={handleLogout} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
                        <LogoutIcon className="w-6 h-6"/>
                    </button>
                    <header className="text-center mb-6">
                        <h1 className="text-3xl font-extrabold text-gray-800">Bắt đầu Phiên Bốc thăm</h1>
                        <p className="mt-2 text-md text-gray-500">Nhập thông tin chung cho đợt coi thi.</p>
                    </header>
                    <form onSubmit={handleStartSession} className="space-y-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Ngày thi</label>
                            <input id="date" type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required/>
                        </div>
                         <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Giờ thi</label>
                            <input id="time" type="text" value={examTime} onChange={e => setExamTime(e.target.value)} placeholder="vd: 07:30 - 09:30" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required/>
                        </div>
                        <Button type="submit" variant="primary" className="w-full" Icon={PlayIcon}>Bắt đầu</Button>
                    </form>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
            <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-lg relative">
                <button onClick={handleLogout} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
                    <LogoutIcon className="w-6 h-6"/>
                </button>
                 <InfoIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Phiên bốc thăm chưa bắt đầu</h1>
                <p className="mt-2 text-gray-600">Vui lòng chờ Quản trị viên khởi tạo phiên và thử lại sau.</p>
            </div>
        </div>
    );
  }

  const availableSlotsCount = assignments.filter(a => !a.proctor).length;
  const assignedList = assignments.filter(a => a.proctor);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10 relative">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Hệ thống Bốc thăm Coi thi</h1>
            <p className="mt-3 text-lg text-blue-600 font-semibold">Ngày: {session.date} | Giờ: {session.time}</p>
            <div className="absolute top-0 right-0 flex items-center space-x-2">
                <span className="text-gray-600">Chào, <span className="font-bold">{currentUser.username}</span>!</span>
                 <button onClick={handleLogout} className="text-gray-500 hover:text-gray-800 transition p-2 rounded-full hover:bg-gray-200">
                    <LogoutIcon className="w-6 h-6"/>
                </button>
            </div>
        </header>

        {currentUser.role === 'user' && (
            <section className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg mb-12">
                <h3 className="font-bold text-xl mb-4 text-gray-700 text-center">Bốc thăm cho bạn</h3>
                <p className="text-center text-gray-500 mb-4">Còn lại <span className="font-bold text-green-600">{availableSlotsCount}</span> vị trí trống.</p>
                <form onSubmit={handleDrawForUser} className="flex flex-col sm:flex-row gap-2">
                    <input type="text" value={currentUser.username} className="flex-grow p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" readOnly/>
                    <Button type="submit" variant="primary" className="w-full sm:w-auto" Icon={DrawIcon} disabled={availableSlotsCount === 0 || assignments.some(a => a.proctor?.name === currentUser.username)}>
                        Bốc thăm
                    </Button>
                </form>
                {lastResult && lastResult.proctor?.name === currentUser.username && (
                    <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                        <p className="font-semibold text-green-800">
                            Chúc mừng <span className="font-bold">{lastResult.proctor?.name}</span>!
                        </p>
                        <p className="text-green-700">
                            Bạn đã được phân công làm <span className="font-bold">{lastResult.role}</span> tại phòng <span className="font-bold">{lastResult.examSlot.room}</span>.
                        </p>
                    </div>
                )}
            </section>
        )}

        {currentUser.role === 'admin' && (
            <section className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg mb-12">
                <h3 className="font-bold text-xl mb-4 text-gray-700">Tổng quan Bốc thăm</h3>
                <p className="text-gray-600 mb-4">
                    Đã hoàn thành: <span className="font-bold text-green-600">{assignedList.length}</span> / <span className="font-bold text-gray-800">{assignments.length}</span> vị trí.
                </p>
                {assignedList.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cán bộ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng thi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {assignedList.map((a, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.proctor?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.examSlot.room}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">Chưa có cán bộ nào bốc thăm.</p>
                )}
            </section>
        )}
        
        <section id="results">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-700">Kết quả Phân công Chung</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment, index) => (
                    <AssignmentCard key={index} assignment={assignment} />
                ))}
            </div>
        </section>

        {currentUser.role === 'admin' && (
            <section className="max-w-2xl mx-auto mt-12">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleExport} variant="success" Icon={ExportIcon} disabled={assignments.every(a => !a.proctor)}>
                        Xuất file Excel
                    </Button>
                    <Button onClick={handleResetSession} variant="secondary" Icon={TrashIcon}>
                        Bắt đầu phiên mới (Xóa hết)
                    </Button>
                </div>
            </section>
        )}
      </main>
    </div>
  );
};

export default App;
