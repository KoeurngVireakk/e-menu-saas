export const supportedLocales = [
  { code: "en", label: "English" },
  { code: "km", label: "ខ្មែរ" },
];

const localeKey = "emenu_locale";

const dictionary = {
  en: {
    addToCart: "Add to cart",
    addedToCart: "added",
    cart: "Cart",
    cartEmpty: "Cart is empty",
    checkout: "Checkout",
    chooseProduct: "Choose a product to start an order.",
    customerName: "Customer name",
    customerPhone: "Phone",
    dineIn: "Dine in",
    each: "each",
    emptyCartMessage: "Return to the menu and choose a product.",
    featured: "Featured",
    free: "Free",
    freshMenu: "Fresh menu, ready to order.",
    isRequired: "is required",
    itemTypes: "item types",
    loadingMenu: "Loading menu...",
    mainBranch: "Main branch",
    menu: "Menu",
    noDescription: "No description",
    noImage: "No image",
    noProductsFound: "No products found",
    optional: "Optional",
    orderNote: "Order note",
    orderSubmitted: "Order submitted",
    orderType: "Order type",
    offlineCached: "You are offline. Showing the last saved menu; prices and availability may have changed.",
    offlineMissing: "You are offline and this menu has not been saved on this device yet.",
    offlineRefresh: "You are offline. Connect to the internet to refresh the menu and submit orders.",
    offlineSubmit: "Connect to the internet before submitting your order.",
    offlineTitle: "You are offline",
    popularNow: "Popular right now",
    products: "Products",
    quantity: "Quantity",
    remove: "Remove",
    required: "Required",
    reviewCart: "Please review your cart.",
    searchMenu: "Search menu",
    submitOrder: "Submit order",
    submitting: "Submitting...",
    takeaway: "Takeaway",
    total: "Total",
    tryAnotherSearch: "Try another category or search term.",
  },
  km: {
    addToCart: "បន្ថែមទៅកន្ត្រក",
    addedToCart: "បានបន្ថែម",
    cart: "កន្ត្រក",
    cartEmpty: "កន្ត្រកទទេ",
    checkout: "ពិនិត្យការបញ្ជាទិញ",
    chooseProduct: "ជ្រើសរើសម្ហូបដើម្បីចាប់ផ្តើមបញ្ជាទិញ។",
    customerName: "ឈ្មោះអតិថិជន",
    customerPhone: "លេខទូរស័ព្ទ",
    dineIn: "ញាំនៅហាង",
    each: "ក្នុងមួយមុខ",
    emptyCartMessage: "ត្រឡប់ទៅម៉ឺនុយ ហើយជ្រើសរើសម្ហូប។",
    featured: "ណែនាំ",
    free: "ឥតគិតថ្លៃ",
    freshMenu: "ម៉ឺនុយថ្មីៗ រួចរាល់សម្រាប់បញ្ជាទិញ។",
    isRequired: "ត្រូវតែជ្រើសរើស",
    itemTypes: "ប្រភេទមុខទំនិញ",
    loadingMenu: "កំពុងផ្ទុកម៉ឺនុយ...",
    mainBranch: "សាខាគោល",
    menu: "ម៉ឺនុយ",
    noDescription: "មិនមានការពិពណ៌នា",
    noImage: "មិនមានរូបភាព",
    noProductsFound: "រកមិនឃើញមុខម្ហូប",
    optional: "មិនចាំបាច់",
    orderNote: "កំណត់ចំណាំការបញ្ជាទិញ",
    orderSubmitted: "បានដាក់ការបញ្ជាទិញ",
    orderType: "ប្រភេទការបញ្ជាទិញ",
    offlineCached: "អ្នកកំពុងគ្មានអ៊ីនធឺណិត។ កំពុងបង្ហាញម៉ឺនុយដែលបានរក្សាទុកចុងក្រោយ តម្លៃ និងភាពអាចរកបានអាចផ្លាស់ប្តូរ។",
    offlineMissing: "អ្នកកំពុងគ្មានអ៊ីនធឺណិត ហើយម៉ឺនុយនេះមិនទាន់បានរក្សាទុកលើឧបករណ៍នេះទេ។",
    offlineRefresh: "អ្នកកំពុងគ្មានអ៊ីនធឺណិត។ ភ្ជាប់អ៊ីនធឺណិតដើម្បីធ្វើបច្ចុប្បន្នភាពម៉ឺនុយ និងដាក់ការបញ្ជាទិញ។",
    offlineSubmit: "សូមភ្ជាប់អ៊ីនធឺណិត មុនពេលដាក់ការបញ្ជាទិញ។",
    offlineTitle: "អ្នកកំពុងគ្មានអ៊ីនធឺណិត",
    popularNow: "ពេញនិយមឥឡូវនេះ",
    products: "មុខម្ហូប",
    quantity: "ចំនួន",
    remove: "លុបចេញ",
    required: "ចាំបាច់",
    reviewCart: "សូមពិនិត្យកន្ត្រករបស់អ្នក។",
    searchMenu: "ស្វែងរកម៉ឺនុយ",
    submitOrder: "ដាក់ការបញ្ជាទិញ",
    submitting: "កំពុងដាក់...",
    takeaway: "ខ្ចប់យកទៅ",
    total: "សរុប",
    tryAnotherSearch: "សូមសាកល្បងប្រភេទផ្សេង ឬពាក្យស្វែងរកផ្សេង។",
  },
};

export function normalizeLocale(locale) {
  return supportedLocales.some((item) => item.code === locale) ? locale : "en";
}

export function getPreferredLocale() {
  return normalizeLocale(localStorage.getItem(localeKey) || navigator.language?.slice(0, 2));
}

export function setPreferredLocale(locale) {
  const normalized = normalizeLocale(locale);
  localStorage.setItem(localeKey, normalized);

  return normalized;
}

export function t(locale, key) {
  const normalized = normalizeLocale(locale);

  return dictionary[normalized]?.[key] || dictionary.en[key] || key;
}
