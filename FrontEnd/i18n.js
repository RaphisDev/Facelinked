import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './assets/locales/en.json';
import de from './assets/locales/de.json';

const locales = Localization.getLocales();
const languageCode = locales?.length > 0 ? locales[0].languageCode : 'en';

i18n
    .use(initReactI18next)
    .init({
        lng: languageCode,
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
