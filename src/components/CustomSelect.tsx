import { useEffect, useRef, useState } from "react";
import "../styles/custom-select.css";

type Option = {
    value: string;
    label: string;
};

type CustomSelectProps = {
    id: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
};

export default function CustomSelect({
    id,
    value,
    options,
    onChange,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(
        (option) => option.value === value
    );

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="custom-select" ref={containerRef}>
            <button
                id={id}
                type="button"
                className={`custom-select__trigger ${
                    isOpen ? "is-open" : ""
                }`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((previous) => !previous)}
            >
                <span>{selectedOption?.label ?? ""}</span>

                <span
                    className={`custom-select__arrow ${
                        isOpen ? "is-rotated" : ""
                    }`}
                    aria-hidden="true"
                >
                    ▾
                </span>
            </button>

            {isOpen && (
                <div
                    className="custom-select__options"
                    role="listbox"
                    aria-labelledby={id}
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={option.value === value}
                            className={`custom-select__option ${
                                option.value === value ? "is-selected" : ""
                            }`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
