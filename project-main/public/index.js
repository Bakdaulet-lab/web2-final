// index.js
const slider = document.getElementById('slider');
const dots = document.querySelectorAll('.dot');

// Обработчик для обновления активного класса на точках
slider.addEventListener('scroll', () => {
    const slideWidth = slider.scrollWidth / dots.length;
    const scrollLeft = slider.scrollLeft;

    const currentSlide = Math.round(scrollLeft / slideWidth);

    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
});

// Начальное состояние
dots[0].classList.add('active');
