import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import Button from "@/components/inputs/Button";
import TelInput from "@/components/inputs/TelInput";
import {
  PublicPageHero,
  PublicSectionCard,
} from "@/components/layout/PublicPage";
import Table from "@/components/table/Table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PlaceSearch, {
  type PlaceSearchResult,
} from "@/components/inputs/PlaceSearch";
import {
  useGetBatchOrders,
  useCompleteBatch,
} from "@/hooks/batches/batches.hooks";
import { useUpdateOrderMutation } from "@/api/mutations/orders.mutations";
import { validateAndFormatPhoneNumber } from "@/utils/phone.util";
import { validateDeliveryLocation } from "@/utils/location.util";
import { parseApiError, formatErrorForToast } from "@/utils/errorHandler.util";
import type { Order } from "@/types/order.type";
import type { UUID } from "@/types";
import { BatchStatus } from "@/types/batch.type";
import { OrderStatus } from "@/types/order.type";
import { User } from "@/types/user.type";
import { ReferenceIdInput } from "@/components/inputs/TableInputs";
import { controlClassName } from '@/components/inputs/control';
import { cn } from '@/lib/utils';
import { useI18n, type I18nContextValue } from '@/i18n/i18n';

interface InlinePhoneEditorProps {
  order: Order;
  onSave: (orderId: UUID, phone: string) => Promise<void>;
  isSaving: boolean;
}

const getRecipientPhone = (order: Order) =>
  order.recipient?.phoneNumber || order.recipientPhoneNumber || "";

const getDraftOrderValidation = (order: Order, t: I18nContextValue['t']) => {
  const issues: string[] = [];
  const phoneResult = validateAndFormatPhoneNumber(getRecipientPhone(order));

  if (!phoneResult.isValid) {
    issues.push(t('batch.invalidRecipientPhone'));
  }

  const locationResult = validateDeliveryLocation(order.locationTo);
  if (!locationResult.isValid) {
    issues.push(t('batch.locationRequired'));
  }

  return {
    orderId: order.id,
    isValid: issues.length === 0,
    issues,
  };
};

