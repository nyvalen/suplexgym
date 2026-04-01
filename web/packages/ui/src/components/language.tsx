import { useTranslation } from "react-i18next"
import { Button } from "@workspace/ui/components/button"

export function Language() {
  const { i18n } = useTranslation()
  const isHu = i18n.language === "hu"

  return (
    <Button
      variant="outline"
      size="icon"
      title={isHu ? "Switch to English" : "Váltás magyarra"}
      className="m-2 h-9 w-9 rounded-md font-mono text-[11px] font-medium tracking-wider transition-colors hover:bg-accent"
      onClick={() => i18n.changeLanguage(isHu ? "en" : "hu")}
    >
      {isHu ? "EN" : "HU"}
    </Button>
  )
}
