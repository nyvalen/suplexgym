import i18n from "i18next"
import { initReactI18next } from "react-i18next"

const en = {
  nav: {
    home: "Home",
    news: "News",
    passes: "Passes & Tickets",
    faq: "FAQ",
    contact: "Contact",
    latest: "Latest",
    allNews: "All news",
    backHome: "Back to home",
  },
  hero: {
    badge: "Suplex Gym",
    est: "Est. 2017",
    headline1: "Built for",
    headline2: "limitless",
    headline3: "potential.",
    sub: "A space defined by focus. Designed for progress. No excess, no distraction — only what matters.",
    join: "Join now",
    plans: "View plans",
    quoteText: "\u201cStrength, refined through consistency.\u201d",
  },
  stats: {
    members: "Active members",
    classes: "Weekly classes",
    trainers: "Certified trainers",
    years: "Years open",
  },
  services: {
    heading: "What we offer",
    strength: {
      title: "Strength training",
      desc: "Free weights, machines, and progressive programming for every level.",
      tag: "All levels",
    },
    group: {
      title: "Group classes",
      desc: "HIIT, yoga, boxing and more — 34 sessions per week.",
      tag: "34 / week",
    },
    personal: {
      title: "Personal training",
      desc: "One-on-one sessions with certified trainers.",
      tag: "By appointment",
    },
  },
  passes: {
    heading: "Passes & Tickets",
    sub: "Flexible options for every schedule and goal",
    popular: "Most popular",
    perMonth: "/ month",
    perEntry: "/ entry",
    buyNow: "Buy now",
    learnMore: "Learn more",
    items: {
      single: {
        name: "Single entry",
        price: "2,900",
        unit: "/ entry",
        desc: "Drop in whenever you like. No commitment required.",
        features: [
          "Full facility access",
          "Valid for 1 visit",
          "No expiry date",
          "Locker included",
        ],
      },
      tenPass: {
        name: "10-entry pass",
        price: "24,900",
        unit: "/ pass",
        desc: "Perfect for those who train a few times a week.",
        features: [
          "Full facility access",
          "10 entries — use anytime",
          "Valid 6 months",
          "Guest pass included",
        ],
      },
      monthly: {
        name: "Monthly",
        price: "12,900",
        unit: "/ month",
        desc: "Unlimited access, billed monthly. Cancel anytime.",
        features: [
          "Unlimited access",
          "All group classes included",
          "1 personal training session",
          "Towel service",
        ],
      },
      annual: {
        name: "Annual",
        price: "9,900",
        unit: "/ month",
        desc: "Our best value — pay yearly and save 23%.",
        features: [
          "Unlimited access",
          "All group classes included",
          "2 personal training sessions / month",
          "Free locker rental",
          "Priority booking",
        ],
      },
    },
  },
  news: {
    heading: "Latest news",
    pageTitle: "News",
    pageSub: "Updates, announcements and stories from Suplex Gym",
    articles: "articles",
    featured: "Featured",
    noArticles: "No articles yet.",
    close: "Close",
    photoCredit: "Photo by Suplex Gym",
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        q: "What are the opening hours?",
        a: "We\u2019re open Monday\u2013Friday 5:30\u202fam\u20139:30\u202fpm, Saturday 7\u202fam\u20138\u202fpm, and Sunday 8\u202fam\u20136\u202fpm.",
      },
      {
        q: "How do I get started as a new member?",
        a: "Drop in for a free tour \u2014 no appointment needed. We\u2019ll walk you through the facilities, discuss your goals, and help you choose the right plan.",
      },
      {
        q: "Is there parking available?",
        a: "Yes, we have a dedicated car park for members directly behind the building with 40 spaces.",
      },
      {
        q: "Can I freeze or cancel my membership?",
        a: "Memberships can be frozen for up to 3 months per year at no charge. Cancellations require 30 days\u2019 written notice.",
      },
      {
        q: "Do you offer student or concession rates?",
        a: "Yes. Students with a valid ID receive 20% off any plan. Concession rates are available for over-60s.",
      },
      {
        q: "What equipment do you have?",
        a: "40+ free-weight stations, a full cable system, four squat racks, a deadlift platform, and 60+ cardio machines.",
      },
    ],
  },
  sidebar: {
    spotlight: {
      classes: {
        label: "New summer classes",
        sublabel: "June 2025",
        description: "12 new group sessions added to the timetable",
      },
      equipment: {
        label: "Equipment upgrade",
        sublabel: "May 2025",
        description: "40 new machines installed across the main floor",
      },
    },
  },
}

