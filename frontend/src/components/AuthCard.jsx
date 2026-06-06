function AuthCard({ children }) {
    return (
        <div
            className="
                w-full
                max-w-md
                p-8
                rounded-3xl
                border
                shadow-2xl
            "
            style={{
                background: "rgba(12,18,30,0.92)",
                borderColor: "rgba(0,210,190,0.13)",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)"
            }}
        >
            {children}
        </div>
    );
}

export default AuthCard;
