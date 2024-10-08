import { useEffect, useState } from "react";

export function useAtBottom(offset = 0) {
    const [isAtBottom, setIsAtBottom] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsAtBottom(
                window.innerHeight - window.scrollY <= 
                    document.body.offsetHeight + offset,
            );
            //console.log("window.innerHeight: ", window.innerHeight);
            //console.log("window.scrollY: ", window.scrollY);
            //console.log("document.body.offsetHeight: ", document.body.offsetHeight);
            //console.log("window.innerHeight - window.scrollY: ", window.innerHeight - window.scrollY);
            //console.log("isAtBottom: ", isAtBottom);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [offset]);

    return isAtBottom;
}