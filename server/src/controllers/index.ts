import exportAdminController from './admin/export-controller';
import exportContentApiController from './content-api/export-controller';

const controllers = {
  exportAdmin: exportAdminController,
  export: exportContentApiController,
};

export default controllers;

export { exportContentApiController as export, exportAdminController as exportAdmin };
