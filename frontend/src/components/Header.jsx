import {

    PanelLeft

} from "lucide-react";


function Header({

    onToggleSidebar

}) {

    return (

        <header

            className="
                h-14
                border-b
                border-zinc-800
                flex
                items-center
                justify-between
                px-5
                bg-[#0A0A0A]/80
                backdrop-blur-xl
            "
        >

            <div

                className="
                    flex
                    items-center
                    gap-3
                "
            >

                <button

                    onClick={
                        onToggleSidebar
                    }

                    className="
                        p-2
                        rounded-lg
                        hover:bg-zinc-900
                        transition
                    "
                >

                    <PanelLeft

                        size={18}

                        className="
                            text-zinc-400
                        "
                    />

                </button>

                <span

                    className="
                        text-sm
                        font-medium
                        text-zinc-300
                    "
                >

                    OpenOrbit

                </span>

            </div>


            <div

                className="
                    text-xs
                    text-zinc-500
                "
            >

                AI Workspace
            </div>

        </header>
    );
}

export default Header;
