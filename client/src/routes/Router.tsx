import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/home';
import { PublicOrderDetails } from '../pages/public/orders';
import PublicOrderTracking from '@/pages/public/orders/PublicOrderTracking';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/p">
        <Route path="orders">
          <Route path=":id" element={<PublicOrderDetails />} />
          <Route path=":id/tracking" element={<PublicOrderTracking />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;
