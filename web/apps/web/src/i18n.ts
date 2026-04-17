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
    est: "Est. 2024",
    headline1: "Built for",
    headline2: "limitless",
    headline3: "potential.",
    sub: "A space defined by focus. Designed for progress. No excess, no distraction — only what matters.",
    join: "Join now",
    plans: "View plans",
    quoteText: "\u201cStrength, comes refined through consistency.\u201d",
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
    mobileOnly: "Available in app",
    mobileNote:
      "Passes can only be purchased through the Suplex Gym mobile app.",
    items: {
      daily: {
        name: "Daily",
        price: "2,900",
        unit: "/ ticket",
        desc: "Drop in whenever you like. No commitment required.",
        features: [
          "Full facility access",
          "Valid for 1 day",
          "Locker included",
        ],
      },
      monthly: {
        name: "Monthly",
        price: "12,900",
        unit: "/ pass",
        desc: "Perfect for those who train regularly throughout the month.",
        features: [
          "Full facility access",
          "All group classes included",
          "Towel service",
          "Valid 30 days",
        ],
      },
      threemonths: {
        name: "Seasonal",
        price: "10,900",
        unit: "/ month",
        desc: "Three months of unlimited access. Great value for committed trainers.",
        features: [
          "Unlimited access",
          "All group classes included",
          "1 personal training session",
          "Valid 90 days",
        ],
      },
      annual: {
        name: "Annual",
        price: "8,900",
        unit: "/ month",
        desc: "Our best value — pay yearly and save up to 30%.",
        features: [
          "Unlimited access",
          "2 personal training sessions / month",
          "Free locker rental",
          "Priority booking",
          "Valid 365 days",
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
        a: "4 free-weight stations up to 70 kilograms, 3 full cable systems, four squat racks, 6 benches - 4 of those are adjustable, and 30+ cardio machines.",
      },
    ],
  },
  sidebar: {
    spotlight: {
      passes: {
        label: "Passes & Tickets",
        sublabel: "Passes and tickets",
        description: "Flexible plans for every goal and schedule",
      },
      faq: {
        label: "FAQ",
        sublabel: "Learn more",
        description: "Answers to common questions about membership",
      },
      news: {
        label: "Latest News",
        sublabel: "Stay updated",
        description: "Updates and announcements from Suplex Gym",
      },
      classes: {
        label: "New summer classes",
        sublabel: "June 2025",
        description: "12 new group sessions added to the timetable",
      },
    },
  },
  footer: {
    tagline: "A space defined by focus.",
    hours: "Opening Hours",
    hoursWeekdays: "Mon–Fri: 5:30 am – 9:30 pm",
    hoursWeekends: "Sat: 7 am – 8 pm · Sun: 8 am – 6 pm",
    contact: "Contact",
    address: "123 Gym Street, Budapest",
    phone: "+36 1 234 5678",
    email: "hello@suplexgym.hu",
    social: "Follow us",
    rights: "All rights reserved.",
    links: {
      privacy: "Privacy Policy",
      terms: "Terms of Use",
      cookies: "Cookies",
    },
  },
  login: {
    title: "Sign In",
    subtitle: "Enter your email and password to sign in",
    email: "Email",
    emailPlaceholder: "user@example.com",
    password: "Password",
    submit: "Sign In",
    errorDefault: "Invalid email or password. Please try again.",
    staffHint: "Admin and staff accounts can access the panel.",
    errorPermission: "Access denied. Only admin or staff accounts can access this panel.",
  },
  admin: {
    title: "Admin Panel",
    sections: {
      users: "Manage Users",
      news: "Manage News",
      items: "Manage Items",
      equipment: "Manage Equipment",
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
    est: "Alapítva 2024",
    headline1: "A lehetőségek",
    headline2: "határtalan",
    headline3: "tárháza.",
    sub: "Fókuszra tervezett tér. Haladásra kialakítva. Semmi felesleg, semmi zavar — csak fejlődés.",
    join: "Csatlakozz",
    plans: "Bérletek",
    quoteText: "\u201eAz erő a kitartás révén érlelődik.\u201d",
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
      desc: "Igényre szabott edzések minősített személyi edzőkkel.",
      tag: "Előfoglalással",
    },
  },
  passes: {
    heading: "Bérletek és jegyek",
    sub: "Rugalmas lehetőségek minden menetrendhez és célhoz",
    popular: "Legnépszerűbb",
    perMonth: "/ hó",
    perEntry: "/ alkalom",
    mobileOnly: "Csak appban elérhető",
    mobileNote:
      "A bérleteket kizárólag a Suplex Gym mobilalkalmazáson keresztül lehet megvásárolni.",
    items: {
      daily: {
        name: "Egyszer belépő",
        price: "2 900",
        unit: "/ alkalom",
        desc: "Látogass be bármikor. Kötelezettség nélkül.",
        features: [
          "Teljes terem hozzáférés",
          "1 napig érvényes",
          "Öltöző beleértve",
        ],
      },
      monthly: {
        name: "Havi bérlet",
        price: "12 900",
        unit: "/ bérlet",
        desc: "Tökéletes azoknak, akik egész hónapban rendszeresen edznek.",
        features: [
          "Teljes terem hozzáférés",
          "Összes csoportos edzés beleértve",
          "Törölköző szolgáltatás",
          "30 napig érvényes",
        ],
      },
      threemonths: {
        name: "Szezonális bérlet",
        price: "10 900",
        unit: "/ hó",
        desc: "Három hónap korlátlan hozzáférés. Kiváló ár elkötelezett edzőknek.",
        features: [
          "Korlátlan belépés",
          "Összes csoportos edzés beleértve",
          "1 személyi edzés",
          "90 napig érvényes",
        ],
      },
      annual: {
        name: "Éves bérlet",
        price: "8 900",
        unit: "/ hó",
        desc: "A legjobb ár — éves fizetéssel akár 30% megtakarítás.",
        features: [
          "Korlátlan belépés",
          "2 személyi edzés / hó",
          "Ingyenes szekrénybérlet",
          "Elsőbbségi foglalás",
          "365 napig érvényes",
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
        q: "Hogyan állhatok neki új tagként?",
        a: "Gyere be egy ingyenes körbevezetésre — bejelentkezés nélkül. Megmutatjuk a termet, megoszthatod céljaidat és segíthetünk a megfelelő bérlet kiválasztásában.",
      },
      {
        q: "Van parkoló?",
        a: "Igen, 40 férőhelyes parkoló található vendégeinknek közvetlenül az épület mögött.",
      },
      {
        q: "Felfüggeszthetem vagy lemondhatom a tagságomat?",
        a: "A tagság évente legfeljebb 3 hónapra szüneteltethető díjmentesen. A lemondáshoz 30 napos írásbeli értesítés szükséges.",
      },
      {
        q: "Van diák- vagy kedvezményes ár?",
        a: "Igen. Érvényes diákigazolvánnyal 20% kedvezmény jár bármely bérletre. Kedvezményt ajánlunk 60 év felettieknek is.",
      },
      {
        q: "Milyen felszerelés áll rendelkezésre?",
        a: "4 szabad súlyos rekesz 70 kilóig, 3 kábeles rendszer, négy guggolókeret, 6 fekpad - ezekből 4 dönthető és 30+ kardió gép.",
      },
    ],
  },
  sidebar: {
    spotlight: {
      passes: {
        label: "Bérletek",
        sublabel: "Elérhető bérletek",
        description: "Rugalmas csomagok minden célhoz",
      },
      faq: {
        label: "GYIK",
        sublabel: "Tudj meg többet",
        description: "Válaszok a tagsággal kapcsolatos kérdésekre",
      },
      news: {
        label: "Legfrissebb hírek",
        sublabel: "Maradj naprakész",
        description: "Hírek és bejelentések a Suplex Edzőteremből",
      },
      classes: {
        label: "Nyári edzések",
        sublabel: "2025. június",
        description: "12 új csoportos edzés a menetrendben",
      },
    },
  },
  footer: {
    tagline: "Fókuszra tervezett tér.",
    hours: "Nyitvatartás",
    hoursWeekdays: "H–P: 5:30 – 21:30",
    hoursWeekends: "Szo: 7:00 – 20:00 · V: 8:00 – 18:00",
    contact: "Kapcsolat",
    address: "1234 Budapest, Edzőterem utca 123.",
    phone: "+36 1 234 5678",
    email: "hello@suplexgym.hu",
    social: "Kövess minket",
    rights: "Minden jog fenntartva.",
    links: {
      privacy: "Adatvédelem",
      terms: "Felhasználási feltételek",
      cookies: "Sütik",
    },
  },
  login: {
    title: "Bejelentkezés",
    subtitle: "Add meg az e-mail címed és jelszavad",
    email: "E-mail",
    emailPlaceholder: "felhasznalo@example.com",
    password: "Jelszó",
    submit: "Bejelentkezés",
    errorDefault: "Hibás e-mail vagy jelszó. Kérjük, próbáld újra.",
    staffHint: "Admin és személyzeti fiókok érhetik el a panelt.",
    errorPermission: "Hozzáférés megtagadva. Csak admin vagy személyzeti fiókok léphetnek be.",
  },
  admin: {
    title: "Admin Panel",
    sections: {
      users: "Felhasználók kezelése",
      news: "Hírek kezelése",
      items: "Termékek kezelése",
      equipment: "Felszerelés kezelése",
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
