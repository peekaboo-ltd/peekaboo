import { APIProvider } from '@vis.gl/react-google-maps';
import { useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { ENVIRONMENTS } from './constants/environments.constants';
import { Router } from './routes';
import { ScrollToTop } from './components/layout';
import { I18nProvider } from './i18n/i18n';
import { messages } from './i18n/messages';

const App = () => {
  const location = useLocation();
  const appContent = (
    <>
      <Toaster
        toastOptions={{ style: { fontSize: '11px', fontWeight: '100' } }}
        duration={2000}
      />
      <ScrollToTop />
      <Router />
    </>
  );

  return (
    <I18nProvider messages={messages}>
      {ENVIRONMENTS.GOOGLE_MAPS_API_KEY && location.pathname !== '/' ? (
        <APIProvider
          apiKey={ENVIRONMENTS.GOOGLE_MAPS_API_KEY}
          onError={() => undefined}
        >
          {appContent}
        </APIProvider>
      ) : (
        appContent
      )}
    </I18nProvider>
  );
};

export default App;
