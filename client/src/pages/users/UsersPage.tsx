import Table from '@/components/table/Table';
import { useUsersColumns } from '@/hooks/users/columns.users';
import { useFetchUsers } from '@/hooks/users/users.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { useEffect } from 'react';
import CreateUserModal from './CreateUserModal';
import { setCreateUserModal } from '@/states/slices/user.slice';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const UsersPage = () => {
  const dispatch = useAppDispatch();
  const { usersList, createUserModal } = useAppSelector((state) => state.user);

  const {
    fetchUsers,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
    isFetching,
  } = useFetchUsers();

  useEffect(() => {
    if (!createUserModal) {
      fetchUsers({ page, size });
    }
  }, [fetchUsers, page, size, createUserModal]);

  const { usersColumns } = useUsersColumns();

  return (
    <main className="w-full flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Users</h1>
        <Button
          primary
          onClick={() => dispatch(setCreateUserModal(true))}
          className="flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add User
        </Button>
      </header>
      <Table
        columns={usersColumns}
        data={usersList}
        showPagination={true}
        page={page}
        setPage={setPage}
        size={size}
        setSize={setSize}
        totalPages={totalPages}
        totalCount={totalCount}
        isLoading={isFetching}
      />
      <CreateUserModal />
    </main>
  );
};

export default UsersPage;
