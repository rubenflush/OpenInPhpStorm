chrome.storage.local.get(['hostList'], function(result ) {
	$.each(Object.values(result.hostList), function(key, host) {
		if(host['url'] == document.location.host) {
			check(host);
			return false;
		}
	});
});

function check(host)
{
	var version = host['version'],
		viewPath = host['version'] == 4 ? 'app/' : 'resources/',
		viewExtension = '.'+host['view_extension'];

	//try to get from laravel debugbar
	var viewList = [];
	$.unique($('.phpdebugbar-widgets-templates .phpdebugbar-widgets-list .phpdebugbar-widgets-list-item > .phpdebugbar-widgets-name').map(function(){
		return $(this).text();
	})).each(function(k,v) {

		process = true;
		$.each(host['view_exclude'].split(';'), function(key, check) {
			// Regex check
			if(check.substr(0, 1) == '/' && check.substr(-1) == '/') {


				if((new RegExp(check.substr(1, check.length-2))).test(v) === true) {
					process = false;
				}
			} else if(v === check) {
				process = false;
			}

			if(!process) { return false; }
		});

		if(process) {
			var view = v.split(' ')[0].replace(/\./g, '/');
			link = viewPath +'views/' + view + viewExtension;
			viewList.push(link);
		}
	});

	if($('.phpdebugbar').length || $('.Whoops.container .stack-container').length) {
		var errorMsg = $('.frame.active .frame-file') ? $('.frame.active .frame-file').text() : null,
			container = $('<div class="open-in-phpstorm"></div>');

		function redirect(to, type)
		{
			if(!to) {
				console.error('Unable to redirect');
				return;
			}

			to = host['path'].replace(/\./g, '/') + '/' + to;

			console.log('Navigating to "openInPhpStorm://'  + to + '"');
			document.location.href = 'openInPhpStorm://'+to;
		}

		if(errorMsg) {

			var errorTitle = $('.exc-title').text().replace(/(  |\\|\n)/g, '');
			if(errorTitle.indexOf('Twig Error') !== -1) {
				return;
			}

			// Reformat SQL query error
			if(errorTitle.indexOf('QueryException') !== -1) {
				$('header').css('max-height', '10000px');
				errorList = $('.exc-message span').first().text().split('SQL: ');
				var message = errorList[1].split(')Illuminate\\')[0];

				// Fixes date format errors
				message = message.replace(/(<=|>=|>|<|=|<>|!=) (([0-9\-]{10}( ?[0-9:]{8})?))/g, '$1 \'$2\'');

				$('.exc-message span').first().html(errorList[0]+'<br/><br/>'+message.substr(0,message.length-1)+'<br/><br/>');
			}
			
			var element = $('<span data-type="error">Open in PhpStorm</span>');
			container.append(element);
			
			// Click first application frame which is more usefull
			var clickedElement = $('.frame-application').filter(function() {
				return $(this).find('.frame-file').text().replace(/(  |\\|\n)/g, '').indexOf('Support/Traits/Encryptable.php') === -1;
			}).first().click();

			// Get first by path
			if(!clickedElement.length) {
				$('.frames-container .frame .frame-file').each(
					function(key, line) {
						var file = $(this).text().trim();
						if(file.substr(0, 6) == '…/app/') {
							$(this).parent().click();
							return false;
						}
					}
				);
			}

			setTimeout(function() {
				if(confirm('Open in PhpStorm?')) {
					element.click();
				}
			}, 500);
		} else {
			container.append('<span data-type="controller">Open controller</span>');
			if(viewList.length) {
				container.append('<span data-type="view">Open view</span>');
			}
		}

		$('body').append(container);

		$('.open-in-phpstorm span').click(function() {
			var link;
			console.log($(this).data('type'));
			switch($(this).data('type')) {
				case 'error':
					//try to get from laravel debugbar
					link = $('.frame.active .frame-file').text().trim().replace('…/', '').replace(/([0-9]*)$/, ':$1');
					break;
				case 'controller':
					//try to get from debugbar route 'file'
					var file = $( '.phpdebugbar-widgets-key span[title=file]' ).parent().next('.phpdebugbar-widgets-value').html();
					if(file.indexOf('routes/') === -1) {
						link = file;
					} else {
						//get from route instead
						link = 'app/Http/Controllers/' + $('.phpdebugbar-widgets-value.phpdebugbar-widgets-debug').first().text()
								.match(/Controller: ([a-zA-Z0-9_\/\\]*)@/)[1].replace('\\', '/')+'.php';

						// Add function name
						link += '@'+document.location.pathname.split('/').pop();
					}
					break;
				case 'view':
					if(viewList.length) {
						while(viewList.length > 1) {
							var lists = "";
							$.each(viewList, function(k, v) {
								lists += ' ['+k+'] ' + v + "\n";
							});

							var i = prompt("Kies view:\n"+lists, 0);
							if(i === null) {
								viewList = [];
							} else if(i in viewList) {
								viewList = [viewList[i]];
							}
						}
						if(viewList.length) {
							link = viewList[0];
						}
					}
					break;
			}

			redirect(link, $(this).data('type'));
		});
	}
}