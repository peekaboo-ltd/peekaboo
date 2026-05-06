import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getLanguagePreference, saveLanguagePreference } from '../services/storage/secureStorage';

export type AppLanguage = 'en' | 'rw';

type TranslationValues = Record<string, string | number>;

const translations = {
  en: {
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.notFound': 'Not Found',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'common.retry': 'Retry',
    'common.close': 'Close',
    'common.yes': 'YES',
    'common.no': 'NO',

    'language.label': 'Language',
    'language.english': 'English',
    'language.kinyarwanda': 'Kinyarwanda',

    'tab.dashboard': 'Dashboard',
    'tab.assignments': 'Assignments',
    'tab.profile': 'Profile',

    'auth.riderPortal': 'Rider Portal',
    'auth.title': 'Peekaboo Rider',
    'auth.subtitle': 'Sign in to manage assignments, deliveries, and daily targets.',
    'auth.signIn': 'Sign in',
    'auth.formSubtitle': 'Continue with your rider account.',
    'auth.usernameOrEmail': 'Username or Email',
    'auth.usernamePlaceholder': 'Enter your username or email',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.signInButton': 'Sign In',
    'auth.loginFailed': 'Login Failed',
    'auth.troubleSigningIn': 'Having trouble signing in?',
    'auth.contactSupport': 'Contact support',

    'dashboard.kicker': 'Dashboard',
    'dashboard.welcomeBack': 'Welcome back,',
    'dashboard.defaultRider': 'Rider',
    'dashboard.readyRoutes': 'Ready to take on today\'s routes.',
    'dashboard.shiftActive': 'Shift Active',
    'dashboard.shiftInactive': 'Shift Inactive',
    'dashboard.todaysFocus': 'Today\'s Focus',
    'dashboard.keepMomentum': 'Keep momentum with active stops.',
    'dashboard.pending': 'Pending',
    'dashboard.stayTop': 'Stay on top of active deliveries',
    'dashboard.earnings': 'Earnings',
    'dashboard.completed': 'Completed',
    'dashboard.pendingAssignment': '{{count}} Pending Assignment',
    'dashboard.pendingAssignments': '{{count}} Pending Assignments',
    'dashboard.tapToView': 'Tap to view and accept',
    'dashboard.locationWaiting': 'Location updates are active. Waiting for your first location sync.',
    'dashboard.locationRecent': 'Location was collected recently.',
    'dashboard.lastLocationCollected': 'Last location collected: {{date}}',
    'dashboard.overview': 'Overview',
    'dashboard.snapshot': 'Today\'s Snapshot',
    'dashboard.updatedNow': 'Updated just now',
    'dashboard.deliveries': 'Deliveries',
    'dashboard.bonusActivated': 'Bonus Activated',
    'dashboard.shortcuts': 'Shortcuts',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.stayOnTrack': 'Stay on track',
    'dashboard.viewAssignments': 'View Assignments',
    'dashboard.acceptAndStart': 'Accept and start deliveries',
    'dashboard.timeline': 'Timeline',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.last7Days': 'Last 7 days',
    'dashboard.reportActionTitle': 'Report Problem',
    'dashboard.reportActionSubtitle': 'Capture proof and submit',
    'dashboard.reportOpenTitle': 'Report Problem / Receipt',
    'dashboard.reportOpenMessage': 'Capture evidence as photo or video.',
    'dashboard.reportRetakeTitle': 'Retake evidence?',
    'dashboard.reportRetakeMessage': 'This will replace your current capture.',
    'dashboard.reportTypeRequiredTitle': 'Type required',
    'dashboard.reportTypeRequiredMessageContinue': 'Please choose Problem or Receipt before continuing.',
    'dashboard.reportTypeRequiredMessageSend': 'Please choose Problem or Receipt before sending.',
    'dashboard.reportDescriptionRequiredTitle': 'Description required',
    'dashboard.reportDescriptionRequiredMessage': 'Please add a short description before sending.',
    'dashboard.reportSendFailedTitle': 'Send failed',
    'dashboard.reportSendFailedMessage': 'Unable to send your report right now. Please try again.',
    'dashboard.reportModalTitle': 'Report Problem / Receipt',
    'dashboard.reportVideoCaptured': 'Video captured',
    'dashboard.reportTimestamp': 'Timestamp',
    'dashboard.reportLocation': 'Location',
    'dashboard.reportType': 'Type',
    'dashboard.reportLocationUnavailable': 'Location unavailable',
    'dashboard.reportChooseType': 'Choose type',
    'dashboard.reportProblem': 'Problem',
    'dashboard.reportReceipt': 'Receipt',
    'dashboard.reportDescription': 'Description',
    'dashboard.reportDescribeReceipt': 'Describe the receipt...',
    'dashboard.reportDescribeProblem': 'Describe the problem...',
    'dashboard.reportRetake': 'Retake',
    'dashboard.reportConfirm': 'Confirm',
    'dashboard.reportSend': 'Send',
    'dashboard.reportSubmitted': 'Report Submitted',
    'dashboard.reportVideoEvidenceSubmitted': 'Video evidence submitted',
    'dashboard.reportNoDescription': 'No description provided.',
    'dashboard.reportDone': 'Done',
    'dashboard.permissionLocationTitle': 'Location permission required',
    'dashboard.permissionLocationMessage': 'Please allow location access to continue.',
    'dashboard.permissionCameraTitle': 'Camera permission required',
    'dashboard.permissionCameraMessage': 'Please allow camera access to continue.',
    'dashboard.updateFailedTitle': 'Update failed',
    'dashboard.updateFailedMessage': 'Failed to update availability. Please try again.',
    'dashboard.checkProofFailed': 'Failed to send check proof. Please try again.',
    'dashboard.proofRetakeTitle': 'Retake photo?',
    'dashboard.proofRetakeMessage': 'This will replace the current image.',
    'dashboard.permissionRequiredTitle': 'Permission required',
    'dashboard.photoLibraryPermissionMessage': 'Please allow photo library access to save images on your phone.',
    'dashboard.savedTitle': 'Saved',
    'dashboard.savedMessage': 'Photo saved to your gallery in "{{albumName}}".',
    'dashboard.saveFailedTitle': 'Save failed',
    'dashboard.saveFailedMessage': 'Could not save the photo. Please try again.',
    'dashboard.proofSave': 'Save',
    'dashboard.proofSendCheckIn': 'Send Check-in',
    'dashboard.proofSendCheckOut': 'Send Check-out',
    'dashboard.mediaPhoto': 'Photo',
    'dashboard.mediaVideo': 'Video',

    'assignments.title': 'Assignments',
    'assignments.queueTitle': 'Your delivery queue',
    'assignments.totalAssignments': '{{count}} total assignments',
    'assignments.active': 'Active',
    'assignments.pending': 'Pending',
    'assignments.completed': 'Completed',
    'assignments.filterAll': 'All',
    'assignments.emptyTitle': 'No Assignments',
    'assignments.emptyAll': 'You don\'t have any assignments yet.',
    'assignments.emptyFiltered': 'No {{filter}} assignments found.',
    'assignments.confirmTransit': 'Confirm & Start Transit',
    'assignments.confirmTransitMessage': 'This will mark the order as confirmed and in transit.',
    'assignments.transitSuccess': 'Order is now in transit.',
    'assignments.acceptFailed': 'Failed to accept assignment.',
    'assignments.rejectFailed': 'Failed to reject assignment.',
    'assignments.transitFailed': 'Unable to start transit. Please try again.',

    'assignment.order': 'Order',
    'assignment.pickupLocation': 'Pickup Location',
    'assignment.deliveryLocation': 'Delivery Location',
    'assignment.reject': 'Reject',
    'assignment.accept': 'Accept',
    'assignment.acceptAssignment': 'Accept Assignment',
    'assignment.pending': 'Pending',
    'assignment.active': 'Active',
    'assignment.completed': 'Completed',
    'assignment.rejected': 'Rejected',
    'assignment.cancelled': 'Cancelled',

    'assignmentDetail.title': 'Assignment Details',
    'assignmentDetail.loadingTitle': 'Loading...',
    'assignmentDetail.notFound': 'Not Found',
    'assignmentDetail.acceptedTitle': 'Assignment Accepted',
    'assignmentDetail.acceptedMessage': 'You have successfully accepted this assignment.',
    'assignmentDetail.rejectedTitle': 'Assignment Rejected',
    'assignmentDetail.rejectedMessage': 'You have rejected this assignment.',
    'assignmentDetail.transitTitle': 'Order in Transit',
    'assignmentDetail.transitMessage': 'Order has been confirmed and marked as in transit.',
    'assignmentDetail.recoveredTitle': 'Assignment Recovered',
    'assignmentDetail.recoveredMessage': 'This assignment has been restored and is ready for you to accept.',
    'assignmentDetail.unableRecover': 'Unable to Recover',
    'assignmentDetail.otpRequiredTitle': 'OTP required',
    'assignmentDetail.otpRequiredMessage': 'Enter the order OTP to complete this delivery.',
    'assignmentDetail.completedTitle': 'Order Completed',
    'assignmentDetail.completedMessage': 'Order has been marked as completed.',
    'assignmentDetail.confirmDispatchFailed': 'Failed to confirm dispatch.',
    'assignmentDetail.recoverFailed': 'Failed to recover assignment.',
    'assignmentDetail.completeFailed': 'Failed to complete order.',
    'assignmentDetail.completeVerification': 'Complete Order Verification',
    'assignmentDetail.enterOtp': 'Enter OTP',

    'assignmentActions.rejectTitle': 'Reject Assignment',
    'assignmentActions.rejectMessage': 'Are you sure you want to reject this assignment?',
    'assignmentActions.completeTitle': 'Complete Assignment',
    'assignmentActions.completeMessage': 'Mark this assignment as completed?',
    'assignmentActions.recoverTitle': 'Recover Assignment',
    'assignmentActions.recoverMessage': 'Recover this assignment if it has not already been assigned to another rider?',
    'assignmentActions.markCompleted': 'Mark as Completed',
    'assignmentActions.recover': 'Recover',
    'assignmentActions.recoverAssignment': 'Recover Assignment',

    'assignmentInfo.orderInformation': 'Order Information',
    'assignmentInfo.orderId': 'Order ID',
    'assignmentInfo.assignment': 'Assignment',
    'assignmentInfo.orderStatus': 'Order status',
    'assignmentInfo.created': 'Created',
    'assignmentInfo.senderNumber': 'Sender Number',
    'assignmentInfo.receiverNumber': 'Receiver Number',
    'assignmentInfo.notes': 'Notes',
    'assignmentInfo.customerInformation': 'Customer Information',
    'assignmentInfo.name': 'Name',
    'assignmentInfo.phone': 'Phone',
    'assignmentInfo.locations': 'Locations',
    'assignmentInfo.showRoute': 'Show route',
    'assignmentInfo.getDirections': 'Get Directions',
    'assignmentInfo.routeModalTitle': 'Route: Pickup to Delivery',
    'assignmentInfo.paymentInformation': 'Payment Information',
    'assignmentInfo.initialFee': 'Initial Fee',
    'assignmentInfo.discount': 'Discount',
    'assignmentInfo.total': 'Total',
    'assignmentInfo.na': 'N/A',

    'map.approxDistance': 'Approx. distance',
    'map.webFallback': 'Map is available in the iOS or Android app. Open the route in Google Maps below.',
    'map.openGoogleMaps': 'Open in Google Maps',

    'activity.empty': 'No recent activity',

    'profile.loading': 'Loading your profile...',
    'profile.noData': 'No user data available.',
    'profile.unnamedRider': 'Unnamed rider',
    'profile.infoTitle': 'Profile information',
    'profile.fullName': 'Full name',
    'profile.fullNamePlaceholder': 'Enter your full name',
    'profile.email': 'Email',
    'profile.emailPlaceholder': 'Enter your email',
    'profile.phoneNumber': 'Phone number',
    'profile.phonePlaceholder': 'Enter your phone number',
    'profile.dateOfBirth': 'Date of birth',
    'profile.nationality': 'Nationality',
    'profile.nationalityPlaceholder': 'Enter your nationality',
    'profile.performanceTitle': 'Today\'s performance',
    'profile.deliveriesToday': 'Deliveries Today',
    'profile.profileUpdated': 'Profile updated',
    'profile.profileUpdatedMessage': 'Your profile has been updated successfully.',
    'profile.updateFailed': 'Failed to update profile. Please try again.',
    'profile.uploadFailed': 'Upload failed',
    'profile.uploadFailedMessage': 'Failed to update profile photo. Please try again.',
    'profile.removeFailed': 'Remove failed',
    'profile.removeFailedMessage': 'Failed to remove profile photo. Please try again.',
    'profile.permissionRequired': 'Permission required',
    'profile.cameraPermission': 'Camera permission is required to take a profile photo.',
    'profile.libraryPermission': 'Photo library permission is required to choose a profile photo.',
    'profile.removePhotoTitle': 'Remove profile photo',
    'profile.removePhotoMessage': 'Are you sure you want to remove your profile photo?',
    'profile.remove': 'Remove',
    'profile.photoTitle': 'Profile photo',
    'profile.photoMessage': 'Update your profile photo',
    'profile.takePhoto': 'Take photo',
    'profile.chooseFromLibrary': 'Choose from library',
    'profile.removePhoto': 'Remove photo',
    'profile.cancel': 'Cancel',
    'profile.editProfile': 'Edit profile',
    'profile.saveChanges': 'Save changes',

    'support.title': 'Contact Support',

    'notFound.title': 'Page Not Found',
    'notFound.subtitle': 'The page you\'re looking for doesn\'t exist.',
    'notFound.goDashboard': 'Go to Dashboard',
  },
  rw: {
    'common.back': 'Subira',
    'common.loading': 'Birimo gufungura...',
    'common.notFound': 'Ntibyabonetse',
    'common.error': 'Ikosa',
    'common.success': 'Byakunze',
    'common.ok': 'OK',
    'common.cancel': 'Hagarika',
    'common.retry': 'Ongera',
    'common.close': 'Funga',
    'common.yes': 'Yego',
    'common.no': 'Oya',

    'language.label': 'Ururimi',
    'language.english': 'Icyongereza',
    'language.kinyarwanda': 'Ikinyarwanda',

    'tab.dashboard': 'Ahabanza',
    'tab.assignments': 'Deliveries',
    'tab.profile': 'Umwirondoro',

    'auth.riderPortal': 'Urubuga rw\'Abamotari',
    'auth.title': 'Peekaboo Rider',
    'auth.subtitle': 'Injira urebe deliveries z\'umunsi.',
    'auth.signIn': 'Injira',
    'auth.formSubtitle': 'Komeza ukoreshe konti yawe y\'umumotari.',
    'auth.usernameOrEmail': 'Izina ukoresha cyangwa Imeyili',
    'auth.usernamePlaceholder': 'Andika izina ukoresha cyangwa imeyili',
    'auth.password': 'Ijambobanga',
    'auth.passwordPlaceholder': 'Andika ijambobanga',
    'auth.signInButton': 'Injira',
    'auth.loginFailed': 'Kwinjira byanze',
    'auth.troubleSigningIn': 'Ufite ikibazo cyo kwinjira?',
    'auth.contactSupport': 'Hamagara ubufasha',

    'dashboard.kicker': 'Ahabanza',
    'dashboard.welcomeBack': 'Murakaza neza,',
    'dashboard.defaultRider': 'Umutwara',
    'dashboard.readyRoutes': 'uyu munsi tugende vuba, neza, kandi dutanga service itazibagirana !!!',
    'dashboard.shiftActive': 'Shift iri gukora',
    'dashboard.shiftInactive': 'Shift yahagaze',
    'dashboard.todaysFocus': 'Iby\'ingenzi by\'uyu munsi',
    'dashboard.keepMomentum': 'Twihuse tugeza Deliveries kuba client.',
    'dashboard.pending': 'Bitegereje',
    'dashboard.stayTop': 'Amakuru kuri Deliveries nshya',
    'dashboard.earnings': 'Amafaranga',
    'dashboard.completed': 'Byarangiye',
    'dashboard.pendingAssignment': 'Deliveries {{count}} itegereje',
    'dashboard.pendingAssignments': 'Deliveries {{count}} Itegereje',
    'dashboard.tapToView': 'Kanda urebe kandi wemere',
    'dashboard.locationWaiting': 'Guma online tumenya aho uherereye.',
    'dashboard.locationRecent': 'Aho wari hafashwe vuba.',
    'dashboard.lastLocationCollected': 'Aho waheruka gufatirwa: {{date}}',
    'dashboard.overview': 'Incamake',
    'dashboard.snapshot': 'Ishusho y\'uyu munsi',
    'dashboard.updatedNow': 'Byavuguruwe ubu',
    'dashboard.deliveries': 'Ibyoherezwa',
    'dashboard.bonusActivated': 'Bonus yakorewe',
    'dashboard.shortcuts': 'Inzira yihuse',
    'dashboard.quickActions': 'Ibikorwa byihuse',
    'dashboard.stayOnTrack': 'Komeza ku murongo',
    'dashboard.viewAssignments': 'Reba Deliveries',
    'dashboard.acceptAndStart': 'Emera utangire deliveries',
    'dashboard.timeline': 'Ibihe',
    'dashboard.recentActivity': 'Ibikorwa biheruka',
    'dashboard.last7Days': 'Iminsi 7 ishize',
    'dashboard.reportActionTitle': 'Menyesha ikibazo',
    'dashboard.reportActionSubtitle': 'Fata gihamya uyohereze',
    'dashboard.reportOpenTitle': 'Menyesha Ikibazo / Resi',
    'dashboard.reportOpenMessage': 'Fata gihamya nk\'ifoto cyangwa video.',
    'dashboard.reportRetakeTitle': 'Ongera ufate gihamya?',
    'dashboard.reportRetakeMessage': 'Ibi bisimbuza ibyo wari wafashe.',
    'dashboard.reportTypeRequiredTitle': 'Ubwoko burakenewe',
    'dashboard.reportTypeRequiredMessageContinue': 'Hitamo Ikibazo cyangwa Resi mbere yo gukomeza.',
    'dashboard.reportTypeRequiredMessageSend': 'Hitamo Ikibazo cyangwa Resi mbere yo kohereza.',
    'dashboard.reportDescriptionRequiredTitle': 'Ibisobanuro birakenewe',
    'dashboard.reportDescriptionRequiredMessage': 'Andika ibisobanuro bigufi mbere yo kohereza.',
    'dashboard.reportSendFailedTitle': 'Kohereza byanze',
    'dashboard.reportSendFailedMessage': 'Ntibishobotse kohereza raporo ubu. Ongera ugerageze.',
    'dashboard.reportModalTitle': 'Raporo y\'Ikibazo / Resi',
    'dashboard.reportVideoCaptured': 'Video yafashwe',
    'dashboard.reportTimestamp': 'Igihe',
    'dashboard.reportLocation': 'Aho',
    'dashboard.reportType': 'Ubwoko',
    'dashboard.reportLocationUnavailable': 'Aho hantu ntihaboneka',
    'dashboard.reportChooseType': 'Hitamo ubwoko',
    'dashboard.reportProblem': 'Ikibazo',
    'dashboard.reportReceipt': 'Resi',
    'dashboard.reportDescription': 'Ibisobanuro',
    'dashboard.reportDescribeReceipt': 'Sobanura resi...',
    'dashboard.reportDescribeProblem': 'Sobanura ikibazo...',
    'dashboard.reportRetake': 'Ongera ufate',
    'dashboard.reportConfirm': 'Emeza',
    'dashboard.reportSend': 'Ohereza',
    'dashboard.reportSubmitted': 'Raporo yoherejwe',
    'dashboard.reportVideoEvidenceSubmitted': 'Video gihamya yoherejwe',
    'dashboard.reportNoDescription': 'Nta bisobanuro byatanzwe.',
    'dashboard.reportDone': 'Byarangiye',
    'dashboard.permissionLocationTitle': 'Uruhushya rw\'aho uherereye rurakenewe',
    'dashboard.permissionLocationMessage': 'Emera app kubona aho uherereye kugira ngo ukomeze.',
    'dashboard.permissionCameraTitle': 'Uruhushya rwa kamera rurakenewe',
    'dashboard.permissionCameraMessage': 'Emera app gukoresha kamera kugira ngo ukomeze.',
    'dashboard.updateFailedTitle': 'Kuvugurura byanze',
    'dashboard.updateFailedMessage': 'Ntibishobotse kuvugurura uko uhari. Ongera ugerageze.',
    'dashboard.checkProofFailed': 'Kohereza gihamya ya check byanze. Ongera ugerageze.',
    'dashboard.proofRetakeTitle': 'Ongera ufate ifoto?',
    'dashboard.proofRetakeMessage': 'Ibi bisimbuza ifoto iriho.',
    'dashboard.permissionRequiredTitle': 'Uruhushya rurakenewe',
    'dashboard.photoLibraryPermissionMessage': 'Emera app kubona photo library kugira ngo ubike amafoto kuri telefoni.',
    'dashboard.savedTitle': 'Byabitswe',
    'dashboard.savedMessage': 'Ifoto yabitswe muri galeri yawe muri "{{albumName}}".',
    'dashboard.saveFailedTitle': 'Kubika byanze',
    'dashboard.saveFailedMessage': 'Ntidushoboye kubika ifoto. Ongera ugerageze.',
    'dashboard.proofSave': 'Bika',
    'dashboard.proofSendCheckIn': 'Ohereza check-in',
    'dashboard.proofSendCheckOut': 'Ohereza check-out',
    'dashboard.mediaPhoto': 'Ifoto',
    'dashboard.mediaVideo': 'Video',

    'assignments.title': 'Deliveries',
    'assignments.queueTitle': 'Urutonde rwa Deliveries',
    'assignments.totalAssignments': 'Deliveries zose: {{count}}',
    'assignments.active': 'Izigikorwa',
    'assignments.pending': 'izitegereje',
    'assignments.completed': 'Emeza',
    'assignments.filterAll': 'Zose',
    'assignments.emptyTitle': 'Nta delivery',
    'assignments.emptyAll': 'Nta delivery ufite ubu.',
    'assignments.emptyFiltered': 'Nta delivery za {{filter}} zabonetse.',
    'assignments.confirmTransit': 'Emeza utangire urugendo',
    'assignments.confirmTransitMessage': 'Ibi birashyira order ku rwego rwa confirmed no ku rugendo.',
    'assignments.transitSuccess': 'Order ubu iri mu rugendo.',
    'assignments.acceptFailed': 'Kwemera Deliveries byanze.',
    'assignments.rejectFailed': 'Kwanga Deliveries byanze.',
    'assignments.transitFailed': 'Gutangira urugendo byanze. Ongera ugerageze.',

    'assignment.order': 'Order',
    'assignment.pickupLocation': 'Aho biri',
    'assignment.deliveryLocation': 'Aho bijya',
    'assignment.reject': 'Wange',
    'assignment.accept': 'Emera',
    'assignment.acceptAssignment': 'Emera Deliveries',
    'assignment.pending': 'Itegereje',
    'assignment.active': 'Irigukorwa',
    'assignment.completed': 'Yarangiye',
    'assignment.rejected': 'Yanzwe',
    'assignment.cancelled': 'Yahagaritswe',

    'assignmentDetail.title': 'Ibisobanuro by\'Deliveries',
    'assignmentDetail.loadingTitle': 'Birimo gufungura...',
    'assignmentDetail.notFound': 'Ntibyabonetse',
    'assignmentDetail.acceptedTitle': 'Deliveries yemerewe',
    'assignmentDetail.acceptedMessage': 'Wemeye iyi delivery neza.',
    'assignmentDetail.rejectedTitle': 'Deliveries yanze',
    'assignmentDetail.rejectedMessage': 'Wanenze iyi delivery.',
    'assignmentDetail.transitTitle': 'Order iri mu rugendo',
    'assignmentDetail.transitMessage': 'Order yemejwe kandi yashyizwe mu rugendo.',
    'assignmentDetail.recoveredTitle': 'Deliveries yasubijwe',
    'assignmentDetail.recoveredMessage': 'Iyi delivery yasubijwe kandi yiteguye kwemerwa.',
    'assignmentDetail.unableRecover': 'Ntibishoboka gusubiza',
    'assignmentDetail.otpRequiredTitle': 'OTP irakenewe',
    'assignmentDetail.otpRequiredMessage': 'Andika OTP ya order kugira ngo urangize delivery.',
    'assignmentDetail.completedTitle': 'Order yarangiye',
    'assignmentDetail.completedMessage': 'Order yashyizwe ku rwego rwo kurangira.',
    'assignmentDetail.confirmDispatchFailed': 'Kwemeza dispatch byanze.',
    'assignmentDetail.recoverFailed': 'Gusubiza Deliveries byanze.',
    'assignmentDetail.completeFailed': 'Kurangiza order byanze.',
    'assignmentDetail.completeVerification': 'Igenzura ryo kurangiza Order',
    'assignmentDetail.enterOtp': 'Andika OTP',

    'assignmentActions.rejectTitle': 'Wange Deliveries',
    'assignmentActions.rejectMessage': 'Uremeza ko ushaka kwanga iyi delivery?',
    'assignmentActions.completeTitle': 'Rangiza Deliveries',
    'assignmentActions.completeMessage': 'Shyira iyi delivery ku rwego rwo kurangira?',
    'assignmentActions.recoverTitle': 'Subiza Deliveries',
    'assignmentActions.recoverMessage': 'Subiza iyi delivery niba itaratangwa ku wundi mutwara?',
    'assignmentActions.markCompleted': 'Emeza',
    'assignmentActions.recover': 'Subiza',
    'assignmentActions.recoverAssignment': 'Subiza Deliveries',

    'assignmentInfo.orderInformation': 'Amakuru ya Delivery',
    'assignmentInfo.orderId': 'ID ya Delivery',
    'assignmentInfo.assignment': 'Deliveries',
    'assignmentInfo.orderStatus': 'Imiterere ya Delivery',
    'assignmentInfo.created': 'Byakozwe',
    'assignmentInfo.senderNumber': 'Nimero y\'uwohereje',
    'assignmentInfo.receiverNumber': 'Nimero y\'uwakira',
    'assignmentInfo.notes': 'Ibisobanuro',
    'assignmentInfo.customerInformation': 'Amakuru y\'umukiriya',
    'assignmentInfo.name': 'Izina',
    'assignmentInfo.phone': 'Telefoni',
    'assignmentInfo.locations': 'Aho ugiye',
    'assignmentInfo.showRoute': 'Erekana inzira',
    'assignmentInfo.getDirections': 'Fata icyerekezo',
    'assignmentInfo.routeModalTitle': 'Inzira: Aho gufatira kugeza aho kugeza',
    'assignmentInfo.paymentInformation': 'Amakuru y\'ubwishyu',
    'assignmentInfo.initialFee': 'Amafaranga ya mbere',
    'assignmentInfo.discount': 'Igabanyirizwa',
    'assignmentInfo.total': 'Igiteranyo',
    'assignmentInfo.na': 'N/A',

    'map.approxDistance': 'Intera igereranyije',
    'map.webFallback': 'Ikarita iboneka muri app ya iOS cyangwa Android. Fungura inzira muri Google Maps hepfo.',
    'map.openGoogleMaps': 'Fungura muri Google Maps',

    'activity.empty': 'Nta bikorwa biheruka',

    'profile.loading': 'Birimo gufungura umwirondoro wawe...',
    'profile.noData': 'Nta makuru y\'yanyu abonetse.',
    'profile.unnamedRider': 'Umumotari utazwi',
    'profile.infoTitle': 'Amakuru y\'umwirondoro',
    'profile.fullName': 'Amazina yuzuye',
    'profile.fullNamePlaceholder': 'Andika amazina yawe yuzuye',
    'profile.email': 'Imeyili',
    'profile.emailPlaceholder': 'Andika imeyili yawe',
    'profile.phoneNumber': 'Nimero ya telefoni',
    'profile.phonePlaceholder': 'Andika nimero ya telefoni',
    'profile.dateOfBirth': 'Itariki y\'amavuko',
    'profile.nationality': 'Ubwenegihugu',
    'profile.nationalityPlaceholder': 'Andika ubwenegihugu bwawe',
    'profile.performanceTitle': 'Imikorere y\'uyu munsi',
    'profile.deliveriesToday': 'Deliveries z\'uyu munsi',
    'profile.profileUpdated': 'Umwirondoro wavuguruwe',
    'profile.profileUpdatedMessage': 'Umwirondoro wawe wavuguruwe neza.',
    'profile.updateFailed': 'Kuvugurura umwirondoro byanze. Ongera ugerageze.',
    'profile.uploadFailed': 'Kohereza byanze',
    'profile.uploadFailedMessage': 'Kuvugurura ifoto byanze. Ongera ugerageze.',
    'profile.removeFailed': 'Gukuraho byanze',
    'profile.removeFailedMessage': 'Gukuraho ifoto byanze. Ongera ugerageze.',
    'profile.permissionRequired': 'Uruhushya rurakenewe',
    'profile.cameraPermission': 'Uruhushya rwa camera rurakenewe kugira ngo ufate ifoto.',
    'profile.libraryPermission': 'Uruhushya rwa photo library rurakenewe kugira ngo uhitemo ifoto.',
    'profile.removePhotoTitle': 'Kuraho ifoto y\'umwirondoro',
    'profile.removePhotoMessage': 'Uremeza ko ushaka gukuraho ifoto y\'umwirondoro?',
    'profile.remove': 'Kuraho',
    'profile.photoTitle': 'Ifoto y\'umwirondoro',
    'profile.photoMessage': 'Vugurura ifoto y\'umwirondoro',
    'profile.takePhoto': 'Fata ifoto',
    'profile.chooseFromLibrary': 'Hitamo muri library',
    'profile.removePhoto': 'Kuraho ifoto',
    'profile.cancel': 'Hagarika',
    'profile.editProfile': 'Hindura umwirondoro',
    'profile.saveChanges': 'Bika impinduka',

    'support.title': 'Hamagara ubufasha',

    'notFound.title': 'Urupapuro ntirubonetse',
    'notFound.subtitle': 'Urupapuro washakaga ntirubaho.',
    'notFound.goDashboard': 'Jya ku Kibaho',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  t: (key: TranslationKey, values?: TranslationValues) => string;
  isHydrated: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const interpolate = (template: string, values?: TranslationValues): string => {
  if (!values) return template;

  return Object.entries(values).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }, template);
};

export const I18nProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>('rw');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const hydrateLanguage = async () => {
      const storedLanguage = await getLanguagePreference();
      if (mounted && (storedLanguage === 'en' || storedLanguage === 'rw')) {
        setLanguageState(storedLanguage);
      }
      if (mounted) {
        setIsHydrated(true);
      }
    };

    hydrateLanguage().catch(() => {
      if (mounted) {
        setIsHydrated(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    await saveLanguagePreference(nextLanguage).catch(() => {});
  };

  const toggleLanguage = async () => {
    const nextLanguage = language === 'en' ? 'rw' : 'en';
    await setLanguage(nextLanguage);
  };

  const t = (key: TranslationKey, values?: TranslationValues): string => {
    const template =
      translations[language][key] ??
      translations.en[key] ??
      key;

    return interpolate(template, values);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isHydrated,
    }),
    [isHydrated, language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  return context;
};
