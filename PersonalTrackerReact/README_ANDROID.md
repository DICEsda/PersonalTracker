# Personal Tracker - Android Setup Guide

This guide will help you set up and use the Personal Tracker app on Android devices.

## 🚀 Quick Start

### 1. Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (PWA)
npm run build:pwa

# Serve PWA locally
npm run serve:pwa
```

### 2. Android Installation

#### Option A: Install as PWA (Recommended)
1. Open Chrome on your Android device
2. Navigate to the app URL (e.g., `http://localhost:5173` for dev)
3. Tap the three-dot menu → "Add to Home screen"
4. Follow the prompts to install

#### Option B: Install via APK (Advanced)
1. Build the PWA: `npm run build:pwa`
2. Use a tool like [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) to generate APK
3. Install the generated APK on your device

## 📱 Android Features

### Touch Optimizations
- **Touch-friendly buttons**: All interactive elements are at least 44px in size
- **Swipe gestures**: Navigate between sections with swipe gestures
- **Haptic feedback**: Visual feedback on touch interactions
- **Pull-to-refresh**: Pull down to refresh data

### Mobile UI
- **Responsive design**: Optimized for all screen sizes
- **Dark mode**: Automatic dark mode support
- **Safe area handling**: Respects device notches and rounded corners
- **Mobile navigation**: Hamburger menu for smaller screens

### PWA Features
- **Offline support**: App works without internet connection
- **Background sync**: Data syncs when connection is restored
- **App-like experience**: Full-screen mode, no browser UI
- **Home screen installation**: Add to home screen for quick access

## 🔧 Android-Specific Configuration

### Viewport Settings
The app uses optimized viewport settings for Android:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

### Touch Optimizations
- `touch-action: manipulation` for better touch response
- `-webkit-tap-highlight-color: transparent` to remove tap highlights
- Minimum 44px touch targets for accessibility

### Performance Optimizations
- Service worker for caching and offline support
- Optimized animations with `will-change` properties
- Lazy loading for better performance
- Reduced motion support for accessibility

## 📊 Testing on Android

### Chrome DevTools
1. Open Chrome DevTools
2. Click the device toggle button
3. Select an Android device from the dropdown
4. Test touch interactions and responsive design

### Physical Device Testing
1. Ensure your device and computer are on the same network
2. Find your computer's IP address
3. Access the app via `http://[YOUR_IP]:5173`
4. Test all features including PWA installation

### Performance Testing
- Use Chrome DevTools Performance tab
- Test on slower devices
- Check Lighthouse PWA score
- Verify offline functionality

## 🎯 Best Practices for Android

### Touch Interactions
- Use the `TouchGesture` component for custom gestures
- Implement proper touch feedback
- Avoid hover states (not available on touch devices)
- Use appropriate touch target sizes

### Performance
- Optimize images for mobile
- Use lazy loading for heavy components
- Minimize JavaScript bundle size
- Implement proper caching strategies

### Accessibility
- Ensure sufficient color contrast
- Support screen readers
- Provide alternative text for images
- Test with accessibility tools

## 🔍 Troubleshooting

### Common Issues

#### PWA Not Installing
- Ensure HTTPS is used (required for PWA)
- Check that manifest.json is accessible
- Verify service worker is registered
- Clear browser cache and try again

#### Touch Issues
- Check touch target sizes (minimum 44px)
- Verify touch-action CSS properties
- Test on physical device, not just emulator
- Ensure no conflicting event listeners

#### Performance Problems
- Optimize images and assets
- Check bundle size with `npm run build`
- Use Chrome DevTools Performance tab
- Consider code splitting for large components

### Debug Commands
```bash
# Check PWA score
npx lighthouse http://localhost:8080 --view

# Test service worker
npx workbox-cli generateSW

# Analyze bundle
npm run build && npx vite-bundle-analyzer dist
```

## 📱 Device Compatibility

### Minimum Requirements
- Android 5.0+ (API level 21)
- Chrome 67+ or Samsung Internet 7.2+
- 2GB RAM recommended
- 100MB free storage

### Tested Devices
- Samsung Galaxy S21
- Google Pixel 6
- OnePlus 9
- Xiaomi Mi 11
- Various Android tablets

## 🚀 Deployment

### Production Build
```bash
npm run build:pwa
```

### Hosting Options
- **Netlify**: Drag and drop `dist` folder
- **Vercel**: Connect GitHub repository
- **Firebase Hosting**: Use Firebase CLI
- **GitHub Pages**: Enable GitHub Pages

### PWA Deployment Checklist
- [ ] HTTPS enabled
- [ ] Manifest.json accessible
- [ ] Service worker registered
- [ ] Icons in multiple sizes
- [ ] Offline functionality tested
- [ ] Lighthouse PWA score > 90

## 📞 Support

For Android-specific issues:
1. Check this README first
2. Test on multiple devices
3. Use Chrome DevTools for debugging
4. Check browser console for errors
5. Verify PWA requirements are met

## 🔄 Updates

To update the app on Android:
1. Clear browser cache
2. Hard refresh the page
3. Reinstall PWA if necessary
4. Check for service worker updates

---

**Note**: This app is optimized for Android but works on all platforms. For the best experience, install it as a PWA on your Android device. 