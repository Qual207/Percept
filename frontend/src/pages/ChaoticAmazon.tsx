/**
 * Intentionally chaotic Amazon-clone product page.
 *
 * This component is the demo's "before" state. The chaos is the point:
 * clashing colors, dense grids, multiple navs, blinking badges, link soup.
 * The 3-layer engine targets elements via data-an-role attributes:
 *
 *   - data-an-role="promo"        top promo banner
 *   - data-an-role="nav"          navigation bar(s)
 *   - data-an-role="aside-left"   left category sidebar
 *   - data-an-role="aside-right"  right "also bought" carousel
 *   - data-an-role="main"         the product detail (centerpiece)
 *   - data-an-role="footer"       link soup footer
 */

const RECOMMENDATIONS = [
  { name: "USB-C Cable 6ft (3-pack)", price: "$9.99", rating: "4.5", reviews: "12,402" },
  { name: "Wireless Earbuds Pro Max", price: "$24.99", rating: "4.2", reviews: "3,221" },
  { name: "Smart Plug WiFi 4-pack", price: "$19.95", rating: "4.6", reviews: "8,712" },
  { name: "HDMI 4K Cable 10ft", price: "$11.49", rating: "4.4", reviews: "6,019" },
  { name: "Phone Stand Adjustable", price: "$7.99", rating: "4.3", reviews: "2,114" },
  { name: "Bluetooth Speaker Mini", price: "$15.99", rating: "4.1", reviews: "1,543" },
];

const CATEGORIES = [
  "Today's Deals", "Customer Service", "Registry", "Gift Cards", "Sell",
  "Electronics", "Computers", "Smart Home", "Home & Kitchen", "Books",
  "Pet Supplies", "Pharmacy", "Beauty & Personal Care", "Toys & Games",
  "Sports & Outdoors", "Fashion", "Health & Household", "Grocery",
];

