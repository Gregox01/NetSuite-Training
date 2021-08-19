define(['N/ui/serverWidget', 'N/search', 'N/log'], function(sw, search, log) {
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
		if (context.request.method === 'GET') {
			var getForm = createForm(context);
		} else {

			context.response.writePage({
				pageObject: displayList(translate(findCases(context)))
			});

		}
	}

	function createForm(context) {
		var form = sw.createForm({ title: "Quota Searcher" });

		form.addField({
			id: 'qotes_int',
			type: sw.FieldType.INTEGER,
			label: 'Q Number',
			container: 'fieldgroup_filters'

		});
		var country = form.addField({
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

	function displayList(results) {
		var postList = sw.createList('Resultados de Busqueda Quotas');
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

	function findCases(context) {
		var filters = [];
		filters.push(["custrecord_qnumber_gl", "equalto", context.request.parameters.qotes_int]);
		filters.push("AND");
		filters.push(["custrecord_country_gl", "is", context.request.parameters.country_select]);
		log.audit({ title: "Filer: ", details: filters })


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
			.getRange({ start: 0, end: 100 });

	}

	function resultToOjb(result) {
		return {
			custrecord_qnumber: result.getValue({ name: 'custrecord_qnumber_gl' }),
			custrecord_country: result.getText({ name: 'custrecord_country_gl' }),
			custrecord_margin: result.getValue({ name: 'custrecord_margin_gl' }),
			custrecord_totalmargin: result.getValue({ name: 'custrecord_totalmargin_gl' }),
			custrecord_manufacturer: result.getText({ name: 'custrecord_manufacturer_gl' }),
		};
	}

	function translate(results) {
		return results.map(resultToOjb);
	}

	exports.onRequest = onRequest;
	return exports;

});