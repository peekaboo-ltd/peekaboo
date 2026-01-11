# Peekaboo Rider Mobile App

A minimalistic React Native mobile application for delivery riders to manage orders and assignments with real-time updates and efficient order acceptance workflows.

## 🚀 Features

- **Authentication**: Secure login with phone number and password
- **Dashboard**: Overview of today's deliveries, pending assignments, earnings, and recent activity
- **Assignments Management**: View, accept, reject, and track delivery assignments
- **Assignment Details**: View full order details, customer info, locations, and payment breakdown
- **Real-time Updates**: Pull-to-refresh for latest data
- **Push Notifications**: Get notified about new assignments (setup required)

## 📱 Screenshots

The app features a clean, minimalistic design with:
- Dashboard with stat cards and recent activity
- Assignment list with filters (All, Pending, Active, Completed)
- Detailed assignment view with action buttons
- Easy-to-use login screen

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Secure Storage**: expo-secure-store
- **UI Components**: Custom minimalistic components
- **Icons**: @expo/vector-icons (Ionicons)
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your physical device (for testing)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Update the environment variables:

```env
EXPO_PUBLIC_API_BASE_URL=http://your-backend-url/api
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

### 3. Start Development Server

```bash
npx expo start
```

This will start the Expo development server. You can then:
- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan the QR code with Expo Go app on your phone

## 📁 Project Structure

```
mobile/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication screens
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   └── assignments.tsx
│   ├── assignment/          # Assignment detail screens
│   │   └── [id].tsx
│   └── _layout.tsx          # Root layout
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Badge.tsx
│   ├── dashboard/           # Dashboard components
│   │   ├── StatCard.tsx
│   │   └── RecentActivity.tsx
│   └── assignments/         # Assignment components
│       ├── AssignmentCard.tsx
│       ├── AssignmentDetails.tsx
│       ├── AssignmentActions.tsx
│       └── AssignmentFilters.tsx
├── services/
│   ├── api/                 # API services
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── assignments.ts
│   │   ├── orders.ts
│   │   └── dashboard.ts
│   ├── storage/             # Secure storage
│   │   └── secureStorage.ts
│   └── notifications/       # Push notifications
│       └── pushNotifications.ts
├── store/                   # Zustand stores
│   ├── authStore.ts
│   ├── assignmentStore.ts
│   └── dashboardStore.ts
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useAssignments.ts
│   └── useDashboard.ts
├── types/                   # TypeScript types
│   ├── auth.ts
│   ├── assignment.ts
│   ├── order.ts
│   └── dashboard.ts
├── utils/                   # Utility functions
│   ├── constants.ts
│   ├── formatters.ts
│   ├── validators.ts
│   └── errorHandler.ts
└── assets/                  # Images and fonts
```

## 🔌 API Integration

The app expects the following backend endpoints:

### Authentication
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user profile

### Assignments
- `GET /api/order-assignments` - Get rider's assignments
- `GET /api/order-assignments/:id` - Get assignment details
- `PATCH /api/order-assignments/:id/accept` - Accept assignment
- `PATCH /api/order-assignments/:id/reject` - Reject assignment

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## 🎨 Design System

### Colors
- **Primary**: #2563EB (Blue)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Orange)
- **Danger**: #EF4444 (Red)
- **Background**: #FFFFFF
- **Surface**: #F9FAFB
- **Text Primary**: #111827
- **Text Secondary**: #6B7280

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## 🏗️ Building for Production

### Using EAS Build (Recommended)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Build for platforms:
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

### Local Build

For development builds:
```bash
# iOS (requires macOS)
npx expo run:ios

# Android
npx expo run:android
```

## 📱 Testing

Run on physical devices for the best experience:

1. Install Expo Go from App Store or Play Store
2. Run `npx expo start`
3. Scan QR code with your camera (iOS) or Expo Go (Android)

## 🔧 Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start -c`
2. **iOS Simulator not launching**: Run `npx expo run:ios`
3. **Android emulator issues**: Make sure ANDROID_HOME is set
4. **API connection issues**: Check API_BASE_URL in .env

### Logs

View logs in the terminal where Expo is running, or use:
```bash
npx expo start --dev-client
```

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Contributors

- Development Team - Peekaboo
