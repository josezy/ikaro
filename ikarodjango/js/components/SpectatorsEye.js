import React, { useEffect, useState } from "react"

const PATH = window.location.pathname.replace("flight", "spectators")

export const SpectatorsEye = () => {
    const [total, setTotal] = useState(0)

    useEffect(() => {
        const inte = setInterval(() => {
            fetch(PATH)
                .then(res => res.json())
                .then(res => setTotal(res.total))
        }, 5000)
        return () => clearInterval(inte)
    }, [])

    return <div className="viewers-container">
        <div className="viewers-inner">👁 {total}</div>
    </div>
}
