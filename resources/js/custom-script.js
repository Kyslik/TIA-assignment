$(document).ready(function() {
	createNavigation(showBreadcrumbs);
	//initial content or load content depending on breadcrumb
	//showBreadcrumbs();
	
	
	$('div.nav-collapse ul.nav, ul.breadcrumb').on("click", "li a", function(e) {
	
		var clicked = $(this);
		var href = clicked.attr('href');

		if (href != "#") {
			if (!checkURL(href)) {
				e.preventDefault();
				//lets load new content
				//console.log(href);
				if (!clicked.parent().hasClass('active')) {
					addBreadcrumb(clicked.data('breadcrumb'), href);
				}
			}
		}
		
	});

});

function activateNav(href) {
	console.log($('a[href="' + href + '"]:first').parent());
	$('div.nav-collapse ul.nav li').removeClass('active');
	$('a[href=' + href + ']').parent().addClass("active");
}

function showBreadcrumbs() {

	var breadcrumbs = JSON.parse(localStorage.getItem('8787_breadcrumbs')) || [];

	if (breadcrumbs.length <= 1) {
		resetBreadcrumbs();
		return 0;
	} else {
		drawBreadcrumbs(breadcrumbs);
	}
}

function addBreadcrumb(name, href) {
	var breadcrumbs = JSON.parse(localStorage.getItem('8787_breadcrumbs')) || [];

	if (JSON.stringify(breadcrumbs[breadcrumbs.length-1]) == JSON.stringify({name:name, href:href})) return false;

	breadcrumbs.push({name:name, href:href});

	if (breadcrumbs.length >= 6) {	
		breadcrumbs.shift();
	}

	localStorage.setItem('8787_breadcrumbs', JSON.stringify(breadcrumbs));

	reDraw(breadcrumbs);

	function reDraw(breadcrumbs) {

		console.log("animation called");
		$('div#breadcrumb').stop().animate({
			opacity: 0,
		}, 300, function() {

			drawBreadcrumbs(breadcrumbs);
		
			$(this).stop().animate({
				opacity: 1,
			}, 600, function() {});
		});
	}

}

function drawBreadcrumbs(breadcrumbs) {
	$('div#breadcrumb').html('<ul class="breadcrumb"><ul>');
	b_selector = $('div#breadcrumb ul.breadcrumb');
	for (var i = 0; i < breadcrumbs.length; i++) {
		if (i == breadcrumbs.length - 1) {
			//last iteeration
			activateNav(breadcrumbs[i].href);
			b_selector.append('<li class="active">' + breadcrumbs[i].name + '</li>');
			$('#main-container').load('./content/' +  breadcrumbs[i].href + '.html');

		} else {
			b_selector.append('<li><a href="' + breadcrumbs[i].href + '">' + breadcrumbs[i].name + '</a> <span class="divider">/</span></li>');
		}
	};
}

function resetBreadcrumbs() {
	//delete all
	$('div#breadcrumb').html('');
	localStorage.removeItem('8787_breadcrumbs');
	//show default content
	$('#main-container').load('./content/home.html');
	//add default
/*	$('div#breadcrumb').html('<ul class="breadcrumb"><ul>');
	b_selector = $('div#breadcrumb ul.breadcrumb');
	b_selector.append('<li class="active">Home</li>');*/
	drawBreadcrumbs([{name: "Home", href:"home"}]);
	localStorage.setItem('8787_breadcrumbs', JSON.stringify([{name: "Home", href:"home"}]));

}

function createNavigation(callback) {
	//returns HTML of nav, append it to <ul class="nav">
	var navigationJson;

	$.getJSON('./resources/json-data/navigation.json', function(response){
		navigationJson = response;
	}).complete(function () {
		//when json is loaded continue with building HTML
		
		var navigation = $('div.nav-collapse ul.nav');
		//delete content that is now in navigation
		navigation.html('');
		navigation.append('<a class="brand" href="#">Final assignment</a>');

		console.log(navigationJson);

		for (var i = 0; i < navigationJson.length; i++) {
			if (navigationJson[i].load_content == false) {
				createSubNav(navigation, navigationJson[i]);
			} else {
				appendLi(navigation, navigationJson[i]);
			}
		};

		if (callback && typeof(callback) === "function") {  
			console.log('callback called');
	        callback();  
    	}  
    	
	}).error(function() {
		console.log('Navigation.json is not found.');
	});

	function appendLi(to, obj) {
		var blank = "";
		var breadcrumb_name = obj.name;

		if (checkURL(obj.load_content)) blank = 'target="_blank"'; 
		if (typeof(obj.breadcrumb_name) !== 'undefined') breadcrumb_name = obj.breadcrumb_name; 

		to.append('<li><a data-breadcrumb="' + breadcrumb_name + '" href="' + obj.load_content + '" ' + blank + ' >' + obj.name + '</a></li>');
	}

	function createSubNav(to, obj) {
		to.append('<li class="dropdown" id="' + obj.name + 'menu"></li>');
		to = $(to.selector + ' li#' + obj.name + 'menu').append('<a class="dropdown-toggle" data-toggle="dropdown" href="#">' + obj.name + '<b class="caret"></b></a>')
		to.append('<ul class="dropdown-menu"></ul>');

		to = $(to.selector + ' ul.dropdown-menu');
		//console.log(obj);
		for (var i = 0; i < obj.sub_menu.length; i++) {
			if(obj.sub_menu[i].load_content == false) {
				// create submenu2
				create2ndSubNav(to, obj.sub_menu[i], i);
			} else {
				appendLi(to, obj.sub_menu[i]);
			}
		};

	}

	function create2ndSubNav(to, obj, i) {
		to.append('<li class="dropdown-submenu" id="'+ obj.name + i + '-submenu"></li>');
		to = $(to.selector + ' li#' + obj.name + i + '-submenu').append('<a tabindex="-' + i + '" href="#">' + obj.name + '</a>');
		createUl(to, obj.sub_menu);
	}

	function createUl(to, obj) {
		to.append('<ul class="dropdown-menu"></ul>');
		to = $(to.selector + ' ul.dropdown-menu');
		for (var i = 0; i < obj.length; i++) {
			if (obj[i].load_content == false) {
				//createUl(to, obj[i]);
				//ignore more than 3 levels
			} else {
				appendLi(to, obj[i]);
			}
		};
	}

	

}

function checkURL(value) {
    var urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    if (urlregex.test(value)) {
        return (true);
    }
    return (false);
}