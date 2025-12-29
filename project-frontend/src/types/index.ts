export type Review = {
    _id: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
};

export type Product = {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    rating: number;
    numReviews: number;
    reviews: Review[];
    images: string[];
    inStock: boolean;
    currency: string;
};
