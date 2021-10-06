define(['N/ui/serverWidget', 'N/record', 'N/email', 'N/runtime', 'N/redirect'], (sw, record, email, runtime, redirect) => {
	/**
	 * Suitlet desfaio numero 2 - Sistema de busquedad de cuotas
	 *
	 * @NApiVersion 2.1
	 * @NScriptType Suitelet
	 * @NModuleScope SameAccount
	 *
	 */
	const setApproved = (cRecord) => {
		cRecord.setValue({
			fieldId: 'custrecord_autorize_gl',
			value: true,
		});
		cRecord.save();
	};

	const sendEma = (recipientId) => {
		email.send({
			author: runtime.getCurrentUser()
				.id,
			recipients: recipientId,
			subject: 'Test Sample Email Module',
			body: 'La cuota ha sido aprobada',
		});
	};

	const onRequest = (context) => {
		if (context.request.method === 'GET') {
			const { parameters } = context.request;
			const cRecord = record.load({ type: parameters.cRecord_type, id: parameters.cRecord_id });
			setApproved(cRecord);
			sendEma(cRecord.getValue('owner'));

			redirect.toRecord({
				type: parameters.cRecord_type,
				id: parameters.cRecord_id,
				parameters: {
					quote_aproved: true,
				},
			});
		}
	};

	return { onRequest };
});