import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Next": "Next",
      "Back": "Back",
      "Submit Survey": "Submit Survey",
      "Submitting...": "Submitting...",
      "Thank You": "Thank You",
      "survey_completed": "You have successfully completed the survey.",
      "Home": "Home",
      "Login": "Login",
      "About": "About",
      "Contact": "Contact",
      "Methodology": "Methodology",
      "Block": "Block",
      "Discovering Generations": "Discovering Generations",
      "About The Research": "About The Research",
      "Research Lab": "Research Lab",
      "Privacy Policy": "Privacy Policy",
      "Admin Access": "Admin Access",
      "Email Address": "Email Address",
      "Sign In": "Sign In",
      "Back to Home": "Back to Home",
      "Get in Touch": "Get in Touch",
      "Overview": "Overview",
      "Survey Builder": "Survey Builder",
      "CPT Task Builder": "CPT Task Builder",
      "Responses": "Responses",
      "Settings": "Settings",
      "Sign Out": "Sign Out",
      "Total Responses": "Total Responses",
      "Admin Profile": "Admin Profile",
      "Security Settings": "Security Settings",
      "Save Changes": "Save Changes"
    }
  },
  uz: {
    translation: {
      "Next": "Keyingisi",
      "Back": "Orqaga",
      "Submit Survey": "Yuborish",
      "Submitting...": "Yuborilmoqda...",
      "Thank You": "Rahmat",
      "survey_completed": "Siz so'rovnomani muvaffaqiyatli yakunladingiz.",
      "Home": "Asosiy",
      "Login": "Kirish",
      "About": "Loyiha haqida",
      "Contact": "Aloqa",
      "Methodology": "Metodologiya",
      "Block": "Blok",
      "Discovering Generations": "Avlodlarni O'rganish",
      "About The Research": "Tadqiqot Haqida",
      "Research Lab": "Tadqiqot Laboratoriyasi",
      "Privacy Policy": "Maxfiylik Siyosati",
      "Admin Access": "Admin Kirish",
      "Email Address": "Elektron Pochta",
      "Sign In": "Kirish",
      "Back to Home": "Asosiy sahifaga qaytish",
      "Get in Touch": "Biz Bilan Bog'laning",
      "Overview": "Umumiy ko'rinish",
      "Survey Builder": "Survey Builder",
      "CPT Task Builder": "CPT Task Builder",
      "Responses": "Javoblar",
      "Settings": "Sozlamalar",
      "Sign Out": "Chiqish",
      "Total Responses": "Jami Javoblar",
      "Admin Profile": "Admin Profili",
      "Security Settings": "Xavfsizlik sozlamalari",
      "Save Changes": "Saqlash"
    }
  },
  ru: {
    translation: {
      "Next": "Далее",
      "Back": "Назад",
      "Submit Survey": "Отправить",
      "Submitting...": "Отправка...",
      "Thank You": "Спасибо",
      "survey_completed": "Вы успешно завершили опрос.",
      "Home": "Главная",
      "Login": "Войти",
      "About": "О проекте",
      "Contact": "Контакты",
      "Methodology": "Методология",
      "Block": "Блок",
      "Discovering Generations": "Исследование Поколений",
      "About The Research": "Об исследовании",
      "Research Lab": "Исследовательская Лаборатория",
      "Privacy Policy": "Политика Конфиденциальности",
      "Admin Access": "Доступ для администратора",
      "Email Address": "Электронная почта",
      "Sign In": "Войти",
      "Back to Home": "На главную",
      "Get in Touch": "Свяжитесь с нами",
      "Overview": "Обзор",
      "Survey Builder": "Survey Builder",
      "CPT Task Builder": "CPT Task Builder",
      "Responses": "Ответы",
      "Settings": "Настройки",
      "Sign Out": "Выйти",
      "Total Responses": "Общие ответы",
      "Admin Profile": "Профиль администратора",
      "Security Settings": "Настройки безопасности",
      "Save Changes": "Сохранить изменения"
    }
  }
};

const savedLanguage = localStorage.getItem('i18nextLng') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, // default language from storage
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
