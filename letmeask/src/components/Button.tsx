import { useState } from "react";

export function Button () {
    
    const [cont, setCont] = useState(0)
    
    function increment(){
        setCont(cont+1);
        console.log(cont);
    }
    return (
        <button onClick={increment}> {cont}</button>
    )
}

//name export 