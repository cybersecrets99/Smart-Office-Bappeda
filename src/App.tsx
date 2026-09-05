import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DrivePreviewModal } from './components/engines/DrivePreviewModal';
import { GoogleSheetsViewerModal } from './components/engines/GoogleSheetsViewerModal';
import { TelegramNotificationModal } from './components/engines/TelegramNotificationModal';
import { AuditViewerModal } from './components/engines/AuditViewerModal';
import { CommandPalette } from './components/engines/CommandPalette';
import { LayoutDashboard, Mail, SendHorizontal, CheckSquare, Menu } from 'lucide-react';
import { DashboardModule } from './components/modules/DashboardModule';
import { PersuratanModule } from './components/modules/PersuratanModule';
import { DisposisiModule } from './components/modules/DisposisiModule';
import { TugasSlaModule } from './components/modules/TugasSlaModule';
import { PerjalananModule } from './components/modules/PerjalananModule';
import { AsetQrModule } from './components/modules/AsetQrModule';
import { RapatModule } from './components/modules/RapatModule';
import { ArsipModule } from './components/modules/ArsipModule';
import { PerencanaanLitbangModule } from './components/modules/PerencanaanLitbangModule';
import { PekpppModule } from './components/modules/PekpppModule';
import { GovernanceModule } from './components/modules/GovernanceModule';
import { LayananPublikModule } from './components/modules/LayananPublikModule';
import { FeedbackToast } from './components/common/FeedbackToast';
import { LaporanModule } from './components/modules/LaporanModule';
import { LoginPage } from './components/auth/LoginPage';
import { UserProfile } from './types';

const MainContent: React.FC = () => {
  const {activeModule,setActiveModule,setIsMobileSidebarOpen,dispositions,lettersIn,currentUser,hasModuleAccess}=useApp();
  React.useEffect(()=>{if(!hasModuleAccess(currentUser.role,activeModule)){if(hasModuleAccess(currentUser.role,'dashboard'))setActiveModule('dashboard');else if(hasModuleAccess(currentUser.role,'tugas'))setActiveModule('tugas');else if(hasModuleAccess(currentUser.role,'disposisi'))setActiveModule('disposisi');}},[currentUser.role,activeModule,hasModuleAccess,setActiveModule]);
  const pendingDisposisi=dispositions.filter(d=>d.status!=='COMPLETED').length;
  const renderActiveModule=()=>{switch(activeModule){case'dashboard':return <DashboardModule/>;case'persuratan':return <PersuratanModule/>;case'disposisi':return <DisposisiModule/>;case'tugas':return <TugasSlaModule/>;case'perjalanan':return <PerjalananModule/>;case'aset':return <AsetQrModule/>;case'rapat':return <RapatModule/>;case'arsip':return <ArsipModule/>;case'perencanaan':return <PerencanaanLitbangModule/>;case'pekppp':return <PekpppModule/>;case'layanan':return <LayananPublikModule/>;case'governance':return <GovernanceModule/>;case'laporan':return <LaporanModule/>;default:return <DashboardModule/>;}};
  return <div className="flex h-screen h-[100dvh] w-full max-w-full bg-[#0A0B0E] text-slate-300 antialiased overflow-hidden font-sans"><Sidebar/><div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#0A0B0E] relative"><Header/><main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-8 custom-scrollbar"><div className="w-full max-w-7xl mx-auto pb-24 sm:pb-28 lg:pb-8">{renderActiveModule()}</div></main><nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0D0F14]/95 backdrop-blur-md border-t border-white/10 px-1 py-1.5 flex items-center justify-around safe-bottom">{hasModuleAccess(currentUser.role,'dashboard')&&<button onClick={()=>setActiveModule('dashboard')} className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl min-h-[44px]"><LayoutDashboard className="w-4 h-4 mb-0.5"/><span className="text-[10px]">Dashboard</span></button>}{hasModuleAccess(currentUser.role,'persuratan')&&<button onClick={()=>setActiveModule('persuratan')} className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl min-h-[44px] relative"><Mail className="w-4 h-4 mb-0.5"/><span className="text-[10px]">Surat</span>{lettersIn.length>0&&<span className="absolute top-1 right-3 w-1.5 h-1.5 rounded-full bg-teal-400"/>}</button>}{hasModuleAccess(currentUser.role,'disposisi')&&<button onClick={()=>setActiveModule('disposisi')} className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl min-h-[44px] relative"><SendHorizontal className="w-4 h-4 mb-0.5"/><span className="text-[10px]">Disposisi</span>{pendingDisposisi>0&&<span className="absolute top-1 right-2 px-1 rounded-full bg-amber-500/20 text-amber-300 text-[8px]">{pendingDisposisi}</span>}</button>}{hasModuleAccess(currentUser.role,'tugas')&&<button onClick={()=>setActiveModule('tugas')} className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl min-h-[44px]"><CheckSquare className="w-4 h-4 mb-0.5"/><span className="text-[10px]">Tugas SLA</span></button>}<button onClick={()=>setIsMobileSidebarOpen(true)} className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl min-h-[44px]"><Menu className="w-4 h-4 mb-0.5"/><span className="text-[10px]">Lainnya</span></button></nav></div><DrivePreviewModal/><GoogleSheetsViewerModal/><TelegramNotificationModal/><AuditViewerModal/><CommandPalette/><FeedbackToast/></div>;
};
export default function App(){const[authenticatedUser,setAuthenticatedUser]=React.useState<UserProfile|null>(()=>{const saved=localStorage.getItem('ekanjoli_session_user_v1');try{return saved?JSON.parse(saved):null}catch{localStorage.removeItem('ekanjoli_session_user_v1');return null;}});React.useEffect(()=>{const handleLogout=()=>setAuthenticatedUser(null);window.addEventListener('ekanjoli:logout',handleLogout);return()=>window.removeEventListener('ekanjoli:logout',handleLogout);},[]);if(!authenticatedUser)return <LoginPage onLogin={(user,token)=>{localStorage.setItem('ekanjoli_session_user_v1',JSON.stringify(user));localStorage.setItem('ekanjoli_session_token_v1',token);localStorage.setItem('ekanjoli_user_v4',JSON.stringify(user));setAuthenticatedUser(user);}}/>;return <AppProvider><MainContent/></AppProvider>;}
