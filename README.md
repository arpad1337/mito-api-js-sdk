<h1>MITO JS SDK</h1>
<h2>Description</h2>
<p>jQuery-less plugin for gaining data from api.mito.hu.</p>
<h2>Usage</h2>
<pre>
MitoApiSDK.init({
    key: "KEY" // api key comes here
});

MitoApiSDK.api('/phone/withcountry',{
        'country':'hu',
        'phonenumber':'+36123456789'
    },
    function(r) {
        // avoiding unnesesarry memory allocation in IE when 
        // accessing property as following: obj.prop (even if
        // the value is undefined...)
        if("error" in r) {
            // error handling first, best practice
            return;
        } 
        console.log(r);
    }
);  

// OR by using errorCallback:

MitoApiSDK.api('/phone/withcountry',{
        'country':'hu',
        'phonenumber':'+36123456789'
    },
    function(r) {
        console.log(r);
    },
    function(err) {
        console.log(err);
    }
);   
</pre>
<h2>Routes</h2>
<ul>    
<li>/phone
<ul>
<li>
<p><strong>/search</strong></p>
<p><em>country, firstname, lastname, city</em></p>
</li>
<li>
<p><strong>/withcountry</strong></p>
<p><em>phonenumber, country</em></p>
</li>
<li>
<p><strong>/bynumber</strong></p>
<p><em>phonenumber</em></p>
</li>
</ul>
</li>
</ul>
<h2>To do</h2>
<ul>
<li>add all the routes</li>
</ul>
<h2>Testing</h2>
<ol>
<li>get an API KEY from Bence Faludi (b.faludi@mito.hu)</li>
<li>git clone ...</li>
<li>open up index.html</li>
<li>open dev console, initialize and call the api</li>
</ol>