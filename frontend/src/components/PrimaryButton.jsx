function PrimaryButton({

    children,

    onClick

}) {

    return (

        <button

            onClick={onClick}

            className="
                w-full
                py-3
                rounded-xl
                bg-blue-600
                hover:bg-blue-500
                transition
                text-white
                font-medium
            "
        >

            {children}

        </button>
    );
}

export default PrimaryButton;
