import { isEmpty, merge } from 'lodash/fp';
import qs from 'qs';

import { ObjectBuilder } from '../../libs/objects';
import { CustomSlugToSlug } from '../../utils/constants';
import { convertToCsv, convertToJson } from './converters';

type StrapiAttribute = {
  type: 'component' | 'dynamiczone' | 'relation' | 'media';
  component?: string;
  components?: string[];
  target?: string;
};

const dataFormats = {
  CSV: 'csv',
  JSON: 'json',
  JSON_V2: 'json-v2',
};

const dataConverterConfigs = {
  [dataFormats.CSV]: {
    convertEntries: convertToCsv,
  },
  [dataFormats.JSON]: {
    convertEntries: convertToJson,
  },
};

/**
 * Export data.
 * @param {Object} options
 * @param {string} options.slug
 * @param {("csv"|"json")} options.exportFormat
 * @param {string} options.search
 * @param {boolean} options.applySearch
 * @param {boolean} options.relationsAsId
 * @param {number} options.deepness
 * @returns {Promise<string>}
 */
const exportData = async ({
  slug,
  search,
  applySearch,
  exportFormat,
  relationsAsId,
  deepness = 5,
}) => {
  const slugToProcess = CustomSlugToSlug[slug] || slug;
  const queryBuilder = new ObjectBuilder();

  //fails in here
  queryBuilder.extend(getPopulateFromSchema(slugToProcess, deepness));

  if (applySearch) {
    queryBuilder.extend(buildFilterQuery(search));
  }

  const query = queryBuilder.get();
  const entries = await strapi.documents(slugToProcess).findMany(query);

  const data = convertData(entries, {
    slug: slugToProcess,
    dataFormat: exportFormat,
    relationsAsId,
  });

  return data;
};

const buildFilterQuery = (search) => {
  let { filters, sort: sortRaw } = qs.parse(search);
  let sort = {};

  const [attr, value] = sortRaw?.toString().split(':') || [];

  if (attr && value) {
    sort[attr] = value.toLowerCase();
  }

  return {
    filters,
    sort,
  };
};

/**
 *
 * @param {Array<Object>} entries
 * @param {Object} options
 * @param {string} options.slug
 * @param {string} options.dataFormat
 * @param {boolean} options.relationsAsId
 * @returns {string}
 */
const convertData = (entries: any[], options: any) => {
  const converter = getConverter(options.dataFormat);

  const convertedData = converter.convertEntries(entries, options);

  return convertedData;
};

const getConverter = (dataFormat: string) => {
  const converter = dataConverterConfigs[dataFormat];

  if (!converter) {
    throw new Error(`Data format ${dataFormat} is not supported.`);
  }

  return converter;
};

const getPopulateFromSchema = (slug: any, deepness = 5) => {
  if (deepness <= 1) {
    return true;
  }

  if (slug === 'admin::user') {
    return undefined;
  }

  const populate = {};
  const model = strapi.getModel(slug);

  for (const [attributeName, attribute] of Object.entries(getModelPopulationAttributes(model))) {
    if (!attribute) {
      continue;
    }

    const typedAttribute = attribute as StrapiAttribute;

    if (typedAttribute.type === 'component') {
      populate[attributeName] = getPopulateFromSchema(typedAttribute.component, deepness - 1);
    } else if (typedAttribute.type === 'dynamiczone') {
      const dynamicPopulate = typedAttribute.components?.reduce((zonePopulate, component) => {
        const compPopulate = getPopulateFromSchema(component, deepness - 1);
        return compPopulate === true ? zonePopulate : merge(zonePopulate, compPopulate);
      }, {});
      populate[attributeName] = isEmpty(dynamicPopulate) ? true : dynamicPopulate;
    } else if (typedAttribute.type === 'relation') {
      const relationPopulate = getPopulateFromSchema(typedAttribute.target, deepness - 1);
      if (relationPopulate) {
        populate[attributeName] = relationPopulate;
      }
    } else if (typedAttribute.type === 'media') {
      populate[attributeName] = true;
    }
  }

  return isEmpty(populate) ? true : { populate };
};

const getModelPopulationAttributes = (model) => {
  if (model.uid === 'plugin::upload.file') {
    const { related, ...attributes } = model.attributes;
    return attributes;
  }

  return model.attributes;
};

export { dataFormats as formats, exportData, getPopulateFromSchema };
