import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/home';
import { PublicOrderDetails } from '../pages/public/orders';
import PublicOrderTracking from '@/pages/public/orders/PublicOrderTracking';
import PublicLayout from '@/containers/navigation/PublicLayout';
import { NotFoundPage } from '../pages/common';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route path="" element={<Home />} />
      </Route>
      <Route path="/p" element={<PublicLayout />}>
        <Route path="orders">
          <Route path=":id" element={<PublicOrderDetails />} />
          <Route path=":id/tracking" element={<PublicOrderTracking />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Router;
