define(['N/ui/serverWidget', 'N/search', 'N/log'], (sw, search, log) => {
	/**
	 * Suitlet desfaio numero 2 - Sistema de busquedad de cuotas
	 *
	 * @exports cuotas-suitlet
	 *
	 * @NApiVersion 2.1
	 * @NScriptType Suitelet
	 * @NModuleScope SameAccount
	 *
	 * @requires _lib
	 *
	 * @copyright ${year}
	 * @author ${author}
	 */

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
		if (context.request.method === 'GET') {
			createForm(context);

		} else {

			context.response.writePage({
				pageObject: displayList(findCases(context))
			});

		}
	}

	const createForm = (context) => {
		let form = sw.createForm({ title: "Quota Searcher" });
		form.clientScriptModulePath = './quotesValidation.js';
		let fieldgroup = form.addFieldGroup({
			id: 'fieldgroup_filters',
			label: 'Filters'
		});
		form.addField({
			id: 'qotes_int',
			type: sw.FieldType.INTEGER,
			label: 'Q Number',
			container: 'fieldgroup_filters'

		});
		let country = form.addField({
			id: 'country_select',
			type: sw.FieldType.SELECT,
			label: 'Country',
			source: 'customlist_training_countries',
			container: 'fieldgroup_filters'
		});

		form.addSubmitButton({
			label: 'Submit Button'
		});

		context.response.writePage(form);
	}

	const displayList = (results) => {
		let postList = sw.createList('Resultados de Busqueda Quotas');
		postList.addColumn({
			id: 'custrecord_qnumber',
			type: sw.FieldType.INTEGER,
			label: 'Q number',
		});
		postList.addColumn({
			id: 'custrecord_country',
			type: sw.FieldType.TEXT,
			label: 'Country',
		});
		postList.addColumn({
			id: 'custrecord_margin',
			type: sw.FieldType.PERCENT,
			label: 'Margin',
		});
		postList.addColumn({
			id: 'custrecord_totalmargin',
			type: sw.FieldType.CURRENCY,
			label: 'Total Margin',
		});
		postList.addColumn({
			id: 'custrecord_manufacturer',
			type: sw.FieldType.TEXT,
			label: 'Manufacturer',
		});
		postList.addRows({ rows: results });
		return postList;
	}

	const findCases = (context) => {
		let filters = [];
		filters.push(["custrecord_qnumber_gl", "equalto", context.request.parameters.qotes_int]);
		if (context.request.parameters.country_select) {
			filters.push("AND");
			filters.push(["custrecord_country_gl", "is", context.request.parameters.country_select]);
		}
		return search.create({
				type: 'customrecord_training_quotas_gl',
				title: 'Search Quotas',
				columns: [
					'custrecord_qnumber_gl',
					'custrecord_country_gl',
					'custrecord_margin_gl',
					'custrecord_totalmargin_gl',
					'custrecord_manufacturer_gl'
				],
				filters: filters
			})
			.run()
			.getRange({ start: 0, end: 100 })
			.map(x => ({
				custrecord_qnumber: x.getValue({ name: 'custrecord_qnumber_gl' }),
				custrecord_country: x.getText({ name: 'custrecord_country_gl' }),
				custrecord_margin: x.getValue({ name: 'custrecord_margin_gl' }),
				custrecord_totalmargin: x.getValue({ name: 'custrecord_totalmargin_gl' }),
				custrecord_manufacturer: x.getText({ name: 'custrecord_manufacturer_gl' }),
			}));
	}

	return { onRequest }


});