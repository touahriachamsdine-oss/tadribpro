'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { getSession } from '@/lib/clientAuth';
import { db, Trainee, TrainingTrack, SupportTicket, CourseEvaluation, Lesson, CompanyMessage } from '@/lib/db';
import { 
  BookOpen, 
  Users2, 
  Settings2, 
  Plus, 
  Trash2, 
  LogOut, 
  Landmark,
  Languages,
  CheckCircle2,
  Calendar,
  Layers,
  Info,
  TrendingUp,
  FileSpreadsheet,
  Star,
  MessageSquare,
  Check,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Upload,
  FileText,
  Download,
  Edit3,
  ChevronDown,
  ChevronUp,
  UserCog
} from 'lucide-react';

export default function CompanyAdminPage() {
  const { t, language, toggleLanguage, dir } = useLanguage();
  const router = useRouter();
  
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'ranks' | 'lessons' | 'messages' | 'settings'>('dashboard');

  // Company session & identity
  const [companyId, setCompanyId] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [companySector, setCompanySector] = useState<string>('');
  const [companyEmail, setCompanyEmail] = useState<string>('');

  // Lists states
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<TrainingTrack | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [evaluations, setEvaluations] = useState<CourseEvaluation[]>([]);
  const [companyTracks, setCompanyTracks] = useState<TrainingTrack[]>([]);
  const [globalTracks, setGlobalTracks] = useState<TrainingTrack[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [globalLessons, setGlobalLessons] = useState<Lesson[]>([]);
  const [companyMessages, setCompanyMessages] = useState<CompanyMessage[]>([]);
  const [ticketFilter, setTicketFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  
  // Form states - Enroll Trainee
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [targetTrackId, setTargetTrackId] = useState('');
  const [targetDeadline, setTargetDeadline] = useState('2026-09-30');

  // Form states - Custom Rank/Track creation
  const [newRankTitleAr, setNewRankTitleAr] = useState('');
  const [newRankTitleFr, setNewRankTitleFr] = useState('');
  const [newRankSectorAr, setNewRankSectorAr] = useState('');
  const [newRankSectorFr, setNewRankSectorFr] = useState('');
  const [newRankCategory, setNewRankCategory] = useState<'joint' | 'research' | 'regional'>('joint');
  const [newRankModulesArStr, setNewRankModulesArStr] = useState('');
  const [newRankModulesFrStr, setNewRankModulesFrStr] = useState('');

  // Form states - Custom Lesson Upload
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonTrackIds, setNewLessonTrackIds] = useState<string[]>([]);
  const [newLessonModule, setNewLessonModule] = useState('');
  const [newLessonFileName, setNewLessonFileName] = useState('');
  const [newLessonFileContent, setNewLessonFileContent] = useState('');

  // Form states - Company Messages
  const [newMessageTitle, setNewMessageTitle] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');

  // Form states - Company Settings
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editCompanySector, setEditCompanySector] = useState('');

  // Visual Hierarchy Tree & Modal States
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [editingTrack, setEditingTrack] = useState<TrainingTrack | null>(null);
  const [editRankTitleAr, setEditRankTitleAr] = useState('');
  const [editRankTitleFr, setEditRankTitleFr] = useState('');
  const [editRankSectorAr, setEditRankSectorAr] = useState('');
  const [editRankSectorFr, setEditRankSectorFr] = useState('');
  const [editRankCategory, setEditRankCategory] = useState<'joint' | 'research' | 'regional'>('joint');
  const [editRankModulesArStr, setEditRankModulesArStr] = useState('');
  const [editRankModulesFrStr, setEditRankModulesFrStr] = useState('');
  
  const [expandedRanks, setExpandedRanks] = useState<Record<string, boolean>>({});
  const [reassignTrainee, setReassignTrainee] = useState<Trainee | null>(null);
  const [reassignTargetTrackId, setReassignTargetTrackId] = useState('');

  const toggleRankExpanded = (trackId: string) => {
    setExpandedRanks(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
  };

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Load B2B tenant data
  const loadData = useCallback(async (activeCompanyId: string) => {
    setLoading(true);
    try {
      // Get company meta
      const comp = await db.getCompany(activeCompanyId);
      if (comp) {
        setCompanyName(comp.name);
        setCompanySector(comp.sector);
        setCompanyEmail(comp.email);
        setEditCompanyName(comp.name);
        setEditCompanySector(comp.sector);
      }

      // Get global tracks from Super Admin repository
      const gTracks = await db.getCompanyTracks('global');
      setGlobalTracks(gTracks);

      // Get custom company tracks
      const tracks = await db.getCompanyTracks(activeCompanyId);
      setCompanyTracks(tracks);

      // Combined: global first, then company-specific
      const combined = [...gTracks, ...tracks];
      if (combined.length > 0) {
        setTargetTrackId(combined[0].id);
        setNewLessonTrackIds([combined[0].id]);

        const modules = combined[0].modules_ar;
        if (modules && modules.length > 0) {
          setNewLessonModule(modules[0]);
        }
      }

      // Get global lessons from Super Admin
      const gLessonList = await db.getLessons('global');
      setGlobalLessons(gLessonList);

      // Get company uploaded lessons
      const lessonList = await db.getLessons(activeCompanyId);
      setLessons(lessonList);

      // Get company messages
      const msgList = await db.getCompanyMessages(activeCompanyId);
      setCompanyMessages(msgList);

      // Fetch trainees
      const traineeList = await db.getTrainees(activeCompanyId);
      setTrainees(traineeList);

      // Fetch tickets
      const ticketList = await db.getTickets(activeCompanyId);
      setTickets(ticketList);

      // Fetch course evaluations
      const evalList = await db.getCourseEvaluations(activeCompanyId);
      setEvaluations(evalList);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session || (session.role !== 'company' && session.role !== 'super-admin')) {
        router.replace('/auth');
        return;
      }
      setIsSuperAdmin(session.role === 'super-admin');

      const searchParams = new URLSearchParams(window.location.search);
      const queryCompanyId = searchParams.get('companyId');

      let activeCompanyId = session.company_id || '';
      if (session.role === 'super-admin') {
        // Super admins may inspect a company's space via ?companyId=...
        if (!queryCompanyId) {
          router.replace('/super-admin');
          return;
        }
        activeCompanyId = queryCompanyId;
      }
      if (!activeCompanyId) {
        router.replace('/auth');
        return;
      }
      setCompanyId(activeCompanyId);
      if (!cancelled) {
        await loadData(activeCompanyId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, loadData]);

  // Update track selector module list dynamically (using first selected track if any)
  useEffect(() => {
    const allTracks = [...globalTracks, ...companyTracks];
    if (newLessonTrackIds.length > 0 && allTracks.length > 0) {
      const selected = allTracks.find(t => t.id === newLessonTrackIds[0]);
      if (selected) {
        const modules = language === 'ar' ? selected.modules_ar : selected.modules_fr;
        if (modules && modules.length > 0) {
          setNewLessonModule(modules[0]);
        }
      }
    }
  }, [newLessonTrackIds, companyTracks, globalTracks, language]);

  const handleEnrollEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!employeeName || !employeeEmail || !targetTrackId || !targetDeadline) {
      setError(language === 'ar' ? 'الرجاء تعبئة كل الفراغات.' : 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      await db.assignTrainee(
        employeeName,
        employeeEmail,
        companyId,
        targetTrackId,
        targetDeadline
      );

      setSuccess(t('assignedSuccess'));
      setEmployeeName('');
      setEmployeeEmail('');
      
      // Reload lists
      loadData(companyId);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg || 'Error occurred.');
    }
  };

  const handleUnenrollEmployee = async (id: string, name: string) => {
    const consent = window.confirm(
      language === 'ar' 
        ? `هل تريد إلغاء تسجيل الموظف "${name}" من هذا المسار التكويني؟`
        : `Voulez-vous désinscrire l'employé "${name}" de ce parcours ?`
    );
    if (!consent) return;

    try {
      await db.deleteTrainee(id);
      loadData(companyId);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(errMsg || 'Error deleting.');
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      await db.updateTicketStatus(ticketId, 'resolved');
      setSuccess(language === 'ar' ? 'تم حل تذكرة الدعم بنجاح وتحديث حالة الموظف!' : 'Ticket d’assistance marqué résolu !');
      loadData(companyId);
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      console.error('Error resolving support ticket:', err);
    }
  };

  // Neutralize CSV formula-injection characters (= + - @) 
  const csvSafe = (value: string) => {
    const cleaned = value.replace(/"/g, '""');
    const neutralized = /^[=+\-@\t\r]/.test(cleaned) ? `'${cleaned}` : cleaned;
    return `"${neutralized}"`;
  };

  const exportTraineesToCSV = () => {
    if (trainees.length === 0) return;
    
    const headers = language === 'ar' 
      ? ['المعرف', 'الاسم الكامل', 'البريد الإلكتروني', 'المسار التكويني', 'نسبة التقدم', 'الحالة', 'الآجال']
      : ['ID', 'Nom', 'Email', 'Parcours', 'Progrès', 'Statut', 'Date Limite'];
      
    const rows = trainees.map(t => [
      t.id,
      csvSafe(t.name),
      csvSafe(t.email),
      csvSafe(language === 'ar' ? t.trackTitleAr : t.trackTitleFr),
      `${t.progress}%`,
      t.status === 'completed' ? (language === 'ar' ? 'مكتمل' : 'Complete') : (language === 'ar' ? 'نشط' : 'Actif'),
      t.deadline
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TadribPro_Trainees_${companyId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'joint') return t('badgeSectorJoint');
    if (category === 'research') return t('badgeSectorResearch');
    return t('badgeSectorRegional');
  };

  const getAverageRatings = () => {
    if (evaluations.length === 0) return { quality: 0, technical: 0, utility: 0 };
    let sumQ = 0, sumT = 0, sumU = 0;
    evaluations.forEach(e => {
      sumQ += e.ratingCourseQuality;
      sumT += e.ratingTechnicalPerformance;
      sumU += e.ratingGeneralUtility;
    });
    return {
      quality: parseFloat((sumQ / evaluations.length).toFixed(1)),
      technical: parseFloat((sumT / evaluations.length).toFixed(1)),
      utility: parseFloat((sumU / evaluations.length).toFixed(1))
    };
  };

  const moveTrack = async (index: number, direction: 'up' | 'down') => {
    const newTracks = [...companyTracks];
    if (direction === 'up' && index > 0) {
      const temp = newTracks[index];
      newTracks[index] = newTracks[index - 1];
      newTracks[index - 1] = temp;
    } else if (direction === 'down' && index < newTracks.length - 1) {
      const temp = newTracks[index];
      newTracks[index] = newTracks[index + 1];
      newTracks[index + 1] = temp;
    }
    setCompanyTracks(newTracks);
    try {
      await db.saveCompanyTracks(companyId, newTracks);
      setSuccess(language === 'ar' ? 'تم تحديث ترتيب الرتب والمسارات بنجاح!' : 'L’ordre des parcours a été mis à jour avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(language === 'ar' ? 'فشل حفظ التغييرات في قاعدة البيانات.' : 'Échec de sauvegarde des parcours.');
    }
  };

  const handleAddCustomTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newRankTitleAr || !newRankTitleFr || !newRankSectorAr || !newRankSectorFr) {
      setError(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const modulesAr = newRankModulesArStr.split('\n').map(m => m.trim()).filter(m => m.length > 0);
    const modulesFr = newRankModulesFrStr.split('\n').map(m => m.trim()).filter(m => m.length > 0);

    if (modulesAr.length === 0 || modulesFr.length === 0) {
      setError(language === 'ar' ? 'يرجى إدخال مقياس واحد على الأقل.' : 'Veuillez saisir au moins un module.');
      return;
    }

    const newTrack: TrainingTrack = {
      id: 'tr-' + Math.random().toString(36).substr(2, 9),
      title_ar: newRankTitleAr,
      title_fr: newRankTitleFr,
      sector_ar: newRankSectorAr,
      sector_fr: newRankSectorFr,
      category: newRankCategory,
      modules_ar: modulesAr,
      modules_fr: modulesFr
    };

    const updatedTracks = [...companyTracks, newTrack];
    setCompanyTracks(updatedTracks);

    try {
      await db.saveCompanyTracks(companyId, updatedTracks);
      setSuccess(language === 'ar' ? 'تمت إضافة الرتبة التكوينية الجديدة بنجاح!' : 'Nouvelle formation ajoutée avec succès !');
      
      // Reset form
      setNewRankTitleAr('');
      setNewRankTitleFr('');
      setNewRankSectorAr('');
      setNewRankSectorFr('');
      setNewRankModulesArStr('');
      setNewRankModulesFrStr('');
      
      loadData(companyId);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(language === 'ar' ? 'فشل حفظ الرتبة في قاعدة البيانات.' : 'Échec de sauvegarde.');
    }
  };

  const handleDeleteTrack = async (trackId: string, title: string) => {
    const consent = window.confirm(
      language === 'ar'
        ? `هل أنت متأكد من حذف الرتبة "${title}"؟ سيؤدي ذلك إلى حذف الرتبة من قائمة الخيارات المتاحة للمؤسسة.`
        : `Êtes-vous sûr de vouloir supprimer la formation "${title}" ?`
    );
    if (!consent) return;

    const updatedTracks = companyTracks.filter(t => t.id !== trackId);
    setCompanyTracks(updatedTracks);

    try {
      await db.saveCompanyTracks(companyId, updatedTracks);
      setSuccess(language === 'ar' ? 'تم حذف الرتبة بنجاح!' : 'Formation supprimée avec succès !');
      loadData(companyId);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(language === 'ar' ? 'فشل تحديث قاعدة البيانات.' : 'Échec de suppression.');
    }
  };

  const handleEditTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;

    const modulesAr = editRankModulesArStr.split('\n').map(m => m.trim()).filter(m => m.length > 0);
    const modulesFr = editRankModulesFrStr.split('\n').map(m => m.trim()).filter(m => m.length > 0);

    if (modulesAr.length === 0 || modulesFr.length === 0) {
      setError(language === 'ar' ? 'يرجى إدخال مقياس واحد على الأقل.' : 'Veuillez saisir au moins un module.');
      return;
    }

    const updatedTrack: TrainingTrack = {
      ...editingTrack,
      title_ar: editRankTitleAr,
      title_fr: editRankTitleFr,
      sector_ar: editRankSectorAr,
      sector_fr: editRankSectorFr,
      category: editRankCategory,
      modules_ar: modulesAr,
      modules_fr: modulesFr
    };

    const updatedTracks = companyTracks.map(t => t.id === editingTrack.id ? updatedTrack : t);
    setCompanyTracks(updatedTracks);

    try {
      await db.saveCompanyTracks(companyId, updatedTracks);
      setSuccess(language === 'ar' ? 'تم تحديث بيانات الرتبة بنجاح!' : 'Grade mis à jour avec succès !');
      setEditingTrack(null);
      loadData(companyId);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(language === 'ar' ? 'فشل حفظ التغييرات في قاعدة البيانات.' : 'Échec de sauvegarde des parcours.');
    }
  };

  const handleReassignTraineeTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTrainee || !reassignTargetTrackId) return;

    const allTracks = [...globalTracks, ...companyTracks];
    const targetTrack = allTracks.find(t => t.id === reassignTargetTrackId);
    if (!targetTrack) return;

    try {
      setLoading(true);
      await db.updateTraineeTrack(
        reassignTrainee.id,
        targetTrack.id,
        targetTrack.title_ar,
        targetTrack.title_fr
      );
      setSuccess(
        language === 'ar'
          ? `تم تغيير رتبة الموظف "${reassignTrainee.name}" بنجاح!`
          : `Le grade de l'employé "${reassignTrainee.name}" a été modifié avec succès !`
      );
      setReassignTrainee(null);
      loadData(companyId);
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(language === 'ar' ? `فشل تغيير الرتبة: ${errMsg}` : `Échec de reassignment: ${errMsg}`);
      setTimeout(() => setError(''), 3500);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewLessonFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewLessonFileContent(event.target?.result as string || `Contenu de ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newLessonTitle || newLessonTrackIds.length === 0 || !newLessonFileName) {
      setError(language === 'ar' ? 'يرجى تعبئة جميع معلومات الدرس والملف.' : 'Veuillez remplir toutes les informations du cours.');
      return;
    }

    try {
      await db.addLesson(
        companyId,
        newLessonTitle,
        newLessonModule || 'General',
        newLessonFileName,
        '',
        newLessonTrackIds,
        newLessonFileContent || ''
      );

      setSuccess(language === 'ar' ? 'تم رفع درس PDF بنجاح وإلحاقه بالمقياس المعين للموظفين!' : 'Le cours PDF a été téléversé avec succès !');
      
      // Reset form
      setNewLessonTitle('');
      setNewLessonFileName('');
      setNewLessonFileContent('');
      
      loadData(companyId);
      setTimeout(() => setSuccess(''), 3500);
    } catch {
      setError(language === 'ar' ? 'خطأ أثناء رفع الدرس الفني.' : 'Erreur lors du téléversement.');
    }
  };

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    const consent = window.confirm(
      language === 'ar'
        ? `هل أنت متأكد من حذف الدرس "${title}"؟`
        : `Êtes-vous sûr de vouloir supprimer le cours "${title}" ?`
    );
    if (!consent) return;

    try {
      await db.deleteLesson(lessonId);
      setSuccess(language === 'ar' ? 'تم حذف الدرس بنجاح!' : 'Cours supprimé avec succès !');
      loadData(companyId);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(language === 'ar' ? 'فشل تحديث قاعدة البيانات.' : 'Échec de suppression.');
    }
  };

  const handleAddCompanyMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newMessageTitle || !newMessageContent) {
      setError(language === 'ar' ? 'يرجى تعبئة جميع الحقول.' : 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      await db.addCompanyMessage(companyId, newMessageTitle, newMessageContent);
      setSuccess(language === 'ar' ? 'تم إرسال الإعلان بنجاح!' : 'Message envoyé avec succès !');
      setNewMessageTitle('');
      setNewMessageContent('');
      loadData(companyId);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(language === 'ar' ? 'خطأ أثناء الإرسال.' : 'Erreur lors de l\'envoi.');
    }
  };

  const handleDeleteCompanyMessage = async (msgId: string, title: string) => {
    const consent = window.confirm(
      language === 'ar'
        ? `هل أنت متأكد من حذف الإعلان "${title}"؟`
        : `Êtes-vous sûr de vouloir supprimer le message "${title}" ?`
    );
    if (!consent) return;

    try {
      await db.deleteCompanyMessage(msgId);
      setSuccess(language === 'ar' ? 'تم الحذف بنجاح!' : 'Supprimé avec succès !');
      loadData(companyId);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(language === 'ar' ? 'فشل الحذف.' : 'Échec de suppression.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editCompanyName || !editCompanySector) {
      setError(language === 'ar' ? 'يرجى ملء جميع الحقول.' : 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      await db.updateCompany(companyId, editCompanyName, editCompanySector);
      setSuccess(language === 'ar' ? 'تم تحديث معلومات المؤسسة بنجاح!' : 'Informations de l’établissement mises à jour !');
      loadData(companyId);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(language === 'ar' ? 'خطأ في الحفظ.' : 'Erreur lors de la sauvegarde.');
    }
  };

  const avgs = getAverageRatings();
  const allTracks = [...globalTracks, ...companyTracks];
  const filteredTickets = tickets.filter(t => {
    if (ticketFilter === 'pending') return t.status === 'pending';
    if (ticketFilter === 'resolved') return t.status === 'resolved';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fbf8f3] text-[#2d2621]">
      
      {/* 1. SIDEBAR NAVIGATION - Responsive */}
      <aside className="w-full lg:w-72 bg-[#3E5C46] text-[#F3E4C9] flex flex-col justify-between z-30 lg:sticky lg:top-0 lg:h-screen shadow-none">
        
        {/* Top Logo */}
        <div className="p-6 hidden lg:flex items-center gap-3 border-b border-[#5C7449]/30 bg-[#3E5C46]">
          <div className="bg-[#CCD67F] text-[#3E5C46] p-2 rounded-full">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm block text-white leading-tight">
              {companyName || 'مؤسسة تكوين العملاء'}
            </span>
            <span className="text-[10px] text-[#F3E4C9]/70 block font-semibold uppercase tracking-wider mt-0.5">
              {companySector || (language === 'ar' ? 'فضاء المؤسسة المشرفة' : 'Institution Admin')}
            </span>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex flex-row lg:flex-col lg:py-6 overflow-x-auto lg:overflow-x-visible w-full justify-around lg:justify-start lg:gap-2 flex-grow lg:flex-grow-0">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 py-3 px-4 sm:py-4 sm:px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start ${
              activeTab === 'dashboard' ? 'text-white bg-[#5C7449]/30' : 'text-[#F3E4C9]/80 hover:text-white hover:bg-[#5C7449]/10'
            }`}
          >
            {activeTab === 'dashboard' && (
              <div className={`hidden lg:block absolute top-0 bottom-0 w-1 bg-[#CCD67F] ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
            )}
            <BookOpen className="w-5 h-5 text-[#CCD67F]" />
            <span className="text-[10px] sm:text-xs lg:text-sm">{t('menuDashboard')}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 py-3 px-4 sm:py-4 sm:px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start ${
              activeTab === 'users' ? 'text-white bg-[#5C7449]/30' : 'text-[#F3E4C9]/80 hover:text-white hover:bg-[#5C7449]/10'
            }`}
          >
            {activeTab === 'users' && (
              <div className={`hidden lg:block absolute top-0 bottom-0 w-1 bg-[#CCD67F] ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
            )}
            <Users2 className="w-5 h-5 text-[#CCD67F]" />
            <span className="text-[10px] sm:text-xs lg:text-sm">{language === 'ar' ? 'الموظفين' : 'Employés'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('ranks')}
            className={`flex items-center gap-3 py-3 px-4 sm:py-4 sm:px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start ${
              activeTab === 'ranks' ? 'text-white bg-[#5C7449]/30' : 'text-[#F3E4C9]/80 hover:text-white hover:bg-[#5C7449]/10'
            }`}
          >
            {activeTab === 'ranks' && (
              <div className={`hidden lg:block absolute top-0 bottom-0 w-1 bg-[#CCD67F] ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
            )}
            <Layers className="w-5 h-5 text-[#CCD67F]" />
            <span className="text-[10px] sm:text-xs lg:text-sm">{language === 'ar' ? 'الرتب والمسارات' : 'Ranks & Parcours'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('lessons')}
            className={`flex items-center gap-3 py-3 px-4 sm:py-4 sm:px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start ${
              activeTab === 'lessons' ? 'text-white bg-[#5C7449]/30' : 'text-[#F3E4C9]/80 hover:text-white hover:bg-[#5C7449]/10'
            }`}
          >
            {activeTab === 'lessons' && (
              <div className={`hidden lg:block absolute top-0 bottom-0 w-1 bg-[#CCD67F] ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
            )}
            <FileText className="w-5 h-5 text-[#CCD67F]" />
            <span className="text-[10px] sm:text-xs lg:text-sm">{language === 'ar' ? 'الدروس والملفات' : 'Syllabus & Leçons'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-3 py-3 px-4 sm:py-4 sm:px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start ${
              activeTab === 'messages' ? 'text-white bg-[#5C7449]/30' : 'text-[#F3E4C9]/80 hover:text-white hover:bg-[#5C7449]/10'
            }`}
          >
            {activeTab === 'messages' && (
              <div className={`hidden lg:block absolute top-0 bottom-0 w-1 bg-[#CCD67F] ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
            )}
            <MessageSquare className="w-5 h-5 text-[#CCD67F]" />
            <span className="hidden lg:block">{language === 'ar' ? 'الإعلانات والرسائل' : 'Annonces'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 py-3 px-4 sm:py-4 sm:px-6 text-sm font-semibold transition-all relative w-full min-w-[90px] lg:min-w-0 justify-center lg:justify-start ${
              activeTab === 'settings' ? 'text-white bg-[#5C7449]/30' : 'text-[#F3E4C9]/80 hover:text-white hover:bg-[#5C7449]/10'
            }`}
          >
            {activeTab === 'settings' && (
              <div className={`hidden lg:block absolute top-0 bottom-0 w-1 bg-[#CCD67F] ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
            )}
            <Settings2 className="w-5 h-5 text-[#CCD67F]" />
            <span className="text-[10px] sm:text-xs lg:text-sm">{t('menuSettings')}</span>
          </button>
        </nav>

        {/* Sidebar Bottom Action - collapses on mobile */}
        <div className="p-6 hidden lg:flex flex-col gap-4 border-t border-[#5C7449]/20 bg-[#3E5C46]">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 text-sm text-[#F3E4C9] hover:text-white transition-colors"
          >
            <Languages className="w-5 h-5 text-[#CCD67F]" />
            <span>{language === 'ar' ? 'Français' : 'العربية'}</span>
          </button>
          
          <Link href="/auth" className="flex items-center gap-3 text-sm text-[#F3E4C9] hover:text-white transition-colors mt-2">
            <LogOut className="w-5 h-5 text-[#CCD67F]" />
            <span>{t('logout')}</span>
          </Link>
        </div>

      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-grow p-4 sm:p-8 lg:p-12 overflow-y-auto mb-16 lg:mb-0">
        
        {isSuperAdmin && (
          <div className="bg-[#CCD67F]/40 border border-[#3E5C46]/20 text-[#3E5C46] px-6 py-4 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3E5C46] animate-pulse flex-shrink-0"></span>
              <span>
                {language === 'ar'
                  ? `تنبيه المشرف: أنت حالياً تتصفح وتتحكم في فضاء "${companyName || 'المؤسسة'}" بصفتك مدير عام المنصة (Overseer).`
                  : `Alerte Superviseur : Vous gérez actuellement l'espace de "${companyName || 'l\'institution'}" en tant que Super Admin (Overseer).`}
              </span>
            </div>
            <Link
              href="/super-admin"
              className="px-4.5 py-2 bg-[#3E5C46] text-white rounded-full text-xs font-black hover:bg-[#5C7449] transition-colors whitespace-nowrap"
            >
              {language === 'ar' ? 'العودة للوحة الإشراف العامة' : 'Retour console Overseer'}
            </Link>
          </div>
        )}
        
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between pb-4 border-b border-[#F3E4C9] mb-4">
          <span className="font-extrabold text-sm text-[#3E5C46]">
            {companyName || 'مؤسسة تكوين العملاء'}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="p-2 text-xs font-semibold rounded-full border border-[#3E5C46] text-[#3E5C46]">
              {language === 'ar' ? 'FR' : 'AR'}
            </button>
            <Link href="/auth" className="p-2 text-[#3E5C46]">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Page Titles */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#3E5C46] tracking-tight">
              {t('companyPanelTitle')}
            </h1>
            <p className="text-sm text-[#5C7449] mt-1 leading-normal">
              {language === 'ar'
                ? 'تتبع وتخصيص المسارات التكوينية لموظفيك المترشحين للامتحانات أو التربصات المهنية الترقوية.'
                : 'Gérez et suivez les parcours d’études de vos agents candidats aux promotions professionnelles.'}
            </p>
          </div>

          <button
            onClick={() => loadData(companyId)}
            className="self-start md:self-auto px-4 py-2 bg-[#F3E4C9] text-[#3E5C46] rounded-full text-xs font-bold hover:bg-[#5C7449]/10 transition-colors flex items-center gap-1.5 border border-[#5C7449]/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تحديث البيانات' : 'Actualiser'}</span>
          </button>
        </div>

        {/* Notifications and status alerts */}
        {success && (
          <div className="bg-[#CCD67F]/40 text-[#3E5C46] p-4 rounded-2xl mb-6 text-sm font-semibold flex items-center gap-2 border border-[#CCD67F]/80 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-2xl mb-6 text-sm font-semibold border border-red-200 animate-fadeIn">
            {error}
          </div>
        )}

        {/* ==================================== TAB 1: DASHBOARD ==================================== */}
        {activeTab === 'dashboard' && (
          <div className="animate-fadeIn">
            
            {/* Flat rectangle stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-[#5C7449]/10">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#5C7449] block mb-1">
                  {language === 'ar' ? 'إجمالي الموظفين المسجلين' : 'Total Stagiaires Inscrits'}
                </span>
                <span className="text-3xl font-black text-[#3E5C46]">{trainees.length}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#5C7449]/10">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#5C7449] block mb-1">
                  {language === 'ar' ? 'التربصات المكتملة' : 'Formations Complétées'}
                </span>
                <span className="text-3xl font-black text-emerald-800">
                  {trainees.filter(t => t.progress === 100 || t.status === 'completed').length}
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#5C7449]/10">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#5C7449] block mb-1">
                  {language === 'ar' ? 'تذاكر الدعم المفتوحة' : 'Tickets en Attente'}
                </span>
                <span className="text-3xl font-black text-amber-800">
                  {tickets.filter(t => t.status === 'pending').length}
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#5C7449]/10">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#5C7449] block mb-1">
                  {language === 'ar' ? 'الرتب والمسارات المعتمدة' : 'Ranks & Parcours Actifs'}
                </span>
                <span className="text-3xl font-black text-[#3E5C46]">{allTracks.length}</span>
                {allTracks.length > 0 && (
                  <span className="text-[9px] text-[#5C7449] font-semibold block mt-1">
                    {globalTracks.length} {language === 'ar' ? 'عالمية' : 'globaux'} + {companyTracks.length} {language === 'ar' ? 'خاصة' : 'propres'}
                  </span>
                )}
              </div>
            </div>

            {/* Moodle-Style Training Tracks */}
            <section className="mb-12">
              <div className="flex items-center gap-2 border-b border-[#F3E4C9] pb-3 mb-6">
                <Layers className="w-5 h-5 text-[#3E5C46]" />
                <h3 className="text-xl font-bold text-[#3E5C46]">
                  {t('tracksCatalog')}
                </h3>
              </div>

              {allTracks.length === 0 ? (
                <div className="p-12 text-center bg-[#F3E4C9]/20 rounded-2xl border border-dashed border-[#5C7449]/30 text-[#5C7449]">
                  {language === 'ar' ? 'لم يتم إعداد مسارات ورتب للمؤسسة بعد. يرجى إضافتها من تبويب الرتب والمسارات.' : 'Aucun parcours configuré. Allez sur l’onglet Ranks & Parcours pour ajouter des formations.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {allTracks.map((track) => {
                    const isGlobal = globalTracks.some(g => g.id === track.id);
                    return (
                      <div 
                        key={track.id} 
                        className={`p-6 rounded-2xl flex flex-col justify-between min-h-[170px] relative transition-all duration-300 hover:bg-[#EBDCBE] border-t-4 ${isGlobal ? 'bg-[#F3E4C9]/70 border-[#CCD67F]' : 'bg-[#F3E4C9] border-[#5C7449]'}`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 bg-[#CCD67F] text-[#3E5C46] text-[10px] font-bold rounded-full">
                                {getCategoryLabel(track.category)}
                              </span>
                              {isGlobal && (
                                <span className="px-2 py-0.5 bg-[#3E5C46] text-[#F3E4C9] text-[9px] font-black rounded-full uppercase">
                                  {language === 'ar' ? '🌐 عام' : '🌐 Global'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-[#3E5C46]">
                              {track.modules_ar.length} {language === 'ar' ? 'مقاييس' : 'modules'}
                            </span>
                          </div>

                          <h4 className="text-lg font-bold text-[#3E5C46] mb-2 leading-snug">
                            {language === 'ar' ? track.title_ar : track.title_fr}
                          </h4>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#5C7449]/20">
                          <span className="text-[10px] text-[#5C7449] font-semibold">
                            {isGlobal 
                              ? (language === 'ar' ? 'مسار مشترك (الإدارة العامة)' : 'Parcours commun (Global)') 
                              : (language === 'ar' ? 'مسار تكويني مخصص' : 'Parcours personnalisé')}
                          </span>
                          
                          <button 
                            onClick={() => setSelectedTrack(track)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3E5C46] hover:underline"
                          >
                            <Info className="w-3.5 h-3.5" />
                            {language === 'ar' ? 'عرض البرنامج' : 'Voir syllabus'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* SVG VISUAL ANALYTICS */}
            {(() => {
              const totalTrainees = trainees.length;
              const completedTrainees = trainees.filter(t => t.progress === 100 || t.status === 'completed').length;
              const activeTrainees = totalTrainees - completedTrainees;

              const completedPercent = totalTrainees > 0 ? Math.round((completedTrainees / totalTrainees) * 100) : 0;
              const activePercent = totalTrainees > 0 ? 100 - completedPercent : 0;

              const activeEnrollments = allTracks.map(track => {
                const count = trainees.filter(t => t.trackId === track.id).length;
                return {
                  id: track.id,
                  title: language === 'ar' ? track.title_ar : track.title_fr,
                  count
                };
              });

              const displayedTracks = activeEnrollments.some(e => e.count > 0)
                ? activeEnrollments.filter(e => e.count > 0).sort((a, b) => b.count - a.count).slice(0, 4)
                : activeEnrollments.slice(0, 4);

              return (
                <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Donut Chart: Trainee Completion Status */}
                  <div className="bg-[#F3E4C9]/40 p-6 rounded-2xl border border-[#5C7449]/20 flex flex-col sm:flex-row items-center gap-6 justify-between animate-fadeIn">
                    <div className="flex-grow">
                      <h3 className="text-lg font-black text-[#3E5C46] mb-2 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#3E5C46]" />
                        {language === 'ar' ? 'حالة تقدم الموظفين' : 'Statut de progression des agents'}
                      </h3>
                      <p className="text-xs text-[#5C7449] mb-4 leading-relaxed">
                        {language === 'ar' ? 'توزع الموظفين بين نشطين ومكتملين لمسارهم التكويني.' : 'Répartition des employés entre actifs et diplômés certifiés.'}
                      </p>
                      
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 bg-[#CCD67F] rounded-full"></div>
                          <span className="text-xs font-bold text-[#3E5C46]">
                            {language === 'ar' ? 'مكتملون' : 'Diplômés (100%)'} : {completedTrainees}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 bg-[#3E5C46] rounded-full"></div>
                          <span className="text-xs font-bold text-[#3E5C46]">
                            {language === 'ar' ? 'قيد التكوين' : 'En formation (Actifs)'} : {activeTrainees}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Handcrafted SVG Donut */}
                    <div className="relative flex-shrink-0 w-32 h-32 flex items-center justify-center bg-transparent">
                      <svg width="100%" height="100%" viewBox="0 0 36 36" className="transform -rotate-90">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F3E4C9" strokeWidth="4" />
                        {totalTrainees > 0 ? (
                          <>
                            <circle 
                              cx="18" 
                              cy="18" 
                              r="15.9155" 
                              fill="none" 
                              stroke="#CCD67F" 
                              strokeWidth="4.5" 
                              strokeDasharray={`${completedPercent} ${100 - completedPercent}`}
                              strokeDashoffset="0"
                            />
                            <circle 
                              cx="18" 
                              cy="18" 
                              r="15.9155" 
                              fill="none" 
                              stroke="#3E5C46" 
                              strokeWidth="4.5" 
                              strokeDasharray={`${activePercent} ${100 - activePercent}`}
                              strokeDashoffset={-completedPercent}
                            />
                          </>
                        ) : (
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3E5C46" strokeWidth="4.5" strokeDasharray="100 0" />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-[#3E5C46]">{totalTrainees}</span>
                        <span className="text-[9px] font-bold text-[#5C7449] uppercase tracking-wider">
                          {language === 'ar' ? 'إجمالي الأعوان' : 'Total Agents'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart: Enrolled employees by track */}
                  <div className="bg-[#F3E4C9]/40 p-6 rounded-2xl border border-[#5C7449]/20 flex flex-col justify-between animate-fadeIn">
                    <div>
                      <h3 className="text-lg font-black text-[#3E5C46] mb-2 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-[#3E5C46]" />
                        {language === 'ar' ? 'توزع الموظفين حسب التخصصات' : 'Enrôlements par filière'}
                      </h3>
                      <p className="text-xs text-[#5C7449] mb-4 leading-relaxed">
                        {language === 'ar' ? 'تعداد الموظفين المسجلين في الشعب المهنية المعتمدة للمؤسسة.' : 'Nombre d’agents inscrits dans chaque filière.'}
                      </p>
                    </div>

                    <div className="flex-grow flex flex-col justify-center min-h-[120px]">
                      {displayedTracks.length > 0 && allTracks.length > 0 ? (
                        <svg viewBox="0 0 400 160" className="w-full h-auto">
                          {displayedTracks.map((item, index) => {
                            const maxCount = Math.max(...displayedTracks.map(t => t.count), 1);
                            const barWidth = totalTrainees > 0 ? (item.count / maxCount) * 230 : 0;
                            const y = index * 38 + 10;
                            return (
                              <g key={item.id}>
                                <text 
                                  x={dir === 'rtl' ? 390 : 10} 
                                  y={y + 10} 
                                  fill="#3E5C46" 
                                  fontSize="10" 
                                  fontWeight="bold"
                                  textAnchor={dir === 'rtl' ? 'end' : 'start'}
                                >
                                  {item.title.length > 30 ? item.title.slice(0, 28) + '...' : item.title}
                                </text>
                                <rect 
                                  x={dir === 'rtl' ? 10 : 150} 
                                  y={y + 14} 
                                  width="240" 
                                  height="8" 
                                  fill="#F3E4C9" 
                                  rx="4" 
                                />
                                <rect 
                                  x={dir === 'rtl' ? (250 - barWidth) : 150} 
                                  y={y + 14} 
                                  width={barWidth} 
                                  height="8" 
                                  fill="#3E5C46" 
                                  rx="4"
                                  className="transition-all duration-500"
                                />
                                <text 
                                  x={dir === 'rtl' ? 5 : 395} 
                                  y={y + 21} 
                                  fill="#3E5C46" 
                                  fontSize="10" 
                                  fontWeight="extrabold"
                                  textAnchor={dir === 'rtl' ? 'start' : 'end'}
                                >
                                  {item.count}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      ) : (
                        <div className="text-center text-xs text-[#5C7449] font-semibold py-8">
                          {language === 'ar' ? 'لا توجد بيانات شعب للتثبيت' : 'Aucune donnée d’inscription.'}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* DUAL COLUMN: HELPDESK INBOX & METRICS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
              
              {/* Support Inbox */}
              <div className="xl:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-[#5C7449]/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3E4C9] pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#3E5C46]" />
                    <h3 className="text-lg font-bold text-[#3E5C46]">
                      {language === 'ar' ? 'صندوق تذاكر الدعم الفني' : 'Messagerie du Support Technique'}
                    </h3>
                  </div>
                  
                  <div className="flex gap-1.5 bg-[#F3E4C9]/40 p-1 rounded-full border border-[#5C7449]/15">
                    {(['all', 'pending', 'resolved'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setTicketFilter(f)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                          ticketFilter === f 
                            ? 'bg-[#3E5C46] text-white' 
                            : 'text-[#5C7449] hover:bg-white/50'
                        }`}
                      >
                        {f === 'all' && (language === 'ar' ? 'الكل' : 'Tous')}
                        {f === 'pending' && (language === 'ar' ? 'المعلقة' : 'En attente')}
                        {f === 'resolved' && (language === 'ar' ? 'المحلولة' : 'Résolus')}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredTickets.length === 0 ? (
                  <div className="p-10 text-center bg-[#F3E4C9]/20 rounded-2xl border border-dashed border-[#5C7449]/20 text-[#5C7449] text-xs font-semibold">
                    {language === 'ar' ? 'لا توجد تذاكر دعم فني تطابق هذا الفلتر.' : 'Aucun ticket d’assistance ne correspond à ce filtre.'}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-2">
                    {filteredTickets.map(t => (
                      <div 
                        key={t.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          t.status === 'resolved' 
                            ? 'bg-[#CCD67F]/10 border-[#CCD67F]/40 opacity-80' 
                            : 'bg-[#F3E4C9]/30 border-[#5C7449]/15'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-[#5C7449] tracking-wider block mb-0.5">
                              {t.traineeName} ({language === 'ar' ? 'موظف' : 'Agent'})
                            </span>
                            <h4 className="text-sm font-bold text-[#3E5C46] leading-tight">
                              {t.subject}
                            </h4>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                              t.status === 'resolved' 
                                ? 'bg-[#CCD67F] text-[#3E5C46]' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {t.status === 'resolved' 
                                ? (language === 'ar' ? 'محلولة ✓' : 'Résolu ✓') 
                                : (language === 'ar' ? 'قيد المراجعة' : 'En attente')}
                            </span>

                            {t.status === 'pending' && (
                              <button
                                onClick={() => handleResolveTicket(t.id)}
                                className="px-3.5 py-1 bg-[#3E5C46] text-white hover:bg-[#CCD67F] hover:text-[#3E5C46] rounded-full text-[9px] font-black transition-all flex items-center gap-1 shadow-none"
                              >
                                <Check className="w-3 h-3" />
                                <span>{language === 'ar' ? 'تأكيد الحل' : 'Résoudre'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-[#2d2621] leading-relaxed font-medium mb-3">
                          {t.message}
                        </p>

                        <div className="flex justify-between items-center text-[9px] text-[#5C7449] font-bold font-mono border-t border-[#5C7449]/10 pt-2">
                          <span>ID: {t.id}</span>
                          <span>{new Date(t.createdAt).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Feedback Ratings */}
              <div className="xl:col-span-1 bg-[#3E5C46] text-[#F3E4C9] p-6 rounded-3xl">
                <div className="flex items-center gap-2 border-b border-[#5C7449]/30 pb-3 mb-4">
                  <Star className="w-5 h-5 text-[#CCD67F] fill-[#CCD67F]" />
                  <h3 className="text-base font-black text-white">
                    {language === 'ar' ? 'مؤشرات جودة التكوين' : 'Analyses Qualité (B2B)'}
                  </h3>
                </div>

                <p className="text-[10px] text-[#F3E4C9]/85 mb-5 leading-relaxed">
                  {language === 'ar' 
                    ? 'تقييمات إجبارية سرية يتم تعبئتها من قبل الموظفين فور إتمام الاختبارات لتأكيد مطابقة محتوى المقاييس للعمل الإداري.' 
                    : 'Moyennes réglementaires d’évaluation obtenues à partir des fiches remplies par vos agents.'}
                </p>

                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{language === 'ar' ? 'جودة المادة العلمية' : 'Pédagogie et Contenu'}</span>
                      <span className="text-[#CCD67F]">{avgs.quality} / 5.0</span>
                    </div>
                    <div className="w-full bg-[#5C7449]/40 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#CCD67F] h-full transition-all duration-500" style={{ width: `${(avgs.quality / 5) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{language === 'ar' ? 'المنصة التقنية والسرعة' : 'Outils et Ergonomie'}</span>
                      <span className="text-[#CCD67F]">{avgs.technical} / 5.0</span>
                    </div>
                    <div className="w-full bg-[#5C7449]/40 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#CCD67F] h-full transition-all duration-500" style={{ width: `${(avgs.technical / 5) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{language === 'ar' ? 'الفائدة الترقوية والعملية' : 'Utilité Professionnelle'}</span>
                      <span className="text-[#CCD67F]">{avgs.utility} / 5.0</span>
                    </div>
                    <div className="w-full bg-[#5C7449]/40 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#CCD67F] h-full transition-all duration-500" style={{ width: `${(avgs.utility / 5) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#5C7449]/30 pt-4">
                  <span className="text-[9px] font-black uppercase text-[#CCD67F] tracking-wider block mb-3">
                    {language === 'ar' ? 'آخر آراء وملاحظات المتكونين:' : 'Commentaires qualitatifs récents :'}
                  </span>

                  {evaluations.length === 0 ? (
                    <p className="text-[10px] text-[#F3E4C9]/70 italic py-2 text-center">
                      {language === 'ar' ? 'لا توجد تعليقات استمارات بعد.' : 'Aucun commentaire soumis.'}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto pr-1">
                      {evaluations.slice(0, 3).map(e => (
                        <div key={e.id} className="p-3 bg-[#5C7449]/30 rounded-xl">
                          <span className="text-[8px] font-black text-[#CCD67F] block mb-1">
                            {e.traineeName} • {e.moduleTitle}
                          </span>
                          <p className="text-[10px] text-white leading-relaxed italic">
                            &ldquo;{e.feedback || (language === 'ar' ? 'تقييم ممتاز بدون ملاحظات مكتوبة' : 'Évaluation sans commentaire')}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================================== TAB 2: TRAINEES / USERS ==================================== */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start animate-fadeIn">
            
            {/* Zebra table */}
            <div className="xl:col-span-8 flex flex-col gap-4 w-full bg-white p-6 sm:p-8 rounded-3xl border border-[#5C7449]/10">
              <div className="flex items-center justify-between border-b border-[#F3E4C9] pb-3">
                <h3 className="text-xl font-bold text-[#3E5C46]">
                  {t('traineeListTitle')}
                </h3>
                <div className="flex items-center gap-4">
                  {trainees.length > 0 && (
                    <button
                      onClick={exportTraineesToCSV}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3E5C46] hover:bg-[#5C7449] text-[#F3E4C9] hover:text-white rounded-full text-[10px] sm:text-xs font-bold transition-all"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#CCD67F]" />
                      <span>{language === 'ar' ? 'تصدير التقارير (Excel)' : 'Exporter (Excel)'}</span>
                    </button>
                  )}
                  <span className="text-xs text-[#5C7449] font-semibold">
                    {trainees.length} {language === 'ar' ? 'موظفين نشطين' : 'inscrits'}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-[#5C7449] font-bold text-xs">
                  {language === 'ar' ? 'جاري جلب قوائم المتكونين...' : 'Chargement de la liste des agents...'}
                </div>
              ) : trainees.length === 0 ? (
                <div className="p-12 text-center bg-[#F3E4C9]/20 rounded-2xl border border-dashed border-[#5C7449]/30 text-[#5C7449]">
                  {t('noTraineesYet')}
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="flat-table w-full">
                    <thead>
                      <tr>
                        <th>{language === 'ar' ? 'الاسم الكامل' : 'Nom de l’employé'}</th>
                        <th>{t('menuTracks')}</th>
                        <th>{t('deadline')}</th>
                        <th>{t('progress')}</th>
                        <th>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainees.map((t) => (
                        <tr key={t.id}>
                          <td className="font-bold text-[#3E5C46]">
                            <div>{t.name}</div>
                            <div className="text-[10px] text-[#5C7449] font-normal" dir="ltr">{t.email}</div>
                          </td>
                          <td className="text-xs font-semibold">
                            {language === 'ar' ? t.trackTitleAr : t.trackTitleFr}
                          </td>
                          <td className="text-xs text-[#3E5C46] font-mono">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#5C7449]" />
                              {t.deadline}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div className="w-20 progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${t.progress}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-[#3E5C46]">{t.progress}%</span>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setReassignTrainee(t);
                                  setReassignTargetTrackId(t.trackId || '');
                                }}
                                className="p-1.5 text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                title={language === 'ar' ? 'تغيير الرتبة' : 'Réassigner le grade'}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUnenrollEmployee(t.id, t.name)}
                                className="p-1.5 text-red-700 hover:bg-red-50 rounded transition-colors"
                                title={language === 'ar' ? 'إلغاء التعيين' : 'Désinscrire'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Enroll Trainee Form */}
            <div className="xl:col-span-4 bg-[#F3E4C9] p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-[#3E5C46] mb-2 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#3E5C46]" />
                {language === 'ar' ? 'تعيين موظف متكون' : 'Inscrire un employé'}
              </h3>
              <p className="text-xs text-[#5C7449] mb-6 leading-normal">
                {language === 'ar'
                  ? 'إلحاق موظف بأحد الشعب المهنية وتحديد آجال دراسة المقاييس للحصول على شهادة الترقية.'
                  : 'Inscrire un nouvel agent à un parcours et définir son échéance d’étude.'}
              </p>

              {allTracks.length === 0 ? (
                <div className="p-4 bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold leading-relaxed">
                  {language === 'ar' ? 'يرجى تهيئة رتب ومسارات للمؤسسة أولاً من تبويب الرتب لتتمكن من إلحاق الموظفين بها!' : 'Veuillez configurer vos parcours/grades d’abord depuis l’onglet Ranks pour pouvoir y inscrire vos employés.'}
                </div>
              ) : (
                <form onSubmit={handleEnrollEmployee} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#3E5C46] uppercase tracking-wider">
                      {t('employeeName')}
                    </label>
                    <input
                      type="text"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: سمير بوعلام' : 'Ex: Samir Boualam'}
                      className="underline-input text-sm"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#3E5C46] uppercase tracking-wider">
                      {t('employeeEmail')}
                    </label>
                    <input
                      type="email"
                      value={employeeEmail}
                      onChange={(e) => setEmployeeEmail(e.target.value)}
                      placeholder="s.boualam@apc-alger.dz"
                      className="underline-input text-sm"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#3E5C46] uppercase tracking-wider">
                      {t('selectTrack')}
                    </label>
                    <select
                      value={targetTrackId}
                      onChange={(e) => setTargetTrackId(e.target.value)}
                      className="underline-input text-xs font-bold text-[#3E5C46] bg-transparent py-2.5"
                    >
                      <option value="" disabled className="bg-[#fbf8f3]">{language === 'ar' ? '-- اختر رتبة تكوينية --' : '-- Choisir un grade --'}</option>
                      {globalTracks.length > 0 && (
                        <optgroup label={language === 'ar' ? '🌐 مسارات مشتركة' : '🌐 Parcours Globaux'}>
                          {globalTracks.map(track => (
                            <option key={track.id} value={track.id} className="bg-[#fbf8f3]">
                              {language === 'ar' ? track.title_ar : track.title_fr} ({getCategoryLabel(track.category)})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {companyTracks.length > 0 && (
                        <optgroup label={language === 'ar' ? '🏢 مسارات المؤسسة' : '🏢 Parcours Propres'}>
                          {companyTracks.map(track => (
                            <option key={track.id} value={track.id} className="bg-[#fbf8f3]">
                              {language === 'ar' ? track.title_ar : track.title_fr} ({getCategoryLabel(track.category)})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#3E5C46] uppercase tracking-wider">
                      {t('setDeadline')}
                    </label>
                    <input
                      type="date"
                      value={targetDeadline}
                      onChange={(e) => setTargetDeadline(e.target.value)}
                      className="underline-input text-xs font-bold text-[#3E5C46] bg-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-pill-sage w-full py-3 mt-4 text-xs font-bold"
                  >
                    {t('btnAssignEmployee')}
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

        {/* ==================================== TAB 3: RANKS & TRACKS CUSTOMIZER ==================================== */}
        {activeTab === 'ranks' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start animate-fadeIn">
            
            {/* List & Reorder / Delete */}
            <div className="xl:col-span-7 flex flex-col gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#5C7449]/10 w-full">
              <div className="border-b border-[#F3E4C9] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#3E5C46]">
                    {language === 'ar' ? 'تخصيص وترتيب رتب المؤسسة' : 'Ranks & Parcours de l’Établissement'}
                  </h3>
                  <p className="text-[11px] text-[#5C7449] mt-0.5 font-medium leading-relaxed">
                    {language === 'ar' ? 'حدد ترتيب رتب الموظفين (من الأول إلى الأخير) المعتمدة في امتحانات الترقية ببلديتكم أو قطاعكم.' : 'Modifiez la priorité réglementaire des parcours et l’ordre d’importance des formations.'}
                  </p>
                </div>
                {/* View Mode Selector */}
                <div className="flex bg-[#F3E4C9]/40 p-1 rounded-full border border-[#5C7449]/10">
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all flex items-center gap-1 ${viewMode === 'tree' ? 'bg-[#3E5C46] text-white' : 'text-[#3E5C46]/80 hover:text-[#3E5C46]'}`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'مخطط هرمي' : 'Aperçu Hiérarchique'}
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all flex items-center gap-1 ${viewMode === 'list' ? 'bg-[#3E5C46] text-white' : 'text-[#3E5C46]/80 hover:text-[#3E5C46]'}`}
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'قائمة بسيطة' : 'Liste Simple'}
                  </button>
                </div>
              </div>

              {companyTracks.length === 0 ? (
                <div className="p-12 text-center bg-[#F3E4C9]/20 rounded-2xl border border-dashed border-[#5C7449]/30 text-[#5C7449] font-bold text-xs">
                  {language === 'ar' ? 'لم تقم بتخصيص أي رتب بعد. ابدأ بإضافة رتبة جديدة من النموذج الجانبي!' : 'Aucun parcours configuré. Remplissez le formulaire ci-contre.'}
                </div>
              ) : viewMode === 'list' ? (
                <div className="flex flex-col gap-4">
                  {companyTracks.map((track, i) => (
                    <div 
                      key={track.id}
                      className="p-5 rounded-2xl bg-[#F3E4C9]/35 border border-[#5C7449]/15 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        {/* Order & Reordering buttons */}
                        <div className="flex flex-col items-center gap-1 bg-[#3E5C46]/10 p-2 rounded-xl">
                          <button
                            onClick={() => moveTrack(i, 'up')}
                            disabled={i === 0}
                            className={`p-1 rounded-full transition-colors ${i === 0 ? 'text-[#5C7449]/30 cursor-not-allowed' : 'text-[#3E5C46] hover:bg-[#3E5C46]/20'}`}
                            title={language === 'ar' ? 'نقل للأعلى (رتبة سابقة)' : 'Monter'}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          
                          <span className="text-xs font-black text-[#3E5C46] font-mono leading-none">
                            {i + 1}
                          </span>

                          <button
                            onClick={() => moveTrack(i, 'down')}
                            disabled={i === companyTracks.length - 1}
                            className={`p-1 rounded-full transition-colors ${i === companyTracks.length - 1 ? 'text-[#5C7449]/30 cursor-not-allowed' : 'text-[#3E5C46] hover:bg-[#3E5C46]/20'}`}
                            title={language === 'ar' ? 'نقل للأسفل (رتبة تالية)' : 'Descendre'}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <div className="flex gap-2 items-center mb-1">
                            <span className="px-2 py-0.5 bg-[#CCD67F] text-[#3E5C46] text-[9px] font-black rounded-full uppercase">
                              {getCategoryLabel(track.category)}
                            </span>
                            <span className="text-[10px] text-[#5C7449] font-bold">
                              {track.sector_ar} / {track.sector_fr}
                            </span>
                          </div>

                          <h4 className="text-base font-extrabold text-[#3E5C46] leading-tight">
                            {language === 'ar' ? track.title_ar : track.title_fr}
                          </h4>
                          <span className="text-[10px] text-[#5C7449] block mt-1 font-semibold">
                            📚 {track.modules_ar.length} {language === 'ar' ? 'مقاييس مبرمجة للدراسة' : 'modules programmés'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setEditingTrack(track);
                            setEditRankTitleAr(track.title_ar);
                            setEditRankTitleFr(track.title_fr);
                            setEditRankSectorAr(track.sector_ar);
                            setEditRankSectorFr(track.sector_fr);
                            setEditRankCategory(track.category);
                            setEditRankModulesArStr(track.modules_ar.join('\n'));
                            setEditRankModulesFrStr(track.modules_fr.join('\n'));
                          }}
                          className="p-2 text-[#3E5C46] hover:bg-[#3E5C46]/10 rounded-xl transition-colors"
                          title={language === 'ar' ? 'تعديل خصائص الرتبة' : 'Modifier'}
                        >
                          <Edit3 className="w-4.5 h-4.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteTrack(track.id, language === 'ar' ? track.title_ar : track.title_fr)}
                          className="p-2 text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                          title={language === 'ar' ? 'حذف هذه الرتبة' : 'Supprimer'}
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 bg-[#F3E4C9]/10 rounded-3xl border border-[#5C7449]/5 p-4 sm:p-6 w-full">
                  {companyTracks.map((track, i) => {
                    const rankTrainees = trainees.filter(t => t.trackId === track.id);
                    const isExpanded = expandedRanks[track.id];

                    return (
                      <React.Fragment key={track.id}>
                        {/* Rank Card */}
                        <div className="w-full max-w-2xl bg-white border-2 border-[#5C7449]/20 hover:border-[#3E5C46]/40 rounded-3xl shadow-sm transition-all overflow-hidden relative group">
                          {/* Top accent line */}
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3E5C46] to-[#CCD67F]"></div>
                          
                          <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between relative z-10">
                            
                            <div className="flex items-start sm:items-center gap-5 w-full">
                              {/* Level Badge */}
                              <div className="flex flex-col items-center justify-center w-12 h-12 bg-[#CCD67F]/20 rounded-2xl border border-[#CCD67F]/40 flex-shrink-0">
                                <span className="text-[10px] font-bold text-[#5C7449] uppercase leading-none mb-0.5">
                                  {language === 'ar' ? 'رتبة' : 'Niv.'}
                                </span>
                                <span className="text-xl font-black text-[#3E5C46] leading-none">
                                  {i + 1}
                                </span>
                              </div>

                              {/* Info */}
                              <div className="flex-1">
                                <div className="flex flex-wrap gap-2 items-center mb-1.5">
                                  <span className="px-2.5 py-0.5 bg-[#F3E4C9] text-[#3E5C46] text-[9px] font-black rounded-full uppercase">
                                    {getCategoryLabel(track.category)}
                                  </span>
                                  <span className="text-[10px] text-[#5C7449] font-bold">
                                    {language === 'ar' ? track.sector_ar : track.sector_fr}
                                  </span>
                                </div>
                                <h4 className="text-lg font-extrabold text-[#3E5C46] leading-tight mb-1">
                                  {language === 'ar' ? track.title_ar : track.title_fr}
                                </h4>
                                <div className="flex items-center gap-3 text-[10px] text-[#5C7449] font-semibold">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {track.modules_ar.length} {language === 'ar' ? 'مقاييس' : 'modules'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users2 className="w-3.5 h-3.5" />
                                    {rankTrainees.length} {language === 'ar' ? 'موظفين معينين' : 'employés assignés'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions on Card */}
                            <div className="flex items-center gap-1 bg-[#F3E4C9]/40 p-1.5 rounded-full border border-[#5C7449]/10">
                              <button
                                onClick={() => moveTrack(i, 'up')}
                                disabled={i === 0}
                                className={`p-1.5 rounded-full transition-colors ${i === 0 ? 'text-[#5C7449]/30 cursor-not-allowed' : 'text-[#3E5C46] hover:bg-white shadow-sm'}`}
                                title={language === 'ar' ? 'نقل للأعلى' : 'Monter'}
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveTrack(i, 'down')}
                                disabled={i === companyTracks.length - 1}
                                className={`p-1.5 rounded-full transition-colors ${i === companyTracks.length - 1 ? 'text-[#5C7449]/30 cursor-not-allowed' : 'text-[#3E5C46] hover:bg-white shadow-sm'}`}
                                title={language === 'ar' ? 'نقل للأسفل' : 'Descendre'}
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-px h-4 bg-[#5C7449]/20 mx-1"></div>
                              <button
                                onClick={() => {
                                  setEditingTrack(track);
                                  setEditRankTitleAr(track.title_ar);
                                  setEditRankTitleFr(track.title_fr);
                                  setEditRankSectorAr(track.sector_ar);
                                  setEditRankSectorFr(track.sector_fr);
                                  setEditRankCategory(track.category);
                                  setEditRankModulesArStr(track.modules_ar.join('\n'));
                                  setEditRankModulesFrStr(track.modules_fr.join('\n'));
                                }}
                                className="p-1.5 text-[#3E5C46] hover:bg-white shadow-sm rounded-full transition-colors"
                                title={language === 'ar' ? 'تعديل' : 'Modifier'}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTrack(track.id, language === 'ar' ? track.title_ar : track.title_fr)}
                                className="p-1.5 text-red-600 hover:bg-red-50 shadow-sm rounded-full transition-colors"
                                title={language === 'ar' ? 'حذف' : 'Supprimer'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Expandable Trainees Footer */}
                          <div className="border-t border-[#F3E4C9] bg-[#fbf8f3]">
                            <button 
                              onClick={() => toggleRankExpanded(track.id)}
                              className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold text-[#5C7449] hover:bg-[#F3E4C9]/40 transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <UserCog className="w-4 h-4" />
                                {language === 'ar' ? 'إدارة الموظفين في هذه الرتبة' : 'Gérer les employés de ce grade'}
                              </span>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {isExpanded && (
                              <div className="p-5 border-t border-[#F3E4C9]/50 animate-fadeIn bg-white/50">
                                {rankTrainees.length === 0 ? (
                                  <div className="text-center py-4 text-[11px] font-semibold text-[#5C7449] italic">
                                    {language === 'ar' ? 'لا يوجد موظفون معينون في هذه الرتبة حالياً.' : 'Aucun employé assigné à ce grade actuellement.'}
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-2">
                                    {rankTrainees.map(trainee => (
                                      <div key={trainee.id} className="flex items-center justify-between p-3 bg-white border border-[#F3E4C9] rounded-xl">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-[#CCD67F]/30 text-[#3E5C46] flex flex-col items-center justify-center font-black text-xs">
                                            {trainee.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                            <div className="text-xs font-bold text-[#3E5C46]">{trainee.name}</div>
                                            <div className="text-[10px] text-[#5C7449]">{trainee.email}</div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <div className="hidden sm:flex items-center gap-2 w-24">
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                              <div className="h-full bg-[#5C7449]" style={{ width: `${trainee.progress}%` }}></div>
                                            </div>
                                            <span className="text-[9px] font-black text-[#5C7449]">{trainee.progress}%</span>
                                          </div>
                                          <button
                                            onClick={() => {
                                              setReassignTrainee(trainee);
                                              setReassignTargetTrackId(trainee.trackId || '');
                                            }}
                                            className="px-3 py-1.5 bg-[#F3E4C9] hover:bg-[#3E5C46] text-[#3E5C46] hover:text-[#F3E4C9] rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1.5"
                                          >
                                            <RefreshCw className="w-3 h-3" />
                                            <span className="hidden sm:inline">
                                              {language === 'ar' ? 'تغيير الرتبة' : 'Réassigner'}
                                            </span>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Connector Line to Next Level */}
                        {i < companyTracks.length - 1 && (
                          <div className="flex flex-col items-center my-2 select-none z-0">
                            <div className="w-1 h-6 bg-gradient-to-b from-[#3E5C46]/30 to-[#5C7449]/30 rounded-full"></div>
                            <div className="my-1 text-[#3E5C46]/40">
                              <ArrowDown className="w-4 h-4" />
                            </div>
                            <div className="w-1 h-6 bg-gradient-to-b from-[#5C7449]/30 to-[#3E5C46]/30 rounded-full"></div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Create new Rank form */}
            <div className="xl:col-span-5 bg-[#F3E4C9] p-6 sm:p-8 rounded-2xl w-full">
              <h3 className="text-lg font-bold text-[#3E5C46] mb-2 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#3E5C46]" />
                {language === 'ar' ? 'إضافة رتبة أو سلك تكويني مخصص' : 'Créer une Rangement / Grade'}
              </h3>
              <p className="text-xs text-[#5C7449] mb-6 leading-normal">
                {language === 'ar'
                  ? 'أدخل رتب الموظفين المتاحة في مؤسستكم بالتفصيل لتخصيص محتواها للامتحانات المهنية والتربصات.'
                  : 'Créez un nouveau grade spécifique pour vos collaborateurs et attribuez-lui des examens.'}
              </p>

              <form onSubmit={handleAddCustomTrack} className="flex flex-col gap-4 text-xs font-semibold text-[#3E5C46]">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'الاسم بالفرنسية' : 'Titre du Grade (Français)'}</label>
                  <input
                    type="text"
                    value={newRankTitleFr}
                    onChange={(e) => setNewRankTitleFr(e.target.value)}
                    placeholder="Ex: Secrétaire Administratif Principal"
                    className="underline-input font-bold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'الاسم بالعربية' : 'Titre du Grade (Arabe)'}</label>
                  <input
                    type="text"
                    value={newRankTitleAr}
                    onChange={(e) => setNewRankTitleAr(e.target.value)}
                    placeholder="مثال: كاتب إدارة رئيسي"
                    className="underline-input text-right font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'القطاع بالعربية' : 'Branche (Arabe)'}</label>
                    <input
                      type="text"
                      value={newRankSectorAr}
                      onChange={(e) => setNewRankSectorAr(e.target.value)}
                      placeholder="عام و خاص"
                      className="underline-input text-right"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'القطاع بالفرنسية' : 'Branche (Français)'}</label>
                    <input
                      type="text"
                      value={newRankSectorFr}
                      onChange={(e) => setNewRankSectorFr(e.target.value)}
                      placeholder="Public et Privé"
                      className="underline-input"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'الفئة القانونية' : 'Catégorie de Grade'}</label>
                  <select
                    value={newRankCategory}
                    onChange={(e) => setNewRankCategory(e.target.value as 'joint' | 'research' | 'regional')}
                    className="underline-input bg-transparent py-2.5 font-bold"
                  >
                    <option value="joint" className="bg-[#fbf8f3] text-[#3E5C46]">Joint (الأسلاك المشتركة)</option>
                    <option value="research" className="bg-[#fbf8f3] text-[#3E5C46]">Research (دعم البحث العلمي)</option>
                    <option value="regional" className="bg-[#fbf8f3] text-[#3E5C46]">Regional (الأسلاك الإقليمية)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider">
                    📚 {language === 'ar' ? 'المقاييس أو المواد الدراسية بالفرنسية (مقياس واحد في كل سطر)' : 'Modules d’études en Français (Un par ligne)'}
                  </label>
                  <textarea
                    rows={3}
                    value={newRankModulesFrStr}
                    onChange={(e) => setNewRankModulesFrStr(e.target.value)}
                    placeholder={`Exemple:\nLégislation de la fonction publique\nRédaction administrative\nDroit constitutionnel`}
                    className="underline-input bg-transparent font-bold leading-relaxed whitespace-pre"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider">
                    📚 {language === 'ar' ? 'المقاييس أو المواد الدراسية بالعربية (مقياس واحد في كل سطر)' : 'Modules d’études en Arabe (Un par ligne)'}
                  </label>
                  <textarea
                    rows={3}
                    value={newRankModulesArStr}
                    onChange={(e) => setNewRankModulesArStr(e.target.value)}
                    placeholder={`مثال:\nقوانين الوظيفة العمومية\nتحرير إداري\nالقانون الدستوري`}
                    className="underline-input bg-transparent text-right font-bold leading-relaxed whitespace-pre"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-pill-sage w-full py-3 mt-4 text-xs font-bold"
                >
                  {language === 'ar' ? 'حفظ وإدراج الرتبة الجديدة' : 'Créer et Insérer le Grade'}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ==================================== TAB 4: LESSONS & PDF UPLOADER ==================================== */}
        {activeTab === 'lessons' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start animate-fadeIn">
            
            {/* Lessons table / Upload list */}
            <div className="xl:col-span-8 flex flex-col gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#5C7449]/10 w-full">
              <div className="border-b border-[#F3E4C9] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#3E5C46]">
                    {language === 'ar' ? 'مكتبة الملفات والدروس المرفوعة' : 'Bibliothèque des Leçons PDF'}
                  </h3>
                  <p className="text-[11px] text-[#5C7449] mt-0.5 font-medium leading-relaxed">
                    {language === 'ar' ? 'هنا تجد جميع ملفات PDF والدروس التي رفعتها لموظفيكم لمساعدتهم على التحضير والترقية.' : 'Retrouvez tous les syllabi, cours et documents PDF partagés avec vos collaborateurs.'}
                  </p>
                </div>
              </div>

              {globalLessons.length === 0 && lessons.length === 0 ? (
                <div className="p-12 text-center bg-[#F3E4C9]/20 rounded-2xl border border-dashed border-[#5C7449]/30 text-[#5C7449] font-bold text-xs">
                  {language === 'ar' ? 'لا توجد دروس مرفوعة بعد. استخدم النموذج الجانبي لرفع أول ملف PDF لموظفيك!' : 'Aucun document PDF téléversé pour le moment.'}
                </div>
              ) : (
                <div className="flex flex-col gap-4">

                  {/* Global lessons from Super Admin */}
                  {globalLessons.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 py-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#3E5C46] bg-[#CCD67F]/40 px-3 py-1 rounded-full">
                          🌐 {language === 'ar' ? 'دروس المنصة العامة (مشتركة)' : 'Leçons Plateforme (Globales)'}
                        </span>
                        <div className="flex-1 h-px bg-[#CCD67F]/40"></div>
                      </div>
                      {globalLessons.map((lesson) => (
                        <div 
                          key={lesson.id}
                          className="p-5 rounded-2xl bg-[#CCD67F]/15 border border-[#CCD67F]/50 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-[#5C7449] text-[#F3E4C9] p-3 rounded-xl">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] px-2 py-0.5 bg-[#5C7449] text-[#F3E4C9] font-black uppercase rounded-md tracking-wider">
                                  {lesson.moduleTitle}
                                </span>
                                <span className="text-[9px] px-2 py-0.5 bg-[#CCD67F] text-[#3E5C46] font-black uppercase rounded-md tracking-wider">
                                  {language === 'ar' ? 'عام' : 'Global'}
                                </span>
                              </div>
                              <h4 className="text-base font-extrabold text-[#3E5C46] leading-tight">
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#5C7449] font-semibold">
                                <span className="underline font-mono">{lesson.fileName}</span>
                                <span>•</span>
                                <span>{new Date(lesson.createdAt).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}</span>
                              </div>
                            </div>
                          </div>
                          <a
                            href={`/api/lesson/file?id=${lesson.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] font-bold text-[#3E5C46] bg-[#CCD67F] hover:bg-[#3E5C46] hover:text-white transition-colors py-1.5 px-3 rounded-lg shrink-0"
                            title={language === 'ar' ? 'فتح الملف PDF' : 'Ouvrir le PDF'}
                          >
                            <Download className="w-3.5 h-3.5" />
                            {language === 'ar' ? 'فتح PDF' : 'PDF'}
                          </a>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Company-specific lessons */}
                  {lessons.length > 0 && (
                    <>
                      {globalLessons.length > 0 && (
                        <div className="flex items-center gap-2 py-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#3E5C46] bg-[#F3E4C9] px-3 py-1 rounded-full">
                            🏢 {language === 'ar' ? 'دروس المؤسسة الخاصة' : 'Leçons Propres à l\'Établissement'}
                          </span>
                          <div className="flex-1 h-px bg-[#F3E4C9]"></div>
                        </div>
                      )}
                      {lessons.map((lesson) => (
                        <div 
                          key={lesson.id}
                          className="p-5 rounded-2xl bg-[#CCD67F]/10 border border-[#CCD67F]/40 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-[#3E5C46] text-[#F3E4C9] p-3 rounded-xl">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[9px] px-2 py-0.5 bg-[#3E5C46] text-[#F3E4C9] font-black uppercase rounded-md tracking-wider">
                                {lesson.moduleTitle}
                              </span>
                              <h4 className="text-base font-extrabold text-[#3E5C46] mt-1 leading-tight">
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#5C7449] font-semibold">
                                <span className="underline font-mono">{lesson.fileName}</span>
                                <span>•</span>
                                <span>{new Date(lesson.createdAt).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={`/api/lesson/file?id=${lesson.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-[#3E5C46] hover:bg-[#CCD67F]/40 rounded-xl transition-colors"
                              title={language === 'ar' ? 'فتح الملف PDF' : 'Ouvrir le PDF'}
                            >
                              <Download className="w-4.5 h-4.5" />
                            </a>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                              className="p-2 text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                              title={language === 'ar' ? 'حذف هذا الدرس' : 'Supprimer'}
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                </div>
              )}
            </div>

            {/* Upload form */}
            <div className="xl:col-span-4 bg-[#F3E4C9] p-6 sm:p-8 rounded-2xl w-full">
              <h3 className="text-lg font-bold text-[#3E5C46] mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#3E5C46]" />
                {language === 'ar' ? 'تحميل وثيقة أو درس PDF' : 'Téléverser un Cours / PDF'}
              </h3>
              <p className="text-xs text-[#5C7449] mb-6 leading-normal">
                {language === 'ar'
                  ? 'اختر الرتبة والمقياس، ثم ارفع مستند PDF (أو ملف نصي) ليظهر تلقائياً في فضاء المتكون الخاص بموظفيك.'
                  : 'Associez un document de formation aux chapitres officiels pour vos stagiaires.'}
              </p>

              {allTracks.length === 0 ? (
                <div className="p-4 bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold leading-relaxed">
                  {language === 'ar' ? 'يرجى إعداد مسارات ورتب للمؤسسة أولاً من تبويب الرتب قبل رفع الدروس!' : 'Créez un grade d\'abord pour pouvoir y lier des documents.'}
                </div>
              ) : (
                <form onSubmit={handleAddLesson} className="flex flex-col gap-4 text-xs font-semibold text-[#3E5C46]">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'عنوان الدرس / الوثيقة' : 'Titre de la Leçon'}</label>
                    <input
                      type="text"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: مدخل إلى أخلاقيات المهنة والواجبات' : 'Ex: Intro à la Déontologie Administrative'}
                      className="underline-input"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider mb-1">{language === 'ar' ? 'الرتب المستهدفة (يمكن اختيار متعدد)' : 'Formations Associées (Choix multiples)'}</label>
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border border-[#5C7449]/30 rounded-lg p-2 bg-[#fbf8f3]/50">
                      {globalTracks.length > 0 && (
                        <>
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#5C7449] px-1 pt-1">🌐 {language === 'ar' ? 'مسارات مشتركة' : 'Parcours Globaux'}</span>
                          {globalTracks.map((track) => (
                            <label key={track.id} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3E5C46] pl-2">
                              <input 
                                type="checkbox"
                                checked={newLessonTrackIds.includes(track.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewLessonTrackIds(prev => [...prev, track.id]);
                                  } else {
                                    setNewLessonTrackIds(prev => prev.filter(id => id !== track.id));
                                  }
                                }}
                                className="accent-[#5C7449]"
                              />
                              {language === 'ar' ? track.title_ar : track.title_fr}
                            </label>
                          ))}
                        </>
                      )}
                      {companyTracks.length > 0 && (
                        <>
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#5C7449] px-1 pt-1">🏢 {language === 'ar' ? 'مسارات المؤسسة' : 'Parcours Propres'}</span>
                          {companyTracks.map((track) => (
                            <label key={track.id} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3E5C46] pl-2">
                              <input 
                                type="checkbox"
                                checked={newLessonTrackIds.includes(track.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewLessonTrackIds(prev => [...prev, track.id]);
                                  } else {
                                    setNewLessonTrackIds(prev => prev.filter(id => id !== track.id));
                                  }
                                }}
                                className="accent-[#3E5C46]"
                              />
                              {language === 'ar' ? track.title_ar : track.title_fr}
                            </label>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* File Pick Drag-and-drop */}
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider">
                      📄 {language === 'ar' ? 'الملف المرفوع (مستند PDF أو نصي)' : 'Document à téléverser (PDF / TXT)'}
                    </label>
                    
                    <div className="relative border-2 border-dashed border-[#5C7449]/30 hover:border-[#3E5C46] rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#CCD67F]/10">
                      <input 
                        type="file" 
                        accept=".pdf,.txt,.docx,.png"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-8 h-8 text-[#3E5C46] mx-auto mb-2" />
                      <span className="text-xs font-bold text-[#3E5C46] block mb-1">
                        {newLessonFileName || (language === 'ar' ? 'اضغط هنا أو اسحب ملف PDF لرفعه' : 'Cliquez ou glissez un fichier ici')}
                      </span>
                      <span className="text-[9px] text-[#5C7449]/70 font-semibold block uppercase">
                        PDF, TXT, DOCX Max 25MB
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-pill-sage w-full py-3 mt-4 text-xs font-bold"
                  >
                    {language === 'ar' ? 'تأكيد تحميل الدرس الفني' : 'Téléverser le Document'}
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

        {/* ==================================== TAB: COMPANY MESSAGES ==================================== */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fadeIn">
            
            {/* Messages List */}
            <div className="xl:col-span-8">
              <h3 className="text-xl font-bold text-[#3E5C46] mb-6 border-b border-[#F3E4C9] pb-2 flex justify-between items-center">
                <span>{language === 'ar' ? 'سجل الإعلانات المرسلة' : 'Historique des Annonces'}</span>
                <span className="text-xs bg-[#CCD67F] text-[#3E5C46] px-3 py-1 rounded-full font-black">
                  {companyMessages.length} {language === 'ar' ? 'إعلان' : 'Annonce(s)'}
                </span>
              </h3>

              {companyMessages.length === 0 ? (
                <div className="text-center py-12 text-[#5C7449]/70 border-2 border-dashed border-[#F3E4C9] rounded-2xl">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 text-[#F3E4C9]" />
                  <p className="font-bold text-sm">
                    {language === 'ar' ? 'لم تقم بإرسال أي إعلانات بعد.' : 'Aucune annonce envoyée.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {companyMessages.map((msg) => (
                    <div key={msg.id} className="bg-white p-5 rounded-2xl border border-[#5C7449]/10 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all hover:shadow-md">
                      <div className="flex items-start gap-4 flex-grow">
                        <div className="bg-[#CCD67F]/20 p-2.5 rounded-xl shrink-0 mt-1">
                          <MessageSquare className="w-5 h-5 text-[#5C7449]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#3E5C46] leading-tight mb-1">
                            {msg.title}
                          </h4>
                          <p className="text-xs text-[#2d2621]/80 mb-2 whitespace-pre-wrap">{msg.content}</p>
                          <div className="text-[10px] text-[#5C7449] font-semibold">
                            <span>{new Date(msg.createdAt).toLocaleString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCompanyMessage(msg.id, msg.title)}
                        className="p-2 text-red-700 hover:bg-red-50 rounded-xl transition-colors self-start shrink-0"
                        title={language === 'ar' ? 'حذف الإعلان' : 'Supprimer l\'annonce'}
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Message Form */}
            <div className="xl:col-span-4 bg-[#F3E4C9] p-6 sm:p-8 rounded-2xl w-full">
              <h3 className="text-lg font-bold text-[#3E5C46] mb-2 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#3E5C46]" />
                {language === 'ar' ? 'إرسال إعلان جديد' : 'Nouvelle Annonce'}
              </h3>
              <p className="text-xs text-[#5C7449] mb-6 leading-normal">
                {language === 'ar'
                  ? 'سيظهر هذا الإعلان في لوحة تحكم جميع الموظفين التابعين لمؤسستك.'
                  : 'Cette annonce sera visible sur le tableau de bord de tous vos employés.'}
              </p>

              <form onSubmit={handleAddCompanyMessage} className="flex flex-col gap-4 text-xs font-semibold text-[#3E5C46]">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'عنوان الإعلان' : 'Titre de l\'annonce'}</label>
                  <input
                    type="text"
                    value={newMessageTitle}
                    onChange={(e) => setNewMessageTitle(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: تحديث حول مواعيد التدريب' : 'Ex: Mise à jour des horaires'}
                    className="underline-input"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'نص الإعلان' : 'Contenu du message'}</label>
                  <textarea
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب تفاصيل الإعلان هنا...' : 'Écrivez les détails ici...'}
                    className="underline-input min-h-[100px]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-pill-sage w-full py-3 mt-4 text-xs font-bold flex justify-center items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {language === 'ar' ? 'نشر الإعلان' : 'Publier l\'annonce'}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ==================================== TAB 5: COMPANY PROFILE SETTINGS ==================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white p-8 rounded-3xl border border-[#5C7449]/10 animate-fadeIn">
            <h3 className="text-xl font-bold text-[#3E5C46] mb-6 pb-2 border-b border-[#F3E4C9]">
              {language === 'ar' ? 'تعديل بيانات المؤسسة العامة' : 'Paramètres de l’Établissement'}
            </h3>

            <form onSubmit={handleSaveSettings} className="flex flex-col gap-6 text-sm font-semibold text-[#3E5C46]">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-[#5C7449]">
                  {language === 'ar' ? 'اسم الإدارة / المؤسسة العمومية' : 'Nom de l’Administration / Établissement'}
                </label>
                <input
                  type="text"
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  className="underline-input font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-[#5C7449]">
                  {language === 'ar' ? 'القطاع الإداري / النشاط' : 'Secteur administratif d’appartenance'}
                </label>
                <input
                  type="text"
                  value={editCompanySector}
                  onChange={(e) => setEditCompanySector(e.target.value)}
                  className="underline-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 opacity-60">
                <label className="text-[10px] uppercase font-black tracking-wider text-[#5C7449]">
                  {language === 'ar' ? 'البريد الإلكتروني الأساسي للمؤسسة (غير قابل للتعديل)' : 'Email Institutionnel (Non modifiable)'}
                </label>
                <input
                  type="email"
                  value={companyEmail}
                  className="underline-input cursor-not-allowed font-mono bg-transparent"
                  disabled
                />
              </div>

              <button
                type="submit"
                className="btn-pill-sage self-start px-8 py-3 mt-4 text-xs font-bold"
              >
                {t('save')}
              </button>
            </form>
          </div>
        )}

        {/* DYNAMIC SYLLABUS VIEWER OVERLAY */}
        {selectedTrack && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[#fbf8f3] max-w-lg w-full p-8 rounded-2xl border-2 border-[#3E5C46] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-[#F3E4C9] pb-4 mb-5">
                <div>
                  <span className="px-2.5 py-0.5 bg-[#CCD67F] text-[#3E5C46] text-[10px] font-bold rounded-full mb-1 inline-block">
                    {getCategoryLabel(selectedTrack.category)}
                  </span>
                  <h3 className="text-xl font-bold text-[#3E5C46]">
                    {language === 'ar' ? selectedTrack.title_ar : selectedTrack.title_fr}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedTrack(null)}
                  className="text-[#3E5C46] font-bold text-sm bg-[#F3E4C9] px-3 py-1 rounded-full"
                >
                  ✕
                </button>
              </div>

              <h4 className="text-xs font-bold text-[#5C7449] uppercase tracking-wider mb-3">
                📚 {t('moduleTitle')} ({selectedTrack.modules_ar.length})
              </h4>
              <ul className="flex flex-col gap-3">
                {(language === 'ar' ? selectedTrack.modules_ar : selectedTrack.modules_fr).map((module, i) => (
                   <li key={i} className="p-3 bg-[#F3E4C9] rounded-xl flex gap-3 items-center">
                    <span className="w-6 h-6 rounded-full bg-[#3E5C46] text-[#F3E4C9] flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-[#3E5C46]">{module}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* EDIT RANK PROPERTIES MODAL */}
        {editingTrack && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn animate-duration-200">
            <div className="bg-[#fbf8f3] max-w-xl w-full p-8 rounded-3xl border-2 border-[#3E5C46] max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#F3E4C9] pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#3E5C46]">
                    {language === 'ar' ? 'تعديل خصائص الرتبة' : 'Modifier les propriétés du Grade'}
                  </h3>
                  <p className="text-xs text-[#5C7449] mt-1 font-semibold">
                    {language === 'ar' ? 'قم بتعديل المسميات والقطاع والمقاييس المبرمجة لهذه الرتبة.' : 'Éditez les dénominations, le secteur et les modules d’examens.'}
                  </p>
                </div>
                <button 
                  onClick={() => setEditingTrack(null)}
                  className="text-[#3E5C46] font-bold text-sm bg-[#F3E4C9] hover:bg-[#3E5C46]/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditTrack} className="flex flex-col gap-5 text-xs font-bold text-[#3E5C46]">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'الاسم بالفرنسية' : 'Titre du Grade (Français)'}</label>
                  <input
                    type="text"
                    value={editRankTitleFr}
                    onChange={(e) => setEditRankTitleFr(e.target.value)}
                    className="underline-input text-[#3E5C46] font-bold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'الاسم بالعربية' : 'Titre du Grade (Arabe)'}</label>
                  <input
                    type="text"
                    value={editRankTitleAr}
                    onChange={(e) => setEditRankTitleAr(e.target.value)}
                    className="underline-input text-[#3E5C46] text-right font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'القطاع بالعربية' : 'Branche (Arabe)'}</label>
                    <input
                      type="text"
                      value={editRankSectorAr}
                      onChange={(e) => setEditRankSectorAr(e.target.value)}
                      className="underline-input text-[#3E5C46] text-right"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'القطاع بالفرنسية' : 'Branche (Français)'}</label>
                    <input
                      type="text"
                      value={editRankSectorFr}
                      onChange={(e) => setEditRankSectorFr(e.target.value)}
                      className="underline-input text-[#3E5C46]"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider">{language === 'ar' ? 'الفئة القانونية' : 'Catégorie de Grade'}</label>
                  <select
                    value={editRankCategory}
                    onChange={(e) => setEditRankCategory(e.target.value as 'joint' | 'research' | 'regional')}
                    className="underline-input bg-transparent py-2 text-[#3E5C46] font-bold"
                  >
                    <option value="joint" className="bg-[#fbf8f3]">Joint (الأسلاك المشتركة)</option>
                    <option value="research" className="bg-[#fbf8f3]">Research (دعم البحث العلمي)</option>
                    <option value="regional" className="bg-[#fbf8f3]">Regional (الأسلاك الإقليمية)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider">
                    📚 {language === 'ar' ? 'المقاييس أو المواد الدراسية بالفرنسية (مقياس واحد في كل سطر)' : 'Modules d’études en Français (Un par ligne)'}
                  </label>
                  <textarea
                    rows={4}
                    value={editRankModulesFrStr}
                    onChange={(e) => setEditRankModulesFrStr(e.target.value)}
                    className="underline-input bg-transparent font-bold leading-relaxed whitespace-pre text-[#3E5C46]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider">
                    📚 {language === 'ar' ? 'المقاييس أو المواد الدراسية بالعربية (مقياس واحد في كل سطر)' : 'Modules d’études en Arabe (Un par ligne)'}
                  </label>
                  <textarea
                    rows={4}
                    value={editRankModulesArStr}
                    onChange={(e) => setEditRankModulesArStr(e.target.value)}
                    className="underline-input bg-transparent text-right font-bold leading-relaxed whitespace-pre text-[#3E5C46]"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setEditingTrack(null)}
                    className="px-6 py-2.5 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold transition-all text-xs"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#5C7449] hover:bg-[#3E5C46] text-white font-bold transition-all text-xs"
                  >
                    {language === 'ar' ? 'حفظ التغييرات' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TRAINEE REASSIGNMENT MODAL */}
        {reassignTrainee && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn animate-duration-200">
            <div className="bg-[#fbf8f3] max-w-md w-full p-8 rounded-3xl border-2 border-[#3E5C46] shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#F3E4C9] pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-[#3E5C46]">
                    {language === 'ar' ? 'تغيير رتبة الموظف' : 'Réassigner le Grade de l’Employé'}
                  </h3>
                  <p className="text-xs text-[#5C7449] mt-1 font-semibold">
                    {language === 'ar' ? `الموظف: ${reassignTrainee.name}` : `Collaborateur: ${reassignTrainee.name}`}
                  </p>
                </div>
                <button 
                  onClick={() => setReassignTrainee(null)}
                  className="text-[#3E5C46] font-bold text-sm bg-[#F3E4C9] hover:bg-[#3E5C46]/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed font-bold">
                ⚠️ {language === 'ar' 
                  ? 'انتبه: سيؤدي تغيير الرتبة إلى إعادة ضبط تقدم الموظف بنسبة 0% وإعادة تعيين مقاييسه الدراسية وفقًا للمسار الجديد!' 
                  : 'Attention: Modifier le grade réinitialisera la progression à 0% et reconfigurera ses modules selon le nouveau parcours !'}
              </div>

              <form onSubmit={handleReassignTraineeTrack} className="flex flex-col gap-5 text-xs font-bold text-[#3E5C46]">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider">
                    {language === 'ar' ? 'الرتبة التكوينية الجديدة' : 'Nouveau Grade / Parcours Cible'}
                  </label>
                  <select
                    value={reassignTargetTrackId}
                    onChange={(e) => setReassignTargetTrackId(e.target.value)}
                    className="underline-input bg-transparent py-2.5 font-black text-[#3E5C46]"
                    required
                  >
                    <option value="" disabled className="bg-[#fbf8f3]">{language === 'ar' ? '-- اختر رتبة تكوينية --' : '-- Choisir un grade --'}</option>
                    {globalTracks.length > 0 && (
                      <optgroup label={language === 'ar' ? '🌐 مسارات مشتركة' : '🌐 Parcours Globaux'}>
                        {globalTracks.map(track => (
                          <option key={track.id} value={track.id} className="bg-[#fbf8f3]">
                            {language === 'ar' ? track.title_ar : track.title_fr} ({getCategoryLabel(track.category)})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {companyTracks.length > 0 && (
                      <optgroup label={language === 'ar' ? '🏢 مسارات المؤسسة' : '🏢 Parcours Propres'}>
                        {companyTracks.map(track => (
                          <option key={track.id} value={track.id} className="bg-[#fbf8f3]">
                            {language === 'ar' ? track.title_ar : track.title_fr} ({getCategoryLabel(track.category)})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setReassignTrainee(null)}
                    className="px-6 py-2.5 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold transition-all text-xs"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#5C7449] hover:bg-[#3E5C46] text-white font-bold transition-all text-xs"
                  >
                    {language === 'ar' ? 'تأكيد النقل وتحديث الرتبة' : 'Confirmer et Réassigner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
