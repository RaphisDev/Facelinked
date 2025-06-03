import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './assets/locales/en.json';
import de from './assets/locales/de.json';

i18n
    .use(initReactI18next)
    .init({
        lng: Localization.getLocales()[0].languageCode,
        fallbackLng: 'en',
        resources: {
            en: { translation: en },
            de: { translation: de },
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
