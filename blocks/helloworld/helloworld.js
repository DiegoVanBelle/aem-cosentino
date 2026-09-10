import React from "react";
export default async function decorate(block) {
    console.log(block);
    
    
block.append(renderToReadableStrem(<>
        <span>Hello world</span>
    </>))
}