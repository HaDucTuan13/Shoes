import banner1 from '../assets/banner1.jpg';
import banner2 from '../assets/banner2.jpg';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function Banner() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        fade: true,
        cssEase: 'linear',
        arrows: false,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 1,
                    dots: false,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false,
                },
            },
        ],
    };

    const bannerData = [
        {
            id: 1,
            image: banner1,
            alt: 'Banner 1 - Giày thể thao',
        },
        {
            id: 2,
            image: banner2,
            alt: 'Banner 2 - Giày cao cấp',
        },
    ];

    return (
        <div className="banner-container relative w-full">
            <Slider {...settings}>
                {bannerData.map((banner) => (
                    <div key={banner.id} className="relative">
                        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
                            <img src={banner.image} alt={banner.alt} className="w-full h-full object-cover" />
                            {/* Overlay gradient */}
                            <div className=""></div>

                            {/* Content overlay */}
                            <div className="absolute inset-0 flex items-center">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                                    <div className="max-w-lg text-white">
                                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in-up">
                                            {banner.title}
                                        </h1>
                                        <h2 className="text-lg md:text-xl lg:text-2xl mb-4 text-yellow-400 animate-fade-in-up animation-delay-200">
                                            {banner.subtitle}
                                        </h2>
                                        <p className="text-sm md:text-base lg:text-lg mb-6 animate-fade-in-up animation-delay-400">
                                            {banner.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>

            <style jsx>{`
                .banner-container .slick-dots {
                    bottom: 20px;
                }

                .banner-container .slick-dots li button:before {
                    color: white;
                    font-size: 12px;
                    opacity: 0.5;
                }

                .banner-container .slick-dots li.slick-active button:before {
                    color: white;
                    opacity: 1;
                }

                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                    opacity: 0;
                    transform: translateY(30px);
                }

                .animation-delay-200 {
                    animation-delay: 0.2s;
                }

                .animation-delay-400 {
                    animation-delay: 0.4s;
                }

                .animation-delay-600 {
                    animation-delay: 0.6s;
                }

                @keyframes fadeInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

export default Banner;
