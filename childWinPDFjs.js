// Add pdf.js
script_url='https://mozilla.github.io/pdf.js/build/pdf.js';
async function addScript2(script_url){
	e=document.createElement('script');
	e.textContent=await fetch(script_url).then(res=>res.text());
	document.body.appendChild(e);
	return true
};
addScript2(script_url);

// Add worker to pdf.js
var pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';

//open BroadcastChannel
bc=new BroadcastChannel('XP');

// load the page to the canvas!
function loadPDF(pdf){
var pageNumber = 1;
  pdf.getPage(pageNumber).then(function(page) {
    console.log('Page loaded');
    
    var scale = 1.5;
    var viewport = page.getViewport({scale: scale});

    // Prepare canvas using PDF page dimensions
    var canvas = _canvas;
    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);
    renderTask.promise.then(function () {
      console.log('Page rendered');
    });
  });
};

bc.onmessage=(evt)=>{
	pdfjsLib.getDocument(evt.data).promise /*pdf from arrayBuffer*/
	.then(_pdf=>{
		console.log(_pdf);
		pdf=_pdf;
		loadPDF(_pdf);
		})
	};
