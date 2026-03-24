import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, AlertTriangle, Globe, Users, Award, Lock, CheckCircle, BookOpen, Scale, Clock, CreditCard, HelpCircle, Star, Zap, Heart, Target } from 'lucide-react';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex flex-wrap items-center justify-center gap-8 p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Globe key={i} className="w-12 h-12 text-white" />
          ))}
        </div>
        <div className="relative z-10">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white mb-4 flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center shadow-md">
              <Globe className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">About World Mall</h1>
              <p className="text-white/70 text-sm">Your Trusted E-Commerce Platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        {/* 1. Welcome Section */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-gray-900">1. Welcome to World Mall</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            World Mall is a premier global e-commerce platform that connects buyers with premium products from around the world. Our mission is to provide a seamless, secure, and rewarding shopping experience for all our members. Founded with the vision of making quality products accessible to everyone, World Mall has grown into a trusted marketplace serving thousands of users across multiple countries.
          </p>
        </div>

        {/* 2. Our Mission */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">2. Our Mission</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Our mission is to empower individuals through e-commerce by providing opportunities to earn commissions while engaging with quality products. We believe in creating a fair, transparent, and rewarding ecosystem where every member can benefit from their participation.
          </p>
        </div>

        {/* 3. How It Works */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h2 className="text-base font-bold text-gray-900">3. How It Works</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            World Mall operates on a simple yet effective model:
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs bg-purple-100 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <p className="text-sm text-gray-600">Register an account and deposit funds to get started.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs bg-purple-100 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <p className="text-sm text-gray-600">Complete product orders assigned to your VIP level.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs bg-purple-100 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <p className="text-sm text-gray-600">Earn commissions on each completed order.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs bg-purple-100 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <p className="text-sm text-gray-600">Withdraw your earnings at any time.</p>
            </div>
          </div>
        </div>

        {/* 4. VIP Levels */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-orange-600" />
            <h2 className="text-base font-bold text-gray-900">4. VIP Membership Levels</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            World Mall offers multiple VIP levels, each with increasing benefits and commission rates. As you progress through levels, you unlock access to higher-value products and better commission rates. Your VIP level determines the types of products available and the commission percentage you earn on each order.
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3">
            <p className="text-xs text-purple-700 font-medium">VIP 1 through VIP 8 levels available with increasing commission rates from 0.5% to 2.0%</p>
          </div>
        </div>

        {/* 5. Order Rules - IMPORTANT */}
        <div className="bg-white rounded-2xl shadow-sm p-5 ring-2 ring-red-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-red-700">5. Order Rules (Important)</h2>
          </div>
          <div className="bg-red-50 rounded-xl p-4 mb-3">
            <p className="text-sm text-red-800 font-bold leading-relaxed">
              Each order must be completed before proceeding to the next order. Orders cannot be skipped or bypassed.
            </p>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Orders are assigned sequentially based on your VIP level.</p>
            <p>• You must have sufficient balance to complete each order.</p>
            <p>• Once an order is completed, the commission is immediately credited to your account.</p>
            <p>• You cannot skip to a later order without completing the current one.</p>
            <p>• All orders for your current VIP level must be completed before advancing.</p>
            <p>• Order completion is irreversible and cannot be undone.</p>
          </div>
        </div>

        {/* 6. Deposits */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-green-600" />
            <h2 className="text-base font-bold text-gray-900">6. Deposit Policy</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Deposits are processed through our secure payment system. All deposits are reviewed and approved by our administrative team. Please ensure you provide accurate transaction details including the transaction hash (TX Hash) for cryptocurrency deposits. Deposits are typically processed within 24 hours. Minimum deposit amounts may apply depending on the payment method.
          </p>
        </div>

        {/* 7. Withdrawals */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">7. Withdrawal Policy</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Withdrawals can be requested at any time through your account dashboard. All withdrawal requests are reviewed by our team to ensure security. Processing times may vary but typically take 1-3 business days. Please ensure your wallet address is correct before submitting a withdrawal request, as transactions on the blockchain are irreversible.
          </p>
        </div>

        {/* 8. Commission Structure */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-yellow-600" />
            <h2 className="text-base font-bold text-gray-900">8. Commission Structure</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Commissions are calculated as a percentage of the order value. The commission rate varies based on your VIP level and the specific product. Higher VIP levels unlock products with better commission rates. Commissions are credited to your account balance immediately upon order completion and can be withdrawn at any time.
          </p>
        </div>

        {/* 9. Account Security */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-gray-900">9. Account Security</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            We take your account security seriously. Please keep your login credentials confidential and never share them with anyone. We recommend changing your password regularly and using a strong, unique password. If you suspect unauthorized access to your account, contact our support team immediately.
          </p>
        </div>

        {/* 10. Privacy Policy */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-gray-600" />
            <h2 className="text-base font-bold text-gray-900">10. Privacy Policy</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            World Mall is committed to protecting your personal information. We collect only the information necessary to provide our services. Your data is encrypted and stored securely. We do not sell or share your personal information with third parties without your consent. For detailed information about how we handle your data, please contact our support team.
          </p>
        </div>

        {/* 11. Referral Program */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-green-600" />
            <h2 className="text-base font-bold text-gray-900">11. Referral Program</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            World Mall offers a referral program that rewards you for inviting new members. When you share your invite code and someone registers using it, they become part of your team. The referral program is designed to help grow our community while rewarding active members for their contributions.
          </p>
        </div>

        {/* 12. Customer Support */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">12. Customer Support</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Our dedicated support team is available to assist you with any questions or concerns. You can reach us through the in-app Support Chat feature. Our team strives to respond to all inquiries within 24 hours. For urgent matters, please clearly indicate the urgency in your message.
          </p>
        </div>

        {/* 13. Account Suspension */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-gray-900">13. Account Suspension Policy</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            World Mall reserves the right to suspend or freeze accounts that violate our terms of service. This includes but is not limited to: fraudulent activity, multiple account creation, abuse of the commission system, or any behavior that undermines the integrity of our platform. Suspended accounts may have their funds frozen pending investigation.
          </p>
        </div>

        {/* 14. Dispute Resolution */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-gray-900">14. Dispute Resolution</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            In the event of a dispute, we encourage members to first contact our support team for resolution. All disputes will be reviewed fairly and impartially. We aim to resolve all disputes within 7 business days. If a resolution cannot be reached through our support team, the matter may be escalated to our management team for further review.
          </p>
        </div>

        {/* 15. Platform Updates */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">15. Platform Updates</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            World Mall is continuously improving to provide a better experience for our members. We regularly update our platform with new features, security enhancements, and performance improvements. Important updates will be communicated through our notification system. We recommend keeping your app updated to the latest version.
          </p>
        </div>

        {/* 16. Intellectual Property */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <h2 className="text-base font-bold text-gray-900">16. Intellectual Property</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            All content on the World Mall platform, including but not limited to logos, text, graphics, images, and software, is the property of World Mall and is protected by intellectual property laws. Unauthorized use, reproduction, or distribution of any content from our platform is strictly prohibited.
          </p>
        </div>

        {/* 17. Limitation of Liability */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-gray-900">17. Limitation of Liability</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            World Mall shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services. This includes, but is not limited to, damages for loss of profits, data, or other intangible losses. Our total liability shall not exceed the amount you have deposited on our platform.
          </p>
        </div>

        {/* 18. Governing Law */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-gray-600" />
            <h2 className="text-base font-bold text-gray-900">18. Governing Law</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            These terms and conditions shall be governed by and construed in accordance with applicable international e-commerce laws. Any disputes arising from or related to these terms shall be subject to the exclusive jurisdiction of the appropriate legal authorities.
          </p>
        </div>

        {/* 19. Changes to Terms */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">19. Changes to Terms</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            World Mall reserves the right to modify these terms and conditions at any time. Changes will be effective immediately upon posting on our platform. Your continued use of our services after any changes constitutes your acceptance of the new terms. We encourage you to review these terms periodically.
          </p>
        </div>

        {/* 20. Contact Information */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-gray-900">20. Contact Us</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            We value your feedback and are always here to help. If you have any questions, suggestions, or concerns about our platform or these terms, please do not hesitate to reach out to us through our Support Chat feature available in the app. Our team is dedicated to providing you with the best possible experience on World Mall.
          </p>
          <button 
            onClick={() => navigate('/chat')}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Contact Support
          </button>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">World Mall &copy; {new Date().getFullYear()}. All rights reserved.</p>
          <p className="text-xs text-gray-400 mt-1">Version 2.0</p>
        </div>
      </div>
    </div>
  );
}
