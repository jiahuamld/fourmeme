export class ChatManager {
    constructor(scene) {
        this.scene = scene;
        this.currentPlayerIDs = new Set();
        
        this.chatWindow = document.getElementById('chat-window');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-message');
        this.sendButton = document.getElementById('send-message');
        this.recipientSelect = document.getElementById('recipient-select');
        
        this.handleSendMessage = () => this.sendMessage();
        this.handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        };
        
        this.initialize();
    }

    initialize() {
        this.sendButton.addEventListener('click', this.handleSendMessage);
        this.chatInput.addEventListener('keypress', this.handleKeyPress);
        this.recipientSelect.innerHTML = '<option value="">Everyone</option>';
    }

    setSelectedPlayer(playerID) {
        this.recipientSelect.value = playerID || '';
    }

    clearSelectedPlayer() {
        this.recipientSelect.value = '';
    }

    sendMessage() {
        const socket = this.scene.socket;
        
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket connection not established or not ready');
            return;
        }

        const content = this.chatInput.value.trim();
        if (content === '') return;

        const recipient = this.recipientSelect.value;

        const chatMessage = {
            playerID: parseInt(recipient),
            content: content,
        };

        socket.send(JSON.stringify(chatMessage));
        this.displayChatMessage({ content: content, sender: 'You', recipient: recipient });

        this.chatInput.value = '';
    }

    displayChatMessage(messageData) {
        let displayText = '';
        if (messageData.sender === 'You') {
            let recipientName = 'Everyone';
            if (messageData.recipient !== '') {
                const recipientPlayerID = parseInt(messageData.recipient);
                const recipientPlayer = this.scene.playerManager.getPlayerById(recipientPlayerID);
                recipientName = recipientPlayer ? recipientPlayer.playerData.name : 'Unknown';
         
                
                displayText = `<strong>You to ${recipientName} &lt;${messageData.recipient}&gt;:</strong> ${messageData.content}`;
            } else {
                displayText = `<strong>You to Everyone:</strong> ${messageData.content}`;
            }
        } else {
            const sender = this.scene.playerManager.getPlayerById(messageData.senderPlayerID);
            const senderName = sender ? sender.playerData.name : 'Unknown';
            displayText = `<strong>${senderName} &lt;${messageData.senderPlayerID}&gt; to You:</strong> ${messageData.content}`;
        }

        const messageElement = document.createElement('div');
        messageElement.innerHTML = displayText;
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    populateRecipientList(playersData) {
        if (!playersData) {
            return;
        }

        const newPlayerIDs = new Set(playersData.map(player => player.playerID));

        if (!this.hasPlayerListChanged(newPlayerIDs)) {
            return;
        }

        while (this.recipientSelect.options.length > 1) {
            this.recipientSelect.remove(1);
        }

        playersData.forEach(player => {
            const option = document.createElement('option');
            option.value = player.playerID;
            option.text = `${player.name || 'Unknown'} <${player.playerID}>`;
            this.recipientSelect.appendChild(option);
        });

        this.currentPlayerIDs = newPlayerIDs;
    }

    hasPlayerListChanged(newPlayerIDs) {
        if (this.currentPlayerIDs.size !== newPlayerIDs.size) {
            return true;
        }

        for (let id of newPlayerIDs) {
            if (!this.currentPlayerIDs.has(id)) {
                return true;
            }
        }

        return false;
    }

    destroy() {
        if (this.sendButton) {
            this.sendButton.removeEventListener('click', this.handleSendMessage);
        }
        if (this.chatInput) {
            this.chatInput.removeEventListener('keypress', this.handleKeyPress);
        }
        
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
        }
        
        if (this.recipientSelect) {
            this.recipientSelect.innerHTML = '';
        }
        
        this.scene = null;
        this.currentPlayerIDs.clear();
    }
} 