export function ChaoticAmazon() {
  return (
    <div className="min-h-screen bg-[#eaeded] text-slate-900">
      {/* Top blinking promo bar */}
      <div
        data-an-role="promo"
        className="bg-gradient-to-r from-rose-500 via-amber-400 to-orange-500 px-4 py-2 text-center text-sm font-bold text-white"
      >
        <span className="animate-pulse">⚡ LIGHTNING DEAL ENDS IN 02:47:13</span>
        {" — "}
        <span className="underline">EXTRA 30% OFF</span>
        {" — "}
        <span className="animate-pulse">FREE SAME-DAY SHIPPING</span>
      </div>

      {/* Top nav (chunky and busy) */}
      <header data-an-role="nav" className="bg-[#131921] text-white">
        <div className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
          <div className="rounded border border-white/30 px-2 py-1 font-bold">amazom.fake</div>
          <div className="rounded border border-white/30 px-2 py-1 text-xs">
            Deliver to <span className="font-bold">Cupertino 95014</span>
          </div>
          <div className="flex min-w-[260px] flex-1 items-stretch overflow-hidden rounded">
            <select className="bg-slate-200 px-2 text-xs text-slate-900">
              <option>All</option>
              <option>Electronics</option>
              <option>Books</option>
            </select>
            <input
              className="flex-1 px-2 text-slate-900"
              defaultValue="usb c cable braided 6ft"
            />
            <button className="bg-amber-400 px-3 font-bold text-slate-900">Search</button>
          </div>
          <div className="text-xs">EN ▾</div>
          <div className="text-xs">
            Hello, Jason
            <div className="font-bold">Account & Lists ▾</div>
          </div>
          <div className="text-xs">
            Returns
            <div className="font-bold">& Orders</div>
          </div>
          <div className="text-xs font-bold">🛒 Cart (4)</div>
        </div>
        <nav className="flex flex-wrap gap-3 bg-[#232f3e] px-3 py-1.5 text-xs">
          {["All", "Today's Deals", "Customer Service", "Registry", "Gift Cards", "Sell", "Best Sellers", "Prime", "New Releases", "Books", "Music", "Beauty", "Toys", "Garden", "Sports"].map((x) => (
            <a key={x} href="#" className="hover:underline">{x}</a>
          ))}
        </nav>
      </header>

      {/* Body grid */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-3 p-3">
        {/* Left sidebar of categories */}
        <aside
          data-an-role="aside-left"
          className="col-span-12 rounded bg-white p-3 text-xs shadow md:col-span-2"
        >
          <h3 className="mb-2 text-sm font-bold">Department</h3>
          <ul className="space-y-1">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <a href="#" className="text-cyan-700 hover:text-rose-600 hover:underline">
                  {c}
                </a>
              </li>
            ))}
          </ul>
          <h3 className="mb-2 mt-4 text-sm font-bold">Brand</h3>
          <ul className="space-y-1">
            {["Anker", "UGREEN", "Belkin", "Apple", "Samsung", "Generic", "AmazomBasics"].map((b) => (
              <li key={b}>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" /> <span>{b}</span>
                </label>
              </li>
            ))}
          </ul>
          <h3 className="mb-2 mt-4 text-sm font-bold">Avg. Customer Review</h3>
          <ul className="space-y-1">
            {[5, 4, 3, 2].map((s) => (
              <li key={s} className="text-amber-500">
                {"★".repeat(s)}{"☆".repeat(5 - s)} & up
              </li>
            ))}
          </ul>
          <h3 className="mb-2 mt-4 text-sm font-bold">Price</h3>
          <ul className="space-y-1 text-cyan-700">
            <li><a href="#" className="hover:underline">Under $10</a></li>
            <li><a href="#" className="hover:underline">$10 to $25</a></li>
            <li><a href="#" className="hover:underline">$25 to $50</a></li>
            <li><a href="#" className="hover:underline">$50 to $100</a></li>
            <li><a href="#" className="hover:underline">$100 & Above</a></li>
          </ul>
        </aside>

        {/* Main product detail */}
        <main
          data-an-role="main"
          className="col-span-12 rounded bg-white p-5 shadow md:col-span-7"
        >
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-5">
              <div data-an-id="product-image" className="grid aspect-square place-items-center rounded bg-slate-100 text-6xl">
                🔌
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded bg-slate-100 text-center text-xl">
                    {["🔌", "📦", "🧵", "🎨", "📐"][i]}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 space-y-2 md:col-span-7">
              <div className="text-xs text-cyan-700">‹ Visit the Anker Store</div>
              <h1 data-an-id="product-title" className="text-xl font-bold leading-snug">
                Anker 6ft Premium Nylon-Braided USB-C to USB-C Cable, 100W Fast Charging,
                MFi Certified, Compatible with iPhone 15 / iPad Pro / MacBook Pro / Galaxy
                S24, Black (3-Pack)
              </h1>
              <div data-an-id="ratings" className="flex items-center gap-2 text-sm">
                <span className="text-amber-500">★★★★☆</span>
                <a href="#" className="text-cyan-700 hover:underline">12,402 ratings</a>
                <span className="text-slate-400">|</span>
                <a href="#" className="text-cyan-700 hover:underline">2,118 answered questions</a>
              </div>
              <div className="rounded bg-rose-50 p-1.5 text-xs font-bold text-rose-700">
                #1 Best Seller in USB-C Cables
              </div>

              <div data-an-id="product-price" className="border-y border-slate-200 py-2">
                <div className="text-xs text-slate-500 line-through">List Price: $19.99</div>
                <div className="text-2xl">
                  <span className="align-top text-sm">$</span>
                  <span className="text-rose-700 font-extrabold">9</span>
                  <span className="align-top text-sm text-rose-700">99</span>
                  <span className="ml-2 rounded bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white">
                    -50%
                  </span>
                </div>
                <div className="text-xs">
                  <span className="font-bold text-emerald-700">FREE</span> delivery
                  <b> Tomorrow, May 10</b>. Order within{" "}
                  <span className="text-emerald-700 font-bold">3 hrs 12 mins</span>.
                </div>
              </div>

              <ul className="list-inside list-disc space-y-1 text-sm">
                <li><b>About this item:</b> 100W power delivery</li>
                <li>Nylon-braided for extra durability — bend-tested 25,000 times</li>
                <li>Compatible with USB-C devices including the latest iPhones</li>
                <li>Lifetime warranty + 24/7 customer support</li>
                <li>Pack of 3 — perfect for desk, car, and travel</li>
                <li>MFi certified, hand-tested in our facility</li>
              </ul>

              <div className="flex flex-wrap gap-2 pt-2">
                <button data-an-id="buy-button" className="rounded-full bg-amber-400 px-5 py-1.5 text-sm font-bold text-slate-900 hover:bg-amber-500">
                  Add to Cart
                </button>
                <button className="rounded-full bg-orange-500 px-5 py-1.5 text-sm font-bold text-white hover:bg-orange-600">
                  Buy Now
                </button>
                <button className="rounded-full border border-slate-300 px-3 py-1.5 text-sm">
                  Add to List
                </button>
                <button className="rounded-full border border-slate-300 px-3 py-1.5 text-sm">
                  Compare
                </button>
              </div>

              <div className="rounded bg-amber-50 p-2 text-xs">
                <b>Frequently bought together:</b> USB-C Wall Charger 65W, Phone Stand,
                Cable Organizer Sleeve, Screen Protector. Buy together and save $4.32.
              </div>
            </div>
          </div>

          {/* "About this item" wall of text */}
          <section data-an-id="product-description" className="mt-5 border-t border-slate-200 pt-4">
            <h2 className="mb-2 text-base font-bold">Product description</h2>
            <p className="text-sm leading-relaxed">
              Step up your charging game with the Anker Premium 100W USB-C cable. Whether
              you're powering a MacBook Pro, charging an iPhone 15, or topping up your
              Galaxy S24, this nylon-braided beast delivers full-speed power and
              data-transfer in a sleek 6-foot length. We bend-tested it 25,000 times, so
              you don't have to. The reinforced aluminum connectors resist corrosion and
              the lifetime warranty means we stand behind every cable. Perfect for the
              desk, the car, the bag, or the kitchen counter — wherever a cable goes to
              die in your house, ours will outlive it.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Compatible with: iPhone 15 / 15 Pro / 15 Pro Max, iPad Pro M4, MacBook Air
              M3, MacBook Pro 14"/16", Galaxy S24 Ultra, Pixel 8 Pro, Steam Deck, Nintendo
              Switch (charging only), and any USB-C device that supports USB Power
              Delivery 3.0.
            </p>
          </section>

          {/* Reviews preview */}
          <section data-an-id="product-reviews" className="mt-5 border-t border-slate-200 pt-4">
            <h2 className="mb-2 text-base font-bold">Top reviews</h2>
            {[
              { name: "Sarah K.", stars: 5, text: "Best cable I've ever owned. Charges my MacBook in 90 minutes flat. The braided sleeve doesn't tangle." },
              { name: "Marcus T.", stars: 4, text: "Solid build. Tip: the 6ft length is perfect for couch-to-outlet. Took one star off because the packaging was excessive." },
              { name: "Priya R.", stars: 5, text: "I bought the 3-pack and now my whole family uses them. Lifetime warranty is real — they replaced one no questions asked." },
            ].map((r, i) => (
              <div key={i} className="mb-2 border-b border-slate-100 pb-2">
                <div className="text-xs font-bold">{r.name} <span className="text-amber-500">{"★".repeat(r.stars)}</span></div>
                <div className="text-sm">{r.text}</div>
              </div>
            ))}
          </section>
        </main>

        {/* Right "also bought" carousel */}
        <aside
          data-an-role="aside-right"
          className="col-span-12 rounded bg-white p-3 shadow md:col-span-3"
        >
          <h3 className="mb-2 text-sm font-bold">Customers also bought</h3>
          <div className="space-y-3">
            {RECOMMENDATIONS.map((r) => (
              <div key={r.name} className="flex gap-2 border-b border-slate-100 pb-2">
                <div className="grid h-14 w-14 flex-none place-items-center rounded bg-slate-100 text-xl">📦</div>
                <div className="min-w-0">
                  <a href="#" className="line-clamp-2 text-xs text-cyan-700 hover:underline">
                    {r.name}
                  </a>
                  <div className="text-xs">
                    <span className="text-amber-500">★ {r.rating}</span>{" "}
                    <span className="text-slate-500">({r.reviews})</span>
                  </div>
                  <div className="text-sm font-bold">{r.price}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded bg-rose-100 p-2 text-center text-xs font-bold text-rose-800">
            🔥 Hot Holiday Picks 🔥
          </div>
          <div className="mt-3 rounded bg-emerald-100 p-2 text-center text-xs font-bold text-emerald-800">
            Subscribe & Save up to 15%
          </div>
          <div className="mt-3 rounded bg-amber-100 p-2 text-center text-xs font-bold text-amber-800">
            Join Prime — Free Trial
          </div>
        </aside>
      </div>

      {/* Link-soup footer */}
      <footer
        data-an-role="footer"
        className="mt-4 bg-[#232f3e] text-xs text-white"
      >
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-4 p-5 md:grid-cols-4">
          {[
            { h: "Get to Know Us", l: ["Careers", "About", "Press Releases", "Investor Relations", "Devices", "Science"] },
            { h: "Make Money with Us", l: ["Sell", "Sell apps", "Become an Affiliate", "Advertise", "Self-Publish", "Host an Amazom Hub"] },
            { h: "Payment Products", l: ["Business Card", "Shop with Points", "Reload Balance", "Currency Converter"] },
            { h: "Let Us Help You", l: ["Your Account", "Your Orders", "Shipping Rates", "Returns", "Help"] },
          ].map((c) => (
            <div key={c.h}>
              <h4 className="mb-1.5 font-bold">{c.h}</h4>
              <ul className="space-y-1 text-slate-300">
                {c.l.map((x) => <li key={x}><a href="#" className="hover:underline">{x}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="bg-[#131a22] p-3 text-center text-[11px] text-slate-400">
          © 1996–2026 Adaptive Web Demo, an Amazom-clone parody · Built for a hackathon · Not affiliated with anyone
        </div>
      </footer>
    </div>
  );
}