const InlinePhoneEditor = ({
  order,
  onSave,
  isSaving,
}: InlinePhoneEditorProps) => {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(getRecipientPhone(order));
  const [localSaving, setLocalSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPhone = getRecipientPhone(order);
  const phoneResult = validateAndFormatPhoneNumber(currentPhone);
  const isValid = phoneResult.isValid;

  useEffect(() => {
    if (!isEditing) {
      setValue(currentPhone);
    }
  }, [currentPhone, isEditing]);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isEditing]);

  const handleSave = async () => {
    const result = validateAndFormatPhoneNumber(value);
    if (!result.isValid) {
      toast.error(t('batch.invalidRecipientPhone'));
      return;
    }
    if (order?.id) {
      setLocalSaving(true);
      try {
        await onSave(order?.id, result.e164!);
      } finally {
        setLocalSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setValue(currentPhone);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <TelInput
          ref={inputRef}
          value={value}
          onChange={setValue}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isSaving || localSaving}
          className="w-56"
          placeholder="0788 123 456"
        />
        {(isSaving || localSaving) && (
          <Spinner />
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      disabled={isSaving || localSaving}
      className={`text-xs px-2 py-1 rounded border cursor-pointer text-left w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${ isValid ? "border-transparent hover:border-(--line) hover:bg-(--surface) text-(--ink)" : "border-(--line) bg-(--surface) text-(--ink) hover:bg-(--surface)" }`}
      title={t('batch.editPhone')}
    >
      {currentPhone || <span className="text-(--muted)">{t('batch.notSet')}</span>}
    </button>
  );
};

// ─── Inline Location Editor ─────────────────────────────────────────────────

interface InlineLocationEditorProps {
  order: Order;
  onSave: (orderId: UUID, location: PlaceSearchResult) => Promise<void>;
  isSaving: boolean;
}

const InlineLocationEditor = ({
  order,
  onSave,
  isSaving,
}: InlineLocationEditorProps) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<PlaceSearchResult | null>(null);
  const [localSaving, setLocalSaving] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const locationResult = validateDeliveryLocation(order.locationTo);
  const hasLocation = locationResult.isValid;
  const locationDisplay = hasLocation
    ? order.notes ||
      `${order.locationTo!.latitude?.toFixed(4)}, ${order.locationTo!.longitude?.toFixed(4)}`
    : null;

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 320),
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        target instanceof Element &&
        target.closest("[data-place-search-dropdown]")
      ) {
        return;
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setIsOpen(false);
        setSelectedLocation(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSelectedLocation(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  const handleSave = async () => {
    if (!selectedLocation) return;
    if (!order?.id) return;
    setLocalSaving(true);
    try {
      await onSave(order?.id, selectedLocation);
      setIsOpen(false);
      setSelectedLocation(null);
    } finally {
      setLocalSaving(false);
    }
  };

  const dropdownContent =
    isOpen && dropdownPos
      ? createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[10000] space-y-3 rounded-(--radius-control) border border-(--line) bg-(--paper) p-4 shadow-(--shadow-menu)"
            style={{
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              width: `${dropdownPos.width}px`,
            }}
          >
            <p className="text-[0.8125rem] text-(--ink)">
              {t('batch.deliveryLocation')}
            </p>
            <PlaceSearch
              onLocationSelect={(loc) => setSelectedLocation(loc)}
              placeholder={t('batch.searchDelivery')}
              className="relative"
              country="rw"
            />
            {selectedLocation && (
              <div className="p-2 bg-(--surface) rounded-md border">
                <p className="font-normal text-(--ink) text-xs">
                  {selectedLocation?.name}
                </p>
                <p className="text-(--muted) text-xs">
                  {selectedLocation?.formattedAddress}
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                primary
                onClick={handleSave}
                disabled={!selectedLocation || isSaving || localSaving}
                isLoading={isSaving || localSaving}
              >
                {t('location.save')}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSelectedLocation(null);
                }}
                disabled={localSaving}
              >
                {t('users.cancel')}
              </Button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSaving || localSaving}
        className={`text-xs px-2 py-1 rounded border cursor-pointer text-left w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${ hasLocation ? "border-transparent hover:border-(--line) hover:bg-(--surface)" : "border-(--line) bg-(--surface) hover:bg-(--surface)" }`}
        title={t('batch.setLocation')}
      >
        {locationDisplay ? (
          <span className="text-(--ink) text-xs">{locationDisplay}</span>
        ) : (
          <span className="text-(--muted) italic text-xs">
            {t('batch.setLocation')}
          </span>
        )}
      </button>
      {dropdownContent}
    </>
  );
};

// ─── Inline Text Editor ──────────────────────────────────────────────────────

interface InlineTextEditorProps {
  value?: string | null;
  onSave: (value?: string | null | undefined | UUID) => Promise<void>;
  isSaving: boolean;
  placeholder?: string;
}

