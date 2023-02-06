var { degrees,PDFDocument, StandardFonts, rgb } = PDFLib;
	 
async function getPDF(data){ /*Starts when a file will be uploaded from the input-control*/
	const pdfDoc = await PDFDocument.load(data.buffer);
	await modifymyPDF(pdfDoc,data);
	const bc = new BroadcastChannel('ParentChildMessageTunnel');
	bc.postMessage({message:'done'});
};
	
async function modifymyPDF(pdfDoc,data) { /*Hinzufügen von Text und dergleichen*/

	const pages = pdfDoc.getPages()
	const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
	const { width, height } = pages[0].getSize() /*all pages are same size, otherwise calculate it for each page independetly*/

	pages.forEach(page=>{
		page.drawText('------------  Added this Text ------------', {
			x: 120,
			y: 20,
			size: 8,
			font: helveticaFont,
			color: rgb(0.95, 0.1, 0.1),
			rotate: degrees(0)
		});
	});

	const pdfBytes = await pdfDoc.save()

	// Trigger the browser to download the PDF document
	download(pdfBytes, data.xnum+".pdf", "application/pdf");
};

window.addEventListener("message",function(e) { console.log(e); getPDF(e.data);/*your data is captured in e.data */}, false);
