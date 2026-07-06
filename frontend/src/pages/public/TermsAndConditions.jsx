// src/pages/public/TermsAndConditions.jsx
export default function TermsAndConditions() {
  const sectionClass = 'mb-8'
  const headingClass = 'text-xl font-semibold text-slate-800 mb-2'
  const textClass = 'text-sm text-slate-500 leading-relaxed'

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <span className="inline-block text-xs font-semibold text-ocean-800 bg-ocean-50 px-3 py-1 rounded-full mb-4">
        Legal
      </span>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
        Terms &amp; Conditions
      </h1>
      <p className="text-sm text-slate-400 mb-10">Last updated: July 1, 2026</p>

      <div className={sectionClass}>
        <h2 className={headingClass}>1. Acceptance of Terms</h2>
        <p className={textClass}>
          By creating an account or using the Research Grant &amp; Funding
          Management System ("the Platform"), you agree to be bound by these
          Terms &amp; Conditions.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>2. Account Responsibilities</h2>
        <p className={textClass}>
          You are responsible for maintaining the confidentiality of your
          login credentials and for all activity that occurs under your
          account. Notify your administrator immediately of any unauthorized
          use.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>3. Acceptable Use</h2>
        <p className={textClass}>
          You agree to use the Platform only for legitimate grant
          management, proposal submission, budgeting, and reporting
          purposes, and not to submit false information, attempt to access
          data outside your assigned role, or interfere with the Platform's
          operation.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>4. Roles &amp; Permissions</h2>
        <p className={textClass}>
          Access to features is governed by the role assigned to your account
          (Researcher, Grant Manager, Reviewer, Finance Officer, or
          Administrator). Attempting to circumvent these permissions is a
          violation of these Terms.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>5. Content Ownership</h2>
        <p className={textClass}>
          Proposals, budgets, reports, and other content you submit remain
          the property of you and your institution. By submitting content,
          you grant the Platform a license to store, process, and display it
          as necessary to provide the service.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>6. Termination</h2>
        <p className={textClass}>
          We may suspend or terminate accounts that violate these Terms or
          are inactive for extended periods, subject to your institution's
          agreement with us.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>7. Limitation of Liability</h2>
        <p className={textClass}>
          The Platform is provided "as is." We are not liable for indirect
          or consequential damages arising from its use, including missed
          deadlines or funding decisions made using data on the Platform.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>8. Changes to These Terms</h2>
        <p className={textClass}>
          We may revise these Terms periodically. Continued use of the
          Platform after changes take effect constitutes acceptance of the
          updated Terms.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={headingClass}>9. Contact</h2>
        <p className={textClass}>
          For questions about these Terms, reach out via our{' '}
          <a href="/contact" className="text-ocean-700 hover:underline">
            Contact page
          </a>
          .
        </p>
      </div>
    </div>
  )
}