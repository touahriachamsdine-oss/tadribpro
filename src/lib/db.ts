import { neon } from '@neondatabase/serverless';

// Types
export interface TrainingTrack {
  id: string;
  title_ar: string;
  title_fr: string;
  sector_ar: string;
  sector_fr: string;
  category: 'joint' | 'research' | 'regional';
  modules_ar: string[];
  modules_fr: string[];
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  email: string;
  traineeCount?: number;
  createdAt: string;
}

export interface Trainee {
  id: string;
  name: string;
  email: string;
  companyId: string;
  companyName: string;
  trackId: string;
  trackTitleAr: string;
  trackTitleFr: string;
  progress: number; // 0 to 100
  status: 'active' | 'completed';
  deadline: string;
  completedModules: string[]; // List of completed module titles/indices
}

export interface SupportTicket {
  id: string;
  traineeId: string;
  traineeName: string;
  companyId: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface CourseEvaluation {
  id: string;
  traineeId: string;
  traineeName: string;
  companyId: string;
  trackId: string;
  moduleTitle: string;
  ratingCourseQuality: number;
  ratingTechnicalPerformance: number;
  ratingGeneralUtility: number;
  feedback: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  traineeId: string;
  traineeName: string;
  companyId: string;
  companyName: string;
  trackId: string;
  trackTitleAr: string;
  trackTitleFr: string;
  issueDate: string;
  hash: string;
}

export interface Lesson {
  id: string;
  companyId: string;
  title: string;
  moduleTitle: string;
  trackIds?: string[];
  fileName: string;
  fileContent: string;
  createdAt: string;
}

export interface CompanyMessage {
  id: string;
  companyId: string;
  title: string;
  content: string;
  createdAt: string;
}

// 1. Preloaded Official Career Tracks (from official Algerian career frameworks)
export const OFFICIAL_TRACKS: TrainingTrack[] = [
  // ==================== I — الأسلاك المشتركة (Common Corps) ====================
  // --- 1. التكوين التكميلي ما قبل الترقية (Pre-Promotion Supplementary Training) ---
  {
    id: 'track-3',
    title_ar: 'مصرف - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Administrateur - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['القانون الإداري المعمق والنزاعات', 'تسيير الموارد البشرية في الإدارات', 'المالية العامة والجبائية المحلية', 'تنظيم الإدارة المركزية والمحلية'],
    modules_fr: ['Droit Administratif & Contentieux', 'Gestion des RH dans la Fonction Publique', 'Finances Publiques & Fiscalité Locale', 'Organisation Administrative Centrale et Locale']
  },
  {
    id: 'track-6',
    title_ar: 'مساعد مصرف - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Administrateur Assistant - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['مدخل إلى القانون العام', 'أسس التحرير والمراسلات الإدارية', 'تنظيم المكاتب والتوثيق', 'الإعلام الإداري الإلكتروني'],
    modules_fr: ['Introduction au Droit Public', 'Bases de Rédaction & Correspondance', 'Organisation des Bureaux & Archivage', 'Informatique Administrative & E-Gov']
  },
  {
    id: 'track-2',
    title_ar: 'ملحق الإدارة - تكوين تكميلي ما قبل الترقية',
    title_fr: "Attaché d'Administration - Formation Complémentaire Pré-Promotion",
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['الصفقات العمومية وإبرامها', 'قانون الميزانية والمحاسبة العمومية', 'منهجية التحرير الإداري المتقدم', 'تقنيات الاتصال والتسيير'],
    modules_fr: ['Passation des Marchés Publics', 'Budget & Comptabilité Publique', 'Méthodologie de Rédaction Avancée', 'Techniques de Communication & Management']
  },
  {
    id: 'track-4',
    title_ar: 'محاسب إداري رئيسي - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Comptable Administratif Principal - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['المحاسبة العمومية وتطبيقاتها', 'قانون الضرائب والرسوم في الجزائر', 'الرقابة المالية والميزانياتية', 'أنظمة الإعلام الآلي المحاسبية'],
    modules_fr: ['Comptabilité Publique Appliquée', 'Droit Fiscal & Taxes en Algérie', 'Contrôle Financier & Budgétaire', 'Systèmes Informatiques Comptables']
  },
  {
    id: 'track-11',
    title_ar: 'محاسب إداري - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Comptable Administratif - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['مبادئ المحاسبة العامة والعمومية', 'تسيير الميزانية والمصاريف', 'الجباية الإدارية والمراقبة', 'برمجيات المحاسبة الأساسية'],
    modules_fr: ['Principes de Comptabilité Générale', 'Gestion Budgétaire & Dépenses', 'Fiscalité Administrative & Contrôle', 'Logiciels de Comptabilité de Base']
  },
  {
    id: 'track-12',
    title_ar: 'مساعد مهندس مستوى أول في الإحصاء - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Ingénieur Assistant en Statistique Niveau 1 - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['التحليل الإحصائي للبيانات', 'منهجيات جمع العينات والمسح', 'برمجيات التحليل الإحصائي (SPSS/R)', 'الدراسات الديموغرافية والاجتماعية'],
    modules_fr: ['Analyse Statistique des Données', 'Méthodologies d’Échantillonnage', 'Logiciels d’Analyse Statistique', 'Études Démographiques & Sociales']
  },
  {
    id: 'track-13',
    title_ar: 'مساعد مهندس من المستوى الأول في الإعلام الآلي - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Ingénieur Assistant en Informatique Niveau 1 - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['هندسة البرمجيات والويب', 'إدارة وتأمين الشبكات المحلية', 'تطوير وتسيير قواعد البيانات', 'أمن المعلومات والحوكمة الرقمية'],
    modules_fr: ['Génie Logiciel & Web', 'Administration & Sécurité Réseaux', 'Développement & Gestion de BDD', 'Sécurité de l’Information & Gouvernance']
  },
  {
    id: 'track-14',
    title_ar: 'تقني سامي في الإحصاء - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Technicien Supérieur en Statistique - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['مبادئ الإحصاء الوصفي', 'تقنيات معالجة البيانات وجدولتها', 'تنظيم الاستمارات والتحقيقات الميدانية', 'الرياضيات التطبيقية والمعلوماتية'],
    modules_fr: ['Principes de Statistique Descriptive', 'Traitement & Tabulation des Données', 'Enquêtes & Questionnaires de Terrain', 'Mathématiques Appliquées & Informatique']
  },
  {
    id: 'track-5',
    title_ar: 'تقني سامي في الإعلام الآلي - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Technicien Supérieur en Informatique - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['صيانة الشبكات والعتاد الحاسوبي', 'إدارة قواعد البيانات وتأمينها', 'البرمجيات والأنظمة الإدارية المدمجة', 'قوانين حماية المعطيات الرقمية'],
    modules_fr: ['Maintenance Réseaux & Matériel', 'Administration & Sécurité des Bases de Données', 'Progiciels & Systèmes Intégrés', 'Lois de Protection des Données Numériques']
  },
  {
    id: 'track-15',
    title_ar: 'كاتب مدينة رئيسي - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Secrétaire de Ville Principal - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['التحرير الإداري الإقليمي المحترف', 'تسيير الأرشيف والتوثيق البلدي', 'قوانين الحالة المدنية والمنازعات', 'مهارات سكرتارية الإدارة العليا'],
    modules_fr: ['Rédaction Administrative Locale', 'Archivage & Documentation Municipale', 'Lois d’État Civil & Contentieux', 'Secrétariat de Direction Avancé']
  },
  {
    id: 'track-16',
    title_ar: 'كاتب مدينة - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Secrétaire de Ville - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['تقنيات الأمانة والاستقبال', 'التحرير الإداري والمراسلات', 'تنظيم المكاتب والملفات البلدية', 'الإعلام الآلي المكتبي والتطبيقات'],
    modules_fr: ['Techniques de Secrétariat & Accueil', 'Rédaction Administrative & Lettres', 'Organisation de Bureau & Dossiers', 'Bureautique & Applications Web']
  },
  {
    id: 'track-1',
    title_ar: 'عون إدارة - تكوين تكميلي ما قبل الترقية',
    title_fr: "Agent d'Administration - Formation Complémentaire Pré-Promotion",
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['قوانين الوظيفة العمومية الجزائرية', 'التحرير الإداري المبتدئ', 'معالجة النصوص وإعلام آلي أساسي', 'أخلاقيات المهنة والواجبات'],
    modules_fr: ['Loi de la Fonction Publique Algérienne', 'Rédaction Administrative Débutante', 'Traitement de Texte & Informatique', 'Déontologie & Devoirs Professionnels']
  },

  // --- 2. التكوين التحضيري أثناء فترة التربص (Preparatory Training During Internship) ---
  {
    id: 'track-17',
    title_ar: 'ملحق إدارة - تكوين تحضيري أثناء التربص',
    title_fr: "Attaché d'Administration - Formation Préparatoire Pendant Stage",
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['الاندماج في بيئة العمل الإداري', 'الهياكل التنظيمية للوظيفة العمومية', 'منهجية التحرير الرسمي والتواصل', 'حقوق وواجبات الموظف المتربص'],
    modules_fr: ['Intégration Professionnelle', 'Structures Administratives Publiques', 'Méthodologie de Rédaction Officielle', 'Droits & Devoirs du Stagiaire']
  },
  {
    id: 'track-18',
    title_ar: 'عون مكتب - تكوين تحضيري أثناء التربص',
    title_fr: "Agent de Bureau - Formation Préparatoire Pendant Stage",
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['تقنيات الاستقبال وتوجيه الجمهور', 'تنظيم وحفظ المستندات المكتوبة', 'أبجديات الإعلام الآلي المكتبي', 'السلوك والآداب المهنية'],
    modules_fr: ['Techniques d’Accueil & Orientation', 'Organisation & Classement Physique', 'Bases de la Bureautique', 'Savoir-être & Discipline']
  },
  {
    id: 'track-19',
    title_ar: 'عون إدارة رئيسي - تكوين تحضيري أثناء التربص',
    title_fr: "Agent d'Administration Principal - Formation Préparatoire Pendant Stage",
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['التسيير الإداري وسجل المراسلات', 'قواعد صياغة المراسلات والتقارير', 'إعلام آلي إداري ومعالجة النصوص', 'مبادئ المسؤولية والانضباط الإداري'],
    modules_fr: ['Gestion Administrative & Courriers', 'Rédaction de Notes & Rapports', 'Bureautique Appliquée & Saisie', 'Responsabilité & Discipline Administrative']
  },
  {
    id: 'track-20',
    title_ar: 'عون إدارة - تكوين تحضيري أثناء التربص',
    title_fr: "Agent d'Administration - Formation Préparatoire Pendant Stage",
    sector_ar: 'الأسلاك المشتركة',
    sector_fr: 'Corps Communs',
    category: 'joint',
    modules_ar: ['مدخل للوظيفة العمومية والتربص', 'التحرير الإداري الأولي والمراسلات', 'تنظيم المكاتب والتصنيف الورقي', 'الواجبات السلوكية للموظف الجديد'],
    modules_fr: ['Introduction à la Fonction Publique', 'Rédaction Initiale & Courriers', 'Classement & Organisation de Bureau', 'Déontologie de l’Agent Stagiaire']
  },

  // ==================== II — أسلاك مستخدمي دعم البحث (Research Support Corps) ====================
  // --- 1. التكوين التكميلي ما قبل الترقية ---
  {
    id: 'track-7',
    title_ar: 'مصرف البحث مستوى 1 - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Administrateur de Recherche Niveau 1 - Formation Complémentaire Pré-Promotion',
    sector_ar: 'أسلاك دعم البحث',
    sector_fr: 'Soutien à la Recherche',
    category: 'research',
    modules_ar: ['قوانين تنظيم البحث العلمي في الجزائر', 'تسيير تمويل المشاريع المخبرية', 'منهجية تقييم المخرجات العلمية', 'أخلاقيات البحث وحقوق الملكية'],
    modules_fr: ['Réglementation de la Recherche en Algérie', 'Gestion du Financement des Projets', 'Méthodologie d’Évaluation Scientifique', 'Éthique de Recherche & Propriété Intellectuelle']
  },
  {
    id: 'track-21',
    title_ar: 'مساعد رئيسي لتسيير البحث - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Assistant Principal de Gestion de Recherche - Formation Complémentaire Pré-Promotion',
    sector_ar: 'أسلاك دعم البحث',
    sector_fr: 'Soutien à la Recherche',
    category: 'research',
    modules_ar: ['التنسيق الإداري لمخابر البحث', 'تسيير المقتنيات العلمية والأجهزة', 'قواعد البيانات الببليوغرافية والنشر', 'تنظيم الملتقيات العلمية وتوثيقها'],
    modules_fr: ['Coordination Administrative des Labos', 'Gestion des Équipements Scientifiques', 'Bases de Données & Édition Scientifique', 'Organisation des Séminaires & Colloques']
  },
  {
    id: 'track-8',
    title_ar: 'مساعد تسيير البحث - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Assistant de Gestion de Recherche - Formation Complémentaire Pré-Promotion',
    sector_ar: 'أسلاك دعم البحث',
    sector_fr: 'Soutien à la Recherche',
    category: 'research',
    modules_ar: ['إدارة الأرشيف العلمي والتقني', 'تقنيات سكرتارية المخابر العلمية', 'تطبيقات معالجة المعطيات الإحصائية', 'الاتصال الإداري العلمي'],
    modules_fr: ['Gestion des Archives Scientifiques', 'Secrétariat des Laboratoires de Recherche', 'Logiciels Statistiques & Analyse', 'Communication Administrative Scientifique']
  },
  // --- 2. التكوين التحضيري أثناء فترة التربص ---
  {
    id: 'track-22',
    title_ar: 'مساعد تسيير البحث - تكوين تحضيري أثناء التربص',
    title_fr: 'Assistant de Gestion de Recherche - Formation Préparatoire Pendant Stage',
    sector_ar: 'أسلاك دعم البحث',
    sector_fr: 'Soutien à la Recherche',
    category: 'research',
    modules_ar: ['الاندماج المهني في هيئات البحث العلمي', 'هياكل التمويل والبحث في الجزائر', 'الأرشفة الرقمية والتوثيق للمشاريع', 'أخلاقيات وسلامة العمل المخبري الجديد'],
    modules_fr: ['Intégration au Secteur de la Recherche', 'Structures de Financement en Algérie', 'Archivage Numérique des Projets', 'Sécurité & Éthique Professionnelle du Labo']
  },

  // ==================== III — الأسلاك الإقليمية (Regional Corps) ====================
  // --- 1. التكوين التكميلي ما قبل الترقية ---
  {
    id: 'track-9',
    title_ar: 'مصرف إقليمي - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Administrateur Régional - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك الإقليمية',
    sector_fr: 'Administration Régionale',
    category: 'regional',
    modules_ar: ['قانون البلدية والولاية الجزائري', 'التسيير المالي للجماعات المحلية', 'الصفقات العمومية للمجالس المنتخبة', 'التنمية المحلية المستدامة'],
    modules_fr: ['Code Communal & de la Wilaya', 'Gestion Financière des Collectivités', 'Marchés Publics des Conseils Élus', 'Développement Local Durable']
  },
  {
    id: 'track-10',
    title_ar: 'ملحق الإدارة الإقليمية - تكوين تكميلي ما قبل الترقية',
    title_fr: "Attaché d'Administration Régionale - Formation Complémentaire Pré-Promotion",
    sector_ar: 'الأسلاك الإقليمية',
    sector_fr: 'Administration Régionale',
    category: 'regional',
    modules_ar: ['تنظيم وتسيير المكاتب المحلية', 'الحالة المدنية والمنازعات البلدية', 'التنسيق والاتصال المجتمعي', 'تحرير التقارير والمحاضر الرسمية'],
    modules_fr: ['Organisation & Gestion Municipale', 'État Civil & Contentieux Communaux', 'Coordination & Communication Sociale', 'Rédaction de Rapports & Procès-Verbaux']
  },
  {
    id: 'track-23',
    title_ar: 'محاسب الإدارة الإقليمية - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Comptable de l\'Administration Régionale - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك الإقليمية',
    sector_fr: 'Administration Régionale',
    category: 'regional',
    modules_ar: ['ميزانية الجماعات المحلية وإجراءاتها', 'محاسبة النفقات والإيرادات البلدية', 'تقنيات الجباية والرسوم المحلية', 'التطبيقات المحاسبية الإلكترونية للبلديات'],
    modules_fr: ['Budget des Collectivités & Procédures', 'Comptabilité des Recettes & Dépenses APC', 'Fiscalité Locale & Taxes Municipales', 'Applications Comptables Locales (E-APC)']
  },
  {
    id: 'track-24',
    title_ar: 'محاسب رئيسي للإدارة الإقليمية - تكوين تكميلي ما قبل الترقية',
    title_fr: 'Comptable Principal de l\'Administration Régionale - Formation Complémentaire Pré-Promotion',
    sector_ar: 'الأسلاك الإقليمية',
    sector_fr: 'Administration Régionale',
    category: 'regional',
    modules_ar: ['الرقابة المالية والتدقيق للجماعات المحلية', 'تسيير أزمة الميزانية وصناديق الضمان', 'منازعات الصفقات والمالية المحلية', 'عصرنة الأنظمة المحاسبية البلدية'],
    modules_fr: ['Contrôle Financier & Audit des Collectivités', 'Gestion de Crise Budgétaire & Fonds Commun', 'Contentieux des Marchés Municipaux', 'Modernisation des Systèmes de Comptabilité APC']
  },
  // --- 2. التكوين التحضيري أثناء فترة التربص ---
  {
    id: 'track-25',
    title_ar: 'ملحق الإدارة الإقليمية - تكوين تحضيري أثناء التربص',
    title_fr: "Attaché d'Administration Régionale - Formation Préparatoire Pendant Stage",
    sector_ar: 'الأسلاك الإقليمية',
    sector_fr: 'Administration Régionale',
    category: 'regional',
    modules_ar: ['الاندماج بالبلديات والولايات ومفهوم المرفق', 'الهيكل التنظيمي للمجلس الشعبي البلدي', 'التحرير الإداري للمذكرات والتبليغات المحلية', 'حقوق وواجبات الموظف الإقليمي المتربص'],
    modules_fr: ['Intégration aux APC/Wilayas & Service Public', 'Organigramme de l’APC & Fonctionnement', 'Rédaction Initiale de Notes Locales', 'Statut du Stagiaire de l’Administration Locale']
  },
  {
    id: 'track-26',
    title_ar: 'ملحق رئيسي للإدارة الإقليمية - تكوين تحضيري أثناء التربص',
    title_fr: "Attaché Principal d'Administration Régionale - Formation Préparatoire Pendant Stage",
    sector_ar: 'الأسلاك الإقليمية',
    sector_fr: 'Administration Régionale',
    category: 'regional',
    modules_ar: ['التنسيق الإداري المحلي للبرامج البلدية', 'تسيير الشكاوى والعلاقة مع المواطن', 'تحرير مشاريع المداولات والقرارات المحلية', 'المسؤولية الإدارية والمهنية للموظف المتربص'],
    modules_fr: ['Coordination Locale des Programmes Municipaux', 'Gestion des Réclamations & Relation Citoyen', 'Rédaction de Projets de Délibérations APC', 'Responsabilité Administrative de l’Agent Stagiaire']
  },
  {
    id: 'track-27',
    title_ar: 'محاسب الإدارة الإقليمية - تكوين تحضيري أثناء التربص',
    title_fr: 'Comptable de l\'Administration Régionale - Formation Préparatoire Pendant Stage',
    sector_ar: 'الأسلاك الإقليمية',
    sector_fr: 'Administration Régionale',
    category: 'regional',
    modules_ar: ['أسس المحاسبة العمومية للجماعات المحلية', 'هيكل ميزانية البلدية (تسيير وتجهيز)', 'مسار النفقات وتفويض الآمرين بالصرف', 'قوانين المحاسب العمومي والالتزامات'],
    modules_fr: ['Bases de Comptabilité Publique Locale', 'Structure du Budget APC (Secteur & Équipement)', 'Circuit de la Dépense Municipale', 'Rôle & Obligations Légales du Comptable']
  },
  {
    id: 'track-28',
    title_ar: 'محاسب رئيسي للإدارة الإقليمية - تكوين تحضيري أثناء التربص',
    title_fr: 'Comptable Principal de l\'Administration Régionale - Formation Préparatoire Pendant Stage',
    sector_ar: 'الأسلاك الإقليمية',
    sector_fr: 'Administration Régionale',
    category: 'regional',
    modules_ar: ['التنظيم المالي للجماعات المحلية وعلاقتها بالخزينة', 'مسار الصفقات العمومية التمهيدي للمجالس', 'التدقيق المالي الأولي للدفاتر البلدية', 'الواجبات القانونية والأخلاقية للمتربص المحاسب'],
    modules_fr: ['Organisation Financière des Collectivités & Trésor', 'Circuit Initial des Marchés Publics Communaux', 'Audit Budgétaire Préliminaire des Livres APC', 'Déontologie Légale du Comptable Stagiaire']
  }
];

// Initial preloaded databases for Local Fallback Simulation
const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'وزارة التعليم العالي والبحث العلمي',
    sector: 'التعليم العالي / Recherche',
    email: 'mesrs@takwinpro.dz',
    traineeCount: 2,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'comp-2',
    name: 'بلدية الجزائر الوسطى (APC)',
    sector: 'الإدارة المحلية / Wilaya',
    email: 'alger-centre@takwinpro.dz',
    traineeCount: 3,
    createdAt: '2026-02-15T11:30:00Z'
  },
  {
    id: 'comp-3',
    name: 'الصندوق الوطني للتقاعد (CNR)',
    sector: 'الحماية الاجتماعية / Securite Sociale',
    email: 'cnr@takwinpro.dz',
    traineeCount: 1,
    createdAt: '2026-03-01T09:00:00Z'
  }
];

