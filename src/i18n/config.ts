import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import es from "./locales/es.json"
import en from "./locales/en.json"
import de from "./locales/de.json"
import it from "./locales/it.json"

const resources = {
  es: { translation: es },
  en: { translation: en },
  de: { translation: de },
  it: { translation: it },
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "es",
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
