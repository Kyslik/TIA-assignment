$(document).ready(function() {
	createNavigation(showBreadcrumbs);
	lastSeen();
	accessCount();

	$('div.nav-collapse ul.nav, div#breadcrumb ').on("click", "li a", function(e) {
		//e.preventDefault();
		var clicked = $(this);
		var href = clicked.attr('href');

		//console.log(clicked);
		if (href != "#") {
			if (!checkURL(href)) {
				e.preventDefault();
				if (!clicked.parent().hasClass('active')) {
					var b_name = clicked.text();
					if (typeof(clicked.data('breadcrumb')) !== "undefined") b_name = clicked.data('breadcrumb');
					addBreadcrumb(b_name, href);
				}
			}
		}
		
	});

	$('#main-container').on("click", "#note-btn-reset",function(e) {
		//console.log($('form#not-form'));
		$('input').val('');
		constructNoteTable();
	});

	$('#main-container').on("click", "#note-btn-save",function(e) {
		//console.log($('form#not-form'));
		var name = $('input#note-name').val();
		var text = $('input#note-text').val();

		var d = (new Date()+'').split(' ');
		d = [d[3], d[1], d[2], d[4]].join(' ');
		if (text.length === 0 || text === "") text = 'n/a';

		if (name.length === 0 || name === "") {

			$('input#note-name').focus();

		} else {
			addNote(d, name, text);
			$('input').val('');
		}
		
	});

	$('#main-container').on("click", ".note-btn-check", function (e) {
		index = $(this).data('id');
		var notes = JSON.parse(localStorage.getItem('8787_notes')) || [];
		if (JSON.stringify(notes) != JSON.stringify([])) { 
			notes.splice(index, 1);
			localStorage.setItem('8787_notes', JSON.stringify(notes));
			$(this).closest('tr').fadeOut('slow');
			constructNoteTable();
		}
		
	});

});

function addNote(datetime, name, text) {
	var notes = JSON.parse(localStorage.getItem('8787_notes')) || [];
	var animate = true;
	if (JSON.stringify(notes) == JSON.stringify([])) animate = false;

	notes.push({datetime: datetime, name: name, text: text});
	localStorage.setItem('8787_notes', JSON.stringify(notes));
	constructNoteTable(addNote2Table({i: notes.length-1, datetime: datetime, name: name, text: text}, animate));
}

function showNotes() {
	//this function is called only once pre note load
	notes = constructNoteTable();
	for (var i = 0; i < notes.length; i++) {
		note = notes[i];
		note.i = i;
		addNote2Table(note, false);
	};
	
}

function addNote2Table(note, animation) {
	var tbody = $('table#notes-table > tbody');
	if (animation == true) {
		var table = $('table#notes-table');
		
		table.stop().animate({opacity: 0}, 300, function() {
			tbody.prepend('<tr><td>' + note.datetime + '</td><td>' + note.name + '</td><td>' + note.text + '</td><td><button class="btn btn-mini note-btn-check" data-id="' + note.i + '" type="button"><i class="icon-ok"> </i></button></td></tr>');
			table.stop().animate({opacity: 1}, 300);
		});
	} else {
		tbody.prepend('<tr><td>' + note.datetime + '</td><td>' + note.name + '</td><td>' + note.text + '</td><td><button class="btn btn-mini note-btn-check" data-id="' + note.i + '" type="button"><i class="icon-ok"> </i></button></td></tr>');

	}

}

function constructNoteTable(callback) {
	var notes = JSON.parse(localStorage.getItem('8787_notes')) || [];

	var table = $('table#notes-table');
	var zero_notes = $('div#zero-notes');

	if (JSON.stringify(notes) == JSON.stringify([])) {
		//show zero_notes
		if ( table.css('display') != 'none' ) {
			table.fadeOut('800', function() {
				zero_notes.fadeIn('400');
			});						
		}

		if (zero_notes.css('opacity') == 0 ) {
			zero_notes.stop().animate({opacity: 1}, 300);
		}
		
	} else {
		//show table
		if ( zero_notes.css('display') != 'none') {
			zero_notes.fadeOut('400', function() {
				table.fadeIn('400');
			});	
		}

		if (table.css('opacity') == 0 ) {
			table.stop().animate({opacity: 1}, 300);
		}
	}

	if (callback && typeof(callback) === "function") {  
		//console.log('callback called');
		callback();  
	} 
	return notes;
}

function lastSeen() {
	var d = (new Date()+'').split(' ');
	d = [d[3], d[1], d[2], d[4]].join(' ');
	var last_seen = localStorage.getItem('8787_lastSeen');
	if (!last_seen) { 
		$('#last-seen').html('now');
	} else {
		$('#last-seen').html(last_seen);
	}
	localStorage.setItem('8787_lastSeen', d);
}

function accessCount() {
	var count = localStorage.getItem('8787_accessCount');
	if (!count) { 
		$('#access-count').html('1');
		count = 1;
	} else {
		$('#access-count').html(count);
	}
	count++;
	localStorage.setItem('8787_accessCount', count);
}

function activateNav(href) {
	console.log($('a[href="' + href + '"]:first').parent());
	$('div.nav-collapse ul.nav li').removeClass('active');
	$('a[href=' + href + ']').parent().addClass("active");
}

function showBreadcrumbs(callback) {

	var breadcrumbs = JSON.parse(localStorage.getItem('8787_breadcrumbs')) || [];

	if (breadcrumbs.length <= 1) {
		resetBreadcrumbs();
		return 0;
	} else {
		drawBreadcrumbs(breadcrumbs);
	}

	if (callback && typeof(callback) === "function") {  
		//console.log('callback called');
		callback();  
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
	$('div#breadcrumb').html('').append('<ul class="breadcrumb"></ul>');
	b_selector = $('div#breadcrumb > ul');

	for (var i = 0; i < breadcrumbs.length; i++) {
		if (i == breadcrumbs.length - 1) {
			//last iteeration
			activateNav(breadcrumbs[i].href);
			b_selector.append('<li class="active">' + breadcrumbs[i].name + '</li>');
			//$('#main-container').load('./content/' +  breadcrumbs[i].href + '.html');
			loadContent(breadcrumbs[i].href);

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

	drawBreadcrumbs([{name: "Home", href:"home"}]);
	localStorage.setItem('8787_breadcrumbs', JSON.stringify([{name: "Home", href:"home"}]));
}

function loadContent(href) {
	$('#main-container').stop().animate({
		opacity: 0,
	}, 300, function() {
		$('#main-container').load('./content/' +  href + '.html');
		$(this).stop().animate({
			opacity: 1,
		}, 600);
	});
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