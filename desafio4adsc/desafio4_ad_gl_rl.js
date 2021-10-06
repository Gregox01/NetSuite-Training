/**
 * @NApiVersion 2.1
 * @NScriptType restlet
 */
const API_KEY = '53299bea20f69f6394c413225f30250e';
const RTYPE = 'customrecord_training_ad_events_gl';
const FIELD_CITY = 'custrecord_event_city_gl';
const FIELD_DATE = 'custrecord_event_datetime_gl';
const API_URL = 'https://api.openweathermap.org/data/2.5/';

define(['N/record', 'N/https', 'N/email', 'N/runtime', 'N/search','./xlsx.full.min.js'], (record, https, email, runtime, search,sheetJS) => {
	/**
	 * Capizalizes firs letter of a string.
	 * @param {string} srt - String to be capitalized.
	 * @return {string} Returns capitalized string.
	 */
	const capitalize = (str) => str.charAt(0)
		.toUpperCase() + str.slice(1);

	/**
	 * Creates an climate Object.
	 * @param {string} date - FORMAT : MM/DD/TT hh:mm.
	 * @param {string} city - The city in string format.
	 * @return {Object} Returns getClimateDescript and date properties.
	 */
	const getApiData = (date, city) => {
		const dateInput = new Date(date);
		const time = dateInput.getTime() / 1000;
		let getCoordinates = https.get(`${API_URL}weather?q=${city}&appid=${API_KEY}`)
			.body;
		getCoordinates = JSON.parse(getCoordinates);
		let getClimate = https.get(`${API_URL}onecall?lat=${getCoordinates.coord.lat}&lon=${getCoordinates.coord.lon}&lang=es&exclude=minutely,hourly&appid=${API_KEY}`)
			.body;
		getClimate = JSON.parse(getClimate);
		const getClimateDescript = capitalize(getClimate.daily.find((x) => x.dt > time)
			.weather[0].description);

		return { getClimateDescript, date: dateInput };
	};

	/**
	 * Represents a sendEma.
	 * @param {id} recipientId - The owner id.
	 */
	 const createXls = (data) => {
		 /* Fila Inicial */
		 const worksheetObj = sheetJS.utils.json_to_sheet([
			 {
				 Name: data.name, Description: data.desc, Country: data.country, Status: '0',
			 },
		 ], { header: ['Name', 'Description', 'Country', 'Status'], skipHeader: false });

		 /* Escribimos una nueva fila al final del contenido de la worksheet */
		 sheetJS.utils.sheet_add_json(worksheetObj, [
			 {
				 A: 4, B: 5, C: 6, D: 7, E: 8, F: 9, G: 0,
			 },
		 ], { header: ['Name', 'Description', 'Country', 'Status'], skipHeader: true, origin: -1 });
		 /* Creamos nuestro objeto WorkBook */
		 const workbookObj = sheetJS.utils.book_new();

		 /* Agregamos las worksheet a nuestro worbook */
		 const sheetName = 'Test_Hoja';
		 xlsx.utils.book_append_sheet(workbookObj, worksheetObj, sheetName);
		 /* Obtenemos el contenido de nuestro objeto Workbook como String */
		 const workbookContent = xlsx.write(workbook, {
			 booktype: 'xlsx',
			 type: 'base64',
		 });

		 /* Utilizando el workbookContent creamos el objeto File de NetSuite utilizando
		el método create() del módulo File */
		 return file.create({
			 name: 'file_name.xlsx',
			 fileType: file.Type.EXCEL,
			 contents: workbookContent,
			 folder: 'folderName',
		 });
	 };

	const sendEma = (recipientId,dataOjb) => {
		email.send({
			author: runtime.getCurrentUser()
				.id,
			recipients: recipientId,
			subject: 'Invitacion a evento',
			body: 'Email de prueba, perdon si le llega a alguien esto.',
			attachments:[dataOjb]
		});
	};

	/**
	 * Represents post.
	 * @param {Object} context - Recieves the current request body.
	 */
	const post = (context) => {
		const dataOjb={
			name:'hola',
			desc:'funco',
		}
		context.parameters.event_weather_gl = getApiData(context.parameters.event_datetime_gl,
				context.parameters.event_city_gl)
			.getClimateDescript;
		context.parameters.event_datetime_gl = getApiData(context.parameters.event_datetime_gl,
				context.parameters.event_city_gl)
			.date;

		const cRecord = record.create({
			type: RTYPE,
		});
		Object.keys(context.parameters)
			.forEach((x) => {
				cRecord.setValue({
					fieldId: (x === 'Name' ? 'name' : `custrecord_${x}`),
					value: context.parameters[x],
				});
			});
		cRecord.save();
		sendEma(Object.values(context.parameters.events_guests_gl),createXls(dataOjb));

		return {
			success: true,
			message: 'Record Created',
		};
	};

	/**
	 * Represents put.
	 * @param {Object} context - Recieves the current request body.
	 */
	const put = (context) => {
		const values = { ...context.parameters.mod_fields };
		let dateEvent = values.custrecord_event_datetime_gl;
		let cityEvent = values.custrecord_event_city_gl;

		if (cityEvent || dateEvent) {
			dateEvent = dateEvent || (
				search.lookupFields({
					type: RTYPE,
					id: context.parameters.cRecord_id,
					columns: FIELD_DATE,
				}));
			cityEvent = cityEvent || (
				search.lookupFields({
					type: RTYPE,
					id: context.parameters.cRecord_id,
					columns: FIELD_CITY,
				}));
			values.custrecord_event_weather_gl = getApiData(dateEvent, cityEvent)
				.getClimateDescript;
			values.custrecord_event_datetime_gl = getApiData(dateEvent, cityEvent)
				.date;
		}
		record.submitFields({
			type: RTYPE,
			id: context.parameters.cRecord_id,
			values,
		});
		return {
			success: true,
			message: 'Record Modified',
			mod_fields: Object.keys(values),
		};
	};

	/**
	 * Represents get.
	 * @param {Object} requestParams - Recieves the current request body.
	 */
	const get = (requestParams) => JSON.stringify(record.load({
		type: RTYPE,
		id: requestParams.id,
	}));

	/**
	 * Represents Delete.
	 * @param {Object} requestParams - Recieves the current request body.
	 */
	const inactive = (requestParams) => {
		record.submitFields({
			type: RTYPE,
			id: requestParams.id,
			values: { isinactive: true },
		});
		return {
			success: true,
			message: `Record ${requestParams.id} deleted`,
		};
	};

	return {
		post,
		get,
		put,
		delete: inactive,
	};
});