const INITIAL_TRAINEES: Trainee[] = [
  {
    id: 'tr-1',
    name: 'سليم بن يوسف',
    email: 'salim@apc.dz',
    companyId: 'comp-2',
    companyName: 'بلدية الجزائر الوسطى (APC)',
    trackId: 'track-10',
    trackTitleAr: 'ملحق الإدارة الإقليمية',
    trackTitleFr: "Attaché d'Administration Régionale",
    progress: 75,
    status: 'active',
    deadline: '2026-08-30',
    completedModules: ['تنظيم وتسيير المكاتب المحلية', 'الحالة المدنية والمنازعات البلدية', 'تحرير التقارير والمحاضر الرسمية']
  },
  {
    id: 'tr-2',
    name: 'أمينة بوقرة',
    email: 'amina.b@mesrs.dz',
    companyId: 'comp-1',
    companyName: 'وزارة التعليم العالي والبحث العلمي',
    trackId: 'track-8',
    trackTitleAr: 'مساعد تسيير البحث',
    trackTitleFr: 'Assistant de Gestion de Recherche',
    progress: 25,
    status: 'active',
    deadline: '2026-10-15',
    completedModules: ['إدارة الأرشيف العلمي والتقني']
  },
  {
    id: 'tr-3',
    name: 'محمد الطاهر',
    email: 'med.tahar@apc.dz',
    companyId: 'comp-2',
    companyName: 'بلدية الجزائر الوسطى (APC)',
    trackId: 'track-1',
    trackTitleAr: 'عون إدارة',
    trackTitleFr: "Agent d'Administration",
    progress: 100,
    status: 'completed',
    deadline: '2026-05-15',
    completedModules: ['قوانين الوظيفة العمومية الجزائرية', 'التحرير الإداري المبتدئ', 'معالجة النصوص وإعلام آلي أساسي', 'أخلاقيات المهنة والواجبات']
  },
  {
    id: 'tr-4',
    name: 'فاطمة الزهراء بوعلام',
    email: 'f.boualam@cnr.dz',
    companyId: 'comp-3',
    companyName: 'الصندوق الوطني للتقاعد (CNR)',
    trackId: 'track-4',
    trackTitleAr: 'محاسب إداري رئيسي',
    trackTitleFr: 'Comptable Administratif Principal',
    progress: 50,
    status: 'active',
    deadline: '2026-09-01',
    completedModules: ['المحاسبة العمومية وتطبيقاتها', 'قانون الضرائب والرسوم في الجزائر']
  }
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tick-1',
    traineeId: 'tr-1',
    traineeName: 'سليم بن يوسف',
    companyId: 'comp-2',
    subject: 'مشكلة في تحميل المرفقات',
    message: 'السلام عليكم، لا أستطيع تحميل ملفات الدرس الثاني في مقياس الحالة المدنية. تظهر لي رسالة خطأ.',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'tick-2',
    traineeId: 'tr-4',
    traineeName: 'فاطمة الزهراء بوعلام',
    companyId: 'comp-3',
    subject: 'طلب تصحيح اللقب في الشهادة',
    message: 'Bonjour, j\'aimerais corriger l\'orthographe de mon nom de famille sur le certificat généré. C\'est Boualem avec un e.',
    status: 'resolved',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

const INITIAL_EVALUATIONS: CourseEvaluation[] = [
  {
    id: 'eval-1',
    traineeId: 'tr-3',
    traineeName: 'محمد الطاهر',
    companyId: 'comp-2',
    trackId: 'track-1',
    moduleTitle: 'قوانين الوظيفة العمومية الجزائرية',
    ratingCourseQuality: 5,
    ratingTechnicalPerformance: 4,
    ratingGeneralUtility: 5,
    feedback: 'شرح ممتاز وواضح جداً للقوانين والمواد المنظمة للوظيفة العمومية في الجزائر. شكراً لكم.',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'eval-2',
    traineeId: 'tr-3',
    traineeName: 'محمد الطاهر',
    companyId: 'comp-2',
    trackId: 'track-1',
    moduleTitle: 'التحرير الإداري المبتدئ',
    ratingCourseQuality: 4,
    ratingTechnicalPerformance: 5,
    ratingGeneralUtility: 4,
    feedback: 'Cours très pratique avec des modèles de lettres administratifs utiles au quotidien.',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'eval-3',
    traineeId: 'tr-1',
    traineeName: 'سليم بن يوسف',
    companyId: 'comp-2',
    trackId: 'track-10',
    moduleTitle: 'تنظيم وتسيير المكاتب المحلية',
    ratingCourseQuality: 4,
    ratingTechnicalPerformance: 4,
    ratingGeneralUtility: 3,
    feedback: 'مفيد، ولكن يرجى تزويدنا بالمزيد من الأمثلة التطبيقية حول الأرشيف البلدي.',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  }
];

const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'CERT-2026-0391',
    traineeId: 'tr-3',
    traineeName: 'محمد الطاهر',
    companyId: 'comp-2',
    companyName: 'بلدية الجزائر الوسطى (APC)',
    trackId: 'track-1',
    trackTitleAr: 'عون إدارة',
    trackTitleFr: "Agent d'Administration",
    issueDate: '2026-05-15',
    hash: '5f3c9e1a8b2d2f7c00e1'
  }
];

