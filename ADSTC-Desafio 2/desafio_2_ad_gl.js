define(['N/ui/serverWidget'], function(sw) {
	/**
	 * Suitlet desfaio numero 2 - Sistema de busquedad de cuotas
	 *
	 * @exports cuotas-suitlet
	 *
	 * @NApiVersion 2.x
	 * @NScriptType Suitelet
	 * @NModuleScope SameAccount
	 *
	 * @requires _lib
	 *
	 * @copyright ${year}
	 * @author ${author}
	 */
	var exports = {};

	/**
	 * Definition of the Suitelet script trigger point.
	 *
	 * @governance 0
	 *
	 * @param context {Object}
	 * @param context.request {ServerRequest} incoming request
	 * @param context.response {ServerResponse} response
	 *
	 * @return {void}
	 *
	 *
	 * @since 2015.2
	 *
	 * @static
	 * @function onRequest
	 */
	function onRequest(context) {
		dpForm(context);
	}

	function dpForm(context) {
		var form = sw.createForm({ title: "Form 101" });
		var field = form.addField({ id: "textfield", type: sw.FieldType.TEXT, label: "Text" });
		field.layoutType = sw.FieldLayoutType.NORMAL;
		field.updateBreakType({
			breakType: sw.FieldBreakType.STARTCOL
		});

		form.addField({
			id: 'datefield',
			type: sw.FieldType.DATE,
			label: 'Date'
		});
		form.addField({
			id: 'currencyfield',
			type: sw.FieldType.CURRENCY,
			label: 'Currency'
		});

		var select = form.addField({
			id: 'selectfield',
			type: sw.FieldType.SELECT,
			label: 'Select'
		});
		select.addSelectOption({
			value: 'a',
			text: 'Albert'
		});
		select.addSelectOption({
			value: 'b',
			text: 'Baron'
		});

		var sublist = form.addSublist({
			id: 'sublist',
			type: sw.SublistType.INLINEEDITOR,
			label: 'Inline Editor Sublist'
		});
		sublist.addField({
			id: 'sublist1',
			type: sw.FieldType.DATE,
			label: 'Date'
		});
		sublist.addField({
			id: 'sublist2',
			type: sw.FieldType.TEXT,
			label: 'Text'
		});

		form.addSubmitButton({
			label: 'Submit Button'
		});

		context.response.writePage(form);

		context.response.write("You have entered: ${textField} ${dateField} ${currencyField} ${selectField} ${sublistField1} ${sublistField2}");
	}


	exports.onRequest = onRequest;
	return exports;

});