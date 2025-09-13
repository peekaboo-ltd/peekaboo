import { useGetAdministrativeDivisionsMutation } from '@/api/mutations/external.mutations';
import { useEffect, useState } from 'react';

export interface AdministrativeDivision {
  village: string;
  cell: string;
  district: string;
  sector: string;
  province: string;
}

export const useGetAdministrativeDivisions = () => {
  const [administrativeDivisions, setAdministrativeDivisions] = useState<
    AdministrativeDivision | undefined
  >(undefined);

  const [getAdministrativeDivisions, { data, error, isLoading, reset }] =
    useGetAdministrativeDivisionsMutation();

  useEffect(() => {
    if (data) {
      setAdministrativeDivisions(data);
      reset();
    }
  }, [data, reset]);

  return {
    getAdministrativeDivisions,
    data,
    error,
    isLoading,
    reset,
    administrativeDivisions,
    setAdministrativeDivisions,
  };
};
