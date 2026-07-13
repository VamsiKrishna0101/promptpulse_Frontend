// SaraFloatingAssistant.tsx
import { useState } from "react"
import { useLocation } from "react-router-dom"
import { SaraChatSurface } from "./SaraChatSurface"
import saraAvatar from "@/assets/sara-avatar.png"

export function SaraFloatingAssistant() {
    const [open, setOpen] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const location = useLocation()
    const isChatPage = location.pathname === "/chat"

    function closeSara() {
        setOpen(false)
        setExpanded(false)
    }

    return (
        <>
            {!open && (
                <button
                    type="button"
                    onClick={() => {
                        setOpen(true)
                        setExpanded(false)
                    }}
                    className={[
                        "sara-launcher fixed z-[70] flex h-[46px] items-center gap-2.5 rounded-full border px-4 text-[12.5px] font-semibold transition hover:-translate-y-0.5",
                        isChatPage ? "bottom-5 right-52" : "bottom-5 right-5",
                    ].join(" ")}
                >
                    <img
                        src={saraAvatar}
                        alt="Sara"
                        className="h-8 w-8 rounded-full bg-white object-cover shadow-sm ring-1 ring-white/55"
                    />
                    Ask Sara
                </button>
            )}
            {open && (
                <SaraChatSurface
                    mode={expanded ? "page" : "panel"}
                    onClose={closeSara}
                    onExpand={() => setExpanded(true)}
                    onMinimize={() => setExpanded(false)}
                />
            )}
        </>
    )
}
