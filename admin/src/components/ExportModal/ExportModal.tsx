import {
  Modal,
  Button,
  Typography,
  Flex,
  Grid,
  Loader,
  SingleSelect,
  SingleSelectOption,
  Checkbox,
} from '@strapi/design-system';
import { Download } from '@strapi/icons'; // Add this import for the Download icon
import pick from 'lodash/pick';
import range from 'lodash/range';
import qs from 'qs';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFetchClient } from '@strapi/admin/strapi-admin';

import pluginId from '../../utils/pluginId';
import { useAlerts } from '../../hooks/useAlerts';
import { useDownloadFile } from '../../hooks/useDownloadFile';
import { useI18n } from '../../hooks/useI18n';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useSlug } from '../../hooks/useSlug';
import { dataFormatConfigs, dataFormats } from '../../utils/dataFormats';
import { handleRequestErr } from '../../utils/error';
import { Editor } from '../Editor';

const DEFAULT_OPTIONS = {
  exportFormat: dataFormats.CSV,
  applyFilters: false,
  relationsAsId: false,
  deepness: 5,
  exportPluginsContentTypes: false,
};

type ExportModalProps = {
  availableExportFormats?: string[];
  onClose?: () => void;
};

export const ExportModal = ({
  availableExportFormats = [dataFormats.CSV],
  onClose,
}: ExportModalProps) => {
  const { i18n } = useI18n();
  const { search } = useLocation();
  const { downloadFile, withTimestamp } = useDownloadFile();
  const { slug } = useSlug();
  const { notify } = useAlerts();
  const { getPreferences } = useLocalStorage();
  const { post } = useFetchClient();

  const [options, setOptions] = useState(() => ({ ...DEFAULT_OPTIONS, ...getPreferences() }));
  const [data, setData] = useState<any>(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSetOption = (optionName: string) => (value: any) => {
    setOptions((previous: any) => ({ ...previous, [optionName]: value }));
  };

  const getData = async () => {
    setFetchingData(true);

    try {
      const res = await post(`/${pluginId}/export/contentTypes`, {
        data: {
          slug,
          search: qs.stringify(pick(qs.parse(search), ['filters', 'sort'])),
          applySearch: options.applyFilters,
          exportFormat: options.exportFormat,
          relationsAsId: options.relationsAsId,
          deepness: options.deepness,
          exportPluginsContentTypes: options.exportPluginsContentTypes,
        },
      });

      setData(res.data);
    } catch (err) {
      handleRequestErr(err, {
        403: () =>
          notify(
            i18n('plugin.message.export.error.forbidden.title'),
            i18n('plugin.message.export.error.forbidden.message'),
            'danger'
          ),
        default: () =>
          notify(
            i18n('plugin.message.export.error.unexpected.title'),
            i18n('plugin.message.export.error.unexpected.message'),
            'danger'
          ),
      });
    } finally {
      setFetchingData(false);
    }
  };

  const writeDataToFile = async () => {
    const config = dataFormatConfigs[options.exportFormat];

    if (!config) {
      throw new Error(`File extension ${options.exportFormat} not supported to export data.`);
    }

    let dataToCopy = data;

    if (typeof data === 'object') {
      dataToCopy = data?.data;
    }

    const { fileExt, fileContentType } = config;
    const fileName = `export_${slug}.${fileExt}`.replaceAll(':', '-').replaceAll('--', '-');

    downloadFile(dataToCopy, withTimestamp(fileName), `${fileContentType};charset=utf-8;`);
  };

  const copyToClipboard = () => {
    let dataToCopy = data;

    if (typeof data === 'object') {
      dataToCopy = data?.data;
    }

    navigator.clipboard.writeText(dataToCopy);

    notify(i18n('plugin.export.copied'), '', 'success');
  };

  const clearData = () => {
    setData(null);
  };

  const resetOptions = () => {
    const storedPreferences = getPreferences();

    setOptions({ ...DEFAULT_OPTIONS, ...storedPreferences });
    setData(null);
    setFetchingData(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (open) {
      resetOptions();
    }
  };

  return (
    <Modal.Root onClose={onClose} onOpenChange={handleOpenChange}>
      <Modal.Trigger>
        <Button startIcon={<Download />}>{i18n('plugin.cta.export', 'Export')}</Button>
      </Modal.Trigger>

      {isOpen && (
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>
              <Flex gap={2}>
                <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                  {i18n('plugin.cta.export', 'Export')}
                </Typography>
              </Flex>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {fetchingData && (
              <Flex justifyContent="center">
                <Loader>{i18n('plugin.export.fetching-data')}</Loader>
              </Flex>
            )}

            {!data && !fetchingData && (
              <>
                <Grid.Root gap={2}>
                  <Grid.Item xs={12}>
                    <Typography fontWeight="bold" textColor="neutral800" as="h2">
                      {i18n('plugin.export.export-format')}
                    </Typography>
                  </Grid.Item>

                  <Grid.Item xs={12}>
                    <SingleSelect
                      id="export-format"
                      label={i18n('plugin.export.export-format')}
                      required
                      placeholder={i18n('plugin.export.export-format')}
                      value={options.exportFormat}
                      onChange={() => handleSetOption('exportFormat')}
                    >
                      {availableExportFormats.map((format) => (
                        <SingleSelectOption key={format} value={format}>
                          {i18n(`plugin.data-format.${format}`)}
                        </SingleSelectOption>
                      ))}
                    </SingleSelect>
                  </Grid.Item>
                </Grid.Root>
              </>
            )}

            {data && !fetchingData && (
              <Editor content={data} language={dataFormatConfigs[options.exportFormat].language} />
            )}
          </Modal.Body>

          <Modal.Footer>
            {!!data && (
              <Button variant="tertiary" onClick={clearData}>
                {i18n('plugin.cta.back-to-options')}
              </Button>
            )}
            {!data && <Button onClick={getData}>{i18n('plugin.cta.get-data')}</Button>}
            {!!data && (
              <>
                <Button variant="secondary" onClick={copyToClipboard}>
                  {i18n('plugin.cta.copy-to-clipboard')}
                </Button>
                <Button onClick={writeDataToFile}>{i18n('plugin.cta.download-file')}</Button>
              </>
            )}
          </Modal.Footer>
        </Modal.Content>
      )}
    </Modal.Root>
  );
};
