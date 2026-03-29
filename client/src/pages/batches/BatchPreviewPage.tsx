import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import Button from "@/components/inputs/Button";
import {
  PublicPageHero,
  PublicSectionCard,
} from "@/components/layout/PublicPage";
import Table from "@/components/table/Table";
import { Badge } from "@/components/ui/badge";
import PlaceSearch, {
  type PlaceSearchResult,
} from "@/components/inputs/PlaceSearch";
import {
  useGetBatchOrders,
  useCompleteBatch,
} from "@/hooks/batches/batches.hooks";
import { useUpdateOrderMutation } from "@/api/mutations/orders.mutations";
import { validateAndFormatPhoneNumber } from "@/utils/phone.util";
import type { Order } from "@/types/order.type";
import type { UUID } from "@/types";
import { BatchStatus } from "@/types/batch.type";
import { OrderStatus } from "@/types/order.type";
import { User } from "@/types/user.type";
import { ReferenceIdInput } from "@/components/inputs/TableInputs";

interface InlinePhoneEditorProps {
  order: Order;
  onSave: (orderId: UUID, phone: string) => Promise<void>;
  isSaving: boolean;
}

const InlinePhoneEditor = ({
  order,
  onSave,
  isSaving,
}: InlinePhoneEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(order.recipient?.phoneNumber || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPhone = order.recipient?.phoneNumber || "";
  const phoneResult = validateAndFormatPhoneNumber(currentPhone);
  const isValid = phoneResult.isValid;

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isEditing]);

  const handleSave = async () => {
    const result = validateAndFormatPhoneNumber(value);
    if (!result.isValid) {
      toast.error(result.error || "Invalid phone number");
      return;
    }
    if (order?.id) {
      await onSave(order?.id, result.formattedNumber!);
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
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isSaving}
          className="w-36 px-2 py-1 text-[12px] border border-primary-900 rounded focus:outline-none focus:ring-1 focus:ring-primary-900"
          placeholder="+250 7XX XXX XXX"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={`text-[12px] px-2 py-1 rounded border cursor-pointer text-left w-full transition-colors ${
        isValid
          ? "border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-900"
          : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      }`}
      title="Click to edit phone number"
    >
      {currentPhone || <span className="text-slate-400 italic">Not set</span>}
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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<PlaceSearchResult | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const hasLocation = !!(
    order.locationTo?.latitude && order.locationTo?.longitude
  );
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
    await onSave(order?.id, selectedLocation);
    setIsOpen(false);
    setSelectedLocation(null);
  };

  const dropdownContent =
    isOpen && dropdownPos
      ? createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[10000] bg-white border border-slate-200 rounded-xl shadow-xl p-4 space-y-3"
            style={{
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              width: `${dropdownPos.width}px`,
            }}
          >
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Search delivery location
            </p>
            <PlaceSearch
              onLocationSelect={(loc) => setSelectedLocation(loc)}
              placeholder="Search for delivery location..."
              className="relative"
              country="rw"
            />
            {selectedLocation && (
              <div className="p-2 bg-slate-50 rounded-md border">
                <p className="font-normal text-slate-800 text-[12px]">
                  {selectedLocation?.name}
                </p>
                <p className="text-slate-500 text-[12px]">
                  {selectedLocation?.formattedAddress}
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                primary
                onClick={handleSave}
                disabled={!selectedLocation || isSaving}
                isLoading={isSaving}
              >
                Save Location
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSelectedLocation(null);
                }}
              >
                Cancel
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
        disabled={isSaving}
        className="text-[12px] px-2 py-1 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50 cursor-pointer text-left w-full transition-colors disabled:opacity-50"
        title="Click to set delivery location"
      >
        {locationDisplay ? (
          <span className="text-slate-900 text-[12px]">{locationDisplay}</span>
        ) : (
          <span className="text-slate-400 italic text-[12px]">
            Click to set location
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
  placeholder = "Click to edit",
}: InlineTextEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) setTimeout(() => inputRef.current?.focus(), 0);
  }, [isEditing]);

  const handleSave = async () => {
    await onSave(editValue.trim());
    setIsEditing(false);
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
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        disabled={isSaving}
        className="w-full px-2 py-1 text-[12px] border border-primary-900 rounded focus:outline-none focus:ring-1 focus:ring-primary-900"
        placeholder={placeholder}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="text-[12px] px-2 py-1 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50 cursor-pointer text-left w-full transition-colors"
    >
      {value ? (
        <span className="text-slate-900 truncate block max-w-[180px] text-[12px]">
          {value}
        </span>
      ) : (
        <span className="text-slate-400 italic text-[12px]">{placeholder}</span>
      )}
    </button>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const BatchPreviewPage = () => {
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

  const orderValidation = draftOrders.map((order) => {
    const phone = order.recipient?.phoneNumber || "";
    const phoneResult = validateAndFormatPhoneNumber(phone);
    return { orderId: order.id, isValid: phoneResult.isValid };
  });

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
        updateOrderInBatchState(response?.data);
        toast.success("Phone number updated");
      } catch {
        toast.error("Failed to update phone number");
      }
    },
    [updateOrder, updateOrderInBatchState],
  );

  const handleUpdateLocation = useCallback(
    async (orderId: UUID, location: PlaceSearchResult) => {
      try {
        const response = await updateOrder({
          id: orderId,
          order: {
            locationTo: {
              latitude: location.coordinates.latitude,
              longitude: location.coordinates.longitude,
            },
            notes: location.formattedAddress || location.name,
          },
        }).unwrap();
        updateOrderInBatchState(response?.data);
        toast.success("Delivery location updated");
      } catch {
        toast.error("Failed to update location");
      }
    },
    [updateOrder, updateOrderInBatchState],
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
        toast.success("Updated");
      } catch {
        toast.error("Failed to update");
      }
    },
    [updateOrder, updateOrderInBatchState],
  );

  const handleCompleteBatch = useCallback(async () => {
    if (!id) return;
    try {
      await completeBatch({ id: id as UUID }).unwrap();
      toast.success("Batch completed! Orders are now active.");
      navigate("/batches");
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      toast.error(
        message || "Failed to complete batch. Fix validation errors first.",
      );
    }
  }, [id, completeBatch, navigate]);

  const previewColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: "rowNum",
        header: "#",
        cell: ({ row }) => (
          <span className="text-slate-500 tabular-nums">{row.index + 1}</span>
        ),
      },
      {
        header: "Ref",
        accessorKey: "referenceId",
        cell: ({ row }) => (
          <ReferenceIdInput label={row?.original?.referenceId} />
        ),
      },
      {
        id: "recipientPhone",
        header: "Recipient Phone",
        cell: ({ row }) => {
          const isDraftOrder = row.original.status === OrderStatus.DRAFT;
          return (
            <div className="min-w-[140px] whitespace-normal">
              {isDraftOrder ? (
                <InlinePhoneEditor
                  order={row.original}
                  onSave={handleUpdatePhone}
                  isSaving={isUpdating}
                />
              ) : (
                <span className="text-[12px] text-slate-500">
                  {row.original.recipient?.phoneNumber || "—"}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "deliveryLocation",
        header: "Delivery Location",
        cell: ({ row }) => {
          const isDraftOrder = row.original.status === OrderStatus.DRAFT;
          return (
            <div className="min-w-[180px] max-w-[260px] whitespace-normal">
              {isDraftOrder ? (
                <InlineLocationEditor
                  order={row.original}
                  onSave={handleUpdateLocation}
                  isSaving={isUpdating}
                />
              ) : (
                <span className="text-[12px] text-slate-500">
                  {row.original.notes || "—"}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "productRef",
        header: "Product Ref",
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
                  placeholder="Add ref..."
                />
              ) : (
                <span className="text-[12px] text-slate-500">
                  {row.original.externalReferenceId || "—"}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "description",
        header: "Description",
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
                  placeholder="Add description..."
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
        header: "Status",
        cell: ({ row }) => {
          const phoneResult = validateAndFormatPhoneNumber(
            row.original.recipient?.phoneNumber || "",
          );
          const isPhoneValid = phoneResult.isValid;
          const isDraftOrder = row.original.status === OrderStatus.DRAFT;
          return isDraftOrder ? (
            <Badge
              variant={isPhoneValid ? "secondary" : "destructive"}
              className="text-[10px]"
            >
              {isPhoneValid ? "Valid" : "Fix phone"}
            </Badge>
          ) : (
            <Badge variant="default" className="text-[10px]">
              {row.original.status}
            </Badge>
          );
        },
      },
    ],
    [handleUpdateField, handleUpdateLocation, handleUpdatePhone, isUpdating],
  );

  const rowHighlightClassName = useCallback((row: Order) => {
    const phoneResult = validateAndFormatPhoneNumber(
      row.recipient?.phoneNumber || "",
    );
    const isDraftOrder = row.status === OrderStatus.DRAFT;
    return !phoneResult.isValid && isDraftOrder ? "bg-red-50/40" : "";
  }, []);

  if (isFetching) {
    return (
      <main className="w-full flex flex-col gap-6">
        <PublicSectionCard
          title="Loading"
          description="Fetching batch preview…"
        >
          <p className="text-sm text-slate-500 text-center py-8">
            Loading batch...
          </p>
        </PublicSectionCard>
      </main>
    );
  }

  if (!batch) {
    return (
      <main className="w-full flex flex-col gap-6">
        <PublicSectionCard title="Not found">
          <p className="text-sm text-slate-500 text-center py-8">
            Batch not found.
          </p>
        </PublicSectionCard>
      </main>
    );
  }

  return (
    <main className="w-full flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <PublicPageHero
          eyebrow="Batch preview"
          title={
            <span className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-base font-bold">
                {batch.name || "Unnamed Batch"}
              </span>
              <Badge
                variant={
                  batch.status === BatchStatus.DRAFT ? "secondary" : "default"
                }
                className="text-xs font-normal !rounded-md"
              >
                {batch.status}
              </Badge>
            </span>
          }
          description={
            <span className="text-[12px] text-slate-500">
              Ref:{" "}
              <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 text-slate-600">
                {batch.referenceId}
              </code>
              {" · "}
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          }
        />

        {isDraft && invalidCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-md px-5 py-4 sm:px-6"
          >
            <p className="text-sm font-semibold text-amber-800">
              {invalidCount} order{invalidCount !== 1 ? "s" : ""} need
              {invalidCount === 1 ? "s" : ""} attention
            </p>
            <p className="mt-1 text-xs text-amber-700">
              Fix invalid phone numbers before completing the batch. Click any
              cell to edit inline.
            </p>
          </motion.div>
        )}

        {isDraft && canComplete && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-md border border-green-200/90 bg-green-50 px-5 py-4 sm:px-6"
          >
            <p className="text-sm font-normal text-green-800">
              All orders are valid. Ready to complete the batch.
            </p>
          </motion.div>
        )}
      </motion.div>

      <PublicSectionCard
        eyebrow="Orders"
        title="Orders preview"
        description={
          isDraft
            ? "Click any cell to edit inline."
            : "Batch completed — this list is read-only."
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
            noDataMessage="No orders found in this batch."
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
          Back
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
              Complete Batch
            </Button>
          </div>
        )}
      </footer>
    </main>
  );
};

export default BatchPreviewPage;
