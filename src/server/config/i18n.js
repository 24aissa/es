const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const path = require('path');

// Initialize i18next for internationalization
i18next
  .use(Backend)
  .init({
    lng: process.env.DEFAULT_LANGUAGE || 'ar', // Default language (Arabic)
    fallbackLng: 'ar', // Fallback to Arabic
    
    // Backend configuration
    backend: {
      loadPath: path.join(__dirname, '../../../locales/{{lng}}/{{ns}}.json'),
    },
    
    // Namespace configuration
    ns: ['common', 'auth', 'product', 'order', 'error'],
    defaultNS: 'common',
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // Not needed for server side rendering
    },
    
    // Debug in development
    debug: process.env.NODE_ENV === 'development',
    
    // Detection options
    detection: {
      order: ['header', 'cookie', 'querystring'],
      caches: ['cookie'],
    },
    
    // Resources inline (for basic setup)
    resources: {
      ar: {
        common: {
          welcome: 'مرحباً بك في بيبي فايب',
          appName: 'بيبي فايب',
          loading: 'جاري التحميل...',
          save: 'حفظ',
          cancel: 'إلغاء',
          delete: 'حذف',
          edit: 'تعديل',
          add: 'إضافة',
          search: 'بحث',
          filter: 'فلترة',
          success: 'تم بنجاح',
          error: 'حدث خطأ',
          close: 'إغلاق'
        },
        auth: {
          login: 'تسجيل الدخول',
          register: 'إنشاء حساب',
          logout: 'تسجيل الخروج',
          email: 'البريد الإلكتروني',
          password: 'كلمة المرور',
          confirmPassword: 'تأكيد كلمة المرور',
          phone: 'رقم الهاتف',
          forgotPassword: 'نسيت كلمة المرور؟',
          loginWithGoogle: 'تسجيل الدخول بحساب جوجل',
          loginWithApple: 'تسجيل الدخول بحساب أبل'
        },
        product: {
          clothing: 'الملابس',
          toys: 'الألعاب',
          feeding: 'الرضاعة والتغذية',
          hygiene: 'العناية والنظافة',
          furniture: 'الأثاث وغرف الأطفال',
          gifts: 'الهدايا والمناسبات',
          offers: 'العروض الخاصة',
          seasonal: 'المنتجات الموسمية',
          addToCart: 'إضافة للسلة',
          price: 'السعر',
          size: 'المقاس',
          age: 'العمر',
          rating: 'التقييم'
        },
        error: {
          notFound: 'الصفحة غير موجودة',
          unauthorized: 'غير مخول للوصول',
          forbidden: 'ممنوع الوصول',
          serverError: 'خطأ في الخادم',
          validationError: 'خطأ في التحقق من البيانات'
        }
      },
      fr: {
        common: {
          welcome: 'Bienvenue sur BabyVibe',
          appName: 'BabyVibe',
          loading: 'Chargement...',
          save: 'Enregistrer',
          cancel: 'Annuler',
          delete: 'Supprimer',
          edit: 'Modifier',
          add: 'Ajouter',
          search: 'Rechercher',
          filter: 'Filtrer',
          success: 'Succès',
          error: 'Erreur',
          close: 'Fermer'
        },
        auth: {
          login: 'Se connecter',
          register: 'Créer un compte',
          logout: 'Se déconnecter',
          email: 'Email',
          password: 'Mot de passe',
          confirmPassword: 'Confirmer le mot de passe',
          phone: 'Numéro de téléphone',
          forgotPassword: 'Mot de passe oublié ?',
          loginWithGoogle: 'Se connecter avec Google',
          loginWithApple: 'Se connecter avec Apple'
        },
        product: {
          clothing: 'Vêtements',
          toys: 'Jouets',
          feeding: 'Alimentation',
          hygiene: 'Soins et hygiène',
          furniture: 'Meubles et chambres',
          gifts: 'Cadeaux et occasions',
          offers: 'Offres spéciales',
          seasonal: 'Produits saisonniers',
          addToCart: 'Ajouter au panier',
          price: 'Prix',
          size: 'Taille',
          age: 'Âge',
          rating: 'Évaluation'
        },
        error: {
          notFound: 'Page non trouvée',
          unauthorized: 'Non autorisé',
          forbidden: 'Accès interdit',
          serverError: 'Erreur du serveur',
          validationError: 'Erreur de validation'
        }
      },
      dz: {
        common: {
          welcome: 'مرحبا بيك في بيبي فايب',
          appName: 'بيبي فايب',
          loading: 'راه يحمل...',
          save: 'احفظ',
          cancel: 'الغي',
          delete: 'احذف',
          edit: 'بدل',
          add: 'زيد',
          search: 'دور',
          filter: 'فلتر',
          success: 'تمت',
          error: 'راه غالط',
          close: 'سكر'
        },
        auth: {
          login: 'دخل',
          register: 'اعمل حساب',
          logout: 'اخرج',
          email: 'الايميل',
          password: 'الموت دي باس',
          confirmPassword: 'أكد الموت دي باس',
          phone: 'رقم التليفون',
          forgotPassword: 'نسيت الموت دي باس؟',
          loginWithGoogle: 'دخل بحساب جوجل',
          loginWithApple: 'دخل بحساب أبل'
        },
        product: {
          clothing: 'الحوايج',
          toys: 'اللعب',
          feeding: 'الرضاعة والماكلة',
          hygiene: 'النظافة',
          furniture: 'الموبيليا وشامبر الدراري',
          gifts: 'الكادوات',
          offers: 'العروض',
          seasonal: 'حوايج الفصل',
          addToCart: 'حط في السلة',
          price: 'الثمن',
          size: 'القياس',
          age: 'العمر',
          rating: 'التقييم'
        },
        error: {
          notFound: 'الصفحة مش موجودة',
          unauthorized: 'ماعندكش صلاحية',
          forbidden: 'ممنوع الدخول',
          serverError: 'مشكل في السيرفر',
          validationError: 'غالط في البيانات'
        }
      }
    }
  });

// Middleware function to set language from request
const setLanguage = (req, res, next) => {
  const language = req.headers['accept-language'] || 
                   (req.query && req.query.lang) || 
                   (req.cookies && req.cookies.lang) || 
                   process.env.DEFAULT_LANGUAGE || 
                   'ar';
  
  // Validate language (only allow supported languages)
  const supportedLangs = ['ar', 'fr', 'dz'];
  const lang = supportedLangs.includes(language) ? language : 'ar';
  
  req.language = lang;
  i18next.changeLanguage(lang);
  
  // Add translation function to request
  req.t = (key, options) => i18next.t(key, { ...options, lng: lang });
  
  next();
};

module.exports = {
  i18next,
  init: setLanguage
};