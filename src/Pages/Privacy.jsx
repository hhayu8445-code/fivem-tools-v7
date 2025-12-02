import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-zinc-400">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 className="text-xl font-semibold text-zinc-200 mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, update your profile, or post content. This may include your name, email address, and profile picture.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-200 mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect to operate, maintain, and improve the Service, to communicate with you, and to protect our users and the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-200 mb-3">3. Data Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
        </section>
      </div>
    </div>
  );
}
