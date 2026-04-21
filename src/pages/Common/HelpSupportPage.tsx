import React, { useState } from 'react';
import { MessageSquare, Mail, Phone, Upload, Search, ChevronDown, FileText } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { Button, Card } from '@components/Common';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface SupportRequest {
  subject: string;
  message: string;
  attachmentName?: string;
}

const HelpSupportPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'request' | 'guidelines'>('faq');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [supportRequest, setSupportRequest] = useState<SupportRequest>({
    subject: '',
    message: '',
    attachmentName: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // FAQ Data
  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'How do I submit a complaint?',
      answer: 'To submit a complaint, navigate to the Submit Complaint section from your dashboard. Fill in the complaint details including the category, priority, and description. Once submitted, you can track the status in My Complaints section.',
    },
    {
      id: 2,
      question: 'What is the typical resolution time for complaints?',
      answer: 'Resolution time varies based on the complexity and priority of the complaint. Low priority complaints are usually resolved within 5-7 days, medium priority within 3-5 days, and high priority within 1-2 days.',
    },
    {
      id: 3,
      question: 'How can I track my complaint status?',
      answer: 'You can track your complaint status in real-time from the My Complaints page. The system will show you the current status, assigned staff member, and expected completion date.',
    },
    {
      id: 4,
      question: 'Can I update or cancel a submitted complaint?',
      answer: 'Once a complaint has been assigned to staff, you cannot cancel it. However, you can add comments or additional information to the complaint from the complaint detail page.',
    },
    {
      id: 5,
      question: 'How do I provide feedback on the complaint resolution?',
      answer: 'After your complaint is resolved, you can provide feedback using the feedback form available in the complaint detail page. Your feedback helps us improve our services.',
    },
    {
      id: 6,
      question: 'What should I do if I have an urgent complaint?',
      answer: 'Mark your complaint as High Priority during submission. High priority complaints are assigned to available staff immediately and are resolved faster.',
    },
    {
      id: 7,
      question: 'How can staff access their assigned complaints?',
      answer: 'Staff members can view all assigned complaints in the Assigned Complaints section. They can update the status, add notes, and mark complaints as completed.',
    },
    {
      id: 8,
      question: 'How do department heads manage their staff?',
      answer: 'Department heads can access the Staff section to view all staff members, their availability status, and complaint assignments. They can also view department performance metrics.',
    },
  ];

  // Filter FAQ items based on search
  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSupportRequest(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = () => {
    console.log('[File Upload] File selection dialog opened (UI only)');
    // Simulate file selection
    setSupportRequest(prev => ({
      ...prev,
      attachmentName: 'document.pdf (UI Preview)'
    }));
  };

  const handleRemoveAttachment = () => {
    setSupportRequest(prev => ({ ...prev, attachmentName: undefined }));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);

    if (!supportRequest.subject.trim() || !supportRequest.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log('[Support Request Submitted]', {
        subject: supportRequest.subject,
        message: supportRequest.message,
        attachment: supportRequest.attachmentName,
        submittedBy: user?.email,
        timestamp: new Date().toISOString(),
      });

      setSubmitSuccess(true);
      setSupportRequest({ subject: '', message: '', attachmentName: undefined });
      setIsSubmitting(false);

      // Auto-clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-1">Get answers to common questions and submit support requests</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'faq'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          FAQ
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'contact'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Contact Support
        </button>
        <button
          onClick={() => setActiveTab('request')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'request'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Submit Request
        </button>
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'guidelines'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Guidelines
        </button>
      </div>

      {/* FAQ Section */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <Card>
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-600 mt-3">
                  Found {filteredFAQ.length} result{filteredFAQ.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </Card>

          {/* FAQ Items */}
          <div className="space-y-3">
            {filteredFAQ.length > 0 ? (
              filteredFAQ.map((item) => (
                <Card key={item.id}>
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
                    className="w-full p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-left font-medium text-gray-900">{item.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 ml-4 transition-transform ${
                        expandedFAQ === item.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFAQ === item.id && (
                    <div className="px-6 pb-6 border-t border-gray-200">
                      <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card>
                <div className="p-6 text-center">
                  <p className="text-gray-600">No FAQs found matching your search.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Contact Support Section */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Support */}
          <Card>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Send us an email for non-urgent inquiries
                  </p>
                  <a
                    href="mailto:support@complaintmanagement.com"
                    className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    support@complaintmanagement.com
                  </a>
                  <p className="text-gray-500 text-xs mt-2">
                    Response time: 24-48 hours
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Phone Support */}
          <Card>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Phone Support</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Call us for immediate assistance
                  </p>
                  <a
                    href="tel:+92-300-1234567"
                    className="mt-3 inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    +92-300-1234567
                  </a>
                  <p className="text-gray-500 text-xs mt-2">
                    Hours: Mon-Fri, 9 AM - 5 PM
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card className="md:col-span-2">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Channels</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Live Chat:</strong> Available on the dashboard (9 AM - 5 PM, Monday-Friday)
                </p>
                <p>
                  <strong>FAQ Section:</strong> Search our comprehensive FAQ database for instant answers
                </p>
                <p>
                  <strong>Help Center:</strong> Visit our online help center for detailed guides and tutorials
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Submit Support Request Section */}
      {activeTab === 'request' && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Submit Support Request
            </h2>

            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">
                  ✓ Your support request has been submitted successfully!
                </p>
                <p className="text-green-700 text-sm mt-1">
                  We'll get back to you within 24-48 hours.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-5">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={supportRequest.subject}
                  onChange={handleRequestChange}
                  placeholder="e.g., Issue with complaint assignment"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={supportRequest.message}
                  onChange={handleRequestChange}
                  rows={6}
                  placeholder="Please describe your issue or request in detail..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-gray-500 text-xs mt-1">
                  {supportRequest.message.length}/1000 characters
                </p>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment (Optional)
                </label>
                {supportRequest.attachmentName ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700 flex-1">{supportRequest.attachmentName}</span>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleFileSelect}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-gray-700"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-sm font-medium">Choose File (UI Preview Only)</span>
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSupportRequest({ subject: '', message: '' });
                    setSubmitSuccess(false);
                  }}
                >
                  Clear
                </Button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Your support request is logged for tracking purposes. You can check the status of your requests in your support dashboard.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Guidelines Section */}
      {activeTab === 'guidelines' && (
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">System Guidelines</h2>

              <div className="space-y-6">
                {/* For Residents */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">For Residents</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex gap-3">
                      <span className="text-blue-600 font-bold">1.</span>
                      <span>
                        <strong>Submit Complaints:</strong> Use the Submit Complaint form to report maintenance, utility, or other issues in your residence.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-600 font-bold">2.</span>
                      <span>
                        <strong>Be Specific:</strong> Provide detailed information about the issue, location, and any relevant photos or documents.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-600 font-bold">3.</span>
                      <span>
                        <strong>Track Status:</strong> Monitor your complaint progress in real-time from the My Complaints section.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-600 font-bold">4.</span>
                      <span>
                        <strong>Provide Feedback:</strong> After resolution, rate the service to help us improve.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-600 font-bold">5.</span>
                      <span>
                        <strong>Response Time:</strong> Expect initial acknowledgement within 24 hours of submission.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* For Staff */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">For Staff Members</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex gap-3">
                      <span className="text-green-600 font-bold">1.</span>
                      <span>
                        <strong>Check Assignments:</strong> Review your assigned complaints daily from the Assigned Complaints section.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-bold">2.</span>
                      <span>
                        <strong>Update Status:</strong> Keep complaint status updated as work progresses.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-bold">3.</span>
                      <span>
                        <strong>Add Notes:</strong> Document work performed and any blockers or dependencies.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-bold">4.</span>
                      <span>
                        <strong>Meet Deadlines:</strong> Complete work within the assigned timeframe.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-green-600 font-bold">5.</span>
                      <span>
                        <strong>Professional Conduct:</strong> Maintain professional communication with residents.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* For Department Heads */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">For Department Heads</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex gap-3">
                      <span className="text-purple-600 font-bold">1.</span>
                      <span>
                        <strong>Manage Staff:</strong> Assign complaints fairly based on staff availability and expertise.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-600 font-bold">2.</span>
                      <span>
                        <strong>Monitor Performance:</strong> Track staff performance and complaint resolution rates.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-600 font-bold">3.</span>
                      <span>
                        <strong>Escalate Issues:</strong> Report critical issues to administration promptly.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-600 font-bold">4.</span>
                      <span>
                        <strong>Maintain Quality:</strong> Ensure all complaints are resolved to resident satisfaction.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-600 font-bold">5.</span>
                      <span>
                        <strong>Team Development:</strong> Provide training and support to improve staff efficiency.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* General Guidelines */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">General Guidelines</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex gap-3">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>
                        <strong>Confidentiality:</strong> All personal and complaint information is confidential and secure.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>
                        <strong>Fair Treatment:</strong> All complaints are handled fairly regardless of resident status.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>
                        <strong>Respectful Communication:</strong> Maintain professional and respectful communication at all times.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>
                        <strong>System Security:</strong> Do not share your login credentials with anyone.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>
                        <strong>Feedback:</strong> Your suggestions for system improvement are welcome.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HelpSupportPage;
