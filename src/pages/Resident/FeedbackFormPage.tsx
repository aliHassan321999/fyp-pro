import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import { Button, Card, InputField } from '@components/Common';
import { ROUTES } from '@constants/index';

const FeedbackFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    // Submit feedback to API
    console.log('Feedback submitted:', { id, rating, comment });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card variant="md" className="max-w-md text-center p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Thank You!</h2>
          <p className="text-secondary-600 mb-6">
            Your feedback has been submitted successfully. We appreciate your input and will use it
            to improve our services.
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(ROUTES.RESIDENT_MY_COMPLAINTS)}
          >
            Back to My Complaints
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold text-secondary-900">Share Your Feedback</h1>
      </div>

      <Card variant="md" className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Complaint Reference */}
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm text-secondary-600 mb-1">Complaint ID</p>
            <p className="font-semibold text-secondary-900">{id}</p>
          </div>

          {/* Rating Section */}
          <div>
            <label className="block text-lg font-semibold text-secondary-900 mb-4">
              How satisfied are you with the resolution?
            </label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform duration-200 hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-secondary-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm">
              {rating > 0 && (
                <p className="text-secondary-600">
                  {rating === 1 && 'Very Unsatisfied'}
                  {rating === 2 && 'Unsatisfied'}
                  {rating === 3 && 'Neutral'}
                  {rating === 4 && 'Satisfied'}
                  {rating === 5 && 'Very Satisfied'}
                </p>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <label htmlFor="comment" className="block text-lg font-semibold text-secondary-900 mb-3">
              Additional Comments (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about the resolution process, staff behavior, timeliness, etc..."
              rows={6}
              className="w-full px-4 py-3 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="text-xs text-secondary-500 mt-2">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Tips Card */}
          <Card variant="md" className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-secondary-900 mb-2">Helpful Feedback Tips</h4>
            <ul className="text-sm text-secondary-700 space-y-1">
              <li>• Be specific about what went well or could be improved</li>
              <li>• Share any suggestions for better service</li>
              <li>• Mention if there were any issues during the process</li>
            </ul>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate(ROUTES.RESIDENT_MY_COMPLAINTS)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              type="submit"
              disabled={rating === 0}
            >
              Submit Feedback
            </Button>
          </div>

          {/* Validation Message */}
          {rating === 0 && (
            <p className="text-sm text-red-600 text-center">
              Please select a rating before submitting
            </p>
          )}
        </form>
      </Card>
    </div>
  );
};

export default FeedbackFormPage;
