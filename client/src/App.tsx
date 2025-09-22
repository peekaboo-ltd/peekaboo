import { Toaster } from './components/ui/sonner';
import Router from './routes/Router';

const App = () => {
  return (
    <>
      <Toaster duration={2000} />
      <Router />
    </>
  );
};

export default App;
