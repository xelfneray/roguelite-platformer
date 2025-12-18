import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.roguelite.platformer',
    appName: 'Roguelite Platformer',
    webDir: 'dist',
    android: {
        backgroundColor: '#0f0f1e'
    },
    server: {
        androidScheme: 'https'
    },
    plugins: {
        SplashScreen: {
            launchAutoHide: true,
            backgroundColor: '#0f0f1e',
            showSpinner: false
        }
    }
};

export default config;
