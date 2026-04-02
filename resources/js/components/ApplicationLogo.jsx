export default function ApplicationLogo({
    className = '',
    alt = 'Pachbaria Swapnasiri Foundation',
    ...props
}) {
    return (
        <img
            src="/images/brand/logo.png"
            alt={alt}
            className={className}
            {...props}
        />
    );
}