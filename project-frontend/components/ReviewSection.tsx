import React, { useState } from "react";
import { Star, User, Send } from "lucide-react";
import axios from "axios";

type Review = {
    _id: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
};

type ReviewSectionProps = {
    productId: string;
    reviews: Review[];
    onReviewAdded: (updatedProduct: any) => void;
};

const ReviewSection = ({ productId, reviews, onReviewAdded }: ReviewSectionProps) => {
    const [rating, setRating] = useState(5);
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !comment.trim()) return;

        setSubmitting(true);
        setError(null);

        try {
            const response = await axios.post(`/api/products/${productId}/reviews`, {
                name,
                rating,
                comment,
            });
            setName("");
            setComment("");
            setRating(5);
            onReviewAdded(response.data);
        } catch (err: any) {
            console.error("Review failed:", err);
            setError(err.response?.data?.message || err.message || "Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="border-t border-gray-100 dark:border-neutral-800 pt-8 mt-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Customer Reviews ({reviews.length})
            </h3>

            {/* Reviews List */}
            <div className="space-y-6 mb-10">
                {reviews.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((review, idx) => (
                        <div key={review._id || idx} className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-700 flex items-center justify-center">
                                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">{review.name}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
                            <span className="text-xs text-gray-400 mt-2 block">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Write Review Form */}
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Write a Review</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-6 h-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 text-sm dark:text-white"
                            placeholder="Your name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 text-sm dark:text-white resize-none"
                            rows={3}
                            placeholder="Share your thoughts..."
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs">{error}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 bg-stone-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? "Submitting..." : (
                            <>
                                <span>Post Review</span>
                                <Send className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewSection;
