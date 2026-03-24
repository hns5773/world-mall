import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all language files
import en from './en.json';
import zh from './zh.json';
import zh_TW from './zh_TW.json';
import my from './my.json';
import id from './id.json';
import ms from './ms.json';
import vi from './vi.json';
import th from './th.json';
import ko from './ko.json';
import ja from './ja.json';
import hi from './hi.json';
import bn from './bn.json';
import es from './es.json';
import pt from './pt.json';
import fr from './fr.json';
import de from './de.json';
import it from './it.json';
import ru from './ru.json';
import ar from './ar.json';
import fa from './fa.json';
import tr from './tr.json';
import pl from './pl.json';
import nl from './nl.json';
import uk from './uk.json';
import cs from './cs.json';
import sv from './sv.json';
import no from './no.json';
import da from './da.json';
import fi from './fi.json';
import el from './el.json';
import hu from './hu.json';
import ro from './ro.json';
import bg from './bg.json';
import hr from './hr.json';
import sk from './sk.json';
import sl from './sl.json';
import et from './et.json';
import lv from './lv.json';
import lt from './lt.json';
import sr from './sr.json';
import bs from './bs.json';
import sq from './sq.json';
import mk from './mk.json';
import be from './be.json';
import kk from './kk.json';
import mn from './mn.json';
import az from './az.json';
import ka from './ka.json';
import he from './he.json';
import sw from './sw.json';
import ha from './ha.json';
import yo from './yo.json';
import ig from './ig.json';
import am from './am.json';
import zu from './zu.json';
import xh from './xh.json';
import af from './af.json';
import tl from './tl.json';
import km from './km.json';
import lo from './lo.json';
import si from './si.json';
import ne from './ne.json';
import pa from './pa.json';
import gu from './gu.json';
import ta from './ta.json';
import te from './te.json';
import kn from './kn.json';
import ml from './ml.json';
import ur from './ur.json';
import mr from './mr.json';
import eu from './eu.json';

const savedLang = localStorage.getItem('worldmall_lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    zh_TW: { translation: zh_TW },
    my: { translation: my },
    id: { translation: id },
    ms: { translation: ms },
    vi: { translation: vi },
    th: { translation: th },
    ko: { translation: ko },
    ja: { translation: ja },
    hi: { translation: hi },
    bn: { translation: bn },
    es: { translation: es },
    pt: { translation: pt },
    fr: { translation: fr },
    de: { translation: de },
    it: { translation: it },
    ru: { translation: ru },
    ar: { translation: ar },
    fa: { translation: fa },
    tr: { translation: tr },
    pl: { translation: pl },
    nl: { translation: nl },
    uk: { translation: uk },
    cs: { translation: cs },
    sv: { translation: sv },
    no: { translation: no },
    da: { translation: da },
    fi: { translation: fi },
    el: { translation: el },
    hu: { translation: hu },
    ro: { translation: ro },
    bg: { translation: bg },
    hr: { translation: hr },
    sk: { translation: sk },
    sl: { translation: sl },
    et: { translation: et },
    lv: { translation: lv },
    lt: { translation: lt },
    sr: { translation: sr },
    bs: { translation: bs },
    sq: { translation: sq },
    mk: { translation: mk },
    be: { translation: be },
    kk: { translation: kk },
    mn: { translation: mn },
    az: { translation: az },
    ka: { translation: ka },
    he: { translation: he },
    sw: { translation: sw },
    ha: { translation: ha },
    yo: { translation: yo },
    ig: { translation: ig },
    am: { translation: am },
    zu: { translation: zu },
    xh: { translation: xh },
    af: { translation: af },
    tl: { translation: tl },
    km: { translation: km },
    lo: { translation: lo },
    si: { translation: si },
    ne: { translation: ne },
    pa: { translation: pa },
    gu: { translation: gu },
    ta: { translation: ta },
    te: { translation: te },
    kn: { translation: kn },
    ml: { translation: ml },
    ur: { translation: ur },
    mr: { translation: mr },
    eu: { translation: eu },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文简体', flag: '🇨🇳' },
  { code: 'zh_TW', name: '中文繁體', flag: '🇹🇼' },
  { code: 'my', name: 'မြန်မာဘာသာ', flag: '🇲🇲' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'sr', name: 'Srpski', flag: '🇷🇸' },
  { code: 'bs', name: 'Bosanski', flag: '🇧🇦' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
  { code: 'mk', name: 'Македонски', flag: '🇲🇰' },
  { code: 'be', name: 'Беларуская', flag: '🇧🇾' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
  { code: 'mn', name: 'Монгол', flag: '🇲🇳' },
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
  { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'km', name: 'Khmer', flag: '🇰🇭' },
  { code: 'lo', name: 'ລາວ', flag: '🇱🇦' },
  { code: 'si', name: 'Sinhala', flag: '🇱🇰' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'eu', name: 'Basque', flag: '🇪🇸' },
];
