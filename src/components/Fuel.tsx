import { useEffect, useState } from "react";

export default function Fuel() {
    const [fuel, setFuel] = useState(100);
    
 
    useEffect(() => {
        const savedFuel = localStorage.getItem('alienFuel');
        if (savedFuel) {
            setFuel(parseInt(savedFuel));
        }
    }, []); 
   
    useEffect(() => {
        localStorage.setItem('alienFuel', fuel.toString());
    }, [fuel]); 
    
  
    useEffect(() => {
        const interval = setInterval(() => {
            setFuel(prev => Math.max(0, prev - 10));
        }, 3600000); 
        
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="w-full h-6 bg-amber-500 rounded">
            <div 
                className="h-6 bg-amber-700 rounded" 
                style={{width: `${fuel}%`}}
            ></div>
        </div>
    );
}