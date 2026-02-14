type Props = {
    variant?: "sidebar" | "header" | "mobile" | "hero";
    className?: string;
};

export default function BrandLogo({ variant = "header", className = "" }: Props) {

    const sizes = {
        sidebar: "h-9 w-9 md:h-10 md:w-10 xl:h-11 xl:w-11",
        header: "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10",
        mobile: "h-7 w-7",
        hero: "h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24"
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
