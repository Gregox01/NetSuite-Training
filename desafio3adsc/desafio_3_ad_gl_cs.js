/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/search', 'N/ui/dialog', 'N/url', 'N/record', 'N/currentRecord'], (search, dialog, url, record, currentRecord) => {
	const pageInit = () => {

	};

	const redirectLink = (link) => {
		window.location.href = link;
	};

	const aproveQuotesBt = () => {
		const cRecord = currentRecord.get();
		const cRecordInfo = { cRecord_id: cRecord.id, cRecord_type: cRecord.type };
		const output = url.resolveScript({
			scriptId: 'customscript_desafio_3_ad_gl_sl_2',
			deploymentId: 'customdeploy1',
			params: cRecordInfo,
		});
		dialog.confirm(({ title: 'Confirmation', message: 'Press OK or Cancel' }))
			.then((x) => (x ? redirectLink(output) : false));
	};

	return {
		pageInit,
		aproveQuotesBt,
	};
});