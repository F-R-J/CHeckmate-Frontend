const menu = document.querySelector('#mobile-menu')
const menulinks = document.querySelector('.navbar_menu')
const navLogo = document.querySelector('#navbar_logo');

// var s = ''
// for(let i = 0; i<6 ;i++){
//  s += Math.floor(Math.random()*9)
// }
////console.log(s);
// display mobile menu

const home = document.querySelector('#home-page');
const about = document.querySelector('#about-page');
const services = document.querySelector('#services-page');
const mobileMenu = () => {
  menu.classList.toggle('is-active')
  menulinks.classList.toggle('active')
}

menu.addEventListener('click', mobileMenu);
home.addEventListener('click', mobileMenu);
about.addEventListener('click', mobileMenu);
services.addEventListener('click', mobileMenu);


// Show active menu when scrolling
const highlightMenu = () => {
  const elem = document.querySelector('.highlight');
  const homeMenu = document.querySelector('#home-page');
  const aboutMenu = document.querySelector('#about-page');
  const servicesMenu = document.querySelector('#services-page');
  let scrollPos = window.scrollY;
  // //console.log(scrollPos);

  // adds 'highlight' class to my menu items
  if (window.innerWidth > 960 && scrollPos < 600) {
    homeMenu.classList.add('highlight');
    aboutMenu.classList.remove('highlight');
    servicesMenu.classList.remove('highlight');
    return;
  } else if (window.innerWidth > 960 && scrollPos < 1500) {
    servicesMenu.classList.add('highlight');
    homeMenu.classList.remove('highlight');
    aboutMenu.classList.remove('highlight');
    return;
  } else if (window.innerWidth > 960 && scrollPos < 2665) {
    aboutMenu.classList.add('highlight');
    servicesMenu.classList.remove('highlight');
    return;
  }

  if ((elem && window.innerWIdth < 960 && scrollPos < 600) || elem) {
    elem.classList.remove('highlight');
  }
};

window.addEventListener('scroll', highlightMenu);
window.addEventListener('click', highlightMenu);

//  Close mobile Menu when clicking on a menu item
const hideMobileMenu = () => {
  const menuBars = document.querySelector('.is-active');
  if (window.innerWidth <= 768 && menuBars) {
    menu.classList.toggle('is-active');
    menulinks.classList.remove('active');
  }
};

menulinks.addEventListener('click', hideMobileMenu);
navLogo.addEventListener('click', hideMobileMenu);