/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/message', 'N/runtime'], (message, runtime) => {
  const DEVELOPER_ROLE_ID = 'customrole1021';
  const beforeLoad = (context) => {
    const { form } = context;
    const { roleId } = runtime.getCurrentUser();
    const checkboxCurrentValue = context.newRecord.getValue({ fieldId: 'custrecord_autorize_gl' });

    if (!checkboxCurrentValue && (roleId === DEVELOPER_ROLE_ID)) {
      form.addButton({
        id: 'custpage_aprove_order',
        label: 'Aprove Order',
        functionName: 'aproveQuotesBt',
      });
      form.clientScriptModulePath = './desafio_3_ad_gl_cs.js';
    }
    if (context.request.parameters.quote_aproved) {
      form.addPageInitMessage({ type: message.Type.CONFIRMATION, message: 'Quota aprobada', duration: 2000 });
    }
  };
  return {
    beforeLoad,
  };
});
