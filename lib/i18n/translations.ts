/**
 * Every piece of interface copy, in English and Arabic.
 *
 * Product names, category names and page content typed by the admin are
 * deliberately absent: those come from the database and are shown as entered,
 * in whatever language they were written.
 *
 * Arabic here is Modern Standard, phrased the way UAE shops actually write —
 * "أضف إلى السلة" rather than a literal rendering of "add to cart".
 */

export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
};

/** Arabic is written right to left; everything else here is left to right. */
export const DIRECTION: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};

type Dictionary = Record<string, string>;

const en: Dictionary = {
  // Header + navigation
  'nav.home': 'Home',
  'nav.categories': 'Categories',
  'nav.myAccount': 'My Account',
  'nav.wishlist': 'My Wishlist',
  'nav.orders': 'My Orders',
  'nav.wholesale': 'Wholesale Login',
  'nav.support': 'Support / Chat',
  'nav.viewAll': 'View All',
  'nav.menu': 'Menu',
  'nav.search': 'Search',
  'nav.cart': 'Cart',
  'nav.closeMenu': 'Close menu',
  'nav.home.aria': 'Snack Hub home',

  // Announcement bar
  'promo.freeDelivery': 'Free Delivery on 3+ Boxes',
  'promo.bestRates': 'Best Rates',
  'promo.original': '100% Original',
  'promo.nextDay': 'Next Day Delivery',
  'promo.region': 'Store announcements',

  // Product cards
  'product.addToCart': 'Add to Cart',
  'product.outOfStock': 'Out of Stock',
  'product.inStock': 'In stock',
  'product.onlyLeft': 'Only {n} left',
  'product.showMore': 'Show More ({n})',
  'product.showLess': 'Show Less',
  'product.none': 'No products found',
  'product.currency': 'AED',

  // Product page
  'product.readyToShip': 'In Stock & Ready to Ship',
  'product.orderSoon': 'Only {n} left — order soon',
  'product.buyNow': 'Buy Now',
  'product.cart': 'Cart',
  'product.added': 'Added',
  'product.wholesaleTitle': 'Need Wholesale Prices?',
  'product.wholesaleSub': 'Get special rates for bulk orders',
  'product.whatsapp': 'WhatsApp',
  'product.alsoLike': 'You may also like',
  'product.back': 'Back',
  'trust.freeDelivery': 'Free Delivery',
  'trust.freeDeliverySub': 'On 3+ boxes',
  'trust.expiry': '1 Year+ Expiry',
  'trust.expirySub': 'Fresh stock, never near-dated',
  'trust.cod': 'Cash on Delivery',
  'trust.codSub': 'All over the UAE',
  'trust.cardOnly': 'Card Payment',
  'trust.cardOnlySub': 'Secure card payment only',
  'trust.original': 'Original Product',
  'trust.originalSub': 'Authorised distributors only',

  // Cart
  'cart.title': 'Your Cart',
  'cart.empty': 'Cart is empty',
  'cart.emptySub': 'Add your favourite snacks and drinks to get started!',
  'cart.checkout': 'Checkout',
  'cart.continue': 'Continue Shopping',
  'cart.subtotal': 'Subtotal',
  'cart.discount': 'Discount',
  'cart.shipping': 'Shipping',
  'cart.free': 'Free',
  'cart.total': 'Total',
  'cart.remove': 'Remove',

  // Checkout
  'checkout.title': 'Shipping Details',
  'checkout.fullName': 'Full Name',
  'checkout.namePlaceholder': 'e.g. Ali Rahman',
  'checkout.phone': 'Phone Number',
  'checkout.city': 'City (Emirate)',
  'checkout.address': 'Full Address',
  'checkout.addressPlaceholder': 'Area, Street, Building, Apt number...',
  'checkout.payment': 'Payment Method',
  'checkout.cod': 'Cash on Delivery',
  'checkout.codSub': 'Pay when your order arrives',
  'checkout.online': 'Pay Online',
  'checkout.onlineSub': 'Visa, Mastercard, Apple Pay',
  'checkout.placeOrder': 'Place Order',
  'checkout.proceedPay': 'Proceed to Pay',
  'checkout.processing': 'Processing…',
  'checkout.emptyCart': 'Your cart is empty',
  'checkout.fillAll': 'Please fill all fields',
  'checkout.phoneHint': '9 digits after +971, starting with 5.',
  'checkout.arrivesIn': 'Arrives in',

  // Card-only categories (imported rarities)
  'checkout.cardOnlyTitle': 'This order must be paid by card',
  'checkout.cardOnlyBody': 'Cash on delivery is not available for:',
  'checkout.cardOnlyRemove': 'To pay cash on delivery, please remove these items from your cart.',
  'checkout.cardOnlyError': 'Card payment is required for: {items}. Remove them to pay cash on delivery.',
  'checkout.cardUnavailable': 'Card payment is temporarily unavailable, so this order cannot be placed right now. Please remove the card-only items or contact us on WhatsApp.',
  'checkout.importedShipping': 'Imported items ship from the USA, UK or Europe.',
  'category.cardOnly': 'Card payment only — no cash on delivery.',
  'category.cardOnlyShipping': 'Shipped from the USA, UK and Europe — delivery takes {estimate}.',
  'product.cardOnly': 'This energy drink accepts card payment only',
  'product.cardOnlyNote': 'Cash on delivery is not available for this product. Delivery takes {estimate} as it ships from the USA, UK or Europe.',

  // Order confirmation
  'success.received': 'Order Received!',
  'success.paid': 'Payment Successful!',
  'success.failed': 'Payment Failed',
  'success.thanksCod': 'Thank you for choosing Snack Hub! Your order has been successfully placed. Our team will contact you shortly.',
  'success.thanksPaid': 'Thank you for your purchase! Your online payment was successful. Our team will contact you shortly.',
  'success.failedBody': 'Unfortunately, your online payment could not be processed. Please try again or contact support.',
  'success.orderNumber': 'Your order number',
  'success.keepNumber': 'Keep this number — quote it when you contact us about this order.',
  'success.summary': 'Order summary',
  'success.estimatedDelivery': 'Estimated Delivery',
  'success.deliveryWindow': '1–2 days',
  'success.deliveryNote': 'depending on your area',
  'success.totalAmount': 'Total Amount',

  // My Orders
  'orders.title': 'My Orders',
  'orders.sub': 'Orders placed from this device. Quote the order number when you contact us.',
  'orders.none': 'No orders yet',
  'orders.noneSub': 'Orders you place will appear here. If you ordered from another phone or computer, they will not show on this device — contact us with your order number and we will look it up.',
  'orders.startShopping': 'Start shopping',
  'orders.viewReceipt': 'View receipt',
  'orders.checking': 'Checking…',
  'orders.received': 'Order received',
  'orders.awaitingPayment': 'Awaiting payment',
  'orders.paidLabel': 'Paid',
  'orders.failedLabel': 'Payment failed',
  'orders.processing': 'Processing',

  // Wishlist
  'wishlist.title': 'My Wishlist',
  'wishlist.empty': 'Your wishlist is empty',

  // FAQ
  'faq.heading': 'Frequently',
  'faq.headingAccent': 'Asked',
  'faq.seeAll': 'See all questions',
  'faq.q1': 'How much is delivery?',
  'faq.a1': 'Free on 3 boxes or more. Under 3 boxes it is a flat 20 AED.',
  'faq.q2': 'How can I pay?',
  'faq.a2': 'Cash on Delivery, or card online via Ziina — Visa, Mastercard and Apple Pay.',
  'faq.q3': 'Are the products original?',
  'faq.a3': 'Yes. Everything is sourced from authorised distributors and official brand partners.',
  'faq.q4': 'How fresh is the stock?',
  'faq.a4': 'All items carry at least a year of shelf life. We never ship near-dated stock.',
  'faq.q5': 'How are your prices?',
  'faq.a5': 'Best rates around — we price below what you will find elsewhere, on every carton.',

  // Footer
  'footer.tagline': 'Your premium snacks & energy destination in the UAE. Fuel your day, the right way.',
  'footer.about': 'About Us',
  'footer.contact': 'Contact',
  'footer.faq': 'FAQ',
  'footer.privacy': 'Privacy Policy',
  'footer.terms': 'Terms of Sale',
  'footer.rights': 'All rights reserved.',
  'footer.delivering': 'Delivering high energy across Dubai & the UAE.',

  // Search
  'search.placeholder': 'Search Red Bull, Monster, C4…',
  'search.prompt': 'Type to search the shop.',
  'search.loading': 'Loading products…',
  'search.noMatch': 'No products match “{q}”.',
  'search.failed': 'Could not load products. Check your connection and try again.',
  'search.close': 'Close',
  'search.clear': 'Clear search',

  // States
  'state.loading': 'Loading',
  'state.verifying': 'Verifying payment',
  'error.title': 'Something went wrong',
  'error.body': 'We could not load this page just now. This is usually temporary — please try again in a moment.',
  'error.tryAgain': 'Try again',
  'error.backToShop': 'Back to shop',
  'error.catalogTitle': 'Products are taking a break',
  'error.catalogBody': 'We could not reach our catalog just now. Give it a moment and refresh — your cart is safe.',
  'error.refresh': 'Refresh',

  // Language switcher
  'lang.label': 'Language',
  'lang.switchTo': 'العربية',
};

