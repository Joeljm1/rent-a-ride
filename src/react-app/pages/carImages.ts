import { useEffect, useState } from "react";

export default function CarImages() {
// Image carousel for "Skip the hassle" section
  const carImages = [
    {
      url: "https://images.unsplash.com/photo-1547406722-a2c81c1c9e7e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
      alt: "A person driving a car"
    },
    {
      url: "https://images.unsplash.com/photo-1468818438311-4bab781ab9b8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2071",
      alt: "A woman enjoying a car ride"
    },
    {
      url: "https://images.unsplash.com/photo-1620332119367-2152e52a0ab0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740",
      alt: "A Person holding steering wheels"
    },
    {
      url: "https://images.unsplash.com/photo-1690533681596-876066fe5f50?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
      alt: "Multiple people standing near their cars"
    },
    {
      url: "https://images.unsplash.com/photo-1588343002549-5b8c3490922d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
      alt: "A person riding a open roof car"
    }
  ];

  // Image carousel for "Find your perfect ride" section
  const carDetailsImages = [
    {
      url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
      alt: "A SUV standing along road"
    },
    {
      url: "https://images.unsplash.com/photo-1601929862217-f1bf94503333?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987",
      alt: "A porsche car"
    },
    {
      url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1064",
      alt: "A BMW Car"
    },
    {
      url: "https://images.unsplash.com/photo-1493238792000-8113da705763?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
      alt: "A Lamborghini Car with backlight"
    },
    {
      url: "https://images.unsplash.com/photo-1506610654-064fbba4780c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
      alt: "A Ford Mustang Car"
    }
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentDetailImageIndex, setCurrentDetailImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carImages.length
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [carImages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDetailImageIndex((prevIndex) => 
        (prevIndex + 1) % carDetailsImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [carDetailsImages.length]);

    return { carImages, currentImageIndex, carDetailsImages, currentDetailImageIndex, setCurrentImageIndex, setCurrentDetailImageIndex };
}