## MITO SDK
usage example: 

```
MitoSDK.init({
	key: "KEY"
});

MitoSDK.api('/phone',{
		'country':'hu',
		'phonenumber':'+36123456789'
	},
	function(r) {
		if("error" in r) { } else { console.log(r); }
	}
);
```
