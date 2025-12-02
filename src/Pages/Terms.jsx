import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-zinc-400">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 className="text-xl font-semibold text-zinc-200 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using FiveM Tools ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-200 mb-3">2. User Content</h2>
          <p>Users are solely responsible for the content they post, upload, or share on the Service. You retain ownership of your content but grant us a license to display and distribute it on the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-200 mb-3">3. Prohibited Conduct</h2>
          <p>You agree not to engage in any activity that interferes with or disrupts the Service, including but not limited to distributing malware, spamming, or harassment.</p>
        </section>
      </div>
    </div>
  );
}
