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

/**
 * Verified USB-cable photos from Unsplash. The photo IDs are confirmed
 * via their published alt text so the imagery actually matches the
 * product (a 6ft braided USB-C cable in black).
 */
const PRODUCT_IMAGES = [
  {
    label: "Coiled braided cable",
    alt: "Black coiled USB-C braided cable on a soft background",
    // alt text on Unsplash: "A black coiled cable"
    url: "https://images.unsplash.com/photo-1763741217923-dbd5877c1bb7?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Pair of cables",
    alt: "Black and white USB data cables side by side",
    // alt text: "black and white USB data cables"
    url: "https://images.unsplash.com/photo-1573868388390-2739872961e6?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Connector close-up",
    alt: "Close up of a USB-C connector",
    // alt text: "a close up of a usb cable on a table"
    url: "https://images.unsplash.com/photo-1649959223405-f927e0fc1e05?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Cable detail",
    alt: "Close-up of a braided USB cable",
    // alt text: "a close up of a white usb cable"
    url: "https://images.unsplash.com/photo-1639675960002-2f414c58ed79?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Cable on desk",
    alt: "USB cable laid out on a clean white desk",
    // alt text: "white usb cable on white table"
    url: "https://images.unsplash.com/photo-1603539444875-76e7684265f6?auto=format&fit=crop&w=400&q=80",
  },
];

/**
 * Sidebar recommendations use deterministic inline SVG icons (rendered
 * by <CategoryIcon kind={...} />) so the artwork is guaranteed to match
 * the product category — no risk of an unrelated stock photo slipping in.
 */
const RECOMMENDATIONS: Array<{
  name: string;
  price: string;
  rating: string;
  reviews: string;
  kind: CategoryKind;
}> = [
  { name: "USB-C Cable 6ft (3-pack), braided fast-charge cord", price: "$9.99", rating: "4.5", reviews: "12,402", kind: "cable" },
  { name: "Wireless Earbuds Pro Max with charging case", price: "$24.99", rating: "4.2", reviews: "3,221", kind: "earbuds" },
  { name: "Smart Plug WiFi 4-pack, works with Alexa", price: "$19.95", rating: "4.6", reviews: "8,712", kind: "plug" },
  { name: "HDMI 4K Cable 10ft, ultra high speed", price: "$11.49", rating: "4.4", reviews: "6,019", kind: "hdmi" },
  { name: "Phone Stand Adjustable aluminum dock", price: "$7.99", rating: "4.3", reviews: "2,114", kind: "stand" },
  { name: "Bluetooth Speaker Mini waterproof portable", price: "$15.99", rating: "4.1", reviews: "1,543", kind: "speaker" },
];

type CategoryKind = "cable" | "earbuds" | "plug" | "hdmi" | "stand" | "speaker";

