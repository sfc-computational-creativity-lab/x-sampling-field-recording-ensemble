var myval = 0;

function bang()
{
	outlet(myval);
}


function msg_int(n)
{
	myval = 440 * Math.pow(2,(n-69)/12.0);
	bang();
}