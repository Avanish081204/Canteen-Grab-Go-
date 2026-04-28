import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, HelpCircle, ChevronDown, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: "How does the token system work?",
    a: "Once you place an order, you receive a unique token number (e.g. BAPH26042801). You can track this number on the display screens and collect your order when it's called out."
  },
  {
    q: "Can I cancel my order?",
    a: "Orders can only be cancelled before they enter the 'Cooking' stage. Please visit the counter immediately if you need to cancel."
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI payments online through the app. Cash payments can be made directly at the counter for walk-in orders."
  },
  {
    q: "How does Staff Delivery work?",
    a: "Staff delivery is an exclusive feature for college staff. You can select your department and time slot, and your order will be delivered to you. A special staff code is required to access this feature."
  }
];

export default function Help() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-muted/30 pb-8">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground text-sm mt-2">
            How can we help you today?
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for articles or topics..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
          />
        </div>

        {/* FAQs */}
        <h2 className="font-bold text-lg mb-4 text-foreground">Frequently Asked Questions</h2>
        <div className="space-y-3 mb-8">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-medium text-sm text-foreground pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed animate-fade-in border-t border-border pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <h2 className="font-bold text-lg mb-4 text-foreground">Still need help?</h2>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => window.location.href = 'mailto:support@campuscanteen.com'}
            className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center justify-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-semibold">Email Us</span>
          </button>
          
          <button 
            onClick={() => window.location.href = 'tel:+919503658089'}
            className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center justify-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-semibold">Call Support</span>
          </button>
        </div>
      </div>
    </div>
  );
}