const hu: typeof en = {
  nav: {
    home: "Főoldal",
    news: "Hírek",
    passes: "Bérletek",
    faq: "GYIK",
    contact: "Kapcsolat",
    latest: "Legújabb",
    allNews: "Összes hír",
    backHome: "Vissza a főoldalra",
  },
  hero: {
    badge: "Suplex Edzőterem",
    est: "Alapítva 2017",
    headline1: "Épülve",
    headline2: "határtalan",
    headline3: "lehetőségre.",
    sub: "Fókuszra tervezett tér. Haladásra kialakítva. Semmi felesleges, semmi zavaró — csak ami számít.",
    join: "Csatlakozz",
    plans: "Bérletek",
    quoteText: "\u201eAz erő következetességben gyökerezik.\u201d",
  },
  stats: {
    members: "Aktív tagok",
    classes: "Heti edzések",
    trainers: "Minősített edzők",
    years: "Évek óta nyitva",
  },
  services: {
    heading: "Amit kínálunk",
    strength: {
      title: "Erőedzés",
      desc: "Szabad súlyok, gépek és progresszív programozás minden szinten.",
      tag: "Minden szint",
    },
    group: {
      title: "Csoportos edzések",
      desc: "HIIT, jóga, boksz és más — heti 34 edzés.",
      tag: "34 / hét",
    },
    personal: {
      title: "Személyi edzés",
      desc: "Négyszemközti edzések minősített személyi edzőkkel.",
      tag: "Előfoglalással",
    },
  },
  passes: {
    heading: "Bérletek és jegyek",
    sub: "Rugalmas lehetőségek minden menetrendhez és célhoz",
    popular: "Legnépszerűbb",
    perMonth: "/ hó",
    perEntry: "/ alkalom",
    buyNow: "Megveszem",
    learnMore: "Részletek",
    items: {
      single: {
        name: "Egyszer belépő",
        price: "2 900",
        unit: "/ alkalom",
        desc: "Látogass be bármikor. Kötelezettség nélkül.",
        features: [
          "Teljes terem hozzáférés",
          "1 látogatásra érvényes",
          "Nem jár le",
          "Öltöző beleértve",
        ],
      },
      tenPass: {
        name: "10 alkalmas bérlet",
        price: "24 900",
        unit: "/ bérlet",
        desc: "Tökéletes azoknak, akik hetente néhányszor edznek.",
        features: [
          "Teljes terem hozzáférés",
          "10 alkalom — bármikor felhasználható",
          "6 hónapig érvényes",
          "Vendég belépő mellékelve",
        ],
      },
      monthly: {
        name: "Havi bérlet",
        price: "12 900",
        unit: "/ hó",
        desc: "Korlátlan hozzáférés, havi díjazással. Bármikor lemondható.",
        features: [
          "Korlátlan belépés",
          "Összes csoportos edzés beleértve",
          "1 személyi edzés",
          "Törölköző szolgáltatás",
        ],
      },
      annual: {
        name: "Éves bérlet",
        price: "9 900",
        unit: "/ hó",
        desc: "A legjobb ár — éves fizetéssel 23% megtakarítás.",
        features: [
          "Korlátlan belépés",
          "Összes csoportos edzés beleértve",
          "2 személyi edzés / hó",
          "Ingyenes szekrénybérlet",
          "Elsőbbségi foglalás",
        ],
      },
    },
  },
  news: {
    heading: "Legfrissebb hírek",
    pageTitle: "Hírek",
    pageSub: "Hírek, bejelentések és történetek a Suplex Edzőteremből",
    articles: "cikk",
    featured: "Kiemelt",
    noArticles: "Még nincs cikk.",
    close: "Bezárás",
    photoCredit: "Fotó: Suplex Edzőterem",
  },
  faq: {
    heading: "Gyakran ismételt kérdések",
    items: [
      {
        q: "Mik a nyitvatartási idők?",
        a: "Hétfőtől péntekig 5:30–21:30, szombaton 7:00–20:00, vasárnap 8:00–18:00 vagyunk nyitva.",
      },
      {
        q: "Hogyan kezdjek el új tagként?",
        a: "Gyere be egy ingyenes körbevezetésre — bejelentkezés nélkül. Megmutatjuk a létesítményt, megbeszéljük céljaidat és segítünk a megfelelő bérlet kiválasztásában.",
      },
      {
        q: "Van parkoló?",
        a: "Igen, 40 férőhelyes tagtárló parkoló található közvetlenül az épület mögött.",
      },
      {
        q: "Felfüggeszthetem vagy lemondhatom a tagságomat?",
        a: "A tagság évente legfeljebb 3 hónapra szüneteltethető díjmentesen. A lemondáshoz 30 napos írásbeli értesítés szükséges.",
      },
      {
        q: "Van diák- vagy kedvezményes ár?",
        a: "Igen. Érvényes diákigazolvánnyal 20% kedvezmény jár bármely bérletre. Kedvezmény érhető el 60 év felettieknek is.",
      },
      {
        q: "Milyen felszerelés áll rendelkezésre?",
        a: "40+ szabad súlyos állomás, teljes kábeles rendszer, négy guggolókeret, döntőpad és 60+ kardió gép.",
      },
    ],
  },
  sidebar: {
    spotlight: {
      classes: {
        label: "Nyári edzések",
        sublabel: "2025. június",
        description: "12 új csoportos edzés a menetrendben",
      },
      equipment: {
        label: "Gépcsere befejezve",
        sublabel: "2025. május",
        description: "40 új gép a főteremben",
      },
    },
  },
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hu: { translation: hu },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
})

export default i18n
