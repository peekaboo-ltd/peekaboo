import type { Language } from './i18n';

export const seoMessages: Record<Language, Record<string, string>> = {
  en: {
    'seo.home.title': 'Peekaboo | Smart Delivery & Fleet Management Platform',
    'seo.home.description':
      'Peekaboo helps businesses manage deliveries, track riders in real time, automate assignments, and optimize fleet operations from one dashboard.',
    'seo.authLogin.title': 'Login | Peekaboo',
    'seo.authLogin.description':
      'Sign in to your Peekaboo account to manage deliveries, teams, and logistics operations in one place.',
    'seo.authRegister.title': 'Create Account | Peekaboo',
    'seo.authRegister.description':
      'Create a Peekaboo account to place deliveries, track orders, and manage logistics operations.',
    'seo.authCallback.title': 'Authenticating | Peekaboo',
    'seo.authCallback.description': 'Securely signing you into Peekaboo.',
    'seo.authForgot.title': 'Forgot Password | Peekaboo',
    'seo.authForgot.description': 'Reset your Peekaboo account password securely.',
    'seo.authReset.title': 'Reset Password | Peekaboo',
    'seo.authReset.description': 'Create a new secure password for your Peekaboo account.',
    'seo.authComplete.title': 'Complete Account Setup | Peekaboo',
    'seo.authComplete.description':
      'Finish setting up your Peekaboo account to start managing operations.',
    'seo.onboardingOrganization.title': 'Organization Onboarding | Peekaboo',
    'seo.onboardingOrganization.description':
      'Set up your organization profile and delivery workflow in Peekaboo.',
    'seo.onboardingAdmin.title': 'Admin Onboarding | Peekaboo',
    'seo.onboardingAdmin.description':
      'Configure admin access and permissions for your Peekaboo workspace.',
    'seo.onboardingUsers.title': 'User Management Onboarding | Peekaboo',
    'seo.onboardingUsers.description':
      'Invite and organize team members during Peekaboo onboarding.',
    'seo.onboardingComplete.title': 'Onboarding Complete | Peekaboo',
    'seo.onboardingComplete.description':
      'Your Peekaboo onboarding is complete and your workspace is ready.',
    'seo.about.title': 'About Peekaboo | Delivery Technology Built for Growth',
    'seo.about.description':
      'Learn about Peekaboo’s mission to simplify logistics through smarter dispatching, live tracking, and actionable delivery insights.',
    'seo.orderFees.title': 'Order Fees | Peekaboo',
    'seo.orderFees.description':
      'Explore transparent order fee structure and delivery pricing on Peekaboo.',
    'seo.services.title': 'Services | Peekaboo',
    'seo.services.description':
      'Discover Peekaboo services including delivery management, rider tracking, route planning, and business analytics.',
    'seo.serviceDetails.title': 'Service Details | Peekaboo',
    'seo.serviceDetails.description':
      'Explore detailed pricing, features, and delivery plan information for Peekaboo business services.',
    'seo.contact.title': 'Contact Us | Peekaboo',
    'seo.contact.description':
      'Get in touch with Peekaboo for product support, onboarding, and partnership inquiries.',
    'seo.legalHub.title': 'Legal | Peekaboo',
    'seo.legalHub.description':
      'Peekaboo legal hub: terms and conditions, refund policy, and cancellation policy.',
    'seo.legalTerms.title': 'Terms & Conditions | Peekaboo',
    'seo.legalTerms.description':
      'Read Peekaboo’s terms and conditions for using our delivery and logistics services.',
    'seo.legalRefund.title': 'Refund Policy | Peekaboo',
    'seo.legalRefund.description': 'Peekaboo refund policy for deliveries and related services.',
    'seo.legalCancellation.title': 'Cancellation Policy | Peekaboo',
    'seo.legalCancellation.description': 'Peekaboo cancellation policy for orders and services.',
    'seo.track.title': 'Track Order | Peekaboo',
    'seo.track.description':
      'Track your delivery status in real time with Peekaboo public order tracking.',
    'seo.publicOrder.title': 'Public Order Details | Peekaboo',
    'seo.publicOrder.description':
      'View public details and current status of your delivery order.',
    'seo.paymentPending.title': 'Payment Pending | Peekaboo',
    'seo.paymentPending.description': 'Confirming your order payment securely.',
    'seo.paymentSuccess.title': 'Payment Successful | Peekaboo',
    'seo.paymentSuccess.description':
      'Your order payment has been processed successfully on Peekaboo.',
    'seo.orderTracking.title': 'Live Order Tracking | Peekaboo',
    'seo.orderTracking.description':
      'Follow your order progress and estimated delivery updates in real time.',
    'seo.dashboard.title': 'Dashboard | Peekaboo',
    'seo.dashboard.description':
      'Monitor key delivery metrics, fleet activity, and operational performance.',
    'seo.orders.title': 'Orders | Peekaboo',
    'seo.orders.description':
      'Manage, filter, and track all delivery orders from a single workspace.',
    'seo.orderDetail.title': 'Order Tracking | Peekaboo',
    'seo.orderDetail.description':
      'View detailed status and location updates for a specific order.',
    'seo.batches.title': 'Batches | Peekaboo',
    'seo.batches.description':
      'Create and manage batched deliveries for efficient dispatching.',
    'seo.batchDetail.title': 'Batch Details | Peekaboo',
    'seo.batchDetail.description':
      'Review orders, riders, and progress for a delivery batch.',
    'seo.batchPreview.title': 'Batch Preview | Peekaboo',
    'seo.batchPreview.description':
      'Preview batch assignment and route details before publishing.',
    'seo.assignments.title': 'Order Assignments | Peekaboo',
    'seo.assignments.description':
      'Manage rider assignments and monitor assignment progress.',
    'seo.assignmentDetail.title': 'Assignment Details | Peekaboo',
    'seo.assignmentDetail.description':
      'View complete information for a specific order assignment.',
    'seo.users.title': 'Users | Peekaboo',
    'seo.users.description':
      'Manage users, roles, and access permissions across your organization.',
    'seo.usersTracking.title': 'User Tracking | Peekaboo',
    'seo.usersTracking.description':
      'Track live user and rider locations to improve operations.',
    'seo.userLocationHistory.title': 'User Location History | Peekaboo',
    'seo.userLocationHistory.description':
      'Review historical movement and location records for a user.',
    'seo.userDetail.title': 'User Details | Peekaboo',
    'seo.userDetail.description':
      'View profile, role, and operational details of a team member.',
    'seo.riderManagement.title': 'Rider Management | Peekaboo',
    'seo.riderManagement.description':
      'Admin dashboard for rider deliveries, earnings, reliability, and activity ranking.',
    'seo.userProfile.title': 'My Profile | Peekaboo',
    'seo.userProfile.description':
      'Update personal details, preferences, and account settings.',
    'seo.payments.title': 'Payments | Peekaboo',
    'seo.payments.description':
      'Track transactions, payment statuses, and financial records.',
    'seo.paymentDetail.title': 'Payment Details | Peekaboo',
    'seo.paymentDetail.description':
      'View complete payment details for a selected transaction.',
    'seo.billingPayments.title': 'Billing & Payments | Peekaboo',
    'seo.billingPayments.description':
      'Track delivery billings, payment status, and organization plan costs.',
    'seo.billingReport.title': 'Billing Report | Peekaboo',
    'seo.billingReport.description':
      'Generate and send business billing and delivery reports.',
    'seo.organizations.title': 'Organizations | Peekaboo',
    'seo.organizations.description':
      'Manage client organizations and workspace configurations.',
    'seo.organizationManage.title': 'Manage Organization | Peekaboo',
    'seo.organizationManage.description':
      'Update organization details, billing, and operational settings.',
    'seo.organizationInvite.title': 'Invite Organization | Peekaboo',
    'seo.organizationInvite.description':
      'Invite a new organization to your Peekaboo platform instance.',
    'seo.organizationSettings.title': 'Organization Settings | Peekaboo',
    'seo.organizationSettings.description':
      'Configure organization-level preferences and profile settings.',
    'seo.businessPlans.title': 'Business Plans | Peekaboo',
    'seo.businessPlans.description':
      'Manage subscription plans, features, and pricing models.',
    'seo.businessPlanCreate.title': 'Create Business Plan | Peekaboo',
    'seo.businessPlanCreate.description':
      'Create a new business plan with custom pricing and capabilities.',
    'seo.businessPlanManage.title': 'Manage Business Plan | Peekaboo',
    'seo.businessPlanManage.description':
      'Edit and optimize an existing business plan configuration.',
    'seo.unauthorized.title': 'Unauthorized Access | Peekaboo',
    'seo.unauthorized.description': 'You do not have permission to access this page.',
    'seo.notFound.title': 'Page Not Found | Peekaboo',
    'seo.notFound.description':
      'The page you are looking for does not exist or has been moved.',
  },
  fr: {
    'seo.home.title': 'Peekaboo | Livraison intelligente et gestion de flotte',
    'seo.home.description':
      'Peekaboo aide les entreprises à gérer leurs livraisons, suivre les coursiers en temps réel, automatiser les affectations et optimiser leurs opérations depuis un seul tableau de bord.',
    'seo.authLogin.title': 'Connexion | Peekaboo',
    'seo.authLogin.description':
      'Connectez-vous à votre compte Peekaboo pour gérer vos livraisons, vos équipes et vos opérations logistiques en un seul endroit.',
    'seo.authRegister.title': 'Créer un compte | Peekaboo',
    'seo.authRegister.description':
      'Créez un compte Peekaboo pour passer des commandes, suivre vos livraisons et piloter vos opérations logistiques.',
    'seo.authCallback.title': 'Authentification | Peekaboo',
    'seo.authCallback.description': 'Connexion sécurisée à votre compte Peekaboo en cours.',
    'seo.authForgot.title': 'Mot de passe oublié | Peekaboo',
    'seo.authForgot.description':
      'Réinitialisez le mot de passe de votre compte Peekaboo en toute sécurité.',
    'seo.authReset.title': 'Réinitialiser le mot de passe | Peekaboo',
    'seo.authReset.description':
      'Créez un nouveau mot de passe sécurisé pour votre compte Peekaboo.',
    'seo.authComplete.title': 'Finaliser la création du compte | Peekaboo',
    'seo.authComplete.description':
      'Terminez la configuration de votre compte Peekaboo pour commencer à gérer vos opérations.',
    'seo.onboardingOrganization.title': 'Intégration de l’organisation | Peekaboo',
    'seo.onboardingOrganization.description':
      'Configurez le profil de votre organisation et votre flux de livraison sur Peekaboo.',
    'seo.onboardingAdmin.title': 'Intégration administrateur | Peekaboo',
    'seo.onboardingAdmin.description':
      'Configurez les accès administrateur et les autorisations de votre espace Peekaboo.',
    'seo.onboardingUsers.title': 'Intégration des utilisateurs | Peekaboo',
    'seo.onboardingUsers.description':
      'Invitez et organisez les membres de votre équipe pendant l’intégration Peekaboo.',
    'seo.onboardingComplete.title': 'Intégration terminée | Peekaboo',
    'seo.onboardingComplete.description':
      'Votre intégration Peekaboo est terminée et votre espace de travail est prêt.',
    'seo.about.title': 'À propos de Peekaboo | La technologie de livraison au service de la croissance',
    'seo.about.description':
      'Découvrez la mission de Peekaboo : simplifier la logistique grâce à une répartition intelligente, un suivi en direct et des indicateurs de livraison exploitables.',
    'seo.orderFees.title': 'Frais de commande | Peekaboo',
    'seo.orderFees.description':
      'Consultez la structure transparente des frais de commande et la tarification des livraisons sur Peekaboo.',
    'seo.services.title': 'Services | Peekaboo',
    'seo.services.description':
      'Découvrez les services Peekaboo : gestion des livraisons, suivi des coursiers, planification d’itinéraires et analyses pour entreprises.',
    'seo.serviceDetails.title': 'Détails du service | Peekaboo',
    'seo.serviceDetails.description':
      'Explorez les tarifs, fonctionnalités et formules de livraison détaillés des services professionnels Peekaboo.',
    'seo.contact.title': 'Nous contacter | Peekaboo',
    'seo.contact.description':
      'Contactez Peekaboo pour l’assistance produit, l’intégration ou les demandes de partenariat.',
    'seo.legalHub.title': 'Mentions légales | Peekaboo',
    'seo.legalHub.description':
      'Espace juridique Peekaboo : conditions générales, politique de remboursement et politique d’annulation.',
    'seo.legalTerms.title': 'Conditions générales | Peekaboo',
    'seo.legalTerms.description':
      'Consultez les conditions générales de Peekaboo pour l’utilisation de nos services de livraison et de logistique.',
    'seo.legalRefund.title': 'Politique de remboursement | Peekaboo',
    'seo.legalRefund.description':
      'Politique de remboursement Peekaboo pour les livraisons et services associés.',
    'seo.legalCancellation.title': 'Politique d’annulation | Peekaboo',
    'seo.legalCancellation.description':
      'Politique d’annulation Peekaboo pour les commandes et services.',
    'seo.track.title': 'Suivre une commande | Peekaboo',
    'seo.track.description':
      'Suivez l’état de votre livraison en temps réel grâce au suivi public des commandes Peekaboo.',
    'seo.publicOrder.title': 'Détails de la commande | Peekaboo',
    'seo.publicOrder.description':
      'Consultez les informations publiques et l’état actuel de votre commande de livraison.',
    'seo.paymentPending.title': 'Paiement en attente | Peekaboo',
    'seo.paymentPending.description':
      'Confirmation sécurisée du paiement de votre commande en cours.',
    'seo.paymentSuccess.title': 'Paiement réussi | Peekaboo',
    'seo.paymentSuccess.description':
      'Le paiement de votre commande a été traité avec succès sur Peekaboo.',
    'seo.orderTracking.title': 'Suivi en direct de la commande | Peekaboo',
    'seo.orderTracking.description':
      'Suivez l’avancement de votre commande et les mises à jour estimées de livraison en temps réel.',
    'seo.dashboard.title': 'Tableau de bord | Peekaboo',
    'seo.dashboard.description':
      'Suivez les indicateurs clés de livraison, l’activité de la flotte et les performances opérationnelles.',
    'seo.orders.title': 'Commandes | Peekaboo',
    'seo.orders.description':
      'Gérez, filtrez et suivez toutes vos commandes de livraison depuis un seul espace de travail.',
    'seo.orderDetail.title': 'Suivi de commande | Peekaboo',
    'seo.orderDetail.description':
      'Consultez l’état détaillé et les mises à jour de localisation d’une commande spécifique.',
    'seo.batches.title': 'Lots de livraison | Peekaboo',
    'seo.batches.description':
      'Créez et gérez des lots de livraison pour une répartition efficace.',
    'seo.batchDetail.title': 'Détails du lot | Peekaboo',
    'seo.batchDetail.description':
      'Consultez les commandes, coursiers et l’avancement d’un lot de livraison.',
    'seo.batchPreview.title': 'Aperçu du lot | Peekaboo',
    'seo.batchPreview.description':
      'Prévisualisez l’affectation et les itinéraires du lot avant publication.',
    'seo.assignments.title': 'Affectations de commandes | Peekaboo',
    'seo.assignments.description':
      'Gérez les affectations aux coursiers et suivez leur progression.',
    'seo.assignmentDetail.title': 'Détails de l’affectation | Peekaboo',
    'seo.assignmentDetail.description':
      'Consultez les informations complètes d’une affectation de commande spécifique.',
    'seo.users.title': 'Utilisateurs | Peekaboo',
    'seo.users.description':
      'Gérez les utilisateurs, les rôles et les autorisations d’accès au sein de votre organisation.',
    'seo.usersTracking.title': 'Suivi des utilisateurs | Peekaboo',
    'seo.usersTracking.description':
      'Suivez en direct la position des utilisateurs et des coursiers pour optimiser vos opérations.',
    'seo.userLocationHistory.title': 'Historique de localisation | Peekaboo',
    'seo.userLocationHistory.description':
      'Consultez l’historique des déplacements et des positions d’un utilisateur.',
    'seo.userDetail.title': 'Détails de l’utilisateur | Peekaboo',
    'seo.userDetail.description':
      'Consultez le profil, le rôle et les informations opérationnelles d’un membre de l’équipe.',
    'seo.riderManagement.title': 'Gestion des coursiers | Peekaboo',
    'seo.riderManagement.description':
      'Tableau de bord administrateur pour les livraisons, revenus, fiabilité et classement d’activité des coursiers.',
    'seo.userProfile.title': 'Mon profil | Peekaboo',
    'seo.userProfile.description':
      'Mettez à jour vos informations personnelles, préférences et paramètres de compte.',
    'seo.payments.title': 'Paiements | Peekaboo',
    'seo.payments.description':
      'Suivez les transactions, les statuts de paiement et les enregistrements financiers.',
    'seo.paymentDetail.title': 'Détails du paiement | Peekaboo',
    'seo.paymentDetail.description':
      'Consultez les informations complètes d’une transaction sélectionnée.',
    'seo.billingPayments.title': 'Facturation et paiements | Peekaboo',
    'seo.billingPayments.description':
      'Suivez la facturation des livraisons, les statuts de paiement et les coûts du forfait organisation.',
    'seo.billingReport.title': 'Rapport de facturation | Peekaboo',
    'seo.billingReport.description':
      'Générez et envoyez des rapports de facturation et de livraison pour votre entreprise.',
    'seo.organizations.title': 'Organisations | Peekaboo',
    'seo.organizations.description':
      'Gérez les organisations clientes et les configurations des espaces de travail.',
    'seo.organizationManage.title': 'Gérer l’organisation | Peekaboo',
    'seo.organizationManage.description':
      'Mettez à jour les informations, la facturation et les paramètres opérationnels de l’organisation.',
    'seo.organizationInvite.title': 'Inviter une organisation | Peekaboo',
    'seo.organizationInvite.description':
      'Invitez une nouvelle organisation sur votre instance de la plateforme Peekaboo.',
    'seo.organizationSettings.title': 'Paramètres de l’organisation | Peekaboo',
    'seo.organizationSettings.description':
      'Configurez les préférences et le profil au niveau de l’organisation.',
    'seo.businessPlans.title': 'Forfaits professionnels | Peekaboo',
    'seo.businessPlans.description':
      'Gérez les forfaits d’abonnement, les fonctionnalités et les modèles tarifaires.',
    'seo.businessPlanCreate.title': 'Créer un forfait professionnel | Peekaboo',
    'seo.businessPlanCreate.description':
      'Créez un nouveau forfait professionnel avec tarification et capacités personnalisées.',
    'seo.businessPlanManage.title': 'Gérer le forfait professionnel | Peekaboo',
    'seo.businessPlanManage.description':
      'Modifiez et optimisez la configuration d’un forfait professionnel existant.',
    'seo.unauthorized.title': 'Accès non autorisé | Peekaboo',
    'seo.unauthorized.description': 'Vous n’avez pas l’autorisation d’accéder à cette page.',
    'seo.notFound.title': 'Page introuvable | Peekaboo',
    'seo.notFound.description':
      'La page que vous recherchez n’existe pas ou a été déplacée.',
  },
  rw: {
    'seo.home.title': 'Peekaboo | Gutwara neza no gucunga imodoka z’itwara',
    'seo.home.description':
      'Peekaboo ifasha ibigo gucunga gutwara, gukurikirana abatwara mu gihe nyacyo, gukora imirimo mu buryo bwikora no kunoza imikorere y’imodoka z’itwara mu gikoresho kimwe.',
    'seo.authLogin.title': 'Kwinjira | Peekaboo',
    'seo.authLogin.description':
      'Injira kuri konti yawe ya Peekaboo kugira ngo ucunge gutwara, amakipe n’imikorere y’ubwikorezi ahantu hamwe.',
    'seo.authRegister.title': 'Fungura konti | Peekaboo',
    'seo.authRegister.description':
      'Fungura konti ya Peekaboo kugira ngo utange ibicuruzwa, ukurikirane amabwiriza kandi ucunge imikorere y’ubwikorezi.',
    'seo.authCallback.title': 'Kwemeza umwirondoro | Peekaboo',
    'seo.authCallback.description': 'Turi kwinjiza mu buryo bwizewe kuri konti yawe ya Peekaboo.',
    'seo.authForgot.title': 'Wibagiwe ijambo ry’ibanga | Peekaboo',
    'seo.authForgot.description':
      'Subiza ijambo ry’ibanga rya konti yawe ya Peekaboo mu buryo bwizewe.',
    'seo.authReset.title': 'Subiza ijambo ry’ibanga | Peekaboo',
    'seo.authReset.description':
      'Kora ijambo ry’ibanga rishya ryizewe kuri konti yawe ya Peekaboo.',
    'seo.authComplete.title': 'Soza gushyiraho konti | Peekaboo',
    'seo.authComplete.description':
      'Soza gushyiraho konti yawe ya Peekaboo kugira ngo utangire gucunga imikorere.',
    'seo.onboardingOrganization.title': 'Gutangiza ishyirahamwe | Peekaboo',
    'seo.onboardingOrganization.description':
      'Shyiraho umwirondoro w’ishyirahamwe ryawe n’inzira y’itwara kuri Peekaboo.',
    'seo.onboardingAdmin.title': 'Gutangiza umuyobozi | Peekaboo',
    'seo.onboardingAdmin.description':
      'Shyiraho uburenganzira bw’umuyobozi n’ibyemezo by’ahantu hawe h’akazi ha Peekaboo.',
    'seo.onboardingUsers.title': 'Gutangiza abakoresha | Peekaboo',
    'seo.onboardingUsers.description':
      'Tumira kandi utegure abanyamuryango b’itsinda mu gihe cyo gutangiza Peekaboo.',
    'seo.onboardingComplete.title': 'Gutangiza byarangiye | Peekaboo',
    'seo.onboardingComplete.description':
      'Gutangiza Peekaboo byarangiye kandi ahantu hawe h’akazi hiteguye.',
    'seo.about.title': 'Ibyerekeye Peekaboo | Ikoranabuhanga ry’itwara ryubatswe ku iterambere',
    'seo.about.description':
      'Menya intego ya Peekaboo yo koroshya ubwikorezi binyuze mu gutanga imirimo neza, gukurikirana mu gihe nyacyo no gutanga amakuru y’itwara ashobora gukoreshwa.',
    'seo.orderFees.title': 'Amafaranga y’itegeko | Peekaboo',
    'seo.orderFees.description':
      'Reba uburyo bw’amafaranga y’itegeko n’igiciro cy’itwara kuri Peekaboo mu buryo bw’umurongo.',
    'seo.services.title': 'Serivisi | Peekaboo',
    'seo.services.description':
      'Menya serivisi za Peekaboo harimo gucunga itwara, gukurikirana abatwara, gutegura inzira n’isesengura ry’ibigo.',
    'seo.serviceDetails.title': 'Ibisobanuro bya serivisi | Peekaboo',
    'seo.serviceDetails.description':
      'Reba ibiciro, ibiranga n’amakuru y’amasezerano y’itwara ya serivisi z’ibigo za Peekaboo.',
    'seo.contact.title': 'Twandikire | Peekaboo',
    'seo.contact.description':
      'Vugana na Peekaboo ku bufasha bw’igicuruzwa, gutangiza cyangwa ibibazo by’ubufatanye.',
    'seo.legalHub.title': 'Amategeko | Peekaboo',
    'seo.legalHub.description':
      'Ahantu h’amategeko ya Peekaboo: amabwiriza, politiki yo gusubiza amafaranga n’iyo guhagarika.',
    'seo.legalTerms.title': 'Amabwiriza n’amasezerano | Peekaboo',
    'seo.legalTerms.description':
      'Soma amabwiriza n’amasezerano ya Peekaboo yo gukoresha serivisi zacu z’itwara n’ubwikorezi.',
    'seo.legalRefund.title': 'Politiki yo gusubiza amafaranga | Peekaboo',
    'seo.legalRefund.description':
      'Politiki ya Peekaboo yo gusubiza amafaranga ku gutwara n’izindi serivisi.',
    'seo.legalCancellation.title': 'Politiki yo guhagarika | Peekaboo',
    'seo.legalCancellation.description':
      'Politiki ya Peekaboo yo guhagarika amabwiriza n’izindi serivisi.',
    'seo.track.title': 'Kurikirana itegeko | Peekaboo',
    'seo.track.description':
      'Kurikirana uko gutwara kwawe kugenda mu gihe nyacyo ukoresheje uburyo bwa Peekaboo bwo gukurikirana amabwiriza.',
    'seo.publicOrder.title': 'Ibisobanuro by’itegeko | Peekaboo',
    'seo.publicOrder.description':
      'Reba amakuru rusange n’uko itegeko ryawe rya gutwara riri ubu.',
    'seo.paymentPending.title': 'Kwishyura birategereje | Peekaboo',
    'seo.paymentPending.description': 'Turi kwemeza kwishyura kw’itegeko ryawe mu buryo bwizewe.',
    'seo.paymentSuccess.title': 'Kwishyura byagenze neza | Peekaboo',
    'seo.paymentSuccess.description':
      'Kwishyura kw’itegeko ryawe byakozwe neza kuri Peekaboo.',
    'seo.orderTracking.title': 'Gukurikirana itegeko mu gihe nyacyo | Peekaboo',
    'seo.orderTracking.description':
      'Kurikirana uko itegeko ryawe riri kugenda n’amakuru y’igihe cyo gutwara mu gihe nyacyo.',
    'seo.dashboard.title': 'Ikibaho cy’igenzura | Peekaboo',
    'seo.dashboard.description':
      'Kurikirana ibipimo by’itwara, imikorere y’imodoka z’itwara n’imikorere y’ubucuruzi.',
    'seo.orders.title': 'Amabwiriza | Peekaboo',
    'seo.orders.description':
      'Cunga, usuzume kandi ukurikirane amabwiriza yose y’itwara mu gikoresho kimwe.',
    'seo.orderDetail.title': 'Gukurikirana itegeko | Peekaboo',
    'seo.orderDetail.description':
      'Reba uko itegeko rimwe riri n’amakuru y’aho riherereye.',
    'seo.batches.title': 'Amatsinda y’itwara | Peekaboo',
    'seo.batches.description':
      'Kora kandi ucunge amatsinda y’itwara kugira ngo utange imirimo neza.',
    'seo.batchDetail.title': 'Ibisobanuro by’itsinda | Peekaboo',
    'seo.batchDetail.description':
      'Reba amabwiriza, abatwara n’iterambere ry’itsinda ry’itwara.',
    'seo.batchPreview.title': 'Reba itsinda mbere | Peekaboo',
    'seo.batchPreview.description':
      'Reba imirimo n’inzira z’itsinda mbere yo kuyatangaza.',
    'seo.assignments.title': 'Imirimo y’amabwiriza | Peekaboo',
    'seo.assignments.description':
      'Cunga imirimo y’abatwara kandi ukurikirane uko imirimo iri kugenda.',
    'seo.assignmentDetail.title': 'Ibisobanuro by’imirimo | Peekaboo',
    'seo.assignmentDetail.description':
      'Reba amakuru yuzuye ku mirimo y’itegeko rimwe.',
    'seo.users.title': 'Abakoresha | Peekaboo',
    'seo.users.description':
      'Cunga abakoresha, inshingano n’uburenganzira mu ishyirahamwe ryawe.',
    'seo.usersTracking.title': 'Gukurikirana abakoresha | Peekaboo',
    'seo.usersTracking.description':
      'Kurikirana aho abakoresha n’abatwara bari mu gihe nyacyo kugira ngo unozenze imikorere.',
    'seo.userLocationHistory.title': 'Amateka y’aho yagiye | Peekaboo',
    'seo.userLocationHistory.description':
      'Reba amateka y’imihindagurikire y’aho umukoresha yagiye.',
    'seo.userDetail.title': 'Ibisobanuro by’umukoresha | Peekaboo',
    'seo.userDetail.description':
      'Reba umwirondoro, inshingano n’amakuru y’umukozi w’itsinda.',
    'seo.riderManagement.title': 'Gucunga abatwara | Peekaboo',
    'seo.riderManagement.description':
      'Ikibaho cy’umuyobozi ku gutwara, inyungu, kwizera n’urutonde rw’imikorere y’abatwara.',
    'seo.userProfile.title': 'Umwirondoro wanjye | Peekaboo',
    'seo.userProfile.description':
      'Hindura amakuru yawe, ibyo ukunda n’igenamiterere rya konti.',
    'seo.payments.title': 'Kwishyura | Peekaboo',
    'seo.payments.description':
      'Kurikirana ibicuruzwa, uko kwishyura kugenda n’inyandiko z’imari.',
    'seo.paymentDetail.title': 'Ibisobanuro by’ishyura | Peekaboo',
    'seo.paymentDetail.description':
      'Reba amakuru yuzuye ku bicuruzwa byatoranijwe.',
    'seo.billingPayments.title': 'Kwishyuza no kwishyura | Peekaboo',
    'seo.billingPayments.description':
      'Kurikirana kwishyuza kw’itwara, uko kwishyura kugenda n’amafaranga y’amasezerano y’ishyirahamwe.',
    'seo.billingReport.title': 'Raporo yo kwishyuza | Peekaboo',
    'seo.billingReport.description':
      'Kora kandi wohereze raporo zo kwishyuza n’itwara ku kigo cyawe.',
    'seo.organizations.title': 'Amashyirahamwe | Peekaboo',
    'seo.organizations.description':
      'Cunga amashyirahamwe y’abakiriya n’igenamiterere ry’ahantu h’akazi.',
    'seo.organizationManage.title': 'Gucunga ishyirahamwe | Peekaboo',
    'seo.organizationManage.description':
      'Hindura amakuru y’ishyirahamwe, kwishyuza n’igenamiterere ry’imikorere.',
    'seo.organizationInvite.title': 'Tumira ishyirahamwe | Peekaboo',
    'seo.organizationInvite.description':
      'Tumira ishyirahamwe rishya ku rubuga rwa Peekaboo rwawe.',
    'seo.organizationSettings.title': 'Igenamiterere ry’ishyirahamwe | Peekaboo',
    'seo.organizationSettings.description':
      'Shyiraho ibyo ukunda n’umwirondoro w’ishyirahamwe.',
    'seo.businessPlans.title': 'Amasezerano y’ibigo | Peekaboo',
    'seo.businessPlans.description':
      'Cunga amasezerano, ibiranga n’uburyo bw’ibiciro.',
    'seo.businessPlanCreate.title': 'Kora amasezerano y’ikigo | Peekaboo',
    'seo.businessPlanCreate.description':
      'Kora amasezerano mashya y’ikigo hamwe n’ibiciro n’ubushobozi bwihariye.',
    'seo.businessPlanManage.title': 'Gucunga amasezerano y’ikigo | Peekaboo',
    'seo.businessPlanManage.description':
      'Hindura kandi unozenze amasezerano y’ikigo ariho.',
    'seo.unauthorized.title': 'Ntabwo wemerewe | Peekaboo',
    'seo.unauthorized.description': 'Ntabwo ufite uburenganzira bwo kugera kuri iyi paji.',
    'seo.notFound.title': 'Paji ntiboneka | Peekaboo',
    'seo.notFound.description':
      'Paji ushaka ntibaho cyangwa yimuriwe ahandi.',
  },
};
