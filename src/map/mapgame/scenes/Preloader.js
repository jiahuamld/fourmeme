import { Scene } from "phaser";
import grass from "@/assets/grass.png";
import ground2 from "@/assets/building/ground2.png";
import ground3 from "@/assets/building/ground3.png";
import road2 from "@/assets/building/road2.png";
import road3 from "@/assets/building/road3.png";
import gray_road from "@/assets/building/gray_road.png";
import coconutImg from "@/assets/plant/Coconut1.png";
import p1Sprite from "@/assets/sprite/p1.png";
import p2Sprite from "@/assets/sprite/p2.png";
import bikeSprite from "@/assets/equippedItems/vehicle/Bike.png";


import businessEat from "@/assets/building/business_eat.png";
import businessLearn from "@/assets/building/business_learn.png";
import businessRealEstate from "@/assets/building/business_realEstate.png";
import businessRelax from "@/assets/building/business_relax.png";
import businessRest from "@/assets/building/business_rest.png";
import businessWork from "@/assets/building/business_work.png";
import governmentEat from "@/assets/building/government_eat.png";
import governmentLearn from "@/assets/building/government_learn.png";
import governmentRealEstate from "@/assets/building/government_realEstate.png";
import governmentRelax from "@/assets/building/government_relax.png";
import governmentRest from "@/assets/building/government_rest.png";
import governmentWork from "@/assets/building/government_work.png";
import houseRest from "@/assets/building/house_rest.png";
import market from "@/assets/building/market.png";
import house_base from "@/assets/building/house_base.png";


// import cursor from "@/assets/cursor.png";
import cursorHover from "@/assets/cursorHover.png";
// import loadingbg from "@/assets/loadingbg.png";




export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }
  preload() {


    this.load.image("cursorHover", cursorHover.src);
    // this.load.image("cursor", cursor.src);
    this.load.image("grass", grass.src);
    this.load.image("ground2", ground2.src);
    this.load.image("ground3", ground3.src);
    this.load.image("road2", road2.src);
    this.load.image("road3", road3.src);
    this.load.image("gray_road", gray_road.src);
    this.load.image("Coconut", coconutImg.src);
    this.load.image("house_base", house_base.src);
    

    this.load.spritesheet("p1", p1Sprite.src, {
      frameWidth: 32,
      frameHeight: 48,
      margin: 0,
      spacing: 0
    });

    this.load.spritesheet("p2", p2Sprite.src, {
      frameWidth: 32,
      frameHeight: 48,
      margin: 0,
      spacing: 0
    });

    this.load.spritesheet("Bike", bikeSprite.src, {
      frameWidth: 32,
      frameHeight: 48,
      margin: 0,
      spacing: 0
    });


    this.loadBuildingImages();
  }

  create() {
    this.scene.start("LoadingScene");
  }

  loadBuildingImages() {
    const buildingImages = {
      business_eat: businessEat.src,
      business_learn: businessLearn.src,
      business_realEstate: businessRealEstate.src,
      business_relax: businessRelax.src,
      business_rest: businessRest.src,
      business_work: businessWork.src,
      government_eat: governmentEat.src,
      government_learn: governmentLearn.src,
      government_realEstate: governmentRealEstate.src,
      government_relax: governmentRelax.src,
      government_rest: governmentRest.src,
      government_work: governmentWork.src,
      house_rest: houseRest.src,
      market: market.src,
    };

    Object.entries(buildingImages).forEach(([key, value]) => {
      this.load.image(key, value);
    });
  }
}
