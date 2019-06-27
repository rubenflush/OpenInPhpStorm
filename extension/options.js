$('form').submit(function() {
	
	storeData();
	return false;
});

$('#add_host').click(function() {
	addHost();
	return false;
});

$('#remove_host').click(function() {
	removeHost();
	return false;
});

var table = $('#host_table tbody'),
	hostList;
	
loadData(true);
	
function loadData(initial)
{
	chrome.storage.local.get(['hostList'], function(result) {
		console.log(result);
		hostList = result.hostList || [];
		if(initial) {
			while(addHost(true)) {}
		}
	});
}

function storeData()
{
	var list = {},
		maxHost = maxHost = table.find('tr').length,
		url, path, version, view_extension;

	for(var i = 1; i <= maxHost; i++) {
		url = $('#url_'+i).val();
		path = $('#path_'+i).val();
		version = $('#laravel_version_'+i).val();
		view_extension = $('#view_extension_'+i).val();
		view_exclude = $('#view_exclude'+i).val();

		if(url && path) {
			list[i] = {
				url: url,
				path: path,
				version: version,
				view_extension: view_extension,
				view_exclude: view_exclude
			}
		}
	}
	
	chrome.storage.local.set({hostList: list});	
}

function removeHost()
{
	var maxHost = maxHost = table.find('tr').length;
	if(maxHost <= 1) {
		return;
	}

	table.find('tr').get(maxHost-1).remove();
	storeData();
}
	
function addHost(initial)
{
	var maxHost = table.find('tr').length,
		host = parseInt(maxHost)+1,
		data = hostList[host] || [];

	//initial
	if(initial ? maxHost >= (Object.values(hostList).length || 1) : (!$('#url_'+maxHost).val() || !$('#path_'+maxHost).val() || !$('#laravel_version_'+maxHost).val() || !$('#view_extension_'+maxHost).val())) {
		return false;
	}

	$('<tr> \
		<td><input type="text" id="url_'+host+'" name="host['+host+'][url]" value="'+(data['url'] || '')+'"></td> \
		<td><input type="text" id="path_'+host+'"  name="host['+host+'][path]" value="'+(data['path'] || '')+'"></td> \
		<td><input type="text" id="laravel_version_'+host+'"  name="host['+host+'][laravel_version]" value="'+(data['version'] || '')+'"></td> \
		<td><input type="text" id="view_extension_'+host+'"  name="host['+host+'][view_extension]" value="'+(data['view_extension'] || '')+'"></td> \
		<td><textarea id="view_exclude'+host+'" name="host['+host+'][view_exclude]" placeholder=";separated">'+(data['view_exclude'] || '')+'</textarea></td> \
	</tr>').appendTo(table);
	
	return true;
			
}

