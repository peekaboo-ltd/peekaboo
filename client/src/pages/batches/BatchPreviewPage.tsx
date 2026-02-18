import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Button from '@/components/inputs/Button';
import { Badge } from '@/components/ui/badge';
import PlaceSearch, { type PlaceSearchResult } from '@/components/inputs/PlaceSearch';
import { useGetBatchOrders, useCompleteBatch } from '@/hooks/batches/batches.hooks';
import { useUpdateOrderMutation } from '@/api/mutations/orders.mutations';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import type { Order } from '@/types/order.type';
import type { UUID } from '@/types';
import { BatchStatus } from '@/types/batch.type';
import { OrderStatus } from '@/types/order.type';

// ─── Inline Phone Editor ────────────────────────────────────────────────────

interface InlinePhoneEditorProps {
  order: Order;
  onSave: (orderId: UUID, phone: string) => Promise<void>;
  isSaving: boolean;
}

const InlinePhoneEditor = ({ order, onSave, isSaving }: InlinePhoneEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(order.recipient?.phoneNumber || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPhone = order.recipient?.phoneNumber || '';
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
      toast.error(result.error || 'Invalid phone number');
      return;
    }
    await onSave(order.id, result.formattedNumber!);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
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
          className="w-36 px-2 py-1 text-xs border border-primary-900 rounded focus:outline-none focus:ring-1 focus:ring-primary-900"
          placeholder="+250 7XX XXX XXX"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={`text-xs px-2 py-1 rounded border cursor-pointer text-left w-full transition-colors ${
        isValid
          ? 'border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-900'
          : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
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

const InlineLocationEditor = ({ order, onSave, isSaving }: InlineLocationEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<PlaceSearchResult | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const hasLocation = !!(order.locationTo?.latitude && order.locationTo?.longitude);
  const locationDisplay = hasLocation
    ? (order.notes || `${order.locationTo!.latitude?.toFixed(4)}, ${order.locationTo!.longitude?.toFixed(4)}`)
    : null;

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 320),
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSelectedLocation(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSelectedLocation(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  const handleSave = async () => {
    if (!selectedLocation) return;
    await onSave(order.id, selectedLocation);
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
              country="rw"
            />
            {selectedLocation && (
              <div className="p-2 bg-slate-50 rounded-lg border text-xs">
                <p className="font-medium text-slate-800">{selectedLocation.name}</p>
                <p className="text-slate-500">{selectedLocation.formattedAddress}</p>
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
        className="text-xs px-2 py-1 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50 cursor-pointer text-left w-full transition-colors disabled:opacity-50"
        title="Click to set delivery location"
      >
        {locationDisplay ? (
          <span className="text-slate-900">{locationDisplay}</span>
        ) : (
          <span className="text-slate-400 italic">Click to set location</span>
        )}
      </button>
      {dropdownContent}
    </>
  );
};

// ─── Inline Text Editor ──────────────────────────────────────────────────────

interface InlineTextEditorProps {
  value?: string | null;
  onSave: (value: string) => Promise<void>;
  isSaving: boolean;
  placeholder?: string;
}

const InlineTextEditor = ({
  value,
  onSave,
  isSaving,
  placeholder = 'Click to edit',
}: InlineTextEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) setTimeout(() => inputRef.current?.focus(), 0);
  }, [isEditing]);

  const handleSave = async () => {
    await onSave(editValue.trim());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(value || '');
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
        className="w-full px-2 py-1 text-xs border border-primary-900 rounded focus:outline-none focus:ring-1 focus:ring-primary-900"
        placeholder={placeholder}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="text-xs px-2 py-1 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50 cursor-pointer text-left w-full transition-colors"
    >
      {value ? (
        <span className="text-slate-900 truncate block max-w-[180px]">{value}</span>
      ) : (
        <span className="text-slate-400 italic">{placeholder}</span>
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
    const phone = order.recipient?.phoneNumber || '';
    const phoneResult = validateAndFormatPhoneNumber(phone);
    return { orderId: order.id, isValid: phoneResult.isValid };
  });

  const invalidCount = orderValidation.filter((v) => !v.isValid).length;
  const canComplete = invalidCount === 0 && draftOrders.length > 0;
  const isDraft = batch?.status === BatchStatus.DRAFT;

  const handleUpdatePhone = useCallback(
    async (orderId: UUID, phone: string) => {
      try {
        await updateOrder({
          id: orderId,
          order: { recipient: { phoneNumber: phone } as any },
        }).unwrap();
        // Refetch batch to get updated data
        if (id) fetchBatchOrders(id as UUID);
        toast.success('Phone number updated');
      } catch {
        toast.error('Failed to update phone number');
      }
    },
    [updateOrder, id, fetchBatchOrders],
  );

  const handleUpdateLocation = useCallback(
    async (orderId: UUID, location: PlaceSearchResult) => {
      try {
        await updateOrder({
          id: orderId,
          order: {
            locationTo: {
              latitude: location.coordinates.latitude,
              longitude: location.coordinates.longitude,
            },
            notes: location.formattedAddress || location.name,
          },
        }).unwrap();
        if (id) fetchBatchOrders(id as UUID);
        toast.success('Delivery location updated');
      } catch {
        toast.error('Failed to update location');
      }
    },
    [updateOrder, id, fetchBatchOrders],
  );

  const handleUpdateField = useCallback(
    async (orderId: UUID, field: 'externalReferenceId' | 'description', value: string) => {
      try {
        await updateOrder({
          id: orderId,
          order: { [field]: value || null },
        }).unwrap();
        if (id) fetchBatchOrders(id as UUID);
        toast.success('Updated');
      } catch {
        toast.error('Failed to update');
      }
    },
    [updateOrder, id, fetchBatchOrders],
  );

  const handleCompleteBatch = useCallback(async () => {
    if (!id) return;
    try {
      await completeBatch({ id: id as UUID }).unwrap();
      toast.success('Batch completed! Orders are now active.');
      navigate('/batches');
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      toast.error(message || 'Failed to complete batch. Fix validation errors first.');
    }
  }, [id, completeBatch, navigate]);

  if (isFetching) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-sm text-slate-500">Loading batch...</div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-sm text-slate-500">Batch not found.</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">
              {batch.name || 'Unnamed Batch'}
            </h1>
            <Badge
              variant={batch.status === BatchStatus.DRAFT ? 'secondary' : 'default'}
              className="text-xs"
            >
              {batch.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Ref: <code className="font-mono text-xs bg-slate-100 px-1 rounded">{batch.referenceId}</code>
            {' · '}{orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" onClick={() => navigate('/batches')}>
            Back to Batches
          </Button>
          {isDraft && (
            <Button
              type="button"
              primary
              onClick={handleCompleteBatch}
              disabled={!canComplete || isCompleting}
              isLoading={isCompleting}
            >
              Complete Batch
            </Button>
          )}
        </div>
      </header>

      {/* Validation Banner */}
      {isDraft && invalidCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3"
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {invalidCount} order{invalidCount !== 1 ? 's' : ''} need{invalidCount === 1 ? 's' : ''} attention
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Fix invalid phone numbers before completing the batch. Click any cell to edit inline.
            </p>
          </div>
        </motion.div>
      )}

      {isDraft && canComplete && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3"
        >
          <p className="text-sm font-semibold text-green-800">
            All orders are valid. Ready to complete the batch.
          </p>
        </motion.div>
      )}

      {/* Orders Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Orders Preview
          </h2>
          <span className="text-xs text-slate-500">
            {isDraft ? 'Click any cell to edit inline' : 'Batch completed — read-only'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 text-slate-700 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">#</th>
                <th className="px-3 py-2 font-semibold">Ref</th>
                <th className="px-3 py-2 font-semibold">Recipient Phone</th>
                <th className="px-3 py-2 font-semibold">Delivery Location</th>
                <th className="px-3 py-2 font-semibold">Product Ref</th>
                <th className="px-3 py-2 font-semibold">Description</th>
                <th className="px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const phoneResult = validateAndFormatPhoneNumber(
                  order.recipient?.phoneNumber || '',
                );
                const isPhoneValid = phoneResult.isValid;
                const isDraftOrder = order.status === OrderStatus.DRAFT;

                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-b border-slate-100 ${!isPhoneValid && isDraftOrder ? 'bg-red-50/40' : ''}`}
                  >
                    <td className="px-3 py-2 text-slate-500">{index + 1}</td>
                    <td className="px-3 py-2">
                      <code className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-600">
                        {order.referenceId}
                      </code>
                    </td>
                    <td className="px-3 py-2 min-w-[160px]">
                      {isDraftOrder ? (
                        <InlinePhoneEditor
                          order={order}
                          onSave={handleUpdatePhone}
                          isSaving={isUpdating}
                        />
                      ) : (
                        <span>{order.recipient?.phoneNumber || '—'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 min-w-[200px]">
                      {isDraftOrder ? (
                        <InlineLocationEditor
                          order={order}
                          onSave={handleUpdateLocation}
                          isSaving={isUpdating}
                        />
                      ) : (
                        <span>{order.notes || '—'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 min-w-[140px]">
                      {isDraftOrder ? (
                        <InlineTextEditor
                          value={order.externalReferenceId}
                          onSave={(val) => handleUpdateField(order.id, 'externalReferenceId', val)}
                          isSaving={isUpdating}
                          placeholder="Add ref..."
                        />
                      ) : (
                        <span>{order.externalReferenceId || '—'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 min-w-[160px]">
                      {isDraftOrder ? (
                        <InlineTextEditor
                          value={order.description}
                          onSave={(val) => handleUpdateField(order.id, 'description', val)}
                          isSaving={isUpdating}
                          placeholder="Add description..."
                        />
                      ) : (
                        <span>{order.description || '—'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isDraftOrder ? (
                        <Badge
                          variant={isPhoneValid ? 'secondary' : 'destructive'}
                          className="text-[10px]"
                        >
                          {isPhoneValid ? 'Valid' : 'Fix phone'}
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px]">
                          {order.status}
                        </Badge>
                      )}
                    </td>
                  </motion.tr>
                );
              })}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No orders found in this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Batch Footer */}
      {isDraft && (
        <div className="flex justify-end pt-2">
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
    </motion.div>
  );
};

export default BatchPreviewPage;
