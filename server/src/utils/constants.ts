const CustomSlugs = {
  MEDIA: 'media',
  WHOLE_DB: 'custom:db',
};

const CustomSlugToSlug = {
  [CustomSlugs.MEDIA]: 'plugin::upload.file',
};

const isCustomSlug = (slug: string) => {
  return !!CustomSlugToSlug[slug];
};

export { CustomSlugs, CustomSlugToSlug, isCustomSlug };
