import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import { Button, Card } from '@components/Common';
import { ROUTES } from '@constants/index';
import { useSubmitComplaintFeedbackMutation, useGetComplaintDetailsQuery } from '@/features/complaint/complaint.api';
import toast from 'react-hot-toast';

const FeedbackFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  
  const { data: detailsData } = useGetComplaintDetailsQuery(id as string, { skip: !id });
  const complaint = detailsData?.data;
  
  const [submitFeedback, { isLoading }] = useSubmitComplaintFeedbackMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating before submitting.');
      return;
    }
    
    if (complaint?.feedbackSubmitted) {
      toast.error('Feedback was already submitted for this case.');
      return;
    }

    try {
      await submitFeedback({ id: id as string, rating, comment }).unwrap();
      toast.success('Thank you! Your feedback has been recorded.');
      navigate(ROUTES.RESIDENT_COMPLAINT_DETAIL.replace(':id', id as string), { state: { feedbackSuccess: true } });
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit feedback.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Rate Your Experience</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Help us improve by sharing your feedback</p>
        </div>
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
              disabled={isLoading}
              onClick={() => navigate(-1)}
              className="py-3"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              type="submit"
              disabled={rating === 0 || isLoading || complaint?.feedbackSubmitted}
              className="py-3 font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>

          {/* Validation Message */}
          {rating === 0 && (
            <p className="text-sm text-red-500 font-medium text-center">
              Please select a rating before submitting.
            </p>
          )}
          {complaint?.feedbackSubmitted && (
             <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center mt-4">
               <p className="text-sm text-red-600 font-bold">You have already submitted feedback for this incident.</p>
             </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default FeedbackFormPage;
