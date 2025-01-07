self.onmessage = function(e) {
    if (e.data.type === 'calculateViewport') {
        const { camera, tileSize, buffer } = e.data;
        
        const startX = Math.floor(camera.x / tileSize) - buffer;
        const startY = Math.floor(camera.y / tileSize) - buffer;
        const endX = Math.ceil((camera.x + camera.width) / tileSize) + buffer;
        const endY = Math.ceil((camera.y + camera.height) / tileSize) + buffer;
        
        self.postMessage({
            startX,
            startY,
            endX,
            endY
        });
    }
}; 