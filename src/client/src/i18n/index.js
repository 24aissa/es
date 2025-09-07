import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  ar: {
    translation: {
      // App name and common
      appName: 'بيبي فايب',
      welcome: 'مرحباً بك في بيبي فايب',
      selectLanguage: 'اختر اللغة',
      continue: 'متابعة',
      loading: 'جاري التحميل...',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      
      // Navigation
      home: 'الرئيسية',
      products: 'المنتجات',
      children: 'الأطفال',
      orders: 'الطلبات',
      profile: 'الملف الشخصي',
      
      // Authentication
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      firstName: 'الاسم الأول',
      lastName: 'الاسم الأخير',
      phone: 'رقم الهاتف',
      
      // Child management
      addChild: 'إضافة طفل',
      childName: 'اسم الطفل',
      birthDate: 'تاريخ الميلاد',
      gender: 'الجنس',
      male: 'ذكر',
      female: 'أنثى',
      
      // Product categories
      clothing: 'الملابس',
      toys: 'الألعاب',
      feeding: 'الرضاعة والتغذية',
      hygiene: 'العناية والنظافة',
      furniture: 'الأثاث وغرف الأطفال',
      gifts: 'الهدايا والمناسبات',
      offers: 'العروض الخاصة',
      seasonal: 'المنتجات الموسمية',
      
      // Age and sizes
      age: 'العمر',
      size: 'المقاس',
      ageAppropriate: 'مناسب للعمر',
      sizeRecommendation: 'توصية المقاس',
      
      // Languages
      arabic: 'العربية',
      french: 'الفرنسية',
      algerian: 'الدارجة الجزائرية'
    }
  },
  fr: {
    translation: {
      // App name and common
      appName: 'BabyVibe',
      welcome: 'Bienvenue sur BabyVibe',
      selectLanguage: 'Choisir la langue',
      continue: 'Continuer',
      loading: 'Chargement...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      
      // Navigation
      home: 'Accueil',
      products: 'Produits',
      children: 'Enfants',
      orders: 'Commandes',
      profile: 'Profil',
      
      // Authentication
      login: 'Se connecter',
      register: 'Créer un compte',
      logout: 'Se déconnecter',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Numéro de téléphone',
      
      // Child management
      addChild: 'Ajouter un enfant',
      childName: 'Nom de l\'enfant',
      birthDate: 'Date de naissance',
      gender: 'Sexe',
      male: 'Garçon',
      female: 'Fille',
      
      // Product categories
      clothing: 'Vêtements',
      toys: 'Jouets',
      feeding: 'Alimentation',
      hygiene: 'Soins et hygiène',
      furniture: 'Meubles et chambres',
      gifts: 'Cadeaux et occasions',
      offers: 'Offres spéciales',
      seasonal: 'Produits saisonniers',
      
      // Age and sizes
      age: 'Âge',
      size: 'Taille',
      ageAppropriate: 'Adapté à l\'âge',
      sizeRecommendation: 'Recommandation de taille',
      
      // Languages
      arabic: 'Arabe',
      french: 'Français',
      algerian: 'Dialecte algérien'
    }
  },
  dz: {
    translation: {
      // App name and common
      appName: 'بيبي فايب',
      welcome: 'مرحبا بيك في بيبي فايب',
      selectLanguage: 'اختار اللغة',
      continue: 'كمل',
      loading: 'راه يحمل...',
      save: 'احفظ',
      cancel: 'الغي',
      delete: 'احذف',
      edit: 'بدل',
      add: 'زيد',
      
      // Navigation
      home: 'الرئيسية',
      products: 'الحوايج',
      children: 'الدراري',
      orders: 'الطلبات',
      profile: 'البروفيل',
      
      // Authentication
      login: 'دخل',
      register: 'اعمل حساب',
      logout: 'اخرج',
      email: 'الايميل',
      password: 'الموت دي باس',
      confirmPassword: 'أكد الموت دي باس',
      firstName: 'الاسم',
      lastName: 'اللقب',
      phone: 'رقم التليفون',
      
      // Child management
      addChild: 'زيد درّي',
      childName: 'اسم الدرّي',
      birthDate: 'تاريخ الولادة',
      gender: 'الجنس',
      male: 'ولد',
      female: 'بنت',
      
      // Product categories
      clothing: 'الحوايج',
      toys: 'اللعب',
      feeding: 'الماكلة والرضاعة',
      hygiene: 'النظافة',
      furniture: 'الموبيليا وشامبر الدراري',
      gifts: 'الكادوات',
      offers: 'العروض',
      seasonal: 'حوايج الفصل',
      
      // Age and sizes
      age: 'العمر',
      size: 'القياس',
      ageAppropriate: 'مناسب للعمر',
      sizeRecommendation: 'توصية القياس',
      
      // Languages
      arabic: 'العربية',
      french: 'الفرنسية',
      algerian: 'الدارجة الجزائرية'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // Default language
    fallbackLng: 'ar',
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;