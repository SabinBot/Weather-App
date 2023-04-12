
const carouselWrapper = document.createElement('div');
carouselWrapper.className = 'carouselWrapper';
weatherCards.parentNode.insertBefore(carouselWrapper, weatherCards);
carouselWrapper.appendChild(weatherCards);

carouselWrapper.style.display = 'flex';
carouselWrapper.style.overflowX = 'auto'; 

const carouselWrapperHourly = document.createElement('div');
carouselWrapperHourly.className = 'carouselWrapper';
weatherCardsHourly.parentNode.insertBefore(carouselWrapperHourly, weatherCardsHourly);
carouselWrapperHourly.appendChild(weatherCardsHourly);

carouselWrapperHourly.style.display = 'flex';
carouselWrapperHourly.style.overflowX = 'auto';

const cards = document.querySelectorAll('.cards');