/** Inline SVG icon for a product category — always matches, never loads. */
function CategoryIcon({ kind, className = "h-16 w-16" }: { kind: CategoryKind; className?: string }) {
  const palette: Record<CategoryKind, { bg: string; fg: string; ring: string }> = {
    cable:   { bg: "#0f172a", fg: "#e2e8f0", ring: "#475569" },
    earbuds: { bg: "#1e293b", fg: "#f8fafc", ring: "#64748b" },
    plug:    { bg: "#fff7ed", fg: "#9a3412", ring: "#fdba74" },
    hdmi:    { bg: "#1e1b4b", fg: "#c7d2fe", ring: "#6366f1" },
    stand:   { bg: "#f1f5f9", fg: "#334155", ring: "#94a3b8" },
    speaker: { bg: "#fef2f2", fg: "#991b1b", ring: "#fca5a5" },
  };
  const { bg, fg, ring } = palette[kind];

  return (
    <div
      className={`flex flex-none items-center justify-center rounded border ${className}`}
      style={{ backgroundColor: bg, borderColor: ring }}
      role="img"
      aria-label={`${kind} product illustration`}
    >
      <svg viewBox="0 0 64 64" width="60%" height="60%" fill="none" stroke={fg} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        {kind === "cable" && (
          <>
            {/* Two USB-C connectors connected by a cable */}
            <rect x="6" y="26" width="14" height="12" rx="2" />
            <rect x="44" y="26" width="14" height="12" rx="2" />
            <path d="M20 32 C 28 18, 36 46, 44 32" />
          </>
        )}
        {kind === "earbuds" && (
          <>
            <circle cx="22" cy="32" r="9" />
            <path d="M22 41 q 0 8 4 12" />
            <circle cx="42" cy="32" r="9" />
            <path d="M42 41 q 0 8 -4 12" />
          </>
        )}
        {kind === "plug" && (
          <>
            <rect x="14" y="14" width="36" height="36" rx="6" />
            <circle cx="26" cy="32" r="2.5" fill={fg} />
            <circle cx="38" cy="32" r="2.5" fill={fg} />
            <path d="M32 6 v 8" />
          </>
        )}
        {kind === "hdmi" && (
          <>
            <path d="M14 22 h 36 l -4 8 h -28 z" />
            <path d="M22 30 v 22 h 20 v -22" />
            <path d="M28 36 h 8" />
            <path d="M28 42 h 8" />
          </>
        )}
        {kind === "stand" && (
          <>
            <rect x="18" y="10" width="28" height="34" rx="3" />
            <path d="M14 50 h 36" />
            <path d="M28 44 v 6" />
            <path d="M36 44 v 6" />
          </>
        )}
        {kind === "speaker" && (
          <>
            <rect x="16" y="10" width="32" height="44" rx="6" />
            <circle cx="32" cy="22" r="4" />
            <circle cx="32" cy="40" r="8" />
          </>
        )}
      </svg>
    </div>
  );
}

