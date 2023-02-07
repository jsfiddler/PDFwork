//open BroadcastChannel to listen for parentWindow Messages
bc=new BroadcastChannel('XP');

// Part 1:  Add pdf.js
script_url='https://mozilla.github.io/pdf.js/build/pdf.js';
async function addScript2(script_url){
	e=document.createElement('script');
	e.textContent=await fetch(script_url).then(res=>res.text());
	document.body.appendChild(e);
	// Add worker to pdf.js
	var pdfjsLib = window['pdfjs-dist/build/pdf'];
	pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
	return true
};
addScript2(script_url);

// Part 2: Add script to work with it.
// Add Canvas
_canvas=document.createElement('canvas')
document.body.appendChild(_canvas);


// load the page to the canvas!
function loadPDF(pdf,pageNumber,scale){
  pdf.getPage(pageNumber).then(function(page) {
    console.log('Page loaded');
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
	hideDownload(_canvas.height,_canvas.width); /*now hide the Download Images*/
    });
  });
};

// Message from parent window, activates loading the PDF in ChildWindow via broadcastChannels
bc.onmessage=(evt)=>	{
			pdfjsLib.getDocument(evt.data).promise /*pdf from arrayBuffer*/
			.then(_pdf=>	{
					console.log(_pdf);
					pdf=_pdf;
					loadPDF(_pdf,1,1);
					})
			};

// Part 3: Add CSS

const injectCSS = css => {
  let el = document.createElement('style');
  el.type = 'text/css';
  el.innerText = css;
  document.head.appendChild(el);
  return el;
};

function hideDownload(_height,_width){
	injectCSS(`	.center-cropped {
		  position: absolute;
		  width: ${_width}px;
		  height: ${_height}px;
		  background-position: center center;
		  background-repeat: no-repeat;
		}
		.overlay 	{opacity: 0.01;	}
	`);
	_canvas.classList.add('center-cropped');
	_overlayer=document.createElement('div');
	_overlayer.classList.add('overlay');
	_overlayer.classList.add('center-cropped');
	_overlayer.setAttribute('style','background-image: url("about:blank");')
	_overlayer.textContent='&nbsp;';
	document.body.appendChild(_overlayer);
}
