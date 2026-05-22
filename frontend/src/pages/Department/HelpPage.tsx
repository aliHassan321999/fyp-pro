import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, Mail, Phone, Clock, HelpCircle } from 'lucide-react';
import { Card } from '@components/Common';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const DepartmentHelpPage: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: "How do I assign a complaint to staff?",
      answer: "Navigate to the Complaints section, find the complaint you want to assign, select a staff member from the dropdown, and click the 'Assign' button. The staff member will be notified of the new assignment."
    },
    {
      id: 2,
      question: "How can I view my department's performance metrics?",
      answer: "Go to the Dashboard section to see real-time metrics including unassigned complaints, in-progress tasks, resolved complaints today, and SLA at-risk items."
    },
    {
      id: 3,
      question: "How do I view my staff members' details?",
      answer: "Visit the Staff page to see all staff members in your department. You can view their performance metrics including assigned complaints, resolved count, compliance rate, and SLA breaches."
    },
    {
      id: 4,
      question: "What does SLA at Risk mean?",
      answer: "SLA (Service Level Agreement) at Risk means that some complaints are approaching or have missed their target resolution time. These require immediate attention to maintain service quality."
    },
    {
      id: 5,
      question: "Can I update my profile information?",
      answer: "Yes! Go to your Profile section where you can update your name, phone number, address, and upload or change your profile picture."
    },
    {
      id: 6,
      question: "How are complaints prioritized?",
      answer: "Complaints are prioritized based on their priority level (High, Medium, Low) and status. High priority items and unassigned complaints should be addressed first."
    },
    {
      id: 7,
      question: "What if a staff member cannot complete a complaint?",
      answer: "You can reassign the complaint to another staff member. Go to the complaint details and select a different staff member to reassign it."
    },
    {
      id: 8,
      question: "How do I know if a resident has submitted feedback?",
      answer: "Feedback is recorded once a complaint is marked as resolved. You can view feedback in the complaint details page under the resident's review and rating."
    }
  ];

  const supportChannels = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "support@complaintmanagement.com",
      time: "Response within 24 hours"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "+1-800-COMPLAINTS",
      time: "Mon-Fri: 9AM-6PM"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Available on the dashboard",
      time: "Mon-Fri: 10AM-5PM"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Emergency Support",
      description: "+1-800-EMERGENCY",
      time: "24/7 Available"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Help & Support</h1>
        <p className="text-secondary-600 mt-2">Find answers and get support for your questions</p>
      </div>

      {/* Support Channels */}
      <div>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Contact Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportChannels.map((channel, index) => (
            <Card key={index} variant="md" className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  {channel.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary-900">{channel.title}</h3>
                  <p className="text-sm text-secondary-600 mt-1">{channel.description}</p>
                  <p className="text-xs text-secondary-500 mt-2">{channel.time}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqs.map((faq) => (
            <Card key={faq.id} variant="md" className="p-0 overflow-hidden">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary-50 transition-colors text-left"
              >
                <span className="font-semibold text-secondary-900">{faq.question}</span>
                <div className="text-blue-600 flex-shrink-0">
                  {expandedFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>
              {expandedFAQ === faq.id && (
                <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200">
                  <p className="text-secondary-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <Card variant="md" className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-lg font-bold text-secondary-900 mb-3">Additional Resources</h2>
        <ul className="space-y-2 text-secondary-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span><strong>User Manual:</strong> Download our comprehensive guide for department heads</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span><strong>Video Tutorials:</strong> Visit our learning center for step-by-step videos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span><strong>Community Forum:</strong> Connect with other department heads and share best practices</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span><strong>Status Page:</strong> Check system status and scheduled maintenance</span>
          </li>
        </ul>
      </Card>

      {/* Quick Tips */}
      <Card variant="md" className="p-6 border-l-4 border-l-green-500">
        <h2 className="text-lg font-bold text-secondary-900 mb-3">💡 Quick Tips</h2>
        <ul className="space-y-2 text-secondary-700 text-sm">
          <li>✓ Regularly check the Dashboard to stay updated on complaint status</li>
          <li>✓ Assign complaints to staff with relevant expertise for faster resolution</li>
          <li>✓ Monitor SLA metrics to prevent service level breaches</li>
          <li>✓ Review staff performance metrics to identify top performers</li>
          <li>✓ Keep your profile information updated for better communication</li>
        </ul>
      </Card>
    </div>
  );
};

export default DepartmentHelpPage;
