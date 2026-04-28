import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Shield, FileText, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Logo from '@/components/Logo';

export default function About() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

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
        <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border animate-fade-in mb-6">
          <div className="flex justify-center mb-6">
            <Logo size="lg" className="shadow-xl" />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Campus Canteen</h1>
            <p className="text-primary font-medium text-sm">Official Campus Dining Platform • v1.0.0</p>
          </div>

          <div className="space-y-6 text-sm text-muted-foreground">
            <p className="leading-relaxed">
              Campus Canteen is the official digital dining solution designed to provide a seamless, efficient, and modern food ordering experience for the entire college community.
            </p>
            
            <p className="leading-relaxed">
              Our platform streamlines canteen operations, reduces wait times, and ensures high service standards through advanced token management and real-time order tracking.
            </p>
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden animate-fade-in mb-6">
          <div className="divide-y divide-border">
            {/* Privacy Policy */}
            <div>
              <button 
                onClick={() => toggleSection('privacy')}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 text-foreground">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Privacy Policy</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSection === 'privacy' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'privacy' && (
                <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed space-y-2 animate-fade-in">
                  <p><strong>1. Data Collection:</strong> We collect minimal data required for order processing, including name, phone number, and department (for staff).</p>
                  <p><strong>2. Usage:</strong> Your data is used solely for identifying orders and communicating order status updates.</p>
                  <p><strong>3. Protection:</strong> We implement industry-standard security measures to protect your information from unauthorized access.</p>
                  <p><strong>4. Third Parties:</strong> We do not share your personal data with external marketing firms.</p>
                </div>
              )}
            </div>

            {/* Terms of Service */}
            <div>
              <button 
                onClick={() => toggleSection('terms')}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 text-foreground">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Terms of Service</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSection === 'terms' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'terms' && (
                <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed space-y-2 animate-fade-in">
                  <p><strong>1. Orders:</strong> All orders placed are final once they enter the cooking stage.</p>
                  <p><strong>2. Tokens:</strong> Tokens must be presented at the counter to collect food items.</p>
                  <p><strong>3. Payments:</strong> Online payments are processed securely. In case of failed transactions, please contact the support team with your transaction ID.</p>
                  <p><strong>4. Conduct:</strong> Users are expected to maintain campus decorum while using the canteen facilities.</p>
                </div>
              )}
            </div>

            {/* Acknowledgments */}
            <div>
              <button 
                onClick={() => toggleSection('acks')}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 text-foreground">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">Acknowledgments</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSection === 'acks' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'acks' && (
                <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed space-y-2 animate-fade-in">
                  <p>We would like to acknowledge the following contributors and technologies:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>College Administration for their support and vision.</li>
                    <li>Canteen Staff for their feedback and coordination.</li>
                    <li>The Open Source community for providing robust frameworks and tools.</li>
                    <li>Design team for the modern and intuitive interface.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2026 Campus Canteen. All rights reserved.
        </p>
      </div>
    </div>
  );
}
