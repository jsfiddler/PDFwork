//open BroadcastChannel to listen for parentWindow Messages
bc=new BroadcastChannel('XP');
var pagenum=1;
var scale=1; /*ony used in the beginning, can be overwritte afterwards*/
var firsttimeAppendCSS=true;
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

//create temporary Elements
_divtemp=document.createElement('div');
_divtemp.classList.add('temp');
document.body.appendChild(_divtemp);
_divtemp.innerHTML=`
document loading...<br>
please wait...
`;

//create Buttons
_divx1=document.createElement('div');
_divx1.classList.add('top-bar');
_divx1.setAttribute('style','display:none'); // init with not displaying untill CSS overwrites this!
document.body.appendChild(_divx1);
_divx1.innerHTML=`
      <button class="btn" id="prev-page">
        Prev Page
      </button>
      <button class="btn" id="next-page">
        Next Page 
      </button>
      <span class="page-info">
        Page <span id="page-num"></span> of <span id="page-count"></span>
      </span>
`;

// Add Canvas
_canvas=document.createElement('canvas')
document.body.appendChild(_canvas);


// load the page to the canvas!
function loadPDF(pdf,pageNumber){
	pagenum=pageNumber;
	document.querySelector('#page-num').textContent=pagenum;
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
	 firsttimeAppendCSS?	hideDownload(_canvas.height,_canvas.width):''; /*now hide the Download Images*/
	 firsttimeAppendCSS=false;
    });
  });
};

// Message from parent window, activates loading the PDF in ChildWindow via broadcastChannels
bc.onmessage=(evt)=>	{
			pdfjsLib.getDocument(evt.data).promise /*pdf from arrayBuffer*/
			.then(_pdf=>	{
					console.log(_pdf);
					pdf=_pdf;
					loadPDF(_pdf,1);
					document.querySelector('#page-count').textContent = _pdf.numPages;
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
		
		.top-bar {
		  background: white;
		  color: #090909;
		  padding: 5px;
		  border-bottom:1px solid black;
		}
		
		.temp {
			display:none;
		}

		.btn {
		  background: #ffe793;
		  color: #0b0b0b;
		  border: none;
		  outline: none;
		  cursor: pointer;
		  padding: 0.7rem 2rem;
		  border-radius:6px;
		}

		.btn:hover {
		  opacity: 0.9;
		}

		.page-info {
		  margin-left: 1rem;
		}
		
		canvas	{
			box-shadow: 0 12px 16px 0 rgb(0 0 0 / 24%), 0 17px 50px 0 rgb(0 0 0 / 19%);
			margin-top: 5px;
			}
	`);
	
	_canvas.classList.add('center-cropped');
	
	_overlayer=document.createElement('div');
		_overlayer.classList.add('overlay');
		_overlayer.classList.add('center-cropped');
		_overlayer.setAttribute('style','background-image: url("about:blank");')
		_overlayer.textContent='&nbsp;';
		document.body.appendChild(_overlayer);
	
	_divx1.removeAttribute('style');
}

nextPDF=()=>{if (pagenum<pdf.numPages) {scale=2; loadPDF(pdf,pagenum+1);}};
prevPDF=()=>{if (pagenum>1){loadPDF(pdf,pagenum-1)}};
document.querySelector('#prev-page').addEventListener('click', prevPDF,false);
document.querySelector('#next-page').addEventListener('click', nextPDF,false);

// add keyboard listeners for arrow-keys
document.onkeydown = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
    }
    else if (e.keyCode == '40') {
        // down arrow
    }
    else if (e.keyCode == '37') {
       prevPDF()
    }
    else if (e.keyCode == '39') {
       nextPDF()
    }

}
