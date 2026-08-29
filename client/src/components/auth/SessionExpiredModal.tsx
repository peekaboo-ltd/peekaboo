import Modal from '@/components/Modal';
import { AppDispatch, RootState } from '@/states/store';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/inputs/Button';
import { useCallback } from 'react';
import { setLogout, setSessionExpiredModal } from '@/states/slices/auth.slice';
import { localStorageUtil } from '@/utils/localStorage.util';

const SessionExpiredModal = () => {
  // STATE VARIABLES
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { sessionExpiredModal } = useSelector((state: RootState) => state.auth);

  // HANDLE LOGOUT
  const closeModal = useCallback(() => {
    const currentPath = pathname;
    const currentSearch = search;
    const fullPath = `${currentPath}${currentSearch}`;

    localStorageUtil.setItem('from', fullPath);
    dispatch(setLogout());
    dispatch(setSessionExpiredModal(false));
    navigate('/auth/login');
  }, [dispatch, navigate, pathname, search]);

  return (
    <Modal
      isOpen={sessionExpiredModal}
      onClose={() => {}}
      heading={`Session Expired`}
    >
      <article className="flex flex-col gap-6">
        <p className="text-(--ink) text-sm">{`Your session has expired due to inactivity. Please log in again.`}</p>
        <menu className="flex items-center justify-end gap-3">
          <Button
            primary
            value={`Login`}
            onClick={(e) => {
              e.preventDefault();
              closeModal();
            }}
          />
        </menu>
      </article>
    </Modal>
  );
};

export default SessionExpiredModal;
