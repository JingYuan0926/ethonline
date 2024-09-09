import ThreeScene from "../components/ThreeScene";
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Header from '../components/Header';

export default function Home() {
  const router = useRouter();
  const [buttonText, setButtonText] = useState('Swap');
  const [isVisible, setIsVisible] = useState(true);

  const actions = ['Swap', 'Stake', 'Bridge', 'Send', 'Buy', 'Sell'];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % actions.length;
        setButtonText(actions[currentIndex]);
        setIsVisible(true);
      }, 500); // Half of the interval for smooth transition
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = (e) => {
    e.preventDefault(); // Prevent the default anchor behavior
    router.push('/chat'); // Navigate to the /chat page
  };

  return (
    <main className="flex flex-col min-h-screen p-8 bg-black">
      <Header />

      <div className="relative flex justify-between items-center w-full flex-wrap lg:flex-nowrap">
        <div className="hero-text text-white w-lg z-10 mb-8 lg:mb-0">
          <h1 className="text-6xl font-bold ml-20 mb-2">
            All in One AI Crypto Assistant
          </h1>
          <p className="text-2xl ml-20 mb-6">
            Empowering the transition from Web2 to Web3
          </p>
          <a
            href="#"
            onClick={handleClick}
            className="cta-button text-white px-8 py-4 rounded-full inline-flex items-center text-xl bg-gradient-to-r from-[#2cbb87] via-[#08b4cb] to-[#DC1FFF] ml-20"
            style={{ minWidth: '240px', justifyContent: 'center' }}
          >
            <span className="relative" style={{ width: '60px', display: 'inline-block', textAlign: 'right', fontWeight: 'bold' }}>
              <span className={`absolute inset-0 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                {buttonText}
              </span>
              <span className="invisible">{actions.reduce((a, b) => a.length > b.length ? a : b)}</span>
            </span>
            <span className="ml-2" style={{ fontWeight: 'bold' }}>Now</span>
            <span className="ml-2" style={{ fontWeight: 'bold' }}>&#8594;</span>
          </a>
        </div>
        <div className="hero-image w-full lg:w-1/2 h-auto flex justify-center lg:justify-end">
          <div className="w-[665px] h-[625px]">
            <ThreeScene />
          </div>
        </div>
      </div>
    </main>
  );
}