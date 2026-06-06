function Logo() {

    return (

        <div

            className="
                flex
                items-center
                gap-3
            "
        >

            <div

                className="
                    w-10
                    h-10
                    rounded-xl
                    bg-cyan-500/10
                    border
                    border-cyan-500/30
                    flex
                    items-center
                    justify-center
                "
            >

                <div

                    className="
                        w-5
                        h-5
                        rounded-full
                        border-2
                        border-cyan-400
                    "
                />

            </div>

            <div>

                <div

                    className="
                        text-lg
                        font-semibold
                        tracking-tight
                        text-white
                    "
                >

                    OpenOrbit

                </div>

                <div

                    className="
                        text-xs
                        text-zinc-500
                    "
                >

                    AI Workspace

                </div>

            </div>

        </div>
    );
}

export default Logo;