const InlineTextEditor = ({
  value,
  onSave,
  isSaving,
  placeholder,
}: InlineTextEditorProps) => {
  const { t } = useI18n();
  const resolvedPlaceholder = placeholder ?? t('common.actions.edit');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [localSaving, setLocalSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) setTimeout(() => inputRef.current?.focus(), 0);
  }, [isEditing]);

  const handleSave = async () => {
    setLocalSaving(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } finally {
      setLocalSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditValue(value || "");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isSaving || localSaving}
          className={cn(controlClassName, 'px-3 disabled:opacity-50')}
          placeholder={resolvedPlaceholder}
        />
        {(isSaving || localSaving) && (
          <Spinner />
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      disabled={isSaving || localSaving}
      className="text-xs px-2 py-1 rounded border border-transparent hover:border-(--line) hover:bg-(--surface) cursor-pointer text-left w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {value ? (
        <span className="text-(--ink) truncate block max-w-[180px] text-xs">
          {value}
        </span>
      ) : (
        <span className="text-(--muted) italic text-xs">{resolvedPlaceholder}</span>
      )}
    </button>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const BatchPreviewPage = () => {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchBatchOrders, batch, setBatch, isFetching } = useGetBatchOrders();
  const { completeBatch, isLoading: isCompleting } = useCompleteBatch();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

  useEffect(() => {
    if (id) {
      fetchBatchOrders(id as UUID);
    }
  }, [id, fetchBatchOrders]);

  const orders = batch?.orders || [];
  const draftOrders = orders.filter((o) => o.status === OrderStatus.DRAFT);

  const orderValidation = draftOrders.map((order) => getDraftOrderValidation(order, t));

  const invalidCount = orderValidation.filter((v) => !v.isValid).length;
  const canComplete = invalidCount === 0 && draftOrders.length > 0;
  const isDraft = batch?.status === BatchStatus.DRAFT;

  const updateOrderInBatchState = useCallback(
    (updatedOrder: Order | undefined) => {
      if (!updatedOrder?.id) return;

      setBatch((prev) =>
        prev
          ? {
              ...prev,
              orders: prev.orders?.map((order) =>
                order.id === updatedOrder.id
                  ? { ...order, ...updatedOrder }
                  : order,
              ),
            }
          : prev,
      );
    },
    [setBatch],
  );

  const handleUpdatePhone = useCallback(
    async (orderId: UUID, phone: string) => {
      try {
        const response = await updateOrder({
          id: orderId,
          order: { recipient: { phoneNumber: phone } as unknown as User },
        }).unwrap();
        updateOrderInBatchState({
          ...response?.data,
          id: orderId,
          recipientPhoneNumber: response?.data?.recipientPhoneNumber || phone,
          recipient: {
            ...(response?.data?.recipient || {}),
            phoneNumber: response?.data?.recipient?.phoneNumber || phone,
          } as User,
        } as Order);
        toast.success(t('batch.phoneUpdated'), { duration: 2000 });
      } catch (error) {
        toast.error(formatErrorForToast(error));
      }
    },
    [t, updateOrder, updateOrderInBatchState],
  );

  const handleUpdateLocation = useCallback(
    async (orderId: UUID, location: PlaceSearchResult) => {
      const locationTo = {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
      };
      const notes = location.formattedAddress || location.name;

      try {
        const response = await updateOrder({
          id: orderId,
          order: {
            locationTo,
            notes,
          },
        }).unwrap();
        updateOrderInBatchState({
          ...response?.data,
          id: orderId,
          locationTo: response?.data?.locationTo || locationTo,
          notes: response?.data?.notes || notes,
        } as Order);
        toast.success(t('batch.locationUpdated'), { duration: 2000 });
      } catch (error) {
        toast.error(formatErrorForToast(error));
      }
    },
    [t, updateOrder, updateOrderInBatchState],
  );

  const handleUpdateField = useCallback(
    async (
      orderId: UUID | undefined,
      field: "externalReferenceId" | "description",
      value: string | null | undefined,
    ) => {
      if (!orderId) return;
      try {
        const response = await updateOrder({
          id: orderId,
          order: { [field]: value || null },
        }).unwrap();
        updateOrderInBatchState(response?.data);
        toast.success(t('batch.fieldUpdated'), { duration: 2000 });
      } catch (error) {
        toast.error(formatErrorForToast(error));
      }
    },
    [t, updateOrder, updateOrderInBatchState],
  );

  const handleCompleteBatch = useCallback(async () => {
    if (!id) return;
    try {
      await completeBatch({ id: id as UUID }).unwrap();
      toast.success(t('batch.completedSuccess'));
      navigate("/batches");
    } catch (error) {
      const parsed = parseApiError(error);
      toast.error(parsed.message);
      
      // If there are validation errors, they're already in the preview table
      if (parsed.allErrors.length > 0) {
        toast.error(t('batch.validationErrors', { count: parsed.allErrors.length }), {
          duration: 5000,
        });
      }
    }
  }, [id, completeBatch, navigate, t]);

  const previewColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: "rowNum",
        header: "#",
        cell: ({ row }) => (
          <span className="text-(--muted) tabular-nums">{row.index + 1}</span>
        ),
      },
      {
        header: t('batches.reference'),
        accessorKey: "referenceId",
        cell: ({ row }) => (
          <ReferenceIdInput label={row?.original?.referenceId} />
        ),
      },
      {
        id: "recipientPhone",
        header: t('batch.recipientPhone'),
        cell: ({ row }) => {
          const isDraftOrder = row.original.status === OrderStatus.DRAFT;
          const phoneResult = validateAndFormatPhoneNumber(getRecipientPhone(row.original));
          const hasError = isDraftOrder && !phoneResult.isValid;
          
          return (
            <div className={`min-w-[140px] whitespace-normal ${hasError ? 'border-l-2 border-(--ink) pl-2' : ''}`}>
              {isDraftOrder ? (
                <InlinePhoneEditor
                  order={row.original}
                  onSave={handleUpdatePhone}
                  isSaving={isUpdating}
                />
              ) : (
                <span className="type-meta">
                  {row.original.recipient?.phoneNumber || "—"}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "deliveryLocation",
        header: t('batch.deliveryLocation'),
        cell: ({ row }) => {
          const isDraftOrder = row.original.status === OrderStatus.DRAFT;
          const locationResult = validateDeliveryLocation(row.original.locationTo);
          const hasError = isDraftOrder && !locationResult.isValid;
          
          return (
            <div className={`min-w-[180px] max-w-[260px] whitespace-normal ${hasError ? 'border-l-2 border-(--ink) pl-2' : ''}`}>
              {isDraftOrder ? (
                <InlineLocationEditor
                  order={row.original}
                  onSave={handleUpdateLocation}
                  isSaving={isUpdating}
                />
              ) : (
                <span className="type-meta">
                  {row.original.notes || "—"}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "productRef",
        header: t('batch.productRef'),
        cell: ({ row }) => {
          const isDraftOrder = row.original.status === OrderStatus.DRAFT;
          return (
            <div className="min-w-[120px] whitespace-normal">
              {isDraftOrder ? (
                <InlineTextEditor
                  value={row.original.externalReferenceId}
                  onSave={(val) =>
                    handleUpdateField(
                      row.original?.id,
                      "externalReferenceId",
                      val,
                    )
                  }
                  isSaving={isUpdating}
                  placeholder={t('batch.addReference')}
                />
              ) : (
                <span className="type-meta">
                  {row.original.externalReferenceId || "—"}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "description",
        header: t('batch.descriptionField'),
        cell: ({ row }) => {
          const isDraftOrder = row.original.status === OrderStatus.DRAFT;
          return (
            <div className="min-w-[140px] max-w-[220px] whitespace-normal">
              {isDraftOrder ? (
                <InlineTextEditor
                  value={row.original.description}
                  onSave={(val) =>
                    handleUpdateField(row.original.id, "description", val)
                  }
                  isSaving={isUpdating}
                  placeholder={t('batch.addDescription')}
                />
              ) : (
                <span>{row.original.description || "—"}</span>
              )}
            </div>
          );
        },
      },
      {
        id: "previewStatus",
        header: t('common.status'),
        cell: ({ row }) => {
          const isDraftOrder = row.original.status === OrderStatus.DRAFT;
          const validation = getDraftOrderValidation(row.original, t);
          
          if (!isDraftOrder) {
            return (
              <Badge variant="default" className="text-xs">
                {t(`status.${row.original.status.toLowerCase()}`)}
              </Badge>
            );
          }

          if (validation.isValid) {
            return (
              <Badge variant="secondary" className="text-xs">
                {t('batch.valid')}
              </Badge>
            );
          }

          return (
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-left">
                  <Badge
                    variant="destructive"
                    className="text-xs cursor-pointer hover:bg-(--surface)"
                  >
                    {t('batch.issues', { count: validation.issues.length })}
                  </Badge>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <h4 className="type-label">
                    {t('batch.validationIssues')}
                  </h4>
                  <ul className="space-y-1">
                    {validation.issues.map((issue, idx) => (
                      <li key={idx} className="text-xs text-(--ink) flex items-start gap-2">
                        <span className="text-(--ink) mt-0.5">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          );
        },
      },
    ],
    [handleUpdateField, handleUpdateLocation, handleUpdatePhone, isUpdating, t],
  );

  const rowHighlightClassName = useCallback((row: Order) => {
    const isDraftOrder = row.status === OrderStatus.DRAFT;
    return !getDraftOrderValidation(row, t).isValid && isDraftOrder ? "bg-(--surface)" : "";
  }, [t]);

  if (isFetching) {
    return (
      <main className="w-full flex flex-col gap-6">
        <PublicSectionCard
          title={t('batch.loading')}
          description={t('batch.fetching')}
        >
          <p className="text-sm text-(--muted) text-center py-8">
            {t('batch.fetching')}
          </p>
        </PublicSectionCard>
      </main>
    );
  }

  if (!batch) {
    return (
      <main className="w-full flex flex-col gap-6">
        <PublicSectionCard title={t('batch.notFoundTitle')}>
          <p className="text-sm text-(--muted) text-center py-8">
            {t('batch.notFound')}
          </p>
        </PublicSectionCard>
      </main>
    );
  }

  return (
    <main className="w-full flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-4"
      >
        <PublicPageHero
          eyebrow={t('batch.previewEyebrow')}
          title={
            <span className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-base font-normal">
                {batch.name || t('batch.unnamed')}
              </span>
              <Badge
                variant={
                  batch.status === BatchStatus.DRAFT ? "secondary" : "default"
                }
                size="sm"
              >
                {t(`status.${batch.status.toLowerCase()}`)}
              </Badge>
            </span>
          }
          description={
            <span className="type-meta">
              {t('batches.reference')}:{" "}
              <code className="text-xs bg-(--surface) px-1.5 py-0.5 rounded text-(--muted)">
                {batch.referenceId}
              </code>
              {" · "}
              {t('batch.orderCount', { count: orders.length })}
            </span>
          }
        />

        {isDraft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`overflow-hidden rounded-xl px-5 py-4 sm:px-6 ${ canComplete ? "border-(--line) bg-(--surface)" : "border-(--line) bg-(--surface)" }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className={`text-sm font-normal ${
                  canComplete ? "text-(--ink)" : "text-(--ink)"
                }`}>
                  {canComplete ? `✓ ${t('batch.readyTitle')}` : `⚠ ${t('batch.validationSummary')}`}
                </h3>
                <div className="mt-2 space-y-1">
                  <p className={`text-xs ${
                    canComplete ? "text-(--ink)" : "text-(--ink)"
                  }`}>
                    {t('batch.validatedCount', { valid: draftOrders.length - invalidCount, total: draftOrders.length })}
                  </p>
                  {invalidCount > 0 && (
                    <>
                      <p className="text-[0.8125rem] text-(--ink)">
                        • {t('batch.invalidPhoneCount', { count: draftOrders.filter(order => !validateAndFormatPhoneNumber(getRecipientPhone(order)).isValid).length })}
                      </p>
                      <p className="text-[0.8125rem] text-(--ink)">
                        • {t('batch.missingLocationCount', { count: draftOrders.filter(order => !validateDeliveryLocation(order.locationTo).isValid).length })}
                      </p>
                    </>
                  )}
                </div>
                {canComplete ? (
                  <p className="mt-2 text-xs text-(--ink)">
                    {t('batch.allValid')}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-(--ink)">
                    {t('batch.fixErrors')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <PublicSectionCard
        eyebrow={t('batches.orders')}
        title={t('batch.previewTitle')}
        description={
          isDraft
            ? t('batch.previewEditable')
            : t('batch.previewReadonly')
        }
        contentClassName="px-0 pb-0 pt-0 sm:px-0"
      >
        <div className="px-0 sm:px-0">
          <Table<Order, unknown>
            columns={previewColumns}
            data={orders}
            showPagination={false}
            manualPagination={false}
            page={0}
            size={Math.max(orders.length, 1)}
            isLoading={false}
            noDataMessage={t('batch.previewEmpty')}
            rowClassName={rowHighlightClassName}
          />
        </div>
      </PublicSectionCard>

      <footer>
        <Button
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          {t('common.actions.back')}
        </Button>
        {isDraft && (
          <div className="flex justify-end">
            <Button
              type="button"
              primary
              onClick={handleCompleteBatch}
              disabled={!canComplete || isCompleting}
              isLoading={isCompleting}
            >
              {t('batch.complete')}
            </Button>
          </div>
        )}
      </footer>
    </main>
  );
};

export default BatchPreviewPage;
