import { useState, useEffect } from "react";
import { X, Shield, Eye, Database, Share2, Lock, AlertCircle } from "lucide-react";

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  const [activeSection, setActiveSection] = useState<string>("overview");

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections = [
    { id: "overview", title: "Overview", icon: Shield },
    { id: "data-collection", title: "Data Collection", icon: Database },
    { id: "data-usage", title: "How We Use Data", icon: Eye },
    { id: "ai-content", title: "AI Content Creation", icon: Share2 },
    { id: "data-security", title: "Data Security", icon: Lock },
    { id: "your-rights", title: "Your Rights", icon: AlertCircle },
  ];

  const sectionContent = {
    overview: {
      title: "Privacy Policy Overview",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 leading-relaxed">
            At Siwaht, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, and protect your data when you use our AI-powered video, 
            audio, and advertising creation services.
          </p>
          <p className="text-slate-600 leading-relaxed">
            We understand that when you create content with our AI tools, you're sharing creative ideas and potentially 
            sensitive information. We take this responsibility seriously and have implemented comprehensive measures to 
            protect your data and creative assets.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">Last Updated: January 2025</p>
            <p className="text-blue-700 text-sm mt-1">
              This policy applies to all Siwaht services including AI video creation, avatar generation, voice synthesis, 
              video editing, and podcast production.
            </p>
          </div>
        </div>
      )
    },
    "data-collection": {
      title: "Information We Collect",
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Personal Information</h4>
            <ul className="space-y-2 text-slate-600">
              <li>• Name, email address, and contact information</li>
              <li>• Account credentials and profile information</li>
              <li>• Payment and billing information</li>
              <li>• Communication preferences</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Content Data</h4>
            <ul className="space-y-2 text-slate-600">
              <li>• Text prompts and scripts for AI video generation</li>
              <li>• Voice recordings for synthesis and avatar creation</li>
              <li>• Images and videos uploaded for editing or avatar training</li>
              <li>• Audio files for podcast production and voice cloning</li>
              <li>• Project settings, preferences, and custom configurations</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Usage Analytics</h4>
            <ul className="space-y-2 text-slate-600">
              <li>• Service usage patterns and feature interactions</li>
              <li>• Performance metrics and error logs</li>
              <li>• Device information and browser data</li>
              <li>• IP address and location data (when permitted)</li>
            </ul>
          </div>
        </div>
      )
    },
    "data-usage": {
      title: "How We Use Your Information",
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Service Delivery</h4>
            <ul className="space-y-2 text-slate-600">
              <li>• Generate AI videos, avatars, and audio content based on your inputs</li>
              <li>• Process and edit your uploaded media files</li>
              <li>• Provide personalized recommendations and improvements</li>
              <li>• Maintain your project history and preferences</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Account Management</h4>
            <ul className="space-y-2 text-slate-600">
              <li>• Create and maintain your user account</li>
              <li>• Process payments and manage subscriptions</li>
              <li>• Provide customer support and technical assistance</li>
              <li>• Send service updates and important notifications</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Service Improvement</h4>
            <ul className="space-y-2 text-slate-600">
              <li>• Analyze usage patterns to improve our AI models</li>
              <li>• Develop new features and enhance existing services</li>
              <li>• Conduct research and development (with anonymized data)</li>
              <li>• Ensure service reliability and performance optimization</li>
            </ul>
          </div>
        </div>
      )
    },
    "ai-content": {
      title: "AI Content Creation & Your Rights",
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Content Ownership</h4>
            <p className="text-slate-600 leading-relaxed mb-4">
              You retain full ownership of all content you create using our AI services. This includes:
            </p>
            <ul className="space-y-2 text-slate-600">
              <li>• Videos generated from your prompts and inputs</li>
              <li>• AI avatars created from your images or specifications</li>
              <li>• Voice synthesis and audio content based on your recordings</li>
              <li>• Edited videos and podcast productions</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">AI Model Training</h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 leading-relaxed">
                <strong>Important:</strong> We do not use your personal content, voice recordings, or uploaded images 
                to train our general AI models. Your creative inputs remain private and are only used to generate 
                your specific requested content.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Content Storage</h4>
            <ul className="space-y-2 text-slate-600">
              <li>• Your projects are stored securely in encrypted cloud storage</li>
              <li>• You can download and delete your content at any time</li>
              <li>• We maintain backups for service reliability (encrypted and secure)</li>
              <li>• Content is automatically deleted after account closure (30-day grace period)</li>
            </ul>
          </div>
        </div>
      )
    },
    "data-security": {
      title: "Data Security Measures",
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Technical Safeguards</h4>
            <ul className="space-y-2 text-slate-600">
              <li>• End-to-end encryption for all data transmission</li>
              <li>• AES-256 encryption for data storage</li>
              <li>• Regular security audits and penetration testing</li>
              <li>• Multi-factor authentication support</li>
              <li>• Secure API endpoints with rate limiting</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Operational Security</h4>
            <ul className="space-y-2 text-slate-600">
              <li>• Limited access controls for employee data handling</li>
              <li>• Regular security training for all team members</li>
              <li>• Incident response procedures and monitoring</li>
              <li>• Compliance with SOC 2 Type II standards</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Data Centers</h4>
            <ul className="space-y-2 text-slate-600">
              <li>• Enterprise-grade cloud infrastructure (AWS, Google Cloud)</li>
              <li>• Geographic data residency options available</li>
              <li>• Redundant backups across multiple secure locations</li>
              <li>• 99.9% uptime SLA with disaster recovery procedures</li>
            </ul>
          </div>
        </div>
      )
    },
    "your-rights": {
      title: "Your Privacy Rights",
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Data Access & Control</h4>
            <ul className="space-y-2 text-slate-600">
              <li>• <strong>Access:</strong> Request copies of all your personal data</li>
              <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
              <li>• <strong>Deletion:</strong> Request deletion of your account and data</li>
              <li>• <strong>Portability:</strong> Export your content in standard formats</li>
              <li>• <strong>Restriction:</strong> Limit how we process certain data</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Communication Preferences</h4>
            <ul className="space-y-2 text-slate-600">
              <li>• Opt out of marketing communications at any time</li>
              <li>• Control notification settings for your account</li>
              <li>• Choose how we contact you for support and updates</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Regional Compliance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-800 mb-2">GDPR (EU)</h5>
                <p className="text-green-700 text-sm">
                  Full compliance with European data protection regulations
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-2">CCPA (California)</h5>
                <p className="text-blue-700 text-sm">
                  California Consumer Privacy Act compliance
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Contact Us</h4>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-slate-700 mb-2">
                <strong>Data Protection Officer:</strong> privacy@siwahtai.com
              </p>
              <p className="text-slate-700 mb-2">
                <strong>Response Time:</strong> 30 days maximum (typically within 5 business days)
              </p>
              <p className="text-slate-700 text-sm">
                For urgent privacy concerns, please contact our support team directly.
              </p>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer" 
        onClick={(e) => {
          e.preventDefault();
          onClose();
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close privacy policy"
      />
      {/* Modal */}
      <div className="absolute inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl flex flex-col max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Privacy Policy</h2>
              <p className="text-slate-600 text-sm">Siwaht AI Content Creation Services</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors duration-200"
            aria-label="Close privacy policy"
            data-testid="privacy-close"
            type="button"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-slate-200 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSection(section.id);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    data-testid={`privacy-nav-${section.id}`}
                    type="button"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8">
              <div className="max-w-4xl">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  {sectionContent[activeSection as keyof typeof sectionContent]?.title}
                </h3>
                <div className="prose prose-slate max-w-none">
                  {sectionContent[activeSection as keyof typeof sectionContent]?.content}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">
              Questions about our privacy practices? Contact us at{" "}
              <a href="mailto:privacy@siwahtai.com" className="text-blue-600 hover:text-blue-700 font-medium">cc@siwaht.com</a>
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="btn-primary px-6 py-2 text-sm"
              data-testid="privacy-understood"
              type="button"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}