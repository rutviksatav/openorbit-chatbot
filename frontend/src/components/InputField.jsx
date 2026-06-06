function InputField({

    label,

    type,

    placeholder,

    value,

    onChange
}) {

    return (

        <div className="flex flex-col gap-2">

            <label
                className="
                    text-sm
                    text-slate-300
                "
            >

                {label}

            </label>

            <input

                type={type}

                placeholder={placeholder}

                value={value}

                onChange={onChange}

                className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    bg-slate-900/60
                    border
                    border-slate-700
                    text-white
                    outline-none
                    focus:border-blue-500
                    transition
                "
            />

        </div>
    );
}

export default InputField;
