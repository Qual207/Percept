/**
 * Intentionally cluttered news website — "The Daily Dispatch".
 *
 * Design sins: mixed font weights, 5 competing columns, auto-play video tickers,
 * blinking breaking-news badge, aggressive ads, weather widget competing with
 * headlines, 4 nav bars, related-story infinite sidebar, cookie banner that
 * never goes away, stock ticker crawl, and 6 different section color schemes.
 *
 * Engine targeting:
 *   data-an-role="promo"        breaking-news / ticker bar
 *   data-an-role="nav"          all navigation
 *   data-an-role="aside-left"   category / trending sidebar
 *   data-an-role="aside-right"  ads + related stories sidebar
 *   data-an-role="main"         the lead article body
 *   data-an-role="footer"       footer links
 *
 *   data-an-id="article-headline"   the main article H1
 *   data-an-id="article-byline"     author + date line
 *   data-an-id="article-image"      lead article photo
 *   data-an-id="article-body"       article paragraphs
 *   data-an-id="article-summary"    pull-quote / summary box
 *   data-an-id="comments-section"   comments below article
 *   data-an-id="ad-banner"          top display ad
 */

const TRENDING = [
  "Markets surge on Fed pivot signal",
  "Climate accord: 40 nations sign historic deal",
  "Tech layoffs hit 80,000 in Q1",
  "Solar storm to cause auroras across US tonight",
  "NBA Finals: Game 7 preview",
  "New weight-loss drug approved by FDA",
  "Ukraine peace talks stall again",
  "Taylor Swift announces new world tour dates",
  "Amazon rainforest hits record deforestation",
  "SpaceX Starship completes third test flight",
];

const RELATED = [
  {
    title: "Inside the collapse of Silicon Valley Bank",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=80&fit=crop",
    section: "Economy",
    time: "2h ago",
  },
  {
    title: "How AI is reshaping the white-collar job market",
    img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=120&h=80&fit=crop",
    section: "Technology",
    time: "4h ago",
  },
  {
    title: "The housing crisis isn't over — it's getting worse",
    img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=120&h=80&fit=crop",
    section: "Real Estate",
    time: "5h ago",
  },
  {
    title: "Why Europe's largest cities are banning cars",
    img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=120&h=80&fit=crop",
    section: "World",
    time: "6h ago",
  },
  {
    title: "The secret to living past 100, according to centenarians",
    img: "https://images.unsplash.com/photo-1499887142886-791eca5918cd?w=120&h=80&fit=crop",
    section: "Health",
    time: "7h ago",
  },
  {
    title: "New study finds social media worsens teen anxiety",
    img: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=80&fit=crop",
    section: "Science",
    time: "9h ago",
  },
];

const STOCKS = [
  { sym: "AAPL", val: "189.72", chg: "+1.4%" },
  { sym: "TSLA", val: "172.34", chg: "-2.1%" },
  { sym: "NVDA", val: "875.00", chg: "+3.8%" },
  { sym: "MSFT", val: "412.50", chg: "+0.9%" },
  { sym: "GOOGL", val: "165.20", chg: "-0.3%" },
  { sym: "META", val: "493.80", chg: "+2.2%" },
  { sym: "AMZN", val: "180.10", chg: "+1.1%" },
  { sym: "BTC", val: "67,840", chg: "+4.6%" },
];

const NAV_SECTIONS = [
  "Politics", "World", "Economy", "Technology", "Science", "Health",
  "Climate", "Culture", "Sports", "Opinion", "Video", "Podcasts",
];

