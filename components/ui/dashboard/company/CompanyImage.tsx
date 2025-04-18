import Image from 'next/image';

interface Props {
    src?: string;
    alt: string;
    className?: React.StyleHTMLAttributes<HTMLImageElement>['className'];
    width?: number;
    height?: number;
}

export const CompanyImage = ({ src, alt, className, width = 100, height = 50 }: Props) => {

    const localSrc = ( src )
        ? src.includes('http') || src.includes('https')
            ? src
            : `${process.env.NEXT_PUBLIC_API_URL}${src}`
        : null;

    return (
        <Image
            src={localSrc || ''}
            alt={alt}
            width={width}
            height={height}
            className={`rounded-full ${className}`}
        />
    );
}
