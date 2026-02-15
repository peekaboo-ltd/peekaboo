import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/states/store';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import { localStorageUtil } from '@/utils/localStorage.util';
import { setSessionExpiredModal } from '@/states/slices/auth.slice';

const INACTIVITY_TIMEOUT =
  parseInt(ENVIRONMENTS.inactivityTimeout || '30') * 60 * 1000; // 30 MINUTES

export const useInactivityTimeout = () => {
  const dispatch: AppDispatch = useDispatch();

  const resetTimer = useCallback(() => {
    if (window.inactivityTimeout) {
      clearTimeout(window.inactivityTimeout);
    }

    window.inactivityTimeout = setTimeout(() => {
      localStorageUtil.clearAll();
      dispatch(setSessionExpiredModal(true));
    }, INACTIVITY_TIMEOUT);
  }, [dispatch]);

  useEffect(() => {
    resetTimer();

    const activityEvents = [
      // MOUSE EVENTS
      'mousedown',
      'mousemove',
      'click',
      'dblclick',
      'contextmenu',
      'wheel',

      // KEYBOARD EVENTS
      'keydown',
      'keyup',
      'keypress',

      // TOUCH EVENTS
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel',

      // POINTER EVENTS (includes stylus, pen, etc.)
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel',

      // FOCUS EVENTS
      'focus',
      'blur',

      // FORM/INPUT EVENTS
      'input',
      'change',
      'submit',

      // SCROLL EVENTS
      'scroll',

      // VISIBILITY CHANGE EVENTS
      'visibilitychange',

      // DRAG EVENTS
      'drag',
      'dragstart',
      'dragend',
      'dragover',
      'dragenter',
      'dragleave',
      'drop',

      // CLIPBOARD EVENTS
      'copy',
      'cut',
      'paste',

      // COMPOSITION EVENTS (for IMEs)
      'compositionstart',
      'compositionupdate',
      'compositionend',

      // MEDIA EVENTS
      'play',
      'pause',
      'volumechange',
      'seeking',
      'seeked',

      // GAMEPAD EVENTS (edge case)
      'gamepadconnected',
      'gamepaddisconnected',
    ];

    const handleActivity = () => {
      if (document.visibilityState === 'visible') {
        resetTimer();
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (window.inactivityTimeout) {
        clearTimeout(window.inactivityTimeout);
      }
    };
  }, [resetTimer]);
};

declare global {
  interface Window {
    inactivityTimeout?: NodeJS.Timeout;
  }
}
