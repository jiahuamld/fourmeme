export class PlayerStateManager {
    constructor() {
        this.states = new Map();
    }

    updateStates(playersData) {
        this.cleanupStates(playersData);
        
        playersData.forEach(playerData => {
            this.updatePlayerState(playerData);
        });
    }

    updatePlayerState(playerData) {
        const currentState = this.states.get(playerData.playerID);
        const newState = this.createState(playerData);

        if (!currentState) {
            this.states.set(playerData.playerID, newState);
            return;
        }

        if (this.hasStateChanged(currentState, newState)) {
            this.handleStateChange(playerData.playerID, currentState, newState);
        }

        this.states.set(playerData.playerID, newState);
    }

    createState(playerData) {
        return {
            position: {
                x: playerData.locationX,
                y: playerData.locationY
            },
            state: playerData.state?.state || 'idle',
            buildingID: playerData.buildingID,
            balance: playerData.balance,
            equipment: this.getEquipmentState(playerData.equippedItems)
        };
    }

    getEquipmentState(equippedItems) {
        if (!equippedItems) return {};

        return Object.entries(equippedItems).reduce((acc, [slot, itemData]) => {
            acc[slot] = {
                id: itemData.item.id,
                name: itemData.item.name
            };
            return acc;
        }, {});
    }

    hasStateChanged(oldState, newState) {
        if (oldState.position.x !== newState.position.x || 
            oldState.position.y !== newState.position.y) {
            return true;
        }

        if (oldState.state !== newState.state) {
            return true;
        }

        if (oldState.buildingID !== newState.buildingID) {
            return true;
        }

        if (oldState.balance !== newState.balance) {
            return true;
        }

        return this.hasEquipmentChanged(oldState.equipment, newState.equipment);
    }

    hasEquipmentChanged(oldEquipment, newEquipment) {
        const oldSlots = Object.keys(oldEquipment);
        const newSlots = Object.keys(newEquipment);

        if (oldSlots.length !== newSlots.length) {
            return true;
        }

        return oldSlots.some(slot => {
            const oldItem = oldEquipment[slot];
            const newItem = newEquipment[slot];
            return !newItem || oldItem.id !== newItem.id;
        });
    }

    handleStateChange(playerID, oldState, newState) {
    }

    cleanupStates(playersData) {
        const currentIds = new Set(playersData.map(p => p.playerID));
        for (const [id] of this.states) {
            if (!currentIds.has(id)) {
                this.states.delete(id);
            }
        }
    }

    getState(playerID) {
        return this.states.get(playerID);
    }

    getAllStates() {
        return Array.from(this.states.entries()).map(([id, state]) => ({
            playerID: id,
            ...state
        }));
    }
} 