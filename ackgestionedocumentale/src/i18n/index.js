import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      Archivio: "Archive", // Traduzione in inglese
      Profilo: "Profile",
      Documenti_salvati: "Saved Documents",
      Galleria: "Gallery",
      Documenti_firmati: "Signed Documents",
    },
  },
  it: {
    translation: {
      Archivio: "Archivio", // Traduzione in italiano
      Profilo: "Profilo",
      Documenti_salvati: "Documenti Salvati",
      Galleria: "Galleria",
      Documenti_firmati:"Documenti Firmati"
    },
  },
};

i18n
  .use(initReactI18next) // Collegamento a React
  .use(LanguageDetector) // Rileva la lingua
  .init({
    resources,
    fallbackLng: 'en', // Lingua di fallback
    interpolation: {
      escapeValue: false, // Protezione da XSS
    },
  });

export default i18n;