export function ChaoticNews() {
  return (
    <div className="min-h-screen bg-gray-100 font-serif text-gray-900">

      {/* ── Cookie banner ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 border-t-2 border-yellow-400 bg-gray-900 px-5 py-3 text-xs text-white">
        <span>
          🍪 We use cookies, trackers, third-party analytics, and targeted advertising partners to
          enhance your experience. By continuing you consent to everything.{" "}
          <a href="#" className="underline text-yellow-300">Privacy Policy</a>
        </span>
        <button className="shrink-0 rounded bg-yellow-400 px-4 py-1.5 font-bold text-gray-900 hover:bg-yellow-300">
          Accept All
        </button>
      </div>

      {/* ── Stock ticker ── */}
      <div data-an-role="promo" className="overflow-hidden bg-gray-900 text-xs text-white">
        <div className="flex animate-[marquee_30s_linear_infinite] gap-8 whitespace-nowrap py-1 px-4">
          {[...STOCKS, ...STOCKS].map((s, i) => (
            <span key={i} className="inline-flex gap-1.5">
              <span className="font-bold text-white">{s.sym}</span>
              <span className="text-gray-300">{s.val}</span>
              <span className={s.chg.startsWith("+") ? "text-green-400" : "text-red-400"}>{s.chg}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Breaking news bar ── */}
      <div className="bg-red-600 px-4 py-1.5 text-xs text-white flex items-center gap-3">
        <span className="animate-pulse rounded bg-white px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-600">
          Breaking
        </span>
        <span className="font-semibold">
          DEVELOPING: Senate reaches last-minute budget deal, avoids government shutdown — live updates
        </span>
        <a href="#" className="ml-auto shrink-0 underline">Follow live →</a>
      </div>

      {/* ── Main nav ── */}
      <header data-an-role="nav" className="bg-white shadow-sm">
        {/* Masthead */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tight text-gray-900">
            THE <span className="text-red-600">DAILY</span> DISPATCH
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
            <span>Saturday, May 9, 2026</span>
            <span>|</span>
            <span className="font-semibold text-gray-700">72°F · Partly Cloudy · San Francisco</span>
            <span>|</span>
            <a href="#" className="text-blue-600 hover:underline">Subscribe</a>
            <a href="#" className="rounded bg-red-600 px-3 py-1 text-white font-semibold hover:bg-red-700">Sign In</a>
          </div>
        </div>
        {/* Primary nav */}
        <nav className="flex overflow-x-auto border-b border-gray-100 px-4 text-[13px] font-semibold">
          {NAV_SECTIONS.map((s) => (
            <a key={s} href="#" className="shrink-0 border-r border-gray-100 px-3 py-2.5 text-gray-700 hover:text-red-600 hover:bg-gray-50">
              {s}
            </a>
          ))}
        </nav>
        {/* Secondary toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-1.5 text-xs text-gray-500">
          <div className="flex gap-3">
            <a href="#" className="hover:underline">Today's Paper</a>
            <a href="#" className="hover:underline">Newsletters</a>
            <a href="#" className="hover:underline">Puzzles</a>
            <a href="#" className="hover:underline">Recipes</a>
            <a href="#" className="hover:underline">Wirecutter</a>
            <a href="#" className="hover:underline">The Athletic</a>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="rounded border border-gray-300 px-2 py-0.5 text-xs focus:outline-none"
            />
            <button className="rounded bg-gray-800 px-2 py-0.5 text-white text-xs">Search</button>
          </div>
        </div>
      </header>

      {/* ── Top display ad ── */}
      <div data-an-id="ad-banner" className="mx-auto max-w-[1400px] px-4 py-2">
        <div className="flex h-[90px] items-center justify-center rounded border-2 border-dashed border-orange-300 bg-gradient-to-r from-orange-100 to-yellow-100 text-center text-xs text-orange-600">
          <div>
            <div className="text-lg font-black animate-pulse">🎯 TARGETED AD — YOU MIGHT LOVE THIS!</div>
            <div>Based on your browsing history • Powered by 14 ad networks • <a href="#" className="underline">Why am I seeing this?</a></div>
          </div>
        </div>
      </div>

      {/* ── Body grid ── */}
      <div className="mx-auto max-w-[1400px] grid grid-cols-12 gap-4 px-4 py-3 pb-24">

        {/* Left sidebar — trending / categories */}
        <aside data-an-role="aside-left" className="col-span-12 md:col-span-2 space-y-4">
          <div className="rounded bg-white p-3 shadow-sm text-xs">
            <h3 className="mb-2 border-b border-red-600 pb-1 text-sm font-black uppercase text-red-600">
              Trending Now
            </h3>
            <ol className="space-y-2">
              {TRENDING.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 font-black text-gray-300 text-lg leading-none">{i + 1}</span>
                  <a href="#" className="text-gray-700 hover:text-red-600 hover:underline leading-tight">{t}</a>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded bg-blue-600 p-3 text-white shadow-sm text-xs">
            <div className="font-black text-sm mb-1">🌤 Weather</div>
            <div className="text-3xl font-black">72°</div>
            <div className="text-blue-200">San Francisco, CA</div>
            <div className="mt-2 flex justify-between text-[10px] text-blue-200">
              <span>H: 76° L: 61°</span><span>Partly Cloudy</span>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1 text-center text-[9px]">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
                <div key={d}>
                  <div className="text-blue-200">{d}</div>
                  <div>{["☀️","⛅","🌧️","⛅","☀️"][i]}</div>
                  <div>{["74","68","63","70","75"][i]}°</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded bg-white p-3 shadow-sm text-xs">
            <h3 className="mb-2 border-b border-gray-200 pb-1 text-sm font-black uppercase text-gray-700">Sections</h3>
            <ul className="space-y-1">
              {NAV_SECTIONS.map((s) => (
                <li key={s}><a href="#" className="text-blue-700 hover:underline">{s}</a></li>
              ))}
            </ul>
          </div>

          <div className="rounded border-2 border-dashed border-orange-300 bg-orange-50 p-3 text-center text-xs text-orange-700">
            <div className="font-black text-sm animate-pulse">📣 AD</div>
            <div className="mt-1">Refinance your mortgage now!<br />Rates as low as 6.1%</div>
            <button className="mt-2 rounded bg-orange-500 px-3 py-1 text-white font-bold text-xs">
              Get Quote →
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main data-an-role="main" className="col-span-12 md:col-span-7 space-y-5">

          {/* Lead article */}
          <article className="rounded bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
              <span className="rounded bg-red-600 px-2 py-0.5 text-white">Breaking</span>
              <span className="text-gray-400">Politics · 14 minutes ago</span>
            </div>

            <h1 data-an-id="article-headline" className="text-2xl font-black leading-tight text-gray-900 md:text-3xl">
              Senate Reaches Last-Minute Budget Deal to Avert Government Shutdown, Sources Say
            </h1>

            <div data-an-id="article-byline" className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>By <a href="#" className="font-semibold text-gray-700 hover:underline">Margaret Chen</a> and <a href="#" className="font-semibold text-gray-700 hover:underline">Robert Alvarado</a></span>
              <span>|</span>
              <span>Updated 6:04 PM ET, Sat May 9, 2026</span>
              <span>|</span>
              <span className="text-blue-600">9 min read</span>
              <div className="ml-auto flex gap-2">
                <button className="rounded border px-2 py-0.5 hover:bg-gray-50">Share</button>
                <button className="rounded border px-2 py-0.5 hover:bg-gray-50">Save</button>
                <button className="rounded border px-2 py-0.5 hover:bg-gray-50">Comments (482)</button>
              </div>
            </div>

            <figure data-an-id="article-image" className="my-4">
              <img
                src="https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&h=420&fit=crop"
                alt="United States Capitol building"
                className="w-full rounded object-cover"
              />
              <figcaption className="mt-1 text-[11px] text-gray-400 italic">
                The U.S. Capitol in Washington, D.C. Senate leaders announced a deal late Friday. <span className="font-semibold">Getty Images</span>
              </figcaption>
            </figure>

            <div data-an-id="article-summary" className="my-4 rounded-r border-l-4 border-red-500 bg-red-50 px-4 py-3">
              <div className="text-xs font-black uppercase tracking-wide text-red-600 mb-1">Key Points</div>
              <ul className="text-sm space-y-1 text-gray-700 list-disc list-inside">
                <li>Senate leaders reached a bipartisan agreement Friday night, hours before the midnight deadline</li>
                <li>The deal includes $1.7 trillion in discretionary spending and avoids the most contentious cuts</li>
                <li>The House is expected to vote on the measure Saturday morning</li>
                <li>Markets opened higher in Asia after news of the agreement</li>
              </ul>
            </div>

            <div data-an-id="article-body" className="space-y-4 text-[15px] leading-relaxed text-gray-800">
              <p>
                <span className="float-left mr-3 text-6xl font-black leading-none text-red-600">W</span>
                ASHINGTON — Senate negotiators reached a sweeping bipartisan budget agreement Friday night,
                securing enough votes to pass the $1.7 trillion funding bill and avert a government shutdown
                that had threatened to furlough hundreds of thousands of federal workers just hours before the
                midnight deadline.
              </p>
              <p>
                The agreement came together after a marathon 16-hour negotiating session at the Capitol,
                where senior appropriators from both parties hammered out compromises on border security funding,
                defense appropriations, and domestic spending cuts that had been the central sticking points
                in months of fractious negotiations.
              </p>

              {/* Mid-article ad */}
              <div className="my-2 rounded border-2 border-dashed border-purple-300 bg-purple-50 py-3 text-center text-xs text-purple-600">
                <span className="font-black animate-pulse">📺 ADVERTISEMENT</span>
                <div className="mt-1 font-semibold">Learn Spanish in 3 months — Babbel</div>
                <button className="mt-1 rounded bg-purple-600 px-3 py-1 text-white font-bold">Try Free →</button>
              </div>

              <p>
                "We did it," Senate Majority Leader Linda Fioretti told reporters after emerging from the
                negotiating room just before 11:30 p.m. "It wasn't easy, and nobody got everything they
                wanted — but that's what compromise looks like."
              </p>
              <p>
                Senate Minority Leader James Caldwell, who attended the final hours of negotiations alongside
                Fioretti, confirmed that his conference would provide enough votes to advance the bill.
                "We have a deal," he said simply, declining further comment before the text was released.
              </p>
              <p>
                The bill maintains current levels of funding for most domestic programs while providing a
                modest 3 percent increase in defense appropriations — lower than the Pentagon had requested
                but higher than progressive Democrats had sought. On border security, the compromise funds
                additional immigration judges and asylum officers while stopping short of the physical
                barrier expansions that hardline conservatives had demanded.
              </p>
              <p>
                Markets responded positively to word of the agreement. Futures for the S&P 500 rose more
                than 0.8 percent in overnight trading in Asia, and Treasury yields fell slightly, signaling
                reduced uncertainty about near-term fiscal policy.
              </p>
              <p>
                The House is expected to take up the measure Saturday morning. Speaker Maria Donaldson said
                she had secured enough commitments from both the moderate and progressive wings of her
                caucus to pass the bill, though several members said they had not yet seen the final text.
              </p>
              <p>
                For now, the immediate crisis appears to be averted — though analysts note that the underlying
                disagreements over long-term fiscal policy, debt ceiling negotiations, and entitlement spending
                remain unresolved, likely setting up another confrontation before the end of the fiscal year.
              </p>
            </div>

            {/* Social share row */}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4 text-xs">
              <button className="rounded bg-blue-600 px-3 py-1.5 text-white font-semibold">Share on Facebook</button>
              <button className="rounded bg-sky-500 px-3 py-1.5 text-white font-semibold">Post on X</button>
              <button className="rounded bg-green-600 px-3 py-1.5 text-white font-semibold">WhatsApp</button>
              <button className="rounded bg-red-500 px-3 py-1.5 text-white font-semibold">Email</button>
              <button className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 font-semibold ml-auto">Copy Link</button>
            </div>
          </article>

          {/* Comments */}
          <section data-an-id="comments-section" className="rounded bg-white p-5 shadow-sm">
            <h2 className="mb-3 border-b border-gray-200 pb-2 text-base font-black">
              Comments <span className="text-gray-400 font-normal text-sm">(482)</span>
            </h2>
            <div className="mb-3">
              <textarea
                placeholder="Join the discussion..."
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                rows={2}
              />
              <button className="mt-1 rounded bg-blue-600 px-4 py-1.5 text-sm text-white font-semibold">
                Post Comment
              </button>
            </div>
            {[
              { user: "PoliticsWatcher_DC", time: "12 min ago", text: "Finally. I've been refreshing this page for the past 3 hours. This shutdown scare was completely unnecessary.", likes: 847 },
              { user: "FiscalHawk2026", time: "23 min ago", text: "Can someone explain how they call this a 'deal' when we're still adding $1.7T to an already out-of-control budget? Kicking the can down the road as usual.", likes: 531 },
              { user: "MarketsMaven", time: "34 min ago", text: "Futures are up. That's all I needed to know.", likes: 312 },
              { user: "ChiefWorrywart", time: "41 min ago", text: "Wait until they actually vote. I'll believe it when I see it.", likes: 289 },
            ].map((c, i) => (
              <div key={i} className="mb-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-xs mb-1">
                  <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-[10px]">
                    {c.user[0]}
                  </div>
                  <span className="font-semibold text-gray-800">{c.user}</span>
                  <span className="text-gray-400">{c.time}</span>
                  <span className="ml-auto text-gray-400">👍 {c.likes}</span>
                </div>
                <p className="text-sm text-gray-700">{c.text}</p>
              </div>
            ))}
            <button className="text-xs text-blue-600 hover:underline">Show 478 more comments →</button>
          </section>
        </main>

        {/* Right sidebar — ads + related */}
        <aside data-an-role="aside-right" className="col-span-12 md:col-span-3 space-y-4">

          {/* Newsletter CTA */}
          <div className="rounded bg-gray-900 p-4 text-white shadow-sm">
            <div className="text-xs font-black uppercase tracking-wide text-yellow-400 mb-1">Daily Briefing</div>
            <div className="text-sm font-bold mb-2">Get the top stories in your inbox every morning.</div>
            <input
              type="email"
              placeholder="Enter your email"
              className="mb-2 w-full rounded border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder:text-gray-400 focus:outline-none"
            />
            <button className="w-full rounded bg-red-600 py-1.5 text-sm font-bold text-white hover:bg-red-700">
              Subscribe Free →
            </button>
            <div className="mt-1 text-[10px] text-gray-500">No spam. Unsubscribe anytime.</div>
          </div>

          {/* Ad 1 */}
          <div className="rounded border-2 border-dashed border-orange-300 bg-orange-50 p-3 text-center text-xs text-orange-700 shadow-sm">
            <div className="font-black animate-pulse">📣 SPONSORED</div>
            <img
              src="https://images.unsplash.com/photo-1602524816-122b219fae42?w=200&h=120&fit=crop"
              alt="Financial planning ad"
              className="mx-auto my-2 w-full rounded"
            />
            <div className="font-semibold">Retire 10 years early with this one simple portfolio trick</div>
            <button className="mt-2 rounded bg-orange-500 px-3 py-1 text-white font-bold">Learn More</button>
          </div>

          {/* Most Read */}
          <div className="rounded bg-white p-3 shadow-sm text-xs">
            <h3 className="mb-2 border-b border-red-600 pb-1 text-sm font-black uppercase text-red-600">Most Read</h3>
            <ol className="space-y-2.5">
              {RELATED.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <img src={r.img} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />
                  <div>
                    <div className="text-[10px] font-bold uppercase text-red-500">{r.section}</div>
                    <a href="#" className="text-xs text-gray-800 hover:text-red-600 hover:underline leading-snug">
                      {r.title}
                    </a>
                    <div className="text-[10px] text-gray-400 mt-0.5">{r.time}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Ad 2 */}
          <div className="rounded border-2 border-dashed border-green-300 bg-green-50 p-3 text-center text-xs text-green-800 shadow-sm">
            <div className="font-black animate-pulse">📣 ADVERTISEMENT</div>
            <div className="mt-1 text-sm font-black text-green-700">Save 40% on all vitamins</div>
            <div className="mt-1">Limited time offer. Shop now at VitaWell.</div>
            <button className="mt-2 rounded bg-green-600 px-3 py-1 text-white font-bold">Shop Now →</button>
          </div>

          {/* Opinion promo box */}
          <div className="rounded bg-slate-800 p-3 text-white shadow-sm text-xs">
            <div className="font-black text-sm uppercase text-yellow-400 mb-2">Opinion</div>
            {[
              { hed: "The budget deal is a band-aid on a broken system", author: "David Frum" },
              { hed: "Why the Democrats caved — and why that might be okay", author: "Paul Krugman" },
              { hed: "America's democracy is more resilient than you think", author: "Anne Applebaum" },
            ].map((o, i) => (
              <div key={i} className="mb-2 border-b border-slate-600 pb-2 last:border-0 last:mb-0 last:pb-0">
                <a href="#" className="text-sm font-semibold text-white hover:text-yellow-300 leading-snug">{o.hed}</a>
                <div className="text-[10px] text-slate-400 italic mt-0.5">By {o.author}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ── Footer ── */}
      <footer data-an-role="footer" className="border-t border-gray-300 bg-gray-900 text-xs text-gray-400 pb-20">
        <div className="mx-auto max-w-[1400px] grid grid-cols-2 gap-6 px-4 py-8 md:grid-cols-5">
          {[
            { h: "News", l: ["Politics", "World", "U.S.", "Business", "Technology", "Science", "Health", "Sports"] },
            { h: "Opinion", l: ["Editorials", "Op-Ed", "Letters", "Sunday Review", "Taking Note", "Room For Debate"] },
            { h: "Arts", l: ["Books", "Dance", "Movies", "Music", "Television", "Theater", "Fine Art", "Design"] },
            { h: "Living", l: ["Automotive", "Crossword", "Food", "Education", "Fashion & Style", "Health", "Jobs"] },
            { h: "More", l: ["Reader Center", "Wirecutter", "The Athletic", "Cooking", "Podcasts", "Video", "NYT Store", "Times Journeys"] },
          ].map((col) => (
            <div key={col.h}>
              <h4 className="mb-2 font-bold text-white text-sm">{col.h}</h4>
              <ul className="space-y-1">
                {col.l.map((link) => (
                  <li key={link}><a href="#" className="hover:text-white hover:underline">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-700 px-4 py-4 flex flex-wrap justify-between gap-2">
          <div>© 2026 The Daily Dispatch — A fictional demo publication</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Accessibility</a>
            <a href="#" className="hover:text-white">Do Not Sell My Info</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
