import { PanelLeft } from "lucide-react";

function Header({
    onToggleSidebar,
    activeSessionTitle
}) {
    return (
        <header
            className="
                h-14
                flex
                items-center
                justify-between
                px-5
                bg-[var(--bg-primary)]/85
                border-b border-[var(--border-color)]
                backdrop-blur-xl
                z-20
                transition-colors
                duration-300
            "
        >
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="
                        p-2
                        rounded-lg
                        hover:bg-zinc-900
                        transition-colors
                        duration-150
                    "
                    title="Toggle Sidebar"
                >
                    <PanelLeft
                        size={18}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                    />
                </button>

                <span
                    className="text-sm font-display text-zinc-100 font-medium max-w-[150px] sm:max-w-[280px] truncate select-none tracking-normal ml-1"
                    title={activeSessionTitle || "New Chat"}
                >
                    {activeSessionTitle || "New Chat"}
                </span>
            </div>

            <div className="flex items-center gap-4">
                

                <div
                    className="
                        text-[9px]
                        font-mono-tech
                        tracking-[0.15em]
                        text-[var(--text-secondary)]
                        select-none
                        hidden sm:block
                        uppercase
                    "
                >
                    AI Workspace
                </div>
            </div>
        </header>
    );
}

export default Header;
