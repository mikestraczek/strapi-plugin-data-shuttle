import { useState } from 'react';

export const useForm = (attributes: any) => {
  const [options, setOptions] = useState(attributes);

  const getOption = (key: string) => {
    return options[key];
  };

  const setOption = (key: string, value: any) => {
    setOptions({ ...options, [key]: value });
  };

  return { options, getOption, setOption };
};
