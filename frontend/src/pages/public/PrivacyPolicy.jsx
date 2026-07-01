// src/pages/public/PrivacyPolicy.jsx
export default function PrivacyPolicy() {
  const sectionClass = 'mb-8'
  const headingClass = 'text-xl font-semibold text-slate-800 mb-2'
  const textClass = 'text-sm text-slate-500 leading-relaxed'

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-4">
        Legal
      </span>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-slate-400 mb-10">Last updated: July 1, 2026</p>

      <div className={sectionClass}>
        <h2 className={headingClass}>1. Information We Collect</h2>
        <p className={textClass}>
          When you register for an account, we collect your name, email
          address, phone number, institution, department, and role. When you
          use the platform, we store the grant proposals, budgets,
          disbursements, milestones, and reports you create or that are
          shared with you.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>2. How We Use Your Information</h2>
        <p className={textClass}>
          We use your information to operate the platform: authenticating
          your account, routing proposals for review, sending notifications
          about approvals and deadlines, and maintaining audit logs for
          compliance purposes. We do not sell your personal data to third
          parties.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>3. Data Storage &amp; Security</h2>
        <p className={textClass}>
          Passwords are stored using industry-standard hashing and are never
          visible to our staff. Access to the platform is controlled through
          JWT-based authentication and role-based permissions, so users only
          see data relevant to their role.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>4. Data Sharing</h2>
        <p className={textClass}>
          Information within your institution's account (proposals, budgets,
          reviews) is visible to relevant roles within that institution, such
          as grant managers and finance officers, as required for the
          platform's workflows. We do not share your data with external
          organizations except where required by law.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>5. Your Rights</h2>
        <p className={textClass}>
          You may request access to, correction of, or deletion of your
          personal information by contacting your institution's
          administrator or reaching out via our Contact page.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>6. Changes to This Policy</h2>
        <p className={textClass}>
          We may update this policy from time to time. Material changes will
          be communicated through an in-app notification or email.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>7. Contact Us</h2>
        <p className={textClass}>
          Questions about this policy can be sent through our{' '}
          <a href="/contact" className="text-blue-600 hover:underline">
            Contact page
          </a>
          .
        </p>
      </div>
    </div>
  )
}