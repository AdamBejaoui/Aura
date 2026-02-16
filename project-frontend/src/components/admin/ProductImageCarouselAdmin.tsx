import React, { useState, useRef, useEffect } from 'react';

interface ProductImageCarouselAdminProps {
    images: string[];
    productName: string;
    getImageUrl: (path: string) => string;
}

const ProductImageCarouselAdmin: React.FC<ProductImageCarouselAdminProps> = ({ images, productName, getImageUrl }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isHovered && images.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, 800); // Change image every 0.8 seconds
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setCurrentIndex(0); // Reset to first image when not hovered
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isHovered, images.length]);

    return (
        <div
            className="relative w-full h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {images.map((image, index) => (
                <img
                    key={index}
                    src={getImageUrl(image)}
                    alt={`${productName} - Image ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-[400ms] group-hover:scale-110 ${index === currentIndex
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-105'
                        }`}
                    onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                        "https://placehold.co/300x400/f8fafc/94a3b8?text=No+Image")
                    }
                />
            ))}
        </div>
    );
};

export default ProductImageCarouselAdmin;
