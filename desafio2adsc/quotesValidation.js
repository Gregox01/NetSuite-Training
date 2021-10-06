/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/currentRecord', 'N/ui/dialog'], (currentRecord, dialog) => {
	function validateField(context) {
		const cRecord = context.currentRecord;

		if (context.fieldId === 'qotes_int') {
			const qnumValue = cRecord.getValue('qotes_int');

			if (qnumValue > 4 || qnumValue < 0) {
				dialog.alert('El Numero debe ser mayor que 0 y menor que 4.');
				return false;
			}
		}
		return true;
	}

	return {
		validateField,
	};
});