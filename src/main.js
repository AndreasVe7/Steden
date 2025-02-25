import './style.css'
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const API_KEY = 'badaa819b71869f5e964f8570bfb2683';

const swiper = new Swiper('.swiper', {
    modules: [Navigation, Pagination, Autoplay, EffectFade],
    effect: 'fade',
    loop: true,
    
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    
    on: {
        init: function() {
            // Haal het weer op voor alle steden na initialisatie van Swiper
            fetchWeatherForAllCities();
        }
    }
});

async function fetchWeatherForAllCities() {
    const slides = document.querySelectorAll('.swiper-slide');
    
    slides.forEach(async (slide) => {
        const lat = slide.dataset.lat;
        const lon = slide.dataset.lon;
        const weatherInfo = slide.querySelector('.weather-info');
        
        if (lat && lon) {
            try {
                const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
                console.log(`API URL: ${apiUrl}`);
                const response = await fetch(apiUrl);                
                if (!response.ok) {
                    throw new Error('Weer data kon niet worden opgehaald');
                }
                
                const data = await response.json();
                const temp = data.main.temp;
                const weatherDescription = data.weather[0].description;
                
                // Verwijder de loader en toon de temperatuur
                weatherInfo.innerHTML = `
                    <p>${temp.toFixed(1)}°C</p>
                    <p>${weatherDescription}</p>
                `;
            } catch (error) {
                console.error('Error fetching weather:', error);
                weatherInfo.innerHTML = '<p>Weer niet beschikbaar</p>';
            }
        }
    });
}