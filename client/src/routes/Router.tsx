import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/home';
import { PublicOrderDetails } from '../pages/public/orders';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/public">
        <Route path="orders">
          <Route path=":id" element={<PublicOrderDetails />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;
