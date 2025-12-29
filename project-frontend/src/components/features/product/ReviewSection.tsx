import React, { useState } from "react";
import { Star, User, Send, MessageSquare } from "lucide-react";
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
        <div className="border-t border-stone-100 dark:border-neutral-800 pt-12 mt-12">
            <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-5 h-5 text-stone-900 dark:text-white" />
                <h3 className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">
                    Client Sentiments ({reviews.length})
                </h3>
            </div>

            {/* Reviews List */}
            <div className="space-y-6 mb-16">
                {reviews.length === 0 ? (
                    <div className="p-8 bg-stone-50 dark:bg-neutral-800/30 rounded-[2rem] border border-stone-100 dark:border-neutral-800 border-dashed text-center">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest italic">No sentiments archived yet. Be the first to reflect.</p>
                    </div>
                ) : (
                    reviews.map((review, idx) => (
                        <div key={review._id || idx} className="bg-stone-50 dark:bg-neutral-800/50 p-6 rounded-[2rem] border border-stone-100 dark:border-neutral-800">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-700 flex items-center justify-center border border-stone-100 dark:border-neutral-600 shadow-sm">
                                        <User className="w-4 h-4 text-stone-400 dark:text-stone-300" />
                                    </div>
                                    <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-tight">{review.name}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-stone-200 dark:text-neutral-700"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium mb-4">{review.comment}</p>
                            <span className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                Verified Purchase • {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Write Review Form */}
            <div className="bg-white dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
                <h4 className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-[0.3em] mb-8 text-center">Contribute to the Archive</h4>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Satisfaction Level</span>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-all hover:scale-125"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-stone-100 dark:text-neutral-800"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Identity</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-6 py-4 bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all text-xs font-black dark:text-white"
                                placeholder="Formal Name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Reflection</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-6 py-4 bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all text-xs font-black dark:text-white resize-none"
                                rows={4}
                                placeholder="Share your experience with the piece..."
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight text-center">{error}</div>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {submitting ? "Post Archiving..." : (
                            <div className="flex items-center justify-center gap-3">
                                <span>Commit Sentiment</span>
                                <Send className="w-3 h-3" />
                            </div>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewSection;
