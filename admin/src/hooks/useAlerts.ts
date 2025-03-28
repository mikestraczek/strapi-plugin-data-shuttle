import { useRef, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';

const init = {
  loading: true,
  alerts: [],
  notify: () => {},
  removeAlert: () => {},
};

type Alert = {
  id: number;
  timeout: NodeJS.Timeout;
  variant: string;
  title: string;
  message: string;
};

const useAlertsImpl = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [idCount, setIdCount] = useState(0);

  const alertsRef = useRef(alerts);

  alertsRef.current = alerts;

  const notify = (title: string, message: string, variant = 'default') => {
    const alert = {
      id: idCount,
      timeout: setTimeout(() => removeAlert(idCount), 8000),
      variant,
      title,
      message,
    };
    setAlerts(alerts.concat(alert));
    setIdCount(idCount + 1);
  };

  const removeAlert = (id: number) => {
    const alerts = alertsRef.current;
    const alert = alerts.find((a) => a.id === id);

    if (alert) {
      clearTimeout(alert.timeout);
    }

    const alertsFiltered = alerts.filter((a) => a.id !== id);

    setAlerts(alertsFiltered);
  };

  return {
    alerts,
    notify,
    removeAlert,
    loading: false,
  };
};

export const useAlerts = singletonHook(init, useAlertsImpl);
