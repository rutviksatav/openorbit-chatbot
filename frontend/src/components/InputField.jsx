function InputField({ label, type, placeholder, value, onChange, icon }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                className="text-[9px] uppercase tracking-widest font-medium"
                style={{ color: "rgba(100,130,155,0.7)", fontFamily: "monospace" }}
            >
                {label}
            </label>
            <div className="relative">
                {icon && (
                    <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
                        style={{ color: "rgba(0,210,190,0.5)" }}
                    >
                        {icon}
                    </span>
                )}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full py-2.5 rounded-xl text-sm outline-none transition"
                    style={{
                        paddingLeft: icon ? "2.4rem" : "0.85rem",
                        paddingRight: "0.85rem",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "#d8e8f0",
                    }}
                    onFocus={e => {
                        e.target.style.borderColor = "rgba(0,210,190,0.35)";
                        e.target.style.background = "rgba(0,210,190,0.03)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(0,210,190,0.07)";
                    }}
                    onBlur={e => {
                        e.target.style.borderColor = "rgba(255,255,255,0.07)";
                        e.target.style.background = "rgba(255,255,255,0.03)";
                        e.target.style.boxShadow = "none";
                    }}
                />
            </div>
        </div>
    );
}

export default InputField;
