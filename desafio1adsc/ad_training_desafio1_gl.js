/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/currentRecord', 'N/ui/dialog', 'N/search'], (currentRecord, dialog, search) => {
	const pageInit = () => {
		const cRecord = currentRecord.get();

		const region = cRecord.getField({
			fieldId: 'custrecord_region_gl',
		});
		region.isDisabled = true;
	};

	const validateField = (context) => {
		const cRecord = context.currentRecord;

		if (context.fieldId === 'custrecord_qnumber_gl') {
			const qnumValue = cRecord.getValue('custrecord_qnumber_gl');

			if (qnumValue > 4 || qnumValue < 0) {
				dialog.alert('El Numero debe ser mayor que 0 y menor que 4.');
				return false;
			}
		}
		return true;
	};

	const fieldChanged = (context) => {
		const cRecord = context.currentRecord;

		if (context.fieldId === 'custrecord_country_gl') {
			const countryValue = cRecord.getValue('custrecord_country_gl');
			const regField = currentRecord.get();

			search.create({
					type: 'customrecord_training_offices',
					title: 'Search offices',
					columns: [{
						name: 'CUSTRECORD_TRAINING_REGION',
					}],
					filters: [
						search.createFilter({
							name: 'CUSTRECORD_TRAINING_COUNTRY',
							operator: search.Operator.IS,
							values: countryValue,
						}),
					],
				})
				.run()
				.each((result) => {
					regField.setValue({
						fieldId: 'custrecord_region_gl',
						value: result.getValue('CUSTRECORD_TRAINING_REGION'),
					});
					return true;
				});
		}
	};
	return {
		pageInit,
		validateField,
		fieldChanged,
	};
});