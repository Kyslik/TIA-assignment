$(document).ready(function() {
	createNavigation();
});

function createNavigation() {
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


	}).error(function() {
		console.log('Navigation.json is not found.');
	})

	function appendLi(to, obj) {
		to.append('<li><a href="' + obj.load_content + '">' + obj.name + '</a></li>');
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