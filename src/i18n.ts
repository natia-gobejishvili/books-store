import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ka from "./locales/ka.json";
import en from "./locales/en.json";

const savedLanguage = localStorage.getItem("language");

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ka: { translation: ka },
            en: { translation: en }
        },
        lng: savedLanguage || "ka",
        fallbackLng: "ka",
        interpolation: {
            escapeValue: false
        }
    });

i18n.on("languageChanged", (language) => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
});

document.documentElement.lang = i18n.language;

export default i18n;