import { useTranslation } from "react-i18next"
import {
  Dumbbell,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react"

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-black/15 px-4 py-10 md:px-6 dark:border-white/[0.06]">
      <div className="mx-auto max-w-5xl">
        {/* Top row */}
        <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600/60">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-black/70 uppercase dark:text-white/70">
                Suplex Gym
              </span>
            </div>
            <p className="text-xs leading-relaxed text-black/40 dark:text-white/40">
              {t("footer.tagline")}
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/8 bg-black/4 text-black/50 transition-colors hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white/40 dark:hover:border-purple-400/40 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/8 bg-black/4 text-black/50 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white/40 dark:hover:border-blue-400/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/8 bg-black/4 text-black/50 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500 dark:border-white/10 dark:bg-white/5 dark:text-white/40 dark:hover:border-red-400/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <Youtube className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-black/30 dark:text-white/30" />
              <p className="font-mono text-[10px] font-medium tracking-widest text-black/40 uppercase dark:text-white/40">
                {t("footer.hours")}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-black/60 dark:text-white/60">
                {t("footer.hoursWeekdays")}
              </p>
              <p className="text-xs text-black/60 dark:text-white/60">
                {t("footer.hoursWeekends")}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-black/30 dark:text-white/30" />
              <p className="font-mono text-[10px] font-medium tracking-widest text-black/40 uppercase dark:text-white/40">
                {t("footer.contact")}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-black/60 dark:text-white/60">
                {t("footer.address")}
              </p>
              <a
                href={`tel:${t("footer.phone")}`}
                className="flex items-center gap-1.5 text-xs text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"
              >
                <Phone className="h-3 w-3" />
                {t("footer.phone")}
              </a>
              <a
                href={`mailto:${t("footer.email")}`}
                className="flex items-center gap-1.5 text-xs text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"
              >
                <Mail className="h-3 w-3" />
                {t("footer.email")}
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] font-medium tracking-widest text-black/40 uppercase dark:text-white/40">
              {t("nav.home")}
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { label: t("nav.passes"), href: "/#passes" },
                { label: t("nav.news"), href: "/news" },
                { label: t("nav.faq"), href: "/#faq" },
                {
                  label: t("nav.contact"),
                  href: `mailto:${t("footer.email")}`,
                },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-xs text-black/50 transition-colors hover:text-black dark:text-white/50 dark:hover:text-white"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-black/5 pt-6 sm:flex-row sm:items-center dark:border-white/[0.06]">
          <p className="text-[11px] text-black/30 dark:text-white/30">
            © {new Date().getFullYear()} Suplex Gym. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: t("footer.links.privacy"), href: "#" },
              { label: t("footer.links.terms"), href: "#" },
              { label: t("footer.links.cookies"), href: "#" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[11px] text-black/30 transition-colors hover:text-black/60 dark:text-white/30 dark:hover:text-white/60"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
