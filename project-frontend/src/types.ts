export interface Review {
    _id: string;
    user: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    rating: number;
    reviews: Review[];
    numReviews: number;
    images: string[];
    inStock: boolean;
    currency: string;
}