const ar: Dictionary = {
  // Header + navigation
  'nav.home': 'الرئيسية',
  'nav.categories': 'الفئات',
  'nav.myAccount': 'حسابي',
  'nav.wishlist': 'المفضلة',
  'nav.orders': 'طلباتي',
  'nav.wholesale': 'تسجيل دخول تجار الجملة',
  'nav.support': 'الدعم والمحادثة',
  'nav.viewAll': 'عرض الكل',
  'nav.menu': 'القائمة',
  'nav.search': 'بحث',
  'nav.cart': 'السلة',
  'nav.closeMenu': 'إغلاق القائمة',
  'nav.home.aria': 'الصفحة الرئيسية لسناك هب',

  // Announcement bar
  'promo.freeDelivery': 'توصيل مجاني عند شراء 3 كراتين أو أكثر',
  'promo.bestRates': 'أفضل الأسعار',
  'promo.original': 'منتجات أصلية 100%',
  'promo.nextDay': 'التوصيل في اليوم التالي',
  'promo.region': 'إعلانات المتجر',

  // Product cards
  'product.addToCart': 'أضف إلى السلة',
  'product.outOfStock': 'غير متوفر',
  'product.inStock': 'متوفر',
  'product.onlyLeft': 'بقي {n} فقط',
  'product.showMore': 'عرض المزيد ({n})',
  'product.showLess': 'عرض أقل',
  'product.none': 'لا توجد منتجات',
  'product.currency': 'د.إ',

  // Product page
  'product.readyToShip': 'متوفر وجاهز للشحن',
  'product.orderSoon': 'بقي {n} فقط — سارع بالطلب',
  'product.buyNow': 'اشترِ الآن',
  'product.cart': 'السلة',
  'product.added': 'تمت الإضافة',
  'product.wholesaleTitle': 'هل تبحث عن أسعار الجملة؟',
  'product.wholesaleSub': 'احصل على أسعار خاصة للطلبات الكبيرة',
  'product.whatsapp': 'واتساب',
  'product.alsoLike': 'قد يعجبك أيضاً',
  'product.back': 'رجوع',
  'trust.freeDelivery': 'توصيل مجاني',
  'trust.freeDeliverySub': 'عند شراء 3 كراتين أو أكثر',
  'trust.expiry': 'صلاحية سنة أو أكثر',
  'trust.expirySub': 'بضاعة طازجة وبعيدة عن انتهاء الصلاحية',
  'trust.cod': 'الدفع عند الاستلام',
  'trust.codSub': 'في جميع أنحاء الإمارات',
  'trust.cardOnly': 'الدفع بالبطاقة',
  'trust.cardOnlySub': 'دفع آمن بالبطاقة فقط',
  'trust.original': 'منتج أصلي',
  'trust.originalSub': 'من موزعين معتمدين فقط',

  // Cart
  'cart.title': 'سلة التسوق',
  'cart.empty': 'السلة فارغة',
  'cart.emptySub': 'أضف مشروباتك ووجباتك المفضلة للبدء!',
  'cart.checkout': 'إتمام الطلب',
  'cart.continue': 'متابعة التسوق',
  'cart.subtotal': 'المجموع الفرعي',
  'cart.discount': 'الخصم',
  'cart.shipping': 'الشحن',
  'cart.free': 'مجاني',
  'cart.total': 'الإجمالي',
  'cart.remove': 'إزالة',

  // Checkout
  'checkout.title': 'بيانات التوصيل',
  'checkout.fullName': 'الاسم الكامل',
  'checkout.namePlaceholder': 'مثال: علي رحمن',
  'checkout.phone': 'رقم الهاتف',
  'checkout.city': 'المدينة (الإمارة)',
  'checkout.address': 'العنوان بالكامل',
  'checkout.addressPlaceholder': 'المنطقة، الشارع، المبنى، رقم الشقة...',
  'checkout.payment': 'طريقة الدفع',
  'checkout.cod': 'الدفع عند الاستلام',
  'checkout.codSub': 'ادفع عند وصول طلبك',
  'checkout.online': 'الدفع الإلكتروني',
  'checkout.onlineSub': 'فيزا، ماستركارد، Apple Pay',
  'checkout.placeOrder': 'تأكيد الطلب',
  'checkout.proceedPay': 'المتابعة إلى الدفع',
  'checkout.processing': 'جارٍ المعالجة…',
  'checkout.emptyCart': 'سلتك فارغة',
  'checkout.fillAll': 'يرجى تعبئة جميع الحقول',
  'checkout.phoneHint': '9 أرقام بعد 971+، تبدأ بالرقم 5.',
  'checkout.arrivesIn': 'يصلك خلال',

  // الفئات التي تُدفع بالبطاقة فقط
  'checkout.cardOnlyTitle': 'يجب دفع هذا الطلب بالبطاقة',
  'checkout.cardOnlyBody': 'الدفع عند الاستلام غير متاح للمنتجات التالية:',
  'checkout.cardOnlyRemove': 'للدفع عند الاستلام، يرجى إزالة هذه المنتجات من السلة.',
  'checkout.cardOnlyError': 'الدفع بالبطاقة مطلوب لـ: {items}. يرجى إزالتها للدفع عند الاستلام.',
  'checkout.cardUnavailable': 'الدفع بالبطاقة غير متاح مؤقتاً، لذلك لا يمكن إتمام هذا الطلب الآن. يرجى إزالة المنتجات التي تُدفع بالبطاقة فقط أو التواصل معنا عبر واتساب.',
  'checkout.importedShipping': 'المنتجات المستوردة تُشحن من أمريكا أو بريطانيا أو أوروبا.',
  'category.cardOnly': 'الدفع بالبطاقة فقط — لا يوجد دفع عند الاستلام.',
  'category.cardOnlyShipping': 'تُشحن من أمريكا وبريطانيا وأوروبا — مدة التوصيل {estimate}.',
  'product.cardOnly': 'هذا المشروب يُدفع بالبطاقة فقط',
  'product.cardOnlyNote': 'الدفع عند الاستلام غير متاح لهذا المنتج. مدة التوصيل {estimate} لأنه يُشحن من أمريكا أو بريطانيا أو أوروبا.',

  // Order confirmation
  'success.received': 'تم استلام طلبك!',
  'success.paid': 'تم الدفع بنجاح!',
  'success.failed': 'فشلت عملية الدفع',
  'success.thanksCod': 'شكراً لاختيارك سناك هب! تم تسجيل طلبك بنجاح وسيتواصل معك فريقنا قريباً.',
  'success.thanksPaid': 'شكراً لشرائك! تمت عملية الدفع الإلكتروني بنجاح وسيتواصل معك فريقنا قريباً.',
  'success.failedBody': 'للأسف لم تتم عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.',
  'success.orderNumber': 'رقم طلبك',
  'success.keepNumber': 'احتفظ بهذا الرقم واذكره عند التواصل معنا بخصوص هذا الطلب.',
  'success.summary': 'ملخص الطلب',
  'success.estimatedDelivery': 'مدة التوصيل المتوقعة',
  'success.deliveryWindow': 'يوم إلى يومين',
  'success.deliveryNote': 'حسب منطقتك',
  'success.totalAmount': 'المبلغ الإجمالي',

  // My Orders
  'orders.title': 'طلباتي',
  'orders.sub': 'الطلبات التي تمت من هذا الجهاز. اذكر رقم الطلب عند التواصل معنا.',
  'orders.none': 'لا توجد طلبات بعد',
  'orders.noneSub': 'ستظهر طلباتك هنا. إذا كنت قد طلبت من هاتف أو جهاز آخر فلن تظهر على هذا الجهاز — تواصل معنا مع رقم الطلب وسنبحث عنه.',
  'orders.startShopping': 'ابدأ التسوق',
  'orders.viewReceipt': 'عرض الفاتورة',
  'orders.checking': 'جارٍ التحقق…',
  'orders.received': 'تم استلام الطلب',
  'orders.awaitingPayment': 'بانتظار الدفع',
  'orders.paidLabel': 'مدفوع',
  'orders.failedLabel': 'فشل الدفع',
  'orders.processing': 'قيد المعالجة',

  // Wishlist
  'wishlist.title': 'المفضلة',
  'wishlist.empty': 'قائمة المفضلة فارغة',

  // FAQ
  'faq.heading': 'الأسئلة',
  'faq.headingAccent': 'الشائعة',
  'faq.seeAll': 'عرض جميع الأسئلة',
  'faq.q1': 'كم تكلفة التوصيل؟',
  'faq.a1': 'مجاني عند شراء 3 كراتين أو أكثر. وأقل من ذلك التوصيل بـ 20 درهماً.',
  'faq.q2': 'ما هي طرق الدفع المتاحة؟',
  'faq.a2': 'الدفع عند الاستلام، أو بالبطاقة عبر Ziina — فيزا وماستركارد وApple Pay.',
  'faq.q3': 'هل المنتجات أصلية؟',
  'faq.a3': 'نعم، جميع منتجاتنا من موزعين معتمدين وشركاء رسميين للعلامات التجارية.',
  'faq.q4': 'ما مدى حداثة المنتجات؟',
  'faq.a4': 'جميع المنتجات لديها صلاحية سنة على الأقل، ولا نشحن أبداً بضاعة قاربت على الانتهاء.',
  'faq.q5': 'كيف هي أسعاركم؟',
  'faq.a5': 'أفضل الأسعار — نقدم سعراً أقل مما ستجده في أي مكان آخر، على كل كرتون.',

  // Footer
  'footer.tagline': 'وجهتك الأولى للمشروبات والوجبات في الإمارات. اشحن يومك بالطريقة الصحيحة.',
  'footer.about': 'من نحن',
  'footer.contact': 'اتصل بنا',
  'footer.faq': 'الأسئلة الشائعة',
  'footer.privacy': 'سياسة الخصوصية',
  'footer.terms': 'شروط البيع',
  'footer.rights': 'جميع الحقوق محفوظة.',
  'footer.delivering': 'نوصل الطاقة العالية في دبي وجميع أنحاء الإمارات.',

  // Search
  'search.placeholder': 'ابحث عن ريد بُل، مونستر، C4…',
  'search.prompt': 'اكتب للبحث في المتجر.',
  'search.loading': 'جارٍ تحميل المنتجات…',
  'search.noMatch': 'لا توجد منتجات تطابق «{q}».',
  'search.failed': 'تعذّر تحميل المنتجات. تحقق من اتصالك وحاول مرة أخرى.',
  'search.close': 'إغلاق',
  'search.clear': 'مسح البحث',

  // States
  'state.loading': 'جارٍ التحميل',
  'state.verifying': 'جارٍ التحقق من الدفع',
  'error.title': 'حدث خطأ ما',
  'error.body': 'تعذّر تحميل هذه الصفحة الآن. عادةً ما تكون المشكلة مؤقتة — يرجى المحاولة بعد قليل.',
  'error.tryAgain': 'حاول مرة أخرى',
  'error.backToShop': 'العودة إلى المتجر',
  'error.catalogTitle': 'المنتجات في استراحة قصيرة',
  'error.catalogBody': 'تعذّر الوصول إلى قائمة المنتجات الآن. انتظر قليلاً ثم حدّث الصفحة — سلتك محفوظة.',
  'error.refresh': 'تحديث',

  // Language switcher
  'lang.label': 'اللغة',
  'lang.switchTo': 'English',
};

export const TRANSLATIONS: Record<Locale, Dictionary> = { en, ar };

/**
 * Looks up a key and fills in {placeholders}. Falls back to English, then to
 * the key itself, so a missing string is visible in testing rather than
 * rendering as blank.
 */
export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const text = TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  if (!vars) return text;
  return Object.entries(vars).reduce(
    (out, [name, value]) => out.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
    text
  );
}
