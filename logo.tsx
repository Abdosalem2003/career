interface LogoProps {
  className?: string;
  variant?: "blue" | "white";
  showText?: boolean;
  textSize?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ 
  className = "", 
  variant = "blue",
  showText = false,
  textSize = "md"
}: LogoProps) {
  const color = variant === "white" ? "white" : "#1E90FF";
  
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base sm:text-xl",
    lg: "text-xl sm:text-2xl",
    xl: "text-2xl sm:text-3xl"
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {/* UN Logo */}
      <svg 
        viewBox="0 0 1024 1024" 
        className="flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main Globe Circle */}
        <circle cx="512" cy="512" r="480" fill={color} />
        
        {/* World Map - Simplified continents */}
        <g fill="white" opacity="0.95">
          {/* North America */}
          <path d="M 300 250 Q 280 280 290 320 Q 300 340 320 360 Q 340 380 360 370 Q 380 360 390 340 Q 400 320 390 290 Q 380 260 360 240 Q 340 230 320 235 Q 310 240 300 250 Z" />
          
          {/* South America */}
          <path d="M 350 420 Q 340 450 345 490 Q 350 530 365 560 Q 380 590 395 600 Q 410 610 420 595 Q 430 580 425 550 Q 420 520 410 490 Q 400 460 385 440 Q 370 425 355 425 Z" />
          
          {/* Europe */}
          <path d="M 480 220 Q 470 240 475 265 Q 480 290 495 305 Q 510 320 530 315 Q 550 310 555 290 Q 560 270 550 250 Q 540 230 520 225 Q 500 220 480 220 Z" />
          
          {/* Africa */}
          <path d="M 460 340 Q 450 370 455 410 Q 460 450 475 490 Q 490 530 510 560 Q 530 590 550 595 Q 570 600 585 585 Q 600 570 595 540 Q 590 510 580 480 Q 570 450 555 420 Q 540 390 520 370 Q 500 350 480 345 Q 465 340 460 340 Z" />
          
          {/* Asia */}
          <path d="M 580 200 Q 560 220 565 250 Q 570 280 590 310 Q 610 340 640 360 Q 670 380 700 375 Q 730 370 745 350 Q 760 330 755 300 Q 750 270 730 245 Q 710 220 680 210 Q 650 200 620 205 Q 595 210 580 200 Z" />
          
          {/* Australia */}
          <path d="M 680 520 Q 670 540 675 565 Q 680 590 695 610 Q 710 630 730 635 Q 750 640 765 625 Q 780 610 775 585 Q 770 560 755 540 Q 740 520 720 515 Q 700 510 680 520 Z" />
        </g>
        
        {/* Latitude/Longitude Grid */}
        <g stroke="white" strokeWidth="8" fill="none" opacity="0.6">
          {/* Equator */}
          <line x1="100" y1="512" x2="924" y2="512" />
          
          {/* Vertical meridian */}
          <line x1="512" y1="100" x2="512" y2="924" />
          
          {/* Circles of latitude */}
          <ellipse cx="512" cy="512" rx="400" ry="200" />
          <ellipse cx="512" cy="512" rx="400" ry="350" />
          
          {/* Additional meridians */}
          <path d="M 312 100 Q 312 512 312 924" />
          <path d="M 712 100 Q 712 512 712 924" />
        </g>
        
        {/* Olive Branches */}
        <g fill={color} stroke={color} strokeWidth="12">
          {/* Left Branch */}
          <path d="M 150 850 Q 200 820 250 850" fill="none" strokeLinecap="round" />
          <path d="M 180 840 Q 200 830 220 840" fill="none" strokeLinecap="round" />
          <path d="M 160 860 Q 180 850 200 860" fill="none" strokeLinecap="round" />
          <path d="M 200 870 Q 220 860 240 870" fill="none" strokeLinecap="round" />
          
          {/* Left leaves */}
          <ellipse cx="170" cy="835" rx="18" ry="28" transform="rotate(-30 170 835)" />
          <ellipse cx="150" cy="855" rx="18" ry="28" transform="rotate(-40 150 855)" />
          <ellipse cx="190" cy="865" rx="18" ry="28" transform="rotate(-20 190 865)" />
          <ellipse cx="210" cy="835" rx="18" ry="28" transform="rotate(-35 210 835)" />
          <ellipse cx="230" cy="865" rx="18" ry="28" transform="rotate(-25 230 865)" />
          
          {/* Right Branch */}
          <path d="M 874 850 Q 824 820 774 850" fill="none" strokeLinecap="round" />
          <path d="M 844 840 Q 824 830 804 840" fill="none" strokeLinecap="round" />
          <path d="M 864 860 Q 844 850 824 860" fill="none" strokeLinecap="round" />
          <path d="M 824 870 Q 804 860 784 870" fill="none" strokeLinecap="round" />
          
          {/* Right leaves */}
          <ellipse cx="854" cy="835" rx="18" ry="28" transform="rotate(30 854 835)" />
          <ellipse cx="874" cy="855" rx="18" ry="28" transform="rotate(40 874 855)" />
          <ellipse cx="834" cy="865" rx="18" ry="28" transform="rotate(20 834 865)" />
          <ellipse cx="814" cy="835" rx="18" ry="28" transform="rotate(35 814 835)" />
          <ellipse cx="794" cy="865" rx="18" ry="28" transform="rotate(25 794 865)" />
        </g>
      </svg>
      
      {showText && (
        <div className="text-right flex-1 min-w-0">
          <div className={`${variant === "white" ? "text-white" : "text-blue-600"} font-bold leading-tight tracking-wide truncate ${textSizeClasses[textSize]}`}>
            U.N.N.T
          </div>
          <div className={`${variant === "white" ? "text-white/90" : "text-gray-500"} text-[10px] sm:text-xs font-medium truncate`}>
            أخبار الأمم المتحدة اليوم
          </div>
        </div>
      )}
    </div>
  );
}
