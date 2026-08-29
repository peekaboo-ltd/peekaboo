import { useId } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  fieldHelpClassName,
  fieldLabelClassName,
} from '@/components/inputs/control';
import Input from '@/components/inputs/Input';
import {
  contactMethodNeedsEmail,
  PreferredContactMethod,
} from '@/types/order.type';
import { useI18n } from '@/i18n/i18n';

interface ContactMethodPickerProps {
  value?: PreferredContactMethod | null;
  onChange: (method: PreferredContactMethod) => void;
  /** Only read when the chosen method is EMAIL. */
  email?: string | null;
  onEmailChange: (email: string) => void;
  emailError?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}

/**
 * How we should reach the sender about this delivery.
 *
 * A segmented control rather than a radio group: four radios stack to ~116px,
 * a TabsList is one 40px control row. On a page whose whole brief is fitting
 * inside one window, that difference is most of the budget. Options derive from
 * the label map, so adding a method is a one-line change.
 *
 * EMAIL is the only method that needs something the order does not already
 * have, so it — and only it — reveals a field.
 *
 * Note this does NOT use FieldShell. Without an `htmlFor` that component wraps
 * its children in a <label>, which swallows clicks on the buttons inside it and
 * is the wrong element for a group of controls rather than a single input.
 */
const ContactMethodPicker = ({
  value,
  onChange,
  email,
  onEmailChange,
  emailError,
  label,
  description,
  disabled = false,
}: ContactMethodPickerProps) => {
  const emailFieldId = useId();
  const { t } = useI18n();
  const resolvedLabel = label ?? t('publicOrder.contact.label');
  const resolvedDescription = description ?? t('publicOrder.contact.description');
  const groupLabelId = useId();
  const showEmail = contactMethodNeedsEmail(value);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-col gap-1.5">
        <p className={fieldLabelClassName} id={groupLabelId}>
          {resolvedLabel}
        </p>

        {/* Always a controlled value. Passing `undefined` while the order is
            still loading makes Radix treat the group as uncontrolled for the
            rest of its life, after which it tracks its own state and ignores
            the saved one. The empty string means "nothing chosen yet". */}
        <Tabs
          value={value ?? ''}
          onValueChange={(next) => onChange(next as PreferredContactMethod)}
        >
          <TabsList className="w-full" aria-labelledby={groupLabelId}>
            {Object.values(PreferredContactMethod).map((method) => (
              <TabsTrigger key={method} value={method} disabled={disabled} className='data-[state=disabled]:text-(--muted) hover:bg-(--surface-hover)'>
                {t(`publicOrder.contact.${method.toLowerCase()}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {!showEmail && resolvedDescription ? (
          <p className={fieldHelpClassName}>{resolvedDescription}</p>
        ) : null}
      </div>

      {showEmail ? (
        <Input
          id={emailFieldId}
          type="email"
          label={t('publicOrder.contact.emailLabel')}
          placeholder={t('publicOrder.contact.emailPlaceholder')}
          value={email ?? ''}
          onChange={(e) => onEmailChange(e.target.value)}
          description={t('publicOrder.contact.emailHelp')}
          errorMessage={emailError}
          required
        />
      ) : null}
    </div>
  );
};

export default ContactMethodPicker;
