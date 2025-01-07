import { DEPTH } from '../../../constants/depth.js';

export class PlayerEquipment {
    constructor(scene) {
        this.scene = scene;
    }

    setupEquipment(player, playerData) {
        this.updateEquipment(player, playerData);
    }

    updateEquipment(player, playerData) {
        if (!playerData?.equippedItems) return;

        Object.entries(playerData.equippedItems).forEach(([slotType, equipData]) => {
            this.updateEquipmentByType(player, slotType, equipData);
        });
    }

    updateEquipmentByType(player, slotType, equipData) {
        if (!equipData?.isEquipped || !equipData.item?.name) return;

        const currentEquip = player[slotType];
        const newEquipName = equipData.item.name;

        if (!currentEquip || currentEquip.name !== newEquipName) {
            switch (slotType) {
                case 'vehicle':
                    this.handleVehicleEquipment(player, equipData.item);
                    break;
                case 'weapon':
                    this.handleWeaponEquipment(player, equipData.item);
                    break;
                case 'armor':
                    this.handleArmorEquipment(player, equipData.item);
                    break;
                default:
                    console.warn(`slotType: ${slotType}`);
            }
        }
    }

    handleVehicleEquipment(player, item) {
        switch (item.name) {
            case 'Bike':
                player.character.setTexture('Bike');
                player.vehicle = item;
                player.animationSet = 'Bike';
                break;
            case 'Motorcycle':
                player.character.setTexture('Motorcycle');
                player.vehicle = item;
                player.animationSet = 'Motorcycle';
                break;
            case 'Car':
                player.character.setTexture('Car');
                player.vehicle = item;
                player.animationSet = 'Car';
                break;
            default:
                console.warn(`handleVehicleEquipment: ${item.name}`);
        }
    }

    handleWeaponEquipment(player, item) {
        player.weapon = item;
    }

    handleArmorEquipment(player, item) {
        player.armor = item;
    }

    removeAllEquipment(player) {
        if (player.vehicle) {
            player.character.setTexture('p1');
            player.vehicle = null;
            player.animationSet = 'default';
        }
        if (player.weapon) {
            player.weapon = null;
        }
        if (player.armor) {
            player.armor = null;
        }
    }
} 