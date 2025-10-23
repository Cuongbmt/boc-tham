
import React from 'react';
import { Assignment, Role } from '../types';

interface AssignmentCardProps {
  assignment: Assignment;
}

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const roleColors = {
    [Role.Proctor1]: 'bg-indigo-100 text-indigo-800',
    [Role.Proctor2]: 'bg-sky-100 text-sky-800',
    [Role.Supervisor]: 'bg-amber-100 text-amber-800',
  };
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${roleColors[role]}`}>
      {role}
    </span>
  );
};

const InfoRow: React.FC<{ icon: React.ElementType, label: string }> = ({ icon: Icon, label }) => (
    <div className="flex items-center text-gray-600">
        <Icon className="w-4 h-4 mr-2 text-gray-400" />
        <span className="text-sm">{label}</span>
    </div>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const RoomIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
    </svg>
);

const DateIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-4.5 12h22.5" />
    </svg>
);

const TimeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);


export const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const { proctor, role, examSlot } = assignment;
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-gray-800 mb-2">{proctor?.name || <span className="text-red-500">Chưa phân công</span>}</h3>
            <RoleBadge role={role} />
        </div>
        <div className="mt-4 space-y-2">
            <InfoRow icon={RoomIcon} label={`${examSlot.room}`} />
            <InfoRow icon={DateIcon} label={`Ngày: ${examSlot.date}`} />
            <InfoRow icon={TimeIcon} label={`Giờ: ${examSlot.time}`} />
        </div>
      </div>
    </div>
  );
};
