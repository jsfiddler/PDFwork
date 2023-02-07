_canvas=document.createElement('canvas')
document.body.appendChild(_canvas);


//open BroadcastChannel
bc=new BroadcastChannel('XP');

// load the page to the canvas!
function loadPDF(pdf){
var pageNumber = 1;
  pdf.getPage(pageNumber).then(function(page) {
    console.log('Page loaded');
    
    var scale = 0.8;
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

// Message from parent window, activates loading the PDF in ChildWindow via broadcastChannels
bc.onmessage=(evt)=>	{
			pdfjsLib.getDocument(evt.data).promise /*pdf from arrayBuffer*/
			.then(_pdf=>	{
					console.log(_pdf);
					pdf=_pdf;
					loadPDF(_pdf);
					})
			};
