//var xnum=prompt('enter the number', 'XP055193370');
/*xnum must be added by other script.
 * cross domain window messaging only with postMessage possible.
 * modify bookmarklet would allow to download all. I do not want this. Can I just send the code encoded to the window by postMessage?
 * postMessages for 5 minutes (setInterval). Once read, bc.close();
 */

function generateKey(length) {
	var result = '';
	var characters = 'QWERTabc1234567890';
	var charLength = characters.length;
	for (var i = 0; i < length; i++) {result += characters.charAt(Math.floor(Math.random() * charLength));};
	
	return btoa(result);
};

async function addScript(script_url){
	e=document.createElement('script');
	e.textContent=await fetch(script_url).then(res=>res.text());
	myWindow.document.body.appendChild(e);
	return true
};

async function sendBlob(xnum){
		/*now fetch the blob*/
	var url="https://worldwide.espacenet.com/3.2/rest-services/images/documents/§§§/formats/pdf/pages/?EPO-Trace-Id="+generateKey(15);
	var options={
	  headers: {    accept: "*/*;q=0.8",  },
	  method: "GET",
	  mode: "cors",
	  credentials: "include"
	};
	
	url=url.replace('§§§','XP/'+xnum.match(/\d{2,}/))
	o={};
	const pdfArrayBuffer=await fetch(url, options).then(res=>res.blob()).then(e=>{o.xnum=xnum; return e.arrayBuffer()}).then(res=>o.buffer=res);
	myWindow.postMessage(o);
    return true;
};


(async function(){
myWindow = await window.open("", "myWindow", "width=700,height=600,   top=0,left=0,scrollbars,resizable"); /*open childWindow*/
/*create a broadCastChannel and Listen for spefici data!*/
const bc = new BroadcastChannel('ParentChildMessageTunnel');
bc.onmessage=(e)=>{
	if (e.data.message === 'done'){
		setTimeout(()=>{
				myWindow.close();
				console.log(e.data);
				window.location.reload(); /*close it, so no-one can see the path;*/
			},'1000')
	}
};
  /*part 1: load & add external script to the childWindow.*/
await addScript('https://unpkg.com/downloadjs@1.4.7'); /*script for downloading files*/
await addScript('https://unpkg.com/pdf-lib@1.4.0/dist/pdf-lib.min.js'); /*pdf-lib core*/
  /*part 2: add own JS. Code under this path can be changed to set other modifications to the pdf*/
await addScript('https://raw.githubusercontent.com/jsfiddler/PDFwork/main/addText_save.js'); /*code to modify PDF in childwindow*/
  /*part 3: get the PDF->blob->arrayBuffer & send it to the childWindow*/
await sendBlob(xnum);
return true
})();
