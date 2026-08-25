import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the RPM Recruit team.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="font-condensed text-label font-bold tracking-[0.22em] uppercase text-gold mb-2">
            Contact
          </div>
          <h1 className="font-display text-4xl font-bold text-bone">
            Get in Touch
          </h1>
          <p className="text-slate-2 mt-3 max-w-xl">
            Questions about RPM Recruit, showcases, or player evaluations?
            Reach out directly.
          </p>
        </div>
        <div className="h-px bg-gold/20" />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact info */}
          <div className="space-y-10">
            <div>
              <h2 className="font-condensed text-label font-bold tracking-[0.2em] uppercase text-slate mb-3">
                Scanzano Baseball
              </h2>
              <address className="text-ink-5 not-italic leading-relaxed">
                John Scanzano
                <br />
                5 Carnegie Way
                <br />
                Cherry Hill, NJ
              </address>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-white border border-black/[0.06] p-8 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-ink mb-6">
              Send a Message
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-condensed text-label font-bold tracking-[0.15em] uppercase text-ink-4 block mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-bone-3 px-3 py-2.5 text-sm text-ink bg-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-colors"
                    placeholder="First"
                  />
                </div>
                <div>
                  <label className="font-condensed text-label font-bold tracking-[0.15em] uppercase text-ink-4 block mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-bone-3 px-3 py-2.5 text-sm text-ink bg-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-colors"
                    placeholder="Last"
                  />
                </div>
              </div>
              <div>
                <label className="font-condensed text-label font-bold tracking-[0.15em] uppercase text-ink-4 block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-bone-3 px-3 py-2.5 text-sm text-ink bg-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-colors"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="font-condensed text-label font-bold tracking-[0.15em] uppercase text-ink-4 block mb-1.5">
                  Message
                </label>
                <textarea
                  rows={5}
                  className="w-full border border-bone-3 px-3 py-2.5 text-sm text-ink bg-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-colors resize-vertical"
                  placeholder="Your message..."
                />
              </div>
              <button
                type="submit"
                className="font-condensed text-xs font-bold tracking-[0.13em] uppercase bg-ink text-bone px-6 py-3 hover:bg-gold hover:text-ink transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
