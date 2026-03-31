// CRO Audit Checklist — 304 items across 8 page types
// Extracted from the n8n workflow "Load Checklist" node

export interface ChecklistItem {
  item: string;
  section: string;
  impact: number; // 1-3
  cost: number;   // 1-3
}

export type PageType = 'home' | 'product' | 'category' | 'landing' | 'cart' | 'checkout' | 'thank_you' | 'general';

export const CHECKLIST: Record<string, ChecklistItem[]> = 
{
  "general": [
    {
      "item": "Main pages (home page, landing page, product page) load quickly (5 seconds or less)",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Every page has a CTA (even 404 error pages, result page with 0 results, blog posts, about us page)",
      "section": "General",
      "impact": 1,
      "cost": 1
    },
    {
      "item": "Things that are clickable (like buttons) are obviously pressable (hover states, rounded corners, subtle gradient, blue underlined links)",
      "section": "General",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "Cookie notification bar can be easily closed or approved (under 2 seconds)",
      "section": "General",
      "impact": 1,
      "cost": 1
    },
    {
      "item": "The site offers wishlists which is the easiest first step in the checkout process",
      "section": "General",
      "impact": 2,
      "cost": 3
    },
    {
      "item": "Button labels and link labels start with a verb and time (e.g. \"Shop Now\")",
      "section": "General",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "Items that aren't clickable do not have characteristics that suggest that they are",
      "section": "General",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "There is sufficient space between action targets (buttons, forms) to prevent the user from hitting multiple or incorrect targets",
      "section": "General",
      "impact": 1,
      "cost": 1
    },
    {
      "item": "The store offers upsell opportunities between the checkout page and thank you page; if the user decides to add another product to the order, he doesn't need to input all the payment info again",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The shop's logo is placed in the same location on every page; clicking the logo returns the user to the most logical page (e.g. home page)",
      "section": "General",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "The website uses subtle micro-animations (e.g. pulses) to emphasise the main CTA on every page",
      "section": "General",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "The site doesn't include annoying pop-ups at the wrong time (too early in the process)",
      "section": "General",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "The home page promotes site-wide offers at the top of the page (e.g. Free Shipping) with urgency and scarcity triggers (\"Only today\") and a linked CTA (\"Shop best-sellers now\")",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The top bar with a site-wide offer is prominent, with a clear CTA",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The navigation system is broad and shallow (many items per menu level) rather than deep (many menu levels)",
      "section": "Navigation",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Good navigational feedback is provided (e.g. showing active state of where you are on the site)",
      "section": "Navigation",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "Category labels accurately describe the information in the category",
      "section": "Navigation",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Navigation items are ordered in the most logical or task-oriented manner (with the less important corporate information at the bottom)",
      "section": "Navigation",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Main navigation doesn't include unnecessary links (e.g. privacy policy, return policy, and terms and conditions)",
      "section": "Navigation",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "Store uses sticky navigation, so the categories, first page, search and cart widget are easily accessible all the time",
      "section": "Navigation",
      "impact": 2,
      "cost": 3
    },
    {
      "item": "The home page contains a prominent search box near the top (or top-right) of the website",
      "section": "Search bar",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The search bar has an auto-complete and auto-suggest option",
      "section": "Search bar",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Auto-suggest searches through categories and products",
      "section": "Search bar",
      "impact": 2,
      "cost": 3
    },
    {
      "item": "The search results page shows the user what was searched for; it is easy to edit and resubmit the search",
      "section": "Search bar",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Search results are clear, useful, and ranked by relevance and how many results were retrieved",
      "section": "Search bar",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "If no results are returned, the search engine gracefully (\"oh, snap\") offers ideas or options for improving the query based on identifiable problems with the user's input",
      "section": "Search bar",
      "impact": 1,
      "cost": 2
    },
    {
      "item": "The most common queries (as reflected in analytics) produce useful results",
      "section": "Search bar",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "The search engine includes templates, examples or hints on how it can be used effectively: verb + item (e.g. search \"men's hat, blue leggings, XL pullovers\")",
      "section": "Search bar",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "The search box is long enough to handle common query lengths",
      "section": "Search bar",
      "impact": 1,
      "cost": 1
    },
    {
      "item": "The search box gives results if you press Enter",
      "section": "Search bar",
      "impact": 1,
      "cost": 1
    },
    {
      "item": "The search box contains a \"magnifying glass\" icon that clearly represents the search function",
      "section": "Search bar",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "Once you click on the search field and before you type in anything, the search gives you hints of your recent searches or trending searches",
      "section": "Search bar",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "The search engine provides automatic spell checking and searches for plurals and synonyms",
      "section": "Search bar",
      "impact": 2,
      "cost": 3
    },
    {
      "item": "Cart widget is easibly accesible on every page in the top-right corner",
      "section": "Cart widget in the header",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Mini cart widget includes the total price, total discount, number of items, all items in the cart (on hover) and it's prominent on every page",
      "section": "Cart widget in the header",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "If the store has a free shipping option, the cart widget clearly states how far away the user is from getting free shipping",
      "section": "Cart widget in the header",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "A link to both the basket and checkout is clearly visible on the mini-cart widget",
      "section": "Cart widget in the header",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Empty cart widget has (on hover) CTA to \"Shop our best-sellers\"",
      "section": "Cart widget in the header",
      "impact": 1,
      "cost": 2
    },
    {
      "item": "Footer highlights benefits of shopping at the store (e.g. free shipping, returns, money back, 19k products shipped this month, contact information)",
      "section": "Footer",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Footer contains a \"Back to top\" link so the user can easily go back to the top",
      "section": "Footer",
      "impact": 1,
      "cost": 1
    },
    {
      "item": "It is clear that there is a real organisation behind the site (e.g. there is a physical address or a photo of the office)",
      "section": "Footer",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "It is easy to see the return policy, privacy policy and terms & conditions on any given page with one click",
      "section": "Footer",
      "impact": 1,
      "cost": 1
    },
    {
      "item": "Footer shows trust icons / seal badges (e.g. verified by Norton) along with reassuring copy (e.g. \"Shop with confidence\")",
      "section": "Footer",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "Footer includes links to social networks and a total number of likes/followers (so that the user can check them for trust)",
      "section": "Footer",
      "impact": 1,
      "cost": 1
    },
    {
      "item": "Footer includes links to main categories",
      "section": "Footer",
      "impact": 2,
      "cost": 1
    }
  ],
  "home": [
    {
      "item": "The home page promotes site-wide offers on top of the page (e.g. Free Shipping) with urgency and scarcity triggers",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The home page is professionally designed, not overloaded, and it creates a positive first impression",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Once you land on the homepage, you know the main products that the store is selling",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The home page follows a clear, straightfowrard visual hierarchy",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The value proposition is clearly stated on the home page (e.g. with a tagline or welcome blurb)",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The home page contains meaningful high-quality graphics, not clip art or pictures of models",
      "section": "General",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "The home page contains one or two (e.g. Shop for men, Shop for women) visually prominent CTAs above the fold and it has relevant copy (e.g. Start shopping)",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The home page highlights any specific deals, special offers or urgency offers near the top",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The home page highlights the main benefits of shopping with you (e.g. \"Vegan friendly\", \"We give back to charity\", \"Not tested on animals\", \"19,222 products successfully shipped and delivered this month alone\")",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The most important product categories are shown first, with descriptive photos near the top of the homepage",
      "section": "General",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "The store uses special category pages (best-sellers, new, sale, \"30% off\", etc.) that take users into a shopping mode",
      "section": "General",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "There is a short list of the most important products supplemented with links on the home page",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The home page contains an option for customers to contact the store (e.g. live chat, email, or phone number)",
      "section": "General",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "The home page shows recently viewed items for returning visitors",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The story of the founders behind the product and store is shown, along with their mission and vision",
      "section": "General",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "The home page contains general customer reviews or product specifics with a link to the product itself",
      "section": "Social proof",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The home page shows overall store ratings from authoritative review sites (e.g. Trustpilot, Reviews.com, Yotpo, Podium)",
      "section": "Social proof",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The home page contains awards, trust-badges, and certificates earned by the store",
      "section": "Social proof",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The home page highlights logos of news sites/blogs/celebrities where the product/brand has had any PR exposure (e.g. \"Used by executives at Fortune 500\")",
      "section": "Social proof",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The home page highlights logos of well-known brands",
      "section": "Social proof",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "The home page contains user-generated photos (e.g. from Instagram)",
      "section": "Social proof",
      "impact": 3,
      "cost": 2
    }
  ],
  "category": [
    {
      "item": "Users can sort category page (e.g. ordering by price, \"best-sellers\", \"new items\", \"most popular\", or \"most discounted\")",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The sorting feature is shown in the top-right corner above the product list/grid",
      "section": "General",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "Category page has clear and understandable (sub)category names",
      "section": "General",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "Category page uses relevant category page design (grid view when images are the main decision factor and list view when product attributes are the main decision factor)",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Shows exact number of products available on each page (either if the page is filtered or not)",
      "section": "General",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "A page description section (cca. 400 words) is on top (visually 90% hidden with \"Read more\") or on the bottom for SEO purposes",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "You stay at the same vertical position if you go to product page and then back to category page",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Relevant (3-4) products are shown per row",
      "section": "Product cards (list)",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Trending, top-rated and best-selling items are shown on top of each category by default",
      "section": "Product cards (list)",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Additional product photos are shown on mouse hover",
      "section": "Product cards (list)",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Consistent style of images is used for better scannability (type of images, image background, white space around the products, size of product, angle of photos)",
      "section": "Product cards (list)",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Consistent size of product cards is used for better scannability",
      "section": "Product cards (list)",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The category page clearly shows which product variants (size, color) are available for each specific product",
      "section": "Product cards (list)",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "All important information is shown for each product (prominent product title, old price, new price, discount, review count, overall star rating, short description, product variants [size, color], short descriptions, product attributes)",
      "section": "Product cards (list)",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "CTA button is shown to motivate users to go look at the product page (ideally on :hover)",
      "section": "Product cards (list)",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Scarcity on products that are limited in stock is shown (\"Only 1 left\")",
      "section": "Product cards (list)",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Items out of stock are shown (\"You just missed it\") so the scarcity above is more convincing",
      "section": "Product cards (list)",
      "impact": 2,
      "cost": 3
    },
    {
      "item": "Badges on product image thumbnails are shown (e.g. \"Fast delivery\",\"Best-seller\", \"New\", \"Top choice\", \"Trending\")",
      "section": "Product cards (list)",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "A customer can give their email address if the product is currently not available; they will be notified when it becomes available",
      "section": "Product cards (list)",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Category page offers easy to understand and useful (especially on mobile) filters (applicable only for stores with a large number of products)",
      "section": "Filters",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The filters are prominent enough (relevant only for stores where users are prone to use filters)",
      "section": "Filters",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The most popular filters are shown at the top of the filters",
      "section": "Filters",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Only relevant filters are shown for each category (e.g. screen size for \"Monitors\" category)",
      "section": "Filters",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "It is clearly visible (especially on mobile) that filters are applied, how many there are and can be easily removed",
      "section": "Filters",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Users can select multiple filters at once",
      "section": "Filters",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Filters are shown in a standard position on the left or on top (below the category name)",
      "section": "Filters",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "When a filter is selected, the category page auto-updates in real-time (ajax)",
      "section": "Filters",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product filters are sticky and can be easily accessed at any given moment",
      "section": "Filters",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Relevant selectors are used for different types of filters (e.g. color swatches instead of \"blue\", price range slider where users can type in the minimum and maximum price insted of a pre-made list of price ranges)",
      "section": "Filters",
      "impact": 3,
      "cost": 3
    }
  ],
  "product": [
    {
      "item": "Sticky navigation with product name, product image, product page sections, availability, old price, new price, discount and CTA that hides when the user is scrolling down but reappears when the user scrolls up",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product page has an option for potential customers to ask questions (e.g. live chat, phone number)",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Product page contains breadcrumbs (not applicable to single product stores and direct-response landing pages)",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "A customer can give their email address if the product is currently not available; they will be notified when it becomes available",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Clicking the back button always takes the user back to the page the user came from",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product titles are descriptive",
      "section": "Product overview (above the CTA area)",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The main product title is visually prominent compared to other content",
      "section": "Product overview (above the CTA area)",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The product title is under 65 characters so it appears fully in Google search results",
      "section": "Product overview (above the CTA area)",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "The product subtitle highlight key product benefit and contain power words, e.g. effortless, incredible, absolute, unique, secret, now, new, exclusive, how to, why",
      "section": "Product overview (above the CTA area)",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Product rating overviews are shown near product titles that are linked (with click & scroll) to product reviews (e.g. 4.6, Read 5 Reviews)",
      "section": "Product overview (above the CTA area)",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "A short list of other key benefits of the product is near the main title and linked to a detailed description (with green check arrows)",
      "section": "Product overview (above the CTA area)",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The main product photo is attractive",
      "section": "Image gallery",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The main product photo allows a user to zoom in easily (especially on mobile)",
      "section": "Image gallery",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "There is a gallery with different product photos",
      "section": "Image gallery",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The product gallery shows thumbnails of other available images",
      "section": "Image gallery",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The product gallery contains product videos",
      "section": "Image gallery",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The product gallery contains arrows to navigate between images",
      "section": "Image gallery",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The product gallery supports swipe actions on mobile devices",
      "section": "Image gallery",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "There are images for different product variants/sizes",
      "section": "Image gallery",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The main CTA is the most visible element on the product page and contains the \"cart\" icon",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Product variants are easily accessible on mobile and big enough with enough white space around to prevent misclicks",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The product variant selection is connected with the product gallery and shows images of chosen product variants",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "A visible reminder is included to select size/color if a customer forgets and clicks \"add to cart\" too early",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Interactive selectors are used for product variants (the gallery image and the price are changed in real-time, without triggering a page reload)",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "A size chart (or link that opens in a small popup and is easily closed on mobile) is provided near the size selections (for products with different sizes)",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Localized units for products are shown with different sizes/measurements (e.g. cm, inches, kg)",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Product descriptions mention the size of the model and the size of the shirt the model is wearing (only for apparel)",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Interactive selectors are used for quantity selection instead of dropdowns (the price and quantity are changed in real-time, without triggering a page reload)",
      "section": "CTA area",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "The CTA copy clearly explains what will happen when you click on it (e.g. Proceed to secure checkout)",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Clear feedback is provided once the product has been added to the cart (e.g. a number in the mini-cart widget increases)",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The main CTA change states once users add a product to the cart (e.g. \"[check arrow] Product added to your cart\" and after 2 seconds \"Go to my shopping cart [right arrow]\")",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The price of the product is prominent enough, especially if it's discounted",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The price of the product is placed near the main CTA",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The price of the product is localized",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The background color of the product's primary CTA differs from other elements (e.g. slightly grey)",
      "section": "CTA area",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "All additional charges that may apply are shown near the main CTA (e.g. additional shipping costs due to product size, VAT)",
      "section": "CTA area",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "If free shipping is offered, it's highlighted near the main CTA",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "All shipping information is shown near the main CTA (delivery to shopper's location, shopper's country flag, cost, time)",
      "section": "CTA area",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Availability of the product is shown near the main CTA (e.g. \"In stock\")",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The old price (with a strike-trough) is shown with the new price and how much shoppers will save (% or $) when the product is on sale",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Clear information is shown about returns, refunds and money-back guarantee",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Express payment options are shown and available that are commonly used (e.g. PayPal, Amazon, Google Pay, Apple Pay). Useful for direct-response landing pages",
      "section": "CTA area",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "There is an option for a payment with installments (e.g. Klarna, AfterPay; for expensive products only). Useful for direct-response landing pages that don't encourage the user to add other products to the cart",
      "section": "CTA area",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product page highlights logos of news sites/blogs/celebrities where the product/brand has had PR exposure (e.g. \"Used by executives at Fortune 500\" )",
      "section": "Social proof",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Customer reviews are shown with a review title, customer photos of product, star rating, photo of reviewer, name and last name, \"verified\" buyer, occupation, and age",
      "section": "Social proof",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Customer reviews visually stand out from other content (ideally on a slightly yellow background)",
      "section": "Social proof",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Product page contains photos (with faces) of how (happy) customers are using the product",
      "section": "Social proof",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product overall star ratings are shown and can be filtered by the star rating",
      "section": "Social proof",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product page contains the number of customers this week/month/all-time (e.g. \"19,222 products successfully shipped and delivered this month alone\")",
      "section": "Social proof",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Product page contains video testimonials",
      "section": "Social proof",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product page contains the number of Facebook and Twitter followers",
      "section": "Social proof",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Clear quantity discounts are offered near the main CTA (1x $24.99/piece, [\"Top choice\" badge]; 2x 19,99\\u20ac/piece, [\"Recommended\" badge]; 3x $17,49/piece, [\"Best value\" badge])",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Relevant cross-sell/up-sell products are offered",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Relevant bundle products are offered with prominent discounts",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Urgency triggers are used (e.g. \"Today only\", \"Black Friday offer\", \"Free bonus\", \"If order is placed in the next 12 min, it will be shipped today\") near the main CTA",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Scarcity triggers are used (e.g. \"Only 3 products left\") near the main CTA",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Customers are shown how many people have viewed and bought the product in the last 24 hours",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "A store is giving away a small percentage of the profit to charity; and highlights this information",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The product page contains \"Visitors who viewed this product also viewed...\" where users are shown complementary OR/AND alternative products",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The product description is easy to read (font size, contrast, single column, 75 characters per line, line-height 1.5, max. 4 lines long)",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Product information structure is easy to scan (grouped information, bullet points, important benefits highlighted)",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The sections of the page (\"General\", \"Technical info\") are grouped together in accordion (if they are longer) and scannable on mobile",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Section titles explain benefits (and not features) of the product",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Customers are shown all the things that are included in the product (ideally with an included photo)",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Product page contains customer FAQs (for each specific product as well as store-wide questions)",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The table of technical specifications is readable (different colors of lines, hover state of the line, not too far apart)",
      "section": "Product description",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Product page offers product comparisons",
      "section": "Product description",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product description explains how to use the product in 3 easy steps",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Product page contains embedded reviews (or screenshots) from social networks (e.g. Facebook post, Messenger, Whatsapp, Tweet, Instagram post, Instagram PM, Viber, text message)",
      "section": "Product description",
      "impact": 3,
      "cost": 3
    }
  ],
  "landing": [
    {
      "item": "The buy button takes the user directly to the checkout (or upsell) and skips the cart page",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Sticky navigation with product name, product image, product page sections, availability, old price, new price, discount and CTA that hides when the user is scrolling down but reappears when the user scrolls up",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Landing page doesn't contain any outgoing links (e.g. clickable logo, navigation and footer)",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product page has an option for the potential customer to ask questions (e.g. live chat, phone number)",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Product titles are descriptive",
      "section": "Product overview (above the CTA area)",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The main product title is visually prominent compared to other content",
      "section": "Product overview (above the CTA area)",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The product title is under 65 characters so it appears fully in Google search results",
      "section": "Product overview (above the CTA area)",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "The product subtitles highlight key product benefits and contains power words, e.g. effortless, incredible, absolute, unique, secret, now, new, exclusive, how to, why",
      "section": "Product overview (above the CTA area)",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Product rating overviews are shown near product titles that are linked (with scroll animation) to product reviews (e.g. 4.6, Read 5 Reviews)",
      "section": "Product overview (above the CTA area)",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "A short list of key benefits of the product is near the main title and linked to a detailed description (with green check arrows)",
      "section": "Product overview (above the CTA area)",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The page layout is standardized (e.g. photo gallery on the left side, description and CTA on the right)",
      "section": "Image gallery",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The main product photo is attractive",
      "section": "Image gallery",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The main product photo allows a user to zoom in easily (especially on mobile)",
      "section": "Image gallery",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "There is a gallery with different product photos",
      "section": "Image gallery",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The product gallery shows thumbnails of other available images",
      "section": "Image gallery",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The product gallery contains product videos",
      "section": "Image gallery",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The product gallery contains arrows to navigate between images",
      "section": "Image gallery",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The product gallery supports swipe actions on mobile devices",
      "section": "Image gallery",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "There are images for different product variants/sizes",
      "section": "Image gallery",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The main CTA is the most visible element on the product page and contains the \"cart\" icon",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Product variants are easily accessible on mobile and big enough with enough white space around to prevent misclicks",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The product variant selection is connected with the product gallery and shows images of chosen product variants",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "A visible reminder is included to select size/color if a customer forgets and clicks \"add to cart\" too early",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Interactive selectors are used for product variants (the gallery image and the price are changed in real-time, without triggering a page reload)",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "A size chart (or link that opens in a small popup and is easily closed on mobile) is provided near the size selections (for products with different sizes)",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Localized units for products are shown with different sizes/measurements (e.g. cm, inches, kg)",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Product descriptions mention the size of the model and the size of the shirt the model is wearing (only for apparel)",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Interactive selectors are used for quantity selection instead of dropdowns (the price and quantity are changed in real-time, without triggering a page reload)",
      "section": "CTA area",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "The CTA copy clearly explains what will happen when you click on it (e.g. Proceed to secure checkout)",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The price of the product is prominent enough, especially if it's discounted",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The price of the product is placed near the main CTA",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The price of the product is localized",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The background color of the product's primary CTA differs from other elements (e.g. slightly grey)",
      "section": "CTA area",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "All additional charges that may apply near the main CTA are shown (e.g. additional shipping costs due to product size, VAT)",
      "section": "CTA area",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "If free shipping is offered, it's highlighted near the main CTA",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "All shipping information is shown near the main CTA (delivery to shopper's location, shopper's country flag, cost, time)",
      "section": "CTA area",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Availability of the product is shown near the main CTA (e.g. \"In stock\")",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The old price (with a strike-trough) is shown with the new price and how much shoppers will save (% or $) when the product is on sale",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Clear information is shown about returns, refunds and money-back guarantee",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Express payment options are shown and available that are commonly used (e.g. PayPal, Amazon, Google Pay, Apple Pay). Useful for direct-response landing pages",
      "section": "CTA area",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "There is an option for a payment with installments (e.g. Klarna, AfterPay; for expensive products only). Useful for direct-response landing pages that don't encourage the user to add other products to the cart",
      "section": "CTA area",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The landing page highlights the main benefits of shopping with you (e.g. \"Vegan friendly\", \"We give back to charity\", \"Not tested on animals\", \"19,222 products successfully shipped and delivered this month alone\")",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Product page highlights logos of news sites/blogs/celebrities where the product/brand has had PR exposure (e.g. \"Used by executives at Fortune 500\" )",
      "section": "Social proof",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Customer reviews are shown with a review title, customer photos of product, star rating, photo of reviewer, name and last name, \"verified\" buyer, occupation, and age",
      "section": "Social proof",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Customer reviews visually stand out from other content (ideally on a slightly yellow background)",
      "section": "Social proof",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Product page contains photos (with faces) of how (happy) customers are using the product",
      "section": "Social proof",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product overall star ratings are shown and can be filtered by the star rating",
      "section": "Social proof",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product page contains the number of customers this week/month/all-time (e.g. \"19,222 products successfully shipped and delivered this month alone\")",
      "section": "Social proof",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Product page contains video testimonials",
      "section": "Social proof",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product page contains the number of Facebook and Twitter followers",
      "section": "Social proof",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "After the user clicks the \"Buy button\", they are taken to the upsell variant where you offer him a second item (of the same or complementary product) cheaper",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Clear quantity discounts are offered near the main CTA (1x $24.99/piece, [\"Top choice\" badge]; 2x 19,99\\u20ac/piece, [\"Recommended\" badge]; 3x $17,49/piece, [\"Best value\" badge])",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Relevant cross-sell/up-sell products are offered",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Relevant bundle products are offered with prominent discounts",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Urgency triggers are used (e.g. \"Today only\", \"Black Friday offer\", \"Free bonus\", \"If order is placed in the next 12 min, it will be shipped today\") near the main CTA",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Scarcity triggers are used (e.g. \"Only 3 products left\") near the main CTA",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Customers are shown how many people have viewed and bought the product in the last 24 hours",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "A store is giving away a small percentage of the profit to charity; and highlights this information",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The product page contains \"Visitors who viewed this product also viewed...\" where users are shown complementary OR/AND alternative products",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The product description is easy to read (font size, contrast, single column, 75 characters per line, line-height 1.5, max. 4 lines long)",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Product information structure is easy to scan (grouped information, bullet points, important benefits highlighted)",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The sections of the page (\"General\", \"Technical info\") are grouped together in accordion (if they are longer) and scannable on mobile",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Section titles explain benefits (and not features) of the product",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Customers are shown all the things that are included in the product (ideally with an included photo)",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Product page contains customer FAQs (for each specific product as well as store-wide questions)",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The table of technical specifications is readable (different colors of lines, hover state of the line, not too far apart)",
      "section": "Product description",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Product page offers product comparisons",
      "section": "Product description",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Product description explains how to use the product in 3 easy steps",
      "section": "Product description",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Product page contains embedded reviews (or screenshots) from social networks (e.g. Facebook post, Messenger, Whatsapp, Tweet, Instagram post, Instagram PM, Viber, sms)",
      "section": "Product description",
      "impact": 3,
      "cost": 3
    }
  ],
  "cart": [
    {
      "item": "The overall cart design is clear and uncluttered",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Urgency triggers are used (\"Your items are reserved for 10 minutes\", \"If you order in next 12 minutes, the order will be shipped today\")",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The cart page clearly informs the user how far away they are from the threshold for free shipping (or a 3% discount)",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "If the user already reached the threshold for free shipping, the cart prominently highlights that (e.g. bold, green)",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "When the user returns to the site, the items that they placed in the cart are still there",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "All important product information is shown in the cart (title, image, chosen variant, quantity, price)",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The right product image is shown for the chosen product variant (e.g. Red dress)",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The cart allows you to change the quantity of the product and automatically updates the cart",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The user can easily remove an item from the cart",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The cart shows the day of expected delivery",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Scarcity triggers are shown next to each item (\"Only 1 item in stock\") in a prominent color (e.g. red, orange)",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The cart offers an easy way to get in touch with the store's help center (e.g. live chat, email, phone number)",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Information about returns, refunds and a money-back guarantee is shown (if on external pages, a small pop-up window appears instead of redirecting the customer away from the cart)",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The cart offers a way to enter a coupon code but with a hidden input field (so users won't go searching for coupon codes on Google)",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The cart offers (inexpensive) upsell/cross-sell products with benefits and urgency (\"Now or never\") and a special discount (e.g. 50% OFF)",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Customers can \\u201csave products / cart for later\\u201d instead of deleting them",
      "section": "General",
      "impact": 2,
      "cost": 3
    },
    {
      "item": "The subtotal price is prominent and placed near the main CTA",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Estimated taxes are shown",
      "section": "CTA area",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The shopper is shown how much they will save on their entire purchase near main CTA",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The main CTA includes what will happen next (\"Proceed to a secure checkout\") and is the most prominent element and duplicated at the top and bottom of the page",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The main CTA (\"Proceed to a secure checkout\") includes a lock icon on a distinctive (gray) background",
      "section": "CTA area",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Below the main CTA is a trust icon / seal badge (e.g. verified by Norton) along with reassuring copy \"Shop with confidence\"",
      "section": "CTA area",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Alternative payment options are shown below the main CTA button (e.g. PayPal, Amazon Pay, Google Pay)",
      "section": "CTA area",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Images of all available installment methods are shown (e.g. Klarna) with clear monthly payment and duration info (especially useful for more expensive products)",
      "section": "CTA area",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "A secondary CTA \"Continue shopping\" button is available on the cart page",
      "section": "CTA area",
      "impact": 2,
      "cost": 1
    }
  ],
  "checkout": [
    {
      "item": "The checkout allows the user to make a purchase as a guest (avoids unnecessary registration)",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The site provides good feedback during checkout (e.g. a progress bar indicates where the user is in the checkout process)",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "If there is a multi-step checkout, it's clear what will happen after you click CTA",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The form avoids making the user start again if there's an error",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Immediately prior to commiting to the purchase, the site shows the user a clear order summary",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Below the main CTA is a trust icon / seal badge (e.g. verified by Norton) along with reasurring copy \"Shop with confidence\"",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Checkout doesn't contain any outgoing links (e.g. clickable logo, navigation and footer)",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The site's privacy policy is easy to find, especially on pages that ask for personal information, and the policy is simple and clear",
      "section": "General",
      "impact": 2,
      "cost": 1
    },
    {
      "item": "Checkout offers an easy way to get in touch with the store's help center (e.g. live chat, email, phone number)",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The main CTA is the most prominent element on the checkout page",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "After the checkout page and before the thank you page, there is an upsell step where user can add another product to the existing order",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The checkout page contains order bumps (e.g. \"Skip the queue\", \"Urgent shipping\", \"Gift packaging\", \"Package insurance\" with prices under $3)",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Urgency triggers are used (\"Your items are reserved for 10 minutes\", \"If your order is completed in the next 12 minutes, it will be shipped today\")",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Checkout allows users to log in so they don't need to type in all the information again",
      "section": "Log in and registration",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "During registration, the password selection process is not overcomplicated with unnecessary requirements",
      "section": "Log in and registration",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Password recovery is easy",
      "section": "Log in and registration",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The layout of input fields is as simple as possible (single column, ideally)",
      "section": "Forms",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The checkout page has the minimum amount of input fields needed for completing the purchase",
      "section": "Forms",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The checkout page input fields are \"floating labels\" so the user can see the name of the field and its contents simultaneously",
      "section": "Forms",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "The user's email address is requested first so in case they leave the checkout, the store is able to contact them",
      "section": "Forms",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The input fields contain suggestions (Email: e.g. john.doe@gmail.com) to decrease the user's cognitive load",
      "section": "Forms",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The checkout page has an option to check \"the billing address is the same as shipping\", so the user doesn't need to enter the same address twice",
      "section": "Forms",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Choosing a payment option (e.g. radio buttons) is easily accessible on mobile",
      "section": "Forms",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Visual prompts are included for credit card details, such as an image of where to find the CVV code",
      "section": "Forms",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Credit card input fields are shown on a gray background for higher (perceived) trust",
      "section": "Forms",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Users can easily jump between input fields of a form by using the \"Tab\" key",
      "section": "Forms",
      "impact": 1,
      "cost": 2
    },
    {
      "item": "When entering data into a number-only input field (e.g. post code, phone number), a numeric keyboard is shown on mobile",
      "section": "Forms",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "When entering an email, a keyboard with dedicated buttons for @ and \".com\" is shown on mobile",
      "section": "Forms",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Input-field width indicates the amount and format of data that needs to be entered (e.g. postal code input is smaller than address), including credit card inputs",
      "section": "Forms",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Optional and mandatory fields are easily distinguishable",
      "section": "Forms",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "If we are asking for the phone number, we must explain beside/below the input that it's only for delivery information",
      "section": "Forms",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "Checkout is using a database of street addresses so the user cannot mistype the address",
      "section": "Forms",
      "impact": 2,
      "cost": 3
    },
    {
      "item": "Input fields use inline validation with a prominent green/red border and arrow/x sign (e.g, if the email is correctly entered)",
      "section": "Forms",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The error state of incorrectly filled out input fields clearly states what is wrong and how it should be corrected",
      "section": "Forms",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The user does not need to enter the same information more than once",
      "section": "Forms",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Checkout uses an auto-complete function wherever possible (e.g. when user types in the postal code, the city gets filled out automatically)",
      "section": "Forms",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "If the user leaves the checkout and then returns, the input fields will have been saved so they can continue where they left off",
      "section": "Forms",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Input fields have an option (\"X\" icon at the right side) to delete the content with one click",
      "section": "Forms",
      "impact": 2,
      "cost": 2
    }
  ],
  "thank_you": [
    {
      "item": "Thank you page clearly states that the user successfully completed the purchase and congratulates them",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Thank you page clearly sumarizes what was in the order",
      "section": "General",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "Thank you page clearly states when the package will arrive and with what courier / delivery service",
      "section": "General",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Thank you page offers an easy way for the user to get in touch with the store owner(e.g. live chat, email, phone number)",
      "section": "General",
      "impact": 3,
      "cost": 1
    },
    {
      "item": "The thank you page explains to the user how they can track their package",
      "section": "General",
      "impact": 2,
      "cost": 2
    },
    {
      "item": "Thank you page offers the user to buy additional items/quantity of the same product at a lower price, or buy another complementary product, with a clear explanation that these additional items will be combined with their recently made order)",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    },
    {
      "item": "Thank you page offers the user a coupon code that they can use for their next purchase, or give it to their friends",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 2
    },
    {
      "item": "The user receives a summary of all information in their confirmation email (product summary, upsells, coupon code that is on the thank you page, etc.)",
      "section": "Conversion and AOV 'boosters'",
      "impact": 3,
      "cost": 3
    }
  ]
};

/**
 * Load the checklist for a given page type.
 * For non-general types, combines General + page-specific items.
 * For general, returns just the General checklist.
 */
export function loadChecklist(pageType: PageType): ChecklistItem[] {
  const general = CHECKLIST['general'] || [];

  if (pageType === 'general') {
    return general;
  }

  const specific = CHECKLIST[pageType] || [];
  return [...general, ...specific];
}

/**
 * Get all available page types.
 */
export function getPageTypes(): PageType[] {
  return ['home', 'product', 'category', 'landing', 'cart', 'checkout', 'thank_you', 'general'];
}

/**
 * Get the display label for a page type.
 */
export function getPageTypeLabel(pageType: PageType): string {
  const labels: Record<PageType, string> = {
    home: 'Home',
    product: 'Product',
    category: 'Category',
    landing: 'Landing',
    cart: 'Cart',
    checkout: 'Checkout',
    thank_you: 'Thank You',
    general: 'General',
  };
  return labels[pageType] || pageType;
}
