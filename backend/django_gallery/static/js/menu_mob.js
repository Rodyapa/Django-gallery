( function( window, document ) {
'use strict';

const minDx = 50;
const wheelDeltaYMultiplier = 35;
const menuRight = 16;
const pressDL = 3;
const maxClickTime = 500;

let menuElement;
let overlayElement;
let posElement;
let shiftX;
let shiftY;
let startX;
let menuOn = false;
let initialLeft;
let menuDyMax;
let topY = 0;
let bottomVP = 0;
let resizeTimeout;
let tapStartElement;
let tapStartCoords;

document.addEventListener("DOMContentLoaded",function(){
	let iconElement = document.querySelector('.menu-menu');
	overlayElement = document.querySelector('.menu-overlay');
	posElement = document.querySelector('.menu-positioner');
	menuElement = document.querySelector('.menu-wrapper');

	window.addEventListener('resize', resizeThrottler, false);

	menuElement.ondragstart = () => false;
	menuElement.onpointerdown = swipeStart;
	menuElement.onwheel = mouseMove;
	menuElement.onclick = () => false;

	iconElement.onclick = showMenu;
	overlayElement.onpointerdown = showMenu;
	document.addEventListener( 'openMenu', openMenu.bind(this) );
	document.addEventListener( 'closeMenu', closeMenu.bind(this) );
	resizeHandler();
});

function resizeThrottler() {
	if ( !resizeTimeout ) {
		resizeTimeout = setTimeout(function() {
			resizeTimeout = null;
			resizeHandler();
		}, 400);
	}
};

function resizeHandler(event) {
	menuElement.classList.remove('menu-wrapper_animate');
	if ( menuOn ) { showMenu( false ); };

	menuElement.style.width = '100vw';
	let menuElementPos = menuElement.getBoundingClientRect();
	initialLeft = menuRight - menuElementPos.width;

	menuElement.style.top = '0';
	topY = 0;
	bottomVP = posElement.getBoundingClientRect().bottom;
	menuElement.style.left = initialLeft + 'px';
	menuDyMax = bottomVP - menuElement.getBoundingClientRect().bottom;
	if ( menuDyMax > 0 ) { menuDyMax = 0; };
	menuElement.classList.add('menu-wrapper_animate');
}

function resizeMenu() {
	menuElement.classList.remove('menu-wrapper_animate');
	let menuElementPos = menuElement.getBoundingClientRect();
	menuElement.style.bottom = (menuElementPos.bottom - topY) + 'px';
	menuDyMax = bottomVP - (menuElementPos.bottom - topY);
	if ( menuDyMax > 0 ) { menuDyMax = 0; };
	menuElement.classList.add('menu-wrapper_animate');
}

function mouseMove(event) {
	if ( ! menuOn ) { return; }
	event.preventDefault();
	topY -= event.deltaY > 0 ?  wheelDeltaYMultiplier : -wheelDeltaYMultiplier;
	menuElement.style.top =  getMenuTop(topY) + 'px';
};

function swipeStart(event) {
	tapStartElement = event.target;
	tapStartCoords = { x : event.pageX , y : event.pageY };

	shiftX = event.pageX - menuElement.getBoundingClientRect().left;
	shiftY = event.pageY - menuElement.getBoundingClientRect().top ;
	startX = event.pageX;
	menuElement.setPointerCapture(event.pointerId);
	menuElement.onpointermove = move;
	menuElement.onpointerup = drop;
};

function getMenuTop(y) {
	topY = y > 0 ? 0 : ( y < menuDyMax ? menuDyMax :  y);
	return topY;
};

function move(event) {
	let lastX = event.pageX - shiftX;
	topY = event.pageY - shiftY;
	if ( menuOn && Math.abs(lastX) < Math.abs(topY) ) {
		menuElement.style.top =  getMenuTop(topY) + 'px';
	} else {
		menuElement.style.left = ( lastX > 0 ? 0 : lastX ) + 'px';
	}
};

function isTap(a,b) {
	//alert(`dx: ${Math.round(Math.abs( a.x - b.x )*100)/100}, dy: ${Math.round(Math.abs( a.y - b.y )*100)/100}`);
	return ( Math.abs( a.y - b.y ) <= pressDL && Math.abs( a.x - b.x ) <= pressDL );
};

function drop(event) {
	const tapFinishCoords = { x : event.pageX , y : event.pageY };
	if ( isTap(tapStartCoords, tapFinishCoords) ) {
		if ( tapStartElement.nodeName == 'A' ) {
			if ( event.pointerType != 'mouse'  || ( event.pointerType == 'mouse' && event.which == 1 ) ) {
				window.location.assign(tapStartElement.href);
			};
		};
		if ( event.pointerType == 'mouse' && event.which == 1 && tapStartElement.dataset.act ) {
			//window.engV3.jsm_dismissal50.jsControlObj.controlsClickHandler({target: tapStartElement});
			//Для отработки нажатия на псевдопункты меню
		}
		if ( tapStartElement.nodeName == 'SPAN' ) {
			levelOpener({target: tapStartElement});
			}
	};
	menuElement.onpointermove = null;
	menuElement.onpointerup = null;
	if ( Math.abs(event.pageX - startX) > minDx) {
		showMenu( event.pageX - startX > 0 );
	} else {
		showMenu( menuOn );
	}
};

function openMenu(event) {
	showMenu(true);
};

function closeMenu(event) {
	showMenu(false);
};

function showMenu(state) {
	menuOn = typeof state != 'boolean' ? ! menuOn : state;
	menuElement.style.left = menuOn ? '0' : initialLeft + 'px';
	overlayElement.style.display = menuOn ? 'block' : 'none';
};

function levelOpener(e) {
	if (e.target.nextElementSibling.style.display == "") {
		e.target.nextElementSibling.style.display = "block";
	} else {
		e.target.nextElementSibling.style.display = "";
	}
	resizeMenu();
};


}) ( window, document );
