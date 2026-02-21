import { Toaster } from './components/ui/sonner';
import { Router } from './routes';
import { I18nProvider } from './i18n/i18n';
import { messages } from './i18n/messages';

const App = () => {
  return (
    <I18nProvider messages={messages}>
      <Toaster style={{ fontSize: 11 }} duration={2000} />
      <Router />
    </I18nProvider>
  );
};

export default App;
