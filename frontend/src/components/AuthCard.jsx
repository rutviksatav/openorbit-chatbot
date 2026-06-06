function AuthCard({

    children

}) {

    return (

        <div

            className="
                w-full
                max-w-md
                p-8
                rounded-3xl
                bg-slate-900/70
                backdrop-blur-xl
                border
                border-slate-800
                shadow-2xl
            "
        >

            {children}

        </div>
    );
}

export default AuthCard;
