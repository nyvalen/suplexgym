// Add these keys to the existing i18n translations in web/apps/web/src/i18n.ts
// Under passes in BOTH "en" and "hu" objects:

// EN additions:
// passes.mobileOnly: "Available in app"
// passes.mobileNote: "Passes can only be purchased through the Suplex Gym mobile app. Download it to get started."
// passes.items.threemonths.name: "Seasonal" (3 months)

// HU additions:
// passes.mobileOnly: "Csak appban"
// passes.mobileNote: "A bérleteket kizárólag a Suplex Gym mobilalkalmazáson keresztül lehet megvásárolni."

// The full updated passes sections:
export const passesEN = {
  heading: "Passes & Tickets",
  sub: "Flexible options for every schedule and goal",
  popular: "Most popular",
  perMonth: "/ month",
  perEntry: "/ entry",
  mobileOnly: "Available in app",
  mobileNote: "Passes can only be purchased through the Suplex Gym mobile app.",
  items: {
    daily: {
      name: "Daily",
      price: "2,900",
      unit: "/ ticket",
      desc: "Drop in whenever you like. No commitment required.",
      features: ["Full facility access", "Valid for 1 day", "Locker included"],
    },
    monthly: {
      name: "Monthly",
      price: "12,900",
      unit: "/ pass",
      desc: "Perfect for those who train regularly throughout the month.",
      features: ["Full facility access", "All group classes included", "Towel service", "Valid 30 days"],
    },
    threemonths: {
      name: "Seasonal",
      price: "10,900",
      unit: "/ month",
      desc: "Three months of unlimited access. Great value for committed trainers.",
      features: ["Unlimited access", "All group classes included", "1 personal training session", "Valid 90 days"],
    },
    annual: {
      name: "Annual",
      price: "8,900",
      unit: "/ month",
      desc: "Our best value — pay yearly and save up to 30%.",
      features: ["Unlimited access", "2 personal training sessions / month", "Free locker rental", "Priority booking", "Valid 365 days"],
    },
  },
}

export const passesHU = {
  heading: "Bérletek és jegyek",
  sub: "Rugalmas lehetőségek minden menetrendhez és célhoz",
  popular: "Legnépszerűbb",
  perMonth: "/ hó",
  perEntry: "/ alkalom",
  mobileOnly: "Csak appban elérhető",
  mobileNote: "A bérleteket kizárólag a Suplex Gym mobilalkalmazáson keresztül lehet megvásárolni.",
  items: {
    daily: {
      name: "Egyszer belépő",
      price: "2 900",
      unit: "/ alkalom",
      desc: "Látogass be bármikor. Kötelezettség nélkül.",
      features: ["Teljes terem hozzáférés", "1 napig érvényes", "Öltöző beleértve"],
    },
    monthly: {
      name: "Havi bérlet",
      price: "12 900",
      unit: "/ bérlet",
      desc: "Tökéletes azoknak, akik egész hónapban rendszeresen edznek.",
      features: ["Teljes terem hozzáférés", "Összes csoportos edzés beleértve", "Törölköző szolgáltatás", "30 napig érvényes"],
    },
    threemonths: {
      name: "Szezonális bérlet",
      price: "10 900",
      unit: "/ hó",
      desc: "Három hónap korlátlan hozzáférés. Kiváló ár elkötelezett edzőknek.",
      features: ["Korlátlan belépés", "Összes csoportos edzés beleértve", "1 személyi edzés", "90 napig érvényes"],
    },
    annual: {
      name: "Éves bérlet",
      price: "8 900",
      unit: "/ hó",
      desc: "A legjobb ár — éves fizetéssel akár 30% megtakarítás.",
      features: ["Korlátlan belépés", "2 személyi edzés / hó", "Ingyenes szekrénybérlet", "Elsőbbségi foglalás", "365 napig érvényes"],
    },
  },
}
