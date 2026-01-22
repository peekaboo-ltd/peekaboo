import type { Language } from './i18n';

export const messages: Record<Language, Record<string, string>> = {
  en: {
    'home.language.label': 'Language',
    'home.language.en': 'English',
    'home.language.rw': 'Kinyarwanda',
    'home.language.fr': 'Français',

    'home.hero.badgeWithCount': 'Trusted by {count}+ customers in Kigali',
    'home.hero.badgeLoading': 'Trusted by customers in Kigali',
    'home.hero.title1': 'Fast & Reliable',
    'home.hero.title2': 'Package Delivery',
    'home.hero.subtitle':
      'Connect with trusted riders in your area for quick and secure package delivery services. Same-day delivery across Kigali.',
    'home.hero.learnMore': 'Learn more about us',

    'home.form.title': 'Send a package',
    'home.form.subtitle':
      "Enter your phone number and the recipient's to get matched with one of our riders.",
    'home.form.senderLabel': 'Your phone number',
    'home.form.senderPlaceholder': 'Enter your phone number',
    'home.form.recipientLabel': "Recipient's phone number",
    'home.form.recipientPlaceholder': "Enter the recipient's phone number",
    'home.form.continue': 'Continue',

    'home.stats.activeCustomers': 'Active customers',
    'home.stats.customersWithOrders': 'Customers with completed orders',

    'home.features.title': 'Why Choose Peekaboo?',
    'home.features.subtitle':
      'We provide reliable and efficient delivery services that help you connect with your customers faster.',
    'home.features.fastDelivery.title': 'Fast Delivery',
    'home.features.fastDelivery.desc':
      'Same-day delivery within Kigali. Get your packages delivered in hours, not days.',
    'home.features.secure.title': 'Secure & Safe',
    'home.features.secure.desc':
      'All our riders are verified and trained. Your packages are in trusted hands.',
    'home.features.tracking.title': 'Real-time Tracking',
    'home.features.tracking.desc':
      'Track your package in real-time from pickup to delivery. Stay informed every step.',
    'home.features.coverage.title': 'City-wide Coverage',
    'home.features.coverage.desc':
      'We cover all areas in Kigali. No location is too far for our dedicated riders.',

    'home.howItWorks.title': 'How It Works',
    'home.howItWorks.subtitle':
      'Sending a package is as easy as 1-2-3. Get started in minutes.',
    'home.howItWorks.step1.title': 'Enter Details',
    'home.howItWorks.step1.desc':
      "Provide your phone number and the recipient's number to get started.",
    'home.howItWorks.step2.title': 'Get Matched',
    'home.howItWorks.step2.desc':
      "We'll match you with a verified rider in your area instantly.",
    'home.howItWorks.step3.title': 'Track & Receive',
    'home.howItWorks.step3.desc':
      'Track your package in real-time until it reaches its destination.',

    'home.testimonials.title': 'What Our Customers Say',
    'home.testimonials.subtitle':
      "Don't just take our word for it. Here's what our customers have to say about Peekaboo.",
    'home.testimonials.t1.name': 'Marie Claire N.',
    'home.testimonials.t1.role': 'Business Owner',
    'home.testimonials.t1.content':
      'Peekaboo has transformed how I deliver products to my customers. Fast, reliable, and professional service every time.',
    'home.testimonials.t2.name': 'Jean Pierre M.',
    'home.testimonials.t2.role': 'E-commerce Seller',
    'home.testimonials.t2.content':
      "The real-time tracking feature gives my customers peace of mind. I've seen a significant increase in repeat orders.",
    'home.testimonials.t3.name': 'Alice K.',
    'home.testimonials.t3.role': 'Regular Customer',
    'home.testimonials.t3.content':
      "I use Peekaboo to send packages to my family. It's so convenient and the riders are always courteous.",

    'home.cta.title': 'Ready to Send Your First Package?',
    'home.cta.subtitle':
      'Join thousands of satisfied customers who trust Peekaboo for their delivery needs.',
    'home.cta.button': 'Get Started Now',

    // Track Order
    'trackOrder.title': 'Track Your Order',
    'trackOrder.subtitle': 'Enter your order ID to track the status of your delivery.',
    'trackOrder.orderIdLabel': 'Order ID',
    'trackOrder.orderIdPlaceholder': 'e.g., P123456',
    'trackOrder.searchButton': 'Track Order',
    'trackOrder.notFound': 'Order not found. Please check the order ID and try again.',
    'trackOrder.enterOrderId': 'Please enter an order ID.',
    'trackOrder.hint': 'Your order ID was provided when you placed your order. It starts with "P" followed by numbers.',

    // Footer
    'footer.description': 'Fast and reliable package delivery services in Kigali. Connecting senders with trusted riders.',
    'footer.quickLinks': 'Quick Links',
    'footer.aboutUs': 'About Us',
    'footer.signIn': 'Sign In',
    'footer.register': 'Register',
    'footer.trackOrder': 'Track Order',
    'footer.services': 'Services',
    'footer.sameDayDelivery': 'Same-Day Delivery',
    'footer.expressDelivery': 'Express Delivery',
    'footer.businessSolutions': 'Business Solutions',
    'footer.courierServices': 'Courier Services',
    'footer.contactUs': 'Contact Us',
    'footer.copyright': 'Peekaboo Ltd. All rights reserved.',
    'footer.language': 'Language',

    // Dashboard
    'dashboard.welcome': 'Welcome back, {name}',
    'dashboard.welcomeDefault': 'Welcome back, User',
    'dashboard.platformOverview': "Here's an overview of your platform",
    'dashboard.accountOverview': "Here's an overview of your account",
    'dashboard.searchPlaceholder': 'Search by Order ID...',
    'dashboard.failedToLoad': 'Failed to load dashboard',
    'dashboard.tryRefreshing': 'Please try refreshing the page or contact support if the problem persists.',
    'dashboard.ordersChart': 'Orders (Last 30 days)',
    'dashboard.revenueChart': 'Revenue (Last 30 days)',
  },
  fr: {
    'home.language.label': 'Langue',
    'home.language.en': 'English',
    'home.language.rw': 'Kinyarwanda',
    'home.language.fr': 'Français',

    'home.hero.badgeWithCount': 'Adopté par plus de {count} clients à Kigali',
    'home.hero.badgeLoading': 'Adopté par des clients à Kigali',
    'home.hero.title1': 'Rapide et fiable',
    'home.hero.title2': 'Livraison de colis',
    'home.hero.subtitle':
      'Mettez-vous en relation avec des coursiers de confiance dans votre zone pour une livraison rapide et sécurisée. Livraison le jour même à Kigali.',
    'home.hero.learnMore': 'En savoir plus sur nous',

    'home.form.title': 'Envoyer un colis',
    'home.form.subtitle':
      "Saisissez votre numéro de téléphone et celui du destinataire pour être mis en relation avec l'un de nos coursiers.",
    'home.form.senderLabel': 'Votre numéro de téléphone',
    'home.form.senderPlaceholder': 'Entrez votre numéro de téléphone',
    'home.form.recipientLabel': 'Numéro du destinataire',
    'home.form.recipientPlaceholder': 'Entrez le numéro du destinataire',
    'home.form.continue': 'Continuer',

    'home.stats.activeCustomers': 'Clients actifs',
    'home.stats.customersWithOrders': 'Clients avec des commandes terminées',

    'home.features.title': 'Pourquoi choisir Peekaboo ?',
    'home.features.subtitle':
      'Nous proposons un service de livraison fiable et efficace pour vous aider à atteindre vos clients plus rapidement.',
    'home.features.fastDelivery.title': 'Livraison rapide',
    'home.features.fastDelivery.desc':
      'Livraison le jour même à Kigali. Recevez vos colis en quelques heures, pas en quelques jours.',
    'home.features.secure.title': 'Sûr et sécurisé',
    'home.features.secure.desc':
      'Tous nos coursiers sont vérifiés et formés. Vos colis sont entre de bonnes mains.',
    'home.features.tracking.title': 'Suivi en temps réel',
    'home.features.tracking.desc':
      'Suivez votre colis en temps réel, du retrait à la livraison. Restez informé à chaque étape.',
    'home.features.coverage.title': 'Couverture de la ville',
    'home.features.coverage.desc':
      "Nous couvrons toutes les zones de Kigali. Aucun endroit n'est trop loin pour nos coursiers dédiés.",

    'home.howItWorks.title': 'Comment ça marche',
    'home.howItWorks.subtitle':
      'Envoyer un colis est aussi simple que 1-2-3. Commencez en quelques minutes.',
    'home.howItWorks.step1.title': 'Saisir les informations',
    'home.howItWorks.step1.desc':
      "Indiquez votre numéro de téléphone et celui du destinataire pour commencer.",
    'home.howItWorks.step2.title': 'Être mis en relation',
    'home.howItWorks.step2.desc':
      'Nous vous mettrons instantanément en relation avec un coursier vérifié dans votre zone.',
    'home.howItWorks.step3.title': 'Suivre et recevoir',
    'home.howItWorks.step3.desc':
      "Suivez votre colis en temps réel jusqu'à sa destination.",

    'home.testimonials.title': 'Ce que disent nos clients',
    'home.testimonials.subtitle':
      "Ne nous croyez pas sur parole. Voici ce que nos clients disent de Peekaboo.",
    'home.testimonials.t1.name': 'Marie Claire N.',
    'home.testimonials.t1.role': "Cheffe d'entreprise",
    'home.testimonials.t1.content':
      'Peekaboo a transformé ma façon de livrer mes produits à mes clients. Service rapide, fiable et professionnel à chaque fois.',
    'home.testimonials.t2.name': 'Jean Pierre M.',
    'home.testimonials.t2.role': 'Vendeur e-commerce',
    'home.testimonials.t2.content':
      "Le suivi en temps réel rassure mes clients. J'ai constaté une nette augmentation des commandes répétées.",
    'home.testimonials.t3.name': 'Alice K.',
    'home.testimonials.t3.role': 'Cliente régulière',
    'home.testimonials.t3.content':
      "J'utilise Peekaboo pour envoyer des colis à ma famille. C'est très pratique et les coursiers sont toujours courtois.",

    'home.cta.title': 'Prêt à envoyer votre premier colis ?',
    'home.cta.subtitle':
      'Rejoignez des milliers de clients satisfaits qui font confiance à Peekaboo pour leurs livraisons.',
    'home.cta.button': 'Commencer maintenant',

    // Track Order
    'trackOrder.title': 'Suivre votre commande',
    'trackOrder.subtitle': 'Entrez votre numéro de commande pour suivre le statut de votre livraison.',
    'trackOrder.orderIdLabel': 'Numéro de commande',
    'trackOrder.orderIdPlaceholder': 'ex: P123456',
    'trackOrder.searchButton': 'Suivre la commande',
    'trackOrder.notFound': 'Commande introuvable. Veuillez vérifier le numéro et réessayer.',
    'trackOrder.enterOrderId': 'Veuillez entrer un numéro de commande.',
    'trackOrder.hint': 'Votre numéro de commande vous a été fourni lors de la création de votre commande. Il commence par "P" suivi de chiffres.',

    // Footer
    'footer.description': 'Services de livraison de colis rapides et fiables à Kigali. Connecter les expéditeurs avec des coursiers de confiance.',
    'footer.quickLinks': 'Liens rapides',
    'footer.aboutUs': 'À propos',
    'footer.signIn': 'Connexion',
    'footer.register': "S'inscrire",
    'footer.trackOrder': 'Suivre commande',
    'footer.services': 'Services',
    'footer.sameDayDelivery': 'Livraison le jour même',
    'footer.expressDelivery': 'Livraison express',
    'footer.businessSolutions': 'Solutions entreprise',
    'footer.courierServices': 'Services de coursier',
    'footer.contactUs': 'Contactez-nous',
    'footer.copyright': 'Peekaboo Ltd. Tous droits réservés.',
    'footer.language': 'Langue',

    // Dashboard
    'dashboard.welcome': 'Bienvenue, {name}',
    'dashboard.welcomeDefault': 'Bienvenue, Utilisateur',
    'dashboard.platformOverview': "Voici un aperçu de votre plateforme",
    'dashboard.accountOverview': "Voici un aperçu de votre compte",
    'dashboard.searchPlaceholder': 'Rechercher par numéro de commande...',
    'dashboard.failedToLoad': 'Échec du chargement du tableau de bord',
    'dashboard.tryRefreshing': 'Veuillez actualiser la page ou contacter le support si le problème persiste.',
    'dashboard.ordersChart': 'Commandes (30 derniers jours)',
    'dashboard.revenueChart': 'Revenus (30 derniers jours)',
  },
  rw: {
    'home.language.label': 'Ururimi',
    'home.language.en': 'English',
    'home.language.rw': 'Kinyarwanda',
    'home.language.fr': 'Français',

    'home.hero.badgeWithCount': 'Yizewe n’abakiriya barenga {count} i Kigali',
    'home.hero.badgeLoading': 'Yizewe n’abakiriya i Kigali',
    'home.hero.title1': 'Byihuse kandi byizewe',
    'home.hero.title2': 'Gutanga paki',
    'home.hero.subtitle':
      'Huza n’abamotari bizerwa hafi yawe kugira ngo uhabwe serivisi yihuse kandi itekanye yo gutwara paki. Gutanga paki ku munsi umwe muri Kigali.',
    'home.hero.learnMore': 'Menya byinshi kuri twe',

    'home.form.title': 'Ohereza paki',
    'home.form.subtitle':
      'Injiza nimero yawe ya telefone n’iy’uwo ugiye koherereza kugira ngo uhuze n’umumotari wacu.',
    'home.form.senderLabel': 'Nimero yawe ya telefone',
    'home.form.senderPlaceholder': 'Injiza nimero yawe ya telefone',
    'home.form.recipientLabel': 'Nimero y’uwo ugiye koherereza',
    'home.form.recipientPlaceholder': 'Injiza nimero y’uwo ugiye koherereza',
    'home.form.continue': 'Komeza',

    'home.stats.activeCustomers': 'Abakiriya bakora',
    'home.stats.customersWithOrders': 'Abakiriya bafite paki zasoje',

    'home.features.title': 'Kuki wahitamo Peekaboo?',
    'home.features.subtitle':
      'Dutanga serivisi yo gutwara paki yizewe kandi inoze igufasha kugera ku bakiriya bawe vuba.',
    'home.features.fastDelivery.title': 'Gutanga vuba',
    'home.features.fastDelivery.desc':
      'Gutanga paki ku munsi umwe muri Kigali. Paki yawe igera aho igomba kugera mu masaha make, si iminsi.',
    'home.features.secure.title': 'Umutekano usesuye',
    'home.features.secure.desc':
      'Abamotari bacu bose baragenzuwe kandi baratojwe. Paki zawe ziba zifashwe neza.',
    'home.features.tracking.title': 'Gukurikirana mu gihe nyacyo',
    'home.features.tracking.desc':
      'Kurikirana paki yawe mu gihe nyacyo kuva itangiriye gutwarwa kugeza igeze. Menya uko bigenda buri gihe.',
    'home.features.coverage.title': 'Dukorera umujyi wose',
    'home.features.coverage.desc':
      'Dukorera hose muri Kigali. Nta hantu kure ku bamotari bacu.',

    'home.howItWorks.title': 'Uko bikora',
    'home.howItWorks.subtitle':
      'Kohereza paki biroroshye nk’uko 1-2-3. Tangira mu minota mike.',
    'home.howItWorks.step1.title': 'Injiza amakuru',
    'home.howItWorks.step1.desc':
      'Tanga nimero ya telefone yawe n’iy’uwo ugiye koherereza kugira ngo utangire.',
    'home.howItWorks.step2.title': 'Huza n’umumotari',
    'home.howItWorks.step2.desc':
      'Tuzahita tuguhuza n’umumotari wemejwe uri hafi yawe.',
    'home.howItWorks.step3.title': 'Kurikirana kandi wakire',
    'home.howItWorks.step3.desc':
      'Kurikirana paki yawe mu gihe nyacyo kugeza igeze aho igomba kugera.',

    'home.testimonials.title': 'Ibyo abakiriya bavuga',
    'home.testimonials.subtitle':
      'Ntukadufate ku ijambo. Dore ibyo abakiriya bacu bavuga kuri Peekaboo.',
    'home.testimonials.t1.name': 'Marie Claire N.',
    'home.testimonials.t1.role': 'Nyir’ubucuruzi',
    'home.testimonials.t1.content':
      'Peekaboo yahinduye uko ngeza ibicuruzwa ku bakiriya banjye. Serivisi yihuse, yizewe kandi inoze buri gihe.',
    'home.testimonials.t2.name': 'Jean Pierre M.',
    'home.testimonials.t2.role': 'Umucuruzi wa e-commerce',
    'home.testimonials.t2.content':
      'Gukurikirana mu gihe nyacyo bituma abakiriya banjye bagira amahoro. Nabonye kongera kwa “repeat orders”.',
    'home.testimonials.t3.name': 'Alice K.',
    'home.testimonials.t3.role': 'Umukiriya usanzwe',
    'home.testimonials.t3.content':
      'Nkoresha Peekaboo kohereza paki ku muryango wanjye. Biroroshye cyane kandi abamotari bahora bafite ikinyabupfura.',

    'home.cta.title': 'Witeguye kohereza paki yawe ya mbere?',
    'home.cta.subtitle':
    "Injira mu bihumbi by'abakiriya banyuzwe bizerwa Peekaboo ku gutwara paki zabo.",
    'home.cta.button': 'Tangira nonaha',

    // Track Order
    'trackOrder.title': 'Kurikirana paki yawe',
    'trackOrder.subtitle': 'Injiza nomero ya paki yawe kugira ngo umenye aho igeze.',
    'trackOrder.orderIdLabel': 'Nomero ya paki',
    'trackOrder.orderIdPlaceholder': 'urugero: P123456',
    'trackOrder.searchButton': 'Kurikirana paki',
    'trackOrder.notFound': 'Paki ntabwo yabonetse. Reba neza nomero ugerageze ukundi.',
    'trackOrder.enterOrderId': 'Injiza nomero ya paki.',
    'trackOrder.hint': 'Nomero ya paki yawe wayihawe igihe woherezaga paki. Itangirira ku "P" hakurikiraho imibare.',

    // Footer
    'footer.description': 'Serivisi yo gutwara paki yihuse kandi yizewe muri Kigali. Guhuza abohereza n\'abamotari bizerwa.',
    'footer.quickLinks': 'Aho wagana vuba',
    'footer.aboutUs': 'Abo turi bo',
    'footer.signIn': 'Injira',
    'footer.register': 'Iyandikishe',
    'footer.trackOrder': 'Kurikirana paki',
    'footer.services': 'Serivisi',
    'footer.sameDayDelivery': 'Gutanga ku munsi umwe',
    'footer.expressDelivery': 'Gutanga vuba cyane',
    'footer.businessSolutions': 'Serivisi z\'ubucuruzi',
    'footer.courierServices': 'Serivisi z\'abamotari',
    'footer.contactUs': 'Twandikire',
    'footer.copyright': 'Peekaboo Ltd. Uburenganzira bwose burabitswe.',
    'footer.language': 'Ururimi',

    // Dashboard
    'dashboard.welcome': 'Murakaza neza, {name}',
    'dashboard.welcomeDefault': 'Murakaza neza, Umukoresha',
    'dashboard.platformOverview': "Dore incamake y'urubuga rwawe",
    'dashboard.accountOverview': "Dore incamake y'konti yawe",
    'dashboard.searchPlaceholder': 'Shakisha ukoresheje nomero ya paki...',
    'dashboard.failedToLoad': 'Byanze gufungura dashboard',
    'dashboard.tryRefreshing': 'Gerageza kongera gufungura paji cyangwa twandikire niba ikibazo gikomeje.',
    'dashboard.ordersChart': 'Paki (Iminsi 30 ishize)',
    'dashboard.revenueChart': 'Amafaranga yinjiye (Iminsi 30 ishize)',
  },
};

