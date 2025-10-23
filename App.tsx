import React, { useState, useCallback, useEffect, FormEvent } from 'react';
import { Role, Assignment, Proctor, Session } from './types';
import { Button } from './components/Button';
import { AssignmentCard } from './components/AssignmentCard';
import { ALL_ROOMS } from './constants';

// Extend the Window interface to include XLSX
declare global {
  interface Window {
    XLSX: any;
  }
}

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
const LoginIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3 3m0 0 3 3m-3-3H3" />
    </svg>
);
const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const AdminLoginModal: React.FC<{ onLogin: (username: string, password: string) => void; onCancel: () => void; }> = ({ onLogin, onCancel }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập Quản trị</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="admin-user" className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                        <input
                            id="admin-user"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="admin"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="admin-pass" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input
                            id="admin-pass"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="********"
                            required
                        />
                    </div>
                    <div className="flex gap-4 pt-2">
                        <Button type="button" onClick={onCancel} variant="secondary" className="w-full">Hủy</Button>
                        <Button type="submit" variant="primary" className="w-full">Đăng nhập</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [userDrawnAssignment, setUserDrawnAssignment] = useState<Assignment | null>(null);
  
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  
  const [proctorName, setProctorName] = useState('');

  // Load role, session and app data from localStorage on initial render
  useEffect(() => {
    try {
        const savedRole = localStorage.getItem('proctorDrawRole');
        if (savedRole === 'admin') {
            setRole('admin');
        }

        const savedData = localStorage.getItem('proctorDrawApp');
        const savedDrawnName = localStorage.getItem('proctorDrawnName');

        if (savedData) {
            const { session, assignments } = JSON.parse(savedData);
            setSession(session || null);
            setAssignments(assignments || []);

            if(savedDrawnName && assignments) {
                const foundAssignment = assignments.find((a: Assignment) => a.proctor?.name.toLowerCase() === savedDrawnName.toLowerCase());
                if(foundAssignment) {
                    setUserDrawnAssignment(foundAssignment);
                }
            }
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

  const handleAdminLogin = (username: string, password: string) => {
    if (username.toLowerCase() === 'admin' && password === 'abc123') {
      setRole('admin');
      localStorage.setItem('proctorDrawRole', 'admin');
      setShowAdminLogin(false);
    } else {
      alert('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  const handleLogout = () => {
    setRole('user');
    localStorage.removeItem('proctorDrawRole');
  };
  
  const handleRoomSelection = (room: string) => {
    setSelectedRooms(prev => 
      prev.includes(room) 
        ? prev.filter(r => r !== room)
        : [...prev, room]
    );
  };

  const handleStartSession = (e: FormEvent) => {
    e.preventDefault();
    if (!examDate.trim() || !examTime.trim()) return;
    if (selectedRooms.length === 0) {
        alert('Vui lòng chọn ít nhất một phòng thi.');
        return;
    }

    const newSession: Session = { date: examDate, time: examTime.trim(), rooms: selectedRooms };
    setSession(newSession);

    const roles = [Role.Proctor1, Role.Proctor2, Role.Supervisor];
    
    const initialAssignments: Assignment[] = [];
    selectedRooms.forEach(room => {
        roles.forEach(role => {
            initialAssignments.push({
                proctor: null,
                role: role,
                examSlot: { room, date: newSession.date, time: newSession.time }
            });
        });
    });
    
    setAssignments(initialAssignments);
    setUserDrawnAssignment(null);
    localStorage.removeItem('proctorDrawnName'); // Clear previous user's draw
  };

  const handleDrawForUser = (e: FormEvent) => {
    e.preventDefault();
    const nameToDraw = proctorName.trim();
    if (!nameToDraw) {
        alert("Vui lòng nhập họ và tên của bạn để bốc thăm.");
        return;
    }

    const alreadyDrawn = assignments.some(a => a.proctor?.name.toLowerCase() === nameToDraw.toLowerCase());
    if(alreadyDrawn) {
        alert(`Cán bộ "${nameToDraw}" đã bốc thăm rồi! Vui lòng kiểm tra lại tên hoặc nhập tên khác.`);
        return;
    }

    const availableSlots = assignments.filter(a => a.proctor === null);
    if (availableSlots.length === 0) {
        alert("Rất tiếc, tất cả các vị trí đã được bốc thăm hết.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableSlots.length);
    const chosenSlot = availableSlots[randomIndex];
    const newProctor: Proctor = { id: Date.now(), name: nameToDraw };

    const newAssignments = assignments.map(a =>
        (a.examSlot.room === chosenSlot.examSlot.room && a.role === chosenSlot.role)
        ? { ...a, proctor: newProctor }
        : a
    );
    const finalAssignment = { ...chosenSlot, proctor: newProctor };
    setAssignments(newAssignments);
    setUserDrawnAssignment(finalAssignment);
    localStorage.setItem('proctorDrawnName', newProctor.name);
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
        setSelectedRooms([]);
        setUserDrawnAssignment(null);
        setProctorName('');
        localStorage.removeItem('proctorDrawnName');
        localStorage.removeItem('proctorDrawApp');
    }
  }, []);
  
  const isAdmin = role === 'admin';

  const commonHeader = (
     <header className="text-center mb-10 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Hệ thống Bốc thăm Coi thi</h1>
        {session && (
            <div className="mt-3 text-lg text-gray-600 font-semibold space-x-4">
                <span>Ngày: <span className="text-blue-600">{session.date}</span></span>
                <span>|</span>
                <span>Giờ: <span className="text-blue-600">{session.time}</span></span>
                 <span>|</span>
                <span>Phòng: <span className="text-blue-600">{session.rooms.join(', ')}</span></span>
            </div>
        )}
        <div className="absolute top-0 right-0 flex items-center space-x-2">
            {isAdmin ? (
                <Button onClick={handleLogout} variant="secondary" Icon={LogoutIcon}>Đăng xuất</Button>
            ) : (
                <Button onClick={() => setShowAdminLogin(true)} variant="secondary" Icon={LoginIcon}>
                    Đăng nhập Quản trị
                </Button>
            )}
        </div>
    </header>
  );

  if (isAdmin) {
    if (!session) {
      return (
        <>
            {showAdminLogin && <AdminLoginModal onLogin={handleAdminLogin} onCancel={() => setShowAdminLogin(false)} />}
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-lg w-full mx-auto bg-white p-8 rounded-2xl shadow-lg relative">
                     <button onClick={handleLogout} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition" title="Đăng xuất">
                        <LogoutIcon className="w-6 h-6"/>
                    </button>
                    <header className="text-center mb-6">
                        <h1 className="text-3xl font-extrabold text-gray-800">Bắt đầu Phiên Bốc thăm</h1>
                        <p className="mt-2 text-md text-gray-500">Nhập thông tin và chọn phòng cho đợt coi thi.</p>
                    </header>
                    <form onSubmit={handleStartSession} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Ngày thi</label>
                                <input id="date" type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required/>
                            </div>
                             <div>
                                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Giờ thi</label>
                                <input id="time" type="text" value={examTime} onChange={e => setExamTime(e.target.value)} placeholder="vd: 07:30 - 09:30" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn phòng thi</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {ALL_ROOMS.map(room => (
                                    <div key={room}>
                                        <input 
                                            type="checkbox" 
                                            id={`room-${room}`} 
                                            value={room}
                                            checked={selectedRooms.includes(room)}
                                            onChange={() => handleRoomSelection(room)}
                                            className="hidden peer"
                                        />
                                        <label htmlFor={`room-${room}`} className="block w-full p-2 text-center border border-gray-300 rounded-lg cursor-pointer peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 hover:bg-gray-100 transition-colors">
                                            {room}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" variant="primary" className="w-full" Icon={PlayIcon}>Bắt đầu</Button>
                    </form>
                </div>
            </div>
        </>
      );
    }

    // Admin View: Session Active
    const assignedList = assignments.filter(a => a.proctor);
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
             {showAdminLogin && <AdminLoginModal onLogin={handleAdminLogin} onCancel={() => setShowAdminLogin(false)} />}
            <main className="container mx-auto px-4 py-8 md:py-12">
                {commonHeader}
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
                                        <tr key={`${a.examSlot.room}-${a.role}`} className="hover:bg-gray-50">
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
                
                <section id="results">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-700">Kết quả Phân công Chung</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignments.map((assignment, index) => (
                            <AssignmentCard key={index} assignment={assignment} />
                        ))}
                    </div>
                </section>

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
            </main>
        </div>
    );
  }

  // --- User View ---
  if (!session) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
            {showAdminLogin && <AdminLoginModal onLogin={handleAdminLogin} onCancel={() => setShowAdminLogin(false)} />}
            <div className="absolute top-4 right-4">
                 <Button onClick={() => setShowAdminLogin(true)} variant="secondary" Icon={LoginIcon}>
                    Đăng nhập Quản trị
                </Button>
            </div>
            <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-lg">
                 <InfoIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Phiên bốc thăm chưa bắt đầu</h1>
                <p className="mt-2 text-gray-600">Vui lòng chờ Quản trị viên khởi tạo phiên và thử lại sau.</p>
            </div>
        </div>
    );
  }
  
  // User View: Session Active
  const availableSlotsCount = assignments.filter(a => !a.proctor).length;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
        {showAdminLogin && <AdminLoginModal onLogin={handleAdminLogin} onCancel={() => setShowAdminLogin(false)} />}
        <main className="container mx-auto px-4 py-8 md:py-12">
            {commonHeader}
            <section className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg mb-12">
                 {userDrawnAssignment ? (
                    <div>
                        <h3 className="font-bold text-xl text-center text-green-600 mb-4">Bốc thăm thành công!</h3>
                        <p className="text-center text-gray-600 mb-6">Đây là kết quả của bạn, <span className="font-bold">{userDrawnAssignment.proctor?.name}</span>.</p>
                        <AssignmentCard assignment={userDrawnAssignment} />
                    </div>
                ) : (
                    <div>
                        <h3 className="font-bold text-xl mb-4 text-gray-700 text-center">Nhập thông tin và Bốc thăm</h3>
                        <p className="text-center text-gray-500 mb-4">Còn lại <span className="font-bold text-green-600">{availableSlotsCount}</span> vị trí trống.</p>
                        <form onSubmit={handleDrawForUser} className="flex flex-col sm:flex-row gap-2">
                            <input type="text" value={proctorName} onChange={e => setProctorName(e.target.value)} placeholder="Nhập họ và tên của bạn" className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required/>
                            <Button type="submit" variant="primary" className="w-full sm:w-auto" Icon={DrawIcon} disabled={availableSlotsCount === 0}>
                                Bốc thăm
                            </Button>
                        </form>
                    </div>
                )}
            </section>
        </main>
    </div>
  );
};

export default App;