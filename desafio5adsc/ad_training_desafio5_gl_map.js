/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/render', 'N/email', 'N/runtime', 'N/search', 'N/file'], (record, render, email, runtime, search, file) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const getInputData = () => {
    log.debug({ title: 'getInputData', details: 'Running search' });

    return search.create({
      type: 'customrecord_training_quotas_gl',
      title: 'Search Quotas',
      columns: [
        'custrecord_qnumber_gl',
        'custrecord_amount_gl',
        'custrecord_country_gl',
        'custrecord_margin_gl',
        'custrecord_totalmargin_gl',
        'custrecord_manufacturer_gl',
        'custrecord_region_gl',
        'name'],
      filters: ['created', 'within', 'thisMonth'],
    });
  };

  const map = (mapContext) => {
    const searchResult = JSON.parse(mapContext.value);
    mapContext.write({
      key: searchResult.values.custrecord_region_gl.value,
      value: searchResult,
    });
  };
  /**
	 * Summs up all integers in a string.
	 * @param {int[]} currentValue - Array to be summed.
	 * @param {int=} accumulator - Array to be summed.
	 * @return {int} Returns a single value.
	 */
  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  /**
	 * Sends an object to xmL and returns a PDF -- Render module
	 * @param {Object} JsObject - Array to be summed.
	 * @param {File} templateId - Array to be summed.
	 * @return {File} Returns a single value.
	 */
  const generatePdfFileFromRawXml = (jsObject, templateId) => {
    const renderer = render.create();
    renderer.templateContent = templateId.getContents();
    renderer.addCustomDataSource({
      format: render.DataSource.OBJECT,
      alias: 'JSON',
      data: jsObject,
    });

    return renderer.renderAsPdf();
  };
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
  const reduce = (reduceContext) => {
    const quotesProccesed = reduceContext.values.length;
    const regionTxt = JSON.parse(reduceContext.values[0])
      .values.custrecord_region_gl.text;
    const regionMonth = {
      region: regionTxt,
      month: `${monthNames[
        new Date().getMonth()]}`,
      year: `${new Date().getFullYear()}`,
    };
    const totalAmount = [];
    const quotesInfo = [];
    const template = file.load({
      id: './QuotesMonthPDF.template.xml',
    });
    reduceContext.values.forEach((item) => {
      totalAmount.push(Number(JSON.parse(item)
        .values.custrecord_amount_gl));
      quotesInfo.push(JSON.parse(item));
    });

    const dataObject = {
      desc:'hola bb',
      country:'londres rey',
      name: regionMonth,
    };
    try {
      email.send({
        author: runtime.getCurrentUser()
          .id,
        recipients: 'gllabra@adistec.com',
        subject: `Quotas - ${regionMonth.region} - ${regionMonth.month}-${regionMonth.year}`,
        body: 'Email de quotas mensuales.',
        attachments: [createXls(dataObject)],
      });
    } catch (e) {
      log.error({title:"Error",details:e.message})
    } finally {

    }

    reduceContext.write({ key: quotesProccesed, value: '' });
  };

  const summarize = (summaryContext) => {
    log.audit({ title: 'Time of execution ', details: summaryContext.dateCreated });
    let totalRecordsUpdated = 0;

    summaryContext.output.iterator()
      .each((key) => {
        totalRecordsUpdated += Number(key);

        return true;
      });

    log.audit({ title: 'Quotes Proccesed ', details: totalRecordsUpdated });
  };

  return {
    getInputData,
    map,
    reduce,
    summarize,
  };
});
