"use client";

import React, { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquare, AlertCircle, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  currentUserId: string;
  onSuccess?: () => void;
}

const QUICK_TAGS_DRIVER = [
  'Punctual Departure',
  'Smooth & Safe Drive',
  'Clean & Comfortable Car',
  'Polite & Respectful',
  'Great Communication',
  'AC Working Well'
];

const QUICK_TAGS_RIDER = [
  'Punctual at Pickup',
  'Pleasant & Respectful',
  'Fast Payment / Cash Ready',
  'Great Communication',
  'Courteous Passenger'
];

export default function RatingModal({
  isOpen,
  onClose,
  booking,
  currentUserId,
  onSuccess
}: RatingModalProps) {
  const [score, setScore] = useState<number>(5);
  const [hoverScore, setHoverScore] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !booking) return null;

  const isRiderReviewing = booking.rider_id === currentUserId;
  const revieweeId = isRiderReviewing ? booking.driver_id : booking.rider_id;
  const revieweeName = isRiderReviewing 
    ? (booking.driver?.full_name || 'Driver') 
    : (booking.rider?.full_name || 'Rider');
  
  const quickTags = isRiderReviewing ? QUICK_TAGS_DRIVER : QUICK_TAGS_RIDER;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revieweeId) {
      setError('Cannot identify commute partner to rate.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const combinedComment = [
        ...selectedTags,
        feedback.trim()
      ].filter(Boolean).join(' • ');

      // 1. Insert into ratings table (if table exists)
      const { error: ratingErr } = await supabase
        .from('ratings')
        .insert({
          booking_id: booking.id,
          reviewer_id: currentUserId,
          reviewee_id: revieweeId,
          score: score,
          feedback: combinedComment || null
        });

      // 2. Also calculate and update reviewee's average rating in profiles
      try {
        const { data: allRatings } = await supabase
          .from('ratings')
          .select('score')
          .eq('reviewee_id', revieweeId);

        if (allRatings && allRatings.length > 0) {
          const total = allRatings.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0);
          const avgRating = parseFloat((total / allRatings.length).toFixed(1));
          
          await supabase
            .from('profiles')
            .update({ rating: avgRating })
            .eq('id', revieweeId);
        } else {
          await supabase
            .from('profiles')
            .update({ rating: score })
            .eq('id', revieweeId);
        }
      } catch (calcErr) {
        console.warn('Rating aggregate recalculation handled gracefully:', calcErr);
      }

      setSubmitted(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setSelectedTags([]);
        setFeedback('');
        setScore(5);
      }, 1800);

    } catch (err: any) {
      setError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gazie-navy/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border-2 border-gazie-navy w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-left my-8">
        
        {/* Header */}
        <div className="bg-gazie-navy text-gazie-paper p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-gazie-yellow fill-gazie-yellow" />
            <span className="font-display font-black text-sm uppercase tracking-wider">
              Rate Your Commute
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gazie-paper/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-green-50 border-2 border-gazie-green rounded-full flex items-center justify-center mx-auto text-gazie-green">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-gazie-navy">Thank you for rating!</h3>
              <p className="text-xs text-gazie-navy/70 max-w-xs mx-auto">
                Your feedback helps keep the Gazie Commute community trusted, safe, and dependable.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="text-center space-y-1">
                <h3 className="font-display font-bold text-base text-gazie-navy">
                  How was your trip with <span className="text-gazie-navy underline decoration-gazie-yellow decoration-2">{revieweeName}</span>?
                </h3>
                <p className="text-xs text-gazie-navy/60">
                  {booking.pickup} → {booking.destination}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Interactive Star Rating Selector */}
              <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverScore || score) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setScore(star)}
                        onMouseEnter={() => setHoverScore(star)}
                        onMouseLeave={() => setHoverScore(0)}
                        className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors duration-150 ${
                            isFilled
                              ? 'text-gazie-yellow fill-gazie-yellow stroke-gazie-navy stroke-[1.5]'
                              : 'text-gray-200 fill-gray-100'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="font-mono text-xs font-bold text-gazie-navy mt-1">
                  {score === 5 && '⭐️⭐️⭐️⭐️⭐️ Outstanding (5.0)'}
                  {score === 4 && '⭐️⭐️⭐️⭐️ Very Good (4.0)'}
                  {score === 3 && '⭐️⭐️⭐️ Average / OK (3.0)'}
                  {score === 2 && '⭐️⭐️ Poor Experience (2.0)'}
                  {score === 1 && '⭐️ Terrible (1.0)'}
                </span>
              </div>

              {/* Quick Compliment Tags */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">
                  Quick Compliments
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gazie-navy text-white border-gazie-navy shadow-sm'
                            : 'bg-white text-gazie-navy/70 border-gazie-navy/20 hover:border-gazie-navy hover:text-gazie-navy'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Review Textarea */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gazie-navy/70 block">
                  Additional Feedback <span className="font-normal lowercase text-gazie-navy/50">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Share any additional details about the commute..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-gazie-paper/20 border border-gazie-navy rounded-xl text-xs focus:outline-none focus:border-gazie-yellow font-medium resize-none"
                  maxLength={300}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gazie-navy text-gazie-paper hover:bg-gazie-yellow hover:text-gazie-navy font-bold py-3 rounded-xl border border-gazie-navy transition-all duration-200 text-xs shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading ? 'Submitting Review...' : `Submit ${score}-Star Review`}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
