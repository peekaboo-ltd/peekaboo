import type { BaseSyntheticEvent, RefObject } from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faClock,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import type { HomeFormValues } from '../home.types';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';

interface HeroFormCopy {
  formTitle: string;
  formSubtitle: string;
  quickStartLabel: string;
  senderLabel: string;
  senderPlaceholder: string;
  recipientLabel: string;
  recipientPlaceholder: string;
  continueLabel: string;
  haveOrderLabel: string;
  trackHereLabel: string;
  verifiedRidersLabel: string;
  realtimeTrackingLabel: string;
}

interface HeroFormProps {
  formRef: RefObject<HTMLFormElement | null>;
  onSubmit: (event?: BaseSyntheticEvent) => void | Promise<void>;
  control: Control<HomeFormValues>;
  isLoading: boolean;
  copy: HeroFormCopy;
  errors: FieldErrors<HomeFormValues>;
}

const validateRwandanPhone = (value: string | undefined) => {
  if (!value || !value.trim()) {
    return 'Phone number is required';
  }
  const result = validateAndFormatPhoneNumber(value);
  return result.isValid ? true : (result.error ?? 'Invalid phone number');
};

const HeroForm = ({
  formRef,
  onSubmit,
  control,
  isLoading,
  copy,
  errors,
}: HeroFormProps) => (
  <form ref={formRef} onSubmit={onSubmit} className="relative isolate">
    <span
      className="pointer-events-none absolute -inset-6 rounded-[32px] bg-[radial-gradient(circle_at_top,_rgba(95,149,152,0.35),_transparent_70%)] blur-2xl"
      aria-hidden="true"
    />
    <span
      className="pointer-events-none absolute -inset-px rounded-[28px] bg-gradient-to-br from-primary-100/80 via-white to-sky-100/70"
      aria-hidden="true"
    />
    <div className="relative rounded-[26px] bg-white/95 backdrop-blur border border-slate-200 p-8 sm:p-10 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.55)]">
      <header className="space-y-4 mb-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <figure className="flex items-center gap-3">
            <mark className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              <img
                src="/peekaboo.png"
                alt="Peekaboo"
                className="w-14 h-14 object-contain"
              />
            </mark>
            <hgroup>
              <h2 className="text-2xl font-semibold text-slate-900">
                {copy.formTitle}
              </h2>
              <p className="text-slate-500 text-sm font-normal">
                {copy.formSubtitle}
              </p>
            </hgroup>
          </figure>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {copy.quickStartLabel}
          </span>
        </div>
      </header>

      <fieldset className="space-y-4 mb-7">
        <Controller
          name="senderPhoneNumber"
          control={control}
          rules={{ validate: validateRwandanPhone }}
          render={({ field }) => (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <mark className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center text-xs font-normal">
                  1
                </mark>
                {copy.senderLabel}
              </span>
              <Input
                {...field}
                placeholder={copy.senderPlaceholder}
                className={`!rounded-lg focus:!ring-1 transition-all !py-3 !text-sm ${
                  errors.senderPhoneNumber
                    ? '!border-red-400 focus:!border-red-500 focus:!ring-red-500/10 !bg-red-50/30'
                    : '!border-slate-200 focus:!border-slate-900 focus:!ring-slate-900/10 !bg-slate-50 hover:!bg-white'
                }`}
                errorMessage={errors.senderPhoneNumber?.message}
              />
            </label>
          )}
        />
        <Controller
          name="recipientPhoneNumber"
          control={control}
          rules={{ validate: validateRwandanPhone }}
          render={({ field }) => (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <mark className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center text-xs font-normal">
                  2
                </mark>
                {copy.recipientLabel}
              </span>
              <Input
                {...field}
                placeholder={copy.recipientPlaceholder}
                className={`!rounded-lg focus:!ring-1 transition-all !py-3 !text-sm ${
                  errors.recipientPhoneNumber
                    ? '!border-red-400 focus:!border-red-500 focus:!ring-red-500/10 !bg-red-50/30'
                    : '!border-slate-200 focus:!border-slate-900 focus:!ring-slate-900/10 !bg-slate-50 hover:!bg-white'
                }`}
                errorMessage={errors.recipientPhoneNumber?.message}
              />
            </label>
          )}
        />
      </fieldset>

      <footer className="space-y-4">
        <Button
          className="w-full !bg-slate-900 hover:!bg-slate-800 !py-3 !rounded-lg !text-sm !font-medium transition-all duration-200 cursor-pointer !border-0"
          isLoading={isLoading}
          type="submit"
          primary
        >
          {copy.continueLabel}
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </Button>

        <nav className="flex items-center justify-center gap-2 pt-1">
          <span className="text-slate-400 text-xs font-normal">
            {copy.haveOrderLabel}
          </span>
          <Link
            to="/track"
            className="text-slate-900 hover:text-slate-700 text-xs font-medium transition-colors hover:underline underline-offset-2"
          >
            {copy.trackHereLabel} &rarr;
          </Link>
        </nav>
      </footer>

      <aside className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-normal">
        <span className="flex items-center gap-1.5">
          <FontAwesomeIcon
            size="xs"
            icon={faShieldHalved}
            className="text-slate-400"
          />
          {copy.verifiedRidersLabel}
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-300" aria-hidden="true" />
        <span className="flex items-center gap-1.5">
          <FontAwesomeIcon
            size="xs"
            icon={faClock}
            className="text-slate-400"
          />
          {copy.realtimeTrackingLabel}
        </span>
      </aside>
    </div>
  </form>
);

export default HeroForm;
