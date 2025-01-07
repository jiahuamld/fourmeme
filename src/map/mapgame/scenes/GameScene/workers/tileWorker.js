self.onmessage = function(e) {
    if (e.data.type === 'calculateViewport') {
        const { camera, tileSize, buffer } = e.data;
        
        const camLeft = camera.x - buffer * tileSize;
        const camRight = camera.x + camera.width + buffer * tileSize;
        const camTop = -camera.y - camera.height - buffer * tileSize;
        const camBottom = -camera.y + buffer * tileSize;

        const startX = Math.floor(camLeft / tileSize);
        const endX = Math.floor(camRight / tileSize);
        const startY = Math.floor(camTop / tileSize);
        const endY = Math.floor(camBottom / tileSize);

        self.postMessage({ startX, endX, startY, endY });
    }
}; 