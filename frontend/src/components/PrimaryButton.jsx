function PrimaryButton({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full py-3 rounded-xl font-bold tracking-widest uppercase text-sm transition-all"
            style={{
                background: "#00b8a0",
                color: "#08151f",
                boxShadow: "0 4px 20px rgba(0,184,160,0.25)",
                letterSpacing: "0.06em"
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = "#00cdb3";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,184,160,0.35)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = "#00b8a0";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,184,160,0.25)";
            }}
        >
            {children}
        </button>
    );
}

export default PrimaryButton;