const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'les-seed-1',
    companyId: 'comp-2',
    title: 'منهجية تحرير المحاضر والتقارير الإدارية الرسمية',
    moduleTitle: 'تحرير التقارير والمحاضر الرسمية',
    trackIds: ['track-10'],
    fileName: 'rapport_reunion_modele.pdf',
    fileContent: `الجمهورية الجزائرية الديمقراطية الشعبية
ولاية الجزائر
بلدية الجزائر الوسطى
الأمانة العامة

نموذج رسمي: محضر اجتماع (Procès-verbal de Réunion)

التاريخ: 25 ماي 2026
المكان: قاعة الاجتماعات بمقر البلدية
الموضوع: دراسة تنظيم الحالة المدنية وتسهيل الإجراءات للمواطنين

في اليوم والخامس والعشرين من شهر ماي سنة ألفين وستة وعشرين، على الساعة العاشرة صباحاً، وبدعوة من السيد رئيس المجلس الشعبي البلدي لبلدية الجزائر الوسطى، اجتمع أعضاء اللجنة المكلفة بعصرنة المرفق العام بقاعة الاجتماعات، وذلك لدراسة جدول الأعمال التالي:
1. رقمنة سجلات الحالة المدنية القديمة.
2. تفعيل الشباك الموحد واستقبال المواطنين.

النقاط الرئيسية التي تم مناقشتها:
- استعراض مدى تقدم عملية المسح الضوئي لدفاتر الحالة المدنية للفترة (1990 - 2010).
- تنظيم مواعيد الاستقبال وتفويض الإمضاء لموظفي الفروع البلدية لتسريع التسليم.
- اقتراح آليات جديدة للتبليغ التلقائي بالرسائل القصيرة عند جاهزية الوثائق الخاصة بالنزاعات والمطابقات.

التوصيات والقرارات المتخذة:
- تكليف مصلحة الإعلام الآلي بإنهاء عملية الرقمنة قبل نهاية الفصل الحالي.
- تكليف ملحق الإدارة الإقليمية بمتابعة التنسيق اليومي مع الفروع البلدية الخمسة وإعداد تقرير أسبوعي.

رُفعت الجلسة في يومه وتاريخه على الساعة الثانية عشرة زوالاً.

المقرر: ملحق الإدارة الإقليمية (سليم بن يوسف)`,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'les-seed-2',
    companyId: 'comp-2',
    title: 'دليل إجراءات تسجيل وتعديل عقود الحالة المدنية',
    moduleTitle: 'الحالة المدنية والمنازعات البلدية',
    trackIds: ['track-10'],
    fileName: 'guide_etat_civil.pdf',
    fileContent: `الجمهورية الجزائرية الديمقراطية الشعبية
بلدية الجزائر الوسطى
مصلحة الحالة المدنية والمنازعات

دليل توجيهي: إجراءات تسجيل وتصحيح عقود الحالة المدنية

1. تسجيل المواليد والوفيات:
- يجب التصريح بالولادة لدى ضابط الحالة المدنية للبلدية مكان الولادة في غضون 5 أيام من الولادة.
- بالنسبة للوفيات، يجب التصريح بها في غضون 24 ساعة من الوفاة لدى بلدية مكان الوفاة من طرف الأقارب أو من تتوفر لديهم معلومات كاملة.

2. التصحيح الإداري والقضائي لعقود الحالة المدنية:
أ) التصحيح الإداري:
- يتم للأنواع البسيطة من الأخطاء المادية (مثل خطأ إملائي في اللقب أو الاسم) التي لا تؤثر على الهوية الجوهرية.
- يقدم الطلب إلى وكيل الجمهورية لدى المحكمة المختصة إقليمياً، والذي يأمر ضابط الحالة المدنية بإجراء التصحيح الهامشي.
ب) التصحيح القضائي:
- يتم بموجب أمر قضائي صادر عن رئيس المحكمة في الحالات المعقدة (إغفال تسجيل عقد، تغيير جوهري في الأسماء).
- يدوّن التصحيح فوراً في طرّة (هامش) العقد الأصلي في السجل الجاري والنسخة المودعة بأرشيف المحكمة.

3. معالجة المنازعات البلدية:
- في حال رفض ضابط الحالة المدنية تسجيل وثيقة، للمواطن الحق في رفع تظلم إداري أمام السيد رئيس المجلس الشعبي البلدي، أو اللجوء إلى القسم الإداري للمحكمة المختصة.`,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'les-seed-3',
    companyId: 'comp-2',
    title: 'قواعد التحرير الإداري وصياغة المراسلات الرسمية',
    moduleTitle: 'التحرير الإداري المبتدئ',
    trackIds: ['track-1'],
    fileName: 'redaction_administrative_base.pdf',
    fileContent: `الجمهورية الجزائرية الديمقراطية الشعبية
بلدية الجزائر الوسطى
مديرية الإدارة العامة

دليل قواعد التحرير الإداري وصياغة المراسلات الرسمية

التحرير الإداري هو الأسلوب المستخدم في إعداد الوثائق والمراسلات الرسمية داخل الإدارات العمومية. ويخضع لمجموعة من الضوابط والمبادئ الأساسية:

1. المبادئ الأساسية للتحرير الإداري:
- الموضوعية والحياد: تجنب التعبيرات الشخصية والعواطف والالتزام بالحقائق والنصوص القانونية.
- احترام التسلسل الإداري (Hierarchy): مخاطبة الجهات الأعلى بصيغة العرض والتوضيح ("يشرفني أن أعرض عليكم...")، والجهات الأدنى بصيغة التوجيه والطلب ("أطلب منكم...").
- الدقة والوضوح: استخدام عبارات محددة لا تقبل التأويل.
- اللطافة والكياسة: الحفاظ على أسلوب مؤدب ومحترم حتى في حالات الرفض أو التنبيه.

2. الهيكل العام للرسالة الإدارية الرسمية:
- الرأسية (En-tête): اسم الدولة الرسمي والوزارة أو الهيئة المصدرة للرسالة.
- الطابع الإداري (Timbre): يحدد المصلحة الفرعية التي أعدت الوثيقة.
- الرقم التسلسلي (Numéro d'enregistrement): للتسجيل في الوارد والصادر.
- المكان والتاريخ: (مثال: الجزائر في، 25 ماي 2026).
- صفة المرسل وصفة المرسل إليه: (مثال: من السيد رئيس المجلس الشعبي البلدي إلى السيد والي ولاية الجزائر).
- الموضوع (Objet): تلخيص مضمون الرسالة في كلمات وجيزة.
- المرجع (Référence): الإشارة إلى نص قانوني أو مراسلة سابقة (إن وجدت).

3. نموذج رسالة إدارية رسمية بين المصالح:
"يشرفني أن أنهي إلى علمكم أنه قد تم تحديد تاريخ انعقاد الدورة العادية للمجلس الشعبي البلدي يوم الإثنين القادم بمقر البلدية. وبناءً عليه، أرجو منكم اتخاذ كافة التدابير لتسهيل حضور ممثلي مصالحكم..."`,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

