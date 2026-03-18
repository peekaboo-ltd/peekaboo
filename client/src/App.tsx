import { APIProvider } from '@vis.gl/react-google-maps';
import { Toaster } from './components/ui/sonner';
import { ENVIRONMENTS } from './constants/environments.constants';
import { Router } from './routes';
import { I18nProvider } from './i18n/i18n';
import { messages } from './i18n/messages';

const App = () => {
  return (
    <I18nProvider messages={messages}>
      <APIProvider apiKey={ENVIRONMENTS.GOOGLE_MAPS_API_KEY || ''}>
        <Toaster
          toastOptions={{ style: { fontSize: '11px', fontWeight: '100' } }}
          duration={2000}
        />
        <Router />
      </APIProvider>
    </I18nProvider>
  );
};

export default App;