const SPONSORED_DEALS = [
  "Save 8% with coupon",
  "Limited time deal",
  "Climate Pledge Friendly",
  "Amazon's Choice",
  "Ships from Amazom",
  "More buying choices",
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
          <div className="rounded border border-white/30 px-2 py-1 font-bold tracking-tight">
            amazom<span className="text-amber-400">.fake</span>
          </div>
          <div className="rounded border border-white/30 px-2 py-1 text-xs">
            <div className="text-slate-300">Deliver to Jason</div>
            <span className="font-bold">Cupertino 95014</span>
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
          <div className="text-xs font-bold">Cart (4)</div>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-[#17212e] px-3 py-1 text-[11px] text-slate-200">
          <span className="rounded bg-amber-400 px-1.5 py-0.5 font-bold text-slate-900">Sponsored</span>
          <span>Fast charging cables</span>
          <span className="text-slate-500">|</span>
          <span>MacBook accessories</span>
          <span className="text-slate-500">|</span>
          <span>Desk setup essentials</span>
          <span className="text-slate-500">|</span>
          <span>Under $15 deals</span>
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
          <div className="mb-3 rounded border border-amber-200 bg-amber-50 p-2">
            <div className="text-[11px] font-bold text-amber-800">Filter overload zone</div>
            <p className="mt-1 text-[11px] leading-snug text-amber-700">
              1,000+ results for <b>usb c cable braided 6ft</b>
            </p>
          </div>
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
          <h3 className="mb-2 mt-4 text-sm font-bold">Delivery</h3>
          <ul className="space-y-1">
            {["Get It Today", "Get It Tomorrow", "Prime Shipping", "Subscribe & Save"].map((d) => (
              <li key={d}>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" /> <span>{d}</span>
                </label>
              </li>
            ))}
          </ul>
          <h3 className="mb-2 mt-4 text-sm font-bold">Deals & Discounts</h3>
          <div className="flex flex-wrap gap-1">
            {SPONSORED_DEALS.map((d) => (
              <span key={d} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700">
                {d}
              </span>
            ))}
          </div>
        </aside>

        {/* Main product detail */}
        <main
          data-an-role="main"
          className="col-span-12 rounded bg-white p-5 shadow md:col-span-7"
        >
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-5">
              <div data-an-id="product-image" className="relative overflow-hidden rounded border border-slate-200 bg-slate-50">
                <div className="absolute left-2 top-2 z-10 rounded bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-700 shadow">
                  Hover to zoom
                </div>
                <img
                  src={PRODUCT_IMAGES[0].url}
                  alt={PRODUCT_IMAGES[0].alt}
                  className="aspect-square w-full bg-slate-100 object-cover"
                  onError={(e) => {
                    /* If the photo CDN ever fails or returns a wrong image,
                     * replace it with a guaranteed-on-theme SVG illustration
                     * of a USB-C cable so we never show a printer again. */
                    const img = e.currentTarget;
                    img.style.display = "none";
                    const fallback = img.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div
                  className="aspect-square w-full items-center justify-center bg-slate-900"
                  style={{ display: "none" }}
                  aria-hidden
                >
                  <CategoryIcon kind="cable" className="h-2/3 w-2/3" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 rounded bg-white/90 p-2 text-[11px] shadow">
                  <b>Image:</b> braided USB-C cable, aluminum connectors, lifetime-warranty 3-pack.
                </div>
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {PRODUCT_IMAGES.map((img, i) => (
                  <button
                    key={img.label}
                    className={[
                      "overflow-hidden rounded border bg-white p-0.5",
                      i === 0 ? "border-amber-500" : "border-slate-200 hover:border-amber-400",
                    ].join(" ")}
                    title={img.label}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="aspect-square w-full bg-slate-100 object-cover"
                      onError={(e) => {
                        const t = e.currentTarget;
                        t.style.background =
                          "#0f172a url(\"data:image/svg+xml;utf8," +
                          encodeURIComponent(
                            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" stroke="%23e2e8f0" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="26" width="14" height="12" rx="2"/><rect x="44" y="26" width="14" height="12" rx="2"/><path d="M20 32 C 28 18, 36 46, 44 32"/></svg>',
                          ) +
                          "\") center/60% no-repeat";
                        t.removeAttribute("src");
                      }}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded border border-slate-200 p-2 text-[11px] leading-snug text-slate-600">
                Roll over image to zoom in. Tap thumbnails to view reinforced connector, braided sleeve,
                desk setup, and travel pack.
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
              <div className="grid grid-cols-3 gap-1 text-center text-[11px]">
                {[
                  ["100W", "Fast charge"],
                  ["25k+", "Bend tested"],
                  ["3-pack", "Desk + car + bag"],
                ].map(([big, small]) => (
                  <div key={big} className="rounded border border-slate-200 bg-slate-50 p-2">
                    <div className="font-extrabold text-slate-900">{big}</div>
                    <div className="text-slate-500">{small}</div>
                  </div>
                ))}
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

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded border border-emerald-200 bg-emerald-50 p-2">
                  <b className="text-emerald-800">In Stock</b>
                  <div>Ships from Amazom.fake</div>
                  <div>Sold by Anker Direct</div>
                </div>
                <div className="rounded border border-sky-200 bg-sky-50 p-2">
                  <b className="text-sky-800">Returns</b>
                  <div>Eligible for return until Jun 8</div>
                  <div>Gift options available</div>
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
              <div className="rounded border border-slate-200 p-2 text-xs">
                <div className="mb-1 font-bold">Color: Black / Silver connector</div>
                <div className="flex flex-wrap gap-1">
                  {["Black", "White", "Red", "Blue", "Space Gray"].map((c, i) => (
                    <button
                      key={c}
                      className={[
                        "rounded border px-2 py-1",
                        i === 0 ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white",
                      ].join(" ")}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* "About this item" wall of text */}
          <section data-an-id="product-description" className="mt-5 border-t border-slate-200 pt-4">
            <h2 className="mb-2 text-base font-bold">Product description</h2>
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
              {[
                ["Power", "100W USB-C PD"],
                ["Length", "6 feet"],
                ["Material", "Nylon braid"],
                ["Warranty", "Lifetime"],
              ].map(([k, v]) => (
                <div key={k} className="rounded border border-slate-200 bg-slate-50 p-2">
                  <div className="font-bold text-slate-500">{k}</div>
                  <div>{v}</div>
                </div>
              ))}
            </div>
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
            <div className="mt-4 overflow-hidden rounded border border-slate-200">
              <table className="w-full text-left text-xs">
                <tbody>
                  {[
                    ["Connector Type", "USB-C to USB-C"],
                    ["Maximum Wattage", "100W"],
                    ["Data Transfer", "USB 2.0 / 480 Mbps"],
                    ["Included Components", "3 cables, warranty card, cable ties"],
                    ["Recommended Uses", "Laptop charging, phone charging, tablet charging"],
                  ].map(([k, v], i) => (
                    <tr key={k} className={i % 2 ? "bg-white" : "bg-slate-50"}>
                      <th className="w-1/3 px-3 py-2 font-bold">{k}</th>
                      <td className="px-3 py-2">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Reviews preview */}
          <section data-an-id="product-reviews" className="mt-5 border-t border-slate-200 pt-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-base font-bold">Top reviews</h2>
                <div className="text-xs text-slate-500">Showing 3 of 12,402 ratings</div>
              </div>
              <div className="rounded bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                4.5 out of 5 stars
              </div>
            </div>
            <div className="mb-3 space-y-1 text-xs">
              {[["5 star", "72%"], ["4 star", "16%"], ["3 star", "7%"], ["2 star", "3%"], ["1 star", "2%"]].map(([label, pct]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-10 text-cyan-700">{label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded bg-slate-100">
                    <div className="h-full bg-amber-400" style={{ width: pct }} />
                  </div>
                  <span className="w-8 text-right text-slate-500">{pct}</span>
                </div>
              ))}
            </div>
            {[
              { name: "Sarah K.", stars: 5, tag: "Verified Purchase", text: "Best cable I've ever owned. Charges my MacBook in 90 minutes flat. The braided sleeve doesn't tangle, and the connector feels solid." },
              { name: "Marcus T.", stars: 4, tag: "Color: Black", text: "Solid build. Tip: the 6ft length is perfect for couch-to-outlet. Took one star off because the packaging was excessive." },
              { name: "Priya R.", stars: 5, tag: "3-pack", text: "I bought the 3-pack and now my whole family uses them. Lifetime warranty is real — they replaced one no questions asked." },
            ].map((r, i) => (
              <div key={i} className="mb-2 border-b border-slate-100 pb-2">
                <div className="text-xs font-bold">
                  {r.name} <span className="text-amber-500">{"★".repeat(r.stars)}</span>
                  <span className="ml-2 rounded bg-slate-100 px-1 text-[10px] text-slate-500">{r.tag}</span>
                </div>
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
            {RECOMMENDATIONS.map((r, i) => (
              <div key={r.name} className="flex gap-2 border-b border-slate-100 pb-2">
                <CategoryIcon kind={r.kind} className="h-16 w-16" />
                <div className="min-w-0">
                  {i < 3 && (
                    <div className="mb-0.5 inline-block rounded bg-slate-100 px-1 text-[10px] font-bold text-slate-600">
                      Sponsored
                    </div>
                  )}
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
            Hot Holiday Picks
          </div>
          <div className="mt-3 rounded bg-emerald-100 p-2 text-center text-xs font-bold text-emerald-800">
            Subscribe & Save up to 15%
          </div>
          <div className="mt-3 rounded bg-amber-100 p-2 text-center text-xs font-bold text-amber-800">
            Join Prime — Free Trial
          </div>
          <div className="mt-3 rounded border border-slate-200 p-2">
            <h4 className="mb-2 text-xs font-bold">Compare with similar items</h4>
            <div className="space-y-2 text-[11px]">
              {["CableCo 60W 2-pack", "VoltLine 100W single", "ChargeMax nylon 3-pack"].map((x, i) => (
                <div key={x} className="flex justify-between gap-2 border-b border-slate-100 pb-1">
                  <span className="text-cyan-700">{x}</span>
                  <span className="font-bold">{["$8.49", "$12.99", "$10.99"][i]}</span>
                </div>
              ))}
            </div>
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
          © 1996–2026 Percept Demo, an Amazom-clone parody · Built for a hackathon · Not affiliated with anyone
        </div>
      </footer>
    </div>
  );
}