// Initialize LocalStorage Database if not exists
const initLocalStore = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('takwin_companies')) {
    localStorage.setItem('takwin_companies', JSON.stringify(INITIAL_COMPANIES));
  }
  if (!localStorage.getItem('takwin_trainees')) {
    localStorage.setItem('takwin_trainees', JSON.stringify(INITIAL_TRAINEES));
  }
  if (!localStorage.getItem('takwin_tickets')) {
    localStorage.setItem('takwin_tickets', JSON.stringify(INITIAL_TICKETS));
  }
  if (!localStorage.getItem('takwin_evaluations')) {
    localStorage.setItem('takwin_evaluations', JSON.stringify(INITIAL_EVALUATIONS));
  }
  if (!localStorage.getItem('takwin_certificates')) {
    localStorage.setItem('takwin_certificates', JSON.stringify(INITIAL_CERTIFICATES));
  }
  if (!localStorage.getItem('takwin_lessons')) {
    localStorage.setItem('takwin_lessons', JSON.stringify(INITIAL_LESSONS));
  }
};

const databaseUrl = process.env.DATABASE_URL;
const isServer = typeof window === 'undefined';
const isLiveNeon = !!databaseUrl;

// Setup server-side SQL client
const sql = isServer && isLiveNeon ? neon(databaseUrl) : null;

