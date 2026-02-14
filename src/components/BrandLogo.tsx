type Props = {
    variant?: "sidebar" | "header" | "mobile" | "hero";
    className?: string;
};

export default function BrandLogo({ variant = "header", className = "" }: Props) {

    const sizes = {
        sidebar: "h-10 w-10 md:h-12 md:w-12 xl:h-14 xl:w-14",
        header: "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16",
        mobile: "h-9 w-9",
        hero: "h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-40 lg:w-40"
    };

    return (
        <img
            src="/logo.png"
            alt="CampusPaws"
            draggable={false}
            className={`object-contain select-none shrink-0 ${sizes[variant]} ${className}`}
        />
    );
}
