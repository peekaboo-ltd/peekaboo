import { UnknownAction } from '@reduxjs/toolkit';
import { useState } from 'react';

export const usePagination = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  return {
    page,
    setPage: setPage as (page: number) => UnknownAction,
    size,
    setSize: setSize as (size: number) => UnknownAction,
    totalPages,
    setTotalPages,
    totalElements,
    setTotalElements,
  };
};
