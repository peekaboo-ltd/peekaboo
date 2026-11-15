import { Toaster } from './components/ui/sonner';
import { Router } from './routes';
import { ScrollToTop } from './components/layout';
import { I18nProvider } from './i18n/i18n';
import { messages } from './i18n/messages';

const App = () => {
  return (
    <I18nProvider messages={messages}>
      <Toaster
        toastOptions={{ style: { fontSize: '11px', fontWeight: '100' } }}
        duration={2000}
      />
      <ScrollToTop />
      <Router />
    </I18nProvider>
  );
};

export default App;
