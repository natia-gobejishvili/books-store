type AlertProps = {
    message: string;
    variant?: "error" | "success" | "info";
};

export default function Alert({
    message,
    variant = "info",
}: AlertProps) {
    return (
        <div className={`ui-alert ui-alert--${variant}`} role="alert">
            {message}
        </div>
    );
}