// Lightweight client-side API helper
async function callApiBridge(action: string, payload?: unknown): Promise<{ fallback: boolean; data?: unknown }> {
  if (typeof window === 'undefined') return { fallback: true };
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    if (res.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
      throw new Error('UNAUTHORIZED');
    }
    if (!res.ok) return { fallback: true };
    const body = await res.json();
    if (body.error === 'NO_DATABASE_URL') {
      return { fallback: true };
    }
    if (body.error === 'FORBIDDEN') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
      throw new Error('FORBIDDEN');
    }
    if (body.success) {
      return { fallback: false, data: body.data };
    }
    return { fallback: true };
  } catch (e) {
    console.warn('Neon DB HTTP bridge fetch failed, using offline fallback', e);
    return { fallback: true };
  }
}

export const db = {
  // --- COMPANIES ---
  async getCompanies(): Promise<Company[]> {
    if (isServer && isLiveNeon && sql) {
      try {
        const rows = await sql`
          SELECT c.*, COALESCE(t.cnt, 0)::integer as "traineeCount"
          FROM companies c
          LEFT JOIN (
            SELECT company_id, COUNT(*) as cnt
            FROM trainees
            GROUP BY company_id
          ) t ON c.id = t.company_id
          ORDER BY c.name ASC
        `;
        return rows.map(r => ({
          id: r.id,
          name: r.name,
          sector: r.sector,
          email: r.email,
          traineeCount: r.traineeCount,
          createdAt: r.created_at
        }));
      } catch (err) {
        console.error('Server getCompanies failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('getCompanies');
      if (!bridge.fallback) {
        return bridge.data as Company[];
      }
    }

    // Offline Browser fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_companies') || '[]');
    const trainees: Trainee[] = JSON.parse(localStorage.getItem('takwin_trainees') || '[]');
    return list.map((c: Company) => ({
      ...c,
      traineeCount: trainees.filter(t => t.companyId === c.id).length
    }));
  },

  async addCompany(name: string, sector: string, email: string): Promise<Company> {
    const newCompany = {
      id: 'comp-' + Math.random().toString(36).substr(2, 9),
      name,
      sector,
      email,
      traineeCount: 0,
      createdAt: new Date().toISOString()
    };

    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`
          INSERT INTO companies (id, name, sector, email, created_at)
          VALUES (${newCompany.id}, ${name}, ${sector}, ${email}, NOW())
          RETURNING *
        `;
        return {
          id: row.id,
          name: row.name,
          sector: row.sector,
          email: row.email,
          traineeCount: 0,
          createdAt: row.created_at
        };
      } catch (err) {
        console.error('Server addCompany failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('addCompany', newCompany);
      if (!bridge.fallback) {
        return bridge.data as Company;
      }
    }

    // Offline Browser fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_companies') || '[]');
    list.push(newCompany);
    localStorage.setItem('takwin_companies', JSON.stringify(list));
    return newCompany;
  },

  async deleteCompany(id: string): Promise<void> {
    if (isServer && isLiveNeon && sql) {
      try {
        await sql`DELETE FROM companies WHERE id = ${id}`;
        return;
      } catch (err) {
        console.error('Server deleteCompany failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('deleteCompany', { id });
      if (!bridge.fallback) {
        return;
      }
    }

    // Offline Browser fallback
    initLocalStore();
    let list = JSON.parse(localStorage.getItem('takwin_companies') || '[]');
    list = list.filter((c: Company) => c.id !== id);
    localStorage.setItem('takwin_companies', JSON.stringify(list));

    let trainees = JSON.parse(localStorage.getItem('takwin_trainees') || '[]');
    trainees = trainees.filter((t: Trainee) => t.companyId !== id);
    localStorage.setItem('takwin_trainees', JSON.stringify(trainees));
  },

  // --- TRAINEES ---
  async getTrainees(companyId?: string): Promise<Trainee[]> {
    if (isServer && isLiveNeon && sql) {
      try {
        let rows;
        if (companyId) {
          rows = await sql`SELECT * FROM trainees WHERE company_id = ${companyId} ORDER BY name ASC`;
        } else {
          rows = await sql`SELECT * FROM trainees ORDER BY name ASC`;
        }
        return rows.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          companyId: r.company_id,
          companyName: r.company_name,
          trackId: r.track_id,
          trackTitleAr: r.track_title_ar,
          trackTitleFr: r.track_title_fr,
          progress: r.progress,
          status: r.status,
          deadline: r.deadline,
          completedModules: r.completed_modules || []
        }));
      } catch (err) {
        console.error('Server getTrainees failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('getTrainees', { companyId });
      if (!bridge.fallback) {
        return bridge.data as Trainee[];
      }
    }

    // Offline Browser fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_trainees') || '[]');
    if (companyId) {
      return list.filter((t: Trainee) => t.companyId === companyId);
    }
    return list;
  },

  async assignTrainee(
    name: string,
    email: string,
    companyId: string,
    trackId: string,
    deadline: string
  ): Promise<Trainee> {
    const tracks = await this.getCompanyTracks(companyId);
    const track = tracks.find(t => t.id === trackId);
    if (!track) throw new Error('Selected Career Track is not registered.');

    let companyName = 'APC d\'Alger Centre';
    if (!isServer) {
      initLocalStore();
      const companies = JSON.parse(localStorage.getItem('takwin_companies') || '[]');
      const targetComp = companies.find((c: Company) => c.id === companyId);
      companyName = targetComp ? targetComp.name : companyName;
    }

    const newTrainee: Trainee = {
      id: 'tr-' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      companyId,
      companyName,
      trackId,
      trackTitleAr: track.title_ar,
      trackTitleFr: track.title_fr,
      progress: 0,
      status: 'active',
      deadline,
      completedModules: []
    };

    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`
          INSERT INTO trainees (id, name, email, company_id, company_name, track_id, track_title_ar, track_title_fr, progress, status, deadline, completed_modules, created_at)
          VALUES (${newTrainee.id}, ${name}, ${email}, ${companyId}, ${companyName}, ${trackId}, ${track.title_ar}, ${track.title_fr}, 0, 'active', ${deadline}, '{}', NOW())
          RETURNING *
        `;
        return {
          id: row.id,
          name: row.name,
          email: row.email,
          companyId: row.company_id,
          companyName: row.company_name,
          trackId: row.track_id,
          trackTitleAr: row.track_title_ar,
          trackTitleFr: row.track_title_fr,
          progress: row.progress,
          status: row.status,
          deadline: row.deadline,
          completedModules: row.completed_modules || []
        };
      } catch (err) {
        console.error('Server assignTrainee failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('assignTrainee', newTrainee);
      if (!bridge.fallback) {
        return bridge.data as Trainee;
      }
    }

    // Offline Browser fallback
    const list = JSON.parse(localStorage.getItem('takwin_trainees') || '[]');
    list.push(newTrainee);
    localStorage.setItem('takwin_trainees', JSON.stringify(list));
    return newTrainee;
  },

  async updateTraineeModule(traineeId: string, moduleTitle: string, isChecked: boolean): Promise<Trainee> {
    let currentTrainee: Trainee | null = null;

    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`SELECT * FROM trainees WHERE id = ${traineeId}`;
        if (row) {
          currentTrainee = {
            id: row.id,
            name: row.name,
            email: row.email,
            companyId: row.company_id,
            companyName: row.company_name,
            trackId: row.track_id,
            trackTitleAr: row.track_title_ar,
            trackTitleFr: row.track_title_fr,
            progress: row.progress,
            status: row.status,
            deadline: row.deadline,
            completedModules: row.completed_modules || []
          };
        }
      } catch (err) {
        console.error('Server fetch in updateTraineeModule failed:', err);
      }
    } else if (!isServer) {
      initLocalStore();
      const list: Trainee[] = JSON.parse(localStorage.getItem('takwin_trainees') || '[]');
      const local = list.find(t => t.id === traineeId);
      if (local) currentTrainee = local;
    }

    if (!currentTrainee) throw new Error('Trainee not found');

    const tracks = await this.getCompanyTracks(currentTrainee.companyId);
    const track = tracks.find(t => t.id === currentTrainee!.trackId);
    if (!track) throw new Error('Track not found');

    let completed = [...currentTrainee.completedModules];
    if (isChecked) {
      if (!completed.includes(moduleTitle)) {
        completed.push(moduleTitle);
      }
    } else {
      completed = completed.filter(m => m !== moduleTitle);
    }

    // Recalculate progress
    const totalModulesCount = track.modules_ar.length;
    const progress = totalModulesCount > 0 ? Math.round((completed.length / totalModulesCount) * 100) : 0;
    const status = progress === 100 ? 'completed' : 'active';

    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`
          UPDATE trainees
          SET completed_modules = ${completed}, progress = ${progress}, status = ${status}
          WHERE id = ${traineeId}
          RETURNING *
        `;
        return {
          id: row.id,
          name: row.name,
          email: row.email,
          companyId: row.company_id,
          companyName: row.company_name,
          trackId: row.track_id,
          trackTitleAr: row.track_title_ar,
          trackTitleFr: row.track_title_fr,
          progress: row.progress,
          status: row.status,
          deadline: row.deadline,
          completedModules: row.completed_modules || []
        };
      } catch (err) {
        console.error('Server updateTraineeModule failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('updateTraineeModule', { traineeId, completedModules: completed, progress, status });
      if (!bridge.fallback) {
        return bridge.data as Trainee;
      }
    }

    // Offline Browser fallback
    const list: Trainee[] = JSON.parse(localStorage.getItem('takwin_trainees') || '[]');
    const index = list.findIndex(t => t.id === traineeId);
    if (index !== -1) {
      const updated = {
        ...currentTrainee,
        completedModules: completed,
        progress,
        status: status as 'active' | 'completed'
      };
      list[index] = updated;
      localStorage.setItem('takwin_trainees', JSON.stringify(list));
      return updated;
    }
    throw new Error('Trainee not found');
  },

  async deleteTrainee(id: string): Promise<void> {
    if (isServer && isLiveNeon && sql) {
      try {
        await sql`DELETE FROM trainees WHERE id = ${id}`;
        return;
      } catch (err) {
        console.error('Server deleteTrainee failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('deleteTrainee', { id });
      if (!bridge.fallback) {
        return;
      }
    }

    // Offline Browser fallback
    initLocalStore();
    let list = JSON.parse(localStorage.getItem('takwin_trainees') || '[]');
    list = list.filter((t: Trainee) => t.id !== id);
    localStorage.setItem('takwin_trainees', JSON.stringify(list));
  },

  async updateTraineeTrack(traineeId: string, trackId: string, trackTitleAr: string, trackTitleFr: string): Promise<Trainee> {
    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`
          UPDATE trainees
          SET track_id = ${trackId}, track_title_ar = ${trackTitleAr}, track_title_fr = ${trackTitleFr}, progress = 0, completed_modules = '{}', status = 'active'
          WHERE id = ${traineeId}
          RETURNING *
        `;
        if (row) {
          return {
            id: row.id,
            name: row.name,
            email: row.email,
            companyId: row.company_id,
            companyName: row.company_name,
            trackId: row.track_id,
            trackTitleAr: row.track_title_ar,
            trackTitleFr: row.track_title_fr,
            progress: row.progress,
            status: row.status,
            deadline: row.deadline,
            completedModules: row.completed_modules || []
          };
        }
      } catch (err) {
        console.error('Server updateTraineeTrack failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('updateTraineeTrack', { traineeId, trackId, trackTitleAr, trackTitleFr });
      if (!bridge.fallback) {
        return bridge.data as Trainee;
      }
    }

    // Offline Browser fallback
    initLocalStore();
    const list: Trainee[] = JSON.parse(localStorage.getItem('takwin_trainees') || '[]');
    const index = list.findIndex(t => t.id === traineeId);
    if (index !== -1) {
      const updated = {
        ...list[index],
        trackId,
        trackTitleAr,
        trackTitleFr,
        progress: 0,
        completedModules: [],
        status: 'active' as const
      };
      list[index] = updated;
      localStorage.setItem('takwin_trainees', JSON.stringify(list));
      return updated;
    }
    throw new Error('Trainee not found');
  },

  // --- B2B SUPPORT TICKETS ---
  async getTickets(companyId?: string): Promise<SupportTicket[]> {
    if (isServer && isLiveNeon && sql) {
      try {
        let rows;
        if (companyId) {
          rows = await sql`SELECT * FROM support_tickets WHERE company_id = ${companyId} ORDER BY created_at DESC`;
        } else {
          rows = await sql`SELECT * FROM support_tickets ORDER BY created_at DESC`;
        }
        return rows.map(r => ({
          id: r.id,
          traineeId: r.trainee_id,
          traineeName: r.trainee_name,
          companyId: r.company_id,
          subject: r.subject,
          message: r.message,
          status: r.status,
          createdAt: r.created_at
        }));
      } catch (err) {
        console.error('Server getTickets failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('getTickets', { companyId });
      if (!bridge.fallback) {
        return bridge.data as SupportTicket[];
      }
    }

    // Offline fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_tickets') || '[]');
    if (companyId) {
      return list.filter((t: SupportTicket) => t.companyId === companyId);
    }
    return list;
  },

  async addTicket(
    traineeId: string,
    traineeName: string,
    companyId: string,
    subject: string,
    message: string
  ): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      id: 'tick-' + Math.random().toString(36).substr(2, 9),
      traineeId,
      traineeName,
      companyId,
      subject,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`
          INSERT INTO support_tickets (id, trainee_id, trainee_name, company_id, subject, message, status, created_at)
          VALUES (${newTicket.id}, ${traineeId}, ${traineeName}, ${companyId}, ${subject}, ${message}, 'pending', NOW())
          RETURNING *
        `;
        return {
          id: row.id,
          traineeId: row.trainee_id,
          traineeName: row.trainee_name,
          companyId: row.company_id,
          subject: row.subject,
          message: row.message,
          status: row.status,
          createdAt: row.created_at
        };
      } catch (err) {
        console.error('Server addTicket failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('addTicket', newTicket);
      if (!bridge.fallback) {
        return bridge.data as SupportTicket;
      }
    }

    // Offline fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_tickets') || '[]');
    list.push(newTicket);
    localStorage.setItem('takwin_tickets', JSON.stringify(list));
    return newTicket;
  },

  async updateTicketStatus(ticketId: string, status: 'pending' | 'resolved'): Promise<void> {
    if (isServer && isLiveNeon && sql) {
      try {
        await sql`UPDATE support_tickets SET status = ${status} WHERE id = ${ticketId}`;
        return;
      } catch (err) {
        console.error('Server updateTicketStatus failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('updateTicketStatus', { ticketId, status });
      if (!bridge.fallback) {
        return;
      }
    }

    // Offline fallback
    initLocalStore();
    const list: SupportTicket[] = JSON.parse(localStorage.getItem('takwin_tickets') || '[]');
    const idx = list.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      list[idx].status = status;
      localStorage.setItem('takwin_tickets', JSON.stringify(list));
    }
  },

  // --- COURSE EVALUATIONS ---
  async getCourseEvaluations(companyId?: string): Promise<CourseEvaluation[]> {
    if (isServer && isLiveNeon && sql) {
      try {
        let rows;
        if (companyId) {
          rows = await sql`SELECT * FROM course_evaluations WHERE company_id = ${companyId} ORDER BY created_at DESC`;
        } else {
          rows = await sql`SELECT * FROM course_evaluations ORDER BY created_at DESC`;
        }
        return rows.map(r => ({
          id: r.id,
          traineeId: r.trainee_id,
          traineeName: r.trainee_name,
          companyId: r.company_id,
          trackId: r.track_id,
          moduleTitle: r.module_title,
          ratingCourseQuality: r.rating_course_quality,
          ratingTechnicalPerformance: r.rating_technical_performance,
          ratingGeneralUtility: r.rating_general_utility,
          feedback: r.feedback,
          createdAt: r.created_at
        }));
      } catch (err) {
        console.error('Server getCourseEvaluations failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('getCourseEvaluations', { companyId });
      if (!bridge.fallback) {
        return bridge.data as CourseEvaluation[];
      }
    }

    // Offline fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_evaluations') || '[]');
    if (companyId) {
      return list.filter((e: CourseEvaluation) => e.companyId === companyId);
    }
    return list;
  },

  async addCourseEvaluation(
    traineeId: string,
    traineeName: string,
    companyId: string,
    trackId: string,
    moduleTitle: string,
    ratingCourseQuality: number,
    ratingTechnicalPerformance: number,
    ratingGeneralUtility: number,
    feedback: string
  ): Promise<CourseEvaluation> {
    const newEval: CourseEvaluation = {
      id: 'eval-' + Math.random().toString(36).substr(2, 9),
      traineeId,
      traineeName,
      companyId,
      trackId,
      moduleTitle,
      ratingCourseQuality,
      ratingTechnicalPerformance,
      ratingGeneralUtility,
      feedback,
      createdAt: new Date().toISOString()
    };

    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`
          INSERT INTO course_evaluations (id, trainee_id, trainee_name, company_id, track_id, module_title, rating_course_quality, rating_technical_performance, rating_general_utility, feedback, created_at)
          VALUES (${newEval.id}, ${traineeId}, ${traineeName}, ${companyId}, ${trackId}, ${moduleTitle}, ${ratingCourseQuality}, ${ratingTechnicalPerformance}, ${ratingGeneralUtility}, ${feedback}, NOW())
          RETURNING *
        `;
        return {
          id: row.id,
          traineeId: row.trainee_id,
          traineeName: row.trainee_name,
          companyId: row.company_id,
          trackId: row.track_id,
          moduleTitle: row.module_title,
          ratingCourseQuality: row.rating_course_quality,
          ratingTechnicalPerformance: row.rating_technical_performance,
          ratingGeneralUtility: row.rating_general_utility,
          feedback: row.feedback,
          createdAt: row.created_at
        };
      } catch (err) {
        console.error('Server addCourseEvaluation failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('addCourseEvaluation', newEval);
      if (!bridge.fallback) {
        return bridge.data as CourseEvaluation;
      }
    }

    // Offline fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_evaluations') || '[]');
    list.push(newEval);
    localStorage.setItem('takwin_evaluations', JSON.stringify(list));
    return newEval;
  },

  // --- CERTIFICATES ---
  async getCertificate(id: string): Promise<Certificate | null> {
    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`SELECT * FROM certificates WHERE id = ${id}`;
        if (!row) return null;
        return {
          id: row.id,
          traineeId: row.trainee_id,
          traineeName: row.trainee_name,
          companyId: row.company_id,
          companyName: row.company_name,
          trackId: row.track_id,
          trackTitleAr: row.track_title_ar,
          trackTitleFr: row.track_title_fr,
          issueDate: row.issue_date,
          hash: row.hash
        };
      } catch (err) {
        console.error('Server getCertificate failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('getCertificate', { id });
      if (!bridge.fallback) {
        return bridge.data as Certificate | null;
      }
    }

    // Offline fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_certificates') || '[]');
    return list.find((c: Certificate) => c.id === id || c.hash === id) || null;
  },

  async getCertificateByTrainee(traineeId: string): Promise<Certificate | null> {
    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`SELECT * FROM certificates WHERE trainee_id = ${traineeId}`;
        if (!row) return null;
        return {
          id: row.id,
          traineeId: row.trainee_id,
          traineeName: row.trainee_name,
          companyId: row.company_id,
          companyName: row.company_name,
          trackId: row.track_id,
          trackTitleAr: row.track_title_ar,
          trackTitleFr: row.track_title_fr,
          issueDate: row.issue_date,
          hash: row.hash
        };
      } catch (err) {
        console.error('Server getCertificateByTrainee failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('getCertificateByTrainee', { traineeId });
      if (!bridge.fallback) {
        return bridge.data as Certificate | null;
      }
    }

    // Offline fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_certificates') || '[]');
    return list.find((c: Certificate) => c.traineeId === traineeId) || null;
  },

  async addCertificate(
    traineeId: string,
    traineeName: string,
    companyId: string,
    companyName: string,
    trackId: string,
    trackTitleAr: string,
    trackTitleFr: string
  ): Promise<Certificate> {
    // Generate secure looking cert serial and hash
    const serial = 'CERT-2026-' + Math.floor(1000 + Math.random() * 9000);
    const hash = Math.random().toString(16).substr(2, 20);
    const issueDate = new Date().toISOString().slice(0, 10);

    const newCert: Certificate = {
      id: serial,
      traineeId,
      traineeName,
      companyId,
      companyName,
      trackId,
      trackTitleAr,
      trackTitleFr,
      issueDate,
      hash
    };

    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`
          INSERT INTO certificates (id, trainee_id, trainee_name, company_id, company_name, track_id, track_title_ar, track_title_fr, issue_date, hash)
          VALUES (${serial}, ${traineeId}, ${traineeName}, ${companyId}, ${companyName}, ${trackId}, ${trackTitleAr}, ${trackTitleFr}, ${issueDate}, ${hash})
          RETURNING *
        `;
        return {
          id: row.id,
          traineeId: row.trainee_id,
          traineeName: row.trainee_name,
          companyId: row.company_id,
          companyName: row.company_name,
          trackId: row.track_id,
          trackTitleAr: row.track_title_ar,
          trackTitleFr: row.track_title_fr,
          issueDate: row.issue_date,
          hash: row.hash
        };
      } catch (err) {
        console.error('Server addCertificate failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('addCertificate', newCert);
      if (!bridge.fallback) {
        return bridge.data as Certificate;
      }
    }

    // Offline fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_certificates') || '[]');
    list.push(newCert);
    localStorage.setItem('takwin_certificates', JSON.stringify(list));
    return newCert;
  },

  async verifyCertificate(code: string): Promise<Certificate | null> {
    if (isServer && isLiveNeon && sql) {
      try {
        const uppercaseCode = code.toUpperCase().trim();
        const [row] = await sql`
          SELECT * FROM certificates 
          WHERE UPPER(id) = ${uppercaseCode} OR hash = ${code.trim()}
        `;
        if (!row) return null;
        return {
          id: row.id,
          traineeId: row.trainee_id,
          traineeName: row.trainee_name,
          companyId: row.company_id,
          companyName: row.company_name,
          trackId: row.track_id,
          trackTitleAr: row.track_title_ar,
          trackTitleFr: row.track_title_fr,
          issueDate: row.issue_date,
          hash: row.hash
        };
      } catch (err) {
        console.error('Server verifyCertificate failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('verifyCertificate', { code });
      if (!bridge.fallback) {
        return bridge.data as Certificate | null;
      }
    }

    // Offline fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_certificates') || '[]');
    const normalized = code.toUpperCase().trim();
    return list.find((c: Certificate) => c.id.toUpperCase() === normalized || c.hash === code.trim()) || null;
  },

  // --- LESSONS ---
  async getLessons(companyId: string): Promise<Lesson[]> {
    if (isServer && isLiveNeon && sql) {
      try {
        const rows = await sql`
          SELECT * FROM lessons 
          WHERE company_id = ${companyId} 
          ORDER BY created_at DESC
        `;
        return rows.map(r => ({
          id: r.id,
          companyId: r.company_id,
          title: r.title,
          moduleTitle: r.module_title,
          trackIds: r.track_ids ? JSON.parse(r.track_ids) : [],
          fileName: r.file_name,
          fileContent: r.file_content,
          createdAt: r.created_at
        }));
      } catch (err) {
        console.error('Server getLessons failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('getLessons', { companyId });
      if (!bridge.fallback) {
        return bridge.data as Lesson[];
      }
    }

    // Offline fallback
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem('takwin_lessons') || '[]');
      return list.filter((l: Lesson) => l.companyId === companyId);
    }
    return [];
  },

  async addLesson(
    companyId: string,
    title: string,
    moduleTitle: string,
    fileName: string,
    fileContent: string,
    trackIds: string[] = []
  ): Promise<Lesson> {
    const newLesson: Lesson = {
      id: 'les-' + Math.random().toString(36).substr(2, 9),
      companyId,
      title,
      moduleTitle,
      trackIds,
      fileName,
      fileContent,
      createdAt: new Date().toISOString()
    };

    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`
          INSERT INTO lessons (id, company_id, title, module_title, track_ids, file_name, file_content, created_at)
          VALUES (${newLesson.id}, ${companyId}, ${title}, ${moduleTitle}, ${JSON.stringify(trackIds)}, ${fileName}, ${fileContent}, NOW())
          RETURNING *
        `;
        return {
          id: row.id,
          companyId: row.company_id,
          title: row.title,
          moduleTitle: row.module_title,
          trackIds: row.track_ids ? JSON.parse(row.track_ids) : [],
          fileName: row.file_name,
          fileContent: row.file_content,
          createdAt: row.created_at
        };
      } catch (err) {
        console.error('Server addLesson failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('addLesson', newLesson);
      if (!bridge.fallback) {
        return bridge.data as Lesson;
      }
    }

    // Offline fallback
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem('takwin_lessons') || '[]');
      list.push(newLesson);
      localStorage.setItem('takwin_lessons', JSON.stringify(list));
      return newLesson;
    }
    return newLesson;
  },

  async deleteLesson(id: string): Promise<void> {
    if (isServer && isLiveNeon && sql) {
      try {
        await sql`DELETE FROM lessons WHERE id = ${id}`;
        return;
      } catch (err) {
        console.error('Server deleteLesson failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('deleteLesson', { id });
      if (!bridge.fallback) {
        return;
      }
    }

    // Offline fallback
    if (typeof window !== 'undefined') {
      let list = JSON.parse(localStorage.getItem('takwin_lessons') || '[]');
      list = list.filter((l: Lesson) => l.id !== id);
      localStorage.setItem('takwin_lessons', JSON.stringify(list));
    }
  },

  // --- COMPANY MESSAGES ---
  async getCompanyMessages(companyId: string): Promise<CompanyMessage[]> {
    if (isServer && isLiveNeon && sql) {
      try {
        const rows = await sql`
          SELECT * FROM company_messages 
          WHERE company_id = ${companyId} 
          ORDER BY created_at DESC
        `;
        return rows.map(r => ({
          id: r.id,
          companyId: r.company_id,
          title: r.title,
          content: r.content,
          createdAt: r.created_at
        }));
      } catch (err) {
        console.error('Server getCompanyMessages failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('getCompanyMessages', { companyId });
      if (!bridge.fallback) {
        return bridge.data as CompanyMessage[];
      }
    }

    // Offline fallback
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem('takwin_company_messages') || '[]');
      return list.filter((m: CompanyMessage) => m.companyId === companyId);
    }
    return [];
  },

  async addCompanyMessage(companyId: string, title: string, content: string): Promise<CompanyMessage> {
    const newMessage: CompanyMessage = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      companyId,
      title,
      content,
      createdAt: new Date().toISOString()
    };

    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`
          INSERT INTO company_messages (id, company_id, title, content, created_at)
          VALUES (${newMessage.id}, ${companyId}, ${title}, ${content}, NOW())
          RETURNING *
        `;
        return {
          id: row.id,
          companyId: row.company_id,
          title: row.title,
          content: row.content,
          createdAt: row.created_at
        };
      } catch (err) {
        console.error('Server addCompanyMessage failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('addCompanyMessage', newMessage);
      if (!bridge.fallback) {
        return bridge.data as CompanyMessage;
      }
    }

    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem('takwin_company_messages') || '[]');
      list.push(newMessage);
      localStorage.setItem('takwin_company_messages', JSON.stringify(list));
      return newMessage;
    }
    return newMessage;
  },

  async deleteCompanyMessage(id: string): Promise<void> {
    if (isServer && isLiveNeon && sql) {
      try {
        await sql`DELETE FROM company_messages WHERE id = ${id}`;
        return;
      } catch (err) {
        console.error('Server deleteCompanyMessage failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('deleteCompanyMessage', { id });
      if (!bridge.fallback) {
        return;
      }
    }

    if (typeof window !== 'undefined') {
      let list = JSON.parse(localStorage.getItem('takwin_company_messages') || '[]');
      list = list.filter((m: CompanyMessage) => m.id !== id);
      localStorage.setItem('takwin_company_messages', JSON.stringify(list));
    }
  },

  // --- COMPANY TRACKS ---
  async getCompanyTracks(companyId: string): Promise<TrainingTrack[]> {
    if (isServer && isLiveNeon && sql) {
      try {
        const rows = await sql`
          SELECT * FROM company_tracks 
          WHERE company_id = ${companyId} 
          ORDER BY sort_order ASC
        `;
        return rows.map(r => ({
          id: r.track_id,
          title_ar: r.title_ar,
          title_fr: r.title_fr,
          sector_ar: r.sector_ar,
          sector_fr: r.sector_fr,
          category: r.category as 'joint' | 'research' | 'regional',
          modules_ar: r.modules_ar || [],
          modules_fr: r.modules_fr || []
        }));
      } catch (err) {
        console.error('Server getCompanyTracks failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('getCompanyTracks', { companyId });
      if (!bridge.fallback && Array.isArray(bridge.data)) {
        return bridge.data as TrainingTrack[];
      }
    }

    // Offline fallback
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('takwin_company_tracks_' + companyId);
      if (stored) {
        return JSON.parse(stored);
      }
    }

    // Return empty array instead of OFFICIAL_TRACKS so companies start fresh
    return [];
  },

  async saveCompanyTracks(companyId: string, tracks: TrainingTrack[]): Promise<void> {
    if (isServer && isLiveNeon && sql) {
      try {
        // Delete all and insert new ones
        await sql`DELETE FROM company_tracks WHERE company_id = ${companyId}`;
        for (let i = 0; i < tracks.length; i++) {
          const t = tracks[i];
          await sql`
            INSERT INTO company_tracks 
              (company_id, track_id, title_ar, title_fr, sector_ar, sector_fr, category, modules_ar, modules_fr, sort_order)
            VALUES 
              (${companyId}, ${t.id}, ${t.title_ar}, ${t.title_fr}, ${t.sector_ar}, ${t.sector_fr}, ${t.category}, ${t.modules_ar}, ${t.modules_fr}, ${i})
          `;
        }
        return;
      } catch (err) {
        console.error('Server saveCompanyTracks failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('saveCompanyTracks', { companyId, tracks });
      if (!bridge.fallback) {
        return;
      }
    }

    // Offline fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('takwin_company_tracks_' + companyId, JSON.stringify(tracks));
    }
  },

  // --- ADDITIONAL LOOKUPS FOR AUTH ---
  async getCompany(id: string): Promise<Company | null> {
    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`SELECT * FROM companies WHERE id = ${id}`;
        if (!row) return null;
        return {
          id: row.id,
          name: row.name,
          sector: row.sector,
          email: row.email,
          createdAt: row.created_at
        };
      } catch (err) {
        console.error('Server getCompany failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('getCompany', { id });
      if (!bridge.fallback) {
        return bridge.data as Company | null;
      }
    }

    // Offline fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_companies') || '[]');
    return list.find((c: Company) => c.id === id) || null;
  },

  async getCompanyByEmail(email: string): Promise<Company | null> {
    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`SELECT * FROM companies WHERE email = ${email}`;
        if (!row) return null;
        return {
          id: row.id,
          name: row.name,
          sector: row.sector,
          email: row.email,
          createdAt: row.created_at
        };
      } catch (err) {
        console.error('Server getCompanyByEmail failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('getCompanyByEmail', { email });
      if (!bridge.fallback) {
        return bridge.data as Company | null;
      }
    }

    // Offline fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_companies') || '[]');
    return list.find((c: Company) => c.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async updateCompany(id: string, name: string, sector: string, email?: string): Promise<void> {
    if (isServer && isLiveNeon && sql) {
      try {
        if (email) {
          await sql`
            UPDATE companies 
            SET name = ${name}, sector = ${sector}, email = ${email}
            WHERE id = ${id}
          `;
        } else {
          await sql`
            UPDATE companies 
            SET name = ${name}, sector = ${sector}
            WHERE id = ${id}
          `;
        }
        return;
      } catch (err) {
        console.error('Server updateCompany failed:', err);
      }
    } else if (!isServer) {
      await callApiBridge('updateCompany', { id, name, sector, email });
      return;
    }

    // Offline fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_companies') || '[]');
    const updated = list.map((c: Company) => c.id === id ? { ...c, name, sector, email: email || c.email } : c);
    localStorage.setItem('takwin_companies', JSON.stringify(updated));
  },

  async getTraineeByEmail(email: string): Promise<Trainee | null> {
    if (isServer && isLiveNeon && sql) {
      try {
        const [row] = await sql`SELECT * FROM trainees WHERE email = ${email}`;
        if (!row) return null;
        return {
          id: row.id,
          name: row.name,
          email: row.email,
          companyId: row.company_id,
          companyName: row.company_name,
          trackId: row.track_id,
          trackTitleAr: row.track_title_ar,
          trackTitleFr: row.track_title_fr,
          progress: row.progress,
          status: row.status,
          deadline: row.deadline,
          completedModules: row.completed_modules || []
        };
      } catch (err) {
        console.error('Server getTraineeByEmail failed:', err);
      }
    } else if (!isServer) {
      const bridge = await callApiBridge('getTraineeByEmail', { email });
      if (!bridge.fallback) {
        return bridge.data as Trainee | null;
      }
    }

    // Offline fallback
    initLocalStore();
    const list = JSON.parse(localStorage.getItem('takwin_trainees') || '[]');
    return list.find((t: Trainee) => t.email.toLowerCase() === email.toLowerCase()) || null;
  }
};
